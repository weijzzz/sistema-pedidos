import React, { useMemo, useState } from 'react';
import { ArrowDownAZ, Plus, Search, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../store/useStore';
import { SortableList } from '../components/SortableList';
import { compareNombre, sortByOrden } from '../lib/order';
import { normalizeString } from '../utils/normalize';
import type { Producto, Subgrupo } from '../types';

const NO_SUB = '__none__';

export function ManageProducts() {
  const { productos, categorias, subgrupos, reorderProductos } = useStore();
  const sortedCats = useMemo(() => sortByOrden(categorias), [categorias]);
  const [catId, setCatId] = useState(sortedCats[0]?.id || '');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCatId = sortedCats.some((c) => c.id === catId) ? catId : sortedCats[0]?.id || '';
  const catSubgrupos = useMemo(
    () => sortByOrden(subgrupos.filter((s) => s.categoriaId === activeCatId)),
    [subgrupos, activeCatId]
  );
  const catProductos = useMemo(() => productos.filter((p) => p.categoriaId === activeCatId), [productos, activeCatId]);

  // Same structure as the home list: loose products first, then subgroups.
  const groups = useMemo(() => {
    const loose = sortByOrden(catProductos.filter((p) => !p.subgrupoId));
    const list: { key: string; title: string; items: Producto[] }[] = [];
    if (loose.length > 0 || catSubgrupos.length === 0) list.push({ key: NO_SUB, title: 'Sin subgrupo', items: loose });
    for (const s of catSubgrupos) {
      list.push({ key: s.id, title: s.nombre, items: sortByOrden(catProductos.filter((p) => p.subgrupoId === s.id)) });
    }
    return list;
  }, [catProductos, catSubgrupos]);

  const searchResults = useMemo(() => {
    const q = normalizeString(query);
    if (!q) return null;
    return catProductos.filter((p) => normalizeString(p.nombre).includes(q)).sort((a, b) => compareNombre(a.nombre, b.nombre));
  }, [catProductos, query]);

  const sortGroupAZ = (items: Producto[]) => {
    reorderProductos([...items].sort((a, b) => compareNombre(a.nombre, b.nombre)).map((p) => p.id));
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-3 pt-3 pb-2">
          {sortedCats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCatId(c.id);
                setEditingId(null);
                setAdding(false);
              }}
              className={clsx(
                'shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors',
                c.id === activeCatId ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600'
              )}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <div className="flex gap-2 px-3 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar en ${catProductos.length} productos`}
              aria-label="Buscar producto"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setAdding((v) => !v);
              setEditingId(null);
            }}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold active:bg-blue-700"
          >
            {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {adding ? 'Cerrar' : 'Añadir'}
          </button>
        </div>
      </div>

      <div className="p-3 pb-safe space-y-5">
        {adding && activeCatId && (
          <AddProductForm categoriaId={activeCatId} subgrupos={catSubgrupos} onDone={() => setAdding(false)} />
        )}

        {searchResults ? (
          <section>
            <p className="text-xs text-gray-500 mb-2">
              {searchResults.length} resultado(s) · borra la búsqueda para reordenar
            </p>
            <ul className="flex flex-col gap-1.5">
              {searchResults.map((p) => (
                <li key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <ProductItem
                    producto={p}
                    subgrupos={catSubgrupos}
                    editing={editingId === p.id}
                    onToggle={() => setEditingId(editingId === p.id ? null : p.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <>
            <p className="text-xs text-gray-500 text-center">
              Arrastra con <span className="font-bold">≡</span> o usa las flechas. El orden es el mismo de la lista y del pedido.
            </p>
            {groups.map((g) => (
              <section key={g.key} aria-label={g.title}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{g.title}</h3>
                  <span className="text-xs text-gray-400">{g.items.length}</span>
                  {g.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => sortGroupAZ(g.items)}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold text-blue-600 px-2 py-1 rounded-md active:bg-blue-50"
                    >
                      <ArrowDownAZ className="w-4 h-4" />
                      Ordenar A→Z
                    </button>
                  )}
                </div>
                {g.items.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl px-3 py-3 text-center">
                    Vacío
                  </p>
                ) : (
                  <SortableList
                    items={g.items}
                    label={(p) => p.nombre}
                    onReorder={reorderProductos}
                    showMoveButtons={editingId === null}
                    renderItem={(p) => (
                      <ProductItem
                        producto={p}
                        subgrupos={catSubgrupos}
                        editing={editingId === p.id}
                        onToggle={() => setEditingId(editingId === p.id ? null : p.id)}
                      />
                    )}
                  />
                )}
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ProductItem({
  producto,
  subgrupos,
  editing,
  onToggle,
}: {
  producto: Producto;
  subgrupos: Subgrupo[];
  editing: boolean;
  onToggle: () => void;
}) {
  const { updateProducto, deleteProducto, ajustes } = useStore();
  const [nombre, setNombre] = useState(producto.nombre);
  const [sub, setSub] = useState(producto.subgrupoId || '');
  const [unidad, setUnidad] = useState(producto.mostrarUnidad ? producto.unidad : '');
  const [notas, setNotas] = useState(producto.notas || '');

  const open = () => {
    setNombre(producto.nombre);
    setSub(producto.subgrupoId || '');
    setUnidad(producto.mostrarUnidad ? producto.unidad : '');
    setNotas(producto.notas || '');
    onToggle();
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    updateProducto(producto.id, {
      nombre: nombre.trim(),
      subgrupoId: sub || undefined,
      ...(unidad ? { unidad, mostrarUnidad: true } : { mostrarUnidad: false }),
      notas: notas.trim() || undefined,
    });
    onToggle();
  };

  if (!editing) {
    return (
      <button type="button" onClick={open} className="w-full text-left py-2.5 pr-1 min-w-0">
        <span className="block font-semibold text-gray-800 text-sm truncate">{producto.nombre}</span>
        <span className="block text-xs text-gray-400 truncate">
          {[producto.mostrarUnidad ? producto.unidad : null, producto.notas].filter(Boolean).join(' · ') || 'Tocar para editar'}
        </span>
      </button>
    );
  }

  return (
    <form onSubmit={save} className="py-2.5 pr-3 space-y-2">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        aria-label="Nombre"
        autoFocus
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          aria-label="Subgrupo"
          className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm"
        >
          <option value="">(Sin subgrupo)</option>
          {subgrupos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <select
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          aria-label="Unidad"
          className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm"
        >
          <option value="">(Sin unidad)</option>
          {ajustes.unidadesDisponibles.map((u) => (
            <option key={u.nombre} value={u.nombre}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Notas (opcional, sale en {notas})"
        aria-label="Notas"
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`¿Borrar «${producto.nombre}»?`)) deleteProducto(producto.id);
          }}
          aria-label={`Borrar ${producto.nombre}`}
          className="p-2.5 rounded-lg text-red-600 bg-red-50 active:bg-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={onToggle} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!nombre.trim()}
          className="flex-[2] py-2 rounded-lg text-sm font-bold text-white bg-blue-600 disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

function AddProductForm({ categoriaId, subgrupos, onDone }: { categoriaId: string; subgrupos: Subgrupo[]; onDone: () => void }) {
  const { addProducto, categorias, ajustes } = useStore();
  const cat = categorias.find((c) => c.id === categoriaId);
  const [nombre, setNombre] = useState('');
  const [sub, setSub] = useState('');
  const [added, setAdded] = useState<string[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nombre.trim();
    if (!name || !cat) return;
    addProducto({
      id: `p-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      nombre: name,
      categoriaId,
      subgrupoId: sub || undefined,
      unidad: cat.unidadPorDefecto || ajustes.unidadesDisponibles[0]?.nombre || 'unidad',
      mostrarUnidad: false,
      cantidad: 0,
      orden: 0, // replaced by the store: end of its group
    });
    setAdded((a) => [name, ...a].slice(0, 3));
    setNombre(''); // keep the form open to add several in a row
  };

  return (
    <form onSubmit={submit} className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
      <p className="text-sm font-bold text-blue-900">Nuevo producto en {cat?.nombre}</p>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del producto"
        aria-label="Nombre del nuevo producto"
        autoFocus
        enterKeyHint="done"
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <select
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          aria-label="Subgrupo del nuevo producto"
          className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm"
        >
          <option value="">(Sin subgrupo)</option>
          {subgrupos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!nombre.trim()} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold disabled:opacity-40">
          Añadir
        </button>
        <button type="button" onClick={onDone} className="px-3 py-2 rounded-lg bg-white text-gray-600 text-sm border border-gray-300">
          Listo
        </button>
      </div>
      {added.length > 0 && <p className="text-xs text-blue-800">✓ Añadido: {added.join(', ')}</p>}
    </form>
  );
}
