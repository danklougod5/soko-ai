import type { ReactProjectFile } from "./react-project-engine";

/**
 * Shell d'exécution du projet React généré : React 18 UMD + Babel standalone
 * + Tailwind CDN.
 *
 * Exécution robuste et isolée :
 * 1. Chaque fichier est nettoyé de ses imports/exports ES et montages parasites.
 * 2. Les symboles globaux (STORE, PRODUCTS, Icônes Lucide) sont pré-initialisés sur window.
 * 3. Chaque fichier est transpilé et exécuté individuellement, attachant ses composants sur window.
 * 4. Si un fichier a un problème local, les autres continuent de fonctionner et un fallback neutre est utilisé.
 * 5. Le composant App racine est rendu dans le DOM.
 */
export function buildReactShell(files: ReactProjectFile[]): string {
  const safeJson = JSON.stringify(files).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Boutique</title>
<script src="https://cdn.tailwindcss.com"></script>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
  [x-cloak], .soko-boot { display: none; }
  html, body { min-height: 100%; overflow-x: hidden; }
</style>
</head>
<body>
<div id="root"></div>
<script type="application/json" id="soko-files">${safeJson}</script>
<script>
(function(){
  var files = JSON.parse(document.getElementById("soko-files").textContent);

  // Routage par hash dans l'iframe srcdoc
  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el.tagName !== "A") { el = el.parentNode; }
    if (!el || el.tagName !== "A") return;
    var href = el.getAttribute("href") || "";
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
    e.preventDefault();
    var clean = href;
    while (clean.startsWith("/") || clean.startsWith("#")) {
      clean = clean.slice(1);
    }
    var hash = clean ? "#/" + clean : "#/";
    if (location.hash !== hash) {
      location.hash = hash;
    }
    try {
      var ev = document.createEvent("Event");
      ev.initEvent("hashchange", true, false);
      window.dispatchEvent(ev);
    } catch (err) {}
  }, true);

  var sokoHidden = document.createElement("div");
  window.SOKO_el = function (id) {
    var el = document.getElementById(id);
    return el ? el : sokoHidden;
  };

  // Initialisations globales indispensables pour les composants
  window.STORE = window.STORE || {
    name: "Ma Boutique",
    city: "Abidjan",
    whatsapp: "2250700000000",
    tagline: "Votre boutique en ligne",
    horaires: "7j/7 de 8h à 20h",
    zonesLivraison: ["Abidjan", "Intérieur"],
    moyensPaiement: ["Wave", "Orange Money", "MTN MoMo", "Paiement à la livraison"]
  };
  window.store = window.STORE;
  window.PRODUCTS = window.PRODUCTS || [];
  window.products = window.PRODUCTS;

  // Repli universel pour les icônes lucide-react
  var commonIcons = [
    "ShoppingBag", "Menu", "X", "Phone", "Mail", "MapPin", "Clock", "ChevronRight", "ChevronDown",
    "ChevronLeft", "ChevronUp", "Check", "Star", "Truck", "Sparkles", "Heart", "Search", "Filter",
    "ArrowRight", "ExternalLink", "ShieldCheck", "CreditCard", "Share2", "Eye", "Plus", "Minus",
    "Maximize2", "Minimize2", "Info", "AlertCircle", "HelpCircle", "Send", "Sliders", "Tag",
    "Facebook", "Instagram", "Twitter", "Youtube", "MessageCircle", "Package", "Lock", "Award"
  ];
  window.__lucideIcon = function(props) {
    var cls = (props && props.className) || "w-4 h-4 inline-block";
    return React.createElement("span", { className: cls, style: { display: "inline-flex", alignItems: "center", justifyContent: "center" } }, "●");
  };
  commonIcons.forEach(function(name) {
    window[name] = window[name] || window.__lucideIcon;
  });
  if (typeof Proxy !== "undefined") {
    window.__lucideProxy = new Proxy({}, {
      get: function(t, p) { return window[p] || window.__lucideIcon; }
    });
  }

  function cleanCodeForShell(code) {
    var src = code
      .replace(/<[^<>]*\uFF5C[^<>]*>/g, "")
      .replace(/<>/g, "<React.Fragment>")
      .replace(/<\/>/g, "</React.Fragment>")
      .replace(/\\bimport\\s+[\\s\\S]*?from\\s*["\\x27][^"\\x27]+["\\x27]\\s*;?/g, "")
      .replace(/\\bimport\\s*["\\x27][^"\\x27]+["\\x27]\\s*;?/g, "")
      .replace(/(?:(?:var|let|const)\\s+\\w+\\s*=\\s*)?(?:window\\.)?ReactDOMClient\\s*\\.\\s*createRoot\\s*\\([\\s\\S]*?\\)\\s*\\.\\s*render\\s*\\([\\s\\S]*?\\)\\s*;?/g, "")
      .replace(/(?:(?:var|let|const)\\s+\\w+\\s*=\\s*)?(?:window\\.)?ReactDOM\\s*\\.\\s*createRoot\\s*\\([\\s\\S]*?\\)\\s*\\.\\s*render\\s*\\([\\s\\S]*?\\)\\s*;?/g, "")
      .replace(/(?:(?:var|let|const)\\s+\\w+\\s*=\\s*)?(?:window\\.)?ReactDOM\\s*\\.\\s*render\\s*\\([\\s\\S]*?\\)\\s*;?/g, "")
      .replace(/(?:var|let|const)\\s+\\w+\\s*=\\s*(?:window\\.)?(?:ReactDOM|ReactDOMClient)\\.createRoot\\([\\s\\S]*?\\)\\s*;?/g, "")
      .replace(/\\broot\\s*\\.\\s*render\\s*\\([\\s\\S]*?\\)\\s*;?/g, "")
      .replace(/\\bexport\\s+default\\s+(function\\*?|class)\\s+([A-Za-z0-9_$]+)/g, "$1 $2")
      .replace(/\\bexport\\s+default\\s+([A-Za-z0-9_$]+)\\s*;?/g, "/* export default $1 */")
      .replace(/\\bexport\\s+default\\s+/g, "var __SOKO_DEFAULT__ = ")
      .replace(/\\bexport\\s*\\{[\\s\\S]*?\\}\\s*;?/g, "")
      .replace(/\\bexport\\s+(?:async\\s+)?(?:const|let|var|function\\*?|class)\\s+/g, "var ")
      .replace(/\\b(const|let)\\s/g, "var ");

    src = src.replace(/document\\.getElementById\\(\\s*(['"])([^'"]*)\\1\\s*\\)/g, function (m, q, id) {
      return "SOKO_el(" + JSON.stringify(id) + ")";
    });

    var decls = [];
    var m1;
    var reVar = /\\bvar\\s+([A-Za-z0-9_$]+)\\s*=/g;
    while ((m1 = reVar.exec(src)) !== null) {
      decls.push("try { if (typeof " + m1[1] + " !== 'undefined') window." + m1[1] + " = " + m1[1] + "; } catch (e) {}");
    }
    var m2;
    var reFn = /\\bfunction\\s+([A-Za-z0-9_$]+)\\s*\\(/g;
    while ((m2 = reFn.exec(src)) !== null) {
      decls.push("try { if (typeof " + m2[1] + " !== 'undefined') window." + m2[1] + " = " + m2[1] + "; } catch (e) {}");
    }
    return src + "\\n" + decls.join("\\n");
  }

  // Exécution sécurisée module par module
  var executionErrors = [];
  files.forEach(function(f) {
    if (!/\\.(jsx|js|tsx|ts)$/i.test(f.path)) return;
    try {
      var cleaned = cleanCodeForShell(f.content);
      var compiled = Babel.transform(cleaned, {
        presets: [["react", { runtime: "classic" }]],
        filename: f.path
      }).code;
      var runner = new Function(
        "React",
        "ReactDOM",
        "var useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo, useRef = React.useRef, useCallback = React.useCallback;\\n" +
        "var STORE = window.STORE, store = window.STORE, PRODUCTS = window.PRODUCTS, products = window.PRODUCTS;\\n" +
        "var Navbar = window.Navbar, Hero = window.Hero, ProductCard = window.ProductCard, ProductGrid = window.ProductGrid, Sections = window.Sections, Footer = window.Footer, App = window.App;\\n" +
        compiled
      );
      runner(window.React, window.ReactDOM);
    } catch (err) {
      console.warn("[SokoShell] Attention fichier " + f.path + ":", err);
      executionErrors.push({ path: f.path, error: err });
      var baseName = f.path.split("/").pop().replace(/\\.(jsx?|tsx?)$/, "");
      if (/^[A-Z]/.test(baseName) && !window[baseName]) {
        window[baseName] = function(props) { return (props && props.children) || null; };
      }
    }
  });

  if (window.SOKO_FONTS) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + String(window.SOKO_FONTS).replace(/\\|/g, "&family=") + "&display=swap";
    document.head.appendChild(link);
  }
  if (window.SOKO_THEME) {
    window.tailwind.config = window.SOKO_THEME;
  }

  var AppComponent = window.App || window.__APP__ || null;
  if (!AppComponent) {
    AppComponent = function() {
      var nav = window.Navbar ? React.createElement(window.Navbar) : null;
      var hero = window.Hero ? React.createElement(window.Hero) : null;
      var grid = window.ProductGrid ? React.createElement(window.ProductGrid) : null;
      var foot = window.Footer ? React.createElement(window.Footer) : null;
      return React.createElement("div", { className: "min-h-screen bg-neutral-950 text-white" },
        nav,
        React.createElement("main", null, hero, grid),
        foot
      );
    };
  }

  var root = ReactDOM.createRoot(document.getElementById("root"));
  try {
    root.render(React.createElement(AppComponent));
  } catch (renderErr) {
    console.error("[SokoShell] Erreur de rendu:", renderErr);
    document.getElementById("root").innerHTML =
      '<pre style="padding:24px;color:#f87171;background:#09090b;font-family:monospace;white-space:pre-wrap;font-size:12px">' +
      String(renderErr && renderErr.stack || renderErr).replace(/</g, "&lt;") +
      '</pre>';
  }
})();
</script>
</body>
</html>`;
}
