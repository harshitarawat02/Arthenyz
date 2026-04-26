import { useState, useEffect } from "react";
import { actionFeed, ActionEntry } from "@/data/mockData";
import { generateLiveAction } from "@/services/dataService";
import { useAgentSettings } from "@/contexts/AgentSettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Loader2, PauseCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const statusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  "in-progress": <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />,
  pending: <Clock className="w-3.5 h-3.5 text-warning" />,
};

const ActionFeed = () => {
  const [actions, setActions] = useState<ActionEntry[]>(actionFeed);
  const [selectedAction, setSelectedAction] = useState<ActionEntry | null>(null);
  const { hitlEnabled, confidenceThreshold, agents } = useAgentSettings();

  const actionEnabled  = agents.find(a => a.id === "action")?.enabled  ?? true;
  const decisionEnabled = agents.find(a => a.id === "decision")?.enabled ?? true;
  // Feed is only alive if at least one of action or decision agents is running
  const feedActive = actionEnabled || decisionEnabled;

  useEffect(() => {
    if (!feedActive) return; // don't even create an interval

    const interval = setInterval(() => {
      const newAction = generateLiveAction();

      // Route to the correct agent based on what's enabled
      if (!actionEnabled && newAction.agent === "Action Agent") {
        newAction.agent = "Decision Agent";
      }
      if (!decisionEnabled && newAction.agent === "Decision Agent") {
        newAction.agent = "Action Agent";
      }

      if (hitlEnabled && Math.random() < 0.4) {
        newAction.status = "pending";
      }
      setActions(prev => [newAction, ...prev].slice(0, 12));
    }, 8000);

    return () => clearInterval(interval);
  }, [hitlEnabled, actionEnabled, decisionEnabled, feedActive]);

  const handleApprove = () => {
    if (!selectedAction) return;
    setActions(prev =>
      prev.map(a => a.id === selectedAction.id ? { ...a, status: "completed" as const } : a)
    );
    toast.success("Action approved and executed", { description: selectedAction.action });
    setSelectedAction(null);
  };

  const handleReject = () => {
    if (!selectedAction) return;
    setActions(prev => prev.filter(a => a.id !== selectedAction.id));
    toast.error("Action rejected", { description: selectedAction.action });
    setSelectedAction(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Autonomous Action Feed</h2>
          <div className="flex items-center gap-1.5">
            {feedActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[10px] text-destructive font-mono">PAUSED</span>
              </>
            )}
          </div>
        </div>

        {/* Paused banner */}
        {!feedActive && (
          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium">
            Action Agent and Decision Agent are both disabled — no new autonomous actions.
          </div>
        )}

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
                onClick={() => entry.status === "pending" && setSelectedAction(entry)}
                className={`flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors ${
                  entry.status === "pending" ? "cursor-pointer ring-1 ring-warning/30 hover:ring-warning/60" : ""
                }`}
              >
                <div className="mt-0.5">{statusIcon[entry.status]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{entry.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">{entry.agent}</span>
                    {entry.status === "pending" && (
                      <span className="text-[10px] text-warning font-medium ml-1">⏳ Needs Approval</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-success whitespace-nowrap">{entry.impact}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Approval Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Action Approval Required</DialogTitle>
            <DialogDescription>
              Review this autonomous action before it executes.
            </DialogDescription>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                <p className="text-sm font-medium">{selectedAction.action}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{selectedAction.timestamp}</span>
                  <span>•</span>
                  <span>{selectedAction.agent}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded bg-muted/20">
                  <p className="text-muted-foreground">Expected Impact</p>
                  <p className="font-semibold text-success mt-1">{selectedAction.impact}</p>
                </div>
                <div className="p-2 rounded bg-muted/20">
                  <p className="text-muted-foreground">Confidence Threshold</p>
                  <p className="font-semibold mt-1">{confidenceThreshold}%</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReject}>
              Reject
            </Button>
            <Button onClick={handleApprove}>
              Approve & Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionFeed;