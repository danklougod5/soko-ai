"use client";

import React from "react";
import { Sparkles, Terminal, Layers, Code, Palette, Cpu } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";

interface StudioLiveBuildingCanvasProps {
  prompt: string;
  stage: "questions" | "generating";
}

export function StudioLiveBuildingCanvas({ prompt, stage }: StudioLiveBuildingCanvasProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 bg-[#090A0E] text-slate-200 relative overflow-hidden select-none">
      {/* Background glow effects like Lovable/Bolt */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Console Container */}
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 relative z-10">
        
        {/* Thinking Orb animation */}
        <div className="relative">
          <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 shadow-2xl shadow-purple-500/10 backdrop-blur-md">
            <ThinkingOrb state="working" size={64} color="#A855F7" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
          </span>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span>
              {stage === "questions" 
                ? "Configuration du cahier des charges..." 
                : "DeepSeek construit votre site sur-mesure..."}
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
            {stage === "questions"
              ? "Répondez aux questions à gauche pour que l'IA adapte l'architecture, le design et le catalogue exactement à vos besoins."
              : "Génération en temps réel de l'expérience visuelle, de la boutique mobile et des tunnels d'achat Wave & Orange Money."}
          </p>
        </div>

        {/* Simulated Live Studio Blueprint Box (Bolt.new style) */}
        <div className="w-full rounded-2xl bg-[#12131C] border border-white/10 p-4 text-left font-mono text-[11px] text-slate-400 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/6 text-slate-500">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              <span>soko-ai/studio-engine</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Blueprint
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">&gt;</span>
              <span className="text-slate-400">Projet :</span>
              <span className="text-white truncate">&quot;{prompt || "Boutique en ligne"}&quot;</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">&gt;</span>
              <span className="text-slate-400">Architecture :</span>
              <span className="text-emerald-300">Layout sur-mesure sans template figé</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">&gt;</span>
              <span className="text-slate-400">Statut :</span>
              <span className="text-purple-300 animate-pulse">
                {stage === "questions" ? "En attente de vos réponses..." : "Génération du design & du catalogue..."}
              </span>
            </div>
          </div>

          {/* Mini Wireframe placeholder shimmer */}
          <div className="pt-3 border-t border-white/6 space-y-2">
            <div className="h-2 rounded bg-white/5 w-3/4 animate-pulse" />
            <div className="h-10 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-[10px] text-purple-300 gap-1.5">
              <Layers className="h-3 w-3" />
              <span>L&apos;aperçu apparaîtra ici dès la fin de la génération</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
