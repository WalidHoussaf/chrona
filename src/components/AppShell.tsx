"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import { useGlobalShortcuts, requestFullscreen } from "@/lib/shortcuts";
import { notificationManager } from "@/lib/notifications";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { TimerDashboard } from "@/components/Timer/TimerDashboard";
import { StopwatchPanel } from "@/components/Stopwatch/StopwatchPanel";
import { FocusPanel } from "@/components/Focus/FocusPanel";
import { SettingsPanel } from "@/components/Settings/SettingsPanel";
import { InAppNotificationContainer } from "@/components/UI/InAppNotificationContainer";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Menu, Settings2, Timer, Zap } from "lucide-react";

type View = "timers" | "stopwatch" | "focus" | "settings";

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

  const [navOpen, setNavOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    boot();
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

  const viewOrder: View[] = ["timers", "stopwatch", "focus", "settings"];

  const setViewSafe = (next: View) => {
    setView(next);
    setNavOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 60 || absY > 40) return;

    const idx = viewOrder.indexOf(view as View);
    if (idx === -1) return;

    if (dx < 0) {
      const next = viewOrder[Math.min(viewOrder.length - 1, idx + 1)];
      setViewSafe(next);
      return;
    }

    const prev = viewOrder[Math.max(0, idx - 1)];
    setViewSafe(prev);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <InAppNotificationContainer />

      <div className="hidden lg:flex h-screen overflow-hidden">
        <Sidebar setNavOpen={setNavOpen} />
        <main className="flex-1 overflow-hidden">
          {view === "timers" && <TimerDashboard />}
          {view === "stopwatch" && <StopwatchPanel />}
          {view === "focus" && <FocusPanel />}
          {view === "settings" && <SettingsPanel />}
        </main>
      </div>

      <div className="flex lg:hidden h-screen overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <main className="relative flex-1 overflow-hidden pb-14 md:pb-0 scrollbar-hide">
          <div className="absolute left-0 top-0 right-0 z-30 flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pointer-events-none">
            <div className="mt-4 h-11 w-11" />

            {/* --- GLASSY HAMBURGER --- */}
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setNavOpen(true)}
              className="pointer-events-auto absolute -top-3 -right-3 z-50 lg:hidden w-16 h-16 flex items-center justify-center rounded-bl-full rounded-tl-full rounded-br-full bg-white/5 backdrop-blur-xl border-b border-l border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all duration-300 ease-out hover:bg-white/10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
            >
              {/* Icon */}
              <Menu 
                size={22} 
                strokeWidth={1.5} 
                className="text-zinc-200 -mb-1.5 -ml-1 transition-colors hover:text-white" 
              />
            </button>
          </div>

          {view === "timers" && <TimerDashboard />}
          {view === "stopwatch" && <StopwatchPanel />}
          {view === "focus" && <FocusPanel />}
          {view === "settings" && <SettingsPanel />}

          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-black/70 backdrop-blur-md md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Primary"
          >
            <div className="mx-auto flex max-w-xl items-stretch px-2 py-1.5">
              <MobileNavButton active={view === "timers"} onClick={() => setViewSafe("timers")} icon={LayoutGrid} label="Timers" />
              <MobileNavButton active={view === "stopwatch"} onClick={() => setViewSafe("stopwatch")} icon={Timer} label="Stopwatch" />
              <MobileNavButton active={view === "focus"} onClick={() => setViewSafe("focus")} icon={Zap} label="Focus" />
              <MobileNavButton active={view === "settings"} onClick={() => setViewSafe("settings")} icon={Settings2} label="Settings" />
            </div>
          </nav>
        </main>

        <AnimatePresence>
          {navOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
                onClick={() => setNavOpen(false)}
              />

              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: "spring", damping: 28, stiffness: 340 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-72 max-w-[85vw]"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
              >
                <div className="relative h-full">
                  <Sidebar setNavOpen={setNavOpen} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MobileNavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-xs " +
        (active ? "text-accent" : "text-muted")
      }
    >
      <Icon size={18} className={active ? "text-accent" : "text-muted"} />
      <span className="font-nohemi uppercase tracking-widest text-[10px]">{label}</span>
    </button>
  );
}