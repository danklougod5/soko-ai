"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Send,
  SkipForward,
  Pencil,
  Wand2,
  Lightbulb,
} from "lucide-react";
import type {
  DiscoveryQuestion,
  DiscoveryResult,
  StoreBrief,
} from "@/lib/store-brief";

interface InteractiveQuestionFlowProps {
  prompt: string;
  onComplete: (brief: StoreBrief, questions: DiscoveryQuestion[]) => void;
}

type Phase = "describe" | "analyzing" | "asking" | "review" | "error";

const SKIPPED = "Non précisé";

export function InteractiveQuestionFlow({ prompt, onComplete }: InteractiveQuestionFlowProps) {
  const initialPrompt = prompt.trim();
  const [phase, setPhase] = useState<Phase>(initialPrompt ? "analyzing" : "describe");
  const [effectivePrompt, setEffectivePrompt] = useState(initialPrompt);
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiDraft, setMultiDraft] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [returnToReview, setReturnToReview] = useState(false);

  const questions = discovery?.questions ?? [];
  const current: DiscoveryQuestion | undefined = questions[currentIndex];

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
      setCurrentIndex(0);
      setPhase("asking");
    } catch (err) {
      console.error("Analyse de la demande échouée:", err);
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (!initialPrompt) return;
    let cancelled = false;
    // Petit délai pour éviter le double appel du StrictMode en dev
    const t = setTimeout(() => {
      if (!cancelled) analyze(initialPrompt);
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [initialPrompt, analyze]);

  // Pré-remplir la sélection multiple quand on revient sur une question
  useEffect(() => {
    if (!current) return;
    const existing = answers[current.id];
    if (current.type === "multi" && existing && existing !== SKIPPED) {
      setMultiDraft(existing.split(", ").filter((v) => current.options.includes(v)));
    } else {
      setMultiDraft([]);
    }
    setCustomInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const goNext = (nextAnswers: Record<string, string>) => {
    if (returnToReview || currentIndex + 1 >= questions.length) {
      setReturnToReview(false);
      setPhase("review");
    } else {
      setCurrentIndex((i) => i + 1);
    }
    setAnswers(nextAnswers);
  };

  const submitAnswer = (value: string) => {
    if (!current) return;
    const clean = value.trim();
    if (!clean) return;
    goNext({ ...answers, [current.id]: clean });
  };

  const submitMulti = () => {
    const parts = [...multiDraft];
    if (customInput.trim()) parts.push(customInput.trim());
    if (parts.length === 0) return;
    submitAnswer(parts.join(", "));
  };

  const skip = () => {
    if (!current || current.required) return;
    goNext({ ...answers, [current.id]: SKIPPED });
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const editFromReview = (index: number) => {
    setCurrentIndex(index);
    setReturnToReview(true);
    setPhase("asking");
  };

  const finish = () => {
    if (!discovery) return;
    const brief: StoreBrief = {
      prompt: effectivePrompt,
      understanding: discovery.understanding,
      answers: questions.map((q) => ({
        id: q.id,
        question: q.question,
        answer: answers[q.id] && answers[q.id] !== SKIPPED ? answers[q.id] : "",
      })),
    };
    onComplete(brief, questions);
  };

  const AiAvatar = () => (
    <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 text-xs font-bold">
      S
    </div>
  );

  // ───────────── PHASE 0 : pas de prompt → demander l'activité ─────────────
  if (phase === "describe") {
    return (
      <div className="rounded-2xl border border-purple-500/30 bg-[#141520] p-5 space-y-3 shadow-xl animate-in fade-in duration-200">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Commençons par votre projet
        </div>
        <h4 className="text-sm font-bold text-white">Que vendez-vous et à qui ?</h4>
        <p className="text-xs text-slate-400">
          Décrivez votre activité en une phrase. Je vous poserai ensuite quelques questions pour créer un site 100% adapté.
        </p>
        <textarea
          id="discovery-describe-input"
          rows={3}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ex : Je vends des perruques et mèches brésiliennes à Abidjan, livraison à domicile"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
        />
        <button
          id="discovery-describe-submit"
          type="button"
          disabled={customInput.trim().length < 5}
          onClick={() => {
            const text = customInput.trim();
            setEffectivePrompt(text);
            setCustomInput("");
            analyze(text);
          }}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          Analyser mon projet <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // ───────────── PHASE 1 : analyse IA ─────────────
  if (phase === "analyzing") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141520] border border-purple-500/20 text-xs text-purple-300 animate-in fade-in duration-200">
        <ThinkingOrb state="working" size={32} color="#A855F7" />
        <div className="space-y-0.5">
          <p className="font-semibold animate-pulse">J&apos;analyse votre projet…</p>
          <p className="text-slate-400">Je prépare les questions utiles pour concevoir votre boutique sur-mesure.</p>
        </div>
      </div>
    );
  }

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

  const answeredBefore = questions.slice(0, phase === "review" ? questions.length : currentIndex);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Reformulation de l'IA */}
      <div className="flex items-start gap-2.5">
        <AiAvatar />
        <div className="flex-1 rounded-2xl bg-[#14151C] border border-white/8 px-4 py-3 text-xs text-slate-200 space-y-2">
          <p className="leading-relaxed">{discovery.understanding.summary}</p>
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

      {/* Historique des réponses (mode questions) */}
      {phase === "asking" &&
        !returnToReview &&
        answeredBefore.map((q) => (
          <div key={q.id} className="space-y-2">
            <div className="flex items-start gap-2.5">
              <AiAvatar />
              <div className="rounded-2xl bg-[#14151C] border border-white/8 px-4 py-2.5 text-xs text-slate-300">
                {q.question}
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-[#1E202A] border border-white/10 px-4 py-2 text-xs font-semibold text-white flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className={answers[q.id] === SKIPPED ? "text-slate-500 italic" : ""}>
                  {answers[q.id] === SKIPPED ? "Je laisse l'IA proposer" : answers[q.id]}
                </span>
              </div>
            </div>
          </div>
        ))}

      {/* Question active */}
      {phase === "asking" && current && (
        <div
          key={current.id}
          className="rounded-2xl border border-purple-500/30 bg-[#141520] p-4 sm:p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Question {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden max-w-[140px]">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white leading-snug">
              {current.question}
              {current.required && <span className="text-fuchsia-400"> *</span>}
            </h4>
            {current.why && (
              <p className="text-[11px] text-slate-400 flex items-start gap-1.5">
                <Lightbulb className="h-3 w-3 mt-0.5 text-amber-400 shrink-0" />
                {current.why}
              </p>
            )}
            {current.type === "multi" && (
              <p className="text-[10px] text-purple-300/80">Plusieurs choix possibles</p>
            )}
          </div>

          {/* Options */}
          {current.options.length > 0 && (
            <div className={current.type === "multi" ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
              {current.options.map((option, i) => {
                if (current.type === "multi") {
                  const selected = multiDraft.includes(option);
                  return (
                    <button
                      id={`discovery-${current.id}-opt-${i}`}
                      key={option}
                      type="button"
                      onClick={() =>
                        setMultiDraft((prev) =>
                          selected ? prev.filter((o) => o !== option) : [...prev, option]
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 active:scale-[0.98] ${
                        selected
                          ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                          : "bg-white/5 border-white/8 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                          selected ? "bg-white border-white" : "border-white/30"
                        }`}
                      >
                        {selected && <Check className="h-2.5 w-2.5 text-purple-600" />}
                      </span>
                      {option}
                    </button>
                  );
                }
                const isCurrent = answers[current.id] === option;
                return (
                  <button
                    id={`discovery-${current.id}-opt-${i}`}
                    key={option}
                    type="button"
                    onClick={() => submitAnswer(option)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 flex items-center justify-between group active:scale-[0.99] cursor-pointer ${
                      isCurrent
                        ? "bg-purple-600/30 border-purple-500 text-white"
                        : "bg-white/5 hover:bg-purple-600 hover:text-white border-white/8 hover:border-purple-500 text-slate-200"
                    }`}
                  >
                    <span>{option}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Saisie libre */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/6">
            <input
              id={`discovery-${current.id}-custom`}
              type="text"
              autoFocus={current.type === "text"}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (current.type === "multi") submitMulti();
                  else submitAnswer(customInput);
                }
              }}
              placeholder={
                current.placeholder ||
                (current.type === "multi" ? "Autre chose ? (optionnel)" : "Ou saisissez votre réponse…")
              }
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            <button
              id={`discovery-${current.id}-submit`}
              type="button"
              disabled={current.type === "multi" ? multiDraft.length === 0 && !customInput.trim() : !customInput.trim()}
              onClick={() => (current.type === "multi" ? submitMulti() : submitAnswer(customInput))}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>{current.type === "multi" ? "Continuer" : "Valider"}</span>
              <Send className="h-3 w-3" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between text-[11px]">
            <button
              id="discovery-back"
              type="button"
              onClick={returnToReview ? () => { setReturnToReview(false); setPhase("review"); } : goBack}
              disabled={!returnToReview && currentIndex === 0}
              className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-0 transition cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              {returnToReview ? "Retour au récapitulatif" : "Précédent"}
            </button>
            {!current.required && (
              <button
                id="discovery-skip"
                type="button"
                onClick={skip}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                Laisser l&apos;IA décider
                <SkipForward className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Récapitulatif = cahier des charges */}
      {phase === "review" && (
        <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-[#121a17] to-[#141520] p-4 sm:p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <Check className="h-3.5 w-3.5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Votre cahier des charges</h4>
              <p className="text-[11px] text-slate-400">Vérifiez vos réponses avant que je crée votre boutique.</p>
            </div>
          </div>

          <ul className="divide-y divide-white/6 rounded-xl border border-white/8 bg-black/20">
            {questions.map((q, idx) => {
              const a = answers[q.id];
              const skipped = !a || a === SKIPPED;
              return (
                <li key={q.id} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[11px] text-slate-400">{q.question}</p>
                    <p className={`text-xs font-semibold ${skipped ? "text-slate-500 italic" : "text-white"}`}>
                      {skipped ? "L'IA proposera le plus adapté" : a}
                    </p>
                  </div>
                  <button
                    id={`discovery-edit-${q.id}`}
                    type="button"
                    onClick={() => editFromReview(idx)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            id="discovery-generate"
            type="button"
            onClick={finish}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Créer ma boutique sur-mesure
          </button>
        </div>
      )}
    </div>
  );
}
