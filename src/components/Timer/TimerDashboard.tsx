"use client";

import { useState, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { ScrollArea } from "@/components/UI/ScrollArea";
import { DragDropProvider } from "@/components/UI/DragDropContext";
import { useTimerStore } from "@/store/timerStore";
import { DraggableTimerCard } from "@/components/Timer/DraggableTimerCard";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, Trash2, AlertTriangle, X, Crown, Focus, ChevronDown } from "lucide-react";
import clsx from "clsx";
import ElectricBorder from "@/components/UI/ElectricBorder";
import ColorBends from "@/components/UI/ColorBlends";

// --- Hooks ---
function useDesktopMediaQuery() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDesktop;
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 120, damping: 20 } 
  },
};

// --- Styled Sub-Components ---
const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <ColorBends
      className="absolute inset-0"
      colors={["#020202", "#070707", "#101010", "#151515", "#CCFF00"]}
      transparent
      rotation={35}
      speed={0.15}
      autoRotate={0.3}
      scale={0.6}
      frequency={1}
      warpStrength={1}
      mouseInfluence={1}
      parallax={0.5}
      noise={0}
    />
    <div className="absolute inset-0 bg-black/60" />
  </div>
);

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center min-w-6 px-1.5 py-0.5 text-[10px] uppercase font-bold font-offbit text-muted bg-card border border-border border-b-2 rounded-[4px] select-none shadow-sm mx-1 align-middle">
    {children}
  </span>
);

export function TimerDashboard() {
  const timers = useTimerStore((s) => s.timers);
  const activeId = useTimerStore((s) => s.activeId);
  const newTimer = useTimerStore((s) => s.newTimer);
  const killAll = useTimerStore((s) => s.killAll);
  const moveTimer = useTimerStore((s) => s.moveTimer);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isDesktop = useDesktopMediaQuery();

  const sorted = [...timers].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((timer) => timer.id === active.id);
    const newIndex = sorted.findIndex((timer) => timer.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      moveTimer(active.id as string, newIndex);
    }
  };

  const handleConfirmDelete = () => {
    killAll();
    setIsDeleteModalOpen(false);
  };

  // --- Animation Variants ---
  // Mobile: Slides up from bottom
  // Desktop: Scales in from center
  const modalVariants = {
    desktop: {
      initial: { opacity: 0, scale: 0.95, y: "-50%", x: "-50%", filter: "blur(10px)" },
      animate: { opacity: 1, scale: 1, y: "-50%", x: "-50%", filter: "blur(0px)" },
      exit: { opacity: 0, scale: 0.95, y: "-45%", x: "-50%", filter: "blur(10px)" }
    },
    mobile: {
      initial: { opacity: 0, y: "100%", x: 0 },
      animate: { opacity: 1, y: "0%", x: 0 },
      exit: { opacity: 0, y: "100%", x: 0 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col bg-[#050505] text-foreground overflow-hidden relative"
    >
      {/* Ambient Background */}
      <GridBackground />

      {/* --- Header Section --- */}
      <motion.div 
        variants={itemVariants}
        className="relative shrink-0 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-8 py-8 pt-10"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-accent mb-1">
            <Focus size={18} className="mb-1" />
            <span className="font-nohemi text-sm uppercase tracking-[0.2em]">Focus Mode</span>
          </div>
          <h1 className="font-nohemi text-4xl tracking-tighter text-foreground leading-10">
            My Timers
          </h1>
          <p className="font-offbit text-md text-muted max-w-sm leading-relaxed opacity-80">
            {sorted.length} {sorted.length === 1 ? 'active timer' : 'active timers'}. Transform seconds into achievements.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center md:justify-end gap-3">
            {/* Add Timer */}
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
              className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-accent/30 bg-accent/5 transition-all duration-300 cursor-pointer hover:bg-accent/10 hover:border-accent hover:shadow-[0_0_20px_-5px_rgba(204,255,0,0.2)] active:scale-[0.98]"
            >
              <button
                type="button"
                onClick={() => newTimer("timer")}
                className="relative flex items-center gap-3 w-full h-full bg-transparent cursor-pointer px-5 py-3 md:px-6 md:py-3"
              >
                <Plus size={17} className="text-accent transition-transform group-hover:rotate-90 mb-0.5 md:size-[18px]" strokeWidth={2.5} />
                <span className="font-nohemi text-xs uppercase tracking-widest text-accent md:text-xs">
                  New Timer
                </span>
              </button>
            </ElectricBorder>

            {/* Clear All */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={sorted.length === 0}
              className={clsx(
                "group relative flex items-center gap-2 rounded-full bg-transparent px-5 py-3 md:px-6 md:py-3 transition-all duration-300 cursor-pointer",
                "hover:text-red-400 text-muted",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted"
              )}
            >
               <Trash2 className="mb-0.5" size={15} />
               <span className="font-nohemi text-xs uppercase tracking-widest md:text-xs">
                 Clear All
               </span>
            </button>
        </div>
      </motion.div>

      {/* --- Main List Area --- */}
      <div className="flex-1 overflow-hidden relative z-0">
        <ScrollArea className="h-full">
          <DragDropProvider
            items={sorted.map((t) => ({ id: t.id }))}
            onDragEnd={handleDragEnd}
          >
            <motion.div 
               variants={containerVariants}
               className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 md:px-10 pb-32 pt-2"
            >
              <AnimatePresence mode="wait">
                {sorted.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col gap-4">
                    {sorted.map((t) => (
                      <DraggableTimerCard 
                        key={t.id} 
                        id={t.id} 
                        active={t.id === activeId}
                        totalTimers={sorted.length}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </DragDropProvider>
        </ScrollArea>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:bg-black/80 md:backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div 
              variants={isDesktop ? modalVariants.desktop : modalVariants.mobile}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={clsx(
                "fixed z-50 origin-center overflow-hidden border-white/10 bg-[#0A0A0A]",
                
                // MOBILE STYLES (Bottom Sheet)
                "bottom-0 left-0 w-full rounded-t-[32px] border-t pb-safe shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]",
                
                // DESKTOP STYLES (Restoring Original Centered Look)
                "md:top-1/2 md:left-1/2 md:bottom-auto md:w-full md:max-w-[600px] md:rounded-[32px] md:border md:pb-0 md:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
              )}
            >
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />

                {/* --- MOBILE HANDLE (Hidden on Desktop) --- */}
                <div className="absolute top-0 left-0 w-full flex justify-center pt-3 md:hidden z-20 pointer-events-none">
                    <div className="h-1.5 w-12 rounded-full bg-white/20" />
                </div>

                <div className="relative z-10 flex flex-col h-auto max-h-[85vh] md:max-h-none">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-8 pb-4 md:px-8 md:py-6 border-b border-white/5 bg-white/1">
                    <div className="flex flex-col">
                      <span className="font-galgo text-4xl md:text-5xl tracking-wider text-white">SYSTEM PURGE</span>
                      <span className="font-nohemi text-xs uppercase tracking-wider text-red-400/80">
                          {sorted.length} {sorted.length === 1 ? 'Timer' : 'Timers'} Marked
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="rounded-full p-2 text-muted cursor-pointer bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {/* Mobile shows Chevron, Desktop shows X */}
                      {isDesktop ? <X size={20} strokeWidth={1.5} /> : <ChevronDown size={24} strokeWidth={1.5} />}
                    </button>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-8">
                    <div className="py-2 md:py-4 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-16 w-16 rounded-full bg-red-500/5 flex items-center justify-center text-red-400 mb-2 border border-red-500/30">
                           <AlertTriangle size={32} />
                      </div>
                      <div>
                          <h3 className="font-nohemi tracking-tight text-3xl md:text-4xl mb-2">Confirm Deletion</h3>
                          <p className="font-offbit text-md text-muted/60 max-w-md mx-auto leading-relaxed">
                            You are about to permanently delete <span className="text-foreground font-bold">{sorted.length} active {sorted.length === 1 ? 'timer' : 'timers'}</span>. 
                            This action cannot be undone.
                          </p>
                      </div>
                    </div>

                      {/* Footer Actions */}
                      <div className={clsx(
                        "pt-4 border-t border-white/5 flex gap-4",
                        // Mobile: Vertical Stack (Buttons full width)
                        "flex-col-reverse",
                        // Desktop: Horizontal Spread (Original)
                        "md:flex-row md:items-center md:justify-between"
                      )}>
                         <button 
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="group flex items-center justify-center gap-2 font-nohemi text-lg tracking-tighter text-muted/50 hover:text-foreground transition-colors cursor-pointer py-3 md:py-0"
                        >
                            <X size={20} className="hidden md:block group-hover:scale-110 transition-transform mb-1" />
                            <span>Cancel Operation</span>
                        </button>
                        
                        <motion.button 
                            onClick={handleConfirmDelete}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full md:w-auto flex items-center justify-center gap-2 font-nohemi bg-red-500 text-white px-6 py-4 md:py-2 rounded-xl md:rounded-full text-lg tracking-tighter hover:bg-red-600 transition-colors cursor-pointer"
                        >
                            <Trash2 size={20} className="mb-0.5" />
                            <span>Delete All</span>
                        </motion.button>
                      </div>
                  </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Empty State ---
function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        "relative overflow-hidden rounded-xl border border-dashed border-border/60 bg-card/20 p-12 backdrop-blur-sm transition-all duration-500",
        "flex flex-col items-center justify-center text-center gap-6 min-h-[400px]",
        "hover:border-accent/30 hover:bg-card/30"
      )}
    >
      <div className="p-4 rounded-full bg-card border border-border text-muted mb-2 shadow-sm">
        <Crown size={32} strokeWidth={1} />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-nohemi text-2xl md:text-5xl text-foreground/80 tracking-tighter opacity-90">
          No Active Timers
        </h3>
        <p className="font-offbit text-muted text-sm uppercase tracking-widest max-w-xs mx-auto opacity-70">
           Add a timer to get started.
        </p>
      </div>

      <div className="mt-4 px-6 py-3 rounded-lg border border-border bg-background/50 items-center gap-3 hidden md:flex">
         <span className="font-offbit text-md text-muted">
           Press <Key>N</Key> for new timer
         </span>
      </div>
    </motion.div>
  );
}