import requests
import feedparser
from datetime import datetime
from models.models import NarrativeSignal

NEWS_API_KEY = "790f52dfc5cb4f27a3f7b61d83d69150"

def fetch_live_narratives():
    narratives = []

    # NewsAPI
    try:
        url = f"https://newsapi.org/v2/everything?q=cloud OR cost OR SaaS&language=en&pageSize=5&apiKey={NEWS_API_KEY}"
        response = requests.get(url).json()

        for article in response.get("articles", []):
            narratives.append(
                NarrativeSignal(
                    source=article["source"]["name"],
                    text=article["title"],
                    timestamp=article["publishedAt"]
                )
            )
    except:
        print("News API failed")

    # RSS
    feeds = [
        "https://feeds.reuters.com/reuters/technologyNews",
        "https://techcrunch.com/feed/",
        "https://www.theverge.com/rss/index.xml"
    ]

    for feed in feeds:
        parsed = feedparser.parse(feed)
        for entry in parsed.entries[:3]:
            narratives.append(
                NarrativeSignal(
                    source=feed,
                    text=entry.title,
                    timestamp=str(datetime.now())
                )
            )

    print("Total live narratives fetched:", len(narratives))
    return narratives