"use client";

import React, { useState } from "react";
import {
  History,
  X,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  StudioConversation,
  formatRelativeTime,
  deleteConversation,
} from "@/lib/studio-storage";

interface ConversationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: StudioConversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: StudioConversation) => void;
  onNewConversation: () => void;
  onRefreshList: () => void;
}

export function ConversationHistoryModal({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRefreshList,
}: ConversationHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.title?.toLowerCase().includes(q) ||
      c.initialPrompt?.toLowerCase().includes(q) ||
      c.answers?.name?.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    setConfirmDeleteId(null);
    onRefreshList();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0F0F13] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between gap-3 bg-[#0B0B0E]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Historique des conversations & boutiques
              </h3>
              <p className="text-xs text-zinc-400">
                {conversations.length} boutique{conversations.length > 1 ? "s" : ""} et conversation{conversations.length > 1 ? "s" : ""} sauvegardée{conversations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNewConversation();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nouveau projet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {conversations.length > 2 && (
          <div className="px-5 py-2.5 border-b border-zinc-800/80 bg-[#0E0E12]">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher une boutique ou un sujet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-200">
                Aucune conversation enregistrée
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Vos boutiques générées et vos échanges avec l&apos;IA seront automatiquement conservés ici pour vous permettre d&apos;y revenir à tout moment.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewConversation();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-semibold text-xs shadow-sm hover:bg-zinc-200 transition cursor-pointer mt-2"
              >
                <Plus className="h-4 w-4" />
                <span>Créer une première boutique</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-400">
              Aucun projet ne correspond à &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const hasFiles = Boolean(conv.variants?.[0]?.files?.length);
              const messageCount = conv.messages?.length || 0;
              const storeName = conv.title || conv.answers?.name || "Boutique en cours";

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer relative group flex items-start justify-between gap-3 ${
                    isActive
                      ? "bg-zinc-850/90 border-zinc-700 shadow-sm"
                      : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800/80 hover:border-zinc-750"
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100 truncate">
                        {storeName}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-medium shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                      {conv.publishedSlug && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-mono shrink-0">
                          Publié
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {conv.initialPrompt || conv.discovery?.understanding?.summary || "Projet e-commerce personnalisé"}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {messageCount} message{messageCount > 1 ? "s" : ""}
                      </span>
                      {hasFiles && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400">Site React prêt</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {confirmDeleteId === conv.id ? (
                      <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-lg border border-red-500/30">
                        <span className="text-[10px] text-red-400">Supprimer ?</span>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                        >
                          Oui
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 text-[10px]"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                        title="Supprimer cette conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <div className="p-1 rounded-lg text-zinc-500 group-hover:text-zinc-200 transition">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

