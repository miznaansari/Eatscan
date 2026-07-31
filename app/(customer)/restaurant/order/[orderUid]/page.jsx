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
  XCircle,
  History,
  Receipt,
  X,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderUid = params.orderUid;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceRequested, setServiceRequested] = useState(false);

  // Multi-order history state
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState("ACTIVE");

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

  const fetchCustomerOrdersHistory = async (mobileNo) => {
    if (!mobileNo) return;
    try {
      const res = await fetch(`/api/customer/orders?mobileNo=${mobileNo}`);
      const data = await res.json();
      if (data.success) {
        setActiveOrders(data.activeOrders || []);
        setPastOrders(data.pastOrders || []);
      }
    } catch (e) {
      console.error("Fetch orders history error:", e);
    }
  };

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/customer/order/${orderUid}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);

        // Fetch customer history ONLY for the logged-in user of this browser session
        const loggedInMobile = localStorage.getItem("eatscan_customer_mobile");
        if (loggedInMobile) {
          fetchCustomerOrdersHistory(loggedInMobile);
        }
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
            Fetching Live Kitchen Status...
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

  const getStatusStepInfo = (status) => {
    switch (status) {
      case "PENDING":
        return {
          step: 1,
          badge: "Order Sent to Kitchen",
          headline: "Order Placed!",
          description: "Your order has been sent to the kitchen. Waiting for staff confirmation.",
          color: isDark ? "text-amber-300" : "text-amber-700",
        };
      case "ACCEPTED":
        return {
          step: 2,
          badge: "Accepted by Kitchen",
          headline: "Order Confirmed!",
          description: "The kitchen team has accepted your order and assigned a preparation station.",
          color: isDark ? "text-[#dcb8ff]" : "text-purple-700",
        };
      case "PREPARING":
        return {
          step: 3,
          badge: "Cooking in Progress",
          headline: "Chefs are Cooking!",
          description: "Your dishes are currently being prepared fresh by our culinary team.",
          color: isDark ? "text-blue-300" : "text-blue-700",
        };
      case "SERVED":
        return {
          step: 4,
          badge: "Served to Table",
          headline: "Food Served!",
          description: "Your dishes have been served to your table. Enjoy your meal!",
          color: isDark ? "text-emerald-300" : "text-emerald-700",
        };
      case "COMPLETED":
        return {
          step: 4,
          badge: "Order Completed",
          headline: "Order Completed!",
          description: "Thank you for dining with us! Hope to see you again soon.",
          color: isDark ? "text-emerald-300" : "text-emerald-700",
        };
      case "CANCELLED":
        return {
          step: 0,
          badge: "Order Cancelled",
          headline: "Order Cancelled",
          description: "This order was cancelled.",
          color: "text-rose-500",
        };
      default:
        return {
          step: 1,
          badge: "Order Sent",
          headline: "Order Placed!",
          description: "Your order has been received.",
          color: isDark ? "text-[#dcb8ff]" : "text-purple-700",
        };
    }
  };

  const statusInfo = getStatusStepInfo(order.orderStatus);
  const currentStep = statusInfo.step;

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

          <div className="flex items-center space-x-2">
            {/* Multi-Order & History Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className={`p-2 rounded-xl border flex items-center space-x-1 transition-all ${
                isDark
                  ? "bg-[#1e2021] border-[#333536] text-[#dcb8ff] hover:bg-[#282a2b]"
                  : "bg-slate-100 border-slate-200 text-purple-700 hover:bg-slate-200"
              }`}
              title="My Orders & History"
            >
              <History className="w-4 h-4 text-[#dcb8ff]" />
              {(activeOrders.length > 1 || pastOrders.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-[#9d34ff] animate-ping" />
              )}
            </button>

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
        </div>
      </header>

      {/* DYNAMIC LIVE ORDER STATUS HERO CONTENT */}
      <main className="flex-grow max-w-md w-full px-4 pt-6 pb-8 space-y-6 text-center relative z-10 flex flex-col items-center justify-center">
        {/* Animated Icon Hero */}
        <div className="mb-2 animate-bounce duration-1000">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${
              order.orderStatus === "CANCELLED"
                ? "bg-rose-600 shadow-rose-600/40"
                : isDark
                ? "bg-[#9d34ff] checkmark-glow shadow-[#9d34ff]/40"
                : "bg-purple-600 shadow-purple-600/30"
            }`}
          >
            {order.orderStatus === "CANCELLED" ? (
              <XCircle className="w-16 h-16 text-white" />
            ) : order.orderStatus === "PREPARING" ? (
              <ChefHat className="w-16 h-16 text-white animate-pulse" />
            ) : (
              <CheckCircle2 className="w-16 h-16 text-white" />
            )}
          </div>
        </div>

        {/* Dynamic Headlines & Descriptions based on DB orderStatus */}
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {statusInfo.headline}
          </h1>
          <p className={`text-xs sm:text-sm font-medium mt-1.5 leading-relaxed max-w-sm mx-auto ${isDark ? "text-[#cfc2d8]" : "text-slate-600"}`}>
            {statusInfo.description}
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
                Order Number
              </p>
              <p className={`text-xl font-black ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                #{order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                Live Status
              </p>
              <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                order.orderStatus === "PENDING"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : order.orderStatus === "ACCEPTED"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                  : order.orderStatus === "PREPARING"
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Stepper Progress Visual */}
          {order.orderStatus !== "CANCELLED" && (
            <div className="space-y-2 pt-1">
              <div className={`flex items-center justify-between text-[10px] font-bold ${isDark ? "text-[#cfc2d8]" : "text-slate-600"}`}>
                <span>{statusInfo.badge}</span>
                <span className={statusInfo.color}>Step {currentStep} of 4</span>
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
          )}

          <div className={`flex items-center justify-between pt-1 text-xs font-medium border-t ${isDark ? "text-[#e2e2e3] border-[#333536]/60" : "text-slate-700 border-slate-100"}`}>
            <div className="flex items-center gap-2">
              <Utensils className={`w-4 h-4 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
              <span>
                {order.restaurant?.restaurantName || "Spice Garden Bistro"} • Table:{" "}
                <strong className={isDark ? "text-[#dcb8ff]" : "text-purple-700"}>
                  {order.qrTable?.tableTitle || "Direct Table"}
                </strong>
              </span>
            </div>

            {/* Quick Switch Button if multiple active orders exist */}
            {activeOrders.length > 1 && (
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className={`text-[10px] font-black underline uppercase ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}
              >
                {activeOrders.length} Active Orders
              </button>
            )}
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
            Order Receipt ({order.items?.length || 0} items)
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
              <span>Total ({order.paymentMethod || "CASH"})</span>
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
            Add More Items / Browse Menu
          </Link>
        </div>
      </main>

      {/* MULTI-ORDER SWITCHER & ORDER HISTORY DRAWER */}
      <AnimatePresence>
        {isHistoryDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`relative w-full max-w-lg rounded-t-[32px] p-6 shadow-2xl border-t space-y-4 z-10 max-h-[85vh] flex flex-col ${
                isDark ? "bg-[#121415] border-[#1c1c1e] text-[#e2e2e3]" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className={`w-12 h-1.5 rounded-full mx-auto -mt-2 cursor-grab ${isDark ? "bg-[#333536]" : "bg-slate-300"}`} />

              <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-[#1c1c1e]" : "border-slate-200"}`}>
                <div className="flex items-center space-x-2">
                  <History className={`w-5 h-5 ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`} />
                  <h3 className={`font-extrabold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                    My Orders & History
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className={`p-1.5 rounded-xl ${isDark ? "bg-[#1e2021] text-[#cfc2d8]" : "bg-slate-100 text-slate-600"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setHistoryTab("ACTIVE")}
                  className={`py-2.5 rounded-xl border transition-all ${
                    historyTab === "ACTIVE"
                      ? isDark
                        ? "bg-[#9d34ff] text-white border-[#9d34ff]"
                        : "bg-purple-600 text-white border-purple-600"
                      : isDark
                      ? "bg-[#1e2021] border-[#333536] text-[#cfc2d8]"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  Running Active ({activeOrders.length})
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryTab("PAST")}
                  className={`py-2.5 rounded-xl border transition-all ${
                    historyTab === "PAST"
                      ? isDark
                        ? "bg-[#9d34ff] text-white border-[#9d34ff]"
                        : "bg-purple-600 text-white border-purple-600"
                      : isDark
                      ? "bg-[#1e2021] border-[#333536] text-[#cfc2d8]"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  Past Receipts ({pastOrders.length})
                </button>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[55vh] pr-1">
                {historyTab === "ACTIVE" ? (
                  activeOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs font-medium text-slate-500">
                      No running active orders right now.
                    </div>
                  ) : (
                    activeOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setIsHistoryDrawerOpen(false);
                          router.push(`/restaurant/order/${ord.uid}`);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          ord.uid === order.uid
                            ? isDark
                              ? "bg-[#1e2021] border-[#9d34ff] active-glow"
                              : "bg-purple-50 border-purple-600 shadow-sm"
                            : isDark
                            ? "bg-[#1e2021] border-[#333536] hover:border-[#4d4355]"
                            : "bg-slate-50 border-slate-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className={`text-[10px] font-black uppercase ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                              #{ord.orderNumber} • {ord.qrTable?.tableTitle || "Direct Table"}
                            </span>
                            <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              {ord.restaurant?.restaurantName}
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              ord.orderStatus === "PENDING"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : ord.orderStatus === "ACCEPTED"
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                : ord.orderStatus === "PREPARING"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-300/20">
                          <span>{ord.items?.length || 0} items</span>
                          <span className={isDark ? "text-[#dcb8ff]" : "text-purple-900"}>
                            ₹{parseFloat(ord.grandTotal).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : pastOrders.length === 0 ? (
                  <div className="py-8 text-center text-xs font-medium text-slate-500">
                    No past order receipts found.
                  </div>
                ) : (
                  pastOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setIsHistoryDrawerOpen(false);
                        router.push(`/restaurant/order/${ord.uid}`);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isDark ? "bg-[#1e2021] border-[#333536]" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[10px] font-bold ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                            #{ord.orderNumber} • {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                          <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {ord.restaurant?.restaurantName}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-black uppercase ${ord.orderStatus === "COMPLETED" ? "text-emerald-500" : "text-rose-500"}`}>
                          {ord.orderStatus}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-300/20">
                        <span>{ord.items?.length || 0} items</span>
                        <span className={isDark ? "text-[#dcb8ff]" : "text-purple-900"}>
                          ₹{parseFloat(ord.grandTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
