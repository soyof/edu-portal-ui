<template>
  <div class="dynamic-detail-page">
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
          <!-- Breadcrumb Navigation -->
          <nav class="breadcrumb-nav">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/news" class="breadcrumb-link">
                  {{ $t('nav.news') }}
                </router-link>
              </li>
              <li class="breadcrumb-item active">
                {{ $t('news.dynamicDetail') }}
              </li>
            </ol>
          </nav>

          <div v-if="dynamic" class="hero-meta">
            <div class="meta-badges">
              <span class="dynamic-type-badge" :class="getTypeClass(dynamic.dynamicType)">
                {{ getTypeText(dynamic.dynamicType) }}
              </span>
              <span v-if="dynamic.publishTimes" class="publish-date">
                {{ formatDate(dynamic.publishTimes, 'YYYY-MM-DD') }}
              </span>
            </div>
            <h1 class="hero-title">{{ currentTitle }}</h1>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-section">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ElIcon class="loading-icon">
            <Loading />
          </ElIcon>
          <p>{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-content">
            <ElIcon class="error-icon">
              <Document />
            </ElIcon>
            <h3>{{ $t('news.dynamicNotFound') }}</h3>
            <p>{{ error }}</p>
            <ElButton type="primary" @click="$router.go(-1)">
              {{ $t('common.goBack') }}
            </ElButton>
          </div>
        </div>

        <!-- Dynamic Detail Content -->
        <div v-else-if="dynamic" class="dynamic-detail">
          <!-- Dynamic Content -->
          <div v-if="currentContent" class="content-section">
            <div class="content-wrapper">
              <div class="html-content" v-html="currentContent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElIcon, ElButton } from 'element-plus'
import { Loading, Document } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/utils'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

// 动态响应数据接口
export interface DynamicResponse {
  id: number // 主键ID
  title: string // 中文标题
  titleEn?: string // 英文标题
  dynamicType: string // 动态类型: 6001(科研动态), 6002(新闻动态)
  content?: string // 中文内容
  contentEn?: string // 英文内容
  publishTimes?: string // 发布时间
}

// 字典项接口
export interface DictItem {
  dictId: string // 字典ID
  dictType: string // 字典类型
  dictTypeName: string // 字典类型名称
  dictValue: string // 字典值
  dictValueEn?: string // 字典值英文
  remark?: string // 备注
  sortOrder: number // 排序
  createdTimes: string // 创建时间
  updatedTimes: string // 更新时间
}

const route = useRoute()
const { t } = useI18n()
const { getCurrentLanguageText } = useLanguageText()

const dynamic = ref<DynamicResponse | null>(null)
const dynamicTypes = ref<DictItem[]>([])
const loading = ref(true)
const error = ref('')

// 计算属性
const currentTitle = computed(() => {
  if (!dynamic.value) return ''
  return getCurrentLanguageText(dynamic.value, 'title')
})

const currentContent = computed(() => {
  if (!dynamic.value) return ''
  return getCurrentLanguageText(dynamic.value, 'content')
})

// 获取动态类型文本
const getTypeText = (typeId: string): string => {
  const type = dynamicTypes.value.find(t => t.dictId === typeId)
  if (!type) return t('news.unknown')

  return getCurrentLanguageText(type, 'dictValue')
}

// 获取动态类型样式类
const getTypeClass = (typeId: string): string => {
  switch (typeId) {
    case '6001': return 'research-type'
    case '6002': return 'news-type'
    default: return 'default-type'
  }
}

// 获取动态类型字典
const fetchDynamicTypes = (): Promise<void> => {
  return service.get('/api/dict/dynamic_type')
    .then((result: any) => {
      dynamicTypes.value = result.data || []
    })
    .catch((err: any) => {
      console.error('Failed to load dynamic types:', err)
    })
}

// 获取动态详情
const fetchDynamicDetail = (): Promise<void> => {
  const id = route.params.id as string
  if (!id) {
    error.value = t('news.invalidId')
    return Promise.resolve()
  }

  return service.get(`/api/dynamic/${id}`)
    .then((result: any) => {
      if (result) {
        dynamic.value = result || {}
      } else {
        error.value = t('news.dynamicNotFound')
      }
    })
    .catch((err: any) => {
      console.error('Failed to load dynamic detail:', err)
      error.value = t('news.loadError')
    })
}

// 页面初始化
onMounted(() => {
  Promise.all([
    fetchDynamicTypes(),
    fetchDynamicDetail()
  ]).finally(() => {
    loading.value = false
  })
})
</script>

<style lang="less" scoped>
.dynamic-detail-page {
  min-height: 100vh;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

// Hero Section
.hero-section {
  background: linear-gradient(135deg,
    rgba(14, 165, 233, 0.08),
    rgba(59, 130, 246, 0.06),
    rgba(139, 92, 246, 0.04),
    rgba(236, 72, 153, 0.02));
  padding: 60px 0 80px;
  position: relative;
  overflow: hidden;
  min-height: 300px;

  .dark-mode & {
    background: linear-gradient(135deg,
      rgba(15, 23, 42, 0.9),
      rgba(30, 41, 59, 0.8),
      rgba(51, 65, 85, 0.7));
  }

  // 科技风背景装饰
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
    animation: heroParticleFloat 10s ease-in-out infinite;
    pointer-events: none;
  }

  // 网格背景
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(14, 165, 233, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(14, 165, 233, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.5;
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
      width: 4px;
      height: 4px;
      background: linear-gradient(45deg, var(--tech-primary), var(--tech-accent));
      border-radius: 50%;
      opacity: 0.4;
      animation: detailFloat 5s ease-in-out infinite;
      box-shadow: 0 0 6px rgba(14, 165, 233, 0.3);

      &:nth-child(even) {
        background: linear-gradient(45deg, var(--tech-secondary), var(--tech-pink));
        animation-direction: reverse;
        animation-duration: 7s;
      }

      &:nth-child(3n) {
        width: 3px;
        height: 3px;
        opacity: 0.6;
        animation-duration: 6s;
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
  }

  .hero-meta {
    margin-top: 2rem;

    .meta-badges {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
      }
    }

    .hero-title {
      font-size: 2.8rem;
      font-weight: 800;
      background: linear-gradient(135deg,
        var(--tech-primary),
        var(--tech-secondary),
        var(--tech-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
      margin: 0;
      position: relative;

      .dark-mode & {
        background: linear-gradient(135deg,
          var(--tech-secondary),
          var(--tech-accent),
          var(--tech-pink));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      // 标题装饰线
      &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 120px;
        height: 4px;
        background: linear-gradient(90deg,
          var(--tech-primary),
          var(--tech-secondary),
          var(--tech-accent));
        border-radius: 2px;
        opacity: 0.8;
      }

      @media (max-width: 768px) {
        font-size: 2.2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.8rem;
      }
    }
  }
}

.detail-section {
  padding: 60px 0;
}

// Breadcrumb Navigation
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
        color: var(--tech-primary);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;

        .dark-mode & {
          color: var(--tech-secondary);
        }

        &:hover {
          background: rgba(var(--primary-color-rgb), 0.1);
          color: var(--tech-secondary);

          .dark-mode & {
            background: rgba(var(--secondary-color-rgb), 0.1);
            color: var(--tech-accent);
          }
        }
      }

      &.active {
        color: var(--text-secondary);
        font-weight: 500;

        .dark-mode & {
          color: #94a3b8;
        }
      }
    }
  }
}

// Loading & Error States
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .loading-icon, .error-icon {
    font-size: 3rem;
    color: #0ea5e9;
    margin-bottom: 20px;
  }

  .error-icon {
    color: #ef4444;
  }

  p {
    font-size: 1.1rem;
    color: #64748b;
    margin: 0;

    .dark-mode & {
      color: #94a3b8;
    }
  }

  .error-content {
    h3 {
      font-size: 1.5rem;
      color: #374151;
      margin-bottom: 12px;

      .dark-mode & {
        color: #d1d5db;
      }
    }
  }
}

// Dynamic Detail
.dynamic-detail {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.15);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 12px 48px rgba(var(--primary-color-rgb), 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(var(--secondary-color-rgb), 0.2);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  }

  // 顶部装饰边框
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--tech-primary) 20%,
      var(--tech-secondary) 40%,
      var(--tech-accent) 60%,
      var(--tech-pink) 80%,
      transparent 100%);
    border-radius: 24px 24px 0 0;
    animation: borderGlow 3s ease-in-out infinite;
  }

  // 左侧装饰边框
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg,
      var(--tech-primary),
      var(--tech-secondary),
      var(--tech-accent));
    border-radius: 24px 0 0 24px;
    opacity: 0.6;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(var(--primary-color-rgb), 0.15);
    border-color: rgba(var(--primary-color-rgb), 0.25);

    .dark-mode & {
      box-shadow: 0 20px 60px rgba(var(--secondary-color-rgb), 0.2);
      border-color: rgba(var(--secondary-color-rgb), 0.3);
    }
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
    margin: 0 16px;
    border-radius: 20px;
  }
}

// Dynamic Header
.dynamic-header {
  margin-bottom: 32px;

  .meta-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .dynamic-type-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: default;

    // 通用hover效果
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    // 科研动态
    &.research-type {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.15));
      color: #0ea5e9;
      border: 2px solid rgba(14, 165, 233, 0.3);
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);

      &::before {
        content: '🔬';
        margin-right: 8px;
        font-size: 1rem;
      }

      &:hover {
        border-color: rgba(14, 165, 233, 0.5);
        box-shadow: 0 6px 25px rgba(14, 165, 233, 0.3);
      }
    }

    // 新闻动态
    &.news-type {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15));
      color: #8b5cf6;
      border: 2px solid rgba(139, 92, 246, 0.3);
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);

      &::before {
        content: '📰';
        margin-right: 8px;
        font-size: 1rem;
      }

      &:hover {
        border-color: rgba(139, 92, 246, 0.5);
        box-shadow: 0 6px 25px rgba(139, 92, 246, 0.3);
      }
    }

    // 默认类型
    &.default-type {
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(156, 163, 175, 0.15));
      color: #6b7280;
      border: 2px solid rgba(107, 114, 128, 0.3);
      box-shadow: 0 4px 15px rgba(107, 114, 128, 0.2);

      &::before {
        content: '📋';
        margin-right: 8px;
        font-size: 1rem;
      }

      &:hover {
        border-color: rgba(107, 114, 128, 0.5);
        box-shadow: 0 6px 25px rgba(107, 114, 128, 0.3);
      }
    }
  }

  .publish-date {
    color: var(--tech-primary);
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
    padding: 10px 20px;
    background: rgba(var(--primary-color-rgb), 0.12);
    border-radius: 25px;
    border: 2px solid rgba(var(--primary-color-rgb), 0.25);
    box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.15);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: default;

    &::before {
      content: '📅';
      margin-right: 8px;
      font-size: 0.9rem;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 25px;
      padding: 2px;
      background: linear-gradient(45deg, var(--tech-primary), var(--tech-secondary), var(--tech-accent));
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(var(--primary-color-rgb), 0.25);
      border-color: rgba(var(--primary-color-rgb), 0.4);

      &::after {
        opacity: 1;
      }
    }

    .dark-mode & {
      color: var(--tech-secondary);
      background: rgba(var(--secondary-color-rgb), 0.12);
      border-color: rgba(var(--secondary-color-rgb), 0.25);
      box-shadow: 0 4px 15px rgba(var(--secondary-color-rgb), 0.15);

      &:hover {
        box-shadow: 0 6px 25px rgba(var(--secondary-color-rgb), 0.25);
        border-color: rgba(var(--secondary-color-rgb), 0.4);
      }
    }
  }

  .dynamic-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.3;
    margin: 0;

    .dark-mode & {
      color: #f8fafc;
    }

    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
}

// Dynamic Content
.content-section {
  margin-bottom: 0;

  .content-wrapper {

    @media (max-width: 768px) {
      padding: 24px;
      border-radius: 16px;
    }
  }
}

// Animations
@keyframes heroParticleFloat {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-15px) scale(1.1);
  }
}

@keyframes detailFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  33% {
    transform: translateY(-10px) rotate(120deg);
    opacity: 0.7;
  }
  66% {
    transform: translateY(-5px) rotate(240deg);
    opacity: 0.6;
  }
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.8;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--tech-primary) 20%,
      var(--tech-secondary) 40%,
      var(--tech-accent) 60%,
      var(--tech-pink) 80%,
      transparent 100%);
  }
  50% {
    opacity: 1;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--tech-secondary) 20%,
      var(--tech-accent) 40%,
      var(--tech-pink) 60%,
      var(--tech-primary) 80%,
      transparent 100%);
  }
}
</style>
