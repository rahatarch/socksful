"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((acc, item) => {
    const price = parseInt(item.price.replace("BDT", ""));
    return acc + price * item.quantity;
  }, 0);

  // চেকআউট লজিক: লগইন চেক করা
  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // লোকাল স্টোরেজ থেকে ইউজার সেশন চেক করা (পরবর্তীতে এটি NextAuth দিয়ে রিপ্লেস হবে)
    const userSession = localStorage.getItem("socksful-user");

    if (!userSession) {
      // যদি লগইন না থাকে, তবে অ্যাকাউন্ট পেজে পাঠানো হবে
      router.push("/auth");
      toggleCart(); // কার্ট বন্ধ করে দেওয়া
    } else {
      // লগইন থাকলে চেকআউট পেজে যাবে
      router.push("/checkout");
      toggleCart();
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ব্যাকড্রপ ব্লার */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* কার্ট প্যানেল */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col font-jakarta"
          >
            {/* হেডার */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-brand" />
                <h2 className="text-xl font-bold text-black tracking-tight text-left">
                  Your Bag
                </h2>
                <span className="bg-brand/10 text-brand text-[10px] font-black px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* আইটেম লিস্ট */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-gray-400 font-medium">
                    Your bag is empty.
                  </p>
                  <button
                    onClick={toggleCart}
                    className="mt-4 text-brand font-bold text-sm underline cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 group animate-in fade-in slide-in-from-right-4 duration-300 text-left"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-gray-300 font-bold text-xs uppercase">
                        SF
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-bold text-black text-sm">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-brand font-bold text-sm mb-3">
                        {item.price}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center font-bold hover:text-brand cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center font-bold hover:text-brand cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ফুটার/চেকআউট */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                <div className="flex justify-between items-center text-left">
                  <span className="text-gray-500 font-medium text-sm">
                    Subtotal
                  </span>
                  <span className="text-xl font-black text-black">
                    {subtotal}BDT
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center">
                  Account required to process order
                </p>

                {/* নতুন গেটকিপিং বাটন */}
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand transition-all shadow-xl active:scale-[0.98] cursor-pointer"
                >
                  Checkout Now
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
