import type { ReactProjectFile } from "./react-project-engine";

/**
 * Shell d'exécution du projet React généré : React 18 UMD + Babel standalone
 * + Tailwind CDN. Les fichiers sont concaténés dans l'ordre du manifeste
 * (convention sans import/export) puis compilés à la volée.
 *
 * Ordre d'exécution : (1) eval du bundle → définit window.SOKO_THEME /
 * window.SOKO_FONTS / App ; (2) tailwind.config = SOKO_THEME ; (3) render React
 * (les classes sont générées par le MutationObserver du CDN avec le bon config).
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
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
  [x-cloak], .soko-boot { display: none; }
  html, body { min-height: 100%; }
</style>
</head>
<body>
<div id="root"></div>
<script type="application/json" id="soko-files">${safeJson}</script>
<script>
(function(){
  var files = JSON.parse(document.getElementById("soko-files").textContent);
  // Dans une iframe srcdoc, href="#/..." se résout contre l'URL parente et
  // déclenche une navigation complète. On intercepte tous les clics sur des
  // ancres et on route via location.hash (le routeur de l'app écoute hashchange).
  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el.tagName !== "A") { el = el.parentNode; }
    if (!el || el.tagName !== "A") return;
    var href = el.getAttribute("href") || "";
    if (href.charAt(0) !== "#") return;
    e.preventDefault();
    if (href.length < 2) return;
    var previous = location.hash;
    if (previous === href) {
      try {
        location.hash = href;
        if (location.hash === previous) {
          var ev = document.createEvent("Event");
          ev.initEvent("hashchange", true, false);
          window.dispatchEvent(ev);
        }
      } catch (err) {}
      return;
    }
    try { location.hash = href; } catch (err) {}
    if (location.hash === previous) {
      var ev2 = document.createEvent("Event");
      ev2.initEvent("hashchange", true, false);
      window.dispatchEvent(ev2);
    }
  }, true);
  // Certains fichiers générés contiennent un montage top-level (ReactDOM.createRoot(...)) vers
  // un id inexistant -> l'eval du bundle crashe et SOKO_THEME/SOKO_FONTS ne s'appliquent jamais.
  // On neutralise : getElementById renvoie un conteneur caché si l'élément est absent.
  var sokoHidden = document.createElement("div");
  window.SOKO_el = function (id) {
    var el = document.getElementById(id);
    return el ? el : sokoHidden;
  };
  var bundle = "";
  files.forEach(function(f){
    var src = f.content.replace(/\\b(const|let)\\s/g, "var ");
    src = src.replace(/document\\.getElementById\\(\\s*(['"])([^'"]*)\\1\\s*\\)/g, function (m, q, id) {
      return "SOKO_el(" + JSON.stringify(id) + ")";
    });
    bundle += "/* ===== " + f.path + " ===== */\\n" + src + "\\n";
    if (f.path.indexOf("data/products") !== -1) {
      bundle += "var products = PRODUCTS;\\nvar store = STORE;\\n";
    }
  });
  var evalError = null;
  var AppComponent = null;
  try {
    var compiled = Babel.transform(bundle, { presets: [["react", { runtime: "classic" }]], filename: "bundle.jsx" }).code;
    (new Function(compiled + "\\n;window.__APP__ = (typeof App !== 'undefined') ? App : window.__APP__;"))();
    AppComponent = window.__APP__ || null;
  } catch (e) {
    evalError = e;
  }

  if (window.SOKO_FONTS) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + window.SOKO_FONTS + "&display=swap";
    document.head.appendChild(link);
  }
  if (window.SOKO_THEME) {
    window.tailwind.config = window.SOKO_THEME;
  }

  var root = ReactDOM.createRoot(document.getElementById("root"));
  if (AppComponent) {
    try {
      root.render(React.createElement(AppComponent));
    } catch (e) {
      evalError = e;
    }
  }
  if (evalError || !AppComponent) {
    document.getElementById("root").innerHTML = '<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap;font-size:12px">' + String(evalError && evalError.stack || evalError || "Projet sans composant App").replace(/</g,'&lt;') + '</pre>';
  }
})();
</script>
</body>
</html>`;
}
