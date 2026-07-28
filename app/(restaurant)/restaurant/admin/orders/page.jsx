"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Calendar, Clock, Receipt, CheckCircle2, XCircle, ChevronRight, DollarSign, ShoppingBag, Utensils, Printer } from "lucide-react";

export default function OrderHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  useEffect(() => {
    const savedRestId = localStorage.getItem("eatscan_manager_restaurant_id") || "cms4cgnww000fpnht75qoelx2";
    const savedRestName = localStorage.getItem("eatscan_restaurant_name") || "Spice Garden Bistro";

    setRestaurantId(savedRestId);
    setRestaurantName(savedRestName);

    fetchOrders(savedRestId);
  }, []);

  const fetchOrders = async (restId) => {
    try {
      const res = await fetch(`/api/restaurant/order-status?restaurantId=${restId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open("", "_blank");
    const formattedDate = new Date(order.createdAt).toLocaleString();

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; max-width: 320px; margin: 0 auto; }
            .header { text-align: center; border-b: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
            h2 { margin: 0; font-size: 18px; }
            .meta { font-size: 11px; color: #555; margin-top: 4px; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin: 6px 0; }
            .item-sub { font-size: 10px; color: #666; margin-left: 10px; }
            .total { border-t: 1px dashed #ccc; pt-2; margin-top: 10px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; }
            .footer { text-align: center; font-size: 10px; color: #777; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${restaurantName}</h2>
            <div class="meta">Order #${order.orderNumber}</div>
            <div class="meta">${order.qrTable?.tableTitle || "Direct Order"}</div>
            <div class="meta">${formattedDate}</div>
          </div>
          <div>
            ${order.items.map(i => `
              <div class="item">
                <span>${i.quantity}x ${i.itemName}</span>
                <span>₹${parseFloat(i.subTotal).toFixed(2)}</span>
              </div>
              ${i.variantName ? `<div class="item-sub">Portion: ${i.variantName}</div>` : ""}
              ${i.selectedAddons ? `<div class="item-sub">${i.selectedAddons}</div>` : ""}
            `).join("")}
          </div>
          <div class="total">
            <span>Grand Total</span>
            <span>₹${parseFloat(order.grandTotal).toFixed(2)}</span>
          </div>
          <div class="footer">Thank you for dining with us!<br/>Powered by EatScan.online</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === "ALL" || ord.orderStatus === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchLower) ||
      (ord.customer?.name && ord.customer.name.toLowerCase().includes(searchLower)) ||
      (ord.customer?.mobileNo && ord.customer.mobileNo.includes(searchLower)) ||
      (ord.qrTable?.tableTitle && ord.qrTable.tableTitle.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const completedOrders = orders.filter((o) => o.orderStatus === "COMPLETED" || o.orderStatus === "SERVED");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.grandTotal || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center font-bold text-slate-600 text-sm">Loading Order History...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/restaurant/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-black text-slate-900 text-lg leading-tight">Order History Log</h1>
              <span className="text-xs font-bold text-purple-700">{restaurantName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Metric Summary Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm bg-white">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-black text-xl text-slate-900">₹{totalRevenue.toFixed(2)}</div>
            <span className="text-[10px] text-emerald-600 font-bold">From completed orders</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm bg-white">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Total Orders</span>
              <Receipt className="w-4 h-4 text-purple-600" />
            </div>
            <div className="font-black text-xl text-slate-900">{orders.length}</div>
            <span className="text-[10px] text-purple-600 font-bold">{completedOrders.length} Completed / Served</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm bg-white col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Average Order</span>
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="font-black text-xl text-slate-900">
              ₹{completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(2) : "0.00"}
            </div>
            <span className="text-[10px] text-indigo-600 font-bold">Per table check</span>
          </div>
        </section>

        {/* Search & Filter Controls */}
        <section className="glass-card p-4 rounded-2xl border border-white/80 shadow-sm bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Mobile, or Table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-2 text-xs font-bold overflow-x-auto pb-1 no-scrollbar">
            {["ALL", "COMPLETED", "SERVED", "PREPARING", "ACCEPTED", "PENDING", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </section>

        {/* Orders Log List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-slate-900 text-sm">Past Orders ({filteredOrders.length})</h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-slate-500 text-xs font-bold bg-white">
              No orders found matching your search filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => {
                const formattedDate = new Date(ord.createdAt).toLocaleString();

                return (
                  <div key={ord.id} className="glass-card p-5 rounded-3xl border border-white/90 shadow-sm bg-white space-y-3 hover:shadow-md transition-all">
                    {/* Card Top Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 text-base">#{ord.orderNumber}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ord.orderStatus === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700"
                                : ord.orderStatus === "SERVED"
                                ? "bg-indigo-100 text-indigo-700"
                                : ord.orderStatus === "CANCELLED"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1 flex items-center space-x-2">
                          <span className="font-bold text-purple-700">{ord.qrTable?.tableTitle || "Direct Table"}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formattedDate}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePrintReceipt(ord)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </div>

                    {/* Customer Info & Payment Mode */}
                    <div className="flex items-center justify-between text-xs font-semibold bg-purple-50/50 p-2.5 rounded-2xl">
                      <div>
                        <span className="text-slate-500">Customer: </span>
                        <span className="font-bold text-slate-900">{ord.customer?.name || "Guest Diner"} ({ord.customer?.mobileNo})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-800 font-black text-[10px]">
                          {ord.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Item Breakdown */}
                    <div className="space-y-1.5 text-xs">
                      {ord.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-1.5 last:border-b-0 last:pb-0">
                          <div>
                            <div className="font-bold text-slate-800">{item.quantity}x {item.itemName}</div>
                            {item.variantName && (
                              <div className="text-[10px] font-bold text-purple-700">Portion: {item.variantName}</div>
                            )}
                            {item.selectedAddons && (
                              <div className="text-[10px] text-slate-500 font-medium">{item.selectedAddons}</div>
                            )}
                          </div>
                          <span className="font-mono text-slate-900 font-black">₹{parseFloat(item.subTotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Grand Total */}
                    <div className="border-t border-purple-100 pt-2 flex items-center justify-between font-black text-sm">
                      <span className="text-slate-600">Grand Total</span>
                      <span className="text-slate-900 text-base">₹{parseFloat(ord.grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
