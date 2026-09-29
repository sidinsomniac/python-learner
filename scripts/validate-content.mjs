// Content validator: every quest must be solvable, must not be pre-solved,
// and its hints must never contain the answer.
//
//   npm run validate-content
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import { loadPyodide } from "pyodide";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const QUEST_TYPES = ["practice", "scramble", "divination", "repair"];
const HINT_RUNGS = ["nudge", "question", "pseudocode", "flaw", "analogous"];

const errors = [];
const fail = (quest, msg) => errors.push(`${quest}: ${msg}`);
const read = (dir, file) => {
  const p = join(dir, file);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
};

function findQuestDirs(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const sub = join(dir, entry.name);
    if (existsSync(join(sub, "quest.yaml"))) found.push(sub);
    else found.push(...findQuestDirs(sub));
  }
  return found;
}

const py = await loadPyodide();
py.runPython(readFileSync(join(root, "src", "runtime", "harness.py"), "utf8"));
const grade = (code, tests, inputs) =>
  JSON.parse(py.globals.get("grade_json")(code, tests, JSON.stringify(inputs)));
const run = (code, inputs) =>
  JSON.parse(py.globals.get("run_json")(code, JSON.stringify(inputs)));

const seenIds = new Set();
const questDirs = findQuestDirs(contentDir).sort();

for (const dir of questDirs) {
  const name = relative(contentDir, dir);
  let quest;
  try {
    quest = loadYaml(read(dir, "quest.yaml"));
  } catch (err) {
    fail(name, `quest.yaml does not parse: ${err.message}`);
    continue;
  }

  for (const field of ["id", "year", "order", "title", "type", "concepts", "xp", "galleons", "summary", "task"]) {
    if (quest[field] === undefined) fail(name, `quest.yaml is missing "${field}"`);
  }
  if (seenIds.has(quest.id)) fail(name, `duplicate quest id ${quest.id}`);
  seenIds.add(quest.id);
  if (!QUEST_TYPES.includes(quest.type)) fail(name, `unknown type "${quest.type}"`);
  for (const file of ["lecture.md", "spellbook.md", "hints.yaml"]) {
    if (!read(dir, file)) fail(name, `missing ${file}`);
  }

  let hints = {};
  try {
    hints = loadYaml(read(dir, "hints.yaml") ?? "") ?? {};
  } catch (err) {
    fail(name, `hints.yaml does not parse: ${err.message}`);
  }
  for (const rung of HINT_RUNGS) {
    if (!hints[rung]) fail(name, `hints.yaml is missing the "${rung}" rung`);
  }

  if (quest.type === "divination") {
    const snippet = read(dir, "snippet.py");
    if (!snippet) fail(name, "divination quests need snippet.py");
    else if (run(snippet, quest.inputs ?? []).error) fail(name, "snippet.py raises an error");
    continue;
  }

  const tests = read(dir, "tests.py");
  const solution = read(dir, "solution.py");
  if (!tests || !solution) {
    fail(name, "needs tests.py and solution.py");
    continue;
  }

  const inputs = quest.inputs ?? [];
  const solved = grade(solution, tests, inputs);
  if (solved.total === 0) fail(name, "tests.py defines no test_ functions");
  if (solved.failure) {
    fail(name, `solution.py fails ${solved.failure.test}: ${JSON.stringify(solved.failure)}`);
  }

  let starter = read(dir, "starter.py");
  if (quest.type === "scramble") {
    const lines = quest.lines ?? [];
    starter = lines.join("\n") + "\n";
    const solutionLines = solution.trim().split("\n").map((l) => l.trim()).sort();
    if (JSON.stringify(solutionLines) !== JSON.stringify([...lines].map((l) => l.trim()).sort())) {
      fail(name, "solution.py must be a reordering of the quest's scramble lines");
    }
  }
  if (!starter) fail(name, "missing starter.py");
  else if (!grade(starter, tests, inputs).failure) fail(name, "the starter code already passes every test");

  // The hint ladder must never leak the solution.
  const hintText = HINT_RUNGS.map((r) => hints[r] ?? "").join("\n").replace(/\s+/g, " ");
  for (const line of solution.split("\n")) {
    const trimmed = line.trim().replace(/\s+/g, " ");
    if (trimmed.length >= 12 && hintText.includes(trimmed)) {
      fail(name, `a hint contains a solution line: ${trimmed}`);
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} content problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ ${questDirs.length} quests validated`);
