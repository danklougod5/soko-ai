import { NextRequest, NextResponse } from "next/server";
import { generateStoreHtml } from "@/lib/html-engine";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Le prompt ne peut pas être vide" }, { status: 400 });
    }

    const result = await generateStoreHtml(prompt, {
      whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : undefined,
      storeName: typeof body.storeName === "string" ? body.storeName : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    return NextResponse.json({ success: true, html: result.html, meta: result.meta });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur génération HTML :", error);
    return NextResponse.json({ error: "Erreur lors de la génération du site", details: message }, { status: 500 });
  }
}
