import { buildReactShell } from "../src/lib/react-shell";
import { readFileSync, writeFileSync } from "fs";

for (const id of ["A", "B", "C"]) {
  const v = JSON.parse(readFileSync(`/tmp/api-variant-${id}.json`, "utf8"));
  writeFileSync(`/var/folders/wf/wvqvvm153x1gcq4rd2n_jjvr0000gn/T/opencode/repro/api-shell-${id}.json`, JSON.stringify({ files: v.files, meta: v.meta, shell: buildReactShell(v.files) }));
  console.log(`shell ${id}:`, buildReactShell(v.files).length);
}
