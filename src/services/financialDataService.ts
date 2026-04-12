/**
 * Financial Data Service
 *
 * Provides the FinancialDataResponse shape that NFIChart consumes.
 *
 * CURRENT MODE: Pure in-browser simulation.
 * No external API keys are required or used. All "source" data is algorithmically
 * generated to demonstrate what real integrations would look like.
 *
 * PRODUCTION SWAP: Replace `fetchFinancialData()` with real API calls to
 * Alpha Vantage, NewsData.io, or your backend. The response shape stays the same.
 */

export type SignalItem = {
  title: string;
  sentiment: string;
  score: string;
};

export type SourceStatus =
  | "connected"
  | "rate_limited"
  | "error"
  | "simulated"
  | "not_configured";

export type DataSourceInfo = {
  status: SourceStatus;
  message: string;
  avgSentiment?: string;
  nfiContribution?: string;
  articlesAnalyzed?: number;
  topSignals?: SignalItem[];
};

export type FinancialDataResponse = {
  blendedNFI: number;
  dataMode: "simulation" | "live" | "partial";
  sources: {
    alpha_vantage: DataSourceInfo;
    newsdata: DataSourceInfo;
  };
  // Legacy fields kept for compatibility
  nfi: number[];
  cost_projection: number[];
  risks: { type: string; confidence: number; impact: number; nfi: number }[];
  actions: { timestamp: string; action: string; saved: number }[];
};

// ── Simulated signal corpus ──────────────────────────────────────────────────
// These represent what real news sentiment signals would look like.
// In production, these come from Alpha Vantage News Sentiment API or NewsData.io.

const SIM_SIGNALS_AV: SignalItem[] = [
  { title: "Fed signals cautious rate path amid inflation uncertainty", sentiment: "Bearish",  score: "-0.61" },
  { title: "Tech sector earnings beat estimates; cloud demand rebounds",  sentiment: "Bullish",  score: "+0.72" },
  { title: "Supply chain disruptions persist in semiconductor space",      sentiment: "Bearish",  score: "-0.48" },
  { title: "RBI holds repo rate; accommodative stance maintained",        sentiment: "Neutral",  score: "+0.12" },
  { title: "Auto sector volumes decline 8% on weak rural demand",        sentiment: "Bearish",  score: "-0.55" },
];

const SIM_SIGNALS_ND: SignalItem[] = [
  { title: "India Q3 GDP growth revised upward to 7.2%",                  sentiment: "positive", score: "+0.68" },
  { title: "Crude oil prices surge on OPEC+ production cut extension",    sentiment: "negative", score: "-0.52" },
  { title: "IT exports face headwinds as US discretionary spend tightens", sentiment: "negative", score: "-0.44" },
  { title: "Domestic consumption indicators show resilience",              sentiment: "positive", score: "+0.58" },
  { title: "Banking NPA ratios improve to decade-low levels",             sentiment: "positive", score: "+0.63" },
];

// ── NFI blending from simulated signals ──────────────────────────────────────
function computeBlendedNFI(signals: SignalItem[]): number {
  const scores = signals.map(s => parseFloat(s.score));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  // NFI is inversely correlated with average sentiment (-1 → NFI 0.9, +1 → NFI 0.1)
  return Math.max(0.1, Math.min(0.99, 0.5 - avg * 0.35 + (Math.random() - 0.5) * 0.05));
}

// ── Main fetch function ───────────────────────────────────────────────────────
export async function fetchFinancialData(): Promise<FinancialDataResponse> {
  // Shuffle signals slightly each call to simulate live updates
  const avSignals  = [...SIM_SIGNALS_AV].sort(() => Math.random() - 0.5);
  const ndSignals  = [...SIM_SIGNALS_ND].sort(() => Math.random() - 0.5);
  const allSignals = [...avSignals, ...ndSignals];

  const blendedNFI = computeBlendedNFI(allSignals);

  // Derived per-source contributions
  const avNFI = computeBlendedNFI(avSignals);
  const ndNFI = computeBlendedNFI(ndSignals);

  const avAvgSentiment = (
    avSignals.map(s => parseFloat(s.score)).reduce((a, b) => a + b, 0) / avSignals.length
  ).toFixed(2);
  const ndAvgSentiment = (
    ndSignals.map(s => parseFloat(s.score)).reduce((a, b) => a + b, 0) / ndSignals.length
  ).toFixed(2);

  return {
    blendedNFI: Math.round(blendedNFI * 100) / 100,
    dataMode:   "simulation",

    sources: {
      alpha_vantage: {
        status:            "simulated",
        message:           "Running on simulated Alpha Vantage–style sentiment data. Plug in a real API key in Settings to go live.",
        avgSentiment:      avAvgSentiment,
        nfiContribution:   avNFI.toFixed(2),
        articlesAnalyzed:  avSignals.length,
        topSignals:        avSignals.slice(0, 3),
      },
      newsdata: {
        status:            "simulated",
        message:           "Running on simulated NewsData.io–style articles. Plug in a real API key in Settings to go live.",
        avgSentiment:      ndAvgSentiment,
        nfiContribution:   ndNFI.toFixed(2),
        articlesAnalyzed:  ndSignals.length,
        topSignals:        ndSignals.slice(0, 3),
      },
    },

    // Legacy fields
    nfi:             [blendedNFI],
    cost_projection: [12000 + blendedNFI * 8000],
    risks:           [],
    actions:         [],
  };
}

// ── UI label helper ───────────────────────────────────────────────────────────
export function getDataModeLabel(mode?: string): string {
  switch (mode) {
    case "live":       return "Live AI Intelligence";
    case "partial":    return "Partial Live Data";
    case "simulation": return "Simulated Intelligence";
    default:           return "Simulated Intelligence";
  }
}