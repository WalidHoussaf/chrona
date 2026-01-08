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

  const hms = useMemo(() => {
    if (!timer) return { h: 0, m: 0, s: 0 };
    return splitMsToHms(timer.durationMs);
  }, [timer]);

  // Animation for Completion (Replicating GSAP fromTo behavior)
  useEffect(() => {
    if (lastStatusRef.current === status) return;
    lastStatusRef.current = status;

    if (status === "completed") {
      controls.start({
        // Array syntax [from, to] replicates gsap.fromTo
        scale: [1, 1.02],
        boxShadow: ["0 0 0px rgba(204, 255, 0, 0)", "0 0 30px rgba(204, 255, 0, 0.3)"],
        transition: {
          duration: 0.2,
          ease: "easeOut", // Matches power2.out
          repeat: 3,       // Matches GSAP repeat: 3
          repeatType: "reverse", // Matches GSAP yoyo: true
        },
      });
    } else {
      // Ensure we reset to 'idle' state visually if status changes
      controls.set({ 
        scale: 1, 
        boxShadow: "0 0 0px rgba(204, 255, 0, 0)" 
      });
    }
  }, [status, controls]);

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
      className="h-full w-full"
    >
      <motion.div
        animate={controls}
        onMouseDown={() => setActive(timer.id)}
        className={clsx(
          "group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 transition-colors duration-500 h-full w-full",
          // Active State logic
          active 
            ? "bg-card shadow-[0_0_40px_-15px_rgba(204,255,0,0.15)]" 
            : "bg-card/40 hover:shadow-xl",
          // Completion State
          status === "completed" && "bg-accent/10"
        )}
      >
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -m-8 opacity-5 pointer-events-none">
          <Zap size={250} strokeWidth={1} className="rotate-12" />
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
               <div className={clsx(
                     "h-2 w-2 rounded-full transition-colors duration-300 mb-1",
                     status === "running" ? "bg-accent shadow-[0_0_8px_rgba(204,255,0,0.8)] animate-pulse" : "bg-muted/30"
               )} />
               <span className="font-nohemi text-sm uppercase tracking-wide text-muted">
                 {status === "idle" ? "Ready" : status}
               </span>
            </div>
            <input
              className="w-full bg-transparent font-nohemi text-4xl tracking-tighter text-foreground outline-none placeholder:text-muted/30 transition-colors focus:text-accent"
              value={timer.label}
              onChange={(e) => updateTimer(timer.id, { label: e.target.value })}
              placeholder="Untitled Timer"
            />
          </div>

          {/* Top Right Config Toggles */}
          <div className="absolute top-0 right-0 flex gap-1 -mt-1">
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
        <div className="relative z-10 my-8 flex justify-center">
          <div className={clsx(
            "font-offbit text-9xl font-bold tracking-tighter tabular-nums transition-colors duration-300 select-none text-center",
            running ? "text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-foreground"
          )}>
            {formatDurationMs(display)}
          </div>
        </div>

        {/* --- INPUTS & CONTROLS --- */}
        <div className="relative z-10 flex flex-col gap-5 mt-auto">
          
          {/* 1. Time Inputs 
              (We wrap them in a container that blurs/fades when running) 
          */}
          <div className={clsx(
            "grid grid-cols-3 gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            running 
              ? "opacity-20 blur-sm scale-95 pointer-events-none grayscale" 
              : "opacity-100 scale-100"
          )}>
            {timer.kind === "timer" && (
                <>
                <TimeField label="HRS" value={hms.h} disabled={running} onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(v, hms.m, hms.s) })} />
                <TimeField label="MIN" value={hms.m} disabled={running} onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, v, hms.s) })} max={59} />
                <TimeField label="SEC" value={hms.s} disabled={running} onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, hms.m, v) })} max={59} />
                </>
            )}
          </div>

          {/* 2. The Magnetic Command Deck 
              (A unified container for all actions)
          */}
          <div className="group/deck relative flex items-stretch gap-1.5 p-1.5 rounded-2xl bg-black/20 border border-white/5 shadow-inner backdrop-blur-md overflow-hidden">
            
            {/* RESET BUTTON */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(timer.id); resetActive(); }}
                className="relative group/btn flex items-center justify-center w-12 rounded-xl text-muted/50 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90 overflow-hidden cursor-pointer"
                title="Reset"
            >
                <RotateCcw size={18} className="transition-transform duration-500 group-hover/btn:-rotate-180" />
            </button>

            {/* HERO START/PAUSE BUTTON */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(timer.id); startPauseActive(); }}
                className={clsx(
                    "relative flex-1 h-14 overflow-hidden rounded-xl transition-all duration-500 ease-out group-hover/deck:shadow-lg cursor-pointer",
                    // Active State (Neon/Solid) vs Idle State (Glass/Outline)
                    running 
                        ? "bg-accent text-black" 
                        : "bg-white/5 text-foreground hover:bg-white/10 border border-white/5 hover:border-white/20"
                )}
            >
                {/* Text & Icon Content */}
                <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full font-nohemi text-md tracking-widest uppercase">
                    <span className="transition-transform duration-300 active:scale-75 -mt-0.5">
                        {running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                    </span>
                    <span>{running ? "Pause" : "Start"}</span>
                </div>

                {/* ANIMATION: Diagonal Shimmer */}
                {!running && (
                    <div className="absolute inset-0 z-0 w-[300%] bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                )}

                {/* ANIMATION: Subtle Pulse Overlay when Running */}
                {running && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                )}
            </button>

            {/* DELETE BUTTON */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTimer(timer.id); }}
                className="relative group/btn flex items-center justify-center w-12 rounded-xl text-muted/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 active:scale-90 cursor-pointer"
                title="Delete"
            >
                <Trash2 size={18} className="transition-transform duration-300 group-hover/btn:rotate-12" />
            </button>
          </div>
        </div>
      </motion.div>
    </ElectricBorder>
  );
}

// --- Sub-components ---

function ConfigToggle({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ComponentType<{ size?: number; strokeWidth?: number }>, label: string }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={clsx(
        "flex items-center gap-1 px-2 py-1 rounded-md border transition-all duration-200 text-sm font-nohemi cursor-pointer",
        active 
          ? "bg-accent text-background border-accent" 
          : "bg-transparent text-muted border-transparent hover:bg-white/5 hover:text-foreground"
      )}
    >
      <span className="-mt-0.5 inline-block">
        <Icon size={24} strokeWidth={1} />
      </span>
      <span>{label}</span>
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
    <div className="group/field relative flex flex-col gap-1">
      {/* Label */}
      <span className="font-offbit text-sm text-muted/50 text-center uppercase tracking-widest group-hover/field:text-accent transition-colors">
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
              ref={inputRef} 
              type="number"
              inputMode="numeric"
              className="w-full bg-transparent text-center font-offbit text-3xl font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none selection:bg-accent selection:text-background"
              value={value.toString().padStart(2, '0')}
              disabled={disabled}
              min={0}
              max={max}
              onChange={(e) => onChange(Number(e.target.value || 0))}
            />
            {/* Tooltip on Hover */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover/field:opacity-100 z-50 min-w-max">
               <div className="flex items-center tracking-wider font-galgo gap-2 rounded bg-card border border-border px-2 py-1 text-2xl text-muted shadow-xl">
                 <span className="font-offbit tracking-normal text-sm text-foreground">SCROLL</span> to adjust
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