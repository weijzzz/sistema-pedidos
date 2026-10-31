import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Producto } from '../types';

export function ManageProducts() {
  const { productos, categorias, subgrupos, deleteProducto, setProductos, updateProducto } = useStore();
  const [filterCat, setFilterCat] = useState(categorias[0]?.id || '');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return productos.filter(p => p.categoriaId === filterCat).sort((a,b) => a.orden - b.orden);
  }, [productos, filterCat]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = productos.findIndex(p => p.id === active.id);
      const newIndex = productos.findIndex(p => p.id === over.id);
      
      const newArray = arrayMove(productos, oldIndex, newIndex);
      // Reassign order
      const ordered = newArray.map((p, i) => ({ ...p, orden: i }));
      setProductos(ordered);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b border-gray-200 shrink-0">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
        >
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Mantén pulsado y arrastra para reordenar
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 pb-safe">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredProducts.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {filteredProducts.map(p => (
                <SortableProductRow 
                  key={p.id} 
                  producto={p} 
                  isEditing={editingId === p.id}
                  onEdit={() => setEditingId(p.id)}
                  onSave={(updates: Partial<Producto>) => {
                    updateProducto(p.id, updates as any);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => {
                    if(window.confirm(`¿Borrar ${p.nombre}?`)) deleteProducto(p.id);
                  }}
                  subgrupos={subgrupos.filter(s => s.categoriaId === filterCat)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableProductRow({ producto, isEditing, onEdit, onSave, onCancel, onDelete, subgrupos }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: producto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const [editName, setEditName] = useState(producto.nombre);
  const [editSub, setEditSub] = useState(producto.subgrupoId || '');

  if (isEditing) {
    return (
      <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 shadow-sm">
        <input
          type="text"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded p-2 mb-2 text-sm"
        />
        <select
          value={editSub}
          onChange={e => setEditSub(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded p-2 mb-3 text-sm"
        >
          <option value="">(Sin subgrupo)</option>
          {subgrupos.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="p-2 text-gray-500 bg-gray-200 rounded-lg"><X className="w-4 h-4"/></button>
          <button onClick={() => onSave({nombre: editName, subgrupoId: editSub || undefined})} className="p-2 text-white bg-green-600 rounded-lg"><Check className="w-4 h-4"/></button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center bg-white p-3 rounded-xl border ${isDragging ? 'border-blue-500 shadow-lg opacity-80' : 'border-gray-200 shadow-sm'}`}
    >
      <div {...attributes} {...listeners} className="p-2 mr-2 cursor-grab active:cursor-grabbing text-gray-400">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-800 text-sm truncate">{producto.nombre}</div>
        <div className="text-xs text-gray-500 truncate">
          {producto.subgrupoId ? subgrupos.find((s:any) => s.id === producto.subgrupoId)?.nombre : 'Suelto'}
        </div>
      </div>

      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
