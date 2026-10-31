import React, { useState, useEffect, useMemo } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../store/useStore';
import { generateOrderText } from '../lib/orderGenerator';

interface ExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoriaId: string;
}

export function ExtractionModal({ isOpen, onClose, initialCategoriaId }: ExtractionModalProps) {
  const store = useStore();
  
  // Categorías seleccionadas
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set([initialCategoriaId]));
  
  // Proveedor activo en las pestañas
  const [activeProvider, setActiveProvider] = useState<string>('');
  
  // Texto renderizado para el proveedor activo
  const [text, setText] = useState('');
  
  // Estado de copiado
  const [copied, setCopied] = useState(false);

  // Determinar qué proveedores están involucrados en las categorías seleccionadas
  const availableProviders = useMemo(() => {
    const provs = new Set<string>();
    store.categorias.forEach(c => {
      if (selectedCats.has(c.id)) {
        const subProducts = store.productos.filter(p => p.categoriaId === c.id);
        const selectedProducts = subProducts.filter(p => p.cantidad !== 0 && p.cantidad !== undefined && p.cantidad !== '');
        if (selectedProducts.length > 0) {
          c.proveedorIds.forEach(p => provs.add(p));
        }
      }
    });
    return Array.from(provs).map(id => store.proveedores.find(p => p.id === id)!).filter(Boolean);
  }, [selectedCats, store.categorias, store.productos, store.proveedores]);

  // Si cambia la selección y el proveedor activo ya no está disponible, cambiar a uno válido
  useEffect(() => {
    if (availableProviders.length > 0 && !availableProviders.find(p => p.id === activeProvider)) {
      setActiveProvider(availableProviders[0].id);
    }
  }, [availableProviders, activeProvider]);

  // Si abrimos el modal, reseteamos la selección a la categoría inicial
  useEffect(() => {
    if (isOpen) {
      setSelectedCats(new Set([initialCategoriaId]));
      setCopied(false);
    }
  }, [isOpen, initialCategoriaId]);

  // Generar el texto cuando cambia la categoría seleccionada o el proveedor activo
  useEffect(() => {
    if (isOpen && activeProvider) {
      const generated = generateOrderText(store, Array.from(selectedCats), activeProvider);
      setText(generated);
    }
  }, [isOpen, selectedCats, activeProvider, store]);

  const toggleCategory = (id: string) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(id) && next.size > 1) { // No permitir deseleccionar todas
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedCats(new Set(store.categorias.map(c => c.id)));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores antiguos
      const textArea = document.getElementById('pedido-textarea') as HTMLTextAreaElement;
      if (textArea) {
        textArea.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-lg h-full max-h-[85vh] sm:h-auto sm:max-h-[800px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Generar Pedido</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Selección de Categorías */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">Incluir categorías:</span>
              <button onClick={selectAll} className="text-xs text-blue-600 font-medium hover:underline">
                Seleccionar todas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {store.categorias.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    selectedCats.has(cat.id)
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Pestañas de Proveedores (si hay más de 1) */}
          {availableProviders.length > 1 && (
            <div className="flex px-4 pt-2 border-b border-gray-200 bg-gray-50 overflow-x-auto hide-scrollbar shrink-0">
              {availableProviders.map(prov => (
                <button
                  key={prov.id}
                  onClick={() => setActiveProvider(prov.id)}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                    activeProvider === prov.id
                      ? "border-blue-600 text-blue-700 bg-white rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {prov.nombre}
                </button>
              ))}
            </div>
          )}

          {/* Área de texto */}
          <div className="flex-1 flex flex-col p-4 bg-gray-50 min-h-0">
            {availableProviders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecciona al menos una categoría válida.
              </div>
            ) : (
              <textarea
                id="pedido-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 w-full p-4 bg-white border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed shadow-inner"
                placeholder="El pedido generado aparecerá aquí..."
              />
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3 pb-safe">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleCopy}
            disabled={!text || text === 'No hay productos con cantidad'}
            className={clsx(
              "flex-[2] px-4 py-3 rounded-xl font-bold text-white flex items-center justify-center transition-all",
              copied ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed"
            )}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copiar
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
