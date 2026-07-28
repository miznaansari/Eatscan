"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, UtensilsCrossed, ChefHat, Sparkles, AlertCircle, ArrowLeft, BellRing, PhoneCall, ChevronRight, MapPin } from "lucide-react";

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderUid = params.orderUid;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceRequested, setServiceRequested] = useState(false);

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
    const interval = setInterval(fetchOrder, 4000); // Poll every 4s for live kitchen status
    return () => clearInterval(interval);
  }, [orderUid]);

  const handleCallWaiter = () => {
    setServiceRequested(true);
    setTimeout(() => setServiceRequested(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100/70 via-slate-50 to-purple-50/50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mx-auto" />
          <p className="font-extrabold text-purple-900 text-sm">Fetching Live Order Tracker...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-purple-100/70 via-slate-50 to-purple-50/50">
        <div className="glass-card p-8 rounded-3xl text-center space-y-4 max-w-sm w-full border border-white shadow-2xl">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500 font-medium">{error}</p>
          <Link href="/" className="inline-block px-6 py-3 rounded-2xl btn-purple text-xs font-black shadow-md">
            Return to Home
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
    <div className="min-h-screen pb-24 bg-gradient-to-b from-purple-100/70 via-slate-50 to-purple-50/50 relative text-slate-900">
      {/* Background ambient liquid glass orbs */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-purple-400/15 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="glass-navbar sticky-header sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push(order.restaurant?.slug ? `/restaurant/${order.restaurant.slug}` : "/")}
            className="p-2.5 rounded-2xl glass-pill text-slate-800 border border-purple-200 shadow-sm hover:text-purple-700 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-slate-900">Order #{order.orderNumber}</h1>
            <span className="text-xs text-purple-700 font-extrabold">{order.restaurant?.restaurantName || "Spice Garden Bistro"}</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Status Card Banner - High-Contrast Solid White Pearl Glass */}
        <section className="glass-card p-6 rounded-3xl bg-white text-center space-y-3 shadow-xl border border-white/90">
          <div className="w-14 h-14 rounded-2xl btn-purple text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
            {order.orderStatus === "PENDING" && <Clock className="w-7 h-7 text-white animate-spin" />}
            {order.orderStatus === "ACCEPTED" && <CheckCircle2 className="w-7 h-7 text-white" />}
            {order.orderStatus === "PREPARING" && <ChefHat className="w-7 h-7 text-white animate-pulse" />}
            {order.orderStatus === "SERVED" && <UtensilsCrossed className="w-7 h-7 text-white" />}
            {order.orderStatus === "COMPLETED" && <Sparkles className="w-7 h-7 text-white animate-bounce" />}
          </div>

          <div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 font-black text-xs border border-purple-200 shadow-sm">
              Live Order Tracker
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2 leading-tight">
              {order.orderStatus === "PENDING" && "Sent to Kitchen"}
              {order.orderStatus === "ACCEPTED" && "Order Accepted!"}
              {order.orderStatus === "PREPARING" && "Chef is Preparing..."}
              {order.orderStatus === "SERVED" && "Served at Your Table!"}
              {order.orderStatus === "COMPLETED" && "Completed & Thank You!"}
              {order.orderStatus === "CANCELLED" && "Order Cancelled"}
            </h2>
            <p className="text-xs text-purple-700 mt-1 font-extrabold">
              {order.qrTable ? `Seated at ${order.qrTable.tableTitle}` : "Table Order"}
            </p>
          </div>
        </section>

        {/* Live Stepper */}
        <section className="glass-card p-6 rounded-3xl space-y-4 border border-white/90 shadow-md bg-white/90">
          <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">Kitchen Live Progress</h3>

          <div className="relative flex items-center justify-between text-center px-2">
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-purple-100 -translate-y-1/2 -z-0" />
            <div
              className="absolute top-1/2 left-6 h-1 bg-purple-600 -translate-y-1/2 -z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${currentStep >= 1 ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-purple-100 text-purple-400"}`}>
                1
              </div>
              <span className="text-[10px] font-extrabold mt-1.5 text-slate-800">Sent</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${currentStep >= 2 ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-purple-100 text-purple-400"}`}>
                2
              </div>
              <span className="text-[10px] font-extrabold mt-1.5 text-slate-800">Accepted</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${currentStep >= 3 ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-purple-100 text-purple-400"}`}>
                3
              </div>
              <span className="text-[10px] font-extrabold mt-1.5 text-slate-800">Cooking</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${currentStep >= 4 ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-purple-100 text-purple-400"}`}>
                4
              </div>
              <span className="text-[10px] font-extrabold mt-1.5 text-slate-800">Served</span>
            </div>
          </div>
        </section>

        {/* Instant Table Service Button */}
        <button
          type="button"
          onClick={handleCallWaiter}
          className="w-full p-4 rounded-2xl btn-purple text-white font-black text-xs shadow-xl flex items-center justify-between transition-all"
        >
          <div className="flex items-center space-x-3">
            <BellRing className="w-5 h-5 text-purple-200 animate-bounce" />
            <span>{serviceRequested ? "Waiter Alerted! On the way..." : "Call Waiter / Request Service"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-200" />
        </button>

        {/* Payment Status Banner */}
        <section className={`glass-card p-4 rounded-2xl border text-center flex items-center justify-between shadow-sm ${
          order.paymentStatus === "PAID"
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
            : "bg-rose-50/90 border-rose-200 text-rose-900"
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
              order.paymentStatus === "PAID" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}>
              {order.paymentStatus === "PAID" ? "✓" : "!"}
            </div>
            <div className="text-left">
              <div className="font-black text-xs uppercase tracking-wider">
                {order.paymentStatus === "PAID" ? "Payment Complete" : "Payment Pending"}
              </div>
              <span className="text-[11px] font-extrabold text-slate-600">
                {order.paymentStatus === "PAID"
                  ? `Paid via ${order.paymentMethod || "Cash"}`
                  : `Please pay ₹${parseFloat(order.dueAmount !== undefined ? order.dueAmount : order.grandTotal).toFixed(2)} at table or counter`}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase shadow-sm ${
            order.paymentStatus === "PAID" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}>
            {order.paymentStatus || "PENDING"}
          </span>
        </section>

        {/* Itemized Order Receipt */}
        <section className="glass-card p-5 rounded-3xl space-y-4 border border-white/90 shadow-md bg-white/90">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">Ordered Dishes</h3>
            <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Method: {order.paymentMethod || "CASH"}
            </span>
          </div>

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-xs border-b border-purple-50 pb-2.5 last:border-b-0 last:pb-0">
                <div>
                  <div className="text-slate-900 font-black">{item.quantity}x {item.itemName}</div>
                  {item.variantName && (
                    <div className="text-[10px] font-extrabold text-purple-700 mt-0.5">Portion: {item.variantName}</div>
                  )}
                  {item.selectedAddons && (
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">{item.selectedAddons}</div>
                  )}
                </div>
                <span className="font-mono text-slate-900 font-black text-xs">₹{parseFloat(item.subTotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-100 pt-3 space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">₹{parseFloat(order.totalAmount || order.grandTotal).toFixed(2)}</span>
            </div>
            {parseFloat(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-bold">-₹{parseFloat(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-purple-50">
              <span>Grand Total</span>
              <span className="text-slate-900 text-base font-black">₹{parseFloat(order.grandTotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-extrabold pt-1">
              <span>Paid Amount</span>
              <span>₹{parseFloat(order.paidAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-black text-sm pt-1 border-t border-purple-50">
              <span>Due Amount</span>
              <span className="text-rose-600 font-mono text-base">
                ₹{parseFloat(order.dueAmount !== undefined ? order.dueAmount : order.grandTotal).toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
