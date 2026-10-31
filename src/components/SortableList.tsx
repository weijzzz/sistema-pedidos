import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { moveId } from '../lib/order';

interface RenderCtx {
  index: number;
  isDragging: boolean;
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, ctx: RenderCtx) => React.ReactNode;
  /** Show ↑/↓ buttons next to each row (handy for long lists). */
  showMoveButtons?: boolean;
  label: (item: T) => string;
}

/**
 * Vertical list reordered by dragging the ≡ handle.
 *
 * The handle sets `touch-action: none`: without it a phone scrolls the page
 * instead of picking the row up, which is why the old «mantén pulsado y
 * arrastra» did nothing on mobile.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  showMoveButtons = true,
  label,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = items.map((i) => i.id);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    onReorder(moveId(ids, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              label={label(item)}
              index={index}
              count={items.length}
              showMoveButtons={showMoveButtons}
              onMove={(to) => onReorder(moveId(ids, index, to))}
            >
              {(isDragging) => renderItem(item, { index, isDragging })}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  label,
  index,
  count,
  showMoveButtons,
  onMove,
  children,
}: {
  id: string;
  label: string;
  index: number;
  count: number;
  showMoveButtons: boolean;
  onMove: (to: number) => void;
  children: (isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={clsx(
        'relative flex items-center bg-white rounded-xl border',
        isDragging ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200 shadow-sm'
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Arrastrar ${label}`}
        className="self-stretch px-2.5 flex items-center text-gray-400 cursor-grab active:cursor-grabbing active:text-blue-600"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">{children(isDragging)}</div>
      {showMoveButtons && (
        <div className="flex shrink-0 pr-1">
          <button
            type="button"
            aria-label={`Subir ${label}`}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            className="p-2 text-gray-500 disabled:opacity-25 active:bg-gray-100 rounded-lg"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label={`Bajar ${label}`}
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
            className="p-2 text-gray-500 disabled:opacity-25 active:bg-gray-100 rounded-lg"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}
    </li>
  );
}
