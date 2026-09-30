export interface PyError {
  type: string;
  message: string;
  line: number | null;
  text?: string;
  formatted: string;
}

export interface Flaw {
  id: string;
  line: number;
  question: string;
}

export interface RunOutcome {
  stdout: string;
  error: PyError | null;
  timedOut?: boolean;
}

export type TestFailure =
  | { test: string | null; kind: "crash"; error: PyError }
  | { test: string; kind: "check" | "internal"; question: string };

export interface ReviewRemark {
  id: string;
  line: number;
  remark: string;
}

export interface GradeOutcome {
  stdout: string;
  error: PyError | null;
  flaws: Flaw[];
  passed: number;
  total: number;
  failure: TestFailure | null;
  /** Snape's remarks - only present when every test passed. */
  review: ReviewRemark[];
  timedOut?: boolean;
}

export interface TraceStep {
  /** null for the final "after the spell ends" snapshot. */
  line: number | null;
  scope: string;
  vars: Record<string, string>;
  /** Length of the output printed so far. */
  out: number;
}

export interface TraceOutcome {
  steps: TraceStep[];
  stdout: string;
  error: PyError | null;
  truncated: boolean;
  timedOut?: boolean;
}

export type WorkerRequest =
  | { id: number; kind: "run"; code: string; inputs: string[] }
  | { id: number; kind: "grade"; code: string; tests: string; inputs: string[]; review: string[] }
  | { id: number; kind: "trace"; code: string; inputs: string[] };

export type WorkerResponse =
  | { id: 0; kind: "ready" }
  | { id: 0; kind: "load-error"; message: string }
  | { id: number; kind: "result"; json: string }
  | { id: number; kind: "error"; message: string };
