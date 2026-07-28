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
            {order.orderStatus === "PENDING" && <CheckCircle2 className="w-7 h-7 text-emerald-300 animate-bounce" />}
            {order.orderStatus === "ACCEPTED" && <CheckCircle2 className="w-7 h-7 text-white" />}
            {order.orderStatus === "PREPARING" && <ChefHat className="w-7 h-7 text-white animate-pulse" />}
            {order.orderStatus === "SERVED" && <UtensilsCrossed className="w-7 h-7 text-white" />}
            {order.orderStatus === "COMPLETED" && <Sparkles className="w-7 h-7 text-white animate-bounce" />}
            {order.orderStatus === "CANCELLED" && <AlertCircle className="w-7 h-7 text-rose-300" />}
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-xs border border-purple-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
              <span>
                Current Status: {order.orderStatus === "PENDING" && "Sent to Kitchen"}
                {order.orderStatus === "ACCEPTED" && "Order Accepted"}
                {order.orderStatus === "PREPARING" && "Chef Preparing..."}
                {order.orderStatus === "SERVED" && "Served at Table"}
                {order.orderStatus === "COMPLETED" && "Completed & Thank You!"}
                {order.orderStatus === "CANCELLED" && "Cancelled"}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-2.5 leading-tight">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-purple-700 mt-1 font-extrabold">
              {order.qrTable ? `Seated at ${order.qrTable.tableTitle}` : "Table Order"}
            </p>
          </div>
        </section>

        {/* Live Stepper - High Gloss iOS 26 Interactive Progress */}
        <section className="glass-card p-5 sm:p-6 rounded-3xl space-y-5 border border-white/90 shadow-lg bg-white/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">Kitchen Live Progress</h3>
            </div>
            <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 shadow-sm">
              Step {currentStep} of 4
            </span>
          </div>

          <div className="relative pb-1">
            {/* Track Line Container strictly centered at vertical midpoint (22px) and icon centers (left 22px to right 22px) */}
            <div className="absolute top-[20px] left-[22px] right-[22px] h-1 bg-purple-100 rounded-full -z-0 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-full transition-all duration-700"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            <div className="relative z-10 flex items-center justify-between text-center">
              {/* Step 1: Placed */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 1
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-purple-50 text-purple-300 border border-purple-100"
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${currentStep === 1 ? "animate-bounce" : ""}`} />
                </div>
                <span className={`text-[11px] font-black mt-2 tracking-tight ${currentStep >= 1 ? "text-slate-900" : "text-slate-400"}`}>
                  Placed
                </span>
              </div>

              {/* Step 2: Accepted */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 2
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-purple-50 text-purple-300 border border-purple-100"
                  }`}
                >
                  <Clock className={`w-5 h-5 ${currentStep === 2 ? "animate-spin" : ""}`} />
                </div>
                <span className={`text-[11px] font-black mt-2 tracking-tight ${currentStep >= 2 ? "text-slate-900" : "text-slate-400"}`}>
                  Accepted
                </span>
              </div>

              {/* Step 3: Cooking */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 3
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-purple-50 text-purple-300 border border-purple-100"
                  }`}
                >
                  <ChefHat className={`w-5 h-5 ${currentStep === 3 ? "animate-pulse" : ""}`} />
                </div>
                <span className={`text-[11px] font-black mt-2 tracking-tight ${currentStep >= 3 ? "text-slate-900" : "text-slate-400"}`}>
                  Cooking
                </span>
              </div>

              {/* Step 4: Served */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    currentStep >= 4
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-purple-50 text-purple-300 border border-purple-100"
                  }`}
                >
                  <UtensilsCrossed className={`w-5 h-5 ${currentStep === 4 ? "animate-bounce" : ""}`} />
                </div>
                <span className={`text-[11px] font-black mt-2 tracking-tight ${currentStep >= 4 ? "text-slate-900" : "text-slate-400"}`}>
                  Served
                </span>
              </div>
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

        {/* Clean Payment Status Banner */}
        <section className="glass-card p-4 rounded-2xl border border-white/90 shadow-sm bg-white flex items-center justify-between">
          <span className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
            Payment Status
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-sm ${order.paymentStatus === "PAID"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
            }`}>
            {order.paymentStatus || "PENDING"}
          </span>
        </section>

        {/* Itemized Order Receipt */}
        <section className="glass-card p-5 rounded-3xl space-y-4 border border-white/90 shadow-md bg-white/90">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">Ordered Dishes</h3>
            <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {order.paymentMethod || "CASH"}
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

          <div className="border-t border-purple-100 pt-3 flex justify-between font-black text-sm text-slate-900">
            <span>Grand Total</span>
            <span className="text-slate-900 text-base font-black">₹{parseFloat(order.grandTotal).toFixed(2)}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
