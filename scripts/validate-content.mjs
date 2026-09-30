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
const grade = (code, tests, inputs, review = []) =>
  JSON.parse(py.globals.get("grade_json")(code, tests, JSON.stringify(inputs), JSON.stringify(review)));
const run = (code, inputs) => JSON.parse(py.globals.get("run_json")(code, JSON.stringify(inputs)));

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
  const lectureCode = fences(lecture ?? "", "python");
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

    if (ex.type === "divination") {
      if (!ex.snippet) fail(at, "divination needs a snippet");
      else if (run(ex.snippet, inputs).error) fail(at, "the divination snippet raises an error");
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

    const solved = grade(solution, tests, inputs, review);
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
    if (!grade(starter, tests, inputs).failure) fail(at, "the starter code already passes every test");

    // No copy-paste: no lecture example may solve a core or outstanding challenge.
    if (ex.tier === "core" || ex.tier === "outstanding") {
      lectureCode.forEach((block, i) => {
        if (!grade(block, tests, inputs).failure) fail(at, `lecture code block ${i + 1} already solves this challenge`);
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
