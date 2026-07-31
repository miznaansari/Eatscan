"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Minus,
  Grid,
  Flame,
  Star,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getCategoryImageUrl(cat) {
  if (cat?.categoryImage) return cat.categoryImage;
  const name = (cat?.categoryName || "").toLowerCase();
  if (name.includes("starter") || name.includes("appetizer") || name.includes("snack")) {
    return "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=200";
  }
  if (name.includes("main") || name.includes("curry") || name.includes("thali") || name.includes("rice")) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
  }
  if (name.includes("drink") || name.includes("mocktail") || name.includes("beverage") || name.includes("juice")) {
    return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200";
  }
  if (name.includes("dessert") || name.includes("sweet") || name.includes("cake") || name.includes("ice")) {
    return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200";
  }
  if (name.includes("pizza") || name.includes("burger") || name.includes("fast")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200";
  }
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200";
}

function getItemImageUrl(item) {
  if (item?.imageUrl) return item.imageUrl;
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
}

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
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Theme preference state: "DARK" | "LIGHT" | "SYSTEM"
  const [themePreference, setThemePreference] = useState("DARK");
  const [systemIsDark, setSystemIsDark] = useState(true);

  // Pending Order state
  const [pendingOrder, setPendingOrder] = useState(null);

  // Listen for system theme media query changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemIsDark(mediaQuery.matches);
      const handler = (e) => setSystemIsDark(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

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

    // Check for user theme override
    const userOverride = localStorage.getItem("eatscan_user_theme_override");
    const savedRestTheme = localStorage.getItem("eatscan_restaurant_theme_mode");
    if (userOverride) {
      setThemePreference(userOverride);
    } else if (savedRestTheme) {
      setThemePreference(savedRestTheme);
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

          // Save restaurant payment options config
          const paymentConfig = {
            isCashEnabled: data.restaurant.isCashEnabled ?? true,
            isOnlineUpiEnabled: data.restaurant.isOnlineUpiEnabled ?? true,
            isCreditCardEnabled: data.restaurant.isCreditCardEnabled ?? true,
          };
          localStorage.setItem("eatscan_payment_config", JSON.stringify(paymentConfig));

          // Set default theme from restaurant if no user override exists
          const restTheme = data.restaurant.themeMode || "DARK";
          localStorage.setItem("eatscan_restaurant_theme_mode", restTheme);
          const override = localStorage.getItem("eatscan_user_theme_override");
          if (!override) {
            setThemePreference(restTheme);
          }
        }
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [restaurantSlug]);

  // Compute active dark mode boolean based on themePreference & system theme
  const isDark =
    themePreference === "DARK"
      ? true
      : themePreference === "LIGHT"
      ? false
      : systemIsDark;

  const cycleThemePreference = () => {
    const nextTheme =
      themePreference === "DARK"
        ? "LIGHT"
        : themePreference === "LIGHT"
        ? "SYSTEM"
        : "DARK";
    setThemePreference(nextTheme);
    localStorage.setItem("eatscan_user_theme_override", nextTheme);
  };

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

  const incrementCartItemByKey = (cartKey) => {
    const newCart = { ...cart };
    if (newCart[cartKey]) {
      newCart[cartKey].quantity += 1;
      setCart(newCart);
      localStorage.setItem("eatscan_cart", JSON.stringify(newCart));
    }
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

  const deleteCartItemCompletely = (cartKey) => {
    const newCart = { ...cart };
    delete newCart[cartKey];
    setCart(newCart);
    localStorage.setItem("eatscan_cart", JSON.stringify(newCart));
  };

  const cartItemsArray = Object.values(cart);
  const cartTotalCount = cartItemsArray.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartTotalPrice = cartItemsArray.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div
      className={`min-h-screen pb-32 transition-colors duration-300 ${
        isDark ? "bg-[#121415] text-[#e2e2e3]" : "bg-[#faf8ff] text-slate-900"
      }`}
    >
      {/* 1. TOP APPBAR WITH THEME TOGGLE */}
      <header
        className={`sticky top-0 z-50 h-16 border-b backdrop-blur-md px-4 transition-colors ${
          isDark ? "bg-[#121415]/95 border-[#333536]/40" : "bg-white/95 border-slate-200 shadow-xs"
        }`}
      >
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                isDark ? "bg-[#9d34ff] text-white shadow-[#9d34ff]/30" : "bg-purple-600 text-white shadow-purple-600/20"
              }`}
            >
              <Utensils className="w-5 h-5" />
            </div>
            <span className={`text-xl font-extrabold tracking-tight ${isDark ? "text-[#dcb8ff]" : "text-purple-950"}`}>
              {restaurant?.restaurantName || "Spice Garden Bistro"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Table Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                isDark
                  ? "bg-[#282a2b] border-[#4d4355] text-[#e2e2e3]"
                  : "bg-slate-950 border-slate-900 text-white"
              }`}
            >
              {tableTitle || "TABLE 04"}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={cycleThemePreference}
              title={`Current Theme: ${themePreference}. Click to switch mode.`}
              className={`p-2 rounded-xl flex items-center space-x-1 border transition-all ${
                isDark
                  ? "bg-[#1e2021] border-[#333536] text-[#dcb8ff] hover:bg-[#282a2b]"
                  : "bg-slate-100 border-slate-200 text-purple-700 hover:bg-slate-200"
              }`}
            >
              {themePreference === "DARK" && <Moon className="w-4 h-4 text-[#dcb8ff]" />}
              {themePreference === "LIGHT" && <Sun className="w-4 h-4 text-amber-500" />}
              {themePreference === "SYSTEM" && <Laptop className="w-4 h-4 text-indigo-400" />}
              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">
                {themePreference}
              </span>
            </button>

            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => {
                const searchEl = document.getElementById("menu-search-input");
                if (searchEl) searchEl.focus();
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                isDark ? "text-[#cfc2d8] hover:bg-[#282a2b]" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONDITIONAL PENDING ORDER BANNER */}
      {pendingOrder && (
        <div className={`px-4 py-2.5 text-xs font-bold shadow-md ${isDark ? "bg-[#9d34ff] text-white" : "bg-purple-600 text-white"}`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Active Order #{pendingOrder.orderNumber} ({pendingOrder.orderStatus})</span>
            </div>
            <Link
              href={`/restaurant/order/${pendingOrder.uid}`}
              className="px-3 py-1 rounded-lg bg-white text-purple-700 font-black text-xs hover:bg-purple-50 transition-all"
            >
              Track Order →
            </Link>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
        {/* 3. SEARCH & QUICK FILTER CHIPS */}
        <section className="flex flex-col gap-3">
          <div className="relative">
            <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-[#cfc2d8]" : "text-slate-400"}`} />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl py-3 pl-12 pr-10 text-sm font-medium outline-none transition-all ${
                isDark
                  ? "bg-[#1e2021] border-[#4d4355]/30 text-[#e2e2e3] focus:border-[#9d34ff] focus:ring-1 focus:ring-[#9d34ff]"
                  : "bg-white border-slate-200 text-slate-900 focus:border-purple-600 shadow-xs"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-[#cfc2d8] hover:text-white" : "text-slate-400"}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-5 py-2 rounded-full whitespace-nowrap transition-all active:scale-95 ${
                filterType === "ALL"
                  ? isDark
                    ? "bg-[#9d34ff] text-white shadow-md shadow-[#9d34ff]/20 font-extrabold"
                    : "bg-purple-600 text-white shadow-md font-extrabold"
                  : isDark
                  ? "bg-[#1e2021] border border-[#4d4355]/30 text-[#e2e2e3] hover:border-[#9d34ff]"
                  : "bg-white border border-slate-200 text-slate-700 shadow-xs hover:border-purple-300"
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setFilterType("VEG")}
              className={`px-5 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${
                filterType === "VEG"
                  ? "bg-emerald-600 text-white shadow-md font-extrabold"
                  : isDark
                  ? "bg-[#1e2021] border border-[#4d4355]/30 text-[#e2e2e3] hover:border-emerald-500"
                  : "bg-white border border-slate-200 text-emerald-700 shadow-xs hover:border-emerald-300"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Veg Only</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("NON_VEG")}
              className={`px-5 py-2 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 ${
                filterType === "NON_VEG"
                  ? "bg-rose-600 text-white shadow-md font-extrabold"
                  : isDark
                  ? "bg-[#1e2021] border border-[#4d4355]/30 text-[#e2e2e3] hover:border-rose-500"
                  : "bg-white border border-slate-200 text-rose-700 shadow-xs hover:border-rose-300"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Non-Veg</span>
            </button>
          </div>
        </section>

        {/* 4. STICKY CATEGORY NAV CHIPS */}
        <section
          className={`sticky top-16 z-40 backdrop-blur-md border-b py-3 -mx-4 px-4 transition-colors ${
            isDark ? "bg-[#121415]/90 border-[#333536]/30" : "bg-[#faf8ff]/90 border-slate-200"
          }`}
        >
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveCategory("ALL");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex flex-col items-center gap-1 min-w-[72px] group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 ${
                  activeCategory === "ALL"
                    ? isDark
                      ? "bg-[#9d34ff] text-white active-glow"
                      : "bg-purple-600 text-white shadow-md"
                    : isDark
                    ? "bg-[#282a2b] text-[#cfc2d8] hover:bg-[#333536]"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <Grid className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold ${activeCategory === "ALL" ? (isDark ? "text-[#dcb8ff]" : "text-purple-700") : isDark ? "text-[#cfc2d8]" : "text-slate-600"}`}>
                All
              </span>
            </button>

            {categories.map((cat) => {
              const catImg = getCategoryImageUrl(cat);
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const el = document.getElementById(`cat-${cat.id}`);
                    if (el) {
                      const offset = 120;
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const elementPosition = elementRect - bodyRect;
                      const offsetPosition = elementPosition - offset;
                      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    }
                  }}
                  className="flex flex-col items-center gap-1 min-w-[72px] group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl overflow-hidden p-0.5 flex items-center justify-center transition-all group-active:scale-90 ${
                      isActive
                        ? isDark
                          ? "bg-[#9d34ff] active-glow"
                          : "bg-purple-600 shadow-md"
                        : isDark
                        ? "bg-[#282a2b]"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <img
                      src={catImg}
                      alt={cat.categoryName}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                  <span
                    className={`text-xs font-bold truncate max-w-[76px] ${
                      isActive
                        ? isDark
                          ? "text-[#dcb8ff]"
                          : "text-purple-700"
                        : isDark
                        ? "text-[#cfc2d8]"
                        : "text-slate-600"
                    }`}
                  >
                    {cat.categoryName}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. MENU SECTIONS */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-28 rounded-2xl border animate-pulse ${
                  isDark ? "bg-[#1e2021] border-[#333536]" : "bg-white border-slate-200"
                }`}
              />
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
              <section id={`cat-${cat.id}`} key={cat.id} className="scroll-mt-36 space-y-4 py-2">
                {/* Section Header */}
                <div className={`flex justify-between items-end border-b pb-2 ${isDark ? "border-[#333536]/30" : "border-slate-200"}`}>
                  <div>
                    <h2 className={`text-xl font-extrabold flex items-center gap-2 ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                      <Star className={`w-5 h-5 ${isDark ? "text-[#dcb8ff]" : "text-purple-600"}`} />
                      <span>{cat.categoryName}</span>
                    </h2>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>Chef's special curated selection</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                      isDark
                        ? "text-[#cfc2d8] bg-[#1e2021] border-[#333536]"
                        : "text-slate-600 bg-white border-slate-200"
                    }`}
                  >
                    {filteredMenus.length} {filteredMenus.length === 1 ? "ITEM" : "ITEMS"}
                  </span>
                </div>

                {/* Grid of Dishes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMenus.map((item) => {
                    const hasDiscount = item.discountPrice && parseFloat(item.discountPrice) < parseFloat(item.price);
                    const dishImg = getItemImageUrl(item);

                    const itemCartEntries = Object.values(cart).filter((c) => c.id === item.id);
                    const totalItemQty = itemCartEntries.reduce((sum, c) => sum + c.quantity, 0);

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl p-4 flex gap-4 items-center transition-all ${
                          isDark
                            ? totalItemQty > 0
                              ? "glass-card-dark border-[#9d34ff]/40 active-glow"
                              : "glass-card-dark border-[#1c1c1e]"
                            : totalItemQty > 0
                            ? "bg-white border-2 border-purple-600 shadow-md"
                            : "bg-white border border-slate-200 shadow-xs"
                        }`}
                      >
                        {/* Food Image Thumbnail */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-24 h-24 rounded-xl overflow-hidden ${isDark ? "bg-[#282a2b]" : "bg-slate-100 border border-slate-200"}`}>
                            <img
                              src={dishImg}
                              alt={item.itemName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            {item.foodType === "VEG" ? (
                              <span className="w-3.5 h-3.5 rounded-xs border border-emerald-500 flex items-center justify-center flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-xs border border-rose-500 flex items-center justify-center flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              </span>
                            )}
                            <h3 className={`font-bold text-base truncate leading-snug ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                              {item.itemName}
                            </h3>
                          </div>

                          {item.description && (
                            <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                              {item.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center pt-1">
                            <div className="flex items-baseline space-x-1.5">
                              <span className={`font-extrabold text-lg ${isDark ? "text-[#dcb8ff]" : "text-slate-900"}`}>
                                ₹{item.discountPrice ? item.discountPrice : item.price}
                              </span>
                              {hasDiscount && (
                                <span className={`text-xs line-through font-normal ${isDark ? "text-[#cfc2d8]/60" : "text-slate-400"}`}>
                                  ₹{item.price}
                                </span>
                              )}
                            </div>

                            {/* + ADD / Quantity Actions */}
                            <div>
                              {totalItemQty > 0 ? (
                                <div className={`flex items-center text-white rounded-lg overflow-hidden font-bold shadow-lg ${isDark ? "bg-[#9d34ff] shadow-[#9d34ff]/20" : "bg-purple-600 shadow-purple-600/20"}`}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const lastEntry = itemCartEntries[itemCartEntries.length - 1];
                                      if (lastEntry) removeFromCart(lastEntry.cartKey);
                                    }}
                                    className="w-8 h-9 flex items-center justify-center hover:bg-black/20 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-7 text-center text-xs font-black">{totalItemQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomization(item)}
                                    className="w-8 h-9 flex items-center justify-center hover:bg-black/20 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCustomization(item)}
                                  className={`px-5 py-2 text-white rounded-lg font-bold text-xs transition-all active:scale-95 shadow-lg ${
                                    isDark
                                      ? "bg-[#9d34ff] hover:bg-[#8806ea] shadow-[#9d34ff]/20"
                                      : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                                  }`}
                                >
                                  + ADD
                                </button>
                              )}
                            </div>
                          </div>
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

      {/* 6. FLOATING CART BAR */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-0 w-full px-4 z-50">
          <div className="max-w-4xl mx-auto">
            <div
              className={`rounded-2xl p-4 flex justify-between items-center shadow-2xl border ${
                isDark
                  ? "bg-[#0A0A0B] border-[#1C1C1E] shadow-[0_-8px_24px_rgba(157,52,255,0.25)]"
                  : "bg-slate-950 text-white border-slate-800"
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#cfc2d8]" : "text-purple-300"}`}>
                  {cartTotalCount} {cartTotalCount === 1 ? "ITEM" : "ITEMS"}
                </span>
                <span className="text-xl font-black text-white">
                  ₹{cartTotalPrice.toFixed(2)}{" "}
                  <span className={`text-xs font-normal ml-1 ${isDark ? "text-[#cfc2d8]" : "text-slate-400"}`}>plus taxes</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 text-white shadow-lg ${
                  isDark
                    ? "bg-[#9d34ff] hover:bg-[#8806ea] shadow-[#9d34ff]/30"
                    : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                }`}
              >
                <span>View Cart ({cartTotalCount})</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CUSTOMIZATION BOTTOM SHEET (Variants & Addons) */}
      <AnimatePresence>
        {selectedMenuItemForCustomization && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMenuItemForCustomization(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
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
              className={`relative w-full max-w-lg rounded-t-[32px] p-6 shadow-2xl border-t space-y-5 z-10 max-h-[85vh] overflow-y-auto ${
                isDark
                  ? "bg-[#121415] border-[#1c1c1e] text-[#e2e2e3]"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Drag Handle Bar */}
              <div className={`w-12 h-1.5 rounded-full mx-auto -mt-2 mb-2 cursor-grab ${isDark ? "bg-[#333536]" : "bg-slate-300"}`} />

              <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-[#1c1c1e]" : "border-slate-200"}`}>
                <div>
                  <h3 className={`font-extrabold text-lg leading-snug ${isDark ? "text-[#e2e2e3]" : "text-slate-900"}`}>
                    {selectedMenuItemForCustomization.itemName}
                  </h3>
                  <span className={`text-xs font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                    Customise portion & add-ons
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMenuItemForCustomization(null)}
                  className={`p-1.5 rounded-xl ${isDark ? "bg-[#1e2021] text-[#cfc2d8]" : "bg-slate-100 text-slate-600"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Variants Option Selection */}
              {selectedMenuItemForCustomization.variants && selectedMenuItemForCustomization.variants.length > 0 && (
                <div className="space-y-2">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-[#cfc2d8]" : "text-slate-700"}`}>
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
                            ? isDark
                              ? "bg-[#9d34ff] text-white border-[#9d34ff] font-black shadow-md"
                              : "bg-purple-600 text-white border-purple-600 font-black shadow-md"
                            : isDark
                            ? "bg-[#1e2021] text-[#e2e2e3] border-[#333536] hover:border-[#9d34ff]"
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
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${isDark ? "text-[#cfc2d8]" : "text-slate-700"}`}>
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
                              ? isDark
                                ? "bg-[#9d34ff]/20 text-[#dcb8ff] border-[#9d34ff] font-black"
                                : "bg-purple-50 text-purple-900 border-purple-300 font-black"
                              : isDark
                              ? "bg-[#1e2021] text-[#e2e2e3] border-[#333536] hover:border-[#9d34ff]"
                              : "bg-slate-50 text-slate-800 border-slate-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? (isDark ? "bg-[#9d34ff] border-[#9d34ff] text-white" : "bg-purple-600 border-purple-600 text-white") : "border-slate-300 bg-white"}`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span>{addon.addonName}</span>
                          </div>
                          <span className={`font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>+₹{parseFloat(addon.price).toFixed(2)}</span>
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
                    className={`w-full py-4 rounded-2xl text-white font-black text-base shadow-xl flex items-center justify-between px-6 transition-all active:scale-98 ${
                      isDark ? "bg-[#9d34ff] hover:bg-[#8806ea]" : "bg-purple-600 hover:bg-purple-700"
                    }`}
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

      {/* 8. SWIPEABLE QUICK CART SLIDE-UP SHEET */}
      <AnimatePresence>
        {isCartDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
            />

            {/* Swipeable Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) {
                  setIsCartDrawerOpen(false);
                }
              }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={`relative w-full max-w-lg rounded-t-[32px] p-6 shadow-2xl border-t space-y-4 z-10 max-h-[85vh] flex flex-col justify-between ${
                isDark
                  ? "bg-[#121415] border-[#1c1c1e] text-[#e2e2e3]"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Drag Handle Bar */}
              <div className={`w-12 h-1.5 rounded-full mx-auto -mt-2 cursor-grab ${isDark ? "bg-[#333536]" : "bg-slate-300"}`} />

              {/* Sheet Header */}
              <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-[#1c1c1e]" : "border-slate-200"}`}>
                <div>
                  <h3 className={`font-extrabold text-lg leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                    Your Cart ({cartTotalCount} {cartTotalCount === 1 ? "item" : "items"})
                  </h3>
                  <span className={`text-xs font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                    Review items or adjust quantity
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className={`p-1.5 rounded-xl ${isDark ? "bg-[#1e2021] text-[#cfc2d8]" : "bg-slate-100 text-slate-600"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
                {cartItemsArray.map((item) => (
                  <div
                    key={item.cartKey}
                    className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border ${
                      isDark ? "bg-[#1e2021] border-[#333536]" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200/40 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <p className={`text-[11px] font-bold ${isDark ? "text-[#dcb8ff]" : "text-purple-700"}`}>
                          Portion: {item.variantName}
                        </p>
                      )}
                      {item.selectedAddons && (
                        <p className={`text-[10px] truncate ${isDark ? "text-[#cfc2d8]" : "text-slate-500"}`}>
                          {item.selectedAddons}
                        </p>
                      )}
                      <p className={`text-xs font-extrabold mt-0.5 ${isDark ? "text-[#dcb8ff]" : "text-slate-900"}`}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div
                        className={`flex items-center rounded-lg overflow-hidden font-bold border ${
                          isDark ? "bg-[#121415] border-[#4d4355]" : "bg-white border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartKey)}
                          className="w-7 h-8 flex items-center justify-center text-xs hover:bg-black/10"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementCartItemByKey(item.cartKey)}
                          className="w-7 h-8 flex items-center justify-center text-xs hover:bg-black/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteCartItemCompletely(item.cartKey)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Remove dish completely"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Checkout Action */}
              <div className={`pt-3 border-t space-y-3 ${isDark ? "border-[#1c1c1e]" : "border-slate-200"}`}>
                <div className="flex justify-between items-baseline font-black text-base">
                  <span className={isDark ? "text-[#cfc2d8]" : "text-slate-700"}>Grand Total:</span>
                  <span className={`text-xl ${isDark ? "text-[#dcb8ff]" : "text-purple-900"}`}>
                    ₹{cartTotalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className={`px-4 py-3.5 rounded-2xl font-bold text-xs border ${
                      isDark ? "bg-[#1e2021] border-[#333536] text-[#cfc2d8]" : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    Add More Items
                  </button>

                  <Link
                    href="/restaurant/checkout"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className={`flex-1 py-3.5 rounded-2xl text-white font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 ${
                      isDark ? "bg-[#9d34ff] hover:bg-[#8806ea]" : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
