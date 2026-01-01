"use client";

import { useState } from "react";

import { useTimerStore } from "@/store/timerStore";

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
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <div className="font-harmond text-3xl text-zinc-200">Settings</div>
          <div className="mt-1 text-xl font-offbit text-zinc-200">Local-first. No account. No tracking.</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-harmond text-2xl text-zinc-100">Data</div>
              <div className="mt-2 text-lg text-zinc-400 font-offbit">
                Timers: {timersCount} · Presets: {presetsCount}
              </div>
            </div>
            <button
              type="button"
              className="rounded-md font-offbit bg-white/10 px-5 py-2 text-md text-zinc-100 hover:bg-white/20"
              onClick={onCopyPresets}
            >
              {copied ? "Copied" : "Copy presets JSON"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="font-harmond text-2xl text-zinc-100">Shortcuts</div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-2xl text-zinc-400">
            <div><span className="font-offbit">1:</span> <span className="font-harmond">Timers</span></div>
            <div><span className="font-offbit">2:</span> <span className="font-harmond">Stopwatch</span></div>
            <div><span className="font-offbit">3:</span> <span className="font-harmond">Focus</span></div>
            <div><span className="font-offbit">4:</span> <span className="font-harmond">Settings</span></div>
            <div><span className="font-offbit">Esc:</span> <span className="font-harmond">Exit focus</span></div>
            <div><span className="font-offbit">Space:</span> <span className="font-harmond">Start/Pause</span></div>
            <div><span className="font-offbit">N:</span> <span className="font-harmond">New Timer</span></div>
            <div><span className="font-offbit">R:</span> <span className="font-harmond">Reset</span></div>
            <div><span className="font-offbit">Tab:</span> <span className="font-harmond">Switch Timer</span></div>
            <div><span className="font-offbit">Ctrl+Shift+S:</span> <span className="font-harmond">Save active as preset</span></div>
            <div><span className="font-offbit">Ctrl+Shift+X:</span> <span className="font-harmond">Kill All</span></div>
            <div><span className="font-offbit">Ctrl+Enter:</span> <span className="font-harmond">Fullscreen</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
