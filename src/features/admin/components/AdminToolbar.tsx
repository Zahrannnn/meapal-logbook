import React from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import type { AdminTabType } from '../mappers/admin.mapper';

interface AdminToolbarProps {
  activeTab: AdminTabType;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onOpenBulkImport: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({ activeTab, searchQuery, onSearchChange, onAdd, onOpenBulkImport }) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input type="text" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200" />
    </div>
    <div className="flex gap-3">
      {activeTab === 'users' && (
        <button onClick={onOpenBulkImport} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-200">
          <Upload className="w-5 h-5" />
          <span className="hidden sm:inline">Upload Users</span>
          <span className="sm:hidden">Upload</span>
        </button>
      )}
      <button onClick={onAdd} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200">
        <Plus className="w-5 h-5" />
        Add {activeTab.slice(0, -1)}
      </button>
    </div>
  </div>
);
