import React, { useState } from 'react';
import { Mail, X, Check, Copy, Send, ShieldAlert, ExternalLink } from 'lucide-react';
import { AuditReportSchema } from '../types/audit';

interface DisputeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReportSchema;
  actionResult: any;
  carrierEmail: string;
  carrierName: string;
}

export const DisputeEmailModal: React.FC<DisputeEmailModalProps> = ({
  isOpen,
  onClose,
  report,
  actionResult,
  carrierEmail,
  carrierName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subject = actionResult?.subject || `[DISPUTE NOTICE] Freight Overcharge on Inv #${report.invoice_number}`;
  const body = actionResult?.body || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(`To: ${carrierEmail}\nSubject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#F8EAE7] text-[#8C3A2C]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">Carrier Dispute Resolution Dispatch</h3>
              <p className="text-xs text-[#767A6F] font-mono-luxury">Ref: {actionResult?.dispute_ref || 'DSP-000000'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#767A6F] hover:text-[#1F221B] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {/* Dispatch Status */}
          <div className="p-3 rounded-lg bg-[#F8EAE7] border border-[#E8C2BB] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#8C3A2C] shrink-0" />
              <span className="text-[#8C3A2C] font-semibold">
                Dispute dispatched via Autonomous EDI / SMTP Mail Gateway
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#8C3A2C] font-bold font-mono-luxury border border-[#E8C2BB]">
              -${report.discrepancy_amount.toFixed(2)} DISPUTED
            </span>
          </div>

          {/* Email Headers */}
          <div className="bg-white rounded-lg p-3 border border-[#E6DFD3] space-y-2 font-mono-luxury">
            <div className="flex">
              <span className="text-[#767A6F] w-20">To:</span>
              <span className="text-[#1F221B] font-semibold">{carrierEmail} ({carrierName})</span>
            </div>
            <div className="flex">
              <span className="text-[#767A6F] w-20">From:</span>
              <span className="text-[#283618] font-semibold">disputes@freightaudit.ai (Autonomous Engine)</span>
            </div>
            <div className="flex">
              <span className="text-[#767A6F] w-20">Subject:</span>
              <span className="text-[#1F221B] font-bold">{subject}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="bg-white rounded-lg p-4 border border-[#E6DFD3] max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono-luxury text-[#4A4E44] whitespace-pre-wrap leading-relaxed">
              {body}
            </pre>
          </div>

          {/* Attached Evidence Checklist */}
          <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#E6DFD3]">
            <span className="text-[10px] font-mono-luxury font-bold text-[#767A6F] uppercase tracking-wider block mb-1.5">
              Automated Evidence Pack Attached
            </span>
            <ul className="space-y-1 text-[#4A4E44]">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#283618]" />
                <span>TMS Agreed Rate Sheet Contract Clause #4.2 (Detention & FSC scale)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#283618]" />
                <span>WMS Receiver Gate-in/Gate-out GPS audit trail (Shipment #{report.shipment_id})</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#283618]" />
                <span>Line-item financial delta variance breakdown (${report.discrepancy_amount.toFixed(2)})</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#DCD2C2] bg-white text-[#5A5E54] hover:text-[#1F221B] text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#283618]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Message'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
