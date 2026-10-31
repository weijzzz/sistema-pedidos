import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, FolderTree, Tag } from 'lucide-react';

export function ManageCategories() {
  const { categorias, subgrupos, addCategoria, deleteCategoria, addSubgrupo, deleteSubgrupo, ajustes } = useStore();
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatUnidad, setNewCatUnidad] = useState(ajustes.unidadesDisponibles[0]?.nombre || 'unidad');
  
  const [newSubName, setNewSubName] = useState('');
  const [newSubCatId, setNewSubCatId] = useState(categorias[0]?.id || '');

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategoria({
      id: `cat-${Date.now()}`,
      nombre: newCatName.trim(),
      orden: Date.now(),
      unidadPorDefecto: newCatUnidad,
      proveedorIds: ['prov-generico'], // Default
    });
    setNewCatName('');
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCatId) return;
    addSubgrupo({
      id: `sub-${Date.now()}`,
      nombre: newSubName.trim(),
      categoriaId: newSubCatId,
      orden: Date.now(),
    });
    setNewSubName('');
  };

  return (
    <div className="p-4 flex flex-col gap-6 pb-safe">
      
      {/* Sección Categorías */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
          <FolderTree className="w-5 h-5 mr-2 text-blue-600" />
          Categorías
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleAddCat} className="flex gap-2">
            <input 
              type="text" 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Nueva Categoría"
              className="flex-1 min-w-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            />
            <select
              value={newCatUnidad}
              onChange={e => setNewCatUnidad(e.target.value)}
              className="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2 py-2"
            >
              {ajustes.unidadesDisponibles.map(u => (
                <option key={u.nombre} value={u.nombre}>{u.nombre}</option>
              ))}
            </select>
            <button 
              type="submit"
              disabled={!newCatName.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {categorias.sort((a,b) => a.orden - b.orden).map(cat => (
            <li key={cat.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <div>
                <span className="font-bold text-gray-800">{cat.nombre}</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{cat.unidadPorDefecto}</span>
              </div>
              <button 
                onClick={() => {
                  if(window.confirm(`¿Borrar categoría ${cat.nombre}? También se borrarán sus productos.`)) {
                    deleteCategoria(cat.id);
                  }
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección Subgrupos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-indigo-600" />
          Subgrupos
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleAddSub} className="flex flex-col gap-2">
            <select
              value={newSubCatId}
              onChange={e => setNewSubCatId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            >
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                placeholder="Nuevo Subgrupo"
                className="flex-1 min-w-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
              />
              <button 
                type="submit"
                disabled={!newSubName.trim() || !newSubCatId}
                className="bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {subgrupos.sort((a,b) => a.orden - b.orden).map(sub => {
            const cat = categorias.find(c => c.id === sub.categoriaId);
            return (
              <li key={sub.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{sub.nombre}</span>
                  <span className="text-xs text-gray-500">en {cat?.nombre || 'Desconocido'}</span>
                </div>
                <button 
                  onClick={() => {
                    if(window.confirm(`¿Borrar subgrupo ${sub.nombre}?`)) {
                      deleteSubgrupo(sub.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
