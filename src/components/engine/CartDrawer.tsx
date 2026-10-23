"use client";

import React from "react";
import { CartItem, StoreThemeConfig } from "@/types/store";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  store: StoreThemeConfig;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  store,
  onUpdateQuantity,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} ${store.currencySymbol || "FCFA"}`;
  };

  const isDark =
    store.style === "modern" ||
    (store.backgroundColor &&
      (store.backgroundColor.startsWith("#0") || store.backgroundColor.startsWith("#1")));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          style={{
            backgroundColor: isDark ? "#11131A" : "#FFFFFF",
            color: isDark ? "#F3F4F6" : "#1C1917",
          }}
          className="w-screen max-w-md flex flex-col shadow-2xl border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-base">Votre Panier</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 font-bold">
                {totalItems} {totalItems > 1 ? "articles" : "article"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center opacity-50">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Votre panier est vide</h4>
                  <p className="text-xs opacity-60 mt-1 max-w-xs">
                    Parcourez les produits et ajoutez vos articles préférés en un clic.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: store.primaryColor || "#EA580C",
                    color: "#FFFFFF",
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  Voir les articles
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 items-center justify-between"
                >
                  <img
                    src={
                      item.product.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
                    }
                    alt={item.product.name}
                    className="h-14 w-14 rounded-lg object-cover bg-neutral-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs truncate">
                      {item.product.name}
                    </h5>
                    <p
                      style={{ color: store.primaryColor || "#EA580C" }}
                      className="font-extrabold text-xs mt-0.5"
                    >
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="h-3 w-3 text-red-500" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </button>
                    <span className="w-6 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-neutral-900/60">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70">Sous-total</span>
                <span className="font-bold text-sm">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] opacity-60">
                Frais de livraison calculés à l'étape suivante selon votre commune.
              </p>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                style={{
                  backgroundColor: store.primaryColor || "#EA580C",
                  color: "#FFFFFF",
                }}
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Passer la commande</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
