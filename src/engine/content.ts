import { load as loadYaml } from "js-yaml";
import castRaw from "/content/cast.yaml?raw";
import {
  TIER_REWARD,
  type CastMember,
  type Exercise,
  type HintLadder,
  type Lesson,
  type SceneLine,
  type Tier,
  type Year,
} from "./types";

// Only these files are bundled. `*.solution.py` files never are.
const yearFiles = import.meta.glob("/content/*/year.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const lessonFiles = import.meta.glob("/content/*/*/lesson.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const exerciseFiles = import.meta.glob(["/content/*/*/*.yaml", "!**/lesson.yaml"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const lectures = import.meta.glob("/content/*/*/lecture.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const spellbooks = import.meta.glob("/content/*/*/spellbook.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const CAST = loadYaml(castRaw) as Record<string, CastMember>;

interface LessonMeta {
  id: string;
  year: number;
  order: number;
  number: string | number;
  kind?: Lesson["kind"];
  title: string;
  part?: { n: number; of: number };
  location: string;
  concepts: string[];
  scene?: SceneLine[];
  outro?: SceneLine[];
  clue?: string;
  exercises: string[];
}

interface ExerciseMeta {
  tier: Tier;
  type: Exercise["type"];
  title: string;
  twist?: string;
  intro?: string;
  task: string;
  inputs?: (string | number)[];
  starter?: string;
  tests?: string;
  hints: HintLadder;
  xp?: number;
  galleons?: number;
  lines?: string[];
  snippet?: string;
}

const dirOf = (path: string) => path.slice(0, path.lastIndexOf("/") + 1);

function buildExercise(lessonId: string, dir: string, slot: string): Exercise {
  const raw = exerciseFiles[`${dir}${slot}.yaml`];
  if (!raw) throw new Error(`Missing exercise ${dir}${slot}.yaml`);
  const meta = loadYaml(raw) as ExerciseMeta;
  const reward = TIER_REWARD[meta.tier];
  const exercise: Exercise = {
    id: `${lessonId}.${slot}`,
    lessonId,
    slot,
    tier: meta.tier,
    type: meta.type,
    title: meta.title,
    twist: meta.twist,
    intro: meta.intro,
    task: meta.task,
    inputs: (meta.inputs ?? []).map(String),
    starter: meta.starter ?? "",
    tests: meta.tests ?? "",
    hints: meta.hints,
    xp: meta.xp ?? reward.xp,
    galleons: meta.galleons ?? reward.galleons,
    lines: meta.lines,
    snippet: meta.snippet,
  };
  if (exercise.type === "scramble") exercise.starter = (exercise.lines ?? []).join("\n") + "\n";
  return exercise;
}

function buildYears(): Year[] {
  const lessons: Lesson[] = Object.entries(lessonFiles).map(([path, raw]) => {
    const dir = dirOf(path);
    const meta = loadYaml(raw) as LessonMeta;
    return {
      id: meta.id,
      year: meta.year,
      order: meta.order,
      number: String(meta.number),
      kind: meta.kind ?? "lesson",
      title: meta.title,
      part: meta.part,
      location: meta.location,
      concepts: meta.concepts,
      scene: meta.scene ?? [],
      outro: meta.outro ?? [],
      clue: meta.clue,
      lecture: lectures[`${dir}lecture.md`] ?? "",
      spellbook: spellbooks[`${dir}spellbook.md`] ?? "",
      exercises: meta.exercises.map((slot) => buildExercise(meta.id, dir, slot)),
    };
  });

  return Object.values(yearFiles)
    .map((raw) => {
      const meta = loadYaml(raw) as Omit<Year, "lessons">;
      return {
        ...meta,
        intro: meta.intro ?? [],
        lessons: lessons.filter((l) => l.year === meta.year).sort((a, b) => a.order - b.order),
      };
    })
    .sort((a, b) => a.year - b.year);
}

export const YEARS: Year[] = buildYears();
export const LESSONS: Lesson[] = YEARS.flatMap((y) => y.lessons);
export const EXERCISES: Exercise[] = LESSONS.flatMap((l) => l.exercises);

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);
export const yearOf = (n: number) => YEARS.find((y) => y.year === n);

/** Global position of a lesson across all years (used to enable review rules). */
export const lessonIndex = (id: string) => LESSONS.findIndex((l) => l.id === id);

export const displayNumber = (l: Lesson) =>
  l.kind === "trial" ? "Trial" : l.part ? `${l.number} · Pt ${l.part.n}` : l.number;
