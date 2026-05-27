"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function PremiumProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          // Filter specifically for products marked as 'isFeatured' for the home lineup
          const featured = data.data
            .filter((p: any) => p.isFeatured === true)
            .slice(0, 3)
            .map((p: any) => ({ ...p, id: p._id }));
          setProducts(featured);
        }
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Featured Lineup...</p>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-28 bg-[#fcfcfc]">
      <div className="max-w-7xl mx-auto px-6">
        {/* সেকশন হেডার */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-3 md:mb-4">
            Our Premium{" "}
            <span className="font-instrument italic font-normal text-brand transition-colors duration-500">
              Lineup
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-lg font-medium">
            Elevate your comfort with our signature series.
          </p>
        </div>

        {/* গ্রিড সিস্টেম */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-white p-4 md:p-5 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 flex flex-col h-full active:scale-[0.98] md:active:scale-100"
            >
              {/* ইমেজ কন্টেইনার */}
              <div className="relative aspect-square bg-gray-50 rounded-[24px] md:rounded-[30px] mb-6 flex items-center justify-center overflow-hidden">
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
                  <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-black shadow-sm italic">
                    {p.tag}
                  </span>
                )}
              </div>

              {/* ইনফরমেশন এরিয়া */}
              <div className="px-1 md:px-2 flex-grow">
                <h3 className="text-base md:text-lg font-bold mb-1 text-gray-900 group-hover:text-brand transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-baseline gap-2 md:gap-3 mb-6">
                  <span className="text-xl md:text-2xl font-bold tracking-tighter text-black">
                    {p.price}BDT
                  </span>
                  {p.oldPrice && p.oldPrice !== "" && (
                    <span className="text-xs md:text-sm text-gray-300 line-through decoration-red-400 font-medium">
                      {p.oldPrice}BDT
                    </span>
                  )}
                </div>
              </div>

              {/* বাই নাও লিঙ্ক - এটিকে এখন Link ট্যাগ করা হয়েছে */}
              <Link
                href={`/product/${p.id}`}
                className="w-full bg-black text-white py-3.5 md:py-4 rounded-[16px] md:rounded-[20px] font-bold text-xs md:text-sm uppercase tracking-widest transition-all hover:bg-brand hover:shadow-lg hover:shadow-brand/20 active:bg-brand flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                Buy Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
