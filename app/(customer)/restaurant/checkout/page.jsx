"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Drawer } from "vaul";
import { ArrowLeft, ShoppingBag, Trash2, Smartphone, CheckCircle2, ShieldCheck, Sparkles, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [tableUid, setTableUid] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileNo, setMobileNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  }, []);

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-white text-slate-950">
        <div className="bg-slate-50 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full border border-slate-200 shadow-sm">
          <ShoppingBag className="w-16 h-16 text-purple-600 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 font-medium">Add delicious dishes from the menu to proceed.</p>
          <Link
            href={`/restaurant/spice-garden`}
            className="inline-block px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs shadow-md hover:bg-purple-700 transition-all"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-white text-slate-950 selection:bg-purple-600 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-slate-900">Checkout Summary</h1>
            <span className="text-xs text-purple-700 font-black">{restaurantName} • {tableTitle}</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Order Items List */}
        <section className="bg-white p-5 rounded-3xl space-y-4 border border-slate-200 shadow-xs">
          <h2 className="font-extrabold text-base text-slate-900 border-b border-purple-100 pb-2">Order Items</h2>
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={item.cartKey || `${item.id}-${idx}`} className="flex items-start justify-between text-xs border-b border-purple-50 pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {item.quantity}x
                  </span>
                  <div>
                    <div className="font-extrabold text-slate-800">{item.name}</div>
                    {item.variantName && (
                      <div className="text-[10px] font-bold text-purple-700">Portion: {item.variantName}</div>
                    )}
                    {item.selectedAddons && (
                      <div className="text-[10px] text-slate-500 font-medium">{item.selectedAddons}</div>
                    )}
                  </div>
                </div>
                <span className="font-mono text-slate-900 font-black text-xs">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Special Notes Input */}
        <section className="bg-white p-5 rounded-3xl space-y-2 border border-slate-200 shadow-xs">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Special Cooking Instructions</label>
          <input
            type="text"
            placeholder="e.g. Less spicy, extra sauce..."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </section>

        {/* Payment Method Selector */}
        <section className="bg-white p-5 rounded-3xl space-y-3 border border-slate-200 shadow-xs">
          <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">Select Payment Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`p-3.5 rounded-2xl text-xs font-black border text-center transition-all ${
                paymentMethod === "CASH"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Pay Cash at Table
            </button>
            <button
              onClick={() => setPaymentMethod("UPI")}
              className={`p-3.5 rounded-2xl text-xs font-black border text-center transition-all ${
                paymentMethod === "UPI"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              UPI / Online
            </button>
          </div>
        </section>

        {/* Bill Breakdown */}
        <section className="bg-white p-5 rounded-3xl space-y-2.5 text-xs border border-slate-200 shadow-xs">
          <div className="flex justify-between text-slate-600 font-bold">
            <span>Item Total</span>
            <span className="font-black text-slate-900">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-bold">
            <span>GST & Service Charges (5%)</span>
            <span className="font-black text-slate-900">₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
            <span>To Pay</span>
            <span className="text-slate-950 text-base font-black">₹{grandTotal.toFixed(2)}</span>
          </div>
        </section>
      </main>

      {/* Floating Bottom Button Triggering Swipeable Drawer */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
        <button
          onClick={handleOpenDrawer}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98"
        >
          <Sparkles className="w-5 h-5 text-purple-200" />
          <span>Proceed to Place Order (₹{grandTotal.toFixed(2)})</span>
        </button>
      </div>

      {/* Swipeable Bottom Drawer (Vaul) for Mobile Phone Verification */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto border-t border-purple-100 shadow-2xl">
            <div className="p-6 space-y-6">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-purple-200" />

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6" />
                </div>
                <Drawer.Title className="font-black text-xl text-slate-900">Quick Verification</Drawer.Title>
                <Drawer.Description className="text-xs text-slate-500 font-medium">
                  Enter your mobile number to receive instant order tracking updates.
                </Drawer.Description>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl btn-purple font-black text-base shadow-xl disabled:opacity-50"
                >
                  {loading ? "Sending Order to Kitchen..." : "Confirm & Send to Table"}
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
