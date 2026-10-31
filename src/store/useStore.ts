import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Producto, Categoria, Subgrupo, Proveedor, Ajustes } from '../types';
import { initialData } from '../data/seedData';

interface StoreActions {
  // Inicialización o limpieza
  resetStore: () => void;
  importData: (data: AppState) => void;
  
  // Productos
  updateProductoCantidad: (id: string, cantidad: number | string) => void;
  toggleProductoUnidad: (id: string, unidadPorDefecto: string) => void;
  setProductoUnidad: (id: string, unidad: string) => void;
  clearProductosByCategoria: (categoriaId?: string) => void;
  
  // Operaciones masivas de unidad por categoría
  setUnidadAllInCategoria: (categoriaId: string, unidadPorDefecto: string) => void;
  removeUnidadAllInCategoria: (categoriaId: string) => void;
  
  // CRUD y Gestión
  addProducto: (producto: Producto) => void;
  updateProducto: (id: string, updates: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
  setProductos: (productos: Producto[]) => void;
  
  addCategoria: (categoria: Categoria) => void;
  deleteCategoria: (id: string) => void;
  
  addSubgrupo: (subgrupo: Subgrupo) => void;
  deleteSubgrupo: (id: string) => void;
}

export type AppStore = AppState & StoreActions;

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialData,
      
      resetStore: () => set(initialData),
      
      importData: (data) => set(data),
      
      updateProductoCantidad: (id, cantidad) => 
        set((state) => ({
          productos: state.productos.map(p => {
            if (p.id === id) {
              const newCantidad = typeof cantidad === 'number' ? Math.max(0, cantidad) : cantidad;
              return { ...p, cantidad: newCantidad };
            }
            return p;
          })
        })),
        
      toggleProductoUnidad: (id, unidadPorDefecto) => 
        set((state) => ({
          productos: state.productos.map(p => {
            if (p.id === id) {
              if (p.mostrarUnidad) {
                return { ...p, mostrarUnidad: false };
              } else {
                return { ...p, mostrarUnidad: true, unidad: unidadPorDefecto };
              }
            }
            return p;
          })
        })),
        
      setProductoUnidad: (id, unidad) => 
        set((state) => ({
          productos: state.productos.map(p => 
            p.id === id ? { ...p, unidad, mostrarUnidad: true } : p
          )
        })),
        
      clearProductosByCategoria: (categoriaId) =>
        set((state) => ({
          productos: state.productos.map(p => {
            if (!categoriaId || p.categoriaId === categoriaId) {
              return { ...p, cantidad: 0 };
            }
            return p;
          })
        })),
        
      setUnidadAllInCategoria: (categoriaId, unidadPorDefecto) =>
        set((state) => ({
          productos: state.productos.map(p => 
            p.categoriaId === categoriaId 
              ? { ...p, mostrarUnidad: true, unidad: unidadPorDefecto } 
              : p
          )
        })),
        
      removeUnidadAllInCategoria: (categoriaId) =>
        set((state) => ({
          productos: state.productos.map(p => 
            p.categoriaId === categoriaId 
              ? { ...p, mostrarUnidad: false } 
              : p
          )
        })),
        
      // CRUD Implementations
      addProducto: (producto) => 
        set((state) => ({ productos: [...state.productos, producto] })),
        
      updateProducto: (id, updates) =>
        set((state) => ({
          productos: state.productos.map(p => p.id === id ? { ...p, ...updates } : p)
        })),
        
      deleteProducto: (id) =>
        set((state) => ({
          productos: state.productos.filter(p => p.id !== id)
        })),
        
      setProductos: (productos) =>
        set({ productos }),
        
      addCategoria: (categoria) =>
        set((state) => ({ categorias: [...state.categorias, categoria] })),
        
      deleteCategoria: (id) =>
        set((state) => ({
          categorias: state.categorias.filter(c => c.id !== id),
          // Opcional: borrar subgrupos y productos de esta categoría
          subgrupos: state.subgrupos.filter(s => s.categoriaId !== id),
          productos: state.productos.filter(p => p.categoriaId !== id)
        })),
        
      addSubgrupo: (subgrupo) =>
        set((state) => ({ subgrupos: [...state.subgrupos, subgrupo] })),
        
      deleteSubgrupo: (id) =>
        set((state) => ({
          subgrupos: state.subgrupos.filter(s => s.id !== id),
          // Opcional: quitar subgrupoId a los productos de este subgrupo
          productos: state.productos.map(p => p.subgrupoId === id ? { ...p, subgrupoId: undefined } : p)
        })),
    }),
    {
      name: 'pedidos-storage',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1 || version === 2) {
          // Forzar sincronización con los nuevos datos semilla (subgrupos y templates)
          return {
            ...persistedState,
            proveedores: initialData.proveedores,
            subgrupos: initialData.subgrupos,
          } as any;
        }
        return persistedState;
      }
    }
  )
);
