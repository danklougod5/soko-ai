/**
 * Linter syntaxique léger pour code JS/JSX généré par LLM : détecte les chaînes
 * non terminées, commentaires blocs orphelins et parenthésages déséquilibrés —
 * symptômes d'une génération coupée par la limite de tokens.
 * Sans dépendance : tourne aussi bien côté serveur Next que navigateur.
 */

export interface SyntaxIssue {
  line: number;
  col: number;
  message: string;
}

export function lintSyntax(code: string): SyntaxIssue | null {
  let line = 1;
  let col = 1;

  type Mode = "code" | "template";
  const stack: { ch: string; line: number; col: number; mode: Mode }[] = [];

  // Heuristique regex : dernier signe significatif autorisant un regex literal
  const canStartRegex = (prev: string, recentCode: string): boolean => {
    if (!prev) return true;
    if ("([{,;:!&|?+-%*~^<>=/".includes(prev)) return true;
    if (prev === ")" || prev === "]") return false;
    if (/\b(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/.test(recentCode))
      return true;
    return false;
  };

  let i = 0;
  let prevSignificant = "";
  let recent = "";

  const advance = (n = 1) => {
    for (let k = 0; k < n && i < code.length; k++) {
      if (code[i] === "\n") {
        line += 1;
        col = 1;
      } else {
        col += 1;
      }
      i += 1;
    }
  };

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    if (ch === "\n") {
      if (recent.trim().length > 0) recent = recent.slice(-14) + ch;
      advance();
      continue;
    }
    if (ch === " " || ch === "\t" || ch === "\r") {
      advance();
      continue;
    }

    // Commentaires
    if (ch === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") advance();
      continue;
    }
    if (ch === "/" && next === "*") {
      advance(2);
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) advance();
      if (i >= code.length) {
        return { line, col, message: "Commentaire bloc non terminé (/* sans */)" };
      }
      advance(2);
      continue;
    }

    // Regex literal (heuristic): après un opérateur/keyword
    if (ch === "/" && canStartRegex(prevSignificant, recent)) {
      advance(); // consume '/'
      let inClass = false;
      while (i < code.length) {
        const c = code[i];
        if (c === "\\") {
          advance(2);
          continue;
        }
        if (c === "\n") break; // regex jamais multi-lignes -> pas un regex la
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) break;
        advance();
      }
      if (i < code.length && code[i] === "/") {
        advance();
        while (i < code.length && /[gimsuyvd]/.test(code[i])) advance();
        prevSignificant = "re";
        recent = (recent + "re").slice(-15);
        continue;
      }
      // Ce n'était pas un regex : retraiter comme simple slash (division)
      prevSignificant = "/";
      continue;
    }

    // Chaînes simples (jamais multi-lignes)
    if (ch === '"' || ch === "'") {
      const q = ch;
      const { line: sLine, col: sCol } = { line, col };
      advance();
      while (i < code.length && code[i] !== q) {
        if (code[i] === "\\") {
          advance(2);
          continue;
        }
        if (code[i] === "\n") {
          return {
            line: sLine,
            col: sCol,
            message: `Unterminated string constant (chaîne ${q} ouverte ligne ${sLine}, non fermée)`,
          };
        }
        advance();
      }
      if (i >= code.length) {
        return { line: sLine, col: sCol, message: `Unterminated string constant (chaîne ${q} jamais fermée)` };
      }
      advance();
      prevSignificant = "s";
      recent = (recent + "s").slice(-15);
      continue;
    }

    // Template literal (multi-lignes, ${} possibles)
    if (ch === "`") {
      const sLine = line;
      advance();
      let depth = 0;
      let closed = false;
      while (i < code.length) {
        if (code[i] === "\\") {
          advance(2);
          continue;
        }
        if (code[i] === "`" && depth === 0) {
          closed = true;
          advance();
          break;
        }
        if (code[i] === "$" && code[i + 1] === "{") {
          depth += 1;
          stack.push({ ch: "{", line, col, mode: "template" });
          advance(2);
          continue;
        }
        if (code[i] === "}" && depth > 0) {
          depth -= 1;
          stack.pop();
          advance();
          continue;
        }
        advance();
      }
      if (!closed) {
        return { line: sLine, col: 1, message: "Template literal jamais fermé (`)" };
      }
      prevSignificant = "s";
      recent = (recent + "s").slice(-15);
      continue;
    }

    // Crochets
    if ("([{".includes(ch)) {
      stack.push({ ch, line, col, mode: "code" });
      prevSignificant = ch;
      recent = (recent + ch).slice(-15);
      advance();
      continue;
    }
    if (")]}".includes(ch)) {
      const top = stack.pop();
      const pair: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
      if (!top || top.ch !== pair[ch]) {
        return {
          line,
          col,
          message: `Parenthésage déséquilibré : "${ch}" sans "${pair[ch]}" correspondant (ouvert ligne ${top ? top.line : "?"})`,
        };
      }
      prevSignificant = ch;
      recent = (recent + ch).slice(-15);
      advance();
      continue;
    }

    // Après }) on retombe éventuellement dans le template parent (edge-case rare)
    prevSignificant = ch;
    recent = (recent + ch).slice(-15);
    advance();
  }

  if (stack.length > 0) {
    const top = stack[stack.length - 1];
    return {
      line: top.line,
      col: top.col,
      message: `Symbole "${top.ch}" (ligne ${top.line}) jamais fermé → fichier probablement TRONQUÉ (limite de tokens)`,
    };
  }
  return null;
}
