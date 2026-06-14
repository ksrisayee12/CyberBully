"use client";
import { useEffect, useState, useCallback } from "react";
import { analyticsApi, monitorApi } from "@/services/api";
import { StatCard } from "@/components/ui/StatCard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MessageSquare, AlertTriangle, FileText, ShieldAlert, Activity, Bell } from "lucide-react";

interface Overview {
  total_posts: number; total_comments: number; total_messages: number;
  flagged_content: number; critical_alerts: number; unread_alerts: number;
}

export default function OverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [status, setStatus] = useState<any[]>([]);
  const [monForm, setMonForm] = useState({ instagram_username: "", instagram_password: "" });
  const [monLoading, setMonLoading] = useState(false);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  const load = async () => {
    try {
      const [ov, st] = await Promise.all([analyticsApi.overview(), monitorApi.status()]);
      setOverview(ov.data.data);
      setStatus(st.data.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onWsMessage = useCallback((data: any) => {
    setLiveEvents(prev => [`[${new Date().toLocaleTimeString()}] ${data.event} — ${data.severity || ""}`, ...prev.slice(0, 19)]);
    load();
  }, []);
  useWebSocket(onWsMessage);

  const startMonitor = async (e: React.FormEvent) => {
    e.preventDefault(); setMonLoading(true);
    try { await monitorApi.start(monForm); setMonForm({ instagram_username: "", instagram_password: "" }); load(); } catch {}
    setMonLoading(false);
  };
  const stopMonitor = async () => { await monitorApi.stop({}); load(); };
  const running = status.find(s => s.status === "running");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Real-time cyberbullying detection dashboard</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Posts" value={overview?.total_posts ?? "—"} icon={FileText} />
        <StatCard label="Comments" value={overview?.total_comments ?? "—"} icon={MessageSquare} />
        <StatCard label="Messages" value={overview?.total_messages ?? "—"} icon={MessageSquare} color="text-purple-400" />
        <StatCard label="Flagged" value={overview?.flagged_content ?? "—"} icon={ShieldAlert} color="text-yellow-400" />
        <StatCard label="Critical" value={overview?.critical_alerts ?? "—"} icon={AlertTriangle} color="text-red-400" />
        <StatCard label="Unread" value={overview?.unread_alerts ?? "—"} icon={Bell} color="text-orange-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-white font-semibold">Instagram Monitor</h2>
          </div>
          {running ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Monitoring @{running.username}</span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Session expires 15 min after start.</p>
              <button onClick={stopMonitor} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm hover:bg-red-500/20 transition-colors">Stop Monitoring</button>
            </div>
          ) : (
            <form onSubmit={startMonitor} className="space-y-3">
              <input value={monForm.instagram_username} onChange={e => setMonForm({ ...monForm, instagram_username: e.target.value })} placeholder="Instagram username" required className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" />
              <input type="password" value={monForm.instagram_password} onChange={e => setMonForm({ ...monForm, instagram_password: e.target.value })} placeholder="Instagram password" required className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" />
              <button type="submit" disabled={monLoading} className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm disabled:opacity-50 transition-colors">{monLoading ? "Starting..." : "Start Monitoring"}</button>
            </form>
          )}
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <h2 className="text-white font-semibold">Live Events</h2>
          </div>
          {liveEvents.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No events yet. Start monitoring to see live activity.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {liveEvents.map((ev, i) => <p key={i} className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{ev}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
