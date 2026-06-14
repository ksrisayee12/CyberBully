export function SeverityBadge({ level }: { level: string }) {
  const isCritical = level === "Critical" || level === "High";
  
  const colors: Record<string, string> = {
    Safe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    Critical: "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.3)] glow-text-red",
    Low: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    Clean: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
  };

  const dotColors: Record<string, string> = {
    Safe: "bg-emerald-400",
    Moderate: "bg-amber-400",
    High: "bg-orange-400",
    Critical: "bg-red-400",
    Low: "bg-cyan-400",
    Medium: "bg-amber-400",
    Clean: "bg-emerald-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase ${colors[level] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
      {isCritical && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[level]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[level]}`}></span>
        </span>
      )}
      {!isCritical && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[level] || "bg-zinc-400"}`} />}
      {level}
    </span>
  );
}
