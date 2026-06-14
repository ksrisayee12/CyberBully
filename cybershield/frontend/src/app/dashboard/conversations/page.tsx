"use client";
import { useEffect, useState } from "react";
import { conversationApi } from "@/services/api";
import { MessageSquare } from "lucide-react";

export default function ConversationsPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationApi.list().then(r => { setConvs(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openConv = async (id: number) => {
    const r = await conversationApi.detail(id);
    setSelected(r.data.data);
  };

  const riskColor = (score: number) => score >= 80 ? "text-red-400" : score >= 50 ? "text-orange-400" : score >= 30 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Conversations</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">DM risk analysis</p>
      </div>

      {selected ? (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-cyan-400 hover:underline">← Back to list</button>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">@{selected.conversation.participant}</h2>
              <span className={`text-2xl font-bold ${riskColor(selected.conversation.risk_score)}`}>{selected.conversation.risk_score}% risk</span>
            </div>
            <div className="flex gap-4 text-sm text-[hsl(var(--muted-foreground))] mb-6">
              <span>{selected.conversation.message_count} messages</span>
              <span>{selected.conversation.flagged_count} flagged</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selected.messages.map((m: any) => (
                <div key={m.id} className="p-3 rounded-lg bg-[hsl(var(--muted))] text-sm">
                  <span className="text-cyan-400 font-medium">@{m.sender}</span>
                  <p className="text-white mt-1">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[hsl(var(--card))] animate-pulse" />)}</div>
      ) : convs.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
          <MessageSquare className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-[hsl(var(--muted-foreground))]">No conversations collected yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {convs.map(conv => (
            <button key={conv.id} onClick={() => openConv(conv.id)} className="w-full text-left rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">@{conv.participant}</span>
                <span className={`text-lg font-bold ${riskColor(conv.risk_score)}`}>{conv.risk_score}%</span>
              </div>
              <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))] mt-1">
                <span>{conv.message_count} msgs</span>
                <span>{conv.flagged_count} flagged</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
