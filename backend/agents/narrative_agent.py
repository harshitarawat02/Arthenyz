import requests
import os
import random
import math


class NarrativeAgent:

    def compute_volatility(self, signals):
        api_key = os.getenv("ALPHA_VANTAGE_KEY")

        if not api_key:
            return [0.3, 0.35, 0.4, 0.55, 0.6]

        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey={api_key}"

        try:
            r = requests.get(url)
            data = r.json()

            feed = data.get("feed", [])[:5]

            scores = []
            for item in feed:
                score = item.get("overall_sentiment_score", 0)
                scores.append(abs(score))

            if not scores:
                return [0.3, 0.35, 0.4, 0.55, 0.6]

            return [round(min(1.0, s), 2) for s in scores]

        except Exception:
            return [0.3, 0.35, 0.4, 0.55, 0.6]