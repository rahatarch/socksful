export type CategoryTarget = "products" | "gift-sets";

export interface SiteCategory {
  id: string;
  name: string;
  appliesTo: CategoryTarget[];
}

export interface SiteSettings {
  categories: SiteCategory[];
  tags: string[];
}

const VALID_TARGETS: CategoryTarget[] = ["products", "gift-sets"];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  categories: [
    { id: "casual", name: "Casual", appliesTo: ["products"] },
    { id: "formal", name: "Formal", appliesTo: ["products"] },
    { id: "sports", name: "Sports", appliesTo: ["products"] },
    { id: "luxury-box", name: "Luxury Box", appliesTo: ["gift-sets"] },
    { id: "couple-sets", name: "Couple Sets", appliesTo: ["gift-sets"] },
  ],
  tags: ["Best Seller", "New Arrival", "Limited Edition"],
};

const sanitizeLabel = (value: string) => value.trim().replace(/\s+/g, " ");

export const slugifySettingId = (value: string) =>
  sanitizeLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "setting-item";

const normalizeTargets = (value: unknown): CategoryTarget[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueTargets = new Set<CategoryTarget>();

  for (const item of value) {
    if (VALID_TARGETS.includes(item as CategoryTarget)) {
      uniqueTargets.add(item as CategoryTarget);
    }
  }

  return [...uniqueTargets];
};

const normalizeCategory = (value: unknown): SiteCategory | null => {
  if (typeof value === "string") {
    const name = sanitizeLabel(value);

    if (!name) {
      return null;
    }

    return {
      id: slugifySettingId(name),
      name,
      appliesTo: [...VALID_TARGETS],
    };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const category = value as Partial<SiteCategory>;
  const name = typeof category.name === "string" ? sanitizeLabel(category.name) : "";

  if (!name) {
    return null;
  }

  const appliesTo = normalizeTargets(category.appliesTo);

  if (appliesTo.length === 0) {
    return null;
  }

  return {
    id:
      typeof category.id === "string" && category.id.trim() !== ""
        ? slugifySettingId(category.id)
        : slugifySettingId(name),
    name,
    appliesTo,
  };
};

export const normalizeSiteSettings = (value: unknown): SiteSettings => {
  const raw = value && typeof value === "object" ? (value as Partial<SiteSettings>) : {};

  const mergedCategories = new Map<string, SiteCategory>();

  for (const item of Array.isArray(raw.categories) ? raw.categories : []) {
    const normalized = normalizeCategory(item);

    if (!normalized) {
      continue;
    }

    const key = normalized.name.toLowerCase();
    const existing = mergedCategories.get(key);

    if (existing) {
      const appliesTo = Array.from(new Set([...existing.appliesTo, ...normalized.appliesTo]));
      mergedCategories.set(key, { ...existing, appliesTo });
      continue;
    }

    mergedCategories.set(key, normalized);
  }

  const tags = Array.from(
    new Set(
      (Array.isArray(raw.tags) ? raw.tags : [])
        .filter((tag): tag is string => typeof tag === "string")
        .map(sanitizeLabel)
        .filter(Boolean),
    ),
  );

  return {
    categories: [...mergedCategories.values()].sort((a, b) => a.name.localeCompare(b.name)),
    tags: tags.sort((a, b) => a.localeCompare(b)),
  };
};

export const buildSiteSettingsFromCatalog = ({
  productCategories = [],
  giftSetCategories = [],
  tags = [],
}: {
  productCategories?: unknown[];
  giftSetCategories?: unknown[];
  tags?: unknown[];
}): SiteSettings => {
  const groupedCategories = new Map<string, SiteCategory>();

  for (const [items, target] of [
    [productCategories, "products"],
    [giftSetCategories, "gift-sets"],
  ] as const) {
    for (const item of items) {
      if (typeof item !== "string") {
        continue;
      }

      const name = sanitizeLabel(item);

      if (!name) {
        continue;
      }

      const key = name.toLowerCase();
      const existing = groupedCategories.get(key);

      if (existing) {
        if (!existing.appliesTo.includes(target)) {
          existing.appliesTo = [...existing.appliesTo, target];
        }
        continue;
      }

      groupedCategories.set(key, {
        id: slugifySettingId(name),
        name,
        appliesTo: [target],
      });
    }
  }

  const normalized = normalizeSiteSettings({
    categories: [...groupedCategories.values()],
    tags,
  });

  if (normalized.categories.length === 0 && normalized.tags.length === 0) {
    return DEFAULT_SITE_SETTINGS;
  }

  return {
    categories:
      normalized.categories.length > 0
        ? normalized.categories
        : DEFAULT_SITE_SETTINGS.categories,
    tags: normalized.tags.length > 0 ? normalized.tags : DEFAULT_SITE_SETTINGS.tags,
  };
};

export const getCategoriesForTarget = (
  categories: SiteCategory[],
  target: CategoryTarget,
) =>
  categories
    .filter((category) => category.appliesTo.includes(target))
    .map((category) => category.name)
    .sort((a, b) => a.localeCompare(b));
