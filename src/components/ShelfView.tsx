import React from 'react';
import { motion } from 'motion/react';
import { BookCard } from './BookCard';
import { Book, Article, Theme } from '../types';
import { ArrowLeft, ArrowRight, Bookmark as BookmarkIcon, Loader2 } from 'lucide-react';

interface ShelfViewProps {
  loading: boolean;
  filteredBooks: Book[];
  allBooks: Book[];
  bookBookmarks: string[];
  setSelectedBook: (book: Book) => void;
  setCategoryFilter: (category: string) => void;
  categoryFilter: string;
  theme: Theme;
  bookmarkedArticles?: Article[];
  loadingBookmarks?: boolean;
  showBookmarkedArticles?: boolean;
  setSelectedArticle?: (article: Article) => void;
  searchQuery?: string;
}

export const ShelfView: React.FC<ShelfViewProps> = ({
  loading,
  filteredBooks,
  allBooks,
  bookBookmarks,
  setSelectedBook,
  setCategoryFilter,
  categoryFilter,
  theme,
  bookmarkedArticles = [],
  loadingBookmarks = false,
  showBookmarkedArticles = false,
  setSelectedArticle,
  searchQuery = ''
}) => {
  const isHomeView = categoryFilter === 'Semua' && !searchQuery;

  // Categories to display on Home
  const displayCategories = ["Pilihan", "Muallif", "Silsilah", "Kitab", "Aqidah", "Ibadah", "Adab", "Bahasa Arab", "Ramadhan"];

  const getBooksByCategory = (category: string) => {
    const isUseful = (b: Book) => b.count > 0 && b.slug !== 'uncategorized' && b.slug !== 'e-book';
    
    if (category === 'Pilihan') return allBooks.filter(b => isUseful(b) && bookBookmarks.includes(b.id));
    if (category === 'Muallif') return allBooks.filter(b => isUseful(b) && b.muallif && b.muallif !== "Ilmiyyah");
    if (category === 'Silsilah') return allBooks.filter(b => isUseful(b) && (b.name.includes('Silsilah') || b.slug.includes('silsilah')));
    if (category === 'Kitab') return allBooks.filter(b => isUseful(b) && (b.name.includes('Kitab') || b.slug.includes('kitab')));
    if (category === 'Aqidah') return allBooks.filter(b => isUseful(b) && (b.name.includes('Aqidah') || b.name.includes('Tauhid')));
    
    return allBooks.filter(b => isUseful(b) && b.name.includes(category));
  };

  return (
    <div className="mb-20">
      {showBookmarkedArticles && bookmarkedArticles.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <BookmarkIcon className="text-accent-gold" size={24} fill="currentColor" />
              Pembahasan Utama
            </h2>
            <div className="text-[10px] uppercase font-black tracking-widest opacity-30">{bookmarkedArticles.length} Pembahasan Disimpan</div>
          </div>
          
          <div className="grid gap-4">
            {loadingBookmarks ? (
              <div className="flex items-center justify-center py-10 opacity-30">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              bookmarkedArticles.map((article, index) => (
                <motion.button
                  key={article.id}
                  onClick={() => setSelectedArticle?.(article)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-6 p-6 rounded-2xl bg-current/[0.02] hover:bg-accent-gold/5 transition-all text-left border border-transparent hover:border-accent-gold/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-current/5 flex items-center justify-center text-xs font-mono font-bold group-hover:bg-accent-gold group-hover:text-black transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold group-hover:text-accent-gold transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold opacity-30 mt-1">
                      <span>{article.author}</span>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-accent-gold" />
                </motion.button>
              ))
            )}
          </div>
        </section>
      )}

      {!showBookmarkedArticles && isHomeView ? (
        <div className="space-y-24">
          {displayCategories.map((category) => {
            const categoryBooks = getBooksByCategory(category);
            if (categoryBooks.length === 0) return null;

            return (
              <section key={category} className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold">{category}</h2>
                  <button 
                    onClick={() => {
                      setCategoryFilter(category);
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-accent-gold transition-all"
                  >
                    Lihat Semua <ArrowRight size={14} />
                  </button>
                </div>

                <div className="flex gap-6 md:gap-10 overflow-x-auto pb-10 scrollbar-hide snap-x -mx-6 px-6 lg:-mx-0 lg:px-0">
                  {categoryBooks.slice(0, 10).map((book, index) => (
                    <div key={book.id} className="min-w-[260px] md:min-w-[320px] snap-start">
                      <BookCard 
                        book={book}
                        theme={theme}
                        isBookmarked={bookBookmarks.includes(book.id)}
                        onClick={() => setSelectedBook(book)}
                        index={index}
                      />
                    </div>
                  ))}
                  
                  {categoryBooks.length > 10 && (
                    <motion.button
                      onClick={() => {
                        setCategoryFilter(category);
                        window.scrollTo(0, 0);
                      }}
                      whileHover={{ scale: 0.98 }}
                      className="min-w-[220px] md:min-w-[280px] snap-start aspect-[3/4] rounded-2xl bg-current/[0.03] border-2 border-dashed border-current/10 flex flex-col items-center justify-center gap-4 group transition-colors hover:border-accent-gold/30"
                    >
                      <div className="w-14 h-14 rounded-full bg-current/5 flex items-center justify-center group-hover:bg-accent-gold group-hover:text-black transition-colors">
                        <ArrowRight size={24} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100">Lihat Lainnya</span>
                    </motion.button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              {!showBookmarkedArticles && categoryFilter !== 'Semua' && (
                <button 
                  onClick={() => setCategoryFilter('Semua')}
                  className="w-10 h-10 rounded-full border border-current/10 flex items-center justify-center hover:bg-current/5 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-2xl font-display font-bold">
                {showBookmarkedArticles ? 'Pembahasan Disimpan' : searchQuery ? 'Hasil Pencarian' : categoryFilter}
              </h2>
            </div>
            <div className="text-[10px] uppercase font-black tracking-widest opacity-30">
              {filteredBooks.length} {showBookmarkedArticles ? 'Pembahasan' : 'Kitab'} Tersedia
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-30">
              <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin" />
              <p className="font-display italic opacity-40 text-2xl">Menyusun rak buku...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-14">
              {filteredBooks.map((book, index) => (
                <BookCard 
                  key={book.id}
                  book={book}
                  theme={theme}
                  isBookmarked={bookBookmarks.includes(book.id)}
                  onClick={() => setSelectedBook(book)}
                  index={index}
                />
              ))}
            </div>
          )}

          {filteredBooks.length === 0 && !loading && (
            <div className="text-center py-32 opacity-30 bg-current/[0.02] rounded-[40px] border border-dashed border-current/20">
              <p className="font-display italic text-2xl">Kitab tidak ditemukan.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
