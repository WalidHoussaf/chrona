import type { WorkerCommand, WorkerEvent } from "@/lib/timerProtocol";

export type TimerEngineListener = (event: WorkerEvent) => void;

export type TimerEngine = {
  start: () => void;
  send: (command: WorkerCommand) => void;
  subscribe: (listener: TimerEngineListener) => () => void;
};

let singleton: TimerEngine | null = null;

export function getTimerEngine(): TimerEngine {
  if (singleton) return singleton;

  const listeners = new Set<TimerEngineListener>();
  let worker: Worker | null = null;

  const ensureWorker = () => {
    if (typeof window === "undefined") return null;
    if (worker) return worker;

    worker = new Worker(new URL("../workers/timer.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (e: MessageEvent<WorkerEvent>) => {
      for (const l of listeners) l(e.data);
    };

    worker.onerror = () => {
      for (const l of listeners) l({ type: "error", message: "Worker error" });
    };

    return worker;
  };

  singleton = {
    start() {
      ensureWorker();
    },
    send(command) {
      const w = ensureWorker();
      if (!w) return;
      w.postMessage(command);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return singleton;
}