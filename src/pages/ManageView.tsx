import React, { useState } from 'react';
import { ArrowLeft, Package, FolderTree, ClipboardPaste, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { ManageProducts } from './ManageProducts';
import { ManageCategories } from './ManageCategories';
import { BulkPaste } from './BulkPaste';
import { ManageTemplates } from './ManageTemplates';

interface ManageViewProps {
  onBack: () => void;
}

type TabType = 'productos' | 'categorias' | 'pegar' | 'opciones';

export function ManageView({ onBack }: ManageViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('productos');

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 max-w-md mx-auto shadow-lg overflow-hidden relative">
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 shadow-sm z-20 box-content" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button 
          type="button"
          aria-label="Volver"
          onClick={onBack}
          className="p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Panel de Gestión</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 shrink-0 overflow-x-auto no-scrollbar">
        <TabButton 
          active={activeTab === 'productos'} 
          onClick={() => setActiveTab('productos')}
          icon={<Package className="w-4 h-4 mb-1" />}
          label="Productos"
        />
        <TabButton 
          active={activeTab === 'categorias'} 
          onClick={() => setActiveTab('categorias')}
          icon={<FolderTree className="w-4 h-4 mb-1" />}
          label="Categorías"
        />
        <TabButton 
          active={activeTab === 'pegar'} 
          onClick={() => setActiveTab('pegar')}
          icon={<ClipboardPaste className="w-4 h-4 mb-1" />}
          label="Pegar"
        />
        <TabButton 
          active={activeTab === 'opciones'} 
          onClick={() => setActiveTab('opciones')}
          icon={<Settings className="w-4 h-4 mb-1" />}
          label="Opciones"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-gray-50 relative">
        {activeTab === 'productos' && <ManageProducts />}
        {activeTab === 'categorias' && <ManageCategories />}
        {activeTab === 'pegar' && <BulkPaste />}
        {activeTab === 'opciones' && <ManageTemplates />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        "flex-1 flex flex-col items-center justify-center py-2.5 min-w-[80px] transition-colors border-b-2",
        active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
