"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function OrderSuccessPage() {
  return (
    <main className="bg-white min-h-screen font-jakarta">
      <Navbar />

      <div className="pt-20 sm:pt-32 md:pt-40 pb-8 md:pb-20 px-2 sm:px-4 md:px-6 flex flex-col items-center justify-center text-center">
        {/* এনিমেটেড সাকসেস আইকন */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 sm:mb-8"
        >
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </motion.div>

        {/* সাকসেস মেসেজ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl"
        >
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-black mb-4 sm:mb-6 tracking-tight">
            Order{" "}
            <span className="font-instrument italic font-normal text-brand">
              Received!
            </span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg md:text-xl font-medium mb-8 sm:mb-10 leading-relaxed">
            Thank you for choosing SocksFul. Your order has been placed
            successfully. We will verify your Transaction ID and confirm your
            order within a few hours.
          </p>

          {/* ইনফরমেশন কার্ড */}
          <div className="bg-[#fafafa] p-4 sm:p-6 md:p-8 rounded-[18px] sm:rounded-[26px] md:rounded-[32px] border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left mb-6 sm:mb-8 md:mb-12">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 text-brand">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Order Status
                </p>
                <p className="text-sm font-bold text-black">
                  Pending Verification
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 text-brand">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Delivery
                </p>
                <p className="text-sm font-bold text-black">
                  Estimated 2-3 Days
                </p>
              </div>
            </div>
          </div>

          {/* বাটনসমূহ */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-black text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-brand transition-all shadow-lg active:scale-95 cursor-pointer">
                Back to Home
              </button>
            </Link>
            <Link href="/collections" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-4 text-black font-bold text-xs sm:text-sm uppercase tracking-widest hover:gap-4 transition-all">
                Continue Shopping
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
