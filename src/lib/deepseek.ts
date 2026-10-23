import { StoreThemeConfig } from "@/types/store";
import { DEFAULT_STORE_CONFIG } from "./presets";
import { detectDomainFromPrompt } from "./design-directions";
import { validateAndSanitizeStoreConfig } from "./schemas/store-schema";
import { callLLMJson, hasLLMKey } from "./llm";

const SYSTEM_PROMPT = `Tu es le cerveau AI de la plateforme "SokoAI - Le Lovable du E-commerce en Afrique".
Ta mission est de transformer la description en langage naturel d'un commerçant africain en une configuration complète de boutique e-commerce ultra-pertinente, adaptée à sa culture et prête à vendre.

RÈGLE CARDINALE :
TU NE GÉNÈRES JAMAIS DE CODE (AUCUN JSX, TSX, HTML, CSS OU JAVASCRIPT).
TU RETOURNES UNIQUEMENT UN OBJET JSON CONFORME AU SCHÉMA. PAS DE BLOC MARKDOWN, PAS DE TEXTE D'ACCOMPAGNEMENT, UNIQUEMENT DU JSON PUR.

RÈGLES CRUCIALES DE COMPRÉHENSION SECTORIELLE :
1. GASTRONOMIE & RESTAURATION AFRICAINE :
   - Si le prompt mentionne "garba", "garbadrome", "attiéké", "alloco", "choukouya", "poisson braisé", "maquis", "restaurant", "traiteur", "fast food", "snack" : Le secteur est OBLIGATOIREMENT "food".
   - Tu DOIS proposer des plats réels (ex: "Garba Thon Frit Croustillant", "Formule Boss 2 Morceaux + Alloco", "Carpe Braisée d'Abidjan", "Jus de Bissap Glacé", "Gnamakoudji Pur Gingembre").
   - PRIX RÉALISTES : Plats entre 1 500 et 5 000 FCFA. Boissons entre 500 et 1 000 FCFA.
   - NE JAMAIS proposer des vêtements ou des écouteurs pour un restaurant ou un garbadrome !

2. MODE, WAX & BAZIN :
   - Si le prompt concerne des habits, vêtements, wax, bazin, couture : Le secteur est "mode".
   - Proposer des chemises wax, robes, ensembles bazin brodés, boubous modernes.

3. MAROQUINERIE & CUIR :
   - Si le prompt concerne des sacs, cuir, chaussures : Le secteur est "luxe" ou "artisanat".

4. PAIEMENTS & LOGISTIQUE AFRICAINE :
   - Devises : FCFA (XOF/XAF). Jamais de centimes ni virgules.
   - Moyens de paiement : Toujours inclure Wave et Orange Money (et Cash on Delivery).
   - Communes de livraison adaptées à la ville (ex: Cocody, Yopougon, Plateau, Marcory pour Abidjan ; Almadies, Plateau, Mermoz pour Dakar).

Tu DOIS impérativement répondre au format JSON strict avec exactement cette structure :
{
  "storeName": string,
  "slug": string (slug URL sans espace ni accent),
  "tagline": string,
  "description": string,
  "sector": "mode" | "luxe" | "artisanat" | "food" | "tech" | "beaute" | "general",
  "country": string,
  "city": string,
  "currency": "FCFA",
  "currencySymbol": "FCFA",
  "primaryColor": string (hex adapté au secteur),
  "secondaryColor": string (hex sombre),
  "accentColor": string (hex vibrant),
  "backgroundColor": string (hex),
  "textColor": string (hex),
  "fontHeading": string,
  "fontBody": string,
  "style": "luxe" | "streetwear" | "artisanat" | "minimalist" | "warm" | "modern",
  "hero": {
    "headline": string,
    "subheadline": string,
    "badgeText": string,
    "ctaText": string,
    "backgroundImage": string (URL unsplash de haute qualité adaptée au produit)
  },
  "merchantWhatsapp": string,
  "merchantPhone": string,
  "paymentMethods": ["wave", "orange_money", "cod"],
  "codDepositPercent": number,
  "deliveryZones": [
    { "id": string, "name": string, "fee": number, "estimatedTime": string }
  ],
  "categories": [
    { "id": string, "name": string, "icon": string }
  ],
  "products": [
    {
      "id": string,
      "name": string,
      "price": number,
      "originalPrice": number,
      "description": string,
      "category": string,
      "image": string,
      "inStock": true,
      "badge": string
    }
  ],
  "trustBadges": [
    { "icon": string, "title": string, "description": string }
  ]
}`;

export async function generateStoreWithDeepSeek(prompt: string): Promise<StoreThemeConfig> {
  const detected = detectDomainFromPrompt(prompt);

  // Sector guidance to prevent hallucinated models (e.g. clothing for a garbadrome)
  let sectorClarification = "";
  if (detected.sector === "food") {
    sectorClarification = `\nATTENTION : L'utilisateur demande un commerce de RESTAURATION / STREET FOOD AFRICAINE ("${detected.normalizedKeyword}"). Le secteur DOIT être "food". Le catalogue DOIT contenir des spécialités culinaires africaines (Garba, Attiéké, Poisson frit croustillant, Alloco, Jus de Bissap) avec des prix en FCFA réalistes (1 500 à 5 000 FCFA).`;
  }

  if (!hasLLMKey()) {
    console.warn("Aucune clé LLM configurée, utilisation du preset intelligent");
    return buildSmartFallbackStore(prompt, detected.sector);
  }

  try {
    const rawParsed = await callLLMJson({
      system: SYSTEM_PROMPT,
      user: `Crée la boutique pour ce commerçant : "${prompt}".${sectorClarification}`,
      temperature: 0.7,
    });

    if (!rawParsed) {
      return buildSmartFallbackStore(prompt, detected.sector);
    }

    const validated = validateAndSanitizeStoreConfig(rawParsed);

    if (!validated.success || !validated.data) {
      console.warn("DeepSeek JSON incomplet, fallback assaini :", validated.errors);
      return buildSmartFallbackStore(prompt, detected.sector);
    }

    const parsed = validated.data as unknown as StoreThemeConfig;

    // Safety guard: if prompt is food but AI returned clothing or tech, fix it!
    if (detected.sector === "food" && parsed.sector !== "food") {
      return buildSmartFallbackStore(prompt, "food");
    }

    return parsed;
  } catch (err) {
    console.error("Erreur lors de la génération DeepSeek:", err);
    return buildSmartFallbackStore(prompt, detected.sector);
  }
}

export async function editStoreWithDeepSeek(
  currentStore: StoreThemeConfig,
  instruction: string
): Promise<StoreThemeConfig> {
  if (!hasLLMKey()) {
    return currentStore;
  }

  try {
    const rawParsed = await callLLMJson({
      system: SYSTEM_PROMPT,
      user: `Voici la boutique actuelle au format JSON :\n${JSON.stringify(currentStore, null, 2)}\n\nModifie cette boutique en appliquant scrupuleusement cette demande du commerçant : "${instruction}". Renvoie le JSON complet mis à jour.`,
      temperature: 0.5,
    });

    if (!rawParsed) return currentStore;

    const validated = validateAndSanitizeStoreConfig(rawParsed);

    if (validated.success && validated.data) {
      return validated.data as unknown as StoreThemeConfig;
    }

    console.warn("Échec validation modification, conservation de l'existant :", validated.errors);
    return currentStore;
  } catch (err) {
    console.error("Erreur modification DeepSeek:", err);
    throw err;
  }
}

function buildSmartFallbackStore(prompt: string, sector: string): StoreThemeConfig {
  if (sector === "food") {
    return {
      storeName: "Garba Royal Abidjan",
      slug: "garba-royal-abidjan",
      tagline: "Le Garba Croustillant & Chaud en 20 min à Abidjan",
      description: "Le temple du vrai Garba ivoirien. Thon rouge frit croustillant, attiéké fin de Dabou, piments frais et alloco doré. Livraison rapide à Cocody, Plateau, Marcory et Yopougon.",
      sector: "food",
      country: "Côte d'Ivoire",
      city: "Abidjan",
      currency: "FCFA",
      currencySymbol: "FCFA",
      primaryColor: "#EA580C",
      secondaryColor: "#1C1917",
      accentColor: "#DC2626",
      backgroundColor: "#FFFBEB",
      textColor: "#1C1917",
      fontHeading: "Outfit",
      fontBody: "Inter",
      style: "warm",
      hero: {
        headline: "Le Vrai Garba d'Abidjan, livré chaud chez toi",
        subheadline: "Attiéké fin, thon frit croustillant, piment écrasé frais et alloco doré. Paiement Wave & Orange Money.",
        badgeText: "🔥 Préparé à la commande",
        ctaText: "Commander mon Garba",
        backgroundImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80",
      },
      merchantWhatsapp: "2250700000000",
      merchantPhone: "+225 07 00 00 00 00",
      paymentMethods: ["wave", "orange_money", "cod"],
      codDepositPercent: 0,
      deliveryZones: [
        { id: "cocody", name: "Cocody (Angré, Riviera, II Plateaux)", fee: 1500, estimatedTime: "25-35 min" },
        { id: "plateau", name: "Plateau & Adjamé", fee: 1500, estimatedTime: "25-35 min" },
        { id: "marcory", name: "Marcory & Zone 4", fee: 2000, estimatedTime: "30-45 min" },
        { id: "yopougon", name: "Yopougon & Abobo", fee: 2500, estimatedTime: "40-60 min" },
      ],
      categories: [
        { id: "garba", name: "Plats Garba", icon: "🐟" },
        { id: "grillades", name: "Grillades", icon: "🍗" },
        { id: "alloco", name: "Alloco", icon: "🍌" },
        { id: "boissons", name: "Jus Naturels", icon: "🥤" },
      ],
      products: [
        {
          id: "g1",
          name: "Garba Classique 1 Morceau (Attiéké + Thon Frit)",
          price: 1500,
          originalPrice: 2000,
          description: "Attiéké fin d'origine Dabou, thon rouge frit croustillant, piments frais écrasés, oignons et tomates fraîches.",
          category: "garba",
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
          inStock: true,
          badge: "Bestseller",
        },
        {
          id: "g2",
          name: "Formule Boss Garba (2 Morceaux + Alloco Doré)",
          price: 3500,
          originalPrice: 4000,
          description: "Double portion de thon frit croustillant, attiéké à volonté, alloco banane mûre frite et sauce pimentée maison.",
          category: "garba",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
          inStock: true,
          badge: "Spécial Chef",
        },
        {
          id: "g3",
          name: "Carpe Braisée Entière Assaisonnée",
          price: 5000,
          originalPrice: 6500,
          description: "Carpe fraîche entière grillée au feu de bois, marinade secrète aux épices locales avec garniture oignons-tomates.",
          category: "grillades",
          image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
          inStock: true,
          badge: "Grillade",
        },
        {
          id: "g4",
          name: "Portion d'Alloco Banane Mûre Frite",
          price: 1000,
          description: "Bananes plantains mûres frites à point, dorées et fondantes, accompagnées d'un piment noir piquant.",
          category: "alloco",
          image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=800&auto=format&fit=crop&q=80",
          inStock: true,
          badge: "Populaire",
        },
        {
          id: "g5",
          name: "Jus de Bissap Maison Glacé (50cl)",
          price: 800,
          description: "Infusion naturelle d'hibiscus rouge avec menthe fraîche du jardin et une pointe de vanille.",
          category: "boissons",
          image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
          inStock: true,
          badge: "Frais",
        },
        {
          id: "g6",
          name: "Jus de Gnamakoudji (Gingembre Pur 50cl)",
          price: 800,
          description: "Jus pur gingembre tonique pressé à froid, relevé au citron vert et sucre de canne.",
          category: "boissons",
          image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80",
          inStock: true,
          badge: "Énergie",
        },
      ],
      trustBadges: [
        { icon: "⚡", title: "Livraison Chaude", description: "En 25 à 35 minutes chez vous à Abidjan." },
        { icon: "💙", title: "Paiement Wave & OM", description: "Paiement 1-clic sans frais supplémentaires." },
        { icon: "🐟", title: "Poissons Frais du Jour", description: "Approvisionnement quotidien au port de pêche." },
      ],
    };
  }

  return DEFAULT_STORE_CONFIG;
}
