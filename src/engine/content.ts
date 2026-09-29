import { load as loadYaml } from "js-yaml";
import type { HintLadder, Quest } from "./types";

// Only these files are bundled. solution.py deliberately never is.
const questYaml = import.meta.glob("/content/**/quest.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const lectures = import.meta.glob("/content/**/lecture.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const starters = import.meta.glob("/content/**/starter.py", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const testFiles = import.meta.glob("/content/**/tests.py", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const hintFiles = import.meta.glob("/content/**/hints.yaml", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const spellbooks = import.meta.glob("/content/**/spellbook.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const snippets = import.meta.glob("/content/**/snippet.py", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

type QuestMeta = Omit<Quest, "lecture" | "starter" | "tests" | "hints" | "spellbook" | "snippet" | "inputs"> & {
  inputs?: string[];
};

function buildQuests(): Quest[] {
  return Object.entries(questYaml)
    .map(([path, raw]) => {
      const dir = path.slice(0, path.lastIndexOf("/") + 1);
      const meta = loadYaml(raw) as QuestMeta;
      const quest: Quest = {
        ...meta,
        inputs: (meta.inputs ?? []).map(String),
        lecture: lectures[`${dir}lecture.md`] ?? "",
        starter: starters[`${dir}starter.py`] ?? "",
        tests: testFiles[`${dir}tests.py`] ?? "",
        hints: loadYaml(hintFiles[`${dir}hints.yaml`] ?? "") as HintLadder,
        spellbook: spellbooks[`${dir}spellbook.md`] ?? "",
        snippet: snippets[`${dir}snippet.py`],
      };
      if (quest.type === "scramble") quest.starter = (quest.lines ?? []).join("\n") + "\n";
      return quest;
    })
    .sort((a, b) => a.year - b.year || a.order - b.order);
}

export const QUESTS: Quest[] = buildQuests();
export const questById = (id: string) => QUESTS.find((q) => q.id === id);
export const questsForYear = (year: number) => QUESTS.filter((q) => q.year === year);
