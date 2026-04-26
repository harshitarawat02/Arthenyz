import { Settings as SettingsIcon, Bot, ShieldCheck, UserCheck, RotateCcw, Save, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentSettings } from "@/contexts/AgentSettingsContext";
import { toast } from "@/components/ui/sonner";

const Settings = () => {
  const settings = useAgentSettings();

  const handleSave = () => {
    settings.saveSettings();
    toast("Settings saved", {
      description: "All configurations have been persisted and will survive page refresh.",
    });
  };

  const handleReset = () => {
    settings.resetSettings();
    toast("Settings reset to defaults", {
      description: "All agents re-enabled, thresholds restored to factory values.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            System Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure agents, thresholds & approval workflows</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Unsaved changes indicator */}
          <AnimatePresence>
            {settings.isDirty && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="text-xs text-warning font-medium px-2 py-1 rounded-md bg-warning/10 border border-warning/30"
              >
                Unsaved changes
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-muted-foreground text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              settings.isDirty
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-primary/50 text-primary-foreground/70 cursor-default"
            }`}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Configuration */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              Agent Configuration
            </CardTitle>
            <CardDescription>Enable or disable individual agents — changes take effect immediately</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.agents.map((agent) => (
              <div
                key={agent.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  agent.enabled
                    ? "bg-muted/30 border-border/30"
                    : "bg-destructive/5 border-destructive/20"
                }`}
              >
                <div>
                  <p className={`text-sm font-medium flex items-center gap-2 ${!agent.enabled ? "text-muted-foreground" : ""}`}>
                    {agent.name}
                    {!agent.enabled && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-destructive/15 text-destructive uppercase tracking-wide">
                        Paused
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
                <Switch
                  checked={agent.enabled}
                  onCheckedChange={() => settings.toggleAgent(agent.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Confidence & Thresholds */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Confidence & Thresholds
            </CardTitle>
            <CardDescription>Set minimum confidence levels and alert thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Action Confidence Threshold</Label>
                <span className="text-sm font-mono text-primary">{settings.confidenceThreshold}%</span>
              </div>
              <Slider
                value={[settings.confidenceThreshold]}
                onValueChange={([v]) => settings.setConfidenceThreshold(v)}
                min={50} max={99} step={1}
              />
              <p className="text-xs text-muted-foreground">Actions below this confidence require manual approval</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">NFI Alert Threshold</Label>
                <span className="text-sm font-mono text-warning">{settings.nfiAlertThreshold}</span>
              </div>
              <Slider
                value={[settings.nfiAlertThreshold]}
                onValueChange={([v]) => settings.setNfiAlertThreshold(v)}
                min={30} max={90} step={1}
              />
              <p className="text-xs text-muted-foreground">NFI above this value triggers risk alerts</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max Retry Attempts</Label>
              <Input
                type="number"
                value={settings.maxRetries}
                onChange={(e) => settings.setMaxRetries(Number(e.target.value))}
                className="bg-muted/30 border-border/50"
                min={1}
                max={10}
              />
              <p className="text-xs text-muted-foreground">Retries before escalating a failed action</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-Approve Below (₹)</Label>
                <span className="text-sm font-mono text-success">₹{settings.autoApproveBelow.toLocaleString()}</span>
              </div>
              <Slider
                value={[settings.autoApproveBelow]}
                onValueChange={([v]) => settings.setAutoApproveBelow(v)}
                min={1000} max={50000} step={1000}
              />
              <p className="text-xs text-muted-foreground">Actions below this impact amount are auto-approved</p>
            </div>
          </CardContent>
        </Card>

        {/* Human-in-the-Loop */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Human-in-the-Loop Approval
            </CardTitle>
            <CardDescription>Control when human approval is required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <p className="text-sm font-medium">Enable HITL Approval</p>
                <p className="text-xs text-muted-foreground">Require human approval for critical actions</p>
              </div>
              <Switch checked={settings.hitlEnabled} onCheckedChange={settings.setHitlEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <p className="text-sm font-medium">Skip Approval for High Confidence</p>
                <p className="text-xs text-muted-foreground">Auto-approve when confidence exceeds threshold</p>
              </div>
              <Switch checked={settings.hitlAboveConfidence} onCheckedChange={settings.setHitlAboveConfidence} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>Configure how you receive system alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive risk alerts and action summaries via email</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={settings.setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <p className="text-sm font-medium">Slack Integration</p>
                <p className="text-xs text-muted-foreground">Post alerts to a Slack channel</p>
              </div>
              <Switch checked={settings.slackNotifications} onCheckedChange={settings.setSlackNotifications} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;