<template>
  <section class="news-section">
    <div class="container">
      <h2 class="section-title tech-line">{{ $t('home.latestNews') }}</h2>
      <div class="news-grid">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton
            v-for="i in 6"
            :key="i"
            class="news-skeleton"
            animated
          >
            <template #template>
              <div class="skeleton-news-item">
                <!-- 模拟日期标签 -->
                <div class="skeleton-date-badge">
                  <el-skeleton-item variant="rect" style="width: 120px; height: 45px; border-radius: 12px;" />
                </div>
                <!-- 模拟标题 -->
                <div class="skeleton-title">
                  <el-skeleton-item variant="h3" style="width: 85%; margin-bottom: 8px;" />
                  <el-skeleton-item variant="text" style="width: 70%;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <!-- 动态列表 -->
        <div
          v-for="(news, index) in newsItems"
          v-else-if="newsItems.length > 0"
          :key="news.id"
          class="news-item glass-effect animate__animated animate__fadeIn"
          :style="{ animationDelay: `${0.2 * index}s` }"
          @click="handleNewsClick(news)"
        >
          <div class="news-date">
            <span class="day">{{ news.dateInfo.day }}</span>
            <div class="date-text">
              <span class="month">{{ news.dateInfo.month }}</span>
              <span class="year">{{ news.dateInfo.year }}</span>
            </div>
          </div>
          <h3 class="news-title">{{ news.title }}</h3>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-news">
          <el-empty :description="$t('news.noNews')" />
        </div>
      </div>

      <div class="view-all-container">
        <ViewMoreButton text="阅读更多动态" inverse @click="$router.push('/news')" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ViewMoreButton from './viewMoreButton.vue'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

// 动态响应数据接口
interface DynamicResponse {
  id: number
  title: string
  titleEn?: string
  dynamicType: string
  content?: string
  contentEn?: string
  publishTimes?: string
}

// 分页结果接口
interface PaginationResult<T> {
  list: T[]
  total: number
  pageNo: number
  pageSize: number
  totalPages: number
}

// 新闻项目接口（转换后的格式）
interface NewsItem {
  id: number
  title: string
  dateInfo: {
    day: string
    month: string
    year: string
  }
  type: string
  publishTime: string
}

const router = useRouter()
const { getCurrentLanguageText } = useLanguageText()

// 响应式数据
const newsItems = ref<NewsItem[]>([])
const loading = ref(true)

// 转换动态数据为新闻项格式
const convertDynamicToNews = (dynamic: DynamicResponse): NewsItem => {
  // 根据语言获取标题
  const title = getCurrentLanguageText(dynamic, 'title')

  // 格式化日期（包含年份）
  let dateInfo = { day: '01', month: '1月', year: '2024' }
  if (dynamic.publishTimes) {
    const date = new Date(dynamic.publishTimes)
    const day = date.getDate().toString().padStart(2, '0')
    const month = `${date.getMonth() + 1}月`
    const year = date.getFullYear().toString()
    dateInfo = { day, month, year }
  }

  return {
    id: dynamic.id,
    title,
    dateInfo,
    type: dynamic.dynamicType,
    publishTime: dynamic.publishTimes || ''
  }
}

// 获取最新动态数据
const fetchNewsData = () => {
  loading.value = true

  // 调用动态列表接口，获取前6条数据
  service.post<PaginationResult<DynamicResponse>>('/api/dynamic/list', {
    pageNo: 1,
    pageSize: 6
  })
    .then(response => {
      const data = response as any as PaginationResult<DynamicResponse>
      const dynamics = data.list || []
      newsItems.value = dynamics.map(convertDynamicToNews)
    })
    .finally(() => {
      loading.value = false
    })
}

// 处理新闻点击
const handleNewsClick = (news: NewsItem) => {
  router.push(`/news/${news.id}`)
}

// 生命周期钩子
onMounted(() => {
  fetchNewsData()
})

// 暴露刷新方法
defineExpose({
  fetchNewsData
})
</script>

<style lang="less" scoped>
// 最新动态区域
.news-section {
  position: relative;
  padding: 100px 0;

  // 添加装饰性图形元素
  &::before, &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    z-index: 0;
  }

  &::before {
    top: 80px;
    right: 15%;
  }

  &::after {
    bottom: 80px;
    left: 15%;
    width: 60px;
    height: 60px;
  }

  .dark-mode & {
    background: linear-gradient(rgba(var(--primary-color-rgb), 0.03), rgba(var(--primary-color-rgb), 0.05));
    border-top: 1px solid rgba(var(--primary-color-rgb), 0.15);
    border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.15);
  }

  .purple-theme & {
    background: linear-gradient(rgba(70, 38, 125, 0.02), rgba(70, 38, 125, 0.05));
    border-top: 1px solid rgba(70, 38, 125, 0.1);
    border-bottom: 1px solid rgba(70, 38, 125, 0.1);

    &::before, &::after {
      background-color: rgba(70, 38, 125, 0.1);
    }
  }

  .purple-theme.dark-mode & {
    background: linear-gradient(rgba(105, 56, 181, 0.02), rgba(105, 56, 181, 0.05));
    border-top: 1px solid rgba(105, 56, 181, 0.15);
    border-bottom: 1px solid rgba(105, 56, 181, 0.15);

    &::before, &::after {
      background-color: rgba(105, 56, 181, 0.15);
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.6rem;
  margin-bottom: 50px;
  text-align: center;
  color: var(--text-color-primary);
  font-weight: 700;

  &.tech-line {
    position: relative;
    display: inline-block;
    width: 100%;

    &::before {
      height: 2px;
      opacity: 1;
      background: linear-gradient(90deg, transparent, var(--primary-color), transparent) !important;
    }
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 40px;
  }
}

.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
}

.news-skeleton {
  .skeleton-news-item {
    position: relative;
    padding: 35px 30px 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--border-radius-lg);
    border: 1px solid rgba(var(--primary-color-rgb), 0.08);
    backdrop-filter: blur(10px);
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .dark-mode & {
      background: rgba(26, 26, 46, 0.9);
      border: 1px solid rgba(var(--primary-color-rgb), 0.15);
    }

    .skeleton-date-badge {
      position: absolute;
      top: -20px;
      left: 30px;
    }

    .skeleton-title {
      margin-top: 35px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
}

.news-item {
  padding: 35px 30px 30px;
  border-radius: var(--border-radius-lg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(var(--primary-color-rgb), 0.08);
  cursor: pointer;
  backdrop-filter: blur(10px);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .dark-mode & {
    background: rgba(26, 26, 46, 0.9);
    border: 1px solid rgba(var(--primary-color-rgb), 0.15);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow:
      0 20px 40px rgba(var(--primary-color-rgb), 0.15),
      0 8px 24px rgba(0, 0, 0, 0.12);

    .dark-mode & {
      box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.4),
        0 10px 30px rgba(var(--primary-color-rgb), 0.2);
    }
  }

  .news-date {
    position: absolute;
    top: -20px;
    left: 30px;
    background: linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-color-rgb), 0.8) 100%);
    border-radius: var(--border-radius-lg);
    padding: 12px 20px;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow:
      0 8px 25px rgba(var(--primary-color-rgb), 0.3),
      0 3px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    .day {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .date-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;

      .month {
        font-size: 0.9rem;
        letter-spacing: 0.5px;
      }

      .year {
        font-size: 0.8rem;
        opacity: 0.9;
        padding-left: 4px;
        border-left: 1px solid rgba(255, 255, 255, 0.3);
      }
    }
  }

  .news-title {
    margin-top: 35px;
    margin-bottom: 20px;
    font-size: 1.4rem;
    line-height: 1.4;
    font-weight: 700;
    color: var(--text-color-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 3.6rem;

    &:hover {
      color: var(--primary-color);
      transform: translateY(-2px);
    }

    .dark-mode & {
      color: rgba(255, 255, 255, 0.95);

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.empty-news {
  grid-column: 1 / -1;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);

  .dark-mode & {
    background: rgba(26, 26, 46, 0.8);
    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  }
}

.view-all-container {
  display: flex;
  justify-content: center;
}

// 响应式设计
@media (max-width: 768px) {
  .news-section {
    padding: 60px 0;

    &::before, &::after {
      display: none;
    }
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .news-item {
    padding: 25px;

    .news-title {
      font-size: 1.2rem;
    }
  }
}
</style>

