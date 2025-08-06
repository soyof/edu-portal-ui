<template>
  <div class="dynamic-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="floating-elements">
        <div
          v-for="i in 12"
          :key="i"
          class="float-element"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 6 + 's',
            animationDuration: (6 + Math.random() * 4) + 's'
          }"
        ></div>
      </div>

      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">{{ $t('news.title') }}</h1>
          <p class="page-subtitle">{{ $t('news.subtitle') }}</p>
          <div class="stats-info">
            <span class="total-count">{{ $t('news.totalDynamics') }}: {{ total }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="content-section">
      <div class="container">
        <!-- Search Filters -->
        <div class="search-filters">
          <div class="filter-row">
            <div class="filter-item">
              <el-input
                v-model="searchFilters.title"
                :placeholder="$t('news.titlePlaceholder')"
                clearable
                class="search-input"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
                @input="() => handleTitleInput(handleSearch)"
              >
                <template #prefix>
                  <el-icon class="search-icon">
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>

            <div class="filter-item">
              <el-select
                v-model="searchFilters.dynamicType"
                :placeholder="$t('news.selectType')"
                clearable
                class="type-select"
                :loading="loadingDictionary"
                @change="handleSearch"
              >
                <el-option
                  v-for="type in dynamicTypes"
                  :key="type.dictId"
                  :value="type.dictId"
                  :label="locale === 'en' && type.dictValueEn ? type.dictValueEn : type.dictValue"
                />
              </el-select>
            </div>

            <div class="filter-item date-filters">
              <el-select
                v-model="selectedYear"
                :placeholder="$t('research.selectYear')"
                clearable
                class="year-select"
                @change="handleDateChange"
              >
                <el-option
                  v-for="year in availableYears"
                  :key="year"
                  :label="year"
                  :value="year"
                />
              </el-select>
            </div>

            <div class="filter-item date-filters">
              <el-select
                v-model="selectedMonth"
                :placeholder="$t('research.selectMonth')"
                clearable
                class="month-select"
                @change="handleDateChange"
              >
                <el-option
                  v-for="month in availableMonths"
                  :key="month.value"
                  :label="month.label"
                  :value="month.value"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <p>{{ $t('common.loading') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!dynamicList.length" class="empty-state">
          <el-icon class="empty-icon">
            <Document />
          </el-icon>
          <p>{{ $t('news.noDynamics') }}</p>
        </div>

        <!-- Dynamic List -->
        <div v-else class="dynamic-list">
          <div
            v-for="dynamic in dynamicList"
            :key="dynamic.id"
            class="dynamic-item"
            @click="goToDynamicDetail(dynamic.id)"
          >
            <div class="dynamic-header">
              <div class="dynamic-meta">
                <span class="dynamic-type-badge" :class="getTypeClass(dynamic.dynamicType)">
                  {{ getTypeText(dynamic.dynamicType) }}
                </span>
                <span class="publish-date">{{ formatDate(dynamic.publishTimes) }}</span>
              </div>
            </div>

            <div class="dynamic-content">
              <h3 class="dynamic-title">{{ currentTitle(dynamic) }}</h3>
              <div v-if="currentContent(dynamic)" class="dynamic-excerpt" v-html="truncateContent(currentContent(dynamic) || '')"></div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <CommonPagination
          :total="total"
          :pageSize="pageSize"
          :currentPage="currentPage"
          @currentChange="handleCurrentChange"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loading, Document } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useLanguageText } from '@/hooks/useResearchSearch'
import { useDateFilterWithSearch } from '@/hooks/useDateFilter'
import CommonPagination from '@/components/common/commonPagination.vue'

import service from '../../utils/services'
// 防抖函数
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(undefined, args), wait)
  }
}

// 动态响应数据接口
export interface DynamicResponse {
  id: number; // 主键ID
  title: string; // 中文标题
  titleEn?: string; // 英文标题
  dynamicType: string; // 动态类型: 6001(科研动态), 6002(新闻动态)
  content?: string; // 中文内容
  contentEn?: string; // 英文内容
  publishTimes?: string; // 发布时间
}

// 分页参数接口
export interface PaginationParams {
  pageNo: number; // 页码
  pageSize: number; // 每页数量
}

// 动态查询参数接口
export interface DynamicQueryParams extends PaginationParams {
  title?: string; // 标题关键词
  dynamicType?: string; // 动态类型: 6001(科研动态), 6002(新闻动态)
  publishYear?: number; // 发布年份
  publishMonth?: number; // 发布月份（1-12）
}

// 分页结果接口
export interface PaginationResult<T> {
  list: T[]; // 记录列表
  total: number; // 总记录数
  pageNo: number; // 当前页码
  pageSize: number; // 每页数量
  totalPages: number; // 总页数
}

// 字典项接口
export interface DictItem {
  dictId: string; // 字典ID
  dictType: string; // 字典类型
  dictTypeName: string; // 字典类型名称
  dictValue: string; // 字典值
  dictValueEn?: string; // 字典值英文
  remark?: string; // 备注
  sortOrder: number; // 排序
  createdTimes: string; // 创建时间
  updatedTimes: string; // 更新时间
}

const { t, locale } = useI18n()
const router = useRouter()
const { getCurrentLanguageText } = useLanguageText()

// 数据状态
const loading = ref(false)
const dynamicList = ref<DynamicResponse[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 字典数据
const dynamicTypes = ref<DictItem[]>([])
const loadingDictionary = ref(false)

// 搜索过滤条件
const searchFilters = ref<Omit<DynamicQueryParams, 'pageNo' | 'pageSize'>>({
  title: '',
  dynamicType: '',
  publishYear: undefined,
  publishMonth: undefined
})

// 使用日期筛选hooks
const dateFilter = useDateFilterWithSearch(() => handleSearch(), {
  yearRange: 10,
  enableMonth: true
})
const { availableYears, availableMonths, selectedYear, selectedMonth, handleDateChange } = dateFilter

// 获取动态类型字典
const fetchDynamicTypes = () => {
  loadingDictionary.value = true
  return service.get('/api/dict/dynamic_type')
    .then((result: any) => {
      dynamicTypes.value = result || []
      return result
    })
    .finally(() => {
      loadingDictionary.value = false
    })
}

// 获取动态列表
const fetchDynamics = (page: number = 1, filters?: Omit<DynamicQueryParams, 'pageNo' | 'pageSize'>) => {
  loading.value = true

  // 构建查询参数
  const params: DynamicQueryParams = {
    pageNo: page,
    pageSize: pageSize.value
  }

  if (filters?.title) {
    params.title = filters.title
  }
  if (filters?.dynamicType) {
    params.dynamicType = filters.dynamicType
  }

  // 合并日期筛选参数
  const dateParams = dateFilter.getDateFilterParams()
  Object.assign(params, dateParams)

  return service.post('/api/dynamic/list', { ...params })
    .then((result: any) => {
      dynamicList.value = result.list || []
      total.value = result.total || 0
      currentPage.value = result.pageNo || 1
      return result
    })
    .finally(() => {
      loading.value = false
    })
}

// 防抖搜索
const handleTitleInput = debounce((callback: () => void) => {
  callback()
}, 300)

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchDynamics(1, searchFilters.value)
}

// 分页处理
const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  fetchDynamics(newPage, searchFilters.value)

  // 切换页面时滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 根据当前语言获取标题
const currentTitle = (dynamic: DynamicResponse) => {
  return getCurrentLanguageText(dynamic, 'title')
}

// 根据当前语言获取内容
const currentContent = (dynamic: DynamicResponse) => {
  return getCurrentLanguageText(dynamic, 'content')
}

// 获取动态类型显示文本
const getTypeText = (type: string) => {
  const dictItem = dynamicTypes.value.find(item => item.dictId === type)
  if (dictItem) {
    return getCurrentLanguageText(dictItem, 'dictValue')
  }
  return t('news.unknown')
}

// 获取动态类型样式类
const getTypeClass = (type: string) => {
  switch (type) {
    case '6001':
      return 'research-type'
    case '6002':
      return 'news-type'
    default:
      return 'default-type'
  }
}

// 日期格式化
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return dateString
  }
}

// 截断内容
const truncateContent = (content: string, maxLength: number = 150) => {
  if (!content) return ''
  const textContent = content.replace(/<[^>]*>/g, '')
  return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent
}

// 跳转到动态详情页面
const goToDynamicDetail = (id: number) => {
  router.push(`/news/${id}`)
}

// 页面挂载时获取数据
onMounted(() => {
  // 并行加载字典和动态数据
  Promise.all([
    fetchDynamicTypes(),
    fetchDynamics()
  ])
})
</script>

<style lang="less" scoped>
// Hero Section
.hero-section {
  background: linear-gradient(135deg,
    rgba(14, 165, 233, 0.12),
    rgba(59, 130, 246, 0.08),
    rgba(139, 92, 246, 0.06),
    rgba(236, 72, 153, 0.04));
  padding: 100px 0 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 400px;

  .dark-mode & {
    background: linear-gradient(135deg,
      rgba(15, 23, 42, 0.95),
      rgba(30, 41, 59, 0.9),
      rgba(51, 65, 85, 0.85));
  }

  // 动态粒子背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 15% 25%, rgba(14, 165, 233, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
      radial-gradient(circle at 70% 85%, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
      radial-gradient(circle at 25% 75%, rgba(236, 72, 153, 0.08) 0%, transparent 60%);
    animation: particleFloat 8s ease-in-out infinite;
    pointer-events: none;
  }

  // 科技网格背景
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.6;
    animation: gridPulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  // 浮动装饰元素
  .floating-elements {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;

    .float-element {
      position: absolute;
      width: 6px;
      height: 6px;
      background: linear-gradient(45deg, var(--tech-primary), var(--tech-secondary));
      border-radius: 50%;
      opacity: 0.3;
      animation: techFloat 6s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(14, 165, 233, 0.3);

      &:nth-child(even) {
        background: linear-gradient(45deg, var(--tech-accent), var(--tech-pink));
        animation-direction: reverse;
        animation-duration: 8s;
      }

      &:nth-child(3n) {
        width: 4px;
        height: 4px;
        opacity: 0.5;
        animation-duration: 10s;
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 30px;
    position: relative;
    display: inline-block;
    background: linear-gradient(135deg,
      var(--tech-primary),
      var(--tech-secondary),
      var(--tech-accent),
      var(--tech-pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    text-shadow: 0 8px 16px rgba(14, 165, 233, 0.15);
    animation: titleShimmer 3s ease-in-out infinite;

    .dark-mode & {
      background: linear-gradient(135deg,
        var(--tech-secondary),
        var(--tech-accent),
        var(--tech-pink),
        #fbbf24);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    // 主下划线
    &::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      height: 4px;
      background: linear-gradient(90deg,
        transparent 0%,
        var(--tech-primary) 20%,
        var(--tech-secondary) 40%,
        var(--tech-accent) 60%,
        var(--tech-pink) 80%,
        transparent 100%);
      border-radius: 2px;
      animation: titleUnderlineGlow 2s ease-in-out infinite;
    }

    // 发光下划线
    &::before {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      height: 4px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(14, 165, 233, 0.6) 20%,
        rgba(59, 130, 246, 0.6) 40%,
        rgba(139, 92, 246, 0.6) 60%,
        rgba(236, 72, 153, 0.6) 80%,
        transparent 100%);
      filter: blur(3px);
      border-radius: 2px;
      animation: titleUnderlineGlow 2s ease-in-out infinite reverse;
    }

    @media (max-width: 768px) {
      font-size: 2.6rem;
    }

    @media (max-width: 480px) {
      font-size: 2.2rem;
    }
  }

  .page-subtitle {
    font-size: 1.3rem;
    color: #64748b;
    margin-bottom: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
    font-weight: 500;
    position: relative;
    opacity: 0.9;

    .dark-mode & {
      color: #cbd5e0;
    }

    // 添加subtle发光效果
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      z-index: -1;
      border-radius: 10px;
    }

    @media (max-width: 768px) {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
  }

  .stats-info {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;

    .total-count {
      color: var(--tech-primary);
      font-weight: 700;
      font-size: 1.2rem;
      padding: 12px 32px;
      background: rgba(var(--primary-color-rgb), 0.12);
      border: 2px solid rgba(var(--primary-color-rgb), 0.25);
      border-radius: 30px;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.15);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: default;

      // 科技风边框动画
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 30px;
        padding: 2px;
        background: linear-gradient(45deg,
          var(--tech-primary),
          var(--tech-secondary),
          var(--tech-accent),
          var(--tech-pink));
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      // 内部光效
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg,
          transparent,
          rgba(var(--primary-color-rgb), 0.6),
          transparent);
        transition: left 0.6s ease;
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 48px rgba(var(--primary-color-rgb), 0.25);
        border-color: rgba(var(--primary-color-rgb), 0.4);

        &::before {
          opacity: 1;
        }

        &::after {
          left: 100%;
        }
      }

      .dark-mode & {
        background: rgba(var(--secondary-color-rgb), 0.15);
        border-color: rgba(var(--secondary-color-rgb), 0.3);
        color: var(--tech-secondary);
        box-shadow: 0 8px 32px rgba(var(--secondary-color-rgb), 0.15);

        &:hover {
          box-shadow: 0 12px 48px rgba(var(--secondary-color-rgb), 0.25);
          border-color: rgba(var(--secondary-color-rgb), 0.4);
        }
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  }
}

// Content Section
.content-section {
  padding: 60px 0;
}

// Search Filters
.search-filters {
  margin-bottom: 40px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.08);
  position: relative;
  overflow: hidden;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  // 科技风装饰线
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--tech-primary) 25%,
      var(--tech-secondary) 50%,
      var(--tech-accent) 75%,
      transparent 100%);
  }

  .filter-row {
    display: grid;
    grid-template-columns: 2fr 1fr 120px 120px;
    gap: 16px;
    align-items: end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  }

  .filter-item {
    &.date-filters {
      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .search-input, .type-select, .year-select, .month-select {
      width: 100%;
      min-height: 32px;
      max-height: 32px;

      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.8) !important;
        border: 1px solid rgba(var(--primary-color-rgb), 0.2) !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.05) !important;
        transition: all 0.3s ease !important;
        height: 32px !important;
        outline: none !important;

        &:hover {
          border-color: var(--tech-primary) !important;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15) !important;
        }

        &.is-focus {
          border-color: var(--tech-primary) !important;
          box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15) !important;
          outline: none !important;
        }

        .dark-mode & {
          background: rgba(51, 65, 85, 0.8) !important;
          border-color: rgba(var(--secondary-color-rgb), 0.3) !important;
        }
      }

      :deep(.el-input__inner) {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;

        &:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      }

      :deep(.el-select__wrapper) {
        background: rgba(255, 255, 255, 0.8) !important;
        border: 1px solid rgba(var(--primary-color-rgb), 0.2) !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.05) !important;
        transition: all 0.3s ease !important;
        height: 32px !important;
        outline: none !important;

        &:hover {
          border-color: var(--tech-primary) !important;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15) !important;
        }

        &.is-focus {
          border-color: var(--tech-primary) !important;
          box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15) !important;
          outline: none !important;
        }

        .dark-mode & {
          background: rgba(51, 65, 85, 0.8) !important;
          border-color: rgba(var(--secondary-color-rgb), 0.3) !important;
        }
      }

      :deep(.el-select__input) {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;

        &:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      }
    }

    .search-icon {
      color: var(--tech-primary);
    }
  }
}

// Loading & Empty States
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .loading-icon, .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }

  .loading-icon {
    animation: spin 1s linear infinite;
  }

  p {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.7;
  }
}

// Dynamic List
.dynamic-list {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  margin-bottom: 40px;
}

.dynamic-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(var(--primary-color-rgb), 0.08);

  .dark-mode & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(var(--secondary-color-rgb), 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  // 科技风左边框
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  // 顶部装饰线
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(14, 165, 233, 0.3) 20%,
      rgba(59, 130, 246, 0.5) 50%,
      rgba(139, 92, 246, 0.3) 80%,
      transparent 100%);
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(14, 165, 233, 0.15);
    border-color: rgba(14, 165, 233, 0.4);

    .dark-mode & {
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
    }

    &::before {
      opacity: 1;
      width: 6px;
      background: linear-gradient(180deg, #0ea5e9, #3b82f6, #8b5cf6, #ec4899);
    }

    &::after {
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(14, 165, 233, 0.8) 20%,
        rgba(59, 130, 246, 0.9) 50%,
        rgba(139, 92, 246, 0.8) 80%,
        transparent 100%);
    }

    .dynamic-type-badge {
      transform: scale(1.05);
    }

    .publish-date {
      background: rgba(var(--primary-color-rgb), 0.15);
      border-color: rgba(var(--primary-color-rgb), 0.4);
      color: var(--tech-primary);

      .dark-mode & {
        background: rgba(var(--secondary-color-rgb), 0.2);
        border-color: rgba(var(--secondary-color-rgb), 0.5);
        color: var(--tech-secondary);
      }
    }
  }

  // 边框动画效果
  &::before,
  &::after {
    animation: none;
  }

  &:hover::before {
    animation: borderPulse 2s ease-in-out infinite;
  }

  @keyframes borderPulse {
    0%, 100% {
      opacity: 1;
      background: linear-gradient(180deg, #0ea5e9, #3b82f6, #8b5cf6);
    }
    50% {
      opacity: 0.8;
      background: linear-gradient(180deg, #3b82f6, #8b5cf6, #ec4899);
    }
  }

  .dynamic-header {
    margin-bottom: 20px;

    .dynamic-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
      }
    }

    .dynamic-type-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      // 默认样式（科研动态）
      &.research-type {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.15));
        color: #0ea5e9;
        border: 1px solid rgba(14, 165, 233, 0.3);

        &::before {
          content: '🔬';
          margin-right: 6px;
        }
      }

      // 新闻动态
      &.news-type {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15));
        color: #8b5cf6;
        border: 1px solid rgba(139, 92, 246, 0.3);

        &::before {
          content: '📰';
          margin-right: 6px;
        }
      }

      // 默认类型
      &.default-type {
        background: linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(156, 163, 175, 0.15));
        color: #6b7280;
        border: 1px solid rgba(107, 114, 128, 0.3);

        &::before {
          content: '📋';
          margin-right: 6px;
        }
      }
    }

    .publish-date {
      color: var(--tech-primary);
      font-size: 0.9rem;
      font-weight: 500;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
      padding: 4px 12px;
      background: rgba(var(--primary-color-rgb), 0.08);
      border-radius: 12px;
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
      transition: all 0.3s ease;

      .dark-mode & {
        color: var(--tech-secondary);
        background: rgba(var(--secondary-color-rgb), 0.1);
        border-color: rgba(var(--secondary-color-rgb), 0.3);
      }
    }
  }

  .dynamic-content {
    margin-bottom: 24px;

    .dynamic-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 16px;
      color: #1e293b;
      line-height: 1.4;
      transition: color 0.3s ease;

      .dark-mode & {
        color: #f8fafc;
      }

      &:hover {
        color: #0ea5e9;
      }
    }

    .dynamic-excerpt {
      color: #64748b;
      line-height: 1.7;
      font-size: 0.95rem;

      .dark-mode & {
        color: #94a3b8;
      }

      :deep(p) {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// Pagination
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// Animations
// spin 动画已在全局样式中定义

@keyframes particleFloat {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scale(1.1);
  }
}

@keyframes gridPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes techFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-15px) rotate(90deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-15px) rotate(270deg);
    opacity: 0.6;
  }
}

@keyframes titleShimmer {
  0%, 100% {
    background-position: 200% center;
  }
  50% {
    background-position: -200% center;
  }
}

@keyframes titleUnderlineGlow {
  0%, 100% {
    opacity: 0.8;
    transform: translateX(-50%) scaleX(1);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scaleX(1.05);
  }
}
</style>
