import React from 'react';
import { motion } from 'motion/react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { Book, Theme } from '../types';

interface BookCardProps {
  book: Book;
  theme: Theme;
  isBookmarked: boolean;
  onClick: () => void;
  index: number;
}

export const BookCard: React.FC<BookCardProps> = ({ book, theme, isBookmarked, onClick, index }) => {
  const bookCardClasses = {
    light: 'bg-white shadow-lg',
    sepia: 'bg-[#f4ebd8] shadow-md border-paper-sepia/20',
    dark: 'bg-[#1a1a1a] shadow-xl border-white/5'
  };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -12 }}
      className="group flex flex-col text-left"
    >
      <div className={`aspect-[3/4] w-full rounded-r-[20px] rounded-l-[4px] group-hover:shadow-2xl group-hover:shadow-accent-gold/20 transition-all mb-6 relative overflow-hidden flex flex-col border-y border-r border-current/[0.05] ${bookCardClasses[theme]}`}>
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
        
        {isBookmarked && (
          <div className="absolute top-0 right-4 w-8 h-10 bg-accent-gold text-black flex items-center justify-center rounded-b-md shadow-lg z-20">
            <BookmarkIcon size={16} fill="currentColor" />
          </div>
        )}
        
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent border-r border-white/5" />
        <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/10" />
        
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-end relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-2 flex items-center justify-between">
            <span>{book.count} Bab</span>
            {isBookmarked && <BookmarkIcon size={12} fill="currentColor" className="text-accent-gold" />}
          </div>
          <h3 className="text-xl md:text-2xl font-display font-medium leading-tight line-clamp-4 text-white drop-shadow-lg mb-2">
            {book.name}
          </h3>
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
            {book.muallif}
          </div>
        </div>
        
        <div className="h-1 bg-accent-gold opacity-60 relative z-10" />
      </div>
    </motion.button>
  );
};
