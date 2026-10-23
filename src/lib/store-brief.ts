/**
 * Phase de découverte : l'IA pose des questions au commerçant AVANT de
 * générer la boutique. Ce module contient les types partagés (client + serveur)
 * et les helpers pour transformer les réponses en un "cahier des charges".
 */
import type { ClarificationQuestion } from "@/types/store";

/** Identifiants de thèmes connus — permettent de mapper les réponses sur la config boutique. */
export const KNOWN_TOPICS = [
  "products",
  "priceRange",
  "audience",
  "name",
  "city",
  "delivery",
  "payment",
  "whatsapp",
  "style",
  "differentiator",
] as const;

export type DiscoveryQuestionType = "single" | "multi" | "text";

export interface DiscoveryQuestion {
  id: string;
  question: string;
  /** Pourquoi l'IA pose cette question (affiché en petit sous la question). */
  why?: string;
  type: DiscoveryQuestionType;
  options: string[];
  placeholder?: string;
  required: boolean;
}

export interface DiscoveryUnderstanding {
  /** Type d'activité compris, ex: "Boutique de sneakers", "Garbadrome". */
  businessType: string;
  sector: "food" | "mode" | "luxe" | "artisanat" | "tech" | "beaute" | "general";
  /** Phrase de reformulation affichée au commerçant. */
  summary: string;
  /** Informations déjà présentes dans le prompt (pas besoin de les redemander). */
  known: { label: string; value: string }[];
}

export interface DiscoveryResult {
  understanding: DiscoveryUnderstanding;
  questions: DiscoveryQuestion[];
}

export interface BriefAnswer {
  id: string;
  question: string;
  answer: string;
}

/** Cahier des charges structuré envoyé au générateur. */
export interface StoreBrief {
  prompt: string;
  understanding: DiscoveryUnderstanding;
  answers: BriefAnswer[];
}

export function getBriefAnswer(brief: StoreBrief | undefined, id: string): string | undefined {
  const value = brief?.answers.find((a) => a.id === id)?.answer?.trim();
  if (!value || /^(passer|je ne sais pas|pas encore décidé|à proposer|propose)/i.test(value)) {
    return undefined;
  }
  return value;
}

/** Rend le brief lisible pour le prompt du LLM. */
export function briefToPromptText(brief: StoreBrief): string {
  const known = brief.understanding.known
    .map((k) => `- ${k.label} : ${k.value}`)
    .join("\n");
  const answers = brief.answers
    .map((a) => `- [${a.id}] ${a.question}\n  → ${a.answer || "Non précisé (à toi de proposer le plus pertinent)"}`)
    .join("\n");

  return [
    `DEMANDE INITIALE : "${brief.prompt}"`,
    `ACTIVITÉ COMPRISE : ${brief.understanding.businessType} (secteur : ${brief.understanding.sector})`,
    known ? `INFORMATIONS DÉJÀ CONNUES :\n${known}` : "",
    `RÉPONSES DU COMMERÇANT AUX QUESTIONS :\n${answers}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Compatibilité avec l'ancien format { products, name, payment, style }. */
export function briefToLegacyAnswers(brief: StoreBrief) {
  return {
    products: getBriefAnswer(brief, "products") || brief.understanding.businessType || brief.prompt,
    name: getBriefAnswer(brief, "name") || "",
    payment: getBriefAnswer(brief, "payment") || "",
    style: getBriefAnswer(brief, "style") || "",
  };
}

/** Transforme le brief en cartes éditables pour le récapitulatif post-génération. */
export function briefToSummaryQuestions(
  brief: StoreBrief,
  discoveryQuestions: DiscoveryQuestion[]
): ClarificationQuestion[] {
  return brief.answers.map((a) => {
    const dq = discoveryQuestions.find((q) => q.id === a.id);
    return {
      id: a.id,
      question: a.question,
      currentAnswer: a.answer || "Non précisé",
      options: dq?.options ?? [],
    };
  });
}

export function updateBriefAnswer(brief: StoreBrief, id: string, answer: string): StoreBrief {
  return {
    ...brief,
    answers: brief.answers.map((a) => (a.id === id ? { ...a, answer } : a)),
  };
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
