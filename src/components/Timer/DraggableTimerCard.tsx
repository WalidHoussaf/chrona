"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { TimerCard } from "./TimerCard";

interface DraggableTimerCardProps {
  id: string;
  active: boolean;
  totalTimers: number;
}

export function DraggableTimerCard({ id, active, totalTimers }: DraggableTimerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative",
        isDragging && "z-50"
      )}
    >
      <div className={clsx(isDragging && "cursor-grabbing")}>
        <TimerCard
          id={id}
          active={active}
          dragHandle={totalTimers > 1 ? (
            <div
              {...attributes}
              {...listeners}
              className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all duration-200 cursor-pointer bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-foreground",
                isDragging && "bg-white/10"
              )}
              title="Drag to reorder"
            >
              <span className="-mt-0.5 inline-block">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-400"
                >
                  <circle cx="9" cy="5" r="1" />
                  <circle cx="15" cy="5" r="1" />
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="15" cy="19" r="1" />
                </svg>
              </span>
            </div>
          ) : undefined}
        />
      </div>
    </div>
  );
}