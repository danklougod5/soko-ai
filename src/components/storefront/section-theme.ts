import { StoreThemeConfig } from "@/types/store";

export interface SectionTheme {
  isDark: boolean;
  isWarm: boolean;
  isArtisanat: boolean;
  headingFont: string | undefined;
  surface: string;
  border: string;
  muted: string;
  strong: string;
  sectionBg: string;
}

export function getSectionTheme(store: StoreThemeConfig): SectionTheme {
  const isDark =
    store.style === "modern" ||
    Boolean(
      store.backgroundColor &&
        (store.backgroundColor.startsWith("#0") || store.backgroundColor.startsWith("#1"))
    );
  const isWarm = store.style === "warm";
  const isArtisanat = store.style === "artisanat";

  return {
    isDark,
    isWarm,
    isArtisanat,
    headingFont: store.fontHeading ? `"${store.fontHeading}", sans-serif` : undefined,
    surface: isDark ? "#12141C" : isWarm ? "#FFFDF5" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    muted: isDark ? "#9CA3AF" : "#6B7280",
    strong: isDark ? "#FFFFFF" : "#1C1917",
    sectionBg: isDark ? "#0E1017" : isWarm ? "#FFFDF5" : "#FFFFFF",
  };
}

/** Map the AI's layoutStructure.heroType to an implementable hero variant. */
export function mapHeroType(store: StoreThemeConfig): string {
  const heroType = store.layoutStructure?.heroType;
  switch (heroType) {
    case "split_card":
      return "split";
    case "full_banner":
      return "full_banner";
    case "minimal_type":
      return "minimal";
    case "editorial_fashion":
      return "editorial";
    case "bento_grid":
      return "bento";
  }
  // Pas de layoutStructure (presets locaux) : on dérive du style/secteur.
  switch (store.style) {
    case "modern":
      return "bento";
    case "luxe":
      return "editorial";
    case "minimalist":
      return "minimal";
    case "warm":
      return "full_banner";
    case "artisanat":
      return "split";
    case "streetwear":
      return "bento";
    default:
      return store.sector === "mode" || store.sector === "luxe" ? "editorial" : "centered";
  }
}

/** Map the AI's layoutStructure.catalogLayout to an implementable catalog layout. */
export function mapCatalogLayout(store: StoreThemeConfig): string {
  if (store.layoutStructure?.catalogLayout) {
    return store.layoutStructure.catalogLayout;
  }
  // Pas de layoutStructure : on dérive du secteur pour varier les rendus.
  switch (store.sector) {
    case "luxe":
      return "editorial_cards";
    case "mode":
    case "beaute":
      return "masonry";
    case "tech":
    case "general":
      return "minimal_list";
    default:
      return "grid";
  }
}
