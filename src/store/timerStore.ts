"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { chronaStorage } from "@/lib/storage";
import { getTimerEngine } from "@/lib/timerEngine";
import { notificationManager } from "@/lib/notifications";
import type { TimerConfig, TimerId, TimerKind, TimerPersistedRuntime, TimerRuntime, WorkerEvent, PomodoroConfig } from "@/lib/timerProtocol";

export type Lap = {
  id: string;
  elapsedMs: number;
};

export type TimerItem = TimerConfig &
  TimerPersistedRuntime & {
    order: number;
    laps?: Lap[];
  };

export type Preset = {
  id: string;
  order: number;
  name: string;
  kind: TimerKind;
  direction: TimerConfig["direction"];
  durationMs: number;
  loop: boolean;
};

type View = "timers" | "stopwatch" | "focus" | "settings";

type TimerState = {
  view: View;
  timers: TimerItem[];
  presets: Preset[];
  activeId: TimerId | null;
  runtimeById: Record<TimerId, TimerRuntime>;
  engineReady: boolean;
  hasHydrated: boolean;

  boot: () => void;
  setHydrated: (hydrated: boolean) => void;

  setView: (view: View) => void;
  setActive: (id: TimerId) => void;

  newTimer: (kind?: TimerKind) => TimerId;
  applyPreset: (presetId: string, mode?: "new" | "active") => void;
  savePresetFromActive: (name: string) => void;
  renamePreset: (presetId: string, name: string) => void;
  removePreset: (presetId: string) => void;
  movePreset: (presetId: string, delta: -1 | 1) => void;
  movePresetByIndex: (presetId: string, newIndex: number) => void;
  moveTimer: (timerId: string, newIndex: number) => void;
  exportPresetsJson: () => string;
  importPresetsJson: (json: string) => void;
  removeTimer: (id: TimerId) => void;
  updateTimer: (id: TimerId, patch: Partial<TimerConfig>) => void;

  startPauseById: (id: TimerId) => void;
  resetById: (id: TimerId) => void;
  lapById: (id: TimerId) => void;

  startPauseActive: () => void;
  resetActive: () => void;
  switchActive: () => void;
  killAll: () => void;

  lapActive: () => void;
  
  // Pomodoro-specific actions
  enablePomodoro: (id: TimerId, config: Partial<PomodoroConfig>) => void;
  disablePomodoro: (id: TimerId) => void;
  updatePomodoroConfig: (id: TimerId, config: Partial<PomodoroConfig>) => void;
};

function nowUnixMs() {
  return Date.now();
}

function toEnginePayload(t: TimerItem) {
  const { order, laps, ...rest } = t;
  void order;
  void laps;
  return rest;
}

function clampIndex(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export const useTimerStore = create<TimerState>()(
  persist<TimerState, [], [], Partial<TimerState>>(
    (set, get) => {
      const engine = getTimerEngine();
      let subscribed = false;

      const ensureEngine = () => {
        if (subscribed) return;
        subscribed = true;

        engine.subscribe((event: WorkerEvent) => {
          if (event.type === "ready") {
            set({ engineReady: true });
            return;
          }

          if (event.type === "tick" || event.type === "snapshot") {
            set({ runtimeById: event.runtimeById });
            return;
          }

          if (event.type === "lap") {
            const id = event.id;
            set((s) => ({
              timers: s.timers.map((t) => {
                if (t.id !== id) return t;
                if (t.kind !== "stopwatch") return t;
                const laps = t.laps ? [...t.laps] : [];
                laps.unshift({ id: nanoid(), elapsedMs: event.elapsedMs });
                return { ...t, laps };
              }),
            }));
          }

          if (event.type === "completed") {
            const id = event.id;
            const timer = get().timers.find((t) => t.id === id);
            if (timer) {
              // Avoid duplicate notifications for Pomodoro timers (phase-change notifications cover completion)
              if (!timer.pomodoroConfig?.enabled) {
                notificationManager.notifyTimerComplete(timer.label);
              }
            }
          }

          if (event.type === "pomodoroPhaseChange") {
            const id = event.id;
            const timer = get().timers.find((t) => t.id === id);
            if (timer) {
              if (event.phase === "longBreak" && timer.pomodoroConfig) {
                // Coalesce: when the cycle completes, show a single combined notification
                notificationManager.notifyPomodoroCycleComplete(timer.label, timer.pomodoroConfig.longBreakInterval);
              } else {
                notificationManager.notifyPomodoroPhaseChange(event.phase, timer.label);
              }
            }
            set((s) => ({
              timers: s.timers.map((t) => {
                if (t.id !== id) return t;
                if (!t.pomodoroConfig) return t;
                return {
                  ...t,
                  pomodoroConfig: {
                    ...t.pomodoroConfig,
                    currentPhase: event.phase,
                    currentCycle: event.cycle,
                  },
                  durationMs: event.phase === "work" 
                    ? t.pomodoroConfig.workDurationMs
                    : event.phase === "shortBreak"
                      ? t.pomodoroConfig.shortBreakDurationMs
                      : t.pomodoroConfig.longBreakDurationMs,
                  baseElapsedMs: 0,
                  runningSinceUnixMs: t.pomodoroConfig.autoStartBreaks && event.phase !== "work" 
                    ? nowUnixMs()
                    : t.pomodoroConfig.autoStartWork && event.phase === "work"
                      ? nowUnixMs()
                      : null,
                };
              }),
            }));
          }
        });

        engine.start();
      };

      const syncTimer = (id: TimerId) => {
        const t = get().timers.find((x) => x.id === id);
        if (!t) return;
        ensureEngine();
        engine.send({ type: "upsert", timer: toEnginePayload(t) });
      };

      const addTimer = (timer: TimerItem) => {
        ensureEngine();
        set((s) => ({
          timers: [...s.timers, timer],
          activeId: s.activeId ?? timer.id,
        }));
        engine.send({ type: "upsert", timer: toEnginePayload(timer) });
        return timer.id;
      };

      return {
        view: "timers" as View,
        timers: [] as TimerItem[],
        presets: [] as Preset[],
        activeId: null,
        runtimeById: {} as Record<TimerId, TimerRuntime>,
        engineReady: false,
        hasHydrated: false,

        boot() {
          ensureEngine();
          if (!get().hasHydrated) return;

          const currentTimers = get().timers;
          let didSanitize = false;
          const sanitizedTimers = currentTimers.map((t) => {
            if (t.kind !== "stopwatch") return t;
            if (!t.pomodoroConfig) return t;
            didSanitize = true;
            return {
              ...t,
              pomodoroConfig: undefined,
              durationMs: 0,
              baseElapsedMs: 0,
              runningSinceUnixMs: null,
            };
          });
          if (didSanitize) {
            set({ timers: sanitizedTimers });
          }

          const presets = get().presets;
          if (presets.some((p) => !Number.isFinite(p.order))) {
            set({
              presets: presets.map((p, idx) => ({
                ...p,
                order: Number.isFinite(p.order) ? p.order : idx,
              })),
            });
          }
          const timers = (didSanitize ? sanitizedTimers : currentTimers).map(toEnginePayload);
          engine.send({ type: "init", timers });
        },

        setHydrated(hydrated) {
          set({ hasHydrated: hydrated });
        },

        setView(view) {
          ensureEngine();
          set({ view });
        },

        setActive(id) {
          set({ activeId: id });
        },

        newTimer(kind = "timer") {
          const id = nanoid();
          const timers = get().timers;
          const maxOrder = timers.reduce((m, t) => Math.max(m, t.order), 0);

          const base: TimerItem = {
            id,
            kind,
            label: kind === "stopwatch" ? "Stopwatch" : "Timer",
            direction: kind === "stopwatch" ? "up" : "down",
            durationMs: kind === "stopwatch" ? 0 : 25 * 60 * 1000,
            loop: false,
            baseElapsedMs: 0,
            runningSinceUnixMs: null,
            order: maxOrder + 1,
            laps: kind === "stopwatch" ? [] : undefined,
          };

          addTimer(base);
          return id;
        },

        applyPreset(presetId, mode = "new") {
          const preset = get().presets.find((p) => p.id === presetId);
          if (!preset) return;

          if (mode === "active") {
            const activeId = get().activeId;
            if (!activeId) return;
            const t = get().timers.find((x) => x.id === activeId);
            if (!t) return;

            const patched: TimerItem = {
              ...t,
              label: preset.name,
              kind: preset.kind,
              direction: preset.direction,
              durationMs: preset.durationMs,
              loop: preset.loop,
              baseElapsedMs: 0,
              runningSinceUnixMs: null,
              laps: preset.kind === "stopwatch" ? [] : undefined,
            };

            set((s) => ({
              timers: s.timers.map((x) => (x.id === activeId ? patched : x)),
            }));
            syncTimer(activeId);
            return;
          }

          const id = nanoid();
          const timers = get().timers;
          const maxOrder = timers.reduce((m, t) => Math.max(m, t.order), 0);

          const base: TimerItem = {
            id,
            kind: preset.kind,
            label: preset.name,
            direction: preset.direction,
            durationMs: preset.durationMs,
            loop: preset.loop,
            baseElapsedMs: 0,
            runningSinceUnixMs: null,
            order: maxOrder + 1,
            laps: preset.kind === "stopwatch" ? [] : undefined,
          };

          addTimer(base);
          set({ activeId: id });
        },

        savePresetFromActive(name) {
          const activeId = get().activeId;
          if (!activeId) return;
          const t = get().timers.find((x) => x.id === activeId);
          if (!t) return;

          const existing = get().presets;
          const minOrder = existing.reduce(
            (m, p) => Math.min(m, Number.isFinite(p.order) ? p.order : 0),
            0,
          );

          const preset: Preset = {
            id: nanoid(),
            order: minOrder - 1,
            name,
            kind: t.kind,
            direction: t.direction,
            durationMs: t.durationMs,
            loop: t.loop,
          };

          set((s) => ({
            presets: [preset, ...s.presets],
          }));
        },

        renamePreset(presetId, name) {
          const n = name.trim();
          if (!n) return;
          set((s) => ({
            presets: s.presets.map((p) => (p.id === presetId ? { ...p, name: n } : p)),
          }));
        },

        removePreset(presetId) {
          set((s) => ({
            presets: s.presets.filter((p) => p.id !== presetId),
          }));
        },

        movePreset(presetId, delta) {
          const ordered = [...get().presets].sort((a, b) => {
            const ao = Number.isFinite(a.order) ? a.order : 0;
            const bo = Number.isFinite(b.order) ? b.order : 0;
            return ao - bo;
          });
          const idx = ordered.findIndex((p) => p.id === presetId);
          if (idx < 0) return;
          const nextIdx = clampIndex(idx + delta, 0, ordered.length - 1);
          if (idx === nextIdx) return;

          const a = ordered[idx];
          const b = ordered[nextIdx];

          set((s) => ({
            presets: s.presets.map((p) => {
              if (p.id === a.id) return { ...p, order: b.order };
              if (p.id === b.id) return { ...p, order: a.order };
              return p;
            }),
          }));
        },

        exportPresetsJson() {
          return JSON.stringify(get().presets, null, 2);
        },

        importPresetsJson(json) {
          try {
            const parsed = JSON.parse(json) as unknown;
            if (!Array.isArray(parsed)) return;
            const presets: Preset[] = [];

            for (const p of parsed) {
              if (!p || typeof p !== "object") continue;
              const anyP = p as Record<string, unknown>;
              const name = typeof anyP.name === "string" ? anyP.name : "Preset";
              const kind = anyP.kind === "stopwatch" ? "stopwatch" : "timer";
              const direction = anyP.direction === "up" ? "up" : "down";
              const durationMs = typeof anyP.durationMs === "number" ? anyP.durationMs : 0;
              const loop = Boolean(anyP.loop);
              const order = typeof anyP.order === "number" ? anyP.order : presets.length;

              presets.push({
                id: nanoid(),
                order,
                name,
                kind,
                direction,
                durationMs,
                loop,
              });
            }

            set({ presets });
          } catch {
            return;
          }
        },

        removeTimer(id) {
          ensureEngine();
          set((s) => {
            const remaining = s.timers.filter((t) => t.id !== id);
            const activeId = s.activeId === id ? remaining[0]?.id ?? null : s.activeId;
            return { timers: remaining, activeId };
          });
          engine.send({ type: "remove", id });
        },

        updateTimer(id, patch) {
          set((s) => ({
            timers: s.timers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          }));
          syncTimer(id);
        },

        startPauseById(id) {
          ensureEngine();
          if (!id) return;

          const t = get().timers.find((x) => x.id === id);
          if (!t) return;

          if (t.runningSinceUnixMs != null) {
            const pausedAt = nowUnixMs();
            const baseElapsedMs = t.baseElapsedMs + Math.max(0, pausedAt - t.runningSinceUnixMs);
            set((s) => ({
              timers: s.timers.map((x) =>
                x.id === id ? { ...x, baseElapsedMs, runningSinceUnixMs: null } : x,
              ),
            }));
            engine.send({ type: "pause", id });
          } else {
            const startedAt = nowUnixMs();
            set((s) => ({
              timers: s.timers.map((x) => (x.id === id ? { ...x, runningSinceUnixMs: startedAt } : x)),
            }));
            engine.send({ type: "start", id });
          }

          syncTimer(id);
        },

        resetById(id) {
          ensureEngine();
          if (!id) return;
          set((s) => ({
            timers: s.timers.map((t) =>
              t.id === id
                ? { ...t, baseElapsedMs: 0, runningSinceUnixMs: null, laps: t.kind === "stopwatch" ? [] : t.laps }
                : t,
            ),
          }));
          engine.send({ type: "reset", id });
          syncTimer(id);
        },

        lapById(id) {
          ensureEngine();
          if (!id) return;
          const t = get().timers.find((x) => x.id === id);
          if (!t || t.kind !== "stopwatch") return;
          engine.send({ type: "lap", id });
        },

        startPauseActive() {
          const id = get().activeId;
          if (!id) return;
          get().startPauseById(id);
        },

        resetActive() {
          const id = get().activeId;
          if (!id) return;
          get().resetById(id);
        },

        switchActive() {
          const timers = [...get().timers].sort((a, b) => a.order - b.order);
          if (timers.length === 0) return;
          const current = get().activeId;
          const idx = current ? timers.findIndex((t) => t.id === current) : -1;
          const next = timers[(idx + 1) % timers.length];
          set({ activeId: next.id });
        },

        killAll() {
          ensureEngine();
          set({ timers: [], activeId: null, runtimeById: {} });
          engine.send({ type: "killAll" });
        },

        lapActive() {
          const id = get().activeId;
          if (!id) return;
          get().lapById(id);
        },

        enablePomodoro(id, config) {
          const t = get().timers.find((x) => x.id === id);
          if (!t || t.kind === "stopwatch") return;

          const defaultConfig: PomodoroConfig = {
            enabled: true,
            workDurationMs: 25 * 60 * 1000, // 25 minutes
            shortBreakDurationMs: 5 * 60 * 1000, // 5 minutes
            longBreakDurationMs: 15 * 60 * 1000, // 15 minutes
            longBreakInterval: 4,
            currentCycle: 1,
            currentPhase: "work",
            autoStartBreaks: false,
            autoStartWork: false,
          };

          const pomodoroConfig = { ...defaultConfig, ...config };
          set((s) => ({
            timers: s.timers.map((t) =>
              t.id === id
                ? {
                    ...t,
                    pomodoroConfig,
                    durationMs: pomodoroConfig.workDurationMs,
                    baseElapsedMs: 0,
                    runningSinceUnixMs: null,
                  }
                : t,
            ),
          }));
          syncTimer(id);
        },

        disablePomodoro(id) {
          const t = get().timers.find((x) => x.id === id);
          if (!t || t.kind === "stopwatch") return;
          set((s) => ({
            timers: s.timers.map((t) =>
              t.id === id
                ? {
                    ...t,
                    pomodoroConfig: undefined,
                    baseElapsedMs: 0,
                    runningSinceUnixMs: null,
                  }
                : t,
            ),
          }));
          syncTimer(id);
        },

        updatePomodoroConfig(id, config) {
          const t = get().timers.find((x) => x.id === id);
          if (!t || t.kind === "stopwatch") return;
          set((s) => ({
            timers: s.timers.map((t) =>
              t.id === id && t.pomodoroConfig
                ? {
                    ...t,
                    pomodoroConfig: { ...t.pomodoroConfig, ...config },
                  }
                : t,
            ),
          }));
          syncTimer(id);
        },

        moveTimer(timerId, newIndex) {
          set((s) => {
            const timers = [...s.timers];
            const currentIndex = timers.findIndex((t) => t.id === timerId);
            if (currentIndex === -1) return s;

            const [movedTimer] = timers.splice(currentIndex, 1);
            timers.splice(newIndex, 0, movedTimer);

            // Update order values
            const updatedTimers = timers.map((timer, index) => ({
              ...timer,
              order: index,
            }));

            return { timers: updatedTimers };
          });
        },

        movePresetByIndex(presetId, newIndex) {
          set((s) => {
            const presets = [...s.presets];
            const currentIndex = presets.findIndex((p) => p.id === presetId);
            if (currentIndex === -1) return s;

            const [movedPreset] = presets.splice(currentIndex, 1);
            presets.splice(newIndex, 0, movedPreset);

            // Update order values
            const updatedPresets = presets.map((preset, index) => ({
              ...preset,
              order: index,
            }));

            return { presets: updatedPresets };
          });
        },
      } satisfies TimerState;
    },
    {
      name: "chrona.timerStore",
      storage: createJSONStorage(() => chronaStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        state?.setHydrated(true);
        state?.boot();
      },
      partialize: (s) => ({
        view: s.view,
        timers: s.timers,
        presets: s.presets,
        activeId: s.activeId,
      }),
    },
  ),
);