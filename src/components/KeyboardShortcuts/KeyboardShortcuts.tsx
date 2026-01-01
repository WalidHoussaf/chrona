"use client";

import { useState } from "react";

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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80 transition-colors"
          aria-label="Show keyboard shortcuts"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-keyboard">
            <rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
            <path d="M6 8h.001" />
            <path d="M10 8h.001" />
            <path d="M14 8h.001" />
            <path d="M18 8h.001" />
            <path d="M8 12h.001" />
            <path d="M12 12h.001" />
            <path d="M16 12h.001" />
            <path d="M7 16h10" />
          </svg>
        </button>
        
        {isHovered && (
          <div className="absolute right-0 bottom-10 w-120 rounded-lg bg-zinc-900/95 p-4 text-zinc-300 shadow-xl backdrop-blur-sm border border-white/10">
            {/* Header text */}
            <h3 className="mb-3 text-2xl text-white">Keyboard Shortcuts</h3>
            
            {/* Keeps 3 columns for "squatness", but reduced gap to 4 */}
            <div className="grid grid-cols-3 gap-4">
              
              <div>
                <div className="font-offbit text-xl text-white/90">1 - 4</div>
                <div className="text-lg text-zinc-400">Switch View</div>
              </div>
              
              <div>
                <div className="font-offbit text-xl text-white/90">Space</div>
                <div className="text-lg text-zinc-400">Start/Pause</div>
              </div>

              <div>
                <div className="font-offbit text-xl text-white/90">N</div>
                <div className="text-lg text-zinc-400">New Timer</div>
              </div>
              
              <div>
                <div className="font-offbit text-xl text-white/90">R</div>
                <div className="text-lg text-zinc-400">Reset</div>
              </div>

              <div>
                <div className="font-offbit text-xl text-white/90">Tab</div>
                <div className="text-lg text-zinc-400">Switch Timer</div>
              </div>
              
              <div>
                <div className="font-offbit text-xl text-white/90">Ctrl+Shift+S</div>
                <div className="text-lg text-zinc-400">Save Preset</div>
              </div>
              
              <div>
                <div className="font-offbit text-xl text-white/90">Ctrl+Shift+X</div>
                <div className="text-lg text-zinc-400">Kill All</div>
              </div>

              <div>
                <div className="font-offbit text-xl text-white/90">Ctrl+Enter</div>
                <div className="text-lg text-zinc-400">Fullscreen</div>
              </div>

              <div>
                <div className="font-offbit text-xl text-white/90">Esc</div>
                <div className="text-lg text-zinc-400">Exit Focus</div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}