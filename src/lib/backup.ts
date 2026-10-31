import type { AppState } from '../types';

export const BACKUP_APP = 'sistema-pedidos';

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: AppState;
}

export function pickState(state: AppState): AppState {
  const { categorias, subgrupos, productos, proveedores, ajustes } = state;
  return { categorias, subgrupos, productos, proveedores, ajustes };
}

export function makeBackup(state: AppState, version: number): BackupFile {
  return { app: BACKUP_APP, version, exportedAt: new Date().toISOString(), data: pickState(state) };
}

function isAppState(x: unknown): x is AppState {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  return (
    Array.isArray(s.categorias) &&
    Array.isArray(s.productos) &&
    Array.isArray(s.subgrupos) &&
    Array.isArray(s.proveedores) &&
    !!s.ajustes &&
    typeof s.ajustes === 'object'
  );
}

/**
 * Read a backup in any of the shapes we may meet:
 * - a file exported by this app ({ app, data })
 * - the raw localStorage value of the old app ({ state, version }), which is
 *   what you get when copying `pedidos-storage` out of an old install
 * - a bare state object
 */
export function parseBackup(text: string): AppState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error('El texto no es un JSON válido.');
  }
  const obj = parsed as Record<string, unknown>;
  const candidate = obj?.data ?? obj?.state ?? obj;
  if (!isAppState(candidate)) {
    throw new Error('No parece una copia de seguridad del Sistema de Pedidos.');
  }
  return pickState(candidate);
}

export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `pedidos-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}
