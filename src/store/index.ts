import { defineStore } from 'pinia'
import 'element-plus/theme-chalk/dark/css-vars.css'

export type ThemeType = 'light' | 'dark' | 'purple';

// 主题状态管理
export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: localStorage.getItem('theme') === 'dark' || false,
    currentTheme: localStorage.getItem('colorTheme') || 'default'
  }),
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
      document.body.className = this.isDarkMode ? 'dark-mode' : ''
      // 确保颜色主题类也被保留
      if (this.currentTheme === 'purple') {
        document.body.classList.add('purple-theme')
      }
      
      // 同时切换Element Plus的暗黑模式
      // 这会添加或移除html根元素上的dark类
      const htmlEl = document.documentElement
      if (this.isDarkMode) {
        htmlEl.classList.add('dark')
      } else {
        htmlEl.classList.remove('dark')
      }
    },
    setColorTheme(theme: 'default' | 'purple') {
      this.currentTheme = theme
      localStorage.setItem('colorTheme', theme)
      
      // 移除所有主题类
      document.body.classList.remove('purple-theme')
      
      // 添加新主题类
      if (theme === 'purple') {
        document.body.classList.add('purple-theme')
      }
    },
    initTheme() {
      // 设置深色/浅色模式
      document.body.className = this.isDarkMode ? 'dark-mode' : ''
      
      // 设置颜色主题
      if (this.currentTheme === 'purple') {
        document.body.classList.add('purple-theme')
      }
      
      // 同时初始化Element Plus的暗黑模式
      const htmlEl = document.documentElement
      if (this.isDarkMode) {
        htmlEl.classList.add('dark')
      } else {
        htmlEl.classList.remove('dark')
      }
    }
  }
})

// 语言状态管理
export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: localStorage.getItem('locale') || 'zh'
  }),
  actions: {
    setLanguage(lang: string) {
      if (lang !== 'zh' && lang !== 'en') return
      this.currentLanguage = lang
      localStorage.setItem('locale', lang)
      document.documentElement.className = lang === 'zh' ? 'lang-zh' : ''
    }
  }
})

// 应用程序状态管理
export const useAppStore = defineStore('app', {
  state: () => ({
    isLoading: false,
    isMobileMenuOpen: false,
    isScrolled: false
  }),
  actions: {
    setLoading(status: boolean) {
      this.isLoading = status
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },
    updateScrollStatus(isScrolled: boolean) {
      this.isScrolled = isScrolled
    }
  }
}) 
 