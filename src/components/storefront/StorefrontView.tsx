"use client";

import React, { useState } from "react";
import { StoreThemeConfig, ProductItem, CartItem, DeliveryZone, StoreSection, OrderLineItem } from "@/types/store";
import { SectionRenderer } from "./SectionRenderer";
import { 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Truck, 
  Smartphone, 
  Star,
  MapPin,
  Clock,
  Sparkles,
  PhoneCall,
  Flame,
  Award
} from "lucide-react";
import { AfricanCheckoutModal } from "../checkout/AfricanCheckoutModal";

interface StorefrontViewProps {
  store: StoreThemeConfig;
  onOrderCompleted?: (order: {
    customerName: string;
    customerPhone: string;
    zone: DeliveryZone;
    landmark: string;
    paymentMethod: string;
    total: number;
    items: OrderLineItem[];
  }) => void;
}

export function StorefrontView({ store, onOrderCompleted }: StorefrontViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);

  // Style detection
  const isDark = store.style === "modern" || (store.backgroundColor && (store.backgroundColor.startsWith("#0") || store.backgroundColor.startsWith("#1")));
  const isWarm = store.style === "warm";
  const isArtisanat = store.style === "artisanat";

  // Filter products by category
  const filteredProducts = selectedCategory === "all"
    ? store.products
    : store.products.filter((p) => p.category === selectedCategory || p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} ${store.currencySymbol || "FCFA"}`;
  };

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setAddedNoticeId(product.id);
    setTimeout(() => setAddedNoticeId(null), 1200);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const openWhatsAppDirect = (product: ProductItem) => {
    const text = encodeURIComponent(
      `Bonjour ${store.storeName} ! Je souhaite commander "${product.name}" au prix de ${formatPrice(product.price)}. Livraison possible à ${store.city} ?`
    );
    window.open(`https://wa.me/${(store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  // Font family styles
  const headingFont = store.fontHeading ? `font-${store.fontHeading.toLowerCase().replace(/\s+/g, "-")}` : "font-sans";

  return (
    <div
      style={{
        backgroundColor: store.backgroundColor || (isDark ? "#0A0B0E" : isWarm ? "#FFFBEB" : "#FAF8F5"),
        color: store.textColor || (isDark ? "#F3F4F6" : "#1C1917"),
      }}
      className="min-h-full transition-colors duration-300 font-sans flex flex-col"
    >
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div 
        style={{ backgroundColor: store.primaryColor || "#EA580C" }}
        className="text-white text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs shrink-0"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>
          Livraison express à {store.city || "Abidjan"} • Paiements Wave, Orange Money & Cash acceptés !
        </span>
      </div>

      {/* 2. STOREFRONT NAVBAR */}
      <header 
        style={{
          backgroundColor: isDark ? "#0E1017" : isWarm ? "#FEF9EE" : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        }}
        className="sticky top-0 z-30 border-b backdrop-blur-md shadow-xs transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div 
              style={{ backgroundColor: store.primaryColor }}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
            >
              {store.storeName ? store.storeName.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <h1 
                style={{ color: isDark ? "#FFFFFF" : store.textColor || "#1C1917" }}
                className="font-black text-base tracking-tight leading-none"
              >
                {store.storeName}
              </h1>
              <p className="text-[11px] opacity-70 font-medium mt-0.5">
                {store.city || "Abidjan"}, {store.country || "Côte d'Ivoire"}
              </p>
            </div>
          </div>

          {/* Actions & Cart */}
          <div className="flex items-center gap-3">
            {/* WhatsApp direct button */}
            <a
              href={`https://wa.me/${(store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>WhatsApp</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                backgroundColor: isDark ? "#1F222E" : "#1C1917",
                color: "#FFFFFF",
              }}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-90 transition active:scale-95 text-xs font-semibold shadow-sm cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Panier</span>
              {cartTotalItems > 0 && (
                <span 
                  style={{ backgroundColor: store.primaryColor }}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                >
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* GOOGLE FONTS INJECTION */}
      <link 
        rel="stylesheet" 
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;700;800&family=Space+Grotesk:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap" 
      />

      {/* ── MOTEUR DE COMPOSITION DYNAMIQUE (ARCHITECTURE LOVABLE / BOLT) ── */}
      {(() => {
        const defaultSections: StoreSection[] = [
          { type: "Marquee" },
          { type: "HeroSection" },
          { type: "TrustBadges" },
          ...(store.layoutStructure?.featuredPromo ? [{ type: "FeaturedPromo" as const }] : []),
          { type: "StatsBand" },
          { type: "ProductGrid" },
          ...(store.storytelling ? [{ type: "Storytelling" as const }] : [{ type: "BentoShowcase" as const }]),
          { type: "Lookbook" },
          ...(store.testimonials && store.testimonials.length > 0 ? [{ type: "Testimonials" as const }] : []),
          { type: "FAQ" },
          { type: "DeliveryZones" },
          { type: "CtaBanner" },
        ];
        const activeSections = store.sections && store.sections.length > 0 ? store.sections : defaultSections;

        return activeSections.map((sec, idx) => (
          <SectionRenderer
            key={idx}
            section={sec}
            store={store}
            filteredProducts={filteredProducts}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            addToCart={addToCart}
            openWhatsAppDirect={openWhatsAppDirect}
            addedNoticeId={addedNoticeId}
            formatPrice={formatPrice}
          />
        ));
      })()}

      {/* 9. STORE FOOTER */}
      <footer 
        style={{
          backgroundColor: isDark ? "#08090C" : isWarm ? "#292524" : "#1C1917",
          color: "#D6D3D1",
        }}
        className="py-10 px-4 mt-8 border-t border-black/10 text-xs shrink-0"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-bold text-sm mb-2">{store.storeName}</h4>
            <p className="opacity-80 leading-relaxed">{store.description}</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-2">Moyens de paiement</h4>
            <p className="opacity-80">
              Wave • Orange Money • MTN MoMo • Paiement à la livraison
            </p>
            <h4 className="text-white font-bold text-sm mt-4 mb-1">Livraison locale</h4>
            <p className="opacity-80">
              {store.city || "Abidjan"} : {store.deliveryZones?.map(z => z.name).slice(0, 3).join(", ") || "Cocody, Plateau, Marcory, Yopougon"}...
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-2">Contact & WhatsApp</h4>
            <p className="opacity-80">Téléphone : {store.merchantPhone || "+225 07 00 00 00 00"}</p>
            <p className="opacity-80 mt-1">WhatsApp : +{store.merchantWhatsapp || "2250700000000"}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/10 text-center opacity-60 text-[11px]">
          Propulsé par SokoAI • Le Lovable du e-commerce africain
        </div>
      </footer>

      {/* 7. CART DRAWER MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            style={{
              backgroundColor: isDark ? "#12141C" : "#FFFFFF",
              color: isDark ? "#FFFFFF" : "#1C1917",
            }}
            className="w-full max-w-md h-full shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-base">Votre Panier ({cartTotalItems})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 opacity-50 space-y-2">
                  <ShoppingBag className="h-10 w-10 mx-auto" />
                  <p className="text-sm font-medium">Votre panier est vide</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/2 dark:bg-white/5"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-semibold opacity-80 mt-0.5">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="h-6 w-6 rounded-md border border-black/10 dark:border-white/20 flex items-center justify-center text-xs font-bold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="h-6 w-6 rounded-md border border-black/10 dark:border-white/20 flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-black text-xs">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-70">Sous-total</span>
                  <span className="font-black text-base">{formatPrice(cartSubtotal)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  style={{ backgroundColor: store.primaryColor }}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  Commander (Wave / Orange Money / Cash)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. CHECKOUT MODAL */}
      <AfricanCheckoutModal
        isOpen={isCheckoutOpen}
        store={store}
        cart={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(orderData) => {
          setCart([]);
          setIsCheckoutOpen(false);
          if (onOrderCompleted) {
            onOrderCompleted(orderData);
          }
        }}
      />
    </div>
  );
}
