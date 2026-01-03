"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import clsx from "clsx";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, parseHmsToMs } from "@/lib/time";
import type { PomodoroConfig } from "@/lib/timerProtocol";

// --- Styled Components ---

const SettingsInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
}) => (
  <div className="group flex flex-col gap-2">
    <label className="font-offbit text-xs uppercase tracking-widest text-muted transition-colors group-hover:text-foreground">
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        className="w-full bg-transparent border-b border-border py-2 font-offbit text-xl text-foreground placeholder-muted/30 focus:border-accent focus:outline-none transition-all"
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-[10px] text-muted">MM:SS</span>
      </div>
    </div>
  </div>
);

function parseTimeString(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseHmsToMs(0, parseInt(parts[0]) || 0, parseInt(parts[1]) || 0);
  } else if (parts.length === 3) {
    return parseHmsToMs(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0, parseInt(parts[2]) || 0);
  }
  return 0;
}

export function PomodoroPanel() {
  const activeId = useTimerStore((s) => s.activeId);
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === activeId));
  const runtime = useTimerStore((s) => (activeId ? s.runtimeById[activeId] : undefined));

  const setView = useTimerStore((s) => s.setView);
  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);
  const enablePomodoro = useTimerStore((s) => s.enablePomodoro);
  const disablePomodoro = useTimerStore((s) => s.disablePomodoro);
  const updatePomodoroConfig = useTimerStore((s) => s.updatePomodoroConfig);

  const [focusLock, setFocusLock] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";
  const pomodoroConfig = timer?.pomodoroConfig;
  
  // Default configuration used when initializing
  const config = useMemo(() => ({
    workDurationMs: pomodoroConfig?.workDurationMs || 25 * 60 * 1000,
    shortBreakDurationMs: pomodoroConfig?.shortBreakDurationMs || 5 * 60 * 1000,
    longBreakDurationMs: pomodoroConfig?.longBreakDurationMs || 15 * 60 * 1000,
    longBreakInterval: pomodoroConfig?.longBreakInterval || 4,
    autoStartBreaks: pomodoroConfig?.autoStartBreaks || false,
    autoStartWork: pomodoroConfig?.autoStartWork || false,
  }), [pomodoroConfig]);

  // Click outside to close settings
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusLock) setFocusLock(false);
        else if (showSettings) setShowSettings(false);
        else setView("timers");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setView, focusLock, showSettings]);

  // Focus lock effect
  useEffect(() => {
    if (focusLock) {
      document.body.style.overflow = "hidden";
      const preventContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener("contextmenu", preventContextMenu);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("contextmenu", preventContextMenu);
      };
    }
  }, [focusLock]);

  // --- Handlers ---

  const handleEnablePomodoro = () => {
    if (!timer) return;
    enablePomodoro(timer.id, config);
    setShowSettings(false);
  };

  const handleConfigUpdate = (updates: Partial<PomodoroConfig>) => {
    if (timer && pomodoroConfig) {
      updatePomodoroConfig(timer.id, updates);
    }
  };

  const getPhaseStyles = (phase?: string) => {
    switch (phase) {
      case "work":
        return { color: "text-accent", border: "border-accent", bg: "bg-accent/10", label: "Work Phase" };
      case "shortBreak":
        return { color: "text-blue-400", border: "border-blue-400", bg: "bg-blue-400/10", label: "Decompress" };
      case "longBreak":
        return { color: "text-purple-400", border: "border-purple-400", bg: "bg-purple-400/10", label: "Deep Rest" };
      default:
        return { color: "text-foreground", border: "border-foreground", bg: "bg-foreground/5", label: "Focus" };
    }
  };

  const currentStyles = getPhaseStyles(pomodoroConfig?.currentPhase);

  if (!timer) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-end justify-between border-b border-border/60 px-8 py-6">
           <h1 className="font-harmond text-4xl text-foreground">Focus</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="font-harmond text-2xl text-muted">No Active Context</span>
            <ActionButton onClick={() => setView("timers")} variant="primary">
              Select Timer
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      
      {/* --- FOCUS LOCK OVERLAY --- */}
      <div 
        className={clsx(
          "fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-700",
          focusLock ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center gap-12">
           <div className={clsx(
             "relative flex items-center justify-center rounded-full p-24 border-2 animate-pulse",
             currentStyles.border,
             currentStyles.bg
           )}>
             <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-current text-inherit" />
             <span className="font-offbit text-[12rem] leading-none tracking-tighter tabular-nums text-foreground">
                {formatDurationMs(display)}
             </span>
           </div>
           
           <div className="flex flex-col items-center gap-2">
             <span className={clsx("font-offbit text-xl uppercase tracking-[0.5em]", currentStyles.color)}>
               {currentStyles.label}
             </span>
             <span className="font-harmond text-muted text-sm italic">
               Press ESC to break focus
             </span>
           </div>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="flex items-end justify-between border-b border-border/60 bg-background/50 px-8 py-6 backdrop-blur-sm z-20">
        <div>
          <h1 className="font-harmond text-4xl font-medium tracking-tight text-foreground">
            Focus
          </h1>
          <p className="font-offbit text-xs uppercase tracking-widest text-muted">
            {timer.label}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {pomodoroConfig && (
             <button
               type="button"
               onClick={() => setFocusLock(true)}
               className="group flex items-center gap-2 font-offbit text-xs uppercase tracking-wider text-muted hover:text-accent transition-colors"
             >
               <span className="h-2 w-2 rounded-full bg-border group-hover:bg-accent transition-colors" />
               Enter Lock
             </button>
          )}
          
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                "p-2 rounded-full border transition-all duration-300",
                showSettings ? "border-accent text-accent bg-accent/10" : "border-transparent text-muted hover:text-foreground"
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* --- SETTINGS DROPDOWN --- */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-4 w-80 rounded-xl border border-border bg-background/90 p-6 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-harmond text-lg text-foreground">Configuration</h3>
                </div>
                
                {!pomodoroConfig ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted">Initialize standard Pomodoro protocol for this timer.</p>
                    <ActionButton onClick={handleEnablePomodoro} variant="primary" fullWidth>
                      Initialize
                    </ActionButton>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <SettingsInput 
                        label="Work Interval" 
                        placeholder="25:00"
                        value={formatDurationMs(config.workDurationMs)}
                        onChange={(v) => handleConfigUpdate({ workDurationMs: parseTimeString(v) })}
                      />
                      <SettingsInput 
                        label="Short Break" 
                        placeholder="05:00"
                        value={formatDurationMs(config.shortBreakDurationMs)}
                        onChange={(v) => handleConfigUpdate({ shortBreakDurationMs: parseTimeString(v) })}
                      />
                      <SettingsInput 
                        label="Long Break" 
                        placeholder="15:00"
                        value={formatDurationMs(config.longBreakDurationMs)}
                        onChange={(v) => handleConfigUpdate({ longBreakDurationMs: parseTimeString(v) })}
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-border/50">
                       <label className="flex cursor-pointer items-center justify-between">
                        <span className="font-offbit text-xs uppercase tracking-wider text-muted">Auto-start Breaks</span>
                        <input 
                          type="checkbox" 
                          checked={config.autoStartBreaks}
                          onChange={(e) => handleConfigUpdate({ autoStartBreaks: e.target.checked })}
                          className="accent-accent h-4 w-4 rounded border-gray-300" 
                        />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between">
                        <span className="font-offbit text-xs uppercase tracking-wider text-muted">Auto-start Work</span>
                        <input 
                          type="checkbox" 
                          checked={config.autoStartWork}
                          onChange={(e) => handleConfigUpdate({ autoStartWork: e.target.checked })}
                          className="accent-accent h-4 w-4 rounded border-gray-300" 
                        />
                      </label>
                    </div>

                    <div className="pt-4">
                      <ActionButton onClick={() => { disablePomodoro(timer.id); setShowSettings(false); }} variant="ghost" fullWidth>
                        Disable Protocol
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <ActionButton onClick={() => setView("timers")} variant="ghost">
            Exit
          </ActionButton>
        </div>
      </header>

      {/* --- MAIN DISPLAY --- */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Main Card */}
          <div className={clsx(
            "relative flex flex-col items-center justify-center rounded-3xl border transition-all duration-700 p-12 md:p-20",
            status === "running" ? "bg-card shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)]" : "bg-card/50",
            pomodoroConfig ? currentStyles.border : "border-border",
            status === "running" && pomodoroConfig ? `shadow-[0_0_30px_-10px_${getPhaseShadowColor(pomodoroConfig.currentPhase)}]` : ""
          )}>
            
            {/* Phase Badge */}
            {pomodoroConfig && (
              <div className={clsx(
                "absolute top-8 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1 backdrop-blur-md",
                currentStyles.border,
                currentStyles.bg
              )}>
                <span className={clsx("font-offbit text-xs uppercase tracking-[0.2em]", currentStyles.color)}>
                  {currentStyles.label} • Cycle {pomodoroConfig.currentCycle}
                </span>
              </div>
            )}

            {/* Timer Digits */}
            <div className={clsx(
              "font-offbit text-8xl md:text-9xl tabular-nums tracking-tighter transition-colors duration-500",
              pomodoroConfig && status === "running" ? currentStyles.color : "text-foreground"
            )}>
              {formatDurationMs(display)}
            </div>

            {/* Controls */}
            <div className="mt-12 flex items-center gap-6">
               <RoundButton 
                  onClick={startPauseActive}
                  isActive={status === "running"}
                  variant={pomodoroConfig ? pomodoroConfig.currentPhase : "default"}
               >
                 {status === "running" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                 ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                 )}
               </RoundButton>

               <button 
                onClick={resetActive}
                className="font-offbit text-xs uppercase tracking-widest text-muted hover:text-foreground transition-colors"
               >
                 Reset
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Sub-Components ---

function ActionButton({
  children,
  onClick,
  variant = "primary",
  fullWidth = false
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}) {
  const variants = {
    primary: "border-border text-foreground hover:border-accent hover:text-accent bg-background",
    secondary: "border-transparent bg-white/5 text-foreground hover:bg-white/10 hover:text-accent",
    ghost: "border-transparent text-muted hover:text-red-400 hover:bg-transparent",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-full border px-6 py-2 transition-all duration-300 ease-out",
        "font-offbit text-xs font-medium uppercase tracking-wider",
        variants[variant],
        fullWidth ? "w-full" : ""
      )}
    >
      {children}
    </button>
  );
}

function RoundButton({ onClick, isActive, children, variant }: { onClick: () => void, isActive: boolean, children: React.ReactNode, variant: "work" | "shortBreak" | "longBreak" | "default" }) {
  const colors = {
    work: "hover:border-accent hover:text-accent",
    shortBreak: "hover:border-blue-400 hover:text-blue-400",
    longBreak: "hover:border-purple-400 hover:text-purple-400",
    default: "hover:border-accent hover:text-accent"
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300",
        isActive ? "border-foreground text-foreground" : "border-border text-muted",
        colors[variant] || colors.default
      )}
    >
      {children}
    </button>
  );
}

function getPhaseShadowColor(phase: string) {
    if (phase === 'work') return 'rgba(204,255,0,0.15)'; // Accent
    if (phase === 'shortBreak') return 'rgba(96,165,250,0.15)'; // Blue
    if (phase === 'longBreak') return 'rgba(192,132,252,0.15)'; // Purple
    return 'transparent';
}