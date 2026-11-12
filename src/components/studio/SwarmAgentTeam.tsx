"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Palette,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SWARM_AGENTS, buildCreationSwarmTraces, buildEditSwarmTraces, SwarmTraceMessage } from "@/lib/swarm-team";

interface SwarmAgentTeamProps {
  storeName?: string;
  style?: string;
  city?: string;
  instruction?: string;
  targetSection?: string;
  isModifying?: boolean;
  compact?: boolean;
}

export function SwarmAgentTeam({
  storeName = "Ma Boutique",
  style = "Élégant et chaleureux",
  city = "Abidjan",
  instruction,
  targetSection,
  isModifying = false,
  compact = false,
}: SwarmAgentTeamProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showLog, setShowLog] = useState(true);

  // Génération des messages d'activité selon le mode
  const traces: SwarmTraceMessage[] = isModifying
    ? buildEditSwarmTraces(instruction || "Modification ciblée", targetSection)
    : buildCreationSwarmTraces(storeName, style, city);

  // Timer temps écoulé
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - start) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Progression des étapes
  useEffect(() => {
    const t1 = setTimeout(() => setStepIndex(1), 1200);
    const t2 = setTimeout(() => setStepIndex(2), 2800);
    const t3 = setTimeout(() => setStepIndex(3), 4400);
    const t4 = setTimeout(() => setStepIndex(4), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Helper pour savoir l'état d'un agent
  const getAgentStatus = (agentId: string) => {
    if (isModifying) {
      if (agentId === "art-director") return stepIndex >= 1 ? "done" : "working";
      if (agentId === "react-engineer") return stepIndex >= 2 ? "done" : stepIndex >= 1 ? "working" : "waiting";
      if (agentId === "quality-auditor") return stepIndex >= 3 ? "done" : stepIndex >= 2 ? "working" : "waiting";
      return "waiting";
    }

    if (agentId === "art-director") return stepIndex >= 1 ? "done" : "working";
    if (agentId === "copywriter") return stepIndex >= 2 ? "done" : stepIndex >= 1 ? "working" : "waiting";
    if (agentId === "react-engineer") return stepIndex >= 3 ? "done" : stepIndex >= 2 ? "working" : "waiting";
    if (agentId === "quality-auditor") return stepIndex >= 4 ? "done" : stepIndex >= 3 ? "working" : "waiting";
    return "waiting";
  };

  const visibleTraces = traces.slice(0, Math.min(stepIndex + 1, traces.length));

  if (compact) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#121215] p-3 space-y-2.5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-zinc-400" /> Équipe Swarm en action
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-750">
            {duration}s
          </span>
        </div>

        {/* Dernier message d'agent actif */}
        {visibleTraces.length > 0 && (
          <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span>{visibleTraces[visibleTraces.length - 1].avatar}</span>
              <span>{visibleTraces[visibleTraces.length - 1].agentName}</span>
              <span className="text-[10px] text-zinc-500">({visibleTraces[visibleTraces.length - 1].role})</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {visibleTraces[visibleTraces.length - 1].text}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-[#121215] p-5 space-y-5 shadow-2xl animate-in fade-in duration-300">
      {/* Header Swarm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-zinc-800 text-zinc-100 border border-zinc-700 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isModifying ? "Coordination Swarm : Modification en direct" : "Équipe Swarm IA : Conception de la Boutique"}
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              4 agents spécialisés collaborent en temps réel sur votre projet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-850 px-2.5 py-1 rounded-lg border border-zinc-750">
            <Clock className="h-3 w-3 text-zinc-400" />
            <span className="font-mono">{duration}s</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
            4 agents actifs
          </span>
        </div>
      </div>

      {/* Grille des 4 Agents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SWARM_AGENTS.map((agent) => {
          const status = getAgentStatus(agent.id);
          const isWorking = status === "working";
          const isDone = status === "done";

          return (
            <div
              key={agent.id}
              className={`rounded-xl p-3.5 border transition-all duration-300 ${
                isWorking
                  ? "bg-zinc-900/90 border-zinc-600 ring-1 ring-zinc-500/20 shadow-md"
                  : isDone
                  ? "bg-zinc-900/50 border-zinc-800/80"
                  : "bg-zinc-900/20 border-zinc-850/50 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-lg select-none">{agent.avatar}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${agent.colorClass.pill}`}>
                        {agent.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{agent.role}</p>
                  </div>
                </div>

                <div>
                  {isWorking && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded-full animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> En cours
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Terminé
                    </span>
                  )}
                  {status === "waiting" && (
                    <span className="text-[10px] text-zinc-500 bg-zinc-850 px-2 py-0.5 rounded-full border border-zinc-800">
                      En attente
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {agent.mission}
              </p>

              <div className="mt-2.5 flex flex-wrap gap-1">
                {agent.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal de collaboration en direct */}
      <div className="rounded-xl border border-zinc-800 bg-[#0C0C10] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLog(!showLog)}
          className="w-full px-3.5 py-2.5 bg-zinc-900/70 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <span className="flex items-center gap-2 font-mono text-[11px]">
            <Code2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>Journal de collaboration Swarm ({visibleTraces.length}/{traces.length})</span>
          </span>
          {showLog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showLog && (
          <div className="p-3.5 space-y-2.5 max-h-56 overflow-y-auto font-mono text-xs">
            {visibleTraces.map((tr) => (
              <div
                key={tr.id}
                className="flex items-start gap-2.5 text-[11px] p-2 rounded-lg bg-zinc-900/40 border border-zinc-850 animate-in fade-in duration-200"
              >
                <span className="text-sm select-none shrink-0 mt-0.5">{tr.avatar}</span>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-200 font-sans text-xs">{tr.agentName}</strong>
                    <span className="text-[10px] text-zinc-500 font-sans">({tr.role})</span>
                    <span className="text-[10px] text-zinc-600 ml-auto font-mono">+{tr.timestamp}</span>
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed text-[11px]">
                    {tr.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
