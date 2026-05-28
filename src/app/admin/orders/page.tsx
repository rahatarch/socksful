"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Truck,
  Eye,
  User,
  MapPin,
  CreditCard,
  Package,
  CircleDollarSign,
  Loader2,
} from "lucide-react";

// TypeScript interface for Order, based on current data shape
interface Order {
  _id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  payment: {
    method: string;
    provider: string;
    sender: string;
    transactionId: string;
  };
  status: "Pending" | "Confirmed" | "Delivered" | "Canceled";
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ফিল্টার লিস্ট আপডেট করা হয়েছে
  const filters = ["All", "Pending", "Confirmed", "Delivered", "Canceled"];

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      // error intentionally ignored
    } finally {
      // console.error("Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ডাটাবেজে স্ট্যাটাস আপডেট করার আসল লজিক
  const updateOrderStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // রিয়েল টাইম UI আপডেট
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, status: newStatus } : order,
          ),
        );
        if (selectedOrder?._id === id) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus } : prev,
          );
        }
      } else {
        alert("Failed to update status in database.");
      }
    } catch {
      // error intentionally ignored
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) => activeFilter === "All" || o.status === activeFilter,
    );
  }, [orders, activeFilter]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            Syncing Orders...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 text-left font-jakarta relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 text-left">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">
            Orders
          </h1>
          <p className="text-gray-400 font-medium">
            Manage and verify customer purchases.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeFilter === f ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Responsive Table + Card: mobile card, tablet/pc table */}
      <div className="bg-white rounded-[20px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden text-left">
        {/* Desktop/Tablet Table */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Order & Customer
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Payment
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-6 py-6">
                    <p className="font-bold text-black text-sm">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      ID: #SF-{order._id.slice(-6)}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-brand">
                        {order.totalAmount}BDT
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-gray-100 rounded text-gray-500 font-bold uppercase">
                        {order.payment.provider}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-gray-400 mt-1 uppercase">
                      Trx: {order.payment.transactionId}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === "Pending"
                          ? "bg-orange-50 text-orange-500"
                          : order.status === "Confirmed"
                            ? "bg-blue-50 text-blue-600"
                            : order.status === "Delivered"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, "Confirmed")
                            }
                            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, "Canceled")
                            }
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {order.status === "Confirmed" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "Delivered")
                          }
                          className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Truck size={14} /> Deliver
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-300 hover:text-black transition-all cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col gap-4 p-1.5">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-50 rounded-[18px] p-4 border border-gray-100 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <span className="font-bold text-black text-base">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                  <div className="text-[10px] text-gray-400 uppercase mt-0.5 font-bold">
                    ID: #SF-{order._id.slice(-6)}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    order.status === "Pending"
                      ? "bg-orange-50 text-orange-500"
                      : order.status === "Confirmed"
                        ? "bg-blue-50 text-blue-600"
                        : order.status === "Delivered"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-black text-brand text-sm">
                  {order.totalAmount}BDT
                </span>
                <span className="text-[9px] bg-gray-100 text-gray-500 rounded px-2 py-0.5 font-bold uppercase">
                  {order.payment.provider}
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">
                  Trx: {order.payment.transactionId}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-2 flex-col xs:flex-row">
                {order.status === "Pending" && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order._id, "Confirmed")}
                      className="flex-1 px-2 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
                    >
                      <Check size={16} /> Confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, "Canceled")}
                      className="flex-1 px-2 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </>
                )}
                {order.status === "Confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "Delivered")}
                    className="flex-1 px-2 py-2 bg-black text-white rounded-xl text-xs font-black uppercase hover:bg-brand transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Truck size={14} /> Deliver
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 px-2 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs flex items-center gap-2 hover:text-black transition-all cursor-pointer justify-center"
                >
                  <Eye size={15} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-xs sm:max-w-md md:max-w-lg xl:max-w-2xl h-fit max-h-[95vh] bg-white rounded-[20px] md:rounded-[36px] xl:rounded-[40px] shadow-2xl z-[101] overflow-hidden flex flex-col p-4 sm:p-6 md:p-10 font-jakarta text-left"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-black tracking-tight">
                    Order Details
                  </h2>
                  <p className="text-[10px] font-bold text-brand uppercase tracking-widest mt-1">
                    Order #SF-{selectedOrder._id.slice(-6)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto no-scrollbar space-y-6 pr-2 text-left">
                <div className="flex gap-2 mb-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      selectedOrder.status === "Pending"
                        ? "bg-orange-50 text-orange-500"
                        : selectedOrder.status === "Confirmed"
                          ? "bg-blue-50 text-blue-600"
                          : selectedOrder.status === "Delivered"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <User size={14} /> Customer
                    </h3>
                    <p className="font-bold text-black">
                      {selectedOrder.customer.firstName}{" "}
                      {selectedOrder.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-500 font-medium italic">
                      {selectedOrder.customer.email}
                    </p>
                    <p className="text-sm text-gray-500 font-bold">
                      {selectedOrder.customer.phone}
                    </p>
                  </div>
                  <div className="space-y-3 text-left">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <MapPin size={14} /> Shipping Address
                    </h3>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                      {selectedOrder.customer.address}, <br />{" "}
                      {selectedOrder.customer.city},{" "}
                      {selectedOrder.customer.district}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-brand/5 rounded-3xl border border-brand/10 space-y-3 text-left">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand flex items-center gap-2">
                      <CreditCard size={14} />{" "}
                      {selectedOrder.payment.method === "cod"
                        ? "Advance Payment"
                        : "Payment Details"}
                    </h3>
                    <div className="text-sm space-y-2">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Method
                        </p>
                        <p className="font-bold text-black">
                          {selectedOrder.payment.method.toUpperCase()} (
                          {selectedOrder.payment.provider})
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Sender Number
                        </p>
                        <p className="font-bold text-black">
                          {selectedOrder.payment.sender}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Trx ID
                        </p>
                        <p className="font-mono font-bold text-brand">
                          {selectedOrder.payment.transactionId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-3 text-left">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <CircleDollarSign size={14} /> Payment Status
                    </h3>
                    {selectedOrder.payment.method === "cod" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-green-600">
                          <span className="text-xs font-bold">
                            Advance Paid
                          </span>
                          <span className="text-sm font-bold tracking-tighter">
                            120BDT
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-2 text-red-500">
                          <span className="text-xs font-bold">Cash Due</span>
                          <span className="text-sm font-black tracking-tighter">
                            {selectedOrder.totalAmount - 120}BDT
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full pb-2">
                        <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                          Fully Paid
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Package size={14} /> Items Ordered
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl"
                      >
                        <p className="font-bold text-sm text-black">
                          {item.name}{" "}
                          <span className="text-gray-400 font-normal">
                            x{item.quantity}
                          </span>
                        </p>
                        <p className="text-sm font-black text-black">
                          {item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center text-left">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">
                  Total Bill
                </span>
                <span className="text-2xl font-black text-black">
                  {selectedOrder.totalAmount}BDT
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
