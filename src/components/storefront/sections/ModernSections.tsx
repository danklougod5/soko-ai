"use client";

import React from "react";
import {
  StoreThemeConfig,
  MarqueeProps,
  StatsBandProps,
  BentoShowcaseProps,
  LookbookProps,
  FAQProps,
  CtaBannerProps,
} from "@/types/store";
import { getSectionTheme } from "../section-theme";
import { Sparkles, Star, Truck, ShieldCheck, MessageCircle, ArrowRight, Plus } from "lucide-react";

const WA = (store: StoreThemeConfig) =>
  `https://wa.me/${(store.merchantWhatsapp || "2250700000000").replace(/[^0-9]/g, "")}`;

// ── MARQUEE (bandeau défilant) ────────────────────────────────
export function Marquee({ store, props = {} }: { store: StoreThemeConfig; props?: MarqueeProps }) {
  const items =
    props.items && props.items.length > 0
      ? props.items
      : store.marqueeItems && store.marqueeItems.length > 0
      ? store.marqueeItems
      : store.trustBadges?.map((b) => b.title) || [
          "Livraison rapide",
          "Paiement Wave & Orange Money",
          "Satisfaction garantie",
          "Commande WhatsApp",
          "Produits vérifiés",
        ];
  const loop = [...items, ...items];
  return (
    <section
      style={{ backgroundColor: store.secondaryColor || "#111", color: "#fff" }}
      className="overflow-hidden py-3 border-y border-white/10 group/marquee"
    >
      <style>{`
        @keyframes soko-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .soko-marquee-track { animation: soko-marquee 26s linear infinite; }
        .group\\/marquee:hover .soko-marquee-track { animation-play-state: paused; }
      `}</style>
      <div className="flex whitespace-nowrap soko-marquee-track w-max">
        {loop.map((item, i) => (
          <span key={i} className="mx-6 text-xs sm:text-sm font-semibold uppercase tracking-widest inline-flex items-center gap-3 opacity-90">
            <span style={{ color: store.accentColor || store.primaryColor }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

// ── STATS BAND ────────────────────────────────────────────────
export function StatsBand({ store, props = {} }: { store: StoreThemeConfig; props?: StatsBandProps }) {
  const t = getSectionTheme(store);
  const stats =
    props.stats && props.stats.length > 0
      ? props.stats
      : store.stats && store.stats.length > 0
      ? store.stats
      : [
          { value: `${store.products?.length || 8}+`, label: "Produits en stock" },
          { value: "4.9★", label: "Note des clients" },
          { value: store.city || "Abidjan", label: "Livraison locale" },
          { value: "24h", label: "Expédition express" },
        ];
  return (
    <section className="px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full">
      <div
        style={{ backgroundColor: t.isDark ? "#12141F" : `${store.primaryColor}0D`, borderColor: t.border }}
        className="rounded-3xl border grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
      >
        {stats.map((s, i) => (
          <div key={i} className="p-6 text-center">
            <p style={{ color: store.primaryColor, fontFamily: t.headingFont }} className="text-3xl sm:text-4xl font-black tracking-tight">
              {s.value}
            </p>
            <p style={{ color: t.muted }} className="text-[11px] font-semibold uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── BENTO SHOWCASE ────────────────────────────────────────────
export function BentoShowcase({ store, props = {} }: { store: StoreThemeConfig; props?: BentoShowcaseProps }) {
  const t = getSectionTheme(store);
  const title = props.title || store.storytelling?.title || "Pourquoi nous choisir";
  const subtitle = props.subtitle || store.tagline || store.description;
  const feature = store.products?.[0];
  const secondary = store.products?.[1];
  return (
    <section className="px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          style={{ backgroundColor: t.isDark ? "#12141F" : "#FFFFFF", borderColor: t.border }}
          className="md:col-span-2 rounded-3xl border p-6 sm:p-8 flex flex-col justify-between shadow-sm min-h-[220px]"
        >
          <div className="space-y-3">
            <span
              style={{ backgroundColor: `${store.primaryColor}18`, color: store.primaryColor }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" /> L&apos;essentiel
            </span>
            <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight">
              {title}
            </h3>
            <p style={{ color: t.muted }} className="text-sm leading-relaxed max-w-xl line-clamp-3">
              {subtitle}
            </p>
          </div>
          <div className="pt-5 flex flex-wrap gap-2">
            {(store.trustBadges || []).slice(0, 3).map((b, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border" style={{ borderColor: t.border, color: t.strong }}>
                <span>{b.icon}</span> {b.title}
              </span>
            ))}
          </div>
        </div>

        {feature && (
          <div className="relative rounded-3xl overflow-hidden shadow-md group min-h-[220px]">
            <img src={feature.image} alt={feature.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">{store.city || "Disponible"}</p>
              <p className="text-base font-black leading-tight line-clamp-2">{feature.name}</p>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: store.primaryColor }} className="rounded-3xl p-6 flex flex-col justify-between text-white shadow-md min-h-[180px]">
          <Truck className="h-7 w-7 opacity-90" />
          <div>
            <p className="text-2xl font-black leading-none">Livraison</p>
            <p className="text-xs opacity-90 mt-1">Rapide et fiable à {store.city || "Abidjan"}</p>
          </div>
        </div>

        {secondary && (
          <div className="relative rounded-3xl overflow-hidden shadow-md group min-h-[180px]">
            <img src={secondary.image} alt={secondary.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-bold line-clamp-2">{secondary.name}</div>
          </div>
        )}

        <div
          style={{ backgroundColor: t.isDark ? "#12141F" : "#FFFFFF", borderColor: t.border }}
          className="rounded-3xl border p-6 flex flex-col justify-between shadow-sm min-h-[180px]"
        >
          <ShieldCheck className="h-7 w-7" style={{ color: store.primaryColor }} />
          <div>
            <p style={{ color: t.strong }} className="text-sm font-bold">Paiement 100% sécurisé</p>
            <p style={{ color: t.muted }} className="text-xs mt-1">Wave · Orange Money · Cash à la livraison</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── LOOKBOOK (galerie éditoriale) ─────────────────────────────
export function Lookbook({ store, props = {} }: { store: StoreThemeConfig; props?: LookbookProps }) {
  const t = getSectionTheme(store);
  const images =
    props.images && props.images.length > 0
      ? props.images
      : (store.products || []).map((p) => p.image).filter(Boolean).slice(0, 6);
  if (images.length === 0) return null;
  const title = props.title || "En images";
  const subtitle = props.subtitle || `Découvrez l'univers ${store.storeName}`;
  return (
    <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full space-y-6">
      <div className="text-center space-y-1">
        <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight">
          {title}
        </h3>
        <p style={{ color: t.muted }} className="text-xs sm:text-sm">
          {subtitle}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative rounded-2xl overflow-hidden group ${i === 0 ? "col-span-2 md:col-span-1 md:row-span-2 md:aspect-auto aspect-[4/3]" : "aspect-square"}`}
          >
            <img src={img} alt={`${store.storeName} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
export function FAQSection({ store, props = {} }: { store: StoreThemeConfig; props?: FAQProps }) {
  const t = getSectionTheme(store);
  const title = props.title || "Questions fréquentes";
  const items =
    props.items && props.items.length > 0
      ? props.items
      : store.faq && store.faq.length > 0
      ? store.faq
      : [
          { question: "Comment passer commande ?", answer: "Ajoutez vos articles au panier, remplissez vos coordonnées et validez. Vous pouvez aussi nous écrire directement sur WhatsApp." },
          { question: "Quels modes de paiement acceptez-vous ?", answer: "Wave, Orange Money, MTN MoMo et le paiement en espèces à la livraison." },
          { question: "Livrez-vous dans ma zone ?", answer: `Nous livrons à ${store.city || "Abidjan"} et ses environs. Les frais et délais dépendent de votre commune.` },
          { question: "Puis-je échanger un article ?", answer: "Oui, contactez-nous sur WhatsApp dans les 48h suivant la réception pour organiser un échange." },
        ];
  return (
    <section className="px-4 sm:px-6 py-10 max-w-3xl mx-auto w-full">
      <h3 style={{ color: t.strong, fontFamily: t.headingFont }} className="text-2xl sm:text-3xl font-black tracking-tight text-center mb-6">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            style={{ backgroundColor: t.surface, borderColor: t.border }}
            className="group rounded-2xl border px-5 py-4 shadow-xs open:shadow-sm transition"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
              <span style={{ color: t.strong }} className="text-sm font-bold">{item.question}</span>
              <Plus className="h-4 w-4 shrink-0 transition-transform group-open:rotate-45" style={{ color: store.primaryColor }} />
            </summary>
            <p style={{ color: t.muted }} className="text-xs sm:text-sm leading-relaxed mt-3">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── CTA BANNER ────────────────────────────────────────────────
export function CtaBanner({ store, props = {} }: { store: StoreThemeConfig; props?: CtaBannerProps }) {
  const t = getSectionTheme(store);
  const headline = props.headline || store.hero?.headline || `Prêt à commander chez ${store.storeName} ?`;
  const subheadline = props.subheadline || "Passez commande en quelques clics, livraison rapide à " + (store.city || "Abidjan") + ".";
  const ctaText = props.ctaText || "Commander maintenant";
  return (
    <section className="px-4 sm:px-6 py-12 max-w-6xl mx-auto w-full">
      <div
        style={{ background: `linear-gradient(120deg, ${store.primaryColor} 0%, ${store.secondaryColor || "#111827"} 100%)` }}
        className="relative overflow-hidden rounded-[2rem] px-6 sm:px-12 py-12 sm:py-16 text-center text-white shadow-2xl"
      >
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/20 blur-2xl" />
        <div className="relative max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-bold uppercase tracking-widest">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> {store.trustBadges?.[0]?.title || "Commande rapide & sécurisée"}
          </div>
          <h3 style={{ fontFamily: t.headingFont }} className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {headline}
          </h3>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed">{subheadline}</p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a href="#catalog" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-white/90 transition active:scale-95">
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a href={WA(store)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/40 bg-white/10 backdrop-blur px-5 py-3 rounded-full font-semibold text-xs hover:bg-white/20 transition">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
