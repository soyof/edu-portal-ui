import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: localStorage.getItem('locale') || 'zh', // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages: {
    en,
    zh
  }
})

// 添加语言切换函数
export function setLocale(locale: 'en' | 'zh') {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.className = locale === 'zh' ? 'lang-zh' : ''
}

export default i18n 
