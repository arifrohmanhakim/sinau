import React from 'react';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Article } from '../types';

interface ReaderFooterProps {
  articles: Article[];
  selectedArticle: Article;
  goToPrevArticle: () => void;
  goToNextArticle: () => void;
  onFinish: () => void;
  bookName: string;
}

export const ReaderFooter: React.FC<ReaderFooterProps> = ({
  articles,
  selectedArticle,
  goToPrevArticle,
  goToNextArticle,
  onFinish,
  bookName
}) => {
  const currentIdx = articles.indexOf(selectedArticle);

  return (
    <footer className="mt-20">
      {/* Article Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
        <div className="flex-1 w-full">
          {currentIdx > 0 && (
            <button
              onClick={goToPrevArticle}
              className="w-full text-left group flex flex-col gap-2"
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2 group-hover:text-accent-gold transition-colors">
                <ChevronLeft size={16} /> Sebelumnya
              </span>
              <span className="font-display font-bold text-lg leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                {articles[currentIdx - 1].title}
              </span>
            </button>
          )}
        </div>
        
        <div className="flex-1 w-full text-right">
          {currentIdx < articles.length - 1 && (
            <button
              onClick={goToNextArticle}
              className="w-full text-right group flex flex-col items-end gap-2"
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2 group-hover:text-accent-gold transition-colors">
                Selanjutnya <ChevronLeft className="rotate-180" size={16} />
              </span>
              <span className="font-display font-bold text-lg leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                {articles[currentIdx + 1].title}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-32 pt-20 border-t border-current/10">
        <div className="p-12 sm:p-20 rounded-[60px] bg-current/[0.03] text-center border border-current/10">
          <div className="w-20 h-20 bg-gradient-to-br from-accent-gold to-[#aa8c2e] text-black rounded-2xl flex items-center justify-center mx-auto mb-10 rotate-[-8deg] shadow-2xl shadow-accent-gold/40">
            <span className="font-black text-xl">IL</span>
          </div>
          <h4 className="font-display text-4xl font-bold mb-6">Selesai Membaca</h4>
          <p className="opacity-40 text-xl font-serif leading-relaxed mb-12 max-w-sm mx-auto italic">
            "Semoga ilmu yang dipelajari menjadi cahaya yang menuntun ke jalan yang benar."
          </p>
          <button 
            onClick={onFinish}
            className="inline-flex items-center gap-4 px-12 py-5 bg-accent-gold hover:bg-accent-gold/90 text-black rounded-full font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-accent-gold/20 uppercase tracking-[0.2em]"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </footer>
  );
};
