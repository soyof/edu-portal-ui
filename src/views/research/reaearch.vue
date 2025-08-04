<template>
  <div class="research-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="floating-elements">
          <div
            v-for="i in 8"
            :key="i"
            class="float-element"
            :style="{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (3 + Math.random() * 2) + 's'
            }"
          ></div>
        </div>
      </div>

      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">
            <span class="title-gradient">{{ $t('research.title') }}</span>
          </h1>
          <p class="hero-subtitle">{{ $t('research.subtitle') }}</p>

          <!-- 统计卡片 -->
          <div class="stats-cards">
            <router-link
              v-for="(stat, index) in statsData"
              :key="index"
              :to="stat.route"
              class="stat-card"
              :style="{ animationDelay: index * 0.2 + 's' }"
            >
              <div class="stat-icon">
                <div class="icon-bg">{{ stat.emoji }}</div>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="content-section">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="modern-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-dot"></div>
          </div>
          <p class="loading-text">{{ $t('research.loading') }}</p>
        </div>

        <!-- Research Content -->
        <div v-else class="research-content">
          <!-- Papers Module -->
          <div class="research-module">
            <div class="module-header">
              <h2 class="module-title">
                <div class="title-decorator"></div>
                <span class="title-text">{{ $t('research.papers') }}</span>
              </h2>
              <router-link to="/research/papers" class="view-all-btn">
                <span>{{ $t('research.viewAll') }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                  />
                </svg>
              </router-link>
            </div>

            <div v-if="overviewData.papers?.length" class="content-grid">
              <div
                v-for="(paper, index) in overviewData.papers"
                :key="paper.id"
                class="content-card paper-item"
                :style="{ animationDelay: index * 0.1 + 's' }"
                @click="goToPaperDetail(paper.id)"
              >
                <div class="paper-meta">
                  <span class="paper-date">
                    {{ formatDate(paper.paperPublishTimes || paper.publishTimes) }}
                  </span>
                  <a
                    v-if="paper.originalUrl"
                    :href="paper.originalUrl"
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

                <h3 class="paper-title">{{ getCurrentLanguageText(paper, 'title') }}</h3>

                <div v-if="paper.abstract || paper.abstractEn" class="paper-excerpt">
                  <p v-html="getCurrentLanguageText(paper, 'abstract')"></p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">📄</div>
              <p>{{ $t('research.noResults') }}</p>
            </div>
          </div>

          <!-- Patents Module -->
          <div class="research-module">
            <div class="module-header">
              <h2 class="module-title">
                <div class="title-decorator"></div>
                <span class="title-text">{{ $t('research.patents') }}</span>
              </h2>
              <router-link to="/research/patents" class="view-all-btn">
                <span>{{ $t('research.viewAll') }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                  />
                </svg>
              </router-link>
            </div>

            <div v-if="overviewData.patents?.length" class="content-grid">
              <div
                v-for="(patent, index) in overviewData.patents"
                :key="patent.id"
                class="content-card patent-item"
                :style="{ animationDelay: index * 0.1 + 's' }"
                @click="goToPatentDetail(patent.id)"
              >
                <div class="patent-header">
                  <div v-if="patent.patentPublishDate" class="patent-publish-date">
                    <span class="date-value">{{ formatDate(patent.patentPublishDate) }}</span>
                  </div>
                  <div class="patent-badges">
                    <span class="patent-number">{{ patent.applicationNum }}</span>
                    <span v-if="patent.isServicePatent === '1'" class="service-tag">
                      {{ $t('research.servicePatent') }}
                    </span>
                  </div>
                </div>

                <h3 class="patent-title">{{ getCurrentLanguageText(patent, 'title') }}</h3>

                <div class="patent-applicants">
                  <span class="applicants-label">{{ $t('research.applicants') }}:</span>
                  <span class="applicants-name">{{ patent.applicants }}</span>
                </div>

                <div v-if="patent.abstract || patent.abstractEn" class="patent-excerpt">
                  <p v-html="getCurrentLanguageText(patent, 'abstract')"></p>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🏆</div>
              <p>{{ $t('research.noResults') }}</p>
            </div>
          </div>

          <!-- Books Module -->
          <div class="research-module">
            <div class="module-header">
              <h2 class="module-title">
                <div class="title-decorator"></div>
                <span class="title-text">{{ $t('research.books') }}</span>
              </h2>
              <router-link to="/research/books" class="view-all-btn">
                <span>{{ $t('research.viewAll') }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                  />
                </svg>
              </router-link>
            </div>

            <div v-if="overviewData.books?.length" class="content-grid">
              <div
                v-for="(book, index) in overviewData.books"
                :key="book.id"
                class="content-card book-item"
                :style="{ animationDelay: index * 0.1 + 's' }"
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
            <div v-else class="empty-state">
              <div class="empty-icon">📚</div>
              <p>{{ $t('research.noResults') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
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
const overviewData = ref<ResearchOverviewResponse>({
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
    value: overviewData.value.papersTotal || 0,
    label: locale.value === 'en' ? 'Papers' : '学术论文',
    route: '/research/papers'
  },
  {
    emoji: '🏆',
    value: overviewData.value.patentsTotal || 0,
    label: locale.value === 'en' ? 'Patents' : '专利成果',
    route: '/research/patents'
  },
  {
    emoji: '📚',
    value: overviewData.value.booksTotal || 0,
    label: locale.value === 'en' ? 'Books' : '学术著作',
    route: '/research/books'
  }
])

// 获取科研成果数据
const fetchResearchData = async() => {
  try {
    loading.value = true
    const res = await service.get('/api/research/achievements')
    overviewData.value = res as unknown as ResearchOverviewResponse
  } catch (error) {
    console.error('获取科研成果数据失败:', error)
  } finally {
    loading.value = false
  }
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

// 页面挂载时获取数据
onMounted(() => {
  fetchResearchData()
})
</script>

<style lang="less" scoped>
// 主题变量
:root {
  --primary-color: #00b8a9;
  --accent-color: #00e0c7;
  --secondary-color: #2c3e50;
  --light-bg: #f8fafc;
  --dark-text: #2d3748;
  --gray-text: #718096;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  --gradient-primary: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  --gradient-bg: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dark-mode {
  --light-bg: #1a202c;
  --dark-text: #f7fafc;
  --gray-text: #a0aec0;
  --border-color: #2d3748;
  --gradient-bg: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

.research-page {
  min-height: 100vh;
  background: var(--gradient-bg);
  color: var(--dark-text);

  .dark-mode & {
    color: var(--dark-text);
  }
}

// Hero Section
.hero-section {
  position: relative;
  padding: 8rem 0 6rem;
  background: linear-gradient(135deg,
    rgba(0, 184, 169, 0.05) 0%,
    rgba(0, 224, 199, 0.08) 50%,
    rgba(248, 250, 252, 0.95) 100%);
  overflow: hidden;

  .dark-mode & {
    background: linear-gradient(135deg,
      rgba(26, 32, 44, 0.95) 0%,
      rgba(45, 55, 72, 0.9) 50%,
      rgba(0, 184, 169, 0.05) 100%);
  }

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .floating-elements {
      position: absolute;
      width: 100%;
      height: 100%;

      .float-element {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        opacity: 0.3;
        animation: gentleFloat 4s ease-in-out infinite;

        &:nth-child(odd) {
          background: var(--accent-color);
        }
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;

.page-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 800;
      margin-bottom: 1.5rem;
      line-height: 1.2;

      .title-gradient {
        color: var(--primary-color);
  position: relative;
        font-weight: 800;

        .dark-mode & {
          color: #4fd1c7;
        }

  &::after {
    content: '';
    position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
    height: 3px;
          background: var(--gradient-primary);
          border-radius: 2px;
        }
      }
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 3rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;

      .dark-mode & {
        color: #9ca3af;
      }
    }

    .stats-cards {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;

      .stat-card {
        display: block;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 2rem 1.5rem;
        min-width: 180px;
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow-md);
        transition: all 0.3s ease;
        /* 使用 animate.css 的 fadeInUp 动画，通过 Vue 指令添加 */
        text-decoration: none;
        color: inherit;
        cursor: pointer;

        .dark-mode & {
          background: rgba(45, 55, 72, 0.8);
          border-color: #4a5568;
        }

        &:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: var(--shadow-lg), 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
          border-color: var(--primary-color);
        }

        &:active {
          transform: translateY(-4px) scale(1.01);
        }

        .stat-icon {
          margin-bottom: 1rem;

          .icon-bg {
            width: 60px;
            height: 60px;
            background: var(--gradient-primary);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(0, 184, 169, 0.2);
          }
        }

        .stat-info {
          text-align: center;

          .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
            line-height: 1;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #374151;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;

            .dark-mode & {
              color: #d1d5db;
            }
          }
        }
      }
    }
  }
}

// Content Section
.content-section {
  padding: 5rem 0;
  position: relative;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;

  .modern-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 2rem;

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid rgba(0, 184, 169, 0.2);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      background: var(--primary-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  .loading-text {
    font-size: 1.1rem;
    color: var(--gray-text);
    font-weight: 500;
  }
}

// Research Content
.research-content {
  .research-module {
    margin-bottom: 5rem;

    &:last-child {
      margin-bottom: 0;
    }

    .module-header {
      margin-bottom: 3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .module-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 2.8rem;
        font-weight: 900;
        color: var(--dark-text);
        position: relative;
        margin-bottom: 0.5rem;

        .dark-mode & {
          color: #f7fafc;
        }

        .title-decorator {
          width: 6px;
          height: 60px;
          background: linear-gradient(180deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent), var(--tech-pink));
          border-radius: 3px;
          box-shadow:
            0 0 20px rgba(14, 165, 233, 0.4),
            0 0 40px rgba(59, 130, 246, 0.2);
          animation: titleGlow 3s ease-in-out infinite;
        }

        .title-text {
          background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 8px rgba(14, 165, 233, 0.1);

          .dark-mode & {
            background: linear-gradient(135deg, var(--tech-secondary), var(--tech-accent), var(--tech-pink));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 0;
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
            border-radius: 2px;
            opacity: 0.8;
            animation: titleUnderline 2s ease-in-out infinite;
          }
        }
      }

      .view-all-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.5rem;
        background: rgba(var(--primary-color-rgb), 0.08);
        border: 1px solid rgba(var(--primary-color-rgb), 0.2);
        border-radius: 25px;
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);

        .dark-mode & {
          color: #4fd1c7;
          border-color: rgba(79, 209, 199, 0.2);
      }

      &:hover {
          background: var(--primary-color);
          color: white;
        transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.3);

          svg {
            transform: translateX(3px);
          }
        }

        svg {
        transition: transform 0.3s ease;
      }
      }
    }
  }
}

// Content Grid
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

// Content Cards
.content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  /* 使用 animate.css 的 fadeInUp 动画，通过 Vue 指令添加 */
  overflow: hidden;
  cursor: pointer;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(var(--secondary-color-rgb), 0.2);
    color: #f7fafc;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
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
      rgba(var(--primary-color-rgb), 0.3) 20%,
      rgba(var(--primary-color-rgb), 0.5) 50%,
      rgba(var(--primary-color-rgb), 0.3) 80%,
      transparent 100%);
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 20px 60px rgba(var(--primary-color-rgb), 0.15);
    border-color: rgba(var(--primary-color-rgb), 0.4);

    .dark-mode & {
      box-shadow: 0 20px 60px rgba(var(--secondary-color-rgb), 0.2);
      border-color: rgba(var(--secondary-color-rgb), 0.4);
    }

    &::before {
      opacity: 1;
      width: 6px;
      background: linear-gradient(180deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent), var(--tech-pink));
      animation: cardBorderPulse 2s ease-in-out infinite;
    }

    &::after {
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(var(--primary-color-rgb), 0.8) 20%,
        rgba(var(--primary-color-rgb), 0.9) 50%,
        rgba(var(--primary-color-rgb), 0.8) 80%,
        transparent 100%);
    }
  }

  .card-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 1rem;

    .card-category {
      background: linear-gradient(135deg, rgba(0, 184, 169, 0.12), rgba(0, 224, 199, 0.08));
      color: var(--primary-color);
      padding: 0.5rem 1.2rem;
      border-radius: 25px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid rgba(0, 184, 169, 0.2);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(0, 184, 169, 0.1);
    }

    .card-date,
    .book-date,
    .paper-date {
      color: var(--tech-primary);
      font-size: 0.9rem;
      font-weight: 500;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
      padding: 8px 16px;
      background: rgba(var(--primary-color-rgb), 0.1);
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '📅';
        font-size: 0.8rem;
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 20px;
        padding: 1px;
        background: linear-gradient(45deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        background: rgba(var(--primary-color-rgb), 0.15);
        border-color: rgba(var(--primary-color-rgb), 0.4);
        color: var(--tech-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(var(--primary-color-rgb), 0.25);

        &::after {
          opacity: 1;
        }

        .dark-mode & {
          background: rgba(var(--secondary-color-rgb), 0.2);
          border-color: rgba(var(--secondary-color-rgb), 0.5);
          color: var(--tech-secondary);
          box-shadow: 0 4px 20px rgba(var(--secondary-color-rgb), 0.25);
        }
      }

      .dark-mode & {
        color: var(--tech-secondary);
        background: rgba(var(--secondary-color-rgb), 0.1);
        border-color: rgba(var(--secondary-color-rgb), 0.2);
      }
    }

    // 专利卡片特殊样式
    &.patent-header {
      justify-content: flex-start;
      margin-bottom: 1rem;

      .patent-badges {
        display: flex;
        gap: 0.8rem;
        align-items: center;
        flex-wrap: wrap;

        .patent-number {
          color: var(--tech-primary);
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 8px 16px;
          background: rgba(var(--primary-color-rgb), 0.1);
          border: 1px solid rgba(var(--primary-color-rgb), 0.2);
          border-radius: 20px;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;

          &::before {
            content: '🔢';
            margin-right: 6px;
            font-size: 0.8rem;
          }

          &:hover {
            background: rgba(var(--primary-color-rgb), 0.15);
            border-color: rgba(var(--primary-color-rgb), 0.4);
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(var(--primary-color-rgb), 0.25);
          }

          .dark-mode & {
            color: var(--tech-secondary);
            background: rgba(var(--secondary-color-rgb), 0.1);
            border-color: rgba(var(--secondary-color-rgb), 0.2);

            &:hover {
              background: rgba(var(--secondary-color-rgb), 0.15);
              border-color: rgba(var(--secondary-color-rgb), 0.4);
            }
          }
        }

        .service-tag {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.7rem;
    font-weight: 600;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
        }
      }
    }
  }

  // 专利日期区域
  .patent-publish-date {
    .date-value {
      color: var(--tech-primary);
      font-size: 0.9rem;
      font-weight: 500;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
      padding: 8px 16px;
      background: rgba(var(--primary-color-rgb), 0.1);
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '📅';
        font-size: 0.8rem;
      }

      &:hover {
        background: rgba(var(--primary-color-rgb), 0.15);
        border-color: rgba(var(--primary-color-rgb), 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(var(--primary-color-rgb), 0.25);
      }

      .dark-mode & {
        color: var(--tech-secondary);
        background: rgba(var(--secondary-color-rgb), 0.1);
        border-color: rgba(var(--secondary-color-rgb), 0.2);

        &:hover {
          background: rgba(var(--secondary-color-rgb), 0.15);
          border-color: rgba(var(--secondary-color-rgb), 0.4);
        }
      }
    }
  }

  .translated-tag {
    background: linear-gradient(135deg, var(--tech-accent), var(--tech-pink));
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    box-shadow: 0 2px 12px rgba(var(--accent-color-rgb), 0.3);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &::before {
      content: '🌍';
      margin-right: 6px;
      font-size: 0.8rem;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(var(--accent-color-rgb), 0.4);
    }
  }

  .card-title,
  .paper-title,
  .patent-title,
  .book-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.4;
    color: var(--dark-text);
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    .dark-mode & {
      color: #f7fafc;
    }

    &:hover {
      color: var(--tech-primary);
      transform: translateX(4px);

      .dark-mode & {
        color: var(--tech-secondary);
      }

      &::after {
        width: 60px;
        opacity: 1;
      }
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
      border-radius: 2px;
      opacity: 0.6;
      transition: all 0.3s ease;
    }
  }

  .patent-meta,
  .book-meta {
    margin-bottom: 1.5rem;
    border-radius: 12px;

    .dark-mode & {
      background: rgba(0, 184, 169, 0.05);
      border-color: rgba(0, 184, 169, 0.2);
    }

    .meta-item {
      display: flex;
      gap: 0.8rem;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .meta-label {
        color: var(--primary-color);
        font-weight: 700;
        min-width: fit-content;
        font-size: 0.9rem;
      }

      .meta-value {
        color: var(--dark-text);
        flex: 1;
        font-weight: 500;

        .dark-mode & {
          color: #e2e8f0;
        }
      }
    }
  }

  .card-content {
    margin-bottom: 2rem;
    background: rgba(248, 250, 252, 0.6);
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 3px solid var(--primary-color);

    .dark-mode & {
      background: rgba(45, 55, 72, 0.3);
    }

    p {
      color: var(--dark-text);
      line-height: 1.7;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
      font-size: 0.95rem;

      .dark-mode & {
        color: #cbd5e0;
      }
    }
  }

}

// Empty State
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(0, 184, 169, 0.02);
  border: 2px dashed rgba(0, 184, 169, 0.2);
  border-radius: 16px;

  .dark-mode & {
    background: rgba(45, 55, 72, 0.5);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  p {
    color: #6b7280;
    font-size: 1.1rem;
    font-weight: 500;

    .dark-mode & {
      color: #9ca3af;
    }
  }
}

// Animations
@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.6;
  }
}

// 使用 animate.css 提供的动画，无需自定义 keyframes

// spin 动画已在全局样式中定义

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.7;
  }
}

@keyframes titleGlow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(14, 165, 233, 0.4),
      0 0 40px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow:
      0 0 30px rgba(14, 165, 233, 0.6),
      0 0 60px rgba(59, 130, 246, 0.3);
  }
}

@keyframes titleUnderline {
  0%, 100% {
    width: 80px;
    opacity: 0.8;
  }
  50% {
    width: 100px;
    opacity: 1;
  }
}

@keyframes cardBorderPulse {
  0%, 100% {
    background: linear-gradient(180deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
    opacity: 1;
  }
  50% {
    background: linear-gradient(180deg, var(--tech-secondary), var(--tech-accent), var(--tech-pink));
    opacity: 0.8;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    padding: 6rem 0 4rem;

    .hero-content {
      padding: 0 1rem;

      .page-title {
        font-size: 2.5rem;
      }

      .stats-cards {
        gap: 1.5rem;
        flex-direction: column;
        align-items: center;

        .stat-card {
          min-width: 250px;
        }
      }
    }
  }

  .content-section {
    padding: 3rem 0;

    .container {
      padding: 0 1rem;
    }
  }

  .content-card {
    padding: 1.5rem;
  }

  .research-content .research-module .module-header .module-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .hero-section .hero-content .page-title {
    font-size: 2rem;
  }

  .stats-cards .stat-card {
    min-width: 200px;
    padding: 1.5rem 1rem;
  }
}

// 与列表页面样式保持一致
.content-card {
  // Paper Item 样式
  &.paper-item {
    cursor: pointer;
    position: relative;

    .paper-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .paper-date {
        color: var(--primary-color);
        font-weight: 600;
        font-size: 0.9rem;
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

    .paper-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 15px;
      line-height: 1.4;
      color: var(--dark-text);

      .dark-mode & {
        color: #f7fafc;
      }
    }

    .paper-excerpt {
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

  // Patent Item 样式
  &.patent-item {
    cursor: pointer;
    .patent-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
      }

      .patent-badges {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;

        .patent-number {
          background: rgba(var(--primary-color-rgb), 0.12);
          color: var(--primary-color);
          padding: 6px 12px;
          border-radius: 16px;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(var(--primary-color-rgb), 0.2);
          letter-spacing: 0.5px;

          .dark-mode & {
            color: #4fd1c7;
            border-color: rgba(79, 209, 199, 0.2);
          }
        }

        .service-tag {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
        }
      }

      .patent-publish-date {
        display: flex;
        align-items: center;
        gap: 6px;

        @media (max-width: 768px) {
          align-self: flex-start;
        }

        .date-value {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.9rem;
        }
      }
    }

    .patent-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 15px;
      line-height: 1.4;
      color: var(--dark-text);

      .dark-mode & {
        color: #f7fafc;
      }
    }

    .patent-applicants {
      margin-bottom: 15px;

      .applicants-label {
        color: var(--primary-color);
        font-weight: 600;
        margin-right: 8px;
        font-size: 0.9rem;
      }

      .applicants-name {
        color: var(--dark-text);
        font-weight: 500;

        .dark-mode & {
          color: #e2e8f0;
        }
      }
    }

    .patent-excerpt {
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

  // Book Item 样式
  &.book-item {
    cursor: pointer;
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
}
</style>
