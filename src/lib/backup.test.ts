import { describe, expect, it } from 'vitest';
import { makeBackup, parseBackup } from './backup';
import { initialData } from '../data/seedData';

describe('backup', () => {
  it('round-trips an exported file', () => {
    const file = JSON.stringify(makeBackup(initialData, 4));
    expect(parseBackup(file)).toEqual(initialData);
  });

  it('accepts the raw localStorage value of the old app ({ state, version })', () => {
    const raw = JSON.stringify({ state: { ...initialData, someAction: null }, version: 3 });
    const out = parseBackup(raw);
    expect(out.productos.length).toBe(initialData.productos.length);
    expect(Object.keys(out).sort()).toEqual(['ajustes', 'categorias', 'productos', 'proveedores', 'subgrupos']);
  });

  it('rejects other JSON with a clear message', () => {
    expect(() => parseBackup('{"billmgr_stores":[]}')).toThrow(/copia de seguridad/);
    expect(() => parseBackup('not json')).toThrow(/JSON/);
  });
});
