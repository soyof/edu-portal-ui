<template>
  <div 
    class="announcement-item glass-effect" 
    :class="[
      `type-${announcement.type}`,
      { 'has-link': !!announcement.link }
    ]"
    @click="handleClick"
  >
    <div class="announcement-icon">
      <el-icon v-if="announcement.type === 'info'"><InfoFilled /></el-icon>
      <el-icon v-else-if="announcement.type === 'warning'"><WarningFilled /></el-icon>
      <el-icon v-else-if="announcement.type === 'important'"><Bell /></el-icon>
    </div>
    
    <div class="announcement-content">
      <div class="announcement-header">
        <h3 class="announcement-title">{{ announcement.title }}</h3>
        <div class="announcement-badges">
          <span v-if="announcement.isNew" class="badge new-badge">{{ $t('home.new') }}</span>
        </div>
      </div>
      <p class="announcement-text">{{ announcement.content }}</p>
      <div class="announcement-footer">
        <span class="announcement-date">{{ formattedDate }}</span>
        <el-icon v-if="announcement.link" class="link-icon"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InfoFilled, WarningFilled, Bell, ArrowRight } from '@element-plus/icons-vue';
import type { Announcement } from '../../api';
import { useRouter } from 'vue-router';

const props = defineProps<{
  announcement: Announcement;
}>();

const router = useRouter();

// 格式化日期
const formattedDate = computed(() => {
  if (!props.announcement.date) return '';
  
  const date = new Date(props.announcement.date);
  return date.toLocaleDateString();
});

// 处理点击事件
const handleClick = () => {
  if (props.announcement.link) {
    router.push(props.announcement.link);
  }
};
</script>

<style lang="less" scoped>
.announcement-item {
  padding: 20px;
  border-radius: var(--border-radius-md);
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  &.has-link {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
    }
  }
  
  // 根据公告类型设置不同样式
  &.type-info {
    border-left: 4px solid var(--primary-color);
    
    .announcement-icon {
      color: var(--primary-color);
    }
  }
  
  &.type-warning {
    border-left: 4px solid #ff9800;
    
    .announcement-icon {
      color: #ff9800;
    }
  }
  
  &.type-important {
    border-left: 4px solid #f44336;
    
    .announcement-icon {
      color: #f44336;
    }
  }
}

.announcement-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.announcement-content {
  flex: 1;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.announcement-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.announcement-badges {
  display: flex;
  gap: 8px;
  
  .badge {
    padding: 2px 8px;
    border-radius: var(--border-radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    
    &.new-badge {
      background-color: var(--accent-color);
      color: white;
    }
    
    .purple-theme & {
      &.new-badge {
        background-color: @purple-theme;
      }
    }
  }
}

.announcement-text {
  font-size: 0.95rem;
  margin: 0 0 15px;
  line-height: 1.5;
  opacity: 0.85;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  opacity: 0.7;
  
  .announcement-date {
    font-style: italic;
  }
  
  .link-icon {
    transition: transform 0.3s ease;
  }
  
  .has-link:hover & .link-icon {
    transform: translateX(3px);
  }
}
</style> 
