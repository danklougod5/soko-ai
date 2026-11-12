"use client";

import React from "react";
import { X, Bot, CheckCircle2, Sparkles, Shield, Cpu } from "lucide-react";
import { SWARM_AGENTS } from "@/lib/swarm-team";

interface SwarmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwarmModal({ isOpen, onClose }: SwarmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Équipe Multi-Agents Swarm</h3>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  4 agents synchronisés
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Architecture collaborative autonome dédiée à votre boutique e-commerce
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Chaque boutique créée ou modifiée dans SokoAI est le fruit du travail coordonné de 4 agents d&apos;élite. Contrairement à une IA générique qui bâcle les détails, chaque agent assume une responsabilité précise.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {SWARM_AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="rounded-xl p-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl select-none">{agent.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                      <p className="text-[11px] text-zinc-400">{agent.role}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${agent.colorClass.pill}`}>
                    {agent.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {agent.mission}
                </p>

                <div className="pt-1 flex flex-wrap gap-1">
                  {agent.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3.5 bg-zinc-950 border border-zinc-850 flex items-center gap-3 text-xs text-zinc-400">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Les agents travaillent avec <strong>DeepSeek V3</strong> et effectuent une validation AST systématique avant tout rendu.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
