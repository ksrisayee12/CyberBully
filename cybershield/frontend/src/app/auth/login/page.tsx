"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";
import Cookies from "js-cookie";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await authApi.login(form);
      Cookies.set("token", res.data.data.access_token, { expires: 1 });
      router.replace("/dashboard/overview");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-cyan-400 w-8 h-8" />
          <span className="text-white font-bold text-xl">CyberShield AI</span>
        </div>
        <h2 className="text-white text-2xl font-semibold mb-6">Sign in</h2>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
              required />
          </div>
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
              required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-[hsl(var(--muted-foreground))] text-sm text-center mt-6">
          No account? <Link href="/auth/register" className="text-cyan-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
