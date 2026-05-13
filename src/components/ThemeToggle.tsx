import React from 'react';
import { Sun, Moon, Coffee } from 'lucide-react';
import { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  return (
    <button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'sepia' : 'dark')}
      className="p-3 rounded-full hover:bg-current/10 transition-colors"
      title="Ubah Suasana"
    >
      {theme === 'light' && <Sun size={20} />}
      {theme === 'sepia' && <Coffee size={20} />}
      {theme === 'dark' && <Moon size={20} />}
    </button>
  );
};
