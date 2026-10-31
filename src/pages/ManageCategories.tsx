import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, FolderTree, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { SortableList } from '../components/SortableList';
import { sortByOrden } from '../lib/order';
import type { Categoria, Subgrupo } from '../types';

export function ManageCategories() {
  const { categorias, subgrupos, productos, addCategoria, addSubgrupo, reorderCategorias, reorderSubgrupos, ajustes, proveedores } =
    useStore();
  const sortedCats = useMemo(() => sortByOrden(categorias), [categorias]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatUnidad, setNewCatUnidad] = useState(ajustes.unidadesDisponibles[0]?.nombre || 'unidad');
  const [editingCat, setEditingCat] = useState<string | null>(null);

  const [subCatId, setSubCatId] = useState(sortedCats[0]?.id || '');
  const activeSubCat = sortedCats.some((c) => c.id === subCatId) ? subCatId : sortedCats[0]?.id || '';
  const catSubs = useMemo(() => sortByOrden(subgrupos.filter((s) => s.categoriaId === activeSubCat)), [subgrupos, activeSubCat]);
  const [newSubName, setNewSubName] = useState('');
  const [editingSub, setEditingSub] = useState<string | null>(null);

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategoria({
      id: `cat-${Date.now()}`,
      nombre: newCatName.trim(),
      orden: 0, // the store appends it at the end
      unidadPorDefecto: newCatUnidad,
      proveedorIds: [proveedores.find((p) => p.id === 'prov-generico')?.id || proveedores[0]?.id].filter(Boolean) as string[],
    });
    setNewCatName('');
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !activeSubCat) return;
    addSubgrupo({ id: `sub-${Date.now()}`, nombre: newSubName.trim(), categoriaId: activeSubCat, orden: 0 });
    setNewSubName('');
  };

  return (
    <div className="p-3 flex flex-col gap-5 pb-safe">
      {/* Categorías */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
          <FolderTree className="w-5 h-5 mr-2 text-blue-600" />
          Categorías
          <span className="ml-auto text-xs font-normal text-gray-500">orden de las pestañas</span>
        </div>

        <div className="p-3 border-b border-gray-100">
          <form onSubmit={handleAddCat} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nueva categoría"
              aria-label="Nueva categoría"
              className="flex-1 min-w-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            />
            <select
              value={newCatUnidad}
              onChange={(e) => setNewCatUnidad(e.target.value)}
              aria-label="Unidad por defecto"
              className="w-24 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2"
            >
              {ajustes.unidadesDisponibles.map((u) => (
                <option key={u.nombre} value={u.nombre}>
                  {u.nombre}
                </option>
              ))}
            </select>
            <button type="submit" disabled={!newCatName.trim()} aria-label="Añadir categoría" className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50">
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="p-2 bg-gray-50">
          <SortableList
            items={sortedCats}
            label={(c) => c.nombre}
            onReorder={reorderCategorias}
            showMoveButtons={editingCat === null}
            renderItem={(cat) => (
              <CategoriaItem
                cat={cat}
                count={productos.filter((p) => p.categoriaId === cat.id).length}
                editing={editingCat === cat.id}
                onToggle={() => setEditingCat(editingCat === cat.id ? null : cat.id)}
              />
            )}
          />
        </div>
      </section>

      {/* Subgrupos */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-indigo-600" />
          Subgrupos
        </div>

        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-3 pt-3">
          {sortedCats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSubCatId(c.id);
                setEditingSub(null);
              }}
              className={clsx(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border',
                c.id === activeSubCat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-600'
              )}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        <div className="p-3 border-b border-gray-100">
          <form onSubmit={handleAddSub} className="flex gap-2">
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="Nuevo subgrupo"
              aria-label="Nuevo subgrupo"
              className="flex-1 min-w-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
            />
            <button
              type="submit"
              disabled={!newSubName.trim() || !activeSubCat}
              aria-label="Añadir subgrupo"
              className="bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="p-2 bg-gray-50">
          {catSubs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Esta categoría no tiene subgrupos</p>
          ) : (
            <SortableList
              items={catSubs}
              label={(s) => s.nombre}
              onReorder={reorderSubgrupos}
              showMoveButtons={editingSub === null}
              renderItem={(sub) => (
                <SubgrupoItem
                  sub={sub}
                  count={productos.filter((p) => p.subgrupoId === sub.id).length}
                  editing={editingSub === sub.id}
                  onToggle={() => setEditingSub(editingSub === sub.id ? null : sub.id)}
                />
              )}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function CategoriaItem({ cat, count, editing, onToggle }: { cat: Categoria; count: number; editing: boolean; onToggle: () => void }) {
  const { updateCategoria, deleteCategoria, ajustes, proveedores } = useStore();
  const [nombre, setNombre] = useState(cat.nombre);
  const [unidad, setUnidad] = useState(cat.unidadPorDefecto);
  const [provs, setProvs] = useState<string[]>(cat.proveedorIds);

  const open = () => {
    setNombre(cat.nombre);
    setUnidad(cat.unidadPorDefecto);
    setProvs(cat.proveedorIds);
    onToggle();
  };

  if (!editing) {
    const provNames = cat.proveedorIds.map((id) => proveedores.find((p) => p.id === id)?.nombre).filter(Boolean);
    return (
      <button type="button" onClick={open} className="w-full text-left py-2.5 pr-1 min-w-0">
        <span className="block font-bold text-gray-800 text-sm truncate">{cat.nombre}</span>
        <span className="block text-xs text-gray-400 truncate">
          {count} productos · {cat.unidadPorDefecto} · {provNames.join(', ') || 'sin formato'}
        </span>
      </button>
    );
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    updateCategoria(cat.id, { nombre: nombre.trim(), unidadPorDefecto: unidad, proveedorIds: provs });
    onToggle();
  };

  return (
    <form onSubmit={save} className="py-2.5 pr-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          aria-label="Nombre de la categoría"
          className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select value={unidad} onChange={(e) => setUnidad(e.target.value)} aria-label="Unidad por defecto" className="w-24 bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm">
          {ajustes.unidadesDisponibles.map((u) => (
            <option key={u.nombre} value={u.nombre}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Formato de pedido (proveedor):</p>
        <div className="flex flex-wrap gap-1.5">
          {proveedores.map((p) => {
            const on = provs.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => setProvs(on ? provs.filter((x) => x !== p.id) : [...provs, p.id])}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-semibold border',
                  on ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-500'
                )}
              >
                {p.nombre}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={`Borrar ${cat.nombre}`}
          onClick={() => {
            if (window.confirm(`¿Borrar la categoría «${cat.nombre}»? También se borrarán sus ${count} productos.`)) deleteCategoria(cat.id);
          }}
          className="p-2.5 rounded-lg text-red-600 bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={onToggle} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={!nombre.trim()} className="flex-[2] py-2 rounded-lg text-sm font-bold text-white bg-blue-600 disabled:opacity-40">
          Guardar
        </button>
      </div>
    </form>
  );
}

function SubgrupoItem({ sub, count, editing, onToggle }: { sub: Subgrupo; count: number; editing: boolean; onToggle: () => void }) {
  const { updateSubgrupo, deleteSubgrupo } = useStore();
  const [nombre, setNombre] = useState(sub.nombre);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setNombre(sub.nombre);
          onToggle();
        }}
        className="w-full text-left py-2.5 pr-1 min-w-0"
      >
        <span className="block font-bold text-gray-800 text-sm truncate">{sub.nombre}</span>
        <span className="block text-xs text-gray-400">{count} productos</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        updateSubgrupo(sub.id, { nombre: nombre.trim() });
        onToggle();
      }}
      className="py-2.5 pr-3 flex gap-2"
    >
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        aria-label="Nombre del subgrupo"
        className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <button
        type="button"
        aria-label={`Borrar ${sub.nombre}`}
        onClick={() => {
          if (window.confirm(`¿Borrar el subgrupo «${sub.nombre}»? Sus ${count} productos pasan a «sin subgrupo».`)) deleteSubgrupo(sub.id);
        }}
        className="p-2.5 rounded-lg text-red-600 bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button type="submit" disabled={!nombre.trim()} className="px-3 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 disabled:opacity-40">
        OK
      </button>
    </form>
  );
}
