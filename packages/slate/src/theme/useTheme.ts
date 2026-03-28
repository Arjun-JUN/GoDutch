import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import type { Theme } from './types';

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useToggleTheme(): () => void {
  return useContext(ThemeContext).toggleTheme;
}
