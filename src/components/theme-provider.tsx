
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define the ThemeProviderProps type here instead of importing it
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  forcedTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const context = React.useContext(
    React.createContext<{ theme: string | undefined; setTheme: (theme: string) => void }>({
      theme: undefined,
      setTheme: () => null,
    })
  )
  
  // When using next-themes in a regular React app, we need to initialize the theme provider
  const [mounted, setMounted] = React.useState(false);
  const [theme, setThemeState] = React.useState<string | undefined>(undefined);
  
  React.useEffect(() => {
    setMounted(true);
    // Check for dark mode preference
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = localStorage.getItem('poultry-theme') || (isDarkMode ? 'dark' : 'light');
    setThemeState(initialTheme);
    
    // Apply theme class
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const setTheme = React.useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem('poultry-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return { 
    theme: theme || context.theme,
    setTheme: setTheme || context.setTheme
  };
}
