import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bookmark as BookmarkIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Book, Article, Theme } from '../types';

interface BookDetailProps {
  selectedBook: Book;
  onBack: () => void;
  bookBookmarks: string[];
  setBookBookmarks: (bookmarks: string[]) => void;
  lastReadArticlePerBook: Record<string, string>;
  articles: Article[];
  setSelectedArticle: (article: Article) => void;
  loadingArticles: boolean;
  filteredArticles: Article[];
  theme: Theme;
}

export const BookDetail: React.FC<BookDetailProps> = ({
  selectedBook,
  onBack,
  bookBookmarks,
  setBookBookmarks,
  lastReadArticlePerBook,
  articles,
  setSelectedArticle,
  loadingArticles,
  filteredArticles,
  theme
}) => {
  const bookCardClasses = {
    light: 'bg-white shadow-lg',
    sepia: 'bg-[#f4ebd8] shadow-md border-paper-sepia/20',
    dark: 'bg-[#1a1a1a] shadow-xl border-white/5'
  };

  const isBookmarked = bookBookmarks.includes(selectedBook.id);

  return (
    <motion.div
      key="toc"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto px-6 py-12"
    >
      <header className="mb-16">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all mb-12"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Perpustakaan</span>
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className={`aspect-[3/4] w-48 rounded-r-2xl rounded-l-sm shadow-2xl flex flex-col border border-current/[0.05] relative overflow-hidden ${bookCardClasses[theme]}`}>
            <div className="absolute inset-0 bg-accent-gold/10 mix-blend-overlay" style={{ backgroundColor: selectedBook.coverColor }} />
            <div className="p-6 flex-1 flex flex-col justify-end relative z-10">
              <h2 className="text-lg font-display font-bold leading-tight">{selectedBook.name}</h2>
            </div>
            <div className="h-1 bg-accent-gold opacity-60 relative z-10" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-accent-gold">Daftar Isi Kitab</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (isBookmarked) {
                      setBookBookmarks(bookBookmarks.filter(id => id !== selectedBook.id));
                    } else {
                      setBookBookmarks([...bookBookmarks, selectedBook.id]);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${isBookmarked ? 'bg-accent-gold text-black border-accent-gold' : 'border-current/10 opacity-40 hover:opacity-100 hover:border-current/30'}`}
                >
                  <BookmarkIcon size={14} fill={isBookmarked ? "currentColor" : "none"} />
                  {isBookmarked ? 'Disimpan' : 'Simpan Kitab'}
                </button>

                {lastReadArticlePerBook[selectedBook.id] && (
                  <button 
                    onClick={() => {
                      const lastArtId = lastReadArticlePerBook[selectedBook.id];
                      const art = articles.find(a => a.id === lastArtId);
                      if (art) {
                        setSelectedArticle(art);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold text-black border border-accent-gold text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    <ArrowRight size={14} />
                    Teruskan Membaca
                  </button>
                )}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">{selectedBook.name}</h1>
            <p className="opacity-40 font-serif text-lg leading-relaxed">{selectedBook.description || `Karya ${selectedBook.muallif}. Dilengkapi dengan syarah dan penjelasan para ulama terkemuka.`}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {loadingArticles ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-accent-gold" size={40} />
            <p className="font-display italic opacity-40 text-xl">Membuka catatan...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredArticles.map((article, index) => (
              <motion.button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 10 }}
                className="group flex items-center gap-6 p-6 rounded-2xl bg-current/[0.02] hover:bg-accent-gold/5 transition-all text-left border border-transparent hover:border-accent-gold/20"
              >
                <div className="w-12 h-12 rounded-xl bg-current/5 flex items-center justify-center text-xs font-mono font-bold group-hover:bg-accent-gold group-hover:text-black transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold group-hover:text-accent-gold transition-colors">{article.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold opacity-30 mt-1">
                    <span>{article.readTime}</span>
                    <span className="w-1 h-1 rounded-full bg-current" />
                    <span>{article.date}</span>
                  </div>
                </div>
                <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-accent-gold" />
              </motion.button>
            ))}
            
            {filteredArticles.length === 0 && (
              <div className="text-center py-20 opacity-30 bg-current/[0.02] rounded-3xl border border-dashed border-current/20">
                <p className="font-display italic text-xl">Daftar isi belum tersedia.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
