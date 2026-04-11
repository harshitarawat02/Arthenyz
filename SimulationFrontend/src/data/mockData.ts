export interface NFIDataPoint {
  time: string;
  nfi: number;
  cost: number;
  predicted?: number;
  warning?: boolean;
}

export interface Risk {
  id: string;
  type: string;
  title: string;
  nfiScore: number;
  confidence: number;
  financialImpact: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "mitigated" | "monitoring";
  detectedAt: string;
  description: string;
  narrativeSignals: {
    themes: string[];
    sentimentScore: number;
    volatility: number;
  };
  rootCause: string;
  actionTaken: string;
  decisionLogic: string;
  impact: {
    beforeCost: number;
    afterCost: number;
    savingsPerMonth: number;
    savingsPerYear: number;
  };
}

export interface ActionEntry {
  id: string;
  timestamp: string;
  action: string;
  impact: string;
  agent: string;
  status: "completed" | "pending" | "in-progress";
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  trigger: string;
  decision: string;
  action: string;
  confidence: number;
  approval: "auto-approved" | "pending" | "approved" | "rejected";
  agent: string;
}

export const nfiData: NFIDataPoint[] = [
  { time: "00:00", nfi: 0.32, cost: 12400 },
  { time: "02:00", nfi: 0.35, cost: 12600 },
  { time: "04:00", nfi: 0.38, cost: 12500 },
  { time: "06:00", nfi: 0.41, cost: 12800 },
  { time: "08:00", nfi: 0.52, cost: 13100, warning: true },
  { time: "10:00", nfi: 0.68, cost: 13400 },
  { time: "12:00", nfi: 0.79, cost: 14200 },
  { time: "14:00", nfi: 0.85, cost: 15800 },
  { time: "16:00", nfi: 0.91, cost: 17400, predicted: 19200 },
  { time: "18:00", nfi: 0.78, cost: 15200, predicted: 20100 },
  { time: "20:00", nfi: 0.62, cost: 13800, predicted: 21000 },
  { time: "22:00", nfi: 0.48, cost: 12900, predicted: 21800 },
];

export const risks: Risk[] = [
  {
    id: "risk-001",
    type: "Cloud Over-Provisioning",
    title: "Compute Resource Spike Detected",
    nfiScore: 0.91,
    confidence: 94,
    financialImpact: "₹4,80,000/month",
    severity: "critical",
    status: "mitigated",
    detectedAt: "2 hours ago",
    description: "NFI spike detected 4 hours before cost surge. Earnings call language indicated 'demand uncertainty' — correlated with over-provisioned auto-scaling.",
    narrativeSignals: {
      themes: ["demand slowdown", "market uncertainty", "inventory excess"],
      sentimentScore: -0.72,
      volatility: 0.85,
    },
    rootCause: "Auto-scaling policies over-provisioned compute instances by 40% due to stale demand forecasts. Earnings narratives showed demand uncertainty 6 hours before cost materialized.",
    actionTaken: "Reduced compute instances by 35%. Adjusted auto-scaling thresholds. Updated demand forecast model weights.",
    decisionLogic: "NFI > 0.85 + Confidence > 90% + Semantic match to 'over-provisioning' pattern → Trigger automated resource scaling.",
    impact: {
      beforeCost: 1240000,
      afterCost: 760000,
      savingsPerMonth: 480000,
      savingsPerYear: 5760000,
    },
  },
  {
    id: "risk-002",
    type: "Vendor Duplication",
    title: "Redundant SaaS Subscriptions",
    nfiScore: 0.72,
    confidence: 87,
    financialImpact: "₹2,40,000/year",
    severity: "high",
    status: "active",
    detectedAt: "6 hours ago",
    description: "Semantic similarity analysis detected 3 overlapping vendor contracts for data analytics tooling.",
    narrativeSignals: {
      themes: ["tool consolidation", "vendor rationalization", "cost optimization"],
      sentimentScore: -0.45,
      volatility: 0.52,
    },
    rootCause: "Three separate departments procured overlapping analytics tools without cross-functional visibility.",
    actionTaken: "Flagged for vendor consolidation review. Recommended consolidating to single platform.",
    decisionLogic: "Semantic similarity > 0.8 across vendor descriptions + combined cost > threshold → Flag for consolidation.",
    impact: {
      beforeCost: 720000,
      afterCost: 480000,
      savingsPerMonth: 20000,
      savingsPerYear: 240000,
    },
  },
  {
    id: "risk-003",
    type: "SLA Breach Risk",
    title: "Delivery SLA Degradation",
    nfiScore: 0.65,
    confidence: 78,
    financialImpact: "₹1,20,000/month",
    severity: "medium",
    status: "monitoring",
    detectedAt: "12 hours ago",
    description: "Rising narrative signals around supply chain delays correlate with SLA performance degradation trends.",
    narrativeSignals: {
      themes: ["supply chain disruption", "logistics delays", "fulfillment risk"],
      sentimentScore: -0.58,
      volatility: 0.61,
    },
    rootCause: "Supply chain partner experiencing labor shortages, causing 15% increase in delivery times.",
    actionTaken: "Initiated task reassignment to backup fulfillment center. Monitoring SLA metrics in real-time.",
    decisionLogic: "SLA degradation trend + NFI > 0.6 + supply chain narrative signals → Preemptive task reassignment.",
    impact: {
      beforeCost: 360000,
      afterCost: 240000,
      savingsPerMonth: 120000,
      savingsPerYear: 1440000,
    },
  },
];

export const actionFeed: ActionEntry[] = [
  { id: "a1", timestamp: "14:32", action: "Scaled down 12 compute instances (us-east-1)", impact: "₹8,200/hr saved", agent: "Action Agent", status: "completed" },
  { id: "a2", timestamp: "14:28", action: "Updated auto-scaling threshold to 75%", impact: "₹3,400/hr saved", agent: "Action Agent", status: "completed" },
  { id: "a3", timestamp: "14:15", action: "Flagged 3 duplicate vendor contracts", impact: "₹20,000/mo potential", agent: "Decision Agent", status: "in-progress" },
  { id: "a4", timestamp: "13:52", action: "Reassigned 8 tasks to backup fulfillment", impact: "₹1,20,000/mo SLA recovery", agent: "Action Agent", status: "completed" },
  { id: "a5", timestamp: "13:40", action: "NFI spike detected — initiated root cause analysis", impact: "Early warning", agent: "Drift Detection Agent", status: "completed" },
  { id: "a6", timestamp: "13:22", action: "Ingested Q3 earnings transcript — 47 risk signals", impact: "Data enrichment", agent: "Ingestion Agent", status: "completed" },
];

export const auditLog: AuditEntry[] = [
  { id: "log-1", timestamp: "2024-03-29 14:32:18", trigger: "NFI > 0.85", decision: "Scale down compute", action: "Terminated 12 instances", confidence: 94, approval: "auto-approved", agent: "Action Agent" },
  { id: "log-2", timestamp: "2024-03-29 14:28:05", trigger: "NFI > 0.85", decision: "Adjust auto-scaling", action: "Threshold: 60% → 75%", confidence: 91, approval: "auto-approved", agent: "Action Agent" },
  { id: "log-3", timestamp: "2024-03-29 14:15:44", trigger: "Semantic similarity > 0.8", decision: "Flag vendor duplication", action: "Review initiated", confidence: 87, approval: "pending", agent: "Decision Agent" },
  { id: "log-4", timestamp: "2024-03-29 13:52:31", trigger: "SLA degradation trend", decision: "Reassign tasks", action: "8 tasks moved to backup", confidence: 78, approval: "approved", agent: "Action Agent" },
  { id: "log-5", timestamp: "2024-03-29 13:40:12", trigger: "NFI spike detected", decision: "Root cause analysis", action: "Analysis completed", confidence: 92, approval: "auto-approved", agent: "Drift Detection Agent" },
  { id: "log-6", timestamp: "2024-03-29 13:22:00", trigger: "Scheduled ingestion", decision: "Process transcript", action: "47 signals extracted", confidence: 96, approval: "auto-approved", agent: "Ingestion Agent" },
];

export const agentPipeline = [
  { id: "ingestion", name: "Ingestion Agent", status: "active" as const, output: "47 risk signals extracted from 3 sources", icon: "Database" },
  { id: "analysis", name: "Narrative Analysis", status: "active" as const, output: "Sentiment: -0.72 | Themes: demand slowdown, uncertainty", icon: "Brain" },
  { id: "drift", name: "Drift Detection", status: "active" as const, output: "NFI spike: 0.52 → 0.91 (4hr window)", icon: "TrendingUp" },
  { id: "decision", name: "Decision Agent", status: "active" as const, output: "Root cause: over-provisioning | Action: scale down 35%", icon: "GitBranch" },
  { id: "action", name: "Action Agent", status: "active" as const, output: "12 instances terminated | Savings: ₹8,200/hr", icon: "Zap" },
  { id: "audit", name: "Audit Agent", status: "active" as const, output: "Logged: trigger → decision → action | Confidence: 94%", icon: "Shield" },
];
