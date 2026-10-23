/**
 * Couche LLM unifiée : permet de basculer entre DeepSeek et OpenAI (ou tout
 * endpoint compatible OpenAI) via les variables d'environnement, sans toucher
 * au code des moteurs.
 *
 *   AI_PROVIDER = "deepseek" (défaut) | "openai"
 *   AI_MODEL    = modèle à utiliser (ex: "deepseek-chat", "gpt-4o")
 */

export interface ProviderConfig {
  provider: string;
  url: string;
  apiKey?: string;
  model: string;
}

function withChatPath(base: string): string {
  const clean = base.replace(/\/+$/, "");
  return clean.endsWith("/chat/completions") ? clean : `${clean}/chat/completions`;
}

export function resolveProvider(): ProviderConfig {
  const provider = (process.env.AI_PROVIDER || "deepseek").toLowerCase();

  if (provider === "openai") {
    return {
      provider,
      url: withChatPath(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"),
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.AI_MODEL || "gpt-4o",
    };
  }

  return {
    provider: "deepseek",
    url: withChatPath(process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"),
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.AI_MODEL || "deepseek-chat",
  };
}

export function hasLLMKey(): boolean {
  return Boolean(resolveProvider().apiKey);
}

export interface CallLLMOptions {
  system: string;
  user: string;
  temperature?: number;
  /** Force le format JSON (par défaut true). */
  json?: boolean;
}

/**
 * Appelle le LLM et renvoie la réponse JSON parsée, ou `null` si aucune clé
 * n'est configurée. Lève une erreur si l'appel HTTP échoue.
 */
export async function callLLMJson<T = unknown>({
  system,
  user,
  temperature = 0.7,
  json = true,
}: CallLLMOptions): Promise<T | null> {
  const { url, apiKey, model } = resolveProvider();
  if (!apiKey) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 8000,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  if (!json) return content as unknown as T;
  return JSON.parse(content) as T;
}
