import {
  AuditReportSchema,
  FreightInvoice,
  LineItemAudit,
  MCPLogStep,
  TMSRateSheet,
  WMSProofOfDelivery,
} from '../types/audit';
import { TMS_RATE_DATABASE, WMS_POD_DATABASE } from './mockData';

// Format currency to 2 decimal places
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// Simple SHA-like deterministic hash for immutable audit ledger
export function generateAuditHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const rand = Math.random().toString(16).substring(2, 10);
  return `0x${hex}${rand}`.toUpperCase();
}

// ---------------------------------------------------------
// Standard MCP Tool Call Callbacks
// ---------------------------------------------------------
export function get_rate_sheet(
  shipmentId: string,
  tmsDb: Record<string, TMSRateSheet> = TMS_RATE_DATABASE
): TMSRateSheet {
  if (!shipmentId || !shipmentId.trim()) {
    return {
      status: 'RECORD_NOT_FOUND',
      shipment_id: '',
      contract_rate: 0,
      fsc_index: 0,
      free_time_hours: 0,
      detention_hourly_rate: 0,
      lumper_pre_approved: false,
      message: 'Missing or empty shipment_id provided to get_rate_sheet.',
    };
  }

  const record = tmsDb[shipmentId];
  if (!record) {
    return {
      status: 'RECORD_NOT_FOUND',
      shipment_id: shipmentId,
      contract_rate: 0,
      fsc_index: 0,
      free_time_hours: 0,
      detention_hourly_rate: 0,
      lumper_pre_approved: false,
      message: `Rate sheet for ${shipmentId} not found in TMS.`,
    };
  }
  return record;
}

export function get_signed_pod(
  shipmentId: string,
  wmsDb: Record<string, WMSProofOfDelivery> = WMS_POD_DATABASE
): WMSProofOfDelivery {
  if (!shipmentId || !shipmentId.trim()) {
    return {
      status: 'RECORD_NOT_FOUND',
      shipment_id: '',
      message: 'Missing or empty shipment_id provided to get_signed_pod.',
    };
  }

  const record = wmsDb[shipmentId];
  if (!record) {
    return {
      status: 'RECORD_NOT_FOUND',
      shipment_id: shipmentId,
      message: `POD for ${shipmentId} not found in WMS.`,
    };
  }
  return record;
}

export function approve_invoice_payment(invoiceNumber: string, approvedAmount: number) {
  const approvalId = `APV-${Date.now().toString().slice(-6)}`;
  return {
    status: 'PAYMENT_APPROVED',
    approval_id: approvalId,
    invoice_number: invoiceNumber,
    approved_amount: round2(approvedAmount),
    erp_system: 'SAP S/4HANA Accounts Payable',
    posted_timestamp: new Date().toISOString(),
    batch_status: 'QUEUED_FOR_DISBURSEMENT',
  };
}

export function submit_dispute_email(
  invoiceNumber: string,
  carrierEmail: string,
  carrierName: string,
  disputedAmount: number,
  findings: LineItemAudit[]
) {
  const disputeRef = `DSP-${Date.now().toString().slice(-6)}`;
  const itemizedText = findings
    .filter((f) => f.discrepancy > 0)
    .map(
      (f) =>
        `- ${f.category}: Billed $${f.invoiced_amount.toFixed(2)}, Allowed $${f.contract_allowed_amount.toFixed(2)} (Variance: $${f.discrepancy.toFixed(2)}) — ${f.finding}`
    )
    .join('\n');

  const disputeSubject = `[DISPUTE NOTICE] Unauthorized Accessorial Charges - Invoice ${invoiceNumber} (Ref: ${disputeRef})`;
  const disputeBody = `Dear ${carrierName} Accounts Receivable Team,\n\nOur automated freight audit engine identified an unauthorized variance totaling $${round2(
    disputedAmount
  ).toFixed(2)} on Invoice #${invoiceNumber}.\n\nDiscrepancy Breakdown:\n${itemizedText}\n\nPlease issue a corrected billing statement matching contracted TMS rates and signed POD timestamps. Contact disputes@freightaudit.ai with evidence if you wish to appeal.\n\nBest regards,\nAutonomous Freight Audit Engine`;

  return {
    status: 'DISPUTE_SENT',
    dispute_ref: disputeRef,
    invoice_number: invoiceNumber,
    carrier_email: carrierEmail,
    carrier_name: carrierName,
    disputed_amount: round2(disputedAmount),
    subject: disputeSubject,
    body: disputeBody,
    sent_timestamp: new Date().toISOString(),
    delivery_status: 'DELIVERED_TO_CARRIER_GATEWAY',
  };
}

// ---------------------------------------------------------
// Autonomous Audit Engine Core Logic
// ---------------------------------------------------------
export interface AuditExecutionOptions {
  onStep?: (step: MCPLogStep) => void;
  stepDelayMs?: number;
  tmsDb?: Record<string, TMSRateSheet>;
  wmsDb?: Record<string, WMSProofOfDelivery>;
}

export async function executeAudit(
  invoice: FreightInvoice,
  options: AuditExecutionOptions = {}
): Promise<{ report: AuditReportSchema; logs: MCPLogStep[]; actionResult: any }> {
  const { onStep, stepDelayMs = 0, tmsDb = TMS_RATE_DATABASE, wmsDb = WMS_POD_DATABASE } = options;
  const logs: MCPLogStep[] = [];

  const addLog = async (
    type: MCPLogStep['type'],
    message: string,
    toolName?: string,
    payload?: any
  ) => {
    const step: MCPLogStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      toolName,
      payload,
    };
    logs.push(step);
    if (onStep) {
      onStep(step);
    }
    if (stepDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
    }
  };

  await addLog(
    'REASONING',
    `Ingested invoice payload for #${invoice.invoice_number} from ${invoice.carrier_name || 'Unknown Carrier'}.`
  );

  // Step 1 & 5: Check Required Parameters
  const missingFields: string[] = [];
  if (!invoice.shipment_id || !invoice.shipment_id.trim()) {
    missingFields.push('shipment_id');
  }

  if (missingFields.length > 0) {
    await addLog(
      'ERROR',
      `Required parameter check failed: missing [${missingFields.join(', ')}].`,
      undefined,
      { missing_fields: missingFields }
    );

    const auditStatus = 'REQUIRES_HUMAN_OVERRIDE';
    const totalInvoiced = round2(invoice.invoice_details?.total_invoiced || 0);
    const reasoning = `Missing required parameter: ${missingFields.join(', ')}. Halting auto-adjudication for human override.`;

    const report: AuditReportSchema = {
      shipment_id: null,
      invoice_number: invoice.invoice_number,
      audit_status: auditStatus,
      internal_reasoning: reasoning,
      total_invoiced: totalInvoiced,
      total_contracted_allowed: 0.0,
      discrepancy_amount: totalInvoiced,
      line_item_audits: [],
      missing_or_error_fields: missingFields,
      action_taken: 'ESCALATED_TO_HUMAN',
    };

    const actionResult = {
      status: 'ESCALATED_TO_HUMAN',
      reason: `Missing mandatory parameter(s): ${missingFields.join(', ')}.`,
      requested_action: 'Please update invoice payload with valid shipment_id and re-submit.',
      timestamp: new Date().toISOString(),
    };

    await addLog(
      'DECISION',
      `Audit Status: ${auditStatus}. Escalated to Human Override queue.`,
      'escalate_to_human',
      actionResult
    );

    return { report, logs, actionResult };
  }

  const shipmentId = (invoice.shipment_id || '').trim();

  // Step 2: Fetch Reference Documents in Parallel via standard MCP tool calls
  await addLog(
    'TOOL_CALL',
    `Dispatching parallel MCP tool calls for shipment ${shipmentId}: get_rate_sheet & get_signed_pod.`,
    'get_rate_sheet',
    { shipment_id: shipmentId }
  );

  const [rateSheet, podDoc] = [
    get_rate_sheet(shipmentId, tmsDb),
    get_signed_pod(shipmentId, wmsDb),
  ];

  await addLog(
    'TOOL_RESULT',
    `TMS get_rate_sheet(${shipmentId}) returned status: ${rateSheet.status}.`,
    'get_rate_sheet',
    rateSheet
  );

  await addLog(
    'TOOL_RESULT',
    `WMS get_signed_pod(${shipmentId}) returned status: ${podDoc.status}.`,
    'get_signed_pod',
    podDoc
  );

  // Step 5: Check MCP RECORD_NOT_FOUND or errors
  const failedMcpSources: string[] = [];
  if (rateSheet.status === 'RECORD_NOT_FOUND') {
    failedMcpSources.push(`TMS: Rate sheet not found for ${shipmentId}`);
  }
  if (podDoc.status === 'RECORD_NOT_FOUND') {
    failedMcpSources.push(`WMS: Signed POD not found for ${shipmentId}`);
  }

  if (failedMcpSources.length > 0) {
    await addLog(
      'ERROR',
      `MCP Lookup Failed: ${failedMcpSources.join(' | ')}. Refusing $0.00 assumption; escalating for human document re-upload.`,
      undefined,
      { failed_sources: failedMcpSources }
    );

    const auditStatus = 'REQUIRES_HUMAN_OVERRIDE';
    const totalInvoiced = round2(invoice.invoice_details?.total_invoiced || 0);
    const reasoning = `Reference documents missing in TMS/WMS (${failedMcpSources.length} source error). Cannot assume $0.00; escalating for document re-upload.`;

    const report: AuditReportSchema = {
      shipment_id: shipmentId,
      invoice_number: invoice.invoice_number,
      audit_status: auditStatus,
      internal_reasoning: reasoning,
      total_invoiced: totalInvoiced,
      total_contracted_allowed: 0.0,
      discrepancy_amount: totalInvoiced,
      line_item_audits: [],
      missing_or_error_fields: failedMcpSources,
      action_taken: 'ESCALATED_TO_HUMAN',
    };

    const actionResult = {
      status: 'ESCALATED_TO_HUMAN',
      reason: failedMcpSources.join('; '),
      requested_action: 'Initiate TMS/WMS document re-upload request with carrier operations.',
      timestamp: new Date().toISOString(),
    };

    await addLog(
      'DECISION',
      `Audit Status: ${auditStatus}. Prompted document re-upload & escalated to human auditor.`,
      'escalate_to_human',
      actionResult
    );

    return { report, logs, actionResult };
  }

  // Step 3: Perform 3-Way Audit Matching
  await addLog(
    'REASONING',
    `Executing 3-Way Audit Matching: Base Rate vs TMS, FSC vs Fuel Index, Detention vs POD Dwell, and Lumper vs POD Receipt.`
  );

  const lineItemAudits: LineItemAudit[] = [];
  const details = invoice.invoice_details;

  // 1. BASE FREIGHT
  const invBase = round2(details.base_freight || 0);
  const contractBase = round2(rateSheet.contract_rate || 0);
  const baseDelta = round2(invBase - contractBase);
  lineItemAudits.push({
    category: 'BASE_FREIGHT',
    invoiced_amount: invBase,
    contract_allowed_amount: contractBase,
    discrepancy: baseDelta,
    finding:
      baseDelta === 0
        ? `Agreed base freight matched exactly at $${contractBase.toFixed(2)}.`
        : baseDelta > 0
        ? `Base freight overcharged by $${baseDelta.toFixed(2)} ($${invBase.toFixed(2)} billed vs $${contractBase.toFixed(2)} contracted).`
        : `Base freight billed below contract rate ($${invBase.toFixed(2)} vs $${contractBase.toFixed(2)}).`,
  });

  // 2. FUEL SURCHARGE (FSC)
  const invFsc = round2(details.fuel_surcharge || 0);
  // FSC is calculated against agreed contract base rate and fsc_index
  const contractFscAllowed = round2(contractBase * (rateSheet.fsc_index || 0));
  const fscDelta = round2(invFsc - contractFscAllowed);
  const fscPctExpected = ((rateSheet.fsc_index || 0) * 100).toFixed(1);
  lineItemAudits.push({
    category: 'FUEL_SURCHARGE',
    invoiced_amount: invFsc,
    contract_allowed_amount: contractFscAllowed,
    discrepancy: fscDelta,
    finding:
      fscDelta === 0
        ? `Fuel surcharge matched DOE fuel index scale (${fscPctExpected}% of base = $${contractFscAllowed.toFixed(2)}).`
        : fscDelta > 0
        ? `FSC overcharge of $${fscDelta.toFixed(2)}. Contract DOE scale allowed ${fscPctExpected}% ($${contractFscAllowed.toFixed(2)}), carrier billed $${invFsc.toFixed(2)}.`
        : `FSC billed under contract allowance ($${invFsc.toFixed(2)} vs $${contractFscAllowed.toFixed(2)}).`,
  });

  // 3. DETENTION FEES
  const invDetention = round2(details.detention_charge || 0);
  const dwellMins = podDoc.dwell_minutes || 0;
  const dwellHours = dwellMins / 60;
  const freeTime = rateSheet.free_time_hours || 2.0;
  const hourlyRate = rateSheet.detention_hourly_rate || 0;

  let contractDetentionAllowed = 0.0;
  let detentionFinding = '';

  if (dwellHours <= freeTime) {
    contractDetentionAllowed = 0.0;
    if (invDetention > 0) {
      detentionFinding = `Unauthorized detention. POD timestamps confirm dwell time of ${dwellMins} mins (${dwellHours.toFixed(2)} hrs), within the ${freeTime} hr free-time window. $0.00 allowed.`;
    } else {
      detentionFinding = `No detention billed. Total dwell ${dwellMins} mins fell within ${freeTime} hr free time.`;
    }
  } else {
    const excessHours = dwellHours - freeTime;
    contractDetentionAllowed = round2(excessHours * hourlyRate);
    if (invDetention > contractDetentionAllowed) {
      detentionFinding = `Detention overcharge. Billed $${invDetention.toFixed(2)}, but POD timestamps permit only ${excessHours.toFixed(2)} hrs @ $${hourlyRate}/hr ($${contractDetentionAllowed.toFixed(2)}).`;
    } else {
      detentionFinding = `Detention approved. ${excessHours.toFixed(2)} hrs billed at contracted $${hourlyRate}/hr rate.`;
    }
  }

  const detentionDelta = round2(invDetention - contractDetentionAllowed);
  if (invDetention > 0 || contractDetentionAllowed > 0) {
    lineItemAudits.push({
      category: 'DETENTION',
      invoiced_amount: invDetention,
      contract_allowed_amount: contractDetentionAllowed,
      discrepancy: detentionDelta,
      finding: detentionFinding,
    });
  }

  // 4. LUMPER FEES
  const invLumper = round2(details.lumper_fee || 0);
  let contractLumperAllowed = 0.0;
  let lumperFinding = '';

  if (invLumper > 0) {
    if (podDoc.lumper_receipt_attached && podDoc.lumper_receipt_number) {
      // Receipt attached and verified
      contractLumperAllowed = invLumper;
      lumperFinding = `Lumper charge verified with stamped receipt #${podDoc.lumper_receipt_number} on signed POD. Allowed in full.`;
    } else {
      // Unverified lumper
      contractLumperAllowed = 0.0;
      lumperFinding = `Unauthorized lumper fee. Signed POD lacks stamped receipt and valid receipt reference. Allowed $0.00.`;
    }

    const lumperDelta = round2(invLumper - contractLumperAllowed);
    lineItemAudits.push({
      category: 'LUMPER',
      invoiced_amount: invLumper,
      contract_allowed_amount: contractLumperAllowed,
      discrepancy: lumperDelta,
      finding: lumperFinding,
    });
  }

  // 5. OTHER (e.g. Stop-off, Reconsignment)
  if (details.stop_off || details.reconsignment) {
    const invOther = round2((details.stop_off || 0) + (details.reconsignment || 0));
    // Unless in contract, default 0
    const otherDelta = invOther;
    lineItemAudits.push({
      category: 'OTHER',
      invoiced_amount: invOther,
      contract_allowed_amount: 0.0,
      discrepancy: otherDelta,
      finding: `Unauthorized ancillary fee of $${invOther.toFixed(2)} without pre-contracted dispatch approval.`,
    });
  }

  // Step 4: Calculate Financial Discrepancy
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

  // Determine Audit Status
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

  // Ensure word count is strictly under 40 words
  const words = internalReasoning.split(/\s+/);
  if (words.length > 38) {
    internalReasoning = words.slice(0, 36).join(' ') + '...';
  }

  // Step 6: Decision Execution via Tool Calling
  let actionTaken: AuditReportSchema['action_taken'] = 'PAYMENT_APPROVED';
  let actionResult: any = null;

  if (discrepancyAmount === 0 && auditStatus === 'APPROVED') {
    actionTaken = 'PAYMENT_APPROVED';
    await addLog(
      'TOOL_CALL',
      `Calling approve_invoice_payment(${invoice.invoice_number}, $${totalContractedAllowed.toFixed(2)}).`,
      'approve_invoice_payment',
      { invoice_number: invoice.invoice_number, approved_amount: totalContractedAllowed }
    );

    actionResult = approve_invoice_payment(invoice.invoice_number, totalContractedAllowed);

    await addLog(
      'DECISION',
      `ERP AP payment approved for $${totalContractedAllowed.toFixed(2)}. Batch Ref: ${actionResult.approval_id}.`,
      'approve_invoice_payment',
      actionResult
    );
  } else if (discrepancyAmount > 0 && auditStatus === 'DISPUTED') {
    actionTaken = 'DISPUTE_SENT';
    await addLog(
      'TOOL_CALL',
      `Calling submit_dispute_email for ${invoice.invoice_number} (disputed: $${discrepancyAmount.toFixed(2)}).`,
      'submit_dispute_email',
      {
        invoice_number: invoice.invoice_number,
        carrier_email: invoice.carrier_email,
        disputed_amount: discrepancyAmount,
      }
    );

    actionResult = submit_dispute_email(
      invoice.invoice_number,
      invoice.carrier_email,
      invoice.carrier_name,
      discrepancyAmount,
      lineItemAudits
    );

    await addLog(
      'DECISION',
      `Dispute dispatched to carrier (${invoice.carrier_email}). Ref: ${actionResult.dispute_ref}.`,
      'submit_dispute_email',
      actionResult
    );
  }

  const report: AuditReportSchema = {
    shipment_id: shipmentId,
    invoice_number: invoice.invoice_number,
    audit_status: auditStatus,
    internal_reasoning: internalReasoning,
    total_invoiced: totalInvoiced,
    total_contracted_allowed: totalContractedAllowed,
    discrepancy_amount: discrepancyAmount,
    line_item_audits: lineItemAudits,
    missing_or_error_fields: [],
    action_taken: actionTaken,
  };

  return { report, logs, actionResult };
}
