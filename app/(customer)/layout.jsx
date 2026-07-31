"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Utensils, ShoppingBag, Receipt, Menu, X, BellRing, PhoneCall, Sparkles, MapPin, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [restaurantName, setRestaurantName] = useState("Spice Garden Bistro");
  const [restaurantSlug, setRestaurantSlug] = useState("spice-garden");
  const [tableTitle, setTableTitle] = useState("Table 01");
  const [latestOrderUid, setLatestOrderUid] = useState(null);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);
  const [serviceRequested, setServiceRequested] = useState(false);

  useEffect(() => {
    // Read cart count
    const updateCartState = () => {
      const savedCart = localStorage.getItem("eatscan_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          const total = Object.values(parsed).reduce((acc, item) => acc + (item.quantity || 1), 0);
          setCartCount(total);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartState();
    window.addEventListener("storage", updateCartState);

    // Read restaurant & table details
    const savedName = localStorage.getItem("eatscan_restaurant_name");
    const savedSlug = localStorage.getItem("eatscan_restaurant_slug");
    const savedTable = localStorage.getItem("eatscan_table_title");
    const savedOrder = localStorage.getItem("eatscan_latest_order_uid");

    if (savedName) setRestaurantName(savedName);
    if (savedSlug) setRestaurantSlug(savedSlug);
    if (savedTable) setTableTitle(savedTable);

    if (savedOrder) {
      setLatestOrderUid(savedOrder);
      // Fetch order status to check if it's currently pending/active
      fetch(`/api/customer/order/${savedOrder}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            const status = data.order.orderStatus;
            const activeStatuses = ["PENDING", "ACCEPTED", "PREPARING", "SERVED"];
            if (activeStatuses.includes(status)) {
              setHasPendingOrder(true);
            } else {
              setHasPendingOrder(false);
            }
          } else {
            setHasPendingOrder(false);
          }
        })
        .catch(() => setHasPendingOrder(false));
    } else {
      setHasPendingOrder(false);
    }

    return () => window.removeEventListener("storage", updateCartState);
  }, [pathname]);

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
    const updateTheme = () => {
      const userOverride = localStorage.getItem("eatscan_user_theme_override");
      const savedRestTheme = localStorage.getItem("eatscan_restaurant_theme_mode");
      if (userOverride) {
        setThemePreference(userOverride);
      } else if (savedRestTheme) {
        setThemePreference(savedRestTheme);
      }
    };

    updateTheme();
    window.addEventListener("storage", updateTheme);
    return () => window.removeEventListener("storage", updateTheme);
  }, [pathname]);

  const isDark =
    themePreference === "DARK"
      ? true
      : themePreference === "LIGHT"
      ? false
      : systemIsDark;

  const handleCallWaiter = () => {
    setServiceRequested(true);
    setTimeout(() => setServiceRequested(false), 4000);
  };

  const menuUrl = `/restaurant/${restaurantSlug}`;
  const checkoutUrl = `/restaurant/checkout`;
  const orderUrl = latestOrderUid ? `/restaurant/order/${latestOrderUid}` : `/restaurant/checkout`;

  const isCheckoutPage = pathname.includes("/checkout");

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative pb-20 sm:pb-24 ${
        isDark ? "bg-[#121415] text-[#e2e2e3] selection:bg-[#9d34ff]" : "bg-[#faf8ff] text-slate-900 selection:bg-purple-600"
      }`}
    >
      <main className="flex-1">{children}</main>

      {/* Floating Mobile Bottom Navigation Bar (Hidden on Checkout Page) */}
      {!isCheckoutPage && (
        <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto">
          <nav
            className={`px-3 py-2 rounded-3xl backdrop-blur-2xl shadow-2xl flex items-center justify-around transition-colors border ${
              isDark
                ? "bg-[#0a0a0b]/90 border-[#1c1c1e] text-[#e2e2e3]"
                : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
            }`}
          >
            {/* Menu Tab */}
            <Link
              href={menuUrl}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                pathname.includes("/restaurant/") && !pathname.includes("/checkout") && !pathname.includes("/order/")
                  ? isDark
                    ? "text-[#dcb8ff] font-extrabold bg-[#9d34ff]/20"
                    : "text-purple-700 font-extrabold bg-purple-50"
                  : isDark
                  ? "text-[#988ca1] font-semibold hover:text-[#dcb8ff]"
                  : "text-slate-500 font-semibold hover:text-purple-600"
              }`}
            >
              <Utensils className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Menu</span>
            </Link>

            {/* Cart Tab with Badge */}
            <Link
              href={checkoutUrl}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
                pathname.includes("/checkout")
                  ? isDark
                    ? "text-[#dcb8ff] font-extrabold bg-[#9d34ff]/20"
                    : "text-purple-700 font-extrabold bg-purple-50"
                  : isDark
                  ? "text-[#988ca1] font-semibold hover:text-[#dcb8ff]"
                  : "text-slate-500 font-semibold hover:text-purple-600"
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 mb-0.5" />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce ${
                      isDark ? "bg-[#9d34ff]" : "bg-purple-600"
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">Cart</span>
            </Link>

            {/* Track Order Tab - ONLY SHOWN IF USER HAS PENDING ORDER */}
            {hasPendingOrder && (
              <Link
                href={orderUrl}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
                  pathname.includes("/order/")
                    ? isDark
                      ? "text-[#dcb8ff] font-extrabold bg-[#9d34ff]/20"
                      : "text-purple-700 font-extrabold bg-purple-50"
                    : isDark
                    ? "text-[#988ca1] font-semibold hover:text-[#dcb8ff]"
                    : "text-slate-500 font-semibold hover:text-purple-600"
                }`}
              >
                <div className="relative">
                  <Receipt className="w-5 h-5 mb-0.5" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping ${isDark ? "bg-[#9d34ff]" : "bg-purple-600"}`} />
                </div>
                <span className={`text-[10px] tracking-tight font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>Live Order</span>
              </Link>
            )}

            {/* More (3-Line Hamburger Drawer Trigger) */}
            <button
              type="button"
              onClick={() => setCustomerDrawerOpen((prev) => !prev)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer touch-manipulation ${
                customerDrawerOpen
                  ? isDark
                    ? "text-[#dcb8ff] font-extrabold bg-[#9d34ff]/20"
                    : "text-purple-700 font-extrabold bg-purple-50"
                  : isDark
                  ? "text-[#988ca1] font-semibold hover:text-[#dcb8ff]"
                  : "text-slate-500 font-semibold hover:text-purple-600"
              }`}
            >
              <Menu className={`w-5 h-5 mb-0.5 ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`} />
              <span className="text-[10px] tracking-tight">More</span>
            </button>
          </nav>
        </div>
      )}

      {/* Customer Quick Actions Drawer */}
      <AnimatePresence>
        {customerDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setCustomerDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Glossy Slide Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform" }}
              className="relative w-80 max-w-[85vw] h-full bg-[#121415] border-l border-[#1c1c1e] text-[#e2e2e3] shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1c1c1e] pb-4">
                  <div className="flex items-center space-x-3">
                    <img src="/favicon.svg" alt="EatScan Logo" className="w-9 h-9 rounded-2xl shadow-sm object-contain" />
                    <div>
                      <h3 className="font-black text-[#e2e2e3] text-base leading-tight">{restaurantName}</h3>
                      <span className="text-xs text-[#dcb8ff] font-extrabold">{tableTitle}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-[#1e2021] text-[#dcb8ff] hover:bg-[#282a2b]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Instant Actions */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-[#988ca1] uppercase tracking-wider block">Instant Table Services</span>

                  <button
                    type="button"
                    onClick={handleCallWaiter}
                    className="w-full p-3.5 rounded-2xl bg-[#9d34ff] hover:bg-[#8806ea] text-white font-extrabold text-xs shadow-md flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <BellRing className="w-5 h-5 text-purple-200 animate-bounce" />
                      <span>{serviceRequested ? "Waiter Alerted! Coming..." : "Call Waiter / Service"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-200" />
                  </button>

                  <Link
                    href={checkoutUrl}
                    onClick={() => setCustomerDrawerOpen(false)}
                    className="w-full p-3.5 rounded-2xl bg-[#1e2021] border border-[#333536] text-[#e2e2e3] font-bold text-xs flex items-center justify-between hover:bg-[#282a2b]"
                  >
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-5 h-5 text-[#dcb8ff]" />
                      <span>Request Bill / Checkout</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#988ca1]" />
                  </Link>

                  <a
                    href="tel:+919876543210"
                    className="w-full p-3.5 rounded-2xl bg-[#1e2021] border border-[#333536] text-[#e2e2e3] font-bold text-xs flex items-center justify-between hover:bg-[#282a2b]"
                  >
                    <div className="flex items-center space-x-3">
                      <PhoneCall className="w-5 h-5 text-[#dcb8ff]" />
                      <span>Call Desk / Manager</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#988ca1]" />
                  </a>
                </div>

                {/* Restaurant Hours & Location */}
                <div className="glass-card-dark p-4 rounded-2xl space-y-2 text-xs font-medium text-[#cfc2d8]">
                  <div className="flex items-center space-x-2 font-bold text-[#e2e2e3]">
                    <MapPin className="w-4 h-4 text-[#dcb8ff]" />
                    <span>Location</span>
                  </div>
                  <p className="text-[11px] text-[#988ca1] pl-6">Indiranagar, Bengaluru (Multi-Slot Active)</p>

                  <div className="flex items-center space-x-2 font-bold text-[#e2e2e3] pt-2 border-t border-[#1c1c1e]">
                    <Clock className="w-4 h-4 text-[#dcb8ff]" />
                    <span>Operating Hours</span>
                  </div>
                  <p className="text-[11px] text-[#988ca1] pl-6">11:00 AM - 03:30 PM • 07:00 PM - 11:00 PM</p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-[#1c1c1e] text-center text-[11px] font-bold text-[#988ca1]">
                Powered by EatScan.online
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
