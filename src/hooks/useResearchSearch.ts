import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/utils/utils'

export interface BaseSearchFilters {
  title?: string
  author?: string
}

// 简化的研究页面搜索钩子（不包含日期逻辑）
export function useResearchSearch<T extends BaseSearchFilters>() {
  // 搜索相关
  const searchFilters = ref<T>({} as T)

  // 防抖计时器
  let searchTimeout: number | null = null

  // 生成缓存key
  const generateCacheKey = (page: number, filters: T, dateParams?: any) => {
    const allParams = { ...filters, ...dateParams }
    return `${page}-${JSON.stringify(allParams)}`
  }

  // 检查缓存是否过期
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < 5 * 60 * 1000 // 5分钟缓存
  }

  // 处理标题输入（防抖）
  const handleTitleInput = (onSearch: () => void) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = window.setTimeout(() => {
      onSearch()
    }, 500) // 500ms 防抖
  }

  // 处理作者输入（防抖）- 仅用于著作搜索
  const handleAuthorInput = (onSearch: () => void) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = window.setTimeout(() => {
      onSearch()
    }, 500) // 500ms 防抖
  }

  return {
    searchFilters,
    generateCacheKey,
    isCacheValid,
    handleTitleInput,
    handleAuthorInput
  }
}

// 通用的多语言文本获取
export function useLanguageText() {
  const { locale } = useI18n()

  const getCurrentLanguageText = (item: any, field: string) => {
    const currentLang = locale.value
    if (currentLang === 'en' && item[`${field}En`]) {
      return item[`${field}En`]
    }
    return item[field] || ''
  }

  // 格式化日期为 yyyy-mm-dd 格式
  const formatDateFn = (dateString?: string) => {
    if (!dateString) return ''
    return formatDate(dateString, 'yyyy-MM-dd')
  }

  return {
    getCurrentLanguageText,
    formatDate: formatDateFn
  }
}
