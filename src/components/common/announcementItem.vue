<template>
  <div
    class="announcement-card"
    :class="[
      `type-${announcement.type}`,
      { 'has-link': !!announcement.link }
    ]"
    @click="handleClick"
  >
    <!-- 悬浮日期标签 -->
    <div class="announcement-date">
      <span class="day">{{ dateInfo.day }}</span>
      <div class="date-text">
        <span class="month">{{ dateInfo.month }}</span>
        <span class="year">{{ dateInfo.year }}</span>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 标题 -->
      <h3 class="announcement-title">{{ announcement.title }}</h3>

      <!-- 底部信息栏 -->
      <div v-if="announcement.isNew" class="card-footer">
        <!-- 新公告标签 -->
        <div class="new-badge">
          {{ $t('home.new') }}
        </div>
      </div>
    </div>

    <!-- 悬浮装饰元素 -->
    <div class="card-decoration"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoFilled, WarningFilled, Bell } from '@element-plus/icons-vue'
// 公告类型定义
interface Announcement {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'important'
  date?: string
  isNew?: boolean
  link?: string
}
import { useRouter } from 'vue-router'

const props = defineProps<{
  announcement: Announcement;
}>()

const router = useRouter()

// 现代化日期格式化，参考最新动态
const dateInfo = computed(() => {
  if (!props.announcement.date) {
    return { day: '01', month: '1月', year: '2024' }
  }

  const date = new Date(props.announcement.date)
  const day = date.getDate().toString().padStart(2, '0')
  const month = `${date.getMonth() + 1}月`
  const year = date.getFullYear().toString()

  return {
    day,
    month,
    year
  }
})

// 处理点击事件
const handleClick = () => {
  if (props.announcement.link) {
    router.push(props.announcement.link)
  }
}
</script>

<style lang="less" scoped>
// 现代化公告卡片，参考最新动态设计
.announcement-card {
  padding: 35px 30px 30px;
  border-radius: var(--border-radius-lg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(var(--primary-color-rgb), 0.08);
  backdrop-filter: blur(10px);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 20px;

  .dark-mode & {
    background: rgba(26, 26, 46, 0.9);
    border: 1px solid rgba(var(--primary-color-rgb), 0.15);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &.has-link {
    cursor: pointer;
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

    .link-icon {
      transform: translateX(5px);
    }

    .card-decoration {
      transform: scale(1.2) rotate(10deg);
    }
  }

  // 根据公告类型设置装饰效果
  &.type-info {
    &::before {
      background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-color-rgb), 0.6));
    }
  }

  &.type-warning {
    &::before {
      background: linear-gradient(135deg, #ff9800, rgba(255, 152, 0, 0.6));
    }
  }

  &.type-important {
    &::before {
      background: linear-gradient(135deg, #f44336, rgba(244, 67, 54, 0.6));
    }
  }

  // 顶部装饰线条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color), rgba(var(--primary-color-rgb), 0.6));
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  }
}

// 悬浮日期标签，完全参考最新动态
.announcement-date {
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
  z-index: 2;

  .day {
    font-size: 1.6rem;
    font-weight: 700;
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

// 卡片内容区域
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color-primary);
  line-height: 1.4;
  margin-top: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  .dark-mode & {
    color: rgba(255, 255, 255, 0.95);
  }

  &:hover {
    color: var(--primary-color);
    transition: color 0.3s ease;
  }
}

// 卡片底部信息栏
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

// 新公告标签
.new-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--accent-color), rgba(var(--accent-color-rgb), 0.8));
  color: white;
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(var(--accent-color-rgb), 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);

  .purple-theme & {
    background: linear-gradient(135deg, #6938B5, rgba(105, 56, 181, 0.8));
    box-shadow: 0 2px 8px rgba(105, 56, 181, 0.3);
  }
}

// 悬浮装饰元素
.card-decoration {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1), rgba(var(--primary-color-rgb), 0.05));
  border-radius: 50%;
  transition: all 0.4s ease;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.2), rgba(var(--primary-color-rgb), 0.1));
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .announcement-card {
    padding: 30px 25px 25px;
    min-height: 140px;
  }

  .announcement-date {
    padding: 10px 16px;
    gap: 10px;

    .day {
      font-size: 1.4rem;
    }

    .date-text {
      .month {
        font-size: 0.8rem;
      }

      .year {
        font-size: 0.7rem;
      }
    }
  }

  .announcement-title {
    font-size: 1.2rem;
    margin-top: 15px;
  }

  .card-decoration {
    width: 50px;
    height: 50px;

    &::before {
      width: 25px;
      height: 25px;
    }
  }
}
</style>
