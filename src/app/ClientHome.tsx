"use client";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Quote from "@/components/sections/Quote";
import PremiumProducts from "@/components/sections/PremiumProducts";
import AboutUs from "@/components/sections/AboutUs";
import Footer from "@/components/layout/Footer";

// Hero ke client side (no SSR) dynamic import korchi
const Hero = dynamic(() => import("@/components/sections/Hero"), { ssr: false });

export default function ClientHome() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Quote />
      <PremiumProducts />
      <AboutUs />
      <Footer />
    </main>
  );
}
