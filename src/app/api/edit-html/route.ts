import { NextRequest, NextResponse } from "next/server";
import { editStoreHtml } from "@/lib/html-engine";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const html: string = typeof body.html === "string" ? body.html : "";
    const instruction: string = typeof body.instruction === "string" ? body.instruction.trim() : "";

    if (!html || !instruction) {
      return NextResponse.json({ error: "HTML et instruction requis" }, { status: 400 });
    }

    const result = await editStoreHtml(html, instruction);
    return NextResponse.json({ success: true, html: result.html, meta: result.meta });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur édition HTML :", error);
    return NextResponse.json({ error: "Erreur lors de la modification du site", details: message }, { status: 500 });
  }
}
