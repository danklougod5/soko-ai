import { generateReactProject } from "../src/lib/react-project-engine";
import { writeFileSync } from "fs";

async function main() {
  const r = await generateReactProject("site pour boutique de cafe africain a Dakar", {
    storeName: "Teranga Cafe",
    whatsapp: "221770000000",
  });
  console.log("files:", r.files.map((f) => f.path).join(", "));
  console.log("meta:", r.meta);
  writeFileSync("/var/folders/wf/wvqvvm153x1gcq4rd2n_jjvr0000gn/T/opencode/cafe-react.json", JSON.stringify(r));
  console.log("saved");
}

main();
