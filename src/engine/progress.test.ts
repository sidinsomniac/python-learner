import { describe, expect, it } from "vitest";
import { CAST, EXERCISES, LESSONS, YEARS, lessonById } from "./content";
import { splitLecture } from "./lecture";
import {
  compareProphecy,
  gradeFor,
  isExerciseUnlocked,
  isLessonComplete,
  isLessonUnlocked,
  isYearComplete,
  lessonGrade,
  levelFromXp,
  levelProgress,
  reviewRulesFor,
  xpForCompletion,
  xpForLevel,
} from "./progress";
import { migrateSave } from "./store";
import { isRequired, type ExerciseRecord } from "./types";

const done = (grade: ExerciseRecord["grade"] = "E"): ExerciseRecord => ({
  completedAt: "2026-01-01",
  attempts: 1,
  hintsUsed: 0,
  xpEarned: 1,
  grade,
});
const completeLessons = (ids: string[]) =>
  Object.fromEntries(ids.flatMap((id) => lessonById(id)!.exercises.filter(isRequired).map((e) => [e.id, done()])));

describe("levels", () => {
  it("uses a growing XP curve", () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 100, 300, 600]);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelProgress(150)).toMatchObject({ level: 2, into: 50, needed: 200 });
  });
});

describe("xpForCompletion", () => {
  it("gives a first-try, no-hint bonus", () => {
    expect(xpForCompletion(100, 0, 1)).toBe(125);
  });
  it("takes 15% per hint but never below 40%, and the analogous rung costs nothing extra", () => {
    expect(xpForCompletion(100, 1, 2)).toBe(85);
    expect(xpForCompletion(100, 4, 9)).toBe(40);
    expect(xpForCompletion(100, 5, 9)).toBe(40);
  });
});

describe("grades", () => {
  it("rewards no hints plus a clean code review with an O", () => {
    expect(gradeFor(0, true)).toBe("O");
    expect(gradeFor(0, false)).toBe("E");
    expect(gradeFor(1, true)).toBe("E");
    expect(gradeFor(3, true)).toBe("A");
    expect(gradeFor(5, true)).toBe("P");
  });

  it("grades a lesson by its weakest required exercise, lifted by the Outstanding challenge", () => {
    const lesson = lessonById("y1-l01")!;
    const [warmup, core, outstanding] = lesson.exercises;
    expect(lessonGrade(lesson, { [warmup.id]: done("O") })).toBeNull();
    expect(lessonGrade(lesson, { [warmup.id]: done("O"), [core.id]: done("A") })).toBe("A");
    expect(lessonGrade(lesson, { [warmup.id]: done("E"), [core.id]: done("E"), [outstanding.id]: done("E") })).toBe("O");
  });
});

describe("unlocking", () => {
  const year1 = YEARS.find((y) => y.year === 1)!;

  it("opens only the first lesson at the start", () => {
    expect(year1.lessons.map((l) => isLessonUnlocked(l, YEARS, {}))).toEqual(year1.lessons.map((_, i) => i === 0));
  });

  it("opens the next lesson when the required exercises are done - the Outstanding one is optional", () => {
    const records = completeLessons(["y1-l01"]);
    expect(isLessonComplete(lessonById("y1-l01")!, records)).toBe(true);
    expect(isLessonUnlocked(lessonById("y1-l02")!, YEARS, records)).toBe(true);
    expect(isLessonUnlocked(lessonById("y1-l03")!, YEARS, records)).toBe(false);
  });

  it("opens exercises within a lesson in order", () => {
    const lesson = lessonById("y1-l02")!;
    const [warmup, core, outstanding] = lesson.exercises;
    expect([warmup, core, outstanding].map((e) => isExerciseUnlocked(e, lesson, {}))).toEqual([true, false, false]);
    const records = { [warmup.id]: done() };
    expect([core, outstanding].map((e) => isExerciseUnlocked(e, lesson, records))).toEqual([true, false]);
  });

  it("completes the year only when the Trial is passed", () => {
    const allButTrial = completeLessons(year1.lessons.filter((l) => l.kind !== "trial").map((l) => l.id));
    expect(isYearComplete(year1, allButTrial)).toBe(false);
    expect(isYearComplete(year1, completeLessons(year1.lessons.map((l) => l.id)))).toBe(true);
  });
});

describe("Snape's review rules", () => {
  it("only switches rules on once their idea has been taught", () => {
    expect(reviewRulesFor("y1-l01")).toEqual([]);
    expect(reviewRulesFor("y1-l06")).toEqual(expect.arrayContaining(["unused-variable", "str-in-fstring"]));
    expect(reviewRulesFor("y1-l06")).not.toContain("augmented-assign");
    expect(reviewRulesFor("y1-trial")).toContain("augmented-assign");
  });
});

describe("compareProphecy", () => {
  it("accepts matching output, ignoring trailing spaces and blank lines", () => {
    expect(compareProphecy("10 \n3.5\n\n", "10\n3.5\n").correct).toBe(true);
  });
  it("reports the first wrong line without revealing it", () => {
    expect(compareProphecy("10\n3\n", "10\n3.5\n")).toMatchObject({ correct: false, firstWrongLine: 2 });
  });
});

describe("Year 1 content", () => {
  const year1 = YEARS.find((y) => y.year === 1)!;

  it("has 15 lessons (with parts), 3 revisions and a Trial", () => {
    const numbers = new Set(year1.lessons.filter((l) => l.kind === "lesson").map((l) => l.number));
    expect(numbers.size).toBe(15);
    expect(year1.lessons.filter((l) => l.kind === "revision")).toHaveLength(3);
    expect(year1.lessons.at(-1)?.kind).toBe("trial");
  });

  it("gives every ordinary lesson a warm-up, a core challenge with a twist, and an Outstanding challenge", () => {
    for (const lesson of year1.lessons.filter((l) => l.kind === "lesson")) {
      expect(lesson.exercises.map((e) => e.tier)).toEqual(["warmup", "core", "outstanding"]);
      expect(lesson.exercises[1].twist).toBeTruthy();
    }
  });

  it("only uses cast members who exist", () => {
    const speakers = [...year1.intro, ...LESSONS.flatMap((l) => [...l.scene, ...l.outro])].map((s) => s.who);
    for (const who of speakers) expect(CAST[who]).toBeDefined();
  });

  it("never bundles reference solutions", () => {
    const bundled = JSON.stringify(EXERCISES);
    expect(bundled).not.toContain('print(f"Welcome {name}! Your letter arrives in {years_left} years.")');
  });
});

describe("lecture checkpoints", () => {
  it("splits a lecture into Markdown and checkpoints", () => {
    const md = "# Intro\n\n```checkpoint\nq: Two plus two?\noptions: ['3', '4']\nanswer: 1\nwhy: Maths.\n```\n\nMore text.\n";
    const parts = splitLecture(md);
    expect(parts.map((p) => p.kind)).toEqual(["md", "checkpoint", "md"]);
    expect(parts[1]).toMatchObject({ kind: "checkpoint", spec: { q: "Two plus two?", answer: 1 } });
  });
});

describe("save migration", () => {
  it("moves the first slice's quests onto the new lessons, keeping XP and badges", () => {
    const v1 = {
      name: "Sid",
      house: "slytherin",
      xp: 300,
      badges: { "dobbys-sock": "2026-09-29" },
      completed: {
        "y1-q1-first-incantation": { completedAt: "x", attempts: 1, hintsUsed: 0, xpEarned: 63 },
        "y1-q5-broken-letter-potion": { completedAt: "x", attempts: 2, hintsUsed: 2, xpEarned: 56 },
      },
      hintsUnlocked: { "y1-q5-broken-letter-potion": 2 },
      drafts: { "y1-q1-first-incantation": 'print("hi")' },
    };
    const v2 = migrateSave(v1, 1) as Record<string, Record<string, unknown>>;
    expect(v2.exercises).toEqual({
      "y1-l01.warmup": expect.objectContaining({ grade: "E", xpEarned: 63 }),
      "y1-l05.warmup": expect.objectContaining({ grade: "A" }),
    });
    expect(v2.hintsUnlocked).toEqual({ "y1-l05.warmup": 2 });
    expect(v2.drafts).toEqual({ "y1-l01.warmup": 'print("hi")' });
    expect(v2.xp).toBe(300);
    expect(v2.badges).toEqual({ "dobbys-sock": "2026-09-29" });
    expect(v2).not.toHaveProperty("completed");
  });
});
