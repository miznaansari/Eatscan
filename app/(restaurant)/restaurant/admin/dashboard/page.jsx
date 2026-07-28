"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BellRing, Utensils, CheckCircle2, Clock, Volume2, ChefHat, LogOut, QrCode, SlidersHorizontal, AlertTriangle, X } from "lucide-react";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  // Play crisp loud chime sound using Web Audio API
  const playChimeSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (err) {
      console.log("Audio play error:", err);
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
          // Play loud chime sound on mobile PWA!
          playChimeSound();

          setNewOrderAlert(data.order);
          setOrders((prev) => [data.order, ...prev]);

          // Hide alert after 8s
          setTimeout(() => setNewOrderAlert(null), 8000);
        }
      } catch (err) {}
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const updateOrderStatus = async (orderId, newStatus) => {
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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("eatscan_manager_token");
    localStorage.removeItem("eatscan_manager_restaurant_id");
    router.push("/restaurant/admin/login");
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="glass-navbar sticky-header sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl">
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
            <button
              onClick={playChimeSound}
              className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center space-x-1"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Test Sound</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Real-time Order Alert Banner - High Contrast & Maximum Readability */}
        {newOrderAlert && (
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 text-white shadow-2xl border-2 border-amber-400 flex items-center justify-between animate-bounce">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex flex-shrink-0 items-center justify-center font-black shadow-lg shadow-amber-400/30">
                <BellRing className="w-7 h-7 text-slate-950 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    ⚡ NEW ORDER ARRIVED!
                  </span>
                  <span className="text-xs font-black text-purple-300">
                    #{newOrderAlert.orderNumber}
                  </span>
                </div>
                <h3 className="font-black text-lg text-white mt-1">
                  {newOrderAlert.tableTitle || "Direct Table"}
                </h3>
                <p className="text-xs font-extrabold text-slate-300 mt-0.5">
                  {newOrderAlert.customerName || "Guest Diner"} • <span className="text-amber-300 font-mono text-sm font-black">₹{parseFloat(newOrderAlert.grandTotal).toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateOrderStatus(newOrderAlert.id, "ACCEPTED")}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                Accept Order
              </button>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="p-2.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active Orders List */}
        {(() => {
          const activeOrders = orders.filter(
            (o) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED"
          );

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Orders</h2>
                <span className="text-xs font-extrabold text-slate-500">{activeOrders.length} Active</span>
              </div>

              {activeOrders.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl text-center space-y-2 border border-slate-200 bg-white">
                  <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-extrabold text-slate-700 text-base">No Active Orders</h3>
                  <p className="text-xs text-slate-500">All active orders completed! Scan a table QR code to place new orders.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOrders.map((order) => {
                const tableTitle = order.tableTitle || order.qrTable?.tableTitle || "Direct Table";
                const isPending = order.orderStatus === "PENDING";

                return (
                  <div
                    key={order.id}
                    className={`glass-card p-5 rounded-2xl border transition-all space-y-3 bg-white ${
                      isPending ? "border-rose-400 shadow-md ring-2 ring-rose-300/50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 text-base">#{order.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs">
                            {tableTitle}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          order.orderStatus === "PENDING"
                            ? "bg-rose-100 text-rose-700"
                            : order.orderStatus === "ACCEPTED"
                            ? "bg-purple-100 text-purple-700"
                            : order.orderStatus === "PREPARING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0">
                          <div>
                            <div className="font-extrabold text-slate-900">{item.quantity}x {item.itemName}</div>
                            {item.variantName && (
                              <div className="text-[10px] font-bold text-purple-700">Portion: {item.variantName}</div>
                            )}
                            {item.selectedAddons && (
                              <div className="text-[10px] text-slate-500 font-medium">{item.selectedAddons}</div>
                            )}
                          </div>
                          <span className="font-mono text-slate-900 font-extrabold">₹{parseFloat(item.subTotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-2 flex items-center justify-between font-black text-sm">
                      <span>Total Amount</span>
                      <span className="text-purple-700">₹{parseFloat(order.grandTotal).toFixed(2)}</span>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-2 pt-2">
                      {order.orderStatus === "PENDING" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "ACCEPTED")}
                          className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.orderStatus === "ACCEPTED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "PREPARING")}
                          className="flex-1 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600"
                        >
                          Start Cooking
                        </button>
                      )}
                      {order.orderStatus === "PREPARING" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "SERVED")}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                        >
                          Mark Served
                        </button>
                      )}
                      {order.orderStatus === "SERVED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                          className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                        >
                          Complete & Pay
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })()}
      </main>
    </div>
  );
}
