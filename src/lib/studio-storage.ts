"use client";

import type { ReactVariant } from "@/lib/react-project-engine";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp?: number;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  type?: "single" | "multi" | "text" | string;
  why?: string;
  help?: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

export interface DiscoveryResult {
  understanding: {
    businessType: string;
    sector: string;
    summary: string;
    known: { label: string; value: string }[];
  };
  questions: DiscoveryQuestion[];
}

export interface StudioConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  initialPrompt: string;
  step: "questions" | "workspace";
  answers: Record<string, string>;
  discovery: DiscoveryResult | null;
  messages: ChatMessage[];
  variants: ReactVariant[];
  activeIdx: number;
  publishedSlug: string | null;
}

const STORAGE_KEY = "soko_conversations_v2";
const ACTIVE_KEY = "soko_active_conv_id_v2";

/**
 * Récupère toutes les conversations enregistrées, triées de la plus récente à la plus ancienne.
 */
export function listConversations(): StudioConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (err) {
    console.warn("[StudioStorage] Erreur lecture conversations:", err);
    return [];
  }
}

/**
 * Récupère une conversation par son ID.
 */
export function getConversation(id: string): StudioConversation | null {
  const all = listConversations();
  return all.find((c) => c.id === id) || null;
}

/**
 * Enregistre ou met à jour une conversation.
 */
export function saveConversation(conv: StudioConversation): void {
  if (typeof window === "undefined") return;
  try {
    const all = listConversations();
    const updatedConv = {
      ...conv,
      updatedAt: Date.now(),
    };
    const index = all.findIndex((c) => c.id === conv.id);
    if (index >= 0) {
      all[index] = updatedConv;
    } else {
      all.unshift(updatedConv);
    }
    // Conserver au maximum 30 conversations pour ménager le localStorage
    const trimmed = all.slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    localStorage.setItem(ACTIVE_KEY, conv.id);
  } catch (err) {
    console.warn("[StudioStorage] Erreur sauvegarde conversation:", err);
  }
}

/**
 * Supprime une conversation.
 */
export function deleteConversation(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = listConversations().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    if (getActiveConversationId() === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch (err) {
    console.warn("[StudioStorage] Erreur suppression conversation:", err);
  }
}

/**
 * Récupère l'ID de la conversation actuellement active.
 */
export function getActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

/**
 * Définit l'ID de la conversation actuellement active.
 */
export function setActiveConversationId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

/**
 * Formate un timestamp relatif lisible en français (ex : "Il y a 5 min", "Aujourd'hui à 14h20", "Hier").
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return "Récemment";
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `Aujourd'hui à ${h}h${m}`;
  }
  const d = new Date(timestamp);
  const daysDiff = Math.floor(diffHour / 24);
  if (daysDiff === 1) {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `Hier à ${h}h${m}`;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const month = monthNames[d.getMonth()] || "";
  return `${day} ${month}`;
}
