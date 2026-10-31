import { useEffect } from 'react';
import { Undo2, X } from 'lucide-react';

export interface UndoInfo {
  message: string;
  onUndo: () => void;
}

/** Bottom toast with a «Deshacer» button; disappears after a few seconds. */
export function UndoToast({ info, onClose }: { info: UndoInfo | null; onClose: () => void }) {
  useEffect(() => {
    if (!info) return undefined;
    const t = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(t);
  }, [info, onClose]);

  if (!info) return null;
  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-sm flex items-center gap-2 rounded-xl bg-gray-900 text-white pl-4 pr-1.5 py-1.5 shadow-xl"
      style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <span className="flex-1 text-sm">{info.message}</span>
      <button
        type="button"
        onClick={() => {
          info.onUndo();
          onClose();
        }}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold text-amber-300 active:bg-white/10"
      >
        <Undo2 className="w-4 h-4" /> Deshacer
      </button>
      <button type="button" aria-label="Cerrar" onClick={onClose} className="p-2 text-gray-400">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
