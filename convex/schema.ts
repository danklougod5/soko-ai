import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 👤 MERCHANTS (Commerçants)
  merchants: defineTable({
    userId: v.string(),
    email: v.string(),
    phone: v.string(),
    fullName: v.string(),
    country: v.string(), // CI, SN, BJ, CM, TG...
    city: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // 🏪 STORES (Boutiques générées ou personnalisées)
  stores: defineTable({
    merchantId: v.optional(v.id("merchants")),
    name: v.string(),
    slug: v.string(),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    sector: v.string(), // "mode", "luxe", "artisanat", "food", "tech", "beaute", "general"
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    currency: v.string(), // "FCFA", "XOF", "XAF", "EUR", "USD"
    currencySymbol: v.optional(v.string()),
    whatsappNumber: v.string(),
    phone: v.string(),
    isPublished: v.boolean(),
    themeConfig: v.any(), // Design tokens, couleurs, typographies
    hero: v.optional(v.any()), // Hero headline, subheadline, etc.
    deliveryZones: v.array(v.any()), // Zones Abidjan, Dakar, etc.
    paymentMethods: v.array(v.string()), // ["wave", "orange_money", "cod", "card"]
    categories: v.optional(v.array(v.any())),
    trustBadges: v.optional(v.array(v.any())),
    rawConfig: v.optional(v.string()), // Backup JSON complet du StoreThemeConfig
    html: v.optional(v.string()), // Site 100% généré par IA (mode Code)
    reactFiles: v.optional(v.string()), // Projet React multi-fichiers (JSON [{path, content}])
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  // 📦 PRODUCTS (Catalogue)
  products: defineTable({
    storeId: v.id("stores"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    image: v.string(),
    inStock: v.boolean(),
    badge: v.optional(v.string()),
    variants: v.optional(v.array(v.any())),
    sortOrder: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_storeId", ["storeId"])
    .index("by_category", ["storeId", "category"]),

  // 🛒 ORDERS (Commandes avec logistique africaine et Mobile Money)
  orders: defineTable({
    storeId: v.id("stores"),
    orderNumber: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.string(),
    customerWhatsapp: v.optional(v.string()),
    deliveryCommune: v.string(),
    deliveryLandmark: v.string(), // "Derrière la pharmacie, portail vert"
    deliveryFee: v.number(),
    itemsTotal: v.number(),
    totalAmount: v.number(),
    paymentMethod: v.string(), // "wave" | "orange_money" | "cod" | "card"
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed")
    ),
    orderStatus: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("shipping"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    items: v.array(v.any()),
    createdAt: v.number(),
  })
    .index("by_storeId", ["storeId"])
    .index("by_status", ["storeId", "orderStatus"]),
});
