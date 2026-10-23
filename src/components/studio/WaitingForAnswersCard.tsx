"use client";

import React, { useState } from "react";
import { ClarificationQuestion } from "@/types/store";
import { ChevronDown, ChevronUp, Check, Sparkles, Edit3 } from "lucide-react";

interface WaitingForAnswersCardProps {
  questions: ClarificationQuestion[];
  onAnswerChange: (questionId: string, newAnswer: string) => void;
}

export function WaitingForAnswersCard({
  questions,
  onAnswerChange,
}: WaitingForAnswersCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  return (
    <div className="rounded-2xl border border-white/10 bg-[#14151C] overflow-hidden shadow-xl animate-in fade-in duration-200">
      {/* CARD HEADER (SCREENSHOT 2 STYLE) */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/2 transition cursor-pointer border-b border-white/6"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">
            Votre cahier des charges
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
        </div>
        <div className="text-slate-400 hover:text-white transition">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </button>

      {/* CARD BODY WITH QUESTIONS */}
      {!isCollapsed && (
        <div className="divide-y divide-white/6">
          {questions.map((q) => {
            const isEditing = activeQuestionId === q.id;

            return (
              <div key={q.id} className="p-4 sm:p-5 space-y-2 hover:bg-white/[0.015] transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-medium text-slate-400">
                      {q.question}
                    </p>
                    <p className="text-sm font-bold text-white tracking-wide">
                      {q.currentAnswer}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setActiveQuestionId(null);
                      } else {
                        setActiveQuestionId(q.id);
                        setCustomText("");
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1 shrink-0"
                    title="Modifier cette réponse"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{isEditing ? "Fermer" : "Modifier"}</span>
                  </button>
                </div>

                {/* SELECTABLE OPTIONS DRAWER */}
                {isEditing && (
                  <div className="pt-2 space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((opt) => {
                        const isSelected = opt === q.currentAnswer;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              onAnswerChange(q.id, opt);
                              setActiveQuestionId(null);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold"
                                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom text input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customText.trim()) {
                            e.preventDefault();
                            onAnswerChange(q.id, customText.trim());
                            setActiveQuestionId(null);
                          }
                        }}
                        placeholder="Ou saisissez une réponse personnalisée..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                      />
                      <button
                        type="button"
                        disabled={!customText.trim()}
                        onClick={() => {
                          if (customText.trim()) {
                            onAnswerChange(q.id, customText.trim());
                            setActiveQuestionId(null);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
