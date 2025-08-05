<template>
  <div class="notice-detail-page">
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
                <router-link to="/notices" class="breadcrumb-link">
                  {{ $t('notices.title') }}
                </router-link>
              </li>
              <li class="breadcrumb-item active">
                {{ $t('notices.noticeDetail') }}
              </li>
            </ol>
          </nav>

          <div v-if="notice" class="hero-meta">
            <h1 class="hero-title">{{ getCurrentLanguageText(notice, 'title') }}</h1>
            <div class="meta-badges">
              <span class="importance-badge" :class="`importance-${notice.importance}`">
                {{ getImportanceLabel(notice.importance) }}
              </span>
              <span class="type-badge" :class="`type-${notice.noticeType}`">
                {{ getTypeLabel(notice.noticeType) }}
              </span>
              <span v-if="notice.publishTimes" class="publish-date">
                {{ formatDate(notice.publishTimes) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-section">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <p>{{ $t('global.loading') }}</p>
        </div>

        <!-- Notice Detail Content -->
        <div v-else-if="notice" class="notice-detail">
          <!-- 通知内容 -->
          <div class="notice-body">
            <div class="text-notice">
              <!-- 检查是否有HTML内容 -->
              <div v-if="hasContent" class="html-content" v-html="getCurrentLanguageText(notice, 'content')"></div>

              <!-- 内容为空时的显示 -->
              <div v-else class="content-placeholder animate__animated animate__fadeIn">
                <div class="placeholder-content">
                  <el-icon class="placeholder-icon">
                    <Document />
                  </el-icon>
                  <p>{{ $t('common.noData') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="error-state">
          <div class="error-content">
            <el-icon class="error-icon">
              <Document />
            </el-icon>
            <h3>{{ $t('notices.noticeNotFound') }}</h3>
            <p>{{ $t('notices.noticeNotFoundDesc') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Loading,
  Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'
import { formatDate as utilFormatDate } from '@/utils/utils'

// 通知详情类型定义
interface NoticeDetailResponse {
  id: number
  title: string
  titleEn?: string
  noticeType: string
  importance: string
  linkUrl?: string
  publishTimes?: string
  content?: string // 如果后端提供通知内容
  contentEn?: string
}

const route = useRoute()
const { t } = useI18n()
const { getCurrentLanguageText } = useLanguageText()

// 响应式数据
const notice = ref<NoticeDetailResponse | null>(null)
const loading = ref(true)

// 检查是否有实际内容的计算属性
const hasContent = computed(() => {
  if (!notice.value) return false

  const content = getCurrentLanguageText(notice.value, 'content')
  if (!content) return false

  // 移除HTML标签后检查是否有实际文本内容
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  return textContent.length > 10 // 至少10个字符才认为有内容
})

// 获取重要程度标签
const getImportanceLabel = (importance: string): string => {
  switch (importance) {
    case '3001': return t('notices.normal')
    case '3002': return t('notices.important')
    case '3003': return t('notices.urgent')
    default: return t('notices.normal')
  }
}

// 获取类型标签
const getTypeLabel = (type: string): string => {
  switch (type) {
    case '2001': return t('notices.linkType')
    case '2002': return t('notices.textType')
    default: return t('notices.textType')
  }
}

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  return utilFormatDate(dateString, 'YYYY-MM-DD')
}

// 获取通知详情
const fetchNoticeDetail = () => {
  loading.value = true

  service.get<NoticeDetailResponse>(`/api/notices/${route.params.id}`)
    .then(response => {
      notice.value = response as any
    })
    .catch(error => {
      console.error('获取通知详情失败:', error)
      notice.value = null
      ElMessage.error(t('notices.fetchError'))
    })
    .finally(() => {
      loading.value = false
    })
}

// 生命周期
onMounted(() => {
  fetchNoticeDetail()
})
</script>

<style lang="less" scoped>
.notice-detail-page {
  min-height: 100vh;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

// Hero Section - 参考动态详情页面风格
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
      background: linear-gradient(45deg, rgba(14, 165, 233, 0.6), rgba(59, 130, 246, 0.4));
      border-radius: 50%;
      opacity: 0.4;
      animation: detailFloat 5s ease-in-out infinite;
      box-shadow: 0 0 6px rgba(14, 165, 233, 0.3);

      &:nth-child(even) {
        background: linear-gradient(45deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.4));
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

    .hero-title {
      font-size: 2.8rem;
      font-weight: 800;
      background: linear-gradient(135deg,
        rgba(14, 165, 233, 1),
        rgba(59, 130, 246, 1),
        rgba(139, 92, 246, 1));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
      margin: 0 0 1.5rem 0;
      position: relative;

      .dark-mode & {
        background: linear-gradient(135deg,
          rgba(59, 130, 246, 1),
          rgba(139, 92, 246, 1),
          rgba(236, 72, 153, 1));
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
          rgba(14, 165, 233, 0.8),
          rgba(59, 130, 246, 0.8),
          rgba(139, 92, 246, 0.8));
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

    .meta-badges {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
      }
    }
  }
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
        color: #64748b;
        font-weight: 500;
      }

      .breadcrumb-link {
        color: rgba(14, 165, 233, 1);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;

        .dark-mode & {
          color: rgba(59, 130, 246, 1);
        }

        &:hover {
          background: rgba(14, 165, 233, 0.1);
          color: rgba(59, 130, 246, 1);

          .dark-mode & {
            background: rgba(59, 130, 246, 0.1);
            color: rgba(139, 92, 246, 1);
          }
        }
      }

      &.active {
        color: #64748b;
        font-weight: 500;

        .dark-mode & {
          color: #94a3b8;
        }
      }
    }
  }
}

// Badge样式
.importance-badge,
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

.importance-badge {
  &.importance-3003 {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15));
    color: #ef4444;
    border: 2px solid rgba(239, 68, 68, 0.3);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);

    &::before {
      content: '🚨';
      font-size: 0.8rem;
    }

    &:hover {
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow: 0 6px 25px rgba(239, 68, 68, 0.3);
    }
  }

  &.importance-3002 {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15));
    color: #f59e0b;
    border: 2px solid rgba(245, 158, 11, 0.3);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);

    &::before {
      content: '⚠️';
      font-size: 0.8rem;
    }

    &:hover {
      border-color: rgba(245, 158, 11, 0.5);
      box-shadow: 0 6px 25px rgba(245, 158, 11, 0.3);
    }
  }

  &.importance-3001 {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15));
    color: #10b981;
    border: 2px solid rgba(16, 185, 129, 0.3);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);

    &::before {
      content: '📋';
      font-size: 0.8rem;
    }

    &:hover {
      border-color: rgba(16, 185, 129, 0.5);
      box-shadow: 0 6px 25px rgba(16, 185, 129, 0.3);
    }
  }
}

.type-badge {
  &.type-2001 {
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(59, 130, 246, 0.15));
    color: #0ea5e9;
    border: 2px solid rgba(14, 165, 233, 0.3);
    box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);

    &::before {
      content: '🔗';
      font-size: 0.8rem;
    }

    &:hover {
      border-color: rgba(14, 165, 233, 0.5);
      box-shadow: 0 6px 25px rgba(14, 165, 233, 0.3);
    }
  }

  &.type-2002 {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.15));
    color: #8b5cf6;
    border: 2px solid rgba(139, 92, 246, 0.3);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);

    &::before {
      content: '📄';
      font-size: 0.8rem;
    }

    &:hover {
      border-color: rgba(139, 92, 246, 0.5);
      box-shadow: 0 6px 25px rgba(139, 92, 246, 0.3);
    }
  }
}

.publish-date {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.1), rgba(71, 85, 105, 0.1));
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;

  .dark-mode & {
    color: #94a3b8;
    border-color: rgba(148, 163, 184, 0.2);
  }

  &::before {
    content: '📅';
    margin-right: 6px;
    font-size: 0.75rem;
  }
}

.detail-section {
  padding: 28px 0;
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

// Notice Detail
.notice-detail {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  min-height: 200px;
  transition: all 0.3s ease;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin: 0 16px;
    border-radius: 12px;
  }
}

// Notice Body样式
.notice-body {
  // 主体容器样式
  position: relative;
}

// Text Notice样式
.text-notice {
  .content-placeholder {
    text-align: center;
    padding: 4rem 2rem;

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .placeholder-icon {
      font-size: 3rem;
      color: #94a3b8;
      opacity: 0.6;

      .dark-mode & {
        color: #64748b;
      }
    }

    p {
      color: #64748b;
      font-size: 1rem;
      margin: 0;

      .dark-mode & {
        color: #94a3b8;
      }
    }

  }
}

// 动画关键帧
@keyframes heroParticleFloat {
  0%, 100% {
    opacity: 0.6;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-15px) scale(1.05);
  }
}

@keyframes detailFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  25% {
    transform: translateY(-8px) rotate(45deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px) rotate(90deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-8px) rotate(135deg);
    opacity: 0.6;
  }
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.8;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.02);
  }
}
</style>
