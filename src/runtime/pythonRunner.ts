import type { GradeOutcome, RunOutcome, WorkerRequest, WorkerResponse } from "./types";

export const RUN_TIMEOUT_MS = 5000;

type Pending = {
  resolve: (json: string) => void;
  reject: (err: Error) => void;
  timer?: ReturnType<typeof setTimeout>;
};

export class TimeoutError extends Error {}

type RequestBody = WorkerRequest extends infer R ? (R extends WorkerRequest ? Omit<R, "id"> : never) : never;

/**
 * Owns the Pyodide web worker. Each call gets a hard timeout; if a spell
 * loops forever the worker is terminated and a fresh one is started.
 */
class PythonRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private listeners = new Set<(status: RunnerStatus) => void>();
  status: RunnerStatus = "idle";

  onStatus(fn: (status: RunnerStatus) => void) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  private setStatus(status: RunnerStatus) {
    this.status = status;
    this.listeners.forEach((fn) => fn(status));
  }

  warmUp(): Promise<void> {
    if (this.ready) return this.ready;
    this.setStatus("loading");
    const worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const msg = event.data;
        if (msg.kind === "ready") {
          this.setStatus("ready");
          resolve();
        } else if (msg.kind === "load-error") {
          this.setStatus("failed");
          this.ready = null;
          reject(new Error(msg.message));
        } else {
          const p = this.pending.get(msg.id);
          if (!p) return;
          this.pending.delete(msg.id);
          clearTimeout(p.timer);
          if (msg.kind === "result") p.resolve(msg.json);
          else p.reject(new Error(msg.message));
        }
      };
    });
    return this.ready;
  }

  private restart() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    for (const p of this.pending.values()) p.reject(new Error("restarted"));
    this.pending.clear();
    void this.warmUp().catch(() => undefined);
  }

  private async call(req: RequestBody, timeoutMs: number): Promise<string> {
    await this.warmUp();
    const id = this.nextId++;
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new TimeoutError("timeout"));
        this.restart();
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.worker!.postMessage({ ...req, id } as WorkerRequest);
    });
  }

  async run(code: string, inputs: string[], timeoutMs = RUN_TIMEOUT_MS): Promise<RunOutcome> {
    try {
      return JSON.parse(await this.call({ kind: "run", code, inputs }, timeoutMs));
    } catch (err) {
      if (err instanceof TimeoutError) return { stdout: "", error: null, timedOut: true };
      throw err;
    }
  }

  async grade(
    code: string,
    tests: string,
    inputs: string[],
    timeoutMs = RUN_TIMEOUT_MS * 2,
  ): Promise<GradeOutcome> {
    try {
      return JSON.parse(await this.call({ kind: "grade", code, tests, inputs }, timeoutMs));
    } catch (err) {
      if (err instanceof TimeoutError) {
        return { stdout: "", error: null, flaws: [], passed: 0, total: 0, failure: null, timedOut: true };
      }
      throw err;
    }
  }
}

export type RunnerStatus = "idle" | "loading" | "ready" | "failed";

export const python = new PythonRunner();
