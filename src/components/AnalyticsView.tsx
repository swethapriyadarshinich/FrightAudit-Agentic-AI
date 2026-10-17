import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  DollarSign, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  PieChart as PieIcon,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { AuditLogEntry } from '../types/audit';

interface AnalyticsViewProps {
  ledgerEntries: AuditLogEntry[];
}

// Comprehensive carrier time-series discrepancy trends
const HISTORICAL_CARRIER_TRENDS = [
  { period: 'W1 Sep', 'Apex Logistics': 450, 'Titan Freight': 0, 'Patriot Hauling': 180, 'Swiftline': 120, totalDisputed: 750, recoveredRevenue: 750 },
  { period: 'W2 Sep', 'Apex Logistics': 820, 'Titan Freight': 50, 'Patriot Hauling': 220, 'Swiftline': 340, totalDisputed: 1430, recoveredRevenue: 1380 },
  { period: 'W3 Sep', 'Apex Logistics': 390, 'Titan Freight': 0, 'Patriot Hauling': 310, 'Swiftline': 210, totalDisputed: 910, recoveredRevenue: 910 },
  { period: 'W4 Sep', 'Apex Logistics': 980, 'Titan Freight': 0, 'Patriot Hauling': 140, 'Swiftline': 480, totalDisputed: 1600, recoveredRevenue: 1520 },
  { period: 'W1 Oct', 'Apex Logistics': 620, 'Titan Freight': 0, 'Patriot Hauling': 290, 'Swiftline': 260, totalDisputed: 1170, recoveredRevenue: 1170 },
  { period: 'W2 Oct', 'Apex Logistics': 1140, 'Titan Freight': 80, 'Patriot Hauling': 410, 'Swiftline': 390, totalDisputed: 2020, recoveredRevenue: 1940 },
  { period: 'W3 Oct', 'Apex Logistics': 400, 'Titan Freight': 0, 'Patriot Hauling': 120, 'Swiftline': 222, totalDisputed: 742, recoveredRevenue: 742 },
];

// Carrier breakdown: Disputed vs Recovered Revenue
const CARRIER_COMPARISON_DATA = [
  {
    carrier: 'Apex Logistics Corp',
    shortName: 'Apex',
    totalInvoiced: 48200,
    disputedAmount: 4800,
    recoveredRevenue: 4650,
    recoveryRate: 96.8,
    discrepancyCount: 14,
    complianceScore: '74%',
    primaryViolation: 'Detention & Lumper',
  },
  {
    carrier: 'Swiftline Intermodal',
    shortName: 'Swiftline',
    totalInvoiced: 36400,
    disputedAmount: 2022,
    recoveredRevenue: 1980,
    recoveryRate: 97.9,
    discrepancyCount: 8,
    complianceScore: '88%',
    primaryViolation: 'Excess Detention Hours',
  },
  {
    carrier: 'Patriot Hauling LLC',
    shortName: 'Patriot',
    totalInvoiced: 29800,
    disputedAmount: 1670,
    recoveredRevenue: 1670,
    recoveryRate: 100.0,
    discrepancyCount: 9,
    complianceScore: '86%',
    primaryViolation: 'FSC DOE Scale Index',
  },
  {
    carrier: 'Titan Freight Express',
    shortName: 'Titan',
    totalInvoiced: 52100,
    disputedAmount: 130,
    recoveredRevenue: 130,
    recoveryRate: 100.0,
    discrepancyCount: 1,
    complianceScore: '98%',
    primaryViolation: 'Minor Accessorial Tag',
  },
  {
    carrier: 'Vanguard Trans Logistics',
    shortName: 'Vanguard',
    totalInvoiced: 18400,
    disputedAmount: 950,
    recoveredRevenue: 950,
    recoveryRate: 100.0,
    discrepancyCount: 3,
    complianceScore: '82%',
    primaryViolation: 'Missing Shipment Ref',
  },
];

// Discrepancy by Category
const CATEGORY_DISCREPANCIES = [
  { name: 'Unauthorized Detention', value: 4120, color: '#3A4A28' }, // Deep Olive
  { name: 'Fuel Surcharge (DOE Delta)', value: 2450, color: '#606C38' }, // Olive Sage
  { name: 'Unverified Lumper Fees', value: 2100, color: '#8A9A5B' }, // Laurel Green
  { name: 'Base Rate Variance', value: 902, color: '#B5A886' }, // Warm Taupe
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ ledgerEntries }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30D' | '90D' | 'YTD'>('30D');
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL');

  // Dynamic values combining historical + current live session ledger
  const sessionDisputed = ledgerEntries.reduce((acc, curr) => acc + (curr.discrepancy_amount || 0), 0);
  const totalDisputedAllTime = 9572 + sessionDisputed;
  const totalRecoveredAllTime = 9380 + sessionDisputed;
  const recoveryEfficiency = ((totalRecoveredAllTime / totalDisputedAllTime) * 100).toFixed(1);

  // Custom luxury tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FAF7F2] border border-[#DCD2C2] p-3 rounded-lg shadow-lg font-sans text-xs">
          <p className="font-serif-luxury font-bold text-sm text-[#283618] mb-1.5 pb-1 border-b border-[#E6DFD3]">
            {label}
          </p>
          <div className="space-y-1 font-mono-luxury">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <span className="flex items-center space-x-1.5 text-[#5A5E54]">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-semibold text-[#1F221B]">
                  ${Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Luxury Minimal Header */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#3A4A28] border border-[#DCD2C2]">
                Executive Intelligence
              </span>
              <span className="text-xs text-[#767A6F] font-mono-luxury">Recharts Engine v2.15</span>
            </div>
            <h2 className="text-2xl font-serif-luxury font-bold text-[#1F221B] mt-1 tracking-tight">
              Carrier Discrepancy & Revenue Recovery Analytics
            </h2>
            <p className="text-xs text-[#5A5E54] mt-0.5 font-sans">
              Continuous monitoring of freight billing variance patterns, contractual leakage, and financial capital preservation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-[#F0EAE1] p-0.5 rounded-lg border border-[#DCD2C2] flex text-xs font-medium">
              {(['30D', '90D', 'YTD'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-[#3A4A28] text-white shadow-xs font-semibold'
                      : 'text-[#696C64] hover:text-[#1F221B]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 KPI Hero Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-[#E6DFD3]">
          <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#767A6F] block">
              Total Intercepted Discrepancies
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-serif-luxury font-bold text-[#8C3A2C]">
                ${totalDisputedAllTime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] font-mono-luxury px-1.5 py-0.5 rounded bg-[#F8EAE7] text-[#8C3A2C] font-semibold">
                +14.2% YoY
              </span>
            </div>
            <span className="text-[11px] text-[#767A6F] mt-1 block">
              Across 36 total audited shipments
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#767A6F] block">
              Recovered & Preserved Revenue
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-serif-luxury font-bold text-[#283618]">
                ${totalRecoveredAllTime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] font-mono-luxury px-1.5 py-0.5 rounded bg-[#EDF2E8] text-[#283618] font-semibold">
                Active Recovery
              </span>
            </div>
            <span className="text-[11px] text-[#767A6F] mt-1 block">
              Disputed overcharges withheld or credited
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#767A6F] block">
              Autonomous Recovery Rate
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-serif-luxury font-bold text-[#3A4A28]">
                {recoveryEfficiency}%
              </span>
              <span className="text-[11px] font-mono-luxury px-1.5 py-0.5 rounded bg-[#EDF2E8] text-[#3A4A28] font-semibold">
                Strict 3-Way Proof
              </span>
            </div>
            <span className="text-[11px] text-[#767A6F] mt-1 block">
              Verified against signed POD gate stamps
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#E6DFD3] shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#767A6F] block">
              Avg Dispute Resolution Time
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-serif-luxury font-bold text-[#1F221B]">
                &lt; 1.8 mins
              </span>
              <span className="text-[11px] font-mono-luxury px-1.5 py-0.5 rounded bg-[#F0EAE1] text-[#4A4E44] font-semibold">
                Autonomous
              </span>
            </div>
            <span className="text-[11px] text-[#767A6F] mt-1 block">
              Down from 14.5 days manual review
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Discrepancy Trends Over Time by Carrier */}
        <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6DFD3]">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#3A4A28]" />
                <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">
                  Carrier Discrepancy Trends Over Time
                </h3>
              </div>
              <p className="text-xs text-[#5A5E54]">
                Weekly dollar overcharge trajectory across key transport providers
              </p>
            </div>
            <span className="text-[11px] font-mono-luxury px-2 py-0.5 rounded bg-[#F0EAE1] text-[#3A4A28] font-medium border border-[#DCD2C2]">
              Weekly Velocity
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_CARRIER_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="apexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C3A2C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8C3A2C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="swiftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A4A28" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3A4A28" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="patriotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8A9A5B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8A9A5B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD3" vertical={false} />
                <XAxis 
                  dataKey="period" 
                  stroke="#767A6F" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#DCD2C2' }} 
                />
                <YAxis 
                  stroke="#767A6F" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="Apex Logistics" 
                  stroke="#8C3A2C" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#apexGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Swiftline" 
                  stroke="#3A4A28" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#swiftGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Patriot Hauling" 
                  stroke="#8A9A5B" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#patriotGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Total Disputed Amounts vs Recovered Revenue */}
        <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6DFD3]">
            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-[#3A4A28]" />
                <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">
                  Disputed vs Recovered Revenue
                </h3>
              </div>
              <p className="text-xs text-[#5A5E54]">
                Total billed overcharges vs audited capital successfully recovered
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CARRIER_COMPARISON_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD3" vertical={false} />
                <XAxis 
                  dataKey="shortName" 
                  stroke="#767A6F" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#DCD2C2' }} 
                />
                <YAxis 
                  stroke="#767A6F" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  iconType="square"
                />
                <Bar 
                  dataKey="disputedAmount" 
                  name="Total Disputed" 
                  fill="#8C3A2C" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="recoveredRevenue" 
                  name="Recovered Revenue" 
                  fill="#3A4A28" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Secondary Row: Discrepancy by Category & Carrier Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-4 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6DFD3]">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-[#3A4A28]" />
              <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">
                Accessorial Discrepancy Mix
              </h3>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISCREPANCIES}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DISCREPANCIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend items */}
          <div className="space-y-1.5 mt-2 font-sans text-xs">
            {CATEGORY_DISCREPANCIES.map((cat, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-[#EFE9DF] last:border-none">
                <span className="flex items-center space-x-2 text-[#5A5E54]">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </span>
                <span className="font-mono-luxury font-bold text-[#1F221B]">
                  ${cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Carrier Risk & Audit Scorecard Table */}
        <div className="lg:col-span-8 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-5 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6DFD3]">
            <div>
              <h3 className="text-base font-serif-luxury font-bold text-[#1F221B]">
                Carrier Performance & Discrepancy Scorecard
              </h3>
              <p className="text-xs text-[#5A5E54]">
                Audited freight invoice variance rankings and recovery enforcement status
              </p>
            </div>
            <span className="text-xs text-[#767A6F] font-mono-luxury">
              5 Primary Carriers Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F0EAE1] text-[#5A5E54] uppercase font-mono-luxury text-[10px] border-b border-[#DCD2C2]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Carrier Entity</th>
                  <th className="py-2.5 px-3 font-semibold">Audited Spend</th>
                  <th className="py-2.5 px-3 font-semibold text-[#8C3A2C]">Disputed Overcharges</th>
                  <th className="py-2.5 px-3 font-semibold text-[#3A4A28]">Recovered Revenue</th>
                  <th className="py-2.5 px-3 font-semibold">Recovery Rate</th>
                  <th className="py-2.5 px-3 font-semibold">Primary Variance Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD3] font-mono-luxury text-xs">
                {CARRIER_COMPARISON_DATA.map((c, i) => (
                  <tr key={i} className="hover:bg-white/80 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-[#1F221B]">
                      {c.carrier}
                    </td>
                    <td className="py-3 px-3 text-[#4A4E44]">
                      ${c.totalInvoiced.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#8C3A2C]">
                      ${c.disputedAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#3A4A28]">
                      ${c.recoveredRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF2E8] text-[#283618] border border-[#D5E0CC]">
                        {c.recoveryRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-[#5A5E54]">
                      {c.primaryViolation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
