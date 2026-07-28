"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Utensils, Lock, Mail, ArrowRight } from "lucide-react";

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manager@spicegarden.com");
  const [password, setPassword] = useState("eatscan123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/restaurant-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("eatscan_manager_token", data.token);
      localStorage.setItem("eatscan_manager_restaurant_id", data.member.restaurantId);
      localStorage.setItem("eatscan_manager_restaurant_name", data.member.restaurantName);

      router.push("/restaurant/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-rose-500 to-amber-400">
      <div className="glass-card p-8 sm:p-10 rounded-3xl max-w-md w-full space-y-6 shadow-2xl border border-white/80">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white text-purple-600 flex items-center justify-center mx-auto shadow-md">
            <Utensils className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Manager PWA Login</h1>
          <p className="text-xs text-slate-600 font-medium">Access real-time order alerts & kitchen manager dashboard</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Login to PWA Board"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/register" className="text-xs text-purple-700 font-bold hover:underline">
            Don't have an account? Register Restaurant →
          </Link>
        </div>
      </div>
    </div>
  );
}
