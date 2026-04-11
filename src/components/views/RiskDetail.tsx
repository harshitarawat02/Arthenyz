import { risks } from "@/data/mockData";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Search, Zap, IndianRupee, TrendingDown, TrendingUp } from "lucide-react";

interface RiskDetailProps {
  riskId: string;
  onBack: () => void;
}

const RiskDetail = ({ riskId, onBack }: RiskDetailProps) => {
  const risk = risks.find((r) => r.id === riskId) || risks[0];

  const severityColor: Record<string, string> = {
    critical: "text-destructive",
    high: "text-warning",
    medium: "text-primary",
    low: "text-success",
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
        <button onClick={onBack} className="glass-card p-2 hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{risk.title}</h1>
          <p className="text-sm text-muted-foreground">{risk.type} · Detected {risk.detectedAt}</p>
        </div>
        <span className={`ml-auto text-2xl font-bold font-mono ${severityColor[risk.severity]}`}>
          NFI {risk.nfiScore}
        </span>
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
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
              </div>
              <div>
                <span className="metric-label">Volatility</span>
                <p className="metric-value text-lg text-warning">{risk.narrativeSignals.volatility}</p>
              </div>
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
            <p className="text-xs text-muted-foreground mt-1 font-mono">{risk.decisionLogic}</p>
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
            <span className="text-xs text-success font-medium">Action executed autonomously</span>
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
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
              <span className="metric-label">After</span>
              <p className="text-lg font-bold text-success font-mono flex items-center justify-center gap-1">
                <TrendingDown className="w-4 h-4" />
                ₹{(risk.impact.afterCost / 100000).toFixed(1)}L
              </p>
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
        </motion.div>
      </div>
    </div>
  );
};

export default RiskDetail;
