import { callLLMJson, hasLLMKey } from "./llm";
import { parseBoltProject, serializeBoltProject } from "./bolt-parser";
import { transformAsync } from "@babel/core";
import { detectDomainFromPrompt } from "./design-directions";

/**
 * Moteur React SokoAI basé sur le format <boltArtifact> / <boltAction> de bolt.diy
 * et exécuté dans WebContainers (Vite + React + Tailwind).
 */

export interface ReactProjectFile {
  path: string;
  content: string;
}

export interface ReactProjectMeta {
  storeName: string;
  slug: string;
  whatsapp: string;
  city: string;
}

export interface ReactProjectResult {
  files: ReactProjectFile[];
  meta: ReactProjectMeta;
}

export interface ReactVariant extends ReactProjectResult {
  id: string;
  label: string;
  description: string;
}

const REACT_MASTER_PROMPT = `Tu es un Architecte Front-End Senior et Directeur Artistique de "SokoAI — le Lovable de l'e-commerce africain", propulsé par le moteur bolt.diy + WebContainers (Vite + React).
Tu écris un VRAI PROJET REACT multi-fichiers sur-mesure pour un commerçant africain, comme une agence web de prestige. Chaque projet est UNIQUE.

MISSION : produire une boutique e-commerce React complète avec 4 pages (Accueil, Boutique, Notre histoire, Contact), catalogue, fiches produit, filtres et commande WhatsApp.

<artifact_info>
Tu réponds UNIQUEMENT avec UN SEUL bloc XML <boltArtifact> contenant des balises <boltAction type="file" filePath="..."> pour chaque fichier du projet.
Aucun texte avant ou après </boltArtifact>, aucun bloc markdown \`\`\`.

Format EXACT exigé :
<boltArtifact id="soko-store" title="Nom de la Boutique" whatsapp="2250700000000" city="Ville">
  <boltAction type="file" filePath="src/theme.js">
...code...
  </boltAction>
  <boltAction type="file" filePath="src/data/products.js">
...code...
  </boltAction>
  <boltAction type="file" filePath="src/components/Navbar.jsx">
...code...
  </boltAction>
</boltArtifact>
</artifact_info>

CONVENTION D'ÉCRITURE DES FICHIERS REACT (Vite + WebContainers) :
- Écris du code React 18 propre et complet (JAMAIS de code tronqué avec "// ... rest of code").
- En haut de chaque composant : \`const { useState, useEffect, useMemo, useRef } = React;\` (et tu peux exporter tes composants avec \`export const Nom = ...\` ou \`export default Nom\`).
- Fichiers EXIGÉS dans le <boltArtifact>, dans cet ordre :
  1. <boltAction type="file" filePath="src/theme.js">
     Définit \`window.SOKO_THEME = { theme: { extend: { colors: {...palettedelaboutique}, fontFamily: {...}, borderRadius: {...} } } };\` et \`window.SOKO_FONTS = "Familles+Google+Fonts:weights|Separées+par+pipe";\`
  2. <boltAction type="file" filePath="src/data/products.js">
     Définit \`const PRODUCTS = [ ... au moins 10 produits réalistes { id, name, description (2-3 phrases riches), price (nombre FCFA), category, image (URL Unsplash principale, différente par produit, format https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=800&q=80), photos: [image + 2 AUTRES URLs Unsplash du même univers], details: [{clé:"Matériaux", valeur:…}, {clé:"Dimensions",…}, {clé:"Origine",…}, {clé:"Entretien",…}] (4 paires minimum), badge? } ];\`
     et \`const STORE = { name, tagline, city, whatsapp, horaires, zonesLivraison, moyensPaiement: ["Wave","Orange Money","MTN MoMo","Paiement à la livraison"] };\`
  3. <boltAction type="file" filePath="src/components/Navbar.jsx">
     \`const Navbar = () => (...)\` (liens #/accueil #/boutique #/histoire #/contact + bouton Commander WhatsApp + menu burger mobile)
  4. <boltAction type="file" filePath="src/components/Hero.jsx">
     \`const Hero = () => (...)\` (spectaculaire, image plein cadre, CTA)
  5. <boltAction type="file" filePath="src/components/ProductCard.jsx">
     \`const ProductCard = ({ product, onOpen }) => (...)\` (photo, nom, prix FCFA, badge, boutons Voir + Commander → https://wa.me/STORE.whatsapp?text=produit+prix)
  6. <boltAction type="file" filePath="src/components/ProductGrid.jsx">
     \`const ProductGrid = () => (...)\` (filtres par catégorie + MODALE FICHE PRODUIT COMPLÈTE en overlay : fermeture via croix / touche Échap / clic sur le fond ; layout grid 2 colonnes — GAUCHE : grande image changeable via 3 vignettes cliquables (product.photos, useState index) ; DROITE : catégorie uppercase, titre, gros prix, description complète (2-3 phrases), puis TOUJOURS un bloc « Détails » OBLIGATOIRE : les 4+ caractéristiques product.details en lignes clé/valeur séparées par de fins filets, sélecteur de quantité avec boutons -/+ (min 1), badge, réassurance (livraison 24h + moyens de paiement) avec pictos SVG, CTA « Commander sur WhatsApp » pleine largeur pré-rempli avec le nom du produit, la quantité et le prix TOTAL (price × quantité), + lien ghost « Poser une question » en dessous)
  7. <boltAction type="file" filePath="src/components/Sections.jsx">
     \`const SignatureSection / HistoirePage / ContactPage = ...\` (toutes les autres sections/pages)
  8. <boltAction type="file" filePath="src/components/Footer.jsx">
     \`const Footer = () => (...)\` (4 colonnes : marque+slogan, navigation, contact complet WhatsApp/téléphone/ville/horaires/e-mail, services avec badges paiement ; barre finale © année)
  9. <boltAction type="file" filePath="src/App.jsx">
     \`function App() { ... }\` avec ROUTEUR PAR HASH obligatoire : \`const [page, setPage] = useState((location.hash.replace(/^#\\/?/, '') || 'accueil').split('?')[0]);\` + \`useEffect(() => { const go = () => setPage((location.hash.replace(/^#\\/?/, '') || 'accueil').split('?')[0]); window.addEventListener('hashchange', go); go(); return () => window.removeEventListener('hashchange', go); }, []);\` puis rend \`<Navbar/><main>\` 4 pages selon page (accueil → Hero+ProductGrid+section signature ; boutique → boutique ; histoire → histoire ; contact → contact) \`</main><Footer/>\` et finit par \`window.__APP__ = App; export default App;\`
- Toutes les valeurs textuelles en FRANÇAIS chaleureux (vouvoiement), devise FCFA sans centimes.
- Images Unsplash : URL différente par produit, format https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=800&q=80
- Si une info manque (horaires, adresse), invente une valeur cohérente pour un commerçant local — JAMAIS de lorem/XXX.

QUALITÉ & EXCELLENCE VISUELLE (référentiels ui-ux-pro-max + skill apple-design OBLIGATOIRES) :
- Icônes : SVG inline UNIQUEMENT — JAMAIS d'emoji en guise d'icône.
- Mobile-first : styles de base = mobile puis md:/lg:/xl: (testé 375/768/1024/1440, aucun défilement horizontal, pas de largeur fixe en px).
- Réponse tactile Apple (§1 & §10 apple-design) : zones cliquables ≥ 44×44px, espacement ≥ 8px, cursor-pointer partout + feedback instantané dès le press/touch-down via \`active:scale-[0.97] transition-transform duration-100 ease-out\` sur tous les boutons, cartes, filtres et miniatures.
- Matériaux translucides & Profondeur (§12 apple-design) :
  - Navbar sticky construite comme un matériau translucide (\`backdrop-blur-xl backdrop-saturate-[180%] bg-opacity-80\`) avec filet subtil (\`border-b border-white/10\` ou \`border-black/5\`) et contenu qui défile dessous.
  - "Dim to focus" sur la modale fiche produit : scrim d'arrière-plan \`bg-black/60 backdrop-blur-sm\`, surface de carte nette avec ombre profonde et fermeture fluide (croix ≥ 44px, clic scrim, touche Escape). Ne jamais empiler deux surfaces translucides claires l'une sur l'autre.
- Typographie optique Apple (§15 apple-design) :
  - Tracking (letter-spacing) spécifique à la taille : négatif sur les grands titres Hero/Display (\`tracking-[-0.025em]\` ou \`tracking-tight\`), neutre sur le texte courant (\`tracking-normal\`), positif sur les petits badges/surtitres uppercase (\`tracking-[0.12em]\`).
  - Leading (line-height) inversement proportionnel à la taille : serré sur les grands titres (\`leading-[1.06]\` à \`leading-[1.12]\`), confortable sur le corps (\`leading-[1.6]\`).
  - Tous les prix FCFA et compteurs de quantité utilisent \`tabular-nums\` pour un alignement optique parfait lors du recalcul \`price * quantite\`.
- Fondations Apple Design (§16 — Simplicity, Craft, Grouping, Wayfinding) :
  - Wayfinding clair : la page active (\`accueil\`, \`boutique\`, \`histoire\`, \`contact\`) a toujours un indicateur visuel net dans la Navbar.
  - Grouping & Mapping : dans la modale produit, le sélecteur de quantité (\`-\` / \`+\`) est placé immédiatement à côté du CTA « Commander sur WhatsApp » et met à jour le prix total FCFA en temps réel dans le bouton et dans le lien \`wa.me\`.
- Contraste texte ≥ 4.5:1 (texte sur image = overlay sombre/clair + taille généreuse) ; focus visible pour la navigation clavier.
- Tokens sémantiques dans SOKO_THEME : colors { primary, onPrimary, secondary, accent, background, foreground, card, cardForeground, muted, mutedForeground, border, destructive, ring } — jamais de hex brut éparpillé dans les composants.
- Animations Spring amorties (§4 & §11 apple-design) : transitions fluides type ressort amorti (\`cubic-bezier(0.22, 1, 0.36, 1)\`, 250-300ms, sans rebond superflu), uniquement sur \`transform\` et \`opacity\` (jamais width/height, jamais opacity:0 bloquant au repos).
- Prix FCFA en grand, CTA répétés (hero, produit, footer) + bouton WhatsApp flottant permanent.

VARIANTE IMPOSÉE — « {{LABEL}} » :
{{GUIDANCE}}
Obéis STRICTEMENT à cette direction (palette, polices, gabarit du hero, ordre des sections, style des cartes) — c'est ce qui distingue ce projet des autres variantes.`;

const REACT_EDIT_PROMPT = `Tu es un développeur React senior de SokoAI utilisant le protocole <boltArtifact> / <boltAction> de bolt.diy.
On te fournit le projet React actuel sous forme de <boltArtifact> et une demande de modification du commerçant.

RÈGLE D'OR (mise à jour différentielle bolt.diy) :
- Renvoie un <boltArtifact> contenant UNIQUEMENT les <boltAction type="file" filePath="..."> des fichiers que tu crées ou modifies !
- N'inclus PAS les fichiers qui ne changent pas (ils seront conservés automatiquement).
- En revanche, pour chaque fichier que tu modifies, écris son code COMPLET (sans "// ... rest of file").
- Aucun texte autour du <boltArtifact>, aucun bloc markdown.`;

export function parseReactProject(raw: string): { files: ReactProjectFile[]; meta: ReactProjectMeta } {
  const parsed = parseBoltProject(raw);
  return { files: parsed.files, meta: parsed.meta };
}

/** Si le dernier <boltAction> est coupé en fin de génération, on le fait continuer par le LLM. */
async function completeLastFile(raw: string): Promise<string> {
  let text = raw.trim();
  for (let pass = 0; pass < 2; pass++) {
    if (/<\/boltArtifact>\s*$/i.test(text) || /<\/boltAction>\s*$/i.test(text) || /@@ENDFILE\s*$/.test(text)) {
      break;
    }
    const openIdx = Math.max(text.lastIndexOf("<boltAction"), text.lastIndexOf("@@FILE"));
    const lastPath =
      openIdx >= 0
        ? text.slice(openIdx).match(/filePath=["']([^"']+)["']|@@FILE\s+([^\n]+)/)?.[1] || "dernier fichier"
        : "dernier fichier";
    const tail = text.slice(-1800);
    try {
      const more = await callLLMJson<string>({
        system: `Tu continues un fichier de code React coupé en plein milieu dans un <boltAction>. On te donne la fin du texte ; reprends EXACTEMENT là où ça s'arrête, sans rien répéter, et termine par </boltAction></boltArtifact>.`,
        user: `Fichier concerné : ${lastPath}\nFin du texte (le code reprend DIRECTEMENT après) :\n\`\`\`\n${tail}\n\`\`\``,
        temperature: 0.5,
        json: false,
      });
      if (typeof more !== "string" || !more.trim()) break;
      const frag = more.trim().replace(/^```(js|jsx|xml)?\s*/i, "").replace(/```$/g, "");
      text += frag;
      if (!/<\/boltAction>/i.test(frag)) text += "\n</boltAction>\n</boltArtifact>";
    } catch {
      break;
    }
  }
  return text;
}

/** Nettoie les artefacts DeepSeek (<｜DSML｜>…) et les appels ReactDOM.createRoot parasites. */
export function cleanReactCode(content: string): string {
  return content
    .replace(/<[^<>]*\uFF5C[^<>]*>/g, "")
    .replace(/<>/g, "<React.Fragment>")
    .replace(/<\/>/g, "</React.Fragment>")
    // Supprimer tout montage ReactDOM (createRoot ou render), sur une ou plusieurs lignes
    .replace(/(?:const\s+\w+\s*=\s*)?(?:window\.)?ReactDOM\s*\.[\s\S]*?(?:\.render\s*\([\s\S]*?\))?\s*;?/g, (match) => {
      if (match.includes("createRoot") || match.includes("render")) return "";
      return match;
    })
    .replace(/ReactDOMClient\s*\.\s*createRoot[\s\S]*?;/g, "")
    .trim();
}

/** Version sans import/export utilisée uniquement pour le validateur Babel rapide. */
function stripModuleSyntaxForValidation(content: string): string {
  return content
    .replace(/^\s*import\b[^\n]*$/gm, "")
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, "")
    .replace(/^\s*export\s+/gm, "")
    .replace(/export default/g, "");
}

const REQUIRED_FILES = ["src/App.jsx", "src/components/Footer.jsx"];

function findUndefinedComponents(files: ReactProjectFile[]): string[] {
  const defined = new Set<string>();
  const used = new Set<string>();
  for (const f of files) {
    for (const m of f.content.matchAll(/(?:function|const|var|let)\s+([A-Z]\w+)/g)) defined.add(m[1]);
    for (const m of f.content.matchAll(/<([A-Z]\w+)[\s/>]/g)) used.add(m[1]);
  }
  const globals = new Set(["React", "Fragment", "StrictMode"]);
  return [...used].filter((name) => !defined.has(name) && !globals.has(name));
}

async function ensureCoreFiles(
  files: ReactProjectFile[],
  meta: ReactProjectMeta,
  variantLabel?: string
): Promise<ReactProjectFile[]> {
  const cleaned = files.map((f) => ({ path: f.path, content: cleanReactCode(f.content) }));
  const missing = REQUIRED_FILES.filter((req) => !cleaned.some((f) => f.path === req));
  const undefinedComponents = findUndefinedComponents(cleaned);
  const appFile = cleaned.find((f) => f.path === "src/App.jsx");
  const routerMissing = !appFile || !/hashchange/.test(appFile.content);

  if (missing.length === 0 && undefinedComponents.length === 0 && !routerMissing) return cleaned;

  for (let pass = 0; pass < 3; pass++) {
    const missing = REQUIRED_FILES.filter((req) => !cleaned.some((f) => f.path === req));
    const undefinedComponents = findUndefinedComponents(cleaned);
    const appFile = cleaned.find((f) => f.path === "src/App.jsx");
    const routerMissing = !appFile || !/hashchange/.test(appFile.content);
    const compileError =
      missing.length === 0 && undefinedComponents.length === 0 && !routerMissing
        ? await tryCompile(cleaned)
        : null;

    if (missing.length === 0 && undefinedComponents.length === 0 && !routerMissing && !compileError) break;

    const todo: string[] = [];
    if (missing.length) todo.push(`Fichiers à créer : ${missing.join(", ")}`);
    if (undefinedComponents.length)
      todo.push(
        `Composants utilisés dans le JSX mais NON DÉFINIS nulle part (à créer dans src/components/Sections.jsx ou dans le fichier qui les utilise) : ${undefinedComponents.join(", ")}`
      );
    if (routerMissing)
      todo.push(
        "src/App.jsx n'a PAS de routeur hash fonctionnel : réécris-le avec const [page, setPage] = useState(...) + un useEffect qui écoute window 'hashchange' et rend les 4 pages (accueil/boutique/histoire/contact)."
      );
    if (compileError)
      todo.push(`ERREUR DE COMPILATION JSX à corriger :\n${compileError}`);

    try {
      const raw = await callLLMJson<string>({
        system: `Tu répares un projet React de boutique SokoAI au format <boltArtifact> / <boltAction type="file" filePath="...">.
Renvoie UNIQUEMENT un <boltArtifact> contenant les <boltAction type="file" filePath="..."> des fichiers que tu crées ou corriges (contenu complet du fichier). Aucun texte autour.`,
        user: `${variantLabel ? `Direction artistique : ${variantLabel}\n\n` : ""}Projet actuel :\n${serializeBoltProject(cleaned, meta)}\n\nRÉPARATIONS DEMANDÉES :\n${todo.join("\n")}`,
        temperature: 0.5,
        json: false,
      });
      const completed = parseReactProject(typeof raw === "string" ? raw : "");
      for (const f of completed.files) {
        const cleanedExtra = { path: f.path, content: cleanReactCode(f.content) };
        const idx = cleaned.findIndex((x) => x.path === cleanedExtra.path);
        if (idx >= 0) cleaned[idx] = cleanedExtra;
        else cleaned.push(cleanedExtra);
      }
    } catch {
      break;
    }
  }
  return cleaned;
}

async function tryCompile(files: ReactProjectFile[]): Promise<string | null> {
  const bundle = files
    .map(
      (f) =>
        `/* ===== ${f.path} ===== */\n${stripModuleSyntaxForValidation(f.content).replace(/\b(const|let)\s/g, "var ")}`
    )
    .join("\n\n");
  try {
    await transformAsync(bundle, {
      filename: "bundle.jsx",
      babelrc: false,
      configFile: false,
      presets: [["@babel/preset-react", { runtime: "classic" }]],
    });
    return null;
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${(e as { codeFrame?: string }).codeFrame || ""}` : String(e);
    return msg.slice(0, 900);
  }
}

export async function generateReactProject(
  prompt: string,
  options?: {
    whatsapp?: string;
    storeName?: string;
    city?: string;
    notes?: string;
    variant?: { id: string; label: string; description: string; guidance: string };
  }
): Promise<ReactProjectResult> {
  if (!hasLLMKey()) throw new Error("Aucune clé LLM configurée");

  let system = REACT_MASTER_PROMPT;
  if (options?.variant) {
    system = system
      .replace("{{LABEL}}", options.variant.label)
      .replace("{{GUIDANCE}}", options.variant.guidance);
  } else {
    system = system.replace(/VARIANTE IMPOSÉE[\s\S]*$/, "");
  }

  const userParts: string[] = [`Besoin du commerçant : "${prompt}"`];
  if (options?.storeName) userParts.push(`Nom de la boutique : ${options.storeName}`);
  if (options?.whatsapp) userParts.push(`Numéro WhatsApp du commerçant (liens wa.me) : ${options.whatsapp}`);
  if (options?.city) userParts.push(`Ville de vente/livraison : ${options.city}`);
  if (options?.notes) userParts.push(`Détails complémentaires :\n${options.notes}`);

  const raw = await callLLMJson<string>({
    system,
    user: userParts.join("\n"),
    temperature: options?.variant ? 1.0 : 0.85,
    json: false,
  });

  const completed = await completeLastFile(typeof raw === "string" ? raw : "");
  const { files, meta } = parseReactProject(completed);
  const finalFiles = await ensureCoreFiles(files, meta, options?.variant?.label);
  if (finalFiles.length < 5) throw new Error("Le projet React généré est incomplet");
  return { files: finalFiles, meta };
}

export interface VariantDirectionConfig {
  id: string;
  label: string;
  description: string;
  guidance: string;
}

export function getSectorVariantDirections(
  prompt: string,
  notes?: string
): VariantDirectionConfig[] {
  const combined = `${prompt} ${notes || ""}`.toLowerCase();
  const { sector } = detectDomainFromPrompt(combined);

  if (sector === "food") {
    return [
      {
        id: "A",
        label: "Street Food & Express",
        description: "Énergique et gourmand : faim visuelle, commande express en 20 min, braise croustillante et piments frais.",
        guidance:
          "ARCHÉTYPE : Street Food Dynamique & Commande Express.\n" +
          "- Palette : Fond crème chaud #FFFDF7, encre noire braisée #18181B, accent orange feu #EA580C et rouge piment #DC2626, surface carte blanche avec filet fin #FEE2E2.\n" +
          "- Polices : Outfit (titres percutants, arrondis et gourmands) + Plus Jakarta Sans (texte fluide et lisible).\n" +
          "- ARCHITECTURE DU HERO (Split Screen) : col-span-7 texte + col-span-5 image. Titre imposant avec mot-clé en accent orange, badge animé « 🔥 Préparé à la minute & chaud », engagement « Livraison en 25 min chrono », gros bouton WhatsApp « Commander maintenant » avec icône SVG.\n" +
          "- CARTES DU CATALOGUE : Photos de plats cadrées serré et très appétissantes, badges pimentés ou bestsellers, sélecteur d'accompagnements (alloco, piment, oignons) et CTA rapide.\n" +
          "- SECTIONS : Bandeau défilant des spécialités chaudes, réassurance hygiène et paiement Wave/OM, section Ambiance du Maquis avec photos de braise.",
      },
      {
        id: "B",
        label: "Maquis & Tradition",
        description: "Ambiance authentique, bois d'ébène et braise : le goût du pays et l'histoire des recettes ancestrales.",
        guidance:
          "ARCHÉTYPE : Maquis Chic & Tradition Chaleureuse.\n" +
          "- Palette : Fond sable chaud #FAF5EE, ébène profond #1C1917, accent ambre doré #D97706, touches terracotta #B45309.\n" +
          "- Polices : Playfair Display (titres nobles et traditionnels) + Inter (texte aéré).\n" +
          "- ARCHITECTURE DU HERO (Plein Écran Immersif) : Photographie de maquis chic et braise rougeoyante en arrière-plan avec overlay sombre doux, grand titre centré serif doré et sous-titre contant le secret des recettes familiales.\n" +
          "- CARTES DU CATALOGUE : Fiches menu façon carte de restaurant traditionnel avec numérotation, description détaillée des ingrédients frais du marché local, et bouton WhatsApp personnalisé.\n" +
          "- SECTIONS : L'Histoire du Chef (storytelling chaleureux), grille des boissons locales fraîches (Bissap, Gnamakoudji), avis clients ravis.",
      },
      {
        id: "C",
        label: "Fast Casual Moderne",
        description: "Design contemporain épuré, bento grid de plats signatures, clarté et fraîcheur.",
        guidance:
          "ARCHÉTYPE : Fast Casual Moderne & Épuré.\n" +
          "- Palette : Fond blanc pur #FFFFFF, encre ardoise #0F172A, accent vert menthe fraîche #059669 et jaune mangue #F59E0B.\n" +
          "- Polices : Syne (titres modernes avant-gardistes) + Manrope (texte épuré).\n" +
          "- ARCHITECTURE DU HERO (Bento Grid) : 3 blocs asymétriques : 1 plat vedette avec photo lumineuse, 1 bloc statistiques (« +800 plats servis cette semaine »), 1 bloc commande groupée ou livraison bureau.\n" +
          "- CARTES DU CATALOGUE : Cartes bento aux coins généreusement arrondis (rounded-2xl), bordure subtile, photo nette et bouton « Ajouter » instantané.\n" +
          "- SECTIONS : Formules midi, pack famille/amis, FAQ claire et footer moderne 4 colonnes.",
      },
    ];
  }

  if (sector === "tech") {
    return [
      {
        id: "A",
        label: "Cyber Dark & Pro",
        description: "Ambiance high-tech sombre OLED, reflets bleutés, fiches techniques précises et garantie certifiée.",
        guidance:
          "ARCHÉTYPE : Cyber Dark High-Tech.\n" +
          "- Palette : Fond noir OLED #090A0F, surfaces sombres #12141C, bordures #1E2330, accent bleu cyber #2563EB et cyan néon #06B6D4, texte blanc éclatant.\n" +
          "- Polices : Space Grotesk (titres futuristes) + Inter (corps technique ultra-lisible).\n" +
          "- ARCHITECTURE DU HERO (Bento High-Tech) : Produit star mis en valeur sur fond sombre, badge « Garantie 12 Mois & Facture Réelle », indicateur de stock en temps réel et CTA lumineux.\n" +
          "- CARTES DU CATALOGUE : Fiches produits avec tags de specs (Capacité GO, État de la batterie, Processeur), prix barré avec calcul de remise en FCFA, et commande WhatsApp directe.\n" +
          "- SECTIONS : Tableau comparatif, engagement pièces d'origine scellées, livraison sécurisée avec vérification sur place.",
      },
      {
        id: "B",
        label: "Studio Minimaliste",
        description: "Inspiration Apple Store : blanc pur, contrastes doux, grands visuels studio et clarté absolue.",
        guidance:
          "ARCHÉTYPE : Studio Apple-Style Épuré.\n" +
          "- Palette : Fond blanc studio #FAFAFA, surfaces blanches pures, encre #1D1D1F, gris titane #86868B, accent bleu cobalt #0071E3.\n" +
          "- Polices : Plus Jakarta Sans (titres précis) + Inter (texte fluide).\n" +
          "- ARCHITECTURE DU HERO (Centré Minimaliste) : Grand visuel studio épuré, typographie sobre mais monumentale, micro-surtitre uppercase et boutons pill subtils.\n" +
          "- CARTES DU CATALOGUE : Cartes aérées sans bordure avec ombre d'élévation douce (shadow-sm hover:shadow-md), vignettes cliquables et modale technique complète.\n" +
          "- SECTIONS : Grille d'accessoires compatibles, réassurance SAV réactif sous 2h, service client dédié.",
      },
      {
        id: "C",
        label: "Deals & Offres Flash",
        description: "Look dynamique avec bannières promotions, compteurs d'urgence et offres immanquables.",
        guidance:
          "ARCHÉTYPE : Flash Deals & Arrivages Immédiats.\n" +
          "- Palette : Fond noir profond #0C0C0E, surfaces contrastées, accent jaune électrique #FACC15 et rouge alerte #EF4444.\n" +
          "- Polices : Syne (titres percutants) + DM Sans (texte punchy).\n" +
          "- ARCHITECTURE DU HERO : Marquee animée des nouveaux arrivages, hero énergique avec badge « Vente Flash du Moment », décompte de pièces disponibles et bouton WhatsApp d'achat immédiat.\n" +
          "- CARTES DU CATALOGUE : Badges de remise bien visibles (« -20% », « Arrivage Dubaï »), étiquette de prix en grand, bouton « Bloquer mon appareil ».\n" +
          "- SECTIONS : Arrivages de la semaine, pack chargeur + coque offerts, témoignages clients avec photos réelles.",
      },
    ];
  }

  if (sector === "beaute") {
    return [
      {
        id: "A",
        label: "Botanique & Nature",
        description: "Beauté bio et végétale : vert sauge, beurre de karité pur, douceur et rituel bien-être.",
        guidance:
          "ARCHÉTYPE : Beauté Botanique & Soins Purs.\n" +
          "- Palette : Fond lin ivoire #FAF8F5, vert sauge noble #2D4F3E, accent miel doré #D4A373, texte vert forêt sombre #1A2E24.\n" +
          "- Polices : Cormorant Garamond (titres nobles et poétiques) + Jost (texte moderne et fin).\n" +
          "- ARCHITECTURE DU HERO (Hero Split) : Photo naturelle d'ingrédients bruts (karité, aloé, huiles précieuses), badge « 100% Naturel & Artisanal », rituel de soin en 3 étapes.\n" +
          "- CARTES DU CATALOGUE : Fiches cosmétiques aérées, liste des bienfaits pour la peau et les cheveux, conseils d'utilisation matin/soir.\n" +
          "- SECTIONS : Le rituel beauté étape par étape, avis avant/après, engagement zéro produit chimique nocif.",
      },
      {
        id: "B",
        label: "Luxe & Parfumerie",
        description: "Ambiance boudoir privé : noir velours, ivoire poudré, reflets dorés et flacons précieux.",
        guidance:
          "ARCHÉTYPE : Parfumerie & Cosmétique de Prestige.\n" +
          "- Palette : Fond noir velours #101014, surfaces carbone douces, accent or champagne #D1B48C, crème poudré #F9F7F1.\n" +
          "- Polices : Bodoni Moda (titres majestueux) + Montserrat (texte raffiné).\n" +
          "- ARCHITECTURE DU HERO (Plein Écran) : Grand visuel clair-obscur, typographie dorée étincelante, sous-titre d'exception et CTA or brossé.\n" +
          "- CARTES DU CATALOGUE : Cartes d'art sans fioritures, photos travaillées en studio, notes olfactives (tête, cœur, fond) et écrin cadeau inclus.\n" +
          "- SECTIONS : Collection privée, personnalisation du flacon, livraison soignée en coffret scellé.",
      },
      {
        id: "C",
        label: "Dermo Fraîcheur & Éclat",
        description: "Clarté clinique et fraîcheur : fond blanc éclatant, nuances pêche et transparence des résultats.",
        guidance:
          "ARCHÉTYPE : Dermo-Cosmétique & Glow Éclat.\n" +
          "- Palette : Fond blanc éclatant #FFFFFF, surfaces blanc glacier, nuances pêche douce #FFF1EE, accent corail lumineux #F43F5E.\n" +
          "- Polices : Plus Jakarta Sans (titres frais et nets) + Inter.\n" +
          "- ARCHITECTURE DU HERO (Bento Grid Éclat) : Produit star, badge « Teint Zéro Défaut & Glow », bouton diagnostic personnalisé sur WhatsApp.\n" +
          "- CARTES DU CATALOGUE : Cartes modernes avec avant/après, type de peau adapté (grasse, sèche, sensible) et sélection de pack routine complète.\n" +
          "- SECTIONS : Quiz de routine rapide, résultats cliniques en chiffres, FAQ dermo.",
      },
    ];
  }

  if (sector === "mode" || sector === "luxe") {
    return [
      {
        id: "A",
        label: "Lookbook Éditorial",
        description: "Inspiration magazine Vogue : typographie serif prestigieuse, noir profond et or, grilles asymétriques.",
        guidance:
          "ARCHÉTYPE : Lookbook Éditorial Haute Couture.\n" +
          "- Palette : Fond noir nuit #0E0E10, lin soyeux #F7F3EC, accent or brossé #C8A24B, bordures subtiles #26262B.\n" +
          "- Polices : Playfair Display (titres grands formats, italiques artistiques) + Inter (texte moderne).\n" +
          "- ARCHITECTURE DU HERO (Plein Écran) : Mannequin en situation, typographie majestueuse en superposition douce, surtitre uppercase espacé et CTA chic.\n" +
          "- CARTES DU CATALOGUE : Grille asymétrique sans bordures (grandes photos 3:4), zoom soigné au survol, étiquettes de matières nobles (cuir pleine fleur, soie, finitions couturier).\n" +
          "- SECTIONS : L'Édito de la Saison, guide d'entretien des pièces, commande sur-mesure WhatsApp.",
      },
      {
        id: "B",
        label: "Streetwear Avant-Garde",
        description: "Style brut, typographie géante, contrastes vifs, bannières animées et énergie urbaine.",
        guidance:
          "ARCHÉTYPE : Streetwear Avant-Garde & Brutaliste.\n" +
          "- Palette : Fond papier d'atelier #F5F5F0, encre noire carbone #111111, accent orange vif #FF4D1C ou vert acide, bordures franches 1.5px.\n" +
          "- Polices : Syne (titres massifs 700/800) + Manrope (texte compact et net).\n" +
          "- ARCHITECTURE DU HERO : Marquee défilante en haut, Hero Split avec grande typographie débordante, badge « Drop Limité 50 Ex. », bouton pill inversé.\n" +
          "- CARTES DU CATALOGUE : Cartes avec bordure nette 1px noire, pastilles de tailles disponibles (S, M, L, XL / 40-45), prix bien contrasté.\n" +
          "- SECTIONS : Arrivages de sneakers/sape, manifesto de la marque, galerie Instagram communautaire.",
      },
      {
        id: "C",
        label: "Solaire & Héritage",
        description: "Mise en valeur du patrimoine africain : pagnes wax et bazin, teintes terreuses et élégance intemporelle.",
        guidance:
          "ARCHÉTYPE : Héritage Solaire & Tissus Nobles.\n" +
          "- Palette : Fond sable doré #FAF6F0, indigo noble #1E293B, accent terracotta chaleureux #C25E34, or mat #D97706.\n" +
          "- Polices : Cabinet Grotesk ou Fraunces (titres expressifs) + Plus Jakarta Sans.\n" +
          "- ARCHITECTURE DU HERO : Hero aéré mettant en valeur la richesse des étoffes, les motifs et la texture des tissages traditionnels.\n" +
          "- CARTES DU CATALOGUE : Cartes élégantes avec origine du tissu (Pagne Baoulé, Bazin riche, Wax hollandais), coupe sur-mesure et bouton commande directe.\n" +
          "- SECTIONS : Les secrets de confection de l'atelier, guide des tailles locales, livraison partout en Côte d'Ivoire et diaspora.",
      },
    ];
  }

  // Artisanat, Décoration ou Commerce Général
  return [
    {
      id: "A",
      label: "Élégance & Prestige",
      description: "Ambiance soignée et noble : typographie raffinée, contrastes équilibrés et mise en valeur haut de gamme.",
      guidance:
        "ARCHÉTYPE : Maison de Prestige & Raffinement.\n" +
        "- Palette : Fond blanc ivoire #FBF9F5, encre ardoise sombre #1A1A1E, accent bronze doré #B8860B, surfaces cartes pures.\n" +
        "- Polices : Playfair Display (titres) + Inter (corps).\n" +
        "- ARCHITECTURE DU HERO (Split Screen) : Équilibré avec photographie soignée, badge de réassurance « Qualité Certifiée », bouton WhatsApp élégant.\n" +
        "- CARTES DU CATALOGUE : Fiches soignées avec fiches matières, détails d'authenticité et bouton de commande rapide.\n" +
        "- SECTIONS : L'esprit de la maison, avis clients vérifiés, engagements de service.",
    },
    {
      id: "B",
      label: "Moderne & Audacieux",
      description: "Design contemporain percutant : bento grid, contrastes énergiques et expérience rythmée.",
      guidance:
        "ARCHÉTYPE : Bento Dynamique Contemporain.\n" +
        "- Palette : Fond papier clair #F6F5F2, noir pur #101010, accent signature coquelicot #FF4D1C ou bleu roi #2563EB.\n" +
        "- Polices : Syne (titres) + Manrope (texte).\n" +
        "- ARCHITECTURE DU HERO (Bento Grid) : Asymétrique avec 3 blocs informatifs (produit vedette, stat clé, offre du jour).\n" +
        "- CARTES DU CATALOGUE : Cartes nettes avec bordure 1px, badges de réductions contrastés, commande en 1 clic.\n" +
        "- SECTIONS : Nouveautés en vedette, FAQ rapide, réassurance livraison express.",
    },
    {
      id: "C",
      label: "Doux & Épuré",
      description: "Minimalisme chaleureux : matières naturelles, grand confort de lecture et sérénité visuelle.",
      guidance:
        "ARCHÉTYPE : Minimalisme Chaleureux & Zen.\n" +
        "- Palette : Fond lin doux #F8F5F0, encre profonde #221F1B, accent terracotta doux #A85B32, bordures hairlines légères.\n" +
        "- Polices : Bodoni Moda (titres) + Jost (texte).\n" +
        "- ARCHITECTURE DU HERO (Minimal Aéré) : Grand espace blanc, visuel délicat, typographie monumentale tout en finesse.\n" +
        "- CARTES DU CATALOGUE : Cartes sans ombre avec numérotation discrète (01, 02…), présentation épurée du produit.\n" +
        "- SECTIONS : La promesse de marque, conseils personnalisés, service client WhatsApp attentionné.",
    },
  ];
}

export const REACT_VARIANT_DIRECTIONS = getSectorVariantDirections("Boutique mode et luxe");

export async function generateReactProjectVariants(
  prompt: string,
  options?: { whatsapp?: string; storeName?: string; city?: string; notes?: string }
): Promise<{ variants: ReactVariant[]; failed: string[] }> {
  const directions = getSectorVariantDirections(prompt, options?.notes);

  const results = await Promise.allSettled(
    directions.map((direction) =>
      generateReactProject(prompt, { ...options, variant: direction })
    )
  );

  const variants: ReactVariant[] = [];
  const failed: string[] = [];
  results.forEach((res, i) => {
    const direction = directions[i];
    if (res.status === "fulfilled") {
      variants.push({ ...direction, ...res.value });
    } else {
      failed.push(`${direction.label}: ${res.reason instanceof Error ? res.reason.message : "erreur"}`);
    }
  });

  if (variants.length === 0) throw new Error(failed[0] || "Aucune variante n'a pu être générée");
  return { variants, failed };
}

/**
 * Mise à jour différentielle inspirée de bolt.diy :
 * Le LLM ne renvoie que les <boltAction type="file"> modifiés, qu'on fusionne avec l'arborescence existante.
 */
export async function editReactProject(
  files: ReactProjectFile[],
  meta: ReactProjectMeta,
  instruction: string
): Promise<ReactProjectResult & { updatedPaths: string[] }> {
  if (!hasLLMKey()) throw new Error("Aucune clé LLM configurée");

  const projectXml = serializeBoltProject(files, meta);

  const raw = await callLLMJson<string>({
    system: REACT_EDIT_PROMPT,
    user: `=== PROJET ACTUEL ===\n${projectXml}\n=== FIN ===\n\nDemande du commerçant : "${instruction}"`,
    temperature: 0.5,
    json: false,
  });

  const completed = await completeLastFile(typeof raw === "string" ? raw : "");
  const patch = parseReactProject(completed);
  if (patch.files.length === 0) {
    throw new Error("Aucun fichier modifié n'a été retourné par l'IA");
  }

  // Fusionner les fichiers modifiés (style ActionRunner de bolt.diy) avec les fichiers existants
  const mergedFiles = [...files];
  const updatedPaths: string[] = [];

  for (const updatedFile of patch.files) {
    const cleanedFile = {
      path: updatedFile.path,
      content: cleanReactCode(updatedFile.content),
    };
    updatedPaths.push(cleanedFile.path);
    const existingIndex = mergedFiles.findIndex((f) => f.path === cleanedFile.path);
    if (existingIndex >= 0) {
      mergedFiles[existingIndex] = cleanedFile;
    } else {
      mergedFiles.push(cleanedFile);
    }
  }

  const finalFiles = await ensureCoreFiles(mergedFiles, meta);
  return {
    files: finalFiles,
    meta: {
      ...meta,
      storeName: patch.meta.storeName !== "Ma Boutique" ? patch.meta.storeName : meta.storeName,
    },
    updatedPaths,
  };
}
