"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

import { useTimerStore } from "@/store/timerStore";

export function Presets() {
  const presets = useTimerStore((s) => s.presets);
  const applyPreset = useTimerStore((s) => s.applyPreset);
  const savePresetFromActive = useTimerStore((s) => s.savePresetFromActive);
  const renamePreset = useTimerStore((s) => s.renamePreset);
  const removePreset = useTimerStore((s) => s.removePreset);
  const movePreset = useTimerStore((s) => s.movePreset);
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
          className="rounded-md font-offbit bg-white/5 px-2 py-1 text-md text-zinc-300 hover:bg-white/10"
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
          className="shrink-0 rounded-md font-offbit bg-white/10 px-2 py-1 text-md text-zinc-100 hover:bg-white/20"
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
          sorted.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <button
                type="button"
                className={clsx(
                  "flex min-w-0 flex-1 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                  "bg-white/5 text-zinc-200 hover:bg-white/10",
                )}
                onClick={() => applyPreset(p.id, "new")}
                title={p.name}
              >
                <span className="truncate">{p.name}</span>
                <span className="ml-2 shrink-0 text-sm text-zinc-500" style={{ fontFamily: 'var(--font-offbit)' }}>
                  {p.kind === "stopwatch" ? "SW" : "T"}
                </span>
              </button>

              <button
                type="button"
                className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10"
                title="Apply to active timer"
                onClick={() => applyPreset(p.id, "active")}
              >
                A
              </button>

              <button
                type="button"
                className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10"
                title="Move up"
                onClick={() => movePreset(p.id, -1)}
              >
                ↑
              </button>

              <button
                type="button"
                className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10"
                title="Move down"
                onClick={() => movePreset(p.id, 1)}
              >
                ↓
              </button>

              <button
                type="button"
                className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10"
                title="Rename"
                onClick={() => {
                  const next = window.prompt("Rename preset", p.name);
                  if (!next) return;
                  renamePreset(p.id, next);
                }}
              >
                R
              </button>

              <button
                type="button"
                className="rounded-md bg-white/5 px-2 py-2 text-sm text-zinc-300 hover:bg-white/10"
                title="Delete"
                onClick={() => {
                  const ok = window.confirm(`Delete preset \"${p.name}\"?`);
                  if (!ok) return;
                  removePreset(p.id);
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer font-offbit select-none text-md text-zinc-500 hover:text-zinc-300">
          Import
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-black/20 p-2 text-md text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
            style={{ fontFamily: 'var(--font-offbit)' }}
            placeholder="Paste presets JSON here…"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md font-offbit bg-white/10 px-2 py-1 text-md text-zinc-100 hover:bg-white/20"
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
                className="rounded-md font-offbit bg-white/5 px-2 py-1 text-md text-zinc-300 hover:bg-white/10"
                onClick={() => setExportText(null)}
              >
                Hide export
              </button>
            ) : null}
          </div>

          {exportText ? (
            <textarea
              readOnly
              className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-black/20 p-2 text-sm text-zinc-100 outline-none"
              style={{ fontFamily: 'var(--font-offbit)' }}
              value={exportText}
            />
          ) : null}
        </div>
      </details>
    </section>
  );
}
