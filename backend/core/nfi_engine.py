"""
NFIEngine
=========
Computes the Narrative Fragility Index (NFI) — Arthenyx's proprietary
composite score that combines cost signal volatility and narrative
sentiment volatility into a single [0.0–1.0] fragility metric.

NFI Formula (per period t):
  NFI(t) = α·cost_vol(t) + β·sent_vol(t) + γ·momentum(t)

Where:
  α = 0.45  — cost signal weight
  β = 0.35  — sentiment volatility weight
  γ = 0.20  — cost momentum (rate of change) weight
"""

import math
from typing import Any


class NFIEngine:
    """Computes the Narrative Fragility Index time series."""

    ALPHA = 0.45  # cost volatility weight
    BETA = 0.35   # sentiment volatility weight
    GAMMA = 0.20  # momentum weight

    def compute(
        self,
        signals: dict[str, Any],
        sentiment_volatility: list[float],
    ) -> list[float]:
        """
        Compute NFI series from cost signals and sentiment volatility.

        Args:
            signals:              Output from IngestionAgent.fetch_signals()
            sentiment_volatility: Output from NarrativeAgent.compute_volatility()

        Returns:
            List of NFI scores [0.0–1.0], one per period.
        """
        totals: list[float] = signals["totals"]
        window: int = signals["window"]

        cost_vol = self._normalised_cost_volatility(totals)
        momentum = self._momentum_series(totals)

        nfi_series: list[float] = []
        for t in range(window):
            sv = sentiment_volatility[t] if t < len(sentiment_volatility) else 0.0
            cv = cost_vol[t]
            mo = momentum[t]
            raw = self.ALPHA * cv + self.BETA * sv + self.GAMMA * mo
            nfi = round(min(max(raw, 0.0), 1.0), 2)
            nfi_series.append(nfi)

        return nfi_series

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _normalised_cost_volatility(self, totals: list[float]) -> list[float]:
        """
        Normalise cost totals to [0, 1] range relative to the series min/max.
        Returns per-period cost volatility contribution.
        """
        if not totals:
            return []
        min_val = min(totals)
        max_val = max(totals)
        spread = max_val - min_val if max_val != min_val else 1.0
        return [round((v - min_val) / spread, 4) for v in totals]

    def _momentum_series(self, totals: list[float]) -> list[float]:
        """
        Compute per-period cost momentum (rate of change) normalised to [0, 1].
        Period 0 uses forward difference; remaining periods use backward difference.
        """
        if not totals:
            return []

        raw_momentum = []
        for t in range(len(totals)):
            if t == 0:
                delta = (totals[1] - totals[0]) / totals[0] if len(totals) > 1 else 0.0
            else:
                delta = (totals[t] - totals[t - 1]) / totals[t - 1]
            # Use absolute change; direction doesn't matter for fragility
            raw_momentum.append(abs(delta))

        # Normalise to [0, 1]
        max_m = max(raw_momentum) if max(raw_momentum) > 0 else 1.0
        return [round(m / max_m, 4) for m in raw_momentum]