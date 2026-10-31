import React from 'react';
import { clsx } from 'clsx';
import { Categoria, Producto } from '../types';

interface CategoryTabsProps {
  categorias: Categoria[];
  productos: Producto[];
  activeCategoriaId: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categorias, productos, activeCategoriaId, onSelect }: CategoryTabsProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 overflow-x-auto hide-scrollbar sticky top-0 z-20 shadow-sm">
      <div className="flex px-2 space-x-1 min-w-max">
        {categorias.sort((a,b) => a.orden - b.orden).map((cat) => {
          const isActive = cat.id === activeCategoriaId;
          const productosEnCategoria = productos.filter(p => p.categoriaId === cat.id && p.cantidad !== 0 && p.cantidad !== '');
          const badgeCount = productosEnCategoria.length;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={clsx(
                "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap outline-none flex items-center border-b-2",
                isActive 
                  ? "border-blue-600 text-blue-700" 
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              )}
            >
              {cat.nombre}
              {badgeCount > 0 && (
                <span className={clsx(
                  "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full transition-colors",
                  isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                )}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
