"use client";

import type { WebContainer, FileSystemTree } from "@webcontainer/api";
import type { BoltAction } from "./bolt-parser";
import type { ReactProjectFile } from "./react-project-engine";

export type WebContainerPhase =
  | "idle"
  | "booting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

export interface WebContainerState {
  phase: WebContainerPhase;
  previewUrl: string | null;
  error: string | null;
  lastPreviewError: string | null;
}

type StateListener = (state: WebContainerState) => void;

declare global {
  interface Window {
    __SOKO_WC_PROMISE__?: Promise<WebContainer>;
    __SOKO_WC_INSTANCE__?: WebContainer;
    __SOKO_WC_DEV_READY__?: Promise<string>;
  }
}

let currentState: WebContainerState = {
  phase: "idle",
  previewUrl: null,
  error: null,
  lastPreviewError: null,
};

const listeners = new Set<StateListener>();

function updateState(patch: Partial<WebContainerState>) {
  currentState = { ...currentState, ...patch };
  for (const listener of listeners) {
    listener(currentState);
  }
}

export function subscribeWebContainer(listener: StateListener): () => void {
  listeners.add(listener);
  listener(currentState);
  return () => {
    listeners.delete(listener);
  };
}

export function getWebContainerState(): WebContainerState {
  return currentState;
}

/**
 * Squelette Vite + React + Tailwind + Lucide pré-installé dans le WebContainer
 * (inspiré du Starter Template de bolt.diy).
 */
const STARTER_TEMPLATE: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "sokoai-vite-store",
          private: true,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "vite --host 0.0.0.0 --port 5173",
            build: "vite build",
          },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.468.0",
          },
          devDependencies: {
            "@vitejs/plugin-react": "^4.3.4",
            vite: "^5.4.11",
          },
        },
        null,
        2
      ),
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Certains fichiers générés contiennent du JSX dans des .js : on force le loader JSX
  esbuild: {
    loader: 'jsx',
    include: /src\\/.*\\.(js|jsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
});
`,
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Boutique SokoAI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body { min-height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    },
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

window.React = React;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
        },
      },
      "App.jsx": {
        file: {
          contents: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white font-sans">
      <div className="text-center space-y-2">
        <div className="text-sm text-purple-400 font-semibold">WebContainer Vite + React actif</div>
        <div className="text-xs text-neutral-400">En attente des fichiers de la boutique…</div>
      </div>
    </div>
  );
}
`,
        },
      },
    },
  },
};

/**
 * Démarre le Singleton WebContainer + installe le template Vite une seule fois par onglet.
 */
export async function ensureWebContainerReady(): Promise<WebContainer> {
  if (typeof window === "undefined") {
    throw new Error("WebContainer ne peut démarrer que dans le navigateur");
  }

  // Si la page était déjà ouverte avant l'ajout des headers COOP/COEP (Fast Refresh)
  // ou issue d'une navigation client sans isolation, on force un rechargement unique
  // pour activer window.crossOriginIsolated (requis par SharedArrayBuffer).
  if (!window.crossOriginIsolated) {
    const reloadKey = "__soko_coi_reloaded__";
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
      return new Promise<WebContainer>(() => {});
    }
    const coiError =
      "Isolation Cross-Origin (SharedArrayBuffer) inactive — rechargez l'onglet (Cmd+Shift+R).";
    updateState({ phase: "error", error: coiError });
    throw new Error(coiError);
  } else {
    sessionStorage.removeItem("__soko_coi_reloaded__");
  }

  if (window.__SOKO_WC_INSTANCE__) {
    return window.__SOKO_WC_INSTANCE__;
  }

  if (!window.__SOKO_WC_PROMISE__) {
    window.__SOKO_WC_PROMISE__ = (async () => {
      updateState({ phase: "booting", error: null });
      const { WebContainer: WC } = await import("@webcontainer/api");
      const instance = await WC.boot({
        coep: "credentialless",
        workdirName: "soko-store",
        forwardPreviewErrors: true,
      });
      window.__SOKO_WC_INSTANCE__ = instance;

      instance.on("preview-message", (msg) => {
        if (
          msg.type === "PREVIEW_UNCAUGHT_EXCEPTION" ||
          msg.type === "PREVIEW_UNHANDLED_REJECTION"
        ) {
          updateState({
            lastPreviewError: msg.message || "Erreur runtime dans l'aperçu",
          });
        }
      });

      await instance.mount(STARTER_TEMPLATE);

      updateState({ phase: "installing" });
      const installProcess = await instance.spawn("npm", [
        "install",
        "--no-audit",
        "--no-fund",
        "--prefer-offline",
      ]);
      const installExit = await installProcess.exit;
      if (installExit !== 0) {
        throw new Error(`npm install a échoué (code ${installExit})`);
      }

      updateState({ phase: "starting" });
      window.__SOKO_WC_DEV_READY__ = new Promise<string>((resolve) => {
        instance.on("server-ready", (_port, url) => {
          updateState({ phase: "ready", previewUrl: url, error: null });
          resolve(url);
        });
      });

      // Démarre Vite en tâche de fond et capte les logs/erreurs
      const devProc = await instance.spawn("npm", ["run", "dev"]);
      void devProc.output.pipeTo(
        new WritableStream({
          write(data) {
            if (/error|failed|exception/i.test(data)) {
              console.warn("[WebContainer Vite]", data);
            }
          },
        })
      );
      await window.__SOKO_WC_DEV_READY__;
      return instance;
    })().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      updateState({ phase: "error", error: msg });
      // IMPORTANT : ne jamais remettre __SOKO_WC_PROMISE__ à undefined après WC.boot(),
      // car @webcontainer/api interdit un second appel à boot() ("Unable to create more instances").
      throw err;
    });
  }

  return window.__SOKO_WC_PROMISE__;
}

/**
 * Vrai si le chemin correspond à un module JS/TS (les .css/.json/.svg ne doivent jamais être transformés).
 */
export function isTransformableModule(filePath: string): boolean {
  return /\.(jsx?|tsx?|mjs)$/i.test(filePath);
}

/**
 * Trouve l'index de la parenthèse/accolade fermante correspondante en ignorant
 * les chaînes et littéraux (approximation suffisante pour du code généré).
 */
function findMatchingClose(code: string, openIdx: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "}" || ch === "]") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Supprime les montages top-level éventuellement générés dans un composant
 * (`ReactDOM.createRoot(...).render(...)`, `const root = createRoot(...); root.render(<App/>)`, …),
 * qui font planter le module car l'élément n'existe pas au moment de l'import.
 */
const MOUNT_CALL_PATTERNS: RegExp[] = [
  /(?:window\.)?(?:ReactDOM|ReactDOMClient)\s*\.\s*(?:createRoot|hydrateRoot|render)\s*\(/g,
  /(?<![\w.$])createRoot\s*\(/g,
  /(?<![\w.$])hydrateRoot\s*\(/g,
  /(?<![\w.$])(?:window\.)?([\w$]{1,24})\.render\s*\(/g,
];

function isJsxMountCall(code: string, openParenIdx: number): boolean {
  let i = openParenIdx + 1;
  while (i < code.length && /\s/.test(code[i])) i += 1;
  return code[i] === "<";
}

function stripReactDomMounts(code: string): string {
  let out = code;

  for (let guard = 0; guard < 40; guard++) {
    let found: { index: number; openIdx: number } | null = null;

    for (const pattern of MOUNT_CALL_PATTERNS) {
      pattern.lastIndex = 0;
      const match = pattern.exec(out);
      if (!match) continue;
      const openIdx = out.indexOf("(", match.index + match[0].length - 1);
      if (openIdx === -1) continue;
      if (!isJsxMountCall(out, openIdx)) continue;
      found = { index: match.index, openIdx };
      break;
    }

    if (!found) break;

    const closeIdx = findMatchingClose(out, found.openIdx);
    if (closeIdx === -1) break;

    let end = closeIdx + 1;
    // Chaînes éventuelles : .render(...) / .unmount()
    for (;;) {
      const rest = out.slice(end);
      const chain = /^\s*\.\s*(?:render|unmount)\s*\(/.exec(rest);
      if (!chain) break;
      const chOpen = end + chain[0].length - 1;
      const chClose = findMatchingClose(out, chOpen);
      if (chClose === -1) break;
      end = chClose + 1;
    }

    let start = found.index;
    const lineStart = out.lastIndexOf("\n", start) + 1;
    const prefix = out.slice(lineStart, start);
    if (
      /^\s*(?:(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*|[A-Za-z_$][\w$]*\s*=\s*|return\s*)$/.test(prefix) &&
      /^\s*(?:(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*|[A-Za-z_$][\w$]*\s*=\s*)$/.test(prefix)
    ) {
      start = lineStart;
    }

    while (out[end] === ";" || out[end] === " " || out[end] === "\t") end += 1;
    if (out[end] === "\n") end += 1;

    out = out.slice(0, start) + out.slice(end);
  }

  // Assertions résiduelles du style `root.render(<App/>)` déjà Vue/React-style non couvertes
  return out;
}

const GLOBAL_IDENTIFIERS = new Set([  "Array", "Boolean", "Date", "Error", "Event", "Function", "Intl", "JSON", "Map", "Math",
  "Number", "Object", "Promise", "Proxy", "Reflect", "RegExp", "Set", "String", "Symbol",
  "WeakMap", "WeakSet", "Infinity", "NaN", "URL", "URLSearchParams", "FormData", "Blob",
  "File", "Image", "Audio", "Worker", "Node", "Element", "HTMLElement", "TextEncoder",
  "alert", "atob", "btoa", "cancelAnimationFrame", "clearInterval", "clearTimeout",
  "console", "decodeURI", "decodeURIComponent", "document", "encodeURI", "encodeURIComponent",
  "fetch", "history", "isFinite", "isNaN", "location", "matchMedia", "navigator", "parseFloat",
  "parseInt", "performance", "prompt", "requestAnimationFrame", "screen", "scrollTo",
  "sessionStorage", "setInterval", "setTimeout", "structuredClone", "window",
  "require", "module", "exports", "process",
]);

const KEYWORDS = new Set([
  "if", "for", "while", "switch", "catch", "return", "typeof", "function", "new", "await",
  "super", "this", "async", "of", "in", "do", "else", "try", "finally", "throw", "delete",
  "void", "yield", "constructor", "import", "export", "default", "class", "extends",
]);

/** Symboles fournis par l'en-tête commun de chaque module transformé. */
const HEADER_BINDINGS = new Set([
  "React", "ReactDOM", "Fragment", "Suspense", "StrictMode", "createContext", "forwardRef",
  "memo", "lazy", "startTransition", "useState", "useEffect", "useMemo", "useRef",
  "useCallback", "useContext", "useReducer", "useLayoutEffect", "useId", "useTransition",
  "useDeferredValue", "useImperativeHandle", "useDebugValue", "useSyncExternalStore",
]);

/**
 * Retire chaînes de caractères et commentaires avant l'analyse des identifiants,
 * en conservant le contenu des expressions `${...}` des template literals.
 */
function sanitizeForScan(code: string): string {
  let out = "";
  let i = 0;

  const skipQuoted = (quote: string) => {
    out += " ";
    i += 1;
    while (i < code.length) {
      if (code[i] === "\\") {
        i += 2;
        continue;
      }
      if (code[i] === quote) {
        i += 1;
        break;
      }
      if (code[i] === "\n") out += "\n";
      i += 1;
    }
    out += " ";
  };

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (ch === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const prev = code[i - 1] || "";
      const after = code[i + 1] || "";
      // Apostrophe dans du texte JSX (l'atelier, d'Abidjan) ≠ début de chaîne
      if (ch === "'" && /[A-Za-zÀ-ÿ0-9]/.test(prev) && /[A-Za-zÀ-ÿ0-9]/.test(after)) {
        out += ch;
        i += 1;
        continue;
      }
      skipQuoted(ch);
      continue;
    }
    if (ch === "`") {
      out += " ";
      i += 1;
      while (i < code.length) {
        if (code[i] === "\\") {
          i += 2;
          continue;
        }
        if (code[i] === "`") {
          i += 1;
          break;
        }
        if (code[i] === "$" && code[i + 1] === "{") {
          let depth = 0;
          const start = i;
          while (i < code.length) {
            if (code[i] === "{") depth += 1;
            else if (code[i] === "}") {
              depth -= 1;
              if (depth === 0) {
                i += 1;
                break;
              }
            }
            i += 1;
          }
          out += ` ${code.slice(start + 2, i - 1)} `;
          continue;
        }
        if (code[i] === "\n") out += "\n";
        i += 1;
      }
      out += " ";
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}


/**
 * Prépare un fichier React généré pour qu'il fonctionne dans Vite ES Modules :
 * - Conserve les imports/exports ESM (Vite résout la vraie dépendance, plus de course window)
 * - Garantit exports nommés + default (les LLM mélangent souvent les deux styles)
 * - Injecte un fallback paresseux via window pour les composants/connexions oubliés
 */

/**
 * Réécrit les imports relatifs d'un fichier pour pointer vers un chemin réellement écrit,
 * tolérance de casse et d'extension (le LLM écrit parfois ./components/navbar pour Navbar.jsx).
 * Sans cela, Vite sert l'index.html de fallback pour le module et la page est blanche.
 */

/**
 * Crée des modules de repli pour les imports relatifs qui pointent vers des fichiers
 * absents du projet (le LLM écrit parfois `import { ProductCard } from './components/ProductCard'`
 * sans générer le fichier). Sans stub, Vite sert l'index.html pour le module -> page blanche.
 */
export function buildImportStubs(
  files: ReactProjectFile[]
): { contentByPath: Map<string, string>; files: ReactProjectFile[] } {
  const contentByPath = new Map<string, string>();
  const withStubs: ReactProjectFile[] = files.map((f) => ({ path: f.path, content: f.content }));

  const index = new Map<string, string>();
  for (const f of withStubs) {
    index.set(f.path.toLowerCase(), f.path);
    index.set(f.path.replace(/\.(jsx?|tsx?|mjs)$/i, "").toLowerCase(), f.path);
  }

  const extensions = [".jsx", ".js", ".tsx", ".ts", ".mjs"];
  const resolve = (candidate: string): string | null => {
    const noExt = candidate.replace(/\.(jsx?|tsx?|mjs)$/i, "");
    const keys = [candidate.toLowerCase(), noExt.toLowerCase()];
    for (const key of keys) if (index.has(key)) return index.get(key)!;
    for (const ext of extensions) {
      const hit = index.get(noExt.toLowerCase() + ext);
      if (hit) return hit;
    }
    return null;
  };

  // Extraction des noms importés : tolère les imports multi-lignes
  // (`import {\n  X,\n} from '...'` est courant chez le LLM).
  const parseImportedNames = (importText: string): { names: string[]; defaultName: string | null } => {
    const names: string[] = [];
    let defaultName: string | null = null;
    const compact = importText.replace(/\n/g, " ");
    const head = /\bimport\s+(?:([\w$]+)\s*,\s*)?(?:\{([\s\S]*?)\}|\*\s+as\s+([\w$]+)|([\w$]+))?\s*(?:from\s*)?["'][^"']+["']/.exec(
      compact
    );
    if (head) {
      if (head[1]) defaultName = head[1];
      else if (head[4] && !head[3]) defaultName = head[4];
      const braces = head[2];
      if (braces) {
        for (const part of braces.split(",")) {
          const pieces = part.trim().split(/\s+as\s+/);
          const imported = (pieces[0] || "").trim();
          if (imported && imported !== "default") names.push(imported);
        }
      }
      if (head[3]) names.push(head[3]);
    }
    return { names, defaultName };
  };

  // Import statique (static ou multi-lignes) + import dynamique `import('...')
  const IMPORT_SPEC_RE = /(\bimport\s[\s\S]{0,300}?\bfrom\s*|\bimport\s*\(\s*)(["'])(\.\.?\/[^"']+)\2/g;

  const stubs: Map<string, { names: Set<string>; defaults: Set<string>; spec: string; extless: boolean }> = new Map();

  for (const file of withStubs) {
    const fileDir = file.path.split("/").slice(0, -1).join("/");

    IMPORT_SPEC_RE.lastIndex = 0;
    for (let m = IMPORT_SPEC_RE.exec(file.content); m; m = IMPORT_SPEC_RE.exec(file.content)) {
      const spec = m[3];
      const baseParts = (spec.startsWith("/") ? [] : fileDir.split("/"))
        .filter(Boolean)
        .concat(spec.replace(/^\/+/, "").split("/"));
      const segments: string[] = [];
      for (const part of baseParts) {
        if (part === "." || part === "") continue;
        if (part === "..") segments.pop();
        else segments.push(part);
      }
      const candidate = segments.join("/");
      if (!candidate || resolve(candidate)) continue;

      const extless = !/\.(jsx?|tsx?|mjs)$/i.test(candidate);
      // Vite résout dans l'ordre .mjs .js .mts .ts .jsx .tsx : pour une cible
      // sans extension, `.js` gagne — on écrit donc soit la cible explicite,
      // soit `X.js` (+ `X.jsx` en copie) pour couvrir les deux arbres de résolution.
      const target = extless ? candidate + ".js" : candidate;

      const context = file.content.slice(m.index, m.index + m[0].length + 200);
      const { names, defaultName } = parseImportedNames(context);

      const existing = stubs.get(target) || {
        names: new Set<string>(),
        defaults: new Set<string>(),
        spec,
        extless,
      };
      for (const n of names) existing.names.add(n);
      if (defaultName) existing.defaults.add(defaultName);
      stubs.set(target, existing);
    }
  }

  for (const [target, info] of stubs) {
    const lines: string[] = [`// SokoAI stub : module non généré (${info.spec})`, `import React from 'react';`];
    for (const name of info.names) {
      if (/^[A-Z][A-Z0-9_]{2,}$/.test(name)) {
        const alias = name.toLowerCase();
        lines.push(
          `export const ${name} = (typeof window !== 'undefined' ? (window.${name} || window.${alias}) : null) || [];`
        );
      } else {
        lines.push(
          `export const ${name} = (...args) => { const v = (typeof window !== 'undefined' ? window.${name} : null); if (typeof v === 'function') return v(...args); return (v && v.$$typeof) ? React.createElement(v, args[0]) : null; };`
        );
      }
    }
    const defaultName = [...info.defaults][0];
    const fallback = defaultName
      ? `window[${JSON.stringify(defaultName)}] || window[${JSON.stringify(defaultName.toLowerCase())}]`
      : "window.__SOKO_APP__";
    lines.push(`export default (typeof window !== 'undefined' ? (${fallback} || null) : null) || (() => null);`);

    const content = lines.join("\n") + "\n";
    contentByPath.set(target, content);
    if (info.extless) {
      contentByPath.set(target.replace(/\.js$/, ".jsx"), content);
    }
  }

  for (const [stubPath, stubContent] of contentByPath) {
    withStubs.push({ path: stubPath, content: stubContent });
  }
  return { contentByPath, files: withStubs };
}

export function rewriteRelativeImports(
  content: string,
  filePath: string,
  realPaths: string[]
): string {
  if (realPaths.length === 0) return content;

  const index = new Map<string, string>();
  for (const real of realPaths) {
    const paths = [real.toLowerCase(), real.replace(/\.(jsx?|tsx?|mjs)$/i, "").toLowerCase()];
    for (const key of paths) {
      if (!index.has(key)) index.set(key, real);
    }
  }

  const extensions = ["", ".jsx", ".js", ".tsx", ".ts", ".mjs"];
  const fileDir = filePath.split("/").slice(0, -1).join("/");

  const lookup = (candidate: string): string | null => {
    const noExt = candidate.replace(/\.(jsx?|tsx?|mjs)$/i, "").toLowerCase();
    if (index.has(noExt)) return index.get(noExt)!;
    if (index.has(candidate.toLowerCase())) return index.get(candidate.toLowerCase())!;
    for (const ext of extensions.slice(1)) {
      const hit = index.get(noExt + ext);
      if (hit) return hit;
    }
    return null;
  };

  return content.replace(
    /\b(from\s*|import\s*|export\s*\*\s+from\s*)["'](\.\.?\/[^"']+)["']/g,
    (match, prefix: string, specifier: string) => {
      const baseParts = (specifier.startsWith("/") ? [] : fileDir.split("/"))
        .filter(Boolean)
        .concat(specifier.replace(/^\/+/, "").split("/"));
      const segments: string[] = [];
      for (const part of baseParts) {
        if (part === "." || part === "") continue;
        if (part === "..") {
          segments.pop();
        } else {
          segments.push(part);
        }
      }

      const candidate = segments.join("/");
      const actual = lookup(candidate);
      // Ne réécrit que si la cible réelle diffère (cas, extension, chemin)
      if (!actual || actual === candidate) {
        return match;
      }

      const fromParts = fileDir.split("/").filter(Boolean);
      const toParts = actual.split("/");
      let i = 0;
      while (i < fromParts.length && i < toParts.length - 1 && fromParts[i] === toParts[i]) i += 1;
      const ups = Math.max(0, fromParts.length - i);
      const rel = [...Array(ups).fill(".."), ...toParts.slice(i)].join("/") || "./" + toParts[toParts.length - 1];
      const normalized = rel.startsWith(".") ? rel : "./" + rel;

      return `${prefix}${JSON.stringify(normalized)}`;
    }
  );
}

export function prepareModuleFile(filePath: string, rawContent: string): string {
  let code = stripReactDomMounts(rawContent.trim());

  // 1. Neutraliser les imports/déclarations React redondants (le header les fournit)
  code = code
    .replace(/^\s*import\s+[^\n;]*from\s+["']react["']\s*;?\s*$/gm, "")
    .replace(/^\s*import\s+[^\n;]*from\s+["']react-dom(?:\/client)?["']\s*;?\s*$/gm, "")
    .replace(/^\s*(?:const|let|var)\s*\{[^}]*\}\s*=\s*(?:window\.)?React\s*;?\s*$/gm, "");

  // 2. Icônes lucide : import namespace + repli, pour qu'une icône inexistante
  //    (WhatsApp, TikTok…) ne casse pas tout le module en ESM strict.
  code = code.replace(
    /^\s*import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']\s*;?\s*$/gm,
    (_match, names: string) => {
      const bindings: string[] = [];
      for (const part of names.split(",")) {
        const pieces = part.trim().split(/\s+as\s+/);
        const importedName = pieces[0]?.trim();
        const localName = (pieces[1] || pieces[0] || "").trim();
        if (!importedName || !localName) continue;
        bindings.push(`const ${localName} = __lucide.${importedName} || ((props) => null);`);
      }
      return [`import * as __lucide from 'lucide-react';`, ...bindings].join("\n");
    }
  );

  // 3. Inventaire des imports restants (relatifs + packages)
  const importedNames = new Set<string>();
  for (const m of code.matchAll(
    /^\s*import\s+(?:type\s+)?(?:([\w$]+)\s*,\s*)?(?:\{([^}]*)\}|\*\s+as\s+([\w$]+)|([\w$]+))?\s*from\s*["'][^"']+["']/gm
  )) {
    if (m[1]) importedNames.add(m[1]);
    if (m[2]) {
      for (const part of m[2].split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) importedNames.add(name);
      }
    }
    if (m[3]) importedNames.add(m[3]);
    if (m[4]) importedNames.add(m[4]);
  }

  // 4. Déclarations : top-level (pour les exports) + partout (pour éviter les faux positifs)
  const scan = sanitizeForScan(code);
  const topLevelDecls = new Set<string>();
  const declaredAnywhere = new Set<string>();

  const addDecl = (raw: string | undefined, topLevel: boolean) => {
    const clean = raw?.trim().replace(/^\.\.\./, "").split(/[:=]/)[0]?.trim();
    if (clean && /^[A-Za-z_$][\w$]*$/.test(clean) && clean !== "React") {
      declaredAnywhere.add(clean);
      if (topLevel) topLevelDecls.add(clean);
    }
  };

  for (const m of code.matchAll(
    /^(?:export\s+(?:default\s+)?)?(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)\b/gm
  )) {
    addDecl(m[1], true);
  }

  // Déstructurations top-level : const { a, b: c } = obj / const [x, y] = arr
  for (const m of code.matchAll(/^(?:export\s+)?(?:const|let|var)\s*(?:\{([^}]*)\}|\[([^\]]*)\])\s*=/gm)) {
    for (const part of (m[1] || m[2] || "").split(",")) addDecl(part, true);
  }

  // Déclarations et déstructurations locales (n'importe quelle indentation)
  for (const m of code.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    addDecl(m[1], false);
  }
  for (const m of code.matchAll(/\b(?:const|let|var)\s*(?:\{([^}]*)\}|\[([^\]]*)\])\s*=/g)) {
    for (const part of (m[1] || m[2] || "").split(",")) addDecl(part, false);
  }

  // Paramètres de fonctions et callbacks
  for (const m of scan.matchAll(/\(([^()]*)\)\s*(?:=>|\{)/g)) {
    for (const part of m[1].split(",")) addDecl(part, false);
  }
  for (const m of scan.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*=>/g)) {
    addDecl(m[1], false);
  }

  const header = [
    `import React from 'react';`,
    `import ReactDOM from 'react-dom/client';`,
    `const { useState, useEffect, useMemo, useRef, useCallback, useContext, useReducer, Fragment } = React;`,
    `if (typeof window !== 'undefined') { window.React = React; window.ReactDOM = ReactDOM; }`,
  ].join("\n");

  // 5. Fallback paresseux : identifiants utilisés mais ni importés ni déclarés
  //    (composant JSX ou fonction utilitaire défini dans un autre fichier)
  const freeComponents = new Set<string>();
  for (const m of scan.matchAll(/<([A-Z][\w$]*)(?!\s*\.)/g)) {
    const name = m[1];
    if (
      !declaredAnywhere.has(name) &&
      !importedNames.has(name) &&
      !GLOBAL_IDENTIFIERS.has(name) &&
      !HEADER_BINDINGS.has(name)
    ) {
      freeComponents.add(name);
    }
  }

  const freeFunctions = new Set<string>();
  for (const m of scan.matchAll(/(?<![\w$.])([a-z_$][\w$]*)\s*\(/g)) {
    const name = m[1];
    if (
      !KEYWORDS.has(name) &&
      !declaredAnywhere.has(name) &&
      !importedNames.has(name) &&
      !GLOBAL_IDENTIFIERS.has(name) &&
      !HEADER_BINDINGS.has(name) &&
      name.length > 2
    ) {
      freeFunctions.add(name);
    }
  }

  // Constantes globales en MAJUSCULES (PRODUCTS, STORE…) utilisées sans import
  const freeConstants = new Set<string>();
  for (const m of scan.matchAll(/(?<![\w$.'"`])([A-Z][A-Z0-9_]{2,})(?![\w$])(?!\s*:)/g)) {
    const name = m[1];
    if (
      !declaredAnywhere.has(name) &&
      !importedNames.has(name) &&
      !GLOBAL_IDENTIFIERS.has(name) &&
      !HEADER_BINDINGS.has(name) &&
      !freeComponents.has(name)
    ) {
      freeConstants.add(name);
    }
  }

  const fallbacks: string[] = [];
  for (const name of freeComponents) {
    fallbacks.push(
      `const ${name} = (props) => { const C = typeof window !== 'undefined' ? window.${name} : null; return C ? React.createElement(C, props) : null; };`
    );
  }
  for (const name of freeFunctions) {
    fallbacks.push(
      `const ${name} = (...args) => { const fn = typeof window !== 'undefined' ? window.${name} : undefined; return typeof fn === 'function' ? fn(...args) : undefined; };`
    );
  }
  for (const name of freeConstants) {
    const alias = name.toLowerCase();
    fallbacks.push(
      `const ${name} = (typeof window !== 'undefined' && (window.${name} || window.${alias})) || [];`
    );
  }

  // 6. Exports : nommés pour chaque déclaration + default
  const existingExports = new Set<string>();
  // `export default function X` ne crée PAS d'export nommé : X doit aussi être exporté nommément
  for (const m of code.matchAll(
    /^\s*export\s+(?!default\b)(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm
  )) {
    existingExports.add(m[1]);
  }
  for (const m of code.matchAll(/^\s*export\s*\{([^}]*)\}/gm)) {
    for (const part of m[1].split(",")) {
      const pieces = part.trim().split(/\s+as\s+/);
      const exportedAs = (pieces[1] || pieces[0] || "").trim();
      if (exportedAs && exportedAs !== "default") existingExports.add(exportedAs);
    }
  }

  const exportLines: string[] = [];
  const namedToExport = [...topLevelDecls].filter((n) => !existingExports.has(n) && !importedNames.has(n));
  if (namedToExport.length > 0) {
    exportLines.push(`export { ${namedToExport.join(", ")} };`);
  }

  // Alias camelCase pour les constantes en MAJUSCULES (PRODUCTS → products, STORE → store)
  const aliases: string[] = [];
  for (const name of topLevelDecls) {
    if (!/^[A-Z][A-Z0-9_]+$/.test(name)) continue;
    const alias = name.toLowerCase();
    if (alias === name || topLevelDecls.has(alias) || importedNames.has(alias)) continue;
    aliases.push(`${name} as ${alias}`);
  }
  if (aliases.length > 0) {
    exportLines.push(`export { ${aliases.join(", ")} };`);
  }

  const hasDefaultExport = /\bexport\s+default\b|as\s+default\b/.test(code);
  if (!hasDefaultExport) {
    const baseName = filePath.split("/").pop()?.replace(/\.(jsx|tsx|js|ts|mjs)$/i, "") || "";
    const candidate =
      (topLevelDecls.has(baseName) && baseName) ||
      (topLevelDecls.has("App") && "App") ||
      [...topLevelDecls].find((n) => /^[A-Z]/.test(n));
    if (candidate) {
      exportLines.push(`export default ${candidate};`);
    }
  }

  // 7. Exposer sur window pour compatibilité croisée (ancien shell, helpers globaux)
  const windowBindings: string[] = [];
  for (const name of topLevelDecls) {
    windowBindings.push(`if (typeof ${name} !== 'undefined') window.${name} = ${name};`);
  }

  if (filePath.includes("products")) {
    windowBindings.push(
      `if (typeof PRODUCTS !== 'undefined') { window.PRODUCTS = PRODUCTS; window.products = PRODUCTS; }`,
      `if (typeof STORE !== 'undefined') { window.STORE = STORE; window.store = STORE; }`
    );
  }

  if (filePath.includes("theme")) {
    windowBindings.push(
      `if (typeof SOKO_THEME !== 'undefined') window.SOKO_THEME = SOKO_THEME;`,
      `if (typeof SOKO_FONTS !== 'undefined') window.SOKO_FONTS = SOKO_FONTS;`
    );
  }

  return [header, ...fallbacks, code, ...windowBindings, ...exportLines].join("\n\n") + "\n";
}

/**
 * ActionRunner issu de bolt.diy (app/lib/runtime/action-runner.ts) :
 * Exécute séquentiellement les actions <boltAction type="file" | "shell"> dans le WebContainer.
 */
export class BoltActionRunner {
  private queue: Promise<void> = Promise.resolve();

  enqueue(action: BoltAction): Promise<void> {
    this.queue = this.queue.then(() => this.runAction(action)).catch((err) => {
      console.error("[BoltActionRunner] Erreur action:", err);
    });
    return this.queue;
  }

  private async runAction(action: BoltAction): Promise<void> {
    const instance = await ensureWebContainerReady();

    if (action.type === "file") {
      const normalizedPath = action.filePath.replace(/^\/+/, "");
      const folder = normalizedPath.split("/").slice(0, -1).join("/");
      if (folder) {
        await instance.fs.mkdir(folder, { recursive: true });
      }
      const prepared =
        normalizedPath.startsWith("src/") && isTransformableModule(normalizedPath)
          ? prepareModuleFile(normalizedPath, action.content)
          : action.content;
      await instance.fs.writeFile(normalizedPath, prepared);
      return;
    }

    if (action.type === "shell") {
      const proc = await instance.spawn("jsh", ["-c", action.content]);
      await proc.exit;
    }
  }
}

/**
 * Construit le point d'entrée Vite (src/main.jsx) : imports ordonnés, polices,
 * config Tailwind, intercepteur de navigation #/... et montage React.
 */
export function buildMainEntry(writtenPaths: string[], rev = Date.now()): string {
  // Ordonner les imports : theme -> data/products -> components -> App
  const orderWeight = (p: string) => {
    if (p.includes("theme")) return 1;
    if (p.includes("data/")) return 2;
    if (p.includes("components/Navbar")) return 3;
    if (p.includes("components/Hero")) return 4;
    if (p.includes("components/ProductCard")) return 5;
    if (p.includes("components/ProductGrid")) return 6;
    if (p.includes("components/Sections")) return 7;
    if (p.includes("components/Footer")) return 8;
    if (p.endsWith("App.jsx") || p.endsWith("App.tsx")) return 9;
    return 6;
  };

  const appPath = writtenPaths.find((p) => /^src\/App\.(jsx|tsx|js|ts)$/.test(p)) || "src/App.jsx";
  const sortedImports = writtenPaths
    .filter((p) => p.startsWith("src/") && p !== "src/main.jsx" && p !== appPath)
    .sort((a, b) => orderWeight(a) - orderWeight(b))
    .map((p) => `import './${p.replace(/^src\//, "")}';`)
    .join("\n");

  return `// SokoAI WebContainer build rev=${rev}
import React from 'react';
import ReactDOM from 'react-dom/client';
window.React = React;
window.ReactDOM = ReactDOM;

// Intercepteur d'ancres #/... pour le routeur hash dans l'iframe WebContainer
if (!window.__SOKO_HASH_INTERCEPTOR__) {
  window.__SOKO_HASH_INTERCEPTOR__ = true;
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentNode;
    if (!el || el.tagName !== 'A') return;
    var href = el.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;
    e.preventDefault();
    if (href.length < 2) return;
    location.hash = href;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, true);
}

${sortedImports}
import AppDefault from './${appPath.replace(/^src\//, "")}';

if (window.SOKO_FONTS) {
  const existingFont = document.getElementById('soko-google-fonts');
  const families = String(window.SOKO_FONTS).replace(/\\|/g, '&family=');
  const href = 'https://fonts.googleapis.com/css2?family=' + families + '&display=swap';
  if (existingFont) {
    existingFont.setAttribute('href', href);
  } else {
    const link = document.createElement('link');
    link.id = 'soko-google-fonts';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

if (window.SOKO_THEME && window.tailwind) {
  window.tailwind.config = window.SOKO_THEME;
}

const RootComp = AppDefault || window.__APP__ || window.App;
const container = document.getElementById('root');
if (!window.__SOKO_ROOT__) {
  window.__SOKO_ROOT__ = ReactDOM.createRoot(container);
}
if (RootComp) {
  window.__SOKO_ROOT__.render(React.createElement(RootComp, { key: ${rev} }));
}
`;
}

/**
 * Synchronise l'ensemble des fichiers d'une variante React dans le WebContainer actif.
 * Vite HMR met à jour l'iframe en < 50ms sans redémarrer le serveur ni réinstaller npm.
 */
export async function mountReactProjectFiles(files: ReactProjectFile[]): Promise<string> {
  if (currentState.phase === "error") {
    return "";
  }
  const instance = await ensureWebContainerReady();
  updateState({ lastPreviewError: null });

  // Purge : une variante précédente a pu écrire des modules que la variante
  // courante n'a plus (imports résolus vers du code périmé -> rendu faux).
  try {
    await instance.fs.rm("src", { recursive: true });
  } catch {
    // premier mount : src n'existe pas encore
  }

  // Stubs automatiques pour les imports vers des fichiers que le LLM n'a jamais créés
  // (sinon Vite sert l'index.html pour ces modules -> MIME text/html -> page blanche).
  const stubbed = buildImportStubs(files);

  await instance.fs.mkdir("src/components", { recursive: true });
  await instance.fs.mkdir("src/data", { recursive: true });

  const writtenPaths: string[] = [];
  const realPaths = stubbed.files.map((f) => f.path.replace(/^\/+/, ""));

  for (const file of stubbed.files) {
    const cleanPath = file.path.replace(/^\/+/, "");
    const dir = cleanPath.split("/").slice(0, -1).join("/");
    if (dir) {
      await instance.fs.mkdir(dir, { recursive: true });
    }
    let raw = file.content;
    if (cleanPath.startsWith("src/") && isTransformableModule(cleanPath)) {
      raw = rewriteRelativeImports(raw, cleanPath, realPaths);
      raw = prepareModuleFile(cleanPath, raw);
    }
    const content = raw;
    await instance.fs.writeFile(cleanPath, content);
    writtenPaths.push(cleanPath);
  }

  const mainEntry = buildMainEntry(writtenPaths);
  await instance.fs.writeFile("src/main.jsx", mainEntry);

  const state = getWebContainerState();
  return state.previewUrl || "";
}
