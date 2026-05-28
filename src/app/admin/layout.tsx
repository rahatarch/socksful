"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ExternalLink,
  LogOut,
  Settings2,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        // ক্লিয়ান্ট সাইড ডেটা রিমুভ করা
        localStorage.removeItem("socksful-user");
        router.push("/auth");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Orders", href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: "Products", href: "/admin/products", icon: <Package size={20} /> },
    { name: "Customers", href: "/admin/customers", icon: <Users size={20} /> },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings2 size={20} />,
    },
  ];

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex font-jakarta relative">
      {/* Mobile 3-dot menu button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-[999] bg-white shadow-lg p-2.5 rounded-2xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open admin menu"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {/* Sidebar PC */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen shrink-0 p-6">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-serif italic font-bold text-brand transition-colors duration-500">
            SocksFul
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
            Admin Control
          </p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                pathname === item.href
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              }`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-50 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-black rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
          >
            <ExternalLink size={14} /> Shop Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile Drawer */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed z-[998] inset-0 bg-black/30 backdrop-blur-sm block lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed z-[999] left-0 top-0 h-full w-64 bg-white shadow-2xl border-r border-gray-100 flex flex-col p-6 lg:hidden">
            <div className="mb-10 px-2 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif italic font-bold text-brand">
                  SocksFul
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                  Admin Control
                </p>
              </div>
              <button
                className="p-1.5 rounded-full hover:bg-gray-50 ml-2"
                aria-label="close"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width={22}
                  height={22}
                  stroke="#777"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${pathname === item.href ? "bg-brand text-white shadow shadow-brand/20" : "text-gray-500 hover:bg-gray-50 hover:text-black"}`}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </nav>
            <div className="pt-6 border-t border-gray-50 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-black rounded-2xl text-xs font-bold transition-all uppercase tracking-widest"
                onClick={() => setSidebarOpen(false)}
              >
                <ExternalLink size={14} /> Shop Website
              </Link>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest cursor-pointer"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content - mobile top padding for 3-dot button */}
      <main className="flex-1 overflow-x-hidden pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
