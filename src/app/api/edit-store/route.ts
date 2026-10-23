import { NextRequest, NextResponse } from "next/server";
import { editStoreWithDeepSeek } from "@/lib/deepseek";
import { StoreThemeConfig } from "@/types/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentStore: StoreThemeConfig = body.currentStore;
    const instruction: string = body.instruction?.trim();

    if (!currentStore || !instruction) {
      return NextResponse.json(
        { error: "Configuration actuelle et instruction requises" },
        { status: 400 }
      );
    }

    const updatedStore = await editStoreWithDeepSeek(currentStore, instruction);
    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur modification";
    return NextResponse.json(
      { error: "Erreur lors de la modification de la boutique", details: message },
      { status: 500 }
    );
  }
}
