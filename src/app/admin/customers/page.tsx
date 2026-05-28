"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  ShieldAlert,
  ShieldCheck,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Loader2,
} from "lucide-react";

// Better TypeScript usage for customers
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  status: "Active" | "Banned";
  totalOrders: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // সার্চ লজিক
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [customers, searchQuery]);

  // ব্যান/আনব্যান লজিক (PATCH API কানেক্ট করা হয়েছে)
  const toggleBanStatus = async (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;

    // Ensure TypeScript knows this will match our "Active" | "Banned" type
    const newStatus: Customer["status"] =
      customer.status === "Active" ? "Banned" : "Active";

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              const updated: Customer = { ...c, status: newStatus };
              if (selectedCustomer?.id === id) setSelectedCustomer(updated);
              return updated;
            }
            return c;
          }),
        );
      }
    } catch (error) {
      console.error("Error updating customer status:", error);
    }
  };

  return (
    <div className="p-6 md:p-10 text-left font-jakarta relative">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Syncing Community...
          </p>
        </div>
      )}
      {/* হেডার */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Customers
          </h1>
          <p className="text-gray-400 font-medium">
            Manage your member community and accounts.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-gray-100 outline-none focus:border-brand transition-all shadow-sm font-medium"
          />
        </div>
      </header>

      {/* কাস্টমার টেবিল */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Customer Info
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Join Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                  Orders
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-black text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-600">
                      {c.joined}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">
                      {c.totalOrders}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        c.status === "Active"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-2 text-gray-300 hover:text-black transition-colors cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => toggleBanStatus(c.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          c.status === "Active"
                            ? "text-gray-300 hover:bg-red-50 hover:text-red-500"
                            : "text-red-500 bg-red-50 hover:bg-green-50 hover:text-green-600"
                        }`}
                        title={
                          c.status === "Active" ? "Ban User" : "Unban User"
                        }
                      >
                        {c.status === "Active" ? (
                          <ShieldAlert size={18} />
                        ) : (
                          <ShieldCheck size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CUSTOMER DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-[40px] shadow-2xl z-[101] p-10 font-jakarta text-left"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                  <User size={32} />
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-black leading-tight">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-sm font-bold text-brand uppercase tracking-widest mt-1">
                    Member ID: {selectedCustomer.id}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none">
                        Email Address
                      </p>
                      <p className="font-bold text-gray-700 text-sm mt-1">
                        {selectedCustomer.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none">
                        Phone Number
                      </p>
                      <p className="font-bold text-gray-700 text-sm mt-1">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none">
                        Joined On
                      </p>
                      <p className="font-bold text-gray-700 text-sm mt-1">
                        {selectedCustomer.joined}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter leading-none">
                        Activity
                      </p>
                      <p className="font-bold text-gray-700 text-sm mt-1">
                        {selectedCustomer.totalOrders} Successful Orders
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => toggleBanStatus(selectedCustomer.id)}
                    className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 cursor-pointer ${
                      selectedCustomer.status === "Active"
                        ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                        : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    {selectedCustomer.status === "Active"
                      ? "Restrict Account"
                      : "Lift Restriction"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
