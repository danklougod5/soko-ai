/**
 * Vérifie la transformation des modules générés pour Vite/WebContainer :
 * - les imports relatifs doivent rester résolubles
 * - chaque import nommé doit exister (export nommé)
 * - chaque import default doit exister (export default)
 * - les composants/fonctions non importés doivent être neutralisés (fallback window)
 * - pas de "duplicate declaration"
 */
import { build } from "esbuild";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { prepareModuleFile } from "../src/lib/webcontainer";

const root = join(process.cwd(), ".repro", "prepared");
rmSync(root, { recursive: true, force: true });
mkdirSync(join(root, "src/components"), { recursive: true });
mkdirSync(join(root, "src/data"), { recursive: true });

const fixture: Record<string, string> = {
  "src/data/products.js": `export const PRODUCTS = [
  { id: 1, name: 'Savon noir', price: 2500, image: 'https://example.com/a.jpg', category: 'Soins', description: 'Un savon.', details: [{ label: 'Poids', value: '200g' }] },
];
export const STORE = { name: 'Mara', whatsapp: '2250612345678', city: 'Abidjan' };
export function formatPrice(value) { return value + ' FCFA'; }
`,
  "src/theme.js": `export const SOKO_THEME = { extend: { colors: { ink: '#101010' } } };
export const SOKO_FONTS = 'Syne:wght@700;800&family=Manrope:wght@400;600';
`,
  "src/components/ProductCard.jsx": `import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onOpen }) {
  return (
    <article className="card" onClick={() => onOpen(product)}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
      <ShoppingBag size={16} />
    </article>
  );
}
`,
  "src/components/Hero.jsx": `import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const first = PRODUCTS[0];
  return (
    <section className="hero">
      <h1>Mara</h1>
      <p>{first ? formatPrice(first.price) : ''}</p>
      <button onClick={() => window.open('https://wa.me/2250612345678')}>
        Commander <ArrowRight size={16} />
      </button>
      <ProductCard product={first} onOpen={() => {}} />
    </section>
  );
}
`,
  "src/components/Navbar.jsx": `import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <button onClick={() => setOpen(!open)}>Menu</button>
      {open && <span>ouvert</span>}
    </nav>
  );
}
`,
  "src/components/ProductGrid.jsx": `import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/products';

export default function ProductGrid({ onOpen }) {
  return (
    <div className="grid">
      {PRODUCTS.map((product) => (
        <ProductCard key={product.id} product={product} onOpen={onOpen} />
      ))}
    </div>
  );
}
`,
  "src/components/Sections.jsx": `import { PRODUCTS, formatPrice } from '../data/products';
import ProductGrid from './ProductGrid';

export function About() {
  return <section><h2>Notre histoire</h2><p>{formatPrice(0)}</p></section>;
}

export default function Sections({ onOpen }) {
  return (
    <main>
      <About />
      <ProductGrid onOpen={onOpen} />
    </main>
  );
}
`,
  "src/components/Footer.jsx": `export default function Footer() {
  return <footer>© Mara — {STORE.city}</footer>;
}
`,
  "src/App.jsx": `import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sections from './components/Sections';
import { Footer } from './components/Footer';
import { PRODUCTS } from './data/products';

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Sections onOpen={setSelected} />
      <Footer />
      {selected && <p>{selected.name} — {formatPrice(selected.price)}</p>}
      <span>{PRODUCTS.length} produits</span>
    </div>
  );
}
`,
  "src/main.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`,
};

for (const [path, content] of Object.entries(fixture)) {
  const out = path === "src/main.jsx" ? content : prepareModuleFile(path, content);
  writeFileSync(join(root, path), out);
}

// 1) Bundle réel : attrape imports non résolus, exports manquants, syntaxe invalide
try {
  const result = await build({
    entryPoints: [join(root, "src/main.jsx")],
    bundle: true,
    write: false,
    format: "esm",
    jsx: "automatic",
    loader: { ".js": "jsx", ".jsx": "jsx" },
    external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "lucide-react"],
    logLevel: "silent",
  });
  console.log("BUNDLE OK — taille:", result.outputFiles[0].contents.length, "octets");
} catch (err) {
  const e = err as { errors?: { text: string; location?: { file: string; line: number } }[] };
  if (e.errors?.length) {
    for (const error of e.errors) {
      console.error("ESBUILD ERROR:", error.text, error.location ? `${error.location.file}:${error.location.line}` : "");
    }
  } else {
    console.error("ESBUILD ERROR:", err);
  }
  process.exitCode = 1;
}

// 2) Contrôles ciblés sur la transformation
const hero = prepareModuleFile("src/components/Hero.jsx", fixture["src/components/Hero.jsx"]);
console.log("Hero — fallback ProductCard:", /const ProductCard = \(props\)/.test(hero) ? "OK" : "MANQUANT");
console.log("Hero — fallback formatPrice:", /const formatPrice = \(\.\.\.args\)/.test(hero) ? "OK" : "MANQUANT");
console.log("Hero — import relatif conservé:", hero.includes("lucide-react") ? "OK" : "MANQUANT");

const navbar = prepareModuleFile("src/components/Navbar.jsx", fixture["src/components/Navbar.jsx"]);
console.log("Navbar — pas de faux fallback useState:", /const useState =/.test(navbar) ? "ERREUR" : "OK");
console.log("Navbar — export default présent:", /export default (function )?Navbar/.test(navbar) ? "OK" : "MANQUANT");

const data = prepareModuleFile("src/data/products.js", fixture["src/data/products.js"]);
console.log("Data — alias products:", /PRODUCTS as products/.test(data) ? "OK" : "MANQUANT");
console.log("Hero — fallback constante PRODUCTS:", /const PRODUCTS = /.test(hero) ? "OK" : "MANQUANT");
