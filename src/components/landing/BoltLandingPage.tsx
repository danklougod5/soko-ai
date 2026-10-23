"use client";

import React, { useState, useEffect } from "react";
import { BorderBeam } from "border-beam";
import { 
  Plus, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight,
  Globe, 
  ShoppingBag, 
  Smartphone, 
  UtensilsCrossed, 
  Layers, 
  Zap, 
  Image as ImageIcon,
  MessageSquare, 
  FileText,
  ChevronDown,
  Check,
  Send,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Navigation,
  Clock
} from "lucide-react";
import AnimatedGradient from "@/components/animated-gradient";
import { GradientWaveText } from "@/components/gradient-wave-text";
import ScrollExpand from "@/components/ScrollExpand";
import TextWordFlip from "@/components/text-word-flip";
import NotchNavbar from "@/components/landing/NotchNavbar";
import { ScrollStack, ScrollStackItem } from "@/components/ScrollStack";
import { StoreShowcaseMarquee } from "@/components/landing/StoreShowcaseMarquee";
import AnimatedFooter from "@/components/landing/AnimatedFooter";
import AppleMotionStudioPreview from "@/components/landing/AppleMotionStudioPreview";

interface BoltLandingPageProps {
  onStartBuild: (prompt: string) => void;
  onOpenStudio: () => void;
  onOpenCodeStudio?: () => void;
}

export function BoltLandingPage({ onStartBuild, onOpenStudio, onOpenCodeStudio }: BoltLandingPageProps) {
  const [prompt, setPrompt] = useState("");
  const [isPlanMode, setIsPlanMode] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // La barre de navigation est cachée au début et apparaît quand le carré s'agrandit (> 80px)
      setShowNavbar(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const CATEGORY_CARDS = [
    {
      id: "mode",
      label: "Mode & Wax",
      icon: Globe,
      prompt: "Boutique de prêt-à-porter wax chic à Dakar, robes et chemises modernes, Wave et Orange Money, livraison express Almadies et Plateau.",
      isNew: false,
    },
    {
      id: "luxe",
      label: "Maroquinerie",
      icon: ShoppingBag,
      prompt: "Marque de maroquinerie de luxe artisanal à Abidjan, sacs à main et ceintures en cuir véritable fait main, tons noir et or, Wave et Cash à la livraison.",
      isNew: false,
    },
    {
      id: "food",
      label: "Food & Traiteur",
      icon: UtensilsCrossed,
      prompt: "Restaurant traiteur africain à Cocody, assiettes d'attiéké garba prestige, carpe braisée et alloco, commande directe via WhatsApp et Wave.",
      isNew: false,
    },
    {
      id: "streetwear",
      label: "Streetwear",
      icon: Layers,
      prompt: "Concept store sneakers et streetwear à Lomé et Cotonou, hoodies oversize et casquettes, style néon sombre, T-Money et Wave.",
      isNew: true, // Iconic "New" badge like Bolt.new Slides!
    },
    {
      id: "whatsapp",
      label: "Boutique WhatsApp",
      icon: Smartphone,
      prompt: "Catalogue express 1-clic pour vendeur Instagram à Abidjan, commandes directes sur mon numéro WhatsApp avec récapitulatif du panier.",
      isNew: false,
    },
  ];

  const handleSubmit = (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    if (isThinking) return;

    const targetPrompt = (customPrompt || prompt).trim() || CATEGORY_CARDS[1].prompt;
    if (customPrompt) {
      setPrompt(customPrompt);
    }
    
    // Allumer immédiatement les bordures lumineuses de la carte
    setIsThinking(true);

    setTimeout(() => {
      onStartBuild(targetPrompt);
    }, 1200);
  };

  const handleScrollToBuilder = () => {
    window.scrollTo({
      top: window.innerHeight * 1.05,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col select-none font-sans">
      {/* 1. DEEP OLED BLACK BACKGROUND (NO BLUE TINT, PURE BLACK) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-black">
        {/* Subtle Dot Grid Matrix */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        {/* Ambient subtle glow centered where the small Lava card rests */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[60vh] rounded-full bg-gradient-to-r from-orange-600/10 via-amber-500/15 to-rose-600/10 blur-[120px] opacity-70" />
      </div>

      {/* 2. DYNAMIC ISLAND NOTCH NAVBAR (APPARAÎT QUAND LE CARRÉ S'AGRANDIT) */}
      <NotchNavbar
        visible={showNavbar}
        onScrollToBuilder={handleScrollToBuilder}
        onOpenStudio={onOpenStudio}
        onSelectCategory={(promptText) => handleSubmit(undefined, promptText)}
      />

      {/* 3. SCROLL-EXPAND PRESENTATION HERO & CREATION EXPERIENCE */}
      <div className="relative z-10 w-full">
        <ScrollExpand
          customMedia={
            <div className="relative w-full h-full bg-[#08050e] overflow-hidden">
              {/* LAVA ANIMATED FLAME GRADIENT INSIDE THE EXPANDING CARD */}
              <AnimatedGradient
                style={{ zIndex: 0 }}
                config={{ preset: "Lava", speed: 0 }}
                noise={{ opacity: 0.12 }}
                className="w-full h-full"
              />
              {/* Subtle inner grid pattern over flame */}
              <div 
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
                  backgroundSize: "28px 28px"
                }}
              />
              {/* Glowing card border and inner shadow */}
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-orange-500/40 shadow-[inset_0_0_60px_rgba(245,158,11,0.25)]" />
              {/* Deep vignette around the edges */}
              <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-black/20 to-black/80" />
            </div>
          }
          title={
            <div className="flex flex-col items-center justify-center text-center space-y-1.5 sm:space-y-3 px-4 max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] leading-tight">
                Décris ton idée.
              </h1>
              <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] leading-tight flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4">
                <span>On crée</span>
                <TextWordFlip
                  words={["ta boutique.", "tes ventes.", "ton shop.", "ta marque."]}
                  duration={2000}
                  letterDelay={0.04}
                  wordDelay={0.2}
                  className="text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.9)] inline-block text-left font-black"
                />
              </div>
            </div>
          }
          scrollHint={null}
          startWidth={48}
          startHeight={60}
          startRadius={28}
          endRadius={0}
          mediaZoom={1.0}
          scrollDistance={0.85}
          holdDistance={0.2}
          smoothing={0.1}
          overlayScrim={0.2}
          useWindowScroll={true}
          enabled={true}
        >
          {/* THE REVEALED CREATION STUDIO (EXACTEMENT COMME SUR CAPTURE D'ÉCRAN 2026-09-28 À 15.01.31) */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 pt-24 pb-8">
            
            {/* Lovable Replica Heading & Subtitle with Animation */}
            <div className="space-y-3 w-full flex flex-col items-center">
              <h1 className="w-full flex justify-center text-center">
                <GradientWaveText
                  repeat={true}
                  speed={1.2}
                  customColors={["#FFB020", "#FF4500", "#FF007F", "#FFA500", "#FFD700", "#FF3366"]}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-[60px] font-bold tracking-[-0.035em] leading-[1.12] drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]"
                >
                  Que voulez-vous créer aujourd&apos;hui ?
                </GradientWaveText>
              </h1>
              <p className="text-slate-300/85 text-base sm:text-lg md:text-[19px] font-normal tracking-[-0.01em] max-w-2xl mx-auto leading-relaxed text-center">
                Donnez vie à votre boutique, votre marque ou toute votre entreprise e-commerce.
              </p>
            </div>

            {/* Central Iconic Bolt.new Prompt Card with BorderBeam */}
            <div className="w-full max-w-2xl relative group">
              {/* Outer subtle glow */}
              <div className={`absolute -inset-1 rounded-3xl transition-opacity duration-500 blur-lg ${
                isThinking 
                  ? "bg-linear-to-r from-orange-500/40 via-amber-400/30 to-rose-500/40 opacity-100" 
                  : "bg-linear-to-r from-blue-500/20 via-blue-400/10 to-indigo-500/20 opacity-70 group-hover:opacity-100"
              }`} />

              <BorderBeam
                active={isThinking}
                size="md"
                colorVariant="sunset"
                borderRadius={24}
                brightness={1.8}
                duration={2.0}
                glowSize={1.4}
                className="w-full rounded-3xl relative z-10"
              >
                <form
                  onSubmit={(e) => handleSubmit(e)}
                  className={`relative rounded-3xl bg-[#141622]/95 border transition-all duration-300 backdrop-blur-2xl shadow-2xl p-4 sm:p-5 flex flex-col text-left space-y-3 ${
                    isThinking 
                      ? "border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]" 
                      : "border-white/12 hover:border-white/20"
                  }`}
                >
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isThinking}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Décrivez votre boutique : ex. boutique de sacs en cuir artisanal à Abidjan, paiement Wave et Orange Money..."
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed disabled:opacity-80"
                  />

                  {/* Card Footer Toolbar */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Left: Attach button */}
                    <button
                      type="button"
                      disabled={isThinking}
                      title="Ajouter des images ou un catalogue"
                      onClick={() => setPrompt((prev) => prev + " (avec photos de produits de haute qualité)")}
                      className="h-8 w-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {/* Right: Plan mode & Build now button */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isThinking}
                        onClick={() => setIsPlanMode(!isPlanMode)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                          isPlanMode 
                            ? "text-blue-400 bg-blue-500/10 border border-blue-500/20" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Plan</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isThinking}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition active:scale-95 group disabled:opacity-80 cursor-pointer"
                      >
                        <span>Build now</span>
                        <Send className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </form>
              </BorderBeam>
            </div>

            {/* 4. SQUIRCLE CATEGORY SELECTORS (LIKE BOLT.NEW) */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-2">
              {CATEGORY_CARDS.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} className="relative">
                    {cat.isNew && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                        New
                      </span>
                    )}
                    <button
                      onClick={() => handleSubmit(undefined, cat.prompt)}
                      disabled={isThinking}
                      className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#131524]/80 border border-white/10 hover:border-blue-400/50 hover:bg-[#1a1d33]/90 transition-all duration-200 flex flex-col items-center justify-center gap-2 group shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300 group-hover:text-blue-400 transition" />
                      <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition">
                        {cat.label.split(" ")[0]}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 5. "OR START FROM" PILLS */}
            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
              <span className="mr-1">or start from</span>
              <button
                onClick={() => onStartBuild("Boutique créée à partir de photos de produits WhatsApp, détection automatique des articles et prix en FCFA.")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <ImageIcon className="h-3 w-3 text-blue-400" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => onStartBuild("Boutique intégrée WhatsApp Business, synchronisation directe des commandes et paiement Wave.")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => onOpenStudio()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <FileText className="h-3 w-3 text-amber-400" />
                <span>Studio Live</span>
              </button>
              {onOpenCodeStudio && (
                <button
                  onClick={() => onOpenCodeStudio()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 transition cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>Mode Code</span>
                </button>
              )}
            </div>

            {/* 6. SUBTLE FOOTER METRICS */}
            <footer className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-white/5 mt-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Moteur DeepSeek V3 Connecté • Wave & Orange Money prêts</span>
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <button onClick={onOpenStudio} className="hover:text-white transition underline cursor-pointer">
                  Ouvrir l'Espace de Travail Lovable
                </button>
                <span>•</span>
                <span>© 2026 SokoAI</span>
              </div>
            </footer>

          </div>
        </ScrollExpand>
      </div>

      {/* 4. "LA SUITE DU SITE" : SCROLLSTACK CARDS SECTION (APPLE LIQUID GLASS & DARK OLED) */}
      <section id="solutions" className="relative z-10 w-full bg-black pt-20 pb-16 sm:pt-24 sm:pb-20 border-t border-white/[0.08]">
        {/* Subtle Apple-style ambient spotlights (locally clipped) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/3 top-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/[0.04] blur-[160px]" />
          <div className="absolute right-1/4 bottom-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[160px]" />
        </div>

        {/* Section Header */}
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4 mb-8">
          <div className="inline-flex items-center px-5 py-1.5 rounded-full bg-[#ECECEC] text-xs sm:text-sm font-medium text-neutral-900 shadow-xs">
            Comment ça marche
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Conçu pour l&apos;Afrique.
            <span className="text-neutral-500 block mt-1.5 font-semibold">Chaque détail pensé pour vendre.</span>
          </h2>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed pt-1">
            De Dakar à Abidjan, de Cotonou à Douala. Fini les bricolages : une architecture technologique d&apos;exception qui résout les vrais défis du commerce local.
          </p>
        </div>

        {/* The ScrollStack Interactive Deck */}
        <ScrollStack itemStackDistance={22}>
          {/* Card 1: Studio IA Lovable (Étape 01) */}
          <ScrollStackItem
            itemClassName="bg-[#0D0D12] border border-white/[0.12] text-white shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-10 lg:p-12 relative overflow-hidden"
          >
            {/* Top chamfered light catch */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-rose-500/[0.08] blur-[100px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
              <div className="lg:col-span-7 space-y-5 text-left">
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                  Décrivez votre idée.
                  <span className="text-neutral-400 block mt-1 font-medium">L&apos;IA génère et publie votre boutique.</span>
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Exprimez vos envies en français simple. Notre moteur conçoit l&apos;identité visuelle, rédige les fiches produits et publie votre site ultra-rapide optimisé pour smartphone en 60 secondes chrono.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleScrollToBuilder}
                    className="px-6 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-semibold text-sm transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.15)] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Créer ma boutique maintenant</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* Right Visual: Apple Motion Studio Preview (Saisie de l'idée -> Synthèse IA -> Site Déployé) */}
              <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
                <AppleMotionStudioPreview />
              </div>
            </div>
          </ScrollStackItem>

          {/* Card 2: Paiements Wave & Orange Money (Étape 02 - Activation post-génération) */}
          <ScrollStackItem
            itemClassName="bg-[#0D0D12] border border-white/[0.12] text-white shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-10 lg:p-12 relative overflow-hidden"
          >
            {/* Top chamfered light catch */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-blue-500/[0.08] blur-[100px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
              <div className="lg:col-span-7 space-y-5 text-left">
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                  Activez Wave & Mobile Money.
                  <span className="text-neutral-400 block mt-1 font-medium">Dès que votre site est généré.</span>
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Dès que l&apos;IA a généré votre boutique, activez vos paiements en un clic. Vos clients règlent directement par QR Code Wave ou validation push Orange Money. Aucun contrat bancaire lourd, aucun délai : vos encaissements en FCFA sont reçus instantanément sur votre compte.
                </p>

                {/* 3 Apple-style Micro-Capsules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Prêt après génération
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Activation en 30 secondes chrono</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      Wave & Orange Money
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Compatible opérateurs UEMOA</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Zéro Fraude
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Notification push & virement direct</p>
                  </div>
                </div>
              </div>

              {/* Right Visual: Luxury Titanium Card & Dynamic Live Activity */}
              <div className="lg:col-span-5 w-full flex flex-col items-center justify-center relative space-y-4">
                {/* Floating Dynamic Island Notification */}
                <div className="w-full max-w-sm rounded-2xl bg-[#16161B]/95 border border-white/[0.12] backdrop-blur-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30 text-sm">
                        W
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-white">Wave Checkout</div>
                        <div className="text-[11px] text-neutral-400">Paiement reçu avec succès</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      +24 500 FCFA
                    </span>
                  </div>
                </div>

                {/* Tactile Titanium Card */}
                <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#1E1E24] via-[#141418] to-[#0A0A0E] border border-white/[0.12] p-5 shadow-2xl relative overflow-hidden text-left">
                  {/* Iridescent gloss highlight */}
                  <div className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent rotate-45 transform translate-x-1/2" />
                  
                  <div className="flex items-center justify-between pb-6">
                    <span className="text-sm font-black tracking-tight text-white">
                      soko<span className="text-orange-500 italic">.pay</span>
                    </span>
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-400 bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08]">
                      COMMERÇANT PRO
                    </span>
                  </div>

                  {/* Embossed gold chip */}
                  <div className="w-9 h-7 rounded bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-inner border border-amber-300/40 mb-5 relative flex items-center justify-center">
                    <div className="w-full h-px bg-amber-700/30" />
                    <div className="absolute inset-y-0 w-px bg-amber-700/30" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">Solde disponible</div>
                    <div className="text-xl font-bold tracking-tight text-white">1 428 500 FCFA</div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/[0.08] mt-3">
                    <span>ATELIER MODE ABIDJAN</span>
                    <span className="font-mono text-white/70">•••• 8421</span>
                  </div>
                </div>

                {/* Payment Selector Pills */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-medium">
                    ● Wave
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 text-[11px] font-medium">
                    Orange Money
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400 text-[11px] font-medium">
                    Cash à la livraison
                  </span>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Card 3: Commerce Conversationnel WhatsApp (Étape 03) */}
          <ScrollStackItem
            itemClassName="bg-[#0D0D12] border border-white/[0.12] text-white shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-10 lg:p-12 relative overflow-hidden"
          >
            {/* Top chamfered light catch */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-emerald-500/[0.08] blur-[100px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
              <div className="lg:col-span-7 space-y-5 text-left">
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                  Chaque discussion WhatsApp.
                  <span className="text-neutral-400 block mt-1 font-medium">Devient une commande validée.</span>
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  En Afrique, le commerce se vit en direct. Vos visiteurs basculent en un clic sur votre WhatsApp avec un panier pré-rempli contenant photo, taille et montant. Votre stock est réservé automatiquement.
                </p>

                {/* 3 Apple-style Micro-Capsules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Panier Clé en Main
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Récapitulatif précis généré sans friction</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Stock Automatisé
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Déduction immédiate des pièces en stock</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Conversion Directe
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Le canal n°1 des consommateurs locaux</p>
                  </div>
                </div>
              </div>

              {/* Right Visual: Apple iOS 18 Dynamic Live Activity Widget */}
              <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-[#141419]/95 border border-white/[0.12] backdrop-blur-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-4 text-left">
                  {/* Verified Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Soko Wax Boutique</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black">✓</span>
                        </div>
                        <div className="text-[11px] text-emerald-400">En ligne • Réponse immédiate</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded-full">
                      WhatsApp Business
                    </span>
                  </div>

                  {/* Refined Product Preview Card */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 shrink-0 flex items-center justify-center text-white shadow-md">
                      <ShoppingBag className="w-6 h-6 text-white/90" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">Robe Wax Naya Prestige</div>
                      <div className="text-[11px] text-neutral-400">Taille M • Coton Glacé Ivoire</div>
                      <div className="text-xs font-bold text-white mt-0.5">18 000 FCFA</div>
                    </div>
                  </div>

                  {/* Location & Status Tag */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      Cocody Angré 8e Tranche
                    </span>
                    <span className="text-emerald-400 font-medium shrink-0">Wave à réception</span>
                  </div>

                  {/* Tactile Button */}
                  <div className="pt-1">
                    <button className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer">
                      <span>Valider la commande sur WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollStackItem>

          {/* Card 4: Logistique par Quartier & Repères (Étape 04) */}
          <ScrollStackItem
            itemClassName="bg-[#0D0D12] border border-white/[0.12] text-white shadow-[0_30px_90px_rgba(0,0,0,0.95)] p-6 sm:p-10 lg:p-12 relative overflow-hidden"
          >
            {/* Top chamfered light catch */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-purple-500/[0.08] blur-[100px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
              <div className="lg:col-span-7 space-y-5 text-left">
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                  Livraison par repères.
                  <span className="text-neutral-400 block mt-1 font-medium">Même sans adresse postale.</span>
                </h3>

                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  Parce que nos quartiers n&apos;ont pas toujours de numéro de rue, SokoAI guide vos livreurs grâce aux carrefours clés, pharmacies et repères réels, avec calcul automatique des tarifs par commune.
                </p>

                {/* 3 Apple-style Micro-Capsules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Repères Populaires
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Pharmacies, carrefours et ronds-points</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Tarifs par Commune
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Calcul instantané Plateau, Cocody, Yopougon</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                    <div className="text-white text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Dispatch Livreur
                    </div>
                    <p className="text-[12px] text-neutral-400 leading-snug">Transmission GPS directe au coursier</p>
                  </div>
                </div>
              </div>

              {/* Right Visual: Apple Maps Dark Mode Radar & Telemetry Card */}
              <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
                <div className="w-full max-w-sm rounded-3xl bg-[#121217]/95 border border-white/[0.12] backdrop-blur-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-4 text-left relative overflow-hidden">
                  {/* Subtle Dark Vector Map Background */}
                  <div className="relative h-32 w-full rounded-2xl bg-[#09090D] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                    {/* Road arteries */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: "linear-gradient(45deg, #334155 1px, transparent 1px), linear-gradient(-45deg, #334155 1px, transparent 1px)",
                      backgroundSize: "24px 24px"
                    }} />
                    
                    {/* Glowing Route path */}
                    <div className="absolute w-28 h-0.5 bg-gradient-to-r from-purple-500 to-emerald-400 rotate-12 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />

                    {/* Radar Pulse */}
                    <div className="absolute w-16 h-16 rounded-full border border-purple-500/40 animate-ping" />
                    
                    {/* Destination Pin */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg shadow-purple-600/50">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded-md mt-1 border border-white/10">
                        Pharmacie Saint-Paul
                      </span>
                    </div>
                  </div>

                  {/* Telemetry info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Destination</span>
                      <span className="font-semibold text-white">Cocody Angré (1 500 FCFA)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Repère spécifique coursier</span>
                      <p className="text-white text-xs font-medium">
                        « Carrefour Duncan, derrière la pharmacie, portail bleu »
                      </p>
                    </div>
                  </div>

                  {/* Courier Live Status Pill */}
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-white/[0.08]">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Arrivée estimée : <strong className="text-white">18 min</strong></span>
                    </div>
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                      Coursier assigné
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </section>

      {/* 5. "DES MILLIERS DE BOUTIQUES" : INFINITE VERTICAL STORE SHOWCASE MARQUEE */}
      <StoreShowcaseMarquee
        onSelectStorePrompt={(promptText) => {
          setPrompt(promptText);
          window.scrollTo({
            top: window.innerHeight * 0.95,
            behavior: "smooth"
          });
        }}
      />

      {/* 6. FRAMER MOTION ANIMATED FOOTER & GRAND CALL TO ACTION */}
      <AnimatedFooter
        onScrollToBuilder={handleScrollToBuilder}
        onOpenStudio={onOpenStudio}
        onSelectPrompt={(p) => setPrompt(p)}
      />
    </div>
  );
}
