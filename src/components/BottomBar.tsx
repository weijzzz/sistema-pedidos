import React, { useState } from 'react';
import { Settings, ClipboardList, Trash2, MoreVertical, Check, Plus, Minus, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../store/useStore';
import type { UndoInfo } from './UndoToast';

interface BottomBarProps {
  onExtract: () => void;
  onManage: () => void;
  activeCategoriaId: string;
  /** Offer «Deshacer» after clearing quantities. */
  onUndoable?: (info: UndoInfo) => void;
}

export function BottomBar({ onExtract, onManage, activeCategoriaId, onUndoable }: BottomBarProps) {
  const { 
    clearProductosByCategoria, 
    setUnidadAllInCategoria, 
    removeUnidadAllInCategoria,
    restoreCantidades,
    categorias,
    ajustes
  } = useStore();

  // Remember what had a quantity, so a mistaken «Poner a 0» can be undone.
  const clearWithUndo = (categoriaId?: string) => {
    const snapshot = useStore
      .getState()
      .productos.filter((p) => (!categoriaId || p.categoriaId === categoriaId) && p.cantidad !== 0 && p.cantidad !== '')
      .map((p) => [p.id, p.cantidad] as [string, number | string]);
    clearProductosByCategoria(categoriaId);
    if (snapshot.length > 0) {
      onUndoable?.({
        message: `${snapshot.length} producto(s) puestos a 0`,
        onUndo: () => restoreCantidades(snapshot),
      });
    }
  };
  
  const [showMenu, setShowMenu] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const activeCategoria = categorias.find(c => c.id === activeCategoriaId);

  const handleClear = () => {
    if (confirmClear) {
      clearWithUndo(activeCategoriaId);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const handleAddUnidad = (unidad: string) => {
    if (activeCategoria) {
      setUnidadAllInCategoria(activeCategoria.id, unidad);
    }
    setShowMenu(false);
    setShowUnitSelector(false);
  };

  const handleRemoveUnidad = () => {
    if (window.confirm('¿Quitar la unidad de todos los productos de esta categoría?')) {
      removeUnidadAllInCategoria(activeCategoriaId);
    }
    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Menú de Unidades (Popup) */}
      {showMenu && (
        <div className="absolute bottom-full right-2 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40">
          {!showUnitSelector ? (
            <>
              <button 
                onClick={() => setShowUnitSelector(true)}
                className="w-full text-left px-4 py-3 text-sm flex items-center hover:bg-gray-50 border-b border-gray-100 font-medium"
              >
                <Plus className="w-4 h-4 mr-2 text-blue-600" />
                Poner unidad a todos...
              </button>
              <button 
                onClick={handleRemoveUnidad}
                className="w-full text-left px-4 py-3 text-sm flex items-center hover:bg-gray-50 border-b border-gray-100 font-medium"
              >
                <Minus className="w-4 h-4 mr-2 text-red-600" />
                Quitar unidad a todos
              </button>
              <button 
                onClick={() => {
                  if(window.confirm('¿Estás seguro de querer limpiar TODAS las categorías? Esto pondrá a 0 todos los productos.')) {
                    clearWithUndo();
                    setShowMenu(false);
                  }
                }}
                className="w-full text-left px-4 py-3 text-sm flex items-center hover:bg-red-50 text-red-600 font-bold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar TODAS las categorías
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center">
                <button 
                  onClick={() => setShowUnitSelector(false)}
                  className="p-1 mr-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Elige qué unidad añadir</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {ajustes.unidadesDisponibles.map(u => (
                  <button
                    key={u.nombre}
                    onClick={() => handleAddUnidad(u.nombre)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0"
                  >
                    Añadir <span className="font-bold">"{u.nombre}"</span> a todos
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Overlay para cerrar el menú */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowMenu(false);
            setTimeout(() => setShowUnitSelector(false), 200); // Reset state after animation
          }}
        />
      )}

      <div className="flex items-center justify-between px-2 h-16 max-w-md mx-auto">
        <button
          type="button"
          onClick={handleClear}
          className={clsx(
            "flex flex-col items-center justify-center w-16 h-full transition-colors",
            confirmClear ? "text-red-600" : "text-gray-500 hover:text-gray-900"
          )}
        >
          {confirmClear ? <Check className="w-6 h-6 mb-1" /> : <Trash2 className="w-6 h-6 mb-1" />}
          <span className="text-[10px] font-medium leading-none">
            {confirmClear ? "Confirmar" : "Poner a 0"}
          </span>
        </button>

        <button
          onClick={onExtract}
          className="flex-1 max-w-[200px] h-11 bg-blue-600 active:bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shadow-md hover:shadow-lg transition-all touch-manipulation"
        >
          <ClipboardList className="w-5 h-5 mr-2" />
          Extraer
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className={clsx(
            "flex flex-col items-center justify-center w-16 h-full transition-colors",
            showMenu ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <MoreVertical className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium leading-none">Unidades</span>
        </button>

        <button
          onClick={onManage}
          className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium leading-none">Gestionar</span>
        </button>
      </div>
    </div>
  );
}
