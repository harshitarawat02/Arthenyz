import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Area, ComposedChart } from "recharts";
import { nfiData, NFIDataPoint } from "@/data/mockData";
import { generateNextNFIPoint } from "@/services/dataService";
import { fetchFinancialData, getDataModeLabel, type FinancialDataResponse } from "@/services/financialDataService";
import { motion } from "framer-motion";
import { Database, Wifi, WifiOff, Info } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name === "NFI" ? p.value.toFixed(2) : `₹${p.value.toLocaleString("en-IN")}`}
        </p>
      ))}
    </div>
  );
};

const NFIChart = () => {
  const [data, setData] = useState<NFIDataPoint[]>(nfiData);
  const [financialData, setFinancialData] = useState<FinancialDataResponse | null>(null);
  const [showSources, setShowSources] = useState(false);
  const tickRef = useRef(0);

  // Fetch real financial data on mount and every 60s
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchFinancialData();
      setFinancialData(result);
    };
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000); // Every 30 min to stay under 25/day limit
    return () => clearInterval(interval);
  }, []);

  // Live chart updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const hours = tickRef.current % 24;
      const mins = (tickRef.current * 5) % 60;
      const timeLabel = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

      const simPoint = generateNextNFIPoint(timeLabel);

      // Blend real NFI with simulation if available
      if (financialData?.blendedNFI != null) {
        const realWeight = 0.7;
        const simWeight = 0.3;
        const jitter = (Math.random() - 0.5) * 0.03;
        simPoint.nfi = Math.max(0.1, Math.min(0.98,
          realWeight * financialData.blendedNFI + simWeight * simPoint.nfi + jitter
        ));
        simPoint.nfi = Math.round(simPoint.nfi * 100) / 100;
      }

      setData(prev => {
        const updated = [...prev, simPoint];
        return updated.length > 24 ? updated.slice(-24) : updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [financialData]);

  const warningPoint = data.find((d) => d.warning);
  const latestNFI = data[data.length - 1]?.nfi ?? 0;
  const nfiColor = latestNFI > 0.8 ? "text-destructive" : latestNFI > 0.6 ? "text-warning" : "text-primary";
  const dataMode = financialData?.dataMode || "simulation";
  const isLive = dataMode === "live" || dataMode === "partial";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Narrative Fragility Index</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {getDataModeLabel(dataMode)} — updates every 3s
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors"
          >
            <Info className="w-3 h-3" />
            <span className="text-muted-foreground">Sources</span>
          </button>
          <span className="flex items-center gap-1.5">
            {isLive ? (
              <Wifi className="w-3.5 h-3.5 text-success" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-success" : "bg-warning"} animate-pulse`} />
            <span className="text-muted-foreground">{isLive ? "LIVE" : "SIM"}</span>
          </span>
          <span className={`font-mono font-bold text-base ${nfiColor}`}>
            NFI: {latestNFI.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Data Sources Panel */}
      {showSources && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Data Sources & API Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Alpha Vantage */}
            <div className="p-3 rounded-md bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">Alpha Vantage</span>
                <StatusBadge status={financialData?.sources?.alpha_vantage?.status} />
              </div>
              <p className="text-[10px] text-muted-foreground">Market News Sentiment API</p>
              {financialData?.sources?.alpha_vantage?.status === "connected" && (
                <div className="mt-2 space-y-1 text-[10px]">
                  <p>Sentiment: <span className="font-mono text-primary">{financialData.sources.alpha_vantage.avgSentiment}</span></p>
                  <p>NFI Contribution: <span className="font-mono text-warning">{financialData.sources.alpha_vantage.nfiContribution}</span></p>
                  <p>Articles: <span className="font-mono">{financialData.sources.alpha_vantage.articlesAnalyzed}</span></p>
                </div>
              )}
              {financialData?.sources?.alpha_vantage?.message && (
                <p className="mt-1 text-[10px] text-muted-foreground">{financialData.sources.alpha_vantage.message}</p>
              )}
            </div>

            {/* NewsData Feed */}
            <div className="p-3 rounded-md bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">NewsData Feed</span>
                <StatusBadge status={financialData?.sources?.newsdata?.status} />
              </div>
              <p className="text-[10px] text-muted-foreground">Bundled News Articles</p>
              {financialData?.sources?.newsdata?.status === "connected" && (
                <div className="mt-2 space-y-1 text-[10px]">
                  <p>Sentiment: <span className="font-mono text-primary">{financialData.sources.newsdata.avgSentiment}</span></p>
                  <p>NFI Contribution: <span className="font-mono text-warning">{financialData.sources.newsdata.nfiContribution}</span></p>
                  <p>Articles: <span className="font-mono">{financialData.sources.newsdata.articlesAnalyzed}</span></p>
                </div>
              )}
              {financialData?.sources?.newsdata?.message && (
                <p className="mt-1 text-[10px] text-muted-foreground">{financialData.sources.newsdata.message}</p>
              )}
            </div>
          </div>

          {/* Live Signals */}
          {financialData?.dataMode !== "simulation" && (
            <div className="mt-2">
              <h4 className="text-[11px] font-semibold mb-2 text-muted-foreground">Latest Signals</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {[
                  ...(financialData?.sources?.alpha_vantage?.topSignals || []),
                  ...(financialData?.sources?.newsdata?.topSignals || []),
                ].slice(0, 5).map((signal, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] p-1.5 rounded bg-muted/20">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      signal.sentiment === "positive" || signal.sentiment === "Bullish" ? "bg-success" :
                      signal.sentiment === "negative" || signal.sentiment === "Bearish" ? "bg-destructive" :
                      "bg-muted-foreground"
                    }`} />
                    <span className="truncate flex-1">{signal.title}</span>
                    <span className="font-mono text-muted-foreground">{signal.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          
        </motion.div>
      )}

      <div className="flex items-center gap-4 text-xs mb-4">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded" /> NFI Score</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-warning rounded" /> Actual Cost</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-destructive rounded opacity-50" /> Predicted (no action)</span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="nfiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
          <XAxis dataKey="time" stroke="hsl(215, 20%, 55%)" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="nfi" domain={[0, 1]} stroke="hsl(217, 91%, 60%)" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="cost" orientation="right" stroke="hsl(25, 95%, 53%)" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area yAxisId="nfi" dataKey="nfi" fill="url(#nfiGrad)" stroke="none" animationDuration={500} />
          <Line yAxisId="nfi" type="monotone" dataKey="nfi" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} dot={false} name="NFI" animationDuration={500} />
          <Line yAxisId="cost" type="monotone" dataKey="cost" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={false} name="Actual Cost" animationDuration={500} />
          <Line yAxisId="cost" type="monotone" dataKey="predicted" stroke="hsl(0, 72%, 51%)" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Predicted Cost" connectNulls={false} animationDuration={500} />
          {warningPoint && (
            <ReferenceDot yAxisId="nfi" x={warningPoint.time} y={warningPoint.nfi} r={6} fill="hsl(25, 95%, 53%)" stroke="hsl(25, 95%, 53%)" strokeWidth={2} />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? "bg-success" : "bg-warning"} animate-pulse`} />
          <span className={`${isLive ? "text-success" : "text-warning"} font-medium`}>
            {isLive ? "Live Monitoring" : "Simulation Mode"}
          </span>
          <span className="text-muted-foreground">— {data.length} data points</span>
        </div>
        <span className="text-muted-foreground font-mono text-[10px]">
          {isLive ? "Engine: Real API + Stochastic Blend" : "Engine: Stochastic NFI Model"}
        </span>
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status }: { status?: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    connected: { color: "bg-success text-success", label: "Connected" },
    rate_limited: { color: "bg-warning text-warning", label: "Rate Limited" },
    error: { color: "bg-destructive text-destructive", label: "Error" },
    not_configured: { color: "bg-muted-foreground text-muted-foreground", label: "Not Set" },
  };
  const c = config[status || "not_configured"] || config.not_configured;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium ${c.color.split(" ")[1]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.color.split(" ")[0]}`} />
      {c.label}
    </span>
  );
};

export default NFIChart;
