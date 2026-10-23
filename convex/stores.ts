import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return store;
  },
});

export const getById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.storeId);
  },
});

export const listRecentStores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").order("desc").take(20);
  },
});

export const saveStore = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    sector: v.string(),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    currency: v.string(),
    currencySymbol: v.optional(v.string()),
    whatsappNumber: v.string(),
    phone: v.string(),
    isPublished: v.boolean(),
    themeConfig: v.any(),
    hero: v.optional(v.any()),
    deliveryZones: v.array(v.any()),
    paymentMethods: v.array(v.string()),
    categories: v.optional(v.array(v.any())),
    trustBadges: v.optional(v.array(v.any())),
    rawConfig: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Check if store already exists by slug
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        tagline: args.tagline,
        description: args.description,
        sector: args.sector,
        country: args.country,
        city: args.city,
        currency: args.currency,
        currencySymbol: args.currencySymbol,
        whatsappNumber: args.whatsappNumber,
        phone: args.phone,
        isPublished: args.isPublished,
        themeConfig: args.themeConfig,
        hero: args.hero,
        deliveryZones: args.deliveryZones,
        paymentMethods: args.paymentMethods,
        categories: args.categories,
        trustBadges: args.trustBadges,
        rawConfig: args.rawConfig,
        updatedAt: now,
      });
      return { storeId: existing._id, slug: args.slug, isNew: false };
    }

    const storeId = await ctx.db.insert("stores", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return { storeId, slug: args.slug, isNew: true };
  },
});

export const updateStoreTheme = mutation({
  args: {
    storeId: v.id("stores"),
    themeConfig: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.storeId, {
      themeConfig: args.themeConfig,
      updatedAt: Date.now(),
    });
  },
});

// Mode Code React : publie (ou met à jour) le projet React multi-fichiers d'une boutique.
export const saveStoreReact = mutation({
  args: {
    slug: v.string(),
    storeName: v.string(),
    whatsappNumber: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    sector: v.optional(v.string()),
    reactFiles: v.string(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.storeName,
        whatsappNumber: args.whatsappNumber,
        reactFiles: args.reactFiles,
        isPublished: args.isPublished ?? true,
        updatedAt: now,
      });
      return { storeId: existing._id, slug: args.slug, isNew: false };
    }

    const storeId = await ctx.db.insert("stores", {
      slug: args.slug,
      name: args.storeName,
      whatsappNumber: args.whatsappNumber,
      phone: args.phone ?? "+225 07 00 00 00 00",
      city: args.city,
      country: "Côte d'Ivoire",
      sector: args.sector ?? "general",
      isPublished: args.isPublished ?? true,
      reactFiles: args.reactFiles,
      currency: "FCFA",
      currencySymbol: "FCFA",
      themeConfig: {},
      deliveryZones: [],
      paymentMethods: ["wave", "orange_money", "cod"],
      createdAt: now,
      updatedAt: now,
    });
    return { storeId, slug: args.slug, isNew: true };
  },
});

// Mode Code : publie (ou mets à jour) le HTML généré par IA d'une boutique.
export const saveStoreHtml = mutation({
  args: {
    slug: v.string(),
    storeName: v.string(),
    whatsappNumber: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    sector: v.optional(v.string()),
    html: v.string(),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.storeName,
        whatsappNumber: args.whatsappNumber,
        html: args.html,
        isPublished: args.isPublished ?? true,
        updatedAt: now,
      });
      return { storeId: existing._id, slug: args.slug, isNew: false };
    }

    const storeId = await ctx.db.insert("stores", {
      slug: args.slug,
      name: args.storeName,
      whatsappNumber: args.whatsappNumber,
      phone: args.phone ?? "+225 07 00 00 00 00",
      city: args.city,
      country: "Côte d'Ivoire",
      sector: args.sector ?? "general",
      isPublished: args.isPublished ?? true,
      html: args.html,
      currency: "FCFA",
      currencySymbol: "FCFA",
      themeConfig: {},
      deliveryZones: [],
      paymentMethods: ["wave", "orange_money", "cod"],
      createdAt: now,
      updatedAt: now,
    });
    return { storeId, slug: args.slug, isNew: true };
  },
});
