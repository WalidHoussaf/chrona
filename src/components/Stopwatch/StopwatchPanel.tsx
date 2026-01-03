"use client";

import { ScrollArea } from "@/components/UI/ScrollArea";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs } from "@/lib/time";
import clsx from "clsx";
import { Play, Pause, Flag, RotateCcw, Timer as TimerIcon, Zap } from "lucide-react";

export function StopwatchPanel() {
  const timers = useTimerStore((s) => s.timers);
  const activeId = useTimerStore((s) => s.activeId);
  const setActive = useTimerStore((s) => s.setActive);

  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);
  const lapActive = useTimerStore((s) => s.lapActive);

  const stopwatch = timers.find((t) => t.kind === "stopwatch") ?? null;
  const runtime = useTimerStore((s) => (stopwatch ? s.runtimeById[stopwatch.id] : undefined));

  if (!stopwatch) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <TimerIcon className="h-12 w-12 text-muted/20" strokeWidth={1} />
           <span className="font-offbit text-xs uppercase tracking-widest text-muted">
             System Initializing...
           </span>
        </div>
      </div>
    );
  }

  const display = runtime?.displayMs ?? 0;
  const running = stopwatch.runningSinceUnixMs != null;
  const isActive = activeId === stopwatch.id;

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute -right-20 -top-20 opacity-[0.02] pointer-events-none select-none">
        <TimerIcon size={400} strokeWidth={0.5} />
      </div>

      {/* --- HEADER --- */}
      <header className="flex shrink-0 items-end justify-between border-b border-border/50 px-8 py-6 backdrop-blur-sm z-10">
        <div>
          <h1 className="font-harmond text-4xl font-medium tracking-tight text-foreground">
            Stopwatch
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <div className={clsx(
               "h-1.5 w-1.5 rounded-full transition-colors",
               running ? "bg-accent shadow-[0_0_5px_#CCFF00]" : "bg-muted"
             )} />
             <p className="font-offbit text-[10px] uppercase tracking-widest text-muted">
               Precision Mode
             </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="hidden md:block">
           <div className="rounded border border-border bg-card/50 px-3 py-1 font-offbit text-xs text-muted">
             ID: {stopwatch.id.slice(0, 8).toUpperCase()}
           </div>
        </div>
      </header>

      {/* --- MAIN DISPLAY --- */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-8 py-8 z-10">
        <div
          className={clsx(
            "group relative flex w-full max-w-2xl flex-col items-center justify-center rounded-4xl border py-20 transition-all duration-500",
            isActive 
              ? "border-accent/30 bg-card shadow-[0_0_60px_-20px_rgba(204,255,0,0.1)]" 
              : "border-border bg-card/30 opacity-80 hover:opacity-100 hover:border-white/10"
          )}
          onMouseDown={() => setActive(stopwatch.id)}
        >
          {/* Active Label */}
          <div className={clsx(
            "absolute top-6 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 transition-all duration-300",
            isActive ? "border-accent/20 bg-accent/10 text-accent" : "border-transparent text-muted/20"
          )}>
            <span className="font-offbit text-[9px] uppercase tracking-[0.3em] font-bold">
              {isActive ? "System Active" : "Standby"}
            </span>
          </div>

          {/* Digital Display */}
          <div className="relative">
             <div className={clsx(
               "font-offbit text-8xl sm:text-9xl font-bold tracking-tighter tabular-nums transition-all duration-300 selection:bg-accent selection:text-background",
               running ? "text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "text-muted"
             )}>
               {formatDurationMs(display)}
             </div>
             
             {/* Decor lines */}
             <div className="absolute -bottom-4 left-0 w-4 h-px bg-accent/50" />
             <div className="absolute -bottom-4 right-0 w-4 h-px bg-accent/50" />
          </div>
        </div>

        {/* Control Bar */}
        <div className="mt-8 flex items-center gap-4">
          <ControlButton 
            onClick={() => {
              setActive(stopwatch.id);
              startPauseActive();
            }}
            active={running}
            icon={running ? Pause : Play}
            label={running ? "Pause" : "Start"}
            variant="primary"
          />

          <ControlButton 
            onClick={() => {
              setActive(stopwatch.id);
              lapActive();
            }}
            icon={Flag}
            label="Lap"
            variant="secondary"
            disabled={!running && display === 0}
          />

          <ControlButton 
            onClick={() => {
              setActive(stopwatch.id);
              resetActive();
            }}
            icon={RotateCcw}
            label="Reset"
            variant="danger"
            disabled={display === 0}
          />
        </div>
      </main>

      {/* --- LAPS PANEL --- */}
      <div className="h-64 shrink-0 border-t border-border/50 bg-card/30 backdrop-blur-sm z-20 flex flex-col">
         <div className="flex items-center justify-between px-8 py-3 border-b border-border/30">
            <span className="font-offbit text-[10px] uppercase tracking-widest text-muted">
              Data Log
            </span>
            <span className="font-offbit text-[10px] text-muted/50">
              {stopwatch.laps?.length || 0} Records
            </span>
         </div>
         
         <ScrollArea className="flex-1">
           <div className="px-8 py-4 space-y-0.5">
             {stopwatch.laps && stopwatch.laps.length > 0 ? (
                [...stopwatch.laps].map((lap, idx, arr) => {
                  const reverseIdx = arr.length - idx; // 1-based index 
                  return (
                   <div
                     key={lap.id}
                     className="group flex items-center justify-between rounded px-4 py-2 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                   >
                     <div className="flex items-center gap-6">
                       <span className="font-offbit text-xs font-bold text-muted/30 w-8 group-hover:text-accent/70 transition-colors">
                         {String(reverseIdx).padStart(2, '0')}
                       </span>
                       <span className="font-offbit text-lg tabular-nums text-foreground/80 group-hover:text-foreground">
                         {formatDurationMs(lap.elapsedMs)}
                       </span>
                     </div>
                     
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap size={10} className="text-accent" />
                     </div>
                   </div>
                  );
                })
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-muted/30">
                 <Flag size={24} strokeWidth={1} className="mb-2 opacity-50" />
                 <span className="font-offbit text-[10px] uppercase tracking-widest">No Data Recorded</span>
               </div>
             )}
           </div>
         </ScrollArea>
      </div>
    </div>
  );
}

// --- Helper Components ---

function ControlButton({
  onClick,
  icon: Icon,
  label,
  variant = "primary",
  active = false,
  disabled = false
}: {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={clsx(
        "group relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-offbit text-xs uppercase font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
        
        // Primary (Start/Pause)
        variant === "primary" && (
           active 
             ? "bg-transparent border border-accent text-accent hover:bg-accent hover:text-black shadow-[0_0_20px_-5px_rgba(204,255,0,0.3)]"
             : "bg-accent text-black border border-accent hover:bg-[#b3ff00] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)]"
        ),

        // Secondary (Lap)
        variant === "secondary" && "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20",

        // Danger (Reset)
        variant === "danger" && "bg-transparent border border-transparent text-muted hover:text-red-400 hover:bg-red-950/30"
      )}
    >
      <Icon size={18} strokeWidth={2.5} className={clsx("transition-transform", active && "animate-pulse")} />
      <span>{label}</span>
    </button>
  );
}