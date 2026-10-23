import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();
  },
});

export const createOrder = mutation({
  args: {
    storeId: v.id("stores"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerWhatsapp: v.optional(v.string()),
    deliveryCommune: v.string(),
    deliveryLandmark: v.string(),
    paymentMethod: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // 🔒 Le montant, les frais de livraison et le statut de paiement sont
    // recalculés côté serveur : on ne fait JAMAIS confiance au client.
    const store = await ctx.db.get(args.storeId);
    if (!store) {
      throw new Error("Boutique introuvable");
    }

    // Frais de livraison issus de la config de la boutique (source de vérité)
    const zones = (store.deliveryZones ?? []) as Array<{
      name?: string;
      fee?: number;
    }>;
    const zone = zones.find((z) => z.name === args.deliveryCommune);
    const deliveryFee =
      zone && typeof zone.fee === "number" && zone.fee >= 0
        ? Math.round(zone.fee)
        : 0;

    // Prix unitaires re-croisés avec le catalogue en base
    const storeProducts = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
    const byId = new Map(storeProducts.map((p) => [String(p._id), p]));
    const byName = new Map(storeProducts.map((p) => [p.name, p]));

    let itemsTotal = 0;
    const items = args.items.map((item) => {
      const quantity = Math.max(1, Math.floor(item.quantity));
      const trusted = byId.get(item.productId) ?? byName.get(item.productName);
      const unitPrice =
        trusted && trusted.price >= 0
          ? trusted.price
          : Math.max(0, Math.round(item.unitPrice));
      itemsTotal += unitPrice * quantity;
      return {
        productId: item.productId,
        productName: trusted?.name ?? item.productName,
        quantity,
        unitPrice,
      };
    });

    const totalAmount = itemsTotal + deliveryFee;

    // 🔒 Une commande naît toujours "pending" : seul un webhook de paiement
    // vérifié (internalMutation) peut la passer à "paid".
    const orderNumber = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderId = await ctx.db.insert("orders", {
      storeId: args.storeId,
      orderNumber,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerWhatsapp: args.customerWhatsapp,
      deliveryCommune: args.deliveryCommune,
      deliveryLandmark: args.deliveryLandmark,
      deliveryFee,
      itemsTotal,
      totalAmount,
      paymentMethod: args.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "new",
      items,
      createdAt: timestamp,
    });

    return {
      orderId,
      orderNumber,
      itemsTotal,
      deliveryFee,
      totalAmount,
      paymentStatus: "pending" as const,
    };
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("shipping"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      orderStatus: args.status,
    });
  },
});

export const updatePaymentStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      paymentStatus: args.paymentStatus,
    });
  },
});
