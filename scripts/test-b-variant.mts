import { generateReactProject, REACT_VARIANT_DIRECTIONS } from "../src/lib/react-project-engine";
import { buildReactShell } from "../src/lib/react-shell";
import { writeFileSync } from "fs";

async function main() {
  const direction = REACT_VARIANT_DIRECTIONS.find((d) => d.id === "B")!;
  console.log("[gen] variante B (direction officielle)…");
  const r = await generateReactProject("site pour boutique de sneakers a Abidjan", {
    storeName: "Kitsune Kicks",
    whatsapp: "2250700000000",
    variant: direction,
  });
  const shell = buildReactShell(r.files);
  writeFileSync("/var/folders/wf/wvqvvm153x1gcq4rd2n_jjvr0000gn/T/opencode/repro/variant-b.json", JSON.stringify({ files: r.files, meta: r.meta, shell }));
  console.log("files:", r.files.map((f) => f.path).join(", "));
  console.log("saved, shellLen:", shell.length);
  const app = r.files.find((f) => f.path === "src/App.jsx");
  console.log("router hashchange in App.jsx:", app ? /hashchange/.test(app.content) : "no App");
  process.exit(0);
}

main();
