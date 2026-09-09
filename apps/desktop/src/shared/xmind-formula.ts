/** Conservative recovery for old XMind titles whose math delimiters were stripped.
 * This is deliberately import-only, not an extension to Markdown's grammar.
 */
// Bound nesting to keep matching predictable; deeper/unknown TeX is left untouched.
let group = String.raw`\{[^{}\r\n]*\}`;
for (let i = 0; i < 3; i++) group = String.raw`\{(?:[^{}\r\n]|${group})*\}`;
const commandAtom = String.raw`(?:\\frac${group}${group}|\\(?:sqrt|overline|underline|text|mathrm|mathbf)${group}|\\(?:pi|infty|alpha|beta|theta|sigma|sum|int)(?![A-Za-z]))`;
const atom = String.raw`(?:${commandAtom}|${group}|[\u4e00-\u9fff]+(?==)|[A-Za-z0-9]+(?:\\ [A-Za-z]+)?)`;
const operator = String.raw`(?:[+\-*/=^_]|\\(?:ge|le|geq|leq|sim|times|cdot|pm)(?![A-Za-z]))`;
const expression = new RegExp(String.raw`[+-]?${atom}(?:[ \t]*${operator}[ \t]*[+-]?${atom})*`, "g");
const protectedSpan = /\$\$[\s\S]*?\$\$|\$[^$\r\n]+\$|`+[^`]*`+|!?\[[^\]]*\]\([^)]*\)|(?:https?:\/\/|www\.)\S+/g;

export function recoverXMindTitleFormulas(text: string): { text: string; recovered: boolean } {
  let recovered = false;
  const recover = (plain: string) => {
    // An incomplete delimiter/code span is ambiguous: do not add more delimiters.
    if (/[$`]/.test(plain)) return plain;
    return plain.replace(expression, (candidate: string, offset: number) => {
      const before = plain[offset - 1] ?? "";
      const after = plain[offset + candidate.length] ?? "";
      // Never wrap a fragment of an unknown command, identifier or larger expression.
      if (/[A-Za-z0-9\\{}_^/+*=.-]/.test(before) || /[A-Za-z0-9\\{}_^/+*=.-]/.test(after)) return candidate;
      if (!/\^|\\(?:[A-Za-z]+| )/.test(candidate)) return candidate;
      // Bare groups, dangling operators and malformed braces must stay literal.
      if (candidate.startsWith("{") || /[=+*/_^]$/.test(candidate)) return candidate;
      recovered = true;
      return `$${candidate}$`;
    });
  };
  let result = "";
  let cursor = 0;
  for (const match of text.matchAll(protectedSpan)) {
    result += recover(text.slice(cursor, match.index)) + match[0];
    cursor = match.index + match[0].length;
  }
  result += recover(text.slice(cursor));
  return { text: result, recovered };
}

/** Separate complete display blocks from notes; keep incomplete/code blocks literal. */
export function splitXMindNote(note: string): { remarks: string[]; formulas: string[] } {
  const lines = note.replace(/\r\n?/g, "\n").split("\n");
  const remarks: string[] = [];
  const formulas: string[] = [];
  let fence: { char: string; length: number } | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) {
      remarks.push(line);
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    if (marker) {
      fence = { char: marker[1][0], length: marker[1].length };
      remarks.push(line);
      continue;
    }
    const single = line.match(/^\s*\$\$(.+?)\$\$\s*$/);
    if (single && !single[1].includes("$$") && single[1].trim()) {
      formulas.push(`$$${single[1]}$$`);
      continue;
    }
    if (/^\s*\$\$\s*$/.test(line)) {
      let end = i + 1;
      while (end < lines.length && !/^\s*(?:\$\$\s*$|`{3,}|~{3,})/.test(lines[end])) end++;
      const body = lines.slice(i + 1, end).join("\n");
      if (end < lines.length && /^\s*\$\$\s*$/.test(lines[end]) && body.trim()) {
        formulas.push(`$$\n${body}\n$$`);
        i = end;
        continue;
      }
    }
    remarks.push(line);
  }
  return { remarks, formulas };
}
