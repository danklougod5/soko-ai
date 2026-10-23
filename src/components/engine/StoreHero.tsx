"use client";

import React from "react";
import { StoreThemeConfig } from "@/types/store";
import { Sparkles, Flame, Award, ArrowRight, ShieldCheck } from "lucide-react";

interface StoreHeroProps {
  store: StoreThemeConfig;
  onCtaClick?: () => void;
}

export function StoreHero({ store, onCtaClick }: StoreHeroProps) {
  const isDark =
    store.style === "modern" ||
    (store.backgroundColor &&
      (store.backgroundColor.startsWith("#0") || store.backgroundColor.startsWith("#1")));
  const isWarm = store.style === "warm";
  const isArtisanat = store.style === "artisanat";

  const heroHeadline = store.hero?.headline || store.storeName || "Boutique Officielle";
  const heroSubheadline =
    store.hero?.subheadline || store.description || "Commandez en ligne et payez facilement.";
  const badgeText = store.hero?.badgeText || "★ Sélection 2026";
  const ctaText = store.hero?.ctaText || "Voir les articles";

  return (
    <section
      style={{
        background: isDark
          ? "linear-gradient(180deg, #0B0C10 0%, #11131A 100%)"
          : isWarm
          ? "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FEE2E2 100%)"
          : "linear-gradient(180deg, #FAF8F5 0%, #F5F0E6 100%)",
        color: isDark ? "#FFFFFF" : isWarm ? "#1C1917" : "#451A03",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
      }}
      className="relative overflow-hidden py-12 sm:py-18 px-4 sm:px-6 transition-all duration-300"
    >
      {/* Background image overlay if provided */}
      {store.hero?.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url(${store.hero.backgroundImage})` }}
        />
      )}

      <div className="relative max-w-4xl mx-auto text-center space-y-5">
        {/* Badge */}
        <div
          style={{
            backgroundColor: `${store.primaryColor || "#EA580C"}18`,
            borderColor: `${store.primaryColor || "#EA580C"}40`,
            color: store.primaryColor || "#EA580C",
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-xs"
        >
          {isWarm && <Flame className="h-3.5 w-3.5" />}
          {isDark && <Sparkles className="h-3.5 w-3.5" />}
          {isArtisanat && <Award className="h-3.5 w-3.5" />}
          <span>{badgeText}</span>
        </div>

        {/* Hero Headline */}
        <h2
          style={{
            color: isDark ? "#FFFFFF" : isWarm ? "#1C1917" : "#451A03",
            fontFamily: store.fontHeading ? `"${store.fontHeading}", sans-serif` : "inherit",
          }}
          className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto"
        >
          {heroHeadline}
        </h2>

        {/* Hero Subheadline */}
        <p
          style={{ color: isDark ? "#9CA3AF" : isWarm ? "#4B5563" : "#57534E" }}
          className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          {heroSubheadline}
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onCtaClick}
            style={{
              backgroundColor: store.primaryColor || "#EA580C",
              color: "#FFFFFF",
            }}
            className="px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-2 cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {store.merchantWhatsapp && (
            <a
              href={`https://wa.me/${store.merchantWhatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl font-semibold text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition flex items-center gap-2"
            >
              <span>Discuter sur WhatsApp</span>
            </a>
          )}
        </div>

        {/* Micro reassurance badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs opacity-75">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Paiement Wave & OM
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Commandes traitées en direct
          </span>
        </div>
      </div>
    </section>
  );
}
