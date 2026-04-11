import { createContext, useContext, useState, ReactNode } from "react";

export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface AgentSettings {
  agents: AgentConfig[];
  confidenceThreshold: number;
  nfiAlertThreshold: number;
  maxRetries: number;
  hitlEnabled: boolean;
  hitlAboveConfidence: boolean;
  autoApproveBelow: number;
  emailNotifications: boolean;
  slackNotifications: boolean;
  toggleAgent: (id: string) => void;
  setConfidenceThreshold: (val: number) => void;
  setNfiAlertThreshold: (val: number) => void;
  setMaxRetries: (val: number) => void;
  setHitlEnabled: (val: boolean) => void;
  setHitlAboveConfidence: (val: boolean) => void;
  setAutoApproveBelow: (val: number) => void;
  setEmailNotifications: (val: boolean) => void;
  setSlackNotifications: (val: boolean) => void;
}

const defaultAgents: AgentConfig[] = [
  { id: "ingestion", name: "Ingestion Agent", enabled: true, description: "Collects financial news, transcripts & cost data" },
  { id: "narrative", name: "Narrative Analysis Agent", enabled: true, description: "Extracts themes, sentiment & risk signals" },
  { id: "drift", name: "Drift Detection Agent", enabled: true, description: "Computes NFI over time and detects spikes" },
  { id: "decision", name: "Decision Agent", enabled: true, description: "Maps narrative signals to operational causes" },
  { id: "action", name: "Action Agent", enabled: true, description: "Executes corrective actions autonomously" },
  { id: "audit", name: "Audit Agent", enabled: true, description: "Logs triggers, decisions & confidence scores" },
];

const AgentSettingsContext = createContext<AgentSettings | null>(null);

export const useAgentSettings = () => {
  const ctx = useContext(AgentSettingsContext);
  if (!ctx) throw new Error("useAgentSettings must be used within AgentSettingsProvider");
  return ctx;
};

export const AgentSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgents] = useState<AgentConfig[]>(defaultAgents);
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [nfiAlertThreshold, setNfiAlertThreshold] = useState(65);
  const [maxRetries, setMaxRetries] = useState(3);
  const [hitlEnabled, setHitlEnabled] = useState(true);
  const [hitlAboveConfidence, setHitlAboveConfidence] = useState(false);
  const [autoApproveBelow, setAutoApproveBelow] = useState(5000);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <AgentSettingsContext.Provider value={{
      agents, confidenceThreshold, nfiAlertThreshold, maxRetries,
      hitlEnabled, hitlAboveConfidence, autoApproveBelow,
      emailNotifications, slackNotifications,
      toggleAgent, setConfidenceThreshold, setNfiAlertThreshold,
      setMaxRetries, setHitlEnabled, setHitlAboveConfidence,
      setAutoApproveBelow, setEmailNotifications, setSlackNotifications,
    }}>
      {children}
    </AgentSettingsContext.Provider>
  );
};
