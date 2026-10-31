import { describe, expect, it } from 'vitest';
import { applyOrder, moveId, nextOrden, normalizeOrden } from './order';
import type { Producto } from '../types';

const p = (id: string, orden: number, subgrupoId?: string, categoriaId = 'c1'): Producto => ({
  id,
  nombre: id,
  categoriaId,
  subgrupoId,
  unidad: 'caja',
  mostrarUnidad: false,
  cantidad: 0,
  orden,
});

describe('normalizeOrden', () => {
  it('renumbers each group from 0 and keeps the visual order', () => {
    const out = normalizeOrden([p('a', 5), p('b', 2), p('x', 100, 's1'), p('c', 9), p('y', 50, 's1')]);
    const byId = Object.fromEntries(out.map((x) => [x.id, x.orden]));
    expect(byId).toEqual({ b: 0, a: 1, c: 2, y: 0, x: 1 });
  });

  it('breaks ties (old bulk paste used one Date.now() for all) by insertion order', () => {
    const t = 1730000000000;
    const out = normalizeOrden([p('uno', t), p('dos', t), p('tres', t)]);
    expect(out.map((x) => x.orden)).toEqual([0, 1, 2]);
  });

  it('puts products without a valid orden last', () => {
    const broken = { ...p('z', 0), orden: undefined as unknown as number };
    const out = normalizeOrden([broken, p('a', 3)]);
    expect(out.find((x) => x.id === 'z')!.orden).toBe(1);
  });

  it('keeps every other field untouched', () => {
    const src = [{ ...p('a', 7), cantidad: '2 cajas', notas: 'n' }];
    expect(normalizeOrden(src)[0]).toEqual({ ...src[0], orden: 0 });
  });
});

describe('ordering helpers', () => {
  it('nextOrden appends to the end of the right group', () => {
    const list = [p('a', 0), p('b', 4), p('x', 1, 's1')];
    expect(nextOrden(list, 'c1')).toBe(5);
    expect(nextOrden(list, 'c1', 's1')).toBe(2);
    expect(nextOrden(list, 'c2')).toBe(0);
  });

  it('applyOrder only touches the listed ids', () => {
    const out = applyOrder([p('a', 0), p('b', 1), p('x', 0, 's1')], ['b', 'a']);
    expect(out.map((x) => `${x.id}:${x.orden}`)).toEqual(['a:1', 'b:0', 'x:0']);
  });

  it('moveId moves within bounds', () => {
    expect(moveId(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(moveId(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});
