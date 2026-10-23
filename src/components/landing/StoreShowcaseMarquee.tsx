"use client";

import React, { useRef } from "react";
import { 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Search, 
  User, 
  Heart, 
  Share2, 
  Headphones, 
  Shield, 
  Truck, 
  RotateCcw, 
  Star, 
  MapPin, 
  Phone, 
  Menu,
  Leaf
} from "lucide-react";

const FacebookIcon = () => (
  <svg className="w-3 h-3 hover:text-neutral-700 cursor-pointer fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-3 h-3 hover:text-neutral-700 cursor-pointer fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3 h-3 hover:text-neutral-700 cursor-pointer fill-none stroke-current stroke-2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export interface TemplateShowcaseItem {
  id: string;
  name: string;
  category: string;
  prompt: string;
  render: () => React.ReactNode;
}

// =========================================================================
// 1. E-SHOP (High-Tech & Electronics — Exact Replica of User's Screenshot)
// =========================================================================
function ElectroShopTemplate() {
  return (
    <div className="w-full h-full bg-white text-neutral-800 flex flex-col justify-between overflow-hidden select-none font-sans text-left">
      {/* 1. Top Utility Bar */}
      <div className="px-4 sm:px-6 py-1.5 bg-white border-b border-neutral-200 text-[10.5px] text-neutral-600 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-neutral-400" />
            <span>123 Main Street, Anytown USA</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-neutral-400" />
            <span>+1 (555) 123-4567</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-0.5 cursor-pointer font-medium hover:text-neutral-900">
            USD <span className="text-[9px] ml-0.5">▾</span>
          </span>
          <span className="flex items-center gap-1 cursor-pointer font-medium hover:text-neutral-900">
            <span className="inline-block w-3.5 h-2.5 bg-neutral-200 border border-neutral-300 rounded-[2px] overflow-hidden text-[7px] leading-none text-center">🇺🇸</span>
            <span>English</span>
            <span className="text-[9px] ml-0.5">▾</span>
          </span>
          <div className="hidden sm:flex items-center gap-2 text-neutral-400 pl-1 border-l border-neutral-200">
            <FacebookIcon />
            <TwitterIcon />
            <InstagramIcon />
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header with Search & Cart */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sm:gap-6 bg-white shrink-0">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-black tracking-tight text-neutral-900">
            e-shop<span className="text-[#FF5745]">.</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm hidden sm:flex items-center relative">
          <input
            type="text"
            readOnly
            value="Search Products ..."
            className="w-full pl-3.5 pr-9 py-1.5 rounded-md border border-neutral-300 text-xs text-neutral-400 bg-white placeholder-neutral-400 focus:outline-none"
          />
          <button className="absolute right-3 text-neutral-500">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cart & Account */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 leading-tight">Cart</span>
              <span className="font-bold text-neutral-900 text-xs leading-tight">$ 150,00</span>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 cursor-pointer">
            <User className="w-5 h-5 text-neutral-800" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 leading-tight">User</span>
              <span className="font-bold text-neutral-900 text-xs leading-tight">Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Bar (Coral Red #FF5745) */}
      <div className="px-4 sm:px-6 py-2 bg-[#FF5745] text-white text-xs font-medium flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer font-bold">
            <Menu className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </div>
          <span className="hover:text-white/80 cursor-pointer hidden sm:flex items-center gap-1">
            Products <span className="text-[8px]">▾</span>
          </span>
          <span className="hover:text-white/80 cursor-pointer hidden md:inline">Blog</span>
          <span className="hover:text-white/80 cursor-pointer hidden md:inline">Contact</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider">
          <span className="uppercase text-white tracking-wider cursor-pointer">LIMITED SALE</span>
          <span className="hidden sm:inline hover:text-white/80 cursor-pointer">Best Seller</span>
          <span className="hidden sm:inline hover:text-white/80 cursor-pointer">New Arrival</span>
        </div>
      </div>

      {/* 4. Hero Banner */}
      <div className="mx-4 sm:mx-6 my-2.5 p-4 sm:p-5 rounded-2xl bg-[#F4F5F7] border border-neutral-200/80 flex items-center justify-between gap-4 shrink-0">
        <div className="space-y-2 max-w-xs sm:max-w-sm">
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight">
            Your One-Stop <br />Electronic Market
          </h3>
          <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
            Welcome to e-shop, a place where you can buy everything about electronics. Sale every day!
          </p>
          <div className="pt-1">
            <button className="px-5 py-2 rounded-lg bg-[#FF5745] hover:bg-[#e04535] text-white font-semibold text-xs shadow-sm transition-colors">
              Shop Now
            </button>
          </div>
        </div>

        <div className="relative w-44 sm:w-64 h-24 sm:h-28 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white">
          <img
            src="/templates/hero_workspace.jpg"
            alt="Electronic Market Setup"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* 5. Trust Badges Strip (4 Icons with clean typography) */}
      <div className="px-4 sm:px-6 py-2 border-y border-neutral-150 bg-white grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-neutral-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Responsive</p>
            <p className="text-[9.5px] text-neutral-500">Customer service available 24/7</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-neutral-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Secure</p>
            <p className="text-[9.5px] text-neutral-500">Certified marketplace since 2017</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-neutral-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Shipping</p>
            <p className="text-[9.5px] text-neutral-500">Free, fast, and reliable worldwide</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-neutral-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Transparent</p>
            <p className="text-[9.5px] text-neutral-500">Hassle-free return policy</p>
          </div>
        </div>
      </div>

      {/* 6. Featured Products Section (5 Distinct Products like in Screenshot) */}
      <div className="px-4 sm:px-6 py-2 bg-white flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Featured Products</h4>
          </div>
          <span className="text-[#FF5745] text-xs font-semibold cursor-pointer hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="relative">
          {/* Carousel Arrow Controls */}
          <button className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-neutral-300 shadow-sm flex items-center justify-center text-neutral-600 z-10 hidden sm:flex hover:bg-neutral-50">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-neutral-300 shadow-sm flex items-center justify-center text-neutral-600 z-10 hidden sm:flex hover:bg-neutral-50">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* 1. Phone */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_phone_white.jpg" alt="JPhone 13" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">PHONE</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">JPhone 13 High Quality Value</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 50 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5">$999.00</p>
              </div>
            </div>

            {/* 2. Headphones (with 50% discount badge) */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between relative">
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[#FF5745] text-white text-[8px] font-bold rounded-sm z-10">
                50%
              </span>
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_headphone_clean.jpg" alt="Headphones" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">AUDIO</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">WH-1000XM4 Wireless Headset</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 120 )</span>
                </div>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="font-bold text-[#FF5745] text-xs">$59.00</span>
                  <span className="text-[9px] text-neutral-400 line-through">$118.00</span>
                </div>
              </div>
            </div>

            {/* 3. Laptop (ACTIVE / HOVER STATE with 3 Floating Action Buttons) */}
            <div className="p-2 rounded-xl bg-white border-2 border-neutral-300 shadow-md flex flex-col justify-between relative ring-1 ring-neutral-200">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center relative">
                <img src="/templates/hero_flatlay_laptop.jpg" alt="S21 Laptop" className="w-full h-full object-contain p-1" />
                {/* 3 Floating Action Buttons from Screenshot */}
                <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 z-10">
                  <div className="w-5 h-5 rounded-full bg-[#FF5745] text-white flex items-center justify-center shadow-md">
                    <ShoppingBag className="w-2.5 h-2.5" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white text-[#FF5745] border border-neutral-200 flex items-center justify-center shadow-md">
                    <Heart className="w-2.5 h-2.5 fill-[#FF5745]" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white text-neutral-600 border border-neutral-200 flex items-center justify-center shadow-md">
                    <Share2 className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">LAPTOP</span>
                <p className="font-medium text-[#FF5745] text-[11px] leading-tight line-clamp-1 underline cursor-pointer">S21 Laptop Ultra HD LED Screen</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 100 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5">$1,199.00</p>
              </div>
            </div>

            {/* 4. Camera */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hidden sm:flex">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_camera_clean.jpg" alt="Polaroid Camera" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">CAMERA</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">Mini Polaroid Camera OneStep</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 70 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5">$79.00</p>
              </div>
            </div>

            {/* 5. Television */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hidden sm:flex">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_tv_clean.jpg" alt="Smart OLED TV" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">TELEVISION</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">AG OLED65CXPUA 4K Smart TV</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 20 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5">$2,799.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. ATELIER BAOBAB (KEPT EXACTLY AS INSTRUCTED BY USER)
// =========================================================================
function AtelierBaobabTemplate() {
  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-[#0E0C0A] text-[#F3EFEA] flex flex-col justify-between">
      {/* Real Full-Bleed Store Showcase Image */}
      <img
        src="/templates/showcase_baobab_leather.jpg"
        alt="Atelier Baobab"
        className="w-full h-full object-cover object-top"
      />

      {/* Sleek Glass Floating Top Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider uppercase text-white shadow-lg">
            MAROQUINERIE DE LUXE
          </span>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-neutral-200">
            Dakar & Abidjan
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-400 text-black text-[11px] font-bold tracking-wide uppercase shadow-lg backdrop-blur-md">
          CUIR PLEINE FLEUR
        </span>
      </div>

      {/* Floating Bottom Bar with Features & Direct CTA */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-black via-black/85 to-transparent backdrop-blur-md border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
              Atelier Baobab
            </h3>
            <span className="text-neutral-500 hidden sm:inline">•</span>
            <span className="text-xs text-neutral-300 font-medium">
              L&apos;Art du Voyage — Sacs weekender et maroquinerie en cuir pleine fleur
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-neutral-300 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md">
              Wave & OM 1-Clic
            </span>
            <span className="text-[11px] font-medium text-neutral-300 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md">
              Prix FCFA
            </span>
            <span className="text-[11px] font-medium text-neutral-300 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-md">
              Gravure Offerte
            </span>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-black font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
          <span>Générer cette boutique</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 3. BIOGLOW BOTANIQUE (Exact Same Multi-Section E-commerce Store Architecture)
// =========================================================================
function BioGlowTemplate() {
  return (
    <div className="w-full h-full bg-white text-neutral-800 flex flex-col justify-between overflow-hidden select-none font-sans text-left">
      {/* 1. Top Utility Bar */}
      <div className="px-4 sm:px-6 py-1.5 bg-[#FAF7F2] border-b border-neutral-200 text-[10.5px] text-neutral-600 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>Cocody Mermoz, Abidjan · Almadies, Dakar</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>+225 07 98 00 12</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-0.5 cursor-pointer font-medium hover:text-neutral-900">
            XOF (FCFA) <span className="text-[9px] ml-0.5">▾</span>
          </span>
          <span className="flex items-center gap-1 cursor-pointer font-medium hover:text-neutral-900">
            <span>Français</span>
            <span className="text-[9px] ml-0.5">▾</span>
          </span>
          <div className="hidden sm:flex items-center gap-2 text-neutral-400 pl-1 border-l border-neutral-200">
            <FacebookIcon />
            <InstagramIcon />
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header with Search & Cart */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sm:gap-6 bg-white shrink-0">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-black tracking-tight text-neutral-900">
            bioglow<span className="text-emerald-600">.</span>
          </span>
          <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline">
            BOTANIQUE BIO
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm hidden sm:flex items-center relative">
          <input
            type="text"
            readOnly
            value="Rechercher un sérum, karité bio, huile de baobab..."
            className="w-full pl-3.5 pr-9 py-1.5 rounded-md border border-neutral-300 text-xs text-neutral-500 bg-white placeholder-neutral-400 focus:outline-none"
          />
          <button className="absolute right-3 text-neutral-500">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cart & Account */}
        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 leading-tight">Panier</span>
              <span className="font-bold text-neutral-900 text-xs leading-tight">45 000 FCFA</span>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 cursor-pointer">
            <User className="w-5 h-5 text-neutral-800" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 leading-tight">Mon Compte</span>
              <span className="font-bold text-neutral-900 text-xs leading-tight">Fidélité</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Bar (Emerald Green #059669) */}
      <div className="px-4 sm:px-6 py-2 bg-emerald-700 text-white text-xs font-medium flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer font-bold">
            <Menu className="w-3.5 h-3.5" />
            <span>Tous les soins</span>
          </div>
          <span className="hover:text-white/80 cursor-pointer hidden sm:flex items-center gap-1">
            Soins Visage <span className="text-[8px]">▾</span>
          </span>
          <span className="hover:text-white/80 cursor-pointer hidden md:inline">Huiles & Karité</span>
          <span className="hover:text-white/80 cursor-pointer hidden md:inline">Sérums & Élixirs</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider">
          <span className="uppercase text-amber-300 tracking-wider cursor-pointer">OFFRES DU MOIS</span>
          <span className="hidden sm:inline hover:text-white/80 cursor-pointer">Best Sellers</span>
          <span className="hidden sm:inline hover:text-white/80 cursor-pointer">Nouveautés</span>
        </div>
      </div>

      {/* 4. Hero Banner */}
      <div className="mx-4 sm:mx-6 my-2.5 p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 flex items-center justify-between gap-4 shrink-0">
        <div className="space-y-2 max-w-xs sm:max-w-sm">
          <div className="inline-flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
            <Leaf className="w-3 h-3" />
            <span>100% Ingrédients d&apos;Afrique</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight">
            L&apos;Essence Botanique <br />Pure d&apos;Afrique
          </h3>
          <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
            Huiles rares pressées à froid, beurres de karité bruts et formules certifiées bio pour sublimer votre peau.
          </p>
          <div className="pt-1">
            <button className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-colors">
              Découvrir la Gamme
            </button>
          </div>
        </div>

        <div className="relative w-44 sm:w-64 h-24 sm:h-28 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white">
          <img
            src="/templates/skincare_aya.jpg"
            alt="BioGlow Cosmetics"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* 5. Trust Badges Strip */}
      <div className="px-4 sm:px-6 py-2 border-y border-neutral-150 bg-white grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">100% Naturel</p>
            <p className="text-[9.5px] text-neutral-500">Sans parabène ni silicone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Wave & Orange Money</p>
            <p className="text-[9.5px] text-neutral-500">Paiement direct sécurisé</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Livraison 24h</p>
            <p className="text-[9.5px] text-neutral-500">Abidjan, Dakar & Lomé</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0 stroke-[1.5]" />
          <div className="leading-tight text-left">
            <p className="font-bold text-neutral-900 text-[11px]">Satisfait ou Remboursé</p>
            <p className="text-[9.5px] text-neutral-500">Retours gratuits 14 jours</p>
          </div>
        </div>
      </div>

      {/* 6. Featured Products Section */}
      <div className="px-4 sm:px-6 py-2 bg-white flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Nos Soins Phares</h4>
          </div>
          <span className="text-emerald-700 text-xs font-semibold cursor-pointer hover:underline flex items-center gap-1">
            Voir toute la collection <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="relative">
          <button className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-neutral-300 shadow-sm flex items-center justify-center text-neutral-600 z-10 hidden sm:flex hover:bg-neutral-50">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-neutral-300 shadow-sm flex items-center justify-center text-neutral-600 z-10 hidden sm:flex hover:bg-neutral-50">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* 1. Sérum */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_serum_clean.jpg" alt="Sérum Éclat" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">SÉRUM</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">Sérum Éclat Vitamine C & Baobab</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 84 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5 font-mono">18 500 FCFA</p>
              </div>
            </div>

            {/* 2. Crème (Discount -25%) */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between relative">
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-bold rounded-sm z-10">
                -25%
              </span>
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_cream_clean.jpg" alt="Crème Karité" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">CRÈME</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">Crème Veloutée Karité Bio</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 142 )</span>
                </div>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="font-bold text-emerald-700 text-xs font-mono">14 000 FCFA</span>
                  <span className="text-[9px] text-neutral-400 line-through">18 500</span>
                </div>
              </div>
            </div>

            {/* 3. Huile (ACTIVE / HOVER STATE) */}
            <div className="p-2 rounded-xl bg-white border-2 border-emerald-300 shadow-md flex flex-col justify-between relative ring-1 ring-emerald-200">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center relative">
                <img src="/templates/prod_oil_clean.jpg" alt="Huile Moringa" className="w-full h-full object-contain p-1" />
                <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 z-10">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md">
                    <ShoppingBag className="w-2.5 h-2.5" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white text-emerald-700 border border-neutral-200 flex items-center justify-center shadow-md">
                    <Heart className="w-2.5 h-2.5 fill-emerald-600" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white text-neutral-600 border border-neutral-200 flex items-center justify-center shadow-md">
                    <Share2 className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">HUILE RARE</span>
                <p className="font-medium text-emerald-700 text-[11px] leading-tight line-clamp-1 underline cursor-pointer">Huile Précieuse Moringa & Baobab</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 96 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5 font-mono">22 000 FCFA</p>
              </div>
            </div>

            {/* 4. Parfum */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hidden sm:flex">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_perfume_clean.jpg" alt="Parfum Botanique" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">PARFUM</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">Élixir Ambré & Fleur d&apos;Oranger</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 65 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5 font-mono">28 000 FCFA</p>
              </div>
            </div>

            {/* 5. Savon */}
            <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hidden sm:flex">
              <div className="h-16 sm:h-20 w-full rounded-lg overflow-hidden bg-neutral-50 mb-1.5 flex items-center justify-center">
                <img src="/templates/prod_soap_clean.jpg" alt="Savon Artisanal" className="w-full h-full object-contain p-1" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider block">SOIN CORPS</span>
                <p className="font-medium text-neutral-800 text-[11px] leading-tight line-clamp-1">Savon Noir Surgras au Miel Pur</p>
                <div className="flex items-center gap-1 text-amber-400 text-[9px]">
                  <span>★★★★★</span>
                  <span className="text-neutral-400">( 110 )</span>
                </div>
                <p className="font-bold text-neutral-900 text-xs pt-0.5 font-mono">6 500 FCFA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPLATES: TemplateShowcaseItem[] = [
  // 1. e-shop. (Exact Replica of User's Reference Screenshot)
  {
    id: "electro-shop",
    name: "e-shop. High-Tech",
    category: "HIGH-TECH & ÉLECTRONIQUE",
    prompt: "Boutique en ligne complète d'électronique et high-tech à Abidjan, catalogue smartphones, ordinateurs et audio, bannière promotionnelle, réassurances et paiement Wave 1-clic.",
    render: () => <ElectroShopTemplate />,
  },

  // 2. Atelier Baobab (Kept by explicit user instruction)
  {
    id: "atelier-baobab",
    name: "Atelier Baobab",
    category: "MAROQUINERIE DE LUXE",
    prompt: "Maison de maroquinerie de luxe artisanal à Dakar et Abidjan, sacs weekender en cuir pleine fleur, finitions or et paiement Wave 1-clic.",
    render: () => <AtelierBaobabTemplate />,
  },

  // 3. BioGlow Botanique (Modern Clean Cosmetics Store with Identical Architecture)
  {
    id: "bioglow-cosmetics",
    name: "BioGlow Botanique",
    category: "COSMÉTIQUES & SOINS BIO",
    prompt: "Boutique e-commerce de soins cosmétiques naturels et huiles précieuses d'Afrique, catalogue sérums et beurres de karité en FCFA, paiement Wave et Orange Money.",
    render: () => <BioGlowTemplate />,
  },
];

interface StoreShowcaseMarqueeProps {
  onSelectStorePrompt: (promptText: string) => void;
}

export function StoreShowcaseMarquee({ onSelectStorePrompt }: StoreShowcaseMarqueeProps) {
  const marqueeContainerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (prompt: string) => {
    onSelectStorePrompt(prompt);
    const studioElement = document.getElementById("create-studio") || document.getElementById("hero");
    if (studioElement) {
      studioElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 3 templates duplicated for smooth, continuous looping marquee
  const duplicatedTemplates = [...TEMPLATES, ...TEMPLATES];

  return (
    <section id="showcase" className="relative z-10 w-full bg-black pt-12 pb-20 sm:pt-16 sm:pb-28 scroll-mt-20 overflow-hidden border-t border-white/[0.08]">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/3 top-1/4 w-[750px] h-[750px] rounded-full bg-orange-500/[0.03] blur-[180px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 w-[750px] h-[750px] rounded-full bg-blue-500/[0.03] blur-[180px]" />

      <div className="w-full flex flex-col items-center">
        
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-14 px-4 sm:px-6">
          <div className="inline-flex items-center px-5 py-1.5 rounded-full bg-[#ECECEC] text-xs sm:text-sm font-medium text-neutral-900 shadow-xs">
            Templates réels générés par l&apos;IA
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Des vrais sites e-commerce.
            <span className="text-neutral-500 block mt-2 font-semibold">
              Complets, professionnels et prêts à vendre.
            </span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed pt-1">
            Découvrez des boutiques complètes avec recherche, catégories, promotions, réassurances et catalogue produits. Chaque boutique intègre Wave, Orange Money et WhatsApp.
          </p>
        </div>

        {/* Grand Horizontal Marquee */}
        <div 
          ref={marqueeContainerRef}
          className="w-full relative [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] overflow-x-auto no-scrollbar py-4"
        >
          <div className="animate-marquee-left flex gap-6 sm:gap-8 px-6">
            {duplicatedTemplates.map((template, idx) => (
              <div
                key={`${idx}-${template.id}`}
                onClick={() => handleCardClick(template.prompt)}
                className="group relative w-[620px] sm:w-[860px] md:w-[980px] h-[640px] sm:h-[660px] shrink-0 rounded-3xl overflow-hidden cursor-pointer shadow-[0_30px_80px_rgba(0,0,0,0.9)] hover:shadow-[0_40px_100px_rgba(0,0,0,1)] border border-white/[0.12] hover:border-white/[0.35] transition-all duration-400 hover:scale-[1.01]"
              >
                {/* Real Store Template Content */}
                {template.render()}

                {/* Hover CTA Indicator */}
                <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs shadow-2xl flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                    <span>Utiliser ce template</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default StoreShowcaseMarquee;
