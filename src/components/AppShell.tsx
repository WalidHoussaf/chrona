"use client";

import { useEffect, useMemo } from "react";

import { useTimerStore } from "@/store/timerStore";
import { useGlobalShortcuts, requestFullscreen } from "@/lib/shortcuts";
import { notificationManager } from "@/lib/notifications";

import { Sidebar } from "@/components/Sidebar/Sidebar";
import { TimerDashboard } from "@/components/Timer/TimerDashboard";
import { StopwatchPanel } from "@/components/Stopwatch/StopwatchPanel";
import { FocusPanel } from "@/components/Focus/FocusPanel";
import { SettingsPanel } from "@/components/Settings/SettingsPanel";
import { InAppNotificationContainer } from "@/components/UI/InAppNotificationContainer";

export function AppShell() {
  const boot = useTimerStore((s) => s.boot);
  const view = useTimerStore((s) => s.view);
  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);
  const newTimer = useTimerStore((s) => s.newTimer);
  const setView = useTimerStore((s) => s.setView);
  const switchActive = useTimerStore((s) => s.switchActive);
  const killAll = useTimerStore((s) => s.killAll);
  const savePresetFromActive = useTimerStore((s) => s.savePresetFromActive);

  useEffect(() => {
    boot();
    // Initialize notification permissions
    notificationManager.requestPermission();
  }, [boot]);

  const handlers = useMemo(
    () => ({
      onStartPause: startPauseActive,
      onReset: resetActive,
      onNewTimer: () => newTimer("timer"),
      onFocusMode: () => setView(view === "focus" ? "timers" : "focus"),
      onViewTimers: () => setView("timers"),
      onViewStopwatch: () => setView("stopwatch"),
      onViewFocus: () => setView("focus"),
      onViewSettings: () => setView("settings"),
      onExitFocus: () => {
        if (view === "focus") setView("timers");
      },
      onFullscreen: requestFullscreen,
      onSwitchTimer: switchActive,
      onKillAll: killAll,
      onSavePreset: () => {
        const name = window.prompt("Preset name");
        if (!name) return;
        savePresetFromActive(name);
      },
    }),
    [killAll, newTimer, resetActive, savePresetFromActive, setView, startPauseActive, switchActive, view],
  );

  useGlobalShortcuts(handlers);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <InAppNotificationContainer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {view === "timers" && <TimerDashboard />}
          {view === "stopwatch" && <StopwatchPanel />}
          {view === "focus" && <FocusPanel />}
          {view === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
