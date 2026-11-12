"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  ExternalLink,
  Globe,
  Check,
  Smartphone,
  Monitor,
  ArrowLeft,
  Send,
  Layers,
  FileCode2,
  X,
  Cpu,
  Maximize2,
  Minimize2,
  Target,
  MousePointer,
  History,
  Plus,
  MessageSquare,
  Bot,
} from "lucide-react";
import { buildReactShell } from "@/lib/react-shell";
import {
  ensureWebContainerReady,
  mountReactProjectFiles,
  subscribeWebContainer,
  type WebContainerState,
} from "@/lib/webcontainer";
import {
  listConversations,
  saveConversation,
  getActiveConversationId,
  setActiveConversationId,
  type StudioConversation,
  type DiscoveryQuestion,
  type DiscoveryResult,
} from "@/lib/studio-storage";
import { ConversationHistoryModal } from "@/components/studio/ConversationHistoryModal";
import { SwarmAgentTeam } from "@/components/studio/SwarmAgentTeam";
import { SwarmModal } from "@/components/studio/SwarmModal";
import {
  ApprovalCard,
  type ApprovalCardQuestion,
  type ApprovalCardAnswers,
  type ApprovalCardMessages,
} from "@/components/agents/approval-card";
import { AgentActivity } from "@/components/agents/agent-activity";
import { AgentGenerationProgress } from "@/components/studio/AgentGenerationProgress";
import {
  SectionSelectorToolbar,
  VisualCanvasOverlay,
  type StoreSection,
} from "@/components/studio/SectionInspector";

interface ReactFile {
  path: string;
  content: string;
}

interface ReactMeta {
  storeName: string;
  slug: string;
  whatsapp: string;
  city: string;
}

interface ReactVariant {
  id: string;
  label: string;
  description: string;
  files: ReactFile[];
  meta: ReactMeta;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const TIMELINE_STEPS = [
  "Analyse de votre activité et de vos besoins",
  "Recherche de marché locale & étalonnage des prix FCFA",
  "Conception de l'architecture & identité visuelle sur-mesure",
  "Mise en rayon du catalogue & fiches produits détaillées",
  "Configuration commande WhatsApp & Paiement mobile Wave/OM",
  "Finalisation et compilation de votre boutique en direct",
];

const frenchApprovalLabels: Partial<ApprovalCardMessages> = {
  title: "Cahier des charges sur-mesure",
  submit: "Valider & Générer ma boutique sur-mesure",
  nextQuestion: "Question suivante",
  previousQuestion: "Question précédente",
  customPlaceholder: "Préciser une autre réponse...",
  questionProgress: "Question {current} sur {total}",
  stepCount: "{current}/{total}",
  inputRequired: "Réponse requise",
  submitting: "Génération en cours...",
  approved: "Validé",
  answered: "Réponse enregistrée",
};

export default function ReactStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080A] text-white flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
        </div>
      }
    >
      <ReactStudio />
    </Suspense>
  );
}

function ReactStudio() {
  const searchParams = useSearchParams();
  const landingPrompt = searchParams.get("prompt") || "";

  const [step, setStep] = useState<"questions" | "workspace">("questions");
  const [landingInput, setLandingInput] = useState(landingPrompt);

  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStep, setQuestionStep] = useState(0);
  const [approvalAnswers, setApprovalAnswers] = useState<ApprovalCardAnswers>({});
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [whatsappFallback, setWhatsappFallback] = useState("");

  const [variants, setVariants] = useState<ReactVariant[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSection, setSelectedSection] = useState<StoreSection | null>(null);
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [previewFull, setPreviewFull] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timelineStep, setTimelineStep] = useState(-1);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isSwitchingVariant, setIsSwitchingVariant] = useState(false);
  const lastMountedKeyRef = useRef<string | null>(null);

  const [chatInput, setChatInput] = useState("");
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewedFile, setViewedFile] = useState<ReactFile | null>(null);
  const isDev = searchParams.get("dev") === "true";
  const [showFiles, setShowFiles] = useState(false);
  const [wcState, setWcState] = useState<WebContainerState>({
    phase: "idle",
    previewUrl: null,
    error: null,
    lastPreviewError: null,
  });
  const previewEndRef = useRef<HTMLDivElement>(null);
  const clarifyFetchedPromptRef = useRef<string | null>(null);

  // ── GESTION DE L'HISTORIQUE DES CONVERSATIONS & PROJETS ────────────────
  const [conversations, setConversations] = useState<StudioConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(() => `conv-${Date.now()}`);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState(false);
  const convCreatedAtRef = useRef<number>(Date.now());
  const initialLoadDoneRef = useRef(false);

  const loadConversationState = (conv: StudioConversation) => {
    setActiveConvId(conv.id);
    setActiveConversationId(conv.id);
    convCreatedAtRef.current = conv.createdAt || Date.now();
    setStep(conv.step || (conv.variants?.length ? "workspace" : "questions"));
    setAnswers(conv.answers || {});
    setDiscovery(conv.discovery || null);
    setVariants(conv.variants || []);
    setActiveIdx(conv.activeIdx || 0);
    setMessages(conv.messages || []);
    setPublishedSlug(conv.publishedSlug || null);
    setSelectedSection(null);
    if (conv.initialPrompt) {
      setLandingInput(conv.initialPrompt);
    }
  };

  const handleStartNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setActiveConvId(newId);
    setActiveConversationId(newId);
    convCreatedAtRef.current = Date.now();
    setStep("questions");
    setLandingInput("");
    setDiscovery(null);
    setAnswers({});
    setApprovalAnswers({});
    setVariants([]);
    setActiveIdx(0);
    setMessages([]);
    setPublishedSlug(null);
    setSelectedSection(null);
    setIsPreviewReady(false);
  };

  // Chargement initial des conversations sauvegardées
  useEffect(() => {
    const list = listConversations();
    setConversations(list);

    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    // Si landingPrompt est spécifié dans l'URL, l'utilisateur démarre une nouvelle session
    if (landingPrompt) {
      const newId = `conv-${Date.now()}`;
      setActiveConvId(newId);
      setActiveConversationId(newId);
      convCreatedAtRef.current = Date.now();
      return;
    }

    // Sinon, restaurer la dernière conversation active
    const savedActiveId = getActiveConversationId();
    const targetConv = (savedActiveId && list.find((c) => c.id === savedActiveId)) || list[0];
    if (targetConv) {
      loadConversationState(targetConv);
    }
  }, [landingPrompt]);

  const saveStoreReactMutation = useMutation(api.stores.saveStoreReact);

  const active = variants[activeIdx];

  const effectivePrompt = landingPrompt || landingInput;

  // Auto-sauvegarde de la conversation et de l'état du projet à chaque mise à jour
  useEffect(() => {
    if (!initialLoadDoneRef.current) return;
    if (!effectivePrompt && variants.length === 0 && messages.length === 0) return;

    const convTitle =
      answers["name"] ||
      active?.meta.storeName ||
      (effectivePrompt ? (effectivePrompt.length > 35 ? effectivePrompt.slice(0, 35) + "…" : effectivePrompt) : "Boutique en cours");

    const conv: StudioConversation = {
      id: activeConvId,
      title: convTitle,
      createdAt: convCreatedAtRef.current,
      updatedAt: Date.now(),
      initialPrompt: effectivePrompt,
      step,
      answers,
      discovery,
      messages,
      variants,
      activeIdx,
      publishedSlug,
    };
    saveConversation(conv);
    setConversations(listConversations());
  }, [
    activeConvId,
    effectivePrompt,
    step,
    answers,
    discovery,
    messages,
    variants,
    activeIdx,
    publishedSlug,
    active?.meta.storeName,
  ]);

  // Démarre le Singleton WebContainer (Vite + React) en tâche de fond dès l'arrivée sur le studio
  useEffect(() => {
    const unsub = subscribeWebContainer((state) => setWcState(state));
    ensureWebContainerReady().catch((err) => {
      console.warn("[WebContainer] Fallback sur shell Babel:", err);
    });
    return unsub;
  }, []);

  // Synchronise les fichiers de la variante active dans le WebContainer si pas déjà montée
  useEffect(() => {
    if (!active?.files?.length) {
      setIsPreviewReady(false);
      return;
    }
    const variantKey = `${active.id}-${active.files.reduce((n, f) => n + f.content.length, 0)}`;
    if (lastMountedKeyRef.current === variantKey) return;
    lastMountedKeyRef.current = variantKey;

    let cancelled = false;
    mountReactProjectFiles(active.files)
      .then(() => {
        if (!cancelled) {
          setTimeout(() => {
            if (!cancelled) setIsPreviewReady(true);
          }, 350);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("[WebContainer] Erreur écriture fichiers:", err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeIdx, active]);

  // Mode plein écran de l'aperçu : Échap pour sortir
  useEffect(() => {
    if (!previewFull) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFull(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [previewFull]);

  useEffect(() => {
    if (!landingPrompt || discovery || isLoadingDiscovery) return;
    if (clarifyFetchedPromptRef.current === landingPrompt) return;
    clarifyFetchedPromptRef.current = landingPrompt;

    setIsLoadingDiscovery(true);
    fetch("/api/clarify-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: landingPrompt }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.questions) {
          setDiscovery({ understanding: data.understanding, questions: data.questions });
          const initialAns: Record<string, string> = {};
          const initialApproval: ApprovalCardAnswers = {};
          for (const q of data.questions) {
            if (q.options?.length > 0) {
              initialAns[q.id] = q.type === "single" ? q.options[0] : "";
              initialApproval[q.id] = {
                selected: q.type === "single" ? [q.options[0]] : [],
                custom: "",
              };
            } else {
              initialApproval[q.id] = { selected: [], custom: "" };
            }
          }
          setAnswers(initialAns);
          setApprovalAnswers(initialApproval);
          setQuestionStep(0);
        }
      })
      .catch(() => setDiscovery(null))
      .finally(() => setIsLoadingDiscovery(false));
  }, [landingPrompt, discovery, isLoadingDiscovery]);

  useEffect(() => {
    if (step !== "workspace") return;
    const timer = setInterval(() => {
      setTimelineStep((prev) => {
        if (!isGenerating) return TIMELINE_STEPS.length;
        return Math.min(prev + 1, TIMELINE_STEPS.length - 1);
      });
    }, 9000);
    return () => clearInterval(timer);
  }, [step, isGenerating]);

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const canGenerate = () => {
    const required = (discovery?.questions || []).filter((q) => q.required);
    return required.every((q) => (answers[q.id] || "").trim().length > 0);
  };

  const buildNotes = (ans: Record<string, string> = answers): string => {
    const lines: string[] = [];
    for (const q of discovery?.questions || []) {
      const a = ans[q.id];
      if (a && a !== "Non précisé") lines.push(`- ${q.question} → ${a}`);
    }
    if (whatsappFallback) lines.push(`- Numéro WhatsApp du commerçant → ${whatsappFallback}`);
    return lines.join("\n");
  };

  const startGenerationWithAnswers = async (customAnswers?: Record<string, string>) => {
    if (!effectivePrompt.trim() || isGenerating) return;
    const currentAnswers = customAnswers || answers;
    setStep("workspace");
    setIsGenerating(true);
    setIsPreviewReady(false);
    setTimelineStep(0);

    const notes = buildNotes(currentAnswers);
    const nameAnswer = currentAnswers["name"];
    const waAnswer = [currentAnswers["whatsapp"], whatsappFallback].find((v) => v && v.replace(/\D/g, "").length >= 8);
    const cityAnswer = currentAnswers["city"];

    const seededMsgs: ChatMessage[] = [{ id: "u0", role: "user", text: effectivePrompt }];
    if (notes) seededMsgs.push({ id: "a-brief", role: "assistant", text: `Merci ! Je conçois votre boutique sur-mesure à partir de vos réponses :\n${notes}` });
    setMessages(seededMsgs);

    try {
      const res = await fetch("/api/generate-react-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: effectivePrompt,
          notes: notes || undefined,
          storeName: nameAnswer || undefined,
          whatsapp: waAnswer?.replace(/\D/g, "") || undefined,
          city: cityAnswer || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.variants?.length) throw new Error(data.error || data.failed?.join(" ; ") || "Génération échouée");

      const slugCount: Record<string, number> = {};
      const withSlugs: ReactVariant[] = data.variants.map((v: ReactVariant) => {
        const base = v.meta.slug;
        slugCount[base] = (slugCount[base] || 0) + 1;
        const suffix = ["a", "b", "c"][slugCount[base] - 1] || String(slugCount[base]);
        return { ...v, meta: { ...v.meta, slug: slugCount[base] === 1 ? base : `${base}-${suffix}` } };
      });

      // Étape finale : on compile et monte l'arborescence dans WebContainer AVANT de quitter le mode chargement
      setTimelineStep(TIMELINE_STEPS.length - 1);
      const firstVariant = withSlugs[0];
      if (firstVariant?.files?.length) {
        const key = `${firstVariant.id}-${firstVariant.files.reduce((n: number, f: ReactFile) => n + f.content.length, 0)}`;
        lastMountedKeyRef.current = key;
        try {
          await mountReactProjectFiles(firstVariant.files);
          // Stabilisation Vite HMR pour s'assurer que Vite a compilé main.jsx
          await new Promise((r) => setTimeout(r, 450));
        } catch (mErr) {
          console.warn("[WebContainer] Montage variante 0:", mErr);
        }
      }

      setVariants(withSlugs);
      setActiveIdx(0);
      setIsPreviewReady(true);
      setMessages((prev) => [
        ...prev,
        {
          id: "a0",
          role: "assistant",
          text: `✨ Votre boutique sur-mesure est prête et interactive ! Vous pouvez cibler une section ci-dessus (Hero, Catalogue, Avis...) pour la modifier avec précision, ou m'écrire vos souhaits d'ajustement.`,
        },
      ]);
      setTimeout(() => previewEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", text: `⚠️ ${err instanceof Error ? err.message : "Erreur"}` },
      ]);
    } finally {
      setIsGenerating(false);
      setTimelineStep(TIMELINE_STEPS.length);
    }
  };

  const startGeneration = () => startGenerationWithAnswers(answers);

  const handleApprovalSubmit = (finalAnswers: ApprovalCardAnswers) => {
    const mappedAnswers: Record<string, string> = {};
    (discovery?.questions || []).forEach((q) => {
      const a = finalAnswers[q.id];
      const parts = [...(a?.selected || [])];
      if (a?.custom?.trim()) parts.push(a.custom.trim());
      mappedAnswers[q.id] = parts.length > 0 ? parts.join(" | ") : (q.options?.[0] || "");
    });
    setAnswers(mappedAnswers);
    startGenerationWithAnswers(mappedAnswers);
  };

  const switchVariant = async (targetIdx: number) => {
    if (targetIdx === activeIdx || isSwitchingVariant || isGenerating) return;
    const target = variants[targetIdx];
    if (!target) return;
    setIsSwitchingVariant(true);
    setActiveIdx(targetIdx);
    const key = `${target.id}-${target.files.reduce((n, f) => n + f.content.length, 0)}`;
    lastMountedKeyRef.current = key;
    try {
      await mountReactProjectFiles(target.files);
      await new Promise((r) => setTimeout(r, 350));
    } catch (err) {
      console.warn("[WebContainer] Erreur changement variante:", err);
    } finally {
      setIsSwitchingVariant(false);
    }
  };

  const sendEdit = async (customInstruction?: string, sectionOverride?: StoreSection | null) => {
    const instruction = (customInstruction || chatInput).trim();
    const targetSectionObj = sectionOverride !== undefined ? sectionOverride : selectedSection;
    if (!instruction || !active || isGenerating) return;
    if (!customInstruction) setChatInput("");

    const userMsgText = targetSectionObj
      ? `[Section : ${targetSectionObj.shortLabel}]\n${instruction}`
      : instruction;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: userMsgText }]);
    setIsGenerating(true);
    setIsPreviewReady(false);
    try {
      const res = await fetch("/api/edit-react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: active.files,
          meta: active.meta,
          instruction,
          targetSection: targetSectionObj?.name,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.files?.length) throw new Error(data.error || "Échec modification");
      const newFiles: ReactFile[] = data.files;
      const newMeta: ReactMeta = data.meta;
      const updatedPaths: string[] = Array.isArray(data.updatedPaths) ? data.updatedPaths : [];

      const key = `${active.id}-${newFiles.reduce((n: number, f: ReactFile) => n + f.content.length, 0)}`;
      lastMountedKeyRef.current = key;
      try {
        await mountReactProjectFiles(newFiles);
        await new Promise((r) => setTimeout(r, 400));
      } catch (mErr) {
        console.warn("[WebContainer] Erreur montage après édition:", mErr);
      }

      setVariants((prev) =>
        prev.map((v, i) =>
          i === activeIdx ? { ...v, files: newFiles, meta: { ...v.meta, ...newMeta, slug: v.meta.slug } } : v
        )
      );
      setIsPreviewReady(true);
      const sectionLabel = targetSectionObj ? ` sur "${targetSectionObj.shortLabel}"` : "";
      const updatedLabel = updatedPaths.length ? ` (${updatedPaths.join(", ")})` : "";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `✅ Modification appliquée avec succès${sectionLabel}${updatedLabel} ! Votre boutique a été actualisée en direct.`,
        },
      ]);
      setTimeout(() => previewEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setIsPreviewReady(true);
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", text: `⚠️ ${err instanceof Error ? err.message : "Erreur"}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const publish = async () => {
    if (!active) return;
    try {
      await saveStoreReactMutation({
        slug: active.meta.slug,
        storeName: active.meta.storeName,
        whatsappNumber: active.meta.whatsapp,
        phone: `+${active.meta.whatsapp}`,
        city: active.meta.city,
        reactFiles: JSON.stringify(active.files),
      });
      setPublishedSlug(active.meta.slug);
    } catch (err) {
      console.error("Publication Convex:", err);
    }
  };

  // ── ÉCRAN QUESTIONS ───────────────────────────────────────────────────
  if (step === "questions") {
    return (
      <div className="min-h-screen bg-[#08080A] text-white px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Accueil
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSwarmModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer shadow-xs"
                title="Découvrir l'équipe multi-agents Swarm"
              >
                <Bot className="h-3.5 w-3.5 text-zinc-400" />
                <span>Équipe Swarm (4)</span>
              </button>
              {conversations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/90 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer shadow-xs"
                >
                  <History className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Historique ({conversations.length})</span>
                </button>
              )}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-zinc-400" /> Studio de Création — Votre boutique sur-mesure
              </span>
            </div>
          </div>

          <div className="bg-[#0F0F12] border border-zinc-800 rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-medium">Votre demande</p>
            {!landingPrompt && (
              <textarea
                rows={2}
                placeholder="Décrivez votre boutique ici…"
                value={landingInput}
                onChange={(e) => setLandingInput(e.target.value)}
                className="w-full mb-4 rounded-xl bg-black/40 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
              />
            )}
            {landingPrompt && <p className="text-sm text-zinc-200 leading-relaxed">{landingPrompt}</p>}
          </div>

          {isLoadingDiscovery && (
            <div className="rounded-2xl border border-zinc-800 bg-[#0F0F12] p-5 shadow-xl">
              <AgentActivity
                items={[
                  {
                    id: "trace-analyze",
                    type: "trace",
                    kind: "thinking",
                    label: `Analyse de votre activité : "${effectivePrompt.slice(0, 50)}..."`,
                    detail: "Identification du secteur, des produits phares et des attentes clients",
                  },
                ]}
                status="working"
                defaultOpen={true}
                labels={{
                  thinking: "Analyse de votre besoin et préparation des questions…",
                }}
              />
            </div>
          )}

          {discovery && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Résumé de l'IA */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Compréhension de votre projet</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">{discovery.understanding.summary}</p>
                {discovery.understanding.known?.length > 0 && (
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

              {/* ApprovalCard moderne pour le questionnaire interactif */}
              <ApprovalCard
                title="Cahier des charges sur-mesure"
                questions={(discovery?.questions || []).map((q) => ({
                  id: q.id,
                  title: (
                    <span>
                      {q.question}
                      {q.required && <span className="text-rose-400 ml-1 font-bold">*</span>}
                    </span>
                  ),
                  description: q.why ? (
                    <span className="flex items-center gap-1.5 text-xs text-amber-300/80 mt-1">
                      <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                      {q.why}
                    </span>
                  ) : undefined,
                  multiple: q.type === "multi",
                  autoAdvance: q.type === "single",
                  allowCustom: true,
                  customPlaceholder: q.placeholder || (q.id === "whatsapp" ? "Ex: +225 07 00 00 00 00" : "Autre précision personnalisée..."),
                  options: (q.options || []).map((opt) => ({
                    value: opt,
                    label: opt,
                  })),
                }))}
                step={questionStep}
                onStepChange={setQuestionStep}
                answers={approvalAnswers}
                onAnswersChange={setApprovalAnswers}
                onSubmit={handleApprovalSubmit}
                submitLabel="Valider & Générer ma boutique sur-mesure"
                labels={frenchApprovalLabels}
                className="rounded-2xl border border-zinc-800 bg-[#0F0F12] p-5 shadow-2xl text-zinc-100"
              />
            </div>
          )}
        </div>

        <ConversationHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          conversations={conversations}
          activeConversationId={activeConvId}
          onSelectConversation={loadConversationState}
          onNewConversation={handleStartNewConversation}
          onRefreshList={() => setConversations(listConversations())}
        />

        <SwarmModal
          isOpen={isSwarmModalOpen}
          onClose={() => setIsSwarmModalOpen(false)}
        />
      </div>
    );
  }

  // ── WORKSPACE ─────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#09090b] text-white flex flex-col overflow-hidden">
      <div className="border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 bg-[#0C0C0F]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-zinc-100 text-sm shrink-0 shadow-sm">
            S
          </span>
          <div className="min-w-0 mr-1">
            <p className="text-sm font-semibold truncate text-zinc-100">{active?.meta.storeName || "Boutique en création…"}</p>
            <p className="text-[10px] text-zinc-400 font-medium truncate">{active ? `Aperçu en direct — ${active.label}` : "Design sur-mesure"}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer shrink-0"
            title="Historique des conversations et boutiques"
          >
            <History className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Historique</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300">
                {conversations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleStartNewConversation}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer shrink-0"
            title="Démarrer une nouvelle boutique"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden md:inline">Nouveau</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSwarmModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer shrink-0"
            title="Inspecter l'équipe multi-agents Swarm"
          >
            <Bot className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Équipe Swarm</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[10px] text-emerald-300 font-mono">
              4 agents
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Boutique en direct
          </span>
          {wcState.phase !== "ready" && (
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium ${
                wcState.phase === "error"
                  ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300"
              }`}
              title={wcState.error || undefined}
            >
              {wcState.phase !== "error" && <Loader2 className="h-3 w-3 animate-spin" />}
              {wcState.phase === "idle" && "Initialisation…"}
              {wcState.phase === "booting" && "Démarrage du moteur…"}
              {wcState.phase === "installing" && "Installation des packages…"}
              {wcState.phase === "starting" && "Compilation Vite…"}
              {wcState.phase === "error" && "Aperçu Babel (moteur indisponible)"}
            </span>
          )}
          {isDev && active && (
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
              title={showFiles ? "Masquer le code" : "Afficher le code (Mode Développeur)"}
            >
              <FileCode2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setDeviceMode(deviceMode === "desktop" ? "mobile" : "desktop")}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title={deviceMode === "desktop" ? "Vue mobile" : "Vue ordinateur"}
          >
            {deviceMode === "desktop" ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setPreviewFull(true)}
            disabled={!active}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition disabled:opacity-40"
            title="Aperçu en plein écran"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={publish}
            disabled={isGenerating || !active}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white transition shadow-sm"
          >
            <Globe className="h-3.5 w-3.5" /> Publier ma boutique
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Chat latéral : TOUTES les demandes se font ici */}
        <div className="w-80 border-r border-zinc-800/80 flex flex-col shrink-0 max-sm:hidden bg-[#0C0C0F]">
          {/* Header compact du chat avec boutons d'historique */}
          <div className="px-3.5 py-2.5 border-b border-zinc-800/80 bg-[#0B0B0E] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {active?.meta.storeName || "Discussion & Édition"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Historique des conversations"
              >
                <History className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleStartNewConversation}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Nouvelle conversation / boutique"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-xs leading-relaxed rounded-xl px-3.5 py-2.5 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60"
                    : "bg-zinc-900/80 text-zinc-300 border border-zinc-800"
                }`}
              >
                {m.text}
              </div>
            ))}
            {isGenerating && (
              <div className="my-2">
                <SwarmAgentTeam
                  compact
                  isModifying={true}
                  instruction={messages[messages.length - 1]?.text}
                  targetSection={selectedSection?.name}
                />
              </div>
            )}
          </div>

          <div className="p-3 border-t border-zinc-800/80 bg-[#0E0E12] space-y-2">
            {/* Si une section est ciblée : badge + suggestions de prompts en 1 clic */}
            {selectedSection && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-zinc-850 border border-zinc-750 text-xs text-zinc-200">
                  <span className="inline-flex items-center gap-1.5 truncate font-medium">
                    <Target className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Cible : <strong className="text-white">{selectedSection.name}</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSection(null)}
                    className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                    title="Désélectionner"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {selectedSection.quickPrompts?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedSection.quickPrompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setChatInput(p);
                          chatInputRef.current?.focus();
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer text-left"
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                ref={chatInputRef}
                rows={2}
                placeholder={selectedSection ? `Instruction pour "${selectedSection.shortLabel}"…` : "Demandez une modification… (ex : fond sombre, bouton vert)"}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendEdit();
                  }
                }}
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none transition"
              />
              <button
                onClick={() => sendEdit()}
                disabled={isGenerating || !chatInput.trim()}
                className="h-8 w-8 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 flex items-center justify-center shrink-0 transition cursor-pointer shadow-sm"
                title="Envoyer la demande"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Arborescence fichiers (Mode développeur uniquement) */}
        {isDev && active && showFiles && (
          <div className="w-60 border-r border-white/10 flex flex-col shrink-0 bg-[#0C0C10] max-lg:hidden">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 px-3 py-2.5 border-b border-white/10">
              Projet React — {active.files.length} fichiers
            </p>
            <div className="flex-1 overflow-y-auto py-1">
              {active.files.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setViewedFile(f)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-mono truncate hover:bg-white/5 transition inline-flex items-center gap-1.5 ${
                    viewedFile?.path === f.path ? "text-zinc-100 bg-zinc-800/80 font-medium" : "text-zinc-400"
                  }`}
                >
                  <FileCode2 className="h-3 w-3 shrink-0" />
                  {f.path.replace("src/", "")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Côté droit : Affichage du site & sélection d'éléments uniquement */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto bg-[#0B0B0E] p-3 sm:p-5 min-w-0">
          {/* Barre de sélection d'éléments ultra-épurée */}
          {active && !isGenerating && (
            <SectionSelectorToolbar
              selectedSection={selectedSection}
              onSelectSection={(sec) => {
                setSelectedSection(sec);
                if (sec) setTimeout(() => chatInputRef.current?.focus(), 80);
              }}
              isInspectorMode={isInspectorMode}
              onToggleInspectorMode={() => setIsInspectorMode((prev) => !prev)}
            />
          )}

          {publishedSlug && active?.meta.slug === publishedSlug && (
            <div className="w-full max-w-5xl mb-2 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-[11px] text-emerald-300 inline-flex items-center gap-1.5 font-medium">
                <Check className="h-3.5 w-3.5" /> Boutique publiée sur /store/{publishedSlug}
              </span>
              <Link
                href={`/store/${publishedSlug}`}
                target="_blank"
                className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
              >
                Ouvrir <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {isGenerating && (
            <div className="w-full max-w-2xl my-8">
              <SwarmAgentTeam
                storeName={answers["name"] || active?.meta.storeName}
                style={answers["style"]}
                city={answers["city"] || active?.meta.city}
              />
            </div>
          )}

          {!isGenerating && isSwitchingVariant && (
            <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-8 my-8 text-center space-y-3">
              <Loader2 className="h-6 w-6 text-zinc-300 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-100">Chargement de la {active?.label || "boutique"}…</p>
              <p className="text-xs text-zinc-400">Compilation et synchronisation de l&apos;arborescence</p>
            </div>
          )}

          {!isGenerating && !isSwitchingVariant && !isPreviewReady && active ? (
            <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-8 my-8 text-center space-y-3">
              <Loader2 className="h-6 w-6 text-zinc-300 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-zinc-100">Finalisation de l&apos;aperçu…</p>
              <p className="text-xs text-zinc-400">Compilation du projet React dans WebContainer</p>
            </div>
          ) : null}

          {!isGenerating && !isSwitchingVariant && isPreviewReady && active ? (
            <>
              {/* Bandeau d'état sobre */}
              <div className="w-full max-w-5xl mb-2 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-300 font-medium truncate text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="truncate">{active.meta.storeName} ({answers["style"] || "Sur-mesure"})</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 shrink-0">
                  <span>WhatsApp direct</span>
                  <span>•</span>
                  <span>Wave / OM</span>
                </div>
              </div>

              {/* Aperçu du site en grand format */}
              <div
                className={
                  previewFull
                    ? "fixed inset-0 z-[60] bg-[#09090b] flex flex-col"
                    : "rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80 bg-white transition-all relative w-full max-w-5xl grow flex flex-col min-h-[560px]"
                }
                style={
                  previewFull
                    ? undefined
                    : deviceMode === "mobile"
                      ? { width: 390, height: 720 }
                      : { width: "100%", maxWidth: 1100, height: "80vh" }
                }
              >
                {/* Visual Canvas Overlay en mode inspecteur direct */}
                <VisualCanvasOverlay
                  isInspectorMode={isInspectorMode}
                  selectedSection={selectedSection}
                  onSelectSection={(sec) => {
                    setSelectedSection(sec);
                    setTimeout(() => chatInputRef.current?.focus(), 80);
                  }}
                  onClose={() => setIsInspectorMode(false)}
                />

                {wcState.phase === "ready" && wcState.previewUrl ? (
                  <iframe
                    title={`Aperçu WebContainer ${active.label}`}
                    src={wcState.previewUrl}
                    allow="cross-origin-isolated; fullscreen"
                    allowFullScreen
                    className="w-full h-full grow border-0 bg-white"
                  />
                ) : (
                  <iframe
                    key={`${activeIdx}-${active.files.reduce((n, f) => n + f.content.length, 0)}`}
                    title={`Aperçu ${active.label}`}
                    srcDoc={buildReactShell(active.files)}
                    sandbox="allow-scripts allow-popups allow-forms allow-modals"
                    allowFullScreen
                    className="w-full h-full grow bg-white"
                  />
                )}
              </div>

              {previewFull && (
                <>
                  <div className="fixed top-4 left-4 z-[70] inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-white border border-white/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Variante {active.id} — {active.label}
                  </div>
                  <button
                    onClick={() => setPreviewFull(false)}
                    className="fixed top-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-xs font-bold shadow-xl hover:bg-slate-200 transition"
                  >
                    <Minimize2 className="h-4 w-4" /> Quitter
                  </button>
                </>
              )}

              <p className={previewFull ? "hidden" : "mt-3 text-[11px] text-slate-400 text-center font-medium"}>
                Boutique interactive en direct — Variante {active.id} : {active.label}
              </p>
              {!previewFull && wcState.lastPreviewError && (
                <p className="mt-2 max-w-xl text-[10px] text-amber-400/90 text-center font-mono line-clamp-2">
                  Vite : {wcState.lastPreviewError}
                </p>
              )}
              <div ref={previewEndRef} />
            </>
          ) : !isGenerating && !isSwitchingVariant && !active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm text-slate-400">Une erreur est survenue pendant la génération.</p>
              <p className="text-xs text-slate-600">Consultez les messages à gauche puis réessayez.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Drawer code */}
      {viewedFile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewedFile(null)}>
          <div className="bg-[#101014] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-xs font-mono text-zinc-200">{viewedFile.path}</p>
              <button onClick={() => setViewedFile(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
              {viewedFile.content}
            </pre>
          </div>
        </div>
      )}
      {/* Historique des conversations et boutiques */}
      <ConversationHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={loadConversationState}
        onNewConversation={handleStartNewConversation}
        onRefreshList={() => setConversations(listConversations())}
      />

      {/* Modal Équipe Multi-Agents Swarm */}
      <SwarmModal
        isOpen={isSwarmModalOpen}
        onClose={() => setIsSwarmModalOpen(false)}
      />
    </div>
  );
}
