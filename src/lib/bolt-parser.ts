import { slugify } from "./store-brief";
import type { ReactProjectFile, ReactProjectMeta } from "./react-project-engine";

/**
 * Protocole et parseur inspirés de bolt.diy (app/lib/runtime/message-parser.ts)
 * Supporte les balises <boltArtifact> et <boltAction type="file" | "shell" | "start">
 * en streaming temps réel ainsi qu'en parsing complet, avec rétrocompatibilité @@FILE.
 */

export type BoltActionType = "file" | "shell" | "start";

export interface FileAction {
  type: "file";
  filePath: string;
  content: string;
}

export interface ShellAction {
  type: "shell" | "start";
  content: string;
}

export type BoltAction = FileAction | ShellAction;

export interface BoltArtifactData {
  id: string;
  title: string;
  storeName?: string;
  whatsapp?: string;
  city?: string;
}

export interface ParserCallbacks {
  onArtifactOpen?: (data: BoltArtifactData) => void;
  onArtifactClose?: (data: BoltArtifactData) => void;
  onActionOpen?: (data: { artifactId: string; actionId: number; action: BoltAction }) => void;
  onActionStream?: (data: { artifactId: string; actionId: number; action: BoltAction }) => void;
  onActionClose?: (data: { artifactId: string; actionId: number; action: BoltAction }) => void;
}

const ARTIFACT_TAG_OPEN = "<boltArtifact";
const ARTIFACT_TAG_CLOSE = "</boltArtifact>";
const ACTION_TAG_OPEN = "<boltAction";
const ACTION_TAG_CLOSE = "</boltAction>";

function extractAttribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? match[1] : undefined;
}

function cleanActionContent(raw: string): string {
  let cleaned = raw.replace(/^\r?\n/, "").replace(/\r?\n\s*$/, "");
  // Nettoyage si le LLM entoure par erreur le code d'un bloc ```jsx ... ```
  cleaned = cleaned.replace(/^```(?:jsx|tsx|js|ts|html|css|json|sh|bash)?\s*\r?\n/i, "").replace(/\r?\n```\s*$/i, "");
  return cleaned.trim();
}

/**
 * StreamingMessageParser issu de l'architecture bolt.diy :
 * Permet de parser un flux LLM incrémental contenant <boltArtifact> et <boltAction>.
 */
export class StreamingMessageParser {
  private callbacks: ParserCallbacks;
  private buffer = "";
  private currentArtifact: BoltArtifactData | null = null;
  private currentAction: BoltAction | null = null;
  private actionCounter = 0;

  constructor(callbacks: ParserCallbacks = {}) {
    this.callbacks = callbacks;
  }

  reset() {
    this.buffer = "";
    this.currentArtifact = null;
    this.currentAction = null;
    this.actionCounter = 0;
  }

  parse(chunk: string): void {
    this.buffer += chunk;

    while (this.buffer.length > 0) {
      if (!this.currentArtifact) {
        const openIdx = this.buffer.indexOf(ARTIFACT_TAG_OPEN);
        if (openIdx === -1) {
          // Garder les derniers caractères au cas où une balise serait coupée
          if (this.buffer.length > ARTIFACT_TAG_OPEN.length) {
            this.buffer = this.buffer.slice(-ARTIFACT_TAG_OPEN.length);
          }
          break;
        }
        const tagEndIdx = this.buffer.indexOf(">", openIdx);
        if (tagEndIdx === -1) break;

        const openTag = this.buffer.slice(openIdx, tagEndIdx + 1);
        this.currentArtifact = {
          id: extractAttribute(openTag, "id") || "soko-store",
          title: extractAttribute(openTag, "title") || "Ma Boutique",
          storeName: extractAttribute(openTag, "storeName") || extractAttribute(openTag, "title"),
          whatsapp: extractAttribute(openTag, "whatsapp"),
          city: extractAttribute(openTag, "city"),
        };
        this.callbacks.onArtifactOpen?.(this.currentArtifact);
        this.buffer = this.buffer.slice(tagEndIdx + 1);
        continue;
      }

      if (!this.currentAction) {
        const actionOpenIdx = this.buffer.indexOf(ACTION_TAG_OPEN);
        const artifactCloseIdx = this.buffer.indexOf(ARTIFACT_TAG_CLOSE);

        if (artifactCloseIdx !== -1 && (actionOpenIdx === -1 || artifactCloseIdx < actionOpenIdx)) {
          this.callbacks.onArtifactClose?.(this.currentArtifact);
          this.currentArtifact = null;
          this.buffer = this.buffer.slice(artifactCloseIdx + ARTIFACT_TAG_CLOSE.length);
          continue;
        }

        if (actionOpenIdx === -1) {
          if (this.buffer.length > 32) {
            this.buffer = this.buffer.slice(-32);
          }
          break;
        }

        const tagEndIdx = this.buffer.indexOf(">", actionOpenIdx);
        if (tagEndIdx === -1) break;

        const openTag = this.buffer.slice(actionOpenIdx, tagEndIdx + 1);
        const actionType = (extractAttribute(openTag, "type") || "file") as BoltActionType;
        const filePath = extractAttribute(openTag, "filePath") || "";

        this.actionCounter += 1;
        this.currentAction =
          actionType === "file"
            ? { type: "file", filePath: filePath.trim(), content: "" }
            : { type: actionType, content: "" };

        this.callbacks.onActionOpen?.({
          artifactId: this.currentArtifact.id,
          actionId: this.actionCounter,
          action: { ...this.currentAction },
        });

        this.buffer = this.buffer.slice(tagEndIdx + 1);
        continue;
      }

      // À l'intérieur d'une <boltAction>
      const closeIdx = this.buffer.indexOf(ACTION_TAG_CLOSE);
      if (closeIdx === -1) {
        const safeLength = Math.max(0, this.buffer.length - ACTION_TAG_CLOSE.length);
        if (safeLength > 0) {
          this.currentAction.content += this.buffer.slice(0, safeLength);
          this.buffer = this.buffer.slice(safeLength);
          this.callbacks.onActionStream?.({
            artifactId: this.currentArtifact.id,
            actionId: this.actionCounter,
            action: { ...this.currentAction },
          });
        }
        break;
      }

      this.currentAction.content += this.buffer.slice(0, closeIdx);
      this.currentAction.content = cleanActionContent(this.currentAction.content);

      this.callbacks.onActionClose?.({
        artifactId: this.currentArtifact.id,
        actionId: this.actionCounter,
        action: { ...this.currentAction },
      });

      this.currentAction = null;
      this.buffer = this.buffer.slice(closeIdx + ACTION_TAG_CLOSE.length);
    }
  }
}

/**
 * Parse une réponse complète au format <boltArtifact> / <boltAction> de bolt.diy
 * (avec fallback transparent sur l'ancien format @@META / @@FILE si présent).
 */
export function parseBoltProject(raw: string): {
  files: ReactProjectFile[];
  shellActions: string[];
  meta: ReactProjectMeta;
} {
  const files: ReactProjectFile[] = [];
  const shellActions: string[] = [];
  let artifactMeta: Partial<BoltArtifactData> = {};

  if (raw.includes("<boltArtifact") || raw.includes("<boltAction")) {
    const artifactTagMatch = raw.match(/<boltArtifact\b[^>]*>/i);
    if (artifactTagMatch) {
      const openTag = artifactTagMatch[0];
      artifactMeta = {
        id: extractAttribute(openTag, "id"),
        title: extractAttribute(openTag, "title"),
        storeName: extractAttribute(openTag, "storeName") || extractAttribute(openTag, "title"),
        whatsapp: extractAttribute(openTag, "whatsapp"),
        city: extractAttribute(openTag, "city"),
      };
    }

    // Regex tolérante (supporte aussi le dernier <boltAction> même si </boltAction> est tronqué en fin de flux)
    const actionRegex = /<boltAction\b([^>]*)>([\s\S]*?)(?:<\/boltAction>|$)/gi;
    let match: RegExpExecArray | null;
    while ((match = actionRegex.exec(raw)) !== null) {
      const attrs = match[1] || "";
      const body = cleanActionContent(match[2] || "").replace(/<\/boltArtifact>[\s\S]*$/i, "").trim();
      const type = (extractAttribute(attrs, "type") || "file") as BoltActionType;
      const filePath = (extractAttribute(attrs, "filePath") || "").trim().replace(/^\/+/, "");

      if (type === "file" && filePath && body) {
        const existingIdx = files.findIndex((f) => f.path === filePath);
        if (existingIdx >= 0) {
          files[existingIdx] = { path: filePath, content: body };
        } else {
          files.push({ path: filePath, content: body });
        }
      } else if ((type === "shell" || type === "start") && body) {
        shellActions.push(body);
      }
    }
  }

  // Fallback si l'ancien format @@META / @@FILE est utilisé
  if (files.length === 0 && raw.includes("@@FILE")) {
    const text = raw.replace(/```(html|jsx|js|tsx)?\s*/gi, "").replace(/```/g, "");
    const metaMatch = text.match(/@@META\s*([\s\S]*?)\s*@@ENDMETA/);
    if (metaMatch) {
      try {
        const parsed = JSON.parse(metaMatch[1]) as Record<string, string>;
        artifactMeta = {
          storeName: parsed.storeName,
          whatsapp: parsed.whatsapp,
          city: parsed.city,
        };
      } catch {
        // ignore
      }
    }

    const re = /@@FILE\s+([^\n]+)\n([\s\S]*?)(?:@@ENDFILE|$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const path = m[1].trim().replace(/^\/+/, "");
      const content = m[2].trim();
      if (path && content) files.push({ path, content });
    }
  }

  // Si les métadonnées ne sont pas sur <boltArtifact>, on tente de les extraire de src/data/products.js
  if (!artifactMeta.storeName || !artifactMeta.whatsapp || !artifactMeta.city) {
    const dataFile = files.find((f) => f.path.includes("products"));
    if (dataFile) {
      const nameMatch = dataFile.content.match(/name\s*:\s*["']([^"']+)["']/);
      const waMatch = dataFile.content.match(/whatsapp\s*:\s*["']([^"']+)["']/);
      const cityMatch = dataFile.content.match(/city\s*:\s*["']([^"']+)["']/);
      if (!artifactMeta.storeName && nameMatch) artifactMeta.storeName = nameMatch[1];
      if (!artifactMeta.whatsapp && waMatch) artifactMeta.whatsapp = waMatch[1];
      if (!artifactMeta.city && cityMatch) artifactMeta.city = cityMatch[1];
    }
  }

  const storeName = artifactMeta.storeName || artifactMeta.title || "Ma Boutique";
  const whatsappClean = (artifactMeta.whatsapp || "").replace(/\D/g, "");

  return {
    files,
    shellActions,
    meta: {
      storeName,
      slug: slugify(storeName),
      whatsapp: whatsappClean.length >= 8 ? whatsappClean : "2250700000000",
      city: artifactMeta.city || "Abidjan",
    },
  };
}

/**
 * Formate un projet en XML <boltArtifact> / <boltAction> (pour l'historique ou l'édition).
 */
export function serializeBoltProject(files: ReactProjectFile[], meta: ReactProjectMeta): string {
  const actions = files
    .map(
      (f) => `  <boltAction type="file" filePath="${f.path}">\n${f.content}\n  </boltAction>`
    )
    .join("\n");

  return `<boltArtifact id="${meta.slug || "soko-store"}" title="${meta.storeName.replace(/"/g, "&quot;")}" whatsapp="${meta.whatsapp}" city="${meta.city.replace(/"/g, "&quot;")}">\n${actions}\n</boltArtifact>`;
}
