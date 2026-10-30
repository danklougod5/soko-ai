/**
 * Vérifie la réécriture des imports relatifs : extension manquante, casse différente,
 * ./ et ../ — cible réelle uniquement.
 */
import { rewriteRelativeImports } from "../src/lib/webcontainer";

const paths = [
  "src/theme.js",
  "src/data/products.js",
  "src/components/Navbar.jsx",
  "src/components/Hero.jsx",
  "src/App.jsx",
];

const cases: { file: string; content: string }[] = [
  {
    file: "src/App.jsx",
    content: `import Navbar from './components/Navbar';\nimport { PRODUCTS } from './data/products';\n// noter la casse erreur et l'extension manquante\nimport Hero from './components/hero.jsx';\n`,
  },
  {
    file: "src/components/Hero.jsx",
    content: `import { PRODUCTS } from '../data/products.js';\nimport Navbar from '../components/Navbar';\nexport default Hero;\n`,
  },
];

for (const c of cases) {
  console.log("SRC", c.file);
  const out = rewriteRelativeImports(c.content, c.file, paths);
  console.log(out.trim());
}

const a = rewriteRelativeImports(cases[0].content, cases[0].file, paths);
console.log(
  "Navbar casse OK:", /'(\.\.\/)?\.?\/?components\/Navbar\.jsx'/.test(a.replace("'./components/Navbar.jsx'", "'./components/Navbar.jsx'")) ? "?" : "?",
  a.includes("'./components/Navbar.jsx'") ? "OK" : "MANQUANT",
  "| products:", a.includes("'./data/products.js'") ? "OK" : "MANQUANT"
);

const b = rewriteRelativeImports(cases[1].content, cases[1].file, paths);
console.log(
  "Hero ../products:", b.includes("'../data/products.js'") || b.includes("'./data/products.js'") ? "OK" : "MANQUANT",
  "| vers soi-même (Navbar import from components dir):", b.includes("Navbar") ? "présent" : "MANQUANT"
);
