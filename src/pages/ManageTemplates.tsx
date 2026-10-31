import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Save, Info } from 'lucide-react';

export function ManageTemplates() {
  const { proveedores, importData } = useStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempLinea, setTempLinea] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setTempLinea(proveedores[index].plantilla.linea);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    
    // Aquí idealmente tendríamos un updateProveedor en el store
    // Por ahora usamos un workaround para actualizar el store
    const state = useStore.getState();
    const newProveedores = [...state.proveedores];
    newProveedores[editingIndex] = {
      ...newProveedores[editingIndex],
      plantilla: {
        ...newProveedores[editingIndex].plantilla,
        linea: tempLinea
      }
    };
    
    state.importData({ ...state, proveedores: newProveedores });
    setEditingIndex(null);
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-safe">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex gap-3">
        <Info className="w-6 h-6 shrink-0" />
        <div>
          <p className="font-bold mb-1">Variables de plantilla</p>
          <p>Usa estas variables para dar formato a la extracción:</p>
          <ul className="list-disc ml-4 mt-2 font-mono text-xs opacity-80">
            <li>{"{cantidad}"}: Número seleccionado</li>
            <li>{"{nombre}"}: Nombre del producto</li>
            <li>{"{unidad}"}: Unidad seleccionada</li>
            <li>{"[[texto]]"}: Solo aparece si la unidad existe</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600" />
          Formatos de Salida
        </div>

        <ul className="divide-y divide-gray-100">
          {proveedores.map((prov, index) => (
            <li key={prov.id} className="p-4">
              <div className="font-bold text-sm text-gray-800 mb-2">{prov.nombre}</div>
              
              {editingIndex === index ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempLinea}
                    onChange={(e) => setTempLinea(e.target.value)}
                    className="flex-1 min-w-0 font-mono text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                  />
                  <button 
                    onClick={saveEdit}
                    className="bg-green-600 text-white p-2 rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  className="bg-gray-50 font-mono text-xs p-3 rounded-lg border border-gray-100 cursor-text hover:border-gray-300 transition-colors"
                  onClick={() => startEdit(index)}
                >
                  {prov.plantilla.linea}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
