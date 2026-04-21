import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'dark' as 'dark' | 'light'
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    init() {
      if (import.meta.client) {
        try {
          const saved = localStorage.getItem('mp-theme')
          if (saved === 'light' || saved === 'dark') {
            this.theme = saved
            this.apply()
          }
        } catch {}
      }
    },
    toggle() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      this.apply()
      try { localStorage.setItem('mp-theme', this.theme) } catch {}
    },
    apply() {
      if (import.meta.client) {
        document.documentElement.setAttribute('data-theme', this.theme)
      }
    }
  }
})
