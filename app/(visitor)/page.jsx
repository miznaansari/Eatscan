import Link from "next/link";
import { QrCode, Smartphone, Zap, BellRing, Clock, Sparkles, CheckCircle2, ShieldCheck, Flame, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 px-4 max-w-7xl mx-auto text-center">
        {/* Soft Purple Glow backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-pill text-xs font-bold text-purple-700 mb-6 border border-purple-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
          <span>Next-Gen Instant QR Table Ordering & Mobile PWA</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Instant QR Table Ordering with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            EatScan.online
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Diners scan the table QR code, browse your elegant menu, and place orders instantly. Real-time audio alerts ring directly on your manager's mobile PWA!
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base btn-purple flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5 text-purple-200" />
            <span>Onboard Your Restaurant Free</span>
          </Link>
          <Link
            href="/restaurant/spice-garden"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-slate-800 glass-card hover:bg-white transition-all border border-purple-100 flex items-center justify-center space-x-2 hover:scale-105"
          >
            <Smartphone className="w-5 h-5 text-purple-600" />
            <span>Try Live Customer Menu Demo</span>
          </Link>
        </div>

        {/* Live Demo Teaser Card */}
        <div className="mt-16 max-w-4xl mx-auto glass-card-purple p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-2xl relative overflow-hidden text-left bg-white">
          <div className="flex items-center justify-between border-b border-purple-100 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-purple-600 animate-ping" />
              <span className="font-black text-slate-900 text-base sm:text-lg">Live Table Order Simulation</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              ● PWA Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="glass-card p-5 rounded-2xl border border-purple-100 bg-white">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900">1. Customer Scans QR</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Directly opens menu with 3-second raw menu image splash screen on mobile browser.</p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-5 rounded-2xl border border-purple-100 bg-white">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900">2. Swipeable Drawer Checkout</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Diner selects dishes, opens mobile login drawer, and submits order without app install.</p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-5 rounded-2xl border border-purple-100 bg-white">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <BellRing className="w-6 h-6 text-purple-600 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-slate-900">3. Manager Phone Alerts</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Instant loud chime sound & flashing order card on manager's mobile PWA dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Slot Timings Highlight */}
      <section id="timings" className="max-w-7xl mx-auto px-4">
        <div className="glass-card p-8 lg:p-12 rounded-3xl border border-purple-100 shadow-xl bg-gradient-to-r from-purple-50 via-white to-purple-50 text-slate-900 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold mb-4 border border-purple-200">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Multi-Slot Operating Hours</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Flexible Shift Hours per Weekday
              </h2>
              <p className="mt-4 text-slate-600 text-base leading-relaxed font-medium">
                Configure multiple open/closed shift slots for your restaurant. Support lunch shifts, dinner slots, and afternoon tea breaks with automatic holiday toggles.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span>Slot 1: 10:00 AM - 12:00 PM (Breakfast / Early Lunch)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span>Slot 2: 02:00 PM - 05:00 PM (Afternoon Snacks)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span>Slot 3: 08:00 PM - 10:00 PM (Dinner Shift)</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl bg-white border border-purple-100 text-slate-900 shadow-md">
              <h4 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center justify-between">
                <span>Spice Garden Bistro Operating Hours</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-600 text-white font-bold">OPEN NOW</span>
              </h4>
              <div className="space-y-3 text-sm font-semibold">
                <div className="p-3.5 rounded-xl bg-purple-50/60 text-slate-800 flex items-center justify-between border border-purple-100">
                  <span className="font-bold">Monday - Sunday (Lunch)</span>
                  <span className="font-mono text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 font-bold">11:00 AM - 03:30 PM</span>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-50/60 text-slate-800 flex items-center justify-between border border-purple-100">
                  <span className="font-bold">Monday - Sunday (Dinner)</span>
                  <span className="font-mono text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 font-bold">07:00 PM - 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900">Engineered for Elegance & Speed</h2>
          <p className="text-slate-600 mt-2 font-medium">Blinkit + Zomato + Zepto inspired purple and white glassmorphic user interface</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-purple-100 hover:shadow-xl transition-all bg-white">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Vibrant Food Catalog</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Crisp photography, Veg/Non-Veg indicators, price discounts, and category tabs for seamless customer ordering.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-purple-100 hover:shadow-xl transition-all bg-white">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Real-Time Mobile PWA Alerts</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              No app store download required. Managers open the mobile PWA link and receive immediate sound chimes for new orders.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-purple-100 hover:shadow-xl transition-all bg-white">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Super Admin & RBAC</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Multi-role permissions for Kitchen Captains, Managers, and Owners with strict data safety and soft-delete capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="glass-card-purple p-10 sm:p-14 rounded-3xl border border-purple-100 shadow-2xl relative overflow-hidden bg-white">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900">Ready to Upgrade Your Restaurant?</h2>
          <p className="text-slate-600 mt-4 text-base sm:text-lg font-medium max-w-2xl mx-auto">
            Get started with EatScan.online in less than 2 minutes. Upload raw menu images and generate instant table QR codes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/register"
              className="px-10 py-4 rounded-2xl font-bold text-lg btn-purple flex items-center space-x-2"
            >
              <span>Start Free Onboarding Now</span>
              <ArrowRight className="w-5 h-5 text-purple-200" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
