"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  Search,
  Settings2,
  FolderPlus,
  Package,
  Gift,
  Tag as TagIcon,
  Loader2,
  Star,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  description: string;
  category: string;
  tag: string;
  showIn: string;
  isFeatured: boolean;
  stock: number;
  image: string | null;
  color: string;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Ocean Elite",
    price: "350",
    oldPrice: "500",
    description:
      "Premium comfort organic cotton socks with enhanced breathability.",
    category: "Casual",
    tag: "Best Seller",
    showIn: "products",
    isFeatured: true,
    stock: 50,
    image: null,
    color: "bg-blue-50/50",
  },
  {
    id: "2",
    name: "Sunny Soft",
    price: "450",
    oldPrice: "650",
    description: "Ultra-soft daily wear socks designed for all-day freshness.",
    category: "Casual",
    tag: "New Arrival",
    showIn: "products",
    isFeatured: true,
    stock: 30,
    image: null,
    color: "bg-orange-50/50",
  },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    "Casual",
    "Formal",
    "Sports",
  ]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    "Best Seller",
    "New Arrival",
    "Limited Edition",
    "Premium",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          const mappedProducts = data.data.map((p: any) => ({
            ...p,
            id: p._id,
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    category: "",
    tag: "",
    showIn: "products",
    isFeatured: false,
    stock: 0,
    image: null as string | null,
  });

  const [newItemName, setNewItemName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleSave = async (e: React.FormEvent) => {
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
        const uploadData = await uploadRes.json();
        if (uploadData.success) imageUrl = uploadData.url;
        else throw new Error("Image upload failed");
      }

      const finalData = { ...formData, image: imageUrl };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id
                ? ({ ...finalData, id: p.id, color: p.color } as Product)
                : p,
            ),
          );
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...finalData, color: "bg-gray-50/50" }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts((prev) => [
            { ...finalData, id: data.productId, color: "bg-gray-50/50" },
            ...prev,
          ]);
        }
      }
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  const deleteCategory = (cat: string) => {
    if (confirm(`Delete category "${cat}"?`)) {
      setCategories((prev) => prev.filter((c) => c !== cat));
    }
  };

  return (
    <div className="p-6 md:p-10 text-left font-jakarta relative">
      {(loading || isSaving) && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {loading ? "Syncing Inventory..." : "Processing..."}
          </p>
        </div>
      )}
      <header className="flex flex-col space-y-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
              Inventory
            </h1>
            <p className="text-gray-400 font-medium">
              Full control over products, categories, and tags.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <Settings2 size={20} className="text-gray-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 hidden sm:block">
                Settings
              </span>
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: "",
                  price: "",
                  oldPrice: "",
                  description: "",
                  category: categories[0],
                  tag: "",
                  showIn: "products",
                  isFeatured: false,
                  stock: 0,
                  image: null,
                });
                setSelectedFile(null);
                setIsModalOpen(true);
              }}
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
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-gray-100 outline-none focus:border-brand transition-all shadow-sm font-medium"
          />
        </div>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all flex flex-col"
          >
            <div
              className={`aspect-square ${p.color || "bg-gray-50"} rounded-[32px] mb-6 flex items-center justify-center relative overflow-hidden bg-gray-50`}
            >
              {p.image ? (
                <img src={p.image} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-200 font-instrument italic text-7xl select-none">
                  SF
                </span>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span
                  className={`p-2 rounded-xl backdrop-blur-md shadow-sm ${p.showIn === "gift-sets" ? "bg-amber-500 text-white" : "bg-white/80 text-gray-500"}`}
                >
                  {p.showIn === "gift-sets" ? (
                    <Gift size={14} />
                  ) : (
                    <Package size={14} />
                  )}
                </span>
                {p.isFeatured && (
                  <span className="p-2 rounded-xl bg-brand text-white shadow-lg animate-pulse">
                    <Star size={14} fill="currentColor" />
                  </span>
                )}
              </div>
              {p.tag && p.tag !== "" && (
                <span className="absolute top-4 left-4 bg-brand text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest italic shadow-lg">
                  {p.tag}
                </span>
              )}
            </div>

            <div className="flex-1 px-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-black">{p.name}</h3>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand bg-brand/5 px-2 py-0.5 rounded-md">
                    {p.category}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase ${p.stock <= 5 ? "text-red-500" : "text-gray-400"}`}
                  >
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-xl font-black text-black">
                  {p.price}BDT
                </span>
                {p.oldPrice && p.oldPrice !== "" && (
                  <span className="text-sm text-gray-300 line-through font-bold">
                    {p.oldPrice}BDT
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-50 flex gap-2">
              <button
                onClick={() => {
                  setEditingProduct(p);
                  setFormData({
                    ...p,
                    image: p.image || null,
                  });
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-gray-50 text-gray-600 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand/10 hover:text-brand transition-all cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (
                    confirm("Are you sure you want to delete this product?")
                  ) {
                    setIsSaving(true);
                    try {
                      const res = await fetch(`/api/products/${p.id}`, {
                        method: "DELETE",
                      });
                      const data = await res.json();
                      if (data.success) {
                        setProducts((prev) =>
                          prev.filter((pr) => pr.id !== p.id),
                        );
                      }
                    } catch (error) {
                      console.error("Error deleting product:", error);
                    } finally {
                      setIsSaving(false);
                    }
                  }
                }}
                className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Modal (Categories & Tags) */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[80vh] bg-white rounded-[40px] shadow-2xl z-[101] p-8 font-jakarta overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Store Settings</h2>
                <button
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-full cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10">
                {/* Manage Categories */}
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand mb-4 flex items-center gap-2">
                    <FolderPlus size={14} /> Categories
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add Category..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold text-sm"
                      id="newCatInput"
                    />
                    <button
                      onClick={() => {
                        const val = (
                          document.getElementById(
                            "newCatInput",
                          ) as HTMLInputElement
                        ).value;
                        if (val && !categories.includes(val)) {
                          setCategories([...categories, val]);
                          (
                            document.getElementById(
                              "newCatInput",
                            ) as HTMLInputElement
                          ).value = "";
                        }
                      }}
                      className="p-3 bg-black text-white rounded-xl hover:bg-brand transition-all cursor-pointer"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <span
                        key={c}
                        className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2 group"
                      >
                        {c}{" "}
                        <button
                          onClick={() =>
                            setCategories(categories.filter((x) => x !== c))
                          }
                          className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>

                {/* Manage Tags */}
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand mb-4 flex items-center gap-2">
                    <TagIcon size={14} /> Product Tags
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add Tag..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold text-sm"
                      id="newTagInput"
                    />
                    <button
                      onClick={() => {
                        const val = (
                          document.getElementById(
                            "newTagInput",
                          ) as HTMLInputElement
                        ).value;
                        if (val && !availableTags.includes(val)) {
                          setAvailableTags([...availableTags, val]);
                          (
                            document.getElementById(
                              "newTagInput",
                            ) as HTMLInputElement
                          ).value = "";
                        }
                      }}
                      className="p-3 bg-black text-white rounded-xl hover:bg-brand transition-all cursor-pointer"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((t) => (
                      <span
                        key={t}
                        className="bg-brand/5 px-4 py-2 rounded-xl text-sm font-bold text-brand flex items-center gap-2 group"
                      >
                        {t}{" "}
                        <button
                          onClick={() =>
                            setAvailableTags(
                              availableTags.filter((x) => x !== t),
                            )
                          }
                          className="text-brand/30 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] bg-white rounded-[40px] shadow-2xl z-[101] p-8 md:p-10 overflow-y-auto no-scrollbar font-jakarta"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? "Edit Item" : "New Item"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Premium Lineup Toggle */}
                <div className="flex items-center gap-3 p-4 bg-brand/5 rounded-2xl border border-brand/10 mb-2">
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
                    className="text-xs font-black uppercase tracking-widest text-brand cursor-pointer select-none"
                  >
                    Feature in Premium Lineup
                  </label>
                </div>
                <div
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50 group hover:border-brand/30 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      className="w-40 h-40 object-cover rounded-2xl shadow-md"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload
                        className="mx-auto text-gray-300 mb-2 group-hover:text-brand transition-colors"
                        size={40}
                      />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Upload Product Photo
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Product Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Product Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-bold resize-none"
                      placeholder="Describe the product details..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Current Price (Numeric Only)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Old Price (For Discount)
                    </label>
                    <input
                      type="text"
                      value={formData.oldPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          oldPrice: e.target.value.replace(/[^0-9]/g, ""),
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Stock Quantity
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          stock: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand focus:bg-white transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold appearance-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Display Section
                    </label>
                    <select
                      value={formData.showIn}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          showIn: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold appearance-none"
                    >
                      <option value="products">Normal Collections</option>
                      <option value="gift-sets">Gift Sets</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                      Apply Tag
                    </label>
                    <select
                      value={formData.tag}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tag: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-brand font-bold appearance-none"
                    >
                      <option value="">No Tag</option>
                      {availableTags.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                  <CheckCircle2 size={18} />{" "}
                  {editingProduct ? "Update Product" : "Save & Publish"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
