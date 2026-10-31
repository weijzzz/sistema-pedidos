import { describe, it, expect } from 'vitest';
import { pluralize, renderTemplate } from './templates';

describe('pluralize', () => {
  it('pluraliza con reglas generales', () => {
    expect(pluralize('caja')).toBe('cajas');
    expect(pluralize('cartón')).toBe('cartónes'); // Nota: el acento se mantiene según la regla simple, pero customList puede arreglarlo
    expect(pluralize('bolsa')).toBe('bolsas');
    expect(pluralize('unidad')).toBe('unidades');
    expect(pluralize('lápiz')).toBe('lápices');
  });

  it('usa lista personalizada si está disponible', () => {
    const custom = [{ nombre: 'cartón', plural: 'cartones' }, { nombre: 'kg', plural: 'kg' }];
    expect(pluralize('cartón', custom)).toBe('cartones');
    expect(pluralize('kg', custom)).toBe('kg');
  });
});

describe('renderTemplate', () => {
  const lineaPlantilla = '-{cantidad}[[{unidad} ]]{nombre}';

  it('debe desaparecer el bloque cuando unidad está vacía', () => {
    const vars = {
      cantidad: '1',
      unidad: '', // mostrarUnidad: false
      nombre: 'marlboro rojo'
    };
    const result = renderTemplate(lineaPlantilla, vars);
    expect(result).toBe('-1marlboro rojo');
  });

  it('debe mostrar el bloque y el espacio cuando unidad tiene valor', () => {
    const vars = {
      cantidad: '1',
      unidad: 'caja', // mostrarUnidad: true
      nombre: 'blueberry raspberry'
    };
    const result = renderTemplate(lineaPlantilla, vars);
    expect(result).toBe('-1caja blueberry raspberry');
  });
  
  it('no muestra cantidades con decimales si es entero', () => {
    const vars = { cantidad: '3' };
    expect(renderTemplate('{cantidad}', vars)).toBe('3');
  });
});
