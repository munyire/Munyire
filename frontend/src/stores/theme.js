import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORAGE_KEY = 'munyire-theme';

export const useThemeStore = defineStore('theme', () => {
  // Default to dark mode if no preference is stored
  const isDark = ref(true);

  // Initialize theme from localStorage
  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      isDark.value = stored === 'dark';
    } else {
      // Default to dark mode
      isDark.value = true;
    }
    applyTheme();
  };

  // Apply theme to document
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle between dark and light mode
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
  };

  // Set specific theme
  const setTheme = (theme) => {
    isDark.value = theme === 'dark';
    applyTheme();
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
  };

  const themeLabel = computed(() => isDark.value ? 'Sötét mód' : 'Világos mód');

  return {
    isDark,
    themeLabel,
    initTheme,
    toggleTheme,
    setTheme
  };
});
