import { useEffect } from "react";

export type ShortcutHandlers = {
  onStartPause?: () => void;
  onReset?: () => void;
  onNewTimer?: () => void;
  onFocusMode?: () => void;
  onViewTimers?: () => void;
  onViewStopwatch?: () => void;
  onViewFocus?: () => void;
  onViewSettings?: () => void;
  onExitFocus?: () => void;
  onFullscreen?: () => void;
  onSwitchTimer?: () => void;
  onKillAll?: () => void;
  onSavePreset?: () => void;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return target.isContentEditable;
}

export function useGlobalShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handlers.onFullscreen?.();
        return;
      }

      if (e.ctrlKey && e.shiftKey && (e.key === "x" || e.key === "X")) {
        e.preventDefault();
        handlers.onKillAll?.();
        return;
      }

      if (e.ctrlKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handlers.onSavePreset?.();
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        handlers.onViewTimers?.();
        return;
      }

      if (e.key === "2") {
        e.preventDefault();
        handlers.onViewStopwatch?.();
        return;
      }

      if (e.key === "3") {
        e.preventDefault();
        handlers.onViewFocus?.();
        return;
      }

      if (e.key === "4") {
        e.preventDefault();
        handlers.onViewSettings?.();
        return;
      }

      if (e.key === "Escape") {
        handlers.onExitFocus?.();
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        handlers.onStartPause?.();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        handlers.onSwitchTimer?.();
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handlers.onReset?.();
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handlers.onNewTimer?.();
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handlers.onFocusMode?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}

export async function requestFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    await el.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
}
