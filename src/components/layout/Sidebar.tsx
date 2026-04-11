import { LayoutDashboard, AlertTriangle, Workflow, ScrollText, Activity, Settings } from "lucide-react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "risks", label: "Risk Detail", icon: AlertTriangle },
  { id: "agents", label: "Agent Orchestration", icon: Workflow },
  { id: "audit", label: "Audit Log", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ activeView, onNavigate }: SidebarProps) => {
  return (
    <aside className="w-64 h-screen border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gradient-primary">Arthenyx</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Cost Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={activeView === item.id ? "nav-item-active w-full" : "nav-item w-full"}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">System Active</span>
          </div>
          <p className="text-[10px] text-muted-foreground">6 agents operational</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
