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
    <aside className="group relative w-72 shrink-0 bg-background flex flex-col h-screen overflow-hidden transition-colors duration-500">
      
      {/* --- CREATIVE SEPARATOR --- */}
      <div className="absolute right-0 top-0 h-full w-px bg-linear-to-b from-transparent via-accent/50 to-transparent opacity-20 transition-opacity duration-700 group-hover:opacity-100" />
      
      {/* --- HEADER --- */}
      <div className="p-8 pb-1 shrink-0 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 -mt-4 -ml-3">
            <Image 
              src="/logo1.png" 
              alt="Chrona Logo" 
              width={48} 
              height={48}
              quality={100}
              unoptimized
              className="h-12 w-auto"
            />
            <span className="font-nohemi text-5xl tracking-tighter text-foreground mt-4 -ml-3">
              Chrona
            </span>
          </div>
          <span className="self-start mt-7 font-offbit text-[10px] uppercase tracking-wider text-accent -mr-1">
            V1.0.0
          </span>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex flex-col gap-1 px-4 py-2 shrink-0">
        <NavButton 
          active={view === "timers"} 
          onClick={() => setView("timers")}
          icon={LayoutGrid}
        >
          Timers Board
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
      <div className="flex-1 overflow-y-auto px-4 pb-6 mt-4">
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
        "group/btn relative flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-300 cursor-pointer", // Renamed group to group/btn to avoid conflict
        active 
          ? "bg-card text-accent" 
          : "text-muted hover:bg-card/50 hover:text-foreground hover:pl-5"
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
          active ? "text-accent" : "text-muted group-hover/btn:text-foreground"
        )} 
      />

      {/* Text label */}
      <span className={clsx(
        "font-nohemi text-2xl tracking-tighter transition-colors duration-300",
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