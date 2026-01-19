import { useCallback, useSyncExternalStore } from "react";

type LegacyMediaQueryList = MediaQueryList & {
  addListener: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
};

export function useMediaQuery(query: string, defaultValue = false) {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return defaultValue;
    return window.matchMedia(query).matches;
  }, [query, defaultValue]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => undefined;
      const mediaQueryList = window.matchMedia(query);
      const handleChange = () => onStoreChange();
      const legacyMediaQueryList = mediaQueryList as Partial<LegacyMediaQueryList>;

      if (legacyMediaQueryList.addListener) {
        legacyMediaQueryList.addListener(handleChange);
        return () => legacyMediaQueryList.removeListener?.(handleChange);
      }

      mediaQueryList.addEventListener("change", handleChange);
      return () => mediaQueryList.removeEventListener("change", handleChange);
    },
    [query]
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
