import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/views/Dashboard";
import RiskDetail from "@/components/views/RiskDetail";
import AgentOrchestration from "@/components/views/AgentOrchestration";
import AuditLog from "@/components/views/AuditLog";
import Settings from "@/components/views/Settings";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  const handleViewRisk = (riskId: string) => {
    setSelectedRiskId(riskId);
    setActiveView("risks");
  };

  const handleBack = () => {
    setSelectedRiskId(null);
    setActiveView("dashboard");
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onViewRisk={handleViewRisk} />;
      case "risks":
        return selectedRiskId ? (
          <RiskDetail riskId={selectedRiskId} onBack={handleBack} />
        ) : (
          <RiskDetail riskId="risk-001" onBack={handleBack} />
        );
      case "agents":
        return <AgentOrchestration />;
      case "audit":
        return <AuditLog />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onViewRisk={handleViewRisk} />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Sidebar activeView={activeView} onNavigate={(view) => { setActiveView(view); setSelectedRiskId(null); }} />
      <main className="ml-64 p-6">
        {renderView()}
      </main>
    </div>
  );
};

export default Index;
