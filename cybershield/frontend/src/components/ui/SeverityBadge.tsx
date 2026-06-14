export function SeverityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Safe: "bg-green-500/10 text-green-400 border-green-500/20",
    Moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Critical: "bg-red-500/10 text-red-400 border-red-500/20",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Clean: "bg-green-500/10 text-green-400 border-green-500/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[level] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {level}
    </span>
  );
}
