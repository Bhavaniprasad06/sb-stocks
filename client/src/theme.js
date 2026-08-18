import { useState, useEffect } from 'react';

const THEME_KEY = 'sb_theme';
const EVENT = 'sb-theme-change';

export const getTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
};

/**
 * Apply a theme by setting the data-theme attribute on <html> and persisting it.
 * Dispatches an event so subscribed components (navbar, charts) re-render.
 */
export const applyTheme = (theme) => {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  return next;
};

export const toggleTheme = () => {
  return applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
};

/**
 * React hook that returns the current theme and re-renders on toggle.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const handler = (e) => setTheme(e.detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return theme;
}
