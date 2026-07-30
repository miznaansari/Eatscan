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

  const handleCallWaiter = () => {
    setServiceRequested(true);
    setTimeout(() => setServiceRequested(false), 4000);
  };

  const menuUrl = `/restaurant/${restaurantSlug}`;
  const checkoutUrl = `/restaurant/checkout`;
  const orderUrl = latestOrderUid ? `/restaurant/order/${latestOrderUid}` : `/restaurant/checkout`;

  const isCheckoutPage = pathname.includes("/checkout");

  return (
    <div className="min-h-screen flex flex-col bg-purple-50/30 text-slate-900 relative pb-20 sm:pb-24">
      <main className="flex-1">{children}</main>

      {/* Floating Mobile Bottom Navigation Bar (Hidden on Checkout Page) */}
      {!isCheckoutPage && (
        <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto">
          <nav className="ios-navbar-floating px-3 py-2 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl flex items-center justify-around">
          {/* Menu Tab */}
          <Link
            href={menuUrl}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
              pathname.includes("/restaurant/") && !pathname.includes("/checkout") && !pathname.includes("/order/")
                ? "text-purple-700 font-extrabold bg-purple-50"
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
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-purple-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
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
                  ? "text-purple-700 font-extrabold bg-purple-50"
                  : "text-slate-500 font-semibold hover:text-purple-600"
              }`}
            >
              <div className="relative">
                <Receipt className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
              </div>
              <span className="text-[10px] tracking-tight font-bold text-purple-700">Live Order</span>
            </Link>
          )}

          {/* More (3-Line Hamburger Drawer Trigger) */}
          <button
            type="button"
            onClick={() => setCustomerDrawerOpen((prev) => !prev)}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer touch-manipulation ${
              customerDrawerOpen ? "text-purple-700 font-extrabold bg-purple-50" : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5 text-purple-700" />
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
              className="fixed inset-0 bg-slate-950/50 cursor-pointer"
            />

            {/* Glossy Slide Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform" }}
              className="relative w-80 max-w-[85vw] h-full bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <img src="/favicon.svg" alt="EatScan Logo" className="w-9 h-9 rounded-2xl shadow-sm object-contain" />
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight">{restaurantName}</h3>
                      <span className="text-xs text-purple-700 font-extrabold">{tableTitle}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Instant Actions */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Instant Table Services</span>

                  <button
                    type="button"
                    onClick={handleCallWaiter}
                    className="w-full p-3.5 rounded-2xl btn-purple text-white font-extrabold text-xs shadow-md flex items-center justify-between transition-all"
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
                    className="w-full p-3.5 rounded-2xl glass-pill border border-purple-200 text-slate-800 font-bold text-xs flex items-center justify-between hover:bg-purple-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-5 h-5 text-purple-600" />
                      <span>Request Bill / Checkout</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <a
                    href="tel:+919876543210"
                    className="w-full p-3.5 rounded-2xl glass-pill border border-purple-200 text-slate-800 font-bold text-xs flex items-center justify-between hover:bg-purple-50"
                  >
                    <div className="flex items-center space-x-3">
                      <PhoneCall className="w-5 h-5 text-purple-600" />
                      <span>Call Desk / Manager</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                {/* Restaurant Hours & Location */}
                <div className="glass-card p-4 rounded-2xl border border-purple-100 space-y-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Location</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">Indiranagar, Bengaluru (Multi-Slot Active)</p>

                  <div className="flex items-center space-x-2 font-bold text-slate-900 pt-2 border-t border-purple-50">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Operating Hours</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">11:00 AM - 03:30 PM • 07:00 PM - 11:00 PM</p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-purple-100 text-center text-[11px] font-bold text-slate-400">
                Powered by EatScan.online
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
