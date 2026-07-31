"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, CheckCircle2, XCircle, ArrowLeft, Coins, Wallet, CreditCard, Sun, Moon, Laptop } from "lucide-react";

export default function AdminRestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants");
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const updateSetting = async (restaurantId, updateObj) => {
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, ...updateObj }),
      });

      if (res.ok) {
        fetchRestaurants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-sm font-bold">
        Loading Restaurant Directory...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="glass-navbar sticky top-0 z-40 px-4 py-4 bg-white/90 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center space-x-3">
          <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-slate-900 text-lg">Onboarded Restaurants & Payment Controls</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map((r) => (
            <div key={r.id} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{r.restaurantName}</h2>
                  <span className="text-xs font-mono text-purple-700 font-bold">slug: {r.slug}</span>
                </div>
                <button
                  onClick={() => updateSetting(r.id, { isActive: !r.isActive })}
                  className={`px-3.5 py-1 rounded-full text-xs font-black uppercase shadow-xs cursor-pointer ${
                    r.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"
                  }`}
                >
                  {r.isActive ? "Active" : "Disabled"}
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <div>Mobile: <span className="text-slate-900 font-bold">{r.restaurantMobileNo}</span></div>
                <div>Email: <span className="text-slate-900 font-bold">{r.restaurantEmail}</span></div>
                <div>Address: <span className="text-slate-800">{r.address || "N/A"}</span></div>
              </div>

              {/* Payment Methods & Theme Switches */}
              <div className="border-t pt-3 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Payment Method Settings
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {/* Cash */}
                  <button
                    type="button"
                    onClick={() => updateSetting(r.id, { isCashEnabled: !r.isCashEnabled })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      r.isCashEnabled ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200 line-through"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>Cash</span>
                    </span>
                    <span className="text-[10px] uppercase font-black">{r.isCashEnabled ? "ON" : "OFF"}</span>
                  </button>

                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => updateSetting(r.id, { isOnlineUpiEnabled: !r.isOnlineUpiEnabled })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      r.isOnlineUpiEnabled ? "bg-purple-50 text-purple-800 border-purple-200" : "bg-slate-50 text-slate-400 border-slate-200 line-through"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>UPI</span>
                    </span>
                    <span className="text-[10px] uppercase font-black">{r.isOnlineUpiEnabled ? "ON" : "OFF"}</span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => updateSetting(r.id, { isCreditCardEnabled: !r.isCreditCardEnabled })}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      r.isCreditCardEnabled ? "bg-blue-50 text-blue-800 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200 line-through"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </span>
                    <span className="text-[10px] uppercase font-black">{r.isCreditCardEnabled ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 border-t pt-3 text-xs font-bold text-slate-600">
                <span>{r._count?.menus || 0} Menu Items</span>
                <span>•</span>
                <span>{r._count?.orders || 0} Total Orders</span>
                <span>•</span>
                <span>Theme: <strong className="text-purple-700">{r.themeMode || "DARK"}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
