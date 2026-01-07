"use client";

import React, { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import { 
  Settings, Lock, LockOpen, Play, Pause, RotateCcw, ArrowLeft, 
  Power, Zap, X, Clock, Repeat, CheckCircle2, ChevronRight, 
  Activity, BrainCircuit, Coffee 
} from "lucide-react";
import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, parseHmsToMs } from "@/lib/time";
import type { PomodoroConfig } from "@/lib/timerProtocol";
import { motion, AnimatePresence } from "framer-motion";
import ElectricBorder from "@/components/UI/ElectricBorder";

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

function ElectricHeaderButton({
  children,
  onClick,
  icon,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  active?: boolean;
}) {
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
      borderRadius={999}
      showOutline={false}
      className={clsx(
        "group relative flex items-center justify-center overflow-hidden rounded-full border border-accent/30 bg-accent/5 transition-all duration-300 cursor-pointer hover:bg-accent/10 hover:border-accent hover:shadow-[0_0_20px_-5px_rgba(204,255,0,0.2)] active:scale-[0.98]",
        active && "border-accent bg-accent/10"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center gap-3 w-full h-full bg-transparent cursor-pointer font-offbit text-xs font-bold uppercase tracking-wider text-accent px-6 py-3"
      >
        {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
        <span className="relative z-10">{children}</span>
      </button>
    </ElectricBorder>
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

// --- New Aesthetic Components ---

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,rgba(204,255,0,0.06),transparent)]" />
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
  </div>
);

const EmptyStateCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick,
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string; size?: number; color?: string; strokeWidth?: number; }>, 
  title: string, 
  subtitle: string,
  onClick?: () => void,
  delay?: number 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    onClick={onClick}
    className="group relative flex items-center gap-4 rounded-xl border border-white/5 bg-white/2 p-4 transition-all duration-300 hover:bg-white/4 hover:border-white/10 hover:shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-sm cursor-pointer select-none"
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted transition-colors group-hover:text-accent group-hover:bg-accent/10">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <div className="flex flex-col">
      <span className="font-galgo text-4xl tracking-wider text-foreground/80 group-hover:text-foreground transition-colors">{title}</span>
      <span className="font-offbit text-sm uppercase tracking-widest text-muted/50 group-hover:text-muted transition-colors">{subtitle}</span>
    </div>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
      <ChevronRight size={28} className="text-accent" />
    </div>
  </motion.div>
);

const TickerTape = () => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-white/5 bg-black/20 backdrop-blur-md py-2">
    <div className="flex whitespace-nowrap">
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        className="flex items-center gap-8 px-4"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="flex items-center gap-2 font-offbit text-lg text-muted/30 uppercase tracking-[0.2em]">
              <div className="h-1 w-1 rounded-full bg-accent/50 -mt-1" />
              System Standby
            </span>
            <span className="flex items-center gap-2 font-offbit text-lg text-muted/30 uppercase tracking-[0.2em]">
              Waiting for Input
            </span>
            <span className="flex items-center gap-2 font-offbit text-lg text-muted/30 uppercase tracking-[0.2em]">
              <div className="h-1 w-1 rounded-full bg-accent/50 -mt-1" />
              Protocol: Null
            </span>
            <span className="flex items-center gap-2 font-offbit text-lg text-muted/30 uppercase tracking-[0.2em]">
              v1.0.0
            </span>
          </div>
        ))}
      </motion.div>
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
  const timers = useTimerStore((s) => s.timers);
  const pomodoroTimer = useMemo(() => {
    const withPomodoro = timers.find((t) => t.kind !== "stopwatch" && t.pomodoroConfig);
    if (withPomodoro) return withPomodoro;
    const activeNonStopwatch = timers.find((t) => t.id === activeId && t.kind !== "stopwatch");
    if (activeNonStopwatch) return activeNonStopwatch;
    return timers.find((t) => t.kind !== "stopwatch");
  }, [timers, activeId]);
  const runtime = useTimerStore((s) => (pomodoroTimer ? s.runtimeById[pomodoroTimer.id] : undefined));

  const setView = useTimerStore((s) => s.setView);
  const setActive = useTimerStore((s) => s.setActive);
  const startPauseById = useTimerStore((s) => s.startPauseById);
  const resetById = useTimerStore((s) => s.resetById);
  const newTimer = useTimerStore((s) => s.newTimer);
  const updateTimer = useTimerStore((s) => s.updateTimer);
  const enablePomodoro = useTimerStore((s) => s.enablePomodoro);
  const disablePomodoro = useTimerStore((s) => s.disablePomodoro);
  const updatePomodoroConfig = useTimerStore((s) => s.updatePomodoroConfig);

  const [focusLock, setFocusLock] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";
  const pomodoroConfig = pomodoroTimer?.pomodoroConfig;
  
  const config = useMemo(() => ({
    workDurationMs: pomodoroConfig?.workDurationMs || 25 * 60 * 1000,
    shortBreakDurationMs: pomodoroConfig?.shortBreakDurationMs || 5 * 60 * 1000,
    longBreakDurationMs: pomodoroConfig?.longBreakDurationMs || 15 * 60 * 1000,
    longBreakInterval: pomodoroConfig?.longBreakInterval || 4,
    autoStartBreaks: pomodoroConfig?.autoStartBreaks || false,
    autoStartWork: pomodoroConfig?.autoStartWork || false,
  }), [pomodoroConfig]);


  // Ensure pomodoro timer is the active timer when in focus view
  useEffect(() => {
    if (pomodoroTimer && activeId !== pomodoroTimer.id) {
      setActive(pomodoroTimer.id);
    }
  }, [pomodoroTimer, activeId, setActive]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusLock) {
          setFocusLock(false);
          return; 
        } else if (showSettings) {
          setShowSettings(false);
          return;
        } else {
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
    if (!pomodoroTimer) return;
    enablePomodoro(pomodoroTimer.id, config);
    setShowSettings(false);
  };

  const handleConfigUpdate = (updates: Partial<PomodoroConfig>) => {
    if (pomodoroTimer && pomodoroConfig) {
      updatePomodoroConfig(pomodoroTimer.id, updates);
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

  const startQuickAccessProtocol = (protocol: "deepWork" | "flowState" | "shortSprint") => {
    const id = newTimer("timer");
    setActive(id);

    if (protocol === "flowState") {
      updateTimer(id, {
        label: "Flow State",
        direction: "down",
        durationMs: 90 * 60 * 1000,
        loop: false,
      });
      return;
    }

    const isDeepWork = protocol === "deepWork";
    updateTimer(id, {
      label: isDeepWork ? "Deep Work Protocol" : "Short Sprint",
      direction: "down",
      loop: false,
    });

    enablePomodoro(id, {
      workDurationMs: (isDeepWork ? 50 : 25) * 60 * 1000,
      shortBreakDurationMs: (isDeepWork ? 10 : 5) * 60 * 1000,
      longBreakDurationMs: (isDeepWork ? 10 : 15) * 60 * 1000,
      longBreakInterval: 4,
      currentCycle: 1,
      currentPhase: "work",
    });
  };

  // --- Render Empty State (Awwwards Style) ---
  if (!pomodoroTimer) {
    return (
      <div className="flex h-full flex-col bg-[#050505] relative overflow-hidden">
        <GridBackground />
        
        {/* Navigation Bar */}
        <header className="relative z-10 flex items-center justify-between p-8">
           <button onClick={() => setView("timers")} className="group flex items-center gap-3 text-muted hover:text-foreground transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all cursor-pointer
              ">
                <ArrowLeft size={20} />
              </div>
              <span className="font-offbit text-md uppercase tracking-[0.2em] cursor-pointer">Dashboard</span>
           </button>
           <div className="hidden md:flex items-center gap-6">
               <span className="font-offbit text-xs text-muted uppercase tracking-widest">Sys_Status: IDLE</span>
               <span className="font-offbit text-xs text-muted uppercase tracking-widest">Net: Online</span>
           </div>
        </header>
        
        {/* Main Split Layout */}
        <div className="relative z-10 grid flex-1 grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-16">
          
          {/* Left Column: Typography & Status */}
          <div className="flex flex-col justify-center gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2 -mt-24"
            >
              <div className="flex items-center gap-3 mb-2">
                 <span className="h-px w-8 bg-accent/50" />
                 <span className="font-offbit text-md text-accent uppercase tracking-widest">No Active Protocol</span>
              </div>
              <h1 className="font-galgo text-[15vw] md:text-9xl leading-[0.7] tracking-wide text-white/90">
                SYSTEM<br/><span className="text-white/20">IDLE</span>
              </h1>
              <p className="max-w-md font-offbit text-lg text-muted/60 leading-relaxed pt-4">
                No active timer context found. Initialize a protocol from the dashboard to begin a session. 
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ElectricBorder
                mode="rect"
                color="var(--accent)"
                speed={0.4}
                thickness={1}
                glow={1}
                borderRadius={999}
                className="w-fit"
              >
                 <button 
                   onClick={() => setView("timers")} 
                   className="group flex items-center gap-4 bg-accent/5 px-8 py-4 rounded-3xl hover:bg-accent/10 transition-colors cursor-pointer"
                 >
                    <Zap size={28} className="text-accent" />
                    <span className="font-galgo text-4xl uppercase tracking-wider text-white">Initialize Session</span>
                    <ChevronRight className="text-accent/50 transition-transform group-hover:translate-x-1" size={28} />
                 </button>
              </ElectricBorder>
            </motion.div>
          </div>

          {/* Right Column: Visual Dashboard */}
          <div className="hidden md:flex flex-col justify-center items-center md:items-start pl-12 pb-28">
            <div className="relative w-full max-w-md space-y-4">
               {/* Decorative "Data" Header */}
               <div className="flex justify-between border-b border-white/5 pb-2 mb-6">
                  <span className="font-offbit text-md text-muted/30 uppercase tracking-[0.2em]">Quick Access</span>
               </div>
               
               {/* "Ghost" Cards (Visual Only) */}
               <EmptyStateCard 
                 delay={0.3}
                 icon={BrainCircuit}
                 title="Deep Work Protocol"
                 subtitle="50m Focus • 10m Rest"
                 onClick={() => startQuickAccessProtocol("deepWork")}
               />
               <EmptyStateCard 
                 delay={0.4}
                 icon={Activity}
                 title="Flow State"
                 subtitle="90m Uninterrupted"
                 onClick={() => startQuickAccessProtocol("flowState")}
               />
               <EmptyStateCard 
                 delay={0.5}
                 icon={Coffee}
                 title="Short Sprint"
                 subtitle="25m Focus • 5m Rest"
                 onClick={() => startQuickAccessProtocol("shortSprint")}
               />
            </div>
          </div>
        </div>

        <TickerTape />
      </div>
    );
  }

  // --- Render Main Panel ---
  return (
    <div className="flex h-full flex-col bg-[#050505] text-foreground relative overflow-hidden">
      
      {/* --- Ambient Background --- */}
      <GridBackground />
      
      {/* Decorative Icon */}
      <div className="absolute -right-18 -top-10 text-foreground/5 pointer-events-none select-none z-0">
        <ElectricBorder
          mode="svg"
          color={`var(--accent)`}
          speed={0.5}
          chaos={0.3}
          svgDisplacement={12}
          thickness={0.4}
          fuzziness={0.4}
          glow={2}
        >
          <Zap size={450} strokeWidth={0.5} />
        </ElectricBorder>
      </div>

      {/* --- SETTINGS MODAL --- */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%", filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%", filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: "-45%", x: "-50%", filter: "blur(10px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-[600px] origin-center overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
            >
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/1">
                    <div className="flex flex-col">
                      <span className="font-galgo text-5xl tracking-wider text-white">SYSTEM CONFIG</span>
                      <span className="font-offbit text-xs uppercase tracking-[0.2em] text-accent/80">
                          {pomodoroTimer.label} Protocol
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
                        <div className="h-16 w-16 rounded-full bg-accent/5 flex items-center justify-center text-accent mb-2 border border-accent/20">
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

                         <div className="space-y-4">
                             <h4 className="font-offbit text-sm uppercase tracking-widest text-muted/40 pl-1">Automation</h4>
                             <div className="grid grid-cols-2 gap-3">
                                <ModernToggle label="Auto Work" checked={config.autoStartWork} onChange={(c) => handleConfigUpdate({ autoStartWork: c })} />
                                <ModernToggle label="Auto Break" checked={config.autoStartBreaks} onChange={(c) => handleConfigUpdate({ autoStartBreaks: c })} />
                             </div>
                         </div>

                         <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <button 
                                onClick={() => { disablePomodoro(pomodoroTimer.id); setShowSettings(false); }} 
                                className="group flex items-center gap-2 font-galgo font-extralight text-2xl uppercase tracking-[0.2em] text-red-500/50 hover:text-red-400 transition-colors cursor-pointer"
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

      {/* --- FOCUS LOCK OVERLAY --- */}
      <AnimatePresence>
        {focusLock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-none"
          >
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
            {pomodoroTimer.label}
          </h1>
          <p className="font-offbit text-md text-muted max-w-sm leading-relaxed opacity-80">
            Focus sessions with timed work and break intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pomodoroConfig && (
            <ElectricHeaderButton
              onClick={() => setFocusLock(true)}
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
            </ElectricHeaderButton>
          )}

          <ElectricHeaderButton
            onClick={() => setShowSettings(true)}
            active={showSettings}
            icon={<Settings size={14} className="-mt-0.5" />}
          >
            Pomodoro
          </ElectricHeaderButton>
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
               className="mb-8 inline-block"
             >
               {pomodoroConfig.currentPhase === "work" ? (
                 <ElectricBorder
                   mode="rect"
                   color={`var(--accent)`}
                   speed={0.4}
                   chaos={0.16}
                   svgDisplacement={3}
                   thickness={1}
                   fuzziness={0.4}
                   glow={1}
                   borderRadius={999}
                   showOutline={false}
                   className="inline-block w-fit"
                 >
                   <div
                     className={clsx(
                       "flex items-center gap-3 rounded-full border px-4 py-1.5 backdrop-blur-md",
                       currentStyles.border,
                       currentStyles.bg
                     )}
                   >
                     <div
                       className={clsx(
                         "h-1.5 w-1.5 rounded-full animate-pulse",
                         currentStyles.color === "text-accent" ? "bg-accent" : currentStyles.color.replace('text-', 'bg-')
                       )}
                     />
                     <span className={clsx("font-offbit text-[10px] uppercase tracking-[0.25em]", currentStyles.color)}>
                       {currentStyles.label} • {pomodoroConfig.currentCycle}/{config.longBreakInterval}
                     </span>
                   </div>
                 </ElectricBorder>
               ) : (
                 <div
                   className={clsx(
                     "flex items-center gap-3 rounded-full border px-4 py-1.5 backdrop-blur-md",
                     currentStyles.border,
                     currentStyles.bg
                   )}
                 >
                   <div
                     className={clsx(
                       "h-1.5 w-1.5 rounded-full animate-pulse",
                       currentStyles.color === "text-accent" ? "bg-accent" : currentStyles.color.replace('text-', 'bg-')
                     )}
                   />
                   <span className={clsx("font-offbit text-[10px] uppercase tracking-[0.25em]", currentStyles.color)}>
                     {currentStyles.label} • {pomodoroConfig.currentCycle}/{config.longBreakInterval}
                   </span>
                 </div>
               )}
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
                 onClick={() => resetById(pomodoroTimer.id)}
                 className="group flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card/50 text-muted transition-colors hover:border-red-500/50 hover:text-red-400 cursor-pointer"
               >
                 <RotateCcw size={20} strokeWidth={1.5} />
               </motion.button>

               {status === "running" ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startPauseById(pomodoroTimer.id)}
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
                      onClick={() => startPauseById(pomodoroTimer.id)}
                      className="flex h-24 w-24 items-center justify-center rounded-4xl border-2 transition-all duration-300 shadow-xl cursor-pointer border-border bg-card text-foreground hover:text-accent"
                    >
                      <Play size={32} fill="currentColor" className="ml-1 opacity-90" />
                    </button>
                  </ElectricBorder>
                </motion.div>
              )}
              
              <div className="w-14" /> 
           </div>

        </div>
      </div>
    </div>
  );
}