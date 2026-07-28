"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, UtensilsCrossed, ChefHat, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderUid = params.orderUid;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/customer/order/${orderUid}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Poll every 5s for live updates
    return () => clearInterval(interval);
  }, [orderUid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50/30">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mx-auto" />
          <p className="font-extrabold text-purple-900 text-sm">Fetching Live Order Status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-purple-50/30">
        <div className="glass-card p-8 rounded-3xl text-center space-y-4 max-w-sm w-full">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link href="/" className="inline-block px-6 py-2.5 rounded-xl btn-purple text-xs font-bold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const getStatusStep = (status) => {
    switch (status) {
      case "PENDING":
        return 1;
      case "ACCEPTED":
        return 2;
      case "PREPARING":
        return 3;
      case "SERVED":
      case "COMPLETED":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStep(order.orderStatus);

  return (
    <div className="min-h-screen pb-20 bg-purple-50/30 text-slate-900">
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-slate-900">Order #{order.orderNumber}</h1>
            <span className="text-xs text-purple-700 font-extrabold">{order.restaurant?.restaurantName}</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Status Card Header */}
        <section className="glass-card p-6 rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
            <ChefHat className="w-8 h-8 text-purple-200 animate-pulse" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Current Status</span>
            <h2 className="text-2xl font-black text-white mt-1">
              {order.orderStatus === "PENDING" && "Sent to Kitchen"}
              {order.orderStatus === "ACCEPTED" && "Order Accepted!"}
              {order.orderStatus === "PREPARING" && "Chef is Preparing..."}
              {order.orderStatus === "SERVED" && "Served at Your Table!"}
              {order.orderStatus === "COMPLETED" && "Completed & Thank You!"}
              {order.orderStatus === "CANCELLED" && "Cancelled"}
            </h2>
            <p className="text-xs text-purple-100 mt-1 font-medium">
              {order.qrTable ? `Seated at ${order.qrTable.tableTitle}` : "Direct Table Order"}
            </p>
          </div>
        </section>

        {/* Live Stepper */}
        <section className="glass-card p-6 rounded-2xl bg-white space-y-4 border border-purple-100 shadow-sm">
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Kitchen Live Progress</h3>

          <div className="relative flex items-center justify-between text-center px-2">
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-purple-100 -translate-y-1/2 -z-0" />
            <div
              className="absolute top-1/2 left-6 h-1 bg-purple-600 -translate-y-1/2 -z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 1 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-500"}`}>
                1
              </div>
              <span className="text-[10px] font-bold mt-1">Sent</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 2 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-500"}`}>
                2
              </div>
              <span className="text-[10px] font-bold mt-1">Accepted</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 3 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-500"}`}>
                3
              </div>
              <span className="text-[10px] font-bold mt-1">Cooking</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 4 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-500"}`}>
                4
              </div>
              <span className="text-[10px] font-bold mt-1">Served</span>
            </div>
          </div>
        </section>

        {/* Itemized Order Receipt */}
        <section className="glass-card p-5 rounded-2xl bg-white space-y-3 border border-purple-100 shadow-sm">
          <h3 className="font-extrabold text-xs text-slate-700 uppercase">Ordered Dishes</h3>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">{item.quantity}x {item.itemName}</span>
                <span className="font-mono text-slate-900 font-bold">₹{parseFloat(item.subTotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900">
            <span>Grand Total</span>
            <span className="text-purple-700">₹{parseFloat(order.grandTotal).toFixed(2)}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
