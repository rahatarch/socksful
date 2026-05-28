"use client";
import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  Search,
  Settings2,
  Package,
  Gift,
  Loader2,
  Star,
} from "lucide-react";
import { type SiteCategory } from "@/lib/site-settings";

type ProductPlacement = "products" | "gift-sets";

interface Product {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  description: string;
  category: string;
  tag: string;
  showIn: ProductPlacement;
  isFeatured: boolean;
  stock: number;
  image: string | null;
  color: string;
}

interface ProductResponseItem {
  _id: string;
  name: string;
  price: string;
  oldPrice: string;
  description: string;
  category: string;
  tag: string;
  showIn?: string;
  isFeatured: boolean;
  stock: number;
  image: string | null;
  color: string;
}

interface ProductFormState {
  name: string;
  price: string;
  oldPrice: string;
  description: string;
  category: string;
  tag: string;
  showIn: ProductPlacement;
  isFeatured: boolean;
  stock: number;
  image: string | null;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  price: "",
  oldPrice: "",
  description: "",
  category: "",
  tag: "",
  showIn: "products",
  isFeatured: false,
  stock: 0,
  image: null,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, settingsRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/admin/settings", { cache: "no-store" }),
        ]);

        const prodData = await prodRes.json();
        const settingsData = await settingsRes.json();

        if (prodData.success) {
          setProducts(
            (prodData.data as ProductResponseItem[]).map((p) => ({
              ...p,
              id: p._id,
              showIn: p.showIn === "gift-sets" ? "gift-sets" : "products",
            })),
          );
        }

        if (settingsData.success) {
          setCategories(settingsData.categories || []);
          setAvailableTags(settingsData.tags || []);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryOptions = useMemo(() => {
    const nextOptions = categories
      .filter((category) => category.appliesTo.includes(formData.showIn))
      .map((category) => category.name);

    if (formData.category && !nextOptions.includes(formData.category)) {
      return [formData.category, ...nextOptions];
    }

    return nextOptions;
  }, [categories, formData.category, formData.showIn]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    setFormData({
      ...EMPTY_FORM,
      category:
        categories.find((category) => category.appliesTo.includes("products"))
          ?.name || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData: { success?: boolean; url?: string; error?: string } =
          await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success || !uploadData.url) {
          throw new Error(uploadData.error || "Image upload failed");
        }

        imageUrl = uploadData.url;
      }

      const finalData = { ...formData, image: imageUrl };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });
        const updateData: { success?: boolean; error?: string } =
          await res.json();
        if (!res.ok || !updateData.success) {
          throw new Error(updateData.error || "Failed to update product");
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? ({ ...p, ...finalData, id: p.id } as Product)
              : p,
          ),
        );
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...finalData, color: "bg-gray-50/50" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create product");
        }

        setProducts((prev) => [
          { ...finalData, id: data.productId, color: "bg-gray-50/50" },
          ...prev,
        ]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 text-left font-jakarta relative">
      {(loading || isSaving) && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Working on it...
          </p>
        </div>
      )}

      <header className="flex flex-col space-y-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
              Inventory
            </h1>
            <p className="text-gray-400 font-medium text-sm">
              Manage your premium stock and use Settings to control dynamic
              categories and tags.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings"
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Settings2 size={20} className="text-gray-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 hidden sm:block">
                Settings
              </span>
            </Link>
            <button
              onClick={handleOpenCreateModal}
              className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-brand transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-gray-100 outline-none focus:border-brand shadow-sm font-medium"
          />
        </div>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all flex flex-col relative"
          >
            <div
              className={`aspect-square ${p.color || "bg-gray-50"} rounded-[32px] mb-6 flex items-center justify-center relative overflow-hidden`}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-200 font-instrument italic text-7xl select-none">
                  SF
                </span>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span
                  className={`p-2 rounded-xl backdrop-blur-md ${p.showIn === "gift-sets" ? "bg-brand text-white" : "bg-white/80 text-gray-500"}`}
                >
                  {p.showIn === "gift-sets" ? (
                    <Gift size={14} />
                  ) : (
                    <Package size={14} />
                  )}
                </span>
                {p.isFeatured && (
                  <span className="p-2 rounded-xl bg-brand text-white shadow-lg">
                    <Star size={14} fill="currentColor" />
                  </span>
                )}
              </div>
              {p.tag && (
                <span className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic shadow-lg">
                  {p.tag}
                </span>
              )}
            </div>

            <div className="flex-1 px-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-black leading-tight">
                  {p.name}
                </h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-brand bg-brand/5 px-2 py-1 rounded-lg">
                  {p.category}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-black text-black">
                  {p.price} BDT
                </span>
                {p.oldPrice && (
                  <span className="text-sm text-gray-300 line-through font-bold">
                    {p.oldPrice} BDT
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                In Stock: {p.stock}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-50 flex gap-2">
              <button
                onClick={() => {
                  setEditingProduct(p);
                  setSelectedFile(null);
                  setFormData({
                    name: p.name,
                    price: p.price,
                    oldPrice: p.oldPrice || "",
                    description: p.description,
                    category: p.category,
                    tag: p.tag || "",
                    showIn: p.showIn === "gift-sets" ? "gift-sets" : "products",
                    isFeatured: p.isFeatured,
                    stock: p.stock,
                    image: p.image || null,
                  });
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-gray-50 text-gray-600 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm("Delete this product?")) {
                    setIsSaving(true);
                    try {
                      const res = await fetch(`/api/products/${p.id}`, {
                        method: "DELETE",
                      });
                      const data: { success?: boolean; error?: string } =
                        await res.json();

                      if (!res.ok || !data.success) {
                        throw new Error(
                          data.error || "Failed to delete product",
                        );
                      }

                      setProducts((prev) =>
                        prev.filter((pr) => pr.id !== p.id),
                      );
                    } catch (error) {
                      console.error("Error deleting product:", error);
                      alert(
                        error instanceof Error
                          ? error.message
                          : "Failed to delete product",
                      );
                    } finally {
                      setIsSaving(false);
                    }
                  }
                }}
                className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
                setSelectedFile(null);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] bg-white rounded-[40px] shadow-2xl z-[101] p-8 md:p-10 overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? "Refine Product" : "New Addition"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    setSelectedFile(null);
                  }}
                  className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-brand/5 rounded-2xl border border-brand/10">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-5 h-5 accent-brand cursor-pointer"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-black uppercase tracking-widest text-brand cursor-pointer"
                  >
                    Premium Lineup (Featured)
                  </label>
                </div>

                <div
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50 hover:border-brand/30 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-2xl shadow-md"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload
                        className="mx-auto text-gray-300 mb-2"
                        size={40}
                      />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Upload Media
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Product Title
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white font-bold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white font-bold resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Price (BDT)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Compare Price (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.oldPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          oldPrice: e.target.value.replace(/[^0-9]/g, ""),
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Stock Level
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold"
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {categoryOptions.length === 0 && (
                      <p className="text-[10px] font-bold tracking-widest uppercase text-red-400 mt-2 ml-1">
                        Create a category in Settings for this placement first.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Placement
                    </label>
                    <select
                      value={formData.showIn}
                      onChange={(e) => {
                        const nextPlacement = e.target
                          .value as ProductPlacement;
                        const nextCategories = categories
                          .filter((category) =>
                            category.appliesTo.includes(nextPlacement),
                          )
                          .map((category) => category.name);

                        setFormData({
                          ...formData,
                          showIn: nextPlacement,
                          category: nextCategories.includes(formData.category)
                            ? formData.category
                            : nextCategories[0] || "",
                        });
                      }}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold"
                    >
                      <option value="products">Regular Collection</option>
                      <option value="gift-sets">Gift Sets</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">
                      Marketing Tag
                    </label>
                    <select
                      value={formData.tag}
                      onChange={(e) =>
                        setFormData({ ...formData, tag: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold"
                    >
                      <option value="">No Tag</option>
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  disabled={!formData.category}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300"
                >
                  <CheckCircle2 size={18} />{" "}
                  {editingProduct ? "Confirm Changes" : "Publish to Store"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
