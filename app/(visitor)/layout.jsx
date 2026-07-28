"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, QrCode, Menu, X, Layers, Clock, Smartphone, ShieldCheck, LogIn, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VisitorLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100/70 via-slate-50 to-purple-50/50 relative">
      {/* Background ambient liquid glass orbs for specular mirror reflection */}
      <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-purple-400/15 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 px-3 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto ios-navbar-floating px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/favicon.svg"
              alt="EatScan Logo"
              className="w-10 h-10 rounded-2xl shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform object-contain"
            />
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900">EatScan</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
            <Link href="#features" className="hover:text-purple-600 transition-colors">Features</Link>
            <Link href="#demo" className="hover:text-purple-600 transition-colors">Live Demo</Link>
            <Link href="#timings" className="hover:text-purple-600 transition-colors">Multi-Slot System</Link>
            <Link href="/restaurant/admin/login" className="hover:text-purple-600 transition-colors">Manager Login</Link>
          </nav>

          {/* Actions & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/register"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm btn-purple flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="hidden sm:inline">Get Started Free</span>
              <span className="sm:hidden">Free</span>
            </Link>

            {/* Mobile Hamburger Toggle Button - Zero Delay Touch */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden relative z-30 p-2.5 rounded-2xl glass-pill text-slate-800 hover:text-purple-600 active:scale-95 transition-all border border-purple-200 shadow-sm flex items-center justify-center cursor-pointer select-none touch-manipulation"
              aria-label="Toggle Mobile Sidebar"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-purple-700" /> : <Menu className="w-5 h-5 text-purple-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Glass Sidebar Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex justify-start pointer-events-auto">
            {/* Backdrop Overlay with Fast Fade Transition */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/50 cursor-pointer"
            />

            {/* Glossy Mobile Sidebar Drawer with Hardware-Accelerated 120fps Slide */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform" }}
              className="relative w-72 max-w-[82vw] h-full bg-white border-r border-slate-200 shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Top Header */}
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src="/favicon.svg"
                      alt="EatScan Logo"
                      className="w-8 h-8 rounded-xl shadow-sm object-contain"
                    />
                    <span className="font-black text-slate-900 text-lg">EatScan</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>Features</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    href="#demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span>Live Demo</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    href="#timings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>Multi-Slot Hours</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <div className="border-t border-purple-100 my-2 pt-2 space-y-2">
                    <Link
                      href="/restaurant/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <LogIn className="w-4 h-4 text-purple-600" />
                        <span>Manager PWA Login</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>

                    <Link
                      href="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Super Admin</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Sidebar Bottom CTA */}
              <div className="pt-6 border-t border-purple-100 space-y-3">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm btn-purple flex items-center justify-center space-x-2 text-center"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Onboard Restaurant Free</span>
                </Link>

                <div className="text-center text-[11px] font-bold text-slate-400">
                  © 2026 eatscan.online
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="glass-card text-slate-600 py-12 px-4 border-t border-purple-100/80 mt-12 shadow-lg">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl font-black text-slate-900">EatScan</span>
              <span className="text-xs text-purple-600 font-bold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">.online</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Next-generation instant QR code table ordering system & real-time mobile manager PWA. Powered by purple + white ultra-smooth aesthetics.
            </p>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3">For Restaurants</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><Link href="/register" className="hover:text-purple-600">Onboard Your Restaurant</Link></li>
              <li><Link href="/restaurant/admin/login" className="hover:text-purple-600">Manager PWA Portal</Link></li>
              <li><Link href="/restaurant/spice-garden" className="hover:text-purple-600">Sample Menu Preview</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3">System Features</h4>
            <ul className="space-y-2 text-sm font-semibold text-slate-500">
              <li><span>Multi-Slot Shift Timings</span></li>
              <li><span>3-Sec Raw Menu Card Splash</span></li>
              <li><span>Swipeable Mobile Phone Login</span></li>
              <li><span>Real-Time Manager Sound Alert</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3">Super Admin</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><Link href="/admin/login" className="hover:text-purple-600">Super Admin Login</Link></li>
              <li><span className="text-slate-400">© 2026 eatscan.online</span></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
