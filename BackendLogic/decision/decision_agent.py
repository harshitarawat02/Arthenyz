from models.models import AgentDecision

class DecisionAgent:

 def decide(self, snapshot, signals):

    if snapshot.nfi > 0.05:
        return AgentDecision(
            trigger="High NFI",
            root_cause="Narrative risk detected",
            recommended_action="Scale down compute",
            confidence=0.88,
            scenario="cloud"
        )
       