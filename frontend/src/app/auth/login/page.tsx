"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FlaskConical, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-900 border-r border-slate-800 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-9 h-9 rounded-lg bg-clinical-600 flex items-center justify-center">
            <FlaskConical size={18} className="text-white" />
          </div>
          <span className="font-display text-xl text-slate-100">MetaLens</span>
        </div>
        <div className="relative z-10 mb-auto">
          <h2 className="font-display text-4xl text-slate-100 leading-tight mb-4">
            Systematic review,<br />
            <span className="text-clinical-400">accelerated by AI.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Upload research PDFs. Extract structured clinical data automatically. 
            Validate, edit, and export clean datasets — ready for meta-analysis.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-12">
          {[
            { label: "Extraction", desc: "Automated PICO data" },
            { label: "Validation", desc: "AI confidence scoring" },
            { label: "Export", desc: "Clean CSV datasets" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              <div className="text-xs text-clinical-400 font-medium mb-1 uppercase tracking-wider">{item.label}</div>
              <div className="text-sm text-slate-300">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-clinical-600 flex items-center justify-center">
              <FlaskConical size={18} className="text-white" />
            </div>
            <span className="font-display text-xl text-slate-100">MetaLens</span>
          </div>

          <h1 className="font-display text-3xl text-slate-100 mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="researcher@institution.edu"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href="/auth/register" className="text-clinical-400 hover:text-clinical-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
