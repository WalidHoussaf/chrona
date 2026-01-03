"use client";

import { useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Command, 
  Copy, 
  Check, 
  Keyboard, 
  MousePointer2, 
  Bell, 
  LayoutGrid, 
  Zap, 
  Database,
  Monitor
} from "lucide-react";
import { notificationManager } from "@/lib/notifications";
import clsx from "clsx";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring" as const, stiffness: 120, damping: 20 } 
  },
};

// --- Reusable UI Components ---

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center min-w-6 px-2 py-1 text-[10px] uppercase font-bold font-offbit text-muted bg-card border border-border border-b-2 rounded-[6px] select-none shadow-sm">
    {children}
  </span>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ComponentType<{ size?: number; className?: string }>, title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 rounded-full bg-card border border-border text-muted">
      <Icon size={14} />
    </div>
    <span className="font-offbit text-xs uppercase tracking-widest text-muted">{title}</span>
  </div>
);

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div 
    variants={itemVariants}
    onClick={onClick}
    className={clsx(
      "relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all duration-500",
      "hover:bg-card hover:border-accent/50 hover:shadow-[0_0_30px_-10px_rgba(204,255,0,0.1)]", // Subtle neon glow on hover
      className
    )}
  >
    {children}
  </motion.div>
);

export function SettingsPanel() {
  const timersCount = useTimerStore((s) => s.timers.length);
  const presetsCount = useTimerStore((s) => s.presets.length);
  const exportPresetsJson = useTimerStore((s) => s.exportPresetsJson);

  const [copied, setCopied] = useState(false);

  const onCopyPresets = async () => {
    const json = exportPresetsJson();
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const onTestNotification = () => {
    notificationManager.notifyTimerComplete('Test Timer');
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background text-foreground selection:bg-accent/20 selection:text-accent">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-7xl p-6 md:p-12 pb-32"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-8">
          <div>
            <h1 className="font-harmond text-6xl md:text-7xl tracking-tighter text-foreground">Settings</h1>
            <p className="mt-4 font-offbit text-sm uppercase tracking-widest text-muted max-w-md">
              System Configuration • v1.0.0
            </p>
          </div>
          
          {/* Data Export Button - High Contrast (Accent Color) */}
          <button
            onClick={onCopyPresets}
            className="group relative flex items-center gap-4 overflow-hidden rounded-full bg-accent px-8 py-4 text-background transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative h-5 w-5 text-background">
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0"
                  >
                    <Check size={20} strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0"
                  >
                    <Copy size={20} strokeWidth={2.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="font-offbit text-xs font-bold uppercase tracking-wider text-background">
              {copied ? "JSON Copied" : "Export Data"}
            </span>
          </button>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Stats Card */}
          <Card className="md:col-span-4 flex flex-col justify-between min-h-[240px]">
            <SectionHeader icon={Database} title="Local Storage" />
            <div className="flex flex-col gap-8">
              <div className="flex items-baseline justify-between border-b border-border pb-4 group">
                <span className="text-muted font-offbit text-xs uppercase tracking-wider group-hover:text-accent transition-colors">Active Timers</span>
                <span className="font-harmond text-5xl text-foreground">{timersCount}</span>
              </div>
              <div className="flex items-baseline justify-between group">
                <span className="text-muted font-offbit text-xs uppercase tracking-wider group-hover:text-accent transition-colors">Saved Presets</span>
                <span className="font-harmond text-5xl text-foreground">{presetsCount}</span>
              </div>
            </div>
          </Card>

          {/* Pro Tips Card */}
          <Card className="md:col-span-8">
             <SectionHeader icon={Zap} title="Efficiency Tips" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full">
               <div className="flex gap-4 items-start group">
                 <div className="mt-1 p-3 rounded-xl bg-card border border-border text-muted group-hover:text-accent group-hover:border-accent transition-colors">
                    <MousePointer2 size={20} />
                 </div>
                 <div>
                   <h4 className="font-harmond text-xl text-foreground mb-2 group-hover:text-accent transition-colors">Precision Scrubbing</h4>
                   <p className="text-sm font-offbit text-muted leading-relaxed">
                     Hover over any time field and scroll. Hold <Key>Shift</Key> while scrolling to increment by 5 units.
                   </p>
                 </div>
               </div>
               <div className="flex gap-4 items-start group">
                 <div className="mt-1 p-3 rounded-xl bg-card border border-border text-muted group-hover:text-accent group-hover:border-accent transition-colors">
                    <LayoutGrid size={20} />
                 </div>
                 <div>
                   <h4 className="font-harmond text-xl text-foreground mb-2 group-hover:text-accent transition-colors">Drag & Organize</h4>
                   <p className="text-sm font-offbit text-muted leading-relaxed">
                     Every timer and preset is draggable. Grab the handle to reorganize your workspace instantly.
                   </p>
                 </div>
               </div>
             </div>
          </Card>

          {/* Shortcuts Section - Full Width */}
          <Card className="md:col-span-12">
            <SectionHeader icon={Command} title="Keyboard Command Interface" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
              
              {/* Navigation Group */}
              <div className="space-y-6">
                <h3 className="font-harmond text-2xl text-foreground">Navigation</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Timer Dashboard</span> 
                    <Key>1</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Stopwatch</span> 
                    <Key>2</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Focus Mode</span> 
                    <Key>3</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Settings</span> 
                    <Key>4</Key>
                  </div>
                </div>
              </div>

              {/* Actions Group */}
              <div className="space-y-6">
                <h3 className="font-harmond text-2xl text-foreground">Controls</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Toggle Play/Pause</span> 
                    <Key>Space</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Create Timer</span> 
                    <Key>N</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Reset Active</span> 
                    <Key>R</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Cycle Timers</span> 
                    <Key>Tab</Key>
                  </div>
                </div>
              </div>

              {/* System Group */}
              <div className="space-y-6">
                <h3 className="font-harmond text-2xl text-foreground">System</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Save Preset</span> 
                    <div className="flex gap-1"><Key>Ctrl</Key> <Key>S</Key></div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Kill All</span> 
                    <div className="flex gap-1"><Key>Ctrl</Key> <Key>X</Key></div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Fullscreen</span> 
                    <div className="flex gap-1"><Key>Ctrl</Key> <Key>E</Key></div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-xs group-hover:text-foreground transition-colors">Exit Focus</span> 
                    <Key>Esc</Key>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature Details Grid */}
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Input Card */}
             <Card className="flex flex-col gap-4">
               <SectionHeader icon={Keyboard} title="Input Method" />
               <p className="text-sm font-offbit text-muted leading-relaxed opacity-80">
                 Input fields are completely typeless. Use scroll interactions or keyboard shortcuts for fluid control without leaving the keyboard.
               </p>
             </Card>

             {/* UI Card */}
             <Card className="flex flex-col gap-4">
               <SectionHeader icon={Monitor} title="Visual Feedback" />
               <p className="text-sm font-offbit text-muted leading-relaxed opacity-80">
                 The interface uses subtle layout shifts and <span className="text-accent">neon</span> indicators to signal timer states.
               </p>
             </Card>

             {/* Audio Card */}
             <Card className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <SectionHeader icon={Bell} title="System Alerts" />
                 <button 
                  onClick={onTestNotification}
                  className="p-2 bg-card border border-border rounded-lg text-muted hover:text-accent hover:border-accent transition-colors"
                  title="Test Audio"
                 >
                   <Zap size={14} />
                 </button>
               </div>
               <p className="text-sm font-offbit text-muted leading-relaxed opacity-80">
                 Audio cues play on completion and phase changes. Notifications persist if the window is not focused.
               </p>
               <button
                 onClick={onTestNotification}
                 className="mt-auto w-full py-3 border border-border rounded-lg font-offbit text-xs uppercase tracking-wider text-muted hover:bg-card hover:border-accent hover:text-accent transition-all"
               >
                 Trigger Test Alert
               </button>
             </Card>
          </div>

        </div>
      </motion.div>
    </div>
  );
}