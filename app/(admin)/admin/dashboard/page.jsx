"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Users, ShoppingBag, ShieldCheck, ArrowRight, TrendingUp, Layers, QrCode } from "lucide-react";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    restaurantsCount: 1,
    customersCount: 12,
    ordersCount: 48,
    tablesCount: 6,
  });

  useEffect(() => {
    const token = localStorage.getItem("eatscan_admin_token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-3xl bg-white border border-white/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-amber-500">
              <Store className="w-6 h-6" />
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">+100%</span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">Onboarded Restaurants</span>
            <div className="text-3xl font-black text-slate-900">{stats.restaurantsCount}</div>
          </div>

          <div className="glass-card p-6 rounded-3xl bg-white border border-white/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-purple-600">
              <Users className="w-6 h-6" />
              <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Acquired</span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">Verified Customers</span>
            <div className="text-3xl font-black text-slate-900">{stats.customersCount}</div>
          </div>

          <div className="glass-card p-6 rounded-3xl bg-white border border-white/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-rose-500">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">Live</span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">System Orders</span>
            <div className="text-3xl font-black text-slate-900">{stats.ordersCount}</div>
          </div>

          <div className="glass-card p-6 rounded-3xl bg-white border border-white/80 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <QrCode className="w-6 h-6" />
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">System QR Tables</span>
            <div className="text-3xl font-black text-slate-900">{stats.tablesCount}</div>
          </div>
        </div>

        {/* Quick Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/restaurant"
            className="glass-card p-6 rounded-3xl bg-white border border-white/80 hover:border-amber-400 transition-all space-y-3 block group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg group-hover:text-amber-600 transition-colors">
                Restaurant Onboarding & Status Control
              </h3>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Review onboarded restaurants, verify mobile/email, inspect uploaded raw menu images, and activate/deactivate accounts.
            </p>
          </Link>

          <Link
            href="/admin/member"
            className="glass-card p-6 rounded-3xl bg-white border border-white/80 hover:border-purple-400 transition-all space-y-3 block group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
                Admin Team & Role Permissions (RBAC)
              </h3>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Manage database level roles (`Role`), permission matrices (`RolePermission`), and assign admin team members.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
