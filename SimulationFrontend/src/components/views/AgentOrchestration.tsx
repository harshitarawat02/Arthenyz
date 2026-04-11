import { agentPipeline } from "@/data/mockData";
import { motion } from "framer-motion";
import { Database, Brain, TrendingUp, GitBranch, Zap, Shield, ArrowRight } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Database: <Database className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  GitBranch: <GitBranch className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
};

const AgentOrchestration = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Agent Orchestration</h1>
        <p className="text-sm text-muted-foreground mt-1">Multi-agent pipeline: Ingest → Analyze → Detect → Decide → Act → Audit</p>
      </div>

      {/* Pipeline Flow */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between">
          {agentPipeline.map((agent, i) => (
            <div key={agent.id} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary animate-pulse-glow">
                  {iconMap[agent.icon]}
                </div>
                <span className="text-xs font-semibold mt-2 text-center max-w-[100px]">{agent.name}</span>
                <span className="w-2 h-2 rounded-full bg-success mt-1" />
              </motion.div>
              {i < agentPipeline.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 + 0.1 }}
                  className="mx-3"
                >
                  <ArrowRight className="w-5 h-5 text-primary/50" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent Detail Cards */}
      <div className="grid grid-cols-3 gap-4">
        {agentPipeline.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {iconMap[agent.icon]}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{agent.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[10px] text-success uppercase tracking-wider">Active</span>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <span className="metric-label">Latest Output</span>
              <p className="text-xs text-muted-foreground mt-1 font-mono leading-relaxed">{agent.output}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgentOrchestration;
