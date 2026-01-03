"use client";

import React, { createContext, useContext } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DragDropContextValue {
  activeId: string | null;
  isDragging: boolean;
}

const DragDropContext = createContext<DragDropContextValue>({
  activeId: null,
  isDragging: false,
});

export function useDragDrop() {
  return useContext(DragDropContext);
}

interface DragDropProviderProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  items: { id: string }[];
}

export function DragDropProvider({
  children,
  onDragEnd,
  onDragStart,
  onDragOver,
  items,
}: DragDropProviderProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    onDragStart?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    onDragOver?.(event);
  };

  return (
    <DragDropContext.Provider value={{ activeId, isDragging: activeId !== null }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
        <DragOverlay>
          {activeId ? null : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
}