export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
  badge?: string;
  variants?: {
    name: string;
    options: string[];
  }[];
}

export interface StoreThemeConfig {
  storeName: string;
  slug: string;
  tagline: string;
  description: string;
  sector: "mode" | "luxe" | "artisanat" | "food" | "tech" | "beaute" | "general";
  country: string;
  city: string;
  currency: string;
  currencySymbol: string;
  
  // Theme Design Tokens
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  style: "luxe" | "streetwear" | "artisanat" | "minimalist" | "warm" | "modern";
  
  // Hero Section
  hero: {
    headline: string;
    subheadline: string;
    badgeText: string;
    ctaText: string;
    backgroundImage?: string;
  };

  // Commerce Features & Contact
  merchantWhatsapp: string;
  merchantPhone: string;
  paymentMethods: ("wave" | "orange_money" | "mtn_money" | "moov_money" | "cod" | "card")[];
  codDepositPercent?: number;

  // Delivery & Categories & Catalog
  deliveryZones: DeliveryZone[];
  categories: ProductCategory[];
  products: ProductItem[];

  // Storytelling & Testimonials
  storytelling?: {
    title: string;
    content: string;
    highlights: string[];
  };
  testimonials?: {
    name: string;
    location: string;
    comment: string;
    rating: number;
  }[];

  // Trust badges
  trustBadges: {
    icon: string;
    title: string;
    description: string;
  }[];

  // Modern blocks (optional, AI-enriched)
  stats?: {
    value: string;
    label: string;
  }[];
  faq?: {
    question: string;
    answer: string;
  }[];
  marqueeItems?: string[];

  // Dynamic Layout & Structure (Lovable/Bolt Architecture)
  layoutStructure?: {
    heroType?: "split_card" | "full_banner" | "minimal_type" | "editorial_fashion" | "bento_grid";
    catalogLayout?: "grid" | "editorial_cards" | "masonry" | "minimal_list";
    sectionOrder?: ("hero" | "trustBadges" | "featuredPromo" | "catalog" | "storytelling" | "testimonials" | "deliveryInfo")[];
    featuredPromo?: {
      badge: string;
      title: string;
      description: string;
      ctaText: string;
      image?: string;
    };
  };

  // Modular Component Architecture (Lego blocks)
  sections?: StoreSection[];
}

export type StoreSectionType = 
  | "HeroSection" 
  | "FeaturedPromo" 
  | "ProductGrid" 
  | "TrustBadges" 
  | "Storytelling" 
  | "Testimonials" 
  | "DeliveryZones"
  | "Marquee"
  | "StatsBand"
  | "BentoShowcase"
  | "Lookbook"
  | "FAQ"
  | "CtaBanner";

export interface HeroSectionProps {
  variant?: "split" | "centered" | "editorial" | "minimal" | "full_banner" | "bento";
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  ctaText?: string;
  backgroundImage?: string;
}

export interface FeaturedPromoProps {
  badge?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  image?: string;
}

export interface ProductGridProps {
  layout?: "grid" | "editorial_cards" | "compact";
  title?: string;
  subtitle?: string;
}

export interface TrustBadgesProps {
  variant?: "cards" | "compact_strip";
}

export interface StorytellingProps {
  title?: string;
  content?: string;
  highlights?: string[];
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
}

export interface DeliveryZonesProps {
  title?: string;
}

export interface MarqueeProps {
  items?: string[];
}

export interface StatsBandProps {
  stats?: { value: string; label: string }[];
}

export interface BentoShowcaseProps {
  title?: string;
  subtitle?: string;
}

export interface LookbookProps {
  title?: string;
  subtitle?: string;
  images?: string[];
}

export interface FAQProps {
  title?: string;
  items?: { question: string; answer: string }[];
}

export interface CtaBannerProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export type StoreSection = 
  | { type: "HeroSection"; props?: HeroSectionProps }
  | { type: "FeaturedPromo"; props?: FeaturedPromoProps }
  | { type: "ProductGrid"; props?: ProductGridProps }
  | { type: "TrustBadges"; props?: TrustBadgesProps }
  | { type: "Storytelling"; props?: StorytellingProps }
  | { type: "Testimonials"; props?: TestimonialsProps }
  | { type: "DeliveryZones"; props?: DeliveryZonesProps }
  | { type: "Marquee"; props?: MarqueeProps }
  | { type: "StatsBand"; props?: StatsBandProps }
  | { type: "BentoShowcase"; props?: BentoShowcaseProps }
  | { type: "Lookbook"; props?: LookbookProps }
  | { type: "FAQ"; props?: FAQProps }
  | { type: "CtaBanner"; props?: CtaBannerProps };

export interface CartItem {
  product: ProductItem;
  quantity: number;
  selectedVariant?: string;
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCustomerInfo {
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  deliveryZoneId: string;
  deliveryLandmark: string; // "Derrière la pharmacie, portail vert"
  paymentMethod: "wave" | "orange_money" | "cod" | "card";
}

export interface PlacedOrder {
  id: string;
  createdAt: number;
  customer: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: "paid" | "pending";
  orderStatus: "new" | "confirmed" | "shipping" | "delivered";
}

export interface DesignDirection {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  style: "warm" | "modern" | "luxe" | "streetwear" | "minimalist" | "artisanat";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor?: string;
  textColor: string;
  cardBorderColor?: string;
  fontHeading: string;
  fontBody: string;
  heroHeadline: string;
  heroSubheadline: string;
  badgeText: string;
  ctaText: string;
  previewImage: string;
  description: string;
  storytelling?: {
    title: string;
    content: string;
    highlights: string[];
  };
  testimonials?: {
    name: string;
    location: string;
    comment: string;
    rating: number;
  }[];
  products: ProductItem[];
  deliveryZones?: DeliveryZone[];
  stats?: { value: string; label: string }[];
  faq?: { question: string; answer: string }[];
  marqueeItems?: string[];
  layoutStructure?: StoreThemeConfig["layoutStructure"];
  sections?: StoreSection[];
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  currentAnswer: string;
  options: string[];
}

