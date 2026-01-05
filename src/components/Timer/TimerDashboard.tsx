"use client";

import { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { ScrollArea } from "@/components/UI/ScrollArea";
import { DragDropProvider } from "@/components/UI/DragDropContext";
import { useTimerStore } from "@/store/timerStore";
import { DraggableTimerCard } from "@/components/Timer/DraggableTimerCard";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, Trash2, LayoutList, AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

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

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 300
    } 
  },
  exit: { opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.15 } }
};

// --- Reusable UI Elements ---
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col bg-background text-foreground overflow-hidden relative"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* --- Header Section (Seamless Blend) --- */}
      <motion.div 
        variants={itemVariants}
        // Updated: Removed border-b, removed bg-card, added shrink-0 to prevent collapse
        className="relative shrink-0 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-8 py-8 pt-10"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-accent mb-1">
            <svg className="mb-0.5" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" width="20" height="20" fill="currentColor">
              <path d="m76.91 0h-53.824v7.6953h53.824z"/>
              <path d="m23.086 7.6953h-7.6875v7.6953h7.6875z"/>
              <path d="m84.602 15.387v-7.6953h-7.6875v7.6953z"/>
              <path d="m15.398 15.387h-7.6875v7.6953h7.6875z"/>
              <path d="m92.289 23.074v-7.6953h-7.6875v7.6953z"/>
              <path d="m7.7031 23.074h-7.6875v53.852h7.6875z"/>
              <path d="m53.84 23.074h-7.6875v23.074h-23.07v7.6953h30.758z"/>
              <path d="m99.984 76.926v-53.852h-7.6875v53.852z"/>
              <path d="m7.7031 76.926v7.6953h7.6875v-7.6953z"/>
              <path d="m84.602 84.617h7.6875v-7.6953h-7.6875z"/>
              <path d="m15.398 84.617v7.6953h7.6875v-7.6953z"/>
              <path d="m76.91 92.305h7.6875v-7.6953h-7.6875z"/>
              <path d="m23.086 100h53.824v-7.6953h-53.824z"/>
            </svg>
            <span className="font-offbit text-md uppercase tracking-[0.2em] font-light">Focus Mode</span>
          </div>
          <h1 className="font-galgo text-6xl tracking-wider text-foreground leading-[0.85]">
            My Timers
          </h1>
          <p className="font-offbit text-md text-muted max-w-sm leading-relaxed opacity-80">
            {sorted.length} {sorted.length === 1 ? 'active timer' : 'active timers'}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
            {/* Add Timer */}
            <button
              onClick={() => newTimer("timer")}
              className={clsx(
                "group relative flex items-center gap-3 overflow-hidden rounded-full border border-accent/30 bg-accent/5 px-6 py-3 transition-all duration-300 cursor-pointer",
                "hover:bg-accent/10 hover:border-accent hover:shadow-[0_0_20px_-5px_rgba(204,255,0,0.2)] active:scale-[0.98]"
              )}
            >
               <Plus size={18} className="text-accent transition-transform group-hover:rotate-90 mb-0.5" strokeWidth={2.5} />
               <span className="font-offbit text-xs font-bold uppercase tracking-wider text-accent">
                 New Timer
               </span>
            </button>

            {/* Clear All */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={sorted.length === 0}
              className={clsx(
                "group relative flex items-center gap-2 rounded-full bg-transparent px-6 py-3 transition-all duration-300 cursor-pointer",
                "hover:text-red-400 text-muted",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted"
              )}
            >
               <Trash2 className="mb-0.5" size={16} />
               <span className="font-offbit text-xs font-bold uppercase tracking-wider">
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
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </DragDropProvider>
        </ScrollArea>
      </div>

      {/* --- CONFIRMATION MODAL (Awwwards Style) --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[600px] origin-center overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
            >
                {/* Decorative Noise on Modal */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />

                <div className="relative z-10 flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/1">
                    <div className="flex flex-col">
                      <span className="font-galgo text-5xl tracking-wider text-white">SYSTEM PURGE</span>
                      <span className="font-offbit text-xs uppercase tracking-[0.2em] text-red-400/80">
                         {sorted.length} {sorted.length === 1 ? 'Timer' : 'Timers'} Marked
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="rounded-full p-2 text-muted cursor-pointer hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="py-4 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-16 w-16 rounded-full bg-red-500/5 flex items-center justify-center text-red-400 mb-2 border border-red-500/30">
                           <AlertTriangle size={32} />
                      </div>
                      <div>
                         <h3 className="font-galgo tracking-wide text-5xl mb-2">Confirm Deletion</h3>
                         <p className="font-offbit text-md text-muted/60 max-w-md mx-auto leading-relaxed">
                           You are about to permanently delete <span className="text-foreground font-bold">{sorted.length} active {sorted.length === 1 ? 'timer' : 'timers'}</span>. 
                           This action cannot be undone and all data will be lost.
                         </p>
                      </div>
                    </div>

                     {/* Footer / Danger */}
                     <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="group flex items-center gap-2 font-galgo font-extralight text-2xl uppercase tracking-widest text-muted/50 hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X size={20} className="group-hover:scale-110 transition-transform mb-1" />
                            <span>Cancel Operation</span>
                        </button>
                        
                        <motion.button 
                            onClick={handleConfirmDelete}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 font-galgo font-extralight bg-red-500 text-white px-6 py-2 rounded-full text-2xl uppercase tracking-wider hover:bg-red-600 transition-colors cursor-pointer"
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
        <LayoutList size={32} strokeWidth={1} />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-galgo text-5xl md:text-7xl text-foreground/80 tracking-wider opacity-90">
          No Active Timers
        </h3>
        <p className="font-offbit text-muted text-sm uppercase tracking-widest max-w-xs mx-auto opacity-70">
           Add a timer to get started.
        </p>
      </div>

      <div className="mt-4 px-6 py-3 rounded-lg border border-border bg-background/50 flex items-center gap-3">
         <span className="font-offbit text-md text-muted">
           Press <Key>N</Key> for new timer
         </span>
      </div>
    </motion.div>
  );
}