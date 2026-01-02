"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

import { useTimerStore } from "@/store/timerStore";
import type { Preset } from "@/store/timerStore";

interface DraggablePresetProps {
  preset: Preset;
}

export function DraggablePreset({ preset }: DraggablePresetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preset.id });

  const applyPreset = useTimerStore((s) => s.applyPreset);
  const renamePreset = useTimerStore((s) => s.renamePreset);
  const removePreset = useTimerStore((s) => s.removePreset);

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
        "flex items-center gap-1",
        isDragging && "z-50"
      )}
    >
      <div
          {...attributes}
          {...listeners}
          className={clsx(
            "flex h-8 w-4 cursor-grab items-center justify-center rounded-md bg-white/10 opacity-0 transition-opacity hover:opacity-100",
            isDragging && "opacity-100"
          )}
          title="Drag to reorder"
        >
          <svg
            width="12"
            height="12"
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
          </svg>
        </div>
      
      <button
        type="button"
        className={clsx(
          "flex min-w-0 flex-1 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer",
          "bg-white/5 text-zinc-200 hover:bg-white/10",
        )}
        onClick={() => applyPreset(preset.id, "new")}
        title={preset.name}
      >
        <span className="truncate">{preset.name}</span>
        <span className="ml-2 shrink-0 text-sm text-zinc-500" style={{ fontFamily: 'var(--font-offbit)' }}>
          {preset.kind === "stopwatch" ? "SW" : "T"}
        </span>
      </button>

      <button
        type="button"
        className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 cursor-pointer"
        title="Apply to active timer"
        onClick={() => applyPreset(preset.id, "active")}
      >
        A
      </button>

      <button
        type="button"
        className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 cursor-pointer"
        title="Rename"
        onClick={() => {
          const next = window.prompt("Rename preset", preset.name);
          if (!next) return;
          renamePreset(preset.id, next);
        }}
      >
        R
      </button>

      <button
        type="button"
        className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 cursor-pointer"
        title="Delete"
        onClick={() => {
          const ok = window.confirm(`Delete preset "${preset.name}"?`);
          if (!ok) return;
          removePreset(preset.id);
        }}
      >
        ×
      </button>
    </div>
  );
}
