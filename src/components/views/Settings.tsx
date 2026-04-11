import { Settings as SettingsIcon, Bot, ShieldCheck, UserCheck, RotateCcw, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAgentSettings } from "@/contexts/AgentSettingsContext";
import { toast } from "@/components/ui/sonner";

const Settings = () => {
  const settings = useAgentSettings();

  const handleSave = () => {
    toast("Settings saved successfully", { description: "All agent configurations have been updated." });
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
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Configuration */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              Agent Configuration
            </CardTitle>
            <CardDescription>Enable or disable individual agents in the pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
                <Switch checked={agent.enabled} onCheckedChange={() => settings.toggleAgent(agent.id)} />
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
              <Slider value={[settings.confidenceThreshold]} onValueChange={([v]) => settings.setConfidenceThreshold(v)} min={50} max={99} step={1} />
              <p className="text-xs text-muted-foreground">Actions below this confidence require manual approval</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">NFI Alert Threshold</Label>
                <span className="text-sm font-mono text-warning">{settings.nfiAlertThreshold}</span>
              </div>
              <Slider value={[settings.nfiAlertThreshold]} onValueChange={([v]) => settings.setNfiAlertThreshold(v)} min={30} max={90} step={1} />
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
              <p className="text-xs text-muted-foreground">Number of retries before escalating a failed action</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-Approve Below (₹)</Label>
                <span className="text-sm font-mono text-success">₹{settings.autoApproveBelow.toLocaleString()}</span>
              </div>
              <Slider value={[settings.autoApproveBelow]} onValueChange={([v]) => settings.setAutoApproveBelow(v)} min={1000} max={50000} step={1000} />
              <p className="text-xs text-muted-foreground">Actions with impact below this amount are auto-approved</p>
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
