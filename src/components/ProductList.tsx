import React, { useMemo, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Producto, Subgrupo } from '../types';
import { ProductRow } from './ProductRow';

interface ProductListProps {
  productos: Producto[];
  subgrupos: Subgrupo[];
  unidadPorDefecto: string;
}

type ListItem = 
  | { type: 'subgrupo'; id: string; nombre: string; count: number }
  | { type: 'producto'; producto: Producto };

export function ProductList({ productos, subgrupos, unidadPorDefecto }: ProductListProps) {
  const [collapsedSubgrupos, setCollapsedSubgrupos] = useState<Set<string>>(new Set());
  
  const toggleCollapse = (id: string) => {
    setCollapsedSubgrupos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const flattenedItems = useMemo(() => {
    const items: ListItem[] = [];
    
    // 1. Productos sin subgrupo
    const sinSubgrupo = productos.filter(p => !p.subgrupoId).sort((a,b) => a.orden - b.orden);
    sinSubgrupo.forEach(p => items.push({ type: 'producto', producto: p }));
    
    // 2. Subgrupos (ordenados)
    const sortedSubgrupos = [...subgrupos].sort((a,b) => a.orden - b.orden);
    
    sortedSubgrupos.forEach(sub => {
      const subProductos = productos
        .filter(p => p.subgrupoId === sub.id)
        .sort((a,b) => a.orden - b.orden);
        
      if (subProductos.length > 0) {
        const activeCount = subProductos.filter(p => p.cantidad !== 0 && p.cantidad !== '').length;
        items.push({ type: 'subgrupo', id: sub.id, nombre: sub.nombre, count: activeCount });
        
        if (!collapsedSubgrupos.has(sub.id)) {
          subProductos.forEach(p => items.push({ type: 'producto', producto: p }));
        }
      }
    });
    
    return items;
  }, [productos, subgrupos, collapsedSubgrupos]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      return flattenedItems[index].type === 'subgrupo' ? 40 : 76; // Alturas estimadas
    },
    overscan: 5,
  });

  if (productos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <p className="text-lg mb-2">No hay productos que coincidan</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = flattenedItems[virtualItem.index];
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.type === 'subgrupo' ? (
                <div 
                  className="flex items-center justify-between px-4 h-full bg-gray-100 border-b border-gray-200 cursor-pointer sticky top-0 z-10 font-bold text-gray-700 shadow-sm text-sm uppercase tracking-wider"
                  onClick={() => toggleCollapse(item.id)}
                >
                  <div className="flex items-center">
                    {collapsedSubgrupos.has(item.id) ? (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    {item.nombre}
                  </div>
                  {item.count > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
              ) : (
                <ProductRow 
                  producto={item.producto} 
                  unidadPorDefecto={unidadPorDefecto} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
