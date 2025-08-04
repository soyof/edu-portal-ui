<template>
  <div class="notice-detail-page">
    <!-- 面包屑导航 -->
    <nav class="breadcrumb-nav">
      <div class="container">
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
      </div>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="container">
        <el-skeleton :rows="10" animated />
      </div>
    </div>

    <!-- 通知详情 -->
    <div v-else-if="notice" class="notice-content">
      <div class="container">
        <!-- 通知头部 -->
        <div class="notice-header">
          <div class="header-main">
            <h1 class="notice-title">
              {{ getCurrentLanguageText(notice, 'title') }}
            </h1>
            <div class="notice-badges">
              <span class="importance-badge" :class="`importance-${notice.importance}`">
                <el-icon v-if="notice.importance === '3003'">
                  <Warning />
                </el-icon>
                <el-icon v-else-if="notice.importance === '3002'">
                  <InfoFilled />
                </el-icon>
                <el-icon v-else>
                  <Document />
                </el-icon>
                {{ getImportanceLabel(notice.importance) }}
              </span>
              <span class="type-badge" :class="`type-${notice.noticeType}`">
                <el-icon v-if="notice.noticeType === '2001'">
                  <Link />
                </el-icon>
                <el-icon v-else>
                  <Document />
                </el-icon>
                {{ getTypeLabel(notice.noticeType) }}
              </span>
            </div>
          </div>
          <div class="notice-meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ $t('notices.publishTime') }}: {{ formatDate(notice.publishTimes) }}</span>
            </div>
          </div>
        </div>

        <!-- 通知内容 -->
        <div class="notice-body">
          <!-- 超链接类型 -->
          <div v-if="notice.noticeType === '2001'" class="link-notice">
            <div class="link-info">
              <el-icon class="link-icon"><Link /></el-icon>
              <div class="link-content">
                <p class="link-description">{{ $t('notices.linkDescription') }}</p>
                <el-button
                  type="primary"
                  size="large"
                  class="link-button"
                  @click="openExternalLink"
                >
                  <el-icon><ArrowRight /></el-icon>
                  {{ $t('notices.openLink') }}
                </el-button>
              </div>
            </div>
            <div class="link-url">
              <label>{{ $t('notices.linkUrl') }}:</label>
              <a :href="notice.linkUrl" target="_blank" class="url-text">
                {{ notice.linkUrl }}
              </a>
            </div>
          </div>

          <!-- 文本类型 -->
          <div v-else class="text-notice">
            <div class="content-placeholder">
              <el-icon class="placeholder-icon"><Document /></el-icon>
              <h3>{{ $t('notices.contentPlaceholder') }}</h3>
              <p>{{ $t('notices.contentPlaceholderDesc') }}</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="notice-actions">
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            {{ $t('global.back') }}
          </el-button>
          <el-button
            v-if="notice.noticeType === '2001'"
            type="primary"
            size="large"
            @click="openExternalLink"
          >
            <el-icon><Link /></el-icon>
            {{ $t('notices.visitLink') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <div class="container">
        <el-result
          icon="warning"
          :title="$t('notices.noticeNotFound')"
          :subTitle="$t('notices.noticeNotFoundDesc')"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">
              {{ $t('global.back') }}
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Warning,
  InfoFilled,
  Document,
  Link,
  Calendar,
  ArrowRight,
  ArrowLeft
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

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
const router = useRouter()
const { t } = useI18n()
const { getCurrentLanguageText } = useLanguageText()

// 响应式数据
const notice = ref<NoticeDetailResponse | null>(null)
const loading = ref(true)

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
  const date = new Date(dateString)
  return date.toLocaleDateString()
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

// 打开外部链接
const openExternalLink = () => {
  if (notice.value?.linkUrl) {
    window.open(notice.value.linkUrl, '_blank')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 生命周期
onMounted(() => {
  fetchNoticeDetail()
})
</script>

<style lang="less" scoped>
.notice-detail-page {
  min-height: 100vh;
  background: var(--light-background);

  .dark-mode & {
    background: var(--dark-background);
  }
}

.breadcrumb-nav {
  background: white;
  border-bottom: 1px solid #e2e8f0;

  .dark-mode & {
    background: var(--dark-surface);
    border-bottom-color: #475569;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 20px;
  }

  .breadcrumb {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 8px;
    align-items: center;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;

    &:not(:last-child)::after {
      content: '/';
      margin: 0 8px;
      color: var(--text-color-secondary);
    }

    &.active {
      color: var(--text-color-secondary);
    }
  }

  .breadcrumb-link {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: var(--accent-color);
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-container {
  padding: 40px 0;
}

.notice-content {
  padding: 40px 0 60px;
}

.notice-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;

  .dark-mode & {
    background: var(--dark-surface);
    border-color: #475569;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .header-main {
    margin-bottom: 1.5rem;

    .notice-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-color-primary);
      margin: 0 0 1rem 0;
      line-height: 1.3;
    }

    .notice-badges {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .notice-meta {
    border-top: 1px solid #e2e8f0;
    padding-top: 1.5rem;

    .dark-mode & {
      border-top-color: #475569;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-color-secondary);
      font-size: 0.95rem;

      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.importance-badge,
.type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.importance-badge {
  &.importance-3003 {
    background: #f56565;
  }

  &.importance-3002 {
    background: #ed8936;
  }

  &.importance-3001 {
    background: #48bb78;
  }
}

.type-badge {
  &.type-2001 {
    background: var(--primary-color);
  }

  &.type-2002 {
    background: var(--accent-color);
  }
}

.notice-body {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;

  .dark-mode & {
    background: var(--dark-surface);
    border-color: #475569;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}

.link-notice {
  .link-info {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 2rem;

    .link-icon {
      font-size: 3rem;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .link-content {
      flex: 1;

      .link-description {
        font-size: 1.1rem;
        color: var(--text-color-primary);
        margin: 0 0 1rem 0;
        line-height: 1.6;
      }

      .link-button {
        gap: 8px;
      }
    }
  }

  .link-url {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;

    .dark-mode & {
      background: #1e293b;
      border-color: #475569;
    }

    label {
      font-weight: 500;
      color: var(--text-color-secondary);
      display: block;
      margin-bottom: 0.5rem;
    }

    .url-text {
      color: var(--primary-color);
      text-decoration: none;
      word-break: break-all;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.text-notice {
  .content-placeholder {
    text-align: center;
    padding: 3rem 2rem;

    .placeholder-icon {
      font-size: 4rem;
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.5rem;
      color: var(--text-color-primary);
      margin: 0 0 1rem 0;
    }

    p {
      color: var(--text-color-secondary);
      font-size: 1rem;
      margin: 0;
      line-height: 1.6;
    }
  }
}

.notice-actions {
  display: flex;
  gap: 16px;
  justify-content: center;

  .el-button {
    gap: 8px;
  }
}

.error-container {
  padding: 60px 0;
}

// 响应式设计
@media (max-width: 768px) {
  .notice-header {
    padding: 1.5rem;

    .header-main .notice-title {
      font-size: 1.5rem;
    }
  }

  .notice-body {
    padding: 1.5rem;
  }

  .link-notice .link-info {
    flex-direction: column;
    text-align: center;
    gap: 16px;

    .link-icon {
      font-size: 2.5rem;
    }
  }

  .notice-actions {
    flex-direction: column;
    align-items: center;

    .el-button {
      width: 100%;
      max-width: 300px;
    }
  }
}
</style>
