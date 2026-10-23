"use client";

import React from "react";
import { StoreThemeConfig, StoreSection, ProductItem } from "@/types/store";
import { getSectionTheme } from "./section-theme";
import { HeroSection } from "./sections/HeroSection";
import { ProductCatalog } from "./sections/ProductCatalog";
import {
  Marquee,
  StatsBand,
  BentoShowcase,
  Lookbook,
  FAQSection,
  CtaBanner,
} from "./sections/ModernSections";
import { Sparkles, Check, Star, Truck, ArrowRight } from "lucide-react";

interface SectionRendererProps {
  section: StoreSection;
  store: StoreThemeConfig;
  filteredProducts: ProductItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  addToCart: (product: ProductItem) => void;
  openWhatsAppDirect: (product: ProductItem) => void;
  addedNoticeId: string | null;
  formatPrice: (amount: number) => string;
}

export function SectionRenderer({
  section,
  store,
  filteredProducts,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  openWhatsAppDirect,
  addedNoticeId,
  formatPrice,
}: SectionRendererProps) {
  const t = getSectionTheme(store);

  switch (section.type) {
    case "HeroSection":
      return <HeroSection store={store} props={section.props} />;

    case "ProductGrid":
      return (
        <ProductCatalog
          store={store}
          props={section.props}
          filteredProducts={filteredProducts}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          addToCart={addToCart}
          openWhatsAppDirect={openWhatsAppDirect}
          addedNoticeId={addedNoticeId}
          formatPrice={formatPrice}
        />
      );

    case "Marquee":
      return <Marquee store={store} props={section.props} />;

    case "StatsBand":
      return <StatsBand store={store} props={section.props} />;

    case "BentoShowcase":
      return <BentoShowcase store={store} props={section.props} />;

    case "Lookbook":
      return <Lookbook store={store} props={section.props} />;

    case "FAQ":
      return <FAQSection store={store} props={section.props} />;

    case "CtaBanner":
      return <CtaBanner store={store} props={section.props} />;

    case "TrustBadges": {
      const badges =
        store.trustBadges && store.trustBadges.length > 0
          ? store.trustBadges
          : [
              { icon: "🚚", title: "Livraison rapide", description: `Livré à ${store.city || "Abidjan"}` },
              { icon: "💳", title: "Paiement Mobile", description: "Wave & Orange Money" },
              { icon: "⭐", title: "Qualité certifiée", description: "Vérifié avant expédition" },
              { icon: "💬", title: "SAV WhatsApp", description: "Réponse en quelques minutes" },
            ];
      return (
        <section
          style={{ backgroundColor: t.sectionBg, borderColor: t.border }}
          className="border-b py-5 px-4 transition-colors"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2">
                <div
                  style={{ backgroundColor: `${store.primaryColor}18`, color: store.primaryColor }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
                >
                  {badge.icon}
                </div>
                <div>
                  <h4 style={{ color: t.strong }} className="text-xs font-bold leading-none">{badge.title}</h4>
                  <p style={{ color: t.muted }} className="text-[11px] mt-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "FeaturedPromo": {
      const p = section.props || {};
      const title = p.title || store.layoutStructure?.featuredPromo?.title || "Offre Spéciale";
      const desc = p.description || store.layoutStructure?.featuredPromo?.description || "Découvrez nos offres incontournables disponibles en stock dès aujourd'hui.";
      const badge = p.badge || store.layoutStructure?.featuredPromo?.badge || "Coup de Cœur";
      const cta = p.ctaText || store.layoutStructure?.featuredPromo?.ctaText || "Profiter de l'offre";
      const img = p.image || store.layoutStructure?.featuredPromo?.image || store.products[0]?.image;
      return (
        <section className="py-6 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div
            style={{
              backgroundColor: t.isDark ? "#171A26" : `${store.primaryColor}10`,
              borderColor: t.isDark ? "rgba(255,255,255,0.1)" : `${store.primaryColor}30`,
            }}
            className="rounded-3xl border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden relative"
          >
            <div className="space-y-3 max-w-xl">
              <span style={{ backgroundColor: store.primaryColor }} className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                {badge}
              </span>
              <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h3>
              <p style={{ color: t.muted }} className="text-xs sm:text-sm leading-relaxed">{desc}</p>
              <div className="pt-2">
                <a href="#catalog" style={{ backgroundColor: store.primaryColor }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:brightness-110 transition active:scale-95">
                  <span>{cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            {img && (
              <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img src={img} alt="Offre Spéciale" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </section>
      );
    }

    case "Storytelling": {
      const p = section.props || {};
      const title = p.title || store.storytelling?.title || "Notre Savoir-Faire";
      const content = p.content || store.storytelling?.content || store.description;
      const highlights = p.highlights || store.storytelling?.highlights || ["Qualité garantie", "Service réactif", "Paiement 100% sécurisé"];
      return (
        <section className="py-10 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div
            style={{ backgroundColor: t.surface, borderColor: t.border }}
            className="rounded-3xl border p-6 sm:p-10 shadow-xs relative overflow-hidden"
          >
            <div className="max-w-3xl space-y-4">
              <div style={{ backgroundColor: `${store.primaryColor}18`, color: store.primaryColor }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Histoire & Engagement</span>
              </div>
              <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h3>
              <p style={{ color: t.isDark ? "#9CA3AF" : "#57534E" }} className="text-sm sm:text-base leading-relaxed">{content}</p>
              {highlights.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2.5">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: t.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: t.isDark ? "#E5E7EB" : "#292524" }}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border border-black/5 dark:border-white/5"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "Testimonials": {
      const p = section.props || {};
      const title = p.title || "Ce que disent nos clients";
      const subtitle = p.subtitle || `Avis vérifiés de commandes livrées à ${store.city || "Abidjan"}`;
      const testimonials =
        store.testimonials && store.testimonials.length > 0
          ? store.testimonials
          : [
              { name: "Koffi A.", location: store.city || "Abidjan", comment: "Commande reçue très rapidement, produit conforme et service client très gentil !", rating: 5 },
              { name: "Awa D.", location: store.city || "Abidjan", comment: "Paiement Wave instantané, super pratique pour commander sans tracasseries.", rating: 5 },
              { name: "Fatou N.", location: store.city || "Abidjan", comment: "La qualité est au rendez-vous, je recommande vivement cette boutique.", rating: 5 },
            ];
      return (
        <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="text-center space-y-1">
            <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl font-black tracking-tight">{title}</h3>
            <p style={{ color: t.muted }} className="text-xs">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((tm, idx) => (
              <div key={idx} style={{ backgroundColor: t.surface, borderColor: t.border }} className="p-5 rounded-2xl border shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(tm.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p style={{ color: t.isDark ? "#D1D5DB" : "#374151" }} className="text-xs italic leading-relaxed">&quot;{tm.comment}&quot;</p>
                </div>
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span style={{ color: t.strong }} className="text-xs font-bold">{tm.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">{tm.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "DeliveryZones": {
      const zones = store.deliveryZones || [];
      if (zones.length === 0) return null;
      return (
        <section className="py-6 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div style={{ backgroundColor: t.surface, borderColor: t.border }} className="rounded-3xl border p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-500" />
              <h4 style={{ color: t.strong }} className="text-sm font-bold uppercase tracking-wider">Zones de Livraison à {store.city || "Abidjan"}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  style={{ backgroundColor: t.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderColor: t.border }}
                  className="p-3 rounded-2xl border flex items-center justify-between text-xs"
                >
                  <span style={{ color: t.isDark ? "#D1D5DB" : "#374151" }} className="font-medium">{zone.name}</span>
                  <span style={{ color: store.primaryColor }} className="font-bold font-mono">{zone.fee === 0 ? "Gratuit" : formatPrice(zone.fee)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
