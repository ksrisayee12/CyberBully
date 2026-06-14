"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";
import Cookies from "js-cookie";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", instagram_username: "", emergency_contact_email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await authApi.register(form);
      Cookies.set("token", res.data.data.access_token, { expires: 1 });
      router.replace("/dashboard/overview");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally { setLoading(false); }
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "password", label: "Password", type: "password" },
    { key: "instagram_username", label: "Instagram Username", type: "text" },
    { key: "emergency_contact_email", label: "Emergency Contact Email", type: "email" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-cyan-400 w-8 h-8" />
          <span className="text-white font-bold text-xl">CyberShield AI</span>
        </div>
        <h2 className="text-white text-2xl font-semibold mb-6">Create account</h2>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1.5 block">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                required={["name","email","password"].includes(f.key)}
                className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-[hsl(var(--muted-foreground))] text-sm text-center mt-6">
          Have an account? <Link href="/auth/login" className="text-cyan-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
