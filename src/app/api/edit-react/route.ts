import { NextRequest, NextResponse } from "next/server";
import { editReactProject, ReactProjectFile, ReactProjectMeta } from "@/lib/react-project-engine";

export const maxDuration = 300;

/** Édite le projet React multi-fichiers via instruction chat. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: ReactProjectFile[] = Array.isArray(body.files)
      ? body.files.filter((f: unknown) => f && typeof (f as ReactProjectFile).path === "string" && typeof (f as ReactProjectFile).content === "string")
      : [];
    const meta: ReactProjectMeta = body.meta && typeof body.meta === "object" ? body.meta : { storeName: "Ma Boutique", slug: "boutique", whatsapp: "2250700000000", city: "Abidjan" };
    const instruction: string = typeof body.instruction === "string" ? body.instruction.trim() : "";

    if (files.length === 0 || !instruction) {
      return NextResponse.json({ error: "Projet et instruction requis" }, { status: 400 });
    }

    const result = await editReactProject(files, meta, instruction);
    return NextResponse.json({ success: true, files: result.files, meta: result.meta });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur édition projet React :", error);
    return NextResponse.json({ error: "Erreur lors de la modification du projet", details: message }, { status: 500 });
  }
}
