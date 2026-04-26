import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, XCircle, ShieldCheck, Search,
  Filter, Download, ChevronDown, ChevronRight, RefreshCw,
  AlertTriangle, Zap, Brain, Database, TrendingUp, Shield
} from "lucide-react";
import { auditLog as initialLog, AuditEntry } from "@/data/mockData";
import { useAgentSettings } from "@/contexts/AgentSettingsContext";

// ── Live audit entry generator ────────────────────────────────────────────────
const AGENTS = ["Action Agent", "Decision Agent", "Drift Detection Agent", "Ingestion Agent", "Narrative Agent", "Audit Agent"];
const TRIGGERS = [
  "NFI > 0.85", "NFI > 0.70", "Semantic similarity > 0.8",
  "SLA degradation trend", "Scheduled ingestion", "Cost anomaly detected",
  "Vendor duplication signal", "Confidence threshold breach"
];
const DECISIONS = [
  "Scale down compute", "Adjust auto-scaling", "Flag vendor duplication",
  "Reassign tasks", "Root cause analysis", "Process transcript",
  "Initiate cost recovery", "Escalate to human review"
];
const ACTIONS = [
  "Terminated 8 instances", "Threshold updated 60%→75%", "Review initiated",
  "6 tasks moved to backup", "Analysis completed", "39 signals extracted",
  "Spot pricing renegotiated", "Human review requested"
];
const APPROVALS: AuditEntry["approval"][] = ["auto-approved", "approved", "pending", "rejected"];

function generateLiveEntry(): AuditEntry {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const triggerIdx = Math.floor(Math.random() * TRIGGERS.length);
  const decisionIdx = Math.floor(Math.random() * DECISIONS.length);
  const approval = APPROVALS[Math.floor(Math.random() * APPROVALS.length)];
  return {
    id: `log-live-${Date.now()}`,
    timestamp: ts,
    trigger: TRIGGERS[triggerIdx],
    decision: DECISIONS[decisionIdx],
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    confidence: Math.floor(Math.random() * 25) + 72,
    approval,
    agent: AGENTS[Math.floor(Math.random() * AGENTS.length)],
  };
}

// ── Detailed narrative per entry (what actually happened) ─────────────────────
function buildNarrative(entry: AuditEntry): string {
  const narratives: Record<string, string> = {
    "NFI > 0.85": `Narrative Fragility Index crossed the 0.85 critical threshold. The Drift Detection Agent observed a sustained spike in financial narrative sentiment, correlating negative earnings language with historical cost-surge patterns. This triggered immediate autonomous response.`,
    "NFI > 0.70": `NFI entered the elevated-risk band (0.70–0.85). The system issued an early-warning signal and began escalated monitoring. No immediate action was taken, but Decision Agent queued contingency plans.`,
    "Semantic similarity > 0.8": `The Ingestion Agent analysed vendor contract descriptions and found semantic similarity exceeding 0.8 across three procurement documents. This indicates probable redundant spend. Decision Agent flagged for consolidation review.`,
    "SLA degradation trend": `A statistically significant downward trend in SLA performance metrics was detected over the prior 4-hour window. Root cause was traced to a supply-chain partner with elevated fulfilment latency. Proactive task reassignment was triggered.`,
    "Scheduled ingestion": `Routine 6-hour ingestion cycle ran successfully. The Ingestion Agent processed earnings transcripts and news feeds, extracted risk signals, and passed structured output to the Narrative Analysis Agent.`,
    "Cost anomaly detected": `Real-time cost telemetry showed a 23% deviation above the rolling 7-day baseline. The Action Agent cross-referenced with NFI trends and determined the anomaly was correlated with over-provisioned auto-scaling groups.`,
    "Vendor duplication signal": `Three separate SaaS contracts for overlapping analytics capabilities were detected via semantic clustering. Combined redundant spend estimated at ₹2,40,000/year. Human review was requested before consolidation action.`,
    "Confidence threshold breach": `Agent decision confidence dropped below the configured threshold. Action was halted and escalated to human review to prevent a low-confidence automated change from impacting production systems.`,
  };
  return narratives[entry.trigger] ?? `Agent ${entry.agent} processed trigger "${entry.trigger}" and executed decision: "${entry.decision}". All steps were logged with a confidence score of ${entry.confidence}%.`;
}

// ── Badge config ──────────────────────────────────────────────────────────────
const approvalBadge: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "auto-approved": { bg: "bg-emerald-500/10 border border-emerald-500/30", text: "text-emerald-400", icon: <ShieldCheck className="w-3 h-3" /> },
  approved:        { bg: "bg-green-500/10 border border-green-500/30",   text: "text-green-400",   icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:         { bg: "bg-amber-500/10 border border-amber-500/30",   text: "text-amber-400",   icon: <Clock className="w-3 h-3" /> },
  rejected:        { bg: "bg-red-500/10 border border-red-500/30",       text: "text-red-400",     icon: <XCircle className="w-3 h-3" /> },
};

const agentIcon: Record<string, React.ReactNode> = {
  "Action Agent":          <Zap className="w-3.5 h-3.5 text-primary" />,
  "Decision Agent":        <Brain className="w-3.5 h-3.5 text-warning" />,
  "Drift Detection Agent": <TrendingUp className="w-3.5 h-3.5 text-destructive" />,
  "Ingestion Agent":       <Database className="w-3.5 h-3.5 text-blue-400" />,
  "Narrative Agent":       <Brain className="w-3.5 h-3.5 text-purple-400" />,
  "Audit Agent":           <Shield className="w-3.5 h-3.5 text-success" />,
};

// ── Main component ────────────────────────────────────────────────────────────
const AuditLog = () => {
  const { agents } = useAgentSettings();
  const auditAgentEnabled = agents.find(a => a.id === "audit")?.enabled ?? true;
  const [entries, setEntries] = useState<AuditEntry[]>([...initialLog].reverse());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [liveCount, setLiveCount] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const liveRef = useRef(isLive);
  liveRef.current = isLive;

  // Live entry injection every 12 seconds — only when audit agent is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!liveRef.current) return;
      if (!auditAgentEnabled) return; // Audit Agent disabled — no new log entries
      const entry = generateLiveEntry();
      setEntries(prev => [entry, ...prev].slice(0, 100));
      setLiveCount(n => n + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filtered + searched entries
  const filtered = entries.filter(e => {
    const matchSearch = search === "" || [e.trigger, e.decision, e.action, e.agent, e.timestamp]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchApproval = filterApproval === "all" || e.approval === filterApproval;
    const matchAgent = filterAgent === "all" || e.agent === filterAgent;
    return matchSearch && matchApproval && matchAgent;
  });

  const allAgents = [...new Set(entries.map(e => e.agent))];

  const exportCSV = () => {
    const header = "Timestamp,Trigger,Decision,Action,Confidence,Approval,Agent\n";
    const rows = filtered.map(e =>
      `"${e.timestamp}","${e.trigger}","${e.decision}","${e.action}",${e.confidence}%,"${e.approval}","${e.agent}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `arthenyz-audit-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete live record of every autonomous decision and action
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live toggle */}
          <button
            onClick={() => setIsLive(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isLive
                ? "bg-success/10 text-success border border-success/30"
                : "bg-muted/30 text-muted-foreground border border-border/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            {isLive ? "LIVE" : "PAUSED"}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Entries", value: entries.length, color: "text-foreground" },
          { label: "Auto-Approved", value: entries.filter(e => e.approval === "auto-approved").length, color: "text-emerald-400" },
          { label: "Pending Review", value: entries.filter(e => e.approval === "pending").length, color: "text-amber-400" },
          { label: "Live Since Load", value: liveCount, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="glass-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold font-mono mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trigger, decision, action, agent…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-muted/30 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filterApproval}
            onChange={e => setFilterApproval(e.target.value)}
            className="px-2 py-2 text-xs bg-muted/30 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All Approvals</option>
            <option value="auto-approved">Auto-Approved</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            className="px-2 py-2 text-xs bg-muted/30 border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All Agents</option>
            {allAgents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-auto">
          {filtered.length} / {entries.length} entries
        </span>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              {["", "Timestamp", "Trigger", "Decision", "Action", "Confidence", "Approval", "Agent"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((entry, i) => {
                const badge = approvalBadge[entry.approval];
                const isExpanded = expandedId === entry.id;
                const isNew = entry.id.startsWith("log-live-");
                return (
                  <>
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, backgroundColor: isNew ? "rgba(var(--primary), 0.08)" : "transparent" }}
                      animate={{ opacity: 1, backgroundColor: "transparent" }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className={`border-b border-border/20 cursor-pointer transition-colors ${
                        isExpanded ? "bg-muted/30" : "hover:bg-muted/20"
                      } ${isNew ? "ring-1 ring-inset ring-primary/20" : ""}`}
                    >
                      {/* Expand toggle */}
                      <td className="px-3 py-3 w-8">
                        {isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5 text-primary" />
                          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                        }
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {entry.timestamp}
                        {isNew && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-primary/15 text-primary font-medium">NEW</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-primary">{entry.trigger}</td>
                      <td className="px-4 py-3 text-xs">{entry.decision}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{entry.action}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${entry.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">{entry.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                          {badge.icon} {entry.approval}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {agentIcon[entry.agent] ?? <Zap className="w-3.5 h-3.5" />}
                          {entry.agent}
                        </span>
                      </td>
                    </motion.tr>

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${entry.id}-detail`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={8} className="px-6 pb-4 pt-0 bg-muted/20 border-b border-border/20">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 grid grid-cols-3 gap-4">
                                {/* Narrative */}
                                <div className="col-span-2 p-4 rounded-lg bg-muted/30 border border-border/30">
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    What Happened
                                  </p>
                                  <p className="text-xs leading-relaxed text-foreground/80">
                                    {buildNarrative(entry)}
                                  </p>
                                </div>
                                {/* Metadata */}
                                <div className="space-y-2">
                                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                                    <p className="text-[10px] text-muted-foreground">Data Source</p>
                                    <p className="text-xs font-medium mt-0.5 text-foreground">
                                      In-browser stochastic simulation
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                      Mean-reverting NFI model with spike events
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                                    <p className="text-[10px] text-muted-foreground">Decision Basis</p>
                                    <p className="text-xs font-mono mt-0.5 text-primary">
                                      {entry.trigger} → {entry.confidence}% confidence
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                                    <p className="text-[10px] text-muted-foreground">Responsible Agent</p>
                                    <p className="text-xs font-medium mt-0.5 flex items-center gap-1.5">
                                      {agentIcon[entry.agent] ?? <Zap className="w-3 h-3" />}
                                      {entry.agent}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <AlertTriangle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No entries match your filters</p>
          </div>
        )}
      </motion.div>

      {/* Footer — data source transparency */}
      <div className="p-4 rounded-lg bg-muted/20 border border-border/30 flex items-start gap-3">
        <RefreshCw className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Data Source: Algorithmic Simulation</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            All entries are generated by an in-browser stochastic engine modelling real-world multi-agent decision pipelines.
            No external APIs, cloud credentials, or company data are used.
            New entries are injected every ~12 seconds to demonstrate live log streaming.
            In production this table would connect to a real audit event stream via WebSocket or polling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;