"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useTimerStore } from "@/store/timerStore";
import type { Preset } from "@/store/timerStore";
import { GripVertical, Zap, PenLine, Trash2 } from "lucide-react";

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
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative flex items-center gap-2 transition-opacity",
        isDragging ? "opacity-40" : "opacity-100"
      )}
    >
      {/* --- Drag Handle --- */}
      {/* Hidden by default, appears on group hover to reduce visual noise */}
      <div
        {...attributes}
        {...listeners}
        className={clsx(
          "flex h-8 w-4 cursor-grab items-center justify-center rounded transition-opacity duration-200",
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        title="Drag to reorder"
      >
        <GripVertical size={14} className="text-muted hover:text-foreground" />
      </div>

      {/* --- Main Card Container --- */}
      <div className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-border bg-card/80 p-1.5 pl-3 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card hover:shadow-[0_0_15px_-5px_rgba(204,255,0,0.1)]">
        
        {/* Primary Action: Load as New Timer */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none cursor-pointer"
          onClick={() => applyPreset(preset.id, "new")}
          title={`Load "${preset.name}" as new timer`}
        >
          {/* Indicator Dot (Green for Timer, Grey/Hollow for Stopwatch) */}
          <div className={clsx(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            preset.kind === "timer" ? "bg-accent shadow-[0_0_5px_rgba(204,255,0,0.8)]" : "border border-muted bg-transparent"
          )} />
          
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-offbit text-xs font-medium text-foreground transition-colors group-hover:text-white">
              {preset.name}
            </span>
          </div>
        </button>

        {/* --- Action Toolbar (Right Side) --- */}
        <div className="flex shrink-0 items-center gap-0.5 border-l border-border pl-1 ml-2">
          
          {/* Apply to Active */}
          <ActionButton 
            onClick={() => applyPreset(preset.id, "active")}
            title="Inject into active timer"
            icon={Zap}
            variant="accent"
          />

          {/* Rename */}
          <ActionButton 
            onClick={() => {
              const next = window.prompt("Rename preset", preset.name);
              if (next) renamePreset(preset.id, next);
            }}
            title="Rename preset"
            icon={PenLine}
            variant="default"
          />

          {/* Delete */}
          <ActionButton 
            onClick={() => {
              if (window.confirm(`Delete preset "${preset.name}"?`)) {
                removePreset(preset.id);
              }
            }}
            title="Delete preset"
            icon={Trash2}
            variant="danger"
          />
        </div>
      </div>
    </div>
  );
}

// --- Helper for consistent icon buttons ---

function ActionButton({ 
  onClick, 
  title, 
  icon: Icon, 
  variant = "default" 
}: { 
  onClick: () => void; 
  title: string; 
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  variant?: "default" | "accent" | "danger";
}) {
  return (
    <button
      type="button"
      className={clsx(
        "flex h-7 w-7 items-center justify-center rounded transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer",
        // Default State
        "text-muted hover:bg-white/5",
        // Hover Colors based on variant
        variant === "default" && "hover:text-foreground",
        variant === "accent" && "hover:text-accent",
        variant === "danger" && "hover:text-red-500 hover:bg-red-500/10"
      )}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Icon size={12} strokeWidth={2} />
    </button>
  );
}