"use client";
import { useEffect, useState } from "react";
import { alertApi } from "@/services/api";
import api from "@/services/api";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { AlertTriangle, Mail } from "lucide-react";

export default function EmergencyPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/emergency/reports"),
      api.get("/emergency/email-logs"),
    ]).then(([r, e]) => {
      setReports(r.data.data);
      setEmailLogs(e.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Emergency Center</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">Critical incident reports and email notifications</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[hsl(var(--card))] animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Reports */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-white font-semibold">Incident Reports</h2>
            </div>
            {reports.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No incidents recorded.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reports.map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-[hsl(var(--muted))] border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <SeverityBadge level={r.severity} />
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-white mt-1">Risk Score: <span className="text-red-400 font-bold">{r.risk_score}/100</span></p>
                    {r.report_data?.content_preview && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">{r.report_data.content_preview}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Logs */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-cyan-400" />
              <h2 className="text-white font-semibold">Email Notifications</h2>
            </div>
            {emailLogs.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No emails sent yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {emailLogs.map(l => (
                  <div key={l.id} className="p-3 rounded-lg bg-[hsl(var(--muted))]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{l.recipient}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status === "sent" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{l.status}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      <span>{l.incident_type}</span>
                      <span>{new Date(l.sent_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
