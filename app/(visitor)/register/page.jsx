"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Utensils, Upload, Clock, Plus, Trash2, CheckCircle2, ArrowRight } from "lucide-react";

export default function RestaurantRegisterPage() {
  const [formData, setFormData] = useState({
    restaurantName: "",
    restaurantEmail: "",
    restaurantMobileNo: "",
    password: "",
    address: "",
    rawMenuImageUrls: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"],
    timings: [
      { day: "MONDAY", startTime: "10:00", endTime: "12:00", isHoliday: false },
      { day: "MONDAY", startTime: "14:00", endTime: "17:00", isHoliday: false },
      { day: "MONDAY", startTime: "20:00", endTime: "22:00", isHoliday: false },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const addMenuImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      rawMenuImageUrls: [...prev.rawMenuImageUrls, ""],
    }));
  };

  const updateMenuImageUrl = (index, value) => {
    const updated = [...formData.rawMenuImageUrls];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, rawMenuImageUrls: updated }));
  };

  const removeMenuImageUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      rawMenuImageUrls: prev.rawMenuImageUrls.filter((_, i) => i !== index),
    }));
  };

  const addTimingSlot = () => {
    setFormData((prev) => ({
      ...prev,
      timings: [
        ...prev.timings,
        { day: "TUESDAY", startTime: "11:00", endTime: "15:00", isHoliday: false },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/restaurant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold mb-3">
          <Utensils className="w-4 h-4" />
          <span>Restaurant Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Onboard Your Restaurant on EatScan</h1>
        <p className="text-slate-600 mt-2 font-medium text-sm">Upload raw menu images and define multi-slot operating hours</p>
      </div>

      {success ? (
        <div className="glass-card p-8 rounded-3xl text-center space-y-4 border border-emerald-200">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Registration Complete!</h2>
          <p className="text-slate-600 text-sm">Your restaurant account has been created. You can now login to your manager PWA dashboard.</p>
          <div className="pt-4">
            <Link
              href="/restaurant/admin/login"
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all inline-flex items-center space-x-2"
            >
              <span>Go to Manager Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-10 rounded-3xl space-y-8 border border-white/80 shadow-xl">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Restaurant Basic Details */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 border-b pb-2">1. Restaurant Credentials</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spice Garden Bistro"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Manager Email</label>
                <input
                  type="email"
                  required
                  placeholder="owner@spicegarden.com"
                  value={formData.restaurantEmail}
                  onChange={(e) => setFormData({ ...formData, restaurantEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210"
                  value={formData.restaurantMobileNo}
                  onChange={(e) => setFormData({ ...formData, restaurantMobileNo: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address</label>
              <input
                type="text"
                placeholder="Street name, landmark, city"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Raw Menu Images Upload URLs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <span>2. Upload Raw Menu Images</span>
              </h3>
              <button
                type="button"
                onClick={addMenuImageUrl}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image URL</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.rawMenuImageUrls.map((url, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/menu-card-page-1.jpg"
                    value={url}
                    onChange={(e) => updateMenuImageUrl(i, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {formData.rawMenuImageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMenuImageUrl(i)}
                      className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Slot Timings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>3. Operating Hours (Multi-Slot System)</span>
              </h3>
              <button
                type="button"
                onClick={addTimingSlot}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Time Slot</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.timings.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center glass-card p-3 rounded-xl">
                  <select
                    value={slot.day}
                    onChange={(e) => {
                      const updated = [...formData.timings];
                      updated[idx].day = e.target.value;
                      setFormData({ ...formData, timings: updated });
                    }}
                    className="px-3 py-2 rounded-lg bg-white border text-xs font-bold"
                  >
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="SUNDAY">Sunday</option>
                  </select>

                  <input
                    type="text"
                    placeholder="10:00"
                    value={slot.startTime}
                    onChange={(e) => {
                      const updated = [...formData.timings];
                      updated[idx].startTime = e.target.value;
                      setFormData({ ...formData, timings: updated });
                    }}
                    className="px-3 py-2 rounded-lg bg-white border text-xs font-semibold"
                  />

                  <input
                    type="text"
                    placeholder="12:00"
                    value={slot.endTime}
                    onChange={(e) => {
                      const updated = [...formData.timings];
                      updated[idx].endTime = e.target.value;
                      setFormData({ ...formData, timings: updated });
                    }}
                    className="px-3 py-2 rounded-lg bg-white border text-xs font-semibold"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.timings.filter((_, i) => i !== idx);
                      setFormData({ ...formData, timings: updated });
                    }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Remove Slot
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? "Creating Restaurant..." : "Complete Registration & Generate QR"}
          </button>
        </form>
      )}
    </div>
  );
}
