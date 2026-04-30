import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const THEME_KEY = 'theme';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const storedUser = authService.getStoredUser();
  const userTheme = storedUser?.preferences?.theme;
  if (userTheme === 'light' || userTheme === 'dark' || userTheme === 'system') return userTheme;

  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}

function resolveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Keep resolved theme in sync with system changes when using "system".
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const update = () => setResolvedTheme(resolveTheme(theme));
    update();

    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [theme]);

  // Apply globally in one place to avoid per-page conflicts.
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.body.classList.toggle('dark-mode', resolved === 'dark');
  }, [theme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

