// Tiny tokenizer for landing-page TS code samples.
// Returns ordered spans for inline rendering.

export type Span = { text: string; kind: "kw" | "str" | "code" };

const KEYWORDS = new Set([
  "import",
  "from",
  "const",
  "let",
  "var",
  "await",
  "async",
  "new",
  "return",
  "function",
  "export",
  "if",
  "else",
  "for",
  "while",
  "true",
  "false",
  "null",
]);

const STRING_RE = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;

export function tokenize(line: string): Span[] {
  // Phase 1: extract string literals.
  const out: Span[] = [];
  let cursor = 0;
  for (const m of line.matchAll(STRING_RE)) {
    const start = m.index ?? 0;
    if (start > cursor) {
      out.push(...tokenizeNonString(line.slice(cursor, start)));
    }
    out.push({ text: m[0], kind: "str" });
    cursor = start + m[0].length;
  }
  if (cursor < line.length) {
    out.push(...tokenizeNonString(line.slice(cursor)));
  }
  return out;
}

function tokenizeNonString(chunk: string): Span[] {
  // Split on word boundaries; mark keywords.
  const parts = chunk.split(/(\b\w+\b)/);
  return parts.filter((p) => p.length > 0).map((p) =>
    KEYWORDS.has(p) ? { text: p, kind: "kw" } : { text: p, kind: "code" }
  );
}

// --- inline runtime self-check ---
// Asserts run once on module import in dev only (typeof window !== "undefined" guard avoids SSR cost).
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const t1 = tokenize('const x = "hello";');
  console.assert(
    t1.some((s) => s.kind === "kw" && s.text === "const"),
    "tokenize: 'const' should be a keyword"
  );
  console.assert(
    t1.some((s) => s.kind === "str" && s.text === '"hello"'),
    "tokenize: '\"hello\"' should be a string"
  );
  const t2 = tokenize("await fuin.signRootIntent({");
  console.assert(
    t2.some((s) => s.kind === "kw" && s.text === "await"),
    "tokenize: 'await' should be a keyword"
  );
}
