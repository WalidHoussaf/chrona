"use client";

import { ScrollArea } from "@/components/UI/ScrollArea";

import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs } from "@/lib/time";

export function StopwatchPanel() {
  const timers = useTimerStore((s) => s.timers);
  const activeId = useTimerStore((s) => s.activeId);
  const setActive = useTimerStore((s) => s.setActive);

  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);
  const lapActive = useTimerStore((s) => s.lapActive);

  const stopwatch = timers.find((t) => t.kind === "stopwatch") ?? null;
  const runtime = useTimerStore((s) => (stopwatch ? s.runtimeById[stopwatch.id] : undefined));

  if (!stopwatch) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">Creating stopwatch…</div>
    );
  }

  const display = runtime?.displayMs ?? 0;
  const running = stopwatch.runningSinceUnixMs != null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="font-harmond text-3xl text-zinc-200">Stopwatch</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md font-offbit bg-white/10 px-5 py-2 text-md text-zinc-100 hover:bg-white/20"
            onClick={() => {
              setActive(stopwatch.id);
              startPauseActive();
            }}
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            className="rounded-md font-offbit bg-white/5 px-5 py-2 text-md text-zinc-300 hover:bg-white/10"
            onClick={() => {
              setActive(stopwatch.id);
              resetActive();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-md font-offbit bg-emerald-500/20 px-5 py-2 text-md text-emerald-100 hover:bg-emerald-500/25"
            onClick={() => {
              setActive(stopwatch.id);
              lapActive();
            }}
          >
            Lap
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pt-10">
        <div
          className="rounded-2xl border border-white/10 bg-white/5 p-8"
          onMouseDown={() => setActive(stopwatch.id)}
        >
          <div className="text-center text-6xl tabular-nums tracking-tight text-zinc-50" style={{ fontFamily: 'var(--font-offbit)' }}>
            {formatDurationMs(display)}
          </div>
          <div className="mt-3 text-center text-2xl text-zinc-500">
            Active: {activeId === stopwatch.id ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="mt-8 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto w-full max-w-3xl px-6 pb-10">
            <div className="font-harmond mb-2 text-3xl text-zinc-400">Laps</div>
            {stopwatch.laps && stopwatch.laps.length > 0 ? (
              <div className="flex flex-col gap-2">
                {stopwatch.laps.map((lap, idx) => (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="text-5xl text-zinc-500">#{stopwatch.laps!.length - idx}</div>
                    <div className="text-4xl tabular-nums text-zinc-100" style={{ fontFamily: 'var(--font-offbit)' }}>
                      {formatDurationMs(lap.elapsedMs)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-white/10 bg-white/5 p-6 text-2xl text-zinc-200">
                No laps yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
