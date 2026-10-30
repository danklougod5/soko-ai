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
} from "lucide-react";
import { buildReactShell } from "@/lib/react-shell";
import {
  ensureWebContainerReady,
  mountReactProjectFiles,
  subscribeWebContainer,
  type WebContainerState,
} from "@/lib/webcontainer";

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

interface DiscoveryQuestion {
  id: string;
  question: string;
  why?: string;
  type: "single" | "multi" | "text";
  options: string[];
  placeholder?: string;
  required?: boolean;
}

interface DiscoveryResult {
  understanding: {
    businessType: string;
    sector: string;
    summary: string;
    known: { label: string; value: string }[];
  };
  questions: DiscoveryQuestion[];
}

const TIMELINE_STEPS = [
  "Analyse de votre activité et de vos besoins",
  "Création de 3 identités visuelles uniques",
  "Mise en rayon du catalogue & photos de qualité",
  "Configuration commande WhatsApp & Paiement mobile",
  "Finalisation de votre boutique en ligne",
];

export default function ReactStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080A] text-white flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
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
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [whatsappFallback, setWhatsappFallback] = useState("");

  const [variants, setVariants] = useState<ReactVariant[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [previewFull, setPreviewFull] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timelineStep, setTimelineStep] = useState(-1);

  const [chatInput, setChatInput] = useState("");
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

  const saveStoreReactMutation = useMutation(api.stores.saveStoreReact);

  const active = variants[activeIdx];

  // Démarre le Singleton WebContainer (Vite + React) en tâche de fond dès l'arrivée sur le studio
  useEffect(() => {
    const unsub = subscribeWebContainer((state) => setWcState(state));
    ensureWebContainerReady().catch((err) => {
      console.warn("[WebContainer] Fallback sur shell Babel:", err);
    });
    return unsub;
  }, []);

  // Synchronise les fichiers de la variante active dans le WebContainer (Vite HMR < 50ms)
  useEffect(() => {
    if (!active?.files?.length) return;
    mountReactProjectFiles(active.files).catch((err) => {
      console.warn("[WebContainer] Erreur écriture fichiers:", err);
    });
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

  const effectivePrompt = landingPrompt || landingInput;

  const setAnswer = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const canGenerate = () => {
    const required = (discovery?.questions || []).filter((q) => q.required);
    return required.every((q) => (answers[q.id] || "").trim().length > 0);
  };

  const buildNotes = (): string => {
    const lines: string[] = [];
    for (const q of discovery?.questions || []) {
      const a = answers[q.id];
      if (a && a !== "Non précisé") lines.push(`- ${q.question} → ${a}`);
    }
    if (whatsappFallback) lines.push(`- Numéro WhatsApp du commerçant → ${whatsappFallback}`);
    return lines.join("\n");
  };

  const startGeneration = async () => {
    if (!effectivePrompt.trim() || isGenerating) return;
    setStep("workspace");
    setIsGenerating(true);
    setTimelineStep(0);

    const notes = buildNotes();
    const nameAnswer = answers["name"];
    const waAnswer = [answers["whatsapp"], whatsappFallback].find((v) => v && v.replace(/\D/g, "").length >= 8);
    const cityAnswer = answers["city"];

    const seededMsgs: ChatMessage[] = [{ id: "u0", role: "user", text: effectivePrompt }];
    if (notes) seededMsgs.push({ id: "a-brief", role: "assistant", text: `Merci ! Je conçois 3 identités de boutique uniques à partir de vos réponses :\n${notes}` });
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

      setVariants(withSlugs);
      setActiveIdx(0);
      setMessages((prev) => [
        ...prev,
        {
          id: "a0",
          role: "assistant",
          text: `✨ Vos 3 directions artistiques sont prêtes ! Comparez les styles (A, B ou C) ci-dessus, puis écrivez-moi ici ce que vous souhaitez ajuster : couleurs, textes, bannières, produits, promotions...${data.failed?.length ? `\n\n(${data.failed.length} variante(s) n'ont pas abouti.)` : ""}`,
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

  const sendEdit = async () => {
    const instruction = chatInput.trim();
    if (!instruction || !active || isGenerating) return;
    setChatInput("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: instruction }]);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/edit-react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: active.files, meta: active.meta, instruction }),
      });
      const data = await res.json();
      if (!data.success || !data.files?.length) throw new Error(data.error || "Échec modification");
      const newFiles: ReactFile[] = data.files;
      const newMeta: ReactMeta = data.meta;
      const updatedPaths: string[] = Array.isArray(data.updatedPaths) ? data.updatedPaths : [];
      setVariants((prev) =>
        prev.map((v, i) =>
          i === activeIdx ? { ...v, files: newFiles, meta: { ...v.meta, ...newMeta, slug: v.meta.slug } } : v
        )
      );
      const updatedLabel = updatedPaths.length ? ` (${updatedPaths.join(", ")})` : "";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: `✅ Modification appliquée avec succès ! Votre boutique a été actualisée en direct.`,
        },
      ]);
      setTimeout(() => previewEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
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
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Accueil
            </Link>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" /> Studio de Création — Votre boutique sur-mesure
            </span>
          </div>

          <div className="bg-[#101014] border border-white/10 rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Votre demande</p>
            {!landingPrompt && (
              <textarea
                rows={2}
                placeholder="Décrivez votre boutique ici…"
                value={landingInput}
                onChange={(e) => setLandingInput(e.target.value)}
                className="w-full mb-4 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            )}
            {landingPrompt && <p className="text-sm text-slate-200 leading-relaxed">{landingPrompt}</p>}
          </div>

          {isLoadingDiscovery && (
            <div className="flex items-center gap-3 text-sm text-purple-300 justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              J&apos;analyse votre besoin et je prépare mes questions…
            </div>
          )}

          {discovery && (
            <div className="space-y-5">
              <div className="bg-purple-500/10 border border-purple-500/25 rounded-2xl p-4">
                <p className="text-sm text-purple-100">{discovery.understanding.summary}</p>
              </div>

              {discovery.questions.map((q, idx) => (
                <div key={q.id} className="bg-[#101014] border border-white/10 rounded-2xl p-5 space-y-3">
                  <p className="text-sm font-semibold text-white">
                    <span className="text-slate-500 mr-2">{idx + 1}.</span>
                    {q.question}
                    {q.required && <span className="text-rose-400 ml-1">*</span>}
                  </p>
                  {q.why && <p className="text-xs text-slate-500">💡 {q.why}</p>}

                  {q.type === "text" ? (
                    <input
                      type={q.id === "whatsapp" ? "tel" : "text"}
                      placeholder={q.placeholder || "Votre réponse…"}
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const selected =
                          q.type === "multi"
                            ? (answers[q.id] || "").split(" | ").includes(opt)
                            : answers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (q.type === "multi") {
                                const current = (answers[q.id] || "").split(" | ").filter(Boolean);
                                const next = selected ? current.filter((c) => c !== opt) : [...current, opt];
                                setAnswer(q.id, next.join(" | "));
                              } else {
                                setAnswer(q.id, opt);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition text-left ${
                              selected
                                ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                                : "bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                            }`}
                          >
                            {selected && <Check className="inline h-3 w-3 mr-1 text-purple-400" />}
                            {opt}
                          </button>
                        );
                      })}
                      {!q.required && (
                        <button
                          type="button"
                          onClick={() => setAnswer(q.id, "Non précisé")}
                          className={`px-3.5 py-2 rounded-xl text-xs border transition ${
                            answers[q.id] === "Non précisé"
                              ? "bg-white/10 border-white/25 text-white"
                              : "bg-transparent border-white/10 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Non précisé
                        </button>
                      )}
                    </div>
                  )}

                  {q.id === "whatsapp" && (
                    <input
                      type="tel"
                      placeholder="Ou saisissez votre numéro WhatsApp ici…"
                      value={whatsappFallback}
                      onChange={(e) => setWhatsappFallback(e.target.value)}
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>
              ))}

              <button
                onClick={startGeneration}
                disabled={!canGenerate() || isGenerating}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-sm transition"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Création de vos 3 boutiques sur-mesure…</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Créer mes 3 designs de boutique</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── WORKSPACE ─────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#08080A] text-white flex flex-col overflow-hidden">
      <div className="border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center font-black shrink-0">S</span>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{active?.meta.storeName || "Boutique en création…"}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">{active ? `Aperçu en direct — ${active.label}` : "Design sur-mesure"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Boutique en direct
          </span>
          {isDev && active && (
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
              title={showFiles ? "Masquer le code" : "Afficher le code (Mode Développeur)"}
            >
              <FileCode2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setDeviceMode(deviceMode === "desktop" ? "mobile" : "desktop")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title={deviceMode === "desktop" ? "Vue mobile" : "Vue ordinateur"}
          >
            {deviceMode === "desktop" ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setPreviewFull(true)}
            disabled={!active}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition disabled:opacity-40"
            title="Aperçu en plein écran"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={publish}
            disabled={isGenerating || !active}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            <Globe className="h-3.5 w-3.5" /> Publier ma boutique
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Chat */}
        <div className="w-72 border-r border-white/10 flex flex-col shrink-0 max-sm:hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-xs leading-relaxed rounded-xl px-3 py-2.5 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-purple-600/20 border border-purple-500/30 text-purple-100"
                    : "bg-white/5 border border-white/10 text-slate-200"
                }`}
              >
                {m.text}
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-purple-300 px-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> L&apos;IA travaille…
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                placeholder="Modifie le projet… (ex : hero plus sombre)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendEdit();
                  }
                }}
                className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none max-h-28"
              />
              <button
                onClick={sendEdit}
                disabled={isGenerating || !chatInput.trim()}
                className="h-9 w-9 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 flex items-center justify-center shrink-0"
              >
                <Send className="h-4 w-4" />
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
                    viewedFile?.path === f.path ? "text-purple-300 bg-purple-500/10" : "text-slate-400"
                  }`}
                >
                  <FileCode2 className="h-3 w-3 shrink-0" />
                  {f.path.replace("src/", "")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variantes + timeline + aperçu */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto bg-[#0C0C10] p-4 sm:p-6 min-w-0">
          {variants.length > 1 && (
            <div className="w-full max-w-5xl flex flex-wrap gap-2 justify-center mb-4">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActiveIdx(i)}
                  title={v.description}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition inline-flex items-center gap-2 ${
                    i === activeIdx
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  {v.id} — {v.label}
                </button>
              ))}
            </div>
          )}

          {publishedSlug && active?.meta.slug === publishedSlug && (
            <div className="w-full max-w-5xl mb-3 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-2">
              <span className="text-[11px] text-emerald-300 inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Boutique publiée sur /store/{publishedSlug}
              </span>
              <Link
                href={`/store/${publishedSlug}`}
                target="_blank"
                className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
              >
                Ouvrir <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {isGenerating && (
            <div className="w-full max-w-md bg-[#101014] border border-white/10 rounded-2xl p-5 my-8 space-y-3">
              <p className="text-sm font-bold inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" /> Création de vos projets React…
              </p>
              {TIMELINE_STEPS.map((label, i) => {
                const done = timelineStep > i;
                const current = timelineStep === i;
                return (
                  <div key={label} className="flex items-center gap-3 text-xs">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                        done ? "bg-emerald-500/20 text-emerald-400" : current ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-slate-600"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : current ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
                    </span>
                    <span className={done ? "text-slate-300" : current ? "text-purple-200 font-semibold" : "text-slate-600"}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {!isGenerating && active ? (
            <>
              <div
                className={
                  previewFull
                    ? "fixed inset-0 z-[60] bg-[#08080A] flex flex-col"
                    : "rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-white transition-all"
                }
                style={
                  previewFull
                    ? undefined
                    : deviceMode === "mobile"
                      ? { width: 390, height: 720 }
                      : { width: "100%", maxWidth: 1100, height: "78vh" }
                }
              >
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
          ) : !isGenerating ? (
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
              <p className="text-xs font-mono text-purple-300">{viewedFile.path}</p>
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
    </div>
  );
}
