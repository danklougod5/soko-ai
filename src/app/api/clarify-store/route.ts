import { NextRequest, NextResponse } from "next/server";
import { discoverStoreNeeds } from "@/lib/discovery-engine";

/**
 * Étape 1 du flux : l'IA analyse la demande et renvoie les questions
 * à poser au commerçant AVANT de générer la boutique.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "Le prompt ne peut pas être vide" }, { status: 400 });
    }

    const result = await discoverStoreNeeds(prompt);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de la demande", details: message },
      { status: 500 }
    );
  }
}
