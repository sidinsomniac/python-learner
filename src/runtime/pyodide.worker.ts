/// <reference lib="webworker" />
// Runs Python (Pyodide) off the main thread so a runaway spell can't freeze
// the castle. The main thread terminates this worker on timeout.
import type { PyodideInterface } from "pyodide";
import harnessSource from "./harness.py?raw";
import type { WorkerRequest, WorkerResponse } from "./types";

const post = (msg: WorkerResponse) => self.postMessage(msg);
const indexURL = new URL(`${import.meta.env.BASE_URL}pyodide/`, self.location.origin).href;

let pyodide: PyodideInterface | null = null;

async function boot() {
  try {
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
    let json: string;
    if (req.kind === "run") json = pyodide.globals.get("run_json")(req.code, inputs);
    else if (req.kind === "trace") json = pyodide.globals.get("trace_json")(req.code, inputs);
    else json = pyodide.globals.get("grade_json")(req.code, req.tests, inputs, JSON.stringify(req.review));
    post({ id: req.id, kind: "result", json });
  } catch (err) {
    post({ id: req.id, kind: "error", message: String(err) });
  }
};

void boot();
