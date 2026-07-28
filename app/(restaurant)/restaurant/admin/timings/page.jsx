"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Plus, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ManagerTimingsPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(true);

  // New slot form state
  const [day, setDay] = useState("MONDAY");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [isHoliday, setIsHoliday] = useState(false);

  const fetchTimings = async (id) => {
    try {
      const res = await fetch(`/api/restaurant/timings?restaurantId=${id}`);
      const data = await res.json();
      if (data.success) {
        setTimings(data.timings || []);
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
    fetchTimings(id);
  }, [router]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/restaurant/timings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          day,
          startTime,
          endTime,
          isHoliday,
        }),
      });

      if (res.ok) {
        fetchTimings(restaurantId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm("Are you sure you want to soft delete this time slot?")) return;
    try {
      const res = await fetch(`/api/restaurant/timings?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchTimings(restaurantId);
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
            <h1 className="font-black text-slate-900 text-lg">Multi-Slot Operating Hours</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Add Slot Form */}
        <section className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 uppercase">Configure Shift Time Slot</h2>
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Weekday</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold focus:outline-none"
              >
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Start Time (HH:MM)</label>
              <input
                type="text"
                placeholder="10:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">End Time (HH:MM)</label>
              <input
                type="text"
                placeholder="12:00"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 flex items-center justify-center space-x-1 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Save Time Slot</span>
              </button>
            </div>
          </form>
        </section>

        {/* Existing Timings List */}
        <section className="space-y-4">
          <h2 className="font-extrabold text-base text-slate-900">Active Shift Slots ({timings.length})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timings.map((t) => (
              <div key={t.id} className="glass-card p-4 rounded-2xl bg-white border border-white/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-black text-sm text-purple-700">{t.day}</span>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    {t.startTime} - {t.endTime}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSlot(t.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
