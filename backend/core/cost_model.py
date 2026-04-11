"""
CostModel
=========
Projects future cost totals from the ingested cost signals using
a compound growth model with anomaly-adjusted trend extrapolation.

Projection method:
  1. Compute average monthly growth rate from ingested totals
  2. Detect if an anomaly spike inflects the trend
  3. Extrapolate forward using the adjusted rate
  4. Return projected totals in thousands (USD) as integers
     — matching the frontend schema format.
"""

import math
from typing import Any


class CostModel:
    """Projects cost trajectories from ingested enterprise cost signals."""

    def project(self, signals: dict[str, Any]) -> list[int]:
        """
        Build a cost projection series from ingested cost signals.

        The projection covers the same window length as the ingested
        signals so that the NFI and cost series stay aligned on the
        frontend charts.

        Args:
            signals: Output from IngestionAgent.fetch_signals()

        Returns:
            List of projected cost totals in thousands (USD) as integers.
            Example: [100, 120, 150, 190, 230]
        """
        totals: list[float] = signals["totals"]
        anomaly_flags: list[bool] = signals["anomaly_flags"]
        window: int = signals["window"]

        if not totals:
            return [0] * window

        # Compute period-over-period growth rates (excluding spike months)
        growth_rates = self._clean_growth_rates(totals, anomaly_flags)
        base_rate = (
            sum(growth_rates) / len(growth_rates) if growth_rates else 0.05
        )

        # Spike amplifier: if anomaly detected, inflate projected rate
        spike_amplifier = 1.0
        if any(anomaly_flags):
            spike_amplifier = 1.18  # 18% additional projected growth

        projected: list[int] = []
        current = totals[0]

        for t in range(window):
            if t == 0:
                projected.append(self._to_thousands(current))
            else:
                effective_rate = base_rate * spike_amplifier
                current = current * (1.0 + effective_rate)
                projected.append(self._to_thousands(current))

        return projected

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _clean_growth_rates(
        self,
        totals: list[float],
        anomaly_flags: list[bool],
    ) -> list[float]:
        """
        Compute month-over-month growth rates, excluding anomaly months
        to prevent spike contamination of the baseline trend.
        """
        rates = []
        for t in range(1, len(totals)):
            if anomaly_flags[t]:
                continue  # skip spike months
            if totals[t - 1] == 0:
                continue
            rate = (totals[t] - totals[t - 1]) / totals[t - 1]
            rates.append(rate)
        return rates

    def _to_thousands(self, value: float) -> int:
        """Convert a raw USD value to rounded thousands (int)."""
        return int(round(value / 1_000))