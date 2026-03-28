import React, { useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from './ThemeContext';
import { lightTheme } from './light';
import { darkTheme } from './dark';

type Props = {
  children: React.ReactNode;
  /** Force a specific mode, overriding system preference */
  forceDark?: boolean;
};

export function ThemeProvider({ children, forceDark }: Props) {
  const systemScheme = useColorScheme();
  const [manualDark, setManualDark] = useState<boolean | undefined>(undefined);

  const isDark = manualDark !== undefined ? manualDark : (forceDark ?? systemScheme === 'dark');

  const toggleTheme = useCallback(() => {
    setManualDark(prev => !(prev ?? isDark));
  }, [isDark]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
