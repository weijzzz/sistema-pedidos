export type Unidad = string;

export interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  subgrupoId?: string;
  unidad: Unidad;
  mostrarUnidad: boolean;
  cantidad: number | string;
  orden: number;
  notas?: string;
}

export interface Subgrupo {
  id: string;
  nombre: string;
  categoriaId: string;
  orden: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  unidadPorDefecto: Unidad;
  proveedorIds: string[];
}

export interface Plantilla {
  cabecera: string;
  linea: string;
  cabeceraSubgrupo: string;
  cabeceraCategoria: string;
  pie: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  plantilla: Plantilla;
}

export interface Ajustes {
  unidadesDisponibles: { nombre: Unidad; plural: string }[];
  nombreTienda: string;
}

export interface AppState {
  categorias: Categoria[];
  subgrupos: Subgrupo[];
  productos: Producto[];
  proveedores: Proveedor[];
  ajustes: Ajustes;
}
