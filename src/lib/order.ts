import type { Producto } from '../types';

/**
 * Product order lives in `orden`, which only has to be consistent inside one
 * group (category + subgroup): that is how the list, the manager and the
 * generated order text all sort.
 */

export function groupKey(p: Pick<Producto, 'categoriaId' | 'subgrupoId'>): string {
  return `${p.categoriaId}::${p.subgrupoId ?? ''}`;
}

function ordenValue(p: Producto): number {
  return typeof p.orden === 'number' && Number.isFinite(p.orden) ? p.orden : Number.POSITIVE_INFINITY;
}

/**
 * Renumber `orden` to 0, 1, 2… inside every group, keeping the current visual
 * order. Older versions gave every product of one bulk paste the same
 * `orden` (Date.now()), which made drag-reordering jump around; ties are
 * broken by position in the array, i.e. the order they were added.
 */
export function normalizeOrden(productos: Producto[]): Producto[] {
  const groups = new Map<string, { p: Producto; i: number }[]>();
  productos.forEach((p, i) => {
    const key = groupKey(p);
    const list = groups.get(key);
    if (list) list.push({ p, i });
    else groups.set(key, [{ p, i }]);
  });

  const next = new Map<string, number>();
  groups.forEach((list) => {
    list
      .sort((a, b) => ordenValue(a.p) - ordenValue(b.p) || a.i - b.i)
      .forEach(({ p }, idx) => next.set(p.id, idx));
  });

  return productos.map((p) => (p.orden === next.get(p.id) ? p : { ...p, orden: next.get(p.id)! }));
}

/** `orden` for a product appended at the end of its group. */
export function nextOrden(productos: Producto[], categoriaId: string, subgrupoId?: string): number {
  const key = groupKey({ categoriaId, subgrupoId });
  let max = -1;
  for (const p of productos) {
    if (groupKey(p) === key && Number.isFinite(p.orden)) max = Math.max(max, p.orden);
  }
  return max + 1;
}

/** Apply a new order to the given ids (one group); everything else is untouched. */
export function applyOrder<T extends { id: string; orden: number }>(items: T[], orderedIds: string[]): T[] {
  const pos = new Map(orderedIds.map((id, i) => [id, i]));
  return items.map((item) => (pos.has(item.id) ? { ...item, orden: pos.get(item.id)! } : item));
}

export function sortByOrden<T extends { orden: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.orden - b.orden);
}

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

export function compareNombre(a: string, b: string): number {
  return collator.compare(a, b);
}

export function moveId(ids: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return ids;
  const next = [...ids];
  const [id] = next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}
