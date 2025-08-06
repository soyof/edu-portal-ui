<template>
  <section class="research-section">
    <div class="container">
      <h2 class="section-title tech-line">{{ $t('home.researchAchievements') }}</h2>

      <!-- 3D卡片轮播 -->
      <div class="advanced-carousel">
        <div class="carousel-container">
          <!-- 左侧导航按钮 -->
          <button class="nav-btn prev-btn" @click="prevSlide">
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
              />
            </svg>
          </button>

          <div class="carousel-stage">
            <div
              v-for="(stat, index) in statsData"
              :key="index"
              class="carousel-card"
              :class="[getCardClass(index), index === currentSlide ? 'card-pulse' : '']"
              @click="goToSlide(index)"
            >
              <div class="card-inner">
                <!-- 简化的粒子背景 -->
                <div class="card-background">
                  <div class="particles">
                    <div v-for="i in 6" :key="i" class="particle particle-float"></div>
                  </div>
                </div>

                <div class="card-content">
                  <div class="stat-icon icon-pulse">
                    <div class="icon-bg">{{ stat.emoji }}</div>
                  </div>

                  <div class="stat-info">
                    <div class="stat-number">
                      <span class="number-main">{{ stat.value }}</span>
                    </div>
                    <div class="stat-label">{{ stat.label }}</div>
                    <div class="stat-description">{{ stat.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧导航按钮 -->
          <button class="nav-btn next-btn" @click="nextSlide">
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <!-- 底部指示器 -->
        <div class="carousel-indicators">
          <button
            v-for="(stat, index) in statsData"
            :key="index"
            class="indicator-dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          >
          </button>
        </div>
      </div>

      <!-- 研究成果内容 -->
      <div class="research-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton v-for="i in 6" :key="i" class="research-skeleton"
            animated
          >
            <template #template>
              <div class="skeleton-item">
                <el-skeleton-item variant="rect" style="width: 60px; height: 20px; border-radius: 10px;" />
                <el-skeleton-item variant="h3" style="width: 90%; margin: 8px 0;" />
                <el-skeleton-item variant="text" style="width: 100%;" />
                <el-skeleton-item variant="text" style="width: 85%;" />
              </div>
            </template>
          </el-skeleton>
        </div>

        <!-- 研究成果列表 -->
        <div v-else-if="hasResearchData" class="research-grid">
          <!-- 论文 -->
          <template v-if="currentSlide === 0">
            <div
              v-for="(paper, index) in researchData.papers"
              :key="`paper-${paper.id}`"
              class="research-item paper-item fade-in-up"
              :style="{ '--animate-delay': `${index * 0.1}s` }"
              @click="goToPaperDetail(paper.id)"
            >
              <div class="item-header">
                <span class="item-type">{{ $t('research.paper') }}</span>
                <span class="item-date">{{ formatDate(paper.paperPublishTimes || paper.publishTimes) }}</span>
              </div>
              <h3 class="item-title">{{ getCurrentLanguageText(paper, 'title') }}</h3>
              <div v-if="paper.abstract || paper.abstractEn" class="item-excerpt">
                <p v-html="getCurrentLanguageText(paper, 'abstract')"></p>
              </div>
            </div>
          </template>

          <!-- 专利 -->
          <template v-if="currentSlide === 1">
            <div
              v-for="(patent, index) in researchData.patents"
              :key="`patent-${patent.id}`"
              class="research-item patent-item fade-in-up"
              :style="{ '--animate-delay': `${index * 0.1}s` }"
              @click="goToPatentDetail(patent.id)"
            >
              <div class="item-header">
                <span class="item-type">{{ $t('research.patent') }}</span>
                <span class="item-date">{{ formatDate(patent.patentPublishDate || patent.publishTimes) }}</span>
              </div>
              <h3 class="item-title">{{ getCurrentLanguageText(patent, 'title') }}</h3>
              <div class="patent-meta">
                <div class="meta-item">
                  <span class="meta-label">{{ $t('research.applicants') }}:</span>
                  <span class="meta-value">{{ patent.applicants }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">{{ $t('research.applicationNum') }}:</span>
                  <span class="meta-value">{{ patent.applicationNum }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 著作 -->
          <template v-if="currentSlide === 2">
            <div
              v-for="(book, index) in researchData.books"
              :key="`book-${book.id}`"
              class="research-item book-item fade-in-up"
              :style="{ '--animate-delay': `${index * 0.1}s` }"
              @click="goToBookDetail(book.id)"
            >
              <div class="item-header">
                <span class="item-type">{{ $t('research.book') }}</span>
                <span class="item-date">{{ formatDate(book.bookPublishDate || book.publishTimes) }}</span>
              </div>
              <h3 class="item-title">{{ getCurrentLanguageText(book, 'title') }}</h3>
              <div class="book-meta">
                <div class="meta-item">
                  <span class="meta-label">{{ $t('research.author') }}:</span>
                  <span class="meta-value">{{ getCurrentLanguageText(book, 'author') }}</span>
                </div>
              </div>
              <div v-if="book.abstract || book.abstractEn" class="item-excerpt">
                <p v-html="getCurrentLanguageText(book, 'abstract')"></p>
              </div>
            </div>
          </template>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-research">
          <el-empty :description="$t('research.noResults')" />
        </div>
      </div>

      <div class="view-all-container">
        <ViewMoreButton :text="$t('research.viewMore')" inverse @click="$router.push('/research')" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ViewMoreButton from './viewMoreButton.vue'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

// 接口类型定义
interface PaperResponse {
  id: number
  title: string
  titleEn: string
  abstract?: string
  abstractEn?: string
  paperPublishTimes?: string
  originalUrl?: string
  content?: string
  contentEn?: string
  createUserId: string
  createdTimes: string
  updateUserId?: string
  updatedTimes: string
  publishUserId?: string
  publishTimes?: string
}

interface PatentResponse {
  id: number
  title: string
  titleEn?: string
  patentPublishDate?: string
  applicants: string
  applicationNum: string
  isServicePatent: string
  applicationDate: string
  authorizationDate?: string
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

interface BookResponse {
  id: number
  title: string
  titleEn?: string
  author: string
  authorEn?: string
  bookPublishDate?: string
  publisher?: string
  publisherEn?: string
  isbn?: string
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

interface ResearchOverviewResponse {
  papers: PaperResponse[]
  patents: PatentResponse[]
  books: BookResponse[]
  papersTotal: number
  patentsTotal: number
  booksTotal: number
}

const { locale } = useI18n()
const { getCurrentLanguageText, formatDate } = useLanguageText()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const currentSlide = ref(0)
const researchData = ref<ResearchOverviewResponse>({
  papers: [],
  patents: [],
  books: [],
  papersTotal: 0,
  patentsTotal: 0,
  booksTotal: 0
})

// 统计数据
const statsData = computed(() => [
  {
    emoji: '📄',
    value: researchData.value.papersTotal || 0,
    label: locale.value === 'en' ? 'Papers' : '学术论文',
    description: locale.value === 'en' ? 'Academic papers published in top journals' : '发表在顶级期刊的学术论文',
    route: '/research/papers'
  },
  {
    emoji: '🏆',
    value: researchData.value.patentsTotal || 0,
    label: locale.value === 'en' ? 'Patents' : '专利成果',
    description: locale.value === 'en' ? 'Innovation patents and intellectual property' : '创新专利与知识产权成果',
    route: '/research/patents'
  },
  {
    emoji: '📚',
    value: researchData.value.booksTotal || 0,
    label: locale.value === 'en' ? 'Books' : '学术著作',
    description: locale.value === 'en' ? 'Academic books and monographs' : '学术专著与教材出版',
    route: '/research/books'
  }
])

// 检查是否有研究数据
const hasResearchData = computed(() => {
  return researchData.value.papers.length > 0 ||
         researchData.value.patents.length > 0 ||
         researchData.value.books.length > 0
})

// 获取科研成果数据
const fetchResearchData = async() => {
  loading.value = true
  const res = await service.get('/api/research/achievements')
  const data = res as unknown as ResearchOverviewResponse

  // 每种类型只显示三条数据
  researchData.value = {
    papers: data.papers.slice(0, 6),
    patents: data.patents.slice(0, 6),
    books: data.books.slice(0, 6),
    papersTotal: data.papersTotal,
    patentsTotal: data.patentsTotal,
    booksTotal: data.booksTotal
  }
  loading.value = false
}

// 跳转到论文详情页面
const goToPaperDetail = (paperId: number) => {
  router.push(`/research/papers/${paperId}`)
}

// 跳转到专利详情页面
const goToPatentDetail = (patentId: number) => {
  router.push(`/research/patents/${patentId}`)
}

// 跳转到著作详情页面
const goToBookDetail = (bookId: number) => {
  router.push(`/research/books/${bookId}`)
}

// 获取卡片的CSS类
const getCardClass = (index: number) => {
  const total = statsData.value.length
  const current = currentSlide.value

  if (index === current) {
    return 'active'
  }

  // 计算相对位置（支持循环）
  let position = index - current

  // 处理循环边界
  if (position > total / 2) {
    position -= total
  } else if (position < -total / 2) {
    position += total
  }

  if (position === 1) {
    return 'next'
  } else if (position === -1) {
    return 'prev'
  } else if (position > 1) {
    return 'far-next'
  } else if (position < -1) {
    return 'far-prev'
  }

  return ''
}

// 轮播控制函数
const goToSlide = (index: number) => {
  currentSlide.value = index
}

const nextSlide = () => {
  if (currentSlide.value < statsData.value.length - 1) {
    currentSlide.value++
  } else {
    // 循环到第一个
    currentSlide.value = 0
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    // 循环到最后一个
    currentSlide.value = statsData.value.length - 1
  }
}

// 页面挂载时获取数据
onMounted(() => {
  fetchResearchData()
})
</script>

<style lang="less" scoped>
// 基础变量
@carousel-perspective: 1200px;
@card-width: 350px;
@card-height: 320px;

// 混入
.glass-effect() {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.tech-border() {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border-radius: 16px 0 0 16px;
    transform: translateX(-100%);
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
  }

  &:hover::before {
    transform: translateX(0);
    opacity: 1;
    box-shadow: 2px 0 15px rgba(var(--primary-color-rgb), 0.4);
  }
}

.research-section {
  position: relative;
  padding: 100px 0;

  // 装饰元素
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    z-index: 0;
  }

  &::before {
    top: 80px;
    left: 8%;
    width: 40px;
    height: 40px;
  }

  &::after {
    bottom: 80px;
    right: 8%;
    width: 60px;
    height: 60px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
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
        content: '';
        position: absolute;
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
      }
    }
  }

  // 3D轮播
  .advanced-carousel {
    margin-bottom: 4rem;
    perspective: @carousel-perspective;

    .carousel-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between; // 改为space-between布局
      padding: 0 20px; // 给按钮留出内部空间
    }

    .carousel-stage {
      position: relative;
      height: 400px;
      width: 100%;
      max-width: 800px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1; // 让stage占据中间的剩余空间

      .carousel-card {
        position: absolute;
        width: @card-width;
        height: @card-height;
        cursor: pointer;
        // Element Plus卡片模式：使用2D变换提供更平滑的过渡

        // 默认隐藏状态
        opacity: 0;
        transform: translateX(0) scale(0.8);
        pointer-events: none;

        // 卡片状态 - 参考Element Plus卡片模式
        &.active {
          opacity: 1;
          transform: translateX(0) scale(1);
          z-index: 3;
          pointer-events: auto;

          .card-inner {
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.95),
              rgba(255, 255, 255, 0.85));
            border: 1px solid rgba(var(--primary-color-rgb), 0.7);
            box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.25);
          }
        }

        &.prev {
          opacity: 0.7;
          transform: translateX(-70%) scale(0.85);
          z-index: 2;
          pointer-events: auto;

          .card-inner {
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.9),
              rgba(255, 255, 255, 0.8));
            border: 1px solid rgba(var(--primary-color-rgb), 0.15);
            box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.1);
          }
        }

        &.next {
          opacity: 0.7;
          transform: translateX(70%) scale(0.85);
          z-index: 2;
          pointer-events: auto;

          .card-inner {
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.9),
              rgba(255, 255, 255, 0.8));
            border: 1px solid rgba(var(--primary-color-rgb), 0.15);
            box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.1);
          }
        }

        &.far-prev, &.far-next {
          opacity: 0.4;
          transform: translateX(0) scale(0.75);
          z-index: 1;
          pointer-events: none;

          .card-inner {
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.75),
              rgba(255, 255, 255, 0.65));
            border: 1px solid rgba(var(--primary-color-rgb), 0.08);
            box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.05);
          }
        }

        .card-inner {
          width: 100%;
          height: 100%;
          .glass-effect();
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.6s ease;
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          .particles {
            position: absolute;
            width: 100%;
            height: 100%;

            .particle {
              position: absolute;
              width: 4px;
              height: 4px;
              background: rgba(var(--primary-color-rgb), 0.6);
              border-radius: 50%;

              &:nth-child(1) {
                left: 15%;
                top: 20%;
                animation-delay: 0s;
              }

              &:nth-child(2) {
                left: 75%;
                top: 35%;
                animation-delay: 0.5s;
              }

              &:nth-child(3) {
                left: 30%;
                top: 70%;
                animation-delay: 1s;
              }

              &:nth-child(4) {
                left: 85%;
                top: 15%;
                animation-delay: 1.5s;
              }

              &:nth-child(5) {
                left: 60%;
                top: 80%;
                animation-delay: 2s;
              }

              &:nth-child(6) {
                left: 10%;
                top: 50%;
                animation-delay: 2.5s;
              }
            }
          }
        }

        .card-content {
          position: relative;
          z-index: 2;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;

          .stat-icon {
            margin-bottom: 1.5rem;

            .icon-bg {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
              box-shadow: 0 10px 30px rgba(var(--primary-color-rgb), 0.3);
            }
          }

          .stat-info {
            .stat-number {
              margin-bottom: 1rem;

              .number-main {
                font-size: 3rem;
                font-weight: 900;
                background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
            }

            .stat-label {
              font-size: 1.3rem;
              font-weight: 700;
              color: var(--text-color);
              margin-bottom: 0.8rem;
            }

            .stat-description {
              font-size: 0.9rem;
              color: var(--text-color-secondary);
              line-height: 1.5;
            }
          }
        }

        // 激活卡片文字优化
        &.active .card-content {
          .stat-label {
            color: #1f2937;
            font-weight: 800;
          }

          .stat-description {
            color: #374151;
          }
        }
      }
    }

    // 左右导航按钮 - Element Plus风格
    .nav-btn {
      position: static; // 改为static定位，使用flex布局
      width: 44px;
      height: 44px;
      border-radius: 50%;
      .glass-effect();
      color: var(--primary-color);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      flex-shrink: 0; // 防止按钮被压缩

      // 移除具体的left/right定位，依赖flex布局

      &:hover {
        transform: scale(1.1);
        background: var(--primary-color);
        color: white;
        box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.3);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;

        &:hover {
          transform: none;
          background: transparent;
          color: var(--primary-color);
          box-shadow: none;
        }
      }
    }

    // 底部指示器
    .carousel-indicators {
      display: flex;
      justify-content: center;
      gap: 0.8rem;
      margin-top: 2rem;

      .indicator-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(var(--primary-color-rgb), 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        position: relative;

        &:hover {
          background: rgba(var(--primary-color-rgb), 0.6);
          transform: scale(1.2);
        }

        &.active {
          background: var(--primary-color);
          transform: scale(1.3);

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            border: 2px solid rgba(var(--primary-color-rgb), 0.3);
            border-radius: 50%;
            animation: pulse-ring 2s infinite;
          }
        }
      }
    }
  }

  // 研究内容
  .research-content {
    .loading-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;

      .skeleton-item {
        padding: 1.5rem;
        .glass-effect();
        border-radius: 16px;
      }
    }

    .research-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .research-item {
      .glass-effect();
      .tech-border();
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      // 注意：入场动画由自定义CSS管理，这里只保留hover过渡
      transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(var(--primary-color-rgb), 0.3);
        background: rgba(var(--primary-color-rgb), 0.08);
        box-shadow: 0 15px 30px rgba(var(--primary-color-rgb), 0.15);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .item-type {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .item-date {
          color: var(--text-color-secondary);
          font-size: 0.85rem;
        }
      }

      .item-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 1rem;
        line-height: 1.4;
      }

      .item-excerpt, .patent-meta, .book-meta {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
        line-height: 1.6;

        .meta-item {
          margin-bottom: 0.5rem;

          .meta-label {
            font-weight: 600;
            color: var(--text-color);
          }
        }
      }

      // 不同类型的样式
      &.paper-item {
        .tech-border();

        .item-type {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }
      }

      &.patent-item {
        .tech-border();

        .item-type {
          background: linear-gradient(135deg, #f39c12, #e67e22);
        }
      }

      &.book-item {
        .tech-border();

        .item-type {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
        }
      }
    }

    .empty-research {
      text-align: center;
      padding: 4rem 0;
    }
  }

  .view-all-container {
    text-align: center;
    margin-top: 4rem;
  }
}

// 响应式设计
// 平板横屏和小桌面屏幕优化
@media (max-width: 1024px) {
  .research-section {
    .container {
      padding: 0 40px; // 减少padding，因为按钮现在在容器内
    }

    .advanced-carousel {
      .carousel-container {
        padding: 0 15px; // 调整内部间距
      }

      .nav-btn {
        width: 40px;
        height: 40px;
      }
    }
  }
}

@media (max-width: 768px) {
  .research-section {
    padding: 80px 0;

    .container {
      padding: 0 30px; // 减少padding，按钮在容器内
    }

    .section-title {
      font-size: 2.2rem;
      margin-bottom: 40px;
    }

    .advanced-carousel {
      margin-bottom: 3rem;

      .carousel-container {
        padding: 0 10px; // 调整内部间距
      }

      .carousel-stage {
        height: 320px;

        .carousel-card {
          width: 280px;
          height: 260px;

          &.active {
            transform: translateX(0) scale(0.95);
          }

          &.prev {
            opacity: 0.6;
            transform: translateX(-70%) scale(0.75);
          }

          &.next {
            opacity: 0.6;
            transform: translateX(70%) scale(0.75);
          }

          &.far-prev, &.far-next {
            opacity: 0.3;
            transform: translateX(0) scale(0.65);
          }

          .card-content {
            padding: 1.5rem;

            .stat-icon .icon-bg {
              width: 60px;
              height: 60px;
              font-size: 1.5rem;
            }

            .stat-info {
              .stat-number .number-main {
                font-size: 2.5rem;
              }

              .stat-label {
                font-size: 1.1rem;
              }

              .stat-description {
                font-size: 0.8rem;
              }
            }
          }
        }
      }

      .nav-btn {
        width: 38px;
        height: 38px;
        // 移除left/right定位，使用flex布局
      }

      .carousel-indicators {
        margin-top: 1.5rem;

        .indicator-dot {
          width: 10px;
          height: 10px;

          &.active::after {
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .research-content .research-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
}

@media (max-width: 480px) {
  .research-section {
    padding: 60px 0;

    .container {
      padding: 0 20px; // 减少padding，按钮在容器内
    }

        .advanced-carousel {
      .carousel-container {
        padding: 0 8px; // 调整内部间距
      }

      .carousel-stage {
        height: 280px;

        .carousel-card {
          width: 240px;
          height: 220px;

          &.active {
            transform: translateX(0) scale(0.9);
          }

          &.prev {
            opacity: 0.4;
            transform: translateX(-70%) scale(0.6);
          }

          &.next {
            opacity: 0.4;
            transform: translateX(70%) scale(0.6);
          }

          &.far-prev, &.far-next {
            opacity: 0.2;
            transform: translateX(0) scale(0.5);
          }

          .card-content {
            padding: 1rem;

            .stat-icon .icon-bg {
              width: 50px;
              height: 50px;
              font-size: 1.2rem;
            }

            .stat-info {
              .stat-number .number-main {
                font-size: 2rem;
              }

              .stat-label {
                font-size: 1rem;
              }

              .stat-description {
                display: none;
              }
            }
          }
        }
      }

      .nav-btn {
        width: 35px;
        height: 35px;
        // 移除left/right定位，使用flex布局
      }

      .carousel-indicators {
        margin-top: 1rem;

        .indicator-dot {
          width: 8px;
          height: 8px;

          &.active::after {
            width: 14px;
            height: 14px;
          }
        }
      }
    }
  }
}

// 超小屏幕优化 (320px-400px)
@media (max-width: 400px) {
  .research-section {
    .container {
      padding: 0 15px; // 进一步减少padding
    }

    .advanced-carousel {
      .carousel-container {
        padding: 0 5px; // 最小内部间距
      }

      .nav-btn {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(var(--primary-color-rgb), 0.2);

        &:hover {
          background: var(--primary-color);
          color: white;
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .carousel-stage {
        height: 250px;

        .carousel-card {
          width: 200px;
          height: 190px;

          .card-content {
            padding: 0.8rem;
          }
        }
      }
    }
  }
}

// 紫色主题适配
.purple-theme .research-section {
  .advanced-carousel .carousel-card {
    &.active .card-inner {
      border: 1px solid rgba(70, 38, 125, 0.7);
      box-shadow: 0 8px 32px rgba(70, 38, 125, 0.25);
    }

    &.prev .card-inner,
    &.next .card-inner {
      border: 1px solid rgba(70, 38, 125, 0.15);
      box-shadow: 0 4px 16px rgba(70, 38, 125, 0.1);
    }

    &.far-prev .card-inner,
    &.far-next .card-inner {
      border: 1px solid rgba(70, 38, 125, 0.08);
      box-shadow: 0 2px 8px rgba(70, 38, 125, 0.05);
    }
  }
}

// 紫色主题 + 暗色模式
.purple-theme.dark-mode .research-section {
  .advanced-carousel .carousel-card {
    &.active .card-inner {
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.1));
      border: 1px solid rgba(105, 56, 181, 0.3);
    }

    &.prev .card-inner,
    &.next .card-inner {
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.05));
      border: 1px solid rgba(105, 56, 181, 0.15);
    }

    &.far-prev .card-inner,
    &.far-next .card-inner {
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.04),
        rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(105, 56, 181, 0.08);
    }
  }
}

// 暗色模式
.dark-mode .research-section {
  .advanced-carousel .carousel-card {
    &.active .card-inner {
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.1));
      border: 1px solid rgba(var(--primary-color-rgb), 0.3);
    }

    // 优化非激活状态的背景色
    &.prev .card-inner,
    &.next .card-inner {
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.05));
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    &.far-prev .card-inner,
    &.far-next .card-inner {
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.04),
        rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    &.active .card-content {
      .stat-label {
        color: #ffffff;
      }

      .stat-description {
        color: #e5e7eb;
      }
    }

    // 优化非激活状态的文字颜色
    &.prev .card-content,
    &.next .card-content {
      .stat-label {
        color: #d1d5db;
      }

      .stat-description {
        color: #9ca3af;
      }
    }

    &.far-prev .card-content,
    &.far-next .card-content {
      .stat-label {
        color: #9ca3af;
      }

      .stat-description {
        color: #6b7280;
      }
    }
  }
}

// ===== 自定义动画定义 =====

// 指示器脉冲动画
@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

// 基础关键帧动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(var(--primary-color-rgb), 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 15px 40px rgba(var(--primary-color-rgb), 0.5);
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  33% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
  66% {
    transform: translateY(5px) scale(0.8);
    opacity: 0.8;
  }
}

@keyframes smoothSlide {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 自定义动画类
.fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
  animation-delay: var(--animate-delay, 0s);
}

.card-pulse {
  animation: cardPulse 2s ease-in-out infinite;
}

.icon-pulse {
  .icon-bg {
    animation: iconPulse 3s ease-in-out infinite;
  }
}

.particle-float {
  animation: particleFloat 4s ease-in-out infinite;

  // 为每个粒子设置不同的延迟和持续时间
  &:nth-child(1) {
    animation-delay: 0s;
    animation-duration: 3.5s;
  }

  &:nth-child(2) {
    animation-delay: 0.8s;
    animation-duration: 4s;
  }

  &:nth-child(3) {
    animation-delay: 1.6s;
    animation-duration: 3.8s;
  }

  &:nth-child(4) {
    animation-delay: 2.4s;
    animation-duration: 4.2s;
  }

  &:nth-child(5) {
    animation-delay: 3.2s;
    animation-duration: 3.6s;
  }

  &:nth-child(6) {
    animation-delay: 4s;
    animation-duration: 4.4s;
  }
}

// 轮播卡片增强过渡 - Element Plus风格
.carousel-card {
  transition: transform 0.4s ease, opacity 0.4s ease;
  will-change: transform, opacity;

  &.active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  &.prev, &.next {
    transition: transform 0.4s ease, opacity 0.4s ease;
  }

  &.far-prev, &.far-next {
    transition: transform 0.5s ease, opacity 0.5s ease;
  }

  .card-inner {
    transition: background 0.3s ease,
                border 0.3s ease,
                box-shadow 0.3s ease;
  }
}

// 研究项目渐入动画增强
.research-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }
  &:nth-child(6) { animation-delay: 0.6s; }
}

// 响应式动画优化
@media (prefers-reduced-motion: reduce) {
  .fade-in-up,
  .card-pulse,
  .icon-pulse .icon-bg,
  .particle-float,
  .carousel-card,
  .research-item {
    animation: none !important;
    transition: none !important;
  }
}
</style>
