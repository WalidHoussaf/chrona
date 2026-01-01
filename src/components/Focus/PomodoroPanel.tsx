"use client";

import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";

import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, parseHmsToMs } from "@/lib/time";
import type { PomodoroConfig } from "@/lib/timerProtocol";

function parseTimeString(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    // MM:SS format
    return parseHmsToMs(0, parseInt(parts[0]) || 0, parseInt(parts[1]) || 0);
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parseHmsToMs(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0, parseInt(parts[2]) || 0);
  }
  return 0;
}

export function PomodoroPanel() {
  const activeId = useTimerStore((s) => s.activeId);
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === activeId));
  const runtime = useTimerStore((s) => (activeId ? s.runtimeById[activeId] : undefined));

  const setView = useTimerStore((s) => s.setView);
  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);
  const enablePomodoro = useTimerStore((s) => s.enablePomodoro);
  const disablePomodoro = useTimerStore((s) => s.disablePomodoro);
  const updatePomodoroConfig = useTimerStore((s) => s.updatePomodoroConfig);

  const [focusLock, setFocusLock] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";
  const pomodoroConfig = timer?.pomodoroConfig;
  
  const config = useMemo(() => ({
    workDurationMs: pomodoroConfig?.workDurationMs || 25 * 60 * 1000,
    shortBreakDurationMs: pomodoroConfig?.shortBreakDurationMs || 5 * 60 * 1000,
    longBreakDurationMs: pomodoroConfig?.longBreakDurationMs || 15 * 60 * 1000,
    longBreakInterval: pomodoroConfig?.longBreakInterval || 4,
    autoStartBreaks: pomodoroConfig?.autoStartBreaks || false,
    autoStartWork: pomodoroConfig?.autoStartWork || false,
  }), [pomodoroConfig?.workDurationMs, pomodoroConfig?.shortBreakDurationMs, pomodoroConfig?.longBreakDurationMs, pomodoroConfig?.longBreakInterval, pomodoroConfig?.autoStartBreaks, pomodoroConfig?.autoStartWork]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusLock) {
          setFocusLock(false);
        } else if (showSettings) {
          setShowSettings(false);
        } else {
          setView("timers");
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setView, focusLock, showSettings]);

  // Focus lock effect
  useEffect(() => {
    if (focusLock) {
      document.body.style.overflow = "hidden";
      // Prevent right-click
      const preventContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener("contextmenu", preventContextMenu);
      
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("contextmenu", preventContextMenu);
      };
    }
  }, [focusLock]);

  const handleEnablePomodoro = () => {
    if (!timer) return;
    enablePomodoro(timer.id, config);
    setShowSettings(false);
  };

  const handleDisablePomodoro = () => {
    if (!timer) return;
    disablePomodoro(timer.id);
    setShowSettings(false);
  };

  const handleConfigUpdate = (updates: Partial<PomodoroConfig>) => {
    if (timer && pomodoroConfig) {
      updatePomodoroConfig(timer.id, updates);
    }
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case "work":
        return "bg-emerald-400/20 text-emerald-200 border-emerald-400/30";
      case "shortBreak":
        return "bg-blue-400/20 text-blue-200 border-blue-400/30";
      case "longBreak":
        return "bg-purple-400/20 text-purple-200 border-purple-400/30";
      default:
        return "bg-white/10 text-zinc-300 border-white/20";
    }
  };

  const getPhaseLabel = (phase?: string) => {
    switch (phase) {
      case "work":
        return "Work Session";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus";
    }
  };

  if (!timer) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="min-w-0">
            <div className="font-harmond text-3xl text-zinc-200">Focus</div>
            <div className="truncate text-lg font-offbit text-zinc-100">No active timer</div>
          </div>
          <button
            type="button"
            className="rounded-md font-offbit bg-white/5 px-5 py-2 text-md text-zinc-200 hover:bg-white/10"
            onClick={() => setView("timers")}
          >
            Exit
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-2xl text-zinc-200 mb-4">Create a timer first</div>
            <button
              type="button"
              className="rounded-md font-offbit bg-white/10 px-6 py-3 text-md text-zinc-100 hover:bg-white/20"
              onClick={() => setView("timers")}
            >
              Go to Timers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Focus Lock Overlay */}
      {focusLock && (
        <div className="fixed inset-0 z-50 bg-black backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="font-offbit text-6xl text-white mb-4">
              {formatDurationMs(display)}
            </div>
            <div className={clsx(
              "inline-block rounded-md px-4 py-2 text-xl font-offbit mb-6",
              getPhaseColor(pomodoroConfig?.currentPhase)
            )}>
              {getPhaseLabel(pomodoroConfig?.currentPhase)}
            </div>
            <div className="font-harmond text-xl text-zinc-400 mb-4">Focus Mode Active</div>
            <button
              type="button"
              className="rounded-md font-offbit bg-white/10 px-6 py-3 text-md text-zinc-200 hover:bg-white/20"
              onClick={() => setFocusLock(false)}
            >
              Exit Focus Lock (Esc)
            </button>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="min-w-0">
          <div className="font-harmond text-3xl text-zinc-200">Focus</div>
          <div className="truncate text-lg font-offbit text-zinc-100">{timer.label}</div>
        </div>
        <div className="flex items-center gap-2">
          {pomodoroConfig && (
            <button
              type="button"
              className={clsx(
                "rounded-md font-offbit px-4 py-2 text-md transition-colors",
                focusLock 
                  ? "bg-rose-400/20 text-rose-200 border border-rose-400/30" 
                  : "bg-white/5 text-zinc-200 hover:bg-white/10"
              )}
              onClick={() => setFocusLock(!focusLock)}
              title={focusLock ? "Disable focus lock" : "Enable focus lock"}
            >
              {focusLock ? (
                <>
                  <svg className="w-6 h-6 inline -ml-1 mr-1" viewBox="-5.0 -10.0 110.0 135.0" fill="currentColor">
                    <path d="m56.398 11.602v6.3984h-12.797v-6.3984zm0 12.801h6.3984l0.003906-6.4023h-6.4023zm-19.199 0h6.3984l0.003906-6.4023h-6.4023zm38.402 19.199v38.398h6.3984v-38.398zm-6.3984-6.3984-0.003906-12.805h-6.3984v12.801h-25.602v-12.801h-6.3984v12.801h-6.4023v6.3984l51.203 0.003906v-6.4023zm-51.203 6.3984v38.398h6.3984v-38.398zm6.3984 38.398v6.3984h51.203v-6.3984z"/>
                  </svg>
                  Locked
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 inline -ml-1 mr-1" viewBox="-5.0 -10.0 110.0 135.0" fill="currentColor">
                    <path d="m56.398 11.602v6.3984h-12.797v-6.3984zm0 12.801h6.3984l0.003906-6.4023h-6.4023zm-19.199 0h6.3984l0.003906-6.4023h-6.4023zm38.402 19.199v38.398h6.3984v-38.398zm-6.3984-6.3984-0.003906-12.805h-6.3984v12.801h-25.602v-12.801h-6.3984v12.801h-6.4023v6.3984l51.203 0.003906v-6.4023zm-51.203 6.3984v38.398h6.3984v-38.398zm6.3984 38.398v6.3984h51.203v-6.3984z"/>
                  </svg>
                  Focus Lock
                </>
              )}
            </button>
          )}
          <button
            type="button"
            className="rounded-md font-offbit bg-white/5 px-3 py-2 text-md text-zinc-200 hover:bg-white/10"
            onClick={() => setShowSettings(!showSettings)}
            title="Pomodoro settings"
          >
            <svg className="w-6 h-6 inline -ml-1 mr-1" viewBox="0 0 100 125" fill="currentColor">
              <path d="M46,38 L54,38 L54,42 L46,42 L46,38 Z M46,58 L54,58 L54,62 L46,62 L46,58 Z M38,46 L42,46 L42,54 L38,54 L38,46 Z M42,42 L46,42 L46,46 L42,46 L42,42 Z M54,42 L58,42 L58,46 L54,46 L54,42 Z M42,54 L46,54 L46,58 L42,58 L42,54 Z M54,54 L58,54 L58,58 L54,58 L54,54 Z M58,46 L62,46 L62,54 L58,54 L58,46 Z M42,22 L46,22 L46,30 L42,30 L42,22 Z M54,22 L58,22 L58,30 L54,30 L54,22 Z M46,18 L54,18 L54,22 L46,22 L46,18 Z M34,26 L38,26 L38,30 L34,30 L34,26 Z M58,30 L62,30 L62,34 L58,34 L58,30 Z M70,26 L74,26 L74,30 L70,30 L70,26 Z M74,30 L78,30 L78,34 L74,34 L74,30 Z M70,34 L74,34 L74,38 L70,38 L70,34 Z M30,22 L34,22 L34,26 L30,26 L30,22 Z M26,26 L30,26 L30,30 L26,30 L26,26 Z M26,34 L30,34 L30,38 L26,38 L26,34 Z M22,30 L26,30 L26,34 L22,34 L22,30 Z M62,26 L66,26 L66,30 L62,30 L62,26 Z M66,22 L70,22 L70,26 L66,26 L66,22 Z M38,30 L42,30 L42,34 L38,34 L38,30 Z M18,46 L22,46 L22,54 L18,54 L18,46 Z M22,42 L30,42 L30,46 L22,46 L22,42 Z M22,54 L30,54 L30,58 L22,58 L22,54 Z M82,46 L82,54 L78,54 L78,46 L82,46 Z M78,42 L78,46 L70,46 L70,42 L78,42 Z M78,54 L78,58 L70,58 L70,54 L78,54 Z M30,38 L34,38 L34,42 L30,42 L30,38 Z M66,38 L70,38 L70,42 L66,42 L66,38 Z M42,78 L42,70 L46,70 L46,78 L42,78 Z M54,78 L54,70 L58,70 L58,78 L54,78 Z M46,82 L46,78 L54,78 L54,82 L46,82 Z M34,74 L34,70 L38,70 L38,74 L34,74 Z M58,70 L58,66 L62,66 L62,70 L58,70 Z M70,74 L70,70 L74,70 L74,74 L70,74 Z M74,70 L74,66 L78,66 L78,70 L74,70 Z M70,66 L70,62 L74,62 L74,66 L70,66 Z M30,78 L30,74 L34,74 L34,78 L30,78 Z M26,74 L26,70 L30,70 L30,74 L26,74 Z M26,66 L26,62 L30,62 L30,66 L26,66 Z M22,70 L22,66 L26,66 L26,70 L22,70 Z M62,74 L62,70 L66,70 L66,74 L62,74 Z M66,78 L66,74 L70,74 L70,78 L66,78 Z M38,70 L38,66 L42,66 L42,70 L38,70 Z M30,62 L30,58 L34,58 L34,62 L30,62 Z M66,62 L66,58 L70,58 L70,62 L66,62 Z"/>
            </svg>
            Pomodoro Settings
          </button>
          <button
            type="button"
            className="rounded-md font-offbit bg-white/5 px-3 py-2 text-md text-zinc-200 hover:bg-white/10"
            onClick={() => setView("timers")}
            title="Exit focus (Esc)"
          >
            <svg className="w-6 h-6 inline -ml-1 mr-1" viewBox="0 0 26 32.5" fill="currentColor">
              <rect x="6" y="5" width="10" height="1"/>
              <rect x="5" y="6" width="1" height="14"/>
              <rect x="6" y="20" width="10" height="1"/>
              <rect x="16" y="15" width="1" height="5"/>
              <rect x="16" y="6" width="1" height="4"/>
              <rect x="18" y="10" width="1" height="1"/>
              <polygon points="21,12 20,12 20,11 19,11 19,12 12,12 12,13 19,13 19,14 20,14 20,13 21,13 "/>
              <rect x="18" y="14" width="1" height="1"/>
            </svg>
            Exit
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center px-6 pt-4">
        <div className="w-full max-w-2xl space-y-4">
          {/* Phase Indicator */}
          {pomodoroConfig && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={clsx(
                  "rounded-md px-3 py-1 text-lg font-offbit border",
                  getPhaseColor(pomodoroConfig.currentPhase)
                )}>
                  {getPhaseLabel(pomodoroConfig.currentPhase)}
                </div>
                <div className="text-zinc-400 font-offbit">
                  Cycle {pomodoroConfig.currentCycle}
                </div>
              </div>
              
              <div className="text-center font-offbit text-7xl tabular-nums tracking-tight text-zinc-50 mb-6">
                {formatDurationMs(display)}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="rounded-md font-offbit bg-white/10 px-6 py-3 text-md text-zinc-100 hover:bg-white/20"
                  onClick={startPauseActive}
                >
                  {status === "running" ? "Pause" : "Start"}
                </button>

                <button
                  type="button"
                  className="rounded-md font-offbit bg-white/5 px-6 py-3 text-md text-zinc-200 hover:bg-white/10"
                  onClick={resetActive}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="rounded-md font-offbit bg-white/5 px-6 py-3 text-md text-zinc-200 hover:bg-white/10"
                  onClick={() => setFocusLock(!focusLock)}
                >
                  {focusLock ? "Unlock" : "Focus Lock"}
                </button>
              </div>
            </div>
          )}

          {/* Pomodoro Settings */}
          {showSettings && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-harmond text-zinc-200 mb-4">Pomodoro Settings</h3>
              
              {!pomodoroConfig ? (
                <div className="space-y-4">
                  <p className="text-zinc-300">Enable Pomodoro mode for this timer:</p>
                  <button
                    type="button"
                    className="rounded-md font-offbit bg-emerald-400/20 text-emerald-200 px-6 py-3 text-md hover:bg-emerald-400/30 border border-emerald-400/30"
                    onClick={handleEnablePomodoro}
                  >
                    Enable Pomodoro
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-offbit text-zinc-400 mb-1">Work Duration</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-md text-zinc-100 outline-none focus:border-white/20"
                        placeholder="25:00"
                        defaultValue={formatDurationMs(config.workDurationMs || 25 * 60 * 1000)}
                        onChange={(e) => handleConfigUpdate({ workDurationMs: parseTimeString(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-offbit text-zinc-400 mb-1">Short Break</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-md text-zinc-100 outline-none focus:border-white/20"
                        placeholder="5:00"
                        defaultValue={formatDurationMs(config.shortBreakDurationMs || 5 * 60 * 1000)}
                        onChange={(e) => handleConfigUpdate({ shortBreakDurationMs: parseTimeString(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-offbit text-zinc-400 mb-1">Long Break</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-md text-zinc-100 outline-none focus:border-white/20"
                        placeholder="15:00"
                        defaultValue={formatDurationMs(config.longBreakDurationMs || 15 * 60 * 1000)}
                        onChange={(e) => handleConfigUpdate({ longBreakDurationMs: parseTimeString(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-offbit text-zinc-400 mb-1">Long Break After</label>
                      <input
                        type="number"
                        className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-md text-zinc-100 outline-none focus:border-white/20"
                        placeholder="4"
                        min="2"
                        max="10"
                        defaultValue={config.longBreakInterval || 4}
                        onChange={(e) => handleConfigUpdate({ longBreakInterval: parseInt(e.target.value) || 4 })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-zinc-300">
                      <input
                        type="checkbox"
                        className="rounded border-white/10 bg-black/20 text-emerald-400 focus:ring-emerald-400/50"
                        checked={config.autoStartBreaks || false}
                        onChange={(e) => handleConfigUpdate({ autoStartBreaks: e.target.checked })}
                      />
                      <span className="font-offbit text-sm">Auto-start breaks</span>
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300">
                      <input
                        type="checkbox"
                        className="rounded border-white/10 bg-black/20 text-emerald-400 focus:ring-emerald-400/50"
                        checked={config.autoStartWork || false}
                        onChange={(e) => handleConfigUpdate({ autoStartWork: e.target.checked })}
                      />
                      <span className="font-offbit text-sm">Auto-start work</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      className="rounded-md font-offbit bg-rose-400/20 text-rose-200 px-4 py-2 text-md hover:bg-rose-400/30 border border-rose-400/30"
                      onClick={handleDisablePomodoro}
                    >
                      Disable Pomodoro
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular Timer Display (when no Pomodoro) */}
          {!pomodoroConfig && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={clsx(
                    "rounded-md px-2 py-1 text-xl font-offbit",
                    status === "running"
                      ? "bg-emerald-400/20 text-emerald-200"
                      : status === "paused"
                        ? "bg-amber-400/20 text-amber-200"
                        : status === "completed"
                          ? "bg-rose-400/20 text-rose-200"
                          : "bg-white/10 text-zinc-300",
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <div className="text-zinc-500 text-sm">Enable Pomodoro for enhanced focus features</div>
              </div>

              <div className="text-center font-offbit text-6xl tabular-nums tracking-tight text-zinc-50 mb-6">
                {formatDurationMs(display)}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="rounded-md font-offbit bg-white/10 px-5 py-2 text-md text-zinc-100 hover:bg-white/20"
                  onClick={startPauseActive}
                >
                  Start / Pause
                </button>

                <button
                  type="button"
                  className="rounded-md font-offbit bg-white/5 px-5 py-2 text-md text-zinc-200 hover:bg-white/10"
                  onClick={resetActive}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="rounded-md font-offbit bg-white/5 px-5 py-2 text-md text-zinc-200 hover:bg-white/10"
                  onClick={() => setFocusLock(true)}
                >
                  Focus Lock
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
