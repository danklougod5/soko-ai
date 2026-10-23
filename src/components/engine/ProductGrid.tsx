"use client";

import React, { useState } from "react";
import { ProductItem, ProductCategory, StoreThemeConfig } from "@/types/store";
import { ProductCard } from "./ProductCard";
import { Search, ShoppingBag } from "lucide-react";

interface ProductGridProps {
  store: StoreThemeConfig;
  onAddToCart: (product: ProductItem) => void;
  onQuickWhatsApp?: (product: ProductItem) => void;
}

export function ProductGrid({
  store,
  onAddToCart,
  onQuickWhatsApp,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isDark =
    store.style === "modern" ||
    (store.backgroundColor &&
      (store.backgroundColor.startsWith("#0") || store.backgroundColor.startsWith("#1")));

  const categories = store.categories || [];
  const products = store.products || [];

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              backgroundColor:
                selectedCategory === "all"
                  ? store.primaryColor || "#EA580C"
                  : isDark
                  ? "#181B26"
                  : "#F3F4F6",
              color:
                selectedCategory === "all"
                  ? "#FFFFFF"
                  : isDark
                  ? "#E5E7EB"
                  : "#374151",
            }}
            className="px-4 py-2 rounded-full text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer shadow-xs"
          >
            Tous les articles ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
            ).length;
            const isSelected =
              selectedCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  backgroundColor: isSelected
                    ? store.primaryColor || "#EA580C"
                    : isDark
                    ? "#181B26"
                    : "#F3F4F6",
                  color: isSelected
                    ? "#FFFFFF"
                    : isDark
                    ? "#E5E7EB"
                    : "#374151",
                }}
                className="px-4 py-2 rounded-full text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>{cat.name}</span>
                {count > 0 && <span className="opacity-60 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              store={store}
              onAddToCart={onAddToCart}
              onQuickWhatsApp={onQuickWhatsApp}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center opacity-60">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm">Aucun article trouvé</h4>
          <p className="text-xs opacity-60 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés.`
              : "Aucun article disponible dans cette catégorie pour le moment."}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs font-semibold text-orange-600 underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
