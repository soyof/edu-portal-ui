import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getNewInfoForLanguage } from '../utils/utils'

/**
 * 多语言数据处理组合式函数
 * @param initialData 初始数据
 * @returns 响应式的多语言数据和相关方法
 */
export const useMultiLang = <T = any>(initialData?: T) => {
  const { locale } = useI18n()
  const rawData = ref<T | null>(initialData || null)
  const processedData = ref<T | null>(null)

  // 计算属性：当前语言的数据
  const multiLangData = computed(() => {
    if (!rawData.value) return null
    return getNewInfoForLanguage(rawData.value as any, locale.value)
  })

  // 设置原始数据
  const setData = (data: T) => {
    rawData.value = data
    processedData.value = getNewInfoForLanguage(data as any, locale.value)
  }

  // 更新数据（保持响应式）
  const updateData = (data: T) => {
    setData(data)
  }

  // 手动刷新数据（重新处理当前数据）
  const refreshData = () => {
    if (rawData.value) {
      processedData.value = getNewInfoForLanguage(rawData.value as any, locale.value)
    }
  }

  // 获取指定语言的数据
  const getDataByLocale = (targetLocale: string) => {
    if (!rawData.value) return null
    return getNewInfoForLanguage(rawData.value as any, targetLocale)
  }

  // 监听语言变化事件
  const handleLocaleChange = (event: Event) => {
    const customEvent = event as CustomEvent
    const { newLocale } = customEvent.detail
    if (rawData.value) {
      processedData.value = getNewInfoForLanguage(rawData.value as any, newLocale)
    }
  }

  onMounted(() => {
    // 监听自定义语言变化事件
    window.addEventListener('localeChange', handleLocaleChange)

    // 初始化数据
    if (rawData.value) {
      processedData.value = getNewInfoForLanguage(rawData.value as any, locale.value)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('localeChange', handleLocaleChange)
  })

  return {
    rawData,
    multiLangData,
    processedData,
    setData,
    updateData,
    refreshData,
    getDataByLocale,
    currentLocale: locale
  }
}

/**
 * 简化版多语言数据处理函数
 * 用于单次数据转换，不需要响应式
 * @param data 需要处理的数据
 * @param targetLocale 目标语言（可选）
 * @returns 处理后的数据
 */
export const processMultiLangData = <T = any>(data: T, targetLocale?: string): T => {
  const currentLocale = targetLocale || localStorage.getItem('locale') || 'zh'
  return getNewInfoForLanguage(data as any, currentLocale)
}

/**
 * 检查数据是否包含多语言字段
 * @param data 要检查的数据
 * @param fieldName 字段名
 * @returns 是否包含对应的英文字段
 */
export const hasMultiLangField = (data: any, fieldName: string): boolean => {
  if (!data || typeof data !== 'object') return false
  return !!(data[`${fieldName}En`] || data[`${fieldName}_en`])
}

/**
 * 批量处理API响应数据的多语言字段
 * @param apiResponse API响应数据
 * @param targetLocale 目标语言
 * @returns 处理后的数据
 */
export const processApiResponse = <T = any>(apiResponse: T, targetLocale?: string): T => {
  if (!apiResponse) return apiResponse
  return processMultiLangData(apiResponse, targetLocale)
}
