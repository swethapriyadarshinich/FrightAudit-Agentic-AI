import React, { useState } from 'react';
import { 
  FileText, 
  Code, 
  Sliders, 
  Sparkles, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Hash, 
  Mail, 
  Truck 
} from 'lucide-react';
import { FreightInvoice } from '../types/audit';
import { PRESET_SCENARIOS } from '../services/mockData';

interface InvoiceEditorProps {
  invoice: FreightInvoice;
  onChangeInvoice: (inv: FreightInvoice) => void;
  onSelectScenario: (scenarioId: string) => void;
  selectedScenarioId: string;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChangeInvoice,
  onSelectScenario,
  selectedScenarioId,
}) => {
  const [editorMode, setEditorMode] = useState<'presets' | 'form' | 'json'>('presets');
  const [rawJson, setRawJson] = useState(JSON.stringify(invoice, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (text: string) => {
    setRawJson(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      onChangeInvoice(parsed);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleFieldChange = (field: string, val: any) => {
    const updated = { ...invoice };
    if (field.startsWith('details.')) {
      const subField = field.replace('details.', '');
      const details = { ...updated.invoice_details, [subField]: parseFloat(val) || 0 };
      // auto update total
      const total =
        (details.base_freight || 0) +
        (details.fuel_surcharge || 0) +
        (details.detention_charge || 0) +
        (details.lumper_fee || 0) +
        (details.stop_off || 0) +
        (details.reconsignment || 0);
      details.total_invoiced = Math.round((total + Number.EPSILON) * 100) / 100;
      updated.invoice_details = details;
    } else {
      (updated as any)[field] = val;
    }
    onChangeInvoice(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl overflow-hidden shadow-xs">
      {/* Editor Tab Bar */}
      <div className="px-4 py-3 border-b border-[#E6DFD3] bg-[#F4EFEA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#3A4A28]" />
          <h2 className="text-base font-serif-luxury font-bold text-[#1F221B]">Incoming Invoice Payload</h2>
        </div>

        <div className="flex items-center bg-[#EFE9DF] border border-[#DCD2C2] rounded-lg p-0.5 text-xs font-sans">
          <button
            onClick={() => setEditorMode('presets')}
            className={`px-3 py-1 rounded transition-colors ${
              editorMode === 'presets' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            Presets ({PRESET_SCENARIOS.length})
          </button>
          <button
            onClick={() => setEditorMode('form')}
            className={`px-3 py-1 rounded transition-colors ${
              editorMode === 'form' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            Form Editor
          </button>
          <button
            onClick={() => {
              setRawJson(JSON.stringify(invoice, null, 2));
              setEditorMode('json');
            }}
            className={`px-3 py-1 rounded transition-colors ${
              editorMode === 'json' ? 'bg-[#3A4A28] text-white font-medium' : 'text-[#696C64] hover:text-[#1F221B]'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-4">
        {/* Preset Selector */}
        {editorMode === 'presets' && (
          <div className="space-y-2.5">
            <p className="text-xs text-[#5A5E54]">
              Select an audit scenario to test the autonomous 3-way matching and decision protocol:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {PRESET_SCENARIOS.map((sc) => {
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScenario(sc.id)}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#3A4A28] shadow-xs'
                        : 'bg-[#FDFBF7] border-[#E6DFD3] hover:bg-white hover:border-[#DCD2C2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-serif-luxury font-bold text-[#1F221B] tracking-tight">{sc.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono-luxury font-semibold ${
                        sc.badge.includes('Approved')
                          ? 'bg-[#EDF2E8] text-[#283618] border-[#D5E0CC]'
                          : sc.badge.includes('Disputed')
                          ? 'bg-[#F8EAE7] text-[#8C3A2C] border-[#E8C2BB]'
                          : 'bg-[#FAF4E6] text-[#8C6D23] border-[#E8DAB7]'
                      }`}>
                        {sc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A5E54] leading-relaxed line-clamp-2 font-sans">
                      {sc.description}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-[#EFE9DF] flex items-center justify-between text-[10px] text-[#767A6F] font-mono-luxury">
                      <span>Shipment: {sc.invoice.shipment_id || 'NONE'}</span>
                      <span className="text-[#1F221B] font-bold">
                        ${sc.invoice.invoice_details.total_invoiced.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Editor */}
        {editorMode === 'form' && (
          <div className="space-y-3 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#5A5E54] block mb-1 font-mono-luxury">shipment_id (TMS/WMS Key)</label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#767A6F]" />
                  <input
                    type="text"
                    value={invoice.shipment_id || ''}
                    onChange={(e) => handleFieldChange('shipment_id', e.target.value)}
                    placeholder="e.g. SHP-88291"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs focus:outline-none focus:border-[#3A4A28]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#5A5E54] block mb-1 font-mono-luxury">invoice_number</label>
                <input
                  type="text"
                  value={invoice.invoice_number || ''}
                  onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs focus:outline-none focus:border-[#3A4A28]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#5A5E54] block mb-1 font-mono-luxury">carrier_name</label>
                <input
                  type="text"
                  value={invoice.carrier_name || ''}
                  onChange={(e) => handleFieldChange('carrier_name', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DCD2C2] text-[#1F221B] text-xs focus:outline-none focus:border-[#3A4A28]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#5A5E54] block mb-1 font-mono-luxury">carrier_email</label>
                <input
                  type="email"
                  value={invoice.carrier_email || ''}
                  onChange={(e) => handleFieldChange('carrier_email', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#DCD2C2] text-[#1F221B] font-mono-luxury text-xs focus:outline-none focus:border-[#3A4A28]"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="mt-3 pt-3 border-t border-[#E6DFD3]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#767A6F] block mb-2 font-mono-luxury">
                Invoice Details / Accessorials ($)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-luxury">
                <div>
                  <label className="text-[10px] text-[#767A6F] block mb-1">Base Freight</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.invoice_details.base_freight}
                    onChange={(e) => handleFieldChange('details.base_freight', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DCD2C2] text-[#1F221B] text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#767A6F] block mb-1">Fuel Surcharge (FSC)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.invoice_details.fuel_surcharge}
                    onChange={(e) => handleFieldChange('details.fuel_surcharge', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DCD2C2] text-[#1F221B] text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#767A6F] block mb-1">Detention Charge</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.invoice_details.detention_charge || 0}
                    onChange={(e) => handleFieldChange('details.detention_charge', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DCD2C2] text-[#1F221B] text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#767A6F] block mb-1">Lumper Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.invoice_details.lumper_fee || 0}
                    onChange={(e) => handleFieldChange('details.lumper_fee', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#DCD2C2] text-[#1F221B] text-xs"
                  />
                </div>
              </div>
              <div className="mt-2.5 flex justify-end items-center space-x-2 text-xs">
                <span className="text-[#767A6F]">Calculated Total:</span>
                <span className="font-bold text-[#1F221B] font-mono-luxury text-sm">
                  ${invoice.invoice_details.total_invoiced.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Raw JSON Editor */}
        {editorMode === 'json' && (
          <div className="space-y-2">
            {jsonError && (
              <div className="p-2 rounded bg-[#F8EAE7] border border-[#E8C2BB] text-[#8C3A2C] text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>JSON Syntax Error: {jsonError}</span>
              </div>
            )}
            <textarea
              value={rawJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={10}
              className="w-full p-3 rounded-lg bg-white border border-[#DCD2C2] font-mono-luxury text-xs text-[#283618] focus:outline-none focus:border-[#3A4A28] leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
};
