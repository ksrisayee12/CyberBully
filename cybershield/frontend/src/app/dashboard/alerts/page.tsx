"use client";
import { useEffect, useState } from "react";
import { alertApi } from "@/services/api";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Bell, CheckCircle } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => alertApi.list().then(r => { setAlerts(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const acknowledge = async (id: number) => {
    await alertApi.acknowledge(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "acknowledged" } : a));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">{alerts.filter(a => a.status === "unread").length} unread alerts</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[hsl(var(--card))] animate-pulse" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <Bell className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-[hsl(var(--muted-foreground))]">No alerts yet. Start monitoring to detect threats.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`rounded-xl border bg-[hsl(var(--card))] p-4 flex items-start justify-between gap-4 transition-opacity ${alert.status === "acknowledged" ? "opacity-50" : ""} ${alert.severity === "Critical" ? "border-red-500/30" : "border-[hsl(var(--border))]"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge level={alert.severity} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{alert.alert_type?.replace("_", " ")}</span>
                  {alert.status === "unread" && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
                </div>
                <p className="text-sm text-white truncate">{alert.content_preview || "No preview"}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
              {alert.status === "unread" && (
                <button onClick={() => acknowledge(alert.id)} className="shrink-0 p-2 rounded-lg hover:bg-white/5 text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
