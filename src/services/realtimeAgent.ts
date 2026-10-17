import { 
  FreightInvoice, 
  AuditReportSchema, 
  TMSRateSheet, 
  WMSProofOfDelivery, 
  LineItemAudit, 
  MCPLogStep 
} from '../types/audit';
import { round2, generateAuditHash, approve_invoice_payment, submit_dispute_email } from './auditEngine';
import { TMS_RATE_DATABASE, WMS_POD_DATABASE } from './mockData';

export type AgentNodeId = 
  | 'node-1-ingest'
  | 'node-2-mcp'
  | 'node-3-reconcile'
  | 'node-4-reason'
  | 'node-5-dispatch';

export type NodeStatus = 'idle' | 'running' | 'completed' | 'error' | 'paused';

export interface RealtimeNodeState {
  id: AgentNodeId;
  name: string;
  stageNumber: number;
  status: NodeStatus;
  progressPercent: number;
  durationMs: number;
  logs: string[];
  inputPayload: any;
  outputPayload: any;
  metrics: Record<string, any>;
}

export interface RealtimeAgentEvent {
  type: 
    | 'PIPELINE_START'
    | 'NODE_START'
    | 'NODE_PROGRESS'
    | 'MCP_CALL'
    | 'MCP_RESPONSE'
    | 'RULE_EVALUATED'
    | 'TOKEN_STREAM'
    | 'NODE_COMPLETE'
    | 'ACTION_DISPATCHED'
    | 'PIPELINE_COMPLETE'
    | 'PIPELINE_ERROR';
  nodeId?: AgentNodeId;
  timestamp: string;
  data?: any;
  message: string;
}

export class RealtimeFreightAgent {
  private invoice: FreightInvoice;
  private tmsDb: Record<string, TMSRateSheet>;
  private wmsDb: Record<string, WMSProofOfDelivery>;
  
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private stepResolve?: () => void;
  private stepMode: boolean = false;
  private baseDelayMs: number = 400;

  private onEventCallback?: (event: RealtimeAgentEvent) => void;
  private onNodeStateChange?: (states: Record<AgentNodeId, RealtimeNodeState>) => void;

  public nodeStates: Record<AgentNodeId, RealtimeNodeState>;

  constructor(
    invoice: FreightInvoice,
    tmsDb: Record<string, TMSRateSheet> = TMS_RATE_DATABASE,
    wmsDb: Record<string, WMSProofOfDelivery> = WMS_POD_DATABASE,
    options?: {
      onEvent?: (event: RealtimeAgentEvent) => void;
      onNodeStateChange?: (states: Record<AgentNodeId, RealtimeNodeState>) => void;
      delayMs?: number;
    }
  ) {
    this.invoice = invoice;
    this.tmsDb = tmsDb;
    this.wmsDb = wmsDb;
    this.onEventCallback = options?.onEvent;
    this.onNodeStateChange = options?.onNodeStateChange;
    this.baseDelayMs = options?.delayMs ?? 400;

    this.nodeStates = {
      'node-1-ingest': {
        id: 'node-1-ingest',
        name: 'Invoice Ingestion & Schema Extraction',
        stageNumber: 1,
        status: 'idle',
        progressPercent: 0,
        durationMs: 0,
        logs: [],
        inputPayload: null,
        outputPayload: null,
        metrics: {},
      },
      'node-2-mcp': {
        id: 'node-2-mcp',
        name: 'Parallel MCP Document Gateway',
        stageNumber: 2,
        status: 'idle',
        progressPercent: 0,
        durationMs: 0,
        logs: [],
        inputPayload: null,
        outputPayload: null,
        metrics: {},
      },
      'node-3-reconcile': {
        id: 'node-3-reconcile',
        name: '3-Way Match Verification Core',
        stageNumber: 3,
        status: 'idle',
        progressPercent: 0,
        durationMs: 0,
        logs: [],
        inputPayload: null,
        outputPayload: null,
        metrics: {},
      },
      'node-4-reason': {
        id: 'node-4-reason',
        name: 'Financial Delta & Guardrail Synthesis',
        stageNumber: 4,
        status: 'idle',
        progressPercent: 0,
        durationMs: 0,
        logs: [],
        inputPayload: null,
        outputPayload: null,
        metrics: {},
      },
      'node-5-dispatch': {
        id: 'node-5-dispatch',
        name: 'Autonomous Decision Dispatcher',
        stageNumber: 5,
        status: 'idle',
        progressPercent: 0,
        durationMs: 0,
        logs: [],
        inputPayload: null,
        outputPayload: null,
        metrics: {},
      },
    };
  }

  public setSpeed(delayMs: number) {
    this.baseDelayMs = delayMs;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = undefined;
    }
  }

  public step() {
    this.stepMode = true;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = undefined;
    }
  }

  public cancel() {
    this.isCancelled = true;
    if (this.stepResolve) {
      this.stepResolve();
    }
  }

  private async sleep(ms: number) {
    if (this.isCancelled) throw new Error('Agent execution cancelled');
    
    // If in single-step mode or paused, wait for manual resume/step trigger
    if (this.isPaused || this.stepMode) {
      await new Promise<void>((resolve) => {
        this.stepResolve = () => {
          this.stepMode = false;
          resolve();
        };
      });
      return;
    }

    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private emit(event: RealtimeAgentEvent) {
    if (this.onEventCallback) {
      this.onEventCallback(event);
    }
  }

  private updateNode(nodeId: AgentNodeId, updates: Partial<RealtimeNodeState>) {
    this.nodeStates[nodeId] = { ...this.nodeStates[nodeId], ...updates };
    if (this.onNodeStateChange) {
      this.onNodeStateChange({ ...this.nodeStates });
    }
  }

  // Execute full autonomous agentic flow
  public async execute(): Promise<{ report: AuditReportSchema; actionResult: any; logs: MCPLogStep[] }> {
    const startTime = Date.now();
    const mcpLogs: MCPLogStep[] = [];

    const recordMcp = (type: MCPLogStep['type'], message: string, toolName?: string, payload?: any) => {
      mcpLogs.push({
        id: `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        type,
        message,
        toolName,
        payload,
      });
    };

    this.emit({
      type: 'PIPELINE_START',
      timestamp: new Date().toISOString(),
      message: `Autonomous Freight Agent launched for invoice #${this.invoice.invoice_number}`,
      data: { invoice: this.invoice },
    });

    try {
      // ==========================================
      // STAGE 1: INVOICE INGESTION & DATA PARSING
      // ==========================================
      const stage1Start = Date.now();
      this.updateNode('node-1-ingest', {
        status: 'running',
        progressPercent: 20,
        inputPayload: { raw_invoice: this.invoice },
        logs: [`Ingesting EDI 210 / OCR freight payload #${this.invoice.invoice_number}...`],
      });

      this.emit({
        type: 'NODE_START',
        nodeId: 'node-1-ingest',
        timestamp: new Date().toISOString(),
        message: `Stage 1: Parsing invoice payload from ${this.invoice.carrier_name || 'Carrier'}`,
      });

      await this.sleep(this.baseDelayMs * 0.8);

      // Validate required shipment_id
      const missingFields: string[] = [];
      if (!this.invoice.shipment_id || !this.invoice.shipment_id.trim()) {
        missingFields.push('shipment_id');
      }

      const extractedItems = {
        shipment_id: this.invoice.shipment_id?.trim() || null,
        invoice_number: this.invoice.invoice_number,
        carrier: this.invoice.carrier_name,
        carrier_email: this.invoice.carrier_email,
        base_freight: this.invoice.invoice_details?.base_freight || 0,
        fuel_surcharge: this.invoice.invoice_details?.fuel_surcharge || 0,
        detention_charge: this.invoice.invoice_details?.detention_charge || 0,
        lumper_fee: this.invoice.invoice_details?.lumper_fee || 0,
        total_invoiced: this.invoice.invoice_details?.total_invoiced || 0,
      };

      this.updateNode('node-1-ingest', {
        progressPercent: 100,
        status: missingFields.length > 0 ? 'error' : 'completed',
        durationMs: Date.now() - stage1Start,
        outputPayload: extractedItems,
        metrics: {
          line_item_count: Object.keys(this.invoice.invoice_details || {}).length,
          missing_fields: missingFields,
        },
        logs: [
          `Ingestion complete. Extracted line items totaling $${extractedItems.total_invoiced.toFixed(2)}.`,
          missingFields.length > 0 ? `WARNING: Missing required fields: ${missingFields.join(', ')}` : 'Parameters valid.',
        ],
      });

      this.emit({
        type: 'NODE_COMPLETE',
        nodeId: 'node-1-ingest',
        timestamp: new Date().toISOString(),
        message: missingFields.length > 0
          ? `Stage 1 failed: missing mandatory parameter [${missingFields.join(', ')}]`
          : `Stage 1 complete: Schema extraction validated for shipment ${extractedItems.shipment_id}`,
        data: extractedItems,
      });

      // Handle Exception: Missing shipment_id
      if (missingFields.length > 0) {
        const reasoning = `Missing required parameter: ${missingFields.join(', ')}. Halting auto-adjudication for human override.`;
        const totalInv = round2(this.invoice.invoice_details?.total_invoiced || 0);
        const report: AuditReportSchema = {
          shipment_id: null,
          invoice_number: this.invoice.invoice_number,
          audit_status: 'REQUIRES_HUMAN_OVERRIDE',
          internal_reasoning: reasoning,
          total_invoiced: totalInv,
          total_contracted_allowed: 0.0,
          discrepancy_amount: totalInv,
          line_item_audits: [],
          missing_or_error_fields: missingFields,
          action_taken: 'ESCALATED_TO_HUMAN',
        };

        const actionResult = {
          status: 'ESCALATED_TO_HUMAN',
          reason: `Missing mandatory parameter(s): ${missingFields.join(', ')}.`,
          requested_action: 'Please update invoice payload with valid shipment_id.',
          timestamp: new Date().toISOString(),
        };

        this.updateNode('node-5-dispatch', {
          status: 'completed',
          outputPayload: actionResult,
          logs: ['Escalated to Human Auditor Exception Desk.'],
        });

        return { report, actionResult, logs: mcpLogs };
      }

      const shipmentId = extractedItems.shipment_id!;

      // ==========================================
      // STAGE 2: PARALLEL MCP TOOL GATEWAY
      // ==========================================
      const stage2Start = Date.now();
      this.updateNode('node-2-mcp', {
        status: 'running',
        progressPercent: 30,
        inputPayload: { shipment_id: shipmentId },
        logs: [`Dispatching parallel MCP requests to TMS and WMS for shipment ${shipmentId}...`],
      });

      this.emit({
        type: 'NODE_START',
        nodeId: 'node-2-mcp',
        timestamp: new Date().toISOString(),
        message: `Stage 2: Parallel MCP call invocation: get_rate_sheet(${shipmentId}) & get_signed_pod(${shipmentId})`,
      });

      recordMcp('TOOL_CALL', `Calling get_rate_sheet("${shipmentId}")`, 'get_rate_sheet', { shipment_id: shipmentId });
      recordMcp('TOOL_CALL', `Calling get_signed_pod("${shipmentId}")`, 'get_signed_pod', { shipment_id: shipmentId });

      await this.sleep(this.baseDelayMs * 1.0);

      // Perform real parallel fetch from databases
      const rateSheet = this.tmsDb[shipmentId] || {
        status: 'RECORD_NOT_FOUND',
        shipment_id: shipmentId,
        contract_rate: 0,
        fsc_index: 0,
        free_time_hours: 0,
        detention_hourly_rate: 0,
        lumper_pre_approved: false,
        message: `Rate sheet for ${shipmentId} not found in TMS.`,
      };

      const podDoc = this.wmsDb[shipmentId] || {
        status: 'RECORD_NOT_FOUND',
        shipment_id: shipmentId,
        message: `POD for ${shipmentId} not found in WMS.`,
      };

      recordMcp('TOOL_RESULT', `TMS responded: ${rateSheet.status}`, 'get_rate_sheet', rateSheet);
      recordMcp('TOOL_RESULT', `WMS responded: ${podDoc.status}`, 'get_signed_pod', podDoc);

      this.emit({
        type: 'MCP_RESPONSE',
        nodeId: 'node-2-mcp',
        timestamp: new Date().toISOString(),
        message: `MCP Responses: TMS=${rateSheet.status}, WMS=${podDoc.status}`,
        data: { rateSheet, podDoc },
      });

      // Check if MCP returned RECORD_NOT_FOUND
      const failedSources: string[] = [];
      if (rateSheet.status === 'RECORD_NOT_FOUND') failedSources.push('TMS Rate Sheet');
      if (podDoc.status === 'RECORD_NOT_FOUND') failedSources.push('WMS Signed POD');

      const isMcpError = failedSources.length > 0;
      this.updateNode('node-2-mcp', {
        progressPercent: 100,
        status: isMcpError ? 'error' : 'completed',
        durationMs: Date.now() - stage2Start,
        outputPayload: { rateSheet, podDoc },
        metrics: {
          tms_status: rateSheet.status,
          wms_status: podDoc.status,
          mcp_latency_ms: Date.now() - stage2Start,
        },
        logs: [
          `TMS get_rate_sheet -> ${rateSheet.status}`,
          `WMS get_signed_pod -> ${podDoc.status}`,
          isMcpError ? `ERROR: ${failedSources.join(' & ')} not found.` : 'All reference documents synchronized.',
        ],
      });

      if (isMcpError) {
        const reasoning = `Reference documents missing in TMS/WMS (${failedSources.join(', ')}). Cannot assume $0.00; escalating for document re-upload.`;
        const totalInv = round2(this.invoice.invoice_details?.total_invoiced || 0);
        const report: AuditReportSchema = {
          shipment_id: shipmentId,
          invoice_number: this.invoice.invoice_number,
          audit_status: 'REQUIRES_HUMAN_OVERRIDE',
          internal_reasoning: reasoning,
          total_invoiced: totalInv,
          total_contracted_allowed: 0.0,
          discrepancy_amount: totalInv,
          line_item_audits: [],
          missing_or_error_fields: failedSources,
          action_taken: 'ESCALATED_TO_HUMAN',
        };

        const actionResult = {
          status: 'ESCALATED_TO_HUMAN',
          reason: `Missing ground-truth documents: ${failedSources.join(', ')}.`,
          requested_action: 'Please upload signed POD and valid rate sheet.',
          timestamp: new Date().toISOString(),
        };

        this.updateNode('node-5-dispatch', {
          status: 'completed',
          outputPayload: actionResult,
          logs: ['Escalated to human review due to missing ground-truth records.'],
        });

        return { report, actionResult, logs: mcpLogs };
      }

      // ==========================================
      // STAGE 3: 3-WAY MATCH VERIFICATION CORE
      // ==========================================
      const stage3Start = Date.now();
      this.updateNode('node-3-reconcile', {
        status: 'running',
        progressPercent: 20,
        inputPayload: { invoice: this.invoice.invoice_details, rateSheet, podDoc },
        logs: ['Executing 3-Way Match Verification matrix across Base, FSC, Detention, and Lumper...'],
      });

      this.emit({
        type: 'NODE_START',
        nodeId: 'node-3-reconcile',
        timestamp: new Date().toISOString(),
        message: 'Stage 3: Running 3-Way Reconciliation Algorithms',
      });

      const lineItemAudits: LineItemAudit[] = [];
      const details = this.invoice.invoice_details;

      // 1. BASE FREIGHT
      await this.sleep(this.baseDelayMs * 0.4);
      const invBase = round2(details.base_freight || 0);
      const contractBase = round2(rateSheet.contract_rate || 0);
      const baseDelta = round2(invBase - contractBase);
      const baseAudit: LineItemAudit = {
        category: 'BASE_FREIGHT',
        invoiced_amount: invBase,
        contract_allowed_amount: contractBase,
        discrepancy: baseDelta,
        finding: baseDelta === 0
          ? `Agreed base freight matched exactly at $${contractBase.toFixed(2)}.`
          : `Base freight overcharged by $${baseDelta.toFixed(2)} ($${invBase.toFixed(2)} billed vs $${contractBase.toFixed(2)} contracted).`,
      };
      lineItemAudits.push(baseAudit);
      this.emit({
        type: 'RULE_EVALUATED',
        nodeId: 'node-3-reconcile',
        timestamp: new Date().toISOString(),
        message: `Base Freight verified: Invoiced $${invBase.toFixed(2)} vs Allowed $${contractBase.toFixed(2)} (Delta: $${baseDelta.toFixed(2)})`,
        data: baseAudit,
      });

      // 2. FUEL SURCHARGE (FSC)
      await this.sleep(this.baseDelayMs * 0.4);
      const invFsc = round2(details.fuel_surcharge || 0);
      const contractFscAllowed = round2(contractBase * (rateSheet.fsc_index || 0));
      const fscDelta = round2(invFsc - contractFscAllowed);
      const fscPctExpected = ((rateSheet.fsc_index || 0) * 100).toFixed(1);
      const fscAudit: LineItemAudit = {
        category: 'FUEL_SURCHARGE',
        invoiced_amount: invFsc,
        contract_allowed_amount: contractFscAllowed,
        discrepancy: fscDelta,
        finding: fscDelta === 0
          ? `Fuel surcharge matched DOE fuel index scale (${fscPctExpected}% of base = $${contractFscAllowed.toFixed(2)}).`
          : `FSC overcharge of $${fscDelta.toFixed(2)}. Contract DOE scale allowed ${fscPctExpected}% ($${contractFscAllowed.toFixed(2)}), carrier billed $${invFsc.toFixed(2)}.`,
      };
      lineItemAudits.push(fscAudit);
      this.emit({
        type: 'RULE_EVALUATED',
        nodeId: 'node-3-reconcile',
        timestamp: new Date().toISOString(),
        message: `Fuel Surcharge verified: Invoiced $${invFsc.toFixed(2)} vs Allowed $${contractFscAllowed.toFixed(2)} (Delta: $${fscDelta.toFixed(2)})`,
        data: fscAudit,
      });

      // 3. DETENTION FEES
      await this.sleep(this.baseDelayMs * 0.4);
      const invDetention = round2(details.detention_charge || 0);
      const dwellMins = podDoc.dwell_minutes || 0;
      const dwellHours = dwellMins / 60;
      const freeTime = rateSheet.free_time_hours || 2.0;
      const hourlyRate = rateSheet.detention_hourly_rate || 0;

      let contractDetentionAllowed = 0.0;
      let detentionFinding = '';

      if (dwellHours <= freeTime) {
        contractDetentionAllowed = 0.0;
        detentionFinding = invDetention > 0
          ? `Unauthorized detention. POD timestamps confirm dwell time of ${dwellMins} mins (${dwellHours.toFixed(2)} hrs), within the ${freeTime} hr free-time window. $0.00 allowed.`
          : `No detention billed. Total dwell ${dwellMins} mins fell within ${freeTime} hr free time.`;
      } else {
        const excessHours = dwellHours - freeTime;
        contractDetentionAllowed = round2(excessHours * hourlyRate);
        detentionFinding = invDetention > contractDetentionAllowed
          ? `Detention overcharge. Billed $${invDetention.toFixed(2)}, but POD timestamps permit only ${excessHours.toFixed(2)} hrs @ $${hourlyRate}/hr ($${contractDetentionAllowed.toFixed(2)}).`
          : `Detention approved. ${excessHours.toFixed(2)} hrs billed at contracted $${hourlyRate}/hr rate.`;
      }

      const detentionDelta = round2(invDetention - contractDetentionAllowed);
      if (invDetention > 0 || contractDetentionAllowed > 0) {
        const detentionAudit: LineItemAudit = {
          category: 'DETENTION',
          invoiced_amount: invDetention,
          contract_allowed_amount: contractDetentionAllowed,
          discrepancy: detentionDelta,
          finding: detentionFinding,
        };
        lineItemAudits.push(detentionAudit);
        this.emit({
          type: 'RULE_EVALUATED',
          nodeId: 'node-3-reconcile',
          timestamp: new Date().toISOString(),
          message: `Detention verified: Dwell ${dwellMins}m vs Free ${freeTime}h -> Allowed $${contractDetentionAllowed.toFixed(2)} vs Billed $${invDetention.toFixed(2)}`,
          data: detentionAudit,
        });
      }

      // 4. LUMPER FEES
      await this.sleep(this.baseDelayMs * 0.4);
      const invLumper = round2(details.lumper_fee || 0);
      let contractLumperAllowed = 0.0;
      let lumperFinding = '';

      if (invLumper > 0) {
        if (podDoc.lumper_receipt_attached && podDoc.lumper_receipt_number) {
          contractLumperAllowed = invLumper;
          lumperFinding = `Lumper charge verified with stamped receipt #${podDoc.lumper_receipt_number} on signed POD. Allowed in full.`;
        } else {
          contractLumperAllowed = 0.0;
          lumperFinding = `Unauthorized lumper fee. Signed POD lacks stamped receipt and valid receipt reference. Allowed $0.00.`;
        }

        const lumperDelta = round2(invLumper - contractLumperAllowed);
        const lumperAudit: LineItemAudit = {
          category: 'LUMPER',
          invoiced_amount: invLumper,
          contract_allowed_amount: contractLumperAllowed,
          discrepancy: lumperDelta,
          finding: lumperFinding,
        };
        lineItemAudits.push(lumperAudit);
        this.emit({
          type: 'RULE_EVALUATED',
          nodeId: 'node-3-reconcile',
          timestamp: new Date().toISOString(),
          message: `Lumper verified: Receipt attached=${podDoc.lumper_receipt_attached} -> Allowed $${contractLumperAllowed.toFixed(2)} vs Billed $${invLumper.toFixed(2)}`,
          data: lumperAudit,
        });
      }

      this.updateNode('node-3-reconcile', {
        progressPercent: 100,
        status: 'completed',
        durationMs: Date.now() - stage3Start,
        outputPayload: lineItemAudits,
        metrics: {
          clauses_checked: lineItemAudits.length,
          overcharges_found: lineItemAudits.filter((l) => l.discrepancy > 0).length,
        },
        logs: [
          `3-Way match finished across ${lineItemAudits.length} line items.`,
          `${lineItemAudits.filter((l) => l.discrepancy > 0).length} discrepancies detected.`,
        ],
      });

      // ==========================================
      // STAGE 4: FINANCIAL DELTA & REASONING GUARDRAIL
      // ==========================================
      const stage4Start = Date.now();
      this.updateNode('node-4-reason', {
        status: 'running',
        progressPercent: 30,
        inputPayload: { lineItemAudits },
        logs: ['Calculating total financial delta and checking strict < 40-word constraint...'],
      });

      this.emit({
        type: 'NODE_START',
        nodeId: 'node-4-reason',
        timestamp: new Date().toISOString(),
        message: 'Stage 4: Synthesizing Financial Discrepancy & Reasoning Guardrail',
      });

      await this.sleep(this.baseDelayMs * 0.6);

      const totalInvoiced = round2(
        details.total_invoiced ||
        lineItemAudits.reduce((acc, curr) => acc + curr.invoiced_amount, 0)
      );

      const totalContractedAllowed = round2(
        lineItemAudits.reduce((acc, curr) => acc + curr.contract_allowed_amount, 0)
      );

      const discrepancyAmount = round2(
        Math.max(0, totalInvoiced - totalContractedAllowed)
      );

      let auditStatus: AuditReportSchema['audit_status'] = 'APPROVED';
      let internalReasoning = '';

      if (discrepancyAmount > 0) {
        auditStatus = 'DISPUTED';
        const overchargeCategories = lineItemAudits
          .filter((i) => i.discrepancy > 0)
          .map((i) => i.category.toLowerCase().replace('_', ' '))
          .join(', ');
        internalReasoning = `Audit failed with $${discrepancyAmount.toFixed(2)} in unauthorized charges across ${overchargeCategories}. Carrier billed beyond contract and verified POD documents.`;
      } else {
        auditStatus = 'APPROVED';
        internalReasoning = `All invoice line items matched contracted TMS rate sheet and verified signed POD timestamps and receipts. Discrepancy is $0.00.`;
      }

      // Strictly enforce word count under 40 words
      const words = internalReasoning.split(/\s+/);
      if (words.length > 38) {
        internalReasoning = words.slice(0, 36).join(' ') + '...';
      }
      const actualWordCount = internalReasoning.split(/\s+/).length;

      this.updateNode('node-4-reason', {
        progressPercent: 100,
        status: 'completed',
        durationMs: Date.now() - stage4Start,
        outputPayload: { totalInvoiced, totalContractedAllowed, discrepancyAmount, internalReasoning, auditStatus },
        metrics: {
          discrepancy: discrepancyAmount,
          word_count: actualWordCount,
          word_count_pass: actualWordCount <= 40,
        },
        logs: [
          `Financial Discrepancy: $${discrepancyAmount.toFixed(2)} ($${totalInvoiced.toFixed(2)} billed - $${totalContractedAllowed.toFixed(2)} allowed).`,
          `Reasoning word count: ${actualWordCount}/40 words [PASS].`,
        ],
      });

      // ==========================================
      // STAGE 5: AUTONOMOUS ACTION EXECUTION
      // ==========================================
      const stage5Start = Date.now();
      this.updateNode('node-5-dispatch', {
        status: 'running',
        progressPercent: 40,
        inputPayload: { auditStatus, discrepancyAmount },
        logs: [`Formulating decision tool call based on audit status: ${auditStatus}...`],
      });

      this.emit({
        type: 'NODE_START',
        nodeId: 'node-5-dispatch',
        timestamp: new Date().toISOString(),
        message: `Stage 5: Autonomous Decision Execution (${auditStatus})`,
      });

      await this.sleep(this.baseDelayMs * 0.8);

      let actionTaken: AuditReportSchema['action_taken'] = 'PAYMENT_APPROVED';
      let actionResult: any = null;

      if (discrepancyAmount === 0 && auditStatus === 'APPROVED') {
        actionTaken = 'PAYMENT_APPROVED';
        actionResult = approve_invoice_payment(this.invoice.invoice_number, totalContractedAllowed);

        recordMcp('TOOL_CALL', `Calling approve_invoice_payment("${this.invoice.invoice_number}", $${totalContractedAllowed.toFixed(2)})`, 'approve_invoice_payment', {
          invoice_number: this.invoice.invoice_number,
          approved_amount: totalContractedAllowed,
        });
        recordMcp('DECISION', `Payment approved. ERP Ref: ${actionResult.approval_id}`, 'approve_invoice_payment', actionResult);

        this.emit({
          type: 'ACTION_DISPATCHED',
          nodeId: 'node-5-dispatch',
          timestamp: new Date().toISOString(),
          message: `Approved $${totalContractedAllowed.toFixed(2)} into SAP AP batch ${actionResult.approval_id}`,
          data: actionResult,
        });
      } else if (discrepancyAmount > 0 && auditStatus === 'DISPUTED') {
        actionTaken = 'DISPUTE_SENT';
        actionResult = submit_dispute_email(
          this.invoice.invoice_number,
          this.invoice.carrier_email,
          this.invoice.carrier_name,
          discrepancyAmount,
          lineItemAudits
        );

        recordMcp('TOOL_CALL', `Calling submit_dispute_email("${this.invoice.invoice_number}", "${this.invoice.carrier_email}", $${discrepancyAmount.toFixed(2)})`, 'submit_dispute_email', {
          invoice_number: this.invoice.invoice_number,
          carrier_email: this.invoice.carrier_email,
          disputed_amount: discrepancyAmount,
        });
        recordMcp('DECISION', `Dispute dispatched to carrier. Ref: ${actionResult.dispute_ref}`, 'submit_dispute_email', actionResult);

        this.emit({
          type: 'ACTION_DISPATCHED',
          nodeId: 'node-5-dispatch',
          timestamp: new Date().toISOString(),
          message: `Disputed -$${discrepancyAmount.toFixed(2)} sent to ${this.invoice.carrier_email} (Ref: ${actionResult.dispute_ref})`,
          data: actionResult,
        });
      }

      this.updateNode('node-5-dispatch', {
        progressPercent: 100,
        status: 'completed',
        durationMs: Date.now() - stage5Start,
        outputPayload: actionResult,
        metrics: {
          action: actionTaken,
          reference: actionResult.approval_id || actionResult.dispute_ref,
        },
        logs: [
          `Action completed: ${actionTaken}.`,
          `Reference ID: ${actionResult.approval_id || actionResult.dispute_ref}.`,
        ],
      });

      const report: AuditReportSchema = {
        shipment_id: shipmentId,
        invoice_number: this.invoice.invoice_number,
        audit_status: auditStatus,
        internal_reasoning: internalReasoning,
        total_invoiced: totalInvoiced,
        total_contracted_allowed: totalContractedAllowed,
        discrepancy_amount: discrepancyAmount,
        line_item_audits: lineItemAudits,
        missing_or_error_fields: [],
        action_taken: actionTaken,
      };

      this.emit({
        type: 'PIPELINE_COMPLETE',
        timestamp: new Date().toISOString(),
        message: `Agentic audit protocol finished in ${Date.now() - startTime}ms with status ${auditStatus}`,
        data: { report, actionResult },
      });

      return { report, actionResult, logs: mcpLogs };
    } catch (err: any) {
      this.emit({
        type: 'PIPELINE_ERROR',
        timestamp: new Date().toISOString(),
        message: `Agentic execution error: ${err.message}`,
      });
      throw err;
    }
  }
}
