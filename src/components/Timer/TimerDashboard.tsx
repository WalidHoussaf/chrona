"use client";

import { ScrollArea } from "@/components/UI/ScrollArea";

import { useTimerStore } from "@/store/timerStore";
import { TimerCard } from "@/components/Timer/TimerCard";

export function TimerDashboard() {
  const timers = useTimerStore((s) => s.timers);
  const activeId = useTimerStore((s) => s.activeId);
  const newTimer = useTimerStore((s) => s.newTimer);
  const killAll = useTimerStore((s) => s.killAll);

  const sorted = [...timers].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="font-harmond text-3xl text-zinc-200">Active Timers</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md font-offbit bg-white/10 px-5 py-2 text-md text-zinc-100 hover:bg-white/20"
            onClick={() => newTimer("timer")}
          >
            New Timer
          </button>
          <button
            type="button"
            className="rounded-md font-offbit bg-white/5 px-5 py-2 text-md text-zinc-300 hover:bg-white/10"
            onClick={killAll}
          >
            Kill All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 p-6">
            {sorted.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-3xl text-zinc-200">
                No timers yet. Press N to create one.
              </div>
            ) : (
              sorted.map((t) => (
                <TimerCard key={t.id} id={t.id} active={t.id === activeId} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
