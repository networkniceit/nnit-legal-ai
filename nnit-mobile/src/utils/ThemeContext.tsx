import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '../services/storage';

// ── Color tokens for both modes ───────────────────────────────
export const DarkColors = {
  mode: 'dark' as const,
  bg: '#0A0E1A',
  bgCard: '#111827',
  bgElevated: '#1A2235',
  bgModal: '#0D1320',
  gold: '#C9A84C',
  goldLight: '#E8C870',
  goldDark: '#9B7A2E',
  goldMuted: 'rgba(201,168,76,0.15)',
  textPrimary: '#F5F0E8',
  textSecondary: '#8A95A8',
  textMuted: '#4A5568',
  success: '#2ECC71',
  danger: '#E53E3E',
  warning: '#F6AD55',
  info: '#4299E1',
  border: 'rgba(201,168,76,0.2)',
  borderSubtle: 'rgba(255,255,255,0.06)',
  gradientGold: ['#C9A84C', '#9B7A2E'] as const,
  gradientBg: ['#111827', '#0A0E1A'] as const,
  gradientCard: ['#1A2235', '#111827'] as const,
  tabBar: '#0D1320',
  statusBar: 'light-content' as const,
};

export const LightColors = {
  mode: 'light' as const,
  bg: '#F7F3ED',
  bgCard: '#FFFFFF',
  bgElevated: '#EDE8DF',
  bgModal: '#F0EBE3',
  gold: '#9B6E1A',
  goldLight: '#C9A84C',
  goldDark: '#7A5210',
  goldMuted: 'rgba(155,110,26,0.1)',
  textPrimary: '#1A1208',
  textSecondary: '#5C5040',
  textMuted: '#A89880',
  success: '#1A8C4E',
  danger: '#C0392B',
  warning: '#D68910',
  info: '#1A6FAD',
  border: 'rgba(155,110,26,0.25)',
  borderSubtle: 'rgba(0,0,0,0.07)',
  gradientGold: ['#C9A84C', '#9B6E1A'] as const,
  gradientBg: ['#FFFFFF', '#F7F3ED'] as const,
  gradientCard: ['#FFFFFF', '#F5F0E8'] as const,
  tabBar: '#FFFFFF',
  statusBar: 'dark-content' as const,
};

export type ThemeColors = typeof DarkColors;

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: DarkColors,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    Storage.get('theme_mode').then((saved) => {
      if (saved === 'light') setIsDark(false);
    });
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    Storage.set('theme_mode', next ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ colors: isDark ? DarkColors : LightColors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
