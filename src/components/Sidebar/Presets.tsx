"use client";

import { useMemo, useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { useTimerStore } from "@/store/timerStore";
import { DragDropProvider } from "@/components/UI/DragDropContext";
import { DraggablePreset } from "@/components/Sidebar/DraggablePreset";
import { Download, Upload, Plus, Save, ChevronRight, FileJson } from "lucide-react";
import clsx from "clsx";
import ElectricBorder from "@/components/UI/ElectricBorder";

export function Presets() {
  const presets = useTimerStore((s) => s.presets);
  const savePresetFromActive = useTimerStore((s) => s.savePresetFromActive);
  const movePresetByIndex = useTimerStore((s) => s.movePresetByIndex);
  const exportPresetsJson = useTimerStore((s) => s.exportPresetsJson);
  const importPresetsJson = useTimerStore((s) => s.importPresetsJson);

  const [name, setName] = useState("");
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const sorted = useMemo(() => {
    return [...presets].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });
  }, [presets]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((preset) => preset.id === active.id);
    const newIndex = sorted.findIndex((preset) => preset.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      movePresetByIndex(active.id as string, newIndex);
    }
  };

  const onExport = async () => {
    const json = exportPresetsJson();
    setExportText(json);
    setIsExpanded(true); // Auto-open details to show result

    try {
      await navigator.clipboard.writeText(json);
    } catch {
      return;
    }
  };

  return (
    <section className="flex flex-col gap-4">
      
      {/* --- Header Row --- */}
      <div className="flex items-end justify-between border-b border-border pb-2">
        <h2 className="font-galgo text-4xl tracking-wider text-foreground">
          Presets
        </h2>
        <button
          type="button"
          onClick={onExport}
          className="group flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-card cursor-pointer"
        >
          <span className="font-offbit text-[12px] uppercase tracking-wider text-muted group-hover:text-foreground cursor-pointer">
            Export
          </span>
          <Download size={12} className="text-muted group-hover:text-accent" />
        </button>
      </div>

      {/* --- Input Row --- */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-8 font-offbit text-md text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent hover:border-accent transition-colors"
            placeholder="Name active timer..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={clsx(
            "absolute right-2 top-1/2 -translate-y-1/2 transition-colors duration-200",
            name.trim() ? "text-accent" : "text-muted/70"
          )}>
            <Save size={18} />
          </div>
        </div>
        
        <div title="Save Current State">
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
            className="shrink-0 flex items-center justify-center rounded-lg border border-border bg-card px-3 py-3 text-muted hover:text-accent transition-all active:scale-95 cursor-pointer"
          >
            <button
              type="button"
              onClick={() => {
                const n = name.trim();
                if (!n) return;
                savePresetFromActive(n);
                setName("");
              }}
              className="w-full h-full bg-transparent cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
            </button>
          </ElectricBorder>
        </div>
      </div>

      {/* --- List Area --- */}
      <div className="flex flex-col gap-2 min-h-[100px] overflow-x-hidden">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-8 text-center">
            <FileJson size={24} className="mb-2 text-muted" />
            <p className="font-offbit tracking-wider text-sm text-muted">No presets saved.</p>
          </div>
        ) : (
          <DragDropProvider
            items={sorted.map((p) => ({ id: p.id }))}
            onDragEnd={handleDragEnd}
          >
            {sorted.map((p) => (
              <DraggablePreset key={p.id} preset={p} />
            ))}
          </DragDropProvider>
        )}
      </div>

      {/* --- Advanced / Import Section --- */}
      <div className="mt-1 border-t border-border pt-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between group cursor-pointer"
        >
          <span className="font-galgo text-4xl tracking-wider text-muted group-hover:text-foreground transition-colors">
            Advanced Operations
          </span>
          <ChevronRight 
            size={14} 
            className={clsx(
              "text-muted transition-transform duration-300",
              isExpanded ? "rotate-90" : "rotate-0"
            )} 
          />
        </button>
        
        {isExpanded && (
          <div className="mt-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <textarea
              className="min-h-[100px] w-full resize-y rounded-lg border border-border bg-black/40 p-3 font-offbit tracking-wider text-sm text-muted outline-none focus:border-accent focus:text-foreground transition-colors"
              placeholder="Paste JSON configuration..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 font-offbit text-[12px] text-foreground hover:border-accent hover:text-accent transition-all cursor-pointer"
                onClick={() => {
                  importPresetsJson(importText);
                  setImportText("");
                }}
              >
                <Upload size={12} />
                IMPORT JSON
              </button>
              
              {exportText && (
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 font-offbit text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setExportText(null)}
                >
                  Clear Output
                </button>
              )}
            </div>

            {exportText && (
              <div className="relative group">
                <div className="absolute -top-2 left-2 bg-background px-1 font-offbit text-[9px] text-accent">
                  OUTPUT
                </div>
                <textarea
                  readOnly
                  className="min-h-[80px] w-full resize-y rounded-lg border border-accent/30 bg-accent/5 p-3 font-offbit text-[10px] text-foreground outline-none"
                  value={exportText}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}