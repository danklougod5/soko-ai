import { NextRequest, NextResponse } from "next/server";
import { generateBespokeStoreWithDeepSeek } from "@/lib/ai-website-engine";
import type { StoreBrief } from "@/lib/store-brief";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const brief: StoreBrief | undefined =
      body.brief && Array.isArray(body.brief.answers) ? body.brief : undefined;
    const prompt = (body.prompt || brief?.prompt || body.answers?.products || "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Le prompt ne peut pas être vide" },
        { status: 400 }
      );
    }

    try {
      const result = await generateBespokeStoreWithDeepSeek(prompt, body.answers, brief);

      return NextResponse.json({
        success: true,
        store: result.store,
        directions: result.directions,
        questions: result.questions,
      });
    } catch (apiError: unknown) {
      console.error("Échec génération :", apiError);
      return NextResponse.json(
        { error: "Erreur lors de la génération" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json(
      { error: "Erreur lors du traitement de la requête", details: message },
      { status: 500 }
    );
  }
}
