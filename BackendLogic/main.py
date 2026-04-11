from ingestion.ingestion_agent import IngestionAgent
from analysis.narrative_agent import NarrativeAnalysisAgent
from detection.drift_agent import DriftDetectionAgent
from decision.decision_agent import DecisionAgent
from action.action_agent import ActionAgent
from audit.audit_agent import AuditAgent

def main():

    ingestion = IngestionAgent()
    analysis = NarrativeAnalysisAgent()
    drift = DriftDetectionAgent()
    decision = DecisionAgent()
    action = ActionAgent()
    audit = AuditAgent()

    signals = ingestion.ingest()
    print("Signals:", len(signals))

    analysed = analysis.analyse(signals)
    print("Analysed:", len(analysed))

    snapshot = drift.compute_nfi(analysed)
    print("NFI:", snapshot.nfi)

    dec = decision.decide(snapshot, analysed)

    if dec:
        print("Decision:", dec.root_cause)
        act = action.execute(dec)
        audit.record(snapshot, dec, act)
    else:
        print("No decision triggered")

if __name__ == "__main__":
    main()