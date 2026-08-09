"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS: Record<string, string> = {
  asr_error: "#f97316",
  reasoning_error: "#ef4444",
  tool_argument_error: "#a855f7",
  integration_error: "#3b82f6",
  false_confirmation: "#f59e0b",
};

const LABELS: Record<string, string> = {
  asr_error: "ASR Error",
  reasoning_error: "Reasoning Error",
  tool_argument_error: "Tool Argument Error",
  integration_error: "Integration Error",
  false_confirmation: "False Confirmation",
};

export function RootCauseChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: LABELS[name] || name,
    value,
    color: COLORS[name] || "#6b7280",
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No failure data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "13px" }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
