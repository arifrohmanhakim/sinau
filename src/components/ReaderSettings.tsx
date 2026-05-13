import React from 'react';
import { motion } from 'motion/react';
import { Sun, Coffee, Moon, Type } from 'lucide-react';
import { Theme, FontFamily } from '../types';

interface ReaderSettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

export const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily
}) => {
  const bgClasses = {
    light: 'bg-[#fdfaf6]',
    sepia: 'bg-[#f4ecd8]',
    dark: 'bg-[#0f0f0f]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`absolute top-full left-0 right-0 border-b border-current/10 shadow-2xl z-40 ${bgClasses[theme]}`}
    >
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Theme Selection */}
        <div className="flex flex-col items-center sm:items-start gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Tema</span>
          <div className="flex gap-3">
            {(['light', 'sepia', 'dark'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-12 h-12 rounded-xl border-4 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
                  t === 'light' ? 'bg-[#fdfaf6]' : t === 'sepia' ? 'bg-[#f4ecd8]' : 'bg-[#0f0f0f]'
                } ${theme === t ? 'border-accent-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-current/5'}`}
              >
                {t === 'light' && <Sun size={16} className="opacity-40" />}
                {t === 'sepia' && <Coffee size={16} className="opacity-40" />}
                {t === 'dark' && <Moon size={16} className="opacity-40" />}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Selection */}
        <div className="flex flex-col items-center sm:items-start gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Jenis Huruf</span>
          <div className="flex gap-2">
            {(['sans', 'serif', 'mono'] as FontFamily[]).map((f) => (
              <button
                key={f}
                onClick={() => setFontFamily(f)}
                className={`px-4 py-2 rounded-xl border-2 transition-all font-bold text-sm ${
                  fontFamily === f 
                    ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' 
                    : 'border-current/5 hover:border-current/10'
                } ${
                  f === 'sans' ? 'font-sans' : f === 'serif' ? 'font-serif' : 'font-mono'
                }`}
              >
                {f === 'sans' ? 'Sans' : f === 'serif' ? 'Serif' : 'Mono'}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size Selection */}
        <div className="flex flex-col items-center sm:items-start gap-3 flex-1 w-full max-w-xs">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Ukuran</span>
            <span className="text-xs font-mono font-bold">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-4 w-full">
            <Type size={14} className="opacity-40" />
            <div className="relative flex-1 group">
              <input 
                type="range" 
                min="14" 
                max="32" 
                step="2"
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-accent-gold h-1.5 bg-current/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <Type size={24} className="opacity-40" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
