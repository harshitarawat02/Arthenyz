from fastapi import FastAPI
from ingestion.ingestion_agent import IngestionAgent
from analysis.narrative_agent import NarrativeAnalysisAgent
from detection.drift_agent import DriftDetectionAgent
from decision.decision_agent import DecisionAgent
from action.action_agent import ActionAgent
from audit.audit_agent import AuditAgent
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "Arthenyx backend running"}

@app.get("/run")
def run_pipeline():

    ingestion = IngestionAgent()
    analysis = NarrativeAnalysisAgent()
    drift = DriftDetectionAgent()
    decision = DecisionAgent()
    action = ActionAgent()
    audit = AuditAgent()

    signals = ingestion.ingest()
    analysed = analysis.analyse(signals)
    snapshot = drift.compute_nfi(analysed)
    dec = decision.decide(snapshot, analysed)

    if dec:
        act = action.execute(dec)
        audit.record(snapshot, dec, act)

        return {
            "nfi": snapshot.nfi,
            "decision": dec.root_cause,
            "savings": act.savings_inr_monthly
        }

    return {"nfi": snapshot.nfi, "decision": "none"}