import React, { useState } from 'react';
import { Database, X, Plus, Check, FileSpreadsheet, Receipt, Trash2 } from 'lucide-react';
import { TMSRateSheet, WMSProofOfDelivery } from '../types/audit';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmsDb: Record<string, TMSRateSheet>;
  wmsDb: Record<string, WMSProofOfDelivery>;
  onUpdateTms: (shipmentId: string, data: TMSRateSheet) => void;
  onUpdateWms: (shipmentId: string, data: WMSProofOfDelivery) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  tmsDb,
  wmsDb,
  onUpdateTms,
  onUpdateWms,
}) => {
  const [activeTab, setActiveTab] = useState<'tms' | 'wms'>('tms');
  const [selectedShipment, setSelectedShipment] = useState<string>('SHP-88291');

  if (!isOpen) return null;

  const currentTms = tmsDb[selectedShipment] || {
    status: 'SUCCESS',
    shipment_id: selectedShipment,
    contract_rate: 1500,
    fsc_index: 0.16,
    free_time_hours: 2.0,
    detention_hourly_rate: 100,
    lumper_pre_approved: false,
  };

  const currentWms = wmsDb[selectedShipment] || {
    status: 'SUCCESS',
    shipment_id: selectedShipment,
    dwell_minutes: 90,
    lumper_receipt_attached: false,
    lumper_receipt_number: null,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6DFD3] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#EDF2E8] text-[#283618]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">TMS & WMS Reference Document Databases</h3>
              <p className="text-xs text-[#767A6F] font-sans">Underlying data queried by MCP tool calls in real time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#767A6F] hover:text-[#1F221B] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Shipment Picker */}
        <div className="px-5 py-3 border-b border-[#E6DFD3] bg-[#F4EFEA]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('tms')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'tms'
                  ? 'bg-[#3A4A28] text-white font-medium shadow-xs'
                  : 'bg-white text-[#5A5E54] hover:text-[#1F221B] border border-[#DCD2C2]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>TMS Rate Sheets (get_rate_sheet)</span>
            </button>
            <button
              onClick={() => setActiveTab('wms')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'wms'
                  ? 'bg-[#3A4A28] text-white font-medium shadow-xs'
                  : 'bg-white text-[#5A5E54] hover:text-[#1F221B] border border-[#DCD2C2]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>WMS POD Documents (get_signed_pod)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 font-mono-luxury">
            <span className="text-[#767A6F]">Active Key:</span>
            <select
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="px-2 py-1 rounded bg-white border border-[#DCD2C2] text-[#1F221B] focus:outline-none focus:border-[#3A4A28]"
            >
              {Object.keys(tmsDb).map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-mono-luxury text-xs bg-[#FAF7F2]">
          {activeTab === 'tms' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[#5A5E54] font-sans">
                <span>Configure Contract Parameters for shipment #{selectedShipment}:</span>
                <span className="text-[#283618] font-mono-luxury text-xs font-bold">
                  Status: {currentTms.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                <div className="bg-white p-3 rounded-lg border border-[#E6DFD3]">
                  <label className="text-[11px] text-[#5A5E54] block mb-1">Contract Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentTms.contract_rate}
                    onChange={(e) =>
                      onUpdateTms(selectedShipment, {
                        ...currentTms,
                        contract_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs"
                  />
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#E6DFD3]">
                  <label className="text-[11px] text-[#5A5E54] block mb-1">DOE FSC Index Scale (e.g. 0.16 = 16%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentTms.fsc_index}
                    onChange={(e) =>
                      onUpdateTms(selectedShipment, {
                        ...currentTms,
                        fsc_index: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs"
                  />
                  <span className="text-[10px] text-[#767A6F] mt-1 block">
                    Allowed FSC: ${(currentTms.contract_rate * currentTms.fsc_index).toFixed(2)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#E6DFD3]">
                  <label className="text-[11px] text-[#5A5E54] block mb-1">Free Time Allowance (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentTms.free_time_hours}
                    onChange={(e) =>
                      onUpdateTms(selectedShipment, {
                        ...currentTms,
                        free_time_hours: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs"
                  />
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#E6DFD3]">
                  <label className="text-[11px] text-[#5A5E54] block mb-1">Detention Hourly Rate ($/hr)</label>
                  <input
                    type="number"
                    step="5"
                    value={currentTms.detention_hourly_rate}
                    onChange={(e) =>
                      onUpdateTms(selectedShipment, {
                        ...currentTms,
                        detention_hourly_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs"
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#E6DFD3] flex items-center justify-between font-sans">
                <div>
                  <span className="text-xs text-[#1F221B] font-semibold block">Lumper Pre-Approval</span>
                  <span className="text-[11px] text-[#767A6F]">
                    If false, signed POD must explicitly have stamped receipt attached.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentTms.lumper_pre_approved}
                  onChange={(e) =>
                    onUpdateTms(selectedShipment, {
                      ...currentTms,
                      lumper_pre_approved: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-[#3A4A28]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[#5A5E54] font-sans">
                <span>Configure WMS Receiver & POD data for #{selectedShipment}:</span>
                <span className="text-[#283618] font-mono-luxury text-xs font-bold">
                  Status: {currentWms.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                <div className="bg-white p-3 rounded-lg border border-[#E6DFD3]">
                  <label className="text-[11px] text-[#5A5E54] block mb-1">Dwell Time (Total Minutes)</label>
                  <input
                    type="number"
                    value={currentWms.dwell_minutes || 0}
                    onChange={(e) =>
                      onUpdateWms(selectedShipment, {
                        ...currentWms,
                        dwell_minutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs"
                  />
                  <span className="text-[10px] text-[#767A6F] mt-1 block">
                    Equivalent: {((currentWms.dwell_minutes || 0) / 60).toFixed(2)} hours
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#E6DFD3]">
                  <label className="text-[11px] text-[#5A5E54] block mb-1">Driver / Receiver Notes</label>
                  <input
                    type="text"
                    value={currentWms.driver_notes || ''}
                    onChange={(e) =>
                      onUpdateWms(selectedShipment, {
                        ...currentWms,
                        driver_notes: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] text-xs"
                  />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-[#E6DFD3] space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#1F221B] font-semibold block">Lumper Receipt Attached & Stamped</span>
                    <span className="text-[11px] text-[#767A6F]">
                      If false, any billed lumper fee will be rejected ($0.00 allowed).
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!currentWms.lumper_receipt_attached}
                    onChange={(e) =>
                      onUpdateWms(selectedShipment, {
                        ...currentWms,
                        lumper_receipt_attached: e.target.checked,
                        lumper_receipt_number: e.target.checked ? 'LMP-44210' : null,
                      })
                    }
                    className="w-4 h-4 rounded text-[#3A4A28]"
                  />
                </div>

                {currentWms.lumper_receipt_attached && (
                  <div>
                    <label className="text-[11px] text-[#5A5E54] block mb-1">Receipt Number Reference</label>
                    <input
                      type="text"
                      value={currentWms.lumper_receipt_number || ''}
                      onChange={(e) =>
                        onUpdateWms(selectedShipment, {
                          ...currentWms,
                          lumper_receipt_number: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F2] border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6DFD3] bg-[#F4EFEA] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#3A4A28] hover:bg-[#283618] text-white text-xs font-medium transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
