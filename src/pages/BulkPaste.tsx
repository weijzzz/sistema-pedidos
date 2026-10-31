import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Check, ClipboardPaste } from 'lucide-react';
import { Producto } from '../types';

export function BulkPaste() {
  const { categorias, subgrupos, addProducto } = useStore();
  
  const [text, setText] = useState('');
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || '');
  const [subgrupoId, setSubgrupoId] = useState('');
  const [success, setSuccess] = useState(false);

  // Subgrupos de la categoría seleccionada
  const activeSubgrupos = subgrupos.filter(s => s.categoriaId === categoriaId).sort((a,b) => a.orden - b.orden);

  const handleImport = () => {
    if (!text.trim()) return;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cat = categorias.find(c => c.id === categoriaId);
    if (!cat) return;

    let addedCount = 0;
    
    lines.forEach((line) => {
      const newProducto: Producto = {
        id: `p-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        nombre: line.toLowerCase(), // Normalizamos a minúsculas como semilla
        categoriaId: cat.id,
        subgrupoId: subgrupoId || undefined,
        unidad: cat.unidadPorDefecto,
        mostrarUnidad: false,
        cantidad: 0,
        orden: Date.now(), // Orden inicial, al final
      };
      
      addProducto(newProducto);
      addedCount++;
    });

    if (addedCount > 0) {
      setSuccess(true);
      setText('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-1">
          <ClipboardPaste className="w-5 h-5 mr-2 text-blue-600" />
          Pegado Masivo
        </h2>
        <p className="text-sm text-gray-500">
          Pega una lista de productos (un producto por línea) para añadirlos rápidamente.
        </p>
      </div>

      <div className="space-y-4 mb-4 shrink-0">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Destino: Categoría</label>
          <select 
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              setSubgrupoId(''); // Resetear subgrupo al cambiar categoría
            }}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Destino: Subgrupo (Opcional)</label>
          <select 
            value={subgrupoId}
            onChange={(e) => setSubgrupoId(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">(Ninguno - Producto suelto)</option>
            {activeSubgrupos.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[200px]">
        <label className="block text-sm font-bold text-gray-700 mb-1">Lista de productos</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ejemplo:&#10;marlboro rojo&#10;marlboro gold&#10;camel azul"
          className="flex-1 w-full p-3 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      <div className="mt-4 shrink-0 pb-safe">
        <button
          onClick={handleImport}
          disabled={!text.trim() || success}
          className="w-full flex items-center justify-center py-3 px-4 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all"
        >
          {success ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              ¡Importados con éxito!
            </>
          ) : (
            'Añadir Productos'
          )}
        </button>
      </div>
    </div>
  );
}
