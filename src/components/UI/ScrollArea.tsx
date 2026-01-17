"use client";

import type { ReactNode } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import clsx from "clsx";

export function ScrollArea({
  className,
  children,
  ref,
}: {
  className?: string;
  children: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={clsx("relative overflow-hidden", className)}
      type="auto"
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full" ref={ref}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="w-2 select-none touch-none bg-(--border)/20 p-[2px] hidden md:flex"
      >
        <ScrollAreaPrimitive.Thumb className="flex-1 rounded-full bg-(--muted)/40 hover:bg-(--muted)/60" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner className="bg-(--border)/20 hidden md:block" />
    </ScrollAreaPrimitive.Root>
  );
}

ScrollArea.displayName = "ScrollArea";