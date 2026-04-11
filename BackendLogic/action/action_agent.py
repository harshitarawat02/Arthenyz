import datetime
import random
from models.models import ExecutedAction

class ActionAgent:

    def execute(self, decision):

        savings = random.randint(5000,20000)

        return ExecutedAction(
            action_id=f"ACT-{random.randint(1000,9999)}",
            action_type="scale_down",
            description="Scaled compute resources",
            executed_at=str(datetime.datetime.now()),
            confidence=decision.confidence,
            savings_inr_hourly=savings/24,
            savings_inr_monthly=savings
        )