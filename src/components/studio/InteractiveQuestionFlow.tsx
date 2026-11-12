"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Sparkles, Check, Lightbulb, Send } from "lucide-react";
import {
  ApprovalCard,
  type ApprovalCardQuestion,
  type ApprovalCardAnswers,
  type ApprovalCardMessages,
} from "@/components/agents/approval-card";
import { AgentActivity } from "@/components/agents/agent-activity";
import type {
  DiscoveryQuestion,
  DiscoveryResult,
  StoreBrief,
} from "@/lib/store-brief";

interface InteractiveQuestionFlowProps {
  prompt: string;
  onComplete: (brief: StoreBrief, questions: DiscoveryQuestion[]) => void;
}

type Phase = "describe" | "analyzing" | "asking" | "error";

const frenchApprovalLabels: Partial<ApprovalCardMessages> = {
  title: "Cahier des charges",
  submit: "Valider & Générer mes 3 modèles",
  nextQuestion: "Question suivante",
  previousQuestion: "Question précédente",
  customPlaceholder: "Autre précision personnalisée...",
  questionProgress: "Question {current} sur {total}",
  stepCount: "{current}/{total}",
  inputRequired: "Réponse requise",
  submitting: "Génération en cours...",
  approved: "Validé",
  answered: "Réponse enregistrée",
};

export function InteractiveQuestionFlow({ prompt, onComplete }: InteractiveQuestionFlowProps) {
  const initialPrompt = prompt.trim();
  const [phase, setPhase] = useState<Phase>(initialPrompt ? "analyzing" : "describe");
  const [effectivePrompt, setEffectivePrompt] = useState(initialPrompt);
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ApprovalCardAnswers>({});

  // 1. Analyse de la demande par l'IA → questions sur-mesure
  const analyze = useCallback(async (text: string) => {
    setPhase("analyzing");
    try {
      const res = await fetch("/api/clarify-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || "Réponse invalide");
      }
      setDiscovery({ understanding: data.understanding, questions: data.questions });

      // Initialiser les réponses par défaut (présélectionner la 1ère option si présente)
      const initialAnswers: ApprovalCardAnswers = {};
      data.questions.forEach((q: DiscoveryQuestion) => {
        initialAnswers[q.id] = {
          selected: q.options && q.options.length > 0 ? [q.options[0]] : [],
          custom: "",
        };
      });
      setAnswers(initialAnswers);
      setCurrentStep(0);
      setPhase("asking");
    } catch (err) {
      console.error("Analyse de la demande échouée:", err);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (!initialPrompt) return;
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) analyze(initialPrompt);
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [initialPrompt, analyze]);

  const handleSubmit = (finalAnswers: ApprovalCardAnswers) => {
    if (!discovery) return;
    const brief: StoreBrief = {
      prompt: effectivePrompt,
      understanding: discovery.understanding,
      answers: discovery.questions.map((q) => {
        const ans = finalAnswers[q.id];
        const parts = [...(ans?.selected || [])];
        if (ans?.custom?.trim()) parts.push(ans.custom.trim());
        return {
          id: q.id,
          question: q.question,
          answer: parts.length > 0 ? parts.join(", ") : (q.options[0] || ""),
        };
      }),
    };
    onComplete(brief, discovery.questions);
  };

  const AiAvatar = () => (
    <div className="h-6 w-6 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center shrink-0 text-xs font-bold">
      S
    </div>
  );

  // ───────────── PHASE 0 : pas de prompt initial ─────────────
  if (phase === "describe") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 space-y-3 shadow-xl animate-in fade-in duration-200">
        <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
          Commençons par votre projet
        </div>
        <h4 className="text-sm font-bold text-white">Que vendez-vous et à qui ?</h4>
        <p className="text-xs text-zinc-400">
          Décrivez votre commerce en une phrase (ex : &ldquo;Un garbadrome à Marcory qui vend attiéké et thon frit en livraison&rdquo;).
        </p>
        <div className="flex gap-2">
          <input
            id="discovery-custom-prompt"
            type="text"
            value={effectivePrompt}
            onChange={(e) => setEffectivePrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && effectivePrompt.trim()) {
                analyze(effectivePrompt.trim());
              }
            }}
            placeholder="Ex : Boutique de mode wax chic pour femmes à Cocody..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <button
            type="button"
            disabled={!effectivePrompt.trim()}
            onClick={() => analyze(effectivePrompt.trim())}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Continuer</span>
          </button>
        </div>
      </div>
    );
  }

  // ───────────── PHASE 1 : Analyse IA en cours ─────────────
  if (phase === "analyzing") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-4 shadow-xl animate-in fade-in duration-200">
        <AgentActivity
          items={[
            {
              id: "trace-analyze",
              type: "trace",
              kind: "thinking",
              label: `Analyse du secteur : "${effectivePrompt.slice(0, 50)}..."`,
              detail: "Identification des spécificités locales, produits et clientèle",
            },
          ]}
          status="working"
          defaultOpen={true}
          labels={{
            thinking: "Analyse de votre activité en cours…",
          }}
        />
      </div>
    );
  }

  // ───────────── PHASE ERROR ─────────────
  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-3 text-xs">
        <p className="text-red-300 font-semibold">Je n&apos;ai pas réussi à analyser votre demande.</p>
        <button
          id="discovery-retry"
          type="button"
          onClick={() => analyze(effectivePrompt)}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!discovery) return null;

  // Convertir discovery.questions vers ApprovalCardQuestion[]
  const approvalQuestions: ApprovalCardQuestion[] = discovery.questions.map((q) => ({
    id: q.id,
    title: q.question,
    description: q.why ? (
      <span className="flex items-center gap-1.5 text-xs text-amber-300/80">
        <Lightbulb className="h-3 w-3 text-amber-400 shrink-0" />
        {q.why}
      </span>
    ) : undefined,
    multiple: q.type === "multi",
    autoAdvance: q.type === "single",
    allowCustom: true,
    customPlaceholder: q.placeholder || "Préciser une autre réponse personnalisée...",
    options: q.options.map((opt) => ({
      value: opt,
      label: opt,
    })),
  }));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Reformulation intelligente de l'IA */}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div className="flex-1 rounded-2xl bg-[#14151C] border border-white/8 px-4 py-3 text-xs text-slate-200 space-y-2">
          <p className="leading-relaxed font-medium">{discovery.understanding.summary}</p>
          {discovery.understanding.known.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {discovery.understanding.known.map((k) => (
                <span
                  key={k.label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]"
                >
                  <Check className="h-2.5 w-2.5" />
                  {k.label} : {k.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Card beui pour le questionnaire interactif */}
      <ApprovalCard
        title="Cahier des charges sur-mesure"
        questions={approvalQuestions}
        step={currentStep}
        onStepChange={setCurrentStep}
        answers={answers}
        onAnswersChange={setAnswers}
        onSubmit={handleSubmit}
        submitLabel="Valider & Concevoir ma boutique"
        labels={frenchApprovalLabels}
        className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-2xl text-zinc-100"
      />
    </div>
  );
}
