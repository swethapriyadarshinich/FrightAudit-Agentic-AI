import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowRight, 
  Database, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause,
  RotateCcw,
  GitBranch,
  Mail,
  CreditCard,
  UserCheck,
  ChevronRight,
  X,
  Code,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import { AuditReportSchema, FreightInvoice } from '../types/audit';
import { AgentNodeId, RealtimeNodeState } from '../services/realtimeAgent';

interface AgenticFlowSkeletonProps {
  invoice: FreightInvoice;
  report: AuditReportSchema | null;
  isRunning: boolean;
  nodeStates: Record<AgentNodeId, RealtimeNodeState>;
  onRunAudit: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
  isPaused: boolean;
  speedMs: number;
  setSpeedMs: (speed: number) => void;
}

export const AgenticFlowSkeleton: React.FC<AgenticFlowSkeletonProps> = ({
  invoice,
  report,
  isRunning,
  nodeStates,
  onRunAudit,
  onPause,
  onResume,
  onStep,
  onReset,
  isPaused,
  speedMs,
  setSpeedMs,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<AgentNodeId | null>(null);

  const selectedNode = selectedNodeId ? nodeStates[selectedNodeId] : null;

  return (
    <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-5 shadow-xs overflow-hidden relative">
      {/* Simulation Header & Live Controls */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-[#E6DFD3] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-[#3A4A28] animate-pulse' : 'bg-[#767A6F]'}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3A4A28] font-mono-luxury">
              Realtime Agentic DAG Engine
            </span>
            {isRunning && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC] font-mono-luxury animate-pulse">
                PROCESSING IN REALTIME
              </span>
            )}
            {isPaused && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF4E6] text-[#8C6D23] border border-[#E8DAB7] font-mono-luxury">
                PAUSED
              </span>
            )}
          </div>
          <h3 className="text-xl font-serif-luxury font-bold text-[#1F221B] mt-0.5">
            Autonomous Freight Bill Audit Agent Flow
          </h3>
          <p className="text-xs text-[#5A5E54]">
            Live event-driven pipeline processing parallel MCP retrievals, 3-way reconciliation rules, and automated dispute dispatches.
          </p>
        </div>

        {/* Interactive Execution Controls */}
        <div className="flex flex-wrap items-center gap-2 font-sans">
          {/* Speed Selector */}
          <div className="flex items-center bg-[#F0EAE1] border border-[#DCD2C2] rounded-lg p-0.5 text-xs font-mono-luxury">
            <button
              onClick={() => setSpeedMs(700)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 700 ? 'bg-white text-[#283618] font-bold shadow-2xs' : 'text-[#696C64] hover:text-[#1F221B]'
              }`}
              title="0.5x Slow Inspection"
            >
              0.5x
            </button>
            <button
              onClick={() => setSpeedMs(400)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 400 ? 'bg-white text-[#283618] font-bold shadow-2xs' : 'text-[#696C64] hover:text-[#1F221B]'
              }`}
              title="1x Realtime"
            >
              1x
            </button>
            <button
              onClick={() => setSpeedMs(150)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 150 ? 'bg-white text-[#283618] font-bold shadow-2xs' : 'text-[#696C64] hover:text-[#1F221B]'
              }`}
              title="2x Fast"
            >
              2x
            </button>
            <button
              onClick={() => setSpeedMs(0)}
              className={`px-2 py-1 rounded transition-colors ${
                speedMs === 0 ? 'bg-white text-[#283618] font-bold shadow-2xs' : 'text-[#696C64] hover:text-[#1F221B]'
              }`}
              title="Instant"
            >
              Max
            </button>
          </div>

          {/* Pause / Resume */}
          {isRunning ? (
            isPaused ? (
              <button
                onClick={onResume}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#FAF4E6] hover:bg-[#F2E7CD] text-[#8C6D23] border border-[#E8DAB7] text-xs font-medium transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )
          ) : (
            <button
              onClick={onRunAudit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Agentic Flow</span>
            </button>
          )}

          {/* Single Step button */}
          <button
            onClick={onStep}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#DCD2C2] bg-white text-[#4A4E44] hover:text-[#1F221B] text-xs font-medium transition-colors"
            title="Execute Next Node Step"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            disabled={isRunning && !isPaused}
            className="p-1.5 rounded-lg border border-[#DCD2C2] text-[#696C64] hover:text-[#1F221B] bg-white transition-colors disabled:opacity-40"
            title="Reset Agent Pipeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5-Node Agentic Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {(Object.keys(nodeStates) as AgentNodeId[]).map((nodeId, idx) => {
          const node = nodeStates[nodeId];
          const isDone = node.status === 'completed';
          const isRunningNode = node.status === 'running';
          const isError = node.status === 'error';
          const isSelected = selectedNodeId === nodeId;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(nodeId)}
              className={`rounded-lg p-3.5 border transition-all duration-300 relative flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? 'ring-2 ring-[#3A4A28] ring-offset-2 ring-offset-[#FAF7F2]'
                  : ''
              } ${
                isDone
                  ? 'bg-white border-[#3A4A28] shadow-xs'
                  : isRunningNode
                  ? 'bg-white border-[#8A9A5B] pulse-glow-olive'
                  : isError
                  ? 'bg-[#F8EAE7] border-[#8C3A2C]'
                  : 'bg-[#F4EFEA]/80 border-[#E6DFD3] hover:bg-white'
              }`}
            >
              {/* Shimmer skeleton bar when actively running */}
              {isRunningNode && (
                <div className="luxury-shimmer absolute inset-0 rounded-lg pointer-events-none opacity-40" />
              )}

              <div>
                {/* Node Top Meta */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EFE9DF]">
                  <span className="text-[10px] font-mono-luxury font-bold text-[#767A6F]">
                    STAGE 0{node.stageNumber}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono-luxury ${
                      isDone
                        ? 'bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC]'
                        : isRunningNode
                        ? 'bg-[#FAF4E6] text-[#8C6D23] border border-[#E8DAB7] animate-pulse'
                        : isError
                        ? 'bg-[#F8EAE7] text-[#8C3A2C] border border-[#E8C2BB]'
                        : 'bg-[#EFE9DF] text-[#767A6F]'
                    }`}
                  >
                    {node.status.toUpperCase()}
                  </span>
                </div>

                {/* Node Title & Subtitle */}
                <h4 className="text-sm font-serif-luxury font-bold text-[#1F221B] group-hover:text-[#283618] transition-colors">
                  {node.name}
                </h4>

                {/* Live Realtime Node Specific Indicators */}
                <div className="mt-2 space-y-1 font-mono-luxury text-[11px]">
                  {node.id === 'node-1-ingest' && (
                    <div className="text-[#5A5E54]">
                      <span>Billed: </span>
                      <span className="font-bold text-[#1F221B]">
                        ${invoice.invoice_details?.total_invoiced?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  )}

                  {node.id === 'node-2-mcp' && (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[#5A5E54]">
                        <span>TMS:</span>
                        <span className="font-bold text-[#283618]">{node.metrics?.tms_status || 'IDLE'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#5A5E54]">
                        <span>WMS:</span>
                        <span className="font-bold text-[#283618]">{node.metrics?.wms_status || 'IDLE'}</span>
                      </div>
                    </div>
                  )}

                  {node.id === 'node-3-reconcile' && (
                    <div className="text-[#5A5E54]">
                      {isDone ? (
                        <span className="text-[#8C3A2C] font-bold">
                          {node.metrics?.overcharges_found || 0} Variances Detected
                        </span>
                      ) : (
                        <span>4 Clauses Configured</span>
                      )}
                    </div>
                  )}

                  {node.id === 'node-4-reason' && (
                    <div className="text-[#5A5E54]">
                      <span>Discrepancy: </span>
                      <span className={`font-bold ${Number(node.metrics?.discrepancy) > 0 ? 'text-[#8C3A2C]' : 'text-[#283618]'}`}>
                        ${Number(node.metrics?.discrepancy || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {node.id === 'node-5-dispatch' && (
                    <div className="text-[#5A5E54]">
                      <span className="text-[10px] uppercase font-bold text-[#283618]">
                        {node.metrics?.action || 'STANDBY'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Node Bottom Status / Latency Preview */}
              <div className="mt-3 pt-2.5 border-t border-[#EFE9DF] flex items-center justify-between text-[10px] font-mono-luxury">
                <span className="text-[#767A6F]">
                  {node.durationMs > 0 ? `${node.durationMs}ms` : 'Ready'}
                </span>
                <span className="text-[#3A4A28] font-bold flex items-center space-x-1 group-hover:underline">
                  <span>Inspect</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Active Protocol Ticker */}
      <div className="mt-4 p-3 rounded-lg bg-white border border-[#E6DFD3] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-[#EDF2E8] text-[#283618]">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[#1F221B] block font-mono-luxury text-xs">
              Live Agent Execution State: {invoice.shipment_id || 'UNKNOWN_SHIPMENT'}
            </span>
            <span className="text-[11px] text-[#5A5E54] font-sans">
              {isRunning && !isPaused && 'Autonomous agent actively executing MCP tool loop and rules...'}
              {isPaused && 'Execution paused by user. Click "Step" to advance or "Resume" to continue.'}
              {!isRunning && report && `Completed. Final resolution: ${report.action_taken} with variance of $${report.discrepancy_amount.toFixed(2)}.`}
              {!isRunning && !report && 'Agent ready. Click "Run Agentic Flow" to begin.'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono-luxury text-[11px]">
          <span className="text-[#767A6F]">Click any node card to inspect internal agent state</span>
        </div>
      </div>

      {/* Node Inspector Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#EDF2E8] text-[#283618]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono-luxury text-[#767A6F] font-bold">
                      STAGE 0{selectedNode.stageNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#283618] border border-[#D5E0CC] font-mono-luxury">
                      {selectedNode.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">
                    {selectedNode.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg text-[#767A6F] hover:text-[#1F221B] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs font-sans">
              {/* Node Execution Logs */}
              <div className="bg-white rounded-lg p-3.5 border border-[#E6DFD3]">
                <span className="text-[10px] uppercase font-bold text-[#767A6F] tracking-wider block mb-2 font-mono-luxury">
                  Realtime Agent Log Entries
                </span>
                {selectedNode.logs.length === 0 ? (
                  <p className="text-[#767A6F] italic">No logs generated for this stage yet.</p>
                ) : (
                  <ul className="space-y-1.5 font-mono-luxury text-xs text-[#1F221B]">
                    {selectedNode.logs.map((log, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-[#283618] shrink-0 mt-0.5" />
                        <span>{log}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Node Metrics */}
              {Object.keys(selectedNode.metrics).length > 0 && (
                <div className="bg-white rounded-lg p-3.5 border border-[#E6DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#767A6F] tracking-wider block mb-2 font-mono-luxury">
                    Node Metrics & Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono-luxury text-xs">
                    {Object.entries(selectedNode.metrics).map(([key, val]) => (
                      <div key={key} className="p-2 rounded bg-[#FAF7F2] border border-[#EFE9DF]">
                        <span className="text-[#767A6F] text-[10px] block">{key}:</span>
                        <span className="font-bold text-[#1F221B]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Node Input / Output Payloads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-[#E6DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#767A6F] tracking-wider block mb-1 font-mono-luxury">
                    Node Input Ingestion
                  </span>
                  <pre className="p-2.5 rounded bg-[#FAF7F2] text-[#283618] font-mono-luxury text-[11px] max-h-48 overflow-y-auto border border-[#EFE9DF]">
                    {JSON.stringify(selectedNode.inputPayload || {}, null, 2)}
                  </pre>
                </div>

                <div className="bg-white rounded-lg p-3 border border-[#E6DFD3]">
                  <span className="text-[10px] uppercase font-bold text-[#767A6F] tracking-wider block mb-1 font-mono-luxury">
                    Node Output Artifact
                  </span>
                  <pre className="p-2.5 rounded bg-[#FAF7F2] text-[#283618] font-mono-luxury text-[11px] max-h-48 overflow-y-auto border border-[#EFE9DF]">
                    {JSON.stringify(selectedNode.outputPayload || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E6DFD3] bg-[#F4EFEA] flex justify-end">
              <button
                onClick={() => setSelectedNodeId(null)}
                className="px-4 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-medium transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
