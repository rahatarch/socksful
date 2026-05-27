"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ExternalLink,
  LogOut,
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
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex font-jakarta">
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
