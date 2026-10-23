"use client";

import React, { useState } from "react";
import { DesignDirection } from "@/types/store";
import { ChevronDown, ChevronUp, Check, Sparkles, Layers } from "lucide-react";

interface DesignDirectionsSelectorProps {
  directions: DesignDirection[];
  selectedDirectionId: string;
  onSelectDirection: (direction: DesignDirection) => void;
}

export function DesignDirectionsSelector({
  directions,
  selectedDirectionId,
  onSelectDirection,
}: DesignDirectionsSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>(
    selectedDirectionId || directions[0]?.id || "dir-1"
  );

  const activeDirection = directions.find((d) => d.id === activeTabId) || directions[0];

  if (!directions || directions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#14151C] overflow-hidden shadow-xl animate-in fade-in duration-300">
      {/* HEADER */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between cursor-pointer hover:bg-white/2 transition"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">
            Which design direction should I build?
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-bold">
            3 Templates proposés
          </span>
        </div>
        <button className="text-slate-400 hover:text-white">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* DIRECTION TABS (3 PROPOSITIONS) */}
          <div className="grid grid-cols-3 gap-2">
            {directions.map((dir, index) => {
              const isSelected = dir.id === selectedDirectionId;
              const isViewing = dir.id === activeTabId;

              return (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => {
                    setActiveTabId(dir.id);
                    onSelectDirection(dir);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isViewing
                      ? "border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/10"
                      : "border-white/8 bg-white/3 hover:bg-white/6 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      Option #{index + 1}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {dir.name.replace(/^Direction #\d+ \(/, "").replace(/\)$/, "")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span 
                      className="h-2.5 w-2.5 rounded-full border border-black/20" 
                      style={{ backgroundColor: dir.primaryColor }}
                    />
                    <span 
                      className="h-2.5 w-2.5 rounded-full border border-black/20" 
                      style={{ backgroundColor: dir.accentColor }}
                    />
                    <span 
                      className="h-2.5 w-2.5 rounded-full border border-black/20" 
                      style={{ backgroundColor: dir.backgroundColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DIRECTION MOCKUP CARD PREVIEW */}
          {activeDirection && (() => {
            const isDarkDir = activeDirection.style === "modern" || (activeDirection.backgroundColor && (activeDirection.backgroundColor.startsWith("#0") || activeDirection.backgroundColor.startsWith("#1")));
            return (
              <div 
                style={{
                  backgroundColor: activeDirection.backgroundColor,
                  color: activeDirection.textColor,
                  borderColor: isDarkDir ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                }}
                className="rounded-xl border overflow-hidden shadow-lg animate-in fade-in duration-200"
              >
                {/* Mockup Topbar */}
                <div 
                  className="px-4 py-2 border-b flex items-center justify-between text-[11px] font-bold tracking-wider"
                  style={{
                    backgroundColor: isDarkDir ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    color: activeDirection.textColor,
                    borderColor: isDarkDir ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  }}
                >
                  <span className="font-mono tracking-wider">{activeDirection.name.toUpperCase()}</span>
                  <div className="flex items-center gap-2 text-[10px] opacity-80">
                    <span>MENU</span>
                    <span>LIVRAISON</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-white font-medium text-[9px] shadow-xs"
                      style={{ backgroundColor: activeDirection.primaryColor }}
                    >
                      Commander
                    </span>
                  </div>
                </div>

                {/* Mockup Hero Banner */}
                <div 
                  className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
                  style={{
                    backgroundColor: activeDirection.backgroundColor,
                    color: activeDirection.textColor,
                  }}
                >
                  <div className="space-y-2">
                    <span 
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md inline-block"
                      style={{
                        backgroundColor: `${activeDirection.primaryColor}20`,
                        color: activeDirection.primaryColor,
                      }}
                    >
                      {activeDirection.badge}
                    </span>
                    <h4 
                      className="text-lg font-black tracking-tight leading-tight line-clamp-2"
                      style={{ fontFamily: activeDirection.fontHeading }}
                    >
                      {activeDirection.heroHeadline}
                    </h4>
                    <p className="text-xs opacity-75 line-clamp-2">
                      {activeDirection.heroSubheadline}
                    </p>
                    <div className="pt-1">
                      <span 
                        className="inline-block px-3 py-1.5 rounded-lg text-white text-[11px] font-bold shadow-xs"
                        style={{ backgroundColor: activeDirection.primaryColor }}
                      >
                        {activeDirection.ctaText}
                      </span>
                    </div>
                  </div>

                  {/* Mockup Product Image Preview */}
                  <div className="aspect-4/3 rounded-xl overflow-hidden border border-black/10 relative shadow-sm">
                    {activeDirection.previewImage ? (
                      <img
                        src={activeDirection.previewImage}
                        alt={activeDirection.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-500 text-xs">
                        Photo d'illustration
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono">
                      {activeDirection.style}
                    </div>
                  </div>
                </div>

                {/* Bottom Direction Description */}
                <div 
                  style={{
                    backgroundColor: isDarkDir ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    borderColor: isDarkDir ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  }}
                  className="p-3 border-t text-xs flex items-center justify-between"
                >
                  <span className="italic line-clamp-1 opacity-80">{activeDirection.description}</span>
                  <span 
                    style={{ color: activeDirection.primaryColor }}
                    className="text-[10px] font-bold uppercase shrink-0 ml-2"
                  >
                    {activeDirection.tagline}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* ACTION BUTTON */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">
                {activeDirection?.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelectDirection(activeDirection)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs transition active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              {selectedDirectionId === activeDirection?.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                  <span>Direction sélectionnée</span>
                </>
              ) : (
                <span>Choisir cette direction</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
