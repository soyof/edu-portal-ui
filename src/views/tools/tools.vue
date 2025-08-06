<template>
  <div class="tools-page">
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
          <h1 class="page-title">{{ $t('tools.title') }}</h1>
          <p class="page-subtitle">{{ $t('tools.subtitle') }}</p>
          <div class="stats-info">
            <span class="total-count">{{ $t('tools.totalTools') }}: {{ total }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 工具列表 -->
    <div class="page-content">
      <div class="container">
        <!-- 搜索筛选器 -->
        <div class="search-filters animate__animated animate__fadeInUp">
          <div class="filter-row">
            <div class="filter-item">
              <el-input
                v-model="searchFilters.title"
                :placeholder="$t('tools.titlePlaceholder')"
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
                v-model="searchFilters.toolType"
                clearable
                :placeholder="$t('tools.allTypes')"
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

        <!-- 工具列表 -->
        <div v-else-if="tools.length > 0" class="tools-list animate__animated animate__fadeInUp">
          <div
            v-for="(tool, index) in tools"
            :key="tool.id"
            class="tool-item animate__animated animate__fadeInUp clickable"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="handleToolClick(tool)"
          >
            <!-- 工具图标 -->
            <div class="tool-icon">
              <el-icon class="icon">
                <Tools />
              </el-icon>
            </div>

            <!-- 工具内容 -->
            <div class="tool-content">
              <div class="tool-header">
                <h3 class="tool-title">
                  {{ getCurrentLanguageText(tool, 'title') }}
                </h3>
                <div class="tool-meta">
                  <span class="type-label">
                    {{ getTypeLabel(tool.toolType) }}
                  </span>
                </div>
              </div>
              <div v-if="getCurrentLanguageText(tool, 'description')" class="tool-description">
                {{ getCurrentLanguageText(tool, 'description') }}
              </div>
              <div class="tool-footer">
                <span class="publish-time">
                  {{ tool.publishTimes ? formatDate(tool.publishTimes, 'yyyy-MM-dd') : '' }}
                </span>
                <el-icon class="external-link">
                  <Link />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container animate__animated animate__fadeIn">
          <el-empty :description="$t('tools.noTools')" />
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
import { Tools, Link, Search } from '@element-plus/icons-vue'
import CommonPagination from '@/components/common/commonPagination.vue'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'
import { useDateFilterWithSearch } from '@/hooks/useDateFilter'
import { formatDate } from '@/utils/utils'

// 防抖函数
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(undefined, args), wait)
  }
}

// 工具响应数据接口
export interface ToolResponse {
  id: number; // 主键ID
  title: string; // 工具标题（中文）
  titleEn?: string; // 工具标题（英文）
  description?: string; // 工具描述（中文）
  descriptionEn?: string; // 工具描述（英文）
  toolType: string; // 工具类型
  toolUrl: string; // 工具地址
  publishTimes?: string; // 发布时间
}

// 科研工具查询参数
export interface ToolQueryParams extends PaginationParams {
  title?: string; // 工具标题关键词
  toolType?: string; // 工具类型
  publishYear?: number; // 发布年份
  publishMonth?: number; // 发布月份（1-12）
}

// 分页查询参数
export interface PaginationParams {
  pageNo?: number; // 页码，默认1
  pageSize?: number; // 每页数量，默认10
}

// 分页结果
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

const { getCurrentLanguageText } = useLanguageText()

// 数据状态
const loading = ref(false)
const loadingDictionary = ref(false)
const tools = ref<ToolResponse[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)

// 搜索筛选器
const searchFilters = ref<ToolQueryParams>({
  title: '',
  toolType: '',
  publishYear: undefined,
  publishMonth: undefined,
  pageNo: 1,
  pageSize: 15
})

// 使用日期筛选hooks
const dateFilter = useDateFilterWithSearch(() => handleSearch(), {
  yearRange: 11,
  enableMonth: true
})
const { availableYears, availableMonths, selectedYear, selectedMonth, handleDateChange } = dateFilter

// 字典数据
const typeOptions = ref<DictItem[]>([])

// 已移除initMonths和fetchAvailableYears，使用hooks代替

// 获取字典数据
const fetchDictionaryData = async() => {
  loadingDictionary.value = true
  try {
    // 获取工具类型字典
    const typeResponse = await service.get<DictItem[]>('/api/dict/opensource_tool_type')
    typeOptions.value = Array.isArray(typeResponse) ? typeResponse : []
  } catch (error) {
    console.error('获取字典数据失败:', error)
    typeOptions.value = []
  } finally {
    loadingDictionary.value = false
  }
}

// 获取类型标签
const getTypeLabel = (typeId: string): string => {
  const typeItem = typeOptions.value.find(item => item.dictId === typeId)
  return typeItem ? getCurrentLanguageText(typeItem, 'dictValue') : typeId
}

// 获取工具列表
const fetchTools = () => {
  loading.value = true

  const params: any = {
    pageNo: currentPage.value,
    pageSize: pageSize.value
  }

  // 使用搜索筛选器
  if (searchFilters.value.title) {
    params.title = searchFilters.value.title
  }

  if (searchFilters.value.toolType) {
    params.toolType = searchFilters.value.toolType
  }

  // 合并日期筛选参数
  const dateParams = dateFilter.getDateFilterParams()
  Object.assign(params, dateParams)

  service.post<PaginationResult<ToolResponse>>('/api/tools/list', params)
    .then(response => {
      const data = response as any as PaginationResult<ToolResponse>
      tools.value = data.list || []
      total.value = data.total || 0
    })
    .catch(error => {
      console.error('获取工具列表失败:', error)
      tools.value = []
      total.value = 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索处理函数
const handleSearch = () => {
  currentPage.value = 1
  fetchTools()
}

// 标题输入防抖处理
const handleTitleInput = debounce(() => {
  handleSearch()
}, 500)

// 处理工具点击
const handleToolClick = (tool: ToolResponse) => {
  if (tool.toolUrl) {
    // 跳转到工具地址
    let finalUrl = tool.toolUrl
    if (!tool.toolUrl.startsWith('http://') && !tool.toolUrl.startsWith('https://')) {
      finalUrl = 'https://' + tool.toolUrl
    }
    window.open(finalUrl, '_blank', 'noopener,noreferrer')
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTools()

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 生命周期
onMounted(async() => {
  await fetchDictionaryData()
  fetchTools()
})
</script>

<style lang="less" scoped>
.tools-page {
  min-height: 100vh;

  .hero-section {
    background: linear-gradient(135deg,
      rgba(59, 130, 246, 0.15) 0%,
      rgba(139, 92, 246, 0.15) 50%,
      rgba(236, 72, 153, 0.15) 100%);
    padding: 120px 0 80px;
    position: relative;
    overflow: hidden;

    .dark-mode & {
      background: linear-gradient(135deg,
        rgba(30, 41, 59, 0.8) 0%,
        rgba(51, 65, 85, 0.7) 50%,
        rgba(71, 85, 105, 0.6) 100%);
    }

    .floating-elements {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;

      .float-element {
        position: absolute;
        width: 6px;
        height: 6px;
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        border-radius: 50%;
        opacity: 0.4;
        animation: float 8s ease-in-out infinite;

        .dark-mode & {
          background: linear-gradient(45deg, var(--tech-primary), var(--tech-secondary));
        }
      }
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
      z-index: 2;
    }

    .hero-content {
      text-align: center;

      .page-title {
        font-size: clamp(2.5rem, 5vw, 3.5rem);
        font-weight: 700;
        margin-bottom: 20px;
        color: var(--primary-color);

        .dark-mode & {
          color: #4fd1c7;
        }

        @media (max-width: 768px) {
          font-size: 2.8rem;
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

        .dark-mode & {
          color: #cbd5e0;
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

        .total-count {
          color: var(--primary-color);
          font-weight: 700;
          font-size: 1.2rem;
          padding: 12px 32px;
          background: rgba(var(--primary-color-rgb), 0.12);
          border: 2px solid rgba(var(--primary-color-rgb), 0.25);
          border-radius: 50px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          .dark-mode & {
            background: rgba(var(--primary-color-rgb), 0.15);
            border-color: rgba(var(--primary-color-rgb), 0.3);
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.3);
          }

          @media (max-width: 768px) {
            font-size: 1rem;
            padding: 10px 24px;
          }
        }
      }
    }
  }

  .page-content {
    padding: 60px 0;
    background: linear-gradient(to bottom,
      rgba(248, 250, 252, 0.5) 0%,
      rgba(248, 250, 252, 0.8) 100%);

    .dark-mode & {
      background: linear-gradient(to bottom,
        rgba(15, 23, 42, 0.5) 0%,
        rgba(15, 23, 42, 0.8) 100%);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    @media (max-width: 768px) {
      padding: 40px 0;
    }
  }
}

// 搜索筛选器样式
.search-filters {
  margin-bottom: 40px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.12);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(var(--primary-color-rgb), 0.2);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      var(--primary-color) 0%,
      var(--secondary-color) 50%,
      var(--accent-color) 100%);
  }

  .filter-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1fr;
    gap: 20px;
    align-items: center;

    @media (max-width: 1024px) {
      grid-template-columns: 2fr 1.5fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  .filter-item {
    position: relative;

    .search-input,
    .type-select,
    .year-select,
    .month-select {
      width: 100%;

      :deep(.el-input__wrapper) {
        border-radius: 12px;
        border: 1px solid rgba(var(--primary-color-rgb), 0.2);
        transition: all 0.3s ease;

        &:hover {
          border-color: rgba(var(--primary-color-rgb), 0.4);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
        }
      }
    }

    .search-icon {
      color: var(--primary-color);
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
    margin-bottom: 30px;
  }
}

// 加载状态
.loading-container {
  padding: 60px 0;
  text-align: center;
}

// 工具列表样式
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tool-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  border-left: 4px solid var(--primary-color);
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
      border-left-color: var(--secondary-color);

      &::before {
        left: 100%;
      }

      .dark-mode & {
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
      }

      .tool-icon {
        transform: scale(1.1);
      }

      .tool-title {
        color: var(--primary-color);
      }
    }
  }
}

.tool-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .dark-mode & {
    background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
  }

  .icon {
    color: white;
    font-size: 20px;
  }
}

.tool-content {
  flex: 1;
  min-width: 0;

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 12px;

    .tool-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color-primary);
      margin: 0;
      transition: color 0.3s ease;
      flex: 1;
      min-width: 0;
      word-break: break-word;

      .dark-mode & {
        color: var(--text-color-primary-dark);
      }
    }

    .tool-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;

      .type-label {
        padding: 4px 12px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(var(--primary-color-rgb), 0.1);
        color: var(--primary-color);
        border-radius: 20px;
        border: 1px solid rgba(var(--primary-color-rgb), 0.2);

        .dark-mode & {
          background: rgba(var(--primary-color-rgb), 0.15);
          border-color: rgba(var(--primary-color-rgb), 0.3);
        }
      }
    }
  }

  .tool-description {
    color: var(--text-color-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    .dark-mode & {
      color: var(--text-color-secondary-dark);
    }
  }

  .tool-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .publish-time {
      font-size: 0.85rem;
      color: var(--text-color-tertiary);
      font-weight: 500;

      .dark-mode & {
        color: var(--text-color-tertiary-dark);
      }
    }

    .external-link {
      color: var(--primary-color);
      font-size: 16px;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.2);
      }
    }
  }

  @media (max-width: 768px) {
    .tool-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .tool-meta {
        order: -1;
        width: 100%;
        justify-content: flex-start;
      }
    }
  }
}

// 空状态
.empty-container {
  padding: 80px 0;
  text-align: center;

  :deep(.el-empty) {
    .el-empty__image {
      width: 200px;
      height: 150px;
    }

    .el-empty__description {
      color: var(--text-color-secondary);
      font-size: 1.1rem;

      .dark-mode & {
        color: var(--text-color-secondary-dark);
      }
    }
  }
}

// 分页
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    margin-top: 40px;
  }
}

// 浮动动画
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(-15px) rotate(240deg);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .tool-item {
    padding: 20px;
    gap: 16px;

    .tool-icon {
      width: 40px;
      height: 40px;

      .icon {
        font-size: 18px;
      }
    }

    .tool-content {
      .tool-header {
        .tool-title {
          font-size: 1.15rem;
        }
      }

      .tool-description {
        font-size: 0.9rem;
      }
    }
  }
}
</style>
