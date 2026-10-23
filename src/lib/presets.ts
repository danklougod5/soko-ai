import { StoreThemeConfig } from "@/types/store";

export const SAMPLE_PRESETS: { id: string; label: string; city: string; prompt: string; previewColor: string }[] = [
  {
    id: "awa-cuir",
    label: "Awa Cuir — Maroquinerie Luxe",
    city: "Abidjan, Côte d'Ivoire",
    previewColor: "#D97706",
    prompt: "Je m'appelle Awa, je crée des sacs à main et pochettes en cuir fait main à Abidjan. Style luxe minimaliste, tons noir et doré. Prix entre 15 000 et 45 000 FCFA. Paiements Wave, Orange Money et Cash à la livraison. Livraison Cocody, Plateau, Yopougon, Marcory.",
  },
  {
    id: "wax-dakar",
    label: "AfroChic Wax — Prêt-à-porter",
    city: "Dakar, Sénégal",
    previewColor: "#E11D48",
    prompt: "Boutique AfroChic à Dakar, vêtements wax modernes, chemises et robes colorées pour hommes et femmes. Style vibrant et moderne. Prix de 10 000 à 35 000 FCFA. Wave et Orange Money acceptés. Livraison Almadies, Plateau, Mermoz, Ouakam.",
  },
  {
    id: "food-akissi",
    label: "Saveurs d'Akissi — Gastronomie Ivoirienne",
    city: "Abidjan, Côte d'Ivoire",
    previewColor: "#16A34A",
    prompt: "Restaurant traiteur Chez Akissi à Cocody. Attiéké garba prestige, alloco, poulet et carpe braisée, piment noir fait maison. Commande rapide via WhatsApp et Wave. Livraison express Abidjan nord et sud.",
  },
  {
    id: "streetwear-lome",
    label: "Kitsuné Kicks — Sneakers & Streetwear",
    city: "Lomé / Cotonou",
    previewColor: "#6366F1",
    prompt: "Concept store streetwear Kitsuné à Lomé. Sneakers rares, hoodies oversize et casquettes. Style néon sombre et urbain. Prix en FCFA. Paiement T-Money, Moov, Wave et espèces au point relais.",
  }
];

export const DEFAULT_STORE_CONFIG: StoreThemeConfig = {
  storeName: "Awa Cuir",
  slug: "awa-cuir",
  tagline: "L'élégance du cuir artisanal ivoirien",
  description: "Créations exclusives en cuir véritable faites main à Abidjan. Chaque sac raconte l'excellence et le raffinement de l'artisanat ouest-africain.",
  sector: "luxe",
  country: "Côte d'Ivoire",
  city: "Abidjan",
  currency: "FCFA",
  currencySymbol: "FCFA",

  primaryColor: "#B45309",     // Warm luxury amber/gold
  secondaryColor: "#1C1917",   // Deep charcoal
  accentColor: "#F59E0B",      // Bright gold accent
  backgroundColor: "#FAFAF9",  // Cream white
  textColor: "#1C1917",        // Rich dark
  fontHeading: "Outfit, sans-serif",
  fontBody: "Inter, sans-serif",
  style: "luxe",

  hero: {
    headline: "L'art du cuir d'exception, façonné à Abidjan",
    subheadline: "Des pièces uniques cousues main pour sublimer votre allure au quotidien.",
    badgeText: "✨ Collection Prestige 2026",
    ctaText: "Découvrir la collection",
    backgroundImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
  },

  merchantWhatsapp: "2250700000000",
  merchantPhone: "+225 07 00 00 00 00",
  paymentMethods: ["wave", "orange_money", "cod"],
  codDepositPercent: 20,

  deliveryZones: [
    { id: "cocody", name: "Cocody / Deux-Plateaux / Angré", fee: 2000, estimatedTime: "2h à 4h" },
    { id: "plateau", name: "Plateau / Marcory / Zone 4", fee: 2500, estimatedTime: "3h à 5h" },
    { id: "yopougon", name: "Yopougon / Songon", fee: 3000, estimatedTime: "Même jour" },
    { id: "interieur", name: "Intérieur (Bouaké, Yamoussoukro, San-Pédro)", fee: 4000, estimatedTime: "24h à 48h (Gare UTB)" },
  ],

  categories: [
    { id: "all", name: "Tous les articles", icon: "✨" },
    { id: "sacs", name: "Sacs à main", icon: "👜" },
    { id: "pochettes", name: "Pochettes de soirée", icon: "👛" },
    { id: "ceintures", name: "Ceintures & Accessoires", icon: "💎" },
  ],

  products: [
    {
      id: "prod-1",
      name: "Sac Cabas Ebène & Or",
      price: 35000,
      originalPrice: 42000,
      description: "Cuir pleine fleur de première qualité avec fermoir en laiton doré brossé. Doublure intérieure en tissu wax haut de gamme.",
      category: "sacs",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      inStock: true,
      badge: "Bestseller",
      variants: [
        { name: "Couleur", options: ["Noir Ébène", "Camel Doré", "Bordeaux"] }
      ]
    },
    {
      id: "prod-2",
      name: "Pochette Royale Assinie",
      price: 22000,
      originalPrice: 28000,
      description: "Pochette de cocktail confectionnée avec finition crocodile gaufrée. Bandoulière en chaîne dorée détachable incluse.",
      category: "pochettes",
      image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80",
      inStock: true,
      badge: "Coup de cœur",
    },
    {
      id: "prod-3",
      name: "Porte-documents Directeur",
      price: 45000,
      description: "L'accessoire indispensable des cadres et entrepreneurs. Emplacement rembourré pour ordinateur 14 pouces et documents A4.",
      category: "sacs",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      inStock: true,
      badge: "Nouveau",
    },
    {
      id: "prod-4",
      name: "Ceinture Artisanale Boucle Bronze",
      price: 15000,
      description: "Ceinture réversible en cuir tanné naturellement à Grand-Bassam. Boucle sculptée inspirée de l'art Akan.",
      category: "ceintures",
      image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80",
      inStock: true,
    }
  ],

  trustBadges: [
    { icon: "ShieldCheck", title: "Cuir 100% Véritable", description: "Tannage artisanal certifié" },
    { icon: "Truck", title: "Livraison Rapide", description: "En 24h partout à Abidjan" },
    { icon: "Smartphone", title: "Wave & Orange Money", description: "Paiement sécurisé ou au livreur" },
    { icon: "MessageCircle", title: "SAV WhatsApp Réactif", description: "Réponse en moins de 15 min" },
  ]
};
