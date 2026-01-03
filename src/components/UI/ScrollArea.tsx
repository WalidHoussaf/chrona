"use client";

import type { ReactNode } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import clsx from "clsx";

export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={clsx("relative overflow-hidden", className)}
      type="auto"
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-2 select-none touch-none bg-white/5 p-[2px]"
      >
        <ScrollAreaPrimitive.Thumb className="flex-1 rounded-full bg-white/20" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner className="bg-white/5" />
    </ScrollAreaPrimitive.Root>
  );
}