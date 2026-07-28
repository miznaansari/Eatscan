import Link from "next/link";
import { Sparkles, QrCode } from "lucide-react";

export default function VisitorLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50/70 via-white to-purple-50/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-purple-100/80 px-4 lg:px-8 py-3.5 bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900">EatScan</span>
              <span className="text-xs text-purple-600 font-bold ml-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">.online</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <Link href="#features" className="hover:text-purple-600 transition-colors">Features</Link>
            <Link href="#demo" className="hover:text-purple-600 transition-colors">Live Demo</Link>
            <Link href="#timings" className="hover:text-purple-600 transition-colors">Multi-Slot System</Link>
            <Link href="/restaurant/admin/login" className="hover:text-purple-600 transition-colors">Manager Login</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-2xl font-bold text-sm btn-purple flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="glass-card bg-white text-slate-600 py-12 px-4 border-t border-purple-100 mt-12 shadow-sm">
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
