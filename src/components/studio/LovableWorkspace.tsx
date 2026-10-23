"use client";

import React, { useState } from "react";
import { StoreThemeConfig, PlacedOrder, DesignDirection, ClarificationQuestion, OrderLineItem } from "@/types/store";
import { StorefrontView } from "@/components/storefront/StorefrontView";
import { LiveOrdersDashboard } from "./LiveOrdersDashboard";
import { ThinkingOrbIndicator } from "./ThinkingOrbIndicator";
import { WaitingForAnswersCard } from "./WaitingForAnswersCard";
import { DesignDirectionsSelector } from "./DesignDirectionsSelector";
import { InteractiveQuestionFlow } from "./InteractiveQuestionFlow";
import { StudioLiveBuildingCanvas } from "./StudioLiveBuildingCanvas";
import { 
  generateDirectionsForStore, 
  generateQuestionsForStore, 
  createStoreFromPromptAndAnswers,
} from "@/lib/design-directions";
import {
  StoreBrief,
  DiscoveryQuestion,
  briefToSummaryQuestions,
  briefToLegacyAnswers,
  updateBriefAnswer,
  slugify,
} from "@/lib/store-brief";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  Menu, 
  ChevronDown, 
  History, 
  Columns, 
  RotateCw, 
  ExternalLink, 
  UserPlus, 
  Zap, 
  ArrowUp, 
  Plus, 
  Mic, 
  Sparkles, 
  Check, 
  Smartphone, 
  Monitor, 
  ChevronUp, 
  ShoppingBag,
  MoreVertical,
  Heart,
  Copy,
  CheckCircle2,
  Share2,
  Loader2,
  X,
  Store,
  RefreshCw
} from "lucide-react";
import confetti from "canvas-confetti";

interface LovableWorkspaceProps {
  store: StoreThemeConfig;
  setStore: React.Dispatch<React.SetStateAction<StoreThemeConfig>>;
  orders: PlacedOrder[];
  isGenerating: boolean;
  onBackToHome: () => void;
  initialPrompt?: string;
  initialDirections?: DesignDirection[];
  initialQuestions?: ClarificationQuestion[];
  onNewOrder: (order: {
    customerName: string;
    customerPhone: string;
    zone: { id: string; name: string; fee: number };
    landmark: string;
    paymentMethod: string;
    total: number;
    items: OrderLineItem[];
  }) => void;
}

export function LovableWorkspace({
  store,
  setStore,
  orders,
  isGenerating,
  onBackToHome,
  initialPrompt = "",
  initialDirections,
  initialQuestions,
  onNewOrder,
}: LovableWorkspaceProps) {
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "orders">("preview");
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [convexStoreId, setConvexStoreId] = useState<Id<"stores"> | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Studio Flow Stages: "questions" -> "generating" -> "ready"
  // On commence TOUJOURS par les questions de découverte : l'IA comprend le besoin avant de créer.
  const [flowStage, setFlowStage] = useState<"questions" | "generating" | "ready">("questions");
  const [brief, setBrief] = useState<StoreBrief | null>(null);
  const [discoveryQuestions, setDiscoveryQuestions] = useState<DiscoveryQuestion[]>([]);

  // 3 Templates / Design Directions
  const [directions, setDirections] = useState<DesignDirection[]>(() => {
    return initialDirections && initialDirections.length > 0
      ? initialDirections
      : generateDirectionsForStore(store, initialPrompt);
  });
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>("dir-1");

  // Interactive Clarification Questions
  const [questions, setQuestions] = useState<ClarificationQuestion[]>(() => {
    return initialQuestions && initialQuestions.length > 0
      ? initialQuestions
      : generateQuestionsForStore(store, initialPrompt);
  });

  // Convex mutations
  const saveStoreMutation = useMutation(api.stores.saveStore);
  const syncStoreProductsMutation = useMutation(api.products.syncStoreProducts);
  const createOrderMutation = useMutation(api.orders.createOrder);

  // Chat message history
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; text: string }[]
  >(() =>
    initialPrompt
      ? [{ id: "init-prompt", role: "user" as const, text: initialPrompt }]
      : []
  );

  /** Appelle le générateur avec le cahier des charges et applique le résultat. */
  const generateFromBrief = async (nextBrief: StoreBrief, dq: DiscoveryQuestion[]) => {
    setIsThinking(true);
    try {
      const res = await fetch("/api/generate-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nextBrief.prompt, brief: nextBrief }),
      });

      const data = await res.json();
      if (!data.success || !data.store || !data.directions?.length) {
        throw new Error(data.error || "Génération incomplète");
      }
      setStore(data.store);
      setDirections(data.directions);
      setSelectedDirectionId(data.directions[0].id);
      setQuestions(briefToSummaryQuestions(nextBrief, dq));
      return data.store as StoreThemeConfig;
    } catch (err) {
      console.error("Erreur génération:", err);
      const { store: newStore, directions: newDirs } = createStoreFromPromptAndAnswers(
        nextBrief.prompt,
        briefToLegacyAnswers(nextBrief)
      );
      setStore(newStore);
      setDirections(newDirs);
      setSelectedDirectionId(newDirs[0].id);
      setQuestions(briefToSummaryQuestions(nextBrief, dq));
      return newStore;
    } finally {
      setIsThinking(false);
    }
  };

  // Quand le commerçant a validé son cahier des charges
  const handleQuestionsCompleted = async (nextBrief: StoreBrief, dq: DiscoveryQuestion[]) => {
    setBrief(nextBrief);
    setDiscoveryQuestions(dq);
    setFlowStage("generating");

    const generated = await generateFromBrief(nextBrief, dq);
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-ready-${Date.now()}`,
        role: "assistant",
        text: `✨ Merci ! À partir de vos réponses, j'ai conçu 3 propositions sur-mesure pour "${generated.storeName}" (${generated.products?.length || 0} produits). Choisissez celle qui vous plaît, puis demandez-moi n'importe quelle modification.`,
      },
    ]);
    setFlowStage("ready");
  };

  // When user clicks one of the 3 templates
  const handleSelectDirection = (direction: DesignDirection) => {
    setSelectedDirectionId(direction.id);

    setStore((prev) => ({
      ...prev,
      primaryColor: direction.primaryColor,
      secondaryColor: direction.secondaryColor,
      accentColor: direction.accentColor,
      backgroundColor: direction.backgroundColor,
      textColor: direction.textColor,
      fontHeading: direction.fontHeading,
      fontBody: direction.fontBody,
      style: direction.style,
      hero: {
        ...prev.hero,
        headline: direction.heroHeadline,
        subheadline: direction.heroSubheadline,
        badgeText: direction.badgeText,
        ctaText: direction.ctaText,
        backgroundImage: direction.previewImage,
      },
      products: direction.products && direction.products.length > 0 ? direction.products : prev.products,
      storytelling: direction.storytelling || prev.storytelling,
      testimonials: direction.testimonials || prev.testimonials,
      deliveryZones: direction.deliveryZones || prev.deliveryZones,
      layoutStructure: direction.layoutStructure || prev.layoutStructure,
      sections: direction.sections || prev.sections,
    }));
  };

  // Modify answers from summary card
  const handleSummaryAnswerChange = (questionId: string, newAnswer: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, currentAnswer: newAnswer } : q))
    );

    if (!brief) {
      if (questionId === "q-name" || questionId === "name") {
        setStore((prev) => ({ ...prev, storeName: newAnswer, slug: slugify(newAnswer) }));
      }
      return;
    }

    const nextBrief = updateBriefAnswer(brief, questionId, newAnswer);
    setBrief(nextBrief);

    if (questionId === "name") {
      // Changement de nom : pas besoin de tout régénérer
      setStore((prev) => ({ ...prev, storeName: newAnswer, slug: slugify(newAnswer) }));
      return;
    }

    // Toute autre réponse modifiée → régénération fidèle au nouveau cahier des charges
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-regen-${Date.now()}`,
        role: "assistant",
        text: `Je réadapte la boutique à votre nouvelle réponse : "${newAnswer}"…`,
      },
    ]);
    generateFromBrief(nextBrief, discoveryQuestions);
  };

  // Bottom chat instruction
  const handleSendInstruction = async () => {
    if (!chatInput.trim() || isThinking || flowStage !== "ready") return;

    const instruction = chatInput.trim();
    setChatInput("");
    setIsThinking(true);

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: instruction },
    ]);

    try {
      const res = await fetch("/api/edit-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStore: store,
          instruction,
        }),
      });

      const data = await res.json();
      if (data.success && data.store) {
        setStore(data.store);
        setDirections((prevDirs) =>
          prevDirs.map((d) =>
            d.id === selectedDirectionId
              ? {
                  ...d,
                  primaryColor: data.store.primaryColor || d.primaryColor,
                  heroHeadline: data.store.hero?.headline || d.heroHeadline,
                  heroSubheadline: data.store.hero?.subheadline || d.heroSubheadline,
                  products: data.store.products && data.store.products.length > 0 ? data.store.products : d.products,
                }
              : d
          )
        );
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            text: `Modifications appliquées à "${data.store.storeName}". L'aperçu à droite a été mis à jour.`,
          },
        ]);
      }
    } catch (err) {
      console.error("Erreur modification:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await saveStoreMutation({
        slug: store.slug || "ma-boutique",
        name: store.storeName,
        tagline: store.tagline,
        description: store.description,
        sector: store.sector,
        country: store.country,
        city: store.city,
        currency: store.currency,
        currencySymbol: store.currencySymbol,
        whatsappNumber: store.merchantWhatsapp,
        phone: store.merchantPhone,
        isPublished: true,
        themeConfig: {
          primaryColor: store.primaryColor,
          secondaryColor: store.secondaryColor,
          accentColor: store.accentColor,
          backgroundColor: store.backgroundColor,
          textColor: store.textColor,
          fontHeading: store.fontHeading,
          fontBody: store.fontBody,
          style: store.style,
        },
        hero: store.hero,
        deliveryZones: store.deliveryZones,
        paymentMethods: store.paymentMethods,
        categories: store.categories,
        trustBadges: store.trustBadges,
        rawConfig: JSON.stringify(store),
      });

      if (res.storeId) {
        setConvexStoreId(res.storeId);
        if (store.products && store.products.length > 0) {
          await syncStoreProductsMutation({
            storeId: res.storeId,
            products: store.products.map((p) => ({
              name: p.name,
              description: p.description,
              price: p.price,
              originalPrice: p.originalPrice,
              category: p.category,
              image: p.image,
              inStock: p.inStock,
              badge: p.badge,
              variants: p.variants,
            })),
          });
        }
      }

      setIsPublished(true);
      setShowPublishModal(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.25 },
      });
    } catch (err) {
      console.error("Erreur publication Convex:", err);
      setIsPublished(true);
      setShowPublishModal(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleInterceptNewOrder = async (orderData: Parameters<typeof onNewOrder>[0]) => {
    onNewOrder(orderData);

    if (convexStoreId) {
      try {
        await createOrderMutation({
          storeId: convexStoreId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          deliveryCommune: orderData.zone.name,
          deliveryLandmark: orderData.landmark,
          paymentMethod: orderData.paymentMethod,
          items: orderData.items.length > 0
            ? orderData.items
            : store.products.slice(0, 1).map((p) => ({
                productId: p.id,
                productName: p.name,
                quantity: 1,
                unitPrice: p.price,
              })),
        });
      } catch (err) {
        console.error("Erreur enregistrement commande Convex:", err);
      }
    }
  };

  const liveStoreUrl = typeof window !== "undefined"
    ? `${window.location.origin}/store/${store.slug || "demo"}`
    : `/store/${store.slug || "demo"}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(liveStoreUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0D] text-slate-100 font-sans select-none">
      {/* 1. TOP NAVBAR */}
      <header className="h-13 border-b border-white/8 bg-[#0D0E12] px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Menu & Store Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHome}
            title="Retour à l'accueil"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/25">
              <Store className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              {store.storeName || "Ma Boutique"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono">
              {store.city || "Abidjan"}
            </span>
          </div>
        </div>

        {/* Right Tools & Tabs */}
        <div className="flex items-center gap-2.5 text-slate-400">
          {/* Active Tabs: Aperçu vs Commandes Live */}
          <div className="flex items-center bg-[#181920] border border-white/10 rounded-lg p-0.5 text-xs">
            <button 
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === "preview" 
                  ? "bg-[#2563EB] text-white shadow-xs" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span>Aperçu</span>
            </button>

            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                activeTab === "orders" 
                  ? "bg-purple-600 text-white shadow-xs" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Commandes</span>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          {/* Device Toggle (Desktop / Mobile) */}
          {activeTab === "preview" && (
            <div className="flex items-center gap-0.5 bg-[#181920] border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setDeviceMode("desktop")}
                title="Vue Bureau"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  deviceMode === "desktop" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                title="Vue Mobile"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  deviceMode === "mobile" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Reload Preview */}
          <button 
            onClick={() => setStore({ ...store })}
            className="p-2 rounded-lg hover:text-white hover:bg-white/5 transition cursor-pointer" 
            title="Recharger l'aperçu"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* External link to public store */}
          <a
            href={`/store/${store.slug || "demo"}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="Ouvrir la boutique publique en direct"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* AI Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>DeepSeek + Convex Sync</span>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition active:scale-95 ml-1 disabled:opacity-50 cursor-pointer"
          >
            {isPublishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" />
            )}
            <span>{isPublishing ? "Publication..." : isPublished ? "Publié !" : "Publier"}</span>
          </button>
        </div>
      </header>

      {/* 2. DUAL-PANE BODY */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* ── LEFT PANE: PROGRESSIVE ONBOARDING & CHAT ── */}
        <section className="w-full lg:w-1/2 flex flex-col rounded-2xl bg-[#0F1015] border border-white/8 overflow-hidden shadow-xl">
          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Conversation Messages */}
            {messages.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-[#1E202A] border border-white/10 px-4 py-2.5 text-xs text-white leading-relaxed shadow-sm">
                      {m.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 text-xs font-bold">
                    S
                  </div>
                  <div className="flex-1 rounded-2xl bg-[#14151C] border border-white/8 px-4 py-2.5 text-xs text-slate-200 leading-relaxed">
                    {m.text}
                  </div>
                </div>
              );
            })}

            {/* STAGE 1: STEP-BY-STEP INTERACTIVE QUESTION FLOW */}
            {flowStage === "questions" && (
              <InteractiveQuestionFlow
                prompt={initialPrompt}
                onComplete={handleQuestionsCompleted}
              />
            )}

            {/* STAGE 2: GENERATING 3 SITES (THINKING ORB) */}
            {flowStage === "generating" && (
              <div className="rounded-2xl border border-purple-500/25 bg-[#141520] overflow-hidden shadow-xl">
                <ThinkingOrbIndicator prompt={initialPrompt} size={64} />
              </div>
            )}

            {/* STAGE 3: READY -> DISPLAY 3 TEMPLATES & SUMMARY */}
            {flowStage === "ready" && (
              <>
                {/* 🎨 3 DESIGN DIRECTIONS SELECTOR (SELECTABLE & INTERACTIVE) */}
                <DesignDirectionsSelector
                  directions={directions}
                  selectedDirectionId={selectedDirectionId}
                  onSelectDirection={handleSelectDirection}
                />

                {/* 📝 ANSWERS SUMMARY CARD (COLLAPSIBLE / EDITABLE) */}
                <WaitingForAnswersCard
                  questions={questions}
                  onAnswerChange={handleSummaryAnswerChange}
                />
              </>
            )}

            {/* Chat thinking indicator */}
            {isThinking && flowStage === "ready" && (
              <div className="rounded-2xl border border-purple-500/25 bg-[#141520] p-4 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                <span className="text-xs text-purple-300 font-medium">
                  Modification de la boutique en cours...
                </span>
              </div>
            )}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 border-t border-white/8 bg-[#0D0E13]">
            <div className="rounded-2xl bg-[#161720] border border-white/10 p-2.5 space-y-2 focus-within:border-purple-500/50 transition">
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendInstruction();
                  }
                }}
                placeholder="Dites à Lovable quoi modifier (ex: 'Passe en livraison 24h et ajoute du Bissap')..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  className="h-7 w-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                  title="Joindre des photos de produits"
                >
                  <Plus className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/8">
                    <span>Modifier</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>

                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
                    <Mic className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleSendInstruction}
                    disabled={isThinking || !chatInput.trim()}
                    className="h-7 w-7 rounded-full bg-white hover:bg-slate-200 text-slate-950 flex items-center justify-center transition disabled:opacity-30 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANE: LIVE PREVIEW (100% IDENTICAL TO SELECTED TEMPLATE) ── */}
        <section className="hidden lg:flex flex-1 flex-col rounded-2xl bg-[#0F1015] border border-white/8 overflow-hidden shadow-xl relative">
          {activeTab === "orders" ? (
            <LiveOrdersDashboard
              storeId={convexStoreId}
              localOrders={orders}
              currencySymbol={store.currencySymbol}
            />
          ) : flowStage !== "ready" ? (
            <StudioLiveBuildingCanvas
              prompt={brief?.prompt || initialPrompt}
              stage={flowStage}
            />
          ) : (
            <div className="flex-1 overflow-auto flex items-center justify-center p-3 bg-[#0A0A0E]">
              {deviceMode === "mobile" ? (
                /* Mobile Frame (iPhone 375px) */
                <div className="relative w-[365px] h-[720px] max-h-[88vh] bg-black rounded-[42px] p-2.5 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 flex flex-col shrink-0 animate-in zoom-in-95 duration-200">
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-end px-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <div className="w-full h-full rounded-[32px] overflow-hidden shadow-inner flex flex-col relative">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                      <StorefrontView store={store} onOrderCompleted={handleInterceptNewOrder} />
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full" />
                </div>
              ) : (
                /* Desktop Full-width Frame */
                <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <StorefrontView store={store} onOrderCompleted={handleInterceptNewOrder} />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* 🚀 PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12131A] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Votre boutique est en ligne !</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Boutique synchronisée sur le Cloud Convex avec les paiements Wave & Orange Money et le suivi des livraisons.
              </p>
            </div>

            {/* URL Box */}
            <div className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-purple-300 truncate">
                {liveStoreUrl}
              </span>
              <button
                onClick={copyToClipboard}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition cursor-pointer"
              >
                {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Copié !" : "Copier"}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={liveStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Ouvrir en direct</span>
              </a>

              <a
                href={`https://wa.me/?text=D%C3%A9couvrez%20notre%20boutique%20en%20ligne%20sur%20${encodeURIComponent(liveStoreUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition"
              >
                <Share2 className="h-4 w-4" />
                <span>Partager WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
