import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Play, 
  RotateCcw, 
  Database, 
  History, 
  Layers, 
  CheckCircle2, 
  BarChart3,
  Clock,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'audit' | 'analytics' | 'ledger' | 'database';
  setActiveTab: (tab: 'audit' | 'analytics' | 'ledger' | 'database') => void;
  onRunAudit: () => void;
  onReset: () => void;
  isRunning: boolean;
  onOpenDbModal: () => void;
  stats: {
    totalAudited: number;
    disputedTotal: number;
    approvedTotal: number;
    escalatedTotal: number;
  };
  executionSpeed: 'instant' | 'stepByStep';
  setExecutionSpeed: (speed: 'instant' | 'stepByStep') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunAudit,
  onReset,
  isRunning,
  onOpenDbModal,
  stats,
  executionSpeed,
  setExecutionSpeed,
}) => {
  return (
    <header className="border-b border-[#E6DFD3] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#3A4A28] flex items-center justify-center shadow-md shadow-[#3A4A28]/20 text-[#FAF7F2] font-serif-luxury font-bold text-xl">
            <ShieldCheck className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-luxury font-bold text-xl text-[#1F221B] tracking-tight">
                FreightAudit AI
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC] font-mono-luxury">
                MCP Protocol v2.5
              </span>
            </div>
            <p className="text-xs text-[#5A5E54] font-sans">Autonomous Freight Bill Audit & Dispute Resolution Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#F0EAE1] border border-[#DCD2C2] rounded-lg p-1 text-xs font-medium font-sans">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'audit'
                ? 'bg-[#3A4A28] text-white shadow-xs font-semibold'
                : 'text-[#5A5E54] hover:text-[#1F221B]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Audit Cockpit</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#3A4A28] text-white shadow-xs font-semibold'
                : 'text-[#5A5E54] hover:text-[#1F221B]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#3A4A28] text-white shadow-xs font-semibold'
                : 'text-[#5A5E54] hover:text-[#1F221B]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Ledger ({stats.totalAudited})</span>
          </button>

          <button
            onClick={() => onOpenDbModal()}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-[#5A5E54] hover:text-[#1F221B] hover:bg-white/60 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>TMS/WMS Data</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Speed switch */}
          <div className="hidden sm:flex items-center bg-[#F0EAE1] border border-[#DCD2C2] rounded-lg p-1 text-xs font-mono-luxury">
            <button
              onClick={() => setExecutionSpeed('stepByStep')}
              className={`px-2.5 py-1 rounded transition-colors ${
                executionSpeed === 'stepByStep'
                  ? 'bg-white text-[#283618] font-bold shadow-2xs'
                  : 'text-[#696C64] hover:text-[#1F221B]'
              }`}
              title="Visualize step-by-step MCP calls"
            >
              Step-by-Step
            </button>
            <button
              onClick={() => setExecutionSpeed('instant')}
              className={`px-2.5 py-1 rounded transition-colors ${
                executionSpeed === 'instant'
                  ? 'bg-white text-[#283618] font-bold shadow-2xs'
                  : 'text-[#696C64] hover:text-[#1F221B]'
              }`}
              title="Instant audit execution"
            >
              Instant
            </button>
          </div>

          <button
            onClick={onReset}
            disabled={isRunning}
            className="p-2 rounded-lg border border-[#DCD2C2] text-[#5A5E54] hover:text-[#1F221B] hover:bg-white transition-colors disabled:opacity-50"
            title="Reset audit"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onRunAudit}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white font-medium text-xs shadow-sm shadow-[#3A4A28]/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isRunning ? 'Auditing...' : 'Execute Audit'}</span>
          </button>
        </div>
      </div>

      {/* KPI Ticker Bar */}
      <div className="bg-[#F4EFEA] border-t border-[#E6DFD3] px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-[#5A5E54] gap-y-2 font-sans">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#3A4A28] animate-pulse"></span>
              <span className="font-semibold text-[#1F221B]">MCP Protocol Listener:</span>
              <span className="text-[#3A4A28] font-mono-luxury font-medium">READY (get_rate_sheet, get_signed_pod)</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-[#696C64]">Rule Matrix:</span>
              <span className="text-[#283618] font-mono-luxury">3-Way Match &lt; 40 Word Reasoning</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 font-mono-luxury">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#696C64]">Discrepancies Caught:</span>
              <span className="font-bold text-[#8C3A2C]">
                ${stats.disputedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[#DCD2C2]">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#696C64]">Auto-Approved:</span>
              <span className="font-bold text-[#283618]">
                {stats.totalAudited > 0 ? Math.round((stats.approvedTotal / stats.totalAudited) * 100) : 0}%
              </span>
            </div>
            <span className="text-[#DCD2C2]">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#696C64]">Escalated:</span>
              <span className="font-bold text-[#8C6D23]">{stats.escalatedTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
