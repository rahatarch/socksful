"use client";

import { useEffect, useState } from "react";
import {
  FolderPlus,
  Loader2,
  Plus,
  Save,
  Settings2,
  Tag,
  Trash2,
} from "lucide-react";
import {
  slugifySettingId,
  type CategoryTarget,
  type SiteCategory,
} from "@/lib/site-settings";

const formatLabel = (value: string) => value.trim().replace(/\s+/g, " ");

export default function AdminSettingsPage() {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTargets, setNewCategoryTargets] = useState<CategoryTarget[]>([
    "products",
  ]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setCategories(data.categories || []);
          setTags(data.tags || []);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const syncSettings = async (nextCategories: SiteCategory[], nextTags: string[]) => {
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: nextCategories,
          tags: nextTags,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories(data.categories || nextCategories);
        setTags(data.tags || nextTags);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleNewCategoryTarget = (target: CategoryTarget) => {
    setNewCategoryTargets((prev) =>
      prev.includes(target)
        ? prev.filter((item) => item !== target)
        : [...prev, target],
    );
  };

  const handleAddCategory = async () => {
    const name = formatLabel(newCategoryName);

    if (!name || newCategoryTargets.length === 0) {
      return;
    }

    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const nextCategories = [...categories, {
      id: slugifySettingId(name),
      name,
      appliesTo: newCategoryTargets,
    }];

    await syncSettings(nextCategories, tags);
    setNewCategoryName("");
    setNewCategoryTargets(["products"]);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const nextCategories = categories.filter((category) => category.id !== categoryId);
    await syncSettings(nextCategories, tags);
  };

  const handleTargetToggle = async (
    categoryId: string,
    target: CategoryTarget,
  ) => {
    const nextCategories = categories.map((category) => {
      if (category.id !== categoryId) {
        return category;
      }

      const alreadySelected = category.appliesTo.includes(target);
      const nextTargets = alreadySelected
        ? category.appliesTo.filter((item) => item !== target)
        : [...category.appliesTo, target];

      if (nextTargets.length === 0) {
        return category;
      }

      return {
        ...category,
        appliesTo: nextTargets,
      };
    });

    await syncSettings(nextCategories, tags);
  };

  const handleAddTag = async () => {
    const normalizedTag = formatLabel(newTag);

    if (!normalizedTag || tags.some((tag) => tag.toLowerCase() === normalizedTag.toLowerCase())) {
      return;
    }

    await syncSettings(categories, [...tags, normalizedTag]);
    setNewTag("");
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    await syncSettings(
      categories,
      tags.filter((tag) => tag !== tagToDelete),
    );
  };

  return (
    <div className="p-6 md:p-10 text-left font-jakarta relative">
      {(loading || saving) && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-brand" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {loading ? "Loading settings..." : "Syncing settings..."}
          </p>
        </div>
      )}

      <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-brand/5 text-brand px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Settings2 size={14} /> Dynamic Store Settings
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Category & Tag Control Room
          </h1>
          <p className="text-gray-400 font-medium mt-2 max-w-2xl">
            Collections আর Gift Sets page-er filter ekhon ekhanei theke cholbe.
            Apni jei category ba tag add, update, delete korben, sheta database-e
            save hoye front-end e automatically reflect korbe.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[28px] px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
            Live Summary
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-black">
            <span>{categories.length} Categories</span>
            <span>{tags.length} Tags</span>
            <span className="text-brand inline-flex items-center gap-2">
              <Save size={14} /> Auto Sync
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.9fr] gap-6 md:gap-8">
        <section className="bg-white rounded-[36px] border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3">
                <FolderPlus size={20} className="text-brand" /> Categories
              </h2>
              <p className="text-gray-400 text-sm font-medium mt-2">
                Choose where each category should appear: Collections, Gift Sets,
                or both.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[28px] p-5 md:p-6 border border-gray-100 mb-6 space-y-4">
            <input
              type="text"
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 outline-none focus:border-brand font-bold"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toggleNewCategoryTarget("products")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  newCategoryTargets.includes("products")
                    ? "bg-black text-white"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                Collections
              </button>
              <button
                type="button"
                onClick={() => toggleNewCategoryTarget("gift-sets")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  newCategoryTargets.includes("gift-sets")
                    ? "bg-brand text-white"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                Gift Sets
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddCategory}
              className="w-full sm:w-auto bg-black text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-100 rounded-[28px] p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-black">{category.name}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                    Visible In
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTargetToggle(category.id, "products")}
                      className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        category.appliesTo.includes("products")
                          ? "bg-black text-white"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      Collections
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTargetToggle(category.id, "gift-sets")}
                      className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        category.appliesTo.includes("gift-sets")
                          ? "bg-brand text-white"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      Gift Sets
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && !loading && (
              <div className="border border-dashed border-gray-200 rounded-[28px] p-8 text-center text-gray-400 font-medium">
                No categories yet. Add your first category to power the website filters.
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-[36px] border border-gray-100 shadow-sm p-6 md:p-8 h-fit">
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3">
              <Tag size={20} className="text-brand" /> Marketing Tags
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-2">
              Best Seller, New Arrival, Limited Edition moto label gulo ekhane
              manage korun.
            </p>
          </div>

          <div className="bg-gray-50 rounded-[28px] p-5 md:p-6 border border-gray-100 mb-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="New tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-200 outline-none focus:border-brand font-bold"
            />

            <button
              type="button"
              onClick={handleAddTag}
              className="w-full bg-black text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Tag
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-3 bg-brand/5 text-brand border border-brand/10 px-4 py-3 rounded-2xl text-xs font-bold"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag)}
                  className="text-brand/40 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}

            {tags.length === 0 && !loading && (
              <div className="w-full border border-dashed border-gray-200 rounded-[28px] p-8 text-center text-gray-400 font-medium">
                No tags yet. Add tags to label products across the storefront.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
