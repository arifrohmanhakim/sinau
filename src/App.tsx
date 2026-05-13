import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronLeft, 
  Settings2, 
  Type, 
  Sun, 
  Moon, 
  Coffee, 
  Search, 
  ArrowRight,
  Bookmark,
  Share2,
  Loader2
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;
}

interface Book {
  id: string;
  name: string;
  slug: string;
  count: number;
  parent: string;
  description: string;
  coverColor?: string;
  image?: string;
  muallif: string;
}

type Theme = 'light' | 'sepia' | 'dark';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [theme, setTheme] = useState<Theme>('sepia');
  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [showQuickTOC, setShowQuickTOC] = useState(false);
  
  // Storage for bookmarks and scroll positions
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('ilmiyyah_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [bookBookmarks, setBookBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('ilmiyyah_book_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const contentRef = useRef<HTMLDivElement>(null);

  // Reset active paragraph when changing article
  useEffect(() => {
    setActiveParagraphIndex(null);
    stopAudio();
  }, [selectedArticle]);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('ilmiyyah_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ilmiyyah_book_bookmarks', JSON.stringify(bookBookmarks));
  }, [bookBookmarks]);

  // Handle scroll position persistence
  useEffect(() => {
    if (selectedArticle) {
      const savedPos = localStorage.getItem(`pos_${selectedArticle.id}`);
      if (savedPos) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedPos), behavior: 'smooth' });
        }, 500);
      }

      const handleUnload = () => {
        localStorage.setItem(`pos_${selectedArticle.id}`, window.scrollY.toString());
      };

      window.addEventListener('scroll', handleUnload);
      return () => window.removeEventListener('scroll', handleUnload);
    }
  }, [selectedArticle]);

  // Audio related functions
  const readFromParagraph = (index: number) => {
    window.speechSynthesis.cancel();
    
    const paragraphs = document.querySelectorAll('.markdown-body p');
    if (!paragraphs[index]) return;

    const sectionsToRead = Array.from(paragraphs)
      .slice(index)
      .map(p => p.textContent || "");

    let currentIdx = index;

    const speakNext = (idxInArray: number) => {
      if (idxInArray >= sectionsToRead.length) {
        setIsPlaying(false);
        setActiveParagraphIndex(null);
        return;
      }

      setActiveParagraphIndex(currentIdx);
      const utterance = new SpeechSynthesisUtterance(sectionsToRead[idxInArray]);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      
      utterance.onend = () => {
        currentIdx++;
        speakNext(idxInArray + 1);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveParagraphIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    setIsPlaying(true);
    setIsPaused(false);
    speakNext(0);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      readFromParagraph(0);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveParagraphIndex(null);
  };

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Fetch articles when a book is selected
  useEffect(() => {
    if (!selectedBook) {
      setArticles([]);
      return;
    }

    const fetchArticles = async () => {
      setLoadingArticles(true);
      try {
        const response = await fetch(`/api/books/${selectedBook.id}/articles`);
        const data = await response.json();
        // Sort articles if they have "01", "02" in titles
        const sortedData = data.sort((a: Article, b: Article) => {
          const aMatch = a.title.match(/\d+/);
          const bMatch = b.title.match(/\d+/);
          if (aMatch && bMatch) return parseInt(aMatch[0]) - parseInt(bMatch[0]);
          return 0;
        });
        setArticles(sortedData);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchArticles();
  }, [selectedBook]);

  useEffect(() => {
    const container = contentRef.current;
    if (selectedArticle && container) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const p = target.closest('p');
        // Ensure it's a paragraph inside our content
        if (p && p.closest('.markdown-body')) {
          const paragraphs = Array.from(container.querySelectorAll('p'));
          const index = paragraphs.indexOf(p);
          if (index !== -1) {
            readFromParagraph(index);
          }
        }
      };

      container.addEventListener('click', handleClick as any);
      return () => container.removeEventListener('click', handleClick as any);
    }
  }, [selectedArticle, articles]); // Re-attach when content changes

  // Apply highlight class based on activeParagraphIndex
  useEffect(() => {
    const paragraphs = document.querySelectorAll('.markdown-body p');
    paragraphs.forEach((p, idx) => {
      if (idx === activeParagraphIndex) {
        p.classList.add('reading-active');
        // Scroll into view ONLY if we are playing and not paused, and only inside the reading content
        if (isPlaying && !isPaused && selectedArticle) {
          p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        p.classList.remove('reading-active');
      }
    });
  }, [activeParagraphIndex, isPlaying, isPaused, selectedArticle]);

  // Update scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when article is selected
  useEffect(() => {
    if (selectedArticle) {
      window.scrollTo(0, 0);
    }
  }, [selectedArticle]);

  const categories = ["Semua", "Pilihan", "Aqidah", "Ibadah", "Adab", "Silsilah", "Kitab", "Bahasa Arab", "Ramadhan"];

  const filteredBooks = books.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(query) || b.muallif.toLowerCase().includes(query);
    const isUseful = b.count > 0 && b.slug !== 'uncategorized' && b.slug !== 'e-book';
    
    if (categoryFilter === 'Pilihan') return matchesSearch && isUseful && bookBookmarks.includes(b.id);
    if (categoryFilter === 'Semua') return matchesSearch && isUseful;
    
    // Simple mapping logic for categories
    if (categoryFilter === 'Silsilah') return matchesSearch && isUseful && (b.name.includes('Silsilah') || b.slug.includes('silsilah'));
    if (categoryFilter === 'Kitab') return matchesSearch && isUseful && (b.name.includes('Kitab') || b.slug.includes('kitab'));
    if (categoryFilter === 'Aqidah') return matchesSearch && isUseful && (b.name.includes('Aqidah') || b.name.includes('Tauhid'));
    
    return matchesSearch && isUseful && b.name.includes(categoryFilter);
  }).sort((a, b) => b.count - a.count);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goToNextArticle = () => {
    if (!selectedArticle) return;
    const currentIdx = articles.indexOf(selectedArticle);
    if (currentIdx < articles.length - 1) {
      const next = articles[currentIdx + 1];
      setSelectedArticle(null);
      setTimeout(() => setSelectedArticle(next), 100);
      stopAudio();
    }
  };

  const goToPrevArticle = () => {
    if (!selectedArticle) return;
    const currentIdx = articles.indexOf(selectedArticle);
    if (currentIdx > 0) {
      const prev = articles[currentIdx - 1];
      setSelectedArticle(null);
      setTimeout(() => setSelectedArticle(prev), 100);
      stopAudio();
    }
  };

  const themeClasses = {
    light: 'bg-paper-light text-ink-light',
    sepia: 'bg-paper-sepia text-ink-sepia selection:bg-accent-gold/20',
    dark: 'bg-paper-dark text-ink-dark selection:bg-accent-gold/40',
  };

  const bookCardClasses = {
    light: 'bg-white shadow-lg',
    sepia: 'bg-[#f4ebd8] shadow-md border-paper-sepia/20',
    dark: 'bg-[#1a1a1a] shadow-xl border-white/5'
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${themeClasses[theme]}`}>
      <AnimatePresence mode="wait">
        {!selectedBook && !selectedArticle ? (
          <motion.div
            key="bookshelf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-6 py-12"
          >
            {/* Library Header */}
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
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'sepia' : 'dark')}
                    className="p-3 rounded-full hover:bg-current/10 transition-colors"
                  >
                    {theme === 'light' && <Sun size={20} />}
                    {theme === 'sepia' && <Coffee size={20} />}
                    {theme === 'dark' && <Moon size={20} />}
                  </button>
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

              {/* Specific Filter Pills */}
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

            {/* Books Shelf */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black opacity-30">Pilihan Kitab & Silsilah</h2>
                <span className="text-[10px] uppercase tracking-widest opacity-20 font-bold">{filteredBooks.length} KITAB DITEMUKAN</span>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <Loader2 className="animate-spin text-accent-gold" size={48} />
                  <p className="font-display italic opacity-40 text-2xl">Menyusun rak buku...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-14">
                  {filteredBooks.map((book, index) => (
                    <motion.button
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -12 }}
                      className="group flex flex-col text-left"
                    >
                      <div className={`aspect-[3/4] w-full rounded-r-[20px] rounded-l-[4px] group-hover:shadow-2xl group-hover:shadow-accent-gold/20 transition-all mb-6 relative overflow-hidden flex flex-col border-y border-r border-current/[0.05] ${bookCardClasses[theme]}`}>
                        {/* Book Cover Aesthetic */}
                        {book.image ? (
                          <img 
                            src={book.image} 
                            alt={book.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div 
                            className="absolute inset-0 opacity-80 group-hover:opacity-100 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                            style={{ backgroundColor: book.coverColor }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />
                        
                        {/* Bookmark indicator */}
                        {bookBookmarks.includes(book.id) && (
                          <div className="absolute top-0 right-4 w-8 h-10 bg-accent-gold text-black flex items-center justify-center rounded-b-md shadow-lg z-20">
                            <Bookmark size={16} fill="currentColor" />
                          </div>
                        )}
                        
                        {/* Spine detail */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent border-r border-white/5" />
                        <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/10" />
                        
                        {/* Cover Content */}
                        <div className="p-6 md:p-8 flex-1 flex flex-col justify-end relative z-10">
                          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-2 flex items-center justify-between">
                            <span>{book.count} Bab</span>
                            {bookBookmarks.includes(book.id) && <Bookmark size={12} fill="currentColor" className="text-accent-gold" />}
                          </div>
                          <h3 className="text-xl md:text-2xl font-display font-medium leading-tight line-clamp-4 text-white drop-shadow-lg mb-2">
                            {book.name}
                          </h3>
                          <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                            {book.muallif}
                          </div>
                        </div>
                        
                        {/* Bottom Decoration */}
                        <div className="h-1 bg-accent-gold opacity-60 relative z-10" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
            
            <footer className="mt-40 py-20 border-t border-current/5 text-center space-y-10 opacity-30">
              <div className="inline-flex items-center gap-4 grayscale">
                <div className="w-10 h-10 border-2 border-current rounded-lg flex items-center justify-center font-black">IL</div>
                <h4 className="font-display text-2xl font-bold">Ilmiyyah Reader</h4>
              </div>
              <p className="max-w-md mx-auto text-sm font-serif leading-relaxed italic">
                Platform baca digital yang dioptimalkan untuk konten-konten ilmiah Ahlussunnah wal Jama'ah.
              </p>
            </footer>
          </motion.div>
        ) : selectedBook && !selectedArticle ? (
          <motion.div
            key="toc"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto px-6 py-12"
          >
            {/* TOC Header */}
            <header className="mb-16">
              <button 
                onClick={() => setSelectedBook(null)}
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-accent-gold">Daftar Isi Kitab</span>
                    <button 
                      onClick={() => {
                        if (bookBookmarks.includes(selectedBook.id)) {
                          setBookBookmarks(bookBookmarks.filter(id => id !== selectedBook.id));
                        } else {
                          setBookBookmarks([...bookBookmarks, selectedBook.id]);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${bookBookmarks.includes(selectedBook.id) ? 'bg-accent-gold text-black border-accent-gold' : 'border-current/10 opacity-40 hover:opacity-100 hover:border-current/30'}`}
                    >
                      <Bookmark size={14} fill={bookBookmarks.includes(selectedBook.id) ? "currentColor" : "none"} />
                      {bookBookmarks.includes(selectedBook.id) ? 'Disimpan' : 'Simpan Kitab'}
                    </button>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">{selectedBook.name}</h1>
                  <p className="opacity-40 font-serif text-lg leading-relaxed">{selectedBook.description || `Karya ${selectedBook.muallif}. Dilengkapi dengan syarah dan penjelasan para ulama terkemuka.`}</p>
                </div>
              </div>
            </header>

            {/* Articles List */}
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
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative"
          >
            {/* Scroll Indicator */}
            <div 
              className="fixed top-0 left-0 h-1.5 bg-accent-gold z-[60] transition-all duration-150 rounded-r-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              style={{ width: `${scrollProgress}%` }}
            />

            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-transparent border-b border-current/10 transition-colors">
              <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setSelectedArticle(null);
                    stopAudio();
                  }}
                  className="p-3 -ml-3 rounded-2xl hover:bg-current/10 flex items-center gap-4 transition-colors group"
                >
                  <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-bold text-sm uppercase tracking-[0.2em] opacity-60">Daftar Isi</span>
                </button>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleAudio}
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
                    onClick={() => setShowQuickTOC(!showQuickTOC)}
                    className={`p-3 rounded-2xl transition-all ${showQuickTOC ? 'bg-accent-gold text-black' : 'hover:bg-current/10'}`}
                    title="Daftar Isi Cepat"
                  >
                    <BookOpen size={24} />
                  </button>

                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${showSettings ? 'border-accent-gold text-accent-gold bg-accent-gold/10' : 'border-current/10 hover:border-current/30'}`}
                  >
                    <Settings2 size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Setelan</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (bookmarks.includes(selectedArticle.id)) {
                        setBookmarks(bookmarks.filter(id => id !== selectedArticle.id));
                      } else {
                        setBookmarks([...bookmarks, selectedArticle.id]);
                      }
                    }}
                    className={`p-3 rounded-full border border-current/10 transition-colors ${bookmarks.includes(selectedArticle.id) ? 'bg-accent-gold border-accent-gold text-black' : 'hover:border-current/30'}`} 
                    title="Simpan"
                  >
                    <Bookmark size={20} fill={bookmarks.includes(selectedArticle.id) ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: selectedArticle.title,
                            text: selectedArticle.excerpt,
                            url: window.location.href,
                          });
                        } catch (err) {
                          console.error('Error sharing:', err);
                        }
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link berhasil disalin ke clipboard!');
                      }
                    }}
                    className="p-3 rounded-full border border-current/10 hover:border-current/30 transition-colors" 
                    title="Bagikan"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Quick TOC Sidebar Overlay */}
              <AnimatePresence>
                {showQuickTOC && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowQuickTOC(false)}
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
                    />
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      className="fixed top-0 right-0 bottom-0 w-80 bg-inherit border-l border-current/10 z-[80] shadow-2xl p-8 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="font-display font-bold text-2xl">Daftar Isi</h3>
                        <button onClick={() => setShowQuickTOC(false)} className="p-2 hover:bg-current/10 rounded-full">
                          <ChevronLeft className="rotate-180" size={24} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {loadingArticles ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                            <Loader2 className="animate-spin" size={24} />
                            <p className="text-xs font-serif italic">Membuka lembaran...</p>
                          </div>
                        ) : articles.map((art, idx) => (
                          <button
                            key={art.id}
                            onClick={() => {
                              setSelectedArticle(null);
                              setTimeout(() => setSelectedArticle(art), 100);
                              setShowQuickTOC(false);
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
                  </>
                )}
              </AnimatePresence>

              {/* Reader Settings Dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-full left-0 right-0 border-b border-current/10 shadow-2xl z-40 bg-inherit"
                  >
                    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-12">
                      {/* Theme Selection */}
                      <div className="flex flex-col items-center sm:items-start gap-4">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Suasana Membaca</span>
                        <div className="flex gap-4">
                          {(['light', 'sepia', 'dark'] as Theme[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setTheme(t)}
                              className={`w-14 h-14 rounded-2xl border-4 transition-all transform hover:scale-110 active:scale-95 ${
                                t === 'light' ? 'bg-[#fdfaf6]' : t === 'sepia' ? 'bg-[#f4ecd8]' : 'bg-[#0f0f0f]'
                              } ${theme === t ? 'border-accent-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-current/5'}`}
                            >
                              {t === 'light' && <Sun size={18} className="mx-auto opacity-40" />}
                              {t === 'sepia' && <Coffee size={18} className="mx-auto opacity-40" />}
                              {t === 'dark' && <Moon size={18} className="mx-auto opacity-40" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size Selection */}
                      <div className="flex flex-col items-center sm:items-start gap-4 flex-1 w-full max-w-xs">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Ukuran Huruf</span>
                          <span className="text-xs font-mono font-bold">{fontSize}</span>
                        </div>
                        <div className="flex items-center gap-6 w-full">
                          <Type size={16} className="opacity-40" />
                          <div className="relative flex-1 group">
                            <input 
                              type="range" 
                              min="14" 
                              max="32" 
                              step="2"
                              value={fontSize} 
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              className="w-full accent-accent-gold h-2 bg-current/10 rounded-full appearance-none cursor-pointer"
                            />
                          </div>
                          <Type size={28} className="opacity-40" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            {/* Reading Content */}
            <main className="max-w-2xl mx-auto px-6 py-24 pb-48">
              {selectedArticle.image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.05 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="mb-20 rounded-[40px] overflow-hidden shadow-2xl shadow-current/5 aspect-video border border-current/10"
                >
                  <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.div>
              )}
              
              <header className="mb-24 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-block text-[10px] uppercase tracking-[0.4em] font-black text-accent-gold mb-4 block">
                    {selectedBook.name}
                  </span>
                  <h1 className="text-5xl md:text-7xl font-display font-medium leading-[1.1] mb-10 tracking-tight text-current">
                    {selectedArticle.title}
                  </h1>
                  <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-3 text-sm opacity-40 font-bold uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2">{selectedArticle.readTime} MEMBACA</span>
                  </div>
                </motion.div>
              </header>

              <div 
                ref={contentRef}
                className="markdown-body transition-all duration-300 drop-cap"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              <div className="mt-12 p-6 rounded-2xl bg-accent-gold/5 border border-dashed border-accent-gold/30 text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                  Tip: Klik pada paragraf mana saja untuk mulai mendengarkan dari sana.
                </p>
              </div>

              {/* Article Navigation */}
              <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-10">
                <div className="flex-1 w-full">
                  {articles.indexOf(selectedArticle) > 0 && (
                    <button
                      onClick={goToPrevArticle}
                      className="w-full text-left group flex flex-col gap-2"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2 group-hover:text-accent-gold transition-colors">
                        <ChevronLeft size={16} /> Sebelumnya
                      </span>
                      <span className="font-display font-bold text-lg leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                        {articles[articles.indexOf(selectedArticle) - 1].title}
                      </span>
                    </button>
                  )}
                </div>
                
                <div className="flex-1 w-full text-right">
                  {articles.indexOf(selectedArticle) < articles.length - 1 && (
                    <button
                      onClick={goToNextArticle}
                      className="w-full text-right group flex flex-col items-end gap-2"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2 group-hover:text-accent-gold transition-colors">
                        Selanjutnya <ChevronLeft className="rotate-180" size={16} />
                      </span>
                      <span className="font-display font-bold text-lg leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                        {articles[articles.indexOf(selectedArticle) + 1].title}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <footer className="mt-32 pt-20 border-t border-current/10">
                <div className="p-12 sm:p-20 rounded-[60px] bg-current/[0.03] text-center border border-current/10">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-gold to-[#aa8c2e] text-black rounded-2xl flex items-center justify-center mx-auto mb-10 rotate-[-8deg] shadow-2xl shadow-accent-gold/40">
                    <span className="font-black text-xl">IL</span>
                  </div>
                  <h4 className="font-display text-4xl font-bold mb-6">Selesai Membaca</h4>
                  <p className="opacity-40 text-xl font-serif leading-relaxed mb-12 max-w-sm mx-auto italic">
                    "Semoga ilmu yang dipelajari menjadi cahaya yang menuntun ke jalan yang benar."
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedArticle(null);
                      stopAudio();
                    }}
                    className="inline-flex items-center gap-4 px-12 py-5 bg-accent-gold hover:bg-accent-gold/90 text-black rounded-full font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-accent-gold/20 uppercase tracking-[0.2em]"
                  >
                    Simpan & Tutup
                  </button>
                </div>
              </footer>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

