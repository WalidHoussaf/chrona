"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTimerStore } from "@/store/timerStore";
import { Presets } from "@/components/Sidebar/Presets";
import { LayoutGrid, Timer, Zap, Settings2 } from "lucide-react";

export function Sidebar() {
  const view = useTimerStore((s) => s.view);
  const setView = useTimerStore((s) => s.setView);

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-background flex flex-col h-screen overflow-hidden transition-colors duration-500">
      
      {/* --- HEADER --- */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 -mt-2 -ml-2">
            <Image 
              src="/logo.png" 
              alt="Chrona Logo" 
              width={48} 
              height={48}
              quality={100}
              unoptimized
              className="h-12 w-auto"
            />
          </div>
          <span className="self-start mt-6 font-offbit text-[10px] uppercase tracking-wider text-accent">
            V1.0.0
          </span>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex flex-col gap-1 px-4 py-3 shrink-0">
        <NavButton 
          active={view === "timers"} 
          onClick={() => setView("timers")}
          icon={LayoutGrid}
        >
          Timers
        </NavButton>

        <NavButton 
          active={view === "stopwatch"} 
          onClick={() => setView("stopwatch")}
          icon={Timer}
        >
          Stopwatch
        </NavButton>

        <NavButton 
          active={view === "focus"} 
          onClick={() => setView("focus")}
          icon={Zap}
        >
          Focus Mode
        </NavButton>

        <NavButton 
          active={view === "settings"} 
          onClick={() => setView("settings")}
          icon={Settings2}
        >
          Settings
        </NavButton>
      </nav>

      {/* --- PRESETS CONTAINER --- */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-1">
          <Presets />
        </div>
      </div>
    </aside>
  );
}

// --- Helper Components ---

function NavButton({ 
  children, 
  active, 
  onClick,
  icon: Icon
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={clsx(
        "group relative flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-300 cursor-pointer",
        active 
          ? "bg-card text-accent" 
          : "text-muted hover:bg-card/50 hover:text-foreground hover:pl-5" // Subtle slide effect on hover
      )}
    >
      {/* Active Indicator Line */}
      <div className={clsx(
        "absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-all duration-300",
        active ? "opacity-100" : "opacity-0"
      )} />

      {/* Icon */}
      <Icon 
        size={25} 
        className={clsx(
          "transition-colors duration-300",
          active ? "text-accent" : "text-muted group-hover:text-foreground"
        )} 
      />

      {/* Text label */}
      <span className={clsx(
        "font-galgo font-extralight text-4xl tracking-wider transition-colors duration-300",
      )}>
        {children}
      </span>
      
      {/* Active Dot (Right side) */}
      {active && (
        <span className="ml-auto block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
      )}
    </button>
  );
}