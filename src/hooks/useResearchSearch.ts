import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate } from '@/utils/utils'

export interface BaseSearchFilters {
  title?: string
  publishYear?: number
  publishMonth?: number
}

export interface BookSearchFilters extends BaseSearchFilters {
  author?: string
}

// 通用的研究页面搜索钩子
export function useResearchSearch<T extends BaseSearchFilters>() {
  const { locale } = useI18n()

  // 搜索相关
  const searchFilters = ref<T>({} as T)
  const selectedYear = ref<number | null>(null)
  const selectedMonth = ref<number | null>(null)

  // 防抖计时器
  let searchTimeout: number | null = null

  // 年份选项 (近10年)
  const availableYears = computed(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i)
    }
    return years
  })

  // 月份选项
  const availableMonths = computed(() => {
    return [
      { value: 1, label: locale.value === 'zh' ? '1月' : 'January' },
      { value: 2, label: locale.value === 'zh' ? '2月' : 'February' },
      { value: 3, label: locale.value === 'zh' ? '3月' : 'March' },
      { value: 4, label: locale.value === 'zh' ? '4月' : 'April' },
      { value: 5, label: locale.value === 'zh' ? '5月' : 'May' },
      { value: 6, label: locale.value === 'zh' ? '6月' : 'June' },
      { value: 7, label: locale.value === 'zh' ? '7月' : 'July' },
      { value: 8, label: locale.value === 'zh' ? '8月' : 'August' },
      { value: 9, label: locale.value === 'zh' ? '9月' : 'September' },
      { value: 10, label: locale.value === 'zh' ? '10月' : 'October' },
      { value: 11, label: locale.value === 'zh' ? '11月' : 'November' },
      { value: 12, label: locale.value === 'zh' ? '12月' : 'December' }
    ]
  })

  // 生成缓存key
  const generateCacheKey = (page: number, filters: T) => {
    return `${page}-${JSON.stringify(filters)}`
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

  // 处理日期变化（年份或月份）
  const handleDateChange = (onSearch: () => void) => {
    if (selectedYear.value) {
      searchFilters.value.publishYear = selectedYear.value
    } else {
      delete searchFilters.value.publishYear
    }

    if (selectedMonth.value) {
      searchFilters.value.publishMonth = selectedMonth.value
    } else {
      delete searchFilters.value.publishMonth
    }

    // 日期变化后立即搜索
    onSearch()
  }

  return {
    searchFilters,
    selectedYear,
    selectedMonth,
    availableYears,
    availableMonths,
    generateCacheKey,
    isCacheValid,
    handleTitleInput,
    handleAuthorInput,
    handleDateChange
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
