"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function GiftSetsPage() {
  const [activeCategory, setActiveCategory] = useState("All Sets");
  const [categories, setCategories] = useState<string[]>(["All Sets"]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching both products and gift-set specific categories
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories?type=gift-sets", { cache: "no-store" }),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) {
          // Map MongoDB _id to id for component compatibility
          setAllProducts(prodData.data.map((p: any) => ({ ...p, id: p._id })));
        }

        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (error) {
        console.error("Failed to load gift sets data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSets = useMemo(() => {
    // Filter to show only items meant for the gift-sets section
    let filtered = allProducts.filter((p) => p.showIn === "gift-sets");

    if (activeCategory !== "All Sets") {
      filtered = filtered.filter((s) => s.category === activeCategory);
    }
    return filtered;
  }, [activeCategory, allProducts]);

  if (loading) {
    return (
      <main className="bg-white min-h-screen font-jakarta">
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-24 md:pt-32 pb-40 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Loading Gift Experiences...
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-24 md:pt-32 pb-20 font-jakarta">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Side Navigation - Dynamic from Database */}
          <aside className="w-full lg:w-64 shrink-0">
            <h2 className="hidden lg:block text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8 px-2">
              Gift Occasions
            </h2>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[12px] md:text-[13px] font-bold text-left transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    activeCategory === cat
                      ? "bg-brand text-white shadow-lg shadow-brand/20 lg:translate-x-1"
                      : "bg-gray-50 lg:bg-transparent text-gray-500 hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content Grid */}
          <div className="flex-1 text-left">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8 md:mb-12 px-2 gap-4">
              <motion.h1
                key={activeCategory}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-5xl font-bold tracking-tight text-black leading-tight"
              >
                {activeCategory}{" "}
                <span className="font-instrument italic font-normal text-brand transition-colors">
                  Experience
                </span>
              </motion.h1>
              <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
                {filteredSets.length} Gift Sets
              </span>
            </div>

            <motion.div
              layout
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredSets.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="group bg-white p-4 md:p-5 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full active:scale-[0.98] lg:active:scale-100"
                  >
                    <div
                      className={`relative aspect-square ${s.color || "bg-gray-50"} rounded-[24px] md:rounded-[32px] mb-6 flex items-center justify-center overflow-hidden`}
                    >
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <span className="text-gray-200/40 text-7xl md:text-[80px] font-instrument italic group-hover:scale-110 transition-transform duration-700 select-none">
                          BOX
                        </span>
                      )}
                      {s.tag && s.tag !== "" && (
                        <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-black shadow-sm italic">
                          {s.tag}
                        </span>
                      )}
                    </div>

                    <div className="px-1 md:px-2 flex-grow">
                      <h3 className="text-base md:text-lg font-bold mb-1 text-black group-hover:text-brand transition-colors duration-300">
                        {s.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-xl md:text-2xl font-bold tracking-tighter text-black">
                          {s.price}BDT
                        </span>
                        {s.oldPrice && s.oldPrice !== "" && (
                          <span className="text-sm text-gray-300 line-through decoration-red-400 font-medium">
                            {s.oldPrice}BDT
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/product/${s.id}`}
                      className="w-full bg-black text-white py-3.5 md:py-4 rounded-[16px] md:rounded-[20px] font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-brand active:bg-brand shadow-sm cursor-pointer text-center"
                    >
                      Send as Gift
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
