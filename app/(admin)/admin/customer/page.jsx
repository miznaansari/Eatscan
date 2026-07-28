"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Store } from "lucide-react";

export default function AdminCustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/admin/customers");
        const data = await res.json();
        if (data.success) setCustomers(data.customers || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-sm font-bold">
        Loading Customer Directory...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 glass-card border-b border-slate-200/80 px-4 py-4 bg-white/90">
        <div className="max-w-6xl mx-auto flex items-center space-x-3">
          <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-slate-900 text-lg">Customer Acquisition Ledger</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base">{c.name || "Guest Diner"}</h3>
                <span className="text-xs font-mono font-bold text-purple-700">{c.mobileNo}</span>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Acquired by:{" "}
                <span className="text-purple-700 font-bold">
                  {c.acquiredByRestaurant?.restaurantName || "Spice Garden Bistro"}
                </span>
              </div>

              <div className="border-t pt-2 text-xs font-bold text-slate-700 flex justify-between">
                <span>Total Orders Placed:</span>
                <span className="text-purple-700">{c._count?.orders || 0} Orders</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
