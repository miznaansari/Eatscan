"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function AdminOrderLedgerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/restaurant/order-status?restaurantId=clr123sample");
        const data = await res.json();
        if (data.success) setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 glass-card border-b border-slate-200/80 px-4 py-4 bg-white/90">
        <div className="max-w-6xl mx-auto flex items-center space-x-3">
          <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-black text-slate-900 text-lg">System-Wide Customer Orders</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-4">
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 flex items-center justify-between text-xs shadow-sm">
              <div>
                <span className="font-black text-purple-700 text-sm">#{o.orderNumber}</span>
                <div className="text-slate-500 font-medium mt-1">
                  Customer: <span className="text-slate-900 font-bold">{o.customer?.mobileNo}</span> • {o.qrTable?.tableTitle || "Direct"}
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-slate-900 text-base font-black">₹{parseFloat(o.grandTotal).toFixed(2)}</span>
                <div className="text-purple-700 font-bold uppercase">{o.orderStatus}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
