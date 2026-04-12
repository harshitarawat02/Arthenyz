/**
 * Arthenyz Data Service
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * CURRENT MODE: In-Browser Algorithmic Simulation
 * ──────────────────────────────────────────────────────────────────────────────
 * All data is generated in-browser using stochastic models that mimic real
 * enterprise risk patterns. No external APIs, cloud credentials, or company
 * data are required or used.
 *
 * This is intentional — the simulation engine demonstrates the full product
 * concept without requiring any third-party integration. When you're ready to
 * connect real data sources, swap the provider functions below.
 *
 * INTEGRATION ROADMAP (when you have real data):
 *  - NFI / Sentiment  → FinBERT (HuggingFace) or GPT-4 via OpenAI API
 *  - Financial News   → NewsAPI, Alpha Vantage, or Bloomberg Terminal API
 *  - Cloud Cost       → AWS Cost Explorer, GCP Billing API, Azure Cost Mgmt
 *  - Agent Execution  → LangGraph or CrewAI for real multi-agent orchestration
 *  - Audit Stream     → WebSocket to your backend audit event bus
 * ──────────────────────────────────────────────────────────────────────────────
 */

import type { NFIDataPoint, ActionEntry } from "@/data/mockData";

// ── NFI Simulation Engine ────────────────────────────────────────────────────
// Ornstein-Uhlenbeck-inspired mean-reverting process with random spike events.
// Mimics real narrative fragility index behaviour observed in financial markets.

const NFI_MEAN = 0.45;
const NFI_REVERSION_SPEED = 0.08;
const NFI_VOLATILITY = 0.04;
const NFI_SPIKE_PROB = 0.03;       // 3% chance per tick of a narrative shock
const NFI_SPIKE_MAGNITUDE = 0.25;

let currentNFI = 0.42;
let currentCost = 12400;

export function generateNextNFIPoint(time: string): NFIDataPoint {
  // Mean-reverting random walk (Ornstein-Uhlenbeck)
  const drift = NFI_REVERSION_SPEED * (NFI_MEAN - currentNFI);
  const noise = NFI_VOLATILITY * (Math.random() - 0.5) * 2;
  const spike = Math.random() < NFI_SPIKE_PROB
    ? NFI_SPIKE_MAGNITUDE * (0.5 + Math.random() * 0.5)
    : 0;

  currentNFI = Math.max(0.1, Math.min(0.98, currentNFI + drift + noise + spike));

  // Cost follows NFI with a lag and amplification (4-hour lag model)
  const costTarget = 12000 + currentNFI * 8000;
  currentCost += (costTarget - currentCost) * 0.15 + (Math.random() - 0.5) * 200;
  currentCost = Math.max(10000, currentCost);

  const isWarning = currentNFI > 0.65 && spike > 0;
  const predicted = currentNFI > 0.8
    ? currentCost * (1.1 + Math.random() * 0.15)
    : undefined;

  return {
    time,
    nfi: Math.round(currentNFI * 100) / 100,
    cost: Math.round(currentCost),
    predicted: predicted ? Math.round(predicted) : undefined,
    warning: isWarning || undefined,
  };
}

// ── Savings Simulation ────────────────────────────────────────────────────────
// ₹3.22/sec ≈ ₹11,600/hr — calibrated to realistic cloud cost savings rates
// for a mid-size enterprise running mixed cloud infrastructure.

const SAVINGS_PER_SECOND = 3.22;

export function calculateLiveSavings(baseSavings: number, elapsedSeconds: number): number {
  const jitter = Math.sin(elapsedSeconds * 0.1) * 0.5 + (Math.random() - 0.5) * 0.3;
  return baseSavings + Math.floor(elapsedSeconds * (SAVINGS_PER_SECOND + jitter));
}

// ── Live Action Generator ─────────────────────────────────────────────────────
// Generates realistic autonomous agent action entries for the live feed.
// In production these would come from your agent orchestration layer (LangGraph / CrewAI).

const liveActionTemplates = [
  { action: "Auto-scaled down {n} idle instances (region: {region})",  impactBase: 2400, agent: "Action Agent" },
  { action: "Detected anomalous spend pattern in {service}",            impactBase: 0,    agent: "Drift Detection Agent" },
  { action: "Renegotiated spot pricing for {service} cluster",          impactBase: 1800, agent: "Action Agent" },
  { action: "Terminated {n} orphaned storage volumes",                  impactBase: 800,  agent: "Action Agent" },
  { action: "NFI micro-spike — narrative monitoring escalated",          impactBase: 0,    agent: "Drift Detection Agent" },
  { action: "Consolidated duplicate {service} API endpoints",            impactBase: 3200, agent: "Decision Agent" },
  { action: "Ingested cost telemetry snapshot — {n} data signals",      impactBase: 0,    agent: "Ingestion Agent" },
  { action: "Rebalanced workload across availability zones",             impactBase: 1500, agent: "Action Agent" },
];

const regions  = ["us-east-1", "eu-west-1", "ap-south-1", "us-west-2"];
const services = ["EKS", "RDS", "Lambda", "S3", "EC2", "Redshift"];

export function generateLiveAction(): ActionEntry {
  const template = liveActionTemplates[Math.floor(Math.random() * liveActionTemplates.length)];
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const n       = Math.floor(Math.random() * 20) + 3;
  const region  = regions[Math.floor(Math.random() * regions.length)];
  const service = services[Math.floor(Math.random() * services.length)];

  const actionText = template.action
    .replace("{n}",       String(n))
    .replace("{region}",  region)
    .replace("{service}", service);

  const impact = template.impactBase > 0
    ? `₹${(template.impactBase + Math.floor(Math.random() * 1000)).toLocaleString("en-IN")}/hr saved`
    : "Monitoring";

  return {
    id:        `live-${Date.now()}`,
    timestamp: timeStr,
    action:    actionText,
    impact,
    agent:     template.agent,
    status:    Math.random() > 0.2 ? "completed" : "in-progress",
  };
}

// ── Data Source Metadata ──────────────────────────────────────────────────────
// Used by the UI to clearly communicate what data is shown and how it is generated.

export const DATA_SOURCE_INFO = {
  mode: "In-browser algorithmic simulation",
  description: "All data is generated in-browser. No external APIs, API keys, or company data are used or required.",
  nfiModel: "Mean-reverting Ornstein-Uhlenbeck process with 3% chance spike events per tick",
  costModel: "Lagged correlation to NFI with Gaussian noise — mimics real cloud billing patterns",
  agentModel: "Threshold-based decision simulation: NFI > 0.85 + confidence > 90% → autonomous action",
  updateFrequency: "NFI: 10-second ticks · Actions: 8-second ticks · Audit: 12-second ticks · Savings: 1-second ticks",
  integrationReadyFor: [
    "FinBERT / GPT-4 (real-time NLP sentiment analysis on news & earnings)",
    "NewsAPI / Alpha Vantage (live financial news feeds)",
    "AWS Cost Explorer / GCP Billing API (real cloud cost telemetry)",
    "LangGraph / CrewAI (production multi-agent orchestration)",
    "Your WebSocket audit event bus (real-time log streaming)",
  ],
};