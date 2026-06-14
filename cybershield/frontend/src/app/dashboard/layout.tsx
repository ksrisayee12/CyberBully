"use client";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, BarChart2, Bell, MessageSquare,
  Users, AlertTriangle, Shield, LogOut
} from "lucide-react";

const nav = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/offenders", label: "Offenders", icon: Users },
  { href: "/dashboard/emergency", label: "Emergency", icon: AlertTriangle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Cookies.get("token")) router.replace("/auth/login");
  }, [router]);

  const logout = () => { Cookies.remove("token"); router.replace("/auth/login"); };

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="p-6 flex items-center gap-3 border-b border-[hsl(var(--border))]">
          <Shield className="text-cyan-400 w-7 h-7" />
          <span className="text-white font-bold text-lg">CyberShield</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${pathname === href
                  ? "bg-cyan-500/10 text-cyan-400 font-medium"
                  : "text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5"}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[hsl(var(--border))]">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
