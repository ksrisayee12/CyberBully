import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon: Icon, color = "text-cyan-400", sub }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative overflow-hidden rounded-2xl glass-panel p-6 group cursor-default"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-semibold">{label}</span>
        <div className={`p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="text-4xl font-black tracking-tight text-white relative z-10 drop-shadow-md">
        {value}
      </div>
      
      {sub && <div className="text-sm text-[hsl(var(--muted-foreground))] mt-2 relative z-10 font-medium">{sub}</div>}
    </motion.div>
  );
}
