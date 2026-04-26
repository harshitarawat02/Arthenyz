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
  isDirty: boolean;
  saveSettings: () => void;
  resetSettings: () => void;
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

const STORAGE_KEY = "arthenyz-settings-v1";

const defaultAgents: AgentConfig[] = [
  { id: "ingestion", name: "Ingestion Agent", enabled: true, description: "Collects financial news, transcripts & cost data" },
  { id: "narrative", name: "Narrative Analysis Agent", enabled: true, description: "Extracts themes, sentiment & risk signals" },
  { id: "drift", name: "Drift Detection Agent", enabled: true, description: "Computes NFI over time and detects spikes" },
  { id: "decision", name: "Decision Agent", enabled: true, description: "Maps narrative signals to operational causes" },
  { id: "action", name: "Action Agent", enabled: true, description: "Executes corrective actions autonomously" },
  { id: "audit", name: "Audit Agent", enabled: true, description: "Logs triggers, decisions & confidence scores" },
];

const defaultSettings = {
  agents: defaultAgents,
  confidenceThreshold: 75,
  nfiAlertThreshold: 65,
  maxRetries: 3,
  hitlEnabled: true,
  hitlAboveConfidence: false,
  autoApproveBelow: 5000,
  emailNotifications: true,
  slackNotifications: false,
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const saved = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...saved,
      agents: defaultAgents.map((def) => {
        const persisted = (saved.agents ?? []).find((a: AgentConfig) => a.id === def.id);
        return persisted ? { ...def, enabled: persisted.enabled } : def;
      }),
    };
  } catch {
    return defaultSettings;
  }
}

const AgentSettingsContext = createContext<AgentSettings | null>(null);

export const useAgentSettings = () => {
  const ctx = useContext(AgentSettingsContext);
  if (!ctx) throw new Error("useAgentSettings must be used within AgentSettingsProvider");
  return ctx;
};

export const AgentSettingsProvider = ({ children }: { children: ReactNode }) => {
  const initial = loadFromStorage();

  const [agents, setAgents] = useState<AgentConfig[]>(initial.agents);
  const [confidenceThreshold, setConfidenceThresholdState] = useState(initial.confidenceThreshold);
  const [nfiAlertThreshold, setNfiAlertThresholdState] = useState(initial.nfiAlertThreshold);
  const [maxRetries, setMaxRetriesState] = useState(initial.maxRetries);
  const [hitlEnabled, setHitlEnabledState] = useState(initial.hitlEnabled);
  const [hitlAboveConfidence, setHitlAboveConfidenceState] = useState(initial.hitlAboveConfidence);
  const [autoApproveBelow, setAutoApproveBelowState] = useState(initial.autoApproveBelow);
  const [emailNotifications, setEmailNotificationsState] = useState(initial.emailNotifications);
  const [slackNotifications, setSlackNotificationsState] = useState(initial.slackNotifications);
  const [isDirty, setIsDirty] = useState(false);

  const getSnapshot = (overrides: object = {}) => ({
    agents,
    confidenceThreshold,
    nfiAlertThreshold,
    maxRetries,
    hitlEnabled,
    hitlAboveConfidence,
    autoApproveBelow,
    emailNotifications,
    slackNotifications,
    ...overrides,
  });

  const persist = (overrides: object = {}) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getSnapshot(overrides)));
    } catch { /* ignore */ }
  };

  // Agent toggles auto-persist immediately — no need to click Save
  const toggleAgent = (id: string) => {
    setAgents((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
      persist({ agents: next });
      return next;
    });
    setIsDirty(true);
  };

  const saveSettings = () => {
    persist();
    setIsDirty(false);
  };

  const resetSettings = () => {
    setAgents(defaultAgents);
    setConfidenceThresholdState(defaultSettings.confidenceThreshold);
    setNfiAlertThresholdState(defaultSettings.nfiAlertThreshold);
    setMaxRetriesState(defaultSettings.maxRetries);
    setHitlEnabledState(defaultSettings.hitlEnabled);
    setHitlAboveConfidenceState(defaultSettings.hitlAboveConfidence);
    setAutoApproveBelowState(defaultSettings.autoApproveBelow);
    setEmailNotificationsState(defaultSettings.emailNotifications);
    setSlackNotificationsState(defaultSettings.slackNotifications);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setIsDirty(false);
  };

  const mark = (setter: (v: never) => void) => (v: never) => { setter(v); setIsDirty(true); };

  return (
    <AgentSettingsContext.Provider
      value={{
        agents, confidenceThreshold, nfiAlertThreshold, maxRetries,
        hitlEnabled, hitlAboveConfidence, autoApproveBelow,
        emailNotifications, slackNotifications,
        isDirty, saveSettings, resetSettings, toggleAgent,
        setConfidenceThreshold: mark(setConfidenceThresholdState as (v: never) => void),
        setNfiAlertThreshold:   mark(setNfiAlertThresholdState as (v: never) => void),
        setMaxRetries:          mark(setMaxRetriesState as (v: never) => void),
        setHitlEnabled:         mark(setHitlEnabledState as (v: never) => void),
        setHitlAboveConfidence: mark(setHitlAboveConfidenceState as (v: never) => void),
        setAutoApproveBelow:    mark(setAutoApproveBelowState as (v: never) => void),
        setEmailNotifications:  mark(setEmailNotificationsState as (v: never) => void),
        setSlackNotifications:  mark(setSlackNotificationsState as (v: never) => void),
      }}
    >
      {children}
    </AgentSettingsContext.Provider>
  );
};