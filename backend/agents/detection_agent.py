"""
DetectionAgent
==============
Monitors NFI series and cost projections for threshold breaches.
Generates structured risk objects when anomalies are detected.

Risk confidence is computed from:
  - NFI magnitude
  - Cost projection delta vs. baseline
  - Breach streak (consecutive periods above threshold)
"""

import math
from typing import Any


class DetectionAgent:
    """Detects cost risks by monitoring NFI thresholds and cost trajectories."""

    NFI_THRESHOLD = 0.50       # NFI above this = risk territory
    HIGH_NFI_THRESHOLD = 0.70  # NFI above this = elevated risk

    RISK_TEMPLATES = [
        {
            "type": "Cloud Cost Surge",
            "base_impact": 240_000,
            "nfi_trigger": 0.70,
        },
        {
            "type": "SaaS License Sprawl",
            "base_impact": 85_000,
            "nfi_trigger": 0.55,
        },
        {
            "type": "Data Egress Anomaly",
            "base_impact": 62_000,
            "nfi_trigger": 0.52,
        },
        {
            "type": "Infrastructure Idle Waste",
            "base_impact": 110_000,
            "nfi_trigger": 0.58,
        },
    ]

    def detect(
        self,
        nfi_series: list[float],
        cost_projection: list[int],
    ) -> list[dict[str, Any]]:
        """
        Analyse NFI series and cost projections to produce risk objects.

        Args:
            nfi_series:       List of NFI scores per period.
            cost_projection:  Projected cost totals per period (in thousands).

        Returns:
            List of risk dicts matching the frontend schema:
            [{ "type", "confidence", "impact", "nfi" }, ...]
        """
        peak_nfi = max(nfi_series)
        breach_count = sum(1 for n in nfi_series if n > self.NFI_THRESHOLD)
        cost_delta_pct = self._cost_delta(cost_projection)

        risks = []
        for template in self.RISK_TEMPLATES:
            if peak_nfi >= template["nfi_trigger"]:
                risk = self._build_risk(
                    template, peak_nfi, breach_count, cost_delta_pct
                )
                risks.append(risk)

        # Sort descending by confidence
        risks.sort(key=lambda r: r["confidence"], reverse=True)
        return risks

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_risk(
        self,
        template: dict,
        peak_nfi: float,
        breach_count: int,
        cost_delta_pct: float,
    ) -> dict[str, Any]:
        confidence = self._compute_confidence(peak_nfi, breach_count, cost_delta_pct)
        impact = self._compute_impact(template["base_impact"], confidence, cost_delta_pct)
        return {
            "type": template["type"],
            "confidence": confidence,
            "impact": impact,
            "nfi": round(peak_nfi, 2),
        }

    def _compute_confidence(
        self,
        peak_nfi: float,
        breach_count: int,
        cost_delta_pct: float,
    ) -> int:
        """
        Confidence formula:
          - NFI magnitude contributes 55%
          - Breach streak contributes 25%
          - Cost delta contributes 20%
        Clamped to [50, 99].
        """
        nfi_component = peak_nfi * 55
        streak_component = min(breach_count / 5.0, 1.0) * 25
        delta_component = min(cost_delta_pct / 100.0, 1.0) * 20
        raw = nfi_component + streak_component + delta_component
        return int(min(max(round(raw), 50), 99))

    def _compute_impact(
        self,
        base: int,
        confidence: int,
        cost_delta_pct: float,
    ) -> int:
        """Scale base impact by confidence and cost trajectory."""
        scale = (confidence / 100.0) * (1.0 + cost_delta_pct / 200.0)
        return int(round(base * scale / 1000) * 1000)  # round to nearest $1k

    def _cost_delta(self, cost_projection: list[int]) -> float:
        """Percentage change from first to last projected cost value."""
        if not cost_projection or cost_projection[0] == 0:
            return 0.0
        return ((cost_projection[-1] - cost_projection[0]) / cost_projection[0]) * 100