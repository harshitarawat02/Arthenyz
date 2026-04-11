"""
DecisionAgent
=============
Given a list of detected risks, produces a prioritised set of
corrective action recommendations. Each decision maps a risk type
to a concrete autonomous action and an estimated savings range.

Decision logic follows a rule-based policy engine (extendable
to an LLM planner in production).
"""

from typing import Any


class DecisionAgent:
    """Maps detected risks to prioritised corrective action plans."""

    # Policy map: risk type → list of possible actions with savings ranges
    POLICY = {
        "Cloud Cost Surge": [
            {
                "action": "Scaled down idle cluster",
                "min_savings": 15_000,
                "max_savings": 22_000,
                "hour": "10:32",
            },
            {
                "action": "Rightsized compute instances",
                "min_savings": 11_000,
                "max_savings": 18_000,
                "hour": "11:05",
            },
        ],
        "SaaS License Sprawl": [
            {
                "action": "Revoked 47 unused SaaS seats",
                "min_savings": 6_000,
                "max_savings": 9_500,
                "hour": "09:14",
            },
        ],
        "Data Egress Anomaly": [
            {
                "action": "Re-routed traffic to CDN edge",
                "min_savings": 4_200,
                "max_savings": 7_800,
                "hour": "13:47",
            },
        ],
        "Infrastructure Idle Waste": [
            {
                "action": "Terminated zombie VMs (12 instances)",
                "min_savings": 8_500,
                "max_savings": 13_000,
                "hour": "08:59",
            },
            {
                "action": "Scheduled off-peak auto-shutdown",
                "min_savings": 5_000,
                "max_savings": 8_000,
                "hour": "15:22",
            },
        ],
    }

    def decide(self, risks: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """
        Produce an ordered list of action decisions from detected risks.

        High-confidence risks trigger all mapped actions.
        Medium-confidence risks trigger only the top action.

        Args:
            risks: Output from DetectionAgent.detect()

        Returns:
            List of decision dicts:
            [{ "action", "hour", "min_savings", "max_savings", "risk_type" }, ...]
        """
        decisions: list[dict[str, Any]] = []

        for risk in risks:
            risk_type = risk.get("type", "")
            confidence = risk.get("confidence", 0)
            actions = self.POLICY.get(risk_type, [])

            # High confidence → all actions; medium → top action only
            selected = actions if confidence >= 80 else actions[:1]

            for action_def in selected:
                decisions.append(
                    {
                        "action": action_def["action"],
                        "hour": action_def["hour"],
                        "min_savings": action_def["min_savings"],
                        "max_savings": action_def["max_savings"],
                        "risk_type": risk_type,
                        "confidence": confidence,
                    }
                )

        # Sort by hour (chronological execution order)
        decisions.sort(key=lambda d: d["hour"])
        return decisions