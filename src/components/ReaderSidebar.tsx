import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Book, Article, Theme } from '../types';

interface ReaderSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedBook: Book;
  articles: Article[];
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article) => void;
  loadingArticles: boolean;
  stopAudio: () => void;
}

export const ReaderSidebar: React.FC<ReaderSidebarProps & { theme: Theme }> = ({
  isOpen,
  setIsOpen,
  selectedBook,
  articles,
  selectedArticle,
  setSelectedArticle,
  loadingArticles,
  stopAudio,
  theme
}) => {
  const bgClasses = {
    light: 'bg-[#fdfaf6]',
    sepia: 'bg-[#f4ecd8]',
    dark: 'bg-[#0f0f0f]'
  };

  return (
    <>
      {/* Left Sidebar Table of Contents (Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="hidden lg:block w-80 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r border-current/10 p-6 no-scrollbar"
          >
            <div className="mb-8">
              <h3 className="font-display font-bold text-xl mb-1">{selectedBook.name}</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Daftar Isi</p>
            </div>
            <div className="space-y-2">
              {loadingArticles ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : articles.map((art, idx) => (
                <button
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    stopAudio();
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all border ${selectedArticle?.id?.toString() === art.id.toString() ? 'bg-accent-gold text-black border-accent-gold' : 'border-transparent hover:bg-current/5'}`}
                >
                  <div className="opacity-40 text-[9px] font-black uppercase tracking-widest mb-1">Bab {(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="font-bold leading-tight">{art.title}</div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-[70]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className={`fixed top-0 left-0 bottom-0 w-80 border-r border-current/10 z-[80] shadow-2xl p-8 overflow-y-auto ${bgClasses[theme]}`}
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-display font-bold text-2xl">Daftar Isi</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-current/10 rounded-full">
                  <ChevronLeft size={24} />
                </button>
              </div>
              <div className="space-y-3">
                {loadingArticles ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : articles.map((art, idx) => (
                  <button
                    key={art.id}
                    onClick={() => {
                      setSelectedArticle(art);
                      setIsOpen(false);
                      stopAudio();
                    }}
                    className={`w-full text-left p-4 rounded-xl text-sm transition-all border ${selectedArticle?.id?.toString() === art.id.toString() ? 'bg-accent-gold text-black border-accent-gold' : 'border-transparent hover:bg-current/5'}`}
                  >
                    <div className="opacity-40 text-[10px] font-black uppercase tracking-widest mb-1">Bab {(idx + 1).toString().padStart(2, '0')}</div>
                    <div className="font-bold leading-tight">{art.title}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
