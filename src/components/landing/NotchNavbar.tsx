"use client";

import React from "react";
import { Sparkles, ArrowRight, Zap, ShoppingBag } from "lucide-react";

interface NotchNavbarProps {
  onScrollToBuilder: () => void;
  onOpenStudio: () => void;
  onSelectCategory?: (prompt: string) => void;
  visible?: boolean;
  className?: string;
}

export function NotchNavbar({
  onScrollToBuilder,
  onOpenStudio,
  onSelectCategory,
  visible = true,
  className = "",
}: NotchNavbarProps) {
  const navLinks = [
    {
      label: "Fonctionnalités",
      action: () => {
        const el = document.getElementById("solutions");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          onScrollToBuilder();
        }
      },
    },
    {
      label: "Paiements",
      action: () => {
        const el = document.getElementById("solutions");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          onScrollToBuilder();
        }
      },
    },
    {
      label: "WhatsApp",
      action: () => {
        if (onSelectCategory) {
          onSelectCategory(
            "Catalogue express 1-clic pour vendeur Instagram à Abidjan, commandes directes sur mon numéro WhatsApp avec récapitulatif du panier."
          );
        } else {
          onScrollToBuilder();
        }
      },
    },
    {
      label: "Boutiques",
      action: () => {
        const el = document.getElementById("showcase");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          onScrollToBuilder();
        }
      },
    },
    {
      label: "Studio Live",
      badge: "PRO",
      action: onOpenStudio,
    },
  ];

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-start select-none transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-full pointer-events-none"
      } ${className}`}
    >
      {/* Left Inverted Corner Fillet / Swoop */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0 text-black hidden sm:block"
        aria-hidden="true"
      >
        <path d="M0 0 C10 0 20 10 20 20 L20 0 Z" fill="#000000" />
        <path
          d="M0 0.5 C10 0.5 19.5 10 19.5 20"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Main Notch Body */}
      <div className="h-[52px] bg-black text-white px-3 sm:px-5 flex items-center justify-between gap-3 sm:gap-6 md:gap-8 rounded-b-[20px] shadow-[0_12px_36px_rgba(0,0,0,0.85)] border-b border-x border-white/12">
        {/* Left: 3D Glossy App Icon + Brand Name */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {/* Glossy 3D Squircle Icon (Supaste style in flame gradient) */}
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 p-[1px] shadow-[0_2px_10px_rgba(245,158,11,0.5)] flex items-center justify-center overflow-hidden shrink-0">
            {/* Top specular highlight gloss */}
            <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/70 via-white/30 to-transparent rounded-t-[7px]" />
            <span className="relative z-10 text-white font-black text-[11px] sm:text-xs tracking-tighter drop-shadow-sm">
              S
            </span>
          </div>

          <span className="text-sm sm:text-[15px] font-bold tracking-tight text-white flex items-center">
            SokoAI
          </span>
        </div>

        {/* Center: Inline Navigation Links (Supaste Style) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-[13px] font-medium text-zinc-300 hover:text-white transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="px-1.5 py-0.5 rounded-[5px] bg-white/15 text-[10px] font-bold text-amber-300 border border-white/10 tracking-wider">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Right: High-contrast White Pill CTA Button (Supaste Download Style) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onScrollToBuilder}
            className="h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-full bg-white hover:bg-zinc-100 text-black font-semibold text-xs sm:text-[13px] tracking-tight transition-all duration-150 active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
            <span>Démarrer</span>
          </button>
        </div>
      </div>

      {/* Right Inverted Corner Fillet / Swoop */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0 text-black hidden sm:block"
        aria-hidden="true"
      >
        <path d="M20 0 C10 0 0 10 0 20 L0 0 Z" fill="#000000" />
        <path
          d="M20 0.5 C10 0.5 0.5 10 0.5 20"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default NotchNavbar;
