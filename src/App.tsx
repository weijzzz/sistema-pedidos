import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './store/useStore';
import { CategoryTabs } from './components/CategoryTabs';
import { MainToolbar } from './components/MainToolbar';
import { ProductList } from './components/ProductList';
import { BottomBar } from './components/BottomBar';
import { ExtractionModal } from './components/ExtractionModal';
import { normalizeString } from './utils/normalize';
import { initialData } from './data/seedData';
import { ManageView } from './pages/ManageView';

function App() {
  const { categorias, productos, subgrupos } = useStore();
  

  
  // Estado local de la vista principal
  const [currentView, setCurrentView] = useState<'home' | 'manage'>('home');
  const [activeCategoriaId, setActiveCategoriaId] = useState<string>(categorias[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOrders, setShowOnlyOrders] = useState(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);

  // Filtrado de productos
  const filteredProductos = useMemo(() => {
    let filtered = productos.filter(p => p.categoriaId === activeCategoriaId);
    
    if (showOnlyOrders) {
      filtered = filtered.filter(p => p.cantidad !== 0 && p.cantidad !== '');
    }
    
    if (searchQuery.trim()) {
      const q = normalizeString(searchQuery);
      filtered = filtered.filter(p => normalizeString(p.nombre).includes(q));
    }
    
    return filtered;
  }, [productos, activeCategoriaId, searchQuery, showOnlyOrders]);

  const activeCategoria = categorias.find(c => c.id === activeCategoriaId);

  if (currentView === 'manage') {
    return <ManageView onBack={() => setCurrentView('home')} />;
  }

  if (!activeCategoria) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-lg overflow-hidden relative">
      {/* Header / Tabs */}
      <CategoryTabs 
        categorias={categorias}
        productos={productos}
        activeCategoriaId={activeCategoriaId}
        onSelect={setActiveCategoriaId}
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
        productos={filteredProductos}
        subgrupos={subgrupos.filter(s => s.categoriaId === activeCategoriaId)}
        unidadPorDefecto={activeCategoria.unidadPorDefecto}
      />
      
      {/* Spacer for bottom bar */}
      <div className="h-16 shrink-0" />
      
      {/* Bottom Actions */}
      <BottomBar 
        activeCategoriaId={activeCategoriaId}
        onExtract={() => setIsExtractModalOpen(true)}
        onManage={() => setCurrentView('manage')}
      />

      {/* Modals */}
      <ExtractionModal 
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        initialCategoriaId={activeCategoriaId}
      />
    </div>
  );
}

export default App;
