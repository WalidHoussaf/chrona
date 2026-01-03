"use client";

import { DragEndEvent } from "@dnd-kit/core";
import { ScrollArea } from "@/components/UI/ScrollArea";
import { DragDropProvider } from "@/components/UI/DragDropContext";
import { useTimerStore } from "@/store/timerStore";
import { DraggableTimerCard } from "@/components/Timer/DraggableTimerCard";
import clsx from "clsx";

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
    <div className="flex h-full flex-col bg-background selection:bg-accent selection:text-background">
      {/* Header Section */}
      <div className="flex items-end justify-between border-b border-border/60 bg-background/50 px-8 py-6 backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <h1 className="font-harmond text-4xl font-medium tracking-tight text-foreground">
            Active Timers
          </h1>
          <p className="font-offbit text-xs uppercase tracking-widest text-muted">
            {sorted.length} {sorted.length === 1 ? "Running" : "Running"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ActionButton onClick={() => newTimer("timer")} variant="primary">
            + New Timer
          </ActionButton>
          
          <ActionButton onClick={killAll} variant="secondary">
            Kill All
          </ActionButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <DragDropProvider
            items={sorted.map((t) => ({ id: t.id }))}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-8">
              {sorted.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col gap-4 transition-all duration-500 ease-in-out">
                  {sorted.map((t) => (
                    <DraggableTimerCard 
                      key={t.id} 
                      id={t.id} 
                      active={t.id === activeId} 
                    />
                  ))}
                </div>
              )}
            </div>
          </DragDropProvider>
        </ScrollArea>
      </div>
    </div>
  );
}

// --- Sub Components for Cleaner Code ---

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-full border px-6 py-2 transition-all duration-300 ease-out cursor-pointer",
        "font-offbit text-xs font-medium uppercase tracking-wider",
        variant === "primary"
          ? "border-border text-foreground hover:border-accent hover:text-accent"
          : "border-transparent text-muted hover:text-red-400"
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="group flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/20 transition-colors duration-500 hover:border-border hover:bg-card/40">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="font-harmond text-3xl text-muted transition-colors duration-300 group-hover:text-foreground">
          The Void is Quiet
        </span>
        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1">
          <kbd className="font-offbit text-[10px] text-muted">N</kbd>
          <span className="font-offbit text-[10px] uppercase tracking-widest text-muted">
            to initialize
          </span>
        </div>
      </div>
    </div>
  );
}