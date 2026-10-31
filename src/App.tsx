import { useState, useMemo, useCallback } from 'react';
import { useStore } from './store/useStore';
import { CategoryTabs } from './components/CategoryTabs';
import { MainToolbar } from './components/MainToolbar';
import { ProductList } from './components/ProductList';
import { BottomBar } from './components/BottomBar';
import { ExtractionModal } from './components/ExtractionModal';
import { UndoToast, type UndoInfo } from './components/UndoToast';
import { normalizeString } from './utils/normalize';
import { useBackButton } from './utils/useBackButton';
import { ManageView } from './pages/ManageView';
import { sortByOrden } from './lib/order';

function App() {
  const { categorias, productos, subgrupos } = useStore();
  const sortedCats = useMemo(() => sortByOrden(categorias), [categorias]);

  // Estado local de la vista principal
  const [currentView, setCurrentView] = useState<'home' | 'manage'>('home');
  const [selectedCategoriaId, setActiveCategoriaId] = useState<string>(sortedCats[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOrders, setShowOnlyOrders] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [undo, setUndo] = useState<UndoInfo | null>(null);

  // If the selected category was deleted in Gestión, fall back to the first
  // one instead of showing «Cargando…» forever.
  const activeCategoria = sortedCats.find((c) => c.id === selectedCategoriaId) ?? sortedCats[0];
  const activeCategoriaId = activeCategoria?.id ?? '';

  // Android back: leave Gestión / close the order sheet instead of the app.
  const closeManage = useCallback(() => setCurrentView('home'), []);
  const closeExtract = useCallback(() => setIsExtractModalOpen(false), []);
  useBackButton(currentView === 'manage', closeManage, 'gestion');
  useBackButton(isExtractModalOpen, closeExtract, 'extraer');
  const clearUndo = useCallback(() => setUndo(null), []);

  // Filtrado de productos
  const filteredProductos = useMemo(() => {
    let filtered = productos.filter((p) => p.categoriaId === activeCategoriaId);

    if (showOnlyOrders) {
      filtered = filtered.filter((p) => p.cantidad !== 0 && p.cantidad !== '');
    }

    if (searchQuery.trim()) {
      const q = normalizeString(searchQuery);
      filtered = filtered.filter((p) => normalizeString(p.nombre).includes(q));
    }

    return filtered;
  }, [productos, activeCategoriaId, searchQuery, showOnlyOrders]);

  const activeSubgrupos = useMemo(
    () => subgrupos.filter((s) => s.categoriaId === activeCategoriaId),
    [subgrupos, activeCategoriaId]
  );

  if (currentView === 'manage') {
    return <ManageView onBack={closeManage} />;
  }

  if (!activeCategoria) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center text-gray-600">
        <p>Todavía no hay categorías.</p>
        <button type="button" onClick={() => setCurrentView('manage')} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold">
          Crear una en Gestión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 max-w-md mx-auto shadow-lg overflow-hidden relative">
      {/* Header / Tabs */}
      <CategoryTabs
        categorias={sortedCats}
        productos={productos}
        activeCategoriaId={activeCategoriaId}
        onSelect={(id) => {
          setActiveCategoriaId(id);
          setSearchQuery('');
        }}
      />

      {/* Search & Filter */}
      <MainToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showOnlyOrders={showOnlyOrders}
        setShowOnlyOrders={setShowOnlyOrders}
      />

      {/* List */}
      <ProductList
        key={activeCategoriaId}
        productos={filteredProductos}
        subgrupos={activeSubgrupos}
        unidadPorDefecto={activeCategoria.unidadPorDefecto}
        emptyText={
          searchQuery
            ? `Ningún producto coincide con «${searchQuery}»`
            : showOnlyOrders
              ? 'Todavía no hay nada pedido en esta categoría'
              : 'Esta categoría no tiene productos. Añádelos en Gestión.'
        }
      />

      {/* Spacer for bottom bar */}
      <div className="shrink-0" style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }} />

      {/* Bottom Actions */}
      <BottomBar
        activeCategoriaId={activeCategoriaId}
        onExtract={() => setIsExtractModalOpen(true)}
        onManage={() => setCurrentView('manage')}
        onUndoable={setUndo}
      />

      <UndoToast info={undo} onClose={clearUndo} />

      {/* Modals */}
      <ExtractionModal isOpen={isExtractModalOpen} onClose={closeExtract} initialCategoriaId={activeCategoriaId} />
    </div>
  );
}

export default App;
