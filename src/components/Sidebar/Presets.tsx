"use client";

import { useMemo, useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { useTimerStore } from "@/store/timerStore";
import { DragDropProvider } from "@/components/UI/DragDropContext";
import { DraggablePreset } from "@/components/Sidebar/DraggablePreset";

export function Presets() {
  const presets = useTimerStore((s) => s.presets);
  const savePresetFromActive = useTimerStore((s) => s.savePresetFromActive);
  const movePresetByIndex = useTimerStore((s) => s.movePresetByIndex);
  const exportPresetsJson = useTimerStore((s) => s.exportPresetsJson);
  const importPresetsJson = useTimerStore((s) => s.importPresetsJson);

  const [name, setName] = useState("");
  const [importText, setImportText] = useState("");
  const [exportText, setExportText] = useState<string | null>(null);

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

    try {
      await navigator.clipboard.writeText(json);
    } catch {
      return;
    }
  };

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-3xl tracking-wide text-zinc-400">Presets</div>
        <button
          type="button"
          className="rounded-md font-offbit bg-white/5 px-2 py-1 text-md text-zinc-300 hover:bg-white/10 cursor-pointer"
          onClick={onExport}
        >
          Export
        </button>
      </div>

      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md font-offbit border border-white/10 bg-black/20 px-2 py-1 text-md text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
          placeholder="Save active preset…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className="shrink-0 rounded-md font-offbit bg-white/10 px-2 py-1 text-md text-zinc-100 hover:bg-white/20 cursor-pointer"
          onClick={() => {
            const n = name.trim();
            if (!n) return;
            savePresetFromActive(n);
            setName("");
          }}
        >
          Save
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {sorted.length === 0 ? (
          <div className="rounded-md border font-offbit border-white/10 bg-white/5 px-3 py-1 text-md text-zinc-500">
            No presets yet.
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

      <details className="mt-3">
        <summary className="cursor-pointer font-offbit select-none text-md text-zinc-500 hover:text-zinc-300">
          Import
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-black/20 p-2 text-md text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20 font-offbit"
            placeholder="Paste presets JSON here…"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md font-offbit bg-white/10 px-2 py-1 text-md text-zinc-100 hover:bg-white/20 cursor-pointer"
              onClick={() => {
                importPresetsJson(importText);
                setImportText("");
              }}
            >
              Import
            </button>
            {exportText ? (
              <button
                type="button"
                className="rounded-md font-offbit bg-white/5 px-2 py-1 text-md text-zinc-300 hover:bg-white/10 cursor-pointer"
                onClick={() => setExportText(null)}
              >
                Hide export
              </button>
            ) : null}
          </div>

          {exportText ? (
            <textarea
              readOnly
              className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-black/20 p-2 text-sm text-zinc-100 outline-none font-offbit"
              value={exportText}
            />
          ) : null}
        </div>
      </details>
    </section>
  );
}