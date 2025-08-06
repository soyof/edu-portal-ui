<template>
  <div class="notices-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="floating-elements">
        <div
          v-for="i in 8"
          :key="i"
          class="float-element"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 4 + 's',
            animationDuration: (4 + Math.random() * 3) + 's'
          }"
        ></div>
      </div>

      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">{{ $t('notices.title') }}</h1>
          <p class="page-subtitle">{{ $t('notices.subtitle') }}</p>
          <div class="stats-info">
            <span class="total-count">{{ $t('notices.totalNotices') }}: {{ total }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 通知列表 -->
    <div class="page-content">
      <div class="container">
        <!-- 搜索筛选器 -->
        <div class="search-filters animate__animated animate__fadeInUp">
          <div class="filter-row">
            <div class="filter-item">
              <el-input
                v-model="searchFilters.title"
                :placeholder="$t('notices.titlePlaceholder')"
                clearable
                class="search-input"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
                @input="handleTitleInput"
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
                v-model="searchFilters.importance"
                clearable
                :placeholder="$t('notices.allImportance')"
                class="importance-select"
                :loading="loadingDictionary"
                @change="handleSearch"
              >
                <el-option
                  v-for="item in importanceOptions"
                  :key="item.dictId"
                  :label="getCurrentLanguageText(item, 'dictValue')"
                  :value="item.dictId"
                />
              </el-select>
            </div>

            <div class="filter-item">
              <el-select
                v-model="searchFilters.noticeType"
                clearable
                :placeholder="$t('notices.allTypes')"
                class="type-select"
                :loading="loadingDictionary"
                @change="handleSearch"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.dictId"
                  :label="getCurrentLanguageText(item, 'dictValue')"
                  :value="item.dictId"
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

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container animate__animated animate__fadeIn">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 通知列表 -->
        <div v-else-if="notices.length > 0" class="notices-list animate__animated animate__fadeInUp">
          <div
            v-for="(notice, index) in notices"
            :key="notice.id"
            class="notice-item animate__animated animate__fadeInUp"
            :class="[
              `importance-${notice.importance}`,
              `type-${notice.noticeType}`,
              { 'clickable': notice.noticeType === '2002' }
            ]"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="handleNoticeClick(notice)"
          >
            <!-- 重要程度标识 -->
            <div class="importance-badge">
              <el-icon v-if="notice.importance === '3003'" class="urgent-icon">
                <Warning />
              </el-icon>
              <el-icon v-else-if="notice.importance === '3002'" class="important-icon">
                <InfoFilled />
              </el-icon>
              <el-icon v-else class="normal-icon">
                <Document />
              </el-icon>
            </div>

            <!-- 通知内容 -->
            <div class="notice-content">
              <div class="notice-header">
                <h3 class="notice-title">
                  {{ getCurrentLanguageText(notice, 'title') }}
                </h3>
                <div class="notice-meta">
                  <span class="importance-label" :data-importance="notice.importance">
                    {{ getImportanceLabel(notice.importance) }}
                  </span>
                  <span class="type-label">
                    {{ getTypeLabel(notice.noticeType) }}
                  </span>
                </div>
              </div>
              <div class="notice-footer">
                <span class="publish-time">
                  {{ notice.publishTimes ? formatDate(notice.publishTimes, 'yyyy-MM-dd') : '' }}
                </span>
                <el-icon v-if="notice.noticeType === '2001'" class="external-link">
                  <Link />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container animate__animated animate__fadeIn">
          <el-empty :description="$t('notices.noNotices')" />
        </div>

        <!-- 分页 -->
        <div v-if="!loading && total > 0" class="pagination-container">
          <CommonPagination
            :total="total"
            :pageSize="pageSize"
            :currentPage="currentPage"
            @currentChange="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Warning, InfoFilled, Document, Link, Search } from '@element-plus/icons-vue'
import CommonPagination from '@/components/common/commonPagination.vue'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'
import { useDateFilterWithSearch } from '@/hooks/useDateFilter'
import { formatDate } from '@/utils/utils'

// 通知类型定义
interface NoticeListResponse {
  id: number
  title: string
  titleEn?: string
  noticeType: string
  importance: string
  linkUrl?: string
  publishTimes?: string
}

// 字典项接口
interface DictItem {
  dictId: string
  dictType: string
  dictTypeName: string
  dictValue: string
  dictValueEn?: string
  remark?: string
  sortOrder: number
  createdTimes: string
  updatedTimes: string
}

// 分页结果
interface PaginationResult<T> {
  list: T[]
  total: number
  pageNo: number
  pageSize: number
  totalPages: number
}

const router = useRouter()
const { t } = useI18n()
const { getCurrentLanguageText } = useLanguageText()

// 防抖函数
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(undefined, args), wait)
  }
}

// 响应式数据
const notices = ref<NoticeListResponse[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索筛选器
const searchFilters = ref({
  title: '',
  importance: '',
  noticeType: '',
  publishYear: null as number | null,
  publishMonth: null as number | null
})

// 使用日期筛选hooks
const dateFilter = useDateFilterWithSearch(() => handleSearch(), {
  yearRange: 11,
  enableMonth: true
})
const { availableYears, availableMonths, selectedYear, selectedMonth, handleDateChange } = dateFilter

// 字典数据
const importanceOptions = ref<DictItem[]>([])
const typeOptions = ref<DictItem[]>([])
const loadingDictionary = ref(false)

// 获取字典数据
const fetchDictionaryData = async() => {
  loadingDictionary.value = true
  // 获取重要程度字典
  const importanceRes = await service.get('/api/dict/notice_importance')
  importanceOptions.value = (importanceRes as unknown as DictItem[]) || []

  // 获取通知类型字典
  const typeRes = await service.get('/api/dict/notice_type')
  typeOptions.value = (typeRes as unknown as DictItem[]) || []
  loadingDictionary.value = false
}

// 获取重要程度标签
const getImportanceLabel = (importance: string): string => {
  const option = importanceOptions.value.find(item => item.dictId === importance)
  if (option) {
    return getCurrentLanguageText(option, 'dictValue')
  }
  // 兜底显示
  switch (importance) {
    case '3001': return t('notices.normal') || '普通'
    case '3002': return t('notices.important') || '重要'
    case '3003': return t('notices.urgent') || '紧急'
    default: return t('notices.normal') || '普通'
  }
}

// 获取类型标签
const getTypeLabel = (type: string): string => {
  const option = typeOptions.value.find(item => item.dictId === type)
  if (option) {
    return getCurrentLanguageText(option, 'dictValue')
  }
  // 兜底显示
  switch (type) {
    case '2001': return t('notices.linkType') || '链接公告'
    case '2002': return t('notices.textType') || '文本公告'
    default: return t('notices.textType') || '文本公告'
  }
}

// 已移除fetchAvailableYears，使用hooks代替

// 获取通知列表
const fetchNotices = () => {
  loading.value = true

  const params: any = {
    pageNo: currentPage.value,
    pageSize: pageSize.value
  }

  // 使用新的搜索筛选器
  if (searchFilters.value.title) {
    params.title = searchFilters.value.title
  }

  if (searchFilters.value.importance) {
    params.importance = searchFilters.value.importance
  }

  if (searchFilters.value.noticeType) {
    params.noticeType = searchFilters.value.noticeType
  }

  // 合并日期筛选参数
  const dateParams = dateFilter.getDateFilterParams()
  Object.assign(params, dateParams)

  service.post<PaginationResult<NoticeListResponse>>('/api/notices/list', params)
    .then(response => {
      const data = response as any as PaginationResult<NoticeListResponse>
      notices.value = data.list || []
      total.value = data.total || 0
    })
    .catch(error => {
      console.error('获取通知列表失败:', error)
      notices.value = []
      total.value = 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索处理函数
const handleSearch = () => {
  currentPage.value = 1
  fetchNotices()
}

// 标题输入防抖处理
const handleTitleInput = debounce(() => {
  handleSearch()
}, 500)

// 处理通知点击
const handleNoticeClick = (notice: NoticeListResponse) => {
  if (notice.noticeType === '2001' && notice.linkUrl) {
    // 超链接类型，直接跳转到外部链接
    window.open(notice.linkUrl, '_blank')
  } else {
    // 文本类型，跳转到详情页
    router.push(`/notices/${notice.id}`)
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchNotices()

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 生命周期
onMounted(async() => {
  await fetchDictionaryData()
  fetchNotices()
})
</script>

<style lang="less" scoped>
.notices-page {
  min-height: 100vh;
  background: linear-gradient(to bottom,
    rgba(var(--primary-color-rgb), 0.02),
    rgba(var(--light-background-rgb, 248, 250, 252), 1)
  );

  .dark-mode & {
    background: linear-gradient(to bottom,
      rgba(var(--primary-color-rgb), 0.05),
      rgba(var(--dark-background-rgb, 15, 15, 30), 1)
    );
  }
}

// Hero Section - 参考动态页面风格
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

  // 浮动装饰元素 - 与动态页面保持一致
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
      background: linear-gradient(45deg, rgba(14, 165, 233, 0.6), rgba(59, 130, 246, 0.4));
      border-radius: 50%;
      opacity: 0.3;
      animation: techFloat 6s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(14, 165, 233, 0.3);

      &:nth-child(even) {
        background: linear-gradient(45deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.4));
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

    .page-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 700;
      margin-bottom: 30px;
      position: relative;
      display: inline-block;
      background: linear-gradient(135deg,
        rgba(14, 165, 233, 1),
        rgba(59, 130, 246, 1),
        rgba(139, 92, 246, 1),
        rgba(236, 72, 153, 1));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      text-shadow: 0 8px 16px rgba(14, 165, 233, 0.15);
      animation: titleShimmer 3s ease-in-out infinite;

      .dark-mode & {
        background: linear-gradient(135deg,
          rgba(59, 130, 246, 1),
          rgba(139, 92, 246, 1),
          rgba(236, 72, 153, 1),
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
          rgba(14, 165, 233, 0.8) 20%,
          rgba(59, 130, 246, 0.8) 40%,
          rgba(139, 92, 246, 0.8) 60%,
          rgba(236, 72, 153, 0.8) 80%,
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
        color: rgba(14, 165, 233, 1);
        font-weight: 700;
        font-size: 1.2rem;
        padding: 12px 32px;
        background: rgba(14, 165, 233, 0.12);
        border: 2px solid rgba(14, 165, 233, 0.25);
        border-radius: 30px;
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(14, 165, 233, 0.15);
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
            rgba(14, 165, 233, 0.8),
            rgba(59, 130, 246, 0.8),
            rgba(139, 92, 246, 0.8),
            rgba(236, 72, 153, 0.8));
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
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
          border-radius: 30px;
          animation: statsFloat 3s ease-in-out infinite;
        }

        &:hover::before {
          opacity: 1;
        }

        .dark-mode & {
          color: rgba(59, 130, 246, 1);
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }
      }
    }
  }
}

// Content Section
.page-content {
  padding: 60px 0 80px;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Search Filters - 参考动态模块样式
.search-filters {
  margin-bottom: 40px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.08);
  position: relative;
  overflow: hidden;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(var(--primary-color-rgb), 0.2);
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
      var(--primary-color) 25%,
      var(--secondary-color) 50%,
      var(--accent-color) 75%,
      transparent 100%);
  }

  .filter-row {
    display: grid;
    grid-template-columns: 2fr 1fr 120px 120px 120px;
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

    .search-input, .importance-select, .type-select, .year-select, .month-select {
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
          border-color: var(--primary-color) !important;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15) !important;
        }

        &.is-focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15) !important;
          outline: none !important;
        }

        .dark-mode & {
          background: rgba(51, 65, 85, 0.8) !important;
          border-color: rgba(var(--secondary-color-rgb), 0.3) !important;
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
          border-color: var(--primary-color) !important;
          box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15) !important;
        }

        &.is-focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15) !important;
          outline: none !important;
        }

        .dark-mode & {
          background: rgba(51, 65, 85, 0.8) !important;
          border-color: rgba(var(--secondary-color-rgb), 0.3) !important;
        }
      }
    }

    .search-icon {
      color: var(--primary-color);
    }
  }
}

// Loading & Empty States
.loading-container {
  padding: 60px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  text-align: center;

  .dark-mode & {
    background: rgba(var(--dark-surface-rgb, 26, 26, 46), 0.95);
    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

// Notice List
.notices-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notice-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  border-left: 4px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  .dark-mode & {
    background: rgba(var(--dark-surface-rgb, 26, 26, 46), 0.95);
    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    &::before {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    }
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);

      &::before {
        left: 100%;
      }

      .dark-mode & {
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
      }

      .importance-badge {
        transform: scale(1.1);
      }

      .notice-title {
        color: var(--primary-color);
      }
    }
  }

  // 重要程度边框颜色
  &.importance-3003 {
    border-left-color: #ef4444;

    &:hover {
      box-shadow: 0 16px 48px rgba(239, 68, 68, 0.2);
    }
  }

  &.importance-3002 {
    border-left-color: #f59e0b;

    &:hover {
      box-shadow: 0 16px 48px rgba(245, 158, 11, 0.2);
    }
  }

  &.importance-3001 {
    border-left-color: #10b981;

    &:hover {
      box-shadow: 0 16px 48px rgba(16, 185, 129, 0.2);
    }
  }

  // animate.css动画延迟通过内联样式控制
}

.importance-badge {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  .dark-mode & {
    background: rgba(26, 26, 46, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .urgent-icon {
    color: #ef4444;
    font-size: 22px;
    filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.4));
  }

  .important-icon {
    color: #f59e0b;
    font-size: 22px;
    filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4));
  }

  .normal-icon {
    color: #10b981;
    font-size: 22px;
    filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4));
  }
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;

  .notice-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color-primary);
    margin: 0;
    line-height: 1.5;
    transition: color 0.3s ease;

    .dark-mode & {
      color: rgba(255, 255, 255, 0.95);
    }
  }

  .notice-meta {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.importance-label,
.type-label {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    transform: translateY(-1px);
  }
}

// 重要程度标签颜色区分
.importance-label {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

  // 紧急 - 红色
  &[data-importance="3003"] {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  }

  // 重要 - 橙色
  &[data-importance="3002"] {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  }

  // 普通 - 绿色
  &[data-importance="3001"] {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }
}

.type-label {
  background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-color-rgb), 0.8));
  color: white;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;

  .publish-time {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    padding: 4px 12px;
    background: rgba(var(--primary-color-rgb), 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .dark-mode & {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .external-link {
    color: var(--primary-color);
    font-size: 18px;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.2);
      filter: drop-shadow(0 2px 4px rgba(var(--primary-color-rgb), 0.3));
    }
  }
}

.empty-container {
  padding: 80px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);

  .dark-mode & {
    background: rgba(var(--dark-surface-rgb, 26, 26, 46), 0.95);
    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

// 动画关键帧 - 与动态页面保持一致
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

@keyframes statsFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .container {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0 40px;

    .hero-content {
      .page-title {
        font-size: 2.2rem;
        margin-bottom: 1rem;
      }

      .page-subtitle {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }

      .stats-info .total-count {
        padding: 6px 16px;
        font-size: 0.9rem;
      }
    }
  }

  .search-filters {
    .filter-row {
      grid-template-columns: 1fr;
    gap: 16px;
    }

    .filter-item {
      .search-input, .importance-select, .type-select, .year-select, .month-select {
        min-height: 40px;
        max-height: 40px;

        :deep(.el-input__wrapper) {
          height: 40px !important;
        }

        :deep(.el-select__wrapper) {
          height: 40px !important;
        }
      }
    }
  }

  .notices-list {
    gap: 16px;
  }

  .notice-item {
    padding: 20px;
    gap: 16px;

    &:nth-child(n+6) {
      animation-delay: 0.5s;
    }

    .importance-badge {
      width: 44px;
      height: 44px;

      .urgent-icon,
      .important-icon,
      .normal-icon {
        font-size: 20px;
    }
  }

  .notice-header {
    flex-direction: column;
      gap: 12px;

      .notice-title {
        font-size: 1.1rem;
      }

    .notice-meta {
      align-self: flex-start;
    }
  }

    .importance-label,
    .type-label {
      padding: 4px 10px;
      font-size: 0.7rem;
    }

    .notice-footer {
      .publish-time {
        font-size: 0.8rem;
        padding: 3px 10px;
      }

      .external-link {
        font-size: 16px;
      }
    }
  }

  .loading-container,
  .empty-container {
    padding: 40px 16px;
  }

  .pagination-container {
    margin-top: 30px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .hero-section {
    padding: 50px 0 30px;

    .hero-content .page-title {
      font-size: 1.8rem;
    }
  }

  .notice-item {
    padding: 16px;
    border-radius: 16px;

    .importance-badge {
      width: 40px;
      height: 40px;
    }

    .notice-header .notice-title {
      font-size: 1rem;
    }
  }
}
</style>

