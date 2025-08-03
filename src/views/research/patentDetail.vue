<template>
  <div class="research-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="modern-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-dot"></div>
      </div>
      <p class="loading-text">{{ $t('research.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3 class="empty-title">{{ $t('research.patentNotFound') }}</h3>
      <p class="empty-text">{{ $t('research.patentNotFoundDesc') }}</p>
      <el-button type="primary" @click="goBack">
        {{ $t('global.back') }}
      </el-button>
    </div>

    <!-- Patent Detail Content -->
    <div v-else-if="patent" class="paper-detail-content">
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
            <!-- Breadcrumb Navigation -->
            <nav class="breadcrumb-nav">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <router-link to="/research" class="breadcrumb-link">
                    {{ $t('research.title') }}
                  </router-link>
                </li>
                <li class="breadcrumb-item">
                  <router-link to="/research/patents" class="breadcrumb-link">
                    {{ $t('research.patents') }}
                  </router-link>
                </li>
                <li class="breadcrumb-item active">
                  {{ $t('research.patentDetail') }}
                </li>
              </ol>
            </nav>

            <!-- Patent Title -->
            <h1 class="page-title">
              <span class="title-gradient">{{ currentTitle }}</span>
            </h1>

            <!-- Patent Meta -->
            <div class="paper-meta-section">
              <div class="meta-actions">
                <span
                  v-if="patent.patentPublishDate"
                  class="publish-date-badge"
                >
                  {{ formatDate(patent.patentPublishDate) }}
                </span>
                <span
                  v-if="patent.applicationNum"
                  class="application-num-badge"
                >
                  {{ patent.applicationNum }}
                </span>
                <span
                  v-if="patent.isServicePatent === '1'"
                  class="service-patent-badge"
                >
                  {{ $t('research.servicePatent') }}
                </span>
              </div>
            </div>

            <!-- Additional Patent Info -->
            <div class="patent-info-section">
              <div class="info-grid">
                <div v-if="patent.applicants" class="info-item">
                  <label class="info-label">{{ $t('research.applicants') }}:</label>
                  <span class="info-value">{{ patent.applicants }}</span>
                </div>
                <div v-if="patent.applicationDate" class="info-item">
                  <label class="info-label">{{ $t('research.applicationDate') }}:</label>
                  <span class="info-value">{{ formatDate(patent.applicationDate) }}</span>
                </div>
                <div v-if="patent.authorizationDate" class="info-item">
                  <label class="info-label">{{ $t('research.authorizationDate') }}:</label>
                  <span class="info-value">{{ formatDate(patent.authorizationDate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Section -->
      <section class="content-section">
        <div class="container">
          <div class="research-content">
            <!-- Abstract Module -->
            <div v-if="currentAbstract" class="research-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('research.abstract') }}</span>
                </h2>
              </div>
              <div class="content-card abstract-content enhanced-content">
                <div class="content-wrapper">
                  <div class="content-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="html-content enhanced-text" v-html="currentAbstract"></div>
                </div>
              </div>
            </div>

            <!-- Content Module -->
            <div v-if="currentContent" class="research-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('research.content') }}</span>
                </h2>
              </div>
              <div class="content-card main-content-text enhanced-content">
                <div class="content-wrapper">
                  <div class="content-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M19 14l-7 7-7-7m0-8l7-7 7 7M12 3v18"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="html-content enhanced-text" v-html="currentContent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import service from '@/utils/services'

// 专利响应接口
export interface PatentResponse {
  id: number // 主键ID
  title: string // 专利名称（中文）
  titleEn?: string // 专利名称（英文）
  patentPublishDate?: string // 专利发布时间（官方公开日）
  applicants: string // 申请人（多个用逗号分隔）
  applicationNum: string // 申请号
  isServicePatent: string // 是否职务专利：0(否),1(是)
  applicationDate: string // 申请日期
  authorizationDate?: string // 授权日期
  abstract?: string // 摘要（中文）
  abstractEn?: string // 摘要（英文）
  content?: string // 内容（中文）
  contentEn?: string // 内容（英文）
}

// 获取专利详情的API方法
const getPatentDetail = (id: string): Promise<PatentResponse> => {
  return service.get<PatentResponse>(`/api/research/patents/${id}`) as unknown as Promise<PatentResponse>
}

// 路由和国际化
const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const patent = ref<PatentResponse | null>(null)

// 计算属性
const currentTitle = computed(() => {
  if (!patent.value) return ''
  return locale.value === 'en' && patent.value.titleEn ? patent.value.titleEn : patent.value.title
})

const currentAbstract = computed(() => {
  if (!patent.value) return ''
  return locale.value === 'en' && patent.value.abstractEn ? patent.value.abstractEn : patent.value.abstract
})

const currentContent = computed(() => {
  if (!patent.value) return ''
  return locale.value === 'en' && patent.value.contentEn ? patent.value.contentEn : patent.value.content
})

// 方法
const fetchPatentDetail = async() => {
  try {
    loading.value = true
    error.value = false
    const id = route.params.id as string

    if (!id) {
      throw new Error('专利ID不存在')
    }

    const response = await getPatentDetail(id)
    patent.value = response
  } catch (err) {
    console.error('获取专利详情失败:', err)
    error.value = true
    ElMessage.error('获取专利详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (dateString: string) => {
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

// 生命周期
onMounted(() => {
  fetchPatentDetail()
})
</script>

<style lang="less" scoped>
// CSS变量定义
:root {
  --primary-color: #00b8a9;
  --accent-color: #00e0c7;
  --primary-color-rgb: 0, 184, 169;
  --text-color: #2d3748;
  --text-secondary: #718096;
  --bg-color: #ffffff;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.dark-mode {
  --text-color: #f7fafc;
  --text-secondary: #a0aec0;
  --bg-color: #1a202c;
  --card-bg: #2d3748;
  --border-color: #4a5568;
  --primary-color-rgb: 96, 165, 250;
}

// 主页面容器
.research-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--text-color);

  .modern-spinner {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: 20px;

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1.2s linear infinite;
    }

    .spinner-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  .loading-text {
    font-size: 16px;
    color: var(--text-secondary);
    margin-top: 10px;
  }
}

// 错误状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  .empty-text {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    max-width: 400px;
  }
}

// Hero区域
.hero-section {
  position: relative;
  padding: 3rem 0 2rem;
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb), 0.05) 0%,
    rgba(var(--primary-color-rgb), 0.02) 100%);
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;

    .floating-elements {
      position: relative;
      width: 100%;
      height: 100%;

      .float-element {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(var(--primary-color-rgb), 0.3);
        border-radius: 50%;
        animation: float 3s ease-in-out infinite;

        &:nth-child(even) {
          background: rgba(var(--primary-color-rgb), 0.2);
          width: 6px;
          height: 6px;
        }
      }
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    position: relative;
    z-index: 1;
  }

  .hero-content {
    .paper-meta-section {
      margin-top: 1.5rem;
      margin-bottom: 1rem;

      .meta-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;

        .publish-date-badge,
        .application-num-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: rgba(var(--text-secondary), 0.08);
          color: var(--text-secondary);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(var(--text-secondary), 0.12);
            color: var(--text-color);
          }
        }

        .service-patent-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: rgba(var(--primary-color-rgb), 0.1);
          color: var(--primary-color);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
      }
    }

    .patent-info-section {
      margin-top: 1rem;

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .info-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
          }

          .info-value {
            font-size: 0.95rem;
            color: var(--text-color);
            font-weight: 500;
          }
        }
      }
    }
  }
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

// 页面标题
.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: var(--text-color);

  .title-gradient {
    background: linear-gradient(135deg,
      var(--primary-color) 0%,
      var(--accent-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

// 内容区域
.content-section {
  padding: 3rem 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .research-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .research-module {
    .module-header {
      margin-bottom: 1.5rem;

      .module-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;

        .title-decorator {
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg,
            var(--primary-color) 0%,
            var(--accent-color) 100%);
          border-radius: 2px;
        }

        .title-text {
          color: var(--text-color);
        }
      }
    }

    .content-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 0;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%);
      }

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-4px);
        border-color: rgba(var(--primary-color-rgb), 0.3);
      }

      &.enhanced-content {
        .content-wrapper {
          padding: 1.5rem 1rem;
          position: relative;

          .content-icon {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.1;
            transition: all 0.3s ease;

            svg {
              color: white;
            }
          }

          .enhanced-text {
            padding-right: 3rem;
            position: relative;
            z-index: 1;

            &::first-letter {
              font-size: 3em;
              font-weight: 700;
              float: left;
              line-height: 0.8;
              margin: 0.1em 0.1em 0.1em 0;
              color: var(--primary-color);
              text-shadow: 2px 2px 4px rgba(var(--primary-color-rgb), 0.2);
            }
          }
        }

        &:hover {
          .content-icon {
            opacity: 0.8;
            transform: scale(1.1) rotate(5deg);
          }
        }
      }
    }
  }
}

// 动画效果
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-10px) translateX(5px); }
  50% { transform: translateY(0px) translateX(10px); }
  75% { transform: translateY(10px) translateX(5px); }
}

// 响应式设计
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0 1.5rem;

    .container {
      padding: 0 1rem;
    }

    .hero-content {
      .paper-meta-section {
        margin-top: 1rem;

        .meta-actions {
          gap: 0.75rem;
          flex-wrap: wrap;

          .publish-date-badge,
          .application-num-badge,
          .service-patent-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.6rem;
          }
        }
      }

      .patent-info-section {
        .info-grid {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
      }
    }
  }

  .page-title {
    font-size: 2rem;
  }

  .breadcrumb-nav {
    margin-bottom: 1.5rem;

    .breadcrumb {
      font-size: 0.8rem;

      .breadcrumb-item {
        &:not(:last-child)::after {
          margin: 0 0.5rem;
        }
      }
    }
  }

  .content-section {
    padding: 2rem 0;

    .container {
      padding: 0 1rem;
    }

    .research-module {
      .module-header {
        .module-title {
          font-size: 1.25rem;
        }
      }

      .content-card {
        border-radius: 12px;

        &.enhanced-content {
          .content-wrapper {
            padding: 1.5rem 1rem;

            .content-icon {
              top: 1rem;
              right: 1rem;
              width: 32px;
              height: 32px;
            }

            .enhanced-text {
              padding-right: 2.5rem;

              &::first-letter {
                font-size: 2.5em;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .breadcrumb-nav {
    .breadcrumb {
      flex-wrap: wrap;
      gap: 0.25rem;

      .breadcrumb-item {
        .breadcrumb-link {
          padding: 0.125rem 0.25rem;
        }
      }
    }
  }

  .content-section {
    .research-module {
      .content-card {
        border-radius: 8px;

        &.enhanced-content {
          .content-wrapper {
            padding: 1.25rem;

            .content-icon {
              top: 0.75rem;
              right: 0.75rem;
              width: 28px;
              height: 28px;
            }

            .enhanced-text {
              padding-right: 2rem;

              &::first-letter {
                font-size: 2em;
                margin: 0.05em 0.05em 0.05em 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>
