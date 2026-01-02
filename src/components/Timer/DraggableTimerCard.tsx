"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

import { TimerCard } from "./TimerCard";

interface DraggableTimerCardProps {
  id: string;
  active: boolean;
}

export function DraggableTimerCard({ id, active }: DraggableTimerCardProps) {
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
      <div
          {...attributes}
          {...listeners}
          className={clsx(
            "absolute left-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-md bg-white/10 opacity-0 transition-opacity hover:opacity-100",
            isDragging && "opacity-100"
          )}
          title="Drag to reorder"
        >
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
        </div>
      <div className={clsx(isDragging && "cursor-grabbing")}>
        <TimerCard id={id} active={active} />
      </div>
    </div>
  );
}
