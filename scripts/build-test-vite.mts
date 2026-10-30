/**
 * Rejoue la transformation WebContainer dans un vrai projet Vite local
 * (mêmes fichiers transformés que ceux écrits dans le WebContainer).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { buildMainEntry, isTransformableModule, prepareModuleFile } from "../src/lib/webcontainer";

const rawRoot = join(process.cwd(), ".repro", "gen-raw");
const appRoot = join(process.cwd(), ".repro", "vite-app");
const target = join(appRoot, "src");
if (!existsSync(rawRoot)) {
  console.error("Pas de fichiers bruts dans", rawRoot, "— lance scripts/test-generated-bundle.mts d'abord");
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

const paths: string[] = [];
const walk = (dir: string) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const rel = full.slice(rawRoot.length + 1).replace(/\\/g, "/");
      const content = readFileSync(full, "utf8");
      const prepared = isTransformableModule(rel) ? prepareModuleFile(rel, content) : content;
      mkdirSync(dirname(join(appRoot, rel)), { recursive: true });
      writeFileSync(join(appRoot, rel), prepared);
      paths.push(rel);
    }
  }
};
walk(rawRoot);

writeFileSync(join(target, "main.jsx"), buildMainEntry(paths, 1));
console.log("Fichiers écrits:", paths.join(", "), "+ main.jsx");

// Copie l'index.html du harnais s'il manque
const index = join(process.cwd(), ".repro", "vite-app", "index.html");
if (!existsSync(index)) {
  cpSync(join(process.cwd(), ".repro", "vite-app", "index.html"), index);
}
