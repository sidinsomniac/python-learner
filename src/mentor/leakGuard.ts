// Stops the AI mentor from handing over answers: replies with more than a
// couple of lines of code are rejected (and regenerated or redacted).

export const MAX_CODE_LINES = 2;

const CODE_LIKE = [
  /^\s*(def|class|for|while|if|elif|else|try|except|with|return|import|from)\b.*[:\w)]\s*$/,
  /^\s*print\s*\(/,
  /^\s*[A-Za-z_]\w*\s*(=|\+=|-=|\*=|\/=)\s*[^=]/,
  /^\s*[A-Za-z_][\w.]*\(.*\)\s*$/,
];

/** Count lines that are (or look like) Python code. */
export function countCodeLines(text: string): number {
  let count = 0;
  let inFence = false;
  for (const line of text.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!line.trim()) continue;
    if (inFence) count++;
    else if (CODE_LIKE.some((re) => re.test(line))) count++;
  }
  return count;
}

export const leaksCode = (text: string) => countCodeLines(text) > MAX_CODE_LINES;

export const REDACTED = "*(The Professor's quill refuses to write your answer for you. Try the questions above!)*";

/** Remove fenced code blocks entirely - the last line of defence. */
export function redactCode(text: string): string {
  return text
    .replace(/```[\s\S]*?(```|$)/g, REDACTED)
    .split("\n")
    .filter((line) => !CODE_LIKE.some((re) => re.test(line)))
    .join("\n");
}
