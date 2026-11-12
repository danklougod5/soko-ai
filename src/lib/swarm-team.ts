export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatar: string;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    pill: string;
    dot: string;
  };
  mission: string;
  skills: string[];
}

export const SWARM_AGENTS: SwarmAgent[] = [
  {
    id: "art-director",
    name: "Alexandre",
    role: "Directeur Artistique & UX",
    badge: "DA & Design",
    avatar: "🎨",
    colorClass: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-300",
      pill: "bg-amber-400/10 text-amber-300 border-amber-500/30",
      dot: "bg-amber-400",
    },
    mission: "Harmonie chromatique, typographies éditoriales, hiérarchie visuelle et expérience mobile tactile.",
    skills: ["Tokens CSS", "Palettes Haute Visibilité", "Typographies Google Fonts", "Apple Touch States"],
  },
  {
    id: "copywriter",
    name: "Fatou",
    role: "Concepteur-Rédacteur & Merchandising",
    badge: "Copywriting",
    avatar: "✍️",
    colorClass: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-300",
      pill: "bg-emerald-400/10 text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-400",
    },
    mission: "Slogans percutants, storytelling authentique, fiches produits attractives avec tarifs réalistes en FCFA.",
    skills: ["Storytelling Local", "Catalogues FCFA", "Réassurance Livraison", "Call-to-Action WhatsApp"],
  },
  {
    id: "react-engineer",
    name: "Kouassi",
    role: "Ingénieur Front-End React & Tailwind",
    badge: "Développeur",
    avatar: "💻",
    colorClass: {
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      text: "text-sky-300",
      pill: "bg-sky-400/10 text-sky-300 border-sky-500/30",
      dot: "bg-sky-400",
    },
    mission: "Assemblage du code React modulaire, modale produit interactive, routing hash et compatibilité WebContainers.",
    skills: ["React 19 & JSX", "Tailwind CSS v4", "Modale Produit Fullscreen", "Intégration Wave & WhatsApp"],
  },
  {
    id: "quality-auditor",
    name: "Sarah",
    role: "Auditrice Qualité & Linter",
    badge: "QA & Audit",
    avatar: "🔍",
    colorClass: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-300",
      pill: "bg-purple-400/10 text-purple-300 border-purple-500/30",
      dot: "bg-purple-400",
    },
    mission: "Vérification AST, validation de la syntaxe JSX, contrôle de compilation sans écran noir et linting strict.",
    skills: ["Validation Babel AST", "Détection Balises Non Fermées", "Accessibilité Contrastes", "Zéro Erreur Console"],
  },
];

export interface SwarmTraceMessage {
  id: string;
  agentId: string;
  agentName: string;
  role: string;
  avatar: string;
  text: string;
  timestamp: string;
  phase: "planning" | "content" | "code" | "qa" | "complete";
}

/**
 * Génère une séquence collaborative d'agents pour une création de boutique.
 */
export function buildCreationSwarmTraces(storeName: string, style?: string, city?: string): SwarmTraceMessage[] {
  const ville = city || "Abidjan";
  const boutique = storeName || "Boutique en ligne";
  const ambiance = style || "Élégant et chaleureux";

  return [
    {
      id: "trace-1",
      agentId: "art-director",
      agentName: "Alexandre",
      role: "Directeur Artistique",
      avatar: "🎨",
      text: `Analyse de la demande : boutique "${boutique}" (${ville}). Ambiance retenue : "${ambiance}". Calibration de la palette de couleurs et des polices.`,
      timestamp: "0.4s",
      phase: "planning",
    },
    {
      id: "trace-2",
      agentId: "copywriter",
      agentName: "Fatou",
      role: "Copywriter",
      avatar: "✍️",
      text: `Rédaction du storytelling et des 6 articles phares avec tarifs en FCFA, zones de livraison vers ${ville} et message de commande WhatsApp pré-rempli.`,
      timestamp: "1.8s",
      phase: "content",
    },
    {
      id: "trace-3",
      agentId: "react-engineer",
      agentName: "Kouassi",
      role: "Ingénieur React",
      avatar: "💻",
      text: `Assemblage de l'arborescence modulaire : Navbar sticky, Hero plein écran, ProductGrid avec modale produit détaillée et bouton WhatsApp flottant.`,
      timestamp: "3.6s",
      phase: "code",
    },
    {
      id: "trace-4",
      agentId: "quality-auditor",
      agentName: "Sarah",
      role: "Auditrice Qualité",
      avatar: "🔍",
      text: `Contrôle de conformité syntaxique JSX et analyse AST : 0 erreur Babel détectée. Projet prêt pour la prévisualisation temps réel.`,
      timestamp: "5.2s",
      phase: "qa",
    },
  ];
}

/**
 * Génère une séquence collaborative d'agents pour une modification ciblée.
 */
export function buildEditSwarmTraces(instruction: string, targetSection?: string): SwarmTraceMessage[] {
  const cible = targetSection || "Boutique entière";

  return [
    {
      id: "edit-1",
      agentId: "art-director",
      agentName: "Alexandre",
      role: "Directeur Artistique",
      avatar: "🎨",
      text: `Ciblage de la section "${cible}". Analyse de la demande de modification : "${instruction}".`,
      timestamp: "0.3s",
      phase: "planning",
    },
    {
      id: "edit-2",
      agentId: "react-engineer",
      agentName: "Kouassi",
      role: "Ingénieur React",
      avatar: "💻",
      text: `Mise à jour différentielle du composant ciblé. Réécriture propre sans impacter le reste du projet.`,
      timestamp: "1.5s",
      phase: "code",
    },
    {
      id: "edit-3",
      agentId: "quality-auditor",
      agentName: "Sarah",
      role: "Auditrice Qualité",
      avatar: "🔍",
      text: `Contrôle du patch différentiel : validation de la syntaxe et actualisation du rendu direct.`,
      timestamp: "2.8s",
      phase: "qa",
    },
  ];
}
