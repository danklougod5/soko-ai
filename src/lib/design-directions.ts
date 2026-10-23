import { StoreThemeConfig, DesignDirection, ClarificationQuestion, ProductItem } from "@/types/store";

export function detectDomainFromPrompt(prompt: string): {
  sector: "food" | "mode" | "luxe" | "tech" | "beaute" | "artisanat" | "general";
  normalizedKeyword: string;
} {
  const p = prompt.toLowerCase();

  // Food / Garba / Restauration
  if (
    p.includes("garba") ||
    p.includes("garbadrome") ||
    p.includes("bargadrome") ||
    p.includes("attieke") ||
    p.includes("attiéké") ||
    p.includes("poisson") ||
    p.includes("resto") ||
    p.includes("restaurant") ||
    p.includes("food") ||
    p.includes("manger") ||
    p.includes("alloco") ||
    p.includes("aloco") ||
    p.includes("choukouya") ||
    p.includes("braise") ||
    p.includes("braisé") ||
    p.includes("maquis") ||
    p.includes("poulet") ||
    p.includes("traiteur") ||
    p.includes("bissap")
  ) {
    return { sector: "food", normalizedKeyword: "garba & street food" };
  }

  // Chaussures & Sneakers (avec tolérance orthographique "chausure")
  if (
    p.includes("chaussure") ||
    p.includes("chausure") ||
    p.includes("chaussures") ||
    p.includes("chausures") ||
    p.includes("sneaker") ||
    p.includes("sneakers") ||
    p.includes("basket") ||
    p.includes("baskets") ||
    p.includes("sandale") ||
    p.includes("sandales") ||
    p.includes("mocassin") ||
    p.includes("mocassins") ||
    p.includes("talon") ||
    p.includes("talons") ||
    p.includes("soulier") ||
    p.includes("souliers")
  ) {
    return { sector: "luxe", normalizedKeyword: "chaussures & sneakers chic" };
  }

  // Maroquinerie & Cuir
  if (
    p.includes("cuir") ||
    p.includes("maroquinerie") ||
    p.includes("sac") ||
    p.includes("ceinture") ||
    p.includes("portefeuille")
  ) {
    return { sector: "luxe", normalizedKeyword: "maroquinerie de luxe" };
  }

  // Mode & Wax & Bazin
  if (
    p.includes("mode") ||
    p.includes("habit") ||
    p.includes("vetement") ||
    p.includes("vêtement") ||
    p.includes("wax") ||
    p.includes("bazin") ||
    p.includes("robe") ||
    p.includes("chemise") ||
    p.includes("couture") ||
    p.includes("pagne")
  ) {
    return { sector: "mode", normalizedKeyword: "mode & wax chic" };
  }

  // High-Tech
  if (
    p.includes("tech") ||
    p.includes("telephone") ||
    p.includes("téléphone") ||
    p.includes("iphone") ||
    p.includes("gadget") ||
    p.includes("ecouteur") ||
    p.includes("ordinateur")
  ) {
    return { sector: "tech", normalizedKeyword: "high-tech & accessoires" };
  }

  // Beauté & Cosmétiques
  if (
    p.includes("beaute") ||
    p.includes("beauté") ||
    p.includes("soin") ||
    p.includes("karite") ||
    p.includes("karité") ||
    p.includes("perruque") ||
    p.includes("cheveux") ||
    p.includes("savon") ||
    p.includes("creme") ||
    p.includes("crème")
  ) {
    return { sector: "beaute", normalizedKeyword: "beauté & cosmétiques naturels" };
  }

  return { sector: "general", normalizedKeyword: "e-commerce multi-produits" };
}

// FOOD / GARBADROME PRODUCTS
const GARBA_PRODUCTS: ProductItem[] = [
  {
    id: "g1",
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
    id: "g2",
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
    id: "g3",
    name: "Carpe Braisée Entière Assaisonnée",
    price: 5000,
    originalPrice: 6500,
    description: "Carpe fraîche entière grillée au feu de bois, marinade secrète aux épices locales avec garniture oignons-tomates.",
    category: "Grillades",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Grillade",
  },
  {
    id: "g4",
    name: "Portion d'Alloco Banane Mûre Frite",
    price: 1000,
    description: "Bananes plantains mûres frites à point, dorées et fondantes, accompagnées d'un piment noir piquant.",
    category: "Accompagnements",
    image: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Populaire",
  },
  {
    id: "g5",
    name: "Jus de Bissap Maison Glacé (50cl)",
    price: 800,
    description: "Infusion naturelle d'hibiscus rouge avec menthe fraîche du jardin et une pointe de vanille.",
    category: "Boissons",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Frais",
  },
  {
    id: "g6",
    name: "Jus de Gnamakoudji (Gingembre Pur 50cl)",
    price: 800,
    description: "Jus pur gingembre tonique pressé à froid, relevé au citron vert et sucre de canne.",
    category: "Boissons",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Énergie",
  },
];

// FASHION / WAX PRODUCTS
const WAX_PRODUCTS: ProductItem[] = [
  {
    id: "w1",
    name: "Robe Sirène Wax Imprimé Royal",
    price: 35000,
    originalPrice: 45000,
    description: "Robe longue cintrée en coton wax hollandais véritable, coupe moderne mettant en valeur la silhouette.",
    category: "Femmes",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Bestseller",
  },
  {
    id: "w2",
    name: "Chemise Wax Col Mao Moderne",
    price: 25000,
    originalPrice: 32000,
    description: "Chemise homme coupe ajustée avec empiècements géométriques wax et finitions soignées.",
    category: "Hommes",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Nouveau",
  },
  {
    id: "w3",
    name: "Ensemble Bazin Riche Brodé",
    price: 55000,
    originalPrice: 70000,
    description: "Bazin blanc cassé brodé au fil d'or, éclat soyeux pour grandes cérémonies et célébrations.",
    category: "Cérémonie",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Prestige",
  },
];

// SHOES & FOOTWEAR PRODUCTS
const SHOES_PRODUCTS: ProductItem[] = [
  {
    id: "s1",
    name: "Mocassins Cuir Italien Fait Main",
    price: 35000,
    originalPrice: 45000,
    description: "Mocassins en cuir véritable patiné à la main, semelle tout confort et finitions soignées.",
    category: "Mocassins & Ville",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Bestseller",
  },
  {
    id: "s2",
    name: "Sneakers Urbaines Cuir & Tissu Wax",
    price: 28000,
    originalPrice: 35000,
    description: "Baskets stylées associant cuir blanc premium et empiècements géométriques en wax résistant.",
    category: "Sneakers & Baskets",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Nouveau",
  },
  {
    id: "s3",
    name: "Sandales Cuir Artisanales Dakar",
    price: 18000,
    originalPrice: 22000,
    description: "Sandales en cuir tanné naturel faites par des artisans maîtres bottiers, confortables et aérées.",
    category: "Sandales & Mules",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Artisanal",
  },
  {
    id: "s4",
    name: "Bottines Chelsea Cuir Suédé",
    price: 42000,
    originalPrice: 50000,
    description: "Bottines élégantes à élastiques latéraux, parfaites pour le travail et les sorties chic.",
    category: "Bottines & Boots",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Élégance",
  },
];

// LEATHER PRODUCTS
const LEATHER_PRODUCTS: ProductItem[] = [
  {
    id: "l1",
    name: "Sac Bandoulière Bété Cuir Pleine Fleur",
    price: 38000,
    originalPrice: 48000,
    description: "Cuir tanné végétal, finitions laiton vieilli, bandoulière réglable et doublure coton wax.",
    category: "Sacs",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Fait main",
  },
  {
    id: "l2",
    name: "Pochette Document Baoulé",
    price: 28000,
    description: "Pochette zippée pour ordinateur et documents en cuir naturel grainé.",
    category: "Accessoires",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    badge: "Bestseller",
  },
];

/**
 * Generate 3 distinct design templates according to domain
 */
export function generateDirectionsForStore(
  store: StoreThemeConfig,
  prompt: string
): DesignDirection[] {
  const { sector } = detectDomainFromPrompt(prompt || store.storeName);

  if (sector === "food") {
    return [
      {
        id: "dir-1",
        name: "Direction #1 (Street Food & Fast Delivery)",
        tagline: "Dynamique • Croustillant • Livraison Rapide",
        badge: "Recommandé Food",
        style: "warm",
        primaryColor: "#EA580C", // Orange braisé
        secondaryColor: "#18181B",
        accentColor: "#DC2626", // Rouge piment
        backgroundColor: "#FFFBEB", // Crème attiéké
        textColor: "#1C1917",
        fontHeading: "Outfit",
        fontBody: "Inter",
        heroHeadline: `${store.storeName} — Le Garba Chaud en 20 Minutes`,
        heroSubheadline: "Attiéké fin d'origine Dabou, thon rouge frit croustillant et piments frais. Commandez et payez par Wave ou Orange Money.",
        badgeText: "🔥 Préparé à la minute",
        ctaText: "Commander mon Garba",
        previewImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
        description: "Style énergique inspiré de la street food abidjanaise. Couleurs vives qui ouvrent l'appétit, commande WhatsApp en 1 clic.",
        products: GARBA_PRODUCTS,
      },
      {
        id: "dir-2",
        name: "Direction #2 (Garba Lounge & Maquis Chic)",
        tagline: "Nocturne • Gourmet • Saveurs Pures",
        badge: "Moderne & Sombre",
        style: "modern",
        primaryColor: "#F59E0B", // Ambre doré
        secondaryColor: "#090A0F", // Noir nuit
        accentColor: "#10B981", // Vert piment
        backgroundColor: "#0F1015",
        textColor: "#F4F4F5",
        fontHeading: "Space Grotesk",
        fontBody: "Inter",
        heroHeadline: `La Référence du Garba Gourmet à ${store.city || "Abidjan"}`,
        heroSubheadline: "Une expérience street-food revisitée avec les meilleurs poissons grillés et un service de livraison VIP.",
        badgeText: "★ Sélection Premium",
        ctaText: "Découvrir la carte",
        previewImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
        description: "Thème sombre élégant style maquis lounge haut de gamme. Parfait pour attirer la jeunesse branchée et les afterworks.",
        products: GARBA_PRODUCTS,
      },
      {
        id: "dir-3",
        name: "Direction #3 (Cantine Populaire & Tradition)",
        tagline: "Authentique • Convivial • Recettes Ancestrales",
        badge: "Authentique & Convivial",
        style: "artisanat",
        primaryColor: "#B45309", // Ocre terre cuite
        secondaryColor: "#292524",
        accentColor: "#D97706",
        backgroundColor: "#FAF8F5",
        textColor: "#292524",
        fontHeading: "Playfair Display",
        fontBody: "Inter",
        heroHeadline: "Comme au village : Le vrai goût de l'Attiéké Poisson",
        heroSubheadline: "Portions copieuses, alloco fondant fait maison, et piment écrasé à la meule comme le faisait nos mères.",
        badgeText: "Authentique fait maison",
        ctaText: "Voir les formules midi",
        previewImage: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
        description: "Atmosphère chaleureuse et réconfortante. Typographie éditoriale mettant en avant la tradition et les portions généreuses.",
        products: GARBA_PRODUCTS,
      },
    ];
  }

  // FASHION / WAX / BAZIN
  if (sector === "mode") {
    return [
      {
        id: "dir-1",
        name: "Direction #1 (Afro-Chic & Moderne)",
        tagline: "Vibrant • Couleurs Wax • Urbain",
        badge: "Tendance 2026",
        style: "modern",
        primaryColor: "#E11D48",
        secondaryColor: "#1E1B4B",
        accentColor: "#F59E0B",
        backgroundColor: "#FAFAF9",
        textColor: "#1C1917",
        fontHeading: "Outfit",
        fontBody: "Inter",
        heroHeadline: `${store.storeName} — La Mode Africaine Contemporaine`,
        heroSubheadline: "Des coupes fluides et modernes confectionnées dans les plus beaux tissus wax d'Afrique.",
        badgeText: "Nouvelle Collection",
        ctaText: "Shopper la collection",
        previewImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
        description: "Contraste dynamique wax et fond épuré pour mettre en valeur les imprimés textiles vibrants.",
        products: WAX_PRODUCTS,
      },
      {
        id: "dir-2",
        name: "Direction #2 (Bazin & Prestige Cérémonie)",
        tagline: "Luxe • Or & Soie • Haute Couture",
        badge: "Prestige",
        style: "luxe",
        primaryColor: "#D97706",
        secondaryColor: "#09090B",
        accentColor: "#FBBF24",
        backgroundColor: "#0A0A0E",
        textColor: "#F5F5F4",
        fontHeading: "Playfair Display",
        fontBody: "Inter",
        heroHeadline: "L'art du Bazin brodé pour les grands jours",
        heroSubheadline: "Tenues d'exception taillées sur mesure pour vos mariages, fêtes et réceptions.",
        badgeText: "Haute Couture Africaine",
        ctaText: "Commander sur mesure",
        previewImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
        description: "Finition or et fond nuit, idéal pour les créateurs de tenues de cérémonie et de mariage.",
        products: WAX_PRODUCTS,
      },
      {
        id: "dir-3",
        name: "Direction #3 (Minimalist Studio)",
        tagline: "Épuré • Neutre • Focus Pièce",
        badge: "Minimaliste",
        style: "minimalist",
        primaryColor: "#18181B",
        secondaryColor: "#71717A",
        accentColor: "#3F3F46",
        backgroundColor: "#FFFFFF",
        textColor: "#18181B",
        fontHeading: "Inter",
        fontBody: "Inter",
        heroHeadline: "L'essentiel du vestiaire africain minimaliste",
        heroSubheadline: "Des lignes pures, des matières nobles et un confort pensé pour tous les jours.",
        badgeText: "Capsule intemporelle",
        ctaText: "Découvrir la capsule",
        previewImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
        description: "Inspiré des plus grandes boutiques de mode internationales avec une mise en avant sans distraction.",
        products: WAX_PRODUCTS,
      },
    ];
  }

  // DEFAULT / LEATHER / GENERAL
  return [
    {
      id: "dir-1",
      name: "Direction #1 (Minimalist Luxe Africa)",
      tagline: "Élégant • Matières Nobles • Confection Artisanale",
      badge: "Intemporel",
      style: "luxe",
      primaryColor: "#92400E",
      secondaryColor: "#1C1917",
      accentColor: "#D97706",
      backgroundColor: "#FAF8F5",
      textColor: "#1C1917",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      heroHeadline: `${store.storeName} — Objets d'exception façonnés à la main`,
      heroSubheadline: "Chaque pièce raconte une histoire de savoir-faire et d'exigence, livrée directement chez vous.",
      badgeText: "Artisanat d'exception",
      ctaText: "Parcourir la collection",
      previewImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
      description: "Ambiance atelier d'artisan, typographie serif élégante, tons naturels chaleureux.",
      products: LEATHER_PRODUCTS,
    },
    {
      id: "dir-2",
      name: "Direction #2 (Dark Modern Studio)",
      tagline: "Contraste • Épuré • Impact Visuel",
      badge: "Moderne",
      style: "modern",
      primaryColor: "#3B82F6",
      secondaryColor: "#0B0C10",
      accentColor: "#60A5FA",
      backgroundColor: "#0D0E12",
      textColor: "#F3F4F6",
      fontHeading: "Outfit",
      fontBody: "Inter",
      heroHeadline: "Le Futur du Commerce en Ligne Africain",
      heroSubheadline: "Commande rapide en 1 clic par Wave et Orange Money avec traçabilité complète de livraison.",
      badgeText: "Livraison Express",
      ctaText: "Acheter maintenant",
      previewImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      description: "Interface sombre hyper-moderne, badges lumineux et parcours d'achat optimisé pour mobile.",
      products: LEATHER_PRODUCTS,
    },
    {
      id: "dir-3",
      name: "Direction #3 (Warm Terroir & Artisanat)",
      tagline: "Terre cuite • Authenticité • Chaleur",
      badge: "Artisanal",
      style: "artisanat",
      primaryColor: "#B45309",
      secondaryColor: "#451A03",
      accentColor: "#D97706",
      backgroundColor: "#FFFBEB",
      textColor: "#451A03",
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      heroHeadline: "Le savoir-faire africain à votre portée",
      heroSubheadline: "Soutenez les artisans et producteurs locaux avec des pièces uniques et authentiques.",
      badgeText: "100% Local",
      ctaText: "Voir les créations",
      previewImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
      description: "Palette organique chaleureuse qui inspire confiance et authenticité.",
      products: LEATHER_PRODUCTS,
    },
  ];
}

/**
 * Generate 4 interactive clarification questions (Screenshot 2: Waiting for answers)
 */
export function generateQuestionsForStore(
  store: StoreThemeConfig,
  prompt: string
): ClarificationQuestion[] {
  const { sector } = detectDomainFromPrompt(prompt || store.storeName);

  if (sector === "food") {
    return [
      {
        id: "q-products",
        question: "Quels produits voulez-vous vendre sur votre boutique ?",
        currentAnswer: "Garba & Street Food (Attiéké + Thon frit + Alloco)",
        options: [
          "Garba & Street Food (Attiéké + Thon frit + Alloco)",
          "Grillades & Poissons braisés (Carpe, Tilapia)",
          "Restaurant africain complet & Traiteur",
          "Plats du midi & Jus de fruits frais (Bissap, Gingembre)",
        ],
      },
      {
        id: "q-name",
        question: "Quel est le nom de votre boutique ?",
        currentAnswer: store.storeName || "Garba Master Cocody",
        options: [
          store.storeName || "Garba Master Cocody",
          "Chez le Garbatisseur",
          "Attiéké Poisson Royal",
          "Garba Express Abidjan",
        ],
      },
      {
        id: "q-payment",
        question: "Voulez-vous que les clients paient directement en ligne ?",
        currentAnswer: "Oui, Wave & Orange Money (Paiement direct)",
        options: [
          "Oui, Wave & Orange Money (Paiement direct)",
          "Paiement à la livraison (Cash on Delivery)",
          "Les deux (Paiement Mobile Money ou Cash)",
        ],
      },
      {
        id: "q-style",
        question: "Quel style visuel préférez-vous pour la boutique ?",
        currentAnswer: "Chaleureux et gourmand (Orange braisé)",
        options: [
          "Chaleureux et gourmand (Orange braisé)",
          "Moderne & Street Food (Sombre néon)",
          "Cantine populaire & Traditionnelle",
        ],
      },
    ];
  }

  if (sector === "mode") {
    return [
      {
        id: "q-products",
        question: "Quels produits voulez-vous vendre sur votre boutique ?",
        currentAnswer: "Vêtements / mode wax et prêt-à-porter",
        options: [
          "Vêtements / mode wax et prêt-à-porter",
          "Robes de soirée et tenues de cérémonie",
          "Bazin riche brodé pour hommes et femmes",
          "Accessoires de mode et bijoux africains",
        ],
      },
      {
        id: "q-name",
        question: "Quel est le nom de votre boutique ?",
        currentAnswer: store.storeName || "Atelier Wax Chic",
        options: [
          store.storeName || "Atelier Wax Chic",
          "Dakar Fashion House",
          "Abidjan Couture Studio",
          "Pas encore de nom",
        ],
      },
      {
        id: "q-payment",
        question: "Voulez-vous que les clients paient directement en ligne ?",
        currentAnswer: "Oui, Wave & Orange Money",
        options: [
          "Oui, Wave & Orange Money",
          "Paiement à la livraison",
          "Les deux",
        ],
      },
      {
        id: "q-style",
        question: "Quel style visuel préférez-vous pour la boutique ?",
        currentAnswer: "Chaleureux et coloré",
        options: [
          "Chaleureux et coloré",
          "Luxe et épuré (Noir & Or)",
          "Minimaliste studio",
        ],
      },
    ];
  }

  // Default questions
  return [
    {
      id: "q-products",
      question: "Quels produits voulez-vous vendre sur votre boutique ?",
      currentAnswer: "Maroquinerie & maroquinerie artisanale",
      options: [
        "Maroquinerie & maroquinerie artisanale",
        "Vêtements / mode",
        "Articles high-tech et accessoires",
        "Soins, beauté et karité bio",
      ],
    },
    {
      id: "q-name",
      question: "Quel est le nom de votre boutique ?",
      currentAnswer: store.storeName || "Shop with Heart",
      options: [
        store.storeName || "Shop with Heart",
        "Atelier Africain",
        "Pas encore de nom",
      ],
    },
    {
      id: "q-payment",
      question: "Voulez-vous que les clients paient directement en ligne ?",
      currentAnswer: "Oui, paiement en ligne",
      options: [
        "Oui, paiement en ligne",
        "Paiement à la livraison",
        "Les deux",
      ],
    },
    {
      id: "q-style",
      question: "Quel style visuel préférez-vous pour la boutique ?",
      currentAnswer: "Luxe et prestige",
      options: [
        "Luxe et prestige",
        "Chaleureux et coloré",
        "Minimaliste & moderne",
      ],
    },
  ];
}

export function createStoreFromPromptAndAnswers(
  prompt: string,
  answers?: { products?: string; name?: string; payment?: string; style?: string }
): { store: StoreThemeConfig; directions: DesignDirection[] } {
  const { sector } = detectDomainFromPrompt(prompt || answers?.products || "");

  if (sector === "food") {
    const storeName = answers?.name?.trim() || "Le Garbadrome d'Abidjan";
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const baseStore: StoreThemeConfig = {
      storeName,
      slug,
      tagline: "Le vrai goût du garba, croustillant et généreux",
      description: "Bienvenue au Garbadrome d'Abidjan, le temple du garba et de la street food ivoirienne. Attiéké frais de Dabou, thon frit croustillant, alloco doré, poisson braisé et jus naturels glacés. Livraison chaude à Cocody, Plateau, Marcory et Yopougon.",
      sector: "food",
      country: "Côte d'Ivoire",
      city: "Abidjan",
      currency: "FCFA",
      currencySymbol: "FCFA",
      primaryColor: "#EA580C",
      secondaryColor: "#18181B",
      accentColor: "#DC2626",
      backgroundColor: "#FFFBEB",
      textColor: "#1C1917",
      fontHeading: "Outfit",
      fontBody: "Inter",
      style: "warm",
      hero: {
        headline: `${storeName}, le vrai garba d'Abidjan`,
        subheadline: "Attiéké frais, thon frit croustillant et alloco doré. Livraison rapide partout à Abidjan.",
        badgeText: "🔥 Préparé à la minute",
        ctaText: "Commander mon Garba",
        backgroundImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=80",
      },
      merchantWhatsapp: "2250700000000",
      merchantPhone: "+225 07 00 00 00 00",
      paymentMethods: answers?.payment?.includes("livraison") && !answers?.payment?.includes("Wave")
        ? ["cod"]
        : ["wave", "orange_money", "cod"],
      deliveryZones: [
        { id: "cocody", name: "Cocody (Angré, Riviera, II Plateaux)", fee: 1500, estimatedTime: "25-35 min" },
        { id: "plateau", name: "Plateau & Adjamé", fee: 1500, estimatedTime: "25-35 min" },
        { id: "marcory", name: "Marcory & Zone 4", fee: 2000, estimatedTime: "30-45 min" },
        { id: "yopougon", name: "Yopougon & Abobo", fee: 2500, estimatedTime: "40-60 min" },
      ],
      categories: [
        { id: "garba", name: "Plats Garba", icon: "🐟" },
        { id: "grillades", name: "Poissons braisés", icon: "🍗" },
        { id: "alloco", name: "Alloco & accompagnements", icon: "🍌" },
        { id: "boissons", name: "Jus naturels", icon: "🥤" },
      ],
      products: GARBA_PRODUCTS,
      trustBadges: [
        { icon: "🐟", title: "Fait maison", description: "Attiéké frais et thon frit préparés chaque jour" },
        { icon: "⚡", title: "Livraison rapide", description: "Livraison en 30 min partout à Abidjan" },
        { icon: "📱", title: "Paiement mobile", description: "Wave, Orange Money ou paiement à la livraison" },
        { icon: "💬", title: "SAV WhatsApp", description: "Commandes directes et assistance en 5 min" },
      ],
    };

    const directions = generateDirectionsForStore(baseStore, prompt);
    return { store: baseStore, directions };
  }

  // MODE / VÊTEMENTS / WAX / BAZIN
  if (sector === "mode") {
    const storeName = answers?.name?.trim() || "Maison Wax & Élégance";
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const baseStore: StoreThemeConfig = {
      storeName,
      slug,
      tagline: "La mode africaine chic, moderne et raffinée",
      description: "Découvrez notre collection exclusive de prêt-à-porter wax, robes de soirée, ensembles bazin brodés et tenues modernes confectionnées avec soin. Livraison rapide à Abidjan et partout en Afrique.",
      sector: "mode",
      country: "Côte d'Ivoire",
      city: "Abidjan",
      currency: "FCFA",
      currencySymbol: "FCFA",
      primaryColor: "#E11D48",
      secondaryColor: "#1E1B4B",
      accentColor: "#F59E0B",
      backgroundColor: "#FAF9F6",
      textColor: "#1C1917",
      fontHeading: "Outfit",
      fontBody: "Inter",
      style: "modern",
      hero: {
        headline: `${storeName} — L'Élégance Africaine Sublimée`,
        subheadline: "Des coupes fluides et modernes confectionnées dans les plus beaux tissus wax d'Afrique. Commandez et payez par Wave ou Orange Money.",
        badgeText: "✨ Nouvelle Collection 2026",
        ctaText: "Shopper la collection",
        backgroundImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1600&auto=format&fit=crop&q=80",
      },
      merchantWhatsapp: "2250700000000",
      merchantPhone: "+225 07 00 00 00 00",
      paymentMethods: ["wave", "orange_money", "cod"],
      deliveryZones: [
        { id: "cocody", name: "Cocody / Deux-Plateaux / Angré", fee: 1500, estimatedTime: "24h" },
        { id: "plateau", name: "Plateau / Marcory / Zone 4", fee: 2000, estimatedTime: "24h" },
        { id: "yopougon", name: "Yopougon / Songon", fee: 2500, estimatedTime: "24h-48h" },
      ],
      categories: [
        { id: "femmes", name: "Robes & Femmes", icon: "👗" },
        { id: "hommes", name: "Chemises & Hommes", icon: "👔" },
        { id: "ceremonie", name: "Bazin & Cérémonie", icon: "✨" },
      ],
      products: WAX_PRODUCTS,
      trustBadges: [
        { icon: "✨", title: "Wax & Bazin 100% Qualité", description: "Tissus sélectionnés et coutures renforcées" },
        { icon: "🚚", title: "Livraison Express", description: "Livraison sous 24h partout à Abidjan" },
        { icon: "💳", title: "Paiement Mobile", description: "Wave, Orange Money ou à la livraison" },
        { icon: "💬", title: "Service WhatsApp Direct", description: "Conseils taille et commande rapide" },
      ],
    };

    const directions = generateDirectionsForStore(baseStore, prompt);
    return { store: baseStore, directions };
  }

  // CHAUSSURES / SNEAKERS / SANDALES / BASKETS
  const isShoes =
    (prompt || "").toLowerCase().includes("chaussure") ||
    (prompt || "").toLowerCase().includes("chausure") ||
    (prompt || "").toLowerCase().includes("sneaker") ||
    (prompt || "").toLowerCase().includes("basket") ||
    (prompt || "").toLowerCase().includes("sandale") ||
    (prompt || "").toLowerCase().includes("mocassin");

  if (isShoes) {
    const storeName = answers?.name?.trim() || "Khelil Shoes & Sneakers";
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const baseStore: StoreThemeConfig = {
      storeName,
      slug,
      tagline: "L'élégance et le confort à chaque pas",
      description: "Collection exclusive de mocassins faits main, sneakers urbaines et sandales en cuir véritable. Livraison rapide à Abidjan et expédition sous-régionale.",
      sector: "luxe",
      country: "Côte d'Ivoire",
      city: "Abidjan",
      currency: "FCFA",
      currencySymbol: "FCFA",
      primaryColor: "#0F172A",
      secondaryColor: "#1E293B",
      accentColor: "#D97706",
      backgroundColor: "#FAF9F6",
      textColor: "#0F172A",
      fontHeading: "Outfit",
      fontBody: "Inter",
      style: "modern",
      hero: {
        headline: `${storeName} — Chaussures d'Exception`,
        subheadline: "Mocassins italiens, sneakers wax et sandales cuir tanné main. Confort absolu, paiement Wave & Orange Money.",
        badgeText: "👟 Collection Chaussures 2026",
        ctaText: "Découvrir les modèles",
        backgroundImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80",
      },
      merchantWhatsapp: "2250700000000",
      merchantPhone: "+225 07 00 00 00 00",
      paymentMethods: ["wave", "orange_money", "cod"],
      deliveryZones: [
        { id: "cocody", name: "Cocody / Deux-Plateaux / Angré", fee: 1500, estimatedTime: "24h" },
        { id: "plateau", name: "Plateau / Marcory / Zone 4", fee: 2000, estimatedTime: "24h" },
        { id: "yopougon", name: "Yopougon / Songon", fee: 2500, estimatedTime: "24h-48h" },
      ],
      categories: [
        { id: "mocassins", name: "Mocassins & Ville", icon: "👞" },
        { id: "sneakers", name: "Sneakers & Baskets", icon: "👟" },
        { id: "sandales", name: "Sandales & Mules", icon: "👡" },
        { id: "boots", name: "Bottines & Boots", icon: "🥾" },
      ],
      products: SHOES_PRODUCTS,
      trustBadges: [
        { icon: "👞", title: "Cuir Véritable & Confort", description: "Semelles ergonomiques et cuir certifié" },
        { icon: "🚚", title: "Livraison Rapide", description: "Livraison à domicile en 24h à Abidjan" },
        { icon: "💳", title: "Paiement Mobile 1-Clic", description: "Wave, Orange Money ou à la livraison" },
        { icon: "💬", title: "Guide des Tailles WhatsApp", description: "Échange de pointure gratuit garanti" },
      ],
    };

    const directions = generateDirectionsForStore(baseStore, prompt);
    return { store: baseStore, directions };
  }

  // DEFAULT
  const storeName = answers?.name?.trim() || "Awa Cuir";
  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const baseStore: StoreThemeConfig = {
    storeName,
    slug,
    tagline: "L'élégance du cuir artisanal ivoirien",
    description: "Créations exclusives en cuir véritable faites main à Abidjan. Sacs cabas, pochettes et accessoires de luxe.",
    sector: "luxe",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    currency: "FCFA",
    currencySymbol: "FCFA",
    primaryColor: "#92400E",
    secondaryColor: "#1C1917",
    accentColor: "#D97706",
    backgroundColor: "#FAF8F5",
    textColor: "#1C1917",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    style: "luxe",
    hero: {
      headline: `${storeName} — Objets d'exception façonnés à la main`,
      subheadline: "Chaque pièce raconte une histoire de savoir-faire et d'exigence, livrée directement chez vous.",
      badgeText: "Artisanat d'exception",
      ctaText: "Parcourir la collection",
      backgroundImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&auto=format&fit=crop&q=80",
    },
    merchantWhatsapp: "2250700000000",
    merchantPhone: "+225 07 00 00 00 00",
    paymentMethods: ["wave", "orange_money", "cod"],
    deliveryZones: [
      { id: "cocody", name: "Cocody / Deux-Plateaux / Angré", fee: 1500, estimatedTime: "24h" },
      { id: "plateau", name: "Plateau / Marcory / Zone 4", fee: 2000, estimatedTime: "24h" },
      { id: "yopougon", name: "Yopougon / Songon", fee: 2500, estimatedTime: "24h-48h" },
    ],
    categories: [
      { id: "sacs", name: "Sacs à main", icon: "👜" },
      { id: "pochettes", name: "Pochettes", icon: "👝" },
      { id: "ceintures", name: "Ceintures", icon: "👔" },
    ],
    products: LEATHER_PRODUCTS,
    trustBadges: [
      { icon: "✨", title: "Cuir 100% Véritable", description: "Tannage artisanal certifié" },
      { icon: "🚚", title: "Livraison Rapide", description: "En 24h partout à Abidjan" },
      { icon: "💳", title: "Wave & Orange Money", description: "Paiement sécurisé ou au livreur" },
      { icon: "💬", title: "SAV WhatsApp Réactif", description: "Réponse en moins de 15 min" },
    ],
  };

  const directions = generateDirectionsForStore(baseStore, prompt);
  return { store: baseStore, directions };
}
