"use client";
import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Banknote,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const filtered = orders.filter((order) => {
      if (!startDate && !endDate) return true;
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      const start = startDate || "1970-01-01";
      const end = endDate || "9999-12-31";
      return orderDate >= start && orderDate <= end;
    });

    const counts = {
      totalSell: filtered.filter((o) => o.status !== "Canceled").length,
      income: filtered
        .filter((o) => o.status !== "Canceled")
        .reduce((sum, o) => sum + parseInt(String(o.totalAmount || 0).replace("BDT", "")), 0),
      pending: filtered.filter((o) => o.status === "Pending").length,
      confirmed: filtered.filter((o) => o.status === "Confirmed").length,
      delivered: filtered.filter((o) => o.status === "Delivered").length,
      canceled: filtered.filter((o) => o.status === "Canceled").length,
    };

    return [
      { name: "Total Sell", value: counts.totalSell, icon: <TrendingUp />, color: "bg-blue-50 text-blue-600" },
      { name: "Total Income", value: `${counts.income.toLocaleString()}BDT`, icon: <Banknote />, color: "bg-green-50 text-green-600" },
      { name: "Pending", value: counts.pending, icon: <Clock />, color: "bg-orange-50 text-orange-600" },
      { name: "Confirmed", value: counts.confirmed, icon: <CheckCircle2 />, color: "bg-purple-50 text-purple-600" },
      { name: "Delivered", value: counts.delivered, icon: <Truck />, color: "bg-emerald-50 text-emerald-600" },
      { name: "Canceled", value: counts.canceled, icon: <XCircle />, color: "bg-red-50 text-red-600" },
    ];
  }, [orders, startDate, endDate]);

  const handleApplyFilter = () => {
    fetchStats();
  };

  return (
    <div className="p-6 md:p-10 text-left font-jakarta relative" suppressHydrationWarning>
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updating Stats...</p>
        </div>
      )}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Business Overview
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            Real-time performance of SocksFul.
          </p>
        </div>

        {/* ডেট রেঞ্জ ফিল্টার বক্স */}
        <div className="bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3">
            <Calendar size={16} className="text-gray-400" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-bold bg-transparent outline-none cursor-pointer hover:text-brand transition-colors"
              />
              <span className="text-gray-300 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-bold bg-transparent outline-none cursor-pointer hover:text-brand transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleApplyFilter}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand transition-all active:scale-95 cursor-pointer shadow-lg shadow-black/5"
          >
            <Filter size={12} />
            Apply Filter
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((s) => (
          <div
            key={s.name}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            suppressHydrationWarning
          >
            <div
              className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
            >
              {s.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              {s.name}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-black mt-1">
              {s.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
