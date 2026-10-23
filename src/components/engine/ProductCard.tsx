"use client";

import React, { useState } from "react";
import { ProductItem, StoreThemeConfig } from "@/types/store";
import { Plus, Check, MessageCircle, AlertCircle } from "lucide-react";

interface ProductCardProps {
  product: ProductItem;
  store: StoreThemeConfig;
  onAddToCart: (product: ProductItem) => void;
  onQuickWhatsApp?: (product: ProductItem) => void;
}

export function ProductCard({
  product,
  store,
  onAddToCart,
  onQuickWhatsApp,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
  );

  const isDark =
    store.style === "modern" ||
    (store.backgroundColor &&
      (store.backgroundColor.startsWith("#0") || store.backgroundColor.startsWith("#1")));

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} ${store.currencySymbol || "FCFA"}`;
  };

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickWhatsApp) {
      onQuickWhatsApp(product);
    } else {
      const text = encodeURIComponent(
        `Bonjour ${store.storeName} ! Je souhaite commander "${product.name}" au prix de ${formatPrice(product.price)}.`
      );
      window.open(
        `https://wa.me/${(store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "")}?text=${text}`,
        "_blank"
      );
    }
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? "#141721" : "#FFFFFF",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      }}
      className="group relative flex flex-col rounded-2xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() =>
            setImgSrc(
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
            )
          }
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <div
            style={{ backgroundColor: store.primaryColor || "#EA580C" }}
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm"
          >
            {product.badge}
          </div>
        )}

        {/* Out of Stock Ribbon */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="bg-red-500/90 text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
              <AlertCircle className="h-3.5 w-3.5" />
              Épuisé
            </span>
          </div>
        )}

        {/* WhatsApp Quick Icon Button */}
        {product.inStock && (
          <button
            onClick={handleWhatsApp}
            title="Commander directement sur WhatsApp"
            className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 p-4 justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
            {product.category || "Article"}
          </span>
          <h3
            style={{ color: isDark ? "#F3F4F6" : store.textColor || "#1C1917" }}
            className="font-bold text-sm sm:text-base line-clamp-2 leading-snug mt-0.5"
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs opacity-70 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                style={{ color: store.primaryColor || "#EA580C" }}
                className="font-black text-base sm:text-lg"
              >
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs line-through opacity-50">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            style={{
              backgroundColor: isAdded
                ? "#10B981"
                : product.inStock
                ? isDark
                  ? "#272B38"
                  : "#1C1917"
                : "#9CA3AF",
              color: "#FFFFFF",
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {isAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Ajouté</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
