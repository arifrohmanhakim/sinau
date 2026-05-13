import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowRight
} from 'lucide-react';
import { Article, Book, Theme } from './types';
import { LibraryHeader } from './components/LibraryHeader';
import { ReaderSidebar } from './components/ReaderSidebar';
import { ReaderHeader } from './components/ReaderHeader';
import { ReaderSettings } from './components/ReaderSettings';
import { ShelfView } from './components/ShelfView';
import { BookDetail } from './components/BookDetail';
import { ArticleView } from './components/ArticleView';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  
  // Storage for bookmarks and scroll positions
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('ilmiyyah_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [bookBookmarks, setBookBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('ilmiyyah_book_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [readingPositions, setReadingPositions] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ilmiyyah_reading_positions');
    return saved ? JSON.parse(saved) : {};
  });

  const [lastReadArticlePerBook, setLastReadArticlePerBook] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('ilmiyyah_last_read_articles');
    return saved ? JSON.parse(saved) : {};
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

  useEffect(() => {
    localStorage.setItem('ilmiyyah_reading_positions', JSON.stringify(readingPositions));
  }, [readingPositions]);

  useEffect(() => {
    localStorage.setItem('ilmiyyah_last_read_articles', JSON.stringify(lastReadArticlePerBook));
  }, [lastReadArticlePerBook]);

  // Handle scroll position persistence
  useEffect(() => {
    if (selectedArticle && selectedBook) {
      // Save last read article for this book
      setLastReadArticlePerBook(prev => ({
        ...prev,
        [selectedBook.id]: selectedArticle.id
      }));

      // Restore paragraph index if exists
      const savedIdx = localStorage.getItem(`idx_${selectedArticle.id}`);
      if (savedIdx) {
        setTimeout(() => {
          const paragraphs = document.querySelectorAll('.markdown-body p');
          const index = parseInt(savedIdx);
          if (paragraphs[index]) {
            paragraphs[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setActiveParagraphIndex(index);
          }
        }, 800);
      } else {
        // Fallback to scroll position
        const savedPos = localStorage.getItem(`pos_${selectedArticle.id}`);
        if (savedPos) {
          setTimeout(() => {
            window.scrollTo({ top: parseInt(savedPos), behavior: 'smooth' });
          }, 800);
        }
      }

      const handleUnload = () => {
        localStorage.setItem(`pos_${selectedArticle.id}`, window.scrollY.toString());
      };

      window.addEventListener('scroll', handleUnload);
      return () => window.removeEventListener('scroll', handleUnload);
    }
  }, [selectedArticle, selectedBook]);

  // Audio related functions
  const readFromParagraph = (index: number) => {
    // Save position index
    if (selectedArticle) {
      localStorage.setItem(`idx_${selectedArticle.id}`, index.toString());
    }
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

  // Fetch bookmarked articles when view is Pilihan
  useEffect(() => {
    if (categoryFilter === 'Pilihan' && bookmarks.length > 0) {
      const fetchBookmarkedArticles = async () => {
        setLoadingBookmarks(true);
        try {
          const response = await fetch(`/api/articles/batch?ids=${bookmarks.join(',')}`);
          const data = await response.json();
          setBookmarkedArticles(data);
        } catch (error) {
          console.error("Failed to fetch bookmarked articles:", error);
        } finally {
          setLoadingBookmarks(false);
        }
      };
      fetchBookmarkedArticles();
    } else if (bookmarks.length === 0) {
      setBookmarkedArticles([]);
    }
  }, [categoryFilter, bookmarks]);

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
      // Restore position
      const savedIndex = readingPositions[selectedArticle.id];
      if (savedIndex !== undefined) {
        setTimeout(() => {
          const paragraphs = container.querySelectorAll('p');
          if (paragraphs[savedIndex]) {
            paragraphs[savedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setActiveParagraphIndex(savedIndex);
          }
        }, 500); // Wait for content to render and fonts to load
      }

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

  // Update scroll position saving
  useEffect(() => {
    if (selectedArticle && activeParagraphIndex !== null) {
      setReadingPositions(prev => ({
        ...prev,
        [selectedArticle.id]: activeParagraphIndex
      }));
    }
  }, [activeParagraphIndex, selectedArticle]);

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

  const categories = ["Semua", "Pilihan", "Muallif", "Aqidah", "Ibadah", "Adab", "Silsilah", "Kitab", "Bahasa Arab", "Ramadhan"];

  const filteredBooks = books.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = b.name.toLowerCase().includes(query) || (b.muallif && b.muallif.toLowerCase().includes(query));
    const isUseful = b.count > 0 && b.slug !== 'uncategorized' && b.slug !== 'e-book';
    
    if (categoryFilter === 'Pilihan') return matchesSearch && isUseful && bookBookmarks.includes(b.id);
    if (categoryFilter === 'Muallif') return matchesSearch && isUseful && b.muallif && b.muallif !== "Ilmiyyah";
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

  const filteredBookmarkedArticles = bookmarkedArticles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.author.toLowerCase().includes(searchQuery.toLowerCase())
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
            <LibraryHeader 
              theme={theme}
              setTheme={setTheme}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
            />

            <ShelfView 
              loading={loading}
              filteredBooks={filteredBooks}
              allBooks={books}
              bookBookmarks={bookBookmarks}
              setSelectedBook={setSelectedBook}
              setCategoryFilter={setCategoryFilter}
              categoryFilter={categoryFilter}
              theme={theme}
              bookmarkedArticles={filteredBookmarkedArticles}
              loadingBookmarks={loadingBookmarks}
              showBookmarkedArticles={categoryFilter === 'Pilihan'}
              setSelectedArticle={setSelectedArticle}
              searchQuery={searchQuery}
            />
            
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
          <BookDetail 
            selectedBook={selectedBook}
            onBack={() => setSelectedBook(null)}
            bookBookmarks={bookBookmarks}
            setBookBookmarks={setBookBookmarks}
            lastReadArticlePerBook={lastReadArticlePerBook}
            articles={articles}
            setSelectedArticle={setSelectedArticle}
            loadingArticles={loadingArticles}
            filteredArticles={filteredArticles}
            theme={theme}
          />
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
            <ReaderHeader 
              onBack={() => {
                setSelectedArticle(null);
                stopAudio();
              }}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isPlaying={isPlaying}
              isPaused={isPaused}
              onToggleAudio={toggleAudio}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              isBookmarked={selectedArticle ? bookmarks.includes(selectedArticle.id) : false}
              onToggleBookmark={() => {
                if (!selectedArticle) return;
                if (bookmarks.includes(selectedArticle.id)) {
                  setBookmarks(bookmarks.filter(id => id !== selectedArticle.id));
                } else {
                  setBookmarks([...bookmarks, selectedArticle.id]);
                }
              }}
              onShare={async () => {
                if (!selectedArticle) return;
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
              theme={theme}
            />

            <AnimatePresence>
              {showSettings && (
                <ReaderSettings 
                  theme={theme}
                  setTheme={setTheme}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                />
              )}
            </AnimatePresence>

            <div className="max-w-[1400px] mx-auto flex gap-10">
              {/* Sidebar (Desktop and Mobile) */}
              {selectedBook && (
                <ReaderSidebar 
                  isOpen={isSidebarOpen}
                  setIsOpen={setIsSidebarOpen}
                  selectedBook={selectedBook}
                  articles={articles}
                  selectedArticle={selectedArticle}
                  setSelectedArticle={setSelectedArticle}
                  loadingArticles={loadingArticles}
                  stopAudio={stopAudio}
                  theme={theme}
                />
              )}

              {/* Reading Content */}
              {selectedArticle && (
                <ArticleView 
                  selectedArticle={selectedArticle}
                  selectedBook={selectedBook}
                  fontSize={fontSize}
                  contentRef={contentRef}
                  activeParagraphIndex={activeParagraphIndex}
                  articles={articles}
                  goToPrevArticle={goToPrevArticle}
                  goToNextArticle={goToNextArticle}
                  onFinish={() => {
                    setSelectedArticle(null);
                    stopAudio();
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

