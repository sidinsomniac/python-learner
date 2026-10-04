// Content validator. Enforces the rules in docs/exercise-design.md:
// - every exercise is solvable, and its starter code doesn't already pass;
// - core/outstanding challenges can't be solved by copying lecture code;
// - hints never contain the answer;
// - reference solutions get a clean code review (so an O is achievable);
// - scenes, checkpoints and lesson structure are well formed.
//
//   npm run validate-content            (all years)
//   npm run validate-content -- y1-l04a (only lessons whose id starts with this)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import { loadPyodide } from "pyodide";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const only = process.argv[2];

const TYPES = ["practice", "scramble", "divination", "repair"];
const TIERS = ["warmup", "core", "outstanding", "review", "stage"];
const KINDS = ["lesson", "revision", "trial"];
const HINT_RUNGS = ["nudge", "question", "pseudocode", "flaw", "analogous"];

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const read = (...parts) => {
  const p = join(...parts);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
};
const yaml = (where, text) => {
  try {
    return loadYaml(text);
  } catch (err) {
    fail(where, `YAML does not parse: ${err.message.split("\n")[0]}`);
    return null;
  }
};

const cast = loadYaml(read(contentDir, "cast.yaml"));
const reviewSince = loadYaml(read(contentDir, "review-rules.yaml"));

const py = await loadPyodide();
py.runPython(read(root, "src", "runtime", "harness.py"));
// No worker to terminate here, so stop runaway spells by counting lines.
py.runPython("STEP_LIMIT = 200_000");
const grade = (code, tests, inputs, review = [], files = {}) =>
  JSON.parse(py.globals.get("grade_json")(code, tests, JSON.stringify(inputs), JSON.stringify(review), JSON.stringify(files)));
/** Outputs match when they agree line by line, ignoring trailing spaces and blank edges. */
const same = (a, b) => String(a).trim().split("\n").map((l) => l.trimEnd()).join("\n") === String(b).trim().split("\n").map((l) => l.trimEnd()).join("\n");
const run = (code, inputs, files = {}) => JSON.parse(py.globals.get("run_json")(code, JSON.stringify(inputs), JSON.stringify(files)));
// Desk files must be a map of file name -> text.
function checkFiles(where, files) {
  if (files === undefined) return {};
  if (typeof files !== "object" || Array.isArray(files) || files === null) {
    fail(where, "files must be a map of file name -> text");
    return {};
  }
  for (const [name, text] of Object.entries(files)) {
    if (typeof text !== "string") fail(where, `the file ${name} must hold text (quote it, or use a | block)`);
    if (name.startsWith("/") || name.includes("..")) fail(where, `the file name ${name} must stay on the desk (no / at the start, no ..)`);
  }
  return files;
}

function checkScene(where, lines) {
  if (lines === undefined) return;
  if (!Array.isArray(lines)) return fail(where, "a scene must be a list of { who, line }");
  lines.forEach((l, i) => {
    if (!l?.who || !l?.line) fail(where, `scene line ${i + 1} needs both who and line`);
    else if (!cast[l.who]) fail(where, `scene line ${i + 1}: unknown speaker "${l.who}" (add them to content/cast.yaml)`);
  });
}

const fences = (markdown, lang) =>
  [...markdown.matchAll(new RegExp("^```" + lang + "\\n([\\s\\S]*?)^```\\s*$", "gm"))].map((m) => m[1]);

// ---------------------------------------------------------------------------
// Collect every lesson, in order, so review rules can be enabled by position.
// ---------------------------------------------------------------------------
const lessons = [];
for (const yearDir of readdirSync(contentDir, { withFileTypes: true })) {
  if (!yearDir.isDirectory()) continue;
  const yearPath = join(contentDir, yearDir.name);
  const yearMeta = read(yearPath, "year.yaml");
  if (!yearMeta) continue; // not a year folder
  const year = yaml(`${yearDir.name}/year.yaml`, yearMeta);
  if (!year) continue;
  for (const field of ["year", "title", "mystery"]) if (year[field] === undefined) fail(`${yearDir.name}/year.yaml`, `missing "${field}"`);
  for (const key of ["mood", "gold", "gold2", "bg", "bg2", "card", "card2", "line"]) {
    if (!year.theme?.[key]) fail(`${yearDir.name}/year.yaml`, `the year's theme is missing "${key}"`);
  }
  checkScene(`${yearDir.name}/year.yaml intro`, year.intro);

  for (const lessonDir of readdirSync(yearPath, { withFileTypes: true })) {
    if (!lessonDir.isDirectory()) continue;
    const dir = join(yearPath, lessonDir.name);
    const raw = read(dir, "lesson.yaml");
    const where = relative(contentDir, dir);
    if (!raw) {
      fail(where, "missing lesson.yaml");
      continue;
    }
    const meta = yaml(`${where}/lesson.yaml`, raw);
    if (meta) lessons.push({ meta, dir, where, year: year.year });
  }
}
lessons.sort((a, b) => a.year - b.year || a.meta.order - b.meta.order);
const lessonIds = lessons.map((l) => l.meta.id);
const rulesFor = (id) =>
  Object.entries(reviewSince)
    .filter(([, since]) => lessonIds.indexOf(since) >= 0 && lessonIds.indexOf(since) <= lessonIds.indexOf(id))
    .map(([rule]) => rule);

for (const [rule, since] of Object.entries(reviewSince)) {
  if (!only && !lessonIds.includes(since)) fail("review-rules.yaml", `rule ${rule} starts at unknown lesson ${since}`);
}

// ---------------------------------------------------------------------------
// Validate each lesson.
// ---------------------------------------------------------------------------
const seenIds = new Set();
const seenOrders = new Set();
let exerciseCount = 0;

for (const { meta, dir, where, year } of lessons) {
  if (only && !meta.id?.startsWith(only)) continue;
  for (const field of ["id", "year", "order", "number", "title", "location", "concepts", "exercises"]) {
    if (meta[field] === undefined) fail(where, `lesson.yaml is missing "${field}"`);
  }
  if (meta.year !== year) fail(where, `lesson year ${meta.year} doesn't match its folder's year ${year}`);
  if (seenIds.has(meta.id)) fail(where, `duplicate lesson id ${meta.id}`);
  seenIds.add(meta.id);
  if (seenOrders.has(`${year}:${meta.order}`)) fail(where, `duplicate order ${meta.order} in year ${year}`);
  seenOrders.add(`${year}:${meta.order}`);
  const kind = meta.kind ?? "lesson";
  if (!KINDS.includes(kind)) fail(where, `unknown kind "${kind}"`);
  checkScene(`${where} scene`, meta.scene);
  checkScene(`${where} outro`, meta.outro);
  const lessonFiles = checkFiles(`${where}/lesson.yaml`, meta.files);

  const lecture = read(dir, "lecture.md");
  if (!lecture) fail(where, "missing lecture.md");
  if (kind === "lesson" && !read(dir, "spellbook.md")) fail(where, "missing spellbook.md");
  for (const cp of fences(lecture ?? "", "checkpoint")) {
    const spec = yaml(`${where} checkpoint`, cp);
    if (!spec) continue;
    if (!spec.q || !Array.isArray(spec.options) || spec.options.length < 2 || !spec.why) {
      fail(where, `a checkpoint needs q, at least 2 options, and why`);
    } else if (!Number.isInteger(spec.answer) || spec.answer < 0 || spec.answer >= spec.options.length) {
      fail(where, `checkpoint "${spec.q.slice(0, 30)}..." has an answer index out of range`);
    }
  }
  // Time-Turner and Dueling Club cards.
  const reviewRaw = read(dir, "review.yaml");
  if (kind === "lesson" && !reviewRaw) fail(where, "missing review.yaml (2-4 Time-Turner cards)");
  if (reviewRaw) {
    const cards = yaml(`${where}/review.yaml`, reviewRaw) ?? [];
    if (!Array.isArray(cards)) fail(where, "review.yaml must be a list of cards");
    else {
      if (kind === "lesson" && (cards.length < 2 || cards.length > 4)) fail(where, `review.yaml should have 2-4 cards (it has ${cards.length})`);
      if (kind === "lesson" && !cards.some((c) => c?.type === "choice")) fail(where, "review.yaml needs at least one choice card (the Dueling Club uses them)");
      const ids = new Set();
      for (const card of cards) {
        const at = `${where}/review.yaml#${card?.id}`;
        if (!card?.id || ids.has(card.id)) fail(at, "every card needs a unique id");
        ids.add(card?.id);
        if (!card?.why) fail(at, "every card needs a why");
        if (card?.type === "choice") {
          if (!card.q || !Array.isArray(card.options) || card.options.length < 2) fail(at, "a choice card needs q and at least 2 options");
          else if (!Number.isInteger(card.answer) || card.answer < 0 || card.answer >= card.options.length) fail(at, "answer index out of range");
        } else if (card?.type === "predict") {
          const out = card.code ? run(card.code, []) : null;
          if (!out || out.error) fail(at, `the predict card's code must run cleanly${out?.error ? ` (${out.error.type})` : ""}`);
          else if (!out.stdout.trim()) fail(at, "the predict card's code prints nothing");
        } else if (card?.type === "bug") {
          // The snippet must go wrong as written, and the fix must make it print what it should.
          const lines = String(card.code ?? "").replace(/\n$/, "").split("\n");
          if (!Number.isInteger(card.buggyLine) || card.buggyLine < 1 || card.buggyLine > lines.length) fail(at, "buggyLine must be a line of the code");
          else if (typeof card.fix !== "string" || typeof card.expected !== "string") fail(at, "a bug card needs fix and expected");
          else {
            const broken = run(card.code, []);
            if (!broken.error && same(broken.stdout, card.expected)) fail(at, "the buggy code already prints the expected output");
            const fixed = lines.map((l, i) => (i === card.buggyLine - 1 ? card.fix : l)).join("\n");
            const out = run(fixed, []);
            if (out.error || !same(out.stdout, card.expected)) fail(at, `with the fix, the code should print ${JSON.stringify(card.expected)}`);
          }
        } else if (card?.type === "complete") {
          // Exactly one option, put in place of ____, must print the expected output - and it must be the answer.
          const lines = String(card.code ?? "").split("\n");
          const blank = lines.findIndex((l) => l.trim() === "____");
          if (blank < 0) fail(at, "a complete card's code needs a line that is just ____");
          else if (!Array.isArray(card.options) || card.options.length < 2 || !Number.isInteger(card.answer)) fail(at, "a complete card needs options and an answer");
          else {
            const indent = lines[blank].match(/^\s*/)[0];
            const works = card.options.map((o) => {
              const out = run(lines.map((l, i) => (i === blank ? indent + o : l)).join("\n"), []);
              return !out.error && same(out.stdout, card.expected);
            });
            if (works.filter(Boolean).length !== 1 || !works[card.answer]) fail(at, `exactly one option (the answer) must print ${JSON.stringify(card.expected)}; working options: ${works.map((w, i) => (w ? i : null)).filter((i) => i !== null).join(",") || "none"}`);
          }
        } else {
          fail(at, `unknown card type "${card?.type}"`);
        }
      }
    }
  }

  const lectureCode = fences(lecture ?? "", "python");
  // "Try it" examples run with the lesson's desk files, so every file they open must be there.
  lectureCode.forEach((block, i) => {
    const out = run(block, [], lessonFiles);
    if (out.error?.type === "FileNotFoundError") fail(where, `lecture code block ${i + 1} opens a file the lesson doesn't put on the desk (${out.error.message})`);
  });
  const review = rulesFor(meta.id);

  for (const slot of meta.exercises ?? []) {
    exerciseCount++;
    const at = `${where}/${slot}`;
    const raw = read(dir, `${slot}.yaml`);
    if (!raw) {
      fail(at, "exercise file is missing");
      continue;
    }
    const ex = yaml(`${at}.yaml`, raw);
    if (!ex) continue;
    for (const field of ["tier", "type", "title", "task", "hints"]) if (ex[field] === undefined) fail(at, `missing "${field}"`);
    if (!TIERS.includes(ex.tier)) fail(at, `unknown tier "${ex.tier}"`);
    if (!TYPES.includes(ex.type)) fail(at, `unknown type "${ex.type}"`);
    for (const rung of HINT_RUNGS) if (!ex.hints?.[rung]) fail(at, `the hint ladder is missing "${rung}"`);
    const inputs = (ex.inputs ?? []).map(String);
    const files = checkFiles(at, ex.files);

    if (ex.type === "divination") {
      if (!ex.snippet) fail(at, "divination needs a snippet");
      else if (run(ex.snippet, inputs, files).error) fail(at, "the divination snippet raises an error");
      continue;
    }

    const tests = ex.tests;
    const solution = read(dir, `${slot}.solution.py`);
    if (!tests) {
      fail(at, "missing tests");
      continue;
    }
    if (!solution) {
      fail(at, `missing ${slot}.solution.py`);
      continue;
    }

    const solved = grade(solution, tests, inputs, review, files);
    if (solved.total === 0) fail(at, "tests define no test_ functions");
    if (solved.failure) fail(at, `the reference solution fails ${solved.failure.test}: ${JSON.stringify(solved.failure).slice(0, 300)}`);
    else if (solved.review.length) fail(at, `Snape isn't happy with the reference solution: ${solved.review.map((r) => r.id).join(", ")}`);
    if (ex.tier === "core" && solved.total < 3) fail(at, "core challenges need at least 3 tests (including hidden edge cases)");

    let starter = ex.starter ?? "";
    if (ex.type === "scramble") {
      starter = (ex.lines ?? []).join("\n") + "\n";
      const sortLines = (ls) => ls.map((l) => l.replace(/\s+$/, "")).filter((l) => l.trim()).sort();
      if (JSON.stringify(sortLines(solution.split("\n"))) !== JSON.stringify(sortLines(ex.lines ?? []))) {
        fail(at, "the solution must be a reordering of the scramble lines");
      }
    }
    if (!grade(starter, tests, inputs, [], files).failure) fail(at, "the starter code already passes every test");

    // No copy-paste: no lecture example may solve a core or outstanding challenge.
    if (ex.tier === "core" || ex.tier === "outstanding") {
      lectureCode.forEach((block, i) => {
        if (!grade(block, tests, inputs, [], files).failure) fail(at, `lecture code block ${i + 1} already solves this challenge`);
      });
    }

    // Lines the learner can already see in the starter code give nothing away.
    const norm = (line) => line.trim().replace(/\s+/g, " ");
    const visible = new Set(starter.split("\n").map(norm));
    const hintText = HINT_RUNGS.map((r) => ex.hints?.[r] ?? "").join("\n").replace(/\s+/g, " ");
    for (const line of solution.split("\n")) {
      const trimmed = norm(line);
      if (trimmed.length >= 12 && !visible.has(trimmed) && hintText.includes(trimmed)) {
        fail(at, `a hint contains a solution line: ${trimmed}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} content problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ ${seenIds.size} lessons and ${exerciseCount} exercises validated`);
