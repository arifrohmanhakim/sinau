import React from 'react';
import { Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../types';

interface LibraryHeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  return (
    <header className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-gold to-[#aa8c2e] rounded-xl flex items-center justify-center text-black font-black text-sm uppercase tracking-tighter shadow-xl shadow-accent-gold/20">
            IL
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold">Ilmiyyah <span className="font-normal opacity-40">Library</span></h1>
            <p className="text-xs uppercase tracking-[0.3em] font-bold opacity-30 mt-1">Edisi Digital & Interaktif</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-current opacity-30 group-focus-within:opacity-100 transition-opacity" size={24} />
        <input 
          type="text"
          placeholder="Cari kitab atau judul pembahasan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-current/5 border border-current/10 rounded-[32px] py-6 pl-16 pr-8 focus:border-accent-gold focus:bg-current/[0.08] transition-all outline-none text-xl font-display"
        />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto py-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`category-pill ${categoryFilter === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
};
