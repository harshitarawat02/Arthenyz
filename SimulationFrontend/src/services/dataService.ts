/**
 * Data Service Abstraction Layer
 * 
 * Currently uses SIMULATED data with realistic patterns.
 * To connect real APIs, swap the implementation in each provider function.
 * 
 * DATA SOURCES (current — all simulated):
 *  - NFI values: Generated using a stochastic model mimicking real-world
 *    narrative fragility patterns (mean-reverting process with spike events).
 *  - Cost data: Simulated cloud billing data correlated with NFI via a
 *    lagged response model (cost reacts ~4hrs after NFI movement).
 *  - Actions/Savings: Simulated autonomous agent decisions based on threshold logic.
 * 
 * FUTURE INTEGRATION POINTS:
 *  - Financial News: NewsAPI (newsapi.org) or Alpha Vantage for earnings data
 *  - Sentiment: OpenAI GPT-4 / HuggingFace FinBERT for real NLP analysis
 *  - Cloud Cost: AWS Cost Explorer API / GCP Billing API / Azure Cost Management
 *  - Agent Orchestration: LangGraph / CrewAI for real multi-agent coordination
 * 
 * NO API KEYS ARE USED — all data is algorithmically generated in-browser.
 */

import type { NFIDataPoint, ActionEntry } from "@/data/mockData";

// --- NFI Simulation Engine ---

// Mean-reverting NFI with occasional spikes (Ornstein-Uhlenbeck-like process)
const NFI_MEAN = 0.45;
const NFI_REVERSION_SPEED = 0.08;
const NFI_VOLATILITY = 0.04;
const NFI_SPIKE_PROB = 0.03; // 3% chance per tick of a spike event
const NFI_SPIKE_MAGNITUDE = 0.25;

let currentNFI = 0.42;
let currentCost = 12400;

export function generateNextNFIPoint(time: string): NFIDataPoint {
  // Mean-reverting random walk
  const drift = NFI_REVERSION_SPEED * (NFI_MEAN - currentNFI);
  const noise = NFI_VOLATILITY * (Math.random() - 0.5) * 2;
  const spike = Math.random() < NFI_SPIKE_PROB ? NFI_SPIKE_MAGNITUDE * (0.5 + Math.random() * 0.5) : 0;

  currentNFI = Math.max(0.1, Math.min(0.98, currentNFI + drift + noise + spike));

  // Cost follows NFI with a lag and amplification
  const costTarget = 12000 + currentNFI * 8000;
  currentCost += (costTarget - currentCost) * 0.15 + (Math.random() - 0.5) * 200;
  currentCost = Math.max(10000, currentCost);

  const isWarning = currentNFI > 0.65 && spike > 0;
  const predicted = currentNFI > 0.8 ? currentCost * (1.1 + Math.random() * 0.15) : undefined;

  return {
    time,
    nfi: Math.round(currentNFI * 100) / 100,
    cost: Math.round(currentCost),
    predicted: predicted ? Math.round(predicted) : undefined,
    warning: isWarning || undefined,
  };
}

// --- Savings Simulation ---

const SAVINGS_PER_SECOND = 3.22; // ₹3.22/sec ≈ ₹11,600/hr (realistic cloud savings rate)

export function calculateLiveSavings(baseSavings: number, elapsedSeconds: number): number {
  // Slight randomness to feel organic
  const jitter = Math.sin(elapsedSeconds * 0.1) * 0.5 + (Math.random() - 0.5) * 0.3;
  return baseSavings + Math.floor(elapsedSeconds * (SAVINGS_PER_SECOND + jitter));
}

// --- Live Action Generation ---

const liveActionTemplates = [
  { action: "Auto-scaled down {n} idle instances (region: {region})", impactBase: 2400, agent: "Action Agent" },
  { action: "Detected anomalous spend pattern in {service}", impactBase: 0, agent: "Drift Detection Agent" },
  { action: "Renegotiated spot pricing for {service} cluster", impactBase: 1800, agent: "Action Agent" },
  { action: "Terminated orphaned storage volumes ({n} GB)", impactBase: 800, agent: "Action Agent" },
  { action: "NFI micro-spike detected — monitoring escalated", impactBase: 0, agent: "Drift Detection Agent" },
  { action: "Consolidated duplicate {service} endpoints", impactBase: 3200, agent: "Decision Agent" },
  { action: "Ingested real-time cost telemetry — {n} signals", impactBase: 0, agent: "Ingestion Agent" },
  { action: "Rebalanced workload across availability zones", impactBase: 1500, agent: "Action Agent" },
];

const regions = ["us-east-1", "eu-west-1", "ap-south-1", "us-west-2"];
const services = ["EKS", "RDS", "Lambda", "S3", "EC2", "Redshift"];

export function generateLiveAction(): ActionEntry {
  const template = liveActionTemplates[Math.floor(Math.random() * liveActionTemplates.length)];
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const n = Math.floor(Math.random() * 20) + 3;
  const region = regions[Math.floor(Math.random() * regions.length)];
  const service = services[Math.floor(Math.random() * services.length)];

  const actionText = template.action
    .replace("{n}", String(n))
    .replace("{region}", region)
    .replace("{service}", service);

  const impact = template.impactBase > 0
    ? `₹${(template.impactBase + Math.floor(Math.random() * 1000)).toLocaleString("en-IN")}/hr saved`
    : "Monitoring";

  return {
    id: `live-${Date.now()}`,
    timestamp: timeStr,
    action: actionText,
    impact,
    agent: template.agent,
    status: Math.random() > 0.2 ? "completed" : "in-progress",
  };
}

// --- Data Source Info ---
export const DATA_SOURCE_INFO = {
  engine: "In-browser stochastic simulation",
  nfiModel: "Mean-reverting process with spike events (Ornstein-Uhlenbeck inspired)",
  costModel: "Lagged correlation to NFI with noise — mimics real cloud billing patterns",
  agentModel: "Threshold-based decision simulation (NFI > 0.85 → auto-action)",
  apiKeys: "None — no external APIs used",
  datasets: "All data is algorithmically generated. No external datasets.",
  readyForIntegration: [
    "NewsAPI / Alpha Vantage (financial news & earnings)",
    "OpenAI GPT-4 / FinBERT (real sentiment analysis)",
    "AWS Cost Explorer / GCP Billing (real cloud costs)",
    "LangGraph / CrewAI (real agent orchestration)",
  ],
};
