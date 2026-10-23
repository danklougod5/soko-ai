import { readFileSync, writeFileSync } from "fs";
import { buildReactShell } from "../src/lib/react-shell";

const DIR = "/var/folders/wf/wvqvvm153x1gcq4rd2n_jjvr0000gn/T/opencode";
for (const id of ["A", "B", "C"]) {
  const v = JSON.parse(readFileSync(`${DIR}/rvar2_${id}.json`, "utf8"));
  writeFileSync(`${DIR}/shell_${id}.html`, buildReactShell(v.files));
  console.log(`shell_${id}.html written (${v.files.length} files)`);
}
