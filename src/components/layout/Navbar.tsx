"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  X,
  Menu,
  User,
  LogOut,
  Package,
  Loader2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";

const colors = [
  { name: "Blue", value: "#2563eb" },
  { name: "Bronze", value: "#854d0e" },
  { name: "Sage", value: "#15803d" },
  { name: "Lavender", value: "#7c3aed" },
  { name: "Amber", value: "#d97706" },
];

interface NavbarUser {
  name: string;
  email: string;
}

interface SearchProduct {
  name: string;
  showIn?: string;
}

const isNavbarUser = (value: unknown): value is NavbarUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<NavbarUser>;
  return typeof user.name === "string" && typeof user.email === "string";
};

export default function Navbar() {
  const [activeColor, setActiveColor] = useState("#2563eb");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<NavbarUser | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // ইউজার এবং কালার থিম লোড করা
  useEffect(() => {
    const savedColor = localStorage.getItem("socksful-color");
    if (savedColor) {
      setActiveColor(savedColor);
      document.documentElement.style.setProperty("--brand-color", savedColor);
    }

    const savedUser = localStorage.getItem("socksful-user");
    if (savedUser) {
      try {
        const parsedUser: unknown = JSON.parse(savedUser);
        setUser(isNavbarUser(parsedUser) ? parsedUser : null);
      } catch {
        localStorage.removeItem("socksful-user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]); // পেজ চেঞ্জ হলে ইউজার স্ট্যাটাস চেক করবে

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    document.documentElement.style.setProperty("--brand-color", color);
    localStorage.setItem("socksful-color", color);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("socksful-user");
      setUser(null);
      setIsAccountOpen(false);
      setIsMenuOpen(false);
      router.push("/");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const res = await fetch("/api/products");
      const data: { success?: boolean; data?: SearchProduct[] } =
        await res.json();

      if (data.success && Array.isArray(data.data)) {
        const query = searchQuery.toLowerCase();
        const matchedProduct = data.data.find((p) =>
          p.name.toLowerCase().includes(query),
        );

        if (matchedProduct) {
          const destination =
            matchedProduct.showIn === "gift-sets"
              ? "/gift-sets"
              : "/collections";
          router.push(`${destination}?q=${encodeURIComponent(searchQuery)}`);
        } else {
          router.push(`/collections?q=${encodeURIComponent(searchQuery)}`);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      router.push(`/collections?q=${encodeURIComponent(searchQuery)}`);
    } finally {
      setIsSearching(false);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "Gift Sets", href: "/gift-sets" },
    { name: "Our Story", href: "/our-story" },
    { name: "Help", href: "/help" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 transition-all">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 md:px-8 lg:px-12 h-14 sm:h-16 md:h-20 flex items-center justify-between text-black relative min-w-0">
        {/* লোগো ও থিম সুইচার */}
        {!isSearchOpen && (
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-12 shrink-0 min-w-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1 hover:text-brand transition-colors cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden lg:flex items-center gap-4">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleColorChange(c.value)}
                  className={`w-4 h-4 rounded-[4px] cursor-pointer transition-transform hover:scale-110 ${activeColor === c.value ? "ring-2 ring-offset-2 ring-brand" : ""}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>

            <Link
              href="/"
              onClick={() => {
                if (pathname === "/")
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[20px] md:text-[24px] font-serif italic font-bold tracking-tighter text-brand transition-all active:scale-95 select-none"
            >
              SocksFul
            </Link>
          </div>
        )}

        {/* নেভিগেশন লিঙ্কসমূহ */}
        {!isSearchOpen && (
          <div className="hidden lg:flex items-center gap-6 xl:gap-10 px-3 sm:px-6 md:px-8 lg:px-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] font-bold uppercase tracking-[0.12em] transition-all hover:text-brand ${pathname === link.href ? "text-brand opacity-100" : "opacity-50"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* সার্চ বার */}
        {isSearchOpen ? (
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-4 px-2 md:px-10 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {isSearching ? (
              <Loader2 size={20} className="animate-spin text-brand" />
            ) : (
              <Search size={20} className="text-brand" />
            )}
            <input
              autoFocus
              disabled={isSearching}
              type="text"
              placeholder="Search premium socks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-base md:text-lg font-medium placeholder:text-gray-300 disabled:opacity-50"
            />
            <button
              type="button"
              disabled={isSearching}
              onClick={() => setIsSearchOpen(false)}
              className="text-gray-400 hover:text-black cursor-pointer p-1 disabled:opacity-20"
            >
              <X size={20} />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8 shrink-0 min-w-0">
            {/* ডেক্সটপ অ্যাকাউন্ট বাটন */}
            <div className="relative">
              <button
                onClick={() =>
                  user ? setIsAccountOpen(!isAccountOpen) : router.push("/auth")
                }
                className={`p-1 hover:text-brand transition-colors cursor-pointer ${user ? "text-brand" : "text-black/70"}`}
              >
                <User size={22} strokeWidth={2.5} />
              </button>

              {/* অ্যাকাউন্ট ড্রপডাউন মেনু */}
              <AnimatePresence>
                {isAccountOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                        Account
                      </p>
                      <p className="text-sm font-bold text-black truncate">
                        {user.name}
                      </p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-bold"
                    >
                      <Package size={18} /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-500 transition-colors text-sm font-bold cursor-pointer"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-black/70 hover:text-brand transition-colors cursor-pointer p-1"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>

            <button
              onClick={toggleCart}
              className="relative cursor-pointer group p-1"
            >
              <ShoppingBag
                size={22}
                strokeWidth={2.5}
                className="text-black/70 group-hover:text-brand transition-all"
              />
              <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* মোবাইল মেনু ওভারলে */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-14 sm:top-16 left-0 w-full bg-white z-40 overflow-hidden px-2 sm:px-6 md:px-8 pt-4 sm:pt-6"
          >
            <div className="flex flex-col space-y-6">
              {/* মোবাইল ইউজার কার্ড */}
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                {user ? (
                  <div className="flex flex-col gap-4 text-left">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400">
                        Welcome Back
                      </p>
                      <h3 className="text-xl font-bold">{user.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex-1 bg-white border border-gray-200 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <Package size={16} /> My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="bg-red-50 text-red-500 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between"
                  >
                    <span className="text-lg font-bold">
                      Sign in to your account
                    </span>
                    <div className="w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                  </Link>
                )}
              </div>

              {/* কালার থিম */}
              <div className="pb-6 border-b border-gray-100 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">
                  Choose Theme
                </p>
                <div className="flex gap-4 ml-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleColorChange(c.value)}
                      className={`w-10 h-10 rounded-xl cursor-pointer ${activeColor === c.value ? "ring-2 ring-offset-2 ring-brand" : ""}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* লিঙ্কসমূহ */}
              <div className="flex flex-col space-y-4 text-left">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-3xl font-bold tracking-tight ${pathname === link.href ? "text-brand" : "text-black"}`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
