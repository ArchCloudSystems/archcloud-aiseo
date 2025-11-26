"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type AuditData = {
  name: string;
  score: number;
  date: string;
};

export function AuditChart({ data }: { data: AuditData[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'currentColor' }}
          className="text-muted-foreground"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: 'currentColor' }}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
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
  );
}
