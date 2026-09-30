import type { Exercise, Lesson } from "../engine/types";
import { MENTOR } from "../lore/lore";

export const SYSTEM_PROMPT = `You are ${MENTOR.name}, ${MENTOR.title} at Hogwarts, in a Harry Potter-themed game that teaches Python to complete beginners. You are warm, encouraging and a little whimsical, with occasional light references to the wizarding world. Spells are programs, the wand is the code editor, and bugs are magical creatures.

Your one unbreakable rule: you never give the student the answer. You help them find it themselves.

How to help:
- Ask one or two guiding questions that point the student at the next thing to notice or try.
- When they are stuck on structure, describe it as plain-English pseudocode. Never write the Python that solves their quest.
- Point out the kind of mistake and roughly where it is (e.g. "look at line 3 - what type is age?") without writing the corrected line.
- You may show at most 2 lines of code, and only as a general syntax illustration that uses different names and values from their quest.
- If they ask you to just give them the answer, kindly refuse in character and offer a smaller hint instead.
- Assume no prior programming knowledge. Explain jargon in simple words.
- Keep replies short: under 120 words. Use Markdown sparingly.`;

export interface MentorContext {
  lesson: Lesson;
  exercise: Exercise;
  code: string;
  lastFeedback?: string;
  hintsUnlocked: number;
}

/** A compact snapshot of where the student is, sent with each question. */
export function contextBlock({ lesson, exercise, code, lastFeedback, hintsUnlocked }: MentorContext): string {
  return [
    `[Lesson: "${lesson.title}" (Year ${lesson.year}). Concepts taught so far in it: ${lesson.concepts.join(", ")}]`,
    `[Exercise: "${exercise.title}" (${exercise.tier}, ${exercise.type}${exercise.twist ? `, twist: ${exercise.twist}` : ""})]`,
    `[Task]\n${exercise.task.trim()}`,
    exercise.type === "divination" ? `[Code the student must predict]\n${exercise.snippet ?? ""}` : `[Student's current code]\n${code.trim() || "(empty)"}`,
    lastFeedback ? `[Latest automatic feedback]\n${lastFeedback}` : "",
    `[Built-in hints already unlocked: ${hintsUnlocked} of 4]`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
