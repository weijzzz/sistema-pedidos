import React, { useRef, useState } from 'react';
import { useStore, STORE_VERSION } from '../store/useStore';
import { FileText, Info, Plus, Trash2, Store, HardDrive, Download, Share2, Upload, ClipboardPaste } from 'lucide-react';
import { renderTemplate, pluralize } from '../lib/templates';
import { backupFileName, makeBackup, parseBackup } from '../lib/backup';
import type { Plantilla, Proveedor } from '../types';

const FIELDS: { key: keyof Plantilla; label: string; hint: string }[] = [
  { key: 'cabecera', label: 'Cabecera del pedido', hint: 'p. ej. Pedido {tienda} {fecha}' },
  { key: 'cabeceraCategoria', label: 'Título de categoría', hint: 'p. ej. *{categoria}*' },
  { key: 'cabeceraSubgrupo', label: 'Título de subgrupo', hint: 'p. ej. — {subgrupo} —' },
  { key: 'linea', label: 'Línea de producto', hint: '-{cantidad} [[{unidad} ]]{nombre}' },
  { key: 'pie', label: 'Pie', hint: 'p. ej. Gracias' },
];

const VARS = [
  ['{cantidad}', 'cantidad pedida'],
  ['{nombre}', 'nombre del producto'],
  ['{unidad}', 'unidad (si se muestra)'],
  ['{unidad_plural}', 'unidad en plural'],
  ['{notas}', 'notas del producto'],
  ['{n}', 'número de línea'],
  ['{categoria} / {subgrupo}', 'nombre del grupo'],
  ['{fecha} / {fecha_corta}', 'fecha de hoy'],
  ['{tienda} / {proveedor}', 'nombres'],
  ['[[ … ]]', 'solo aparece si sus variables tienen valor'],
];

export function ManageTemplates() {
  const { proveedores, ajustes, updateAjustes, addProveedor } = useStore();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="p-3 flex flex-col gap-5 pb-safe">
      {/* Tienda */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="flex items-center gap-2 font-bold text-gray-800 mb-2" htmlFor="nombre-tienda">
          <Store className="w-5 h-5 text-blue-600" />
          Nombre de la tienda
        </label>
        <input
          id="nombre-tienda"
          type="text"
          value={ajustes.nombreTienda}
          onChange={(e) => updateAjustes({ nombreTienda: e.target.value })}
          placeholder="Sale en {tienda}"
          className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </section>

      {/* Formatos */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-600" />
          Formatos de pedido
          <button
            type="button"
            onClick={() => {
              const id = `prov-${Date.now()}`;
              addProveedor({ id, nombre: 'Nuevo proveedor', plantilla: { cabecera: '', cabeceraCategoria: '', cabeceraSubgrupo: '', linea: '-{cantidad} [[{unidad} ]]{nombre}', pie: '' } });
              setEditing(id);
            }}
            className="ml-auto flex items-center gap-1 text-xs font-semibold text-indigo-700 px-2 py-1 rounded-md active:bg-indigo-50"
          >
            <Plus className="w-4 h-4" /> Proveedor
          </button>
        </div>
        <ul className="divide-y divide-gray-100">
          {proveedores.map((prov) => (
            <ProveedorItem
              key={prov.id}
              prov={prov}
              canDelete={proveedores.length > 1}
              editing={editing === prov.id}
              onToggle={() => setEditing(editing === prov.id ? null : prov.id)}
            />
          ))}
        </ul>
        <details className="border-t border-gray-100 px-4 py-3 text-sm text-blue-900 bg-blue-50/50">
          <summary className="font-semibold flex items-center gap-2 cursor-pointer">
            <Info className="w-4 h-4" /> Variables disponibles
          </summary>
          <ul className="mt-2 space-y-0.5 text-xs">
            {VARS.map(([v, d]) => (
              <li key={v}>
                <code className="font-mono font-semibold">{v}</code> — {d}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <BackupSection />
    </div>
  );
}

function ProveedorItem({ prov, canDelete, editing, onToggle }: { prov: Proveedor; canDelete: boolean; editing: boolean; onToggle: () => void }) {
  const { updateProveedor, deleteProveedor, ajustes } = useStore();
  const [nombre, setNombre] = useState(prov.nombre);
  const [plantilla, setPlantilla] = useState<Plantilla>(prov.plantilla);

  if (!editing) {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            setNombre(prov.nombre);
            setPlantilla(prov.plantilla);
            onToggle();
          }}
          className="w-full text-left p-4"
        >
          <div className="font-bold text-sm text-gray-800 mb-1.5">{prov.nombre}</div>
          <div className="bg-gray-50 font-mono text-xs p-2.5 rounded-lg border border-gray-100 text-gray-700 truncate">{prov.plantilla.linea}</div>
        </button>
      </li>
    );
  }

  const example = renderTemplate(plantilla.linea, {
    cantidad: '2',
    nombre: 'marlboro rojo',
    unidad: 'caja',
    unidad_plural: pluralize('caja', ajustes.unidadesDisponibles),
    notas: '',
    n: '1',
    categoria: 'Tabaco',
    subgrupo: 'Cigarrillos',
    fecha: new Date().toLocaleDateString('es-ES'),
    fecha_corta: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    tienda: ajustes.nombreTienda || 'Mi Tienda',
    proveedor: nombre,
  });

  return (
    <li className="p-4 bg-indigo-50/40">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateProveedor(prov.id, { nombre: nombre.trim() || prov.nombre, plantilla });
          onToggle();
        }}
        className="space-y-2.5"
      >
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          aria-label="Nombre del proveedor"
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold"
        />
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs text-gray-500">{f.label}</span>
            <input
              type="text"
              value={plantilla[f.key]}
              onChange={(e) => setPlantilla({ ...plantilla, [f.key]: e.target.value })}
              placeholder={f.hint}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="mt-0.5 w-full font-mono text-xs bg-white border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>
        ))}
        <p className="text-xs text-gray-500">
          Ejemplo de línea: <code className="font-mono text-gray-800 bg-white px-1.5 py-0.5 rounded">{example || '—'}</code>
        </p>
        <div className="flex gap-2 pt-1">
          {canDelete && (
            <button
              type="button"
              aria-label={`Borrar ${prov.nombre}`}
              onClick={() => {
                if (window.confirm(`¿Borrar el formato «${prov.nombre}»? Las categorías que lo usan dejarán de usarlo.`)) deleteProveedor(prov.id);
              }}
              className="p-2.5 rounded-lg text-red-600 bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onToggle} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100">
            Cancelar
          </button>
          <button type="submit" className="flex-[2] py-2 rounded-lg text-sm font-bold text-white bg-indigo-600">
            Guardar
          </button>
        </div>
      </form>
    </li>
  );
}

function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const backupText = () => JSON.stringify(makeBackup(useStore.getState(), STORE_VERSION), null, 2);

  const download = () => {
    const blob = new Blob([backupText()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 200);
    setMsg({ ok: true, text: 'Copia descargada.' });
  };

  const share = async () => {
    const file = new File([backupText()], backupFileName(), { type: 'application/json' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Copia Sistema de Pedidos' });
      } else {
        await navigator.share({ text: backupText(), title: 'Copia Sistema de Pedidos' });
      }
    } catch {
      /* cancelled */
    }
  };

  const restore = (text: string) => {
    try {
      const data = parseBackup(text);
      const n = data.productos.length;
      if (!window.confirm(`¿Reemplazar los datos actuales por la copia (${data.categorias.length} categorías, ${n} productos)?`)) return;
      useStore.getState().importData(data);
      setMsg({ ok: true, text: `Copia restaurada: ${n} productos.` });
      setPasteOpen(false);
      setPasted('');
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'No se pudo leer la copia.' });
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) restore(await file.text());
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-800 flex items-center">
        <HardDrive className="w-5 h-5 mr-2 text-emerald-600" />
        Copia de seguridad
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-gray-500">
          Los datos solo están en este móvil. Guarda una copia antes de cambiar de móvil o borrar los datos del navegador.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={download} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
            <Download className="w-4 h-4" /> Descargar
          </button>
          {'share' in navigator && (
            <button type="button" onClick={share} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-semibold border border-emerald-200">
              <Share2 className="w-4 h-4" /> Compartir
            </button>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
            <Upload className="w-4 h-4" /> Restaurar archivo
          </button>
          <button type="button" onClick={() => setPasteOpen((v) => !v)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
            <ClipboardPaste className="w-4 h-4" /> Pegar texto
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json,text/plain" className="hidden" onChange={onFile} />
        {pasteOpen && (
          <div className="space-y-2">
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="Pega aquí la copia (JSON)"
              aria-label="Copia pegada"
              rows={5}
              className="w-full font-mono text-xs bg-gray-50 border border-gray-300 rounded-lg p-2"
            />
            <button
              type="button"
              disabled={!pasted.trim()}
              onClick={() => restore(pasted)}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold disabled:opacity-40"
            >
              Restaurar
            </button>
          </div>
        )}
        {msg && <p className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</p>}
      </div>
    </section>
  );
}
