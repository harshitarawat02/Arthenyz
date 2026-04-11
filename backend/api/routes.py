from fastapi import APIRouter
from agents.ingestion_agent import IngestionAgent
from agents.narrative_agent import NarrativeAgent
from agents.detection_agent import DetectionAgent
from agents.decision_agent import DecisionAgent
from agents.action_agent import ActionAgent
from core.nfi_engine import NFIEngine
from core.cost_model import CostModel

router = APIRouter()


@router.get("/financial-data")
def get_financial_data():
    """
    Main endpoint consumed by the Arthenyx React/TypeScript frontend.
    Orchestrates all agents in the intelligence pipeline and returns
    a unified financial intelligence payload.
    """
    # Step 1 — Ingest enterprise cost signals
    ingestion = IngestionAgent()
    raw_signals = ingestion.fetch_signals()

    # Step 2 — Compute narrative sentiment volatility
    narrative = NarrativeAgent()
    sentiment_volatility = narrative.compute_volatility(raw_signals)

    # Step 3 — Build NFI scores from combined signals
    nfi_engine = NFIEngine()
    nfi_series = nfi_engine.compute(raw_signals, sentiment_volatility)

    # Step 4 — Project future costs
    cost_model = CostModel()
    cost_projection = cost_model.project(raw_signals)

    # Step 5 — Detect risks from NFI threshold breaches
    detection = DetectionAgent()
    risks = detection.detect(nfi_series, cost_projection)

    # Step 6 — Decide corrective actions
    decision = DecisionAgent()
    decisions = decision.decide(risks)

    # Step 7 — Simulate autonomous action execution + savings
    action = ActionAgent()
    actions = action.execute(decisions)

    return {
        "nfi": nfi_series,
        "cost_projection": cost_projection,
        "risks": risks,
        "actions": actions,
    }