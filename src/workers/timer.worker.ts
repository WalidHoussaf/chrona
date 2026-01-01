import type {
  TimerConfig,
  TimerPersistedRuntime,
  TimerRuntime,
  WorkerCommand,
  WorkerEvent,
  PomodoroConfig,
} from "../lib/timerProtocol";

function getNextPomodoroPhase(config: PomodoroConfig): { phase: "work" | "shortBreak" | "longBreak"; cycle: number; durationMs: number } {
  const { currentPhase, currentCycle, longBreakInterval, workDurationMs, shortBreakDurationMs, longBreakDurationMs } = config;
  
  if (currentPhase === "work") {
    // After work, determine break type
    if (currentCycle % longBreakInterval === 0) {
      return {
        phase: "longBreak",
        cycle: currentCycle + 1,
        durationMs: longBreakDurationMs,
      };
    } else {
      return {
        phase: "shortBreak",
        cycle: currentCycle,
        durationMs: shortBreakDurationMs,
      };
    }
  } else {
    // After break, go back to work
    return {
      phase: "work",
      cycle: currentPhase === "longBreak" ? currentCycle : currentCycle,
      durationMs: workDurationMs,
    };
  }
}

function handlePomodoroCompletion(t: RuntimeState) {
  if (!t.pomodoroConfig || !t.pomodoroConfig.enabled) return;
  
  const nextPhase = getNextPomodoroPhase(t.pomodoroConfig);
  
  // Update the timer config for the next phase
  t.durationMs = nextPhase.durationMs;
  t.pomodoroConfig.currentPhase = nextPhase.phase;
  t.pomodoroConfig.currentCycle = nextPhase.cycle;
  
  // Reset timer state for new phase
  t.baseElapsedMs = 0;
  t.runningSinceUnixMs = null;
  t.completed = false;
  
  // Emit phase change event
  emit({
    type: "pomodoroPhaseChange",
    id: t.id,
    phase: nextPhase.phase,
    cycle: nextPhase.cycle,
  });
  
  // Auto-start next phase if configured
  if ((nextPhase.phase !== "work" && t.pomodoroConfig.autoStartBreaks) ||
      (nextPhase.phase === "work" && t.pomodoroConfig.autoStartWork)) {
    t.runningSinceUnixMs = unixNowMs();
  }
}

type RuntimeState = TimerConfig &
  TimerPersistedRuntime & {
    loopsCompleted: number;
    completed: boolean;
  };

const timers = new Map<string, RuntimeState>();

function unixNowMs() {
  return performance.timeOrigin + performance.now();
}

function computeRuntime(t: RuntimeState, nowUnixMs: number): TimerRuntime {
  const elapsed =
    t.baseElapsedMs +
    (t.runningSinceUnixMs != null ? Math.max(0, nowUnixMs - t.runningSinceUnixMs) : 0);

  const isRunning = t.runningSinceUnixMs != null;
  const isStarted = elapsed > 0 || isRunning;

  if (t.kind === "stopwatch") {
    const status = isRunning ? "running" : isStarted ? "paused" : "idle";
    return {
      status,
      elapsedMs: elapsed,
      displayMs: elapsed,
      remainingMs: null,
      loopsCompleted: 0,
    };
  }

  const duration = Math.max(0, Math.round(t.durationMs));

  if (t.direction === "down") {
    if (duration === 0) {
      const status = isRunning ? "running" : isStarted ? "paused" : "idle";
      return {
        status,
        elapsedMs: elapsed,
        displayMs: 0,
        remainingMs: 0,
        loopsCompleted: 0,
      };
    }

    if (t.loop) {
      const loops = Math.floor(elapsed / duration);
      const phase = elapsed % duration;
      const remaining = Math.max(0, duration - phase);
      const status = isRunning ? "running" : isStarted ? "paused" : "idle";

      return {
        status,
        elapsedMs: elapsed,
        displayMs: remaining,
        remainingMs: remaining,
        loopsCompleted: loops,
      };
    }

    if (elapsed >= duration) {
      return {
        status: "completed",
        elapsedMs: duration,
        displayMs: 0,
        remainingMs: 0,
        loopsCompleted: 1,
      };
    }

    const remaining = Math.max(0, duration - elapsed);
    const status = isRunning ? "running" : isStarted ? "paused" : "idle";
    return {
      status,
      elapsedMs: elapsed,
      displayMs: remaining,
      remainingMs: remaining,
      loopsCompleted: 0,
    };
  }

  const status = isRunning ? "running" : isStarted ? "paused" : "idle";
  return {
    status,
    elapsedMs: elapsed,
    displayMs: elapsed,
    remainingMs: null,
    loopsCompleted: 0,
  };
}

type WorkerCtx = {
  postMessage: (message: WorkerEvent) => void;
  onmessage: ((e: MessageEvent<WorkerCommand>) => void) | null;
};

const ctx = globalThis as unknown as WorkerCtx;

function emit(event: WorkerEvent) {
  ctx.postMessage(event);
}

function snapshot(type: "snapshot" | "tick") {
  const now = unixNowMs();
  const runtimeById: Record<string, TimerRuntime> = {};

  for (const [id, t] of timers) {
    const runtime = computeRuntime(t, now);

    if (t.kind === "timer" && t.direction === "down") {
      if (t.loop) {
        if (runtime.loopsCompleted > t.loopsCompleted) {
          t.loopsCompleted = runtime.loopsCompleted;
          emit({ type: "completed", id, loopsCompleted: t.loopsCompleted });
        }
      } else {
        if (runtime.status === "completed" && !t.completed) {
          t.completed = true;
          t.baseElapsedMs = Math.max(0, Math.round(t.durationMs));
          t.runningSinceUnixMs = null;
          emit({ type: "completed", id, loopsCompleted: 1 });
          
          // Handle Pomodoro phase transitions
          handlePomodoroCompletion(t);
        }
      }
    }

    runtimeById[id] = computeRuntime(t, now);
  }

  emit({ type, runtimeById });
}

const tickIntervalMs = 20;
let nextTarget = unixNowMs();

function schedule() {
  const now = unixNowMs();
  nextTarget += tickIntervalMs;
  const delay = Math.max(0, nextTarget - now);
  setTimeout(loop, delay);
}

function loop() {
  snapshot("tick");
  schedule();
}

function upsert(timer: TimerConfig & TimerPersistedRuntime) {
  const existing = timers.get(timer.id);
  timers.set(timer.id, {
    ...existing,
    ...timer,
    loopsCompleted: existing?.loopsCompleted ?? 0,
    completed: existing?.completed ?? false,
  });
}

function startTimer(id: string) {
  const t = timers.get(id);
  if (!t) return;

  const now = unixNowMs();
  const runtime = computeRuntime(t, now);
  if (runtime.status === "completed" && !(t.loop && t.direction === "down")) return;

  if (t.runningSinceUnixMs == null) {
    t.runningSinceUnixMs = unixNowMs();
  }
}

function pauseTimer(id: string) {
  const t = timers.get(id);
  if (!t) return;
  if (t.runningSinceUnixMs == null) return;

  const now = unixNowMs();
  t.baseElapsedMs =
    t.baseElapsedMs + Math.max(0, now - t.runningSinceUnixMs);
  t.runningSinceUnixMs = null;
}

function resetTimer(id: string) {
  const t = timers.get(id);
  if (!t) return;
  t.baseElapsedMs = 0;
  t.runningSinceUnixMs = null;
  t.completed = false;
  t.loopsCompleted = 0;
}

ctx.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const msg = e.data;

  if (msg.type === "init") {
    timers.clear();
    for (const t of msg.timers) upsert(t);
    emit({ type: "ready" });
    snapshot("snapshot");
    return;
  }

  if (msg.type === "upsert") {
    upsert(msg.timer);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "remove") {
    timers.delete(msg.id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "start") {
    startTimer(msg.id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "pause") {
    pauseTimer(msg.id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "reset") {
    resetTimer(msg.id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "startAll") {
    for (const id of timers.keys()) startTimer(id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "pauseAll") {
    for (const id of timers.keys()) pauseTimer(id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "resetAll") {
    for (const id of timers.keys()) resetTimer(id);
    snapshot("snapshot");
    return;
  }

  if (msg.type === "killAll") {
    timers.clear();
    snapshot("snapshot");
    return;
  }

  if (msg.type === "lap") {
    const t = timers.get(msg.id);
    if (!t) return;
    const now = unixNowMs();
    const runtime = computeRuntime(t, now);
    emit({ type: "lap", id: msg.id, elapsedMs: runtime.elapsedMs });
    return;
  }
};

emit({ type: "ready" });
snapshot("snapshot");
schedule();
