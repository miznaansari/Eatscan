"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Utensils, ArrowLeft, Image as ImageIcon, CheckCircle2, Upload, Loader2, Camera } from "lucide-react";

export default function ManagerMenuPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category state
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [uploadingCatImg, setUploadingCatImg] = useState(false);

  // New Item state
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [foodType, setFoodType] = useState("VEG");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingItemImg, setUploadingItemImg] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState("");

  // Existing item/category upload progress states
  const [uploadingCatId, setUploadingCatId] = useState(null);
  const [uploadingItemId, setUploadingItemId] = useState(null);

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

  const handleFileUpload = async (file, folderType, setUrlState, setUploadingState) => {
    if (!file) return;
    setUploadingState(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", folderType); // category, menuItem, or restaurant

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setUrlState(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("File upload error:", err);
      alert("Failed to upload image to Cloudflare R2");
    } finally {
      setUploadingState(false);
    }
  };

  // Upload & update image for EXISTING category
  const handleUpdateCategoryImage = async (catId, file) => {
    if (!file) return;
    setUploadingCatId(catId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "category");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      const updateRes = await fetch("/api/restaurant/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CATEGORY",
          id: catId,
          categoryImage: uploadData.url,
        }),
      });

      if (updateRes.ok) {
        fetchMenu(restaurantId);
      } else {
        alert("Failed to update category image in database");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update category image");
    } finally {
      setUploadingCatId(null);
    }
  };

  // Upload & update image for EXISTING menu item
  const handleUpdateMenuItemImage = async (itemId, file) => {
    if (!file) return;
    setUploadingItemId(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "menuItem");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      const updateRes = await fetch("/api/restaurant/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MENU_ITEM",
          id: itemId,
          imageUrl: uploadData.url,
        }),
      });

      if (updateRes.ok) {
        fetchMenu(restaurantId);
      } else {
        alert("Failed to update item image in database");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update item image");
    } finally {
      setUploadingItemId(null);
    }
  };

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
          categoryImage: newCatImage,
        }),
      });

      if (res.ok) {
        setNewCatName("");
        setNewCatImage("");
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
      <header className="glass-navbar sticky-header sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-2xl">
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
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Desserts, Starters)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="url"
                placeholder="Category Image URL"
                value={newCatImage}
                onChange={(e) => setNewCatImage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Cloudflare R2 Category Image Upload */}
            <div className="flex items-center space-x-3 text-xs">
              <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 flex items-center space-x-1.5">
                {uploadingCatImg ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingCatImg ? "Processing R2 Sizes..." : "Upload Category Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "category", setNewCatImage, setUploadingCatImg)}
                />
              </label>

              {newCatImage && (
                <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>R2 Image Ready</span>
                  <img src={newCatImage} alt="Category Preview" className="w-6 h-6 rounded-md object-cover border border-slate-200" />
                </div>
              )}
            </div>
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

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">Item Image</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="url"
                  placeholder="Image URL or upload image file below"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-input text-xs font-semibold focus:outline-none"
                />
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm">
                  {uploadingItemImg ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingItemImg ? "Uploading R2..." : "Upload File to R2"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], "menuItem", setImageUrl, setUploadingItemImg)}
                  />
                </label>
              </div>

              {imageUrl && (
                <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-600 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>R2 Cloudflare Image Linked</span>
                  <img src={imageUrl} alt="Item Preview" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                </div>
              )}
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
            <div key={cat.id} className="glass-card p-5 rounded-2xl bg-white border border-white/80 shadow-sm space-y-4">
              {/* Category Header with Upload/Edit Image Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                <div className="flex items-center space-x-3">
                  {cat.categoryImage ? (
                    <img src={cat.categoryImage} alt={cat.categoryName} className="w-9 h-9 rounded-full object-cover border border-purple-200 shadow-xs" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                      <Utensils className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{cat.categoryName}</h3>
                    <span className="text-[10px] font-bold text-slate-500">{cat.menus?.length || 0} items</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Category Image Upload Button */}
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs border border-purple-200 flex items-center space-x-1.5 transition-all">
                    {uploadingCatId === cat.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingCatId === cat.id ? "Uploading R2..." : cat.categoryImage ? "Change Image" : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpdateCategoryImage(cat.id, e.target.files?.[0])}
                    />
                  </label>

                  <button
                    onClick={() => handleDelete(cat.id, "CATEGORY")}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Food Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.menus?.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between space-x-2 hover:shadow-xs transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                          No Img
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-bold text-xs text-slate-900 truncate">{item.itemName}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex-shrink-0">
                            {item.foodType}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-black text-slate-800">₹{parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Menu Item Image Upload Button */}
                      <label className="cursor-pointer p-2 rounded-xl bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 transition-all" title="Upload/Change Dish Image">
                        {uploadingItemId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUpdateMenuItemImage(item.id, e.target.files?.[0])}
                        />
                      </label>

                      <button
                        onClick={() => handleDelete(item.id, "MENU_ITEM")}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
