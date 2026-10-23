"use client";

import React from "react";
import { StoreThemeConfig, ProductGridProps, ProductItem } from "@/types/store";
import { getSectionTheme, mapCatalogLayout } from "../section-theme";
import { MessageCircle, Plus, Check, ArrowRight } from "lucide-react";

interface ProductCatalogProps {
  store: StoreThemeConfig;
  props?: ProductGridProps;
  filteredProducts: ProductItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  addToCart: (product: ProductItem) => void;
  openWhatsAppDirect: (product: ProductItem) => void;
  addedNoticeId: string | null;
  formatPrice: (amount: number) => string;
}

export function ProductCatalog({
  store,
  props = {},
  filteredProducts,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  openWhatsAppDirect,
  addedNoticeId,
  formatPrice,
}: ProductCatalogProps) {
  const t = getSectionTheme(store);
  const layout = props.layout ?? mapCatalogLayout(store);
  const title = props.title || "Notre Catalogue";
  const subtitle =
    props.subtitle ||
    (store.paymentMethods?.includes("cod")
      ? "Commandez en ligne avec Wave, Orange Money ou paiement à la livraison"
      : "Commandez en ligne, livraison rapide");

  const AddButton = ({ product, full = false }: { product: ProductItem; full?: boolean }) => {
    const isJustAdded = addedNoticeId === product.id;
    return (
      <button
        onClick={() => addToCart(product)}
        style={{ backgroundColor: isJustAdded ? "#10B981" : store.primaryColor, color: "#FFFFFF" }}
        className={`${full ? "flex-1" : ""} py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-110 active:scale-[0.98] transition cursor-pointer`}
      >
        {isJustAdded ? (
          <><Check className="h-3.5 w-3.5 stroke-[3]" /><span>Ajouté !</span></>
        ) : (
          <><Plus className="h-3.5 w-3.5 stroke-[3]" /><span>Ajouter au panier</span></>
        )}
      </button>
    );
  };

  const WaButton = ({ product, full = false }: { product: ProductItem; full?: boolean }) => (
    <button
      onClick={() => openWhatsAppDirect(product)}
      title="Commander directement sur WhatsApp"
      className={`${full ? "flex-1" : "col-span-1"} flex items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 hover:bg-emerald-500/25 transition active:scale-95 cursor-pointer py-2.5`}
    >
      <MessageCircle className="h-4 w-4" />
    </button>
  );

  const Price = ({ product, size = "lg" }: { product: ProductItem; size?: "lg" | "sm" }) => (
    <div className="flex items-baseline gap-2">
      <span style={{ color: t.strong }} className={`${size === "lg" ? "text-lg" : "text-base"} font-black tracking-tight`}>
        {formatPrice(product.price)}
      </span>
      {product.originalPrice && (
        <span className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
      )}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          style={{ backgroundColor: t.isDark ? "#12141C" : "#FFFFFF", borderColor: t.isDark ? "rgba(255,255,255,0.08)" : t.isWarm ? "#FDE68A" : "rgba(0,0,0,0.08)" }}
          className="group relative rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
        >
          <div className="relative aspect-[4/3] w-full bg-black/10 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            {product.badge && (
              <span style={{ backgroundColor: store.primaryColor }} className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                {product.badge}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-600 text-[10px] font-bold text-white uppercase shadow-md">Promo</span>
            )}
          </div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h4 style={{ color: t.strong }} className="font-bold text-sm sm:text-base leading-snug line-clamp-1">{product.name}</h4>
              <p style={{ color: t.muted }} className="text-xs line-clamp-2 leading-relaxed">{product.description}</p>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
              <Price product={product} />
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3 flex"><AddButton product={product} full /></div>
                <WaButton product={product} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEditorial = () => {
    const [feature, ...rest] = filteredProducts;
    if (!feature) return null;
    return (
      <div className="space-y-6">
        <div
          style={{ backgroundColor: t.isDark ? "#12141C" : "#FFFFFF", borderColor: t.border }}
          className="grid grid-cols-1 md:grid-cols-2 rounded-3xl border overflow-hidden shadow-md group"
        >
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px] overflow-hidden">
            <img src={feature.image} alt={feature.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            {feature.badge && (
              <span style={{ backgroundColor: store.primaryColor }} className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                {feature.badge}
              </span>
            )}
          </div>
          <div className="p-6 sm:p-10 flex flex-col justify-center space-y-4">
            <span style={{ color: store.primaryColor }} className="text-[11px] font-bold uppercase tracking-[0.3em]">Pièce maîtresse</span>
            <h4 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight">{feature.name}</h4>
            <p style={{ color: t.muted }} className="text-sm leading-relaxed">{feature.description}</p>
            <Price product={feature} />
            <div className="pt-2 flex flex-wrap gap-3">
              <div className="flex-1 min-w-[160px] flex"><AddButton product={feature} full /></div>
              <div className="flex min-w-[60px]"><WaButton product={feature} full /></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((product) => (
            <div
              key={product.id}
              style={{ backgroundColor: t.isDark ? "#12141C" : "#FFFFFF", borderColor: t.border }}
              className="group rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-4 space-y-3">
                <h4 style={{ color: t.strong }} className="font-bold text-sm line-clamp-1">{product.name}</h4>
                <Price product={product} size="sm" />
                <div className="flex gap-2"><AddButton product={product} full /><WaButton product={product} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMasonry = () => (
    <div className="columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
      {filteredProducts.map((product, i) => (
        <div
          key={product.id}
          style={{ backgroundColor: t.isDark ? "#12141C" : "#FFFFFF", borderColor: t.border }}
          className="group mb-5 break-inside-avoid rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition"
        >
          <div className={`relative overflow-hidden ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            {product.badge && (
              <span style={{ backgroundColor: store.primaryColor }} className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-md">{product.badge}</span>
            )}
          </div>
          <div className="p-4 space-y-2.5">
            <h4 style={{ color: t.strong }} className="font-bold text-sm line-clamp-1">{product.name}</h4>
            <Price product={product} size="sm" />
            <div className="flex gap-2"><AddButton product={product} full /><WaButton product={product} /></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMinimalList = () => (
    <div className="divide-y" style={{ borderColor: t.border }}>
      {filteredProducts.map((product) => (
        <div key={product.id} className="flex items-center gap-4 py-4 group border-t first:border-t-0" style={{ borderColor: t.border }}>
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden shrink-0 bg-black/5">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 style={{ color: t.strong }} className="font-bold text-sm line-clamp-1">{product.name}</h4>
            <p style={{ color: t.muted }} className="text-xs line-clamp-1 mt-0.5">{product.description}</p>
            <div className="mt-2"><Price product={product} size="sm" /></div>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-40"><AddButton product={product} full /></div>
            <div className="w-12"><WaButton product={product} full /></div>
          </div>
          <button
            onClick={() => addToCart(product)}
            style={{ backgroundColor: store.primaryColor, color: "#FFFFFF" }}
            className="sm:hidden h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      ))}
    </div>
  );

  const layouts: Record<string, () => React.ReactElement | null> = {
    grid: renderGrid,
    editorial_cards: renderEditorial,
    masonry: renderMasonry,
    minimal_list: renderMinimalList,
  };
  const renderLayout = layouts[layout] ?? renderGrid;

  return (
    <main id="catalog" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-4" style={{ borderColor: t.border }}>
        <div>
          <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h3>
          <p style={{ color: t.muted }} className="text-xs sm:text-sm mt-1">{subtitle}</p>
        </div>
        <span className="text-xs font-mono text-slate-400">{filteredProducts.length} article(s) disponible(s)</span>
      </div>

      {store.categories && store.categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            style={selectedCategory === "all" ? { backgroundColor: store.primaryColor, color: "#FFFFFF" } : { backgroundColor: t.isDark ? "#171A24" : "#FFFFFF", borderColor: t.border, color: t.isDark ? "#D1D5DB" : "#4B5563" }}
            className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer shadow-xs"
          >
            Tous les articles
          </button>
          {store.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={selectedCategory === cat.id ? { backgroundColor: store.primaryColor, color: "#FFFFFF" } : { backgroundColor: t.isDark ? "#171A24" : "#FFFFFF", borderColor: t.border, color: t.isDark ? "#D1D5DB" : "#4B5563" }}
              className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer shadow-xs"
            >
              {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {renderLayout()}

      <div className="pt-2 flex justify-center">
        <a
          href={`https://wa.me/${(store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full border transition hover:opacity-80"
          style={{ borderColor: store.primaryColor, color: store.primaryColor }}
        >
          <span>Une question ? Commandez sur WhatsApp</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </main>
  );
}
