"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  BellRing,
  PhoneCall,
  ChevronRight,
  MapPin,
  Utensils,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderUid = params.orderUid;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceRequested, setServiceRequested] = useState(false);

  // Theme preference state
  const [themePreference, setThemePreference] = useState("DARK");
  const [systemIsDark, setSystemIsDark] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemIsDark(mediaQuery.matches);
      const handler = (e) => setSystemIsDark(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    const userOverride = localStorage.getItem("eatscan_user_theme_override");
    const savedRestTheme = localStorage.getItem("eatscan_restaurant_theme_mode");
    if (userOverride) {
      setThemePreference(userOverride);
    } else if (savedRestTheme) {
      setThemePreference(savedRestTheme);
    }
  }, []);

  const isDark =
    themePreference === "DARK"
      ? true
      : themePreference === "LIGHT"
      ? false
      : systemIsDark;

  const cycleThemePreference = () => {
    const nextTheme =
      themePreference === "DARK"
        ? "LIGHT"
        : themePreference === "LIGHT"
        ? "SYSTEM"
        : "DARK";
    setThemePreference(nextTheme);
    localStorage.setItem("eatscan_user_theme_override", nextTheme);
  };

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
      <div
        className={`min-h-screen flex items-center justify-center transition-colors ${
          isDark ? "bg-[#121415] text-[#e2e2e3]" : "bg-[#faf8ff] text-slate-900"
        }`}
      >
        <div className="text-center space-y-3">
          <div
            className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto ${
              isDark ? "border-[#9d34ff]" : "border-purple-600"
            }`}
          />
          <p className={`font-extrabold text-sm ${isDark ? "text-[#dcb8ff]" : "text-purple-900"}`}>
            Fetching Live Order Tracker...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
          isDark ? "bg-[#121415] text-[#e2e2e3]" : "bg-[#faf8ff] text-slate-900"
        }`}
      >
        <div
          className={`p-8 rounded-3xl text-center space-y-4 max-w-sm w-full border ${
            isDark ? "glass-card-dark border-[#1c1c1e]" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold">Order Not Found</h2>
          <p className={`text-xs font-medium ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>{error}</p>
          <Link
            href="/"
            className={`inline-block px-6 py-3 rounded-2xl text-white text-xs font-black shadow-lg transition-all ${
              isDark ? "bg-[#9d34ff] hover:bg-[#8806ea] shadow-[#9d34ff]/30" : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
            }`}
          >
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
    <div
      className={`min-h-screen pb-32 relative overflow-hidden flex flex-col items-center transition-colors duration-300 ${
        isDark ? "bg-[#121415] text-[#e2e2e3]" : "bg-[#faf8ff] text-slate-900"
      }`}
    >
      {/* AMBIENT RADIAL BACKGROUND MESH GLOW (in Dark mode) */}
      {isDark && <div className="absolute inset-0 bg-mesh pointer-events-none" />}

      {/* HEADER BAR */}
      <header
        className={`sticky top-0 w-full z-40 px-4 py-3 border-b backdrop-blur-md transition-colors ${
          isDark ? "bg-[#121415]/90 border-[#1c1c1e]" : "bg-white/95 border-slate-200 shadow-xs"
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push(order.restaurant?.slug ? `/restaurant/${order.restaurant.slug}` : "/")}
            className={`p-2 rounded-xl transition-all ${
              isDark ? "bg-[#1e2021] text-[#dcb8ff] hover:bg-[#282a2b]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h1 className={`text-sm font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
              Order #{order.orderNumber}
            </h1>
            <span className={`text-xs font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
              {order.restaurant?.restaurantName || "Spice Garden Bistro"}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={cycleThemePreference}
            title={`Current Theme: ${themePreference}. Click to switch mode.`}
            className={`p-2 rounded-xl flex items-center space-x-1 border transition-all ${
              isDark
                ? "bg-[#1e2021] border-[#333536] text-[#dcb8ff] hover:bg-[#282a2b]"
                : "bg-slate-100 border-slate-200 text-purple-700 hover:bg-slate-200"
            }`}
          >
            {themePreference === "DARK" && <Moon className="w-4 h-4 text-[#dcb8ff]" />}
            {themePreference === "LIGHT" && <Sun className="w-4 h-4 text-amber-500" />}
            {themePreference === "SYSTEM" && <Laptop className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* SUCCESS HERO CONTENT */}
      <main className="flex-grow max-w-md w-full px-4 pt-6 pb-8 space-y-6 text-center relative z-10 flex flex-col items-center justify-center">
        {/* Animated Floating Success Checkmark Hero */}
        <div className="mb-2 animate-bounce duration-1000">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${
              isDark
                ? "bg-[#9d34ff] checkmark-glow shadow-[#9d34ff]/40"
                : "bg-purple-600 shadow-purple-600/30"
            }`}
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Headlines */}
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Thank You!
          </h1>
          <p className={`text-xs sm:text-sm font-medium mt-1.5 leading-relaxed max-w-sm mx-auto ${isDark ? "text-[#cfc2d8]" : "text-slate-600"}`}>
            Your order has been received and is being prepared with care by our chefs.
          </p>
        </div>

        {/* Bento Order Details Card */}
        <div
          className={`w-full rounded-2xl p-5 text-left space-y-4 shadow-xl border ${
            isDark ? "bg-[#1a1c1d] border-[#333536]" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                Order ID
              </p>
              <p className={`text-xl font-black ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                #{order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                Estimated Time
              </p>
              <p className={`text-lg font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>20-25 min</p>
            </div>
          </div>

          {/* Stepper Progress Visual */}
          <div className="space-y-2 pt-1">
            <div className={`flex items-center justify-between text-[10px] font-bold ${isDark ? "text-[#cfc2d8]" : "text-slate-600"}`}>
              <span>Order Progress</span>
              <span className={isDark ? "text-[#dcb8ff]" : "text-purple-700"}>Step {currentStep} of 4</span>
            </div>

            <div className="flex gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-grow rounded-full transition-all duration-500 ${
                    currentStep >= step
                      ? isDark
                        ? "bg-[#9d34ff] active-glow"
                        : "bg-purple-600 shadow-xs"
                      : isDark
                      ? "bg-[#333536]"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className={`flex items-center gap-2 pt-1 text-xs font-medium border-t ${isDark ? "text-[#e2e2e3] border-[#333536]/60" : "text-slate-700 border-slate-100"}`}>
            <Utensils className={`w-4 h-4 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
            <span>
              {order.restaurant?.restaurantName || "Spice Garden Bistro"} • Kitchen Status:{" "}
              <strong className={isDark ? "text-[#dcb8ff]" : "text-purple-700"}>{order.orderStatus}</strong>
            </span>
          </div>
        </div>

        {/* Instant Table Service Button */}
        <button
          type="button"
          onClick={handleCallWaiter}
          className={`w-full p-4 rounded-2xl text-white font-extrabold text-xs shadow-xl flex items-center justify-between transition-all ${
            isDark ? "bg-[#9d34ff] hover:bg-[#8806ea]" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <div className="flex items-center space-x-3">
            <BellRing className="w-5 h-5 text-purple-200 animate-bounce" />
            <span>{serviceRequested ? "Waiter Alerted! On the way..." : "Call Waiter / Service"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-200" />
        </button>

        {/* Itemized Quick Summary */}
        <div
          className={`w-full rounded-2xl p-5 text-left space-y-3 border ${
            isDark ? "bg-[#1a1c1d] border-[#333536]" : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <h3 className={`text-xs font-extrabold uppercase tracking-wider border-b pb-2 ${isDark ? "text-[#cfc2d8] border-[#333536]" : "text-slate-600 border-slate-100"}`}>
            Quick Receipt Summary
          </h3>
          <div className="space-y-2 text-xs">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className={isDark ? "text-[#cfc2d8]" : "text-slate-600"}>
                  {item.quantity}x {item.itemName}
                  {item.variantName && ` (${item.variantName})`}
                </span>
                <span className={`font-bold font-mono ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                  ₹{parseFloat(item.subTotal).toFixed(2)}
                </span>
              </div>
            ))}
            <div className={`flex justify-between items-center font-extrabold pt-2 border-t text-sm ${isDark ? "border-[#333536] text-white" : "border-slate-100 text-slate-900"}`}>
              <span>Total Paid ({order.paymentMethod || "CASH"})</span>
              <span className={`text-base font-black font-mono ${isDark ? "text-[#dcb8ff]" : "text-purple-900"}`}>
                ₹{parseFloat(order.grandTotal).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <Link
            href={order.restaurant?.slug ? `/restaurant/${order.restaurant.slug}` : "/"}
            className={`w-full h-12 font-bold text-sm rounded-xl flex items-center justify-center border transition-all ${
              isDark
                ? "bg-[#1e2021] border-[#333536] text-[#dcb8ff] hover:border-[#9d34ff]"
                : "bg-white border-slate-200 text-purple-700 hover:border-purple-300 shadow-xs"
            }`}
          >
            Back to Restaurant Menu
          </Link>
        </div>
      </main>
    </div>
  );
}
