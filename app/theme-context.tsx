import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(undefined);
const STORAGE_KEY = 'SignLearnDarkMode';

const lightTheme = {
  darkMode: false,
  colors: {
    background: '#E9DDCB',
    surface: '#F7F2EC',
    card: '#F9F4EE',
    border: '#E7D9C7',
    textPrimary: '#2F2A28',
    textSecondary: '#655F58',
    placeholder: '#8A8179',
    accent: '#E96A67',
    muted: '#F5EDE5',
  },
};

const darkTheme = {
  darkMode: true,
  colors: {
    background: '#111827',
    surface: '#1F2937',
    card: '#111827',
    border: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    placeholder: '#9CA3AF',
    accent: '#4ECDC4',
    muted: '#111827',
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedValue !== null) {
          setDarkMode(storedValue === 'true');
        }
      } catch (error) {
        console.log('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, darkMode ? 'true' : 'false').catch((error) => {
      console.log('Failed to save theme:', error);
    });
  }, [darkMode]);

  const theme = darkMode ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ darkMode, setDarkMode, theme }),
    [darkMode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
