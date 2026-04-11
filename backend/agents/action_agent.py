"""
ActionAgent
===========
Simulates the execution of autonomous corrective actions decided
by the DecisionAgent. Returns a structured log of executed actions
with realised savings — formatted to match the frontend schema.

In a production system this agent would issue API calls to cloud
providers, ITSM platforms, and cost management tools.
"""

import random
from typing import Any


class ActionAgent:
    """Simulates execution of autonomous cost-saving actions."""

    def execute(self, decisions: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Simulate executing each decision and compute realised savings.

        Args:
            decisions: Output from DecisionAgent.decide()

        Returns:
            List of action result dicts matching frontend schema:
            [{ "timestamp", "action", "saved" }, ...]
        """
        random.seed(99)  # deterministic for stable demo

        results: list[dict[str, Any]] = []

        for decision in decisions:
            saved = self._realise_savings(
                decision["min_savings"],
                decision["max_savings"],
                decision["confidence"],
            )
            results.append(
                {
                    "timestamp": decision["hour"],
                    "action": decision["action"],
                    "saved": saved,
                }
            )

        return results

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _realise_savings(
        self,
        min_savings: int,
        max_savings: int,
        confidence: int,
    ) -> int:
        """
        Compute realised savings within the estimated range.

        Higher-confidence actions tend to realise savings closer to
        the upper bound. Adds realistic execution variance (±5%).
        """
        # Confidence-weighted interpolation within range
        weight = confidence / 100.0
        estimated = min_savings + (max_savings - min_savings) * weight

        # Inject ±5% execution variance
        variance = random.uniform(-0.05, 0.05)
        realised = estimated * (1.0 + variance)

        # Round to nearest $500 for realism
        return int(round(realised / 500) * 500)