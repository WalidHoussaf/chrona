"use client";

import { useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Copy, Check, Keyboard, MousePointer2, Bell, Zap, LayoutGrid, Database, Monitor, Cpu, Pointer, GamepadDirectional, AudioLines } from "lucide-react";
import { notificationManager } from "@/lib/notifications";
import clsx from "clsx";
import ElectricBorder from "@/components/UI/ElectricBorder";

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
  <ElectricBorder
    mode="rect"
    color={`var(--accent)`}
    speed={0.4}
    chaos={0.16}
    svgDisplacement={6}
    thickness={1}
    fuzziness={0.4}
    glow={1}
    borderRadius={6}
    showOutline={false}
    className="inline-block"
  >
    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 text-[12px] uppercase font-bold font-offbit text-muted bg-card select-none shadow-sm">
      {children}
    </span>
  </ElectricBorder>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ComponentType<{ size?: number; className?: string }>, title: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <ElectricBorder
      mode="rect"
      color={`var(--accent)`}
      speed={0.4}
      chaos={0.16}
      svgDisplacement={6}
      thickness={1}
      fuzziness={0.4}
      glow={1}
      borderRadius={8}
      showOutline={false}
      className="inline-block"
    >
      <div className="p-2 rounded-full bg-card text-muted">
        <Icon size={18} />
      </div>
    </ElectricBorder>
    <span className="font-galgo text-3xl uppercase tracking-widest text-muted">{title}</span>
  </div>
);

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div 
    variants={itemVariants}
    onClick={onClick}
    className={clsx(
      "relative flex",
      className
    )}
  >
    <ElectricBorder
      mode="rect"
      color={`var(--accent)`}
      speed={0.4}
      chaos={0.4}
      svgDisplacement={6}
      thickness={1}
      fuzziness={0.8}
      glow={1}
      borderRadius={12}
      showOutline={false}
      className="flex-1 w-full"
    >
      <div
        className={clsx(
          "h-full w-full overflow-hidden rounded-xl bg-card/50 p-8 backdrop-blur-sm transition-all duration-500",
          "hover:bg-card hover:shadow-[0_0_30px_-10px_rgba(204,255,0,0.1)]"
        )}
      >
        {children}
      </div>
    </ElectricBorder>
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
    <div className="h-full w-full overflow-y-auto bg-background text-foreground">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-7xl p-6 md:p-12 pb-32"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-galgo text-6xl md:text-[65px] tracking-wider text-foreground">Settings</h1>
            <p className="mt-2 font-offbit text-sm uppercase tracking-widest text-accent max-w-md">
              System Configuration • v1.0.0
            </p>
          </div>
          
          {/* Data Export Button */}
          <button
            onClick={onCopyPresets}
            className="group relative flex items-center gap-4 overflow-hidden rounded-full bg-accent px-8 py-4 text-background transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
          
          {/* Stats Card (Local Storage) */}
          <Card className="md:col-span-4 h-full">
            {/* Inner content wrapper ensures the space inside fills the Card's full height */}
            <div className="flex flex-col justify-between h-full">
                <SectionHeader icon={Database} title="Local Storage" />
                <div className="flex flex-col gap-8">
                    <div className="flex items-baseline justify-between">
                        <span className="text-foreground font-galgo font-light text-[28px] uppercase tracking-widest group-hover:text-accent transition-colors">Active Timers</span>
                        <span className="font-offbit text-4xl text-foreground">{timersCount}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-foreground font-galgo font-light text-[28px] uppercase tracking-widest group-hover:text-accent transition-colors">Saved Presets</span>
                        <span className="font-offbit text-4xl text-foreground">{presetsCount}</span>
                    </div>
                </div>
            </div>
          </Card>

          {/* Efficiency Tips Card */}
          <Card className="md:col-span-8 h-full">
             <SectionHeader icon={Zap} title="Efficiency Tips" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full">
               <div className="flex gap-4 items-start group">
                 <ElectricBorder
                   mode="rect"
                   color={`var(--accent)`}
                   speed={0.4}
                   chaos={0.16}
                   svgDisplacement={6}
                   thickness={1}
                   fuzziness={0.4}
                   glow={1}
                   borderRadius={8}
                   showOutline={false}
                   className="inline-block"
                 >
                   <div className="p-2 rounded-lg bg-card text-muted group-hover:text-accent transition-colors cursor-pointer">
                      <MousePointer2 size={16} />
                   </div>
                 </ElectricBorder>
                 <div>
                   <h4 className="font-galgo font-light text-4xl text-foreground mb-2 group-hover:text-accent transition-colors tracking-wider cursor-pointer">Precision Scrubbing</h4>
                   <div className="text-md font-offbit text-muted leading-relaxed">
                     Hover over any time field and scroll. Hold <Key>Shift</Key> while scrolling to increment by 5 units.
                   </div>
                 </div>
               </div>
               <div className="flex gap-4 items-start group">
                 <ElectricBorder
                   mode="rect"
                   color={`var(--accent)`}
                   speed={0.4}
                   chaos={0.16}
                   svgDisplacement={6}
                   thickness={1}
                   fuzziness={0.4}
                   glow={1}
                   borderRadius={8}
                   showOutline={false}
                   className="inline-block"
                 >
                   <div className="p-2 rounded-lg bg-card text-muted group-hover:text-accent transition-colors cursor-pointer">
                      <LayoutGrid size={16} />
                   </div>
                 </ElectricBorder>
                 <div>
                   <h4 className="font-galgo font-light text-4xl text-foreground mb-2 group-hover:text-accent transition-colors tracking-wider cursor-pointer">Drag & Organize</h4>
                   <div className="text-md font-offbit text-muted leading-relaxed">
                     Every timer and preset is draggable. Grab the handle to reorganize your workspace instantly.
                   </div>
                 </div>
               </div>
             </div>
          </Card>

          {/* Shortcuts Section */}
          <Card className="md:col-span-12">
            <SectionHeader icon={Command} title="Keyboard Command Interface" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
              
              {/* Navigation Group */}
              <div className="space-y-6">
                <div className="flex gap-4 items-center group">
                  <ElectricBorder
                    mode="rect"
                    color={`var(--accent)`}
                    speed={0.4}
                    chaos={0.16}
                    svgDisplacement={6}
                    thickness={1}
                    fuzziness={0.4}
                    glow={1}
                    borderRadius={8}
                    showOutline={false}
                    className="inline-block"
                  >
                    <div className="p-2 rounded-lg bg-card text-muted group-hover:text-accent transition-colors cursor-pointer">
                       <GamepadDirectional size={16} />
                    </div>
                  </ElectricBorder>
                  <h3 className="font-galgo text-4xl tracking-wider text-foreground group-hover:text-accent transition-colors cursor-pointer">Navigation</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Timer Dashboard</span> 
                    <Key>1</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Stopwatch</span> 
                    <Key>2</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Focus Mode</span> 
                    <Key>3</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Settings</span> 
                    <Key>4</Key>
                  </div>
                </div>
              </div>

              {/* Actions Group */}
              <div className="space-y-6">
                <div className="flex gap-4 items-center group">
                  <ElectricBorder
                    mode="rect"
                    color={`var(--accent)`}
                    speed={0.4}
                    chaos={0.16}
                    svgDisplacement={6}
                    thickness={1}
                    fuzziness={0.4}
                    glow={1}
                    borderRadius={8}
                    showOutline={false}
                    className="inline-block"
                  >
                    <div className="p-2 rounded-lg bg-card text-muted group-hover:text-accent transition-colors cursor-pointer">
                       <Keyboard size={16} />
                    </div>
                  </ElectricBorder>
                  <h3 className="font-galgo text-4xl tracking-wider text-foreground group-hover:text-accent transition-colors cursor-pointer">Controls</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Toggle Play/Pause</span> 
                    <Key>Space</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Create Timer</span> 
                    <Key>N</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Reset Active</span> 
                    <Key>R</Key>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Cycle Timers</span> 
                    <Key>Tab</Key>
                  </div>
                </div>
              </div>

              {/* System Group */}
              <div className="space-y-6">
                <div className="flex gap-4 items-center group">
                  <ElectricBorder
                    mode="rect"
                    color={`var(--accent)`}
                    speed={0.4}
                    chaos={0.16}
                    svgDisplacement={6}
                    thickness={1}
                    fuzziness={0.4}
                    glow={1}
                    borderRadius={8}
                    showOutline={false}
                    className="inline-block"
                  >
                    <div className="p-2 rounded-lg bg-card text-muted group-hover:text-accent transition-colors cursor-pointer">
                       <Cpu size={16} />
                    </div>
                  </ElectricBorder>
                  <h3 className="font-galgo text-4xl tracking-wider text-foreground group-hover:text-accent transition-colors cursor-pointer">System</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Save Preset</span> 
                    <div className="flex gap-1"><Key>Ctrl</Key> <Key>Shift</Key> <Key>S</Key></div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Kill All</span> 
                    <div className="flex gap-1"><Key>Ctrl</Key> <Key>Shift</Key> <Key>X</Key></div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Fullscreen</span> 
                    <div className="flex gap-1"><Key>Ctrl</Key> <Key>Enter</Key></div>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-muted font-offbit text-lg group-hover:text-foreground transition-colors">Exit Focus</span> 
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
               <SectionHeader icon={Pointer} title="Input Method" />
               <p className="text-md font-offbit text-muted leading-relaxed opacity-80">
                 Input fields are completely typeless. Use scroll interactions or keyboard shortcuts for fluid control without leaving the keyboard.
               </p>
             </Card>

             {/* UI Card */}
             <Card className="flex flex-col gap-4">
               <SectionHeader icon={Monitor} title="Visual Feedback" />
               <p className="text-md font-offbit text-muted leading-relaxed opacity-80">
                 The interface uses subtle layout shifts and <span className="text-accent">neon</span> indicators to signal timer states.
               </p>
             </Card>

             {/* Audio Card */}
             <Card className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <SectionHeader icon={Bell} title="System Alerts" />
                 <div className="-mt-5">
                   <ElectricBorder
                     mode="rect"
                     color={`var(--accent)`}
                     speed={0.4}
                     chaos={0.16}
                     svgDisplacement={6}
                     thickness={1}
                     fuzziness={0.4}
                     glow={1}
                     borderRadius={6}
                     showOutline={false}
                     className="inline-block"
                   >
                     <button 
                      onClick={onTestNotification}
                      className="p-2 bg-card rounded-md text-muted hover:text-accent transition-colors cursor-pointer"
                      title="Test Audio"
                     >
                       <AudioLines size={20} />
                     </button>
                   </ElectricBorder>
                 </div>
               </div>
               <p className="text-md font-offbit text-muted leading-relaxed opacity-80">
                 Audio cues play on completion and phase changes. Notifications persist if the window is not focused.
               </p>
               <ElectricBorder
                 mode="rect"
                 color={`var(--accent)`}
                 speed={0.4}
                 chaos={0.16}
                 svgDisplacement={6}
                 thickness={1}
                 fuzziness={0.4}
                 glow={1}
                 borderRadius={6}
                 showOutline={false}
                 className="mt-auto w-full"
               >
                 <button
                   onClick={onTestNotification}
                   className="w-full py-3 rounded-md font-offbit text-xs uppercase tracking-wider text-muted hover:bg-card hover:text-accent transition-all cursor-pointer"
                 >
                   Trigger Test Alert
                 </button>
               </ElectricBorder>
             </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}