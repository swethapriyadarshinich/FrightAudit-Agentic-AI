import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  Calendar
} from 'lucide-react';
import { AuditLogEntry, AuditStatus } from '../types/audit';

interface AuditLedgerProps {
  entries: AuditLogEntry[];
  onSelectEntry: (entry: AuditLogEntry) => void;
  onClearLedger?: () => void;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({
  entries,
  onSelectEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AuditStatus>('ALL');

  const filtered = entries.filter((e) => {
    const matchesSearch =
      (e.shipment_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.carrier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.immutable_hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || e.audit_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCsv = () => {
    const headers = [
      'Hash',
      'Timestamp',
      'Invoice Number',
      'Shipment ID',
      'Carrier',
      'Status',
      'Total Invoiced',
      'Contract Allowed',
      'Discrepancy',
      'Action Taken',
      'Internal Reasoning'
    ];
    const rows = entries.map((e) => [
      e.immutable_hash,
      e.timestamp,
      e.invoice_number,
      e.shipment_id || 'N/A',
      `"${e.carrier_name.replace(/"/g, '""')}"`,
      e.audit_status,
      e.total_invoiced.toFixed(2),
      e.total_contracted_allowed.toFixed(2),
      e.discrepancy_amount.toFixed(2),
      e.action_taken,
      `"${e.internal_reasoning.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `freight_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl overflow-hidden shadow-xs">
      {/* Header & Controls */}
      <div className="px-5 py-4 border-b border-[#E6DFD3] bg-[#F4EFEA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-[#EDF2E8] text-[#283618]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-serif-luxury font-bold text-[#1F221B]">Immutable Audit Ledger</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#5A5E54] font-mono-luxury border border-[#DCD2C2]">
                {entries.length} Total Records
              </span>
            </div>
            <p className="text-xs text-[#5A5E54]">Tamper-evident audit chain with cryptographic hashes</p>
          </div>
        </div>

        {/* Search, Filter, Export */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#767A6F]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shipment, inv, carrier..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#DCD2C2] text-[#1F221B] placeholder-[#767A6F] text-xs focus:outline-none focus:border-[#3A4A28] w-44 sm:w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#DCD2C2] text-[#5A5E54] text-xs focus:outline-none focus:border-[#3A4A28]"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved ($0.00)</option>
            <option value="DISPUTED">Disputed (Variance)</option>
            <option value="REQUIRES_HUMAN_OVERRIDE">Human Override</option>
          </select>

          <button
            onClick={exportCsv}
            disabled={entries.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#DCD2C2] bg-white text-[#5A5E54] hover:text-[#1F221B] hover:bg-[#F4EFEA] transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono-luxury bg-white">
          <thead className="bg-[#F0EAE1] text-[#5A5E54] uppercase text-[10px] border-b border-[#DCD2C2]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Ledger Hash</th>
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-4 font-semibold">Shipment / Inv #</th>
              <th className="py-2.5 px-4 font-semibold font-sans">Carrier</th>
              <th className="py-2.5 px-4 font-semibold">Invoiced</th>
              <th className="py-2.5 px-4 font-semibold">Contract Allowed</th>
              <th className="py-2.5 px-4 font-semibold">Discrepancy</th>
              <th className="py-2.5 px-4 font-semibold font-sans">Status</th>
              <th className="py-2.5 px-4 font-semibold font-sans">Action Executed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DFD3]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#767A6F] font-serif-luxury text-sm italic">
                  No audit ledger records found. Run an audit in the cockpit to generate immutable entries.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const isApproved = entry.audit_status === 'APPROVED';
                const isDisputed = entry.audit_status === 'DISPUTED';

                return (
                  <tr
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className="hover:bg-[#FAF7F2] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono-luxury text-[11px] text-[#3A4A28] flex items-center space-x-1.5 font-bold">
                      <Lock className="w-3 h-3 text-[#767A6F] group-hover:text-[#3A4A28]" />
                      <span>{entry.immutable_hash}</span>
                    </td>
                    <td className="py-3 px-4 text-[#767A6F] text-[11px]">
                      {new Date(entry.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#1F221B] block">{entry.shipment_id || 'NO_ID'}</span>
                      <span className="text-[10px] text-[#767A6F]">{entry.invoice_number}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-[#4A4E44] max-w-[150px] truncate font-medium">
                      {entry.carrier_name}
                    </td>
                    <td className="py-3 px-4 text-[#4A4E44]">${entry.total_invoiced.toFixed(2)}</td>
                    <td className="py-3 px-4 text-[#283618] font-bold">
                      ${entry.total_contracted_allowed.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={entry.discrepancy_amount > 0 ? 'text-[#8C3A2C]' : 'text-[#767A6F]'}>
                        ${entry.discrepancy_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isApproved
                            ? 'bg-[#EDF2E8] text-[#283618] border-[#D5E0CC]'
                            : isDisputed
                            ? 'bg-[#F8EAE7] text-[#8C3A2C] border-[#E8C2BB]'
                            : 'bg-[#FAF4E6] text-[#8C6D23] border-[#E8DAB7]'
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : isDisputed ? (
                          <XCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {entry.audit_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-[#4A4E44]">
                      <span className="text-[11px] font-mono-luxury px-2 py-0.5 rounded bg-[#FAF7F2] text-[#283618] border border-[#E6DFD3] font-semibold">
                        {entry.action_taken}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
