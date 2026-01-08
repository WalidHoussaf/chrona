"use client";

import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useTimerStore } from "@/store/timerStore";
import type { Preset } from "@/store/timerStore";
import { AlertTriangle, GripVertical, PenLine, Trash2, X, Zap } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

interface DraggablePresetProps {
  preset: Preset;
}

export function DraggablePreset({ preset }: DraggablePresetProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preset.id });

  const applyPreset = useTimerStore((s) => s.applyPreset);
  const renamePreset = useTimerStore((s) => s.renamePreset);
  const removePreset = useTimerStore((s) => s.removePreset);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nextName, setNextName] = useState(preset.name);

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

  const openRename = () => {
    setNextName(preset.name);
    setIsRenameModalOpen(true);
  };

  const confirmRename = () => {
    const n = nextName.trim();
    if (!n) return;
    renamePreset(preset.id, n);
    setIsRenameModalOpen(false);
  };

  const confirmDelete = () => {
    removePreset(preset.id);
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    if (!isRenameModalOpen && !isDeleteModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsRenameModalOpen(false);
        setIsDeleteModalOpen(false);
        return;
      }

      if (e.key === "Enter" && isRenameModalOpen) {
        const n = nextName.trim();
        if (!n) return;
        renamePreset(preset.id, n);
        setIsRenameModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDeleteModalOpen, isRenameModalOpen, nextName, preset.id, renamePreset]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={clsx(
          "group relative flex items-center gap-2 transition-opacity overflow-x-hidden",
          isDragging ? "opacity-40" : "opacity-100"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className={clsx(
            "flex h-8 w-4 cursor-grab items-center justify-center rounded transition-opacity duration-200",
            "opacity-100"
          )}
          title="Drag to reorder"
        >
          <GripVertical size={14} className="text-muted hover:text-foreground" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-border bg-card/80 p-1.5 pl-3 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-card hover:shadow-[0_0_15px_-5px_rgba(204,255,0,0.1)]">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none cursor-pointer"
            onClick={() => applyPreset(preset.id, "new")}
            title={`Load "${preset.name}" as new timer`}
          >
            <div
              className={clsx(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                preset.kind === "timer" ? "bg-accent shadow-[0_0_5px_rgba(204,255,0,0.8)]" : "border border-muted bg-transparent"
              )}
            />

            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-nohemi text-md text-foreground transition-colors group-hover:text-white tracking-tight">
                {preset.name}
              </span>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-0.5 border-l border-border pl-1 ml-2">
            <ActionButton
              onClick={() => applyPreset(preset.id, "active")}
              title="Inject into active timer"
              icon={Zap}
              variant="accent"
            />

            <ActionButton onClick={openRename} title="Rename preset" icon={PenLine} variant="default" />

            <ActionButton
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete preset"
              icon={Trash2}
              variant="danger"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRenameModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRenameModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[600px] origin-center overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/1">
                  <div className="flex flex-col">
                    <span className="font-galgo text-5xl tracking-wider text-white">RENAME PRESET</span>
                    <span className="font-nohemi text-md uppercase tracking-[0.2em] text-accent/80">{preset.name}</span>
                  </div>
                  <button
                    onClick={() => setIsRenameModalOpen(false)}
                    className="rounded-full p-2 text-muted cursor-pointer hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="py-4 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-16 w-16 rounded-full bg-accent/5 flex items-center justify-center text-accent mb-2 border border-accent/30">
                      <PenLine size={22} />
                    </div>
                    <div className="w-full">
                      <h3 className="font-nohemi tracking-tighter text-3xl mb-6">Enter New Name</h3>
                      <input
                        value={nextName}
                        onChange={(e) => setNextName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setIsRenameModalOpen(false);
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            confirmRename();
                          }
                        }}
                        className="w-full rounded-[18px] border border-white/10 bg-white/5 px-5 py-3 font-nohemi text-xl tracking-tighter text-white outline-none focus:border-accent"
                        placeholder="Preset name"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => setIsRenameModalOpen(false)}
                      className="group flex items-center gap-2 font-nohemi text-lg tracking-tighter text-muted/50 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X size={20} className="group-hover:scale-110 transition-transform mb-1" />
                      <span>Cancel Operation</span>
                    </button>

                    <motion.button
                      onClick={confirmRename}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 font-nohemi bg-accent text-black px-6 py-2 rounded-full text-lg tracking-tighter hover:bg-accent/90 transition-colors cursor-pointer"
                    >
                      <PenLine size={16} className="mb-0.5" />
                      <span>Rename</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[600px] origin-center overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/1">
                  <div className="flex flex-col">
                    <span className="font-galgo text-5xl tracking-wider text-white">SYSTEM PURGE</span>
                    <span className="font-nohemi text-sm uppercase tracking-[0.2em] text-red-400/80">Preset Marked</span>
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
                      <h3 className="font-nohemi tracking-tighter text-3xl mb-2">Confirm Deletion</h3>
                      <p className="font-offbit text-lg text-muted/60 max-w-md mx-auto leading-relaxed">
                        You are about to permanently delete <span className="text-foreground font-nohemi">&quot;{preset.name}&quot;</span>.
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="group flex items-center gap-2 font-nohemi text-lg tracking-tighter text-muted/50 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X size={20} className="group-hover:scale-110 transition-transform mb-1" />
                      <span>Cancel Operation</span>
                    </button>

                    <motion.button
                      onClick={confirmDelete}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 font-nohemi bg-red-500 text-white px-6 py-2 rounded-full text-xl tracking-tighter hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={20} className="mb-1" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Helper for consistent icon buttons ---

function ActionButton({ 
  onClick, 
  title, 
  icon: Icon, 
  variant = "default" 
}: { 
  onClick: () => void; 
  title: string; 
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  variant?: "default" | "accent" | "danger";
}) {

  return (
    <button
      type="button"
      className={clsx(
        "flex h-7 w-7 items-center justify-center rounded transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer",
        // Default State
        "text-muted hover:bg-white/5",
        // Hover Colors based on variant
        variant === "default" && "hover:text-foreground",
        variant === "accent" && "hover:text-accent",
        variant === "danger" && "hover:text-red-500 hover:bg-red-500/10"
      )}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Icon size={12} strokeWidth={2} />
    </button>
  );
}