import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  FastForward,
  Check,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
  BarChart3
} from 'lucide-react';
import { 
  AuditLogEntry, 
  AuditReportSchema, 
  FreightInvoice, 
  MCPLogStep, 
  TMSRateSheet, 
  WMSProofOfDelivery 
} from './types/audit';
import { 
  PRESET_SCENARIOS, 
  TMS_RATE_DATABASE, 
  WMS_POD_DATABASE 
} from './services/mockData';
import { generateAuditHash } from './services/auditEngine';
import { 
  RealtimeFreightAgent, 
  AgentNodeId, 
  RealtimeNodeState 
} from './services/realtimeAgent';
import { Header } from './components/Header';
import { InvoiceEditor } from './components/InvoiceEditor';
import { DocumentInspector } from './components/DocumentInspector';
import { MCPConsole } from './components/MCPConsole';
import { AuditResultView } from './components/AuditResultView';
import { AuditLedger } from './components/AuditLedger';
import { AnalyticsView } from './components/AnalyticsView';
import { AgenticFlowSkeleton } from './components/AgenticFlowSkeleton';
import { DisputeEmailModal } from './components/DisputeEmailModal';
import { PaymentVoucherModal } from './components/PaymentVoucherModal';
import { HumanEscalateModal } from './components/HumanEscalateModal';
import { DatabaseModal } from './components/DatabaseModal';

export default function App() {
  // Navigation & View States ('audit' | 'analytics' | 'ledger' | 'database')
  const [activeTab, setActiveTab] = useState<'audit' | 'analytics' | 'ledger' | 'database'>('audit');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-1-disputed');
  const [invoice, setInvoice] = useState<FreightInvoice>(PRESET_SCENARIOS[0].invoice);

  // Reference Databases
  const [tmsDb, setTmsDb] = useState<Record<string, TMSRateSheet>>(TMS_RATE_DATABASE);
  const [wmsDb, setWmsDb] = useState<Record<string, WMSProofOfDelivery>>(WMS_POD_DATABASE);

  // Execution States
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [executionSpeed, setExecutionSpeed] = useState<'instant' | 'stepByStep'>('stepByStep');
  const [speedMs, setSpeedMs] = useState<number>(400);

  const [logs, setLogs] = useState<MCPLogStep[]>([]);
  const [report, setReport] = useState<AuditReportSchema | null>(null);
  const [actionResult, setActionResult] = useState<any>(null);

  // Realtime Agent Reference
  const activeAgentRef = useRef<RealtimeFreightAgent | null>(null);

  // Node States for real-time visualization
  const [nodeStates, setNodeStates] = useState<Record<AgentNodeId, RealtimeNodeState>>({
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
  });

  // Immutable Audit History Ledger
  const [ledgerEntries, setLedgerEntries] = useState<AuditLogEntry[]>([]);

  // Modals
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Running batch state
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Compute stats
  const stats = {
    totalAudited: ledgerEntries.length,
    disputedTotal: ledgerEntries.reduce((acc, curr) => acc + (curr.discrepancy_amount || 0), 0),
    approvedTotal: ledgerEntries.filter((e) => e.audit_status === 'APPROVED').length,
    escalatedTotal: ledgerEntries.filter((e) => e.audit_status === 'REQUIRES_HUMAN_OVERRIDE').length,
  };

  // Run Realtime Agentic Flow
  const handleRunRealtimeAudit = async (customInvoice?: FreightInvoice) => {
    const targetInvoice = customInvoice || invoice;

    // Cancel existing agent if running
    if (activeAgentRef.current) {
      activeAgentRef.current.cancel();
    }

    setIsRunning(true);
    setIsPaused(false);
    setLogs([]);
    setReport(null);
    setActionResult(null);

    const agent = new RealtimeFreightAgent(targetInvoice, tmsDb, wmsDb, {
      delayMs: executionSpeed === 'instant' ? 0 : speedMs,
      onEvent: (event) => {
        // Map agent event into console logs
        let logType: MCPLogStep['type'] = 'REASONING';
        let toolName: string | undefined = undefined;

        if (event.type === 'MCP_CALL') {
          logType = 'TOOL_CALL';
          toolName = event.message.includes('get_rate_sheet') ? 'get_rate_sheet' : 'get_signed_pod';
        } else if (event.type === 'MCP_RESPONSE') {
          logType = 'TOOL_RESULT';
        } else if (event.type === 'RULE_EVALUATED') {
          logType = 'REASONING';
        } else if (event.type === 'ACTION_DISPATCHED') {
          logType = 'DECISION';
          toolName = event.message.includes('Disputed') ? 'submit_dispute_email' : 'approve_invoice_payment';
        } else if (event.type === 'PIPELINE_ERROR') {
          logType = 'ERROR';
        }

        setLogs((prev) => [
          ...prev,
          {
            id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: event.timestamp,
            type: logType,
            message: event.message,
            toolName,
            payload: event.data,
          },
        ]);
      },
      onNodeStateChange: (updatedStates) => {
        setNodeStates({ ...updatedStates });
      },
    });

    activeAgentRef.current = agent;

    try {
      const result = await agent.execute();
      setReport(result.report);
      setActionResult(result.actionResult);

      // Create immutable ledger record
      const ledgerEntry: AuditLogEntry = {
        id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
        invoice_number: result.report.invoice_number,
        shipment_id: result.report.shipment_id,
        carrier_name: targetInvoice.carrier_name || 'Unknown Carrier',
        carrier_email: targetInvoice.carrier_email || '',
        audit_status: result.report.audit_status,
        total_invoiced: result.report.total_invoiced,
        total_contracted_allowed: result.report.total_contracted_allowed,
        discrepancy_amount: result.report.discrepancy_amount,
        action_taken: result.report.action_taken,
        action_result: result.actionResult,
        internal_reasoning: result.report.internal_reasoning,
        immutable_hash: generateAuditHash(
          `${result.report.invoice_number}-${result.report.shipment_id}-${result.report.discrepancy_amount}-${Date.now()}`
        ),
        report: result.report,
      };

      setLedgerEntries((prev) => [ledgerEntry, ...prev]);
    } catch (err: any) {
      if (err.message !== 'Agent execution cancelled') {
        console.error('Agent execution error:', err);
      }
    } finally {
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (activeAgentRef.current) {
      activeAgentRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (activeAgentRef.current) {
      activeAgentRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleStep = () => {
    if (activeAgentRef.current) {
      activeAgentRef.current.step();
    } else {
      handleRunRealtimeAudit();
    }
  };

  // Run initial scenario 1 on mount
  useEffect(() => {
    handleRunRealtimeAudit(PRESET_SCENARIOS[0].invoice);
  }, []);

  // Sync speed changes with active agent
  const handleSetSpeedMs = (speed: number) => {
    setSpeedMs(speed);
    if (activeAgentRef.current) {
      activeAgentRef.current.setSpeed(speed);
    }
  };

  // Handle Preset selection
  const handleSelectScenario = (scenarioId: string) => {
    const found = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (found) {
      setSelectedScenarioId(scenarioId);
      setInvoice(found.invoice);
      handleRunRealtimeAudit(found.invoice);
    }
  };

  // Batch run all scenarios
  const handleRunAllBatch = async () => {
    setIsBatchRunning(true);
    for (const sc of PRESET_SCENARIOS) {
      setSelectedScenarioId(sc.id);
      setInvoice(sc.invoice);
      await handleRunRealtimeAudit(sc.invoice);
      await new Promise((r) => setTimeout(r, 150));
    }
    setIsBatchRunning(false);
  };

  const handleReset = () => {
    if (activeAgentRef.current) {
      activeAgentRef.current.cancel();
      activeAgentRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setLogs([]);
    setReport(null);
    setActionResult(null);
  };

  const handleResolveException = (updatedShipmentId: string) => {
    const updatedInvoice = { ...invoice, shipment_id: updatedShipmentId };
    setInvoice(updatedInvoice);
    handleRunRealtimeAudit(updatedInvoice);
  };

  const handleSelectLedgerEntry = (entry: AuditLogEntry) => {
    setReport(entry.report);
    setActionResult(entry.action_result);
    const match = PRESET_SCENARIOS.find((s) => s.invoice.invoice_number === entry.invoice_number);
    if (match) {
      setInvoice(match.invoice);
      setSelectedScenarioId(match.id);
    }
    setActiveTab('audit');
  };

  // Active documents
  const activeTms = invoice.shipment_id ? tmsDb[invoice.shipment_id] : undefined;
  const activeWms = invoice.shipment_id ? wmsDb[invoice.shipment_id] : undefined;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1F221B] flex flex-col font-sans selection:bg-[#3A4A28] selection:text-[#FAF7F2]">
      {/* Top Navigation & KPI Ticker */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunAudit={() => handleRunRealtimeAudit()}
        onReset={handleReset}
        isRunning={isRunning}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        stats={stats}
        executionSpeed={executionSpeed}
        setExecutionSpeed={setExecutionSpeed}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Executive Callout */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="h-9 w-9 rounded-lg bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-serif-luxury font-bold text-[#1F221B] tracking-tight">
                Autonomous 3-Way Freight Matching Engine
              </h1>
              <p className="text-xs text-[#5A5E54]">
                Auditing base freight, DOE fuel index matrix, warehouse dwell detention, and stamped lumper receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-sans">
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F4EFEA] text-[#283618] border border-[#DCD2C2] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#3A4A28]" />
              <span>Carrier Analytics</span>
            </button>

            <button
              onClick={handleRunAllBatch}
              disabled={isBatchRunning || isRunning}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{isBatchRunning ? 'Batch Auditing All...' : 'Run All 6 Scenarios'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Audit Cockpit */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Realtime Agentic Flow Interactive Controller & Visualizer */}
            <AgenticFlowSkeleton
              invoice={invoice}
              report={report}
              isRunning={isRunning}
              nodeStates={nodeStates}
              onRunAudit={() => handleRunRealtimeAudit()}
              onPause={handlePause}
              onResume={handleResume}
              onStep={handleStep}
              onReset={handleReset}
              isPaused={isPaused}
              speedMs={speedMs}
              setSpeedMs={handleSetSpeedMs}
            />

            {/* Top Workspace: Left (Invoice Payload & Presets) vs Right (Live MCP Protocol Console) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <InvoiceEditor
                  invoice={invoice}
                  onChangeInvoice={(inv) => setInvoice(inv)}
                  onSelectScenario={handleSelectScenario}
                  selectedScenarioId={selectedScenarioId}
                />
              </div>

              <div className="lg:col-span-6">
                <MCPConsole logs={logs} isRunning={isRunning} />
              </div>
            </div>

            {/* Middle Workspace: 3-Way Document Match Inspector */}
            <DocumentInspector
              invoice={invoice}
              tmsRate={activeTms}
              wmsPod={activeWms}
              isAudited={!!report}
            />

            {/* Bottom Workspace: Audit Reconciliation & Strict JSON Output */}
            {report && (
              <AuditResultView
                report={report}
                actionResult={actionResult}
                onOpenDisputeModal={() => setIsDisputeModalOpen(true)}
                onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                onOpenEscalateModal={() => setIsEscalateModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Analytics & Trends View (Recharts) */}
        {activeTab === 'analytics' && (
          <AnalyticsView ledgerEntries={ledgerEntries} />
        )}

        {/* Tab 3: Immutable Audit Ledger History */}
        {activeTab === 'ledger' && (
          <AuditLedger
            entries={ledgerEntries}
            onSelectEntry={handleSelectLedgerEntry}
          />
        )}
      </main>

      {/* Action Modals */}
      {report && (
        <>
          <DisputeEmailModal
            isOpen={isDisputeModalOpen}
            onClose={() => setIsDisputeModalOpen(false)}
            report={report}
            actionResult={actionResult}
            carrierEmail={invoice.carrier_email || 'billing@carrier.com'}
            carrierName={invoice.carrier_name || 'Carrier'}
          />

          <PaymentVoucherModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            report={report}
            actionResult={actionResult}
            carrierName={invoice.carrier_name || 'Carrier'}
          />

          <HumanEscalateModal
            isOpen={isEscalateModalOpen}
            onClose={() => setIsEscalateModalOpen(false)}
            report={report}
            actionResult={actionResult}
            onResolveException={handleResolveException}
          />
        </>
      )}

      {/* TMS / WMS Reference Database Manager Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        tmsDb={tmsDb}
        wmsDb={wmsDb}
        onUpdateTms={(id, data) => setTmsDb((prev) => ({ ...prev, [id]: data }))}
        onUpdateWms={(id, data) => setWmsDb((prev) => ({ ...prev, [id]: data }))}
      />
    </div>
  );
}
