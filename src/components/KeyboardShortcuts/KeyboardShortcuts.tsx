"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 text-[12px] uppercase font-bold font-offbit text-muted bg-card border border-border border-b-2 rounded-[6px] select-none shadow-sm">
    {children}
  </span>
);

export function KeyboardShortcuts() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card/10 text-muted/60 hover:bg-card/20 hover:text-muted/80 transition-colors cursor-pointer"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard size={20} />
        </button>
        
        {isHovered && (
          <div className="absolute right-0 bottom-10 w-120 rounded-lg bg-card/95 p-4 text-foreground shadow-xl backdrop-blur-sm border border-border">
            {/* Header text */}
            <h3 className="mb-3 font-galgo tracking-widest text-4xl text-foreground">Keyboard Shortcuts</h3>

            <div className="grid grid-cols-3 gap-4">
              
              <div>
                <Key>1 - 4</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Switch View</div>
              </div>
              
              <div>
                <Key>Space</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Start/Pause</div>
              </div>

              <div>
                <Key>N</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">New Timer</div>
              </div>
              
              <div>
                <Key>R</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Reset</div>
              </div>

              <div>
                <Key>Tab</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Switch Timer</div>
              </div>
              
              <div>
                <Key>Ctrl+Shift+S</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Save Preset</div>
              </div>
              
              <div>
                <Key>Ctrl+Shift+X</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Kill All</div>
              </div>

              <div>
                <Key>Ctrl+Enter</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Fullscreen</div>
              </div>

              <div>
                <Key>Esc</Key>
                <div className="font-galgo font-extralight tracking-wider text-3xl text-foreground/80">Exit Focus</div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}