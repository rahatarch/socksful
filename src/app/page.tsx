import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Quote from "@/components/sections/Quote";
import PremiumProducts from "@/components/sections/PremiumProducts";
import AboutUs from "@/components/sections/AboutUs";
import Footer from "@/components/layout/Footer";

export default function Home() {
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
