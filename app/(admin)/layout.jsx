"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Store, Receipt, Users, UserCheck, Menu, X, ShieldCheck, LogOut, ChevronRight, Sparkles, Activity } from "lucide-react";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@eatscan.online");

  useEffect(() => {
    const savedEmail = localStorage.getItem("eatscan_admin_email");
    if (savedEmail) setAdminEmail(savedEmail);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (adminDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [adminDrawerOpen]);

  // Don't render top header or bottom bar on login page
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  const toggleAdminMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAdminDrawerOpen((prev) => !prev);
  };

  const closeAdminMenu = () => {
    setAdminDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("eatscan_admin_token");
    localStorage.removeItem("eatscan_admin_email");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-purple-50/30 text-slate-900 relative pb-20 sm:pb-24">
      {/* Sticky Top Header */}
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
            <img
              src="/favicon.svg"
              alt="EatScan Logo"
              className="w-10 h-10 rounded-2xl shadow-md shadow-purple-500/20 object-contain"
            />
            <div>
              <h1 className="font-black text-slate-900 text-lg leading-tight">Super Admin</h1>
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>System Active</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-block px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-black">
              {adminEmail}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs"
              title="Logout Super Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Floating Super Admin Bottom Navigation Bar */}
      <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto">
        <nav className="ios-navbar-floating px-3 py-2 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl flex items-center justify-around">
          {/* Dashboard Overview */}
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/dashboard")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Overview</span>
          </Link>

          {/* Restaurants Tab */}
          <Link
            href="/admin/restaurant"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/restaurant")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Stores</span>
          </Link>

          {/* Platform Orders Tab */}
          <Link
            href="/admin/customer-order"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/customer-order")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Orders</span>
          </Link>

          {/* Customers Tab */}
          <Link
            href="/admin/customer"
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              pathname.includes("/customer") && !pathname.includes("/customer-order")
                ? "text-purple-700 font-extrabold bg-purple-50"
                : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Users</span>
          </Link>

          {/* More Drawer Trigger */}
          <button
            type="button"
            onClick={toggleAdminMenu}
            onTouchEnd={toggleAdminMenu}
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer touch-manipulation ${
              adminDrawerOpen ? "text-purple-700 font-extrabold bg-purple-50" : "text-slate-500 font-semibold hover:text-purple-600"
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5 text-purple-700" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </div>

      {/* Super Admin Side Drawer Container */}
      <div
        className={`fixed inset-0 z-[999] md:hidden transition-opacity duration-300 ${
          adminDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop Mask */}
        <div
          onClick={closeAdminMenu}
          onTouchEnd={closeAdminMenu}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Glossy Slide Panel - GPU Hardware Accelerated */}
        <aside
          className={`absolute top-0 right-0 bottom-0 w-76 max-w-[85vw] bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out ${
            adminDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ willChange: "transform" }}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <div className="flex items-center space-x-2">
                <img src="/favicon.svg" alt="EatScan Logo" className="w-8 h-8 rounded-xl shadow-sm object-contain" />
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Super Admin</h3>
                  <span className="text-[10px] text-purple-700 font-bold">{adminEmail}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAdminMenu}
                onTouchEnd={closeAdminMenu}
                className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* System Status Pill */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Platform Database</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                Healthy
              </span>
            </div>

            {/* Admin Quick Tools */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Admin Management</span>

              <Link
                href="/admin/member"
                onClick={closeAdminMenu}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all border border-purple-100"
              >
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>Team & Staff Roles</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/register"
                onClick={closeAdminMenu}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all border border-purple-100"
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Onboard New Restaurant</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/restaurant/admin/login"
                onClick={closeAdminMenu}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all border border-purple-100"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Manager PWA Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-purple-100 space-y-3">
            <button
              type="button"
              onClick={() => {
                closeAdminMenu();
                handleLogout();
              }}
              className="w-full py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-xs flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Logout Super Admin</span>
            </button>
            <div className="text-center text-[11px] font-bold text-slate-400">
              EatScan Platform v1.0
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
