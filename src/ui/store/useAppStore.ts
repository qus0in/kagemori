import { create } from 'zustand'

export type ThemeMode = 'kagemori' | 'kagemori-dark'

interface AppState {
  theme: ThemeMode
  lastRefreshedAt: string | null
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setLastRefreshedAt: (time: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'kagemori',
  lastRefreshedAt: null,
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme: ThemeMode = state.theme === 'kagemori' ? 'kagemori-dark' : 'kagemori'
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', nextTheme)
      }
      return { theme: nextTheme }
    }),
  setLastRefreshedAt: (time) => set({ lastRefreshedAt: time }),
}))
