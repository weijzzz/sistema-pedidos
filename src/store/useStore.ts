import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Producto, Categoria, Subgrupo, Proveedor, Ajustes } from '../types';
import { initialData } from '../data/seedData';
import { applyOrder, nextOrden, normalizeOrden } from '../lib/order';

/** Bump together with a `migrate` step. Data is never dropped by a bump. */
export const STORE_VERSION = 4;

interface StoreActions {
  // Inicialización o limpieza
  resetStore: () => void;
  importData: (data: AppState) => void;

  // Productos
  updateProductoCantidad: (id: string, cantidad: number | string) => void;
  /** Add `delta` to the current quantity (reads fresh state, safe to repeat). */
  stepProductoCantidad: (id: string, delta: number) => void;
  /** Put quantities back, e.g. to undo «Poner a 0». */
  restoreCantidades: (snapshot: [string, number | string][]) => void;
  toggleProductoUnidad: (id: string, unidadPorDefecto: string) => void;
  setProductoUnidad: (id: string, unidad: string) => void;
  clearProductosByCategoria: (categoriaId?: string) => void;

  // Operaciones masivas de unidad por categoría
  setUnidadAllInCategoria: (categoriaId: string, unidadPorDefecto: string) => void;
  removeUnidadAllInCategoria: (categoriaId: string) => void;

  // CRUD y Gestión
  addProducto: (producto: Producto) => void;
  addProductos: (productos: Omit<Producto, 'orden'>[]) => void;
  updateProducto: (id: string, updates: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
  setProductos: (productos: Producto[]) => void;
  /** New order for the products of one group (category + subgroup). */
  reorderProductos: (orderedIds: string[]) => void;

  addCategoria: (categoria: Categoria) => void;
  updateCategoria: (id: string, updates: Partial<Categoria>) => void;
  deleteCategoria: (id: string) => void;
  reorderCategorias: (orderedIds: string[]) => void;

  addSubgrupo: (subgrupo: Subgrupo) => void;
  updateSubgrupo: (id: string, updates: Partial<Subgrupo>) => void;
  deleteSubgrupo: (id: string) => void;
  reorderSubgrupos: (orderedIds: string[]) => void;

  addProveedor: (proveedor: Proveedor) => void;
  updateProveedor: (id: string, updates: Partial<Proveedor>) => void;
  deleteProveedor: (id: string) => void;

  updateAjustes: (updates: Partial<Ajustes>) => void;
}

export type AppStore = AppState & StoreActions;

function parseCantidad(c: number | string): number {
  if (typeof c === 'number') return c;
  const n = parseFloat(String(c).replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialData,

      resetStore: () => set(initialData),

      importData: (data) =>
        set({
          categorias: data.categorias,
          subgrupos: data.subgrupos,
          productos: normalizeOrden(data.productos),
          proveedores: data.proveedores,
          ajustes: data.ajustes,
        }),

      updateProductoCantidad: (id, cantidad) =>
        set((state) => ({
          productos: state.productos.map((p) => {
            if (p.id === id) {
              const newCantidad = typeof cantidad === 'number' ? Math.max(0, cantidad) : cantidad;
              return { ...p, cantidad: newCantidad };
            }
            return p;
          }),
        })),

      stepProductoCantidad: (id, delta) =>
        set((state) => ({
          productos: state.productos.map((p) => {
            if (p.id !== id) return p;
            const next = Math.max(0, Math.round((parseCantidad(p.cantidad) + delta) * 100) / 100);
            return { ...p, cantidad: next };
          }),
        })),

      restoreCantidades: (snapshot) =>
        set((state) => {
          const map = new Map(snapshot);
          return {
            productos: state.productos.map((p) => (map.has(p.id) ? { ...p, cantidad: map.get(p.id)! } : p)),
          };
        }),

      toggleProductoUnidad: (id, unidadPorDefecto) =>
        set((state) => ({
          productos: state.productos.map((p) => {
            if (p.id === id) {
              if (p.mostrarUnidad) {
                return { ...p, mostrarUnidad: false };
              } else {
                return { ...p, mostrarUnidad: true, unidad: unidadPorDefecto };
              }
            }
            return p;
          }),
        })),

      setProductoUnidad: (id, unidad) =>
        set((state) => ({
          productos: state.productos.map((p) => (p.id === id ? { ...p, unidad, mostrarUnidad: true } : p)),
        })),

      clearProductosByCategoria: (categoriaId) =>
        set((state) => ({
          productos: state.productos.map((p) => {
            if (!categoriaId || p.categoriaId === categoriaId) {
              return { ...p, cantidad: 0 };
            }
            return p;
          }),
        })),

      setUnidadAllInCategoria: (categoriaId, unidadPorDefecto) =>
        set((state) => ({
          productos: state.productos.map((p) =>
            p.categoriaId === categoriaId ? { ...p, mostrarUnidad: true, unidad: unidadPorDefecto } : p
          ),
        })),

      removeUnidadAllInCategoria: (categoriaId) =>
        set((state) => ({
          productos: state.productos.map((p) => (p.categoriaId === categoriaId ? { ...p, mostrarUnidad: false } : p)),
        })),

      // CRUD Implementations
      addProducto: (producto) =>
        set((state) => ({
          productos: [
            ...state.productos,
            { ...producto, orden: nextOrden(state.productos, producto.categoriaId, producto.subgrupoId) },
          ],
        })),

      addProductos: (nuevos) =>
        set((state) => {
          const productos = [...state.productos];
          for (const p of nuevos) {
            productos.push({ ...p, orden: nextOrden(productos, p.categoriaId, p.subgrupoId) } as Producto);
          }
          return { productos };
        }),

      updateProducto: (id, updates) =>
        set((state) => ({
          productos: state.productos.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates };
            // Moving to another subgroup/category: go to the end of the new group.
            if (
              ('subgrupoId' in updates && updates.subgrupoId !== p.subgrupoId) ||
              ('categoriaId' in updates && updates.categoriaId !== p.categoriaId)
            ) {
              merged.orden = nextOrden(
                state.productos.filter((x) => x.id !== id),
                merged.categoriaId,
                merged.subgrupoId
              );
            }
            return merged;
          }),
        })),

      deleteProducto: (id) =>
        set((state) => ({
          productos: state.productos.filter((p) => p.id !== id),
        })),

      setProductos: (productos) => set({ productos }),

      reorderProductos: (orderedIds) => set((state) => ({ productos: applyOrder(state.productos, orderedIds) })),

      addCategoria: (categoria) =>
        set((state) => ({
          categorias: [
            ...state.categorias,
            { ...categoria, orden: Math.max(-1, ...state.categorias.map((c) => c.orden)) + 1 },
          ],
        })),

      updateCategoria: (id, updates) =>
        set((state) => ({
          categorias: state.categorias.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCategoria: (id) =>
        set((state) => ({
          categorias: state.categorias.filter((c) => c.id !== id),
          subgrupos: state.subgrupos.filter((s) => s.categoriaId !== id),
          productos: state.productos.filter((p) => p.categoriaId !== id),
        })),

      reorderCategorias: (orderedIds) => set((state) => ({ categorias: applyOrder(state.categorias, orderedIds) })),

      addSubgrupo: (subgrupo) =>
        set((state) => {
          const siblings = state.subgrupos.filter((s) => s.categoriaId === subgrupo.categoriaId);
          return {
            subgrupos: [...state.subgrupos, { ...subgrupo, orden: Math.max(-1, ...siblings.map((s) => s.orden)) + 1 }],
          };
        }),

      updateSubgrupo: (id, updates) =>
        set((state) => ({
          subgrupos: state.subgrupos.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteSubgrupo: (id) =>
        set((state) => {
          // Products of the subgroup become «sin subgrupo», appended after
          // the ones already there.
          const productos = state.productos.map((p) => (p.subgrupoId === id ? { ...p, subgrupoId: undefined, orden: Number.POSITIVE_INFINITY } : p));
          return {
            subgrupos: state.subgrupos.filter((s) => s.id !== id),
            productos: normalizeOrden(productos),
          };
        }),

      reorderSubgrupos: (orderedIds) => set((state) => ({ subgrupos: applyOrder(state.subgrupos, orderedIds) })),

      addProveedor: (proveedor) => set((state) => ({ proveedores: [...state.proveedores, proveedor] })),

      updateProveedor: (id, updates) =>
        set((state) => ({
          proveedores: state.proveedores.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deleteProveedor: (id) =>
        set((state) => ({
          proveedores: state.proveedores.filter((p) => p.id !== id),
          categorias: state.categorias.map((c) => ({ ...c, proveedorIds: c.proveedorIds.filter((x) => x !== id) })),
        })),

      updateAjustes: (updates) => set((state) => ({ ajustes: { ...state.ajustes, ...updates } })),
    }),
    {
      name: 'pedidos-storage',
      version: STORE_VERSION,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        if (version === 0 || version === 1 || version === 2) {
          // Forzar sincronización con los nuevos datos semilla (subgrupos y templates)
          state = {
            ...state,
            proveedores: initialData.proveedores,
            subgrupos: initialData.subgrupos,
          };
        }
        if (version < 4 && Array.isArray(state?.productos)) {
          // v4: renumber `orden` per group so reordering is predictable. Only
          // the order field changes; quantities, names and units are kept.
          state = { ...state, productos: normalizeOrden(state.productos) };
        }
        return state;
      },
    }
  )
);
