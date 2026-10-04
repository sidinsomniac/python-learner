// Auror Academy: interview-style problems grouped by pattern (hashing, two
// pointers, sliding window...). Each case is an ordinary function-style
// exercise wrapped in a one-exercise lesson, so the editor, grader, hints and
// AI Professor all work unchanged. A case unlocks once the lesson it
// `requires` is finished, and Snape reviews it with that lesson's rules.
// This module is only imported by lazily loaded screens, so its YAML stays
// out of the first download (see the "auror" chunk in vite.config.ts).
import { load as loadYaml } from "js-yaml";
import { lessonById } from "./content";
import { isLessonComplete } from "./progress";
import { TIER_REWARD, type Exercise, type ExerciseRecord, type HintLadder, type Lesson } from "./types";

const patternFiles = import.meta.glob("/content/auror/*/pattern.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const caseFiles = import.meta.glob(["/content/auror/*/*.yaml", "!**/pattern.yaml"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export interface ComplexityQuiz {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface AurorCase {
  id: string;
  pattern: string;
  title: string;
  /** The lesson whose completion unlocks this case. */
  requires: string;
  /** A well-known problem it resembles (the text and tests here are original). */
  leetcodeLike?: string;
  difficulty: "easy" | "medium";
  complexity: ComplexityQuiz;
  lesson: Lesson;
  exercise: Exercise;
}

export interface AurorPattern {
  id: string;
  title: string;
  icon: string;
  blurb: string;
  order: number;
  cases: AurorCase[];
}

interface CaseMeta {
  title: string;
  requires: string;
  leetcodeLike?: string;
  difficulty?: "easy" | "medium";
  order?: number;
  complexity: Partial<ComplexityQuiz> & Pick<ComplexityQuiz, "options" | "answer" | "why">;
  task: string;
  starter: string;
  tests: string;
  hints: HintLadder;
}

const folder = (path: string) => path.split("/").at(-2)!;
const slugOf = (path: string) => path.split("/").at(-1)!.replace(/\.yaml$/, "");

function buildCase(pattern: string, slug: string, meta: CaseMeta): AurorCase {
  const id = `auror-${slug}`;
  const year = lessonById(meta.requires)?.year ?? 1;
  const reward = TIER_REWARD.core;
  const exercise: Exercise = {
    id: `${id}.case`,
    lessonId: id,
    slot: "case",
    tier: "core",
    type: "practice",
    title: meta.title,
    task: meta.task,
    inputs: [],
    starter: meta.starter ?? "",
    tests: meta.tests,
    hints: meta.hints,
    xp: reward.xp,
    galleons: reward.galleons,
    files: {},
  };
  const lesson: Lesson = {
    id,
    year,
    order: meta.order ?? 0,
    number: "Auror",
    kind: "lesson",
    title: meta.title,
    location: "The Auror Office",
    concepts: [pattern],
    scene: [],
    outro: [],
    files: {},
    hasSpellbook: false,
    rulesFrom: meta.requires,
    exercises: [exercise],
    review: [],
  };
  return {
    id,
    pattern,
    title: meta.title,
    requires: meta.requires,
    leetcodeLike: meta.leetcodeLike,
    difficulty: meta.difficulty ?? "easy",
    complexity: { q: "What is the time complexity of your solution, for n items?", ...meta.complexity },
    lesson,
    exercise,
  };
}

function buildPatterns(): AurorPattern[] {
  return Object.entries(patternFiles)
    .map(([path, raw]) => {
      const id = folder(path);
      const meta = loadYaml(raw) as Omit<AurorPattern, "id" | "cases">;
      const cases = Object.entries(caseFiles)
        .filter(([p]) => folder(p) === id)
        .map(([p, text]) => buildCase(id, slugOf(p), loadYaml(text) as CaseMeta))
        .sort((a, b) => a.lesson.order - b.lesson.order || a.id.localeCompare(b.id));
      return { ...meta, id, cases };
    })
    .sort((a, b) => a.order - b.order);
}

export const AUROR_PATTERNS: AurorPattern[] = buildPatterns();
export const AUROR_CASES: AurorCase[] = AUROR_PATTERNS.flatMap((p) => p.cases);
export const aurorCaseById = (id: string) => AUROR_CASES.find((c) => c.id === id);

/** A case opens once the lesson that teaches what it needs is finished. */
export function isCaseUnlocked(c: AurorCase, records: Record<string, ExerciseRecord>): boolean {
  const req = lessonById(c.requires);
  return Boolean(req && isLessonComplete(req, records));
}

export const isCaseSolved = (c: AurorCase, records: Record<string, ExerciseRecord>) => Boolean(records[c.exercise.id]);
