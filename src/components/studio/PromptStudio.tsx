"use client";

import React, { useState } from "react";
import { StoreThemeConfig, PlacedOrder } from "@/types/store";
import { SAMPLE_PRESETS } from "@/lib/presets";
import {
  Sparkles,
  Send,
  Wand2,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Package,
  Mic,
  Zap,
  Check,
  ChevronRight
} from "lucide-react";

interface PromptStudioProps {
  store: StoreThemeConfig;
  setStore: React.Dispatch<React.SetStateAction<StoreThemeConfig>>;
  orders: PlacedOrder[];
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

const GENERATION_STEPS = [
  "🔍 Analyse du secteur et des personas africains...",
  "🎨 Harmonisation de la palette et typographie...",
  "📦 Génération des articles & prix adaptés en FCFA...",
  "🛵 Configuration des zones de livraison et repères...",
  "💳 Intégration Wave, Orange Money et WhatsApp 1-Clic...",
];

export function PromptStudio({
  store,
  setStore,
  orders,
  isGenerating,
  setIsGenerating,
}: PromptStudioProps) {
  const [activeTab, setActiveTab] = useState<"generator" | "chat" | "analytics">("generator");
  const [promptText, setPromptText] = useState(
    SAMPLE_PRESETS[0].prompt
  );
  const [chatInput, setChatInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Bonjour ! Je suis votre co-fondateur AI. Tapez ce que vous souhaitez vendre, ou demandez-moi de modifier votre boutique actuelle en temps réel.",
    },
  ]);

  // Handle generation via DeepSeek API
  const handleGenerate = async (textToUse?: string) => {
    const text = textToUse || promptText;
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setCurrentStepIdx(0);

    // Step animation interval
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);

    try {
      const res = await fetch("/api/generate-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      if (data.success && data.store) {
        setStore(data.store);
        setChatMessages((prev) => [
          ...prev,
          { role: "user", text },
          {
            role: "ai",
            text: `Votre boutique "${data.store.storeName}" a été générée avec succès ! Vous pouvez maintenant la tester à droite ou me demander des ajustements.`,
          },
        ]);
      }
    } catch (err) {
      console.error("Erreur génération:", err);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  // Handle chat edits via DeepSeek API
  const handleChatEdit = async (instruction?: string) => {
    const text = instruction || chatInput;
    if (!text.trim() || isEditing) return;

    setIsEditing(true);
    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");

    try {
      const res = await fetch("/api/edit-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStore: store,
          instruction: text,
        }),
      });

      const data = await res.json();
      if (data.success && data.store) {
        setStore(data.store);
        setChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `Modifications appliquées ! La boutique a été mise à jour avec vos nouvelles préférences.`,
          },
        ]);
      }
    } catch (err) {
      console.error("Erreur modif chat:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Désolé, une petite erreur est survenue lors de l'application de votre demande.`,
        },
      ]);
    } finally {
      setIsEditing(false);
    }
  };

  // Quick edit suggestions
  const QUICK_EDITS = [
    "Passe en thème sombre et or",
    "Ajoute un sac à dos en cuir à 32 000 FCFA",
    "Ajoute la commune Bassam à 3 500 FCFA",
    "Mets une promo de -20% sur le cabas",
    "Change la couleur principale en vert forêt",
  ];

  // Total sales calculation
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/80 text-slate-100 select-none">
      {/* 1. Header du Studio */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 text-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">SokoAI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                PROMPT-TO-STORE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Le Lovable du e-commerce africain</p>
          </div>
        </div>

        {/* AI status badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">DeepSeek V3 Actif</span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center border-b border-slate-800/80 px-4 gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "generator"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Wand2 className="h-3.5 w-3.5" />
          <span>Générateur</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "chat"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Édition Live</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "analytics"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Commandes ({orders.length})</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === "generator" && (
          <div className="space-y-4">
            {/* Presets rapides */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Presets africains prêts à tester :
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setPromptText(preset.prompt);
                      handleGenerate(preset.prompt);
                    }}
                    disabled={isGenerating}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left hover:border-amber-500/50 hover:bg-slate-900 transition flex flex-col justify-between group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: preset.previewColor }}
                      />
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate">
                        {preset.label.split("—")[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 truncate">
                      {preset.city}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Décrivez votre commerce :</span>
                <span>{promptText.length} caractères</span>
              </div>
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-amber-500/80 transition shadow-inner">
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex : Je m'appelle Fatou, je vends des tissus wax à Dakar. Couleurs vives, Wave et Orange Money, livraison Almadies..."
                  className="w-full bg-transparent p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between p-2 pt-0 border-t border-slate-800/40">
                  <button
                    type="button"
                    title="Entrée vocale (Simulation)"
                    onClick={() => {
                      setPromptText("Boutique de cosmétiques naturels et beurre de karité bio à Cotonou et Lomé, livraison rapide et paiement Wave.");
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition text-[11px] flex items-center gap-1"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Vocal</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !promptText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Générer en 1 clic</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Progress Tracker during Generation */}
            {isGenerating && (
              <div className="rounded-2xl bg-slate-900/90 border border-amber-500/40 p-3.5 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" /> DeepSeek V3 génère votre boutique
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Étape {currentStepIdx + 1}/{GENERATION_STEPS.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {GENERATION_STEPS.map((step, idx) => {
                    const isDone = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-[11px] transition duration-200 ${
                          isDone
                            ? "text-emerald-400"
                            : isCurrent
                            ? "text-white font-semibold"
                            : "text-slate-600"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                        ) : isCurrent ? (
                          <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-slate-700 shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Summary of Active Store */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Boutique actuellement chargée
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{store.storeName}</h4>
                  <p className="text-[11px] text-slate-400">{store.city}, {store.country}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {store.products.length} articles
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {store.deliveryZones.length} zones configurées
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Couleurs :</span>
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: store.primaryColor }}
                />
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: store.secondaryColor }}
                />
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: store.accentColor }}
                />
                <span className="text-[10px] text-slate-400 ml-auto font-mono">
                  {store.currencySymbol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Chat & Édition continue */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full space-y-3">
            {/* Quick chips */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Suggestions rapides :
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_EDITS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleChatEdit(item)}
                    disabled={isEditing}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/60 hover:text-white transition disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] p-2 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-amber-500 text-slate-950 font-medium rounded-br-none"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isEditing && (
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium p-2">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>DeepSeek applique vos modifications...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatEdit()}
                placeholder="Ex: Change le prix du sac à 29 000 FCFA..."
                disabled={isEditing}
                className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleChatEdit()}
                disabled={isEditing || !chatInput.trim()}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Commandes & Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Chiffre d'Affaires
                </span>
                <div className="text-lg font-bold text-amber-400">
                  {totalRevenue.toLocaleString("fr-FR")} {store.currencySymbol}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Commandes Reçues
                </span>
                <div className="text-lg font-bold text-white">{orders.length}</div>
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Commandes passées en direct
              </span>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs rounded-2xl bg-slate-900/50 border border-slate-800/80 p-4">
                  Aucune commande pour le moment. Testez le checkout dans la prévisualisation à droite !
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{ord.customer.customerName}</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          {ord.total.toLocaleString("fr-FR")} {store.currencySymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Zone: {ord.customer.deliveryZoneId}</span>
                        <span className="capitalize px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {ord.customer.paymentMethod === "wave" ? "🌊 Wave" :
                           ord.customer.paymentMethod === "orange_money" ? "🍊 Orange" : "🛵 Livreur"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Repère : {ord.customer.deliveryLandmark}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer info */}
      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between bg-slate-950">
        <span>Prêt pour le déploiement sur Vercel</span>
        <span className="font-mono text-amber-400">DeepSeek API OK</span>
      </div>
    </div>
  );
}
