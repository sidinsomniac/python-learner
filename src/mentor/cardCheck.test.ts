import { loadPyodide, type PyodideInterface } from "pyodide";
import { beforeAll, describe, expect, it } from "vitest";
import { REVIEW_CARDS } from "../engine/content";
import harnessSource from "../runtime/harness.py?raw";
import type { RunOutcome } from "../runtime/types";
import { fingerprint, forbidden, lessonsUpTo, notUseful, outOfScope, parseCard, runCheck, type Runner } from "./cardCheck";

let py: PyodideInterface;
let run: Runner;

beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(harnessSource);
  py.runPython("STEP_LIMIT = 200_000");
  run = async (code) => JSON.parse(py.globals.get("run_json")(code, "[]", "{}")) as RunOutcome;
}, 60_000);

const card = (raw: object, lessonId = "y3-trial") => parseCard(raw, "t", lessonId);

describe("scope gate", () => {
  it("lets every built-in card through at its own lesson (so the feature table is honest)", () => {
    const misses = REVIEW_CARDS.map((c) => [c.id, outOfScope(c, lessonsUpTo(c.lessonId))]).filter(([, why]) => why);
    expect(misses).toEqual([]);
  });

  it("rejects syntax the player hasn't learned yet", () => {
    const lambdaCard = card({ type: "predict", code: "f = lambda x: x * 2\nprint(f(3))", why: "A lambda is a small unnamed function." })!;
    expect(outOfScope(lambdaCard, lessonsUpTo("y2-trial"))).toBe("lambda, map, filter, key=");
    expect(outOfScope(lambdaCard, lessonsUpTo("y3-l03"))).toBeNull();
    const comp = card({ type: "predict", code: "print([n * 2 for n in range(3)])", why: "A comprehension builds a list." })!;
    expect(outOfScope(comp, lessonsUpTo("y1-trial"))).toBe("list comprehensions");
    const cls = card({ type: "predict", code: "class A:\n    pass\nprint(A)", why: "Classes come in Year 4." })!;
    expect(outOfScope(cls, lessonsUpTo("y3-trial"))).toBe("classes");
  });

  it("spots recursion, and ignores syntax-looking text inside strings", () => {
    const rec = card({ type: "predict", code: "def down(n):\n    if n == 0:\n        return 0\n    return down(n - 1)\nprint(down(3))", why: "It calls itself until n is 0." })!;
    expect(outOfScope(rec, lessonsUpTo("y2-trial"))).toBe("recursion");
    const text = card({ type: "predict", code: 'print("for x in y: lambda")', why: "It's only text in a string." })!;
    expect(outOfScope(text, lessonsUpTo("y1-l01"))).toBeNull();
  });

  it("never allows input, files or unseeded randomness", () => {
    expect(forbidden(card({ type: "predict", code: "name = input()\nprint(name)", why: "Reads a line from the keyboard." })!)).toBe("input()");
    expect(forbidden(card({ type: "predict", code: "import random\nprint(random.randint(1, 6))", why: "A dice roll, different every time." })!)).toBe("unseeded random");
    expect(forbidden(card({ type: "predict", code: "import random\nrandom.seed(3)\nprint(random.randint(1, 6))", why: "A seed makes it repeatable." })!)).toBeNull();
  });
});

describe("schema gate", () => {
  it("accepts well-formed cards and rejects broken ones", () => {
    expect(card({ type: "choice", q: "Which makes an empty set?", options: ["{}", "set()", "[]"], answer: 1, why: "{} is an empty dictionary, not a set." })).not.toBeNull();
    expect(card({ type: "choice", q: "Which makes an empty set?", options: ["{}", "{}", "[]"], answer: 1, why: "Duplicate options are not allowed." })).toBeNull();
    expect(card({ type: "choice", q: "Which?", options: ["a", "b", "c"], answer: 7, why: "The answer is out of range here." })).toBeNull();
    expect(card({ type: "complete", code: "x = 1\nprint(x)", options: ["a", "b", "c"], answer: 0, expected: "1", why: "There is no blank line to fill." })).toBeNull();
    expect(card({ type: "mystery", why: "Unknown types are rejected." })).toBeNull();
  });
});

describe("running the card", () => {
  it("accepts a predict card that prints the same thing every time", async () => {
    expect(await runCheck(card({ type: "predict", code: "print(sorted({3, 1, 2}))", why: "sorted gives back a list." })!, run)).toBeNull();
  });

  it("rejects predict cards that crash or print nothing", async () => {
    expect(await runCheck(card({ type: "predict", code: "print(1 / 0)", why: "Division by zero raises." })!, run)).toMatch(/doesn't run/);
    expect(await runCheck(card({ type: "predict", code: "x = 1\ny = 2", why: "Nothing is printed here." })!, run)).toMatch(/between 1 and 6/);
  });

  it("checks that a bug card's fix really fixes it", async () => {
    const good = card({ type: "bug", code: "total = 0\nfor n in [1, 2, 3]:\n    total = n\nprint(total)", buggyLine: 3, fix: "total += n", expected: "6", why: "= replaces the total each time; += adds to it." })!;
    expect(await runCheck(good, run)).toBeNull();
    const badFix = card({ type: "bug", code: "total = 0\nfor n in [1, 2, 3]:\n    total = n\nprint(total)", buggyLine: 3, fix: "total -= n", expected: "6", why: "This fix is wrong, so the card is rejected." })!;
    expect(await runCheck(badFix, run)).toMatch(/fix/);
  });

  it("insists exactly one option completes the spell", async () => {
    const two = card({ type: "complete", code: "x = 2\n____\nprint(x)", options: ["x = x * 2", "x = x + 2", "x = 1"], answer: 0, expected: "4", why: "Both doubling and adding two give 4 here, so it's ambiguous." })!;
    expect(await runCheck(two, run)).toMatch(/exactly one/);
    const one = card({ type: "complete", code: "x = 3\n____\nprint(x)", options: ["x = x * 2", "x = x + 2", "x = 1"], answer: 0, expected: "6", why: "Only doubling 3 gives 6." })!;
    expect(await runCheck(one, run)).toBeNull();
  });
});

describe("usefulness and duplicates", () => {
  it("rejects thin questions and give-away answers", () => {
    const thin = card({ type: "choice", q: "What is it?", options: ["a", "b", "c"], answer: 0, why: "Because it simply is the first option." })!;
    expect(notUseful(thin)).toMatch(/thin/);
    const giveaway = card({
      type: "choice",
      q: "Why does `bag=[]` as a default argument cause trouble?",
      options: ["Speed", "Memory", "Because the default list is created once when the function is defined, and shared by every call"],
      answer: 2,
      why: "Defaults are evaluated once, at def time, so the same list is reused.",
    })!;
    expect(notUseful(giveaway)).toMatch(/length/);
  });

  it("sees through spacing and string changes when fingerprinting", () => {
    const a = card({ type: "predict", code: 'print( "Harry" * 2 )', why: "Multiplying a string repeats it." })!;
    const b = card({ type: "predict", code: "print('Ron'*2)", why: "Multiplying a string repeats it." })!;
    expect(fingerprint(a).replace(/ /g, "")).toBe(fingerprint(b).replace(/ /g, ""));
  });
});
