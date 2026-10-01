// Helpers for the Pensieve's call-stack view (kept apart from the React component so they can be tested).

/** The frames to draw, innermost first. A very deep stack is folded in the middle. */
export function stackFrames(stack: string[]): { label: string; folded?: number }[] {
  const inner = [...stack].reverse().map((name) => ({ label: name === "main" ? "main spell" : `${name}()` }));
  if (inner.length <= 8) return inner;
  return [...inner.slice(0, 4), { label: "", folded: inner.length - 7 }, ...inner.slice(-3)];
}
