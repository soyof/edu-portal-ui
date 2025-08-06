<template>
  <section class="announcements-section">
    <div class="container">
      <h2 class="section-title tech-line">{{ $t('home.announcements') }}</h2>
      <div class="announcements-container">
        <div v-if="loadingAnnouncements" class="loading-container">
          <div v-for="i in 5" :key="i" class="announcement-skeleton">
            <el-skeleton animated>
              <template #template>
                <div class="skeleton-announcement-item">
                  <!-- 模拟图标 -->
                  <el-skeleton-item variant="circle" style="width: 48px; height: 48px; margin-right: 16px;" />
                  <div class="skeleton-content">
                    <!-- 模拟标题 -->
                    <el-skeleton-item variant="h3" style="width: 80%; margin-bottom: 8px;" />
                    <!-- 模拟日期和类型 -->
                    <div style="display: flex; gap: 12px; align-items: center;">
                      <el-skeleton-item variant="text" style="width: 80px;" />
                      <el-skeleton-item variant="text" style="width: 60px;" />
                    </div>
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
        </div>
        <template v-else-if="announcements.length > 0">
          <AnnouncementItem
            v-for="announcement in announcements"
            :key="announcement.id"
            :announcement="announcement"
          />
        </template>
        <div v-else class="empty-announcements">
          <el-empty :description="$t('home.noAnnouncements')" />
        </div>
      </div>
      <div class="view-all-container">
        <ViewMoreButton @click="$router.push('/notices')">
          {{ $t('home.viewAllAnnouncements') }}
        </ViewMoreButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AnnouncementItem from './announcementItem.vue'
import ViewMoreButton from './viewMoreButton.vue'
import service from '@/utils/services'

// 通知类型定义
interface NoticeListResponse {
  id: number; // 通知ID
  title: string; // 通知标题
  titleEn?: string; // 通知标题（英文）
  noticeType: string; // 通知类型: 2001(超链接), 2002(文本)
  importance: string; // 重要程度: 3001(普通), 3002(重要), 3003(紧急)
  linkUrl?: string; // 超链接地址（仅类型为2001时有值）
  publishTimes?: string; // 发布时间
}

// 分页结果
interface PaginationResult<T> {
  list: T[]; // 记录列表
  total: number; // 总记录数
  pageNo: number; // 当前页码
  pageSize: number; // 每页数量
  totalPages: number; // 总页数
}

// 兼容性类型转换
interface Announcement {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'important'
  date?: string
  isNew?: boolean
  link?: string
}

const { locale } = useI18n()

// 通知数据
const announcements = ref<Announcement[]>([])
const loadingAnnouncements = ref(true)

// 转换通知数据为兼容格式
const convertNoticeToAnnouncement = (notice: NoticeListResponse): Announcement => {
  const currentLanguage = computed(() => locale.value)

  // 根据语言获取标题
  const title = currentLanguage.value === 'en' && notice.titleEn ? notice.titleEn : notice.title

  // 根据重要程度映射类型
  let type: 'info' | 'warning' | 'important' = 'info'
  switch (notice.importance) {
    case '3003':
      type = 'important'
      break
    case '3002':
      type = 'warning'
      break
    default:
      type = 'info'
  }

  return {
    id: notice.id,
    title,
    content: '', // 清空内容避免重复显示
    type,
    date: notice.publishTimes,
    isNew: false, // 可以根据发布时间判断是否为新通知
    link: notice.noticeType === '2001' ? notice.linkUrl : `/notices/${notice.id}`
  }
}

// 获取通知数据（首页只显示前5条）
const fetchAnnouncements = () => {
  loadingAnnouncements.value = true

  // 使用 service 调用通知接口，获取前5条
  service.post<PaginationResult<NoticeListResponse>>('/api/notices/list', {
    pageNo: 1,
    pageSize: 6
  })
    .then(response => {
      const data = response as any as PaginationResult<NoticeListResponse>
      const notices = data.list || []
      announcements.value = notices.map(convertNoticeToAnnouncement)
      console.log(announcements.value)
    })
    .finally(() => {
      loadingAnnouncements.value = false
    })
}

// 生命周期钩子
onMounted(() => {
  // 获取公告数据
  fetchAnnouncements()
})

// 暴露刷新方法，供父组件调用
defineExpose({
  fetchAnnouncements
})
</script>

<style lang="less" scoped>
// 公告通知区域
.announcements-section {
  position: relative;
  padding: 100px 0;

  // 添加装饰性图形元素，与最新动态保持一致
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
    left: 12%;
  }

  &::after {
    bottom: 80px;
    right: 12%;
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

.announcements-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  position: relative;
  z-index: 1;

  .announcement-skeleton {
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: var(--border-radius-md);
    border: 1px solid rgba(var(--primary-color-rgb), 0.1);
    backdrop-filter: blur(10px);

    .dark-mode & {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
    }

    .skeleton-announcement-item {
      display: flex;
      align-items: flex-start;

      .skeleton-content {
        flex: 1;
        min-width: 0;
      }
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;

    .announcement-skeleton {
      padding: 20px;
    }
  }
}

.empty-announcements {
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
  position: relative;
  z-index: 1;
}

// 响应式设计
@media (max-width: 768px) {
  .announcements-section {
    padding: 60px 0;

    &::before, &::after {
      display: none;
    }
  }
}
</style>
