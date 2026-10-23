import { generateReactProject } from "../src/lib/react-project-engine";
import { buildReactShell } from "../src/lib/react-shell";
import { writeFileSync } from "fs";

async function main() {
  const direction = REACT_VARIANT_C();
  console.log("[gen] variante C premium…");
  const r = await generateReactProject("site pour boutique de vetements femme a Abidjan", {
    storeName: "Lumiere Femme",
    whatsapp: "2250799000000",
    variant: direction,
  });
  const shell = buildReactShell(r.files);
  writeFileSync("/var/folders/wf/wvqvvm153x1gcq4rd2n_jjvr0000gn/T/opencode/repro/variant-c.json", JSON.stringify({ files: r.files, meta: r.meta, shell }));
  console.log("files:", r.files.map((f) => f.path).join(", "));
  console.log("saved, shellLen:", shell.length);
  process.exit(0);
}

function REACT_VARIANT_C() {
  return {
    id: "C",
    label: "Doux & minimal",
    description: "Minimal PREMIUM : lin chaud, serif à contraste élevé, filets fins, beaucoup d'air, détails de haute couture.",
    guidance:
      "Ambiance minimal chic premium (type Jacquemus / Aesop) — PAS de look enfantin. Palette : lin chaud #F7F3EC / sable #E9E0D2 / encre profonde #1B1815 + accent terracotta profond #A85B32. Polices : Bodoni Moda (titres, contraste élevé, italiques élégantes) + Jost (texte, géométrique fin). Radius 0 à 4px MAX, zéro pastille bubble, zéro ombre portée. Hero éditorial aéré : très grande typo serif (jusqu'à 96px), filets hairline 1px (#E5DCCB), surtitre uppercase espacé tracking-[0.3em], photo large au rapport 4/5. Cartes produit sans ombre, séparées par des filets verticaux fins, avec numérotation discrète en serif (01, 02…) et prix en chiffres serrés. Boutons : fond encre + texte lin, ou ghost avec filet inférieur animé au hover. Section rédactionnelle aérée « La promesse » : un grand texte serif centré sur fond sable. Beaucoup de blanc (py-24 et +), labels uppercase très fins, micro-transitions sobres 200ms.",
  };
}

main();
