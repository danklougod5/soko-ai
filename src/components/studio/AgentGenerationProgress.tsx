"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Layers } from "lucide-react";
import { TodoList, type TodoItem, type TodoListMessages } from "@/components/agents/todo-list";
import {
  AgentActivity,
  type AgentActivityItem,
  type AgentActivityMessages,
} from "@/components/agents/agent-activity";

interface AgentGenerationProgressProps {
  prompt?: string;
  storeName?: string;
  isModifying?: boolean;
}

const frenchTodoLabels: Partial<TodoListMessages> = {
  title: "Tâches de conception du site",
  label: "Plan d'exécution de l'agent",
  progress: "{completed} sur {total} étapes terminées",
  empty: "Aucune tâche en cours",
  pending: "En attente",
  inProgress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

const frenchActivityLabels: Partial<AgentActivityMessages> = {
  thinking: "Conception architecturale et design en cours…",
  workingTrace: "Élaboration des 3 propositions…",
  workingMixed: "Génération en cours…",
  thoughtFor: "Temps de conception : {duration}",
  seconds: "{seconds}s",
  minutes: "{minutes}m",
  completedStepsOne: "{count} étape franchie",
  completedStepsOther: "{count} étapes franchies",
};

export function AgentGenerationProgress({
  prompt,
  storeName,
  isModifying = false,
}: AgentGenerationProgressProps) {
  const [duration, setDuration] = useState(0);
  const [stepPhase, setStepPhase] = useState<number>(0);

  // Timer elapsed
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setDuration((Date.now() - start) / 1000);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Progression réaliste des étapes
  useEffect(() => {
    const t1 = setTimeout(() => setStepPhase(1), 1200);
    const t2 = setTimeout(() => setStepPhase(2), 2600);
    const t3 = setTimeout(() => setStepPhase(3), 4200);
    const t4 = setTimeout(() => setStepPhase(4), 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Checklist des tâches (TodoList beui)
  const todoItems: TodoItem[] = isModifying
    ? [
        {
          id: "mod-1",
          title: "Analyse de la consigne commerçant",
          status: stepPhase >= 1 ? "completed" : "in-progress",
          detail: "Validation syntaxe",
        },
        {
          id: "mod-2",
          title: "Mise à jour des couleurs et typographies",
          status: stepPhase >= 2 ? "completed" : stepPhase >= 1 ? "in-progress" : "pending",
          detail: "Tokens CSS",
        },
        {
          id: "mod-3",
          title: "Réorganisation des sections et du catalogue",
          status: stepPhase >= 3 ? "completed" : stepPhase >= 2 ? "in-progress" : "pending",
          detail: "Architecture",
        },
        {
          id: "mod-4",
          title: "Recompilation de la prévisualisation temps réel",
          status: stepPhase >= 4 ? "completed" : stepPhase >= 3 ? "in-progress" : "pending",
          detail: "Direct Store",
        },
      ]
    : [
        {
          id: "todo-1",
          title: "Analyse du cahier des charges et de l'ambiance choisie",
          status: stepPhase >= 1 ? "completed" : "in-progress",
          detail: "Secteur & Ville",
        },
        {
          id: "todo-2",
          title: "Direction #1 : Modèle Principal (sur-mesure selon vos choix)",
          status: stepPhase >= 2 ? "completed" : stepPhase >= 1 ? "in-progress" : "pending",
          detail: "⭐ Prioritaire",
        },
        {
          id: "todo-3",
          title: "Directions #2 & #3 : Alternatives créatives complètes",
          status: stepPhase >= 3 ? "completed" : stepPhase >= 2 ? "in-progress" : "pending",
          detail: "✨ 100% Riches",
        },
        {
          id: "todo-4",
          title: "Génération du catalogue produits, zones de livraison & Wave",
          status: stepPhase >= 4 ? "completed" : stepPhase >= 3 ? "in-progress" : "pending",
          detail: "E-Commerce",
        },
        {
          id: "todo-5",
          title: "Assemblage final des 3 maquettes interactives",
          status: stepPhase >= 4 ? "in-progress" : "pending",
          detail: "Prêt au choix",
        },
      ];

  // Traces d'activité de l'agent (AgentActivity beui)
  const activityItems: AgentActivityItem[] = [
    {
      id: "trace-1",
      type: "trace",
      kind: "thinking",
      label: prompt ? `Demande : "${prompt.slice(0, 50)}..."` : "Demande initiale du commerçant",
      detail: "Extraction des produits et contraintes",
    },
    ...(stepPhase >= 1
      ? [
          {
            id: "trace-2",
            type: "trace" as const,
            kind: "write" as const,
            label: "Direction #1 (Modèle Principal)",
            detail: "Harmonisation typographique et chromatique selon vos réponses",
          },
        ]
      : []),
    ...(stepPhase >= 2
      ? [
          {
            id: "trace-3",
            type: "trace" as const,
            kind: "message" as const,
            label: "Conception des Directions #2 et #3 (Alternatives)",
            detail: "Variations de heroType, catalogLayout et storytelling",
          },
        ]
      : []),
    ...(stepPhase >= 3
      ? [
          {
            id: "trace-4",
            type: "trace" as const,
            kind: "run" as const,
            label: "Intégration Wave, Orange Money et WhatsApp direct",
            detail: "Paiement mobile sécurisé sans intermédiaire",
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-4 sm:p-5 space-y-4 shadow-xl animate-in fade-in duration-300">
      {/* Header avec indicateur live */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center shrink-0 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              {isModifying ? "Modification de votre boutique..." : "Conception de votre boutique sur-mesure..."}
            </h4>
            <p className="text-[11px] text-zinc-400">
              {storeName ? `Projet : "${storeName}"` : "Architecture mobile-first & paiement local"}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
          Boutique Sur-Mesure
        </span>
      </div>

      {/* Agent Activity (Temps de réflexion & shimmer beui) */}
      <div className="rounded-xl bg-[#0D0E14] border border-white/8 p-3">
        <AgentActivity
          items={activityItems}
          status="working"
          duration={duration}
          defaultOpen={true}
          labels={frenchActivityLabels}
          maxHeight={160}
        />
      </div>

      {/* Todo List (Checklist interactive beui) */}
      <div className="bg-[#0D0E14] rounded-xl border border-white/8">
        <TodoList
          items={todoItems}
          title={isModifying ? "Mise à jour en direct" : "Étapes de création des 3 modèles"}
          defaultOpen={true}
          labels={frenchTodoLabels}
          maxHeight={260}
          className="border-0 bg-transparent"
        />
      </div>
    </div>
  );
}

