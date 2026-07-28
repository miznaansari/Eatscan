"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, Plus, Trash2, ArrowLeft, ExternalLink, Printer } from "lucide-react";

export default function ManagerTablePage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [tables, setTables] = useState([]);
  const [tableTitle, setTableTitle] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("4");
  const [loading, setLoading] = useState(true);

  const fetchTables = async (id) => {
    try {
      const res = await fetch(`/api/restaurant/table?restaurantId=${id}`);
      const data = await res.json();
      if (data.success) {
        setTables(data.tables || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("eatscan_manager_restaurant_id");
    if (!id) {
      router.push("/restaurant/admin/login");
      return;
    }
    setRestaurantId(id);
    fetchTables(id);
  }, [router]);

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!tableTitle) return;

    try {
      const res = await fetch("/api/restaurant/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          tableTitle,
          seatingCapacity,
        }),
      });

      if (res.ok) {
        setTableTitle("");
        fetchTables(restaurantId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm("Are you sure you want to soft-delete this table?")) return;
    try {
      const res = await fetch(`/api/restaurant/table?id=${tableId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchTables(restaurantId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 glass-card border-b border-slate-200/80 px-4 py-3 bg-white/90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/restaurant/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-black text-slate-900 text-lg">QR Table Generator</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Create Table Form */}
        <section className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 uppercase">Generate New Table QR Code</h2>
          <form onSubmit={handleCreateTable} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Table Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Table 05 - Rooftop"
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Seating Capacity</label>
              <input
                type="number"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create QR Stand</span>
              </button>
            </div>
          </form>
        </section>

        {/* Existing QR Tables Grid */}
        <section className="space-y-4">
          <h2 className="font-extrabold text-base text-slate-900">Printable Table Stands ({tables.length})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div key={table.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base">{table.tableTitle}</h3>
                  <span className="text-xs text-slate-400 font-medium">Capacity: {table.seatingCapacity} Persons</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 font-mono text-[11px] font-bold text-purple-700 break-all">
                  /qr/{table.uid}
                </div>

                <div className="flex items-center justify-center space-x-2 pt-2 border-t">
                  <Link
                    href={`/qr/${table.uid}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test QR</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
