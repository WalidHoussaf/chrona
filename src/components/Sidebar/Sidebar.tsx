"use client";

import clsx from "clsx";
import Image from "next/image";
import { useTimerStore } from "@/store/timerStore";
import { Presets } from "@/components/Sidebar/Presets";
import { LayoutGrid, Timer, Zap, Settings2, X } from "lucide-react";

interface SidebarProps {
  setNavOpen?: (open: boolean) => void;
}

export function Sidebar({ setNavOpen }: SidebarProps = {}) {
  const view = useTimerStore((s) => s.view);
  const setView = useTimerStore((s) => s.setView);

  return (
    <aside className="group relative w-72 shrink-0 bg-background flex flex-col h-screen overflow-hidden transition-colors duration-500">
      
      {/* --- CREATIVE SEPARATOR --- */}
      <div className="absolute right-0 top-0 h-full w-px bg-linear-to-b from-transparent via-accent/50 to-transparent opacity-20 transition-opacity duration-700 group-hover:opacity-100" />
      
      {/* --- X BUTTON --- */}
      <button
        type="button"
        onClick={() => setNavOpen?.(false)}
        className="pointer-events-auto absolute -top-3 -right-3 z-50 lg:hidden w-16 h-16 flex items-center justify-center rounded-bl-full rounded-tl-full rounded-br-full bg-white/5 backdrop-blur-xl border-b border-l border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all duration-300 ease-out hover:bg-white/10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
      >
        <X 
          size={26} 
          strokeWidth={1}
          className="text-zinc-200 -mb-1.5 -ml-1 transition-colors hover:text-white" 
        />
      </button>

      {/* --- HEADER --- */}
      <div className="p-4 pb-1 shrink-0 mb-3 lg:p-8 lg:pb-1 lg:mb-5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 -mt-4 -ml-3 lg:-mt-4 lg:-ml-3">
            <div className="mt-0 ml-0 pl-1 pt-4 lg:mt-0 lg:ml-0 lg:pl-0 lg:pt-0">
              <Image 
                src="/logo1.png" 
                alt="Chrona Logo" 
                width={48} 
                height={48}
                quality={100}
                unoptimized
                className="h-10 w-auto lg:h-12"
              />
            </div>
            <span className="pl-0 pt-4 md:pl-0 md:pt-0 font-nohemi text-4xl tracking-tighter text-foreground mt-4 -ml-3 lg:text-5xl">
              Chrona
            </span>
          </div>
          <span className="self-start mt-9 md:mt-7 font-offbit text-[10px] md:text-[10px] uppercase tracking-wider text-accent mr-18 md:-mr-1">
            V1.0.0
          </span>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex flex-col gap-0.5 px-2 py-1 shrink-0 lg:gap-1 lg:px-4 lg:py-2">
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
      <div className="flex-1 overflow-y-auto px-2 pb-3 mt-2 lg:px-4 lg:pb-6 lg:mt-4 scrollbar-hide lg:scrollbar-visible md:scrollbar-visible">
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
        "group/btn relative flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-300 cursor-pointer", 
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
        size={24} 
        className={clsx(
          "transition-colors duration-300 lg:size-5 -mt-1",
          active ? "text-accent" : "text-muted group-hover/btn:text-foreground"
        )} 
      />

      {/* Text label */}
      <span className={clsx(
        "font-nohemi text-xl tracking-tighter transition-colors duration-300 lg:text-2xl",
      )}>
        {children}
      </span>
      
      {/* Active Dot */}
      {active && (
        <span className="ml-auto block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
      )}
    </button>
  );
}