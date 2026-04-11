import { risks } from "@/data/mockData";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

interface RiskCardsProps {
  onViewDetail: (riskId: string) => void;
}

const severityBadge: Record<string, string> = {
  critical: "risk-badge-critical",
  high: "risk-badge-high",
  medium: "risk-badge-medium",
  low: "risk-badge-low",
};

const RiskCards = ({ onViewDetail }: RiskCardsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-4">Active Risks</h2>
      <div className="grid grid-cols-3 gap-4">
        {risks.map((risk, i) => (
          <motion.div
            key={risk.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="glass-card-hover p-5 flex flex-col gap-3 cursor-pointer group"
            onClick={() => onViewDetail(risk.id)}
          >
            <div className="flex items-start justify-between">
              <span className={severityBadge[risk.severity]}>{risk.severity}</span>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-sm font-semibold">{risk.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{risk.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">NFI Score</span>
                <p className="font-mono font-bold text-primary">{risk.nfiScore}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence</span>
                <p className="font-mono font-bold">{risk.confidence}%</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Est. Impact</span>
              <p className="text-sm font-semibold text-warning">{risk.financialImpact}</p>
            </div>

            <button className="flex items-center gap-1.5 text-xs text-primary font-medium mt-auto group-hover:gap-2.5 transition-all">
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskCards;
