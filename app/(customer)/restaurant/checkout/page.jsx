"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  CreditCard,
  MapPin,
  Lock,
  Wallet,
  Coins,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Plus,
  Minus,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [tableUid, setTableUid] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Payment configuration (default all enabled)
  const [paymentConfig, setPaymentConfig] = useState({
    isCashEnabled: true,
    isOnlineUpiEnabled: true,
    isCreditCardEnabled: true,
  });

  // Payment method selection (default is CASH)
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileNo, setMobileNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    const savedCart = localStorage.getItem("eatscan_cart");
    if (savedCart) {
      try {
        setCart(Object.values(JSON.parse(savedCart)));
      } catch (e) {}
    }

    setRestaurantId(localStorage.getItem("eatscan_restaurant_id") || "");
    setRestaurantName(localStorage.getItem("eatscan_restaurant_name") || "Spice Garden Bistro");
    setTableUid(localStorage.getItem("eatscan_table_uid") || "");
    setTableTitle(localStorage.getItem("eatscan_table_title") || "Table 01");

    // Read payment config
    const savedPaymentConfig = localStorage.getItem("eatscan_payment_config");
    let activeConfig = { isCashEnabled: true, isOnlineUpiEnabled: true, isCreditCardEnabled: true };
    if (savedPaymentConfig) {
      try {
        activeConfig = JSON.parse(savedPaymentConfig);
        setPaymentConfig(activeConfig);
      } catch (e) {}
    }

    // Set default payment method: default is CASH if enabled, else first enabled option
    if (activeConfig.isCashEnabled) {
      setPaymentMethod("CASH");
    } else if (activeConfig.isOnlineUpiEnabled) {
      setPaymentMethod("UPI");
    } else if (activeConfig.isCreditCardEnabled) {
      setPaymentMethod("CARD");
    }

    // Read theme preference
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

  const incrementCartItem = (targetKey) => {
    const updatedCart = cart.map((i) => {
      const key = i.cartKey || `${i.id}-${i.variantName || "base"}`;
      if (key === targetKey) {
        return { ...i, quantity: i.quantity + 1 };
      }
      return i;
    });
    setCart(updatedCart);
    const cartObj = {};
    updatedCart.forEach((i) => {
      const key = i.cartKey || `${i.id}-${i.variantName || "base"}`;
      cartObj[key] = i;
    });
    localStorage.setItem("eatscan_cart", JSON.stringify(cartObj));
  };

  const decrementCartItem = (targetKey) => {
    const updatedCart = cart
      .map((i) => {
        const key = i.cartKey || `${i.id}-${i.variantName || "base"}`;
        if (key === targetKey) {
          if (i.quantity > 1) {
            return { ...i, quantity: i.quantity - 1 };
          }
          return null;
        }
        return i;
      })
      .filter(Boolean);
    setCart(updatedCart);
    const cartObj = {};
    updatedCart.forEach((i) => {
      const key = i.cartKey || `${i.id}-${i.variantName || "base"}`;
      cartObj[key] = i;
    });
    localStorage.setItem("eatscan_cart", JSON.stringify(cartObj));
  };

  const deleteCartItem = (targetKey) => {
    const updatedCart = cart.filter((i) => {
      const key = i.cartKey || `${i.id}-${i.variantName || "base"}`;
      return key !== targetKey;
    });
    setCart(updatedCart);
    const cartObj = {};
    updatedCart.forEach((i) => {
      const key = i.cartKey || `${i.id}-${i.variantName || "base"}`;
      cartObj[key] = i;
    });
    localStorage.setItem("eatscan_cart", JSON.stringify(cartObj));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = totalAmount * 0.05;
  const grandTotal = totalAmount + taxAmount;

  const handleOpenDrawer = () => {
    if (cart.length === 0) return;
    setIsDrawerOpen(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!mobileNo) {
      setError("Mobile number is required to place order.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        mobileNo: mobileNo.trim(),
        name: customerName ? customerName.trim() : "Guest Diner",
        restaurantId: restaurantId || null,
        restaurantSlug: localStorage.getItem("eatscan_restaurant_slug") || "spice-garden",
        tableUid: tableUid || null,
        items: cart.map((i) => ({
          menuId: i.id,
          itemName: i.name,
          itemPrice: i.price,
          quantity: i.quantity,
          variantName: i.variantName || null,
          selectedAddons: i.selectedAddons || null,
        })),
        specialNotes,
        paymentMethod,
      };

      const res = await fetch("/api/customer/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart & store latest order UID
      localStorage.removeItem("eatscan_cart");
      localStorage.setItem("eatscan_latest_order_uid", data.orderUid);

      // Redirect to Order Success & Live Tracker
      router.push(`/restaurant/order/${data.orderUid}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
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
          <ShoppingBag className={`w-16 h-16 mx-auto ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
          <h2 className="text-xl font-extrabold">Your Cart is Empty</h2>
          <p className={`text-xs font-medium ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
            Add delicious dishes from the menu to proceed.
          </p>
          <Link
            href={`/restaurant/${localStorage.getItem("eatscan_restaurant_slug") || "spice-garden"}`}
            className={`inline-block px-6 py-3 rounded-2xl font-extrabold text-xs text-white shadow-lg transition-all ${
              isDark
                ? "bg-[#9d34ff] hover:bg-[#8806ea] shadow-[#9d34ff]/30"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
            }`}
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-32 transition-colors duration-300 ${
        isDark ? "bg-[#121415] text-[#e2e2e3]" : "bg-[#faf8ff] text-slate-900"
      }`}
    >
      {/* TOP NAVIGATION BAR */}
      <header
        className={`fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 border-b backdrop-blur-md transition-colors ${
          isDark ? "bg-[#121415]/95 border-[#1c1c1e]" : "bg-white/95 border-slate-200 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full transition-colors ${
              isDark ? "hover:bg-[#1e2021] text-[#dcb8ff]" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-lg font-extrabold ${isDark ? "text-[#dcb8ff]" : "text-purple-900"}`}>
              Checkout
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
              {themePreference}
            </span>
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
              isDark
                ? "bg-[#1e2021] border-[#333536] text-[#cfc2d8]"
                : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
            <span>SECURE</span>
          </div>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Table Details, Payment Options, Notes */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Table / Location Section */}
          <section className="flex flex-col gap-3">
            <h2 className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
              Dining Table & Location
            </h2>
            <div
              className={`p-4 rounded-xl flex gap-4 items-start border ${
                isDark ? "glass-card-dark border-[#1c1c1e]" : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${isDark ? "bg-[#1e2021] border-[#333536]" : "bg-purple-50 border-purple-100"}`}>
                <MapPin className={`w-5 h-5 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {tableTitle || "Table 01"}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                  {restaurantName} • Instant In-Dining Table Ordering
                </p>
              </div>
            </div>
          </section>

          {/* Payment Method Selection (Shows ONLY enabled options, CASH default if enabled) */}
          <section className="flex flex-col gap-3">
            <h2 className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
              Payment Method
            </h2>
            <div className="flex flex-col gap-2.5">
              {/* Cash Option (Default Selected if enabled) */}
              {paymentConfig.isCashEnabled && (
                <label
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer group transition-all border ${
                    isDark
                      ? paymentMethod === "CASH"
                        ? "glass-card-dark border-[#9d34ff] active-glow"
                        : "glass-card-dark border-[#1c1c1e] hover:border-[#4d4355]"
                      : paymentMethod === "CASH"
                      ? "bg-white border-2 border-purple-600 shadow-md"
                      : "bg-white border border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={() => setPaymentMethod("CASH")}
                    className={`w-4 h-4 ${isDark ? "text-[#9d34ff] bg-[#1e2021] border-[#4d4355]" : "text-purple-600"}`}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${isDark ? "bg-[#1e2021] border-[#333536]" : "bg-purple-50 border-purple-100"}`}>
                        <Coins className={`w-5 h-5 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
                      </div>
                      <span className={`text-sm font-bold ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                        Pay Cash at Table
                      </span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase border ${
                      isDark ? "bg-[#9d34ff]/20 text-[#dcb8ff] border-[#9d34ff]/40" : "bg-purple-100 text-purple-800 border-purple-200"
                    }`}>
                      DEFAULT
                    </span>
                  </div>
                </label>
              )}

              {/* UPI Option */}
              {paymentConfig.isOnlineUpiEnabled && (
                <label
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer group transition-all border ${
                    isDark
                      ? paymentMethod === "UPI"
                        ? "glass-card-dark border-[#9d34ff] active-glow"
                        : "glass-card-dark border-[#1c1c1e] hover:border-[#4d4355]"
                      : paymentMethod === "UPI"
                      ? "bg-white border-2 border-purple-600 shadow-md"
                      : "bg-white border border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                    className={`w-4 h-4 ${isDark ? "text-[#9d34ff] bg-[#1e2021] border-[#4d4355]" : "text-purple-600"}`}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${isDark ? "bg-[#1e2021] border-[#333536]" : "bg-purple-50 border-purple-100"}`}>
                        <Wallet className={`w-5 h-5 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
                      </div>
                      <span className={`text-sm font-bold ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                        UPI / QR Codes
                      </span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase border ${
                      isDark ? "bg-[#9d34ff]/20 text-[#dcb8ff] border-[#9d34ff]/40" : "bg-purple-100 text-purple-800 border-purple-200"
                    }`}>
                      INSTANT
                    </span>
                  </div>
                </label>
              )}

              {/* Card Option */}
              {paymentConfig.isCreditCardEnabled && (
                <label
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer group transition-all border ${
                    isDark
                      ? paymentMethod === "CARD"
                        ? "glass-card-dark border-[#9d34ff] active-glow"
                        : "glass-card-dark border-[#1c1c1e] hover:border-[#4d4355]"
                      : paymentMethod === "CARD"
                      ? "bg-white border-2 border-purple-600 shadow-md"
                      : "bg-white border border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className={`w-4 h-4 ${isDark ? "text-[#9d34ff] bg-[#1e2021] border-[#4d4355]" : "text-purple-600"}`}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${isDark ? "bg-[#1e2021] border-[#333536]" : "bg-purple-50 border-purple-100"}`}>
                        <CreditCard className={`w-5 h-5 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
                      </div>
                      <span className={`text-sm font-bold ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                        Credit / Debit Card
                      </span>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </section>

          {/* Delivery / Special Cooking Note */}
          <section className="flex flex-col gap-3">
            <h2 className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
              Chef Instructions / Notes
            </h2>
            <div className="rounded-xl">
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Extra spicy, no onions, bring glasses..."
                className={`w-full p-4 rounded-xl border outline-none min-h-[90px] text-xs font-medium transition-all ${
                  isDark
                    ? "glass-card-dark bg-[#1e2021] text-[#e2e2e3] border-[#333536] focus:border-[#9d34ff] focus:ring-1 focus:ring-[#9d34ff]"
                    : "bg-white text-slate-900 border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-xs"
                }`}
              />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Bento Order Summary with Edit Controls */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-20 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                Order Summary ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
              </h2>
            </div>

            <div
              className={`rounded-xl overflow-hidden flex flex-col divide-y border ${
                isDark
                  ? "glass-card-dark border-[#1c1c1e] divide-[#333536]/40"
                  : "bg-white border-slate-200 divide-slate-100 shadow-xs"
              }`}
            >
              {/* Items List with Quantity Add/Remove Controls */}
              {cart.map((item) => {
                const itemKey = item.cartKey || `${item.id}-${item.variantName || "base"}`;

                return (
                  <div key={itemKey} className="p-3.5 flex gap-3 items-center justify-between">
                    {item.imageUrl && (
                      <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? "bg-[#282a2b]" : "bg-slate-100"}`}>
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {item.foodType === "VEG" ? (
                          <span className="w-3 h-3 rounded-xs border border-emerald-500 flex items-center justify-center p-0.5 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          </span>
                        ) : (
                          <span className="w-3 h-3 rounded-xs border border-rose-500 flex items-center justify-center p-0.5 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-rose-500" />
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                          {item.foodType || "DISH"}
                        </span>
                      </div>
                      <h3 className={`text-sm font-bold truncate ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>{item.name}</h3>
                      {item.variantName && (
                        <p className={`text-[10px] font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                          Portion: {item.variantName}
                        </p>
                      )}
                      {item.selectedAddons && (
                        <p className={`text-[10px] truncate ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>{item.selectedAddons}</p>
                      )}
                      <p className={`text-xs font-extrabold mt-0.5 ${isDark ? "text-[#dcb8ff]" : "text-slate-900"}`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className={`flex items-center rounded-lg overflow-hidden font-bold border ${isDark ? "bg-[#121415] border-[#4d4355]" : "bg-white border-slate-300"}`}>
                        <button
                          type="button"
                          onClick={() => decrementCartItem(itemKey)}
                          className="w-6 h-7 flex items-center justify-center text-xs hover:bg-black/10"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementCartItem(itemKey)}
                          className="w-6 h-7 flex items-center justify-center text-xs hover:bg-black/10"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteCartItem(itemKey)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Remove dish completely"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Bill Breakdown */}
              <div className={`p-4 space-y-2 text-xs font-bold ${isDark ? "text-[#cfc2d8]" : "text-slate-600"}`}>
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className={isDark ? "text-[#e2e2e3]" : "text-slate-900"}>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service Charges (5%)</span>
                  <span className={isDark ? "text-[#e2e2e3]" : "text-slate-900"}>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className={`pt-2 border-t flex justify-between text-sm font-extrabold ${isDark ? "border-[#333536] text-white" : "border-slate-200 text-slate-900"}`}>
                  <span>Grand Total</span>
                  <span className={`text-base font-black ${isDark ? "text-[#dcb8ff]" : "text-purple-900"}`}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
        <button
          onClick={handleOpenDrawer}
          className={`w-full py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 text-white ${
            isDark ? "bg-[#9d34ff] hover:bg-[#8806ea]" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <Sparkles className="w-5 h-5 text-purple-200" />
          <span>Proceed to Place Order (₹{grandTotal.toFixed(2)})</span>
        </button>
      </div>

      {/* MOBILE VERIFICATION DRAWER (VAUL) */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Drawer.Content
            className={`flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto border-t shadow-2xl ${
              isDark ? "bg-[#121415] text-[#e2e2e3] border-[#1c1c1e]" : "bg-white text-slate-900 border-slate-200"
            }`}
          >
            <div className="p-6 space-y-5">
              <div className={`mx-auto w-12 h-1.5 flex-shrink-0 rounded-full ${isDark ? "bg-[#333536]" : "bg-slate-300"}`} />

              <div className="text-center space-y-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 border ${
                    isDark ? "bg-[#9d34ff]/20 text-[#dcb8ff] border-[#9d34ff]/30" : "bg-purple-100 text-purple-700 border-purple-200"
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                </div>
                <Drawer.Title className={`font-extrabold text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  Quick Table Verification
                </Drawer.Title>
                <Drawer.Description className={`text-xs font-medium ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                  Enter your mobile number to receive live kitchen tracking status.
                </Drawer.Description>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? "text-[#cfc2d8]" : "text-slate-700"}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${
                      isDark
                        ? "bg-[#1e2021] border-[#333536] text-[#e2e2e3] focus:border-[#9d34ff]"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-600"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? "text-[#cfc2d8]" : "text-slate-700"}`}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none ${
                      isDark
                        ? "bg-[#1e2021] border-[#333536] text-[#e2e2e3] focus:border-[#9d34ff]"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-600"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl text-white font-black text-base shadow-xl disabled:opacity-50 transition-all active:scale-98 ${
                    isDark ? "bg-[#9d34ff] hover:bg-[#8806ea]" : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {loading ? "Sending Order to Kitchen..." : "Confirm & Send to Kitchen"}
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
