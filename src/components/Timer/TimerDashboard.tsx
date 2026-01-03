"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { ScrollArea } from "@/components/UI/ScrollArea";
import { DragDropProvider } from "@/components/UI/DragDropContext";
import { useTimerStore } from "@/store/timerStore";
import { DraggableTimerCard } from "@/components/Timer/DraggableTimerCard";

export function TimerDashboard() {
  const timers = useTimerStore((s) => s.timers);
  const activeId = useTimerStore((s) => s.activeId);
  const newTimer = useTimerStore((s) => s.newTimer);
  const killAll = useTimerStore((s) => s.killAll);
  const moveTimer = useTimerStore((s) => s.moveTimer);

  const sorted = [...timers].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((timer) => timer.id === active.id);
    const newIndex = sorted.findIndex((timer) => timer.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      moveTimer(active.id as string, newIndex);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="font-harmond text-3xl text-zinc-200">Active Timers</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md font-offbit bg-white/10 px-5 py-2 text-md text-zinc-100 hover:bg-white/20 cursor-pointer"
            onClick={() => newTimer("timer")}
          >
            New Timer
          </button>
          <button
            type="button"
            className="rounded-md font-offbit bg-white/5 px-5 py-2 text-md text-zinc-300 hover:bg-white/10 cursor-pointer"
            onClick={killAll}
          >
            Kill All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <DragDropProvider
            items={sorted.map((t) => ({ id: t.id }))}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 p-6">
              {sorted.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-3xl text-zinc-200">
                  No timers yet. Press N to create one.
                </div>
              ) : (
                sorted.map((t) => (
                  <DraggableTimerCard key={t.id} id={t.id} active={t.id === activeId} />
                ))
              )}
            </div>
          </DragDropProvider>
        </ScrollArea>
      </div>
    </div>
  );
}