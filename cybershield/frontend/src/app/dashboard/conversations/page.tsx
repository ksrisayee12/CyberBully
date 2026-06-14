"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { conversationApi } from "@/services/api";
import { MessageSquare, ArrowLeft, Activity, Flame, BarChart2, Clock } from "lucide-react";

const riskColor = (score: number) =>
  score >= 80 ? "text-red-400" : score >= 50 ? "text-orange-400" : score >= 30 ? "text-yellow-400" : "text-green-400";

const escalationStyle: Record<string, { label: string; class: string }> = {
  escalating:       { label: "⚠ Escalating",       class: "bg-red-500/10 text-red-400 border-red-500/30" },
  "de-escalating":  { label: "↘ De-escalating",    class: "bg-green-500/10 text-green-400 border-green-500/30" },
  stable:           { label: "→ Stable",            class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
  insufficient_data:{ label: "? Insufficient data", class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
};

export default function ConversationsPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [intelLoading, setIntelLoading] = useState(false);

  useEffect(() => {
    conversationApi.list()
      .then(r => { setConvs(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openConv = async (id: number) => {
    const r = await conversationApi.detail(id);
    setSelected(r.data.data);
    setIntelligence(null);

    // Fetch intelligence in parallel
    setIntelLoading(true);
    try {
      const ir = await conversationApi.intelligence(id);
      if (ir.data.success) setIntelligence(ir.data.data);
    } catch {}
    setIntelLoading(false);
  };

  const back = () => { setSelected(null); setIntelligence(null); };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Conversation Intelligence</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1.5 font-medium">Deep AI analysis of ongoing direct messages and escalation vectors</p>
      </motion.div>

      <AnimatePresence mode="wait">
      {selected ? (
        <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
          <button onClick={back} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Conversations
          </button>

          {/* Conversation header + messages */}
          <div className="glass-panel rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="flex flex-wrap items-center justify-between mb-6 relative z-10">
              <div>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">Thread Participant</p>
                <h2 className="text-3xl font-black text-white">@{selected.conversation.participant}</h2>
              </div>
              <div className="text-right">
                <span className={`text-4xl font-black drop-shadow-md ${riskColor(selected.conversation.risk_score)}`}>
                  {selected.conversation.risk_score}%
                </span>
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider mt-1">Risk Score</p>
              </div>
            </div>
            
            <div className="flex gap-4 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-6 pb-6 border-b border-white/5 relative z-10">
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-cyan-400" /> {selected.conversation.message_count} messages</span>
              <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-red-400" /> {selected.conversation.flagged_count} flagged</span>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2 relative z-10">
              {selected.messages.map((m: any, idx: number) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={m.id} className="p-4 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">@{m.sender}</span>
                    {m.timestamp && (
                      <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-70" />{new Date(m.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm leading-relaxed">{m.content}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Intelligence Panel */}
          <div className="glass-panel rounded-2xl p-7 relative overflow-hidden border-cyan-500/30 glow-border-cyan">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-purple-500/[0.03] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20"><Activity className="w-5 h-5 text-cyan-400" /></div>
              <h3 className="text-white font-bold text-xl">Deep Intelligence Engine</h3>
              <span className="ml-2 text-[10px] px-2 py-1 uppercase tracking-widest font-black rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Domain 7 Active</span>
            </div>

            {intelLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-black/40 border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : intelligence ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-6">
                  {/* Escalation status */}
                  <div className="rounded-xl bg-black/40 border border-white/5 p-5 shadow-inner col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-widest mb-3">Vector Trajectory</p>
                    {(() => {
                      const s = escalationStyle[intelligence.escalation] ?? escalationStyle.insufficient_data;
                      return (
                        <span className={`text-sm font-bold px-3 py-1.5 rounded-full border shadow-sm ${s.class}`}>
                          {s.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="rounded-xl bg-black/40 border border-white/5 p-5 shadow-inner">
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-widest mb-1.5">Threat Density</p>
                    <p className={`text-3xl font-black ${riskColor(intelligence.threat_density_percent)} drop-shadow-md`}>
                      {intelligence.threat_density_percent}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/40 border border-white/5 p-5 shadow-inner">
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-widest mb-1.5">Abuse Freq / Day</p>
                    <p className="text-3xl font-black text-white drop-shadow-md">{intelligence.abuse_frequency_per_day}</p>
                  </div>

                  <div className="rounded-xl bg-black/40 border border-white/5 p-5 shadow-inner">
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-widest mb-1.5">Compound Risk</p>
                    <p className={`text-3xl font-black ${riskColor(intelligence.risk_score)} drop-shadow-md`}>
                      {intelligence.risk_score}%
                    </p>
                  </div>
                </div>

                {/* Category breakdown */}
                {intelligence.category_breakdown?.length > 0 && (
                  <div className="pt-5 border-t border-white/5">
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-400" /> Category Breakdown
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {intelligence.category_breakdown.map((cb: any) => (
                        <span key={cb.category} className="px-3 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs text-white font-medium flex items-center gap-2 shadow-inner">
                          {cb.category.replace("_", " ")} 
                          <span className="text-cyan-400 font-black">{cb.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] bg-black/40 p-4 rounded-xl border border-white/5 inline-block">
                Intelligence Engine requires at least 4 moderated messages in this thread.
              </p>
            )}
          </div>
        </motion.div>

      ) : loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl glass-panel animate-pulse" />)}
        </div>
      ) : convs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl p-16 text-center border-dashed">
          <MessageSquare className="w-12 h-12 text-[hsl(var(--muted-foreground))] opacity-50 mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))] font-medium text-lg">No conversation streams collected yet.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden" animate="show" exit="hidden"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className="space-y-4"
        >
          {convs.map(conv => (
            <motion.button
              variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
              key={conv.id}
              onClick={() => openConv(conv.id)}
              className="w-full text-left rounded-2xl glass-panel p-5 hover:border-cyan-500/40 hover:bg-white/[0.03] transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-white font-bold text-lg tracking-wide group-hover:text-cyan-400 transition-colors">@{conv.participant}</span>
                <span className={`text-2xl font-black drop-shadow-sm ${riskColor(conv.risk_score)}`}>{conv.risk_score}%</span>
              </div>
              <div className="flex gap-5 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mt-2 relative z-10">
                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {conv.message_count} msgs</span>
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> {conv.flagged_count} flagged</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
