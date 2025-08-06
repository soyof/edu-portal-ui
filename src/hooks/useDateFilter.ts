import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface DateFilterOptions {
  yearRange?: number // 年份范围，默认10年
  startYear?: number // 起始年份，默认为当前年份
  enableMonth?: boolean // 是否启用月份选择，默认true
}

export function useDateFilter(options: DateFilterOptions = {}) {
  const { t } = useI18n()

  const {
    yearRange = 10,
    startYear = new Date().getFullYear(),
    enableMonth = true
  } = options

  // 响应式数据
  const selectedYear = ref<number | null>(null)
  const selectedMonth = ref<number | null>(null)

  // 年份选项
  const availableYears = computed(() => {
    const years: number[] = []
    for (let i = 0; i < yearRange; i++) {
      years.push(startYear - i)
    }
    return years
  })

  // 月份选项 - 使用国际化配置
  const availableMonths = computed(() => {
    if (!enableMonth) return []

    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: t(`common.month${i + 1}`)
    }))
  })

  // 重置筛选条件
  const resetDateFilter = () => {
    selectedYear.value = null
    selectedMonth.value = null
  }

  // 获取筛选条件对象
  const getDateFilterParams = () => {
    const params: Record<string, any> = {}

    if (selectedYear.value) {
      params.publishYear = selectedYear.value
    }

    if (enableMonth && selectedMonth.value) {
      params.publishMonth = selectedMonth.value
    }

    return params
  }

  // 设置筛选条件
  const setDateFilter = (year?: number | null, month?: number | null) => {
    selectedYear.value = year || null
    if (enableMonth) {
      selectedMonth.value = month || null
    }
  }

  // 检查是否有筛选条件
  const hasDateFilter = computed(() => {
    return selectedYear.value !== null || (enableMonth && selectedMonth.value !== null)
  })

  // 格式化显示当前筛选条件
  const formatCurrentFilter = computed(() => {
    const parts: string[] = []

    if (selectedYear.value) {
      parts.push(`${selectedYear.value}`)
    }

    if (enableMonth && selectedMonth.value) {
      const monthLabel = availableMonths.value.find(m => m.value === selectedMonth.value)?.label
      if (monthLabel) {
        parts.push(monthLabel)
      }
    }

    return parts.join(' ')
  })

  return {
    // 响应式数据
    selectedYear,
    selectedMonth,

    // 计算属性
    availableYears,
    availableMonths,
    hasDateFilter,
    formatCurrentFilter,

    // 方法
    resetDateFilter,
    getDateFilterParams,
    setDateFilter
  }
}

// 扩展的日期筛选hooks，包含搜索逻辑
export function useDateFilterWithSearch(
  onSearch: () => void,
  options: DateFilterOptions = {}
) {
  const dateFilter = useDateFilter(options)

  // 处理年份变化
  const handleYearChange = () => {
    onSearch()
  }

  // 处理月份变化
  const handleMonthChange = () => {
    onSearch()
  }

  // 处理任意日期变化
  const handleDateChange = () => {
    onSearch()
  }

  return {
    ...dateFilter,

    // 事件处理方法
    handleYearChange,
    handleMonthChange,
    handleDateChange
  }
}
