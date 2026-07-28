"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Flame, Sparkles, Clock, CheckCircle2, ChevronRight, X, Volume2, Utensils, Plus, Layers } from "lucide-react";
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

  // Cart & Splash screen state
  const [cart, setCart] = useState({});
  const [showSplash, setShowSplash] = useState(false);
  const [splashCountdown, setSplashCountdown] = useState(3);

  const handleDismissSplash = () => {
    setShowSplash(false);
    if (restaurantSlug) {
      localStorage.setItem(`eatscan_splash_seen_${restaurantSlug}`, "true");
    }
  };

  useEffect(() => {
    // Check if splash screen was already seen for this restaurant
    const splashSeenKey = `eatscan_splash_seen_${restaurantSlug}`;
    const hasSeenSplash = localStorage.getItem(splashSeenKey);
    if (hasSeenSplash !== "true") {
      setShowSplash(true);
    }

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

  // 3-second splash timer countdown
  useEffect(() => {
    if (!showSplash) return;

    const timer = setInterval(() => {
      setSplashCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDismissSplash();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSplash, restaurantSlug]);

  // Customization Modal State for Variants & Addons
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

  // Raw menu image fallback
  const rawMenuImage = restaurant?.rawMenuImages?.[0]?.restaurantRawMenuImagesURL || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50/50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mx-auto" />
          <p className="font-extrabold text-purple-900 text-sm">Loading EatScan Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-purple-50/30 text-slate-900">
      {/* 3-Second Raw Menu Image Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-4 transition-opacity duration-500">
          <button
            onClick={handleDismissSplash}
            className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
          >
            <span>Skip ({splashCountdown}s)</span>
            <X className="w-4 h-4" />
          </button>

          <div className="max-w-md w-full glass-card p-4 rounded-3xl text-center space-y-4 shadow-2xl border border-white/20">
            <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={rawMenuImage}
                alt="Restaurant Menu Preview"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-xs font-black uppercase text-purple-300">Welcome to</span>
                <h3 className="text-xl font-black text-white">{restaurant?.restaurantName || "Spice Garden Bistro"}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between text-white text-xs font-bold px-2">
              <span className="text-slate-300">Original Menu Card View</span>
              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white animate-pulse">
                Opening Catalog in {splashCountdown}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <header className="glass-navbar sticky-header sticky top-0 z-40 px-4 py-3 sm:py-4 shadow-lg backdrop-blur-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {restaurant?.restaurantName || "Spice Garden Bistro"}
              </h1>
              {tableTitle && (
                <span className="px-2.5 py-0.5 rounded-full glass-pill text-purple-700 font-black text-xs border border-purple-200 shadow-sm">
                  {tableTitle}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 font-bold mt-1 flex items-center space-x-2">
              <span>{restaurant?.address || "Indiranagar, Bengaluru"}</span>
              <span>•</span>
              <span className="text-emerald-700 font-black flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Open Now</span>
              </span>
            </p>
          </div>

          <Link
            href="/"
            className="w-10 h-10 rounded-2xl glass-pill flex items-center justify-center p-1 shadow-md hover:scale-105 transition-transform"
          >
            <img src="/favicon.svg" alt="EatScan Logo" className="w-full h-full object-contain" />
          </Link>
        </div>

        {/* Search Bar & Type Filter Pills */}
        <div className="max-w-3xl mx-auto mt-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500" />
            <input
              type="text"
              placeholder="Search for dishes, starters, biryani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-2xl glass-input text-xs font-semibold focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                filterType === "ALL"
                  ? "btn-purple text-white shadow-sm"
                  : "glass-pill text-slate-700 hover:text-purple-600"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType("VEG")}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 ${
                filterType === "VEG"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "glass-pill text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              <span>Pure Veg</span>
            </button>
            <button
              onClick={() => setFilterType("NON_VEG")}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 ${
                filterType === "NON_VEG"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "glass-pill text-rose-700 hover:bg-rose-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 border border-white" />
              <span>Non-Veg</span>
            </button>
          </div>

          {/* Sticky Category Navigation Pills (The Bottom Bar inside Header) */}
          <div className="border-t border-purple-100/70 pt-2.5 mt-2">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 text-xs font-bold">
              <button
                onClick={() => {
                  setActiveCategory("ALL");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeCategory === "ALL"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "glass-pill text-slate-700 hover:text-purple-700"
                }`}
              >
                ⭐ All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const el = document.getElementById(`cat-${cat.id}`);
                    if (el) {
                      const offset = 180;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const elementPosition = elementRect - bodyRect;
                      const offsetPosition = elementPosition - offset;
                      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "btn-purple text-white shadow-sm"
                      : "glass-pill text-slate-700 hover:text-purple-700"
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Categories & Item Lists */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
        {categories.map((cat) => {
          const filteredMenus = cat.menus.filter((item) => {
            const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === "ALL" || item.foodType === filterType;
            return matchesSearch && matchesType;
          });

          if (filteredMenus.length === 0) return null;

          return (
            <section id={`cat-${cat.id}`} key={cat.id} className="space-y-4 scroll-mt-48">
              <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>{cat.categoryName}</span>
                </h2>
                <span className="text-xs font-bold text-slate-500 glass-pill px-2.5 py-0.5 rounded-full">
                  {filteredMenus.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMenus.map((item) => {
                  const qty = cart[item.id]?.quantity || 0;
                  const hasDiscount = item.discountPrice && parseFloat(item.discountPrice) < parseFloat(item.price);

                  return (
                    <div
                      key={item.id}
                      className="glass-card p-4 rounded-3xl border border-white/90 shadow-md hover:shadow-xl transition-all flex justify-between space-x-3 relative overflow-hidden"
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
                          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider px-1.5 py-0.5 rounded-full glass-pill">
                            Bestseller
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                          {item.itemName}
                        </h3>

                        <div className="flex items-baseline space-x-2">
                          <span className="font-black text-slate-900 text-sm sm:text-base">
                            ₹{item.discountPrice ? item.discountPrice : item.price}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">₹{item.price}</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>

                      {/* Item Image & ADD Button */}
                      <div className="flex flex-col items-center justify-between flex-shrink-0 w-28">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-purple-50 shadow-inner border border-purple-100">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-400 text-xs font-bold bg-gradient-to-br from-purple-100 to-purple-50">
                              No Image
                            </div>
                          )}
                        </div>

                        {(() => {
                          const itemCartEntries = Object.values(cart).filter((c) => c.id === item.id);
                          const totalItemQty = itemCartEntries.reduce((sum, c) => sum + c.quantity, 0);
                          const hasCustomizations = (item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0);

                          return totalItemQty > 0 ? (
                            <div className="mt-2 flex flex-col items-center">
                              <div className="flex items-center space-x-2 px-3 py-1 rounded-xl btn-purple text-white text-xs font-black shadow-md">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const lastEntry = itemCartEntries[itemCartEntries.length - 1];
                                    if (lastEntry) removeFromCart(lastEntry.cartKey);
                                  }}
                                  className="px-1 text-base font-bold"
                                >
                                  -
                                </button>
                                <span>{totalItemQty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCustomization(item)}
                                  className="px-1 text-base font-bold"
                                >
                                  +
                                </button>
                              </div>
                              {hasCustomizations && (
                                <span className="text-[9px] font-extrabold text-purple-600 mt-0.5">Customisable</span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenCustomization(item)}
                              className="mt-2 px-4 py-1.5 rounded-xl btn-purple text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center space-x-1 uppercase"
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
        })}
      </main>

      {/* Sticky Bottom Floating Bar (Purple + White Glossy Glass) */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="ios-navbar-floating p-4 rounded-3xl bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl border border-white flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700">
                {cartTotalCount} {cartTotalCount === 1 ? "Item" : "Items"} Selected
              </span>
              <div className="font-black text-2xl text-slate-900">₹{cartTotalPrice.toFixed(2)}</div>
            </div>

            <Link
              href="/restaurant/checkout"
              className="px-6 py-3 rounded-2xl btn-purple text-white font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4 text-purple-200" />
            </Link>
          </div>
        </div>
      )}

      {/* Customization Modal / Drawer for Variants & Add-ons */}
      <AnimatePresence>
        {selectedMenuItemForCustomization && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMenuItemForCustomization(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer"
            />

            {/* Glossy Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-white space-y-5 z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-snug">
                    {selectedMenuItemForCustomization.itemName}
                  </h3>
                  <span className="text-xs font-bold text-purple-700">Customise Portions & Add-ons</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMenuItemForCustomization(null)}
                  className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Variants Option Selection */}
              {selectedMenuItemForCustomization.variants && selectedMenuItemForCustomization.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Choose Size / Portion *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMenuItemForCustomization.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
                          selectedVariant?.id === v.id
                            ? "btn-purple text-white shadow-md border-purple-600"
                            : "glass-pill text-slate-700 border-purple-100"
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
                    Add-ons & Extra Toppings
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
                              ? "bg-purple-100 text-purple-900 border-purple-300 shadow-sm"
                              : "glass-pill text-slate-700 border-purple-100"
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

              {/* Add Customized Item CTA */}
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
                    className="w-full py-4 rounded-2xl btn-purple font-black text-base shadow-xl flex items-center justify-between px-6"
                  >
                    <span>Add Item</span>
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
