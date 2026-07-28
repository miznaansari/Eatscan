"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Flame, Sparkles, Clock, CheckCircle2, ChevronRight, X, Volume2, Utensils } from "lucide-react";

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

  // Cart state stored in localStorage
  const [cart, setCart] = useState({});
  const [showSplash, setShowSplash] = useState(true);
  const [splashCountdown, setSplashCountdown] = useState(3);

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

    async function fetchMenu() {
      try {
        const res = await fetch(`/api/restaurant/menu?slug=${restaurantSlug}`);
        const data = await res.json();
        if (data.success) {
          setRestaurant(data.restaurant);
          setCategories(data.categories || []);
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
          setShowSplash(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSplash]);

  // Cart Helper functions
  const addToCart = (item) => {
    const newCart = { ...cart };
    if (newCart[item.id]) {
      newCart[item.id].quantity += 1;
    } else {
      newCart[item.id] = {
        id: item.id,
        name: item.itemName,
        price: item.discountPrice ? parseFloat(item.discountPrice) : parseFloat(item.price),
        quantity: 1,
        imageUrl: item.imageUrl,
        foodType: item.foodType,
      };
    }
    setCart(newCart);
    localStorage.setItem("eatscan_cart", JSON.stringify(newCart));
  };

  const removeFromCart = (itemId) => {
    const newCart = { ...cart };
    if (newCart[itemId]) {
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
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
            onClick={() => setShowSplash(false)}
            className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center space-x-1"
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
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3 sm:py-4 shadow-lg backdrop-blur-2xl">
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

                        {qty > 0 ? (
                          <div className="mt-2 flex items-center space-x-2 px-3 py-1 rounded-xl btn-purple text-white text-xs font-black shadow-md">
                            <button onClick={() => removeFromCart(item.id)} className="px-1 text-base font-bold">-</button>
                            <span>{qty}</span>
                            <button onClick={() => addToCart(item)} className="px-1 text-base font-bold">+</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="mt-2 px-5 py-1.5 rounded-xl btn-purple text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all uppercase"
                          >
                            + Add
                          </button>
                        )}
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
    </div>
  );
}
