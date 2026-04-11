import datetime
from models.models import NFISnapshot
from config import NFI_WEIGHTS

class DriftDetectionAgent:

    def compute_nfi(self, signals):
        risk = sum(len(s.risk_terms) for s in signals)
        uncertainty = sum(len(s.uncertainty_terms) for s in signals)

        sentiment = sum(s.sentiment_score for s in signals) / max(len(signals),1)

        nfi = (
            NFI_WEIGHTS["w1"] * uncertainty +
            NFI_WEIGHTS["w2"] * risk +
            NFI_WEIGHTS["w3"] * abs(sentiment)
        )

        return NFISnapshot(
            timestamp=str(datetime.datetime.now()),
            nfi=nfi,
            components={}
        )