export type AuditStatus = 'APPROVED' | 'DISPUTED' | 'REQUIRES_HUMAN_OVERRIDE';
export type ActionTaken = 'PAYMENT_APPROVED' | 'DISPUTE_SENT' | 'ESCALATED_TO_HUMAN';
export type LineCategory = 'BASE_FREIGHT' | 'FUEL_SURCHARGE' | 'DETENTION' | 'LUMPER' | 'OTHER';

export interface LineItemAudit {
  category: LineCategory;
  invoiced_amount: number;
  contract_allowed_amount: number;
  discrepancy: number;
  finding: string;
}

export interface AuditReportSchema {
  shipment_id: string | null;
  invoice_number: string;
  audit_status: AuditStatus;
  internal_reasoning: string;
  total_invoiced: number;
  total_contracted_allowed: number;
  discrepancy_amount: number;
  line_item_audits: LineItemAudit[];
  missing_or_error_fields: string[];
  action_taken: ActionTaken;
}

export interface InvoiceDetails {
  base_freight: number;
  fuel_surcharge: number;
  detention_charge?: number;
  lumper_fee?: number;
  stop_off?: number;
  reconsignment?: number;
  total_invoiced: number;
}

export interface FreightInvoice {
  shipment_id?: string;
  invoice_number: string;
  carrier_name: string;
  carrier_email: string;
  invoice_date: string;
  origin: string;
  destination: string;
  weight_lbs?: number;
  invoice_details: InvoiceDetails;
  notes?: string;
}

export interface TMSRateSheet {
  status: 'SUCCESS' | 'RECORD_NOT_FOUND';
  shipment_id: string;
  carrier_name?: string;
  origin?: string;
  destination?: string;
  contract_rate: number;
  fsc_index: number; // e.g. 0.16 = 16% of base_freight
  free_time_hours: number;
  detention_hourly_rate: number;
  lumper_pre_approved: boolean;
  message?: string;
}

export interface WMSProofOfDelivery {
  status: 'SUCCESS' | 'RECORD_NOT_FOUND';
  shipment_id: string;
  gate_in?: string;
  gate_out?: string;
  dwell_minutes?: number;
  consignee_name?: string;
  delivery_address?: string;
  signed_by?: string;
  signature_timestamp?: string;
  lumper_receipt_attached?: boolean;
  lumper_receipt_number?: string | null;
  lumper_receipt_amount?: number | null;
  driver_notes?: string;
  message?: string;
}

export interface MCPLogStep {
  id: string;
  timestamp: string;
  type: 'TOOL_CALL' | 'TOOL_RESULT' | 'REASONING' | 'DECISION' | 'ERROR';
  toolName?: string;
  payload?: any;
  message: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  invoice_number: string;
  shipment_id: string | null;
  carrier_name: string;
  carrier_email: string;
  audit_status: AuditStatus;
  total_invoiced: number;
  total_contracted_allowed: number;
  discrepancy_amount: number;
  action_taken: ActionTaken;
  action_result: any;
  internal_reasoning: string;
  immutable_hash: string;
  report: AuditReportSchema;
}
