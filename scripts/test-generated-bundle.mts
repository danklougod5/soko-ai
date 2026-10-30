/**
 * Génère une vraie variante via le LLM puis vérifie que les modules transformés
 * pour Vite se bundlent réellement (imports relatifs, exports nommés, JSX, doublons).
 */
import { build } from "esbuild";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { generateReactProject, getSectorVariantDirections } from "../src/lib/react-project-engine";
import { isTransformableModule, prepareModuleFile } from "../src/lib/webcontainer";

const prompt = process.env.PROMPT || "je veux un site pour ma boutique de cosmétiques africaines";
const root = join(process.cwd(), ".repro", "gen");
const rawRoot = join(process.cwd(), ".repro", "gen-raw");
rmSync(root, { recursive: true, force: true });

const dirs = getSectorVariantDirections(prompt);
const variant = dirs[0];
console.log("Variante:", variant.id, "—", variant.label);

const loadRaw = (dir: string): { path: string; content: string }[] => {
  const out: { path: string; content: string }[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        const rel = full.slice(dir.length + 1).replace(/\\/g, "/");
        out.push({ path: rel, content: readFileSync(full, "utf8") });
      }
    }
  };
  walk(dir);
  return out;
};

let project: { files: { path: string; content: string }[] };
const reuse = process.env.REUSE_RAW === "1" && existsSync(rawRoot);
if (reuse) {
  console.log("Réutilisation des fichiers bruts:", rawRoot);
  project = { files: loadRaw(rawRoot) };
} else {
  project = await generateReactProject(prompt, {
    storeName: "Mara Cosmetiques",
    whatsapp: "2250612345678",
    city: "Abidjan",
    variant,
  });
}

console.log("Fichiers:", project.files.map((f) => f.path).join(", "));

const prepared: Record<string, string> = {};
for (const file of project.files) {
  const path = file.path.replace(/^\/+/, "");
  const content = isTransformableModule(path) ? prepareModuleFile(path, file.content) : file.content;
  prepared[path] = content;
  mkdirSync(dirname(join(root, path)), { recursive: true });
  mkdirSync(dirname(join(rawRoot, path)), { recursive: true });
  writeFileSync(join(root, path), content);
  writeFileSync(join(rawRoot, path), file.content);
}

const appPath = Object.keys(prepared).find((p) => /^src\/App\.(jsx|tsx|js|ts)$/.test(p)) || "src/App.jsx";
mkdirSync(join(root, "src"), { recursive: true });
writeFileSync(
  join(root, "src/__entry.jsx"),
  `import App from './${appPath.replace(/^src\//, "")}';\nexport default App;\n`
);

try {
  const result = await build({
    entryPoints: [join(root, "src/__entry.jsx")],
    bundle: true,
    write: false,
    format: "esm",
    jsx: "automatic",
    loader: { ".js": "jsx", ".jsx": "jsx" },
    external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "lucide-react"],
    logLevel: "silent",
  });
  console.log("BUNDLE OK —", result.outputFiles[0].contents.length, "octets");
} catch (err) {
  const e = err as {
    errors?: { text: string; location?: { file: string; line: number; lineText?: string } }[];
  };
  if (e.errors?.length) {
    for (const error of e.errors.slice(0, 12)) {
      console.error(
        "ESBUILD ERROR:",
        error.text,
        error.location ? `${error.location.file}:${error.location.line}` : "",
        error.location?.lineText?.slice(0, 120) || ""
      );
    }
  } else {
    console.error("ESBUILD ERROR:", err);
  }
  process.exitCode = 1;
}

for (const [path, code] of Object.entries(prepared)) {
  const fallbacks = [...code.matchAll(/const ([A-Za-z_$][\w$]*) = \((?:props|\.\.\.args)\)/g)].map((m) => m[1]);
  const constants = [...code.matchAll(/const ([A-Z][A-Z0-9_]{2,}) = \(typeof window/g)].map((m) => m[1]);
  if (fallbacks.length || constants.length) {
    console.log(`fallbacks ${path}:`, [...fallbacks, ...constants].join(", "));
  }
}
