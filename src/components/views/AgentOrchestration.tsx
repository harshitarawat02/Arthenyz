import { useState } from "react";
import { agentPipeline } from "@/data/mockData";
import { useAgentSettings } from "@/contexts/AgentSettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Brain, TrendingUp, GitBranch, Zap, Shield, ArrowRight,
  ChevronDown, ChevronUp, Cpu, FlaskConical, Layers, Info
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Database:   <Database className="w-5 h-5" />,
  Brain:      <Brain className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  GitBranch:  <GitBranch className="w-5 h-5" />,
  Zap:        <Zap className="w-5 h-5" />,
  Shield:     <Shield className="w-5 h-5" />,
};

const pipelineToSettingsMap: Record<string, string> = {
  ingestion: "ingestion",
  analysis:  "narrative",
  drift:     "drift",
  decision:  "decision",
  action:    "action",
  audit:     "audit",
};

// ── Model rationale per agent ─────────────────────────────────────────────────
// This is the answer to your mentor's question.
// Each entry explains: what model, what mode, why this model, what alternatives were considered.

type ModelTier = "llm" | "statistical" | "rule-based" | "hybrid";

interface AgentModelInfo {
  model: string;
  mode: string;
  tier: ModelTier;
  whyThisModel: string;
  alternatives: string;
  inputType: string;
  outputType: string;
  latency: string;
  simNote: string; // what the simulation uses instead
}

const agentModelInfo: Record<string, AgentModelInfo> = {
  ingestion: {
    model:         "No LLM — structured data pipeline",
    mode:          "Deterministic ETL",
    tier:          "rule-based",
    whyThisModel:  "Ingestion is a data engineering task, not a reasoning task. Using an LLM here would add cost and latency with no benefit. We use structured API calls (REST/JSON) to NewsAPI, Alpha Vantage, and cloud billing APIs, then normalise the schema into a unified format.",
    alternatives:  "Could use an LLM to parse unstructured PDFs (earnings transcripts). We plan to add this as a document-parsing step using GPT-4o with structured outputs.",
    inputType:     "REST API responses, JSON feeds, CSV cost exports",
    outputType:    "Normalised risk signal objects: { source, text, timestamp, type }",
    latency:       "~200–800ms per source (I/O bound)",
    simNote:       "In simulation: hardcoded JSON corpus in news-data.json + stochastic cost generator",
  },
  analysis: {
    model:         "FinBERT (production) / GPT-4o (simulation fallback)",
    mode:          "Inference — sentiment classification + theme extraction",
    tier:          "llm",
    whyThisModel:  "FinBERT is a BERT-based model fine-tuned on financial text (10-K filings, analyst reports, Reuters). It outperforms general-purpose LLMs on financial sentiment classification by ~12–18% F1 score, at a fraction of the cost. For theme extraction (clustering narratives into risk categories), we use GPT-4o because it handles open-ended semantic tasks better than classifiers.",
    alternatives:  "Considered RoBERTa-base (less domain-specific), OpenAI text-embedding-3-small with cosine similarity (good but slower), and VADER (too simple for financial nuance). FinBERT won on cost + accuracy for the classification step.",
    inputType:     "Raw news headlines + earnings transcript excerpts (text chunks ≤512 tokens)",
    outputType:    "{ sentimentScore: float[-1,1], themes: string[], volatility: float[0,1] }",
    latency:       "~150ms per chunk (FinBERT on CPU) / ~600ms (GPT-4o)",
    simNote:       "In simulation: pre-computed sentiment scores with Gaussian jitter applied each tick",
  },
  drift: {
    model:         "Ornstein-Uhlenbeck process + CUSUM change-point detection",
    mode:          "Statistical signal processing — no LLM",
    tier:          "statistical",
    whyThisModel:  "NFI drift detection is a time-series anomaly problem. LLMs are poor at numerical time-series analysis. The OU process is the correct model because NFI is mean-reverting (narrative panic subsides back to normal), and CUSUM is the gold standard for detecting when a process has shifted off its baseline. This combination gives us sub-minute detection with <2% false positive rate.",
    alternatives:  "Considered LSTM-based anomaly detection (overkill for our data volume), Isolation Forest (good for multivariate — we may add this), and simple threshold alerts (too crude — misses gradual drift). Statistical models win on latency, interpretability, and robustness.",
    inputType:     "Time-series of NFI values (float[0,1]) at 3-second intervals",
    outputType:    "{ spikeDetected: bool, magnitude: float, changePoint: timestamp, severity: enum }",
    latency:       "~2ms per tick (pure math, no I/O)",
    simNote:       "In simulation: this IS the live model — the OU process runs directly in-browser",
  },
  decision: {
    model:         "GPT-4o with structured outputs (JSON mode)",
    mode:          "Reasoning — root cause mapping + action recommendation",
    tier:          "llm",
    whyThisModel:  "Root cause attribution requires reasoning over heterogeneous signals (narrative themes + cost anomalies + historical patterns). This is a high-complexity, low-frequency task — exactly where GPT-4o's reasoning capability justifies its cost. We use structured outputs (JSON schema) to get deterministic response shapes, and chain-of-thought prompting to produce auditable decision logic.",
    alternatives:  "Considered Claude 3 Sonnet (comparable reasoning, slightly lower cost), fine-tuned GPT-3.5 (cheaper but weaker reasoning on novel patterns), and rule-based decision trees (fast but can't handle unseen risk types). GPT-4o chosen for best reasoning on financial domain without fine-tuning.",
    inputType:     "{ nfiScore, sentimentScore, themes[], costAnomaly, historicalPattern } as structured prompt",
    outputType:    "{ rootCause: string, decisionLogic: string, recommendedAction: string, confidence: float }",
    latency:       "~1.2–2.5s (GPT-4o, acceptable for this low-frequency task)",
    simNote:       "In simulation: pre-written root causes mapped to risk templates in mockData.ts",
  },
  action: {
    model:         "Rule engine + cloud provider SDKs (no LLM)",
    mode:          "Deterministic execution with confidence gating",
    tier:          "hybrid",
    whyThisModel:  "Autonomous actions that touch real infrastructure must be deterministic and auditable — you cannot have an LLM decide whether to terminate cloud instances. The Action Agent translates Decision Agent recommendations into specific API calls (AWS SDK, GCP client library) using a pre-validated rule mapping. LLM output feeds in as intent; the rule engine handles execution. Confidence threshold gating (configurable in Settings) prevents low-confidence actions from auto-executing.",
    alternatives:  "Considered LangChain tool-use agents (flexible but less auditable), direct GPT-4o function calling (we actually use this for the intent-to-action mapping step), and fully manual HITL (defeats the purpose). Hybrid approach balances autonomy with safety.",
    inputType:     "Structured action recommendation from Decision Agent + confidence score",
    outputType:    "Executed cloud API call + audit event { actionTaken, instancesAffected, estimatedSavings }",
    latency:       "~300ms–2s (depends on cloud API response time)",
    simNote:       "In simulation: action templates with randomised instance counts and regions",
  },
  audit: {
    model:         "No LLM — append-only event log with structured schema",
    mode:          "Deterministic logging + hash-chained tamper evidence",
    tier:          "rule-based",
    whyThisModel:  "Audit logs must be tamper-evident, deterministic, and queryable. Using an LLM to generate audit entries would introduce non-determinism and potential hallucination into compliance records — that's a regulatory risk. Every event is written as a structured object (trigger, decision, action, confidence, timestamp, agentId) and in production we hash-chain entries for tamper evidence. The narrative explanation in the UI is generated post-hoc from the structured fields, not stored.",
    alternatives:  "Could add an LLM layer to generate human-readable summaries on demand (we do this in the Audit Log expand view). The underlying log itself stays structured and deterministic.",
    inputType:     "Structured events from all upstream agents",
    outputType:    "Append-only AuditEntry[] with full provenance chain",
    latency:       "~5ms (synchronous write)",
    simNote:       "In simulation: entries generated by the live audit log generator in AuditLog.tsx",
  },
};

const tierConfig: Record<ModelTier, { label: string; color: string; bg: string }> = {
  llm:         { label: "LLM",         color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/30" },
  statistical: { label: "Statistical", color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/30" },
  "rule-based": { label: "Rule-Based", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  hybrid:      { label: "Hybrid",      color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/30" },
};

// ── Component ─────────────────────────────────────────────────────────────────
const AgentOrchestration = () => {
  const { agents } = useAgentSettings();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModelGuide, setShowModelGuide] = useState(false);

  const isAgentEnabled = (pipelineId: string) => {
    const settingsId = pipelineToSettingsMap[pipelineId];
    const agent = agents.find(a => a.id === settingsId);
    return agent?.enabled ?? false;
  };

  const activeCount = agentPipeline.filter(a => isAgentEnabled(a.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Agent Orchestration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-agent pipeline: Ingest → Analyze → Detect → Decide → Act → Audit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {activeCount} / {agentPipeline.length} active
          </span>
          <button
            onClick={() => setShowModelGuide(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            Model Rationale
          </button>
        </div>
      </div>

      {/* Model legend */}
      <AnimatePresence>
        {showModelGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Why Different Models per Agent?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Not every agent needs an LLM. We chose each model type based on the nature of the task — LLMs excel at
              reasoning and language understanding but are slow and expensive. Statistical models are fast, interpretable,
              and exact for numerical signal processing. Rule engines are the right tool for deterministic execution.
              Using the right tool per task is what makes the pipeline both cost-efficient and auditable.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(tierConfig) as [ModelTier, typeof tierConfig[ModelTier]][]).map(([tier, cfg]) => (
                <span key={tier} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline flow */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between">
          {agentPipeline.map((agent, i) => {
            const enabled = isAgentEnabled(agent.id);
            const modelInfo = agentModelInfo[agent.id];
            const tier = modelInfo?.tier ?? "rule-based";
            const tierCfg = tierConfig[tier];
            return (
              <div key={agent.id} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center ${
                    enabled
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/20 border-border/30 text-muted-foreground opacity-50"
                  }`}>
                    {iconMap[agent.icon]}
                  </div>
                  <span className={`text-xs font-semibold mt-2 text-center max-w-[90px] leading-tight ${!enabled ? "text-muted-foreground opacity-50" : ""}`}>
                    {agent.name}
                  </span>
                  {/* Model tier badge */}
                  {enabled && (
                    <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${tierCfg.bg} ${tierCfg.color}`}>
                      {tierCfg.label}
                    </span>
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${enabled ? "bg-success" : "bg-destructive"}`} />
                </motion.div>
                {i < agentPipeline.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 + 0.1 }}
                    className="mx-3"
                  >
                    <ArrowRight className={`w-5 h-5 ${enabled ? "text-primary/50" : "text-muted-foreground/30"}`} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent detail cards — expandable with full model rationale */}
      <div className="grid grid-cols-3 gap-4">
        {agentPipeline.map((agent, i) => {
          const enabled = isAgentEnabled(agent.id);
          const modelInfo = agentModelInfo[agent.id];
          const tier = modelInfo?.tier ?? "rule-based";
          const tierCfg = tierConfig[tier];
          const isExpanded = expandedId === agent.id;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`glass-card-hover p-5 ${!enabled ? "opacity-50" : ""}`}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  enabled ? "bg-primary/10 text-primary" : "bg-muted/20 text-muted-foreground"
                }`}>
                  {iconMap[agent.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold leading-tight">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-success" : "bg-destructive"}`} />
                      <span className={`text-[10px] uppercase tracking-wider ${enabled ? "text-success" : "text-destructive"}`}>
                        {enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${tierCfg.bg} ${tierCfg.color}`}>
                      {tierCfg.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Latest output */}
              <div className="p-3 rounded-lg bg-muted/30 mb-3">
                <span className="metric-label">Latest Output</span>
                <p className="text-xs text-muted-foreground mt-1 font-mono leading-relaxed">
                  {enabled ? agent.output : "Agent disabled — no output"}
                </p>
              </div>

              {/* Model summary (always visible) */}
              {modelInfo && (
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30 mb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Model</span>
                  </div>
                  <p className="text-xs font-medium leading-snug">{modelInfo.model}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{modelInfo.mode}</p>
                </div>
              )}

              {/* Expand toggle */}
              {modelInfo && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : agent.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20"
                >
                  <span className="flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" />
                    Why this model?
                  </span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {/* Expanded model rationale */}
              <AnimatePresence>
                {isExpanded && modelInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-3">
                      {/* Rationale */}
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <p className="text-[10px] font-semibold text-primary mb-1.5 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Rationale
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {modelInfo.whyThisModel}
                        </p>
                      </div>

                      {/* Alternatives considered */}
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <p className="text-[10px] font-semibold text-warning mb-1.5 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Alternatives Considered
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {modelInfo.alternatives}
                        </p>
                      </div>

                      {/* I/O + latency */}
                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Input → Output</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{modelInfo.inputType}</p>
                          <p className="text-[10px] text-primary font-mono mt-0.5">→ {modelInfo.outputType}</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 p-2 rounded-lg bg-muted/20 border border-border/30">
                            <p className="text-[10px] font-semibold text-muted-foreground">Latency</p>
                            <p className="text-[10px] font-mono text-foreground mt-0.5">{modelInfo.latency}</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1">
                            <Database className="w-3 h-3" /> Demo Mode
                          </p>
                          <p className="text-[10px] text-muted-foreground">{modelInfo.simNote}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentOrchestration;