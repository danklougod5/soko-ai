'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  Smartphone, 
  ShoppingBag, 
  MapPin, 
  Globe, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import Image from 'next/image';

const PROMPT_TEXT = "Crée une boutique de maroquinerie chic à Abidjan, tons caramel & cuir, Wave et livraison Cocody";

const PHASES = [
  { id: 0, label: "1. Saisie de l'idée", title: "Idée en français", duration: 4800 },
  { id: 1, label: "2. Synthèse IA", title: "Architecture & IA", duration: 3800 },
  { id: 2, label: "3. Site Déployé", title: "Boutique en direct", duration: 5200 },
];

const SYNTHESIS_STEPS = [
  { label: "Palette & Style : Havane & Or Ébène", icon: Sparkles, color: "text-amber-400" },
  { label: "Catalogue : 12 fiches & photos IA FCFA", icon: ShoppingBag, color: "text-rose-400" },
  { label: "Paiement : Wave & Orange Money connectés", icon: Smartphone, color: "text-blue-400" },
];

export const AppleMotionStudioPreview: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [typedPrompt, setTypedPrompt] = useState<string>("");
  const [synthesisProgress, setSynthesisProgress] = useState<number>(0);
  const [paidSuccess, setPaidSuccess] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect in Phase 0
  useEffect(() => {
    if (currentPhase !== 0) {
      setTypedPrompt("");
      return;
    }

    let charIndex = 0;
    setTypedPrompt("");
    const interval = setInterval(() => {
      if (charIndex <= PROMPT_TEXT.length) {
        setTypedPrompt(PROMPT_TEXT.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [currentPhase]);

  // Synthesis progress counter in Phase 1
  useEffect(() => {
    if (currentPhase !== 1) {
      setSynthesisProgress(0);
      return;
    }

    const startTime = Date.now();
    const duration = 3000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setSynthesisProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [currentPhase]);

  // Wave Payment flash animation in Phase 2
  useEffect(() => {
    if (currentPhase !== 2) {
      setPaidSuccess(false);
      return;
    }

    const payTimer = setTimeout(() => {
      setPaidSuccess(true);
    }, 2200);

    return () => clearTimeout(payTimer);
  }, [currentPhase]);

  // Main chronological sequence controller
  useEffect(() => {
    if (!isPlaying) return;

    const duration = PHASES[currentPhase].duration;
    timerRef.current = setTimeout(() => {
      setCurrentPhase((prev) => (prev + 1) % PHASES.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentPhase, isPlaying]);

  const handleSelectPhase = (index: number) => {
    setCurrentPhase(index);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const resetAnimation = () => {
    setCurrentPhase(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-[#0F1015]/95 border border-white/[0.12] backdrop-blur-2xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative overflow-hidden text-left flex flex-col justify-between min-h-[460px] sm:min-h-[480px]">
      
      {/* Apple Intelligence Perimeter Specular Aura */}
      <div 
        className="pointer-events-none absolute -inset-1 rounded-3xl opacity-40 blur-xl transition-all duration-1000"
        style={{
          background: currentPhase === 0 
            ? 'radial-gradient(circle at 50% 0%, rgba(244,63,94,0.3), rgba(251,146,60,0.15), transparent 70%)'
            : currentPhase === 1 
            ? 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.35), rgba(168,85,247,0.2), transparent 70%)'
            : 'radial-gradient(circle at 50% 100%, rgba(16,185,129,0.35), rgba(59,130,246,0.2), transparent 70%)'
        }}
      />

      {/* Top Apple Segments Bar */}
      <div className="relative z-10 w-full pb-4 border-b border-white/[0.08] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {PHASES.map((phase, idx) => {
            const isActive = currentPhase === idx;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => handleSelectPhase(idx)}
                className={`relative px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-300 select-none cursor-pointer flex items-center gap-1 ${
                  isActive 
                    ? 'text-white bg-white/15 font-semibold shadow-xs' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{phase.label}</span>
                {isActive && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Play/Pause & Reset Micro Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={resetAnimation}
            title="Recommencer"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Central Screen Area with Framer Motion AnimatePresence */}
      <div className="relative z-10 flex-1 py-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* PHASE 0: SAISIE DE L'IDÉE (PROMPT EN LANGAGE NATUREL) */}
          {/* ======================================================== */}
          {currentPhase === 0 && (
            <motion.div
              key="phase-prompt"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Studio Micro Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block leading-tight">
                      Soko Studio AI
                    </span>
                    <span className="text-[10px] text-neutral-400">Invite en français</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono">
                  Écoute active
                </span>
              </div>

              {/* Natural Prompt Input Field with Typewriter */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] relative group">
                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-500 text-xs select-none">💬</span>
                  <div className="text-xs text-white leading-relaxed font-mono min-h-[52px]">
                    {typedPrompt}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-3.5 bg-blue-400 ml-1 translate-y-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Semantic Tags Extracted by AI */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Éléments détectés par l&apos;IA :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[11px] font-medium flex items-center gap-1"
                  >
                    <span>✨ Cuir & Havane</span>
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 }}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-300 text-[11px] font-medium flex items-center gap-1"
                  >
                    <span>📱 Wave & OM</span>
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 }}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[11px] font-medium flex items-center gap-1"
                  >
                    <span>📍 Cocody</span>
                  </motion.span>
                </div>
              </div>

              {/* Subtle Action Button Simulation */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(1)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Générer la boutique maintenant</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PHASE 1: SYNTHÈSE IA & ARCHITECTURE AFRICAINE */}
          {/* ======================================================== */}
          {currentPhase === 1 && (
            <motion.div
              key="phase-synthesis"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Central Neural Progress Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block leading-tight">
                      Synthèse Neurale Soko
                    </span>
                    <span className="text-[10px] text-neutral-400">Compilation temps réel</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {synthesisProgress}%
                  </span>
                </div>
              </div>

              {/* Linear Progress Bar with Iridescent Gradient */}
              <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full"
                  style={{ width: `${synthesisProgress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

              {/* Progress Checklist of African Commerce Components */}
              <div className="space-y-2 pt-1">
                {SYNTHESIS_STEPS.map((step, idx) => {
                  const isChecked = synthesisProgress >= (idx + 1) * 30;
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                        isChecked 
                          ? 'bg-white/[0.05] border-white/[0.12] text-white' 
                          : 'bg-white/[0.01] border-white/[0.04] text-neutral-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${isChecked ? step.color : 'text-neutral-500'}`} />
                        <span className="text-xs font-medium leading-tight">
                          {step.label}
                        </span>
                      </div>
                      {isChecked ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-600 border-t-blue-400 animate-spin" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  Génération des assets terminée
                </span>
                <span className="font-mono text-white/80">0.9s</span>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PHASE 2: LA BOUTIQUE EN DIRECT (MOBILE STORE REVEAL) */}
          {/* ======================================================== */}
          {currentPhase === 2 && (
            <motion.div
              key="phase-store"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              {/* Mini Safari Address Bar */}
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Globe className="w-3 h-3 text-neutral-400" />
                  <span className="font-mono text-[10px] text-white/90">atelier-abidjan.soko.store</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[9px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En Ligne
                </span>
              </div>

              {/* Storefront Mini Preview Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#181922] to-[#12131A] border border-white/[0.12] space-y-3 shadow-lg">
                
                {/* Store Mini Navbar */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-[11px] font-black tracking-wider text-white uppercase">
                    ATELIER ABIDJAN
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">
                      Maroquinerie
                    </span>
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-300">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Product Snippet with Real Image */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-white/10 shrink-0 bg-neutral-900">
                    <Image
                      src="/templates/prod_bag.jpg"
                      alt="Sac Cabas Cuir Havane"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">Sac Cabas Havane Royal</div>
                    <div className="text-[11px] text-neutral-400">Cuir grainé • Finitions or</div>
                    <div className="text-xs font-extrabold text-amber-400 mt-0.5">48 000 FCFA</div>
                  </div>
                </div>

                {/* Simulated Wave Payment Trigger */}
                <div className="pt-1">
                  {paidSuccess ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Payé via Wave • 48 000 FCFA encaissés</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 select-none"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Payer avec Wave (Simulation automatique...)</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Real Performance Badge */}
              <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Prêt pour les commandes WhatsApp & Wave
                </span>
                <span className="text-neutral-400">Mobile Ready</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom Timeline Step Dots */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
        <span className="text-white/80 font-medium">
          {PHASES[currentPhase].title}
        </span>
        <div className="flex items-center gap-1.5">
          {PHASES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentPhase === i 
                  ? 'w-5 bg-white' 
                  : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default AppleMotionStudioPreview;
