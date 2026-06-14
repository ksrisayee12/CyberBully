"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#06b6d4", "#ef4444", "#f59e0b", "#8b5cf6", "#10b981", "#f97316"];

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    analyticsApi.trends().then(r => setTrends(r.data.data)).catch(() => {});
  }, []);

  const categoryData = trends?.category_distribution?.filter((d: any) => d.category !== "safe") || [];
  const severityData = trends?.severity_distribution || [];
  const offenderData = trends?.top_offenders?.slice(0, 8) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Toxicity trends and threat intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-white font-semibold mb-6">Category Distribution</h2>
          {categoryData.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No flagged content yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2a3a", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Severity Distribution */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-white font-semibold mb-6">Severity Distribution</h2>
          {severityData.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityData}>
                <XAxis dataKey="severity" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2a3a", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Offenders Chart */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 lg:col-span-2">
          <h2 className="text-white font-semibold mb-6">Top Offenders</h2>
          {offenderData.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">No violations detected yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={offenderData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis dataKey="username" type="category" tick={{ fill: "#6b7280", fontSize: 12 }} width={100} />
                <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2a3a", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="violations" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
