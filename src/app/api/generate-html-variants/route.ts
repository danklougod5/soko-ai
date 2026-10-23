import { NextRequest, NextResponse } from "next/server";
import { generateStoreHtmlVariants } from "@/lib/html-engine";

export const maxDuration = 300;

/** Génère 3 variantes du site (3 templates / directions artistiques) en parallèle. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Le prompt ne peut pas être vide" }, { status: 400 });
    }

    const result = await generateStoreHtmlVariants(prompt, {
      whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : undefined,
      storeName: typeof body.storeName === "string" ? body.storeName : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    return NextResponse.json({
      success: true,
      variants: result.variants.map((v) => ({
        id: v.id,
        label: v.label,
        description: v.description,
        html: v.html,
        meta: v.meta,
      })),
      failed: result.failed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur génération variantes :", error);
    return NextResponse.json({ error: "Erreur lors de la génération des variantes", details: message }, { status: 500 });
  }
}
