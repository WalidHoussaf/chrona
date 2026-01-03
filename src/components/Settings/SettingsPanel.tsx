"use client";

import { useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Copy, Check, Keyboard, MousePointer2, Bell, LayoutGrid, Zap, Database } from "lucide-react";
import { notificationManager } from "@/lib/notifications";

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
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } },
};

// --- Reusable UI Components ---

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center min-w-6 px-1.5 py-1 text-xs font-offbit text-zinc-300 bg-zinc-800/50 border border-white/10 border-b-white/20 rounded-[4px] shadow-sm">
    {children}
  </span>
);

const SectionHeader = ({ icon: Icon, title }: { icon: React.ComponentType<{ size?: number; className?: string }>, title: string }) => (
  <div className="flex items-center gap-2 mb-4 text-zinc-400">
    <Icon size={16} />
    <span className="font-offbit uppercase tracking-wider text-xs">{title}</span>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    variants={itemVariants}
    className={`relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-sm transition-colors hover:bg-zinc-900/60 ${className}`}
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
    <div className="h-full w-full overflow-y-auto bg-zinc-950 text-zinc-200 selection:bg-zinc-700 selection:text-white">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-5xl p-6 md:p-12 pb-24"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-harmond text-5xl md:text-6xl text-zinc-100 tracking-tight">Settings</h1>
            <p className="mt-2 font-offbit text-lg text-zinc-500 max-w-md">
              Local-first architecture. No tracking. Pure focus.
            </p>
          </div>
          
          {/* Data Export Button */}
          <button
            onClick={onCopyPresets}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-zinc-100 px-6 py-3 text-zinc-950 transition-all hover:bg-white hover:scale-105 active:scale-95"
          >
            <div className="relative h-5 w-5">
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0"
                  >
                    <Check size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0"
                  >
                    <Copy size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="font-offbit font-semibold text-sm">
              {copied ? "JSON Copied" : "Export Presets"}
            </span>
          </button>
        </motion.div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Stats Card */}
          <Card className="md:col-span-4 flex flex-col justify-between min-h-[160px]">
            <SectionHeader icon={Database} title="Storage" />
            <div className="flex gap-8">
              <div>
                <div className="font-harmond text-4xl text-zinc-100">{timersCount}</div>
                <div className="text-zinc-500 font-offbit text-sm">Active Timers</div>
              </div>
              <div>
                <div className="font-harmond text-4xl text-zinc-100">{presetsCount}</div>
                <div className="text-zinc-500 font-offbit text-sm">Saved Presets</div>
              </div>
            </div>
          </Card>

          {/* Pro Tips Card */}
          <Card className="md:col-span-8">
             <SectionHeader icon={Zap} title="Pro Tips" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex gap-3 items-start">
                 <div className="mt-1 p-1 rounded bg-zinc-800/50"><MousePointer2 size={14} className="text-zinc-400" /></div>
                 <div>
                   <h4 className="font-harmond text-zinc-200">Shift + Scroll</h4>
                   <p className="text-sm font-offbit text-zinc-500">Increments values by 5 units.</p>
                 </div>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 p-1 rounded bg-zinc-800/50"><LayoutGrid size={14} className="text-zinc-400" /></div>
                 <div>
                   <h4 className="font-harmond text-zinc-200">Drag & Drop</h4>
                   <p className="text-sm font-offbit text-zinc-500">Reorder timers and presets.</p>
                 </div>
               </div>
             </div>
          </Card>

          {/* Shortcuts Section - Spans Full Width */}
          <Card className="md:col-span-12">
            <SectionHeader icon={Command} title="Keyboard Interface" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-6">
              
              {/* Navigation Group */}
              <div className="space-y-4">
                <h3 className="font-harmond text-xl text-zinc-200 border-b border-white/5 pb-2">Views</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Timers</span> <Key>1</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Stopwatch</span> <Key>2</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Focus Mode</span> <Key>3</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Settings</span> <Key>4</Key></div>
                </div>
              </div>

              {/* Actions Group */}
              <div className="space-y-4">
                <h3 className="font-harmond text-xl text-zinc-200 border-b border-white/5 pb-2">Control</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Start / Pause</span> <Key>Space</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">New Timer</span> <Key>N</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Reset Active</span> <Key>R</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Switch Timer</span> <Key>Tab</Key></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Exit Focus</span> <Key>Esc</Key></div>
                </div>
              </div>

              {/* System Group */}
              <div className="space-y-4">
                <h3 className="font-harmond text-xl text-zinc-200 border-b border-white/5 pb-2">System</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Save Preset</span> <div><Key>Ctrl</Key> <Key>Shift</Key> <Key>S</Key></div></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Kill All</span> <div><Key>Ctrl</Key> <Key>Shift</Key> <Key>X</Key></div></div>
                  <div className="flex justify-between items-center"><span className="text-zinc-400 font-offbit text-sm">Fullscreen</span> <div><Key>Ctrl</Key> <Key>Enter</Key></div></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Features / Details Grid */}
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card className="flex flex-col gap-3">
               <SectionHeader icon={Keyboard} title="Input" />
               <p className="text-sm font-offbit text-zinc-400 leading-relaxed">
                 Hover over any HH:MM:SS field and scroll to adjust values. Holding <span className="text-zinc-200">Shift</span> increases step size.
               </p>
             </Card>

             <Card className="flex flex-col gap-3">
               <SectionHeader icon={LayoutGrid} title="Layout" />
               <p className="text-sm font-offbit text-zinc-400 leading-relaxed">
                 Complete drag and drop support. Hover over the <span className="text-zinc-200">⋮⋮</span> icon to reorder timers or presets instantly.
               </p>
             </Card>

             <Card className="flex flex-col gap-3">
               <SectionHeader icon={Bell} title="Feedback" />
               <p className="text-sm font-offbit text-zinc-400 leading-relaxed">
                 Visual window flashing and audio chimes for background completion. Phase change alerts for Pomodoro.
               </p>
               <button
                 onClick={onTestNotification}
                 className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-200 text-sm font-offbit transition-colors"
               >
                 Test Notification
               </button>
             </Card>
          </div>

        </div>
      </motion.div>
    </div>
  );
}