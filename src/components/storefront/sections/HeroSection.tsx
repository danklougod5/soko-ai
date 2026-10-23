"use client";

import React from "react";
import { StoreThemeConfig, HeroSectionProps } from "@/types/store";
import { getSectionTheme, mapHeroType } from "../section-theme";
import {
  Sparkles,
  Flame,
  Award,
  ArrowRight,
  MessageCircle,
  Star,
  Truck,
  ShieldCheck,
} from "lucide-react";

interface HeroSectionPropsFull {
  store: StoreThemeConfig;
  props?: HeroSectionProps;
}

function ctaHrefWhatsapp(store: StoreThemeConfig): string {
  return `https://wa.me/${(store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "")}`;
}

export function HeroSection({ store, props = {} }: HeroSectionPropsFull) {
  const t = getSectionTheme(store);
  const variant = props.variant ?? mapHeroType(store);
  const headline = props.headline || store.hero?.headline || store.storeName;
  const subheadline = props.subheadline || store.hero?.subheadline || store.description;
  const badgeText = props.badgeText || store.hero?.badgeText || "★ Nouvelle collection 2026";
  const ctaText = props.ctaText || store.hero?.ctaText || "Explorer la collection";
  const bgImage = props.backgroundImage || store.hero?.backgroundImage || store.products[0]?.image;
  const wa = ctaHrefWhatsapp(store);

  const primaryCta = (
    <a
      href="#catalog"
      style={{ backgroundColor: store.primaryColor, color: "#FFFFFF" }}
      className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
    >
      <span>{ctaText}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </a>
  );

  const waCta = (
    <a
      href={wa}
      target="_blank"
      rel="noreferrer"
      className="px-5 py-3 rounded-full font-semibold text-xs border transition inline-flex items-center gap-2 cursor-pointer"
      style={{
        backgroundColor: t.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        borderColor: t.isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        color: t.isDark ? "#FFFFFF" : "#1C1917",
      }}
    >
      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
      <span>WhatsApp direct</span>
    </a>
  );

  const badge = (light = false) => (
    <div
      style={{
        backgroundColor: light ? "rgba(255,255,255,0.14)" : `${store.primaryColor}18`,
        borderColor: light ? "rgba(255,255,255,0.35)" : `${store.primaryColor}40`,
        color: light ? "#FFFFFF" : store.primaryColor,
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-xs backdrop-blur"
    >
      {t.isWarm ? <Flame className="h-3.5 w-3.5" /> : t.isArtisanat ? <Award className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      <span>{badgeText}</span>
    </div>
  );

  // ── FULL BANNER ───────────────────────────────────────────────
  if (variant === "full_banner") {
    return (
      <section className="relative overflow-hidden min-h-[440px] sm:min-h-[540px] flex items-center justify-center px-4 sm:px-6">
        <img
          src={bgImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"}
          alt={store.storeName}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
        <div className="relative max-w-3xl mx-auto text-center space-y-5 py-14 text-white">
          {badge(true)}
          <h1
            style={{ fontFamily: t.headingFont }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] drop-shadow-sm"
          >
            {headline}
          </h1>
          <p className="text-sm sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">{primaryCta}{waCta}</div>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-white/75">
            <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-emerald-400" /> Livraison à {store.city || "Abidjan"}</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Paiement Wave & Orange Money</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {store.trustBadges?.[0]?.title || "Satisfaction garantie"}</span>
          </div>
        </div>
      </section>
    );
  }

  // ── EDITORIAL (magazine) ──────────────────────────────────────
  if (variant === "editorial") {
    return (
      <section
        style={{ backgroundColor: t.isDark ? "#0B0C10" : store.backgroundColor || "#FAF8F5", borderColor: t.border }}
        className="relative overflow-hidden border-b"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="md:col-span-6 md:order-1 space-y-5">
            <span
              style={{ color: store.primaryColor }}
              className="block text-[11px] font-bold uppercase tracking-[0.35em]"
            >
              {badgeText}
            </span>
            <h1
              style={{ color: t.strong, fontFamily: t.headingFont }}
              className="text-4xl sm:text-6xl font-black tracking-tighter leading-[0.95]"
            >
              {headline}
            </h1>
            <p style={{ color: t.muted }} className="text-sm sm:text-base leading-relaxed max-w-md">
              {subheadline}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">{primaryCta}{waCta}</div>
          </div>
          <div className="md:col-span-6 md:order-2">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group">
              <img
                src={bgImage || store.products[0]?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000"}
                alt={store.storeName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-5 left-5">
                <span style={{ backgroundColor: store.primaryColor }} className="text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  Édition limitée
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── MINIMAL TYPE ──────────────────────────────────────────────
  if (variant === "minimal") {
    return (
      <section
        style={{ backgroundColor: store.backgroundColor || (t.isDark ? "#0B0C10" : "#FFFFFF") }}
        className="relative px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {badge()}
          <h1
            style={{ color: t.strong, fontFamily: t.headingFont }}
            className="text-4xl sm:text-7xl font-black tracking-tighter leading-[0.95]"
          >
            {headline}
          </h1>
          <p style={{ color: t.muted }} className="text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">{primaryCta}{waCta}</div>
        </div>
      </section>
    );
  }

  // ── BENTO GRID ────────────────────────────────────────────────
  if (variant === "bento") {
    const tiles = store.products.slice(0, 3);
    return (
      <section
        style={{ backgroundColor: t.isDark ? "#0B0C10" : store.backgroundColor || "#FAF8F5" }}
        className="px-4 sm:px-6 py-10 sm:py-14"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[140px] sm:auto-rows-[180px]">
          <div className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden shadow-xl group">
            <img
              src={bgImage || store.products[0]?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"}
              alt={store.storeName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end text-white space-y-2">
              <div>{badge(true)}</div>
              <h1 style={{ fontFamily: t.headingFont }} className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                {headline}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed line-clamp-2">{subheadline}</p>
            </div>
          </div>

          {tiles.map((product, i) => (
            <div
              key={product.id || i}
              className="relative rounded-3xl overflow-hidden shadow-md group border"
              style={{ borderColor: t.border }}
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[11px] font-bold line-clamp-1">{product.name}</p>
                <p className="text-[11px] font-mono text-emerald-300">
                  {product.price.toLocaleString("fr-FR")} {store.currencySymbol || "FCFA"}
                </p>
              </div>
            </div>
          ))}

          <div
            style={{ backgroundColor: store.primaryColor }}
            className="col-span-2 rounded-3xl p-5 sm:p-6 flex flex-col justify-between text-white shadow-md"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">{store.tagline || "Commande simple & rapide"}</p>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs opacity-90">{store.paymentMethods?.includes("cod") ? "Wave • Orange Money • Cash" : "Paiement mobile sécurisé"}</div>
              <a href="#catalog" className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3.5 py-2 rounded-full text-[11px] font-bold hover:bg-white/30 transition">
                <span>{ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── SPLIT (default for mode/luxe) ─────────────────────────────
  if (variant === "split") {
    return (
      <section
        style={{
          background: t.isDark
            ? "linear-gradient(180deg, #0B0C10 0%, #11131A 100%)"
            : t.isWarm
            ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FEE2E2 100%)"
            : "linear-gradient(180deg, #FAF8F5 0%, #F5F0E6 100%)",
          color: t.isDark ? "#FFFFFF" : "#451A03",
          borderBottom: `1px solid ${t.border}`,
        }}
        className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6"
      >
        {bgImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url(${bgImage})` }} />
        )}
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-2">
          <div className="text-left space-y-4 order-2 md:order-1">
            {badge()}
            <h1 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {headline}
            </h1>
            <p style={{ color: t.isDark ? "#9CA3AF" : "#4B5563" }} className="text-sm sm:text-base leading-relaxed max-w-lg">
              {subheadline}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">{primaryCta}{waCta}</div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src={bgImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000"}
                alt={store.storeName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">Collection Signature</span>
                <span className="text-xs font-bold font-mono text-emerald-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">Dispo en stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── CENTERED (fallback) ───────────────────────────────────────
  return (
    <section
      style={{
        background: t.isDark
          ? "linear-gradient(180deg, #0B0C10 0%, #11131A 100%)"
          : t.isWarm
          ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FEE2E2 100%)"
          : "linear-gradient(180deg, #FAF8F5 0%, #F5F0E6 100%)",
        color: t.strong,
        borderBottom: `1px solid ${t.border}`,
      }}
      className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-6"
    >
      {bgImage && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url(${bgImage})` }} />
      )}
      <div className="relative max-w-4xl mx-auto text-center space-y-4">
        {badge()}
        <h1 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          {headline}
        </h1>
        <p style={{ color: t.isDark ? "#9CA3AF" : "#57534E" }} className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">{primaryCta}{waCta}</div>
      </div>
    </section>
  );
}
