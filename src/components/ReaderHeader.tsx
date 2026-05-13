import React from 'react';
import { 
  ChevronLeft, 
  BookOpen, 
  Settings2, 
  Bookmark as BookmarkIcon, 
  Share2 
} from 'lucide-react';
import { Theme } from '../types';

interface ReaderHeaderProps {
  onBack: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  onToggleAudio: () => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps & { theme: Theme }> = ({
  onBack,
  isSidebarOpen,
  toggleSidebar,
  isPlaying,
  isPaused,
  onToggleAudio,
  showSettings,
  setShowSettings,
  isBookmarked,
  onToggleBookmark,
  onShare,
  theme
}) => {
  const bgClasses = {
    light: 'bg-[#fdfaf6]',
    sepia: 'bg-[#f4ecd8]',
    dark: 'bg-[#0f0f0f]'
  };

  return (
    <nav className={`sticky top-0 z-50 border-b border-current/10 transition-colors ${bgClasses[theme]}`}>
      <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-3 -ml-3 rounded-2xl hover:bg-current/10 flex items-center gap-4 transition-colors group"
        >
          <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline font-bold text-sm uppercase tracking-[0.2em] opacity-60">Daftar Isi</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className={`p-3 rounded-2xl transition-all ${isSidebarOpen ? 'bg-accent-gold text-black' : 'hover:bg-current/10'}`}
            title="Toggle Daftar Isi"
          >
            <BookOpen size={24} />
          </button>

          <button 
            onClick={onToggleAudio}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-current/5 ${isPlaying ? 'bg-accent-gold text-black animate-pulse' : 'bg-current/5 hover:bg-current/10'}`}
          >
            {isPlaying ? (isPaused ? 'Lanjutkan' : 'Berhenti') : 'Dengarkan'}
            <div className="flex items-center gap-1 ml-1 h-3">
              <div className={`w-0.5 bg-black rounded-full transition-all ${isPlaying && !isPaused ? 'animate-[bounce_1s_infinite_0ms] h-full' : 'h-1'}`} />
              <div className={`w-0.5 bg-black rounded-full transition-all ${isPlaying && !isPaused ? 'animate-[bounce_1s_infinite_200ms] h-3/4' : 'h-1.5'}`} />
              <div className={`w-0.5 bg-black rounded-full transition-all ${isPlaying && !isPaused ? 'animate-[bounce_1s_infinite_400ms] h-1/2' : 'h-0.8'}`} />
            </div>
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${showSettings ? 'border-accent-gold text-accent-gold bg-accent-gold/10' : 'border-current/10 hover:border-current/30'}`}
          >
            <Settings2 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Setelan</span>
          </button>
          <button 
            onClick={onToggleBookmark}
            className={`p-3 rounded-full border border-current/10 transition-colors ${isBookmarked ? 'bg-accent-gold border-accent-gold text-black' : 'hover:border-current/30'}`} 
            title="Simpan"
          >
            <BookmarkIcon size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={onShare}
            className="p-3 rounded-full border border-current/10 hover:border-current/30 transition-colors" 
            title="Bagikan"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};
