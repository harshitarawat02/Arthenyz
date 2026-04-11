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

The platform operates via a sequential multi-agent pipeline:

`IngestionAgent` → `NarrativeAnalysisAgent` → `DriftDetectionAgent (NFI Engine)` → `DecisionAgent` → `ActionAgent` → `AuditAgent`

---

## ✨ Key Features

* **Narrative-Driven Detection:** Finds hidden costs in DevOps logs and internal narratives.
* **Multi-Agent Decision Pipeline:** Autonomous reasoning with zero manual intervention.
* **Hybrid Execution:** Support for both autonomous fixes and human-in-the-loop approvals.
* **Real-time Simulation Dashboard:** A high-fidelity frontend built with Glassmorphism principles.
* **Financial Impact Audit:** Full logging of every action with calculated monthly savings.

---

## 🛠 Tech Stack

### Backend
* **Language:** Python 3
* **Logic:** Dataclasses, Agentic Simulation APIs
* **Architecture:** Multi-agent orchestration

### Frontend
* **Framework:** React (via Lovable)
* **Animations:** Framer Motion
* **UI/UX:** Glassmorphism Design System, Tailwind CSS

---

## 📂 Project Structure

```text
Arthenyx/
└── Arthenyx/
    ├── BackendLogic/
    │   └── Main_Agentic.py         # Core Agentic Intelligence
    ├── SimulationFrontend/
    │   ├── src/                    # React UI Components
    │   └── package.json            # Dependencies
    └── README.md                   # Documentation
```

---

## ⚙️ Running the Project Locally

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/arthenyx.git](https://github.com/your-username/arthenyx.git)
cd arthenyx/Arthenyx
```

### 2. Backend Setup (Python)
Navigate to the logic directory and run the engine:
```bash
cd BackendLogic
python Main_Agentic.py
```

**Expected Terminal Output:**
* Multi-agent pipeline execution logs
* NFI Score computation (e.g., `0.5670`)
* Decision & Action logs
* **Financial Impact Report:** > *Savings: ₹1,445/hr | ₹1,040,400/mo*

### 3. Frontend Setup (Simulation UI)
From the `Arthenyx/Arthenyx` directory, run:
```bash
cd SimulationFrontend
npm install
npm run dev
```
**View the Dashboard:** Open http://localhost:8080/

---

## 📝 Important Notes

* **Data Handling:** This project uses simulated data for demonstration purposes.
* **Note on Structure:** The main project files are located within the nested `/Arthenyx` directory.
* **Simulation Status:** The Frontend is currently a high-fidelity simulation; the Backend demonstrates the real decision logic and NFI engine.

---

## 🔮 Future Improvements

* **Live Integration:** Connect frontend to backend via FastAPI.
* **Real Cloud Hooks:** Replace mock APIs with AWS Cost Explorer and SaaS billing endpoints.
* **NLP Enhancement:** Integration of LLMs for deeper real-time narrative analysis.

---

**Author:** Aditi Rathore  
*Hackathon Build — Arthenyx v1.0*
