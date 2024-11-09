import { writable } from 'svelte/store';

const defaultColors = {
  primary: '#000000',
  default: 'rgba(0, 0, 0, 0.8)',
  highlight: 'rgb(30, 131, 255)',
  bg: '#ffffff'
};

const darkColors = {
  primary: 'white',
  default: 'rgb(30, 255, 139)',
  highlight: 'white',
  bg: '#000000'
};

const createThemeStore = () => {
  const { subscribe, set, update } = writable({
    isDark: false,  // Default to light theme for SSR
    colors: defaultColors
  });

  if (typeof window !== 'undefined') {
    // Only run this client-side
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set({ isDark, colors: isDark ? darkColors : defaultColors });
  }

  return {
    subscribe,
    toggleTheme: () => update(theme => {
      const isDark = !theme.isDark;
      return {
        isDark,
        colors: isDark ? darkColors : defaultColors
      };
    }),
    setDarkMode: (isDark) => update(theme => ({
      isDark,
      colors: isDark ? darkColors : defaultColors
    }))
  };
};

export const theme = createThemeStore(); 