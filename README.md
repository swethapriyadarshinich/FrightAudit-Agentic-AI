# FreightAudit AI — Autonomous Freight Bill Audit & Dispute Resolution Engine

> **Live Preview Application**: [https://ai.studio/apps/a56886e1-3b5a-4776-99e8-766f0bac1100](https://ai.studio/apps/a56886e1-3b5a-4776-99e8-766f0bac1100)  
> **Agent Execution Guide**: [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md)

**FreightAudit AI** is an enterprise-grade, autonomous freight invoice audit and dispute resolution platform. It executes deterministic 3-way matching across carrier freight invoices, Transportation Management System (TMS) contract rate sheets, and Warehouse Management System (WMS) signed Proof of Delivery (POD) documents.

Powered by a real-time event-driven agent pipeline with standard Model Context Protocol (MCP) tool integration, the engine intercepts unauthorized accessorial overcharges (unauthorized dwell detention, unverified lumper fees, fuel surcharge index mismatches, and re-consignment anomalies), calculates exact financial discrepancies, and autonomously executes downstream ERP payment authorizations or carrier dispute dispatches.

---

## Table of Contents

- [1. Executive Summary & Problem Context](#1-executive-summary--problem-context)
- [2. End-to-End Agentic Architecture Flow](#2-end-to-end-agentic-architecture-flow)
- [3. 3-Way Match Verification Matrix](#3-3-way-match-verification-matrix)
- [4. MCP Tool Calling & Schema Specifications](#4-mcp-tool-calling--schema-specifications)
- [5. Platform Features & User Experience](#5-platform-features--user-experience)
  - [Real-Time Agentic DAG Controller](#real-time-agentic-dag-controller)
  - [3-Way Document Match Inspector](#3-way-document-match-inspector)
  - [Carrier Analytics & Recovery Trends (Recharts)](#carrier-analytics--recovery-trends-recharts)
  - [Immutable Cryptographic Audit Ledger](#immutable-cryptographic-audit-ledger)
  - [Interactive TMS / WMS Reference Databases](#interactive-tms--wms-reference-databases)
- [6. Verification & Edge-Case Scenarios](#6-verification--edge-case-scenarios)
- [7. Design System & Aesthetic Constitutional Guidelines](#7-design-system--aesthetic-constitutional-guidelines)
- [8. Technology Stack](#8-technology-stack)
- [9. Local Setup & Build Instructions](#9-local-setup--build-instructions)

---

## 1. Executive Summary & Problem Context

In global logistics and supply chain networks, **8% to 15% of all freight billing invoices contain unauthorized accessorial overcharges**. Enterprise finance teams processing hundreds of bills per day under 30-day payment terms frequently lack the hours required to cross-reference dock logs, gate GPS timestamps, and contracted rate schedules. Consequently, millions of dollars in unverified charges are routinely rubber-stamped.

```
       [ Carrier Freight Bill ]  ──────┐
                                       │
     [ TMS Contract Rate Sheet ] ──────┼──► [ Autonomous 3-Way Engine ] ──► [ ERP Payment ] OR [ Dispute Notice ]
                                       │
      [ Signed WMS POD / Dwell ] ──────┘
```

**FreightAudit AI** solves this systemic leakage by automating forensic freight adjudication:
- **Zero Hallucination Tolerance**: 100% deterministic mathematical verification against contractual rate caps and GPS gate logs.
- **Cycle Time Reduction**: Crushes resolution time from **14 days** of manual email disputes down to **< 2 minutes** of autonomous adjudication.
- **Strict Guardrails**: Enforces concise internal reasoning strictly under **40 words** with verifiable mathematical proofs.
- **Audit Compliance**: Produces an immutable, cryptographically hashed audit ledger with complete audit trails.

---

## 2. End-to-End Agentic Architecture Flow

The engine operates on an event-driven Directed Acyclic Graph (DAG) state machine consisting of 5 synchronized stages:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 REAL-TIME AGENTIC FLOW                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [Stage 01: Ingestion & Schema Extraction]
         │
         ├── Parses Billed Base, Fuel Surcharge (FSC), Detention claim, Lumper claim
         └── Validates mandatory shipment_id parameter (halts if missing)
         │
         ▼
 [Stage 02: Parallel MCP Document Gateway]
         │
         ├── Concurrent Call: get_rate_sheet(shipment_id)  ──► [TMS Database]
         └── Concurrent Call: get_signed_pod(shipment_id)   ──► [WMS Gate System]
         │
         ▼
 [Stage 03: 3-Way Match Verification Core]
         │
         ├── Clause 1: Base Freight vs Contract Base
         ├── Clause 2: Billed FSC vs Contract DOE Formula (base * fsc_index)
         ├── Clause 3: Detention Hours vs Dwell Time (dwell - 2.0h free-time)
         └── Clause 4: Lumper Fee vs Verified Stamped POD Receipt Reference
         │
         ▼
 [Stage 04: Financial Delta & Guardrail Synthesis]
         │
         ├── Discrepancy Amount = Total Invoiced - Total Contract Allowed
         └── Synthesizes rationale (strictly < 40 words guardrail verified)
         │
         ▼
 [Stage 05: Autonomous Action Execution]
         │
         ├── Discrepancy == $0.00 ──► approve_invoice_payment()  ──► [SAP S/4HANA ERP]
         ├── Discrepancy >  $0.00 ──► submit_dispute_email()     ──► [Carrier Mail Gateway]
         └── Missing / 404        ──► Escalate to Human Override  ──► [Audit Exception Desk]
```

---

## 3. 3-Way Match Verification Matrix

| Audit Dimension | Carrier Invoice Parameter | Contract Truth (TMS) | Operational Ground Truth (WMS) | Adjudication Logic & Formula |
| :--- | :--- | :--- | :--- | :--- |
| **Base Freight** | `invoice_details.base_freight` | `contract_rate` | Bill of Lading lane confirmation | `discrepancy = base_freight - contract_rate` |
| **Fuel Surcharge** | `invoice_details.fuel_surcharge` | `fsc_index` (e.g., 16%) | EIA/DOE weekly diesel index | `allowed_fsc = contract_rate * fsc_index`<br>`discrepancy = billed_fsc - allowed_fsc` |
| **Detention** | `invoice_details.detention_charge` | `free_time_hours` (e.g. 2.0h)<br>`detention_hourly_rate` | `gate_in` & `gate_out` timestamps<br>`dwell_minutes = gate_out - gate_in` | `dwell_hours = dwell_minutes / 60`<br>If `dwell_hours <= free_time`: `$0.00` allowed<br>Else: `(dwell_hours - free_time) * hourly_rate` |
| **Lumper Fee** | `invoice_details.lumper_fee` | `lumper_pre_approved` flag | `lumper_receipt_attached`<br>`lumper_receipt_number` | If receipt is attached and referenced: allowed<br>Else: `$0.00` allowed (unauthorized fee) |
| **Ancillary Fees** | Stop-off, Reconsignment | Pre-authorized dispatch riders | Driver delivery notes | Default `$0.00` unless authorized rider attached |

---

## 4. MCP Tool Calling & Schema Specifications

The system utilizes standard Model Context Protocol (MCP) tool callbacks for external integrations:

### 1. `get_rate_sheet`
```typescript
get_rate_sheet(shipment_id: string): TMSRateSheet
```
- **Description**: Fetches agreed base rates, fuel matrix, and allowed accessorial caps from TMS.
- **Response**:
```json
{
  "status": "SUCCESS",
  "shipment_id": "SHP-88291",
  "contract_rate": 1850.00,
  "fsc_index": 0.16,
  "free_time_hours": 2.0,
  "detention_hourly_rate": 100.00,
  "lumper_pre_approved": false
}
```

### 2. `get_signed_pod`
```typescript
get_signed_pod(shipment_id: string): WMSProofOfDelivery
```
- **Description**: Fetches driver arrival/departure timestamps and stamped driver notes from WMS.
- **Response**:
```json
{
  "status": "SUCCESS",
  "shipment_id": "SHP-88291",
  "gate_in": "2026-10-15T08:15:00Z",
  "gate_out": "2026-10-15T10:00:00Z",
  "dwell_minutes": 105,
  "lumper_receipt_attached": false,
  "lumper_receipt_number": null
}
```

### 3. `submit_dispute_email`
```typescript
submit_dispute_email(
  invoice_number: string,
  carrier_email: string,
  carrier_name: string,
  disputed_amount: number,
  findings: LineItemAudit[]
): DisputeDispatchResult
```
- **Description**: Dispatches an itemized dispute notification directly to the carrier's billing gateway citing exact contract clauses and gate timestamps.

### 4. `approve_invoice_payment`
```typescript
approve_invoice_payment(
  invoice_number: string,
  approved_amount: number
): PaymentApprovalResult
```
- **Description**: Authorizes immediate electronic disbursement in SAP S/4HANA Accounts Payable batch for clean freight bills with zero discrepancy.

### Strict Output Schema (`AuditReportSchema`)
```typescript
interface AuditReportSchema {
  shipment_id: string | null;
  invoice_number: string;
  audit_status: "APPROVED" | "DISPUTED" | "REQUIRES_HUMAN_OVERRIDE";
  internal_reasoning: string; // Strictly <= 40 words
  total_invoiced: number;
  total_contracted_allowed: number;
  discrepancy_amount: number;
  line_item_audits: LineItemAudit[];
  missing_or_error_fields: string[];
  action_taken: "PAYMENT_APPROVED" | "DISPUTE_SENT" | "ESCALATED_TO_HUMAN";
}
```

---

## 5. Platform Features & User Experience

### Real-Time Agentic DAG Controller
- **Interactive Execution Controls**: Features **Play**, **Pause**, **Single-Step**, and **Replay** controls.
- **Speed Tuner**: Switch between `0.5x` (slow forensic inspection), `1x` (real-time stream), `2x` (accelerated), or `Max` (instant).
- **Node Telemetry Drawer**: Click any node in the pipeline to inspect raw JSON payloads, live latency measurements, and internal log events.

### 3-Way Document Match Inspector
- **Split-View Comparison**: Side-by-side inspection of the **Carrier Freight Invoice**, **TMS Agreed Rate Sheet**, and **Signed Warehouse Proof of Delivery (POD)**.
- **Visual Evidence Callouts**: Highlights GPS gate dwell calculators, driver signature stamps, and attached lumper receipts with pass/fail badges.

### Carrier Analytics & Recovery Trends (Recharts)
- **Carrier Discrepancy Trends Over Time**: Multi-series area chart tracking weekly dollar variance trajectories across carriers (*Apex Logistics*, *Swiftline Intermodal*, *Patriot Hauling*, *Titan Freight*).
- **Total Disputed vs. Recovered Revenue**: Comparative bar chart evaluating intercepted freight overcharges against successfully recovered/withheld revenue.
- **Accessorial Discrepancy Mix**: Donut chart detailing overcharge distribution across Detention, FSC Delta, Unverified Lumper, and Base Rate variances.
- **Carrier Compliance Scorecard**: Tracks total spend, dispute volume, recovery percentages (96.8%–100%), and primary contractual violation root causes.

### Immutable Cryptographic Audit Ledger
- **Tamper-Evident Hashing**: Every adjudicated invoice generates a cryptographic ledger hash (e.g., `0x7B29F4C1`).
- **ISO-8601 Timestamping**: Complete auditability with carrier, shipment ID, invoice number, status, and discrepancy metrics.
- **Compliance Export**: One-click export to CSV and JSON formats for internal and external auditors.

### Interactive TMS / WMS Reference Databases
- Real-time modal to inspect, modify, or add custom contract rates and warehouse POD records to test edge cases on the fly.

---

## 6. Verification & Edge-Case Scenarios

The engine includes 6 pre-configured operational test scenarios:

1. **Scenario 1: Disputed Invoice (`SHP-88291`)** *(Apex Logistics Corp)*
   - **Billed**: $2,546.00 | **Allowed**: $2,146.00 | **Discrepancy**: $400.00
   - **Root Cause**: Unauthorized detention ($250, dwell was 105 mins vs 2.0h free time) & unverified lumper fee ($150, no receipt attached).
   - **Action**: Dispatches carrier dispute email citing dock logs and contract clause.

2. **Scenario 2: Clean 3-Way Match (`SHP-99001`)** *(Titan Freight Express)*
   - **Billed**: $1,500.00 | **Allowed**: $1,500.00 | **Discrepancy**: $0.00
   - **Root Cause**: Base rate $1,200.00, FSC 15% ($180.00), and valid stamped lumper receipt `#LMP-44210` ($120.00).
   - **Action**: Authorizes payment directly into ERP Accounts Payable batch.

3. **Scenario 3: Fuel Surcharge Index Mismatch (`SHP-77402`)** *(Patriot Hauling LLC)*
   - **Billed**: $2,440.00 | **Allowed**: $2,320.00 | **Discrepancy**: $120.00
   - **Root Cause**: Carrier billed 22% FSC ($440.00) instead of contracted DOE fuel scale of 16% ($320.00).
   - **Action**: Dispatches FSC adjustment dispute notice.

4. **Scenario 4: Missing Required Parameter** *(Vanguard Trans)*
   - **Billed**: $1,092.50 | **Status**: `REQUIRES_HUMAN_OVERRIDE`
   - **Root Cause**: Carrier invoice omitted mandatory `shipment_id`.
   - **Action**: Halts autonomous execution, flags missing fields, routes to Human Auditor desk.

5. **Scenario 5: MCP Record Not Found (`SHP-40404`)** *(Unknown Fleet)*
   - **Billed**: $2,415.00 | **Status**: `REQUIRES_HUMAN_OVERRIDE`
   - **Root Cause**: TMS/WMS MCP calls return `RECORD_NOT_FOUND`.
   - **Action**: Refuses to assume $0.00; initiates document re-upload request with operations.

6. **Scenario 6: Partial Detention Allowed vs. Inflated Claim (`SHP-55120`)** *(Swiftline)*
   - **Billed**: $2,061.00 | **Allowed**: $1,838.50 | **Discrepancy**: $222.50
   - **Root Cause**: Carrier billed 4 hours ($350.00). Dock timestamps verify 3.5h dwell - 2h free = 1.5h billable @ $85/hr ($127.50).
   - **Action**: Adjusts detention and disputes $222.50 excess.

---

## 7. Design System & Aesthetic Constitutional Guidelines

The UI is built with an **executive luxury minimal aesthetic**:
- **Background**: Warm alabaster beige (`#F8F6F0`)
- **Card Surfaces**: Crisp white (`#FFFFFF`) and warm ivory linen (`#FAF7F2`)
- **Borders & Dividers**: Refined warm stone (`#E6DFD3`, `#DCD2C2`)
- **Brand Accents**: Deep forest olive green (`#283618`, `#3A4A28`), sage (`#606C38`), laurel (`#8A9A5B`)
- **Dispute Accents**: Soft terracotta clay (`#8C3A2C`)
- **Typography Hierarchy**:
  - *Headings & Titles*: **Cormorant Garamond** (editorial serif)
  - *Body & Interface*: **Plus Jakarta Sans** (clean geometric sans)
  - *Currencies & Protocol Identifiers*: **JetBrains Mono** (monospace)

---

## 8. Technology Stack

- **Framework**: React 19 SPA with Vite 8
- **Language**: TypeScript 7.0 (strict mode)
- **Styling**: Tailwind CSS v4 with bespoke luxury aesthetic tokens
- **Data Visualization**: Recharts v2.15 (Area, Bar, Composed, Donut charts)
- **Icons**: Lucide React
- **AI & Integrations**: Google GenAI TypeScript SDK (`@google/genai`), Model Context Protocol (MCP) tool integration
- **Build Engine**: Vite, ESBuild, TSX

---

## 9. Local Setup & Build Instructions

### Prerequisites
- Node.js `>= 20.x`
- npm `>= 10.x`

### Installation
```bash
# Clone the repository
git clone https://github.com/example/freight-audit-ai.git
cd freight-audit-ai

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Provide `GEMINI_API_KEY` for live generative Gemini agent capabilities; the engine operates fully autonomously out of the box).*

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Typecheck & Production Build
```bash
# Typecheck codebase
npm run lint

# Build production bundle
npm run build
```

---

## License

Apache-2.0 © FreightAudit AI Team. All rights reserved.
