// The Time-Turner card writer's prompts. Separate from the tutor's prompt:
// these ask for review questions, in JSON, about code the player has learned.

export const CARD_SYSTEM = `You write review cards for Parseltongue Academy, a Harry Potter-themed game that teaches Python to an experienced JavaScript/TypeScript developer. Cards come back on a spaced-repetition schedule, so each one must teach or test one real, durable Python insight.

Reply with JSON only, in exactly this shape:
{"cards": [CARD, ...]}

Each CARD is one of:
- {"type": "predict", "lesson": ID, "q": optional string, "code": string, "why": string}
  The player types what the code prints. Do NOT include the output - it is worked out by running the code.
- {"type": "choice", "lesson": ID, "q": string, "options": [3 or 4 strings], "answer": index, "why": string}
- {"type": "bug", "lesson": ID, "q": optional string, "code": string, "buggyLine": 1-based line number, "fix": the corrected line, "expected": what the fixed code prints, "why": string}
- {"type": "complete", "lesson": ID, "q": optional string, "code": string containing exactly one line that is just ____ (indented as needed), "options": [3 or 4 candidate lines], "answer": index, "expected": what the correct version prints, "why": string}

Rules - cards that break them are thrown away:
1. Use ONLY the concepts listed as learned. Never use anything listed as not yet taught, and never classes, generators, decorators, async, walrus or match.
2. Code: 2 to 12 lines, deterministic, prints 1 to 6 lines. No input(), no files, no network, no imports except math, collections, json, and random only with random.seed(...). Sort sets before printing them.
3. One unambiguous correct answer. In complete cards, every wrong option must run but print something different. In bug cards, the bug is a single line, and the code must visibly misbehave (wrong output or an error).
4. Distractors must be real misconceptions a JS developer would have (mutability, integer vs float division, truthiness, == vs is, scope, off-by-one, aliasing...), not jokes. Keep options similar in length.
5. "why": one or two sentences explaining the insight, not just restating the answer.
6. Vary the type and the angle: gotchas, edge cases, "which is faster", reading unfamiliar code, interview-style reasoning.
7. Light Hogwarts flavour in names and strings (owls, potions, house points), never at the cost of clarity.
8. Do not copy or lightly reword the example cards or the cards to avoid.`;

export const BLIND_SYSTEM = `You are checking multiple-choice questions about Python. For each question, work out the correct option yourself. Reply with JSON only: {"answers": [index, index, ...]} - one 0-based index per question, in order.`;

export interface CardBrief {
  lesson: string;
  title: string;
  concepts: string[];
  examples: string[];
}

export function cardRequest(targets: CardBrief[], learned: string[], notYet: string[], avoid: string[], count: number): string {
  const lines = [
    `Write ${count} cards: a mix of predict, choice, bug and complete, spread across these target lessons (put the lesson's id in "lesson"):`,
    "",
    ...targets.flatMap((t) => [`## ${t.lesson}: ${t.title}`, `Concepts: ${t.concepts.join(", ")}`, "Example cards from this lesson (for style only - do not copy):", ...t.examples.map((e) => `- ${e}`), ""]),
    `Concepts the player has learned (you may use any of these): ${learned.join("; ")}`,
    notYet.length ? `NOT yet taught (never use): ${notYet.join("; ")}` : "",
    avoid.length ? `Avoid cards like these (the player has seen them, or flagged them as unhelpful):\n${avoid.map((a) => `- ${a}`).join("\n")}` : "",
  ];
  return lines.filter((l) => l !== "").join("\n");
}

export function blindRequest(questions: { q: string; options: string[] }[]): string {
  return questions.map((q, i) => `${i + 1}. ${q.q}\n${q.options.map((o, j) => `   ${j}) ${o}`).join("\n")}`).join("\n\n");
}
