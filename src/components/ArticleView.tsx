import React from 'react';
import { motion } from 'motion/react';
import { Article, Book, FontFamily } from '../types';
import { ReaderFooter } from './ReaderFooter';

interface ArticleViewProps {
  selectedArticle: Article;
  selectedBook: Book | null;
  fontSize: number;
  fontFamily: FontFamily;
  contentRef: React.RefObject<HTMLDivElement>;
  activeParagraphIndex: number | null;
  articles: Article[];
  goToPrevArticle: () => void;
  goToNextArticle: () => void;
  onFinish: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  selectedArticle,
  selectedBook,
  fontSize,
  fontFamily,
  contentRef,
  activeParagraphIndex,
  articles,
  goToPrevArticle,
  goToNextArticle,
  onFinish
}) => {
  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-24 pb-48">
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
            {selectedBook?.name}
          </span>
          <h1 className={`text-5xl md:text-7xl font-display font-medium leading-[1.1] mb-10 tracking-tight text-current ${fontClasses[fontFamily]}`}>
            {selectedArticle.title}
          </h1>
          <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-3 text-sm opacity-40 font-bold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">{selectedArticle.readTime} MEMBACA</span>
          </div>
        </motion.div>
      </header>

      <div 
        ref={contentRef}
        className={`markdown-body transition-all duration-300 drop-cap ${fontClasses[fontFamily]}`}
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
      />

      <div className="mt-12 p-6 rounded-2xl bg-accent-gold/5 border border-dashed border-accent-gold/30 text-center">
        <p className="text-xs font-bold uppercase tracking-widest opacity-60">
          Tip: Klik pada paragraf mana saja untuk mulai mendengarkan dari sana.
        </p>
      </div>

      <ReaderFooter 
        articles={articles}
        selectedArticle={selectedArticle}
        goToPrevArticle={goToPrevArticle}
        goToNextArticle={goToNextArticle}
        bookName={selectedBook?.name || ''}
        onFinish={onFinish}
      />
    </main>
  );
};
