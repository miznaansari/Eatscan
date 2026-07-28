"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Utensils, ArrowLeft, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default function ManagerMenuPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category state
  const [newCatName, setNewCatName] = useState("");

  // New Item state
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [foodType, setFoodType] = useState("VEG");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");

  const fetchMenu = async (id) => {
    try {
      const res = await fetch(`/api/restaurant/menu?restaurantId=${id}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !selectedCatId) {
          setSelectedCatId(data.categories[0].id);
        }
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
    fetchMenu(id);
  }, [router]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await fetch("/api/restaurant/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CATEGORY",
          restaurantId,
          categoryName: newCatName,
        }),
      });

      if (res.ok) {
        setNewCatName("");
        fetchMenu(restaurantId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName || !price || !selectedCatId) return;

    try {
      const res = await fetch("/api/restaurant/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MENU_ITEM",
          restaurantId,
          menuCategoryId: selectedCatId,
          itemName,
          price,
          discountPrice,
          foodType,
          imageUrl,
        }),
      });

      if (res.ok) {
        setItemName("");
        setPrice("");
        setDiscountPrice("");
        setImageUrl("");
        fetchMenu(restaurantId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/restaurant/menu?id=${id}&type=${type}`, {
        method: "DELETE",
      });
      if (res.ok) fetchMenu(restaurantId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center font-bold text-slate-600 text-sm">Loading Menu Manager...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/restaurant/admin/dashboard" className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-black text-slate-900 text-lg">Menu Catalog Manager</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        {/* Create Category Form */}
        <section className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm space-y-3">
          <h2 className="font-extrabold text-sm text-slate-900 uppercase">1. Add Menu Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Category Name (e.g. Desserts, Cold Drinks)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </form>
        </section>

        {/* Create Menu Item Form */}
        <section className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-slate-900 uppercase">2. Add New Food Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoked Paneer Tikka"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="350"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Discount Price (₹)</label>
                <input
                  type="number"
                  placeholder="299"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Food Type</label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-bold focus:outline-none"
                >
                  <option value="VEG">Pure Veg</option>
                  <option value="NON_VEG">Non-Veg</option>
                  <option value="EGG">Contains Egg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 shadow-md"
            >
              Save Food Item to Menu
            </button>
          </form>
        </section>

        {/* Existing Categories & Items List */}
        <section className="space-y-6">
          <h2 className="font-extrabold text-base text-slate-900">Current Catalog</h2>

          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-black text-sm text-purple-700">{cat.categoryName}</h3>
                <button
                  onClick={() => handleDelete(cat.id, "CATEGORY")}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.menus?.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{item.itemName}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                          {item.foodType}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">₹{parseFloat(item.price).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, "MENU_ITEM")}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
