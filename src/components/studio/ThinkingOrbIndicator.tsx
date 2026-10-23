"use client";

import React, { useEffect, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

interface ThinkingOrbIndicatorProps {
  prompt?: string;
  size?: 64 | 32 | 20;
}

export function ThinkingOrbIndicator({ prompt, size = 64 }: ThinkingOrbIndicatorProps) {
  const [orbState, setOrbState] = useState<"searching" | "working" | "solving" | "connecting">("searching");
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      state: "searching" as const,
      label: "Analyse du commerce & du secteur local...",
      sub: prompt ? `Contexte : "${prompt.slice(0, 45)}..."` : "Extraction des spécificités africaines",
      color: "#F59E0B", // Amber
    },
    {
      state: "solving" as const,
      label: "Génération de 3 directions de design distinctes...",
      sub: "Création des palettes, typographies et catalogue de produits",
      color: "#8B5CF6", // Purple
    },
    {
      state: "connecting" as const,
      label: "Intégration logistique Wave, Orange Money & WhatsApp...",
      sub: "Préparation des formulaires et des zones de livraison",
      color: "#10B981", // Emerald
    },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStepIndex(1);
      setOrbState("solving");
    }, 1800);

    const t2 = setTimeout(() => {
      setStepIndex(2);
      setOrbState("connecting");
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const current = steps[stepIndex] || steps[0];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-5 animate-in fade-in duration-300">
      {/* THINKING ORB CANVAS */}
      <div className="relative flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-500" 
          style={{ backgroundColor: current.color }}
        />
        <div className="relative p-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center">
          <ThinkingOrb 
            state={orbState} 
            size={size}
            color={current.color}
          />
        </div>
      </div>

      {/* TEXT LABELS */}
      <div className="space-y-1.5 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: current.color }} />
          <span>Étape {stepIndex + 1} sur 3</span>
        </div>
        <h4 className="text-sm sm:text-base font-bold text-white transition-all duration-300">
          {current.label}
        </h4>
        <p className="text-xs text-slate-400">
          {current.sub}
        </p>
      </div>

      {/* PROGRESS TRACK */}
      <div className="flex items-center gap-1.5 w-36">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              idx <= stepIndex ? "bg-white" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
