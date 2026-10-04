/// <reference lib="webworker" />
// Runs Python (Pyodide) off the main thread so a runaway spell can't freeze
// the castle. The main thread terminates this worker on timeout.
import type { PyodideInterface } from "pyodide";
import harnessSource from "./harness.py?raw";
import type { WorkerRequest, WorkerResponse } from "./types";

const post = (msg: WorkerResponse) => self.postMessage(msg);
const indexURL = new URL(`${import.meta.env.BASE_URL}pyodide/`, self.location.origin).href;

let pyodide: PyodideInterface | null = null;

/** The big files, fetched first so the player sees real progress. Pyodide then reads them from the browser cache. */
const BIG_FILES = ["pyodide.asm.wasm", "python_stdlib.zip", "pyodide.asm.mjs"];

async function prefetch() {
  let last = -1;
  const report = (percent: number) => {
    if (percent !== last) post({ id: 0, kind: "progress", percent: (last = percent) });
  };
  const sizes = new Map<string, number>();
  const got = new Map<string, number>();
  const total = () => [...sizes.values()].reduce((a, b) => a + b, 0) || 1;
  const done = () => [...got.values()].reduce((a, b) => a + b, 0);
  await Promise.all(
    BIG_FILES.map(async (name) => {
      const res = await fetch(`${indexURL}${name}`);
      sizes.set(name, Number(res.headers.get("content-length")) || 0);
      const reader = res.body?.getReader();
      if (!reader) return;
      for (;;) {
        const { done: end, value } = await reader.read();
        if (end) break;
        got.set(name, (got.get(name) ?? 0) + value.byteLength);
        // Downloading is most of the wait; starting Python is the last 15%.
        report(Math.min(85, Math.floor((done() / total()) * 85)));
      }
    }),
  );
}

async function boot() {
  try {
    await prefetch().catch(() => undefined);
    post({ id: 0, kind: "progress", percent: 90 });
    const mod = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
    pyodide = (await mod.loadPyodide({ indexURL })) as PyodideInterface;
    pyodide.runPython(harnessSource);
    post({ id: 0, kind: "ready" });
  } catch (err) {
    post({ id: 0, kind: "load-error", message: String(err) });
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  if (!pyodide) {
    post({ id: req.id, kind: "error", message: "Python is still waking up." });
    return;
  }
  try {
    const inputs = JSON.stringify(req.inputs);
    const files = JSON.stringify(req.files ?? {});
    let json: string;
    if (req.kind === "run") json = pyodide.globals.get("run_json")(req.code, inputs, files);
    else if (req.kind === "trace") json = pyodide.globals.get("trace_json")(req.code, inputs, files);
    else json = pyodide.globals.get("grade_json")(req.code, req.tests, inputs, JSON.stringify(req.review), files);
    post({ id: req.id, kind: "result", json });
  } catch (err) {
    post({ id: req.id, kind: "error", message: String(err) });
  }
};

void boot();
