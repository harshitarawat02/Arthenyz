from utils.live_data import fetch_live_narratives

class IngestionAgent:
    def ingest(self):
        print("Fetching LIVE narratives...")
        data = fetch_live_narratives()
        print("Fetched:", len(data))
        return data