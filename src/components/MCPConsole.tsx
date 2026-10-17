import React, { useState } from 'react';
import { 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { MCPLogStep } from '../types/audit';

interface MCPConsoleProps {
  logs: MCPLogStep[];
  isRunning: boolean;
}

export const MCPConsole: React.FC<MCPConsoleProps> = ({ logs, isRunning }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.type}] ${l.toolName ? `${l.toolName} - ` : ''}${l.message}${
            l.payload ? `\nPayload: ${JSON.stringify(l.payload, null, 2)}` : ''
          }`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl overflow-hidden font-mono-luxury text-xs shadow-xs">
      {/* Console Title Bar */}
      <div className="px-4 py-3 bg-[#F4EFEA] border-b border-[#E6DFD3] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C3A2C]/60 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C6D23]/60 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A4A28]/80 inline-block"></span>
          </div>
          <Cpu className="w-4 h-4 text-[#3A4A28]" />
          <span className="text-[#1F221B] font-serif-luxury font-bold text-sm tracking-wide">
            Autonomous MCP Execution Trace
          </span>
          {isRunning && (
            <span className="flex items-center space-x-1 text-[10px] text-[#283618] font-semibold px-2 py-0.5 rounded-full bg-[#EDF2E8] border border-[#D5E0CC] animate-pulse">
              <span>EXECUTING PROTOCOL</span>
            </span>
          )}
        </div>

        <button
          onClick={handleCopyLogs}
          disabled={logs.length === 0}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white border border-[#DCD2C2] text-[#5A5E54] hover:text-[#1F221B] hover:bg-[#F4EFEA] transition-colors disabled:opacity-40"
        >
          {copied ? <Check className="w-3 h-3 text-[#3A4A28]" /> : <Copy className="w-3 h-3" />}
          <span className="text-[11px]">{copied ? 'Copied' : 'Copy Trace'}</span>
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-3.5 max-h-[340px] overflow-y-auto space-y-2.5 bg-[#FAF7F2]">
        {logs.length === 0 ? (
          <div className="py-10 text-center text-[#767A6F] font-serif-luxury text-sm italic">
            Engine standby. Click "Execute Audit" to trigger parallel MCP tool resolution.
          </div>
        ) : (
          logs.map((step) => {
            const isExpanded = !!expandedSteps[step.id];
            const hasPayload = step.payload && Object.keys(step.payload).length > 0;

            let badgeColor = 'bg-[#EFE9DF] text-[#4A4E44] border-[#DCD2C2]';
            let icon = <ChevronRight className="w-3.5 h-3.5 text-[#767A6F]" />;

            if (step.type === 'TOOL_CALL') {
              badgeColor = 'bg-[#EDF2E8] text-[#283618] border-[#D5E0CC]';
              icon = <ArrowUpRight className="w-3.5 h-3.5 text-[#3A4A28]" />;
            } else if (step.type === 'TOOL_RESULT') {
              badgeColor = 'bg-[#EDF2E8] text-[#283618] border-[#D5E0CC]';
              icon = <ArrowDownLeft className="w-3.5 h-3.5 text-[#283618]" />;
            } else if (step.type === 'DECISION') {
              badgeColor = 'bg-[#FAF4E6] text-[#8C6D23] border-[#E8DAB7]';
              icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6D23]" />;
            } else if (step.type === 'ERROR') {
              badgeColor = 'bg-[#F8EAE7] text-[#8C3A2C] border-[#E8C2BB]';
              icon = <AlertCircle className="w-3.5 h-3.5 text-[#8C3A2C]" />;
            }

            return (
              <div
                key={step.id}
                className="group border border-[#E6DFD3] rounded-lg p-2.5 bg-white hover:bg-[#FBF9F5] transition-colors shadow-2xs"
              >
                <div
                  className={`flex items-start justify-between cursor-pointer`}
                  onClick={() => hasPayload && toggleStep(step.id)}
                >
                  <div className="flex items-start space-x-2.5">
                    <span className="mt-0.5">{icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${badgeColor}`}>
                          {step.type}
                        </span>
                        {step.toolName && (
                          <span className="text-[#3A4A28] font-bold">{step.toolName}()</span>
                        )}
                        <span className="text-[10px] text-[#767A6F]">
                          {new Date(step.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#1F221B] text-xs mt-1 leading-relaxed font-sans">
                        {step.message}
                      </p>
                    </div>
                  </div>

                  {hasPayload && (
                    <button className="text-[#767A6F] hover:text-[#1F221B] p-0.5">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Collapsible Payload */}
                {hasPayload && isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-[#EFE9DF]">
                    <pre className="text-[11px] p-2.5 rounded-md bg-[#F4EFEA] text-[#283618] overflow-x-auto border border-[#E6DFD3]">
                      {JSON.stringify(step.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
