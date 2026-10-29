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
 * Prépare un fichier React généré pour qu'il fonctionne dans Vite ES Modules :
 * - Conserve les vrais import/export ES6 (style bolt.diy)
 * - Expose aussi les symboles définis sur window.* pour compatibilité croisée entre fichiers
 */
function prepareModuleFile(filePath: string, rawContent: string): string {
  let code = rawContent.trim();

  // 1. Supprimer les montages ReactDOM parasites dans les composants
  code = code
    .replace(/(?:const\s+\w+\s*=\s*)?(?:window\.)?ReactDOM\s*\.[\s\S]*?(?:\.render\s*\([\s\S]*?\))?\s*;?/g, (match) => {
      if (match.includes("createRoot") || match.includes("render")) return "";
      return match;
    })
    .replace(/ReactDOMClient\s*\.\s*createRoot[\s\S]*?;/g, "");

  // 2. Supprimer les imports/déclarations React redondants pour éviter "Identifier 'useState' has already been declared"
  code = code
    .replace(/^\s*import\s+[^\n;]*from\s+["']react["']\s*;?\s*$/gm, "")
    .replace(/^\s*import\s+[^\n;]*from\s+["']react-dom(?:\/client)?["']\s*;?\s*$/gm, "")
    .replace(/(?:const|let|var)\s*\{[^}]*\}\s*=\s*(?:window\.)?React\s*;?/g, "")
    // Supprimer les imports relatifs internes (les composants et données sont déjà chargés dans l'ordre par main.jsx et exposés sur window)
    .replace(/^\s*import\s+[^\n;]*from\s+["']\.\.?\/[^"']+["']\s*;?\s*$/gm, "");

  const header = [
    `import React from 'react';`,
    `import ReactDOM from 'react-dom/client';`,
    `window.React = React;`,
    `window.ReactDOM = ReactDOM;`,
    `const { useState, useEffect, useMemo, useRef, useCallback, useContext, useReducer, Fragment } = React;`,
  ].join("\n");

  // 2. Collecter toutes les déclarations top-level (composants PascalCase, constantes et helpers) pour les exposer sur window
  const topLevelDecls = new Set<string>();
  for (const m of code.matchAll(/^(?:export\s+(?:default\s+)?)?(?:const|let|var|function)\s+([A-Za-z_]\w*)\b/gm)) {
    const name = m[1];
    if (name !== "React") {
      topLevelDecls.add(name);
    }
  }

  const hasDefaultExport = /\bexport\s+default\b/.test(code);
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
      `if (typeof SOKO_THEME !== 'undefined' && !window.SOKO_THEME) window.SOKO_THEME = SOKO_THEME;`,
      `if (typeof SOKO_FONTS !== 'undefined' && !window.SOKO_FONTS) window.SOKO_FONTS = SOKO_FONTS;`
    );
  }

  // 3. Ajouter un export default si absent (notamment pour App.jsx)
  if (!hasDefaultExport) {
    const baseName = filePath.split("/").pop()?.replace(/\.(jsx|tsx|js|ts)$/, "") || "";
    const candidate =
      (topLevelDecls.has(baseName) && baseName) ||
      (topLevelDecls.has("App") && "App") ||
      [...topLevelDecls].find((n) => /^[A-Z]/.test(n));
    if (candidate) {
      windowBindings.push(`export default ${candidate};`);
    }
  }

  return `${header}\n\n${code}\n\n${windowBindings.join("\n")}\n`;
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
      const prepared = normalizedPath.startsWith("src/")
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
 * Synchronise l'ensemble des fichiers d'une variante React dans le WebContainer actif.
 * Vite HMR met à jour l'iframe en < 50ms sans redémarrer le serveur ni réinstaller npm.
 */
export async function mountReactProjectFiles(files: ReactProjectFile[]): Promise<string> {
  if (currentState.phase === "error") {
    return "";
  }
  const instance = await ensureWebContainerReady();
  updateState({ lastPreviewError: null });

  await instance.fs.mkdir("src/components", { recursive: true });
  await instance.fs.mkdir("src/data", { recursive: true });

  const writtenPaths: string[] = [];

  for (const file of files) {
    const cleanPath = file.path.replace(/^\/+/, "");
    const dir = cleanPath.split("/").slice(0, -1).join("/");
    if (dir) {
      await instance.fs.mkdir(dir, { recursive: true });
    }
    const content = cleanPath.startsWith("src/")
      ? prepareModuleFile(cleanPath, file.content)
      : file.content;
    await instance.fs.writeFile(cleanPath, content);
    writtenPaths.push(cleanPath);
  }

  // Ordonner les imports dans src/main.jsx : theme -> data/products -> components -> App
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

  const rev = Date.now();
  const sortedImports = writtenPaths
    .filter((p) => p.startsWith("src/") && p !== "src/main.jsx" && !p.endsWith("App.jsx") && !p.endsWith("App.tsx"))
    .sort((a, b) => orderWeight(a) - orderWeight(b))
    .map((p) => `import './${p.replace(/^src\//, "")}';`)
    .join("\n");

  const mainEntry = `// SokoAI WebContainer build rev=${rev}
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
import AppDefault from './App.jsx';

if (window.SOKO_FONTS) {
  const existingFont = document.getElementById('soko-google-fonts');
  const href = 'https://fonts.googleapis.com/css2?family=' + window.SOKO_FONTS + '&display=swap';
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

  await instance.fs.writeFile("src/main.jsx", mainEntry);

  const state = getWebContainerState();
  return state.previewUrl || "";
}
