"use client";

import { useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/UI/ScrollArea";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs } from "@/lib/time";
import clsx from "clsx";
import { Play, Pause, Flag, RotateCcw, Zap, History } from "lucide-react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import ElectricBorder from "@/components/UI/ElectricBorder";

/**
 * The "Swiss Blueprint" Mechanism
 */
function BackgroundMechanism({ running }: { running: boolean }) {
  const smoothEase = "linear" as Easing;

  const speedSlow = { repeat: Infinity, ease: smoothEase, duration: 120 };
  const speedMed = { repeat: Infinity, ease: smoothEase, duration: running ? 40 : 80 };
  const speedFast = { repeat: Infinity, ease: smoothEase, duration: running ? 10 : 30 };
  const speedSecondHand = { repeat: Infinity, ease: smoothEase, duration: 60 };
  const speedMinuteHand = { repeat: Infinity, ease: smoothEase, duration: 300 };

  const centerPivot = {
    transformOrigin: "300px 300px",
    transformBox: "view-box" as const
  };

  return (
    <>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />
      <div
        className={clsx(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-accent/10 blur-[140px] rounded-full pointer-events-none transition-opacity duration-1000",
          running ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="absolute -right-[10%] -top-[10%] w-[800px] h-[800px] pointer-events-none select-none z-0 opacity-20">
        <svg viewBox="0 0 600 600" className="w-full h-full text-foreground fill-none stroke-current">
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle cx="300" cy="300" r="290" strokeWidth="0.2" className="opacity-20" />
          <circle cx="300" cy="300" r="200" strokeWidth="0.2" className="opacity-10" />

          <motion.g initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={speedSlow} style={centerPivot}>
            {Array.from({ length: 60 }).map((_, i) => (
              <line
                key={i}
                x1="300"
                y1="50"
                x2="300"
                y2={i % 5 === 0 ? "70" : "60"}
                strokeWidth={i % 5 === 0 ? 1 : 0.5}
                className={i % 5 === 0 ? "opacity-40" : "opacity-20"}
                transform={`rotate(${i * 6} 300 300)`}
              />
            ))}
          </motion.g>

          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: running ? 360 : 0 }}
            transition={running ? speedFast : { duration: 0 }}
            style={centerPivot}
          >
            <circle
              cx="300"
              cy="300"
              r="250"
              stroke="url(#spinner-gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="400 1000"
              className={clsx(
                "transition-all duration-1000",
                running ? "text-accent opacity-80" : "text-muted opacity-10"
              )}
            />
          </motion.g>

          <motion.g initial={{ rotate: 360 }} animate={{ rotate: 0 }} transition={speedMed} style={centerPivot}>
            <circle cx="300" cy="300" r="140" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-30" />
            <path d="M 300 155 L 295 165 L 305 165 Z" fill="currentColor" className="opacity-20" />
            <path d="M 300 445 L 295 435 L 305 435 Z" fill="currentColor" className="opacity-20" />
          </motion.g>

          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={speedSlow}
            style={centerPivot}
            className="font-offbit text-[10px] uppercase tracking-[0.3em] fill-current stroke-none opacity-40"
          >
            <text x="300" y="130" textAnchor="middle">
              00
            </text>
            <text x="300" y="130" textAnchor="middle" transform="rotate(90 300 300)">
              15
            </text>
            <text x="300" y="130" textAnchor="middle" transform="rotate(180 300 300)">
              30
            </text>
            <text x="300" y="130" textAnchor="middle" transform="rotate(270 300 300)">
              45
            </text>
          </motion.g>

          <g className="opacity-30">
            <circle cx="300" cy="300" r="10" strokeWidth="1" />
            <motion.rect
              x="295"
              y="295"
              width="10"
              height="10"
              strokeWidth="0.5"
              initial={{ rotate: 0, scale: 0.8 }}
              animate={{ rotate: 45, scale: running ? 1.2 : 0.8 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              style={centerPivot}
            />
            <line x1="100" y1="300" x2="500" y2="300" strokeWidth="0.2" />
            <line x1="300" y1="100" x2="300" y2="500" strokeWidth="0.2" />
          </g>

          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: running ? 360 : 0 }}
            transition={running ? speedMinuteHand : { duration: 0 }}
            style={centerPivot}
          >
            <rect x="0" y="0" width="600" height="600" fill="none" stroke="none" />
            <line
              x1="300"
              y1="300"
              x2="300"
              y2="130"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={clsx(
                "transition-colors duration-300 opacity-60",
                running ? "text-accent stroke-accent" : "text-foreground"
              )}
            />
            <line x1="300" y1="300" x2="300" y2="320" strokeWidth="2.5" className="opacity-30" />
          </motion.g>

          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: running ? 360 : 0 }}
            transition={running ? speedSecondHand : { duration: 0 }}
            style={centerPivot}
          >
            <rect x="0" y="0" width="600" height="600" fill="none" stroke="none" />
            <line
              x1="300"
              y1="300"
              x2="300"
              y2="50"
              strokeWidth="1.5"
              strokeLinecap="round"
              className={clsx("transition-colors duration-300", running ? "text-accent stroke-accent" : "text-foreground")}
            />
            <line x1="300" y1="300" x2="300" y2="340" strokeWidth="2" className="opacity-50" />
            <circle
              cx="300"
              cy="50"
              r="3"
              className={clsx("fill-current transition-colors duration-300", running ? "text-accent" : "text-foreground")}
            />
          </motion.g>

          <circle cx="300" cy="300" r="4" fill="var(--background)" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}

export function StopwatchPanel() {
  const stopwatch = useTimerStore((s) => s.timers.find((t) => t.kind === "stopwatch"));
  const runtime = useTimerStore((s) => (stopwatch ? s.runtimeById[stopwatch.id] : undefined));

  const newTimer = useTimerStore((s) => s.newTimer);
  const startPauseById = useTimerStore((s) => s.startPauseById);
  const resetById = useTimerStore((s) => s.resetById);
  const lapById = useTimerStore((s) => s.lapById);

  const display = runtime?.displayMs ?? 0;
  const running = runtime?.status === "running";

  const ensureStopwatchId = () => {
    if (stopwatch) return stopwatch.id;
    return newTimer("stopwatch");
  };

  const laps = useMemo(() => {
    if (!stopwatch) return [];
    return stopwatch.laps ?? [];
  }, [stopwatch]);

  const hasLaps = laps.length > 0;

  const scrollViewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasLaps) return;
    scrollViewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [hasLaps, laps.length]);

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      <BackgroundMechanism running={running} />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex shrink-0 items-end justify-between px-8 py-8 pt-10 z-10"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-accent mb-1">
            <div
              className={clsx(
                "h-2 w-2 rounded-full transition-all duration-500 mt-[-3px]",
                running ? "bg-accent shadow-[0_0_10px_#CCFF00] animate-pulse" : "bg-muted/30"
              )}
            />
            <span className="font-offbit text-md uppercase tracking-[0.2em] font-light">
              {running ? "Chronometer Active" : "Standby Mode"}
            </span>
          </div>

          <h1 className="font-galgo text-6xl tracking-wider text-foreground leading-[0.85]">Stopwatch</h1>
          <p className="font-offbit text-md text-muted max-w-sm leading-relaxed opacity-80">
            Precision timing with lap recording.
          </p>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-8 z-10 relative">
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <div
              className={clsx(
                "absolute inset-0 bg-accent/10 blur-xl transition-opacity duration-300",
                running ? "opacity-30" : "opacity-0"
              )}
            />

            <span
              className={clsx(
                "relative z-10 font-offbit text-[12vw] md:text-[9rem] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-300 select-none",
                running ? "text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-muted"
              )}
            >
              {formatDurationMs(display)}
            </span>
          </div>

          <motion.div
            initial={false}
            animate={{ y: hasLaps ? -24 : 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            className="flex items-center gap-8 mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!stopwatch) return;
                resetById(stopwatch.id);
              }}
              disabled={display === 0}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 text-muted transition-colors hover:border-red-500/50 hover:text-red-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw size={20} strokeWidth={1.5} />
            </motion.button>

            {running ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!stopwatch) return;
                  startPauseById(stopwatch.id);
                }}
                className="flex h-24 w-24 items-center justify-center rounded-4xl border-2 transition-all duration-300 cursor-pointer border-accent bg-accent text-background shadow-[0_0_40px_-10px_rgba(204,255,0,0.6)]"
              >
                <Pause size={32} fill="currentColor" className="opacity-90" />
              </motion.button>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <ElectricBorder
                  mode="rect"
                  color={`var(--accent)`}
                  speed={0.4}
                  chaos={0.16}
                  svgDisplacement={6}
                  thickness={1}
                  fuzziness={0.4}
                  glow={1}
                  borderRadius={32}
                  showOutline={false}
                  className="inline-block"
                >
                  <button
                    type="button"
                    onClick={() => startPauseById(ensureStopwatchId())}
                    className="flex h-24 w-24 items-center justify-center rounded-4xl border-2 transition-all duration-300 shadow-xl cursor-pointer border-border bg-card text-foreground hover:text-accent"
                  >
                    <Play size={32} fill="currentColor" className="ml-1 opacity-90" />
                  </button>
                </ElectricBorder>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!stopwatch) return;
                lapById(stopwatch.id);
              }}
              disabled={!running && display === 0}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 text-muted transition-colors hover:border-accent/50 hover:text-accent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Flag size={20} strokeWidth={1.5} />
            </motion.button>
          </motion.div>
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
                {laps.length} Entries
              </span>
            </div>

            <ScrollArea className="flex-1" ref={scrollViewportRef}>
              <div className="flex flex-col p-2 space-y-1">
                <div className="grid grid-cols-3 px-6 py-2 text-xs uppercase font-bold text-muted/40 font-offbit tracking-widest">
                  <span>Index</span>
                  <span className="text-center">Split Status</span>
                  <span className="text-right">Recorded Time</span>
                </div>

                {laps.map((lap, idx) => {
                  const realIndex = laps.length - idx;
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={lap.id}
                      className="group grid grid-cols-3 items-center px-6 py-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-offbit text-md text-muted/40 group-hover:text-accent transition-colors">
                          #{String(realIndex).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="flex justify-center">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Zap size={14} className="text-accent mb-1" />
                          <span className="text-sm uppercase text-accent font-offbit">Recorded</span>
                        </div>
                      </div>

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