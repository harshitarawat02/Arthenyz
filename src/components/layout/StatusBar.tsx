import { Shield, AlertTriangle, IndianRupee, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { calculateLiveSavings } from "@/services/dataService";
import { useAgentSettings } from "@/contexts/AgentSettingsContext";

const BASE_SAVINGS = 1160000;

const StatusBar = () => {
  const { agents } = useAgentSettings();
  const activeCount = agents.filter((a) => a.enabled).length;
  const totalCount = agents.length;

  const [savings, setSavings] = useState(0);
  const [actionCount, setActionCount] = useState(14);
  const startTime = useRef(Date.now());
  const animationDone = useRef(false);

  // Derive system status label + color from live agent state
  const systemStatus =
    activeCount === 0
      ? { label: "All Agents Paused", color: "text-destructive" }
      : activeCount === totalCount
      ? { label: "All Agents Active", color: "text-success" }
      : { label: `${activeCount}/${totalCount} Agents Active`, color: "text-warning" };

  // Phase 1: count-up animation
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = BASE_SAVINGS / steps;
    let current = 0;

    const countUp = setInterval(() => {
      current += increment;
      if (current >= BASE_SAVINGS) {
        setSavings(BASE_SAVINGS);
        clearInterval(countUp);
        animationDone.current = true;
        startTime.current = Date.now();
      } else {
        setSavings(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(countUp);
  }, []);

  // Phase 2: live ticking
  useEffect(() => {
    const ticker = setInterval(() => {
      if (!animationDone.current) return;
      const elapsed = (Date.now() - startTime.current) / 1000;
      setSavings(calculateLiveSavings(BASE_SAVINGS, elapsed));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Increment action count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActionCount((prev) => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      label: "System Status",
      displayValue: systemStatus.label,
      icon: Shield,
      color: systemStatus.color,
    },
    { label: "Active Risks", displayValue: "3", icon: AlertTriangle, color: "text-warning" },
    {
      label: "Cost Saved Today",
      displayValue: `₹${savings.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-success",
      live: true,
    },
    {
      label: "Autonomous Actions",
      displayValue: String(actionCount),
      icon: Zap,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="kpi-card"
        >
          <div className="flex items-center justify-between">
            <span className="metric-label">{kpi.label}</span>
            <div className="flex items-center gap-1">
              {kpi.live && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />}
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
          </div>
          <span className={`metric-value ${kpi.color} font-mono`}>{kpi.displayValue}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default StatusBar;