/**
 * Test de buildImportStubs : pour tout import relatif vers un fichier manquant,
 * un module de repli est créé AU CHEMIN ATTENDU (tolère les imports multi-lignes
 * et dynamiques) — pas besoin de réécrire les imports.
 */
import { buildImportStubs, rewriteRelativeImports, prepareModuleFile } from "../src/lib/webcontainer";

const files = [
  {
    path: "src/App.jsx",
    content: `import Navbar from './components/Navbar.jsx';
import { PRODUCT_LIST } from './data/products.js';
// import multi-ligne vers un fichier manquant
import {
  ProductCard,
  formatPrice
} from './components/ProductCard';
import AppHeader from './components/AppHeader';
export default AppHeader;
`,
  },
  {
    path: "src/components/Navbar.jsx",
    content: `import { CATEGORIES } from '../data/catalog.js';
export default function Navbar() { return null; }
`,
  },
  {
    path: "src/data/products.js",
    content: `export const PRODUCT_LIST = [{ name: 'Savon karité', price: 2500 }];
`,
  },
];

const { contentByPath, files: withStubs } = buildImportStubs(files);

console.log("=== stubs créés ===");
for (const [p, c] of contentByPath) console.log(p, "|", c.replace(/\n/g, " ").slice(0, 90) + "…");

const expected = ["src/components/ProductCard.js", "src/components/ProductCard.jsx", "src/components/AppHeader.js", "src/components/AppHeader.jsx", "src/data/catalog.js"];
let ok = true;
for (const p of expected) {
  const hit = contentByPath.has(p);
  console.log("stub attendu", p, hit ? "OK" : "MANQUANT");
  if (!hit) ok = false;
}
if (!ok) process.exitCode = 1;

// Chaîne complète : passe esbuild (simule le mount)
const realPaths = withStubs.map((f) => f.path);
const esbuild = await import("esbuild");
for (const f of withStubs) {
  if (!f.path.startsWith("src/") || !/\.(jsx|js)$/.test(f.path)) continue;
  const prepared = prepareModuleFile(f.path, rewriteRelativeImports(f.content, f.path, realPaths));
  try {
    await esbuild.transform(prepared, { loader: "jsx" });
    console.log("BUNDLE OK —", f.path);
  } catch (e) {
    console.log("BUNDLE FAIL —", f.path, String(e).split("\n")[0].slice(0, 200));
    process.exitCode = 1;
  }
}

// Les imports d'origine ne doivent PAS être mutés
const app = withStubs[0].content;
console.log(
  "import ProductCard intact:", app.includes("'./components/ProductCard'") ? "OK" : "MUTÉ",
  "| catalogue externes nommés OK:", contentByPath.get("src/data/catalog.js")?.includes("export const CATEGORIES") ? "OK" : "MANQUANT",
  "| ProductCard stub exporte ProductCard + formatPrice:",
  contentByPath.get("src/components/ProductCard.js")?.includes("export const ProductCard") && contentByPath.get("src/components/ProductCard.js")?.includes("export const formatPrice") ? "OK" : "MANQUANT"
);
