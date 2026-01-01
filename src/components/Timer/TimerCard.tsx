"use client";

import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import gsap from "gsap";

import { useTimerStore } from "@/store/timerStore";
import { formatDurationMs, splitMsToHms, parseHmsToMs } from "@/lib/time";

export function TimerCard({ id, active }: { id: string; active: boolean }) {
  const timer = useTimerStore((s) => s.timers.find((t) => t.id === id));
  const runtime = useTimerStore((s) => s.runtimeById[id]);

  const setActive = useTimerStore((s) => s.setActive);
  const updateTimer = useTimerStore((s) => s.updateTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);
  const startPauseActive = useTimerStore((s) => s.startPauseActive);
  const resetActive = useTimerStore((s) => s.resetActive);

  const ref = useRef<HTMLDivElement | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  const display = runtime?.displayMs ?? 0;
  const status = runtime?.status ?? "idle";

  const hms = useMemo(() => {
    if (!timer) return { h: 0, m: 0, s: 0 };
    return splitMsToHms(timer.durationMs);
  }, [timer]);

  useEffect(() => {
    if (!ref.current) return;
    if (lastStatusRef.current === status) return;
    lastStatusRef.current = status;

    if (status === "completed") {
      gsap.fromTo(
        ref.current,
        { scale: 1 },
        { scale: 1.03, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 },
      );
    }
  }, [status]);

  if (!timer) return null;

  const running = timer.runningSinceUnixMs != null;

  return (
    <div
      ref={ref}
      className={clsx(
        "rounded-xl border p-4 transition-colors",
        active ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10",
      )}
      onMouseDown={() => setActive(timer.id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <input
            className="w-full bg-transparent text-5xl text-zinc-100 outline-none placeholder:text-zinc-600"
            value={timer.label}
            onChange={(e) => updateTimer(timer.id, { label: e.target.value })}
            placeholder="Timer"
          />
          <div className="mt-2 font-offbit text-6xl tabular-nums tracking-tight text-zinc-50">
            {formatDurationMs(display)}
          </div>
          <div className="mt-3 flex flex-wrap items-center font-offbit gap-2 text-xl text-zinc-400">
            <span
              className={clsx(
                "rounded-md px-2 py-1",
                status === "running"
                  ? "bg-emerald-400/20 font-offbit text-emerald-200"
                  : status === "paused"
                    ? "bg-amber-400/20 font-offbit text-amber-200"
                    : status === "completed"
                      ? "bg-rose-400/20 font-offbit text-rose-200"
                      : "bg-white/10 font-offbit text-zinc-300",
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            {timer.kind === "timer" && (
              <button
                type="button"
                className={clsx(
                  "rounded-md px-2 py-1",
                  timer.loop ? "bg-white/10 text-zinc-200" : "bg-white/5 text-zinc-400 hover:bg-white/10",
                )}
                onClick={() => updateTimer(timer.id, { loop: !timer.loop })}
              >
                Loop
              </button>
            )}

            {timer.kind === "timer" && (
              <button
                type="button"
                className="rounded-md bg-white/5 px-2 py-1 text-zinc-400 hover:bg-white/10"
                onClick={() =>
                  updateTimer(timer.id, { direction: timer.direction === "down" ? "up" : "down" })
                }
              >
                {timer.direction === "down" ? "Count Down" : "Count Up"}
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            className={clsx(
              "w-28 rounded-md px-3 py-2 text-xl font-offbit",
              running ? "bg-white/10 text-zinc-100 hover:bg-white/20" : "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25",
            )}
            onClick={() => {
              setActive(timer.id);
              startPauseActive();
            }}
          >
            {running ? "Pause" : "Start"}
          </button>

          <button
            type="button"
            className="w-28 rounded-md bg-white/5 px-3 py-2 text-xl font-offbit text-zinc-300 hover:bg-white/10"
            onClick={() => {
              setActive(timer.id);
              resetActive();
            }}
          >
            Reset
          </button>

          <button
            type="button"
            className="w-28 rounded-md bg-rose-500/20 px-3 py-2 text-xl font-offbit text-rose-100 hover:bg-rose-500/25"
            onClick={() => removeTimer(timer.id)}
          >
            Remove
          </button>
        </div>
      </div>

      {timer.kind === "timer" && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <TimeField
            label="HH (Hours)"
            value={hms.h}
            disabled={running}
            onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(v, hms.m, hms.s) })}
          />
          <TimeField
            label="MM (Minutes)"
            value={hms.m}
            disabled={running}
            onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, v, hms.s) })}
            max={59}
          />
          <TimeField
            label="SS (Seconds)"
            value={hms.s}
            disabled={running}
            onChange={(v) => updateTimer(timer.id, { durationMs: parseHmsToMs(hms.h, hms.m, v) })}
            max={59}
          />
        </div>
      )}
    </div>
  );
}

const TimeFieldArrows = ({ onIncrement, onDecrement, disabled }: { onIncrement: () => void; onDecrement: () => void; disabled: boolean }) => (
  <div className="flex flex-col">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onIncrement();
      }}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-tr-md border-l border-white/10 bg-white/20 hover:bg-white/30 disabled:opacity-30 backdrop-blur-sm transition-colors"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 100 125"
        className="ml-[2px] -rotate-90 transform"
        fill="currentColor"
      >
        <path
          d="M56 68L56 56 44 56 44 68 56 68M32 68L32 80 44 80 44 68 32 68M44 44L56 44 56 32 44 32 44 44M68 44L56 44 56 56 68 56 68 44M44 32L44 20 32 20 32 32 44 32Z"
          className="text-zinc-300"
        />
      </svg>
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onDecrement();
      }}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-br-md border-l border-t border-white/10 bg-white/20 hover:bg-white/30 disabled:opacity-30 backdrop-blur-sm transition-colors"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 100 125"
        className="ml-[-2px] rotate-90 transform"
        fill="currentColor"
      >
        <path
          d="M56 68L56 56 44 56 44 68 56 68M32 68L32 80 44 80 44 68 32 68M44 44L56 44 56 32 44 32 44 44M68 44L56 44 56 56 68 56 68 44M44 32L44 20 32 20 32 32 44 32Z"
          className="text-zinc-300"
        />
      </svg>
    </button>
  </div>
);

function TimeField({
  label,
  value,
  onChange,
  disabled,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  max?: number;
}) {
  const handleIncrement = () => {
    const next = value + 1;
    onChange(max != null ? Math.min(max, next) : next);
  };

  const handleDecrement = () => {
    const next = value - 1;
    onChange(Math.max(0, next));
  };

  return (
    <div className="flex items-end gap-2">
      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-xl font-offbit text-zinc-400">{label}</span>
        <div className="flex items-stretch">
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-l-md border border-r-0 border-white/10 bg-black/30 px-3 py-2 font-offbit text-2xl text-zinc-100 outline-none transition-all focus:border-white/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={value}
            disabled={disabled}
            min={0}
            max={max}
            onChange={(e) => onChange(Number(e.target.value || 0))}
            onWheel={(e) => {
              if (disabled) return;
              e.currentTarget.blur();
              const dir = e.deltaY < 0 ? 1 : -1;
              const next = value + dir;
              onChange(max != null ? Math.min(max, Math.max(0, next)) : Math.max(0, next));
            }}
          />
          <TimeFieldArrows
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            disabled={disabled}
          />
        </div>
      </label>
    </div>
  );
}
