import React from 'react';
import { motion } from 'motion/react';
import { Sun, Coffee, Moon, Type } from 'lucide-react';
import { Theme } from '../types';

interface ReaderSettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  theme,
  setTheme,
  fontSize,
  setFontSize
}) => {
  return (
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
  );
};
