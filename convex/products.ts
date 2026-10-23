import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

export const syncStoreProducts = mutation({
  args: {
    storeId: v.id("stores"),
    products: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        price: v.number(),
        originalPrice: v.optional(v.number()),
        category: v.string(),
        image: v.string(),
        inStock: v.boolean(),
        badge: v.optional(v.string()),
        variants: v.optional(v.array(v.any())),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing products for this store
    const existing = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();

    for (const prod of existing) {
      await ctx.db.delete(prod._id);
    }

    // Insert new products
    const insertedIds = [];
    let order = 0;
    for (const prod of args.products) {
      const id = await ctx.db.insert("products", {
        storeId: args.storeId,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        category: prod.category,
        image: prod.image,
        inStock: prod.inStock,
        badge: prod.badge,
        variants: prod.variants,
        sortOrder: order++,
        createdAt: Date.now(),
      });
      insertedIds.push(id);
    }

    return insertedIds;
  },
});

export const createProduct = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    image: v.string(),
    inStock: v.boolean(),
    badge: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, args.updates);
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
  },
});
