import React, { useCallback } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { Producto } from '../types';
import { useStore } from '../store/useStore';
import { useLongPress } from '../utils/useLongPress';

interface ProductRowProps {
  producto: Producto;
  unidadPorDefecto: string;
}

export const ProductRow = React.memo(function ProductRow({ producto, unidadPorDefecto }: ProductRowProps) {
  // Individual selectors: a row only re-renders when its own data changes,
  // not on every tap anywhere in the list.
  const updateProductoCantidad = useStore((s) => s.updateProductoCantidad);
  const stepProductoCantidad = useStore((s) => s.stepProductoCantidad);
  const toggleProductoUnidad = useStore((s) => s.toggleProductoUnidad);
  const setProductoUnidad = useStore((s) => s.setProductoUnidad);
  const unidadesDisponibles = useStore((s) => s.ajustes.unidadesDisponibles);
  
  const step = producto.unidad === 'kg' ? 0.5 : 1;
  const isSelected = producto.cantidad !== 0 && producto.cantidad !== '';
  
  // The store reads the current quantity itself, so holding the button keeps
  // counting instead of repeating the value from when the press started.
  const handleIncrement = useCallback(() => {
    stepProductoCantidad(producto.id, step);
    navigator.vibrate?.(8);
  }, [producto.id, step, stepProductoCantidad]);

  const handleDecrement = useCallback(() => {
    stepProductoCantidad(producto.id, -step);
  }, [producto.id, step, stepProductoCantidad]);

  const incrementPress = useLongPress(handleIncrement, 400, 100);
  const decrementPress = useLongPress(handleDecrement, 400, 100);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      updateProductoCantidad(producto.id, 0);
      return;
    }
    
    // Check if it's a pure number to keep it as number type for increment/decrement
    const num = Number(val);
    if (!isNaN(num) && val.trim() !== '' && !val.endsWith('.')) {
      updateProductoCantidad(producto.id, num);
    } else {
      updateProductoCantidad(producto.id, val);
    }
  };

  return (
    <div className={clsx(
      "flex items-center justify-between p-3 min-h-[64px] border-b border-gray-100 bg-white transition-colors select-none",
      isSelected ? "border-l-4 border-l-blue-500 bg-blue-50/40" : "border-l-4 border-l-transparent text-gray-500"
    )}>
      {/* Información del Producto */}
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-2 py-1">
        <span className={clsx("text-lg truncate transition-all", isSelected ? "font-black text-gray-900" : "font-medium text-gray-800")}>
          {producto.nombre}
        </span>
        
        {/* Cápsula de Unidad */}
        <div className="mt-1.5 flex items-center">
          {!producto.mostrarUnidad ? (
            <button
              type="button"
              onClick={() => toggleProductoUnidad(producto.id, unidadPorDefecto)}
              className="inline-flex items-center justify-center h-6 px-3 rounded-full border border-gray-300 text-gray-500 text-xs hover:bg-gray-100 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              <span>Unidad</span>
            </button>
          ) : (
            <div className="relative inline-flex items-center h-6 rounded-full bg-blue-100 text-blue-800 text-xs pl-3 pr-1 shadow-sm">
              <span className="font-bold mr-1.5 pointer-events-none">{producto.unidad}</span>
              <select
                value={producto.unidad}
                onChange={(e) => setProductoUnidad(producto.id, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {unidadesDisponibles.map(u => (
                  <option key={u.nombre} value={u.nombre}>{u.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Quitar unidad"
                onClick={() => toggleProductoUnidad(producto.id, unidadPorDefecto)}
                className="relative z-10 flex items-center justify-center h-5 w-5 ml-0.5 rounded-full hover:bg-blue-200 transition-colors text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controles de Cantidad */}
      <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden h-10 shadow-sm border border-gray-200 shrink-0 ml-2">
        <button
          type="button"
          {...decrementPress}
          aria-label={`Quitar ${producto.nombre}`}
          disabled={producto.cantidad === 0}
          className="w-11 h-full flex items-center justify-center bg-gray-50 active:bg-gray-200 disabled:opacity-30 disabled:active:bg-gray-50 transition-colors touch-manipulation"
        >
          <Minus className="w-5 h-5 text-gray-700" />
        </button>
        <div className="w-14 h-full bg-white flex items-center justify-center border-x border-gray-200">
          <input
            type="text"
            inputMode="text"
            enterKeyHint="done"
            aria-label={`Cantidad de ${producto.nombre}`}
            onFocus={(e) => e.target.select()}
            value={producto.cantidad === 0 ? '' : producto.cantidad}
            onChange={handleInputChange}
            placeholder="0"
            className={clsx(
              "w-full h-full text-center bg-transparent outline-none p-0",
              isSelected ? "font-bold text-blue-700 text-lg" : "font-medium text-gray-400 text-base"
            )}
          />
        </div>
        <button
          type="button"
          {...incrementPress}
          aria-label={`Añadir ${producto.nombre}`}
          className="w-11 h-full flex items-center justify-center bg-gray-50 active:bg-gray-200 transition-colors touch-manipulation"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
});
