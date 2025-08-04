<template>
  <div class="notices-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">{{ $t('notices.title') }}</h1>
        <p class="page-subtitle">{{ $t('notices.subtitle') }}</p>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="page-content">
      <div class="container">
        <!-- 筛选器 -->
        <div class="filters-section">
          <div class="filter-group">
            <label>{{ $t('notices.importance') }}:</label>
            <el-select
              v-model="selectedImportance"
              clearable
              :placeholder="$t('notices.allImportance')"
              @change="fetchNotices"
            >
              <el-option :label="$t('notices.normal')" value="3001" />
              <el-option :label="$t('notices.important')" value="3002" />
              <el-option :label="$t('notices.urgent')" value="3003" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>{{ $t('notices.type') }}:</label>
            <el-select
              v-model="selectedType"
              clearable
              :placeholder="$t('notices.allTypes')"
              @change="fetchNotices"
            >
              <el-option :label="$t('notices.textType')" value="2002" />
              <el-option :label="$t('notices.linkType')" value="2001" />
            </el-select>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 通知列表 -->
        <div v-else-if="notices.length > 0" class="notices-list">
          <div
            v-for="notice in notices"
            :key="notice.id"
            class="notice-item"
            :class="[
              `importance-${notice.importance}`,
              `type-${notice.noticeType}`,
              { 'clickable': notice.noticeType === '2002' }
            ]"
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
                  <span class="importance-label">
                    {{ getImportanceLabel(notice.importance) }}
                  </span>
                  <span class="type-label">
                    {{ getTypeLabel(notice.noticeType) }}
                  </span>
                </div>
              </div>
              <div class="notice-footer">
                <span class="publish-time">
                  {{ formatDate(notice.publishTimes) }}
                </span>
                <el-icon v-if="notice.noticeType === '2001'" class="external-link">
                  <Link />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
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
import { Warning, InfoFilled, Document, Link } from '@element-plus/icons-vue'
import CommonPagination from '@/components/common/commonPagination.vue'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

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

// 响应式数据
const notices = ref<NoticeListResponse[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedImportance = ref('')
const selectedType = ref('')

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

// 获取通知列表
const fetchNotices = () => {
  loading.value = true

  const params: any = {
    pageNo: currentPage.value,
    pageSize: pageSize.value
  }

  if (selectedImportance.value) {
    params.importance = selectedImportance.value
  }

  if (selectedType.value) {
    params.noticeType = selectedType.value
  }

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
onMounted(() => {
  fetchNotices()
})
</script>

<style lang="less" scoped>
.notices-page {
  min-height: 100vh;
  background: var(--light-background);

  .dark-mode & {
    background: var(--dark-background);
  }
}

.page-header {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  padding: 60px 0;
  color: white;

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
  }

  .page-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }
}

.page-content {
  padding: 40px 0 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    background: var(--dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;

    label {
      font-weight: 500;
      color: var(--text-color-primary);
      white-space: nowrap;
    }

    .el-select {
      min-width: 150px;
    }
  }
}

.loading-container {
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    background: var(--dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;

  .dark-mode & {
    background: var(--dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

      .dark-mode & {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
    }
  }

  &.importance-3003 {
    border-left-color: #f56565;
  }

  &.importance-3002 {
    border-left-color: #ed8936;
  }

  &.importance-3001 {
    border-left-color: #48bb78;
  }
}

.importance-badge {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .urgent-icon {
    color: #f56565;
    font-size: 20px;
  }

  .important-icon {
    color: #ed8936;
    font-size: 20px;
  }

  .normal-icon {
    color: #48bb78;
    font-size: 20px;
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
  margin-bottom: 12px;

  .notice-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color-primary);
    margin: 0;
    line-height: 1.4;
  }

  .notice-meta {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.importance-label,
.type-label {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.importance-label {
  background: var(--primary-color);
  color: white;
}

.type-label {
  background: var(--accent-color);
  color: white;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .publish-time {
    color: var(--text-color-secondary);
    font-size: 0.9rem;
  }

  .external-link {
    color: var(--primary-color);
    font-size: 16px;
  }
}

.empty-container {
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .dark-mode & {
    background: var(--dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

// 响应式设计
@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    gap: 16px;

    .filter-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .el-select {
        width: 100%;
      }
    }
  }

  .notice-header {
    flex-direction: column;
    gap: 8px;

    .notice-meta {
      align-self: flex-start;
    }
  }

  .page-header {
    padding: 40px 0;

    .page-title {
      font-size: 2rem;
    }

    .page-subtitle {
      font-size: 1rem;
    }
  }
}
</style>

