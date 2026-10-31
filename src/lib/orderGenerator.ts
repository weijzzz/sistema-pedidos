import { AppState } from '../types';
import { renderTemplate, pluralize } from './templates';

export function generateOrderText(
  state: AppState,
  categoriaIds: string[],
  proveedorId: string
): string {
  const proveedor = state.proveedores.find(p => p.id === proveedorId);
  if (!proveedor) return '';
  const plantilla = proveedor.plantilla;
  const customPlurals = state.ajustes.unidadesDisponibles;
  
  const today = new Date();
  const fecha = today.toLocaleDateString('es-ES');
  const fechaCorta = today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  
  const globalVars: Record<string, string> = {
    fecha,
    fecha_corta: fechaCorta,
    tienda: state.ajustes.nombreTienda || 'Mi Tienda',
    proveedor: proveedor.nombre,
  };

  let hasAnyProducts = false;
  let orderText = '';

  // 1. Cabecera global
  if (plantilla.cabecera) {
    orderText += renderTemplate(plantilla.cabecera, globalVars) + '\n';
  }

  // 2. Iterar sobre las categorías seleccionadas que pertenecen a este proveedor
  const catsParaProveedor = state.categorias
    .filter(c => categoriaIds.includes(c.id) && c.proveedorIds.includes(proveedorId))
    .sort((a, b) => a.orden - b.orden);

  let nLine = 1;

  catsParaProveedor.forEach(cat => {
    // Buscar productos de esta categoría con cantidad seleccionada
    const productosCat = state.productos.filter(p => p.categoriaId === cat.id && p.cantidad !== 0 && p.cantidad !== '');
    
    if (productosCat.length === 0) return; // Si no hay productos, saltar categoría
    
    // Imprimir cabecera de categoría si está definida
    if (plantilla.cabeceraCategoria) {
      orderText += renderTemplate(plantilla.cabeceraCategoria, { ...globalVars, categoria: cat.nombre }) + '\n';
    }

    // Agrupar por subgrupos
    // Primero los que no tienen subgrupo
    const sinSubgrupo = productosCat.filter(p => !p.subgrupoId).sort((a, b) => a.orden - b.orden);
    sinSubgrupo.forEach(p => {
      hasAnyProducts = true;
      const formatCantidad = (val: number | string) => typeof val === 'number' ? val.toString() : val;
      
      const vars: Record<string, string> = {
        ...globalVars,
        categoria: cat.nombre,
        nombre: p.nombre,
        cantidad: formatCantidad(p.cantidad),
        unidad: p.mostrarUnidad ? p.unidad : '',
        unidad_plural: p.mostrarUnidad ? pluralize(p.unidad, customPlurals) : '',
        notas: p.notas || '',
        n: (nLine++).toString(),
      };
      orderText += renderTemplate(plantilla.linea, vars) + '\n';
    });

    // Luego los que tienen subgrupo, en orden de subgrupos
    const subgrupos = state.subgrupos.filter(s => s.categoriaId === cat.id).sort((a, b) => a.orden - b.orden);
    subgrupos.forEach(sub => {
      const subProductos = productosCat.filter(p => p.subgrupoId === sub.id).sort((a, b) => a.orden - b.orden);
      if (subProductos.length > 0) {
        if (plantilla.cabeceraSubgrupo) {
          orderText += renderTemplate(plantilla.cabeceraSubgrupo, { ...globalVars, categoria: cat.nombre, subgrupo: sub.nombre }) + '\n';
        }
        subProductos.forEach(p => {
          hasAnyProducts = true;
          const formatCantidad = (val: number | string) => typeof val === 'number' ? val.toString() : val;
          
          const vars: Record<string, string> = {
            ...globalVars,
            categoria: cat.nombre,
            subgrupo: sub.nombre,
            nombre: p.nombre,
            cantidad: formatCantidad(p.cantidad),
            unidad: p.mostrarUnidad ? p.unidad : '',
            unidad_plural: p.mostrarUnidad ? pluralize(p.unidad, customPlurals) : '',
            notas: p.notas || '',
            n: (nLine++).toString(),
          };
          orderText += renderTemplate(plantilla.linea, vars) + '\n';
        });
      }
    });
  });

  // 3. Pie
  if (hasAnyProducts && plantilla.pie) {
    orderText += renderTemplate(plantilla.pie, globalVars) + '\n';
  }

  return hasAnyProducts ? orderText.trim() : 'No hay productos con cantidad';
}
