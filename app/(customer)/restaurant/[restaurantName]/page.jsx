"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Utensils,
  Plus,
  Grid,
  Flame,
  ArrowRight,
  Receipt,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerMenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.restaurantName;

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL"); // ALL, VEG, NON_VEG
  const [searchQuery, setSearchQuery] = useState("");
  const [tableTitle, setTableTitle] = useState("");
  const [cart, setCart] = useState({});

  // Pending Order state
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    // Read table title from localStorage if available
    const savedTable = localStorage.getItem("eatscan_table_title");
    if (savedTable) setTableTitle(savedTable);

    // Read cart
    const savedCart = localStorage.getItem("eatscan_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }

    // Check for pending order in browser
    const savedOrderUid = localStorage.getItem("eatscan_latest_order_uid");
    if (savedOrderUid) {
      fetch(`/api/customer/order/${savedOrderUid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            const activeStatuses = ["PENDING", "ACCEPTED", "PREPARING", "SERVED"];
            if (activeStatuses.includes(data.order.orderStatus)) {
              setPendingOrder(data.order);
            } else {
              setPendingOrder(null);
            }
          }
        })
        .catch(() => setPendingOrder(null));
    }

    // Single-pass direct menu data fetch
    async function fetchMenu() {
      try {
        const res = await fetch(`/api/restaurant/menu?slug=${restaurantSlug}`);
        const data = await res.json();
        if (data.success && data.restaurant) {
          setRestaurant(data.restaurant);
          setCategories(data.categories || []);
          localStorage.setItem("eatscan_restaurant_id", data.restaurant.id);
          localStorage.setItem("eatscan_restaurant_name", data.restaurant.restaurantName);
          localStorage.setItem("eatscan_restaurant_slug", data.restaurant.slug || restaurantSlug);
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [restaurantSlug]);

  // Customization Bottom Sheet State for Variants & Addons
  const [selectedMenuItemForCustomization, setSelectedMenuItemForCustomization] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddonsMap, setSelectedAddonsMap] = useState({});

  const handleOpenCustomization = (item) => {
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) {
      setSelectedMenuItemForCustomization(item);
      setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : null);
      setSelectedAddonsMap({});
    } else {
      addToCartWithDetails(item, null, []);
    }
  };

  const addToCartWithDetails = (item, variant, addonsList) => {
    const basePrice = variant
      ? parseFloat(variant.price)
      : item.discountPrice
      ? parseFloat(item.discountPrice)
      : parseFloat(item.price);
    const addonsTotal = (addonsList || []).reduce((sum, a) => sum + parseFloat(a.price), 0);
    const finalUnitPrice = basePrice + addonsTotal;

    const variantLabel = variant ? variant.variantName : "";
    const addonsText = (addonsList || []).map((a) => `${a.addonName} (+₹${parseFloat(a.price).toFixed(2)})`).join(", ");

    const cartKey = `${item.id}-${variant ? variant.id : "base"}-${(addonsList || []).map((a) => a.id).sort().join("-")}`;

    const newCart = { ...cart };
    if (newCart[cartKey]) {
      newCart[cartKey].quantity += 1;
    } else {
      newCart[cartKey] = {
        cartKey: cartKey,
        id: item.id,
        name: item.itemName,
        price: finalUnitPrice,
        variantName: variantLabel,
        selectedAddons: addonsText,
        quantity: 1,
        imageUrl: item.imageUrl,
        foodType: item.foodType,
      };
    }
    setCart(newCart);
    localStorage.setItem("eatscan_cart", JSON.stringify(newCart));
    setSelectedMenuItemForCustomization(null);
  };

  const removeFromCart = (cartKey) => {
    const newCart = { ...cart };
    if (newCart[cartKey]) {
      if (newCart[cartKey].quantity > 1) {
        newCart[cartKey].quantity -= 1;
      } else {
        delete newCart[cartKey];
      }
    }
    setCart(newCart);
    localStorage.setItem("eatscan_cart", JSON.stringify(newCart));
  };

  const cartItemsArray = Object.values(cart);
  const cartTotalCount = cartItemsArray.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartTotalPrice = cartItemsArray.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="min-h-screen pb-32 bg-white text-slate-950 selection:bg-purple-600 selection:text-white">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-600/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                  {restaurant?.restaurantName || "Restaurant Menu"}
                </h1>
                {tableTitle && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-black text-[10px] shadow-xs uppercase tracking-wider">
                    {tableTitle}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-700 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Instant QR Menu • Active Session</span>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs transition-all border border-slate-200"
          >
            EatScan
          </Link>
        </div>
      </header>

      {/* CONDITIONAL PENDING ORDER STATUS BANNER */}
      {pendingOrder && (
        <div className="bg-purple-600 text-white px-4 py-3 shadow-md">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Flame className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-purple-100">
                  Active Order #{pendingOrder.orderNumber}
                </div>
                <div className="text-xs font-bold text-white">
                  Status: <span className="underline font-black">{pendingOrder.orderStatus}</span> • ₹
                  {parseFloat(pendingOrder.grandTotal).toFixed(2)}
                </div>
              </div>
            </div>
            <Link
              href={`/restaurant/order/${pendingOrder.uid}`}
              className="px-3.5 py-1.5 rounded-xl bg-white text-purple-700 font-black text-xs hover:bg-purple-50 transition-all flex items-center space-x-1 shadow-xs"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Search Bar & Veg/Non-Veg Filter */}
        <section className="space-y-3">
          <div className="relative">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
            <input
              type="text"
              placeholder="Search dishes, drinks, starters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-black">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-2 rounded-xl transition-all border ${
                filterType === "ALL"
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Dishes
            </button>
            <button
              type="button"
              onClick={() => setFilterType("VEG")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 border ${
                filterType === "VEG"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              <span>Veg Only</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("NON_VEG")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 border ${
                filterType === "NON_VEG"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white text-rose-700 border-slate-200 hover:bg-rose-50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
              <span>Non-Veg</span>
            </button>
          </div>
        </section>

        {/* Sticky Category Tabs with Category Images */}
        <section className="sticky top-[58px] z-30 py-2.5 bg-white/95 backdrop-blur-md border-y border-slate-200 -mx-4 px-4 shadow-xs">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5 text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setActiveCategory("ALL");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all flex items-center space-x-2 border ${
                activeCategory === "ALL"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300"
              }`}
            >
              <Grid className="w-4 h-4 text-white/90" />
              <span>All Categories</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`cat-${cat.id}`);
                  if (el) {
                    const offset = 140;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = el.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-2xl whitespace-nowrap transition-all flex items-center space-x-2 border ${
                  activeCategory === cat.id
                    ? "bg-purple-600 text-white border-purple-600 shadow-md font-black"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300"
                }`}
              >
                {cat.categoryImage ? (
                  <img
                    src={cat.categoryImage}
                    alt={cat.categoryName}
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                ) : (
                  <Utensils className={`w-3.5 h-3.5 ${activeCategory === cat.id ? "text-white" : "text-purple-600"}`} />
                )}
                <span>{cat.categoryName}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Menu Categories & Item Lists */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-8">
        {loading ? (
          /* High Speed Single Pass Skeleton Loader */
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="h-7 w-40 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-32 bg-slate-100 rounded-3xl border border-slate-200 p-4" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const filteredMenus = (cat.menus || []).filter((item) => {
              const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesType = filterType === "ALL" || item.foodType === filterType;
              return matchesSearch && matchesType;
            });

            if (filteredMenus.length === 0) return null;

            return (
              <section id={`cat-${cat.id}`} key={cat.id} className="space-y-4 scroll-mt-48">
                {/* Category Header with Category Image */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-3">
                    {cat.categoryImage ? (
                      <img
                        src={cat.categoryImage}
                        alt={cat.categoryName}
                        className="w-9 h-9 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                        <Utensils className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        {cat.categoryName}
                      </h2>
                      {cat.description && (
                        <p className="text-xs text-slate-500 font-medium">{cat.description}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                    {filteredMenus.length} items
                  </span>
                </div>

                {/* Dish Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMenus.map((item) => {
                    const hasDiscount = item.discountPrice && parseFloat(item.discountPrice) < parseFloat(item.price);

                    return (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex justify-between space-x-3 relative overflow-hidden"
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center space-x-1.5">
                            {item.foodType === "VEG" ? (
                              <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center p-0.5 rounded-sm bg-emerald-50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 border border-rose-600 flex items-center justify-center p-0.5 rounded-sm bg-rose-50">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              </span>
                            )}
                            <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                              Chef Special
                            </span>
                          </div>

                          <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                            {item.itemName}
                          </h3>

                          <div className="flex items-baseline space-x-2">
                            <span className="font-black text-slate-900 text-base">
                              ₹{item.discountPrice ? item.discountPrice : item.price}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through font-semibold">₹{item.price}</span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        </div>

                        {/* Dish Thumbnail Image & Add Button */}
                        <div className="flex flex-col items-center justify-between flex-shrink-0 w-28">
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-black bg-slate-100">
                                EatScan
                              </div>
                            )}
                          </div>

                          {(() => {
                            const itemCartEntries = Object.values(cart).filter((c) => c.id === item.id);
                            const totalItemQty = itemCartEntries.reduce((sum, c) => sum + c.quantity, 0);
                            const hasCustomizations = (item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0);

                            return totalItemQty > 0 ? (
                              <div className="mt-2 flex flex-col items-center">
                                <div className="flex items-center space-x-2.5 px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const lastEntry = itemCartEntries[itemCartEntries.length - 1];
                                      if (lastEntry) removeFromCart(lastEntry.cartKey);
                                    }}
                                    className="px-1 text-base font-black hover:text-purple-200"
                                  >
                                    -
                                  </button>
                                  <span>{totalItemQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomization(item)}
                                    className="px-1 text-base font-black hover:text-purple-200"
                                  >
                                    +
                                  </button>
                                </div>
                                {hasCustomizations && (
                                  <span className="text-[9px] font-black text-purple-700 mt-0.5">Customisable</span>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenCustomization(item)}
                                className="mt-2 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center space-x-1 uppercase"
                              >
                                <span>+ Add</span>
                                {hasCustomizations && <span className="text-[9px] font-black text-purple-200 ml-0.5">*</span>}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Floating View Cart Bar */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="p-4 rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300">
                {cartTotalCount} {cartTotalCount === 1 ? "Item" : "Items"} Selected
              </span>
              <div className="font-black text-2xl text-white">₹{cartTotalPrice.toFixed(2)}</div>
            </div>

            <Link
              href="/restaurant/checkout"
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4 text-purple-200" />
            </Link>
          </div>
        </div>
      )}

      {/* Swipable Bottom Sheet Drawer for Variants & Add-ons */}
      <AnimatePresence>
        {selectedMenuItemForCustomization && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMenuItemForCustomization(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Swipeable Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) {
                  setSelectedMenuItemForCustomization(null);
                }
              }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-lg bg-white rounded-t-[32px] p-6 shadow-2xl border-t border-slate-200 space-y-5 z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-2 mb-2 cursor-grab active:cursor-grabbing" />

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-snug">
                    {selectedMenuItemForCustomization.itemName}
                  </h3>
                  <span className="text-xs font-black text-purple-700">Customise portion & add-ons</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMenuItemForCustomization(null)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Variants Option Selection */}
              {selectedMenuItemForCustomization.variants && selectedMenuItemForCustomization.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Select Portion / Size *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMenuItemForCustomization.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
                          selectedVariant?.id === v.id
                            ? "bg-purple-600 text-white border-purple-600 shadow-md font-black"
                            : "bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300"
                        }`}
                      >
                        <span>{v.variantName}</span>
                        <span>₹{parseFloat(v.price).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Option Selection */}
              {selectedMenuItemForCustomization.addons && selectedMenuItemForCustomization.addons.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Add Extra Toppings & Extras
                  </label>
                  <div className="space-y-2">
                    {selectedMenuItemForCustomization.addons.map((addon) => {
                      const isSelected = !!selectedAddonsMap[addon.id];
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddonsMap((prev) => ({
                              ...prev,
                              [addon.id]: isSelected ? null : addon,
                            }));
                          }}
                          className={`w-full p-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-purple-50 text-purple-900 border-purple-300 shadow-xs font-black"
                              : "bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"}`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span>{addon.addonName}</span>
                          </div>
                          <span className="text-purple-700 font-black">+₹{parseFloat(addon.price).toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Item Button CTA */}
              {(() => {
                const base = selectedVariant
                  ? parseFloat(selectedVariant.price)
                  : selectedMenuItemForCustomization.discountPrice
                  ? parseFloat(selectedMenuItemForCustomization.discountPrice)
                  : parseFloat(selectedMenuItemForCustomization.price);

                const addonsList = Object.values(selectedAddonsMap).filter(Boolean);
                const addonsSum = addonsList.reduce((s, a) => s + parseFloat(a.price), 0);
                const itemTotal = base + addonsSum;

                return (
                  <button
                    type="button"
                    onClick={() => addToCartWithDetails(selectedMenuItemForCustomization, selectedVariant, addonsList)}
                    className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base shadow-xl flex items-center justify-between px-6 transition-all active:scale-98"
                  >
                    <span>Add Item to Order</span>
                    <span>₹{itemTotal.toFixed(2)}</span>
                  </button>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
