import { auditLog } from "@/data/mockData";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";

const approvalBadge: Record<string, { className: string; icon: React.ReactNode }> = {
  "auto-approved": { className: "risk-badge-low", icon: <ShieldCheck className="w-3 h-3" /> },
  approved: { className: "risk-badge-low", icon: <CheckCircle2 className="w-3 h-3" /> },
  pending: { className: "risk-badge-high", icon: <Clock className="w-3 h-3" /> },
  rejected: { className: "risk-badge-critical", icon: <XCircle className="w-3 h-3" /> },
};

const AuditLog = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete record of autonomous decisions and actions</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              {["Timestamp", "Trigger", "Decision", "Action", "Confidence", "Approval", "Agent"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry, i) => {
              const badge = approvalBadge[entry.approval];
              return (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{entry.timestamp}</td>
                  <td className="px-4 py-3 text-xs font-mono text-primary">{entry.trigger}</td>
                  <td className="px-4 py-3 text-xs">{entry.decision}</td>
                  <td className="px-4 py-3 text-xs">{entry.action}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${entry.confidence}%` }} />
                      </div>
                      <span className="text-xs font-mono">{entry.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${badge.className} flex items-center gap-1`}>
                      {badge.icon} {entry.approval}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{entry.agent}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AuditLog;
