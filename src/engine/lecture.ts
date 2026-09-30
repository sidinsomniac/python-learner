import { load as loadYaml } from "js-yaml";

export interface CheckpointSpec {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

type Segment = { kind: "md"; text: string } | { kind: "checkpoint"; spec: CheckpointSpec };

/** Split a lecture into Markdown and ```checkpoint blocks. */
export function splitLecture(markdown: string): Segment[] {
  const segments: Segment[] = [];
  const re = /^```checkpoint\n([\s\S]*?)^```\s*$/gm;
  let last = 0;
  for (const match of markdown.matchAll(re)) {
    segments.push({ kind: "md", text: markdown.slice(last, match.index) });
    segments.push({ kind: "checkpoint", spec: loadYaml(match[1]) as CheckpointSpec });
    last = match.index! + match[0].length;
  }
  segments.push({ kind: "md", text: markdown.slice(last) });
  return segments.filter((s) => s.kind === "checkpoint" || s.text.trim());
}
