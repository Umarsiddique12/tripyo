import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'appTheme';

const lightPalette = {
  name: 'light',
  background: '#F7F7FB',
  surface: '#FFFFFF',
  surfaceAlt: 'rgba(255,255,255,0.06)',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E5E7EB',
  primary: '#7C3AED',
  primaryTextOn: '#FFFFFF',
  accent: '#007AFF',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  shadow: 'rgba(0,0,0,0.12)'
};

const darkPalette = {
  name: 'dark',
  background: '#0B1220',
  surface: 'rgba(255,255,255,0.06)',
  surfaceAlt: 'rgba(255,255,255,0.04)',
  text: '#E5E7EB',
  textSecondary: '#98A2B3',
  border: 'rgba(255,255,255,0.08)',
  primary: '#7C3AED',
  primaryTextOn: '#FFFFFF',
  accent: '#7C3AED',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#F59E0B',
  shadow: 'rgba(0,0,0,0.35)'
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = Appearance.getColorScheme();
  const [themeName, setThemeName] = useState('system'); // 'light' | 'dark' | 'system'
  const [resolved, setResolved] = useState(systemScheme || 'light');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setResolved(colorScheme || 'light');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setThemeName(stored);
    })();
  }, []);

  const setTheme = async (name) => {
    setThemeName(name);
    await AsyncStorage.setItem(STORAGE_KEY, name);
  };

  const isDark = (themeName === 'dark') || (themeName === 'system' && resolved === 'dark');
  const colors = isDark ? darkPalette : lightPalette;

  const value = useMemo(() => ({
    themeName,
    setTheme,
    isDark,
    colors,
  }), [themeName, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
