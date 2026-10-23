import { 
  StoreThemeConfig, 
  DesignDirection, 
  ClarificationQuestion, 
  ProductItem, 
  DeliveryZone 
} from "@/types/store";
import { detectDomainFromPrompt, createStoreFromPromptAndAnswers } from "./design-directions";
import {
  StoreBrief,
  briefToPromptText,
  briefToLegacyAnswers,
  getBriefAnswer,
  slugify,
} from "./store-brief";
import { callLLMJson, hasLLMKey } from "./llm";

export interface AIStoreGenerationResult {
  store: StoreThemeConfig;
  directions: DesignDirection[];
  questions: ClarificationQuestion[];
}

interface ParsedStoreHead {
  storeName?: string;
  tagline?: string;
  description?: string;
  sector?: StoreThemeConfig["sector"];
  country?: string;
  city?: string;
  merchantWhatsapp?: string;
  merchantPhone?: string;
  paymentMethods?: StoreThemeConfig["paymentMethods"];
  categories?: StoreThemeConfig["categories"];
}

interface ParsedLLM {
  store?: ParsedStoreHead;
  directions?: DesignDirection[];
  questions?: ClarificationQuestion[];
}

const MASTER_DESIGN_PROMPT = `Tu es le Directeur Artistique Web et Concepteur UI/UX Senior de "SokoAI - Le Lovable Africain".
Tu conçois des sites e-commerce sur-mesure d'une beauté époustouflante, d'une ergonomie mobile-first irréprochable et d'une authenticité culturelle totale.

RÈGLE N°1 — LE CAHIER DES CHARGES DU COMMERÇANT EST LA SOURCE DE VÉRITÉ :
- Si un cahier des charges (questions/réponses) est fourni, tu DOIS le respecter à la lettre : produits cités, gamme de prix, ville/quartiers, livraison, moyens de paiement, clientèle, ambiance, nom.
- Le catalogue DOIT contenir les produits que le commerçant a cités (6 à 8 produits), avec des prix dans SA gamme.
- Les exemples sectoriels ci-dessous ne sont que des repères : ne les utilise JAMAIS s'ils contredisent le cahier des charges.
- Si une réponse est "Non précisé", propose le choix le plus pertinent pour CETTE activité.

RÈGLE D'OR ABSOLUE :
- JAMAIS de template générique ou préétabli.
- Tout le design, la typographie, les palettes de couleurs, les accroches marketing, le storytelling, le catalogue produit et les avis clients DOIVENT être conçus sur-mesure pour l'activité EXACTE du commerçant.
- Comprends les besoins réels du secteur :
  * Si c'est un Garbadrome / Maquis / Restaurant / Fast-food africain :
    Le vocabulaire doit être 100% culinaire, croustillant, gourmand, généreux et authentique (ex: Attiéké de Dabou, Thon frit croustillant assaisonné, Piment flamme écrasé, Alloco doré banane mûre, Carpe braisée, Jus de Bissap glacé, Dêguê au lait frais).
    Les prix DOIVENT être en FCFA réalistes (1 500 à 6 000 FCFA pour les plats, 500 à 1 500 FCFA pour les boissons).
    Les zones de livraison sont les communes réelles (ex: Cocody, Plateau, Marcory, Yopougon, Riviera pour Abidjan).
  * Si c'est de la Mode / Wax / Bazin / Couture :
    Matières nobles, coupes contemporaines, broderies fines. Prix réalistes en FCFA (15 000 à 60 000 FCFA).
  * Si c'est de la Maroquinerie / Chaussures / Luxe :
    Cuir artisanal, finitions soignées. Prix en FCFA (20 000 à 80 000 FCFA).
  * Si c'est de la Beauté & Soins naturels :
    Beurre de karité pur, savons noirs, huiles végétales, éclat du teint naturel.

CONCEPTION DE 3 DIRECTIONS ARTISTIQUES COMPLÈTEMENT DISTINCTES :
Les 3 directions vendent LES MÊMES produits du cahier des charges ; elles varient le design, le ton et la mise en avant.
La direction #1 DOIT correspondre exactement à l'ambiance demandée par le commerçant (réponse "style").
Les 2 autres proposent des alternatives crédibles pour SON activité, par exemple :
- Dynamique & Conversion express (couleurs vives, accroche orientée action, achat en 1 clic).
- Premium & Élégance (fond sombre ou très épuré, accents dorés/émeraude, mise en valeur haut de gamme).
- Authenticité & Storytelling (tons naturels, savoir-faire, origine des produits).
Le vocabulaire, les accroches et les images doivent être 100% liés à l'activité réelle (jamais de vocabulaire culinaire pour une boutique de mode, etc.).

RÈGLE DE MODERNITÉ & DE COMPOSITION (TRÈS IMPORTANTE) :
- Chaque direction DOIT choisir explicitement une architecture moderne cohérente : un "heroType" et un "catalogLayout" DIFFÉRENTS d'une direction à l'autre, + une liste "sections" ordonnée et variée (jamais toujours le même ordre).
- heroType autorisés :
  * "full_banner" : grande image plein écran, texte centré par-dessus (impact maximal, lifestyle).
  * "editorial_fashion" : mise en page magazine asymétrique, grande typographie + visuel vertical (mode, luxe, beauté).
  * "split_card" : texte à gauche + visuel à droite (équilibré, polyvalent).
  * "minimal_type" : très grande typographie, sans image, beaucoup d'air (premium, épuré).
  * "bento_grid" : grille bento moderne de tuiles (image + produits + accroches).
- catalogLayout autorisés : "grid" (grille 3 col), "editorial_cards" (1 produit vedette + grille), "masonry" (colonnes façon Pinterest), "minimal_list" (liste épurée ligne par ligne).
- Compose 7 à 10 sections dans un ordre crédible. Sections disponibles : "Marquee", "HeroSection", "TrustBadges", "FeaturedPromo", "StatsBand", "ProductGrid", "BentoShowcase", "Storytelling", "Lookbook", "Testimonials", "FAQ", "DeliveryZones", "CtaBanner".
- "Marquee" = bandeau défilant de promesses courtes ; "StatsBand" = chiffres clés ; "BentoShowcase" = grille de mise en avant ; "Lookbook" = galerie d'images ; "CtaBanner" = bandeau d'appel à l'action final.
- Fournis "stats" (3-4 chiffres clés crédibles : nb produits, note, délai de livraison, satisfaction), "faq" (3-4 questions/réponses réelles liées à l'activité : commande, paiement, livraison, échange) et "marqueeItems" (4-6 promesses courtes).
- Style visuel : vise un rendu premium et contemporain (contrastes soignés, palettes cohérentes, typographies haut de gamme parmi celles proposées, espacement généreux). Évite le "template générique".

Tu DOIS répondre avec un JSON STRICT respectant cette structure exacte :
{
  "store": {
    "storeName": string,
    "slug": string,
    "tagline": string,
    "description": string,
    "sector": "food" | "mode" | "luxe" | "artisanat" | "tech" | "beaute" | "general",
    "country": string,
    "city": string,
    "currency": "FCFA",
    "currencySymbol": "FCFA",
    "merchantWhatsapp": string,
    "merchantPhone": string,
    "paymentMethods": ["wave", "orange_money", "cod"],
    "categories": [
      { "id": string, "name": string, "icon": string }
    ]
  },
  "directions": [
    {
      "id": "dir-1",
      "name": string,
      "tagline": string,
      "badge": string,
      "style": "warm" | "modern" | "artisanat" | "luxe",
      "primaryColor": string (hex code),
      "secondaryColor": string (hex code),
      "accentColor": string (hex code),
      "backgroundColor": string (hex code),
      "surfaceColor": string (hex code pour les cartes),
      "textColor": string (hex code avec contraste élevé),
      "cardBorderColor": string (hex ou rgba),
      "fontHeading": "Outfit" | "Plus Jakarta Sans" | "Space Grotesk" | "Playfair Display",
      "fontBody": "Inter" | "DM Sans" | "Manrope",
      "heroHeadline": string,
      "heroSubheadline": string,
      "badgeText": string,
      "ctaText": string,
      "previewImage": string (URL unsplash de haute qualité adaptée au sujet),
      "description": string,
      "storytelling": {
        "title": string,
        "content": string,
        "highlights": [string, string, string]
      },
      "products": [
        {
          "id": string,
          "name": string,
          "price": number (en FCFA),
          "originalPrice": number (en FCFA),
          "description": string,
          "category": string,
          "image": string (URL unsplash réaliste),
          "inStock": true,
          "badge": string
        }
      ],
      "testimonials": [
        {
          "name": string,
          "location": string,
          "comment": string,
          "rating": 5
        }
      ],
      "deliveryZones": [
        { "id": string, "name": string, "fee": number, "estimatedTime": string }
      ],
      "stats": [ { "value": string, "label": string } ],
      "faq": [ { "question": string, "answer": string } ],
      "marqueeItems": [ string ],
      "sections": [
        { "type": "Marquee" },
        { "type": "HeroSection", "props": { "variant": "full_banner" | "editorial" | "split" | "minimal" | "bento" } },
        { "type": "TrustBadges" },
        { "type": "FeaturedPromo", "props": { "badge": string, "title": string, "description": string, "ctaText": string } },
        { "type": "StatsBand" },
        { "type": "ProductGrid", "props": { "layout": "grid" | "editorial_cards" | "masonry" | "minimal_list" } },
        { "type": "BentoShowcase", "props": { "title": string, "subtitle": string } },
        { "type": "Storytelling" },
        { "type": "Lookbook" },
        { "type": "Testimonials" },
        { "type": "FAQ" },
        { "type": "DeliveryZones" },
        { "type": "CtaBanner", "props": { "headline": string, "subheadline": string, "ctaText": string } }
      ],
      "layoutStructure": {
        "heroType": "split_card" | "full_banner" | "minimal_type" | "editorial_fashion" | "bento_grid",
        "catalogLayout": "grid" | "editorial_cards" | "masonry" | "minimal_list",
        "sectionOrder": ["hero", "trustBadges", "featuredPromo", "catalog", "storytelling", "testimonials", "deliveryInfo"],
        "featuredPromo": {
          "badge": string,
          "title": string,
          "description": string,
          "ctaText": string,
          "image": string
        }
      }
    }
  ]
}`;

const PAYMENT_KEYWORDS: [RegExp, StoreThemeConfig["paymentMethods"][number]][] = [
  [/wave/i, "wave"],
  [/orange/i, "orange_money"],
  [/mtn|momo/i, "mtn_money"],
  [/moov/i, "moov_money"],
  [/cash|livraison|esp[eè]ces|cod/i, "cod"],
  [/carte|visa|mastercard/i, "card"],
];

function paymentsFromAnswer(answer?: string): StoreThemeConfig["paymentMethods"] | undefined {
  if (!answer) return undefined;
  const methods = PAYMENT_KEYWORDS.filter(([re]) => re.test(answer)).map(([, id]) => id);
  return methods.length > 0 ? Array.from(new Set(methods)) : undefined;
}

function whatsappFromAnswer(answer?: string): string | undefined {
  const digits = answer?.replace(/\D/g, "");
  return digits && digits.length >= 8 ? digits : undefined;
}

/** Le cahier des charges écrase toujours ce que le LLM a pu inventer pour ces champs. */
function applyBriefOverrides(store: StoreThemeConfig, brief?: StoreBrief): StoreThemeConfig {
  if (!brief) return store;
  const name = getBriefAnswer(brief, "name");
  const whatsapp = whatsappFromAnswer(getBriefAnswer(brief, "whatsapp"));
  const payments = paymentsFromAnswer(getBriefAnswer(brief, "payment"));
  return {
    ...store,
    storeName: name || store.storeName,
    slug: slugify(name || store.storeName || "boutique"),
    merchantWhatsapp: whatsapp || store.merchantWhatsapp,
    merchantPhone: whatsapp ? `+${whatsapp}` : store.merchantPhone,
    paymentMethods: payments || store.paymentMethods,
  };
}

export async function generateBespokeStoreWithDeepSeek(
  prompt: string,
  legacyAnswers?: {
    products?: string;
    name?: string;
    payment?: string;
    style?: string;
  },
  brief?: StoreBrief
): Promise<AIStoreGenerationResult> {
  const answers = brief ? briefToLegacyAnswers(brief) : legacyAnswers;
  const detected = detectDomainFromPrompt(
    [prompt, brief?.understanding.businessType, answers?.products].filter(Boolean).join(" ")
  );
  if (brief?.understanding.sector) {
    detected.sector = brief.understanding.sector;
  }

  // Build tailored user prompt
  let userMessage = `Crée une boutique e-commerce complète avec 3 directions artistiques sur-mesure pour ce besoin : "${prompt}".`;
  if (brief) {
    userMessage = `Crée une boutique e-commerce complète avec 3 directions artistiques sur-mesure.\n\n=== CAHIER DES CHARGES DU COMMERÇANT (PRIORITAIRE) ===\n${briefToPromptText(brief)}\n=== FIN DU CAHIER DES CHARGES ===\n\nRespecte strictement ces réponses (produits, prix, ville, paiement, ambiance, nom).`;
  } else if (answers) {
    userMessage += `\n\nPrécisions fournies par le commerçant :
- Spécialités / Produits phares : ${answers.products || "Non spécifié"}
- Nom souhaité de la boutique : ${answers.name || "À proposer"}
- Modes de paiement préférés : ${answers.payment || "Wave, Orange Money, Cash"}
- Ambiance / Style visuel souhaité : ${answers.style || "À concevoir selon le secteur"}`;
  }

  if (detected.sector === "food") {
    userMessage += `\n\nINDICATION SECTORIELLE MAJEURE : C'est un commerce de RESTAURATION / STREET FOOD / GARBADROME AFRICAIN ("${detected.normalizedKeyword}"). Le vocabulaire, les plats, les garnitures (attiéké, alloco, piments) et les boissons locales DOIVENT être authentiques et réalistes en FCFA.`;
  }

  if (!hasLLMKey()) {
    console.warn("Aucune clé LLM configurée, utilisation du moteur intelligent de secours");
    return buildBespokeFallbackResult(prompt, answers, detected.sector, brief);
  }

  try {
    const parsed = await callLLMJson<ParsedLLM>({
      system: MASTER_DESIGN_PROMPT,
      user: userMessage,
      temperature: 0.7,
    });

    if (!parsed || !parsed.directions || !Array.isArray(parsed.directions) || parsed.directions.length === 0) {
      return buildBespokeFallbackResult(prompt, answers, detected.sector, brief);
    }

    // Merge first direction into store base config
    const firstDir: DesignDirection = parsed.directions[0];
    const resolvedName =
      answers?.name && answers.name !== "Pas encore décidé" ? answers.name : parsed.store?.storeName || "Mon E-Commerce";
    const baseStoreRaw: StoreThemeConfig = {
      storeName: resolvedName,
      slug: slugify(resolvedName || "store"),
      tagline: parsed.store?.tagline || firstDir.tagline,
      description: parsed.store?.description || firstDir.description,
      sector: parsed.store?.sector || detected.sector || "general",
      country: parsed.store?.country || "Côte d'Ivoire",
      city: parsed.store?.city || "Abidjan",
      currency: "FCFA",
      currencySymbol: "FCFA",
      primaryColor: firstDir.primaryColor,
      secondaryColor: firstDir.secondaryColor,
      accentColor: firstDir.accentColor,
      backgroundColor: firstDir.backgroundColor,
      textColor: firstDir.textColor,
      fontHeading: firstDir.fontHeading,
      fontBody: firstDir.fontBody,
      style: firstDir.style,
      hero: {
        headline: firstDir.heroHeadline,
        subheadline: firstDir.heroSubheadline,
        badgeText: firstDir.badgeText,
        ctaText: firstDir.ctaText,
        backgroundImage: firstDir.previewImage,
      },
      merchantWhatsapp: parsed.store?.merchantWhatsapp || "2250700000000",
      merchantPhone: parsed.store?.merchantPhone || "+225 07 00 00 00 00",
      paymentMethods: parsed.store?.paymentMethods || ["wave", "orange_money", "cod"],
      deliveryZones: firstDir.deliveryZones || [
        { id: "cocody", name: "Cocody (Angré, Riviera, Deux-Plateaux)", fee: 1500, estimatedTime: "25-35 min" },
        { id: "plateau", name: "Plateau & Adjamé", fee: 1500, estimatedTime: "25-35 min" },
        { id: "marcory", name: "Marcory & Zone 4", fee: 2000, estimatedTime: "30-45 min" },
        { id: "yopougon", name: "Yopougon & Abobo", fee: 2500, estimatedTime: "40-60 min" },
      ],
      categories: parsed.store?.categories || [
        { id: "specialites", name: "Spécialités du Chef", icon: "⭐" },
        { id: "formules", name: "Formules Complètes", icon: "🔥" },
        { id: "accompagnements", name: "Accompagnements", icon: "🍌" },
        { id: "boissons", name: "Boissons Fraîches", icon: "🥤" },
      ],
      products: firstDir.products || [],
      storytelling: firstDir.storytelling,
      testimonials: firstDir.testimonials,
      stats: firstDir.stats,
      faq: firstDir.faq,
      marqueeItems: firstDir.marqueeItems,
      trustBadges: [
        { icon: "⚡", title: "Livraison 30 min", description: "Chaud et croustillant chez vous" },
        { icon: "📱", title: "Paiement Mobile", description: "Wave & Orange Money sécurisés" },
        { icon: "🥘", title: "100% Fait Maison", description: "Ingrédients frais du terroir" },
        { icon: "💬", title: "Commande WhatsApp", description: "Suivi direct avec le gérant" },
      ],
      layoutStructure: firstDir.layoutStructure || {
        heroType: "split_card",
        catalogLayout: "grid",
        sectionOrder: ["hero", "trustBadges", "catalog", "storytelling", "testimonials"],
      },
      sections: firstDir.sections,
    };
    const baseStore = applyBriefOverrides(baseStoreRaw, brief);

    return {
      store: baseStore,
      directions: parsed.directions,
      questions: parsed.questions && parsed.questions.length > 0 ? parsed.questions : [
        {
          id: "q-products",
          question: "Quels sont vos 2 ou 3 produits phares ?",
          currentAnswer: answers?.products || "Garba thon frit croustillant, alloco et attiéké frais",
          options: [
            "Garba thon frit croustillant, alloco et attiéké frais",
            "Poisson braisé carpe et brochettes choukouya",
            "Formules complètes avec boissons locales",
            "Plats du jour et spécialités ivoiriennes"
          ],
        },
        {
          id: "q-name",
          question: "Quel nom souhaitez-vous donner à votre enseigne ?",
          currentAnswer: baseStore.storeName,
          options: [
            baseStore.storeName,
            "Garba Prestige Abidjan",
            "Le Palais du Garba Chic",
            "Garbadrome Chez le Chef"
          ],
        },
        {
          id: "q-payment",
          question: "Quels modes de paiement acceptez-vous ?",
          currentAnswer: answers?.payment || "Wave, Orange Money & Cash à la livraison",
          options: [
            "Wave, Orange Money & Cash à la livraison",
            "Wave uniquement (Paiement instantané)",
            "Orange Money & MTN MoMo",
            "Paiement à la livraison uniquement (Cash)"
          ],
        },
        {
          id: "q-style",
          question: "Quelle ambiance visuelle correspond le mieux à votre marque ?",
          currentAnswer: answers?.style || "Chaleureuse & Populaire (Tons dorés et épicés)",
          options: [
            "Chaleureuse & Populaire (Tons dorés et épicés)",
            "Lounge Moderne & Sombre (Haut de gamme, épuré)",
            "Artisanale & Terroir (Authentique, naturelle)",
            "Minimaliste & Rapide (Mobile-first, moderne)"
          ],
        }
      ],
    };
  } catch (error) {
    console.error("Erreur lors de la génération avec DeepSeek:", error);
    return buildBespokeFallbackResult(prompt, answers, detected.sector, brief);
  }
}

/**
 * Intelligent tailored fallback if DeepSeek is unreachable
 */
function buildBespokeFallbackResult(
  prompt: string,
  answers?: { products?: string; name?: string; payment?: string; style?: string },
  sector: string = "food",
  brief?: StoreBrief
): AIStoreGenerationResult {
  // Hors restauration : utiliser le générateur sectoriel au lieu du menu garba
  if (sector !== "food") {
    const { store, directions } = createStoreFromPromptAndAnswers(
      [prompt, answers?.products].filter(Boolean).join(" "),
      answers
    );
    return { store: applyBriefOverrides(store, brief), directions, questions: [] };
  }

  const storeName = answers?.name || (prompt.includes("garba") ? "Garba Royale Abidjan" : "Le Maquis d'Abidjan");
  
  const dir1Products: ProductItem[] = [
    {
      id: "p1",
      name: "Garba Prestige 1 Morceau (Attiéké + Thon Frit)",
      price: 1500,
      originalPrice: 2000,
      description: "Attiéké fin d'origine Dabou, thon rouge frit croustillant, piments frais écrasés, dés d'oignons et tomates fraîches.",
      category: "Garba & Plats",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "Bestseller",
    },
    {
      id: "p2",
      name: "Formule Boss Garba (2 Morceaux + Alloco Doré)",
      price: 3500,
      originalPrice: 4000,
      description: "Double portion de thon frit croustillant, attiéké à volonté, alloco banane mûre frite et sauce pimentée maison.",
      category: "Garba & Plats",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "Spécial Chef",
    },
    {
      id: "p3",
      name: "Carpe Braisée Entière Assaisonnée",
      price: 5000,
      originalPrice: 6000,
      description: "Carpe fraîche entière grillée au feu de bois, marinade secrète aux épices locales avec garniture oignons-tomates.",
      category: "Grillades",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "Frais du Port",
    },
    {
      id: "p4",
      name: "Barquette Alloco Doré Croustillant",
      price: 1000,
      originalPrice: 1200,
      description: "Bananes plantains mûres frites à point, dorées et fondantes avec piment noir maison.",
      category: "Accompagnements",
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "Incontournable",
    },
    {
      id: "p5",
      name: "Jus de Bissap Glacé Pur Hibiscus (50cl)",
      price: 800,
      description: "Infusion de fleurs d'hibiscus rouge, menthe fraîche et touche subtile de vanille.",
      category: "Boissons",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "Frais & Bio",
    },
    {
      id: "p6",
      name: "Dêguê Onctueux au Yaourt Frais & Couscous de Mil",
      price: 1000,
      description: "Dessert traditionnel doux et rafraîchissant au lait caillé et granulés de mil dorés.",
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80",
      inStock: true,
      badge: "Douceur",
    },
  ];

  const directions: DesignDirection[] = [
    {
      id: "dir-1",
      name: "Direction #1 — Street Food Énergique & Rapide",
      tagline: "Dynamique • Croustillant • Livraison Express 20 Min",
      badge: "Idéal Vente Flash",
      style: "warm",
      primaryColor: "#EA580C", // Orange braisé
      secondaryColor: "#1C1917",
      accentColor: "#DC2626", // Rouge piment
      backgroundColor: "#FFFBEB", // Crème attiéké
      surfaceColor: "#FFFFFF",
      textColor: "#1C1917",
      cardBorderColor: "#FDE68A",
      fontHeading: "Outfit",
      fontBody: "Inter",
      heroHeadline: `${storeName} — Le Garba Chaud Livré en 20 Minutes`,
      heroSubheadline: "Attiéké fin d'origine Dabou, thon rouge frit croustillant et piments frais. Commandez et payez par Wave ou Orange Money.",
      badgeText: "🔥 Préparé à la minute",
      ctaText: "Commander mon Garba",
      previewImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
      description: "Style énergique inspiré de la street food abidjanaise. Couleurs vives qui ouvrent l'appétit, commande WhatsApp en 1 clic.",
      storytelling: {
        title: "Le Secret de notre Attiéké de Dabou",
        content: "Chaque matin à l'aube, notre attiéké est acheminé directement depuis les coopératives de Dabou, puis cuit à la vapeur traditionnelle. Notre thon est sélectionné frais au port d'Abidjan et frit dans une huile dorée avec notre mélange d'épices secrètes.",
        highlights: ["100% Attiéké de Dabou certifié", "Thon frais frit à la commande", "Piments et oignons coupés minute"],
      },
      products: dir1Products,
      testimonials: [
        {
          name: "Koffi A.",
          location: "Cocody Deux-Plateaux",
          comment: "Le meilleur garba d'Abidjan en livraison ! Le poisson est super croustillant et l'attiéké est bien fin. Livré en 22 minutes chrono.",
          rating: 5,
        },
        {
          name: "Sarah M.",
          location: "Plateau Immeuble CCIA",
          comment: "On commande chaque vendredi au bureau. Le système de commande Wave et WhatsApp est super pratique !",
          rating: 5,
        },
        {
          name: "Christian D.",
          location: "Marcory Zone 4",
          comment: "La formule Boss avec alloco est imbattable. Portion très généreuse et piment bien dosé.",
          rating: 5,
        },
      ],
      deliveryZones: [
        { id: "cocody", name: "Cocody (Angré, Riviera, Deux-Plateaux)", fee: 1500, estimatedTime: "25-35 min" },
        { id: "plateau", name: "Plateau & Adjamé", fee: 1500, estimatedTime: "25-35 min" },
        { id: "marcory", name: "Marcory & Zone 4", fee: 2000, estimatedTime: "30-45 min" },
        { id: "yopougon", name: "Yopougon & Abobo", fee: 2500, estimatedTime: "40-60 min" },
      ],
    },
    {
      id: "dir-2",
      name: "Direction #2 — Garba Lounge & Maquis Chic",
      tagline: "Nocturne • Gourmet • Plats Signatures",
      badge: "Ambiance Élite & Sombre",
      style: "modern",
      primaryColor: "#F59E0B", // Ambre doré
      secondaryColor: "#0F1117",
      accentColor: "#E11D48",
      backgroundColor: "#0B0C10", // Deep black
      surfaceColor: "#13151F",
      textColor: "#F3F4F6",
      cardBorderColor: "rgba(255,255,255,0.08)",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      heroHeadline: `${storeName} • L'Expérience Gourmet du Garba`,
      heroSubheadline: "L'art du poisson braisé et du garba de prestige dans un écrin moderne. Réservation et commande prioritaire en ligne.",
      badgeText: "✨ Sélection Lounge 2026",
      ctaText: "Découvrir la Carte Signature",
      previewImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
      description: "Atmosphère nocturne élégante et épurée. Idéal pour séduire les cadres et les amateurs de maquis chic à Abidjan.",
      storytelling: {
        title: "L'Élévation de la Gastronomie Ivoirienne",
        content: "Nous avons réinventé le Garba pour en faire une véritable expérience gastronomique. Des poissons nobles braisés à la perfection, un dressage élégant et des accords mets-boissons locales raffinées.",
        highlights: ["Service lounge premium", "Sélection de poissons nobles entiers", "Cocktails au Bissap signature"],
      },
      products: dir1Products.map((p, idx) => ({
        ...p,
        name: idx === 0 ? "Garba Signature Thon Rouge Entier" : idx === 1 ? "Formule Prestige Capitaine & Alloco Doré" : p.name,
        price: p.price + 500,
        badge: idx === 0 ? "Signature" : idx === 1 ? "Prestige" : p.badge,
      })),
      testimonials: [
        {
          name: "Dominique T.",
          location: "Cocody Ambassades",
          comment: "Un garba de palace ! Le cadre et la présentation sont remarquables. Très bonne sélection de poissons braisés.",
          rating: 5,
        },
        {
          name: "Fatou K.",
          location: "Marcory Biétry",
          comment: "Le service client sur WhatsApp est irréprochable et la qualité des poissons est constante.",
          rating: 5,
        },
      ],
      deliveryZones: [
        { id: "cocody", name: "Cocody & Riviera Golf", fee: 1500, estimatedTime: "25-35 min" },
        { id: "plateau", name: "Plateau & Plateau Dokui", fee: 1500, estimatedTime: "25-35 min" },
        { id: "marcory", name: "Marcory & Zone 4", fee: 2000, estimatedTime: "30-45 min" },
      ],
    },
    {
      id: "dir-3",
      name: "Direction #3 — Saveurs d'Abidjan & Ambiance Populaire",
      tagline: "Terroir • Convivial • Générosité Abidjanaise",
      badge: "Authenticité Terroir",
      style: "artisanat",
      primaryColor: "#059669", // Vert émeraude
      secondaryColor: "#1C1917",
      accentColor: "#D97706",
      backgroundColor: "#FAF8F5", // Lin naturel
      surfaceColor: "#FFFFFF",
      textColor: "#292524",
      cardBorderColor: "#E7E5E4",
      fontHeading: "Space Grotesk",
      fontBody: "DM Sans",
      heroHeadline: `Le Vrai Garba de Quartier • ${storeName}`,
      heroSubheadline: "Comme au maquis du coin, la propreté et la rapidité en plus. Portions généreuses avec piment frais écrasé et alloco croustillant.",
      badgeText: "❤️ Saveurs de chez nous",
      ctaText: "Choisir ma Formule",
      previewImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=80",
      description: "Ambiance chaleureuse, familiale et authentique. Met l'accent sur les portions généreuses et les recettes traditionnelles.",
      storytelling: {
        title: "La Tradition du Garbadrome Authentique",
        content: "Chez nous, pas de chichis : le vrai goût de la rue abidjanaise avec un respect strict de l'hygiène et de la fraîcheur. Venez goûter l'attiéké vapeur et le poisson croustillant comme nos mamans le préparaient.",
        highlights: ["Portions très généreuses", "Huile de friture changée quotidiennement", "Accueil souriant et service rapide"],
      },
      products: dir1Products,
      testimonials: [
        {
          name: "Amadou S.",
          location: "Yopougon Bel Air",
          comment: "Vrai garba doux de Yop ! Portion bien chargée, attiéké propre sans sable et piment qui chauffe bien.",
          rating: 5,
        },
        {
          name: "Clarisse E.",
          location: "Koumassi Remblais",
          comment: "Le bissap est super frais et le poisson est bien assaisonné jusqu'à la chair. Je recommande à 100%.",
          rating: 5,
        },
      ],
      deliveryZones: [
        { id: "yopougon", name: "Yopougon & Attécoubé", fee: 1000, estimatedTime: "20-30 min" },
        { id: "cocody", name: "Cocody & Angré", fee: 2000, estimatedTime: "35-50 min" },
        { id: "abobo", name: "Abobo & Anyama", fee: 1500, estimatedTime: "30-40 min" },
      ],
    },
  ];

  const firstDir = directions[0];
  const baseStore: StoreThemeConfig = {
    storeName,
    slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    tagline: firstDir.tagline,
    description: firstDir.description,
    sector: "food",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    currency: "FCFA",
    currencySymbol: "FCFA",
    primaryColor: firstDir.primaryColor,
    secondaryColor: firstDir.secondaryColor,
    accentColor: firstDir.accentColor,
    backgroundColor: firstDir.backgroundColor,
    textColor: firstDir.textColor,
    fontHeading: firstDir.fontHeading,
    fontBody: firstDir.fontBody,
    style: firstDir.style,
    hero: {
      headline: firstDir.heroHeadline,
      subheadline: firstDir.heroSubheadline,
      badgeText: firstDir.badgeText,
      ctaText: firstDir.ctaText,
      backgroundImage: firstDir.previewImage,
    },
    merchantWhatsapp: "2250700000000",
    merchantPhone: "+225 07 00 00 00 00",
    paymentMethods: ["wave", "orange_money", "cod"],
    deliveryZones: firstDir.deliveryZones || [],
    categories: [
      { id: "garba", name: "Plats Garba", icon: "🐟" },
      { id: "grillades", name: "Grillades", icon: "🍗" },
      { id: "accompagnements", name: "Accompagnements", icon: "🍌" },
      { id: "boissons", name: "Boissons Fraîches", icon: "🥤" },
    ],
    products: firstDir.products,
    storytelling: firstDir.storytelling,
    testimonials: firstDir.testimonials,
    trustBadges: [
      { icon: "⚡", title: "Livraison 30 min", description: "Chaud et croustillant chez vous" },
      { icon: "📱", title: "Paiement Mobile", description: "Wave & Orange Money sécurisés" },
      { icon: "🥘", title: "100% Fait Maison", description: "Ingrédients frais du terroir" },
      { icon: "💬", title: "Commande WhatsApp", description: "Suivi direct avec le gérant" },
    ],
  };

  return {
    store: applyBriefOverrides(baseStore, brief),
    directions,
    questions: [
      {
        id: "q-products",
        question: "Quels sont vos 2 ou 3 produits phares ?",
        currentAnswer: answers?.products || "Garba thon frit croustillant, alloco et attiéké frais",
        options: [
          "Garba thon frit croustillant, alloco et attiéké frais",
          "Poisson braisé carpe et brochettes choukouya",
          "Formules complètes avec boissons locales",
          "Plats du jour et spécialités ivoiriennes"
        ],
      },
      {
        id: "q-name",
        question: "Quel nom souhaitez-vous donner à votre enseigne ?",
        currentAnswer: storeName,
        options: [
          storeName,
          "Garba Prestige Abidjan",
          "Le Palais du Garba Chic",
          "Garbadrome Chez le Chef"
        ],
      },
      {
        id: "q-payment",
        question: "Quels modes de paiement acceptez-vous ?",
        currentAnswer: answers?.payment || "Wave, Orange Money & Cash à la livraison",
        options: [
          "Wave, Orange Money & Cash à la livraison",
          "Wave uniquement (Paiement instantané)",
          "Orange Money & MTN MoMo",
          "Paiement à la livraison uniquement (Cash)"
        ],
      },
      {
        id: "q-style",
        question: "Quelle ambiance visuelle correspond le mieux à votre marque ?",
        currentAnswer: answers?.style || "Chaleureuse & Populaire (Tons dorés et épicés)",
        options: [
          "Chaleureuse & Populaire (Tons dorés et épicés)",
          "Lounge Moderne & Sombre (Haut de gamme, épuré)",
          "Artisanale & Terroir (Authentique, naturelle)",
          "Minimaliste & Rapide (Mobile-first, moderne)"
        ],
      }
    ],
  };
}
