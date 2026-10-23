import { validateAndSanitizeStoreConfig } from "../src/lib/schemas/store-schema";
import { DEFAULT_STORE_CONFIG, SAMPLE_PRESETS } from "../src/lib/presets";
import { createStoreFromPromptAndAnswers } from "../src/lib/design-directions";

console.log("🚀 Lancement du banc d'essai Zod & Moteur E-Commerce Africain...\n");

let passed = 0;
let failed = 0;

// Test 1: DEFAULT_STORE_CONFIG
console.log("▶ TEST 1 : Validation de la configuration par défaut (DEFAULT_STORE_CONFIG)");
const res1 = validateAndSanitizeStoreConfig(DEFAULT_STORE_CONFIG);
if (res1.success) {
  console.log("  ✅ Succès : Schéma 100% conforme pour DEFAULT_STORE_CONFIG\n");
  passed++;
} else {
  console.error("  ❌ Échec :", res1.errors);
  failed++;
}

// Test 2: SAMPLE_PRESETS (Garba, Wax, Tech, Maroquinerie...)
SAMPLE_PRESETS.forEach((preset, idx) => {
  console.log(`▶ TEST ${idx + 2} : Génération & Validation du Preset "${preset.label}"`);
  const { store } = createStoreFromPromptAndAnswers(preset.prompt);
  const res = validateAndSanitizeStoreConfig(store);
  if (res.success) {
    console.log(`  ✅ Succès : Boutique "${store.storeName}" (${store.sector}) validée par Zod`);
    passed++;
  } else {
    console.error(`  ❌ Erreurs sur "${store.storeName}" :`, res.errors);
    failed++;
  }
});

// Test 3: Simulation d'un JSON DeepSeek avec données réalistes africaines
console.log("\n▶ TEST HEURISTIQUE : JSON DeepSeek pour Garbadrome Abidjan");
const imperfectJson = {
  storeName: "Chez Tantie Alloco",
  slug: "chez-tantie-alloco",
  tagline: "Le meilleur alloco pimenté de Marcory",
  sector: "food",
  country: "Côte d'Ivoire",
  city: "Abidjan",
  currency: "FCFA",
  currencySymbol: "FCFA",
  primaryColor: "#FF7700",
  secondaryColor: "#111827",
  accentColor: "#F59E0B",
  backgroundColor: "#FFFFFF",
  textColor: "#111827",
  fontHeading: "Outfit",
  fontBody: "Inter",
  style: "warm",
  hero: {
    headline: "L'alloco chaud et croustillant en direct de Marcory",
    subheadline: "Accompagné de poisson braisé et piment frais écrasé.",
    badgeText: "🔥 Spécialité Ivoirienne",
    ctaText: "Commander ma part",
  },
  merchantWhatsapp: "2250701020304",
  merchantPhone: "+225 07 01 02 03 04",
  paymentMethods: ["wave", "orange_money", "cod"],
  deliveryZones: [
    { id: "marcory", name: "Marcory & Zone 4", fee: 1000, estimatedTime: "25 min" },
    { id: "cocody", name: "Cocody", fee: 2000, estimatedTime: "45 min" },
  ],
  categories: [
    { id: "alloco", name: "Portions Alloco" },
    { id: "poissons", name: "Poissons Braisés" },
  ],
  products: [
    {
      id: "alloco-simple",
      name: "Alloco Banane Mûre Dorée",
      price: 1500,
      description: "Banane plantain mûre découpée en rondelles et dorée dans l'huile de palme ou tournesol.",
      category: "Portions Alloco",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      inStock: true,
      badge: "Incontournable",
    },
    {
      id: "carpe-braisee",
      name: "Carpe Braisée d'Abidjan",
      price: 3500,
      description: "Carpe fraîche marinée aux épices locales et braisée au feu de bois.",
      category: "Poissons Braisés",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800",
      inStock: true,
      badge: "Chef",
    },
  ],
};

const resImperfect = validateAndSanitizeStoreConfig(imperfectJson);
if (resImperfect.success) {
  console.log("  ✅ Succès : JSON généré validé et trustBadges auto-complétés par défaut par Zod !");
  passed++;
} else {
  console.error("  ❌ Échec :", resImperfect.errors);
  failed++;
}

// Summary
console.log(`\n========================================`);
console.log(`RÉSULTAT DU BANC D'ESSAIS : ${passed} passés avec succès sur ${passed + failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
