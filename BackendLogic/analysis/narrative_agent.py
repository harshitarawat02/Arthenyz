from models.models import AnalysedSignal

RISK_KEYWORDS = ["risk","slowdown","waste","duplicate","overlap"]
UNCERTAINTY_TERMS = ["uncertain","cautious","possible"]

class NarrativeAnalysisAgent:

    def analyse(self, signals):
        analysed = []

        for sig in signals:
            text = sig.text.lower()

            risk = [w for w in RISK_KEYWORDS if w in text]
            uncertainty = [w for w in UNCERTAINTY_TERMS if w in text]

            sentiment = -0.5 if risk else 0.3

            themes = []
            if "duplicate" in text:
                themes.append("vendor-overlap")
            if "slowdown" in text:
                themes.append("demand-slowdown")
            if "waste" in text:
                themes.append("cost-spike")

            analysed.append(
                AnalysedSignal(
                    source=sig.source,
                    themes=themes,
                    sentiment_score=sentiment,
                    uncertainty_terms=uncertainty,
                    risk_terms=risk,
                    timestamp=sig.timestamp
                )
            )

        return analysed