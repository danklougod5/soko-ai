"use client";

import React, { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StorefrontView } from "@/components/storefront/StorefrontView";
import { buildReactShell } from "@/lib/react-shell";
import type { ReactProjectFile } from "@/lib/react-project-engine";
import { StoreThemeConfig, DeliveryZone, OrderLineItem } from "@/types/store";
import { Loader2, AlertCircle, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function StoreSlugPage({ params }: PageProps) {
  const { slug } = use(params);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderNumber: string;
    customerName: string;
    total: number;
    paymentMethod: string;
  } | null>(null);

  const storeRecord = useQuery(api.stores.getBySlug, { slug });
  const productsRecord = useQuery(
    api.products.listByStore,
    storeRecord?._id ? { storeId: storeRecord._id } : "skip"
  );
  const createOrderMutation = useMutation(api.orders.createOrder);

  // Loading state
  if (storeRecord === undefined) {
    return (
      <div className="min-h-screen bg-[#08080A] flex flex-col items-center justify-center text-white px-4">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Chargement de la boutique...</p>
      </div>
    );
  }

  // Not found state
  if (storeRecord === null) {
    return (
      <div className="min-h-screen bg-[#08080A] flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Boutique introuvable</h1>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          La boutique &quot;{slug}&quot; n&apos;a pas encore été publiée sur le réseau SokoAI ou son adresse est incorrecte.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Créer ma propre boutique SokoAI</span>
        </Link>
      </div>
    );
  }

  // Mode Code React : la boutique est un vrai projet React généré par IA
  if (storeRecord.reactFiles) {
    try {
      const files: ReactProjectFile[] = JSON.parse(storeRecord.reactFiles) as ReactProjectFile[];
      return (
        <iframe
          title={storeRecord.name}
          srcDoc={buildReactShell(files)}
          sandbox="allow-scripts allow-popups allow-forms"
          className="w-screen h-screen border-0"
        />
      );
    } catch {
      // JSON invalide → fallback sur les autres modes
    }
  }

  // Mode Code : la boutique est un site 100% généré par IA → affichage plein écran
  if (storeRecord.html) {
    return (
      <iframe
        title={storeRecord.name}
        srcDoc={storeRecord.html}
        sandbox="allow-scripts allow-popups allow-forms"
        className="w-screen h-screen border-0"
      />
    );
  }

  // Reconstruct StoreThemeConfig from Convex record
  let parsedStore: StoreThemeConfig;
  if (storeRecord.rawConfig) {
    try {
      parsedStore = JSON.parse(storeRecord.rawConfig);
    } catch {
      parsedStore = buildStoreFromRecord(storeRecord);
    }
  } else {
    parsedStore = buildStoreFromRecord(storeRecord);
  }

  // If products are fetched from Convex products table, use them
  if (productsRecord && productsRecord.length > 0) {
    parsedStore = {
      ...parsedStore,
      products: productsRecord.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        description: p.description,
        category: p.category,
        image: p.image,
        inStock: p.inStock,
        badge: p.badge,
        variants: p.variants,
      })),
    };
  }

  const handleOrderCompleted = async (orderData: {
    customerName: string;
    customerPhone: string;
    zone: DeliveryZone;
    landmark: string;
    paymentMethod: string;
    total: number;
    items: OrderLineItem[];
  }) => {
    try {
      const res = await createOrderMutation({
        storeId: storeRecord._id,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryCommune: orderData.zone.name,
        deliveryLandmark: orderData.landmark,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items.length > 0
          ? orderData.items
          : parsedStore.products.slice(0, 1).map((p) => ({
              productId: p.id,
              productName: p.name,
              quantity: 1,
              unitPrice: p.price,
            })),
      });

      setOrderConfirmation({
        orderNumber: res.orderNumber,
        customerName: orderData.customerName,
        total: res.totalAmount,
        paymentMethod: orderData.paymentMethod,
      });
    } catch (err) {
      console.error("Erreur enregistrement commande Convex:", err);
    }
  };

  return (
    <div>
      {/* Banner SokoAI Verified */}
      <div className="bg-[#0e0f14] border-b border-white/5 py-1.5 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Boutique certifiée SokoAI — Paiements Wave & Orange Money sécurisés</span>
      </div>

      <StorefrontView store={parsedStore} onOrderCompleted={handleOrderCompleted} />

      {/* Confirmation Modal if placed order */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131A] border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Commande confirmée !</h3>
            <p className="text-xs font-mono text-emerald-400 mb-4">
              Référence : {orderConfirmation.orderNumber}
            </p>
            <p className="text-sm text-slate-300 mb-6">
              Merci <span className="font-semibold text-white">{orderConfirmation.customerName}</span> ! Votre commande d&apos;un montant de{" "}
              <span className="font-semibold text-white">
                {orderConfirmation.total.toLocaleString("fr-FR")} {parsedStore.currencySymbol}
              </span>{" "}
              a été transmise au vendeur sur WhatsApp.
            </p>
            <button
              onClick={() => setOrderConfirmation(null)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildStoreFromRecord(record: any): StoreThemeConfig {
  return {
    storeName: record.name,
    slug: record.slug,
    tagline: record.tagline || "",
    description: record.description || "",
    sector: record.sector || "general",
    country: record.country || "CI",
    city: record.city || "Abidjan",
    currency: record.currency || "FCFA",
    currencySymbol: record.currencySymbol || "FCFA",
    primaryColor: record.themeConfig?.primaryColor || "#D97706",
    secondaryColor: record.themeConfig?.secondaryColor || "#1E1E24",
    accentColor: record.themeConfig?.accentColor || "#F59E0B",
    backgroundColor: record.themeConfig?.backgroundColor || "#FFFFFF",
    textColor: record.themeConfig?.textColor || "#18181B",
    fontHeading: record.themeConfig?.fontHeading || "Outfit",
    fontBody: record.themeConfig?.fontBody || "Inter",
    style: record.themeConfig?.style || "modern",
    hero: record.hero || {
      headline: record.name,
      subheadline: record.tagline || "",
      badgeText: "Nouveauté",
      ctaText: "Découvrir la collection",
    },
    merchantWhatsapp: record.whatsappNumber || "+2250700000000",
    merchantPhone: record.phone || "+2250700000000",
    paymentMethods: record.paymentMethods || ["wave", "orange_money", "cod"],
    deliveryZones: record.deliveryZones || [],
    categories: record.categories || [],
    products: [],
    trustBadges: record.trustBadges || [],
  };
}
