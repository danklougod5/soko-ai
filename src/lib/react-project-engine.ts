import { callLLMJson, hasLLMKey } from "./llm";
import { slugify } from "./store-brief";
import { transformAsync } from "@babel/core";

/**
 * Moteur "vrai projet React" à la Lovable : l'IA écrit une arborescence
 * multi-fichiers (data, theme, composants, pages) dans un sous-ensemble
 * React sans bundler, exécuté par le shell (React 18 UMD + Babel).
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

const REACT_MASTER_PROMPT = `Tu es un Architecte Front-End Senior et Directeur Artistique de "SokoAI — le Lovable de l'e-commerce africain". Tu écris un VRAI PROJET REACT multi-fichiers sur-mesure pour un commerçant africain, comme une agence web de prestige. Chaque projet est UNIQUE.

MISSION : produire une boutique e-commerce React complète avec 4 pages (Accueil, Boutique, Notre histoire, Contact), catalogue, fiches produit, filtres et commande WhatsApp.

FORMAT DE RÉPONSE (RÈGLE ABSOLUE) :
Réponds UNIQUEMENT avec les fichiers, séparés EXACTEMENT ainsi (aucun texte autour, aucun bloc markdown) :
@@META
{"storeName":"nom de la boutique","whatsapp":"numero sans symbole, ex: 2250700000000","city":"ville"}
@@ENDMETA
@@FILE src/theme.js
...code...
@@ENDFILE
@@FILE src/data/products.js
...code...
@@ENDFILE
(etc.)

CONVENTION D'ÉCRITURE (obligatoire — pas de bundler) :
- JSX pur exécuté via Babel avec React 18 global. INTERDIT : import/export, require, JSX fragments <>...</> (utilise <div>), TypeScript.
- En haut de CHAQUE fichier de composant : const { useState, useEffect, useMemo, useRef } = React;
- Fichiers EXIGÉS, dans cet ordre :
  1. @@FILE src/theme.js → window.SOKO_THEME = { theme: { extend: { colors: {...palettedelaboutique}, fontFamily: {...}, borderRadius: {...} } } }; et window.SOKO_FONTS = "Familles+Google+Fonts:weights|Separées+par+pipe";
  2. @@FILE src/data/products.js → const PRODUCTS = [ ... au moins 10 produits réalistes { id, name, description (2-3 phrases riches), price (nombre FCFA), category, image (URL Unsplash principale, différente par produit, format https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=800&q=80), photos: [image + 2 AUTRES URLs Unsplash du même univers], details: [{clé:"Matériaux", valeur:…}, {clé:"Dimensions",…}, {clé:"Âge conseillé",…}, {clé:"Contenu",…}] (4 paires minimum) , badge? } ]; et const STORE = { name, tagline, city, whatsapp, horaires, zonesLivraison, moyensPaiement: ["Wave","Orange Money","MTN MoMo","Paiement à la livraison"] };
  3. @@FILE src/components/Navbar.jsx → const Navbar = () => (...)   (liens #/accueil #/boutique #/histoire #/contact + bouton Commander WhatsApp + menu burger mobile)
  4. @@FILE src/components/Hero.jsx → const Hero = () => (...)       (spectaculaire, image plein cadre, CTA)
  5. @@FILE src/components/ProductCard.jsx → const ProductCard = ({ product, onOpen }) => (...)   (photo, nom, prix FCFA, badge, boutons Voir + Commander → https://wa.me/STORE.whatsapp?text=produit+pris)
  6. @@FILE src/components/ProductGrid.jsx → const ProductGrid = () => (...)  (filtres par catégorie + MODALE FICHE PRODUIT COMPLÈTE en overlay : fermeture via croix / touche Échap / clic sur le fond ; layout grid 2 colonnes — GAUCHE : grande image changeable via 3 vignettes cliquables (product.photos, useState index) ; DROITE : catégorie uppercase, titre, gros prix, description complète (2-3 phrases), puis TOUJOURS un bloc « Détails » OBLIGATOIRE : les 4+ caractéristiques product.details en lignes clé/valeur séparées par de fins filets, sélecteur de quantité avec boutons -/+ (min 1), badge, réassurance (livraison 24h + moyens de paiement) avec pictos SVG, CTA « Commander sur WhatsApp » pleine largeur pré-rempli avec le nom du produit, la quantité et le prix TOTAL (price × quantité), + lien ghost « Poser une question » en dessous)
  7. @@FILE src/components/Sections.jsx → const SignatureSection/HistoirePage/ContactPage = ...  (toutes les autres sections/pages)
  8. @@FILE src/components/Footer.jsx → const Footer = () => (...)   (4 colonnes : marque+slogan, navigation, contact complet WhatsApp/téléphone/ville/horaires/e-mail, services avec badges paiement ; barre finale © année)
  9. @@FILE src/App.jsx → function App() { ROUTEUR PAR HASH obligatoire : const [page, setPage] = useState((location.hash.replace(/^#\\/?/, '') || 'accueil').split('?')[0]); + useEffect(() => { const go = () => setPage((location.hash.replace(/^#\\/?/, '') || 'accueil').split('?')[0]); window.addEventListener('hashchange', go); go(); return () => window.removeEventListener('hashchange', go); }, []); puis rend <Navbar/><main> 4 pages selon page (accueil → Hero+ProductGrid+section signature ; boutique → boutique ; histoire → histoire ; contact → contact) </main><Footer/> et tout clic interne va vers #/accueil #/boutique #/histoire #/contact } window.__APP__ = App;  (cette dernière ligne est OBLIGATOIRE)
- Toutes les valeurs textuelles en FRANÇAIS chaleureux (vouvoiement), devise FCFA sans centimes.
- Images Unsplash : URL différente par produit, format https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=800&q=80
- Si une info manque (horaires, adresse), invente une valeur cohérente pour un commerçant local — JAMAIS de lorem/XXX.

QUALITÉ (référentiel ui-ux-pro-max, OBLIGATOIRE) :
- Icônes : SVG inline UNIQUEMENT — JAMAIS d'emoji en guise d'icône.
- Mobile-first : styles de base = mobile puis md:/lg:/xl: (testé 375/768/1024/1440, aucun défilement horizontal, pas de largeur fixe en px).
- Touch : zones cliquables ≥ 44×44px, espacement ≥ 8px, cursor-pointer partout + hover states 150-300ms.
- Contraste texte ≥ 4.5:1 (texte sur image = overlay sombre/clair + taille généreuse) ; focus visible pour la navigation clavier.
- Tokens sémantiques dans SOKO_THEME : colors { primary, onPrimary, secondary, accent, background, foreground, card, cardForeground, muted, mutedForeground, border, destructive, ring } — jamais de hex brut éparpillé dans les composants.
- Typo : base ≥ 16px, titres ≥ 32px, interligne 1.5, aucun texte < 12px.
- Inputs : attribut inputmode adapté (numérique pour quantités/téléphone).
- Animations : fade-up sur contenu VISIBLE (jamais opacity:0 au repos), 200-300ms, easing doux ; une seule durée cohérente ; animer transform/opacity (jamais width/height).
- Prix FCFA en grand, CTA répétés (hero, produit, footer) + bouton WhatsApp flottant.

VARIANTE IMPOSÉE — « {{LABEL}} » :
{{GUIDANCE}}
Obéis STRICTEMENT à cette direction (palette, polices, gabarit du hero, ordre des sections, style des cartes) — c'est ce qui distingue ce projet des autres variantes.`;

const REACT_EDIT_PROMPT = `Tu es un développeur React senior de SokoAI. On te fournit le PROJET REACT complet (multi-fichiers au format @@FILE/@@ENDFILE) et une demande de modification du commerçant.
Tu renvoies le PROJET COMPLET mis à jour au MÊME FORMAT (@@META, puis tous les @@FILE...@@ENDFILE, même convention sans import/export), en appliquant précisément la demande et en conservant le reste à l'identique.
Aucun texte autour, aucun bloc markdown.`;

/** Concatène et exécute les fichiers React (ordre imposé) via Babel dans le shell. */
export function parseReactProject(raw: string): { files: ReactProjectFile[]; meta: ReactProjectMeta } {
  const text = raw.replace(/```(html|jsx|js|tsx)?\s*/gi, "").replace(/```/g, "");

  const metaMatch = text.match(/@@META\s*([\s\S]*?)\s*@@ENDMETA/);
  let meta: Record<string, string> = {};
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1]) as Record<string, string>;
    } catch {
      meta = {};
    }
  }

  const files: ReactProjectFile[] = [];
  const re = /@@FILE\s+([^\n]+)\n([\s\S]*?)(?:@@ENDFILE|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const path = m[1].trim();
    const content = m[2].trim();
    if (path && content) files.push({ path, content });
  }

  const storeName = meta.storeName || "Ma Boutique";
  const whatsapp = (meta.whatsapp || "").replace(/\D/g, "");
  return {
    files,
    meta: {
      storeName,
      slug: slugify(storeName),
      whatsapp: whatsapp.length >= 8 ? whatsapp : "2250700000000",
      city: meta.city || "Abidjan",
    },
  };
}

/** Si le dernier @@FILE est coupé, on le fait continuer par le LLM (2 passes max). */
async function completeLastFile(raw: string): Promise<string> {
  let text = raw.trim();
  for (let pass = 0; pass < 2; pass++) {
    if (/@@ENDFILE\s*$/.test(text) || /<\/html>/i.test(text)) break;
    const openIdx = text.lastIndexOf("@@FILE");
    const lastPath = openIdx >= 0 ? text.slice(openIdx).match(/@@FILE\s+([^\n]+)/)?.[1]?.trim() : null;
    const tail = text.slice(-1800);
    try {
      const more = await callLLMJson<string>({
        system: `Tu continues un fichier de code React coupé en plein milieu. On te donne la fin du texte ; reprends EXACTEMENT là où ça s'arrête, sans rien répéter, et termine le fichier. Réponds UNIQUEMENT avec la suite brute du code.`,
        user: `Fichier concerné : ${lastPath || "dernier fichier"}\nFin du texte (le code reprend DIRECTEMENT après) :\n\`\`\`\n${tail}\n\`\`\``,
        temperature: 0.6,
        json: false,
      });
      if (typeof more !== "string" || !more.trim()) break;
      let frag = more.trim().replace(/^```(js|jsx)?\s*/i, "").replace(/```$/g, "");
      frag = frag.replace(/@@ENDFILE[\s\S]*$/i, "");
      text += frag + "\n@@ENDFILE";
    } catch {
      break;
    }
  }
  return text;
}

/** Nettoie les artefacts DeepSeek (<｜DSML｜>…) et les import/export parasites (pas de bundler). */
export function cleanReactCode(content: string): string {
  return content
    .replace(/<[^<>]*\uFF5C[^<>]*>/g, "")
    .replace(/<>/g, "<React.Fragment>")
    .replace(/<\/>/g, "</React.Fragment>")
    .replace(/^\s*(?:export\s+default\s+)?[A-Z]\w+\s*;\s*$/gm, "")
    .replace(/^\s*import\b[^\n]*$/gm, "")
    .replace(/^\s*export\s+default\s+/gm, "")
    .replace(/^\s*export\s+\{[^}]*\}\s*;?\s*$/gm, "")
    .replace(/^\s*export\s+/gm, "")
    .replace(/export default/g, "")
    // Montage parasite du LLM : tout call ReactDOM.createRoot(...)/ReactDOM.render(...) au
    // top-level (hors ligne -> à l'intérieur d'une fonction/effet) casse l'éval du bundle
    // (élément cible absent) et empêche l'application de SOKO_THEME/SOKO_FONTS.
    .replace(/^\s*(?:window\.)?ReactDOM\s*\.\s*(?:createRoot|render)\s*\([^;]*$/gm, "")
    .replace(/^\s*\}\s*\)\s*\.\s*render\s*\([^;]*;?\s*$/gm, "")
    .replace(/^\s*\)\s*\.\s*render\s*\([^;]*;?\s*$/gm, "")
    .trim();
}

/** Fichiers de base obligatoires + composants référencés mais non définis. */
const REQUIRED_FILES = ["src/App.jsx", "src/components/Footer.jsx"];

/** Composants utilisés dans le JSX (<Foo) mais jamais définis dans le projet. */
function findUndefinedComponents(files: ReactProjectFile[]): string[] {
  const defined = new Set<string>();
  const used = new Set<string>();
  for (const f of files) {
    for (const m of f.content.matchAll(/(?:function|const|var)\s+([A-Z]\w+)/g)) defined.add(m[1]);
    for (const m of f.content.matchAll(/<([A-Z]\w+)[\s/>]/g)) used.add(m[1]);
  }
  const globals = new Set(["React", "Fragment"]);
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

  const existingText = () => cleaned.map((f) => `@@FILE ${f.path}\n${f.content}\n@@ENDFILE`).join("\n");

  // 2 passes de réparation max (fichiers manquants, composants non définis, erreurs de compilation)
  for (let pass = 0; pass < 3; pass++) {
    const missing = REQUIRED_FILES.filter((req) => !cleaned.some((f) => f.path === req));
    const undefinedComponents = findUndefinedComponents(cleaned);
    const appFile = cleaned.find((f) => f.path === "src/App.jsx");
    const routerMissing = !appFile || !/hashchange/.test(appFile.content);
    const compileError = missing.length === 0 && undefinedComponents.length === 0 && !routerMissing ? await tryCompile(cleaned) : null;

    if (missing.length === 0 && undefinedComponents.length === 0 && !routerMissing && !compileError) break;

    const todo: string[] = [];
    if (missing.length) todo.push(`Fichiers à créer : ${missing.join(", ")}`);
    if (undefinedComponents.length)
      todo.push(
        `Composants utilisés dans le JSX mais NON DÉFINIS nulle part (à créer dans un fichier adapté, ex. src/components/Sections.jsx, ou compléter le fichier existant qui les utilise) : ${undefinedComponents.join(", ")}`
      );
    if (routerMissing)
      todo.push(
        "src/App.jsx n'a PAS de routeur hash fonctionnel : réécris-le avec const [page, setPage] = useState(...) + un useEffect qui écoute window 'hashchange' et recalcul la page courante (accueil/boutique/histoire/contact selon location.hash), + rend les 4 pages dans <main> selon page. Utilise les composants existants (Hero, ProductGrid, sections d'histoire/contact s'ils existent, sinon oriente vers les définitions existantes)."
      );
    if (compileError)
      todo.push(
        `ERREUR DE COMPILATION BABEL à corriger exactement (caractère parasite, balise JSX mal fermée, etc.) :\n${compileError}`
      );

    try {
      const raw = await callLLMJson<string>({
        system: `Tu répares un projet React de boutique SokoAI (convention : pas de import/export, JSX avec React global, hooks via const { useState } = React;).
On te donne les fichiers existants et la liste des réparations. Renvoie UNIQUEMENT les blocs @@FILE chemin ... @@ENDFILE des fichiers que tu crées ou modifies (le contenu COMPLET de chaque fichier modifié, pas un extrait). Aucun texte autour. Cohérence totale avec le projet existant (réutilise PRODUCTS, STORE, les composants et le style existants). Le fichier src/App.jsx DOIT finir par : window.__APP__ = App;`,
        user: `${variantLabel ? `Direction artistique du projet : ${variantLabel}\n\n` : ""}Fichiers existants :\n${existingText()}\n\nRÉPARATIONS DEMANDÉES :\n${todo.join("\n")}`,
        temperature: 0.6,
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
      // On garde le projet tel quel si la complétion échoue (le shell affichera l'erreur)
      break;
    }
  }
  return cleaned;
}

/** Compile le bundle complet (mêmes règles que le shell) — renvoie l'erreur tronquée ou null. */
async function tryCompile(files: ReactProjectFile[]): Promise<string | null> {
  const bundle = files
    .map((f) => `/* ===== ${f.path} ===== */\n${f.content.replace(/\b(const|let)\s/g, "var ")}`)
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
  options?: { whatsapp?: string; storeName?: string; city?: string; notes?: string; variant?: { id: string; label: string; description: string; guidance: string } }
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

/** 3 directions artistiques (structures imposées) — réutilisées pour React. */
export const REACT_VARIANT_DIRECTIONS = [
  {
    id: "A",
    label: "Éditorial & luxe",
    description: "Magazine de mode : serif élégante, palette sombre et dorée, hero plein écran, grilles asymétriques.",
    guidance:
      "Palette noir profond #0E0E10 / crème #F5F1E8 / or #C8A24B. Polices : Playfair Display (titres, italiques) + Inter (texte). Hero PLEIN ÉCRAN image de fond + titre serif géant. Collection en grille asymétrique (grande + petites images). Fiches produit sans bordures (photo plein cadre + légende). Citations clientes en grandes lettres serif. Boutons bordure fine. Reveal fade-up sobres.",
  },
  {
    id: "B",
    label: "Moderne & audacieux",
    description: "Exaggerated minimalism : papier clair, encre profonde, UN seul accent coquelicot, typo géante avant-gardiste (Syne + Manrope).",
    guidance:
      "Ambiance « exaggerated minimalism » avant-garde (type Nike flagship) — FOND CLAIR papier #F6F5F2, encre #101010, UN SEUL accent coquelicot #FF4D1C. Zéro néon, zéro multicolore. Polices : Syne (700/800, titres) + Manrope (texte). STRUCTURE DU HERO STRICTE (gabarit imposé, pas de collage libre) : (1) TOPMARQUEE h-10 : bande pleine largeur accent #FF4D1C, texte encre uppercase Syne 12px, items séparés par des astérisques, animation translate lente en boucle ; (2) nav collée : logo encre + liens uppercase Manrope 13px tracking + CTA pill encre plein ; (3) hero en grid-cols-12 gap-10 items-center py-16 : COLONNE GAUCHE col-span-7 (surtitre uppercase tracking, titre Syne 96-120px avec UN SEUL mot en accent + underline accent, paragraphe Manrope max-w-md, rangée de 2 boutons : pill encre plein + ghost bordure 1.5px hover inversé) ; COLONNE DROITE col-span-5 (image ratio 4/5 object-cover, coins nets, bande noire dessous avec nom de produit vedette + prix Syne) — aucun élément flottant, aucun vide vertical ; (4) bande de chiffres pleine largeur fond encre ou accent : 3 stats Syne 64px (-15%, 24h, +450 clients) ; (5) catalogue grid-cols-3 gap-6 : cartes claires border 1px encre, radius 0-6px, badge promo bloc accent carré coin haut-gauche, hover zoom photo léger ; (6) filets HR encre 1px entre sections + section réassurance 3 colonnes avec pictos SVG ligne 1.5px ; (7) FAQ filets horizontaux + numérotation 01-04 ; (8) CTA final bande accent pleine largeur. Typo géante (clamp 3rem-8rem), labels uppercase tracking serré, transitions 200-300ms, contraste strict.",
  },
  {
    id: "C",
    label: "Doux & minimal",
    description: "Minimal PREMIUM : lin chaud, serif à contraste élevé, filets fins, beaucoup d'air, détails de haute couture.",
    guidance:
      "Ambiance minimal chic premium (type Jacquemus / Aesop) — PAS de look enfantin. Palette : lin chaud #F7F3EC / sable #E9E0D2 / encre profonde #1B1815 + accent terracotta profond #A85B32. Polices : Bodoni Moda (titres, contraste élevé, italiques élégantes) + Jost (texte, géométrique fin). Radius 0 à 4px MAX, zéro pastille bubble, zéro ombre portée. Hero éditorial aéré : très grande typo serif (jusqu'à 96px), filets hairline 1px (#E5DCCB), surtitre uppercase espacé tracking-[0.3em], photo large au rapport 4/5. Cartes produit sans ombre, séparées par des filets verticaux fins, avec numérotation discrète en serif (01, 02…) et prix en chiffres serrés. Boutons : fond encre + texte lin, ou ghost avec filet inférieur animé au hover. Section rédactionnelle aérée « La promesse » : un grand texte serif centré sur fond sable. Beaucoup de blanc (py-24 et +), labels uppercase très fins, micro-transitions sobres 200ms.",
  },
];

export async function generateReactProjectVariants(
  prompt: string,
  options?: { whatsapp?: string; storeName?: string; city?: string; notes?: string }
): Promise<{ variants: ReactVariant[]; failed: string[] }> {
  const results = await Promise.allSettled(
    REACT_VARIANT_DIRECTIONS.map((direction) =>
      generateReactProject(prompt, { ...options, variant: direction })
    )
  );

  const variants: ReactVariant[] = [];
  const failed: string[] = [];
  results.forEach((res, i) => {
    const direction = REACT_VARIANT_DIRECTIONS[i];
    if (res.status === "fulfilled") {
      variants.push({ ...direction, ...res.value });
    } else {
      failed.push(`${direction.label}: ${res.reason instanceof Error ? res.reason.message : "erreur"}`);
    }
  });

  if (variants.length === 0) throw new Error(failed[0] || "Aucune variante n'a pu être générée");
  return { variants, failed };
}

export async function editReactProject(
  files: ReactProjectFile[],
  meta: ReactProjectMeta,
  instruction: string
): Promise<ReactProjectResult> {
  if (!hasLLMKey()) throw new Error("Aucune clé LLM configurée");

  const projectText = [
    "@@META",
    JSON.stringify(meta),
    "@@ENDMETA",
    ...files.map((f) => `@@FILE ${f.path}\n${f.content}\n@@ENDFILE`),
  ].join("\n");

  const raw = await callLLMJson<string>({
    system: REACT_EDIT_PROMPT,
    user: `=== PROJET ACTUEL ===\n${projectText}\n=== FIN ===\n\nDemande du commerçant : "${instruction}"`,
    temperature: 0.5,
    json: false,
  });

  const completed = await completeLastFile(typeof raw === "string" ? raw : "");
  const result = parseReactProject(completed);
  const finalFiles = await ensureCoreFiles(result.files, result.meta);
  if (finalFiles.length < 3) throw new Error("Le projet modifié est incomplet");
  return { files: finalFiles, meta: result.meta };
}
