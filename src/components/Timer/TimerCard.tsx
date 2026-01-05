"use client";

import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, splitMsToHms, parseHmsToMs } from "@/lib/time";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2,  
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  ChevronsDown, 
  Zap, 
  Infinity as InfinityIcon 
} from "lucide-react";

export function TimerCard({ id, active }: { id: string; active: boolean }) {
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === id));
  const runtime = useTimerStore((s) => s.runtimeById[id]);

  const setActive = useTimerStore((s) => s.setActive);
  const updateTimer = useTimerStore((s) => s.updateTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);
  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);

  const ref = useRef<HTMLDivElement | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";

  const hms = useMemo(() => {
    if (!timer) return { h: 0, m: 0, s: 0 };
    return splitMsToHms(timer.durationMs);
  }, [timer]);

  // Animation for Completion
  useEffect(() => {
    if (!ref.current) return;
    if (lastStatusRef.current === status) return;
    lastStatusRef.current = status;

    if (status === "completed") {
      gsap.fromTo(
        ref.current,
        { scale: 1, boxShadow: "0 0 0px rgba(204, 255, 0, 0)" },
        { 
          scale: 1.02, 
          boxShadow: "0 0 30px rgba(204, 255, 0, 0.3)",
          duration: 0.2, 
          ease: "power2.out", 
          yoyo: true, 
          repeat: 3 
        },
      );
    }
  }, [status]);

  if (!timer) return null;

  const running = timer.runningSinceUnixMs != null;

  return (
    <div
      ref={ref}
      onMouseDown={() => setActive(timer.id)}
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-500",
        // Active State logic
        active 
          ? "border-accent/50 bg-card shadow-[0_0_40px_-15px_rgba(204,255,0,0.15)] ring-1 ring-accent/20" 
          : "border-border bg-card/40 hover:border-border hover:bg-card hover:shadow-xl",
        // Completion State
        status === "completed" && "border-accent bg-accent/5"
      )}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Zap size={120} strokeWidth={1} />
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
             <div className={clsx(
               "h-2 w-2 rounded-full transition-colors duration-300 mb-1",
               status === "running" ? "bg-accent shadow-[0_0_8px_rgba(204,255,0,0.8)] animate-pulse" : "bg-muted/30"
             )} />
             <span className="font-offbit text-sm uppercase tracking-wide text-muted">
               {status === "idle" ? "Ready" : status}
             </span>
          </div>
          <input
            className="w-full bg-transparent font-galgo text-6xl tracking-wider text-foreground outline-none placeholder:text-muted/30 transition-colors focus:text-accent"
            value={timer.label}
            onChange={(e) => updateTimer(timer.id, { label: e.target.value })}
            placeholder="Untitled Timer"
          />
        </div>

        {/* Top Right Config Toggles */}
        {timer.kind === "timer" && (
          <div className="absolute top-0 right-0 flex gap-1">
             <ConfigToggle 
               active={timer.loop} 
               onClick={() => updateTimer(timer.id, { loop: !timer.loop })}
               icon={InfinityIcon}
               label="Loop"
             />
             <ConfigToggle 
               active={timer.direction === "up"} 
               onClick={() => updateTimer(timer.id, { direction: timer.direction === "down" ? "up" : "down" })}
               icon={timer.direction === "up" ? ChevronsUp : ChevronsDown}
               label={timer.direction === "up" ? "Count Up" : "Count Down"}
             />
          </div>
        )}
      </div>

      {/* --- MAIN DISPLAY --- */}
      <div className="relative z-10 my-8 flex justify-center">
        <div className={clsx(
          "font-offbit text-9xl font-bold tracking-tighter tabular-nums transition-colors duration-300 select-none text-center",
          running ? "text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-foreground"
        )}>
          {formatDurationMs(display)}
        </div>
      </div>

      {/* --- INPUTS & CONTROLS --- */}
      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Time Inputs (Only visible/editable when not running for better UX, or disabled styling) */}
        {timer.kind === "timer" && (
          <div className={clsx(
            "grid grid-cols-3 gap-4 transition-opacity duration-300",
            running ? "opacity-30 pointer-events-none grayscale" : "opacity-100"
          )}>
            <TimeField
              label="HRS"
              value={hms.h}
              disabled={running}
              onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(v, hms.m, hms.s) })}
            />
            <TimeField
              label="MIN"
              value={hms.m}
              disabled={running}
              onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, v, hms.s) })}
              max={59}
            />
            <TimeField
              label="SEC"
              value={hms.s}
              disabled={running}
              onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, hms.m, v) })}
              max={59}
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-center gap-3 pt-2">
           {/* Primary Play/Pause */}
           <button
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               setActive(timer.id);
               startPauseActive();
             }}
             className={clsx(
               "flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 font-offbit cursor-pointer",
               running 
                 ? "bg-card border border-accent text-accent hover:bg-accent hover:text-background" 
                 : "bg-accent text-background hover:brightness-110 shadow-[0_0_20px_-5px_rgba(204,255,0,0.4)]"
             )}
           >
             {running ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
             {running ? "Pause" : "Start"}
           </button>

           {/* Secondary Actions */}
           <div className="flex gap-2 justify-center">
             <SecondaryAction 
               onClick={(e) => {
                 e.stopPropagation();
                 setActive(timer.id);
                 resetActive();
               }}
               icon={RotateCcw}
               title="Reset Timer"
             />
             <SecondaryAction 
               onClick={(e) => {
                 e.stopPropagation();
                 removeTimer(timer.id);
               }}
               icon={Trash2}
               title="Delete Timer"
               isDestructive
             />
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function ConfigToggle({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ComponentType<{ size?: number; strokeWidth?: number }>, label: string }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={clsx(
        "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all duration-200 cursor-pointer text-lg font-offbit",
        active 
          ? "bg-accent text-background border-accent" 
          : "bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-foreground"
      )}
    >
      <Icon size={24} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

function SecondaryAction({ onClick, icon: Icon, title, isDestructive }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, icon: React.ComponentType<{ size?: number }>, title: string, isDestructive?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        "p-3.5 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer",
        isDestructive
          ? "border-border bg-transparent text-muted hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
          : "border-border bg-transparent text-muted hover:border-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      <Icon size={18} />
    </button>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  max?: number;
}) {
  const handleIncrement = () => {
    const next = value + 1;
    onChange(max != null ? Math.min(max, next) : next);
  };

  const handleDecrement = () => {
    const next = value - 1;
    onChange(Math.max(0, next));
  };

  return (
    <div className="group/field relative flex flex-col gap-1">
      {/* Label */}
      <span className="font-offbit text-xs font-bold text-muted/50 text-center uppercase tracking-widest group-hover/field:text-accent transition-colors">
        {label}
      </span>

      {/* Input Container */}
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-black/20 p-1 group-hover/field:border-white/20 transition-colors">
        
        {/* Hover Controls - Top */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
          disabled={disabled}
          className="w-full flex items-center justify-center h-4 text-muted hover:text-accent opacity-0 group-hover/field:opacity-100 transition-all disabled:hidden cursor-pointer"
        >
          <ArrowUp size={12} />
        </button>

        {/* Number Input */}
        <div className="relative w-full">
            <input
              type="number"
              inputMode="numeric"
              className="w-full bg-transparent text-center font-offbit text-2xl font-medium text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none selection:bg-accent selection:text-background"
              value={value.toString().padStart(2, '0')}
              disabled={disabled}
              min={0}
              max={max}
              onChange={(e) => onChange(Number(e.target.value || 0))}
              onWheel={(e) => {
                if (disabled) return;
                e.currentTarget.blur();
                const isShiftPressed = e.shiftKey;
                const delta = isShiftPressed ? 5 : 1;
                const dir = e.deltaY < 0 ? delta : -delta;
                const next = value + dir;
                onChange(max != null ? Math.min(max, Math.max(0, next)) : Math.max(0, next));
              }}
            />
            {/* Tooltip on Hover */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover/field:opacity-100 z-50 min-w-max">
               <div className="flex items-center tracking-wider font-galgo gap-2 rounded bg-card border border-border px-2 py-1 text-2xl text-muted shadow-xl">
                 <span className="font-offbit tracking-normal text-xs text-foreground">SCROLL</span> to adjust
               </div>
            </div>
        </div>

        {/* Hover Controls - Bottom */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
          disabled={disabled}
          className="w-full flex items-center justify-center h-4 text-muted hover:text-accent opacity-0 group-hover/field:opacity-100 transition-all disabled:hidden cursor-pointer"
        >
          <ArrowDown size={12} />
        </button>
      </div>
    </div>
  );
}