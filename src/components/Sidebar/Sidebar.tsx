"use client";

import clsx from "clsx";

import { useTimerStore } from "@/store/timerStore";
import { Presets } from "@/components/Sidebar/Presets";

export function Sidebar() {
  const view = useTimerStore((s) => s.view);
  const setView = useTimerStore((s) => s.setView);

  return (
    <aside className="w-72 shrink-0 border-r border-white/10 bg-zinc-950/60 backdrop-blur">
      <div className="flex h-full flex-col p-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="font-harmond text-5xl font-semibold tracking-wide text-zinc-100">Chrona</div>
          <div className="mt-6 text-[15px] font-offbit text-zinc-500">Desktop</div>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            className={clsx(
              "rounded-md px-3 py-2 text-left text-3xl transition-colors cursor-pointer",
              view === "timers" ? "bg-white/10 text-zinc-50" : "text-zinc-400 hover:bg-white/5",
            )}
            onClick={() => setView("timers")}
            type="button"
          >
            Timers
          </button>

          <button
            className={clsx(
              "rounded-md px-3 py-2 text-left text-3xl transition-colors cursor-pointer",
              view === "stopwatch" ? "bg-white/10 text-zinc-50" : "text-zinc-400 hover:bg-white/5",
            )}
            onClick={() => setView("stopwatch")}
            type="button"
          >
            Stopwatch
          </button>

          <button
            className={clsx(
              "rounded-md px-3 py-2 text-left text-3xl transition-colors cursor-pointer",
              view === "focus" ? "bg-white/10 text-zinc-50" : "text-zinc-400 hover:bg-white/5",
            )}
            onClick={() => setView("focus")}
            type="button"
          >
            Focus Mode
          </button>

          <button
            className={clsx(
              "rounded-md px-3 py-2 text-left text-3xl transition-colors cursor-pointer",
              view === "settings" ? "bg-white/10 text-zinc-50" : "text-zinc-400 hover:bg-white/5",
            )}
            onClick={() => setView("settings")}
            type="button"
          >
            Settings
          </button>
        </nav>

        <Presets />
      </div>
    </aside>
  );
}
