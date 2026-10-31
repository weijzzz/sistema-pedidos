import React from 'react';
import { Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';

interface MainToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showOnlyOrders: boolean;
  setShowOnlyOrders: (s: boolean) => void;
}

export function MainToolbar({ searchQuery, setSearchQuery, showOnlyOrders, setShowOnlyOrders }: MainToolbarProps) {
  return (
    <div className="sticky top-[49px] z-10 bg-white border-b border-gray-200 px-3 py-2 shadow-sm flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar producto..."
          className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
      <button
        onClick={() => setShowOnlyOrders(!showOnlyOrders)}
        className={clsx(
          "flex items-center justify-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors",
          showOnlyOrders 
            ? "bg-blue-50 border-blue-200 text-blue-700" 
            : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
        )}
      >
        <Filter className="h-4 w-4 mr-1.5" />
        Solo pedidos
      </button>
    </div>
  );
}
