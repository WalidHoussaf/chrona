"use client";

import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import { motion, useAnimation } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, splitMsToHms, parseHmsToMs } from "@/lib/time";
import ElectricBorder from "@/components/UI/ElectricBorder";
import { Play, Pause, RotateCcw, Trash2, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Zap, Infinity as InfinityIcon } from "lucide-react";

export function TimerCard({ id, active, dragHandle }: { id: string; active: boolean; dragHandle?: React.ReactNode }) {
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === id));
  const runtime = useTimerStore((s) => s.runtimeById[id]);

  const setActive = useTimerStore((s) => s.setActive);
  const updateTimer = useTimerStore((s) => s.updateTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);
  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);

  // Framer Motion controls
  const controls = useAnimation();
  const lastStatusRef = useRef<string | null>(null);

  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";

  // Animation for Completion
  useEffect(() => {
    if (lastStatusRef.current === status) return;
    lastStatusRef.current = status;

    if (status === "completed") {
      controls.start({
        scale: [1, 1.02],
        boxShadow: ["0 0 0px rgba(204, 255, 0, 0)", "0 0 30px rgba(204, 255, 0, 0.3)"],
        transition: {
          duration: 0.2,
          ease: "easeOut",
          repeat: 3,
          repeatType: "reverse",
        },
      });
    } else {
      controls.set({ 
        scale: 1, 
        boxShadow: "0 0 0px rgba(204, 255, 0, 0)" 
      });
    }
  }, [status, controls]);

  const hms = useMemo(() => {
    if (!timer) return { h: 0, m: 0, s: 0 };
    return splitMsToHms(timer.durationMs);
  }, [timer]);

  if (!timer) return null;

  const running = timer.runningSinceUnixMs != null;

  return (
    <ElectricBorder
      mode="rect"
      color={`var(--accent)`}
      speed={0.4}
      chaos={0.16}
      svgDisplacement={6}
      thickness={1}
      fuzziness={0.4}
      glow={1}
      borderRadius={12}
      showOutline={false}
      className="h-auto w-full"
    >
      <motion.div
        animate={controls}
        onMouseDown={() => setActive(timer.id)}
        onTouchStart={() => setActive(timer.id)}
        className={clsx(
          "group relative flex flex-col justify-between overflow-hidden rounded-xl p-3 lg:p-6 transition-colors duration-500 w-full",
          "h-auto",
          active 
            ? "bg-card shadow-[0_0_40px_-15px_rgba(204,255,0,0.15)]" 
            : "bg-card/40 hover:shadow-xl",
          status === "completed" && "bg-accent/10"
        )}
      >
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -m-8 opacity-5 pointer-events-none">
          <Zap size={250} strokeWidth={1} className="rotate-12" />
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 flex flex-col items-start min-w-0 pr-20 lg:pr-0">
            
            <div className="flex items-center gap-2 mb-0.5 lg:mb-1">
               <div className={clsx(
                     "h-2 w-2 rounded-full transition-colors duration-300 mb-1",
                     status === "running" ? "bg-accent shadow-[0_0_8px_rgba(204,255,0,0.8)] animate-pulse" : "bg-muted/30"
               )} />
               <span className="font-nohemi text-xs lg:text-sm uppercase tracking-wide text-muted">
                 {status === "idle" ? "Ready" : status}
               </span>
            </div>

            <input
              className="w-full bg-transparent font-nohemi text-2xl lg:text-4xl tracking-tighter text-foreground outline-none placeholder:text-muted/30 transition-colors focus:text-accent"
              value={timer.label}
              onChange={(e) => updateTimer(timer.id, { label: e.target.value })}
              placeholder="Untitled Timer"
            />
          </div>

          <div className="absolute top-0 right-0 flex items-center gap-1 -mt-1">
              {timer.kind === "timer" && (
                <>
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
                </>
              )}
              {dragHandle}
          </div>
        </div>

        {/* --- MAIN DISPLAY --- */}
        <div className="relative z-10 my-2 lg:my-8 flex justify-center">
          <div className={clsx(
            "font-offbit text-6xl lg:text-9xl font-bold tracking-tighter tabular-nums transition-colors duration-300 select-none text-center",
            running ? "text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-foreground"
          )}>
            {formatDurationMs(display)}
          </div>
        </div>

        {/* --- INPUTS & CONTROLS --- */}
        <div className="relative z-10 flex flex-col gap-2 lg:gap-5 mt-auto">
          
          {/* 1. Time Inputs */}
          <div className={clsx(
            "grid grid-cols-3 gap-1 lg:gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            running 
              ? "max-h-0 opacity-0 overflow-hidden -my-1"
              : "max-h-32 opacity-100 lg:max-h-none lg:scale-100"
          )}>
            {timer.kind === "timer" && (
                <>
                <TimeField label="HRS" value={hms.h} disabled={running} onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(v, hms.m, hms.s) })} />
                <TimeField label="MIN" value={hms.m} disabled={running} onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, v, hms.s) })} max={59} />
                <TimeField label="SEC" value={hms.s} disabled={running} onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, hms.m, v) })} max={59} />
                </>
            )}
          </div>

          {/* 2. The Magnetic Command Deck */}
          <div className="group/deck relative flex items-stretch gap-1 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl bg-black/20 border border-white/5 shadow-inner backdrop-blur-md overflow-hidden">
            
            {/* RESET BUTTON */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(timer.id); resetActive(); }}
                className="relative group/btn flex items-center justify-center w-10 lg:w-12 rounded-lg lg:rounded-xl text-muted/50 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90 overflow-hidden cursor-pointer"
                title="Reset"
            >
                <RotateCcw size={16} className="transition-transform duration-500 group-hover/btn:-rotate-180" />
            </button>

            {/* HERO START/PAUSE BUTTON */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(timer.id); startPauseActive(); }}
                className={clsx(
                    "relative flex-1 h-10 lg:h-14 overflow-hidden rounded-lg lg:rounded-xl transition-all duration-500 ease-out group-hover/deck:shadow-lg cursor-pointer",
                    running 
                        ? "bg-accent text-black" 
                        : "bg-white/5 text-foreground hover:bg-white/10 border border-white/5 hover:border-white/20"
                )}
            >
                <div className="relative z-10 flex items-center justify-center gap-2 lg:gap-3 w-full h-full font-nohemi text-sm lg:text-md tracking-widest uppercase">
                    <span className="transition-transform duration-300 active:scale-75 -mt-0.5">
                        {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </span>
                    <span>{running ? "Pause" : "Start"}</span>
                </div>
                {!running && (
                    <div className="absolute inset-0 z-0 w-[300%] bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                )}
                {running && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                )}
            </button>

            {/* DELETE BUTTON */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTimer(timer.id); }}
                className="relative group/btn flex items-center justify-center w-10 lg:w-12 rounded-lg lg:rounded-xl text-muted/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 active:scale-90 cursor-pointer"
                title="Delete"
            >
                <Trash2 size={16} className="transition-transform duration-300 group-hover/btn:rotate-12" />
            </button>
          </div>
        </div>
      </motion.div>
    </ElectricBorder>
  );
}

// --- Sub-components ---

function ConfigToggle({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>, label: string }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={clsx(
        "flex items-center justify-center gap-1 border transition-all duration-200 font-nohemi cursor-pointer",
        "p-1.5 rounded-lg lg:px-2 lg:py-1 lg:rounded-md", 
        active 
          ? "bg-accent text-background border-accent" 
          : "bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-foreground"
      )}
    >
      <span className="inline-block">
        <Icon strokeWidth={1} className="w-4 h-4 lg:w-6 lg:h-6" />
      </span>
      <span className="hidden lg:inline text-sm">{label}</span>
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
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleIncrement = () => {
    const next = value + 1;
    onChange(max != null ? Math.min(max, next) : next);
  };

  const handleDecrement = () => {
    const next = value - 1;
    onChange(Math.max(0, next));
  };

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.preventDefault(); 
      element.blur(); 
      const isShiftPressed = e.shiftKey;
      const delta = isShiftPressed ? 5 : 1; 
      const dir = e.deltaY < 0 ? delta : -delta;
      const next = valueRef.current + dir;
      const final = max != null ? Math.min(max, Math.max(0, next)) : Math.max(0, next);
      onChange(final);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [disabled, max, onChange]);

  return (
    <div className="group/field relative flex flex-col gap-0.5 lg:gap-1">
      <span className="font-offbit text-xs lg:text-sm text-muted/50 text-center uppercase tracking-widest group-hover/field:text-accent transition-colors">
        {label}
      </span>

      <div className="relative flex flex-col items-center justify-center rounded-lg lg:rounded-xl border border-border bg-black/20 p-0.5 lg:p-1 group-hover/field:border-white/20 transition-colors">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
          disabled={disabled}
          className={clsx(
            "w-full flex items-center justify-center text-muted hover:text-accent transition-all disabled:hidden cursor-pointer",
            "h-6 opacity-100",
            "lg:h-4 lg:opacity-0 lg:group-hover/field:opacity-100",
          )}
        >
          <ArrowUp size={10} className="lg:w-3 lg:h-3" />
        </button>

        <div className="relative w-full">
            <input
              ref={inputRef} 
              type="number"
              inputMode="numeric"
              className="w-full bg-transparent text-center font-offbit text-xl lg:text-3xl font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none selection:bg-accent selection:text-background"
              value={value.toString().padStart(2, '0')}
              disabled={disabled}
              min={0}
              max={max}
              onChange={(e) => onChange(Number(e.target.value || 0))}
            />
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
          disabled={disabled}
          className={clsx(
            "w-full flex items-center justify-center text-muted hover:text-accent transition-all disabled:hidden cursor-pointer",
             "h-6 opacity-100",
             "lg:h-4 lg:opacity-0 lg:group-hover/field:opacity-100",
          )}
        >
          <ArrowDown size={10} className="lg:w-3 lg:h-3" />
        </button>
      </div>
    </div>
  );
}