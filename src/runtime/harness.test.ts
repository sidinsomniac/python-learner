// The grader itself, run in real Python (Pyodide in Node): the desk of files,
// the Pensieve's call stack, and Snape's Year 3 review rules.
import { loadPyodide, type PyodideInterface } from "pyodide";
import { beforeAll, describe, expect, it } from "vitest";
import { stackFrames } from "../engine/pensieve";
import harnessSource from "./harness.py?raw";
import type { GradeOutcome, RunOutcome, TraceOutcome } from "./types";

let py: PyodideInterface;

beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(harnessSource);
}, 60_000);

const run = (code: string, files = {}): RunOutcome => JSON.parse(py.globals.get("run_json")(code, "[]", JSON.stringify(files)));
const grade = (code: string, tests: string, review: string[] = [], files = {}): GradeOutcome =>
  JSON.parse(py.globals.get("grade_json")(code, tests, "[]", JSON.stringify(review), JSON.stringify(files)));
const trace = (code: string, files = {}): TraceOutcome => JSON.parse(py.globals.get("trace_json")(code, "[]", JSON.stringify(files)));

describe("the desk of files", () => {
  it("lays out the exercise's files before a run", () => {
    const out = run("with open('register.txt') as f:\n    print(len(f.readlines()))\n", { "register.txt": "Harry\nRon\nHermione\n" });
    expect(out.error).toBeNull();
    expect(out.stdout).toBe("3\n");
  });

  it("starts every run from a clean desk", () => {
    run("with open('note.txt', 'w') as f:\n    f.write('mischief')\n");
    const out = run("import os\nprint(sorted(os.listdir('.')))\n", { "a.txt": "1" });
    expect(out.stdout).toBe("['a.txt']\n");
  });

  it("reports a missing file as FileNotFoundError", () => {
    expect(run("open('nowhere.txt')\n").error?.type).toBe("FileNotFoundError");
  });

  it("lets tests swap the files and read what the spell wrote", () => {
    const code = [
      "def copy_upper(src, dst):",
      "    with open(src) as f:",
      "        text = f.read()",
      "    with open(dst, 'w') as f:",
      "        f.write(text.upper())",
      "",
    ].join("\n");
    const tests = [
      "def test_default():",
      "    fn = student_function('copy_upper')",
      "    call(fn, 'in.txt', 'out.txt')",
      "    check(read_file('out.txt') == 'LUMOS', 'upper?')",
      "",
      "def test_fresh_desk():",
      "    check(read_file('out.txt') is None, 'each test starts from a clean desk')",
      "",
      "def test_swapped():",
      "    write_files({'in.txt': 'nox'})",
      "    call(student_function('copy_upper'), 'in.txt', 'out.txt')",
      "    check(read_file('out.txt') == 'NOX', 'swapped?')",
      "",
    ].join("\n");
    const result = grade(code, tests, [], { "in.txt": "lumos" });
    expect(result.failure).toBeNull();
    expect(result.passed).toBe(3);
  });
});

describe("raised()", () => {
  it("reports the error a spell raises, or None", () => {
    const code = "def check_year(n):\n    if not 1 <= n <= 7:\n        raise ValueError('year must be 1-7')\n    return n\n";
    const tests = [
      "def test_raises():",
      "    fn = student_function('check_year')",
      "    check(raised(fn, 9) == ('ValueError', 'year must be 1-7'), 'raises?')",
      "    check(raised(fn, 3) is None, 'no error for 3')",
      "",
    ].join("\n");
    expect(grade(code, tests).failure).toBeNull();
  });
});

describe("the Pensieve's call stack", () => {
  const countdown = "def countdown(n):\n    if n == 0:\n        return 0\n    return countdown(n - 1)\n\ncountdown(2)\n";

  it("records how deep each step is", () => {
    const t = trace(countdown);
    const deepest = Math.max(...t.steps.map((s) => s.stack.length));
    expect(deepest).toBe(4); // main + countdown(2) + countdown(1) + countdown(0)
    expect(t.steps[0].stack).toEqual(["main"]);
  });

  it("shows every return as a step with the value handed back", () => {
    const returns = trace(countdown).steps.filter((s) => s.event === "return");
    expect(returns).toHaveLength(3);
    expect(returns.every((s) => s.value === "0" && s.scope === "countdown")).toBe(true);
  });

  it("does not invent a return for a function that crashed", () => {
    const t = trace("def boom():\n    return 1 / 0\n\nboom()\n");
    expect(t.error?.type).toBe("ZeroDivisionError");
    expect(t.steps.some((s) => s.event === "return")).toBe(false);
  });

  it("still records the return of a function that caught its own error", () => {
    const t = trace("def safe():\n    try:\n        return 1 / 0\n    except ZeroDivisionError:\n        return None\n\nsafe()\n");
    expect(t.steps.filter((s) => s.event === "return")).toHaveLength(1);
  });

  it("folds a very deep stack in the middle", () => {
    const frames = stackFrames(["main", ...Array(20).fill("dig")]);
    expect(frames).toHaveLength(8);
    expect(frames[0].label).toBe("dig()");
    expect(frames[4].folded).toBe(14);
    expect(frames[7].label).toBe("main spell");
  });
});

describe("Snape's Year 3 rules", () => {
  const review = (code: string, rule: string) => grade(code, "def test_ok():\n    pass\n", [rule]).review.map((r) => r.id);

  it("bare-except", () => {
    expect(review("try:\n    x = 1\nexcept:\n    x = 2\nprint(x)\n", "bare-except")).toEqual(["bare-except"]);
    expect(review("try:\n    x = 1\nexcept Exception:\n    pass\n", "bare-except")).toEqual(["bare-except"]);
    expect(review("try:\n    x = int('3')\nexcept ValueError:\n    x = 0\nprint(x)\n", "bare-except")).toEqual([]);
  });

  it("open-without-with", () => {
    expect(review("f = open('a.txt', 'w')\nf.write('x')\nf.close()\n", "open-without-with")).toEqual(["open-without-with"]);
    expect(review("with open('a.txt', 'w') as f:\n    f.write('x')\n", "open-without-with")).toEqual([]);
  });

  it("lambda-assign", () => {
    expect(review("double = lambda x: x * 2\nprint(double(2))\n", "lambda-assign")).toEqual(["lambda-assign"]);
    expect(review("print(sorted([3, 1], key=lambda x: -x))\n", "lambda-assign")).toEqual([]);
  });

  it("needless-lambda", () => {
    expect(review("print(sorted(['bb', 'a'], key=lambda w: len(w)))\n", "needless-lambda")).toEqual(["needless-lambda"]);
    expect(review("print(sorted(['bb', 'a'], key=len))\n", "needless-lambda")).toEqual([]);
    expect(review("print(sorted(['bb', 'a'], key=lambda w: (len(w), w)))\n", "needless-lambda")).toEqual([]);
  });
});
