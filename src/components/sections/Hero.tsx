"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen bg-[#fafafa] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* ব্যাকগ্রাউন্ড ডাইনামিক ডিজাইন (Mesh Gradients) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* টপ-লেফট ব্লব */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-brand/5 blur-[120px] rounded-full transition-colors duration-1000"
        />
        {/* বটম-রাইট ব্লব */}
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[45vw] h-[45vw] bg-brand/10 blur-[100px] rounded-full transition-colors duration-1000"
        />
      </div>

      {/* মেইন কন্টেন্ট - z-index নিশ্চিত করা হয়েছে */}
      <div className="relative z-10">
        {/* মেইন হেডলাইন */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-7xl md:text-[120px] lg:text-[150px] font-bold tracking-tighter leading-[0.9] text-black"
        >
          SocksFul
        </motion.h1>

        {/* সাব-হেডলাইন */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-brand opacity-80 mt-6 md:mt-8 transition-colors duration-500 max-w-[280px] sm:max-w-none mx-auto"
        >
          Coloring every step you take.
        </motion.p>

        {/* বাটন */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 md:mt-14"
        >
          <Link href="/collections">
            <button className="bg-brand text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full text-base md:text-lg font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-all duration-500 cursor-pointer active:scale-95">
              Explore Collection
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
