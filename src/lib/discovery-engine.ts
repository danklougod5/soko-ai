import { detectDomainFromPrompt } from "./design-directions";
import {
  DiscoveryQuestion,
  DiscoveryResult,
  DiscoveryUnderstanding,
} from "./store-brief";
import { callLLMJson, hasLLMKey } from "./llm";

const MAX_QUESTIONS = 6;

const DISCOVERY_PROMPT = `Tu es le consultant e-commerce de "SokoAI", le Lovable africain.
AVANT de créer un site, tu dois COMPRENDRE le commerçant comme le ferait une agence web sur-mesure.

TA MISSION :
1. Analyser la demande du commerçant et reformuler ce que tu as compris.
2. Lister les informations DÉJÀ données (ne jamais les redemander).
3. Poser entre 4 et ${MAX_QUESTIONS} questions COURTES, simples et spécifiques à SON activité exacte, uniquement sur ce qui manque pour concevoir un site vraiment adapté.
4. Les questions "style" (ambiance visuelle, avec des options adaptées à l'activité) et "name" sont OBLIGATOIRES sauf si déjà connues.

CHECKLIST des informations utiles (utilise EXACTEMENT ces "id" quand la question porte sur ce thème) :
- "products"       : produits / plats / services précis à vendre (catalogue)
- "priceRange"     : gamme de prix en FCFA
- "audience"       : clientèle visée (étudiants, cadres, familles, mariées, entreprises...)
- "name"           : nom de la boutique / marque
- "city"           : ville et quartiers de vente
- "delivery"       : mode de livraison (livreur, retrait, expédition nationale...) et délais
- "payment"        : moyens de paiement (Wave, Orange Money, MTN MoMo, Moov, cash à la livraison...)
- "whatsapp"       : numéro WhatsApp pour recevoir les commandes
- "style"          : ambiance visuelle souhaitée
- "differentiator" : ce qui rend la boutique unique (fait main, importé, bio, rapidité...)

RÈGLES POUR LES QUESTIONS :
- Ordonne-les de la plus importante à la moins importante. "products" en premier s'il n'est pas clair.
- Les "options" DOIVENT être concrètes et propres à l'activité (ex. pour une boutique de perruques : "Perruques lace frontal", "Mèches brésiliennes", "Produits capillaires"...). JAMAIS d'options génériques ou hors-sujet.
- 3 à 5 options par question (sauf type "text" : options vide []).
- type "multi" quand plusieurs réponses sont possibles (produits, paiements, livraison), "single" pour un choix unique (style, gamme de prix), "text" pour le nom ou le WhatsApp.
- "why" : une demi-phrase qui explique en quoi la réponse va améliorer le site.
- "required" : true seulement pour ce qui est indispensable (en général "products").
- Langue : français simple, tutoiement interdit, vouvoiement chaleureux.

Réponds UNIQUEMENT en JSON strict :
{
  "understanding": {
    "businessType": string,
    "sector": "food" | "mode" | "luxe" | "artisanat" | "tech" | "beaute" | "general",
    "summary": string (1 à 2 phrases commençant par "J'ai compris que..."),
    "known": [ { "label": string, "value": string } ]
  },
  "questions": [
    {
      "id": string,
      "question": string,
      "why": string,
      "type": "single" | "multi" | "text",
      "options": string[],
      "placeholder": string,
      "required": boolean
    }
  ]
}`;

const SECTORS = ["food", "mode", "luxe", "artisanat", "tech", "beaute", "general"] as const;

export async function discoverStoreNeeds(prompt: string): Promise<DiscoveryResult> {
  if (!hasLLMKey()) {
    console.warn("Aucune clé LLM configurée — questions de découverte heuristiques");
    return buildFallbackDiscovery(prompt);
  }

  try {
    const raw = await callLLMJson({
      system: DISCOVERY_PROMPT,
      user: `Demande du commerçant : "${prompt}"`,
      temperature: 0.4,
    });

    if (!raw) return buildFallbackDiscovery(prompt);

    const sanitized = sanitizeDiscovery(raw, prompt);
    return sanitized ?? buildFallbackDiscovery(prompt);
  } catch (err) {
    console.error("Erreur découverte LLM:", err);
    return buildFallbackDiscovery(prompt);
  }
}

/** Valide et nettoie la réponse du LLM (il peut renvoyer des champs manquants ou mal typés). */
function sanitizeDiscovery(raw: unknown, prompt: string): DiscoveryResult | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const u = (obj.understanding ?? {}) as Record<string, unknown>;
  const detected = detectDomainFromPrompt(prompt);

  const sector = SECTORS.includes(u.sector as (typeof SECTORS)[number])
    ? (u.sector as DiscoveryUnderstanding["sector"])
    : (detected.sector as DiscoveryUnderstanding["sector"]);

  const understanding: DiscoveryUnderstanding = {
    businessType: str(u.businessType) || detected.normalizedKeyword,
    sector,
    summary: str(u.summary) || `J'ai compris que vous souhaitez lancer : ${prompt}.`,
    known: Array.isArray(u.known)
      ? u.known
          .map((k) => ({ label: str((k as Record<string, unknown>)?.label), value: str((k as Record<string, unknown>)?.value) }))
          .filter((k) => k.label && k.value)
      : [],
  };

  const seen = new Set<string>();
  const questions: DiscoveryQuestion[] = (Array.isArray(obj.questions) ? obj.questions : [])
    .map((q, idx): DiscoveryQuestion | null => {
      const r = (q ?? {}) as Record<string, unknown>;
      const question = str(r.question);
      if (!question) return null;
      let id = str(r.id) || `q${idx + 1}`;
      if (seen.has(id)) id = `${id}-${idx}`;
      seen.add(id);
      const type: DiscoveryQuestion["type"] =
        r.type === "multi" || r.type === "text" ? r.type : "single";
      const options = Array.isArray(r.options)
        ? r.options.map(str).filter(Boolean).slice(0, 6)
        : [];
      return {
        id,
        question,
        why: str(r.why) || undefined,
        type: options.length === 0 ? "text" : type,
        options,
        placeholder: str(r.placeholder) || undefined,
        required: r.required === true,
      };
    })
    .filter((q): q is DiscoveryQuestion => q !== null)
    .slice(0, MAX_QUESTIONS);

  if (questions.length === 0) return null;

  // Garantir les questions qui conditionnent le design, si l'IA les a oubliées et qu'elles ne sont pas connues
  const isKnown = (re: RegExp) => understanding.known.some((k) => re.test(k.label));
  if (!isKnown(/style|ambiance/i) && !questions.some((q) => q.id === "style")) {
    questions.push(styleQuestion(sector));
  }
  if (!isKnown(/nom/i) && !questions.some((q) => q.id === "name")) {
    questions.push(nameQuestion());
  }

  return { understanding, questions };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function styleQuestion(sector: string): DiscoveryQuestion {
  return {
    id: "style",
    question: "Quelle ambiance voulez-vous pour votre site ?",
    why: "Pour choisir couleurs, typographies et photos.",
    type: "single",
    options:
      sector === "food"
        ? ["Chaleureux & gourmand", "Moderne & sombre (lounge)", "Populaire & convivial", "Minimaliste & rapide"]
        : ["Luxe & élégant (noir & or)", "Coloré & africain moderne", "Minimaliste & épuré", "Chaleureux & naturel"],
    required: false,
  };
}

function nameQuestion(): DiscoveryQuestion {
  return {
    id: "name",
    question: "Quel est le nom de votre boutique ?",
    why: "Il apparaîtra dans l'en-tête, l'URL et les messages WhatsApp.",
    type: "text",
    options: [],
    placeholder: "Ex : Chez Awa, Maison Koffi... (ou laissez l'IA proposer)",
    required: false,
  };
}

/** Questions de secours adaptées au secteur détecté (sans clé API ou en cas d'erreur). */
export function buildFallbackDiscovery(prompt: string): DiscoveryResult {
  const { sector, normalizedKeyword } = detectDomainFromPrompt(prompt);
  const s = sector as DiscoveryUnderstanding["sector"];

  const productOptions: Record<string, string[]> = {
    food: ["Plats principaux (garba, attiéké, riz...)", "Grillades & poissons braisés", "Boissons locales (bissap, gnamakoudji)", "Desserts & snacks", "Formules / menus du jour"],
    mode: ["Vêtements femme", "Vêtements homme", "Tenues traditionnelles (wax, bazin)", "Accessoires & bijoux", "Sur-mesure / couture"],
    luxe: ["Chaussures", "Sacs & maroquinerie", "Montres & bijoux", "Parfums", "Éditions limitées"],
    artisanat: ["Objets de décoration", "Sacs & cuir artisanal", "Paniers & vannerie", "Tableaux & sculptures", "Textiles tissés"],
    tech: ["Smartphones", "Accessoires (écouteurs, chargeurs)", "Ordinateurs", "Électroménager", "Réparation / services"],
    beaute: ["Soins visage & corps", "Beurre de karité & huiles", "Perruques & mèches", "Maquillage", "Parfums"],
    general: ["Produits du quotidien", "Mode & accessoires", "Électronique", "Maison & déco", "Alimentation"],
  };

  const styleOptions: Record<string, string[]> = {
    food: ["Chaleureux & gourmand", "Moderne & sombre (lounge)", "Populaire & convivial", "Minimaliste & rapide"],
    default: ["Luxe & élégant (noir & or)", "Coloré & africain moderne", "Minimaliste & épuré", "Chaleureux & naturel"],
  };

  const questions: DiscoveryQuestion[] = [
    {
      id: "products",
      question: `Que voulez-vous vendre exactement ?`,
      why: "Pour créer un vrai catalogue avec vos produits, pas des exemples génériques.",
      type: "multi",
      options: productOptions[s] ?? productOptions.general,
      placeholder: "Décrivez vos produits phares...",
      required: true,
    },
    {
      id: "priceRange",
      question: "Dans quelle gamme de prix vendez-vous ?",
      why: "Pour afficher des prix réalistes et adapter le positionnement.",
      type: "single",
      options: s === "food"
        ? ["Moins de 2 000 FCFA", "2 000 – 5 000 FCFA", "5 000 – 15 000 FCFA", "Plus de 15 000 FCFA"]
        : ["Moins de 10 000 FCFA", "10 000 – 30 000 FCFA", "30 000 – 100 000 FCFA", "Plus de 100 000 FCFA"],
      required: false,
    },
    {
      id: "city",
      question: "Dans quelle ville vendez-vous et livrez-vous ?",
      why: "Pour configurer vos zones et frais de livraison.",
      type: "single",
      options: ["Abidjan", "Dakar", "Lomé", "Cotonou", "Tout le pays"],
      placeholder: "Ville + quartiers principaux",
      required: false,
    },
    {
      id: "payment",
      question: "Comment vos clients vont-ils payer ?",
      why: "Pour activer les bons boutons de paiement.",
      type: "multi",
      options: ["Wave", "Orange Money", "MTN MoMo", "Moov Money", "Cash à la livraison"],
      required: false,
    },
    {
      id: "style",
      question: "Quelle ambiance voulez-vous pour votre site ?",
      why: "Pour choisir couleurs, typographies et photos.",
      type: "single",
      options: s === "food" ? styleOptions.food : styleOptions.default,
      required: false,
    },
    nameQuestion(),
  ];

  return {
    understanding: {
      businessType: normalizedKeyword,
      sector: s,
      summary: `J'ai compris que vous souhaitez créer une boutique en ligne (${normalizedKeyword}). Quelques questions pour la concevoir sur-mesure :`,
      known: [],
    },
    questions,
  };
}
