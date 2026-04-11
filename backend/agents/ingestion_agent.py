"""
IngestionAgent
==============
Uses local JSON news data OR fallback simulation to generate cost signals.
"""

import random
import os
import json
from typing import Any


class IngestionAgent:
    """Simulates multi-source cost signal ingestion for the Arthenyx platform."""

    COST_CATEGORIES = [
        "cloud_compute",
        "cloud_storage",
        "data_transfer",
        "saas_licenses",
        "on_prem_infra",
    ]

    BASELINES = {
        "cloud_compute": 42000,
        "cloud_storage": 18000,
        "data_transfer": 9500,
        "saas_licenses": 15000,
        "on_prem_infra": 21000,
    }

    WINDOW = 5

    def fetch_signals(self) -> dict[str, Any]:
        json_path = "data/news-data.json"

        # ---------- USE JSON DATA ----------
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                data = json.load(f)

            totals = []

            for item in data[:self.WINDOW]:
                text = (
                    (item.get("title", "") or "") +
                    " " +
                    (item.get("description", "") or "")
                ).lower()

                # base cost signal
                score = 100

                # simulate impact from news
                if "cost" in text or "inflation" in text:
                    score += 40
                if "risk" in text or "loss" in text:
                    score += 30
                if "growth" in text or "profit" in text:
                    score += 10

                totals.append(score)

            # anomaly detection
            baseline_total = totals[0] if totals else 100

            anomaly_flags = [
                total > baseline_total * 1.15 for total in totals
            ]

            spike_month = next(
                (i for i, flag in enumerate(anomaly_flags) if flag),
                None
            )

            return {
                "categories": {},
                "totals": totals,
                "anomaly_flags": anomaly_flags,
                "spike_month": spike_month,
                "window": len(totals),
            }

        # ---------- FALLBACK SIMULATION ----------
        random.seed(42)

        categories = {}
        for cat, base in self.BASELINES.items():
            series = self._generate_cost_series(base, self.WINDOW)
            categories[cat] = series

        totals = [
            round(sum(categories[cat][t] for cat in self.COST_CATEGORIES), 2)
            for t in range(self.WINDOW)
        ]

        baseline_total = totals[0]

        anomaly_flags = [
            total > baseline_total * 1.15 for total in totals
        ]

        spike_month = next(
            (i for i, flag in enumerate(anomaly_flags) if flag),
            None
        )

        return {
            "categories": categories,
            "totals": totals,
            "anomaly_flags": anomaly_flags,
            "spike_month": spike_month,
            "window": self.WINDOW,
        }

    # ---------- HELPER ----------
    def _generate_cost_series(self, base: float, window: int) -> list[float]:
        series = []
        current = base

        for i in range(window):
            drift = 1.0 + random.uniform(0.00, 0.04)
            noise = 1.0 + random.uniform(-0.03, 0.03)

            spike = (
                1.35 if i == 3 and base == self.BASELINES["cloud_compute"]
                else 1.0
            )

            current = current * drift * noise * spike
            series.append(round(current, 2))

        return series