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

export interface GradeOutcome {
  stdout: string;
  error: PyError | null;
  flaws: Flaw[];
  passed: number;
  total: number;
  failure: TestFailure | null;
  timedOut?: boolean;
}

export type WorkerRequest =
  | { id: number; kind: "run"; code: string; inputs: string[] }
  | { id: number; kind: "grade"; code: string; tests: string; inputs: string[] };

export type WorkerResponse =
  | { id: 0; kind: "ready" }
  | { id: 0; kind: "load-error"; message: string }
  | { id: number; kind: "result"; json: string }
  | { id: number; kind: "error"; message: string };
