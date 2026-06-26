# Arthenyx — Autonomous Cost Intelligence Platform

> A full-stack, multi-agent financial risk intelligence system. Arthenyx ingests enterprise cost signals, computes a proprietary **Narrative Fragility Index (NFI)**, detects spending risks, and autonomously executes corrective actions — all surfaced through a real-time React dashboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend — Python / FastAPI](#backend--python--fastapi)
   - [Agent Pipeline](#agent-pipeline)
   - [NFI Formula](#nfi-formula)
   - [API Endpoints](#api-endpoints)
4. [Backend Logic Reference (`Backend_Logic.py`)](#backend-logic-reference-backend_logicpy)
5. [Frontend — React / TypeScript / Vite](#frontend--react--typescript--vite)
   - [Key Views](#key-views)
   - [Data Services](#data-services)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [Running Both Together](#running-both-together)
8. [Environment Variables](#environment-variables)
9. [Integration Roadmap](#integration-roadmap)

---

## Project Overview

Arthenyx is a hackathon-built autonomous cost intelligence system for enterprises. It:

- **Ingests** multi-source cost signals (cloud compute, storage, SaaS licenses, etc.)
- **Scores** financial narrative sentiment from news data using a domain-specific lexicon
- **Computes** the Narrative Fragility Index (NFI) — a composite risk score from 0.0 to 1.0
- **Projects** future cost trajectories using compound growth modelling
- **Detects** threshold breaches and classifies risks (Cloud Surge, SaaS Sprawl, etc.)
- **Decides** corrective actions via a rule-based policy engine
- **Executes** simulated autonomous actions and reports realised savings
- **Displays** everything on a live React dashboard with charts, audit logs, and agent orchestration views

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                    │
│  Dashboard · RiskDetail · AgentOrchestration · AuditLog         │
│  Settings · NFIChart · ActionFeed · RiskCards                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │  GET /financial-data
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI · Python)                     │
│                                                                  │
│  IngestionAgent → NarrativeAgent → NFIEngine → CostModel        │
│       → DetectionAgent → DecisionAgent → ActionAgent            │
│                                                                  │
│  Data Source: backend/data/news-data.json (or fallback sim)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend — Python / FastAPI

The backend is a single FastAPI application (`backend/main.py`) that orchestrates a 7-step multi-agent pipeline on each request.

### Agent Pipeline

Every call to `GET /financial-data` runs the following agents in sequence:

| Step | Agent | Responsibility |
|------|-------|----------------|
| 1 | **IngestionAgent** | Reads `news-data.json` and produces cost signal totals, anomaly flags, and a spike indicator. Falls back to stochastic simulation if no data file exists. |
| 2 | **NarrativeAgent** | Scores each news article with a financial sentiment lexicon (positive/negative/risk-amplifier terms). Returns per-period sentiment volatility scores in `[0.1, 0.9]`. |
| 3 | **NFIEngine** | Combines cost volatility, sentiment volatility, and cost momentum into the NFI score per period using weighted formula. |
| 4 | **CostModel** | Projects future cost totals using compound growth rate with spike amplification when anomalies are detected. |
| 5 | **DetectionAgent** | Monitors the NFI series for threshold breaches and classifies risks (Cloud Cost Surge, SaaS License Sprawl, Data Egress Anomaly, Infrastructure Idle Waste). |
| 6 | **DecisionAgent** | Maps each detected risk to a prioritised list of corrective actions using a rule-based policy engine. High-confidence risks (≥ 80%) trigger all mapped actions; others trigger only the top action. |
| 7 | **ActionAgent** | Simulates execution of each action, computes realised savings within the estimated range using confidence-weighted interpolation with ±5% variance. |

### NFI Formula

The Narrative Fragility Index is computed per period `t`:

```
NFI(t) = α·cost_vol(t) + β·sent_vol(t) + γ·momentum(t)

  α = 0.45  →  cost signal volatility (normalised)
  β = 0.35  →  narrative sentiment volatility
  γ = 0.20  →  cost momentum (rate of change, normalised)

Result is clamped to [0.0, 1.0]
```

**Risk thresholds used by DetectionAgent:**

| Threshold | Meaning |
|-----------|---------|
| NFI > 0.50 | Risk territory — monitoring |
| NFI > 0.70 | Elevated risk — action recommended |

**Confidence formula (DetectionAgent):**

```
confidence = (peak_nfi × 55) + (breach_streak / 5 × 25) + (cost_delta% / 100 × 20)
Clamped to [50, 99]
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Platform status and version info |
| `GET` | `/health` | Health check — returns `{"status": "healthy"}` |
| `GET` | `/financial-data` | Full intelligence pipeline output: NFI series, cost projection, risks, and actions |

**Sample response shape from `/financial-data`:**

```json
{
  "nfi": [0.42, 0.55, 0.71, 0.63, 0.58],
  "cost_projection": [100, 118, 139, 164, 194],
  "risks": [
    {
      "type": "Cloud Cost Surge",
      "confidence": 87,
      "impact": 208000,
      "nfi": 0.71
    }
  ],
  "actions": [
    {
      "timestamp": "10:32",
      "action": "Scaled down idle cluster",
      "saved": 19500
    }
  ]
}
```

---

## Backend Logic Reference (`Backend_Logic.py`)

`Backend_Logic.py` is a **fully runnable standalone script** — it is not imported by the FastAPI server, but it can be executed directly to demonstrate the complete extended agent pipeline. Think of it as the conceptual "full production version" of the backend, runnable independently with no external dependencies.

### What it contains

- A richer `NFISnapshot` data model including `uncertainty_growth`, `risk_term_freq`, `sentiment_volatility`, and `cross_source_alignment` components
- A 4-weight NFI formula: `NFI = w1(UncertaintyGrowth) + w2(RiskTermFrequency) + w3(SentimentVolatility) + w4(CrossSourceAlignment)`
- `AgentDecision` and `ExecutedAction` dataclasses for typed audit trails
- An `AuditAgent` for hashed, tamper-evident audit log entries
- INR/USD exchange rate handling (`83.0` baseline) for India-region cost display
- Confidence thresholds for autonomous execution (`CONFIDENCE_AUTO_ACT = 0.85`)
- Three built-in demo scenarios: **Cloud Cost Spike**, **Vendor Duplication**, and **SLA Breach Prediction**
- A financial impact report generator and JSON audit log export

### Agent pipeline in this file

```
IngestionAgent → NarrativeAnalysisAgent → DriftDetectionAgent (NFI)
    → DecisionAgent → ActionAgent → AuditAgent
```

### How to run it

`Backend_Logic.py` uses only Python standard library modules — no `pip install` needed.

```bash
# From the Arthenyx project root
python Backend_Logic.py
```

Or from anywhere by providing the full path:

```bash
python /path/to/Arthenyx/Backend_Logic.py
```

**Python 3.11+ is recommended** (uses `dataclasses`, `deque`, `hashlib`, `datetime` — all stdlib).

### What you will see

Running it executes all three scenarios in sequence and prints a live agent trace to the terminal:

```
╔════════════════════════════════════════════════════════════╗
║  ARTHENYX — Autonomous Cost Intelligence Platform
║  Multi-Agent Pipeline Starting...
╚════════════════════════════════════════════════════════════╝

[IngestionAgent] Starting ingestion pipeline...
  ✓ Ingested: Q4 Earnings Transcript — TechCorp
  ✓ Ingested: Industry Analyst Report — IDC
  ...

[DriftDetectionAgent] NFI Computed:
  NFI Score       : 0.7341  ⚠ SPIKE
  Uncertainty Gr. : 0.8200
  Risk Term Freq  : 0.7400
  Sentiment Vol.  : 0.6100
  Cross-Src Align : 0.5000

  🚨 SPIKE DETECTED: NFI=0.7341 > threshold=0.28

[DecisionAgent] Decision reached:
  Root Cause : Cloud over-provisioning due to demand slowdown
  Action     : Scale down compute resources by 30-40%
  Confidence : 91%

[ActionAgent] Executing action for scenario: cloud_cost_spike
  🤖 Calling cloud scaling API...
  ✅ Cloud scaled down 35%
     Savings: ₹1,428/hr | ₹1,028,160/mo
```

After all three scenarios complete, it prints:

- A full **Audit Log** with entry IDs, timestamps, NFI scores, and approval status for every action taken
- A **Financial Impact Report** with per-scenario and total projected savings (hourly / daily / monthly / annual)

It also writes `arthenyx_audit_log.json` to the current directory — a machine-readable record of all audit entries.

### Key thresholds (configurable at the top of the file)

| Constant | Default | Meaning |
|----------|---------|---------|
| `NFI_SPIKE_THRESHOLD` | `0.28` | NFI above this triggers alert and agent pipeline |
| `NFI_ACTION_THRESHOLD` | `0.72` | NFI above this triggers autonomous action |
| `CONFIDENCE_AUTO_ACT` | `0.85` | Confidence ≥ this → auto-execute; below → human-in-the-loop |
| `NFI_WEIGHTS` | `w1=0.30, w2=0.25, w3=0.25, w4=0.20` | Component weights for NFI formula |

You can edit these constants directly to tune the system's sensitivity before integrating into the live backend.

---

## Frontend — React / TypeScript / Vite

Built with React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, and TanStack Query.

### Key Views

| View | File | Description |
|------|------|-------------|
| Dashboard | `src/components/views/Dashboard.tsx` | Main landing — NFI chart, risk cards, action feed |
| Risk Detail | `src/components/views/RiskDetail.tsx` | Drill-down into individual risk events |
| Agent Orchestration | `src/components/views/AgentOrchestration.tsx` | Live visualisation of the agent pipeline execution |
| Audit Log | `src/components/views/AuditLog.tsx` | Full timestamped log of detected risks and actions taken |
| Settings | `src/components/views/Settings.tsx` | Agent configuration, thresholds, integration toggles |

### Data Services

| Service | File | Mode |
|---------|------|------|
| `dataService.ts` | `src/services/dataService.ts` | In-browser simulation — Ornstein-Uhlenbeck mean-reverting NFI process, no backend required |
| `financialDataService.ts` | `src/services/financialDataService.ts` | Calls the FastAPI backend at `GET /financial-data` when backend is running |

The frontend defaults to the **in-browser simulation** mode so it works standalone without the backend. To connect to the real backend, use `financialDataService.ts` as the data provider.

---

## Project Structure

```
Arthenyx/
├── Backend_Logic.py              # Conceptual logic reference (not imported by server)
├── backend/
│   ├── main.py                   # FastAPI app entry point
│   ├── requirements.txt          # Python dependencies
│   ├── agents/
│   │   ├── ingestion_agent.py    # Cost signal ingestion + anomaly detection
│   │   ├── narrative_agent.py    # Sentiment scoring via financial lexicon
│   │   ├── detection_agent.py    # NFI threshold breach → risk classification
│   │   ├── decision_agent.py     # Risk → action policy engine
│   │   └── action_agent.py       # Action execution simulation + savings calc
│   ├── api/
│   │   └── routes.py             # /financial-data endpoint + pipeline orchestration
│   ├── core/
│   │   ├── nfi_engine.py         # NFI computation (α·cost + β·sentiment + γ·momentum)
│   │   └── cost_model.py         # Compound growth cost projection
│   └── data/
│       └── news-data.json        # Local financial news corpus for ingestion
├── src/
│   ├── App.tsx                   # Root router (React Router v6)
│   ├── components/
│   │   ├── dashboard/            # NFIChart, RiskCards, ActionFeed
│   │   ├── layout/               # Sidebar, StatusBar
│   │   └── views/                # Dashboard, RiskDetail, AgentOrchestration, AuditLog, Settings
│   ├── contexts/
│   │   └── AgentSettingsContext.tsx  # Global agent config state
│   ├── data/
│   │   └── mockData.ts           # Type definitions + seed data
│   ├── services/
│   │   ├── dataService.ts        # In-browser stochastic simulation engine
│   │   └── financialDataService.ts  # Backend API integration layer
│   └── pages/
│       ├── Index.tsx             # Main page layout
│       └── NotFound.tsx          # 404
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **npm** 9 or higher

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd Arthenyx/backend

# 2. Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.

Verify it's running:
```bash
curl http://localhost:8000/health
# → {"status": "healthy", "service": "arthenyx-backend"}

curl http://localhost:8000/financial-data
# → Full intelligence pipeline JSON response
```

> **Note:** The backend reads `backend/data/news-data.json` as its news corpus. If the file is missing, all agents fall back to stochastic simulation — the server will still run correctly.

---

### Frontend Setup

```bash
# 1. Navigate to the project root
cd Arthenyx

# 2. Install Node dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

**Other useful commands:**

```bash
npm run build       # Production build → dist/
npm run preview     # Preview production build locally
npm run test        # Run Vitest test suite
npm run lint        # Run ESLint
```

---

### Running Both Together

For the full integrated experience, run both servers simultaneously:

**Terminal 1 — Backend:**
```bash
cd Arthenyx/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd Arthenyx
npm run dev
```

Then open `http://localhost:5173` in your browser. The frontend's `financialDataService.ts` will call the backend at `http://localhost:8000/financial-data` to populate the dashboard with live agent-computed data.

---

## Environment Variables

The backend uses `python-dotenv`. Create a `.env` file inside `backend/` if you need to override defaults:

```env
# backend/.env (optional)
# Add API keys here when integrating real data sources (see Integration Roadmap)
```

The frontend (Vite) supports `.env` files at the project root:

```env
# Arthenyx/.env (optional)
VITE_API_BASE_URL=http://localhost:8000
```

---

## Integration Roadmap

The current build uses simulated/local data. To connect real enterprise data sources:

| Component | Current | Production Integration |
|-----------|---------|------------------------|
| Financial news | `news-data.json` | NewsAPI, Alpha Vantage, Bloomberg Terminal |
| Sentiment scoring | Keyword lexicon | FinBERT (HuggingFace Transformers) or GPT-4 |
| Cloud cost signals | Stochastic simulation | AWS Cost Explorer, GCP Billing API, Azure Cost Management |
| Agent orchestration | Sequential Python calls | LangGraph or CrewAI multi-agent framework |
| Audit stream | Static log | WebSocket to backend event bus |
| NFI extended components | 3-factor model | 4-factor model from `Backend_Logic.py` |

---

*Arthenyx · v1.0 · Hackathon Build*
