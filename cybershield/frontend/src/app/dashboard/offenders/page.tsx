"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/services/api";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Users } from "lucide-react";

export default function OffendersPage() {
  const [offenders, setOffenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.offenders().then(r => { setOffenders(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Offenders</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Repeat harassment leaderboard</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-[hsl(var(--card))] animate-pulse" />)}</div>
      ) : offenders.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <Users className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-[hsl(var(--muted-foreground))]">No violations recorded yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="text-left p-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">#</th>
                <th className="text-left p-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">Username</th>
                <th className="text-left p-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">Violations</th>
                <th className="text-left p-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">Risk Level</th>
                <th className="text-left p-4 text-xs text-[hsl(var(--muted-foreground))] font-medium">Threat Bar</th>
              </tr>
            </thead>
            <tbody>
              {offenders.map((o, i) => (
                <tr key={o.username} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-white/2">
                  <td className="p-4 text-sm text-[hsl(var(--muted-foreground))]">{i + 1}</td>
                  <td className="p-4 text-sm text-white font-medium">@{o.username}</td>
                  <td className="p-4 text-sm text-white">{o.violations}</td>
                  <td className="p-4"><SeverityBadge level={o.risk_level} /></td>
                  <td className="p-4 w-32">
                    <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((o.violations / Math.max(...offenders.map((x: any) => x.violations))) * 100, 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
