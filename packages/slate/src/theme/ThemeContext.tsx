import React from 'react';
import type { Theme } from './types';
import { lightTheme } from './light';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = React.createContext<ThemeContextValue>({
  theme: lightTheme,
  toggleTheme: () => {},
});
