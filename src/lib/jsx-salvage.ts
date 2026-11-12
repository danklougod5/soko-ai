/**
 * Garde-fou syntaxique pour les fichiers React générés par LLM.
 *
 * Garantit qu'AUCUN module invalide n'atteint Vite : on utilise le vrai parseur
 * Babel (et non une heuristique). Si un fichier est cassé — typiquement coupé
 * par la limite de tokens au milieu d'une balise — on garde le plus long préfixe
 * qui compile, puis on redéclare les composants perdus (repli neutre) pour que
 * les imports des autres fichiers restent valides.
 *
 * Isomorphe : utilisé côté serveur (moteur de génération) ET navigateur (montage WebContainer).
 */
import { parse } from "@babel/parser";

export interface SyntaxIssue {
  line: number;
  col: number;
  message: string;
}

/** Retourne la première erreur de syntaxe du module JSX, ou null s'il est valide. */
export function findSyntaxIssue(code: string): SyntaxIssue | null {
  try {
    parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      allowReturnOutsideFunction: false,
      errorRecovery: false,
    });
    return null;
  } catch (e) {
    const err = e as { message?: string; loc?: { line: number; column: number } };
    return {
      line: err.loc?.line ?? 0,
      col: err.loc?.column ?? 0,
      message: err.message || String(e),
    };
  }
}

/** Noms déclarés au niveau racine (colonne 0), même si leur corps est tronqué. */
function topLevelNames(code: string): string[] {
  const names = new Set<string>();
  const re = /^(?:export\s+(?:default\s+)?)?(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of code.matchAll(re)) names.add(m[1]);
  return [...names];
}

/** Routeur de repli : recompose la boutique à partir des composants disponibles. */
const FALLBACK_APP = `
function App() {
  var readPage = function () { return ((location.hash.replace(/^#\\/?/, '') || 'accueil').split('?')[0]); };
  var state = React.useState(readPage());
  var page = state[0];
  var setPage = state[1];
  React.useEffect(function () {
    var go = function () { setPage(readPage()); };
    window.addEventListener('hashchange', go);
    return function () { window.removeEventListener('hashchange', go); };
  }, []);
  var pick = function () {
    for (var i = 0; i < arguments.length; i++) {
      var v = typeof window !== 'undefined' ? window[arguments[i]] : null;
      if (typeof v === 'function' && !v.__sokoMissing) return React.createElement(v, { key: arguments[i] });
    }
    return null;
  };
  var body;
  if (page === 'boutique') body = pick('BoutiquePage', 'ShopPage', 'ProductGrid');
  else if (page === 'histoire') body = pick('HistoirePage', 'AboutPage', 'StoryPage');
  else if (page === 'contact') body = pick('ContactPage', 'Contact');
  else body = pick('HomePage', 'AccueilPage') || [pick('Hero'), pick('ProductGrid'), pick('SignatureSection')];
  return React.createElement(React.Fragment, null, pick('Navbar', 'Header'), React.createElement('main', null, body), pick('Footer'));
}
`;

function missingDeclaration(name: string): string {
  if (/^[A-Z][A-Z0-9_]+$/.test(name)) {
    return `const ${name} = (typeof window !== 'undefined' && window.${name}) || [];`;
  }
  if (/^[A-Z]/.test(name)) {
    // Réutilise la version globale si un autre fichier la définit, sinon rendu neutre.
    return (
      `const ${name} = (props) => { const C = typeof window !== 'undefined' ? window.${name} : null; ` +
      `return (typeof C === 'function' && C !== ${name} && !C.__sokoMissing) ? React.createElement(C, props) : ((props && props.children) || null); };\n` +
      `${name}.__sokoMissing = true;`
    );
  }
  return `const ${name} = (...args) => undefined;`;
}

/**
 * Renvoie un module JSX garanti parsable. `salvaged` indique si une réparation
 * déterministe a été nécessaire.
 */
export function salvageModule(code: string, filePath: string): { code: string; salvaged: boolean } {
  if (!findSyntaxIssue(code)) return { code, salvaged: false };

  const originalNames = topLevelNames(code);
  const lines = code.split("\n");

  // Points de coupe candidats : fins de lignes non indentées (frontières d'instructions
  // racine). On part de la fin pour conserver le maximum de code valide.
  const candidates: number[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.length > 0 && !/^\s/.test(line)) candidates.push(i + 1);
  }

  let kept = "";
  let attempts = 0;
  for (const end of candidates) {
    if (attempts++ > 400) break;
    const prefix = lines.slice(0, end).join("\n");
    if (!findSyntaxIssue(prefix)) {
      kept = prefix;
      break;
    }
  }

  const keptNames = new Set(topLevelNames(kept));
  const isApp = /(^|\/)App\.(jsx?|tsx?)$/.test(filePath);
  const additions: string[] = [];

  for (const name of originalNames) {
    if (keptNames.has(name)) continue;
    if (isApp && name === "App") continue;
    additions.push(missingDeclaration(name));
  }
  if (isApp && !keptNames.has("App")) {
    additions.push(FALLBACK_APP.trim());
    if (!/\bexport\s+default\b/.test(kept)) additions.push("export default App;");
  }

  const repaired = [
    kept,
    `// SokoAI : fichier tronqué par l'IA, réparé automatiquement (${filePath})`,
    ...additions,
  ]
    .filter(Boolean)
    .join("\n\n");

  // Ultime sécurité : si même la réparation ne parse pas, module minimal sûr.
  if (findSyntaxIssue(repaired)) {
    const safe = originalNames
      .filter((n) => !(isApp && n === "App"))
      .map(missingDeclaration);
    if (isApp) safe.push(FALLBACK_APP.trim(), "export default App;");
    return { code: safe.join("\n\n") + "\n", salvaged: true };
  }

  return { code: repaired + "\n", salvaged: true };
}
