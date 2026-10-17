# Autonomous Freight Bill Audit Agent — Execution Guide & Instructions

> **Live Preview Application**: [https://ai.studio/apps/a56886e1-3b5a-4776-99e8-766f0bac1100](https://ai.studio/apps/a56886e1-3b5a-4776-99e8-766f0bac1100)

This guide provides instructions for executing, testing, and integrating the **Autonomous Freight Bill Audit & Dispute Resolution Engine** across three execution environments:
1. **Interactive Web Cockpit (UI & Realtime DAG Visualizer)**
2. **Programmatic TypeScript SDK (`RealtimeFreightAgent` / `executeAudit`)**
3. **Autonomous Python / Gemini MCP Tool-Calling Loop**

---

## 1. Quick Start: Executing via the Web Cockpit

The web cockpit provides an interactive execution environment with step-by-step telemetry, document inspection, and downstream decision dispatching.

### Step 1: Open the Application
Navigate to the live URL:
👉 **[https://ai.studio/apps/a56886e1-3b5a-4776-99e8-766f0bac1100](https://ai.studio/apps/a56886e1-3b5a-4776-99e8-766f0bac1100)**

### Step 2: Select a Test Scenario or Input Custom Invoice
In the **Incoming Invoice Payload** card (top-left), choose from the 6 preset operational scenarios or configure your own:

| Preset Name | Target Shipment | Expected Status | Expected Action | Expected Discrepancy |
| :--- | :--- | :--- | :--- | :--- |
| **Scenario 1: Disputed Invoice** | `SHP-88291` | `DISPUTED` | `submit_dispute_email` | **+$400.00** ($250 detention + $150 lumper) |
| **Scenario 2: Clean 3-Way Match** | `SHP-99001` | `APPROVED` | `approve_invoice_payment` | **$0.00** (Base $1200 + FSC $180 + Lumper $120) |
| **Scenario 3: FSC Index Mismatch** | `SHP-77402` | `DISPUTED` | `submit_dispute_email` | **+$120.00** (22% billed vs 16% contract) |
| **Scenario 4: Missing Parameter** | *(empty)* | `REQUIRES_HUMAN_OVERRIDE` | `escalate_to_human` | **+$1,092.50** (Missing `shipment_id`) |
| **Scenario 5: MCP 404 Not Found** | `SHP-40404` | `REQUIRES_HUMAN_OVERRIDE` | `escalate_to_human` | **+$2,415.00** (Document re-upload needed) |
| **Scenario 6: Excess Detention** | `SHP-55120` | `DISPUTED` | `submit_dispute_email` | **+$222.50** (3.5h dwell allows 1.5h @ $85/hr) |

### Step 3: Run the Realtime Agent
- Click **"Execute Audit"** in the top header or **"Run Agentic Flow"** in the pipeline card.
- **Speed Tuner**: Select between `0.5x` (slow forensic observation), `1x` (standard realtime), `2x` (fast), or `Max` (instantaneous).
- **Interactive Controls**:
  - Click **"Pause"** to freeze execution mid-flight.
  - Click **"Step"** to advance the agent one stage at a time through the 5-node DAG.
  - Click **"Inspect"** on any of the 5 nodes to view exact input/output payloads, live latency in milliseconds, and mathematical verification formulas.

### Step 4: Review 3-Way Reconciled Results
- **Document Match Inspector**: Review the split view comparing the Carrier Invoice, TMS Agreed Rate Sheet, and Signed WMS Proof of Delivery (with gate timestamps and supervisor signature stamp).
- **Line-Item Reconciliation**: Inspect each clause (Base Freight, FSC DOE Index, Gate Dwell Detention, Stamped Lumper).
- **Automated Actions**:
  - If **Disputed**: Click **"View Carrier Dispute Notice"** to inspect the email drafted with contractual citations.
  - If **Approved**: Click **"View ERP AP Payment Voucher"** to verify the SAP S/4HANA disbursement reference.
  - If **Human Override**: Click **"Adjudicate Human Exception"** to supply missing references or simulate document re-upload.

---

## 2. Programmatic TypeScript Execution

You can execute the deterministic agent directly inside any Node.js, Express, or browser environment using the exported engine modules:

### Deterministic Execution (`executeAudit`)

```typescript
import { executeAudit } from './src/services/auditEngine';
import { FreightInvoice } from './src/types/audit';

// 1. Define Incoming Carrier Invoice Payload
const invoice: FreightInvoice = {
  shipment_id: "SHP-88291",
  invoice_number: "INV-109282",
  carrier_name: "Apex Logistics Corp",
  carrier_email: "billing@apexlogistics.com",
  invoice_date: "2026-10-16",
  origin: "Chicago, IL",
  destination: "Dallas, TX",
  invoice_details: {
    base_freight: 1850.00,
    fuel_surcharge: 296.00,
    detention_charge: 250.00,
    lumper_fee: 150.00,
    total_invoiced: 2546.00,
  },
};

// 2. Execute Audit
async function run() {
  const { report, actionResult, logs } = await executeAudit(invoice, {
    stepDelayMs: 0, // Set > 0 for simulated latency
    onStep: (step) => {
      console.log(`[${step.type}] ${step.message}`);
    },
  });

  console.log("=== AUDIT REPORT ===");
  console.log(JSON.stringify(report, null, 2));
}

run();
```

### Event-Driven Realtime Agent (`RealtimeFreightAgent`)

For step-by-step lifecycle control, pausing, and live telemetry:

```typescript
import { RealtimeFreightAgent } from './src/services/realtimeAgent';

const agent = new RealtimeFreightAgent(invoice, undefined, undefined, {
  delayMs: 300,
  onEvent: (event) => {
    console.log(`--> [EVENT ${event.type}]: ${event.message}`);
  },
  onNodeStateChange: (nodeStates) => {
    // Current states across all 5 DAG nodes
  },
});

// Run agent to completion
const result = await agent.execute();
```

---

## 3. Autonomous Python Execution (Gemini + MCP Callbacks)

The agent can also be executed as an autonomous LLM loop using the official `@google/genai` Python SDK. The agent receives tool declarations, decides which MCP tools to call, inspects the responses, and enforces strict schema validation.

### Python Execution Script (`audit_agent.py`)

```python
import os
import json
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# 1. Initialize Gemini Client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 2. Define Strict Output Schema
class LineItemAudit(BaseModel):
    category: Literal["BASE_FREIGHT", "FUEL_SURCHARGE", "DETENTION", "LUMPER", "OTHER"]
    invoiced_amount: float
    contract_allowed_amount: float
    discrepancy: float
    finding: str

class AuditReportSchema(BaseModel):
    shipment_id: Optional[str]
    invoice_number: str
    audit_status: Literal["APPROVED", "DISPUTED", "REQUIRES_HUMAN_OVERRIDE"]
    internal_reasoning: str = Field(description="Strictly under 40 words.")
    total_invoiced: float
    total_contracted_allowed: float
    discrepancy_amount: float
    line_item_audits: List[LineItemAudit]
    missing_or_error_fields: List[str]
    action_taken: Literal["PAYMENT_APPROVED", "DISPUTE_SENT", "ESCALATED_TO_HUMAN"]

# 3. Define Standard MCP Tool Functions
def get_rate_sheet(shipment_id: str) -> dict:
    """Queries TMS for contracted rate sheet, fuel index, and detention caps."""
    mock_tms = {
        "SHP-88291": {
            "status": "SUCCESS",
            "shipment_id": "SHP-88291",
            "contract_rate": 1850.00,
            "fsc_index": 0.16,
            "free_time_hours": 2.0,
            "detention_hourly_rate": 100.00,
            "lumper_pre_approved": False,
        }
    }
    return mock_tms.get(shipment_id, {"status": "RECORD_NOT_FOUND"})

def get_signed_pod(shipment_id: str) -> dict:
    """Queries WMS for driver gate timestamps and stamped notes."""
    mock_wms = {
        "SHP-88291": {
            "status": "SUCCESS",
            "shipment_id": "SHP-88291",
            "gate_in": "2026-10-15T08:15:00Z",
            "gate_out": "2026-10-15T10:00:00Z",
            "dwell_minutes": 105,
            "lumper_receipt_attached": False,
            "lumper_receipt_number": None,
        }
    }
    return mock_wms.get(shipment_id, {"status": "RECORD_NOT_FOUND"})

def submit_dispute_email(invoice_number: str, carrier_email: str, disputed_amount: float) -> dict:
    return {"status": "DISPUTE_SENT", "invoice": invoice_number, "disputed_amount": disputed_amount}

def approve_invoice_payment(invoice_number: str, approved_amount: float) -> dict:
    return {"status": "PAYMENT_APPROVED", "invoice": invoice_number, "approved_amount": approved_amount}

tool_map = {
    "get_rate_sheet": get_rate_sheet,
    "get_signed_pod": get_signed_pod,
    "submit_dispute_email": submit_dispute_email,
    "approve_invoice_payment": approve_invoice_payment,
}

# 4. System Instruction
SYSTEM_INSTRUCTION = """You are an Autonomous Freight Bill Audit & Dispute Resolution Engine.
EXECUTION PROTOCOL:
1. Extract line items from the INVOICE payload.
2. Fetch reference documents in parallel using standard MCP tool calls:
   - Call get_rate_sheet(shipment_id)
   - Call get_signed_pod(shipment_id)
3. 3-Way Matching:
   - BASE FREIGHT: Match Invoice Base Rate vs Contract Rate.
   - FUEL SURCHARGE: Verify against contract_rate * fsc_index.
   - DETENTION: Check dwell_minutes / 60 vs free_time_hours. Excess billable at detention_hourly_rate.
   - LUMPER: Requires lumper_receipt_attached == True and lumper_receipt_number. If missing, allowed is $0.00.
4. Calculate discrepancy_amount = Total Invoiced - Total Contracted Allowed.
5. If discrepancy == 0.00 and APPROVED: Call approve_invoice_payment.
6. If discrepancy > 0.00 and DISPUTED: Call submit_dispute_email.
CONSTRAINTS:
- internal_reasoning MUST be strictly under 40 words.
- All currency calculations rounded to 2 decimal places."""

config = types.GenerateContentConfig(
    temperature=0.0,
    system_instruction=SYSTEM_INSTRUCTION,
    tools=[get_rate_sheet, get_signed_pod, submit_dispute_email, approve_invoice_payment],
    response_mime_type="application/json",
    response_schema=AuditReportSchema,
)

# 5. Autonomous Multi-Step Tool Execution Loop
def run_agent(invoice_payload: dict) -> str:
    chat = client.chats.create(model="gemini-3.8-flash", config=config)
    response = chat.send_message(f"Audit incoming freight invoice:\n{json.dumps(invoice_payload, indent=2)}")

    while response.function_calls:
        tool_responses = []
        for call in response.function_calls:
            func_name = call.name
            func_args = dict(call.args) if call.args else {}
            result = tool_map[func_name](**func_args)
            tool_responses.append(types.Part.from_function_response(name=func_name, response={"result": result}))
        response = chat.send_message(tool_responses)

    return response.text

# 6. Run Test
if __name__ == "__main__":
    sample_invoice = {
        "shipment_id": "SHP-88291",
        "invoice_number": "INV-109282",
        "carrier_name": "Apex Logistics Corp",
        "carrier_email": "billing@apexlogistics.com",
        "invoice_details": {
            "base_freight": 1850.00,
            "fuel_surcharge": 296.00,
            "detention_charge": 250.00,
            "lumper_fee": 150.00,
            "total_invoiced": 2546.00,
        },
    }
    output = run_agent(sample_invoice)
    print(json.dumps(json.loads(output), indent=2))
```

### Running the Python Agent
```bash
export GEMINI_API_KEY="your-api-key"
python audit_agent.py
```

---

## 4. Expected Adjudication Output Format

All executions produce strict JSON conforming to `AuditReportSchema`:

```json
{
  "shipment_id": "SHP-88291",
  "invoice_number": "INV-109282",
  "audit_status": "DISPUTED",
  "internal_reasoning": "Audit failed with $400.00 in unauthorized charges across detention, lumper. Carrier billed beyond contract and verified POD documents.",
  "total_invoiced": 2546.00,
  "total_contracted_allowed": 2146.00,
  "discrepancy_amount": 400.00,
  "line_item_audits": [
    {
      "category": "BASE_FREIGHT",
      "invoiced_amount": 1850.00,
      "contract_allowed_amount": 1850.00,
      "discrepancy": 0.00,
      "finding": "Agreed base freight matched exactly at $1850.00."
    },
    {
      "category": "FUEL_SURCHARGE",
      "invoiced_amount": 296.00,
      "contract_allowed_amount": 296.00,
      "discrepancy": 0.00,
      "finding": "Fuel surcharge matched DOE fuel index scale (16.0% of base = $296.00)."
    },
    {
      "category": "DETENTION",
      "invoiced_amount": 250.00,
      "contract_allowed_amount": 0.00,
      "discrepancy": 250.00,
      "finding": "Unauthorized detention. POD timestamps confirm dwell time of 105 mins (1.75 hrs), within the 2.0 hr free-time window. $0.00 allowed."
    },
    {
      "category": "LUMPER",
      "invoiced_amount": 150.00,
      "contract_allowed_amount": 0.00,
      "discrepancy": 150.00,
      "finding": "Unauthorized lumper fee. Signed POD lacks stamped receipt and valid receipt reference. Allowed $0.00."
    }
  ],
  "missing_or_error_fields": [],
  "action_taken": "DISPUTE_SENT"
}
```

---

## 5. Troubleshooting & FAQ

#### Q: What happens if `shipment_id` is missing from the invoice?
**A:** The agent halts at Stage 1, sets `audit_status: "REQUIRES_HUMAN_OVERRIDE"`, flags `missing_or_error_fields: ["shipment_id"]`, and does **not** call payment or dispute tools. In the UI, the *Human Auditor Exception Desk* allows the operator to input the missing reference.

#### Q: What happens if TMS or WMS returns `RECORD_NOT_FOUND`?
**A:** The agent **never assumes $0.00** on missing ground-truth documents. It sets `audit_status: "REQUIRES_HUMAN_OVERRIDE"` and prompts operations to re-upload the missing BOL or signed rate sheet.

#### Q: How is the 40-word constraint validated?
**A:** Both the Python schema and the TypeScript engine include an automatic word-count token guardrail (`internal_reasoning.split(/\s+/).length <= 40`), with a live visual verification badge on the UI.
