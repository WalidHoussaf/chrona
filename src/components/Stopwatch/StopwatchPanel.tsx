"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/UI/ScrollArea";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs } from "@/lib/time";
import clsx from "clsx";
import { Play, Pause, Flag, RotateCcw, Timer as TimerIcon, Zap, History, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StopwatchPanel() {
  const timers = useTimerStore((s) => s.timers);

  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);
  const lapActive = useTimerStore((s) => s.lapActive);

  const stopwatch = timers.find((t) => t.kind === "stopwatch") ?? null;
  const runtime = useTimerStore((s) => (stopwatch ? s.runtimeById[stopwatch.id] : undefined));

  // Auto-scroll to top of logs when a lap is added
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stopwatch?.laps && scrollViewportRef.current) {
      // Scroll to top to show newest lap
      scrollViewportRef.current.scrollTop = 0;
    }
  }, [stopwatch?.laps, stopwatch?.laps?.length]); // Trigger on lap count change

  if (!stopwatch) {
    return (
      <div className="flex h-full items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
        <div className="flex flex-col items-center gap-6 animate-pulse opacity-50">
           <div className="p-6 rounded-full border border-dashed border-muted">
             <TimerIcon className="h-8 w-8 text-muted" strokeWidth={1} />
           </div>
           <span className="font-offbit text-xs uppercase tracking-[0.2em] text-muted">
             Module Offline
           </span>
        </div>
      </div>
    );
  }

  const display = runtime?.displayMs ?? 0;
  const running = stopwatch.runningSinceUnixMs != null;
  const hasLaps = stopwatch.laps && stopwatch.laps.length > 0;

  return (
    <div 
        className="flex h-full flex-col bg-background relative overflow-hidden"
    >
      
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />
      
      {/* Dynamic Glow when running */}
      <div className={clsx(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-accent/0.1 blur-[20px] rounded-full pointer-events-none transition-opacity duration-1000",
          running ? "opacity-5" : "opacity-0"
      )} />

      {/* Decorative Icon */}
      <div className="absolute -right-12 -top-4 text-foreground/5 pointer-events-none select-none z-0">
        <Timer size={300} strokeWidth={0.5} />
      </div>

      {/* --- HEADER --- */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex shrink-0 items-end justify-between px-8 py-8 pt-10 z-10"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-accent mb-1">
             <div className={clsx(
                "h-2 w-2 rounded-full transition-all duration-500 mt-[-3px]",
                running ? "bg-accent shadow-[0_0_10px_#CCFF00] animate-pulse" : "bg-muted/30"
             )} />
             <span className="font-offbit text-md uppercase tracking-[0.2em] font-light">
                {running ? "Chronometer Active" : "Standby Mode"}
             </span>
          </div>
          <h1 className="font-galgo text-6xl tracking-wider text-foreground leading-[0.85]">
            Stopwatch
          </h1>
          <p className="font-offbit text-md text-muted max-w-sm leading-relaxed opacity-80">
            Precision timing with lap recording.
          </p>
        </div>
      </motion.header>

      {/* --- MAIN DISPLAY --- */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-8 z-10 relative">
        
        {/* Time Card */}
        <div className="relative flex flex-col items-center">
             {/* The Numbers */}
             <div className="relative">
                 {/* Glow effect behind numbers */}
                 <div className={clsx(
                     "absolute inset-0 bg-accent/10 blur-xl transition-opacity duration-300",
                     running ? "opacity-30" : "opacity-0"
                 )} />
                 
                 <span className={clsx(
                    "relative z-10 font-offbit text-[12vw] md:text-[9rem] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-300 select-none",
                    running ? "text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-muted"
                 )}>
                   {formatDurationMs(display)}
                 </span>
             </div>

             {/* Controls */}
             <div className="flex items-center gap-8 mt-16">
                
                {/* Reset (Left) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => resetActive()}
                  disabled={display === 0}
                  className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 text-muted transition-colors hover:border-red-500/50 hover:text-red-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={20} strokeWidth={1.5} />
                </motion.button>

                {/* Play/Pause (Center - Large) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startPauseActive()}
                  className={clsx(
                     "flex h-24 w-24 items-center justify-center rounded-4xl border-2 transition-all duration-300 shadow-xl cursor-pointer",
                     running 
                       ? "border-accent bg-accent text-background shadow-[0_0_40px_-10px_rgba(204,255,0,0.6)]" 
                       : "border-border bg-card text-foreground hover:border-accent hover:text-accent"
                  )}
                >
                   {running ? (
                      <Pause size={32} fill="currentColor" className="opacity-90" />
                   ) : (
                      <Play size={32} fill="currentColor" className="ml-1 opacity-90" />
                   )}
                </motion.button>

                {/* Lap (Right) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => lapActive()}
                  disabled={!running && display === 0}
                  className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 text-muted transition-colors hover:border-accent/50 hover:text-accent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Flag size={20} strokeWidth={1.5} />
                </motion.button>

             </div>
        </div>
      </main>

      {/* --- DATA LOG / LAPS --- */}
      <AnimatePresence>
      {hasLaps && (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="h-64 shrink-0 border-t border-border/40 bg-card/40 backdrop-blur-md z-20 flex flex-col"
        >
           <div className="flex items-center justify-between px-8 py-4 border-b border-border/30 bg-muted/5">
              <div className="flex items-center gap-2 text-muted">
                 <History size={22} />
                 <span className="font-galgo text-3xl tracking-wider pt-1">Session Data Log</span>
              </div>
              <span className="font-offbit text-sm text-muted/60 uppercase tracking-widest border border-border/50 px-2 py-0.5 rounded">
                {stopwatch.laps?.length || 0} Entries
              </span>
           </div>
           
           <ScrollArea className="flex-1" ref={scrollViewportRef}>
             <div className="flex flex-col p-2 space-y-1">
                {/* Header Row */}
                <div className="grid grid-cols-3 px-6 py-2 text-xs uppercase font-bold text-muted/40 font-offbit tracking-widest">
                    <span>Index</span>
                    <span className="text-center">Split Status</span>
                    <span className="text-right">Recorded Time</span>
                </div>

                {/* Rows */}
                {stopwatch.laps && stopwatch.laps.map((lap, idx, laps) => {
                  const realIndex = laps.length - idx;
                  return (
                   <motion.div
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     key={lap.id}
                     className="group grid grid-cols-3 items-center px-6 py-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-default"
                   >
                     {/* Index */}
                     <div className="flex items-center gap-3">
                       <span className="font-offbit text-md text-muted/40 group-hover:text-accent transition-colors">
                         #{String(realIndex).padStart(2, '0')}
                       </span>
                     </div>

                     {/* Status Indicator */}
                     <div className="flex justify-center">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap size={14} className="text-accent mb-1" />
                            <span className="text-sm uppercase text-accent font-offbit">Recorded</span>
                        </div>
                     </div>

                     {/* Time */}
                     <div className="text-right">
                       <span className="font-offbit text-2xl tabular-nums text-foreground/70 group-hover:text-foreground tracking-tight">
                         {formatDurationMs(lap.elapsedMs)}
                       </span>
                     </div>
                   </motion.div>
                  );
                })}
             </div>
           </ScrollArea>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}