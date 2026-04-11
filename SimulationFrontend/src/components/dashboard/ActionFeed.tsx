import { useState, useEffect } from "react";
import { actionFeed, ActionEntry } from "@/data/mockData";
import { generateLiveAction } from "@/services/dataService";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  "in-progress": <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />,
  pending: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
};

const ActionFeed = () => {
  const [actions, setActions] = useState<ActionEntry[]>(actionFeed);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAction = generateLiveAction();
      setActions(prev => [newAction, ...prev].slice(0, 12)); // Keep last 12
    }, 8000); // New action every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Autonomous Action Feed</h2>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {actions.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              layout
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">{statusIcon[entry.status]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{entry.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">{entry.agent}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-success whitespace-nowrap">{entry.impact}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ActionFeed;
