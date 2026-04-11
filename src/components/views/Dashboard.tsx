import StatusBar from "@/components/layout/StatusBar";
import NFIChart from "@/components/dashboard/NFIChart";
import RiskCards from "@/components/dashboard/RiskCards";
import ActionFeed from "@/components/dashboard/ActionFeed";

interface DashboardProps {
  onViewRisk: (riskId: string) => void;
}

const Dashboard = ({ onViewRisk }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <StatusBar />
      <NFIChart />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RiskCards onViewDetail={onViewRisk} />
        </div>
        <div className="col-span-1">
          <ActionFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
