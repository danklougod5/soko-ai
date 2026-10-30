/**
 * Test de buildImportStubs : les imports vers des fichiers manquants sont redirigés
 * vers un module de repli exportant les noms demandés.
 */
import { buildImportStubs, rewriteRelativeImports, prepareModuleFile } from "../src/lib/webcontainer";

const files = [
  {
    path: "src/App.jsx",
    content: `import Navbar from './components/Navbar.jsx';
import { PRODUCT_LIST } from './data/products.js';
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
for (const [p, c] of contentByPath) console.log(p, "|", c.split("\n")[1] || "");

console.log("=== App.jsx après stub ===");
console.log(withStubs[0].content);

// Le contenu complet doit passer esbuild (simule la chaîne de mount)
const realPaths = withStubs.map((f) => f.path);
let esbuild: typeof import("esbuild");
esbuild = await import("esbuild");
for (const f of withStubs) {
  if (!f.path.startsWith("src/") || !/\.(jsx|js)$/.test(f.path)) continue;
  const rewritten = rewriteRelativeImports(f.content, f.path, realPaths);
  const prepared = prepareModuleFile(f.path, rewritten);
  try {
    await esbuild.transform(prepared, { loader: "jsx" });
    console.log("BUNDLE OK —", f.path);
  } catch (e) {
    console.log("BUNDLE FAIL —", f.path, String(e).slice(0, 200));
    process.exitCode = 1;
  }
}

const appPrepared = prepareModuleFile("src/App.jsx", rewriteRelativeImports(withStubs[0].content, "src/App.jsx", realPaths));
const stubPath = [...contentByPath.keys()].find((p) => p.includes("AppHeader"));
const stubPrepared = stubPath ? prepareModuleFile(stubPath, contentByPath.get(stubPath)!) : "";
console.log(
  "import AppHeader pointe vers stub:", appPrepared.includes("__soko_stub_") ? "OK" : "MANQUANT",
  "| stub exporte default:", stubPrepared.includes("export default") ? "OK" : "MANQUANT"
);
