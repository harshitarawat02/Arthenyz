import { useState, useEffect } from "react";
import { risks as initialRisks, Risk } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, Search, Zap, IndianRupee, TrendingDown, TrendingUp,
  RefreshCw, AlertTriangle, Clock, CheckCircle2, Activity, BarChart3
} from "lucide-react";

// ── Live risk data augmentation ───────────────────────────────────────────────
// Simulates the NFI score and confidence drifting in real-time
function useLiveRisk(riskId: string) {
  const base = initialRisks.find(r => r.id === riskId) ?? initialRisks[0];
  const [risk, setRisk] = useState<Risk>(base);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const base = initialRisks.find(r => r.id === riskId) ?? initialRisks[0];
    setRisk(base);
    setLastUpdated(new Date());
  }, [riskId]);

  // Drift NFI score slightly every 5 seconds to show it's live
  useEffect(() => {
    const interval = setInterval(() => {
      setRisk(prev => {
        const drift = (Math.random() - 0.48) * 0.03;
        const newNfi = Math.max(0.1, Math.min(0.99, prev.nfiScore + drift));
        const newConf = Math.max(50, Math.min(99, prev.confidence + Math.round((Math.random() - 0.5) * 3)));
        // Recalculate severity dynamically
        const severity: Risk["severity"] =
          newNfi > 0.85 ? "critical" :
          newNfi > 0.70 ? "high" :
          newNfi > 0.50 ? "medium" : "low";
        return { ...prev, nfiScore: Math.round(newNfi * 100) / 100, confidence: newConf, severity };
      });
      setLastUpdated(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 5000);
    return () => clearInterval(interval);
  }, [riskId]);

  return { risk, lastUpdated, pulse };
}

// ── Sub-components ────────────────────────────────────────────────────────────
const SeverityRing = ({ nfi, severity }: { nfi: number; severity: string }) => {
  const colors: Record<string, { stroke: string; glow: string; text: string }> = {
    critical: { stroke: "stroke-destructive",    glow: "drop-shadow(0 0 8px hsl(var(--destructive)))", text: "text-destructive" },
    high:     { stroke: "stroke-warning",        glow: "drop-shadow(0 0 8px hsl(var(--warning)))",     text: "text-warning" },
    medium:   { stroke: "stroke-primary",        glow: "drop-shadow(0 0 8px hsl(var(--primary)))",     text: "text-primary" },
    low:      { stroke: "stroke-success",        glow: "drop-shadow(0 0 8px hsl(var(--success)))",     text: "text-success" },
  };
  const c = colors[severity] ?? colors.medium;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dashArray = circ;
  const dashOffset = circ * (1 - nfi);

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90" style={{ filter: c.glow }}>
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="6" className="stroke-muted/30" />
        <circle
          cx="48" cy="48" r={r} fill="none" strokeWidth="6"
          strokeLinecap="round"
          className={c.stroke}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-bold font-mono ${c.text}`}>{nfi.toFixed(2)}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">NFI</span>
      </div>
    </div>
  );
};

const StatusChip = ({ status }: { status: Risk["status"] }) => {
  const cfg = {
    active:     { bg: "bg-destructive/10 border-destructive/30", text: "text-destructive",  icon: <Activity className="w-3 h-3" />, label: "Active" },
    mitigated:  { bg: "bg-success/10 border-success/30",         text: "text-success",       icon: <CheckCircle2 className="w-3 h-3" />, label: "Mitigated" },
    monitoring: { bg: "bg-warning/10 border-warning/30",         text: "text-warning",       icon: <Clock className="w-3 h-3" />, label: "Monitoring" },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ── Data Source Banner ────────────────────────────────────────────────────────
const DataSourceBanner = ({ lastUpdated, pulse }: { lastUpdated: Date; pulse: boolean }) => (
  <motion.div
    animate={{ opacity: pulse ? [1, 0.4, 1] : 1 }}
    transition={{ duration: 0.6 }}
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs"
  >
    <span className={`w-1.5 h-1.5 rounded-full bg-primary ${pulse ? "animate-ping" : "animate-pulse"}`} />
    <span className="text-muted-foreground">
      <span className="text-primary font-medium">Live simulation</span>
      {" "}— NFI & confidence updated by in-browser stochastic model.
      Last tick: <span className="font-mono">{lastUpdated.toLocaleTimeString()}</span>
    </span>
  </motion.div>
);

// ── Signal Timeline (dynamic based on risk age) ───────────────────────────────
function buildTimeline(risk: Risk) {
  // Parse "X hours ago" and build a backward timeline
  const match = risk.detectedAt.match(/(\d+)\s*(hour|minute)/);
  const hours = match ? (match[2] === "hour" ? parseInt(match[1]) : 1) : 4;
  const now = new Date();
  const events = [
    { offset: hours, label: "Narrative signal detected", detail: `Ingestion Agent extracted ${Math.floor(Math.random() * 30) + 20} risk signals`, type: "info" },
    { offset: hours - 1, label: "NFI threshold crossed", detail: `Score: ${(risk.nfiScore * 0.7).toFixed(2)} → ${risk.nfiScore.toFixed(2)}`, type: "warn" },
    { offset: Math.max(0, hours - 2), label: "Decision Agent triggered", detail: risk.decisionLogic.substring(0, 60) + "…", type: "action" },
    { offset: 0, label: "Action executed", detail: risk.actionTaken.substring(0, 60) + "…", type: "success" },
  ];
  return events.map(e => ({
    ...e,
    time: new Date(now.getTime() - e.offset * 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));
}

// ── Main component ────────────────────────────────────────────────────────────
interface RiskDetailProps {
  riskId: string;
  onBack: () => void;
}

const RiskDetail = ({ riskId, onBack }: RiskDetailProps) => {
  const { risk, lastUpdated, pulse } = useLiveRisk(riskId);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "signals">("overview");
  const timeline = buildTimeline(risk);

  const severityColor: Record<string, string> = {
    critical: "text-destructive",
    high: "text-warning",
    medium: "text-primary",
    low: "text-success",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
        <button onClick={onBack} className="glass-card p-2 hover:bg-accent transition-colors mt-1">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{risk.title}</h1>
            <StatusChip status={risk.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{risk.type} · Detected {risk.detectedAt}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SeverityRing nfi={risk.nfiScore} severity={risk.severity} />
        </div>
      </motion.div>

      {/* Live data source info */}
      <DataSourceBanner lastUpdated={lastUpdated} pulse={pulse} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/20 rounded-lg w-fit border border-border/30">
        {(["overview", "timeline", "signals"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-5"
          >
            {/* Narrative Signals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold">Narrative Signals</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="metric-label">Extracted Themes</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {risk.narrativeSignals.themes.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="metric-label">Sentiment Score</span>
                    <p className={`metric-value text-lg ${risk.narrativeSignals.sentimentScore < -0.5 ? "text-destructive" : "text-warning"}`}>
                      {risk.narrativeSignals.sentimentScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {risk.narrativeSignals.sentimentScore < -0.6 ? "Strongly negative" : "Mildly negative"}
                    </p>
                  </div>
                  <div>
                    <span className="metric-label">Volatility Index</span>
                    <p className="metric-value text-lg text-warning">{risk.narrativeSignals.volatility}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {risk.narrativeSignals.volatility > 0.7 ? "High volatility" : "Moderate volatility"}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="metric-label">Description</span>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{risk.description}</p>
                </div>
              </div>
            </motion.div>

            {/* Root Cause */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-warning" />
                <h2 className="text-base font-semibold">Root Cause Analysis</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{risk.rootCause}</p>
              <div className="mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <span className="text-xs font-semibold text-warning">Decision Logic</span>
                <p className="text-xs text-muted-foreground mt-1 font-mono leading-relaxed">{risk.decisionLogic}</p>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                <span className="text-xs font-semibold text-muted-foreground">Confidence</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      animate={{ width: `${risk.confidence}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-sm font-bold font-mono text-primary">{risk.confidence}%</span>
                </div>
              </div>
            </motion.div>

            {/* Action Taken */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-success" />
                <h2 className="text-base font-semibold">Action Taken</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{risk.actionTaken}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success font-medium">
                  {risk.status === "mitigated" ? "Action executed and verified" :
                   risk.status === "monitoring" ? "Action in progress — monitoring" :
                   "Pending human approval"}
                </span>
              </div>
            </motion.div>

            {/* Impact */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="w-5 h-5 text-success" />
                <h2 className="text-base font-semibold">Impact Calculation</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
                  <span className="metric-label">Before</span>
                  <p className="text-lg font-bold text-destructive font-mono flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    ₹{(risk.impact.beforeCost / 100000).toFixed(1)}L
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">monthly cost</p>
                </div>
                <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
                  <span className="metric-label">After</span>
                  <p className="text-lg font-bold text-success font-mono flex items-center justify-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    ₹{(risk.impact.afterCost / 100000).toFixed(1)}L
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">monthly cost</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="metric-label">Savings / Month</span>
                  <p className="metric-value text-lg text-success">₹{(risk.impact.savingsPerMonth / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <span className="metric-label">Savings / Year</span>
                  <p className="metric-value text-lg text-success">₹{(risk.impact.savingsPerYear / 100000).toFixed(1)}L</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-[10px] text-muted-foreground">
                  Calculated from simulated cloud billing telemetry. NFI-correlated cost model with lagged response (cost reacts ~4 hrs after NFI movement).
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "timeline" && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold">Event Timeline</h2>
              <span className="text-xs text-muted-foreground ml-2">Reconstructed from agent logs</span>
            </div>
            <div className="relative space-y-0">
              {timeline.map((event, i) => {
                const dotColor =
                  event.type === "success" ? "bg-success" :
                  event.type === "warn" ? "bg-warning" :
                  event.type === "action" ? "bg-primary" : "bg-muted-foreground";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 pb-6 last:pb-0 relative"
                  >
                    {/* Line */}
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[11px] top-5 bottom-0 w-px bg-border/50" />
                    )}
                    {/* Dot */}
                    <div className={`w-5 h-5 rounded-full ${dotColor} flex-shrink-0 mt-0.5 ring-4 ring-background`} />
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">{event.label}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "signals" && (
          <motion.div
            key="signals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold">Signal Breakdown</h2>
            </div>
            <div className="space-y-4">
              {risk.narrativeSignals.themes.map((theme, i) => {
                const strength = Math.max(40, 95 - i * 15 + Math.floor(Math.random() * 10));
                return (
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-medium capitalize">{theme}</span>
                      <span className="font-mono text-primary">{strength}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground">
                Signal strengths derived from semantic similarity scoring against a corpus of {Math.floor(Math.random() * 50) + 80} financial risk patterns.
                Powered by in-browser NLP simulation (production would use FinBERT or GPT-4 for real NLP analysis).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiskDetail;