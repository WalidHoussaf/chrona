export type TimerId = string;

export type TimerKind = "timer" | "stopwatch";
export type TimerDirection = "down" | "up";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export type TimerConfig = {
  id: TimerId;
  kind: TimerKind;
  label: string;
  direction: TimerDirection;
  durationMs: number;
  loop: boolean;
  pomodoroConfig?: PomodoroConfig;
};

export type PomodoroConfig = {
  enabled: boolean;
  workDurationMs: number;
  shortBreakDurationMs: number;
  longBreakDurationMs: number;
  longBreakInterval: number;
  currentCycle: number;
  currentPhase: "work" | "shortBreak" | "longBreak";
  autoStartBreaks: boolean;
  autoStartWork: boolean;
};

export type TimerPersistedRuntime = {
  baseElapsedMs: number;
  runningSinceUnixMs: number | null;
};

export type TimerRuntime = {
  status: TimerStatus;
  elapsedMs: number;
  displayMs: number;
  remainingMs: number | null;
  loopsCompleted: number;
};

export type WorkerCommand =
  | { type: "init"; timers: Array<TimerConfig & TimerPersistedRuntime> }
  | { type: "upsert"; timer: TimerConfig & TimerPersistedRuntime }
  | { type: "remove"; id: TimerId }
  | { type: "start"; id: TimerId }
  | { type: "pause"; id: TimerId }
  | { type: "reset"; id: TimerId }
  | { type: "startAll" }
  | { type: "pauseAll" }
  | { type: "resetAll" }
  | { type: "killAll" }
  | { type: "lap"; id: TimerId };

export type WorkerEvent =
  | { type: "ready" }
  | { type: "snapshot"; runtimeById: Record<TimerId, TimerRuntime> }
  | { type: "tick"; runtimeById: Record<TimerId, TimerRuntime> }
  | { type: "completed"; id: TimerId; loopsCompleted: number }
  | { type: "lap"; id: TimerId; elapsedMs: number }
  | { type: "pomodoroPhaseChange"; id: TimerId; phase: "work" | "shortBreak" | "longBreak"; cycle: number }
  | { type: "error"; message: string };