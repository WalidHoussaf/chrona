"use client";

import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import { Settings, Lock, LockOpen, Play, Pause, RotateCcw, ArrowLeft, Power, Zap, X, Clock, Repeat, CheckCircle2 } from "lucide-react";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, parseHmsToMs } from "@/lib/time";
import type { PomodoroConfig } from "@/lib/timerProtocol";
import { motion, AnimatePresence } from "framer-motion";

// --- Styled Sub-Components ---

const SettingsInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  icon: Icon
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
  icon?: React.ComponentType<{ size?: number }>;
}) => (
  <div className="group relative flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/2 p-4 transition-all hover:bg-white/4 hover:border-white/10">
    <div className="flex items-center gap-2 text-muted/50 group-hover:text-accent transition-colors">
        {Icon && <Icon size={12} />}
        <label className="font-offbit text-sm uppercase tracking-widest">
        {label}
        </label>
    </div>
    <div className="relative">
      <input
        type="text"
        className="w-full bg-transparent p-0 font-offbit text-4xl text-foreground placeholder-muted/10 focus:outline-none focus:text-accent transition-colors"
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full opacity-50" />
    </div>
  </div>
);

function ActionButton({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  icon
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "active" | "ghost" | "danger";
  fullWidth?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative flex items-center justify-center gap-3 overflow-hidden rounded-full border px-6 py-3 transition-all duration-300 cursor-pointer",
        "font-offbit text-xs font-bold uppercase tracking-wider",
        variant === "primary" && "border-accent/30 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent hover:shadow-[0_0_20px_-5px_rgba(204,255,0,0.2)]",
        variant === "secondary" && "border-border/50 bg-transparent text-muted hover:text-foreground hover:border-foreground/50 hover:bg-white/5",
        variant === "active" && "border-accent text-accent bg-accent/10",
        variant === "danger" && "border-red-500/20 bg-red-500/5 text-red-500/60 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10",
        fullWidth ? "w-full" : ""
      )}
    >
      {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

const ModernToggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <div 
        onClick={() => onChange(!checked)}
        className={clsx(
            "flex cursor-pointer items-center justify-between group p-4 rounded-xl border transition-all duration-300 select-none",
            checked ? "bg-accent/5 border-accent/20" : "bg-white/2 border-white/5 hover:border-white/10"
        )}
    >
      <span className={clsx(
          "font-offbit text-sm uppercase tracking-wider transition-colors",
          checked ? "text-accent" : "text-muted group-hover:text-foreground"
      )}>{label}</span>
      
      <div className="relative h-5 w-9">
         {/* Track */}
         <div className={clsx(
            "absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 rounded-full transition-colors",
            checked ? "bg-accent/30" : "bg-white/10"
         )} />
         {/* Thumb */}
         <motion.div 
            initial={false}
            animate={{ x: checked ? 18 : 0 }}
            className={clsx(
                "absolute top-1/2 left-0 -mt-[5px] h-2.5 w-2.5 rounded-full shadow-lg transition-colors border",
                checked ? "bg-accent border-accent shadow-[0_0_10px_rgba(204,255,0,0.5)]" : "bg-muted border-transparent"
            )}
         />
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

// --- Main Component ---

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
  
  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";
  const pomodoroConfig = timer?.pomodoroConfig;
  
  const config = useMemo(() => ({
    workDurationMs: pomodoroConfig?.workDurationMs || 25 * 60 * 1000,
    shortBreakDurationMs: pomodoroConfig?.shortBreakDurationMs || 5 * 60 * 1000,
    longBreakDurationMs: pomodoroConfig?.longBreakDurationMs || 15 * 60 * 1000,
    longBreakInterval: pomodoroConfig?.longBreakInterval || 4,
    autoStartBreaks: pomodoroConfig?.autoStartBreaks || false,
    autoStartWork: pomodoroConfig?.autoStartWork || false,
  }), [pomodoroConfig]);


  // Keyboard shortcuts
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusLock) {
          // UNLOCK ONLY
          setFocusLock(false);
          return; 
        } else if (showSettings) {
          // CLOSE SETTINGS ONLY
          setShowSettings(false);
          return;
        } else {
          // GO BACK TO DASHBOARD
          setView("timers");
        }
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

  // --- Helpers ---

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
        return { color: "text-accent", border: "border-accent", bg: "bg-accent/10", shadow: "shadow-[0_0_40px_-10px_rgba(204,255,0,0.3)]", label: "Work Phase" };
      case "shortBreak":
        return { color: "text-cyan-400", border: "border-cyan-400", bg: "bg-cyan-400/10", shadow: "shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)]", label: "Decompress" };
      case "longBreak":
        return { color: "text-purple-400", border: "border-purple-400", bg: "bg-purple-400/10", shadow: "shadow-[0_0_40px_-10px_rgba(192,132,252,0.3)]", label: "Deep Rest" };
      default:
        return { color: "text-foreground", border: "border-border", bg: "bg-card/50", shadow: "", label: "Focus" };
    }
  };

  const currentStyles = getPhaseStyles(pomodoroConfig?.currentPhase);

  // --- Render Empty State ---
  if (!timer) {
    return (
      <div className="flex h-full flex-col bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <header className="relative z-10 flex items-center justify-between p-8">
           <button onClick={() => setView("timers")} className="group flex items-center gap-2 text-muted hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
              <span className="font-offbit text-xs uppercase tracking-widest">Back</span>
           </button>
        </header>
        
        <div className="flex flex-1 items-center justify-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <h1 className="font-galgo text-6xl text-foreground/20">No Context</h1>
            <ActionButton onClick={() => setView("timers")} variant="primary">
              Select Timer
            </ActionButton>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Render Main Panel ---
  return (
    <div className="flex h-full flex-col bg-background text-foreground relative overflow-hidden">
      
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent/5 via-background to-background opacity-40 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      
      {/* Decorative Icon */}
      <div className="absolute -right-12 -top-4 text-foreground/5 pointer-events-none select-none z-0">
        <Zap size={300} strokeWidth={0.5} />
      </div>

      {/* --- SETTINGS MODAL (Awwwards Style) --- */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%", filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%", filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%", filter: "blur(10px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-[600px] origin-center overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
            >
                {/* Decorative Noise on Modal */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />

                <div className="relative z-10 flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/1">
                    <div className="flex flex-col">
                      <span className="font-galgo text-5xl tracking-wider text-white">SYSTEM CONFIG</span>
                      <span className="font-offbit text-xs uppercase tracking-[0.2em] text-accent/80">
                         {timer.label} Protocol
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="rounded-full p-2 text-muted cursor-pointer hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    {!pomodoroConfig ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-16 w-16 rounded-full bg-accent/5 flex items-center justify-center text-accent mb-2">
                             <Zap size={32} />
                        </div>
                        <div>
                           <h3 className="font-galgo tracking-wide text-5xl mb-2">Initialize Protocol</h3>
                           <p className="font-offbit text-md text-muted/60 max-w-xs mx-auto leading-relaxed">
                             Enable standard 25/5 intervals with phase tracking and cycle management.
                           </p>
                        </div>
                        <ActionButton onClick={handleEnablePomodoro} variant="primary" fullWidth>
                          <span className="text-sm">Start Pomodoro</span>
                        </ActionButton>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        
                         {/* Section: Timeline */}
                         <div className="space-y-4">
                            <h4 className="font-offbit text-sm uppercase tracking-widest text-muted/40 pl-1">Timeline & Cycles</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <SettingsInput 
                                    label="Work Duration" 
                                    icon={Clock}
                                    placeholder="25:00"
                                    value={formatDurationMs(config.workDurationMs)}
                                    onChange={(v) => handleConfigUpdate({ workDurationMs: parseTimeString(v) })}
                                />
                                <SettingsInput 
                                    label="Cycle Count" 
                                    icon={Repeat}
                                    placeholder="4"
                                    value={config.longBreakInterval.toString()}
                                    onChange={(v) => handleConfigUpdate({ longBreakInterval: parseInt(v) || 4 })}
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
                         </div>

                         {/* Section: Automation */}
                         <div className="space-y-4">
                             <h4 className="font-offbit text-sm uppercase tracking-widest text-muted/40 pl-1">Automation</h4>
                             <div className="grid grid-cols-2 gap-3">
                                <ModernToggle label="Auto Work" checked={config.autoStartWork} onChange={(c) => handleConfigUpdate({ autoStartWork: c })} />
                                <ModernToggle label="Auto Break" checked={config.autoStartBreaks} onChange={(c) => handleConfigUpdate({ autoStartBreaks: c })} />
                             </div>
                         </div>

                         {/* Footer / Danger */}
                         <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <button 
                                onClick={() => { disablePomodoro(timer.id); setShowSettings(false); }} 
                                className="group flex items-center gap-2 font-galgo font-extralight text-2xl uppercase tracking-widest text-red-500/50 hover:text-red-400 transition-colors cursor-pointer"
                            >
                                <Power size={20} className="group-hover:scale-110 transition-transform mb-1" />
                                <span>Terminate Pomodoro</span>
                            </button>
                            
                            <motion.button 
                                onClick={() => setShowSettings(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 font-galgo font-extralight bg-white text-black px-6 py-2 rounded-full text-2xl uppercase tracking-wider hover:bg-white/90 transition-colors cursor-pointer"
                            >
                                <CheckCircle2 size={20} className="mb-0.5" />
                                <span>Save Changes</span>
                            </motion.button>
                         </div>

                      </div>
                    )}
                  </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- FOCUS LOCK OVERLAY (Immersive) --- */}
      <AnimatePresence>
        {focusLock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-none"
          >
             {/* Glowing Background Blob */}
             <div className={clsx(
               "absolute inset-0 opacity-20 transition-colors duration-1000",
               pomodoroConfig?.currentPhase === 'work' ? "bg-[radial-gradient(circle,rgba(204,255,0,0.3)_0%,transparent_70%)]" :
               pomodoroConfig?.currentPhase === 'shortBreak' ? "bg-[radial-gradient(circle,rgba(34,211,238,0.3)_0%,transparent_70%)]" :
               "bg-[radial-gradient(circle,rgba(192,132,252,0.3)_0%,transparent_70%)]"
             )} />
             
             <div className="relative z-10 flex flex-col items-center gap-12">
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-md"
                >
                   <div className={clsx("h-2 w-2 rounded-full animate-pulse", currentStyles.color === "text-accent" ? "bg-accent" : currentStyles.color === "text-cyan-400" ? "bg-cyan-400" : "bg-purple-400")} />
                   <span className="font-offbit text-sm uppercase tracking-[0.3em] text-white/80">
                     {currentStyles.label}
                   </span>
                </motion.div>

                <div className={clsx(
                  "font-offbit text-[20vw] leading-none tracking-tighter tabular-nums select-none",
                  currentStyles.color,
                  "drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                )}>
                  {formatDurationMs(display)}
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="font-offbit text-sm text-white/20 uppercase tracking-[0.5em]"
                >
                  Press ESC to unlock
                </motion.p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex shrink-0 items-end justify-between px-8 py-8 pt-10 z-20 relative"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-accent mb-1">
            <div className={clsx(
               "h-2 w-2 rounded-full transition-all duration-500 mt-[-3px]",
               status === "running" ? "bg-accent shadow-[0_0_10px_#CCFF00] animate-pulse" : "bg-muted/30"
            )} />
            <span className="font-offbit text-md uppercase tracking-[0.2em] font-light">
               {status === "running" ? "Session Active" : "Standby Mode"}
            </span>
          </div>
          <h1 className="font-galgo text-6xl tracking-wider text-foreground leading-[0.85]">
            {timer.label}
          </h1>
          <p className="font-offbit text-md text-muted max-w-sm leading-relaxed opacity-80">
            Focus sessions with timed work and break intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pomodoroConfig && (
              <ActionButton 
                onClick={() => setFocusLock(true)} 
                variant="primary" 
                icon={
                    <div className="relative h-3.5 w-3.5">
                        <LockOpen 
                            size={14} 
                            className="absolute inset-0 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0 -mt-0.5" 
                        />
                        <Lock 
                            size={14} 
                            className="absolute inset-0 scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 -mt-0.5" 
                        />
                    </div>
                }
              >
                Lock
              </ActionButton>
          )}
          
          <ActionButton 
            onClick={() => setShowSettings(true)} 
            variant={showSettings ? "active" : "primary"} 
            icon={<Settings size={14} className="-mt-0.5" />}
          >
            Pomodoro
          </ActionButton>
        </div>
      </motion.header>

      {/* --- MAIN DISPLAY --- */}
      <div className="flex flex-1 flex-col items-center justify-center relative z-10 px-6">
        
        {/* The Card */}
        <div className="relative flex flex-col items-center w-full max-w-4xl transition-all duration-700">
           {/* Phase Badge */}
           {pomodoroConfig && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               key={pomodoroConfig.currentPhase}
               className={clsx(
                 "mb-8 flex items-center gap-3 rounded-full border px-4 py-1.5 backdrop-blur-md",
                 currentStyles.border,
                 currentStyles.bg
               )}
             >
                <div className={clsx("h-1.5 w-1.5 rounded-full animate-pulse", currentStyles.color === "text-accent" ? "bg-accent" : currentStyles.color.replace('text-', 'bg-'))} />
                <span className={clsx("font-offbit text-[10px] uppercase tracking-[0.25em]", currentStyles.color)}>
                  {currentStyles.label} • {pomodoroConfig.currentCycle}/{config.longBreakInterval}
                </span>
             </motion.div>
           )}

           {/* The Big Digits */}
           <div className="relative">
                 {/* Glow effect behind numbers */}
                 <div className={clsx(
                     "absolute inset-0 bg-accent/10 blur-xl transition-opacity duration-300",
                     pomodoroConfig && status === "running" ? "opacity-30" : "opacity-0"
                 )} />
                 
                 <span className={clsx(
                    "relative z-10 font-offbit text-[12vw] md:text-[9rem] leading-none font-bold tracking-tighter tabular-nums transition-colors duration-300 select-none",
                    pomodoroConfig && status === "running" ? "text-accent drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]" : "text-muted"
                 )}>
                {formatDurationMs(display)}
              </span>
           </div>

           {/* Controls */}
           <div className="mt-16 flex items-center gap-8">
               <motion.button
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={resetActive}
                 className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 text-muted transition-colors hover:border-red-500/50 hover:text-red-400 cursor-pointer"
               >
                 <RotateCcw size={20} strokeWidth={1.5} />
               </motion.button>

               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={startPauseActive}
                 className={clsx(
                    "flex h-24 w-24 items-center justify-center rounded-4xl border-2 transition-all duration-300 shadow-xl cursor-pointer",
                    status === "running" 
                      ? "border-accent bg-accent text-background shadow-[0_0_40px_-10px_rgba(204,255,0,0.6)]" 
                      : "border-border bg-card text-foreground hover:border-accent hover:text-accent"
                 )}
               >
                 {status === "running" ? (
                    <Pause size={32} fill="currentColor" className="opacity-90" />
                 ) : (
                    <Play size={32} fill="currentColor" className="ml-1 opacity-90" />
                 )}
               </motion.button>
               
               <div className="w-14" /> 
           </div>

        </div>
      </div>
    </div>
  );
}