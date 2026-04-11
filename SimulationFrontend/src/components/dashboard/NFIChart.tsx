import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Area, ComposedChart } from "recharts";
import { nfiData, NFIDataPoint } from "@/data/mockData";
import { generateNextNFIPoint } from "@/services/dataService";
import { motion } from "framer-motion";

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
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const hours = tickRef.current % 24;
      const mins = (tickRef.current * 5) % 60;
      const timeLabel = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

      const newPoint = generateNextNFIPoint(timeLabel);

      setData(prev => {
        const updated = [...prev, newPoint];
        // Keep last 24 data points for readability
        return updated.length > 24 ? updated.slice(-24) : updated;
      });
    }, 3000); // New data point every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const warningPoint = data.find((d) => d.warning);
  const latestNFI = data[data.length - 1]?.nfi ?? 0;
  const nfiColor = latestNFI > 0.8 ? "text-destructive" : latestNFI > 0.6 ? "text-warning" : "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Narrative Fragility Index</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Live simulation — NFI updates every 3 seconds
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">LIVE</span>
          </span>
          <span className={`font-mono font-bold text-base ${nfiColor}`}>
            NFI: {latestNFI.toFixed(2)}
          </span>
        </div>
      </div>

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
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-warning font-medium">Live Monitoring</span>
          <span className="text-muted-foreground">— {data.length} data points rendered</span>
        </div>
        <span className="text-muted-foreground font-mono">Engine: Stochastic NFI Model</span>
      </div>
    </motion.div>
  );
};

export default NFIChart;
