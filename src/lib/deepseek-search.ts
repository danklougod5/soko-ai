/**
 * Module DeepSeek Search pour SokoAI
 * Utilise l'API officielle POST https://api.deepseek.com/v1/tools/search
 * Permet d'enrichir les boutiques avec des prix réels en FCFA, des produits tendances locaux
 * et des informations de livraison authentiques pour les villes ouest-africaines.
 */

export interface DeepSeekSearchResult {
  title: string;
  url: string;
  snippet?: string;
  summary: string;
  rerank_score: number;
  site_name?: string;
  site_icon?: string;
  date?: string | null;
  authority?: number;
}

export interface DeepSeekSearchResponse {
  results: DeepSeekSearchResult[];
}

/**
 * Recherche sur le web via l'API DeepSeek Search
 */
export async function searchDeepSeek(
  query: string,
  options?: { count?: number; localization?: string; needContent?: boolean }
): Promise<DeepSeekSearchResult[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn("[DeepSeek Search] Aucune clé DEEPSEEK_API_KEY configurée");
    return [];
  }

  // Nettoyage et limitation de la requête (1 à 128 caractères selon la doc DeepSeek)
  const cleanQuery = query.trim().slice(0, 128);
  if (!cleanQuery) return [];

  try {
    const res = await fetch("https://api.deepseek.com/v1/tools/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: cleanQuery,
        count: Math.min(options?.count || 5, 20),
        localization: options?.localization || "",
        need_content: options?.needContent || false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[DeepSeek Search] Erreur HTTP ${res.status}:`, errText);
      return [];
    }

    const data: DeepSeekSearchResponse = await res.json();
    return data.results || [];
  } catch (error) {
    console.warn("[DeepSeek Search] Échec appel recherche :", error);
    return [];
  }
}

/**
 * Recherche des repères de prix et tendances de marché pour enrichir la génération
 */
export async function searchMarketInsights(
  businessDescription: string,
  city = "Abidjan"
): Promise<string> {
  const query = `${businessDescription} ${city} prix fcfa boutique`.slice(0, 120);
  const results = await searchDeepSeek(query, { count: 3 });

  if (results.length === 0) return "";

  const summaries = results
    .filter((r) => r.summary && r.summary.trim())
    .map((r) => `- [${r.title || r.site_name || "Source"}] : ${r.summary.slice(0, 220)}`)
    .join("\n");

  return summaries ? `Données réelles du marché (${city}) :\n${summaries}` : "";
}

