import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Mail, 
  CreditCard, 
  UserCheck, 
  Code, 
  Copy, 
  Check, 
  Download, 
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { AuditReportSchema } from '../types/audit';

interface AuditResultViewProps {
  report: AuditReportSchema;
  actionResult: any;
  onOpenDisputeModal: () => void;
  onOpenPaymentModal: () => void;
  onOpenEscalateModal: () => void;
}

export const AuditResultView: React.FC<AuditResultViewProps> = ({
  report,
  actionResult,
  onOpenDisputeModal,
  onOpenPaymentModal,
  onOpenEscalateModal,
}) => {
  const [showJson, setShowJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const wordCount = report.internal_reasoning
    ? report.internal_reasoning.trim().split(/\s+/).length
    : 0;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_${report.invoice_number}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isApproved = report.audit_status === 'APPROVED';
  const isDisputed = report.audit_status === 'DISPUTED';

  return (
    <div className="space-y-4">
      {/* Primary Status Banner */}
      <div
        className={`rounded-xl border p-5 transition-all shadow-xs ${
          isApproved
            ? 'bg-[#EDF2E8]/70 border-[#3A4A28]/40'
            : isDisputed
            ? 'bg-[#F8EAE7]/70 border-[#8C3A2C]/40'
            : 'bg-[#FAF4E6]/70 border-[#8C6D23]/40'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${
                isApproved
                  ? 'bg-[#283618] text-[#FAF7F2]'
                  : isDisputed
                  ? 'bg-[#8C3A2C] text-[#FAF7F2]'
                  : 'bg-[#8C6D23] text-[#FAF7F2]'
              }`}
            >
              {isApproved ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isDisputed ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-serif-luxury font-bold text-[#1F221B] tracking-tight">
                  {isApproved
                    ? 'INVOICE APPROVED FOR PAYMENT'
                    : isDisputed
                    ? 'INVOICE DISPUTED: UNAUTHORIZED OVERCHARGES'
                    : 'REQUIRES HUMAN OVERRIDE'}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono-luxury ${
                    isApproved
                      ? 'bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC]'
                      : isDisputed
                      ? 'bg-[#F8EAE7] text-[#8C3A2C] border border-[#E8C2BB]'
                      : 'bg-[#FAF4E6] text-[#8C6D23] border border-[#E8DAB7]'
                  }`}
                >
                  {report.audit_status}
                </span>
              </div>
              <p className="text-xs text-[#5A5E54] mt-1 font-sans">
                {isApproved
                  ? '3-Way matching verified across TMS contract rates and signed WMS proof of delivery.'
                  : isDisputed
                  ? `Carrier billed unauthorized accessorial fees. Automated dispute email prepared.`
                  : 'Missing parameters or missing documents prevent deterministic auto-approval.'}
              </p>
            </div>
          </div>

          {/* Action Button trigger */}
          <div className="flex items-center space-x-2">
            {report.action_taken === 'DISPUTE_SENT' && (
              <button
                onClick={onOpenDisputeModal}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#8C3A2C] hover:bg-[#722E22] text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>View Carrier Dispute Notice</span>
              </button>
            )}

            {report.action_taken === 'PAYMENT_APPROVED' && (
              <button
                onClick={onOpenPaymentModal}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#283618] hover:bg-[#1E2912] text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>View ERP AP Payment Voucher</span>
              </button>
            )}

            {report.action_taken === 'ESCALATED_TO_HUMAN' && (
              <button
                onClick={onOpenEscalateModal}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#8C6D23] hover:bg-[#72581A] text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Adjudicate Human Exception</span>
              </button>
            )}

            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#DCD2C2] bg-white text-[#5A5E54] hover:text-[#1F221B] hover:bg-[#F4EFEA] text-xs font-mono-luxury transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-[#3A4A28]" />
              <span>{showJson ? 'Hide JSON' : 'JSON Schema'}</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#DCD2C2]/60">
          <div className="bg-white p-3 rounded-lg border border-[#E6DFD3] shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider text-[#767A6F] block font-semibold font-mono-luxury">
              Total Invoiced
            </span>
            <span className="text-xl font-bold font-serif-luxury text-[#1F221B] mt-1 block">
              ${report.total_invoiced.toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-[#E6DFD3] shadow-2xs">
            <span className="text-[10px] uppercase tracking-wider text-[#767A6F] block font-semibold font-mono-luxury">
              Contract Allowed
            </span>
            <span className="text-xl font-bold font-serif-luxury text-[#283618] mt-1 block">
              ${report.total_contracted_allowed.toFixed(2)}
            </span>
          </div>

          <div className={`p-3 rounded-lg border shadow-2xs ${
            report.discrepancy_amount > 0 
              ? 'bg-white border-[#E8C2BB]' 
              : 'bg-white border-[#E6DFD3]'
          }`}>
            <span className="text-[10px] uppercase tracking-wider text-[#767A6F] block font-semibold font-mono-luxury">
              Discrepancy Amount
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xl font-bold font-serif-luxury ${
                report.discrepancy_amount > 0 ? 'text-[#8C3A2C]' : 'text-[#1F221B]'
              }`}>
                ${report.discrepancy_amount.toFixed(2)}
              </span>
              {report.discrepancy_amount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8EAE7] text-[#8C3A2C] font-bold font-mono-luxury">
                  Overcharge
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Internal Reasoning Card (Constraint check: Strictly under 40 words) */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#3A4A28]" />
            <h3 className="text-xs font-bold text-[#1F221B] uppercase tracking-wider font-serif-luxury">
              Autonomous Internal Reasoning
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-[#767A6F] font-mono-luxury">Word Count:</span>
            <span
              className={`text-xs font-mono-luxury font-bold px-2 py-0.5 rounded-full ${
                wordCount <= 40
                  ? 'bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC]'
                  : 'bg-[#F8EAE7] text-[#8C3A2C] border border-[#E8C2BB]'
              }`}
            >
              {wordCount} / 40 words {wordCount <= 40 ? '✓ PASS' : '✗ OVER'}
            </span>
          </div>
        </div>
        <p className="text-sm text-[#4A4E44] leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-[#E6DFD3] italic">
          "{report.internal_reasoning}"
        </p>
      </div>

      {/* 3-Way Itemized Line Items Audit Table */}
      {report.line_item_audits.length > 0 && (
        <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#3A4A28]" />
              <h3 className="text-xs font-serif-luxury font-bold text-[#1F221B] uppercase tracking-wider">
                3-Way Match Line Item Reconciliation
              </h3>
            </div>
            <span className="text-xs text-[#767A6F] font-mono-luxury">
              {report.line_item_audits.length} Line Items Audited
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F0EAE1] text-[#5A5E54] uppercase font-mono-luxury text-[10px] border-b border-[#DCD2C2]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold">Invoiced</th>
                  <th className="py-2.5 px-4 font-semibold">Contract Allowed</th>
                  <th className="py-2.5 px-4 font-semibold">Discrepancy</th>
                  <th className="py-2.5 px-4 font-semibold">Match Status</th>
                  <th className="py-2.5 px-4 font-semibold">Finding / Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD3] font-mono-luxury bg-white">
                {report.line_item_audits.map((item, index) => {
                  const isClean = item.discrepancy === 0;
                  return (
                    <tr
                      key={index}
                      className={`hover:bg-[#FAF7F2] transition-colors ${
                        !isClean ? 'bg-[#FDF9F8]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#1F221B]">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-[#4A4E44]">
                        ${item.invoiced_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-[#283618] font-bold">
                        ${item.contract_allowed_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            item.discrepancy > 0 ? 'text-[#8C3A2C]' : 'text-[#767A6F]'
                          }`}
                        >
                          ${item.discrepancy.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isClean ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC] font-sans font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Exact Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#F8EAE7] text-[#8C3A2C] border border-[#E8C2BB] font-sans font-bold">
                            <XCircle className="w-3 h-3 mr-1" />
                            Discrepancy
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-[#5A5E54] max-w-md">
                        {item.finding}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Schema Pane */}
      {showJson && (
        <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl overflow-hidden shadow-xs animate-in fade-in duration-200">
          <div className="px-4 py-2.5 bg-[#F4EFEA] border-b border-[#E6DFD3] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-[#3A4A28]" />
              <span className="text-xs font-semibold text-[#1F221B] font-mono-luxury">
                AuditReportSchema (Strict JSON Output)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white border border-[#DCD2C2] text-[#5A5E54] hover:text-[#1F221B] text-xs font-mono-luxury transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-[#283618]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white border border-[#DCD2C2] text-[#5A5E54] hover:text-[#1F221B] text-xs font-mono-luxury transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto bg-white">
            <pre className="text-xs font-mono-luxury text-[#283618] leading-relaxed">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
