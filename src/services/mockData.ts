import { FreightInvoice, TMSRateSheet, WMSProofOfDelivery } from '../types/audit';

export const TMS_RATE_DATABASE: Record<string, TMSRateSheet> = {
  'SHP-88291': {
    status: 'SUCCESS',
    shipment_id: 'SHP-88291',
    carrier_name: 'Apex Logistics Corp',
    origin: 'Chicago, IL (ORD Hub)',
    destination: 'Dallas, TX (DFW Central)',
    contract_rate: 1850.0,
    fsc_index: 0.16, // 16% = $296.00
    free_time_hours: 2.0,
    detention_hourly_rate: 100.0,
    lumper_pre_approved: false,
  },
  'SHP-99001': {
    status: 'SUCCESS',
    shipment_id: 'SHP-99001',
    carrier_name: 'Titan Freight Express',
    origin: 'Atlanta, GA (ATL Crossdock)',
    destination: 'Orlando, FL (MCO Distribution)',
    contract_rate: 1200.0,
    fsc_index: 0.15, // 15% = $180.00
    free_time_hours: 2.0,
    detention_hourly_rate: 75.0,
    lumper_pre_approved: true,
  },
  'SHP-77402': {
    status: 'SUCCESS',
    shipment_id: 'SHP-77402',
    carrier_name: 'Patriot Hauling LLC',
    origin: 'Columbus, OH',
    destination: 'Charlotte, NC',
    contract_rate: 2000.0,
    fsc_index: 0.16, // Contract DOE FSC is 16% ($320), but carrier billed 22% ($440)
    free_time_hours: 2.0,
    detention_hourly_rate: 90.0,
    lumper_pre_approved: false,
  },
  'SHP-55120': {
    status: 'SUCCESS',
    shipment_id: 'SHP-55120',
    carrier_name: 'Swiftline Intermodal',
    origin: 'Los Angeles, CA (Port of LA)',
    destination: 'Phoenix, AZ',
    contract_rate: 1450.0,
    fsc_index: 0.18, // 18% = $261.00
    free_time_hours: 2.0,
    detention_hourly_rate: 85.0,
    lumper_pre_approved: true,
  },
};

export const WMS_POD_DATABASE: Record<string, WMSProofOfDelivery> = {
  'SHP-88291': {
    status: 'SUCCESS',
    shipment_id: 'SHP-88291',
    gate_in: '2026-10-15T08:15:00Z',
    gate_out: '2026-10-15T10:00:00Z',
    dwell_minutes: 105, // 1.75 hours (Under 2.0h free time -> 0 billable hours)
    consignee_name: 'DFW Logistics Center Dock #14',
    delivery_address: '4200 Logistics Pkwy, Dallas, TX 75261',
    signed_by: 'Marcus Vance (Receiving Lead)',
    signature_timestamp: '2026-10-15T10:02:18Z',
    lumper_receipt_attached: false,
    lumper_receipt_number: null,
    lumper_receipt_amount: null,
    driver_notes: 'Standard dock unload by receiver team. No lumper service utilized. Zero detention observed.',
  },
  'SHP-99001': {
    status: 'SUCCESS',
    shipment_id: 'SHP-99001',
    gate_in: '2026-10-15T06:00:00Z',
    gate_out: '2026-10-15T07:30:00Z',
    dwell_minutes: 90, // 1.5 hours -> $0 detention
    consignee_name: 'Orlando Cold Storage DC-3',
    delivery_address: '8801 Tradeport Dr, Orlando, FL 32827',
    signed_by: 'Elena Rostova (Warehouse Supervisor)',
    signature_timestamp: '2026-10-15T07:32:45Z',
    lumper_receipt_attached: true,
    lumper_receipt_number: 'LMP-44210',
    lumper_receipt_amount: 120.0,
    driver_notes: 'Third-party lumper service contracted by receiver. Stamped receipt #LMP-44210 attached for $120.00.',
  },
  'SHP-77402': {
    status: 'SUCCESS',
    shipment_id: 'SHP-77402',
    gate_in: '2026-10-14T11:00:00Z',
    gate_out: '2026-10-14T12:45:00Z',
    dwell_minutes: 105,
    consignee_name: 'Carolinas Retail Fulfillment #8',
    delivery_address: '1500 Distribution Way, Charlotte, NC 28269',
    signed_by: 'Derrick Hall',
    signature_timestamp: '2026-10-14T12:50:00Z',
    lumper_receipt_attached: false,
    lumper_receipt_number: null,
    driver_notes: 'Clean delivery. No delays.',
  },
  'SHP-55120': {
    status: 'SUCCESS',
    shipment_id: 'SHP-55120',
    gate_in: '2026-10-13T13:00:00Z',
    gate_out: '2026-10-13T16:30:00Z',
    dwell_minutes: 210, // 3.5 hours. Free time = 2.0h. Billable = 1.5 hours @ $85/hr = $127.50. Carrier billed $350.00!
    consignee_name: 'Southwest Freight Terminal Dock 4',
    delivery_address: '2900 S 19th Ave, Phoenix, AZ 85009',
    signed_by: 'Rachel Green',
    signature_timestamp: '2026-10-13T16:35:00Z',
    lumper_receipt_attached: false,
    driver_notes: 'Dock congestion delay. Gate-in 13:00, departure 16:30.',
  },
};

export const PRESET_SCENARIOS: {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  invoice: FreightInvoice;
}[] = [
  {
    id: 'scenario-1-disputed',
    title: 'Scenario 1: Disputed Invoice (SHP-88291)',
    description: 'Unauthorized detention ($250, dwell was only 105m vs 2hr free time) & unverified lumper fee ($150, no receipt attached).',
    badge: 'Disputed ($400 Overcharge)',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    invoice: {
      shipment_id: 'SHP-88291',
      invoice_number: 'INV-109282',
      carrier_name: 'Apex Logistics Corp',
      carrier_email: 'billing@apexlogistics.com',
      invoice_date: '2026-10-16',
      origin: 'Chicago, IL (ORD Hub)',
      destination: 'Dallas, TX (DFW Central)',
      weight_lbs: 42500,
      invoice_details: {
        base_freight: 1850.0,
        fuel_surcharge: 296.0,
        detention_charge: 250.0,
        lumper_fee: 150.0,
        total_invoiced: 2546.0,
      },
      notes: 'Standard TL delivery. Accessorials applied for warehouse delay and dock hand-off.',
    },
  },
  {
    id: 'scenario-2-approved',
    title: 'Scenario 2: Clean 3-Way Match (SHP-99001)',
    description: 'Exact match on Base ($1200), FSC 15% ($180), and verified stamped lumper receipt LMP-44210 ($120). Zero discrepancy.',
    badge: 'Approved ($0.00 Variance)',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    invoice: {
      shipment_id: 'SHP-99001',
      invoice_number: 'INV-993041',
      carrier_name: 'Titan Freight Express',
      carrier_email: 'ap-billing@titanfreight.com',
      invoice_date: '2026-10-15',
      origin: 'Atlanta, GA (ATL Crossdock)',
      destination: 'Orlando, FL (MCO Distribution)',
      weight_lbs: 38200,
      invoice_details: {
        base_freight: 1200.0,
        fuel_surcharge: 180.0,
        lumper_fee: 120.0,
        total_invoiced: 1500.0,
      },
      notes: 'Direct refrigerated load. Attached lumper receipt LMP-44210 stamped by receiving supervisor.',
    },
  },
  {
    id: 'scenario-3-fsc-mismatch',
    title: 'Scenario 3: Fuel Surcharge Index Mismatch (SHP-77402)',
    description: 'Carrier billed 22% FSC ($440) instead of contracted DOE fuel scale of 16% ($320). Overcharge of $120.00.',
    badge: 'Disputed ($120 FSC Mismatch)',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    invoice: {
      shipment_id: 'SHP-77402',
      invoice_number: 'INV-774099',
      carrier_name: 'Patriot Hauling LLC',
      carrier_email: 'settlements@patriothauling.com',
      invoice_date: '2026-10-15',
      origin: 'Columbus, OH',
      destination: 'Charlotte, NC',
      weight_lbs: 41000,
      invoice_details: {
        base_freight: 2000.0,
        fuel_surcharge: 440.0, // Should be 16% = $320
        total_invoiced: 2440.0,
      },
      notes: 'Carrier surcharged based on regional spot diesel rate instead of contracted weekly DOE peg.',
    },
  },
  {
    id: 'scenario-4-missing-id',
    title: 'Scenario 4: Missing Required Parameter (No shipment_id)',
    description: 'Carrier invoice omitted the mandatory shipment_id reference. Must halt and escalate to Human Override.',
    badge: 'Human Override (Missing Field)',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    invoice: {
      shipment_id: '',
      invoice_number: 'INV-MISSING-01',
      carrier_name: 'Vanguard Trans Logistics',
      carrier_email: 'claims@vanguardtrans.com',
      invoice_date: '2026-10-16',
      origin: 'Memphis, TN',
      destination: 'Nashville, TN',
      weight_lbs: 26000,
      invoice_details: {
        base_freight: 950.0,
        fuel_surcharge: 142.5,
        total_invoiced: 1092.5,
      },
      notes: 'Invoice received via automated EDI parse without reference BOL / shipment_id.',
    },
  },
  {
    id: 'scenario-5-record-not-found',
    title: 'Scenario 5: MCP Record Not Found (SHP-40404)',
    description: 'TMS or WMS returns RECORD_NOT_FOUND. Engine refuses to assume $0.00 and escalates for document re-upload.',
    badge: 'Human Override (MCP 404)',
    badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    invoice: {
      shipment_id: 'SHP-40404',
      invoice_number: 'INV-404049',
      carrier_name: 'Unknown Fleet Carriers',
      carrier_email: 'invoicing@unknownfleet.com',
      invoice_date: '2026-10-16',
      origin: 'Denver, CO',
      destination: 'Salt Lake City, UT',
      weight_lbs: 35000,
      invoice_details: {
        base_freight: 2100.0,
        fuel_surcharge: 315.0,
        total_invoiced: 2415.0,
      },
      notes: 'Load dispatched on broker spot board without pre-synced TMS rate sheet.',
    },
  },
  {
    id: 'scenario-6-excess-detention',
    title: 'Scenario 6: Partial Detention Allowed vs Inflated (SHP-55120)',
    description: 'Carrier billed 4 hours ($350). WMS timestamps show 3.5h dwell - 2h free = 1.5h billable @ $85 = $127.50. Discrepancy: $222.50.',
    badge: 'Disputed ($222.50 Detention Delta)',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    invoice: {
      shipment_id: 'SHP-55120',
      invoice_number: 'INV-551208',
      carrier_name: 'Swiftline Intermodal',
      carrier_email: 'accounting@swiftline.com',
      invoice_date: '2026-10-14',
      origin: 'Los Angeles, CA (Port of LA)',
      destination: 'Phoenix, AZ',
      weight_lbs: 44000,
      invoice_details: {
        base_freight: 1450.0,
        fuel_surcharge: 261.0,
        detention_charge: 350.0, // Allowed is $127.50
        total_invoiced: 2061.0,
      },
      notes: 'Port delay claimed by driver. 4 hours invoiced at $87.50/hr flat.',
    },
  },
];
