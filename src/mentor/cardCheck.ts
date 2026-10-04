// Quality gates for Time-Turner cards written by the AI Professor. A card that
// fails any gate is dropped. Python's real output is the only source of truth:
// the AI's claims about what code prints are never trusted.
import { LESSONS } from "../engine/content";
import type { ReviewCard } from "../engine/types";

/** Runs a snippet (Pyodide in the browser, or in tests). */
export type Runner = (code: string) => Promise<{ stdout: string; error: unknown; timedOut?: boolean }>;

// ---------------------------------------------------------------------------
// Scope: which lesson teaches each piece of syntax. A card may only use what
// the player has finished. Every built-in card passes this at its own lesson
// (see cardsmith.test.ts), which keeps the table honest.
// ---------------------------------------------------------------------------

export interface Feature {
  name: string;
  pattern: RegExp;
  /** The lesson that teaches it, or null for things no built year teaches yet. */
  taughtIn: string | null;
}

export const FEATURES: Feature[] = [
  { name: "f-strings", pattern: /\bf["']/, taughtIn: "y1-l06" },
  { name: "string methods", pattern: /\.(strip|lstrip|rstrip|replace|upper|lower|title|capitalize|startswith|endswith|find|count|isdigit|isalpha)\(/, taughtIn: "y1-l07" },
  { name: "slicing", pattern: /\[[^\]\n]*:[^\]\n]*\]/, taughtIn: "y1-l08a" },
  { name: "and / or / not", pattern: /\b(and|or|not)\b/, taughtIn: "y1-l09" },
  { name: "if", pattern: /^\s*(if|elif|else)\b/m, taughtIn: "y1-l10a" },
  { name: "while", pattern: /^\s*while\b/m, taughtIn: "y1-l11" },
  { name: "for loops", pattern: /^\s*for\b|\brange\(/m, taughtIn: "y1-l12" },
  { name: "break / continue", pattern: /^\s*(break|continue)\b/m, taughtIn: "y1-l13b" },
  { name: "lists", pattern: /\.append\(|\bsum\(|\bmin\(|\bmax\(/, taughtIn: "y1-l14a" },
  { name: "list methods and sorting", pattern: /\.(insert|pop|remove|index|sort)\(|\bsorted\(/, taughtIn: "y2-l01a" },
  { name: "tuples and enumerate", pattern: /\benumerate\(|\btuple\(|\bdivmod\(/, taughtIn: "y2-l02" },
  { name: "dictionaries", pattern: /\{[^{}\n]*:[^{}\n]*\}|\.(get|items|keys|values)\(|\bdict\(|\bdel\b/, taughtIn: "y2-l03a" },
  { name: "setdefault", pattern: /\.setdefault\(/, taughtIn: "y2-l03b" },
  { name: "sets", pattern: /\bset\(|\.(add|discard)\(|\bfrozenset\(/, taughtIn: "y2-l04" },
  { name: "list comprehensions", pattern: /\[[^\]\n]*\bfor\b[^\]\n]*\]/, taughtIn: "y2-l06a" },
  { name: "dict and set comprehensions, any / all", pattern: /\{[^}\n]*\bfor\b[^}\n]*\}|\bany\(|\ball\(|\bif\b[^:\n]*\belse\b/, taughtIn: "y2-l06b" },
  { name: "functions", pattern: /^\s*def\b|^\s*return\b/m, taughtIn: "y2-l07" },
  { name: "default and keyword arguments", pattern: /def\s+\w+\([^)]*=/, taughtIn: "y2-l08" },
  { name: "global / nonlocal", pattern: /^\s*(global|nonlocal)\b/m, taughtIn: "y2-l09" },
  { name: "imports", pattern: /^\s*(import|from)\s+\w+/m, taughtIn: "y2-l10" },
  { name: "split, join, partition", pattern: /\.(split|join|partition|rpartition|splitlines)\(/, taughtIn: "y2-l11" },
  { name: "ord / chr", pattern: /\b(ord|chr)\(/, taughtIn: "y2-l13" },
  { name: "assert", pattern: /^\s*assert\b/m, taughtIn: "y2-l14" },
  { name: "try / except", pattern: /^\s*(try|except|finally)\b/m, taughtIn: "y3-l01a" },
  { name: "raise and isinstance", pattern: /^\s*raise\b|\bisinstance\(/m, taughtIn: "y3-l01b" },
  { name: "files", pattern: /\bopen\(|^\s*with\b/m, taughtIn: "y3-l02" },
  { name: "lambda, map, filter, key=", pattern: /\blambda\b|\bmap\(|\bfilter\(|\bkey\s*=/, taughtIn: "y3-l03" },
  { name: "*args and **kwargs", pattern: /def\s+\w+\([^)]*\*|\*\*\w+/, taughtIn: "y3-l04" },
  { name: "classes", pattern: /^\s*class\b/m, taughtIn: null },
  { name: "generators", pattern: /\byield\b/, taughtIn: null },
  { name: "async", pattern: /\b(async|await)\b/, taughtIn: null },
  { name: "decorators", pattern: /^\s*@\w+/m, taughtIn: null },
  { name: "walrus", pattern: /:=/, taughtIn: null },
  { name: "match", pattern: /^\s*match\s+\S.*:\s*$/m, taughtIn: null },
];

/** Calls itself: recursion is taught in y3-l05a. */
function usesRecursion(code: string): boolean {
  for (const m of code.matchAll(/^(\s*)def\s+(\w+)\s*\(/gm)) {
    const rest = code.slice((m.index ?? 0) + m[0].length);
    const body = rest.split("\n").slice(1);
    const indent = m[1].length;
    const inside: string[] = [];
    for (const line of body) {
      if (line.trim() && line.match(/^\s*/)![0].length <= indent) break;
      inside.push(line);
    }
    if (new RegExp(`\\b${m[2]}\\s*\\(`).test(inside.join("\n"))) return true;
  }
  return false;
}

/** Things AI cards may never do, whatever has been taught: they must be safe and repeatable. */
const FORBIDDEN: { name: string; pattern: RegExp }[] = [
  { name: "input()", pattern: /\binput\s*\(/ },
  { name: "files", pattern: /\bopen\s*\(/ },
  { name: "eval / exec", pattern: /\b(eval|exec|compile|__import__)\s*\(/ },
  { name: "unsafe modules", pattern: /^\s*(import|from)\s+(os|sys|subprocess|socket|shutil|pathlib|urllib|http|requests|time|datetime|threading|asyncio|ctypes|js|pyodide)\b/m },
  { name: "unseeded random", pattern: /^(?![\s\S]*random\.seed\()[\s\S]*\brandom\.\w+\(/ },
];

/** Blank out string literals, so a ':' or 'for' inside a string doesn't look like syntax. */
function stripStrings(code: string): string {
  return code.replace(/("""|''')[\s\S]*?\1|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, (s) => {
    // Keep the f-string marker visible for the f-string feature.
    const q = s[0] === '"' ? '"' : "'";
    return `${q}${q}`;
  });
}

/** Every piece of code a card shows. */
export function cardCode(card: ReviewCard): string {
  const parts: string[] = [];
  if ("code" in card) parts.push(card.code);
  if (card.type === "bug") parts.push(card.fix);
  if (card.type === "complete") parts.push(...card.options);
  if (card.type === "choice") {
    // Code inside backticks in the question or options.
    for (const text of [card.q, ...card.options]) for (const m of text.matchAll(/`([^`]+)`/g)) parts.push(m[1]);
  }
  return parts.join("\n");
}

const ORDER = new Map(LESSONS.map((l, i) => [l.id, i]));

/** The first feature the card uses that hasn't been taught (by a lesson in `done`), or null. */
export function outOfScope(card: ReviewCard, done: Set<string>): string | null {
  const raw = cardCode(card);
  const code = stripStrings(raw);
  for (const f of FEATURES) {
    // f-strings are spotted on the raw code (the prefix sits outside the quotes).
    const hit = f.name === "f-strings" ? f.pattern.test(raw) : f.pattern.test(code);
    if (!hit) continue;
    if (f.taughtIn === null || !done.has(f.taughtIn)) return f.name;
  }
  if (usesRecursion(code) && !done.has("y3-l05a")) return "recursion";
  return null;
}

/** The lessons finished up to and including `lessonId`, in course order (for checking built-in cards). */
export function lessonsUpTo(lessonId: string): Set<string> {
  const end = ORDER.get(lessonId) ?? -1;
  return new Set(LESSONS.filter((_, i) => i <= end).map((l) => l.id));
}

export function forbidden(card: ReviewCard): string | null {
  const code = cardCode(card);
  return FORBIDDEN.find((f) => f.pattern.test(code))?.name ?? null;
}

// ---------------------------------------------------------------------------
// Schema: turn the AI's JSON into a card, or reject it.
// ---------------------------------------------------------------------------

const str = (v: unknown, max = 600) => (typeof v === "string" && v.trim() && v.length <= max ? v : null);
const lines = (code: string) => code.replace(/\n$/, "").split("\n");

/** A well-formed card from raw JSON, or null. `id` and `lessonId` are supplied by the caller. */
export function parseCard(raw: unknown, id: string, lessonId: string): ReviewCard | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const why = str(r.why, 400);
  if (!why) return null;
  const base = { id, lessonId, why, source: "ai" as const };
  const q = str(r.q, 300) ?? undefined;
  const code = str(r.code, 800);
  if (code && lines(code).length > 14) return null;
  const options = Array.isArray(r.options) && r.options.every((o) => str(o, 160)) ? (r.options as string[]) : null;
  const answer = Number.isInteger(r.answer) ? (r.answer as number) : -1;
  const distinct = options && new Set(options.map((o) => o.trim())).size === options.length;
  switch (r.type) {
    case "choice":
      if (!q || !options || options.length < 3 || options.length > 4 || !distinct || answer < 0 || answer >= options.length) return null;
      return { ...base, type: "choice", q, options, answer };
    case "predict":
      return code ? { ...base, type: "predict", q, code } : null;
    case "bug": {
      const fix = str(r.fix, 160);
      const expected = str(r.expected, 200);
      const buggyLine = Number(r.buggyLine);
      if (!code || !fix || !expected || !Number.isInteger(buggyLine) || buggyLine < 1 || buggyLine > lines(code).length) return null;
      return { ...base, type: "bug", q, code, buggyLine, fix, expected };
    }
    case "complete": {
      const expected = str(r.expected, 200);
      if (!code || !expected || !options || options.length < 3 || options.length > 4 || !distinct || answer < 0 || answer >= options.length) return null;
      if (lines(code).filter((l) => l.trim() === "____").length !== 1) return null;
      return { ...base, type: "complete", q, code, options, answer, expected };
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Running the card: Python decides what's true.
// ---------------------------------------------------------------------------

/** Outputs match line by line, ignoring trailing spaces and blank edges. */
export const sameOutput = (a: string, b: string) => norm(a) === norm(b);
const norm = (s: string) =>
  s
    .trim()
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n");

export const fillBlank = (code: string, option: string) =>
  lines(code)
    .map((l) => (l.trim() === "____" ? l.match(/^\s*/)![0] + option.trim() : l))
    .join("\n");

export const applyFix = (code: string, line: number, fix: string) =>
  lines(code)
    .map((l, i) => (i === line - 1 ? l.match(/^\s*/)![0] + fix.trim() : l))
    .join("\n");

/** Why a card fails when run, or null if Python agrees with it. */
export async function runCheck(card: ReviewCard, run: Runner): Promise<string | null> {
  switch (card.type) {
    case "predict": {
      const a = await run(card.code);
      if (a.error || a.timedOut) return "the code doesn't run cleanly";
      const n = norm(a.stdout).split("\n").length;
      if (!a.stdout.trim() || n > 6) return "it should print between 1 and 6 lines";
      const b = await run(card.code);
      if (b.stdout !== a.stdout) return "the output changes from run to run";
      return null;
    }
    case "bug": {
      const broken = await run(card.code);
      if (!broken.error && !broken.timedOut && sameOutput(broken.stdout, card.expected)) return "the 'buggy' code already works";
      const fixed = await run(applyFix(card.code, card.buggyLine, card.fix));
      if (fixed.error || fixed.timedOut || !sameOutput(fixed.stdout, card.expected)) return "the fix doesn't make it print the expected output";
      return null;
    }
    case "complete": {
      const works: boolean[] = [];
      for (const option of card.options) {
        const out = await run(fillBlank(card.code, option));
        works.push(!out.error && !out.timedOut && sameOutput(out.stdout, card.expected));
      }
      if (works.filter(Boolean).length !== 1 || !works[card.answer]) return "exactly one option, the answer, must print the expected output";
      return null;
    }
    case "choice":
      return null; // Checked by a blind second opinion instead (see cardsmith.ts).
  }
}

// ---------------------------------------------------------------------------
// Usefulness and duplicates.
// ---------------------------------------------------------------------------

/** Why a card isn't worth a player's time, or null. */
export function notUseful(card: ReviewCard): string | null {
  if (card.type === "choice") {
    if (card.q.length < 25 && !card.q.includes("`")) return "the question is too thin";
    const lens = card.options.map((o) => o.length);
    const others = lens.filter((_, i) => i !== card.answer);
    if (lens[card.answer] > 2.5 * Math.max(...others) && lens[card.answer] > 40) return "the answer gives itself away by length";
    const ans = card.options[card.answer].toLowerCase().replace(/[^a-z0-9]/g, "");
    const why = card.why.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (why.length < ans.length + 12) return "the explanation only repeats the answer";
  }
  if ("code" in card && lines(card.code).length < 2 && card.type !== "predict") return "the snippet is too short";
  if (card.why.trim().length < 20) return "the explanation is too short";
  return null;
}

/** A fingerprint that ignores spacing, case and names in strings, to spot near-duplicates. */
export function fingerprint(card: ReviewCard): string {
  const text = "code" in card ? card.code : card.q;
  return stripStrings(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9_ ()[\]{}=+\-*/%<>.,:]/g, "")
    .trim();
}
