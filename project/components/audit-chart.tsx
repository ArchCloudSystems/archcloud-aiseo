"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AuditData = {
  name: string;
  score: number;
  date: string;
};

const formatNumber = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-md p-3 shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-sm text-muted-foreground">
          Score: <span className="font-semibold text-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AuditChart({ data }: { data: AuditData[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-muted-foreground"
            height={40}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-muted-foreground"
            width={40}
            tickFormatter={formatNumber}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
