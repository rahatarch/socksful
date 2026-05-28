"use client";
import { useState, use, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ChevronRight, Truck, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/useCartStore";

export default function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [quantity, setQuantity] = useState(1);
  // Product interface for type safety
  interface Product {
    id: string;
    _id?: string;
    name: string;
    price: string;
    oldPrice?: string;
    description?: string;
    stock: number;
    image?: string;
    color?: string;
    tag?: string;
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          const found: Product | undefined = data.data.find(
            (p: Product) => p._id === resolvedParams.id,
          );
          if (found) {
            setProduct({ ...found, id: found._id ?? "" });
            setQuantity(found.stock > 0 ? 1 : 0);
          }
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [resolvedParams.id]);

  const handleAddToBag = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: `${product.price}BDT`,
      quantity: quantity,
    });
  };

  if (loading) {
    return (
      <main className="bg-white min-h-screen font-jakarta">
        <Navbar />
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Loading Details...
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-white min-h-screen font-jakarta">
        <Navbar />
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-gray-400">
            The item you are looking for does not exist.
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen font-jakarta text-left">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 md:px-8 pt-20 sm:pt-28 md:pt-40 pb-6 sm:pb-10 md:pb-20">
        {/* ব্রেডক্রাম্ব */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-8 md:mb-12 overflow-x-auto whitespace-nowrap no-scrollbar">
          <span className="hover:text-black cursor-pointer transition-colors">
            Home
          </span>
          <ChevronRight size={14} />
          <span className="hover:text-black cursor-pointer transition-colors">
            Collections
          </span>
          <ChevronRight size={14} />
          <span className="text-black font-bold">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 md:gap-20 text-left">
          {/* ইমেজ সেকশন */}
          <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`aspect-square w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto ${product.color || "bg-[#fafafa]"} rounded-[24px] sm:rounded-[40px] md:rounded-[60px] flex items-center justify-center overflow-hidden relative group`}
            >
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-200/50 text-[150px] md:text-[200px] font-instrument italic select-none">
                  SF
                </span>
              )}
              {product.tag && product.tag !== "" && (
                <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-brand text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg transition-colors duration-500 italic">
                  {product.tag}
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 cursor-pointer hover:border-brand transition-all flex items-center justify-center active:scale-95"
                >
                  <span className="text-gray-300 text-[10px] font-bold uppercase">
                    View {i}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* প্রোডাক্ট ইনফরমেশন */}
          <div className="flex-1 min-w-0 flex flex-col pt-2 sm:pt-4 md:pt-0 items-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full text-left"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl md:text-4xl font-bold text-black tracking-tighter">
                  {product.price}BDT
                </span>
                {product.oldPrice && product.oldPrice !== "" && (
                  <span className="text-lg md:text-xl text-gray-400 line-through decoration-red-400 opacity-60">
                    {product.oldPrice}BDT
                  </span>
                )}
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    product.stock > 5
                      ? "bg-green-50 text-green-600"
                      : product.stock > 0
                        ? "bg-orange-50 text-orange-500"
                        : "bg-red-50 text-red-500"
                  }`}
                >
                  {product.stock > 5
                    ? "In Stock"
                    : product.stock > 0
                      ? `Low Stock (${product.stock} left)`
                      : "Out of Stock"}
                </span>
              </div>

              <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 font-medium max-w-xl text-left">
                {product.description ||
                  `Experience the ultimate comfort with our signature ${product.name} series. Crafted with long-staple organic cotton for maximum breathability and durability. One size fits all design for perfect stretch and grip.`}
              </p>

              {/* বাটন সেকশন - ফিক্সড কোড */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 w-full">
                {/* কোয়ান্টিটি পিকার - হাইট ফিক্সড করা হয়েছে */}
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100 min-h-[60px] md:min-h-[64px] w-full sm:w-auto">
                  <button
                    disabled={product.stock <= 0}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-2xl font-bold cursor-pointer hover:text-brand transition-colors text-black disabled:opacity-30 disabled:hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-4 text-center font-bold text-lg text-black">
                    {quantity}
                  </span>
                  <button
                    disabled={product.stock <= 0}
                    onClick={() =>
                      setQuantity(Math.min(product.stock || 0, quantity + 1))
                    }
                    className="w-12 h-12 flex items-center justify-center text-2xl font-bold cursor-pointer hover:text-brand transition-colors text-black disabled:opacity-30 disabled:hover:text-black"
                  >
                    +
                  </button>
                </div>

                {/* ADD TO BAG বাটন - প্যাডিং এবং মিনিমাম হাইট বাড়ানো হয়েছে */}
                <button
                  disabled={product.stock <= 0}
                  onClick={handleAddToBag}
                  className="flex-1 bg-black text-white py-5 md:py-6 rounded-2xl font-bold text-sm md:text-base uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand transition-all shadow-xl active:scale-[0.96] cursor-pointer w-full min-h-[60px] md:min-h-[64px] disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? (
                    <>
                      <ShoppingBag size={22} strokeWidth={2.5} />
                      Add to Bag
                    </>
                  ) : (
                    "Out of Stock"
                  )}
                </button>
              </div>

              <div className="py-8 border-t border-gray-100 w-full">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center transition-colors duration-500">
                    <Truck size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">
                      Fast Delivery
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      Estimated 2-3 Days
                    </span>
                  </div>
                </div>
              </div>
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
