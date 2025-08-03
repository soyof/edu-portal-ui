<template>
  <div class="books-list-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-particles"></div>
      <div class="container">
        <div class="hero-content">
          <!-- Breadcrumb Navigation -->
          <nav class="breadcrumb-nav">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/research" class="breadcrumb-link">
                  {{ $t('research.title') }}
                </router-link>
              </li>
              <li class="breadcrumb-item active">
                {{ $t('research.books') }}
              </li>
            </ol>
          </nav>
          
          <h1 class="page-title">{{ $t('research.books') }}</h1>
          <p class="page-subtitle">{{ $t('research.booksDesc') }}</p>
          <div class="stats-info">
            <span class="total-count">{{ $t('research.totalBooks') }}: {{ total }}</span>
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
                :placeholder="$t('research.titlePlaceholder')"
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

            <div class="filter-item date-filters">
              <el-select
                v-model="selectedYear"
                :placeholder="$t('research.selectYear')"
                clearable
                class="year-select"
                @change="() => handleDateChange(handleSearch)"
              >
                <el-option
                  v-for="year in availableYears"
                  :key="year"
                  :label="year"
                  :value="year"
                />
              </el-select>

              <el-select
                v-model="selectedMonth"
                :placeholder="$t('research.selectMonth')"
                clearable
                class="month-select"
                @change="() => handleDateChange(handleSearch)"
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
        <div v-if="loading && books.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ $t('research.loading') }}</p>
        </div>

        <!-- Books List -->
        <div v-else-if="books.length > 0" class="books-list">
          <div
            v-for="(book, index) in books"
            :key="book.id"
            class="book-item"
            :style="{ animationDelay: (index % 20) * 0.05 + 's' }"
            @click="goToBookDetail(book.id)"
          >
            <div class="book-meta">
              <div class="meta-left">
                <span class="book-date">
                  {{ formatDate(book.bookPublishDate || book.publishTimes) }}
                </span>
                <span v-if="book.isTranslated === '1'" class="translated-tag">
                  {{ $t('research.translated') }}
                </span>
              </div>
              <a
                v-if="book.bookUrl"
                :href="book.bookUrl"
                target="_blank"
                class="view-link"
                @click.stop
              >
                {{ $t('research.viewOriginal') }}
                <svg width="14" height="14" viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
            </div>

            <h3 class="book-title">{{ getCurrentLanguageText(book, 'title') }}</h3>

            <div class="book-author">
              <span class="author-label">{{ $t('research.author') }}:</span>
              <span class="author-name">{{ getCurrentLanguageText(book, 'author') }}</span>
            </div>

            <div v-if="book.abstract || book.abstractEn" class="book-excerpt">
              <p v-html="getCurrentLanguageText(book, 'abstract')"></p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📚</div>
          <h3 class="empty-title">{{ $t('research.noBooks') }}</h3>
          <p class="empty-text">{{ $t('research.noBooksDesc') }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :pageSize="pageSize"
            :currentPage="currentPage"
            @currentChange="handlePageChange"
          />
        </div>

        <!-- Load More Loading -->
        <div v-if="loadingMore" class="load-more-loading">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>{{ $t('research.loadingMore') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import service from '@/utils/services'
import { useResearchSearch, useLanguageText, type BaseSearchFilters } from '@/hooks/useResearchSearch'

// 接口类型定义
interface BookResponse {
  id: number
  title: string
  titleEn?: string
  author: string
  authorEn?: string
  bookPublishDate?: string
  bookUrl?: string
  isTranslated: string
  abstract?: string
  abstractEn?: string
  content?: string
  contentEn?: string
  createUserId: string
  createdTimes: string
  updateUserId?: string
  updatedTimes: string
  publishUserId?: string
  publishTimes?: string
}

interface PaginationResult<T> {
  list: T[]
  total: number
  pageNo: number
  pageSize: number
  totalPages: number
}

const router = useRouter()

// 使用公共搜索钩子
const {
  searchFilters,
  selectedYear,
  selectedMonth,
  availableYears,
  availableMonths,
  generateCacheKey,
  isCacheValid,
  handleTitleInput,
  handleDateChange
} = useResearchSearch<BaseSearchFilters>()

// 使用公共多语言文本钩子
const { getCurrentLanguageText, formatDate } = useLanguageText()

// 响应式数据
const books = ref<BookResponse[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(15)

// 缓存相关
const cache = new Map<string, { data: BookResponse[], total: number, timestamp: number }>()

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 获取著作列表
const fetchBooks = async(page = 1, filters: BaseSearchFilters = {}) => {
  try {
    const cacheKey = generateCacheKey(page, filters)
    const cachedData = cache.get(cacheKey)

    // 检查缓存
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      books.value = cachedData.data
      total.value = cachedData.total
      return
    }

    loading.value = true

    const requestData = {
      pageNo: page,
      pageSize: pageSize.value,
      ...filters
    }

    const response = await service.post<PaginationResult<BookResponse>>('/api/research/booksList', requestData)

    const data = response as unknown as PaginationResult<BookResponse>

    books.value = data.list
    total.value = data.total
    currentPage.value = data.pageNo

    // 缓存数据
    cache.set(cacheKey, {
      data: data.list,
      total: data.total,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('获取著作列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchBooks(1, searchFilters.value)
}

// 处理分页变化
const handlePageChange = (page: number) => {
  if (page === currentPage.value) return

  currentPage.value = page
  fetchBooks(page, searchFilters.value)

  // 滚动到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 跳转到著作详情页面
const goToBookDetail = (bookId: number) => {
  router.push(`/research/books/${bookId}`)
}

// 页面挂载时获取数据
onMounted(() => {
  fetchBooks()
})
</script>

<style lang="less" scoped>
.books-list-page {
  min-height: 100vh;
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb), 0.02) 0%,
    rgba(var(--accent-color-rgb), 0.01) 50%,
    rgba(var(--primary-color-rgb), 0.01) 100%);
}

// Hero Section
.hero-section {
  background: linear-gradient(135deg,
    rgba(14, 165, 233, 0.1) 0%,
    rgba(59, 130, 246, 0.08) 35%,
    rgba(168, 85, 247, 0.06) 100%);
  position: relative;
  padding: 100px 0 60px;
  text-align: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(90deg, rgba(14, 165, 233, 0.05) 1px, transparent 1px),
      linear-gradient(rgba(14, 165, 233, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    animation: gridMove 20s linear infinite;
  }

  // 添加科技感粒子效果
  .hero-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(14, 165, 233, 0.6);
      border-radius: 50%;
      animation: particleFloat 8s ease-in-out infinite;
    }

    &::before {
      top: 20%;
      left: 15%;
      animation-delay: 0s;
      box-shadow: 0 0 10px rgba(14, 165, 233, 0.4);
    }

    &::after {
      top: 70%;
      right: 20%;
      animation-delay: 4s;
      background: rgba(168, 85, 247, 0.6);
      box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
    }
  }

  .dark-mode & {
    background: linear-gradient(135deg,
      rgba(15, 23, 42, 0.9) 0%,
      rgba(30, 41, 59, 0.8) 50%,
      rgba(51, 65, 85, 0.7) 100%);

    &::before {
      background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%);
    }

    &::after {
      background-image:
        linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
        linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px);
    }
  }

  .hero-content {
    position: relative;
  }

  // 面包屑导航
  .breadcrumb-nav {
    margin-bottom: 2rem;

    .breadcrumb {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.9rem;

      .breadcrumb-item {
        display: flex;
        align-items: center;

        &:not(:last-child)::after {
          content: '>';
          margin: 0 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .breadcrumb-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;

          &:hover {
            background: rgba(var(--primary-color-rgb), 0.1);
          }
        }

        &.active {
          color: var(--text-secondary);
          font-weight: 500;
        }
      }
    }
  }

  .page-title {
    font-size: 2.8rem;
    margin-bottom: 20px;
    position: relative;
    display: inline-block;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    }

    @media (max-width: 768px) {
      font-size: 2.4rem;
    }
  }

  .page-subtitle {
    font-size: 1.2rem;
    color: #6b7280;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    .dark-mode & {
      color: #9ca3af;
    }
  }

  .stats-info {
    .total-count {
      color: var(--primary-color);
      font-weight: 600;
      font-size: 1.1rem;
    }
  }
}

// Content Section
.content-section {
  padding: 24px 0;
}

// Search Filters
.search-filters {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    background: #1f2937;
    border-color: #374151;
  }

  .filter-row {
    display: flex;
    gap: 12px;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .filter-item {
    .search-input {
      width: 240px;
      max-width: 240px;

      :deep(.el-input__wrapper) {
        border-radius: 6px;
        height: 32px;
        border: 1px solid #d1d5db;
        background: white;
        transition: all 0.2s ease;
        box-shadow: none;

        &:hover {
          border-color: var(--primary-color);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
        }

        .dark-mode & {
          background: #374151;
          border-color: #4b5563;
        }
      }

      :deep(.el-input__inner) {
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #374151;

        .dark-mode & {
          color: #f9fafb;
        }
      }

      :deep(.el-input__prefix) {
        .search-icon {
          color: #9ca3af;
          font-size: 14px;
          transition: color 0.2s ease;
        }
      }

      &:hover :deep(.el-input__prefix) .search-icon {
        color: var(--primary-color);
      }
    }

    &.date-filters {
      display: flex;
      gap: 8px;
      width: 240px !important;

      .year-select,
      .month-select {
        flex: 1;

        :deep(.el-input__wrapper) {
          border-radius: 6px;
          height: 32px;
          border: 1px solid #d1d5db;
          background: white;
          transition: all 0.2s ease;
          box-shadow: none;

          &:hover {
            border-color: var(--primary-color);
          }

          &.is-focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
          }

          .dark-mode & {
            background: #374151;
            border-color: #4b5563;
          }
        }

        :deep(.el-input__inner) {
          height: 30px;
          line-height: 30px;
          font-size: 14px;
          color: #374151;

          .dark-mode & {
            color: #f9fafb;
          }
        }
      }
    }
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(40px, 40px);
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 1;
  }
  50% {
    transform: translateY(-40px) translateX(-5px);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-20px) translateX(-10px);
    opacity: 1;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Loading State
.loading-state {
  text-align: center;
  padding: 4rem 2rem;

  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 2rem;
    border: 3px solid transparent;
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    color: #6b7280;
    font-size: 1.1rem;

    .dark-mode & {
      color: #9ca3af;
    }
  }
}

// Books List
.books-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 40px;
}

// Book Item
.book-item {
  padding: 25px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out;
  cursor: pointer;

  .dark-mode & {
    background: #2d3748;
    border-color: #4a5568;
    color: #f7fafc;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: rgba(var(--primary-color-rgb), 0.3);
  }

  .book-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .meta-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .book-date {
      color: var(--primary-color);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .translated-tag {
      background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb), 0.8));
      color: white;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .view-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;

      &:hover {
        color: var(--accent-color);
        transform: translateX(3px);
      }

      svg {
        transition: transform 0.3s ease;
      }

      &:hover svg {
        transform: translateX(2px);
      }
    }
  }

  .book-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 15px;
    line-height: 1.4;
    color: var(--dark-text);

    .dark-mode & {
      color: #f7fafc;
    }
  }

  .book-author {
    margin-bottom: 15px;

    .author-label {
      color: var(--primary-color);
      font-weight: 600;
      margin-right: 8px;
      font-size: 0.9rem;
    }

    .author-name {
      color: var(--dark-text);
      font-weight: 500;

      .dark-mode & {
        color: #e2e8f0;
      }
    }
  }

  .book-excerpt {
    p {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      .dark-mode & {
        color: #9ca3af;
      }
    }
  }
}

// Empty State
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(var(--primary-color-rgb), 0.02);
  border: 2px dashed rgba(var(--primary-color-rgb), 0.2);
  border-radius: 20px;

  .dark-mode & {
    background: rgba(45, 55, 72, 0.5);
    border-color: rgba(var(--primary-color-rgb), 0.3);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-weight: 700;

    .dark-mode & {
      color: #4fd1c7;
    }
  }

  .empty-text {
    color: #6b7280;
    font-size: 1.1rem;

    .dark-mode & {
      color: #9ca3af;
    }
  }
}

// Pagination
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

// Load More Loading
.load-more-loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;

  .dark-mode & {
    color: #9ca3af;
  }

  .loading-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;

    span {
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
      animation: loadingDots 1.4s ease-in-out infinite both;

      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
      &:nth-child(3) { animation-delay: 0s; }
    }
  }
}

// Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// Responsive
@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0 30px;

    .back-btn {
      top: -20px;
    }
  }

  .content-section {
    padding: 40px 0;
  }

  .container {
    padding: 0 1rem;
  }

  .book-item {
    padding: 20px;
  }
}
</style>
