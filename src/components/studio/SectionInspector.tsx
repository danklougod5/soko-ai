"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShoppingBag,
  Maximize2,
  BookOpen,
  Star,
  Truck,
  Compass,
  MapPin,
  Palette,
  X,
  Target,
  MousePointer,
  Check,
} from "lucide-react";

export interface StoreSection {
  id: string;
  name: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  targetFile: string;
  quickPrompts: string[];
  approxTopPercent?: number;
  approxHeightPercent?: number;
}

export const STORE_SECTIONS: StoreSection[] = [
  {
    id: "navbar",
    name: "En-tête & Barre de Navigation",
    shortLabel: "En-tête",
    icon: Compass,
    description: "Logo de la boutique, navigation et bouton WhatsApp.",
    targetFile: "src/components/Navbar.jsx",
    approxTopPercent: 0,
    approxHeightPercent: 10,
    quickPrompts: [
      "Changer le logo et le slogan",
      "Ajouter un bouton WhatsApp visible dans le menu",
      "Fond translucide avec bordure fine",
    ],
  },
  {
    id: "hero",
    name: "Bannière Hero (Accueil)",
    shortLabel: "Hero Banner",
    icon: Sparkles,
    description: "Grand titre d'accueil, sous-titre, badge et bouton d'action principal.",
    targetFile: "src/components/Hero.jsx",
    approxTopPercent: 10,
    approxHeightPercent: 28,
    quickPrompts: [
      "Fond sombre et plus contrasté",
      "Titre plus percutant avec badge promotionnel -20%",
      "Agrandir le bouton WhatsApp",
      "Changer l'image pour un visuel plus moderne",
    ],
  },
  {
    id: "catalog",
    name: "Catalogue & Grille Produits",
    shortLabel: "Catalogue",
    icon: ShoppingBag,
    description: "Liste des articles, prix en FCFA, badges et catégories.",
    targetFile: "src/components/ProductGrid.jsx",
    approxTopPercent: 38,
    approxHeightPercent: 32,
    quickPrompts: [
      "Ajouter 2 nouveaux articles avec prix en FCFA",
      "Ajuster les prix pour être plus abordable",
      "Mettre des photos plus éclatantes",
      "Ajouter des filtres par catégorie",
    ],
  },
  {
    id: "story",
    name: "Histoire de la Marque & Atelier",
    shortLabel: "Histoire",
    icon: BookOpen,
    description: "Récit de l'artisanat, savoir-faire local et authenticité.",
    targetFile: "src/components/Sections.jsx",
    approxTopPercent: 70,
    approxHeightPercent: 10,
    quickPrompts: [
      "Raconter l'histoire d'un atelier passionné",
      "Mettre en avant le savoir-faire local",
      "Ajouter des chiffres clés (ex: +500 clients livrés)",
    ],
  },
  {
    id: "reviews",
    name: "Avis Clients & Témoignages",
    shortLabel: "Avis Clients",
    icon: Star,
    description: "Retours d'expérience et notes des clients.",
    targetFile: "src/components/Sections.jsx",
    approxTopPercent: 80,
    approxHeightPercent: 10,
    quickPrompts: [
      "Ajouter des avis clients avec prénoms d'Abidjan/Dakar",
      "Afficher une note moyenne de 4.9/5 étoiles",
      "Mettre en avant la rapidité de la livraison",
    ],
  },
  {
    id: "footer",
    name: "Pied de page & Contact",
    shortLabel: "Pied de page",
    icon: MapPin,
    description: "Coordonnées complètes, horaires, adresse et réseaux sociaux.",
    targetFile: "src/components/Footer.jsx",
    approxTopPercent: 90,
    approxHeightPercent: 10,
    quickPrompts: [
      "Ajouter les horaires et l'adresse physique",
      "Afficher le numéro WhatsApp en grand",
      "Ajouter les liens réseaux sociaux (TikTok, Instagram)",
    ],
  },
  {
    id: "product_modal",
    name: "Fiche Produit Détaillée",
    shortLabel: "Fiche Produit",
    icon: Maximize2,
    description: "Zoom produit, sélecteur de quantité et réassurance.",
    targetFile: "src/components/ProductCard.jsx",
    quickPrompts: [
      "Ajouter les badges Wave et Orange Money",
      "Préciser la livraison en 24h par coursier",
      "Ajouter un guide des tailles",
    ],
  },
  {
    id: "delivery",
    name: "Livraison & Paiement (Wave / OM)",
    shortLabel: "Livraison & Wave",
    icon: Truck,
    description: "Zones desservies, coursiers et moyens de paiement mobiles.",
    targetFile: "src/components/Sections.jsx",
    quickPrompts: [
      "Préciser la livraison express en 24h à Abidjan",
      "Mettre en avant Wave et Orange Money sans frais",
      "Ajouter la livraison en région",
    ],
  },
  {
    id: "theme",
    name: "Identité Visuelle & Couleurs",
    shortLabel: "Thème & Style",
    icon: Palette,
    description: "Palette chromatique, polices et esprit graphique global.",
    targetFile: "src/theme.js",
    quickPrompts: [
      "Mode sombre haut de gamme (noir & or)",
      "Style minimaliste épuré avec fond clair",
      "Palette chaleureuse terracotta et ambre",
      "Typographie plus raffinée",
    ],
  },
];

interface SectionSelectorToolbarProps {
  selectedSection: StoreSection | null;
  onSelectSection: (section: StoreSection | null) => void;
  isInspectorMode: boolean;
  onToggleInspectorMode: () => void;
}

/**
 * Barre d'outils ultra-épurée au-dessus de l'aperçu du site (style Linear / Vercel)
 * Ne contient AUCUN formulaire : sert UNIQUEMENT à sélectionner une section.
 */
export function SectionSelectorToolbar({
  selectedSection,
  onSelectSection,
  isInspectorMode,
  onToggleInspectorMode,
}: SectionSelectorToolbarProps) {
  return (
    <div className="w-full max-w-5xl mb-2 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* Bouton Inspecteur visuel */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleInspectorMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            isInspectorMode
              ? "bg-white text-zinc-950 border-white shadow-sm"
              : "bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white"
          }`}
          title="Cliquez pour inspecter et sélectionner directement sur le site"
        >
          <MousePointer className="h-3.5 w-3.5" />
          <span>{isInspectorMode ? "Inspecteur actif" : "Inspecter sur le site"}</span>
        </button>

        <span className="text-[11px] text-zinc-500 hidden sm:inline">ou sélectionner :</span>
      </div>

      {/* Chips de sections discrets */}
      <div className="flex items-center gap-1.5 min-w-0">
        {STORE_SECTIONS.map((section) => {
          const isSelected = selectedSection?.id === section.id;
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(isSelected ? null : section)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition inline-flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-zinc-100 text-zinc-950 border-white shadow-sm font-semibold"
                  : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <Icon className={`h-3 w-3 ${isSelected ? "text-zinc-950" : "text-zinc-400"}`} />
              <span>{section.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Calque interactif sur le site (Canvas Inspecteur)
 * Permet de survoler et cliquer sur une section du site.
 * Affiche juste un indicateur discret et renvoie vers le chat à gauche.
 */
export function VisualCanvasOverlay({
  isInspectorMode,
  selectedSection,
  onSelectSection,
  onClose,
}: {
  isInspectorMode: boolean;
  selectedSection: StoreSection | null;
  onSelectSection: (section: StoreSection) => void;
  onClose: () => void;
}) {
  const [hoveredSection, setHoveredSection] = useState<StoreSection | null>(null);

  if (!isInspectorMode) return null;

  const canvasSections = STORE_SECTIONS.filter(
    (s) => s.approxTopPercent !== undefined && s.approxHeightPercent !== undefined
  );

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto select-none overflow-hidden bg-black/15">
      {/* Notification discrète en haut */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-200 text-xs font-medium shadow-2xl flex items-center gap-2 backdrop-blur-md">
        <Target className="h-3.5 w-3.5 text-blue-400" />
        <span>Cliquez sur une section pour la sélectionner</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-0.5 rounded text-zinc-400 hover:text-white"
          title="Fermer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Zones interactives transparentes */}
      {canvasSections.map((section) => {
        const isHovered = hoveredSection?.id === section.id;
        const isSelected = selectedSection?.id === section.id;
        const Icon = section.icon;

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(section)}
            onMouseEnter={() => setHoveredSection(section)}
            onMouseLeave={() => setHoveredSection(null)}
            style={{
              top: `${section.approxTopPercent}%`,
              height: `${section.approxHeightPercent}%`,
            }}
            className={`absolute left-0 right-0 cursor-pointer transition-all duration-150 flex items-center justify-center ${
              isSelected
                ? "border-2 border-blue-500 bg-blue-500/10 shadow-[inset_0_0_15px_rgba(59,130,246,0.15)]"
                : isHovered
                  ? "border-2 border-dashed border-zinc-400/70 bg-white/5"
                  : "border border-transparent"
            }`}
          >
            {(isHovered || isSelected) && (
              <div className="px-3 py-1.5 rounded-lg bg-zinc-950/95 border border-zinc-700 text-white text-xs font-medium shadow-xl inline-flex items-center gap-2 animate-in fade-in duration-100">
                <Icon className="h-3.5 w-3.5 text-blue-400" />
                <span>{section.name}</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                  {isSelected ? "Sélectionné • Décrivez votre demande à gauche" : "Cliquer pour cibler"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
