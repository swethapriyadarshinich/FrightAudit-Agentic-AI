import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCheck2, 
  Clock, 
  MapPin, 
  Truck, 
  ShieldAlert, 
  CheckCircle, 
  Receipt, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { FreightInvoice, TMSRateSheet, WMSProofOfDelivery } from '../types/audit';

interface DocumentInspectorProps {
  invoice: FreightInvoice;
  tmsRate?: TMSRateSheet;
  wmsPod?: WMSProofOfDelivery;
  isAudited: boolean;
}

export const DocumentInspector: React.FC<DocumentInspectorProps> = ({
  invoice,
  tmsRate,
  wmsPod,
  isAudited,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'all' | 'invoice' | 'tms' | 'wms'>('all');

  const dwellHours = wmsPod?.dwell_minutes ? (wmsPod.dwell_minutes / 60).toFixed(2) : '0';
  const freeTimeHours = tmsRate?.free_time_hours || 2.0;
  const isDetentionExceeded = (wmsPod?.dwell_minutes || 0) / 60 > freeTimeHours;

  return (
    <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl overflow-hidden shadow-xs">
      {/* Document Inspector Header */}
      <div className="px-5 py-3.5 border-b border-[#E6DFD3] flex flex-wrap items-center justify-between gap-3 bg-[#F4EFEA]">
        <div className="flex items-center space-x-2.5">
          <FileCheck2 className="w-5 h-5 text-[#3A4A28]" />
          <h2 className="text-base font-serif-luxury font-bold text-[#1F221B]">3-Way Document Match Inspector</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#5A5E54] font-mono-luxury border border-[#DCD2C2]">
            Shipment: {invoice.shipment_id || 'NOT_SPECIFIED'}
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-[#EFE9DF] border border-[#DCD2C2] rounded-lg p-0.5 text-xs font-sans">
          <button
            onClick={() => setActiveDocTab('all')}
            className={`px-3 py-1 rounded transition-colors ${
              activeDocTab === 'all' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            3-Way Split View
          </button>
          <button
            onClick={() => setActiveDocTab('invoice')}
            className={`px-3 py-1 rounded transition-colors ${
              activeDocTab === 'invoice' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            Invoice Only
          </button>
          <button
            onClick={() => setActiveDocTab('tms')}
            className={`px-3 py-1 rounded transition-colors ${
              activeDocTab === 'tms' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            TMS Rate
          </button>
          <button
            onClick={() => setActiveDocTab('wms')}
            className={`px-3 py-1 rounded transition-colors ${
              activeDocTab === 'wms' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            Signed POD
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className={`p-4 grid gap-4 ${activeDocTab === 'all' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        
        {/* Document 1: Carrier Freight Invoice */}
        {(activeDocTab === 'all' || activeDocTab === 'invoice') && (
          <div className="bg-white border border-[#E6DFD3] rounded-lg p-4 flex flex-col justify-between shadow-2xs relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DF]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-[#F4EFEA] text-[#3A4A28]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-serif-luxury font-bold text-[#1F221B] uppercase tracking-wider block">Carrier Invoice</span>
                    <span className="text-[11px] text-[#767A6F] font-mono-luxury">Doc: {invoice.invoice_number}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EAE1] text-[#3A4A28] border border-[#DCD2C2] font-mono-luxury">
                  INVOICE
                </span>
              </div>

              {/* Carrier & Route */}
              <div className="mt-3 space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[#767A6F]">Carrier:</span>
                  <span className="font-semibold text-[#1F221B]">{invoice.carrier_name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#767A6F]">Email:</span>
                  <span className="font-mono-luxury text-[#5A5E54] text-[11px]">{invoice.carrier_email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#767A6F]">Lane:</span>
                  <span className="text-[#1F221B] truncate max-w-[180px]">{invoice.origin} → {invoice.destination}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#767A6F]">Date:</span>
                  <span className="text-[#4A4E44] font-mono-luxury">{invoice.invoice_date}</span>
                </div>
              </div>

              {/* Billed Line Items */}
              <div className="mt-4 pt-3 border-t border-[#EFE9DF]">
                <span className="text-[10px] font-mono-luxury font-bold text-[#767A6F] uppercase tracking-wider block mb-2">
                  Billed Line Items
                </span>
                <div className="space-y-1.5 font-mono-luxury text-xs">
                  <div className="flex justify-between py-1 px-2.5 rounded bg-[#FAF7F2] border border-[#EFE9DF]">
                    <span className="text-[#5A5E54]">Base Freight:</span>
                    <span className="font-semibold text-[#1F221B]">${invoice.invoice_details?.base_freight?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between py-1 px-2.5 rounded bg-[#FAF7F2] border border-[#EFE9DF]">
                    <span className="text-[#5A5E54]">Fuel Surcharge (FSC):</span>
                    <span className="font-semibold text-[#1F221B]">${invoice.invoice_details?.fuel_surcharge?.toFixed(2) || '0.00'}</span>
                  </div>
                  {invoice.invoice_details?.detention_charge !== undefined && invoice.invoice_details.detention_charge > 0 && (
                    <div className="flex justify-between py-1 px-2.5 rounded bg-[#F8EAE7] border border-[#E8C2BB]">
                      <span className="text-[#8C3A2C] font-semibold">Detention Fee:</span>
                      <span className="font-bold text-[#8C3A2C]">${invoice.invoice_details.detention_charge.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.invoice_details?.lumper_fee !== undefined && invoice.invoice_details.lumper_fee > 0 && (
                    <div className="flex justify-between py-1 px-2.5 rounded bg-[#FAF4E6] border border-[#E8DAB7]">
                      <span className="text-[#8C6D23] font-semibold">Lumper Fee:</span>
                      <span className="font-bold text-[#8C6D23]">${invoice.invoice_details.lumper_fee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="mt-4 pt-3 border-t border-[#EFE9DF] flex justify-between items-center">
              <span className="text-xs font-medium text-[#767A6F]">Total Billed:</span>
              <span className="text-base font-bold text-[#1F221B] font-mono-luxury">
                ${invoice.invoice_details?.total_invoiced?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        )}

        {/* Document 2: TMS Contract Rate Sheet */}
        {(activeDocTab === 'all' || activeDocTab === 'tms') && (
          <div className="bg-white border border-[#E6DFD3] rounded-lg p-4 flex flex-col justify-between shadow-2xs relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DF]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-[#EDF2E8] text-[#283618]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-serif-luxury font-bold text-[#1F221B] uppercase tracking-wider block">TMS Contract Sheet</span>
                    <span className="text-[11px] text-[#767A6F] font-mono-luxury">Rate Agreement</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono-luxury ${
                  tmsRate?.status === 'SUCCESS' 
                    ? 'bg-[#EDF2E8] text-[#283618] border-[#D5E0CC]' 
                    : 'bg-[#F8EAE7] text-[#8C3A2C] border-[#E8C2BB]'
                }`}>
                  {tmsRate?.status || 'NOT_FETCHED'}
                </span>
              </div>

              {tmsRate?.status === 'SUCCESS' ? (
                <>
                  <div className="mt-3 space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Agreed Base Rate:</span>
                      <span className="font-bold text-[#283618] font-mono-luxury">${tmsRate.contract_rate.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Contract DOE FSC:</span>
                      <span className="font-bold text-[#1F221B] font-mono-luxury">
                        {(tmsRate.fsc_index * 100).toFixed(1)}% (${(tmsRate.contract_rate * tmsRate.fsc_index).toFixed(2)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Free-Time Window:</span>
                      <span className="font-semibold text-[#1F221B] font-mono-luxury">{tmsRate.free_time_hours.toFixed(1)} Hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Detention Cap:</span>
                      <span className="font-mono-luxury text-[#5A5E54]">${tmsRate.detention_hourly_rate.toFixed(2)}/hr after free time</span>
                    </div>
                  </div>

                  {/* Accessorial Rules */}
                  <div className="mt-4 pt-3 border-t border-[#EFE9DF]">
                    <span className="text-[10px] font-mono-luxury font-bold text-[#767A6F] uppercase tracking-wider block mb-2">
                      Accessorial Clauses
                    </span>
                    <div className="space-y-2 text-xs font-sans">
                      <div className="p-2 rounded bg-[#FAF7F2] border border-[#E6DFD3] flex items-start space-x-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#3A4A28] shrink-0 mt-0.5" />
                        <span className="text-[#4A4E44]">
                          Detention requires GPS/Gate timestamps verifying dwell &gt; {tmsRate.free_time_hours} hrs.
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#FAF7F2] border border-[#E6DFD3] flex items-start space-x-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#3A4A28] shrink-0 mt-0.5" />
                        <span className="text-[#4A4E44]">
                          Lumper {tmsRate.lumper_pre_approved ? 'pre-approved' : 'requires signed receiver stamp & receipt #'}.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 py-6 text-center text-xs text-[#8C3A2C] bg-[#F8EAE7] rounded-lg border border-[#E8C2BB] p-4">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#8C3A2C]" />
                  <p className="font-semibold">RECORD_NOT_FOUND in TMS</p>
                  <p className="text-[#767A6F] mt-1">No contract found for shipment. Engine requires human override.</p>
                </div>
              )}
            </div>

            {tmsRate?.status === 'SUCCESS' && (
              <div className="mt-4 pt-3 border-t border-[#EFE9DF] flex justify-between items-center text-xs">
                <span className="text-[#767A6F]">Contract Base + FSC:</span>
                <span className="font-bold text-[#283618] font-mono-luxury text-sm">
                  ${(tmsRate.contract_rate + (tmsRate.contract_rate * tmsRate.fsc_index)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Document 3: WMS Signed Proof of Delivery (POD) */}
        {(activeDocTab === 'all' || activeDocTab === 'wms') && (
          <div className="bg-white border border-[#E6DFD3] rounded-lg p-4 flex flex-col justify-between shadow-2xs relative">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DF]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-[#EDF2E8] text-[#283618]">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-serif-luxury font-bold text-[#1F221B] uppercase tracking-wider block">Signed POD Doc</span>
                    <span className="text-[11px] text-[#767A6F] font-mono-luxury">Warehouse Gate</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono-luxury ${
                  wmsPod?.status === 'SUCCESS' 
                    ? 'bg-[#EDF2E8] text-[#283618] border-[#D5E0CC]' 
                    : 'bg-[#F8EAE7] text-[#8C3A2C] border-[#E8C2BB]'
                }`}>
                  {wmsPod?.status || 'NOT_FETCHED'}
                </span>
              </div>

              {wmsPod?.status === 'SUCCESS' ? (
                <>
                  {/* Gate Timestamps */}
                  <div className="mt-3 space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Gate-In Arrival:</span>
                      <span className="font-mono-luxury text-[#1F221B]">
                        {wmsPod.gate_in ? new Date(wmsPod.gate_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Gate-Out Departure:</span>
                      <span className="font-mono-luxury text-[#1F221B]">
                        {wmsPod.gate_out ? new Date(wmsPod.gate_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#767A6F]">Recorded Dwell Time:</span>
                      <span className={`font-mono-luxury font-bold ${isDetentionExceeded ? 'text-[#8C6D23]' : 'text-[#283618]'}`}>
                        {wmsPod.dwell_minutes} mins ({dwellHours} hrs)
                      </span>
                    </div>
                  </div>

                  {/* Driver & Receiver Verification */}
                  <div className="mt-4 pt-3 border-t border-[#EFE9DF]">
                    <span className="text-[10px] font-mono-luxury font-bold text-[#767A6F] uppercase tracking-wider block mb-2">
                      POD Stamps & Signatures
                    </span>
                    <div className="space-y-2 text-xs font-sans">
                      <div className="p-2 rounded bg-[#FAF7F2] border border-[#E6DFD3]">
                        <div className="flex justify-between text-[11px] text-[#767A6F]">
                          <span>Signed By:</span>
                          <span className="text-[#1F221B] font-medium">{wmsPod.signed_by || 'Unsigned'}</span>
                        </div>
                        <div className="text-[10px] text-[#767A6F] mt-0.5 truncate">
                          Consignee: {wmsPod.consignee_name}
                        </div>
                      </div>

                      {/* Lumper receipt status */}
                      <div className={`p-2 rounded border flex items-center justify-between ${
                        wmsPod.lumper_receipt_attached && wmsPod.lumper_receipt_number
                          ? 'bg-[#EDF2E8] border-[#D5E0CC] text-[#283618]'
                          : 'bg-[#F8EAE7] border-[#E8C2BB] text-[#8C3A2C]'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Lumper Receipt:</span>
                        </div>
                        <span className="font-mono-luxury font-bold">
                          {wmsPod.lumper_receipt_attached && wmsPod.lumper_receipt_number 
                            ? `#${wmsPod.lumper_receipt_number}` 
                            : 'NONE ATTACHED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 py-6 text-center text-xs text-[#8C3A2C] bg-[#F8EAE7] rounded-lg border border-[#E8C2BB] p-4">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#8C3A2C]" />
                  <p className="font-semibold">RECORD_NOT_FOUND in WMS</p>
                  <p className="text-[#767A6F] mt-1">Signed delivery proof missing. Engine halts and requests carrier proof re-upload.</p>
                </div>
              )}
            </div>

            {wmsPod?.status === 'SUCCESS' && (
              <div className="mt-4 pt-3 border-t border-[#EFE9DF] text-[11px] text-[#767A6F] italic truncate">
                "{wmsPod.driver_notes || 'Dock receipt verified.'}"
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
