"use client";
import { useState, useMemo, Suspense, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SearchX, ArrowRight, Loader2 } from "lucide-react";
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

function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ekshathe product ar category fetch korchi efficiency-r jonno
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories?type=products", { cache: "no-store" }),
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
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedProducts = useMemo(() => {
    // Filter to show only items meant for the main products collection
    let filtered = allProducts.filter(
      (p) => p.showIn === "products" || !p.showIn,
    );

    if (query) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );
    } else if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    return filtered;
  }, [query, activeCategory, allProducts]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-24 md:pt-32 pb-40 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Curating Collection...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-24 md:pt-32 pb-20 font-jakarta text-left">
      <div className="flex flex-col gap-10">
        {/* Top Horizontal Filter - Ekhon database theke dynamic asche */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar border-b border-gray-100">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mr-4 shrink-0">
            Filter By
          </span>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (query) router.push("/collections");
                }}
                className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  activeCategory === cat && !query
                    ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105"
                    : "bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {displayedProducts.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-8 md:mb-12 px-2 gap-4">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black leading-tight">
                    {query ? `Results for "${query}"` : activeCategory}{" "}
                    <span className="font-instrument italic font-normal text-brand transition-colors">
                      Collection
                    </span>
                  </h1>
                  <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest">
                    {displayedProducts.length} items
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
                    {displayedProducts.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="group bg-white p-4 md:p-5 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full active:scale-[0.98] lg:active:scale-100"
                      >
                        <div
                          className={`relative aspect-square ${p.color || "bg-gray-50"} rounded-[24px] md:rounded-[32px] mb-6 flex items-center justify-center overflow-hidden`}
                        >
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <span className="text-gray-200/40 text-7xl md:text-[100px] font-instrument italic group-hover:scale-110 transition-transform duration-700 select-none">
                              SF
                            </span>
                          )}
                          {p.tag && p.tag !== "" && (
                            <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-black shadow-sm italic">
                              {p.tag}
                            </span>
                          )}
                        </div>
                        <div className="px-1 md:px-2 flex-grow">
                          <h3 className="text-base md:text-lg font-bold mb-1 text-gray-900 group-hover:text-brand transition-colors duration-300">
                            {p.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-xl md:text-2xl font-bold tracking-tighter text-black">
                              {p.price}BDT
                            </span>
                            {p.oldPrice && p.oldPrice !== "" && (
                              <span className="text-sm text-gray-300 line-through decoration-red-400 font-medium">
                                {p.oldPrice}BDT
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/product/${p.id}`}
                          className="w-full bg-black text-white py-3.5 md:py-4 rounded-[16px] md:rounded-[20px] font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all hover:bg-brand active:bg-brand shadow-sm cursor-pointer text-center"
                        >
                          Buy Now
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-4"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-[30px] md:rounded-[40px] flex items-center justify-center text-gray-300 mb-6 md:mb-8">
                  <SearchX size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-black mb-3 md:mb-4">
                  No results found
                </h2>
                <p className="text-gray-400 text-sm md:text-lg max-w-sm mb-10 md:mb-12 font-medium">
                  We couldn&apos;t find any premium socks matching{" "}
                  <span className="text-brand">&quot;{query}&quot;</span>.
                </p>
                <Link href="/collections" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto group flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold text-xs md:text-sm tracking-widest hover:bg-brand active:scale-95 transition-all cursor-pointer">
                    Clear Search
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center font-jakarta text-brand animate-pulse">
            SocksFul...
          </div>
        }
      >
        <CollectionsContent />
      </Suspense>
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
