import React from 'react';
import { CreditCard, X, CheckCircle2, Building, ShieldCheck, Printer } from 'lucide-react';
import { AuditReportSchema } from '../types/audit';

interface PaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReportSchema;
  actionResult: any;
  carrierName: string;
}

export const PaymentVoucherModal: React.FC<PaymentVoucherModalProps> = ({
  isOpen,
  onClose,
  report,
  actionResult,
  carrierName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl max-w-xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#EDF2E8] text-[#283618]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">ERP Accounts Payable Payment Authorization</h3>
              <p className="text-xs text-[#767A6F] font-mono-luxury">
                Batch Ref: {actionResult?.approval_id || 'APV-000000'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#767A6F] hover:text-[#1F221B] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Body */}
        <div className="p-5 space-y-4 text-xs font-sans">
          <div className="p-4 rounded-lg bg-[#EDF2E8] border border-[#D5E0CC] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#283618] uppercase tracking-wider block font-bold font-mono-luxury">
                Approved Disbursement Amount
              </span>
              <span className="text-2xl font-bold font-serif-luxury text-[#283618] mt-1 block">
                ${report.total_contracted_allowed.toFixed(2)} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#767A6F] block font-mono-luxury">Audit Discrepancy</span>
              <span className="text-xs font-bold text-[#1F221B] font-mono-luxury">$0.00 (Clean Match)</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-[#E6DFD3] space-y-2 font-mono-luxury">
            <div className="flex justify-between py-1.5 border-b border-[#EFE9DF]">
              <span className="text-[#767A6F]">Payee (Carrier):</span>
              <span className="text-[#1F221B] font-semibold">{carrierName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EFE9DF]">
              <span className="text-[#767A6F]">Invoice Number:</span>
              <span className="text-[#4A4E44]">{report.invoice_number}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EFE9DF]">
              <span className="text-[#767A6F]">Shipment ID:</span>
              <span className="text-[#4A4E44]">{report.shipment_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EFE9DF]">
              <span className="text-[#767A6F]">Target ERP:</span>
              <span className="text-[#3A4A28] font-bold">SAP S/4HANA Financial Ledger</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#767A6F]">Disbursement Status:</span>
              <span className="text-[#283618] font-bold">QUEUED_FOR_EFT</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E6DFD3] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#283618] shrink-0 mt-0.5" />
            <p className="text-[#5A5E54] text-[11px] leading-relaxed">
              Payment was approved autonomously following strict 3-way verification against contract rate sheets and signed POD receipts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6DFD3] bg-[#F4EFEA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-medium transition-colors"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
