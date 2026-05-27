"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ShopPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="z-10 max-w-4xl">
          <motion.span className="text-brand font-bold tracking-[0.3em] uppercase text-xs mb-6 block transition-colors duration-500">
            Exciting things ahead
          </motion.span>
          <motion.h1 className="text-5xl md:text-8xl font-bold tracking-tight text-black leading-tight">
            Physical Shop <br />
            <span className="font-instrument italic font-normal text-brand underline decoration-1 underline-offset-8 transition-colors duration-500">
              Coming Soon
            </span>
          </motion.h1>
          <div className="mt-12">
            <Link href="/">
              <button className="group relative inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold text-sm tracking-widest transition-all hover:bg-brand active:scale-95">
                <ArrowLeft size={18} /> Return to Home
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
