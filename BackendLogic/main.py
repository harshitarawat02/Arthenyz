import logging

from ingestion.ingestion_agent import IngestionAgent
from analysis.narrative_agent import NarrativeAnalysisAgent
from detection.drift_agent import DriftDetectionAgent
from decision.decision_agent import DecisionAgent
from action.action_agent import ActionAgent
from audit.audit_agent import AuditAgent


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)


def main():
    try:
        logging.info("Initializing agents...")

        ingestion = IngestionAgent()
        analysis = NarrativeAnalysisAgent()
        drift = DriftDetectionAgent()
        decision = DecisionAgent()
        action = ActionAgent()
        audit = AuditAgent()

        # Step 1: Ingestion
        logging.info("Running ingestion agent...")
        signals = ingestion.ingest()
        logging.info(f"Signals collected: {len(signals)}")

        # Step 2: Narrative Analysis
        logging.info("Running narrative analysis...")
        analysed = analysis.analyse(signals)
        logging.info(f"Signals analysed: {len(analysed)}")

        # Step 3: Drift Detection / NFI
        logging.info("Computing Narrative Friction Index...")
        snapshot = drift.compute_nfi(analysed)
        logging.info(f"NFI Score: {snapshot.nfi}")

        # Step 4: Decision
        logging.info("Evaluating decision...")
        dec = decision.decide(snapshot, analysed)

        if dec:
            logging.info(f"Decision Triggered: {dec.root_cause}")

            # Step 5: Action
            act = action.execute(dec)
            logging.info("Action executed successfully")

            # Step 6: Audit
            audit.record(snapshot, dec, act)
            logging.info("Audit recorded")

        else:
            logging.info("No decision triggered")

    except Exception as e:
        logging.error(f"Pipeline failed: {str(e)}", exc_info=True)


if __name__ == "__main__":
    main()