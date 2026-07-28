"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Utensils, QrCode, Clock, Menu, X, ShieldCheck, LogIn, LogOut, Power, Printer, Sparkles, ChevronRight, Store, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RestaurantLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [managerDrawerOpen, setManagerDrawerOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState("Spice Garden Bistro");
  const [managerName, setManagerName] = useState("Rahul Sharma");
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem("eatscan_restaurant_name");
    const savedManager = localStorage.getItem("eatscan_manager_name");
    if (savedName) setRestaurantName(savedName);
    if (savedManager) setManagerName(savedManager);
  }, [pathname]);

  // Don't render manager bottom bar on login page
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  const toggleStoreStatus = () => {
    setIsStoreOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-purple-50/30 text-slate-900 relative pb-20 sm:pb-24">
      <main className="flex-1">{children}</main>

      {/* Floating Manager Bottom Navigation Bar */}
      <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto">
        <nav className="ios-navbar-floating px-3 py-2 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl flex items-center justify-around">
          {/* Live Orders Tab */}
          <Link
            href="/restaurant/admin/dashboard"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/dashboard")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <ChefHat className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Live Orders</span>
          </Link>

          {/* Order History Log Tab */}
          <Link
            href="/restaurant/admin/orders"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/orders")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">History</span>
          </Link>

          {/* Menu Management Tab */}
          <Link
            href="/restaurant/admin/menu"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/menu")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Utensils className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Menu</span>
          </Link>

          {/* QR Tables & Stands Tab */}
          <Link
            href="/restaurant/admin/table"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/table")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <QrCode className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Tables</span>
          </Link>

          {/* Manager More Drawer Trigger (3-Line Hamburger) */}
          <button
            type="button"
            onClick={() => setManagerDrawerOpen((prev) => !prev)}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer touch-manipulation ${
              managerDrawerOpen ? "text-purple-700 font-extrabold bg-purple-50" : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5 text-purple-700" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </div>

      {/* Restaurant Manager Quick Actions Drawer */}
      <AnimatePresence>
        {managerDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setManagerDrawerOpen(false)}
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
                      <span className="text-xs text-purple-700 font-extrabold">Manager Portal • {managerName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManagerDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Restaurant Status Switch */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Store className={`w-5 h-5 ${isStoreOpen ? "text-emerald-600" : "text-rose-500"}`} />
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">Restaurant Status</div>
                      <span className={`text-[10px] font-bold ${isStoreOpen ? "text-emerald-600" : "text-rose-500"}`}>
                        {isStoreOpen ? "● Accepting Orders" : "● Temporarily Closed"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleStoreStatus}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all ${
                      isStoreOpen ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {isStoreOpen ? "Open" : "Closed"}
                  </button>
                </div>

                {/* Instant Manager Tools */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Manager Quick Tools</span>

                  <Link
                    href="/restaurant/admin/timings"
                    onClick={() => setManagerDrawerOpen(false)}
                    className="w-full p-3.5 rounded-2xl glass-pill border border-purple-200 text-slate-800 font-bold text-xs flex items-center justify-between hover:bg-purple-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Shift Hours & Multi-Slot</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/restaurant/admin/table"
                    onClick={() => setManagerDrawerOpen(false)}
                    className="w-full p-3.5 rounded-2xl glass-pill border border-purple-200 text-slate-800 font-bold text-xs flex items-center justify-between hover:bg-purple-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Printer className="w-5 h-5 text-purple-600" />
                      <span>Print Table Display Stands</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    onClick={() => setManagerDrawerOpen(false)}
                    className="w-full p-3.5 rounded-2xl glass-pill border border-purple-200 text-slate-800 font-bold text-xs flex items-center justify-between hover:bg-purple-50"
                  >
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-purple-600" />
                      <span>Super Admin Operations</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>

                {/* Logout */}
                <div className="pt-4 border-t border-purple-100">
                  <button
                    type="button"
                    onClick={() => {
                      setManagerDrawerOpen(false);
                      router.push("/restaurant/admin/login");
                    }}
                    className="w-full py-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs flex items-center justify-center space-x-2 hover:bg-rose-100 transition-all"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Logout Manager PWA</span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-purple-100 text-center text-[11px] font-bold text-slate-400">
                EatScan Manager PWA v1.0
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
