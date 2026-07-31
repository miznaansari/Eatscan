"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BellRing,
  Utensils,
  CheckCircle2,
  Clock,
  Volume2,
  ChefHat,
  LogOut,
  QrCode,
  SlidersHorizontal,
  AlertTriangle,
  X,
  Coins,
  Wallet,
  CreditCard,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [updatingOrderIds, setUpdatingOrderIds] = useState({});

  // Settings Drawer State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState("");
  const [settings, setSettings] = useState({
    themeMode: "DARK",
    isCashEnabled: true,
    isOnlineUpiEnabled: true,
    isCreditCardEnabled: true,
  });

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // Play chime sound
  const playChimeSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio play suppressed:", e);
    }
  };

  const fetchSettings = async (id) => {
    try {
      const res = await fetch(`/api/restaurant/settings?restaurantId=${id}`);
      const data = await res.json();
      if (data.success && data.restaurant) {
        setSettings({
          themeMode: data.restaurant.themeMode || "DARK",
          isCashEnabled: data.restaurant.isCashEnabled ?? true,
          isOnlineUpiEnabled: data.restaurant.isOnlineUpiEnabled ?? true,
          isCreditCardEnabled: data.restaurant.isCreditCardEnabled ?? true,
        });
      }
    } catch (e) {
      console.error("Fetch settings error:", e);
    }
  };

  const saveSettings = async () => {
    if (!restaurantId) return;
    setSettingsLoading(true);
    setSettingsSaveSuccess("");
    try {
      const res = await fetch("/api/restaurant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          themeMode: settings.themeMode,
          isCashEnabled: settings.isCashEnabled,
          isOnlineUpiEnabled: settings.isOnlineUpiEnabled,
          isCreditCardEnabled: settings.isCreditCardEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSaveSuccess("Settings updated successfully!");
        setTimeout(() => setSettingsSaveSuccess(""), 3000);
      }
    } catch (e) {
      console.error("Save settings error:", e);
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderIds((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch("/api/restaurant/order-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });

      if (res.ok) {
        if (newStatus === "COMPLETED" || newStatus === "CANCELLED") {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
          );
        }
        if (newOrderAlert?.id === orderId) setNewOrderAlert(null);
      }
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdatingOrderIds((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("eatscan_manager_restaurant_id");
    const name = localStorage.getItem("eatscan_manager_restaurant_name");

    if (!id) {
      router.push("/restaurant/admin/login");
      return;
    }

    setRestaurantId(id);
    setRestaurantName(name || "Spice Garden Bistro");
    fetchSettings(id);

    // Fetch existing orders
    async function loadOrders() {
      try {
        const res = await fetch(`/api/restaurant/order-status?restaurantId=${id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Load orders error:", err);
      }
    }

    loadOrders();

    // Connect to Server-Sent Events (SSE) Real-Time Order Stream
    const eventSource = new EventSource(`/api/realtime/orders?restaurantId=${id}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_ORDER" && data.order) {
          playChimeSound();
          setNewOrderAlert(data.order);
          setOrders((prev) => [data.order, ...prev]);
          setTimeout(() => setNewOrderAlert(null), 8000);
        }
      } catch (err) {}
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("eatscan_manager_token");
    localStorage.removeItem("eatscan_manager_restaurant_id");
    router.push("/restaurant/admin/login");
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="glass-navbar sticky-header sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl bg-white/90 border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/favicon.svg"
              alt="EatScan Logo"
              className="w-10 h-10 rounded-2xl shadow-md object-contain"
            />
            <div>
              <h1 className="font-black text-slate-900 text-lg leading-tight">{restaurantName}</h1>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>PWA Live SSE Connected</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Settings Trigger Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
              title="Restaurant & Payment Settings"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-700" />
              <span className="hidden sm:inline font-extrabold">Settings</span>
            </button>

            <button
              onClick={playChimeSound}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center space-x-1"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Real-time Order Alert Toast */}
        {newOrderAlert && (
          <div className="ios-navbar-floating p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex flex-shrink-0 items-center justify-center font-black shadow-lg shadow-purple-500/25">
                <BellRing className="w-6 h-6 text-purple-100 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px] uppercase tracking-wider border border-purple-200 shadow-sm">
                    ⚡ NEW ORDER ARRIVED!
                  </span>
                  <span className="text-xs font-black text-purple-700 font-mono">
                    #{newOrderAlert.orderNumber}
                  </span>
                </div>
                <h3 className="font-black text-lg text-slate-900 mt-1">
                  {newOrderAlert.tableTitle || "Direct Table"}
                </h3>
                <p className="text-xs font-extrabold text-slate-600 mt-0.5">
                  {newOrderAlert.customerName || "Guest Diner"} • <span className="text-purple-700 font-mono text-sm font-black">₹{parseFloat(newOrderAlert.grandTotal).toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={!!updatingOrderIds[newOrderAlert.id]}
                onClick={() => updateOrderStatus(newOrderAlert.id, "ACCEPTED")}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-700 active:scale-95 transition-all shadow-md flex items-center space-x-1 cursor-pointer"
              >
                <span>Accept</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Orders Section */}
        {(() => {
          if (orders.length === 0) {
            return (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                <ChefHat className="w-12 h-12 text-purple-600 mx-auto" />
                <h3 className="text-lg font-black text-slate-900">No Active Kitchen Orders</h3>
                <p className="text-xs text-slate-500 font-medium">
                  When diners place orders at your tables, they will automatically pop up here with live sound alerts!
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-purple-600" />
                  <span>Kitchen Order Stream</span>
                </h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {orders.length} ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                              {order.tableTitle || "Table"}
                            </span>
                            <h3 className="text-xl font-black text-slate-900">Order #{order.orderNumber}</h3>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                              order.orderStatus === "PENDING"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : order.orderStatus === "ACCEPTED"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : order.orderStatus === "PREPARING"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-1.5 border-t pt-2 text-xs font-medium">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-slate-700">
                              <span>
                                <strong className="text-slate-900 font-extrabold">{item.quantity}x</strong> {item.itemName}
                                {item.variantName && ` (${item.variantName})`}
                              </span>
                              <span className="font-mono font-bold text-slate-900">₹{parseFloat(item.subTotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-2 flex justify-between items-center text-xs font-extrabold">
                          <span className="text-slate-500">Total ({order.paymentMethod || "CASH"})</span>
                          <span className="text-base font-black text-purple-900 font-mono">₹{parseFloat(order.grandTotal).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Status Control Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {order.orderStatus === "PENDING" && (
                          <button
                            disabled={!!updatingOrderIds[order.id]}
                            onClick={() => updateOrderStatus(order.id, "ACCEPTED")}
                            className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {updatingOrderIds[order.id] ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Accepting...</span>
                              </>
                            ) : (
                              <span>Accept Order</span>
                            )}
                          </button>
                        )}
                        {order.orderStatus === "ACCEPTED" && (
                          <button
                            disabled={!!updatingOrderIds[order.id]}
                            onClick={() => updateOrderStatus(order.id, "PREPARING")}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {updatingOrderIds[order.id] ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Starting...</span>
                              </>
                            ) : (
                              <span>Start Cooking</span>
                            )}
                          </button>
                        )}
                        {order.orderStatus === "PREPARING" && (
                          <button
                            disabled={!!updatingOrderIds[order.id]}
                            onClick={() => updateOrderStatus(order.id, "SERVED")}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {updatingOrderIds[order.id] ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Serving...</span>
                              </>
                            ) : (
                              <span>Mark Served</span>
                            )}
                          </button>
                        )}
                        {order.orderStatus === "SERVED" && (
                          <button
                            disabled={!!updatingOrderIds[order.id]}
                            onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {updatingOrderIds[order.id] ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Completing...</span>
                              </>
                            ) : (
                              <span>Complete & Pay</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </main>

      {/* RESTAURANT SETTINGS & PAYMENT OPTIONS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-purple-700" />
                <h3 className="font-extrabold text-lg text-slate-900">Restaurant Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settingsSaveSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{settingsSaveSuccess}</span>
              </div>
            )}

            {/* Theme Mode Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                Default Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "DARK", label: "Dark Mode", icon: Moon },
                  { mode: "LIGHT", label: "Light Mode", icon: Sun },
                  { mode: "SYSTEM", label: "System", icon: Laptop },
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, themeMode: mode }))}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                      settings.themeMode === mode
                        ? "bg-purple-600 text-white border-purple-600 shadow-md font-extrabold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Switches */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                Accepted Payment Methods
              </label>

              {/* Cash */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Pay Cash at Table</h4>
                    <p className="text-[10px] text-slate-500">Allow cash settlement with waiter</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, isCashEnabled: !prev.isCashEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.isCashEnabled ? "bg-purple-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      settings.isCashEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Online UPI */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">UPI / QR Codes</h4>
                    <p className="text-[10px] text-slate-500">Accept Instant GPay / PhonePe / Paytm</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, isOnlineUpiEnabled: !prev.isOnlineUpiEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.isOnlineUpiEnabled ? "bg-purple-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      settings.isOnlineUpiEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Credit/Debit Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Credit / Debit Card</h4>
                    <p className="text-[10px] text-slate-500">Accept Card payments</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, isCreditCardEnabled: !prev.isCreditCardEnabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.isCreditCardEnabled ? "bg-purple-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      settings.isCreditCardEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={settingsLoading}
              onClick={saveSettings}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-xl transition-all active:scale-98 disabled:opacity-50"
            >
              {settingsLoading ? "Saving Settings..." : "Save Restaurant Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
