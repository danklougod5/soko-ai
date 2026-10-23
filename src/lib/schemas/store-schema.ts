import { z } from "zod";

// Helper for hex color validation with fallback
const HexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    message: "La couleur doit être un code hexadécimal valide (#RGB ou #RRGGBB)",
  });

export const DeliveryZoneSchema = z.object({
  id: z.string().default(() => `zone-${Math.random().toString(36).substring(2, 7)}`),
  name: z.string().min(1, "Le nom de la zone est requis"),
  fee: z.number().int().nonnegative().default(1000),
  estimatedTime: z.string().default("24h - 48h"),
});

export const ProductCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  icon: z.string().optional(),
});

export const ProductVariantSchema = z.object({
  name: z.string(),
  options: z.array(z.string()).min(1),
});

export const ProductItemSchema = z.object({
  id: z.string().default(() => `prod-${Math.random().toString(36).substring(2, 7)}`),
  name: z.string().min(1, "Le nom du produit est requis"),
  price: z.number().int().positive("Le prix doit être un entier positif en FCFA"),
  originalPrice: z.number().int().positive().optional(),
  description: z.string().default(""),
  category: z.string().default("Général"),
  image: z.string().url().or(z.string().startsWith("/")).default("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"),
  inStock: z.boolean().default(true),
  badge: z.string().optional(),
  variants: z.array(ProductVariantSchema).optional(),
});

export const StoreHeroSchema = z.object({
  headline: z.string().min(1).default("Bienvenue dans notre boutique"),
  subheadline: z.string().default("Commandez en ligne et payez facilement par Mobile Money."),
  badgeText: z.string().default("★ Sélection 2026"),
  ctaText: z.string().default("Voir le menu / articles"),
  backgroundImage: z.string().optional(),
});

export const StorytellingSchema = z.object({
  title: z.string(),
  content: z.string(),
  highlights: z.array(z.string()).default([]),
});

export const TestimonialSchema = z.object({
  name: z.string(),
  location: z.string(),
  comment: z.string(),
  rating: z.number().min(1).max(5).default(5),
});

export const TrustBadgeSchema = z.object({
  icon: z.string().default("shield"),
  title: z.string(),
  description: z.string(),
});

export const SectorEnum = z.enum([
  "mode",
  "luxe",
  "artisanat",
  "food",
  "tech",
  "beaute",
  "general",
]);

export const StylePresetEnum = z.enum([
  "luxe",
  "streetwear",
  "artisanat",
  "minimalist",
  "warm",
  "modern",
]);

export const PaymentMethodEnum = z.enum([
  "wave",
  "orange_money",
  "mtn_money",
  "moov_money",
  "cod",
  "card",
]);

export const StoreThemeConfigSchema = z.object({
  storeName: z.string().min(1, "Le nom de la boutique est obligatoire"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Le slug doit être en minuscules avec tirets uniquement"),
  tagline: z.string().default("Votre boutique en ligne de référence"),
  description: z.string().default(""),
  sector: SectorEnum.default("general"),
  country: z.string().default("Côte d'Ivoire"),
  city: z.string().default("Abidjan"),
  currency: z.string().default("FCFA"),
  currencySymbol: z.string().default("FCFA"),

  // Theme Design Tokens
  primaryColor: HexColorSchema.default("#EA580C"),
  secondaryColor: HexColorSchema.default("#0F172A"),
  accentColor: HexColorSchema.default("#F97316"),
  backgroundColor: HexColorSchema.default("#FFFFFF"),
  textColor: HexColorSchema.default("#0F172A"),
  fontHeading: z.string().default("Outfit"),
  fontBody: z.string().default("Inter"),
  style: StylePresetEnum.default("modern"),

  // Hero Section
  hero: StoreHeroSchema,

  // Commerce Features & Contact
  merchantWhatsapp: z.string().min(5).default("2250700000000"),
  merchantPhone: z.string().min(5).default("+225 07 00 00 00 00"),
  paymentMethods: z
    .array(PaymentMethodEnum)
    .min(1)
    .default(["wave", "orange_money", "cod"]),
  codDepositPercent: z.number().min(0).max(100).optional(),

  // Delivery & Categories & Catalog
  deliveryZones: z.array(DeliveryZoneSchema).min(1),
  categories: z.array(ProductCategorySchema).min(1),
  products: z.array(ProductItemSchema).min(1),

  // Storytelling & Testimonials
  storytelling: StorytellingSchema.optional(),
  testimonials: z.array(TestimonialSchema).optional(),

  // Trust badges
  trustBadges: z.array(TrustBadgeSchema).default([
    {
      icon: "shield",
      title: "Paiement 100% Sécurisé",
      description: "Wave, Orange Money ou Espèces à la livraison",
    },
    {
      icon: "truck",
      title: "Livraison Rapide",
      description: "Expédié directement chez vous avec suivi",
    },
    {
      icon: "check",
      title: "Qualité Garantie",
      description: "Satisfaction garantie ou assistance directe",
    },
  ]),
});

export type ValidatedStoreConfig = z.infer<typeof StoreThemeConfigSchema>;
export type ValidatedProductItem = z.infer<typeof ProductItemSchema>;
export type ValidatedDeliveryZone = z.infer<typeof DeliveryZoneSchema>;

/**
 * Valide et assainit la sortie de DeepSeek ou d'un formulaire utilisateur.
 * Si certains champs optionnels sont mal formés, ils sont corrigés avec des valeurs saines.
 */
export function validateAndSanitizeStoreConfig(data: unknown): {
  success: boolean;
  data?: ValidatedStoreConfig;
  errors?: string[];
} {
  const result = StoreThemeConfigSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
  return { success: false, errors };
}
