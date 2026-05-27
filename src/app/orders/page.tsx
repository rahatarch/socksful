"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("socksful-user");
    if (!savedUser) {
      router.push("/auth");
      return;
    }
    const user = JSON.parse(savedUser);

    const fetchUserOrders = async () => {
      try {
        const res = await fetch(
          `/api/orders?email=${encodeURIComponent(user.email)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (data.success) setOrders(data.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [router]);

  if (!mounted) return null;

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white font-jakarta">
        <Loader2 className="animate-spin text-brand" size={40} />
      </div>
    );

  return (
    <main className="bg-[#fafafa] min-h-screen font-jakarta text-left text-left">
      <Navbar />
      <div className="max-w-[1000px] mx-auto px-6 pt-32 md:pt-40 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
            Order{" "}
            <span className="font-instrument italic font-normal text-brand transition-colors">
              History
            </span>
          </h1>
          <p className="text-gray-500 font-medium">
            Track your premium comfort orders in real-time.
          </p>
        </header>

        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-brand shrink-0">
                      <Package size={26} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-black mb-1 uppercase text-left">
                        Order #SF-{order._id.slice(-6)}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                        <span>&bull;</span>
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                    <div className="text-left md:text-right text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Total Bill
                      </p>
                      <p className="text-xl font-black text-black">
                        {order.totalAmount}BDT
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                        order.status === "Delivered"
                          ? "bg-green-50 text-green-600"
                          : order.status === "Pending"
                            ? "bg-orange-50 text-orange-500"
                            : order.status === "Confirmed"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-red-50 text-red-500"
                      }`}
                    >
                      {order.status === "Delivered" ? (
                        <CheckCircle2 size={12} />
                      ) : order.status === "Canceled" ? (
                        <AlertCircle size={12} />
                      ) : (
                        <Truck size={12} />
                      )}
                      {order.status}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50 text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 text-left">
                    Items in this order
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item: any, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase"
                      >
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
              <Package className="mx-auto mb-4 text-gray-300" size={32} />
              <p className="text-gray-400 font-medium italic text-center">
                You haven&apos;t placed any orders yet.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
