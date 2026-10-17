import React, { useState } from 'react';
import { UserCheck, X, AlertTriangle, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import { AuditReportSchema } from '../types/audit';

interface HumanEscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReportSchema;
  actionResult: any;
  onResolveException: (updatedShipmentId: string) => void;
}

export const HumanEscalateModal: React.FC<HumanEscalateModalProps> = ({
  isOpen,
  onClose,
  report,
  actionResult,
  onResolveException,
}) => {
  const [correctedId, setCorrectedId] = useState(report.shipment_id || 'SHP-88291');
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateDocUpload = () => {
    setIsSimulatingUpload(true);
    setTimeout(() => {
      setIsSimulatingUpload(false);
      setUploadSuccess(true);
      setTimeout(() => {
        onResolveException(correctedId);
        onClose();
      }, 800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#FAF4E6] text-[#8C6D23]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">Human Auditor Exception Desk</h3>
              <p className="text-xs text-[#767A6F] font-mono-luxury">Invoice: {report.invoice_number}</p>
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
          <div className="p-3.5 rounded-lg bg-[#FAF4E6] border border-[#E8DAB7]">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#8C6D23] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#8C6D23] block">
                  Deterministic Audit Protocol Halted
                </span>
                <p className="text-[#5A5E54] mt-1 leading-relaxed">
                  {actionResult?.reason || report.internal_reasoning}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-[#E6DFD3] space-y-3">
            <div>
              <label className="text-[10px] font-bold text-[#767A6F] uppercase tracking-wider block mb-1.5 font-mono-luxury">
                Supply Missing or Corrected Shipment ID
              </label>
              <input
                type="text"
                value={correctedId}
                onChange={(e) => setCorrectedId(e.target.value)}
                placeholder="e.g. SHP-88291"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs focus:outline-none focus:border-[#3A4A28]"
              />
              <p className="text-[11px] text-[#767A6F] mt-1 font-sans">
                Once provided, the engine will re-trigger parallel MCP calls `get_rate_sheet` and `get_signed_pod`.
              </p>
            </div>

            <div className="pt-2 border-t border-[#EFE9DF]">
              <label className="text-[10px] font-bold text-[#767A6F] uppercase tracking-wider block mb-1.5 font-mono-luxury">
                Reference Document Re-upload
              </label>
              <div className="border border-dashed border-[#DCD2C2] rounded-lg p-4 text-center hover:border-[#3A4A28] bg-[#FAF7F2] transition-colors">
                <Upload className="w-6 h-6 mx-auto mb-1.5 text-[#767A6F]" />
                <span className="text-[#1F221B] font-medium block">Drop signed BOL / Rate Sheet PDF</span>
                <span className="text-[10px] text-[#767A6F]">Supports PDF, TIFF, PNG, or JSON EDI 210</span>
              </div>
            </div>
          </div>

          {uploadSuccess && (
            <div className="p-3 rounded-lg bg-[#EDF2E8] border border-[#D5E0CC] flex items-center space-x-2 text-[#283618]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document synced to TMS/WMS! Re-executing audit now...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[#DCD2C2] bg-white text-[#767A6F] hover:text-[#1F221B] text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSimulateDocUpload}
            disabled={isSimulatingUpload || !correctedId.trim()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#8C6D23] hover:bg-[#72581A] text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSimulatingUpload ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Re-syncing MCP Records...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Override & Re-Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
