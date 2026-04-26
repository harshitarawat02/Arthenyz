
# Arthenyx — Autonomous Cost Intelligence Platform

**Arthenyx** is a multi-agent AI system that detects cost risks *before* they appear in dashboards, diagnoses root causes, and takes autonomous or human-in-the-loop corrective actions.

---

## 🚀 Overview

Traditional FinOps is reactive. **Arthenyx is proactive.**

It analyzes unstructured signals (reports, logs, narratives) and structured cost data to compute a **Narrative Fragility Index (NFI)** — a proprietary early warning signal for financial inefficiencies.

When risk is detected, a chain of specialized AI agents:
1. **Identifies** the root cause.
2. **Decides** the optimal corrective action.
3. **Executes** or escalates the task.
4. **Logs** everything in a transparent audit trail.

---

## 🤖 System Architecture

The platform operates via a sequential multi-agent pipeline orchestrated on a Python FastAPI backend:

`IngestionAgent` → `NarrativeAnalysisAgent` → `DriftDetectionAgent (NFI Engine)` → `DecisionAgent` → `ActionAgent` → `AuditAgent`

The continuous execution loop follows the **Detect → Diagnose → Act → Re-evaluate** framework, maintaining shared state via structured JSON.

---

## ✨ Key Features

* **Narrative-Driven Detection:** Finds hidden costs in DevOps logs and internal narratives using the NFI formula.
* **Multi-Agent Decision Pipeline:** Autonomous reasoning with zero manual intervention.
* **Hybrid Execution:** Support for fully autonomous fixes, notifications, and human-in-the-loop approvals based on confidence thresholds.
* **Real-time Simulation Dashboard:** A high-fidelity React frontend communicating dynamically with the Python backend.
* **Financial Impact Audit:** Full logging of every action with calculated monthly savings grounded in realistic benchmarks.

---

## 🛠 Tech Stack

### Backend
* **Language:** Python 3.10+
* **Framework:** FastAPI
* **Validation & State:** Pydantic
* **Architecture:** Multi-agent orchestration (State-machine driven Execution Loop)

### Frontend
* **Framework:** React + Vite
* **Data Fetching:** TanStack React Query
* **Styling & UI:** Tailwind CSS, shadcn/ui, Glassmorphism Design System
* **Animations:** Framer Motion

---

## 📂 Project Structure

```text
Arthenyx/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # API Endpoints
│   ├── core/                 # Security & Config
│   ├── models/               # Pydantic Schemas (AgentState)
│   ├── agents/               # Individual Agent Logic (NFI, Diagnosis)
│   └── services/             # Workflow & Continuous Execution Loop
├── frontend/                 # React UI Components (sentinel-guard-main)
│   ├── src/
│   │   ├── components/       # UI & Dashboard elements
│   │   ├── services/         # API hooks fetching from FastAPI
│   │   ├── pages/            # App Routes
│   │   └── App.tsx           # Entry point
│   ├── package.json          # Dependencies
│   └── vite.config.ts
└── README.md                 # Documentation
```

---

## ⚙️ Running the Project Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/arthenyx.git](https://github.com/your-username/arthenyx.git)
cd arthenyx
```

### 2. Backend Setup (FastAPI Engine)
Open a new terminal and navigate to the backend directory:
```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pydantic

# Run the backend server
uvicorn main:app --reload --port 8000
```
**Expected Output:** The API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup (React Dashboard)
Open a second terminal and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
**View the Dashboard:** Open `http://localhost:8080/` (or the port specified in your terminal). The dashboard will now stream real-time JSON data from your Python backend.

---

## 📝 Important Notes

* **Data Handling:** The system currently utilizes stochastic simulation models initialized on the backend for demonstration purposes, mimicking real-world fragility patterns.
* **Agent Flow:** The backend executes the continuous decision loop required for Track 3's autonomous action requirements.

---

## 🔮 Future Improvements

* **Real Cloud Hooks:** Replace backend mock variables with actual AWS Cost Explorer and GCP Billing endpoint integrations.
* **Live Financial News API:** Connect `IngestionAgent` to NewsAPI or Alpha Vantage for live earnings data.
* **NLP Enhancement:** Integration of FinBERT or GPT-4 for deeper real-time narrative analysis inside the `NarrativeAnalysisAgent`.

---

**Author:** Team Krshn
*Hackathon Build — Arthenyx v1.0*
```
