import type { GradeOutcome } from "../runtime/types";
import { translateError } from "./errorTranslator";

export type FeedbackTone = "success" | "question" | "error" | "flaw" | "info";

export interface FeedbackItem {
  tone: FeedbackTone;
  title: string;
  body: string;
  detail?: string;
}

/** Turn a grading outcome into the Professor's (question-only) feedback. */
export function buildFeedback(result: GradeOutcome): FeedbackItem[] {
  if (result.timedOut) {
    return [{
      tone: "error",
      title: "Your spell is spinning forever!",
      body: "The spell ran for too long, so I stopped it. Is there a loop that never ends, or is it waiting for something that never happens?",
    }];
  }

  const items: FeedbackItem[] = [];
  const f = result.failure;
  if (!f) {
    items.push({ tone: "success", title: "The spell works!", body: `All ${result.total} of the examiners' checks passed.` });
  } else if (f.kind === "crash") {
    const t = translateError(f.error);
    items.push({ tone: "error", title: t.creature, body: t.question, detail: `${f.error.type}: ${f.error.message}` + (f.error.line ? ` (line ${f.error.line})` : "") });
  } else if (f.kind === "check") {
    items.push({ tone: "question", title: `Checks passed: ${result.passed} of ${result.total}`, body: f.question });
  } else {
    items.push({ tone: "info", title: "Something odd happened", body: f.question });
  }

  for (const flaw of result.flaws) {
    items.push({ tone: "flaw", title: "Something to ponder", body: flaw.question });
  }
  return items;
}
