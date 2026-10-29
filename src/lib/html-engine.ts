import { callLLMJson, hasLLMKey } from "./llm";
import { slugify } from "./store-brief";

export interface HtmlStudioMeta {
  storeName: string;
  slug: string;
  whatsapp: string;
  city: string;
}

export interface HtmlGenerationResult {
  html: string;
  meta: HtmlStudioMeta;
}

const MASTER_HTML_PROMPT = `Tu es un Architecte Web Senior et Directeur Artistique de "SokoAI — le Lovable de l'e-commerce africain". Tu écris du VRAI CODE FRONT-END sur-mesure, comme une agence web de prestige. Chaque site que tu produis est UNIQUE : structure, direction artistique, micro-copies, palette, typographies et animations sont conçus pour CE commerçant précis.

MISSION : à partir du besoin du commerçant, produire une BOUTIQUE E-COMMERCE COMPLÈTE dans UN SEUL FICHIER HTML AUTONOME, avec PLUSIEURS PAGES.

SITE MULTI-PAGES (obligatoire — un routeur interne) :
- Le fichier contient plusieurs pages gérées par un petit <script> inline lié au hash : #/accueil, #/boutique, #/histoire, #/contact.
- Structure OBLIGATOIRE du <body> :
<header> avec nav (liens href="#/accueil", "#/boutique", "#/histoire", "#/contact" + bouton "Commander sur WhatsApp") ;
<main> contenant 4 <section data-page="accueil|boutique|histoire|contact"> ; <footer> ; puis JUSTE AVANT </body> le script exact ci-dessous :
<script>
(function(){
  var PAGES=document.querySelectorAll('[data-page]');
  function route(){ var n=(location.hash.replace(/^#\\/?/,'')||'accueil').split('?')[0]; document.querySelectorAll('[data-page]').forEach(function(el){ el.style.display=(el.getAttribute('data-page')===n)?'':'none'; }); }
  window.addEventListener('hashchange',route); route();
})();
</script>
- page #/accueil : hero spectaculaire + aperçu de la collection (8 produits) + une section signature de la DA.
- page #/boutique : catalogue COMPLET (10-12 produits) avec filtres simples par catégorie (boutons qui filtrent via JS sur data-categorie).
- page #/histoire : l'histoire du commerçant, ses valeurs, photos d'ambiance, artisanat/local.
- page #/contact : coordonnées complètes (WhatsApp, téléphone, ville, zones de livraison, horaires fictifs mais cohérents), façons de commander (Wave, Orange Money, MTN MoMo, paiement à la livraison) et un texte d'accueil clair vers le WhatsApp.
- Sur les fiches produit de #/boutique : un bouton "Voir" ouvre une modale (overlay, fermeture croix/Échap/clic fond) — UNE VRAIE FICHE PRODUIT : layout 2 colonnes, grande image + 2-3 vignettes cliquables (galerie), catégorie, titre, gros prix, description longue, 4+ caractéristiques en lignes clé/valeur (matériaux, dimensions, âge, contenu), sélecteur de quantité -/+, réassurance livraison/paiement avec pictos, CTA « Commander sur WhatsApp » pré-rempli avec nom + quantité + prix TOTAL, lien « Poser une question ».
- Les animations "reveal" au scroll ne doivent JAMAIS masquer le contenu si le JS échoue : partez de contenu VISIBLE et animez-le (transform/opacity via IntersectionObserver avec fallback immédiat), jamais de contenu opacity:0 par défaut dans le CSS.

RÈGLE ABSOLUE :
Tu réponds UNIQUEMENT avec du HTML brut commençant par <!DOCTYPE html> et se terminant par </html>. AUCUN texte d'accompagnement, aucun bloc markdown, aucune explication.

ÉCUEIL INTERDIT : le site appartient AU COMMERÇANT décrit dans le brief (sa boutique, ses produits, sa marque). INTERDICTION FORMELLE de générer une page à propos de SokoAI (aucun lien de nav vers l'outil). Chaque section parle de SES produits, SES clients, SES offres.

CONTRAINTES TECHNIQUES (obligatoires) :
- Un seul fichier : <head> contient Tailwind via <script src="https://cdn.tailwindcss.com"></script> et les fonts Google via <link>.
- Le script du routeur, le filtre du catalogue et les fiches produit DOIVENT être dans UN SEUL <script inline> placé JUSTE AVANT </body> (après le DOM), jamais dans <head>.
- Design mobile-first impeccable : chaque section pensée mobile (grilles empilées, boutons tactiles).
- Tailwind config inline via tailwind.config = { theme: { extend: { ... } } } — palette et polices définies par la VARIANTE imposée, jamais générique.
- Langue : FRANÇAIS chaleureux (vouvoiement), adapté au registre de l'activité.
- Devise : FCFA, prix sans centimes.
- Images : URLs Unsplash réalistes et pertinentes pour CHAQUE produit (photos plein cadre), une image différente par produit.
- Bouton WhatsApp flottant en bas à droite pointant sur https://wa.me/<numéro du commerçant>.
- Un bouton "Commander" par produit ouvre WhatsApp avec un message pré-rempli (nom du produit + prix).
- Un SEUL <script> inline (sans src), propre : gèle le routeur hash exact exigé plus haut, le filtre du catalogue, l'ouverture des fiches produit et TOUS les lanceurs SANS masquer le contenu par défaut. NE JAMAIS inclure de <script src> externe autre que Tailwind et fonts.

FOOTER RICHE (obligatoire, jamais minimal) :
- 4 colonnes sur desktop, empilées sur mobile : (1) Marque : logo/nom + slogan + 2-3 phrases sur la maison ; (2) Navigation : liens des 4 pages ; (3) Contact : WhatsApp cliquable, téléphone, ville, e-mail, horaires ; (4) Services : livraison, paiement (badges Wave, Orange Money, MTN MoMo, paiement à la livraison), retours.
- Barre finale : © <année> nom de la boutique + mentions "Tous droits réservés".

QUALITÉ ATTENDUE (référentiel apple-design — Fluid Interfaces, Materials & Optical Typography) :
- Identité visuelle jamais "template admin/Bootstrap" : audacieux, cohérent, mémorable, avec la finition d'une interface Apple.
- Réponse tactile instantanée : chaque bouton, carte, vignette et filtre réagit immédiatement au press/touch-down (\`active:scale-[0.97] transition-transform duration-100 ease-out\`), zones tactiles ≥ 44×44px.
- Matériaux translucides & profondeur : header/navbar en verre dépoli (\`backdrop-blur-xl backdrop-saturate-[180%]\`), modale produit avec scrim \`bg-black/60 backdrop-blur-sm\` ("Dim to focus"), ombres progressives et filets subtils.
- Typographie optique Apple : tracking négatif sur les grands titres display (\`tracking-[-0.025em]\`, \`leading-[1.08]\`), positif sur les petits badges uppercase (\`tracking-[0.12em]\`), et \`tabular-nums\` sur tous les prix FCFA.
- Le catalogue et les infos reflètent STRICTEMENT le brief du commerçant (produits réels, gamme de prix, livraison, paiement). Si une information manque (horaires, adresse), invente une valeur cohérente ET crédible pour un commerçant local, jamais de placeholder "lorem" ou "XXX".

BLOC META OBLIGATOIRE : juste après <!DOCTYPE html>, une seule fois :
@@META
{"storeName":"nom de la boutique","whatsapp":"numero sans symbole, ex: 2250700000000","city":"ville"}
@@ENDMETA`;

const EDIT_HTML_PROMPT = `Tu es un développeur front-end senior de SokoAI. On te fournit le HTML COMPLET d'une boutique e-commerce et une demande de modification du commerçant.
Tu renvoies le HTML COMPLET mis à jour, en conservant TOUT le reste à l'identique et en appliquant précisément la demande.
Tu réponds UNIQUEMENT avec le HTML complet (aucun texte autour), en conservant le bloc @@META ... @@ENDMETA.

CONSERVE TOUJOURS : la langue française, la devise FCFA, le bouton WhatsApp flottant, la structure responsive multi-pages (routeur hash).`;

const CONTINUE_HTML_PROMPT = `Tu es un développeur front-end senior de SokoAI. Le fichier HTML d'une boutique e-commerce a été COUPÉ en plein milieu à cause d'une limite de longueur.
On te fournit la ré auction du fichier (les ~1800 derniers caractères jusqu'à la coupure).
Ta mission : CONTINUER le fichier EXACTEMENT là où ça s'arrête, sans rien répéter du texte fourni, en terminant toutes les balises/sections restantes (contenu encore attendu : sections non écrites, footer riche, script inline du routeur, fermeture </body></html>).
Réponds UNIQUEMENT avec la suite du fichier (fragment brut, aucun commentaire, aucun bloc markdown).`;

export async function generateStoreHtml(
  prompt: string,
  options?: { whatsapp?: string; storeName?: string; city?: string; notes?: string; variant?: VariantDirection }
): Promise<HtmlGenerationResult> {
  if (!hasLLMKey()) {
    throw new Error("Aucune clé LLM configurée");
  }

  const system = options?.variant
    ? `${MASTER_HTML_PROMPT}\n\nVARIANTE IMPOSÉE — « ${options.variant.label} » :\n${options.variant.guidance}\n\nApplique STRICTEMENT cette direction : les polices, la palette, le gabarit du hero, l'ORDRE exact des sections, le style des cartes/filtres/boutons et les pages #/histoire et #/boutique doivent OBEIR à la structure imposable ci-dessus — c'est ce qui rend cette variante reconnaissable entre mille face aux deux autres.`
    : MASTER_HTML_PROMPT;

  const userParts: string[] = [`Besoin du commerçant : "${prompt}"`];
  if (options?.storeName) userParts.push(`Nom de la boutique : ${options.storeName}`);
  if (options?.whatsapp) userParts.push(`Numéro WhatsApp du commerçant (pour les liens wa.me) : ${options.whatsapp}`);
  if (options?.city) userParts.push(`Ville de vente/livraison : ${options.city}`);
  if (options?.notes) userParts.push(`Détails complémentaires : ${options.notes}`);

  const raw = await callLLMJson<string>({
    system,
    user: userParts.join("\n"),
    temperature: options?.variant ? 1.0 : 0.8,
    json: false,
  });

  const rawText = await continueUntilClosed(typeof raw === "string" ? raw : "");
  const html = ensureHeadIncludes(stripMetaBlock(extractHtml(rawText)));
  if (!html) throw new Error("Le LLM n'a pas renvoyé de HTML exploitable");
  const meta = extractMeta(extractHtml(rawText));
  return { html, meta };
}

/** Si la réponse du LLM a été tronquée, on continue en plusieurs passes. */
async function continueUntilClosed(text: string): Promise<string> {
  let out = text;
  for (let pass = 0; pass < 3; pass++) {
    if (/<\/html>\s*$/i.test(out.trim())) break;
    try {
      const tail = out.slice(-1800);
      const more = await callLLMJson<string>({
        system: CONTINUE_HTML_PROMPT,
        user: `Suite du fichier (il reprend DIRECTEMENT après cette fin) :\n\`\`\`\n${tail}\n\`\`\``,
        temperature: 0.7,
        json: false,
      });
      if (typeof more !== "string" || !more.trim()) break;
      let frag = more.trim().replace(/^```(html)?\s*/i, "").replace(/```$/g, "");
      frag = frag.replace(/^<!DOCTYPE[^>]*>/i, "").replace(/^<html[^>]*>/i, "");
      out += frag;
    } catch {
      break;
    }
  }
  return out;
}

export interface VariantDirection {
  id: string;
  label: string;
  description: string;
  guidance: string;
}

/** 3 directions artistiques proposées au commerçant (3 sites vraiment différents). */
export const VARIANT_DIRECTIONS: VariantDirection[] = [
  {
    id: "A",
    label: "Éditorial & luxe",
    description: "Style magazine de mode : grandes photos plein cadre, typographie serif élégante, palette sombre et dorée, mises en page asymétriques.",
    guidance: [
      "DA « magazine éditorial haut de gamme » : palette sombre (noir profond #0E0E10, crème #F5F1E8, or/doré #C8A24B), polices : Playfair Display + Inter (ou Cormorant Garamond).",
      "STRUCTURE PAGE ACCUEIL IMPOSÉE (dans cet ordre) : (1) nav fine transparente sur photo ; (2) hero PLEIN ÉCRAN image de fond avec titre serif géant superposé en italique ; (3) bandeau marquee défilant lent et discret ; (4) « Collection signature » en grille ASYMÉTRIQUE (1 grande image + 2 petites + 1 grande, texte sur léger décalage) ; (5) chiffres clés en une ligne fine (ex : 100% fait main · 48h livraison · 300+ clientes) ; (6) citations clientes en grandes lettres serif sur fond sombre ; (7) CTA élégant bordure fine.",
      "PAGE #/histoire : mise en page éditoriale à DEUX colonnes avec lettrine, photos flanc, liste de valeurs en fines lignes horizontales.",
      "PAGE #/boutique : catalogue en grilles alternées grandes/petites images, fiches SANS bordure (photo plein cadre + légende dessous), filtres en liens texte soulignés.",
      "Fiches produit sans bordure, boutons minimalistes bordure fine, animations de reveal sobres (fade-up).",
    ].join("\n"),
  },
  {
    id: "B",
    label: "Moderne & audacieux",
    description: "Exaggerated minimalism : papier clair, encre profonde, un seul accent coquelicot, typo géante avant-gardiste (Syne + Manrope).",
    guidance: [
      "DA « exaggerated minimalism avant-garde » (type Nike flagship / agence créative) — FOND CLAIR papier #F6F5F2, encre #101010, UN SEUL accent coquelicot #FF4D1C. Zéro néon, zéro multicolore. Polices : Syne (700/800, titres) + Manrope (texte).",
      "STRUCTURE PAGE ACCUEIL IMPOSÉE (dans cet ordre, gabarit strict, pas de collage libre) : (1) TOPMARQUEE h-10 : bande pleine largeur accent #FF4D1C, texte encre uppercase Syne 12px, items séparés par des astérisques, défilement lent en boucle ; (2) nav collée : logo encre + liens uppercase Manrope + CTA pill encre plein ; (3) hero en grid 12 colonnes gap-10 items-center : COLONNE GAUCHE 7/12 = surtitre uppercase tracking, titre Syne 96-120px avec UN SEUL mot en accent souligné (underline accent), paragraphe Manrope max-w-md, rangée de 2 boutons (pill encre plein + ghost bordure 1.5px hover inversé accent) ; COLONNE DROITE 5/12 = image ratio 4/5 coins nets + bande noire dessous (nom produit vedette + prix Syne) — aucun vide vertical ; (4) bande de chiffres pleine largeur fond encre ou accent : 3 stats Syne 64px (-15%, 24h, +450 clients) ; (5) catalogue grid-cols-3 : cartes claires border 1px encre, radius 0-6px, badge promo bloc accent carré coin haut-gauche, hover zoom photo léger ; (6) filets HR encre 1px entre sections + réassurance 3 colonnes (pictos SVG ligne 1.5px) ; (7) FAQ filets horizontaux <details> numérotés 01-04 ; (8) CTA final bande accent pleine largeur.",
      "PAGE #/histoire : kinetic editorial, gros titres Syne, paragraphes Manrope aérés, timeline en filets horizontaux avec dates en accent.",
      "PAGE #/boutique : grille régulière cartes bordées fines, filtres en pills uppercase ghost avec état actif accent, prix en Syne.",
      "Typo géante (clamp 3rem-8rem), labels uppercase tracking-étroit, animations 200-300ms (fade-up, inversion bouton), contraste strict, zéro ombre portée sauf lift discret au hover des boutons.",
    ].join("\n"),
  },
  {
    id: "C",
    label: "Doux & minimal",
    description: "Minimal PREMIUM : lin chaud, serif à contraste élevé, filets fins, beaucoup d'air, détails de haute couture (type Jacquemus / Aesop).",
    guidance: [
      "DA « minimal chic premium » — PAS de look enfantin : fond lin chaud #F7F3EC, sable #E9E0D2, encre profonde #1B1815, accent terracotta profond #A85B32. Polices : Bodoni Moda (titres, contraste élevé, italiques élégantes) + Jost (texte géométrique fin).",
      "STRUCTURE PAGE ACCUEIL IMPOSÉE (dans cet ordre) : (1) nav aérée en uppercase espacées tracking large ; (2) hero éditorial : très grande typo serif (jusqu'à 96px, italique sur un mot), surtitre uppercase tracking-[0.3em], photo large au rapport 4/5, boutons fond encre + texte lin OU ghost avec filet inférieur animé ; (3) rangée de 3 réassurances séparées par des FILETS verticaux hairline 1px #E5DCCB avec numérotation serif (01, 02, 03) ; (4) section rédactionnelle « La promesse » : grand texte serif centré sur fond sable, py-24 ; (5) catalogue en grille régulière séparée par des filets verticaux fins, cartes SANS ombre et radius 0-4px max, numérotation discrète des produits en serif ; (6) avis client en une grande citation serif italique ; (7) FAQ en filets horizontaux <details> ; (8) CTA final bande encre pleine largeur avec texte lin uppercase espacé.",
      "PAGE #/histoire : mise en page éditoriale aérée, une colonne de texte justifiée + marges généreuses, lettrine serif, filets horizontaux entre les paragraphes.",
      "PAGE #/boutique : grille régulière 3 colonnes, fiches sans ombre séparées par des filets, prix en chiffres serrés, filtres en liens texte uppercase avec filet inférieur actif.",
      "Micro-transitions sobres 200ms, icônes SVG fines, beaucoup de blanc (py-24+), labels uppercase ultra-fins, zéro pastille arrondie enfantin, zéro ombre portée.",
    ].join("\n"),
  },
];

/**
 * Génère 3 variantes du site (directions artistiques différentes) en parallèle.
 * Renvoie toutes les variantes réussies ; jette si aucune n'aboutit.
 */
export async function generateStoreHtmlVariants(
  prompt: string,
  options?: { whatsapp?: string; storeName?: string; city?: string; notes?: string }
): Promise<{ variants: (VariantDirection & HtmlGenerationResult)[]; failed: string[] }> {
  const results = await Promise.allSettled(
    VARIANT_DIRECTIONS.map((direction) =>
      generateStoreHtml(prompt, { ...options, variant: direction })
    )
  );

  const variants: (VariantDirection & HtmlGenerationResult)[] = [];
  const failed: string[] = [];
  results.forEach((res, i) => {
    const direction = VARIANT_DIRECTIONS[i];
    if (res.status === "fulfilled") {
      variants.push({ ...direction, ...res.value });
    } else {
      failed.push(`${direction.label}: ${res.reason instanceof Error ? res.reason.message : "erreur"}`);
    }
  });

  if (variants.length === 0) {
    throw new Error(failed[0] || "Aucune variante n'a pu être générée");
  }
  return { variants, failed };
}

/** Garantit Tailwind CDN + viewport dans le <head> (le sandbox d'aperçu compte dessus). */
export function ensureHeadIncludes(html: string): string {
  if (!html) return html;
  let out = html;
  const tailwindTag = '<script src="https://cdn.tailwindcss.com"></script>';
  if (!out.includes("cdn.tailwindcss.com")) {
    if (out.includes("<head>")) {
      out = out.replace("<head>", `<head>\n${tailwindTag}`);
    } else if (out.includes("<html")) {
      const gt = out.indexOf(">", out.indexOf("<html")) + 1;
      out = `${out.slice(0, gt)}\n<head>${tailwindTag}</head>${out.slice(gt)}`;
    } else {
      out = `${out}\n<head>${tailwindTag}</head>`;
    }
  }
  if (!out.includes('name="viewport"')) {
    const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1">';
    if (out.includes("<head>")) {
      out = out.replace("<head>", `<head>\n${viewport}`);
    }
  }
  return out;
}

export async function editStoreHtml(
  currentHtml: string,
  instruction: string
): Promise<{ html: string; meta: HtmlStudioMeta }> {
  if (!hasLLMKey()) throw new Error("Aucune clé LLM configurée");

  const raw = await callLLMJson<string>({
    system: EDIT_HTML_PROMPT,
    user: `=== HTML ACTUEL ===\n${currentHtml}\n=== FIN ===\n\nDemande du commerçant : "${instruction}"`,
    temperature: 0.5,
    json: false,
  });

  const extracted = extractHtml(await continueUntilClosed(typeof raw === "string" ? raw : ""));
  const html = ensureHeadIncludes(stripMetaBlock(extracted));
  if (!html) throw new Error("Le LLM n'a pas renvoyé de HTML exploitable");
  return { html, meta: extractMeta(extracted) };
}

function extractHtml(raw: string): string {
  const text = raw.trim()
    .replace(/^```(html)?\s*/i, "")
    .replace(/```$/g, "");
  const doctypeIdx = text.indexOf("<!DOCTYPE");
  const htmlIdx = text.indexOf("<html");
  const start = doctypeIdx >= 0 ? doctypeIdx : htmlIdx;
  if (start < 0) return "";
  // Tolère une réponse tronquée : on ferme ouverte
  if (text.lastIndexOf("</html>") < start) {
    return `${text.slice(start)}</body></html>`;
  }
  return text.slice(start, text.lastIndexOf("</html>") + "</html>".length);
}

function extractMeta(html: string): HtmlStudioMeta {
  const rawMeta = html.match(/@@META\s*([\s\S]*?)\s*@@ENDMETA/);
  let meta: Record<string, string> = {};
  if (rawMeta) {
    try {
      meta = JSON.parse(rawMeta[1]) as Record<string, string>;
    } catch {
      meta = {};
    }
  }
  const title = html.match(/<title>([^<]+)<\/title>/);
  const storeName = meta.storeName || title?.[1]?.trim() || "Ma Boutique";
  const whatsapp = (meta.whatsapp || "").replace(/\D/g, "");
  return {
    storeName,
    slug: slugify(storeName),
    whatsapp: whatsapp.length >= 8 ? whatsapp : "2250700000000",
    city: meta.city || "Abidjan",
  };
}

/** Retire le bloc @@META...@@ENDMETA du HTML affichable (sinon il apparaît comme du texte). */
function stripMetaBlock(html: string): string {
  return html.replace(/@@META[\s\S]*?@@ENDMETA\s*/g, "").trim();
}
