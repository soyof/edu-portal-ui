<template>
  <div class="lab-profile-section">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
      </div>
      <p>{{ $t('global.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">🏢</div>
      <h3>{{ $t('facilities.profileNotFound') }}</h3>
      <p>{{ $t('facilities.profileErrorDesc') }}</p>
    </div>

    <div v-else-if="profile" class="profile-content">
      <div class="profile-card">
        <div class="profile-body">
          <div class="html-content" v-html="getCurrentContent(profile)"></div>
          <div v-if="profile.publishTimes" class="profile-meta"></div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">🏢</div>
      <h3>{{ $t('facilities.noProfile') }}</h3>
      <p>{{ $t('facilities.noProfileDesc') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

// 实验室简介响应数据
interface LabProfileResponse {
  id: number
  profileType: string
  title: string
  content?: string
  contentEn?: string
  publishTimes?: string
  publishUserId?: string
  publishUserName?: string
  createUserId: string
  updateUserId: string
  createUserName: string
  updateUserName: string
  publishStatus: string
  createdTimes: string
  updatedTimes: string
}
const { getCurrentLanguageText } = useLanguageText()

// 响应式数据
const loading = ref(false)
const error = ref(false)
const profile = ref<LabProfileResponse | null>(null)

// API方法
const getLabProfile = () => {
  return service.get('/api/labEnvironmentProfile')
}

// 方法
const fetchLabProfile = () => {
  loading.value = true
  error.value = false

  return getLabProfile()
    .then(result => {
      profile.value = (result as any)
    })
    .finally(() => {
      loading.value = false
    })
}

// 工具方法
const getCurrentContent = (profile: LabProfileResponse) => {
  return getCurrentLanguageText(profile, 'content')
}

// 暴露方法给父组件
defineExpose({
  fetchLabProfile
})

// 生命周期钩子
onMounted(() => {
  fetchLabProfile()
})
</script>

<style lang="less" scoped>
// Lab Profile Section
.lab-profile-section {
  .profile-content {
    .profile-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(var(--primary-color-rgb), 0.1);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.08);

      .dark-mode & {
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(var(--secondary-color-rgb), 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .profile-body {
        .profile-meta {
          padding-top: 16px;
          border-top: 1px solid rgba(var(--primary-color-rgb), 0.1);
        }
      }
    }
  }
}

// Loading and Error States
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .loading-spinner {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: 24px;

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1.2s linear infinite;

      .dark-mode & {
        border-top-color: var(--secondary-color);
      }
    }
  }

  .error-icon, .empty-icon {
    font-size: 4rem;
    margin-bottom: 24px;
    opacity: 0.6;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-color);

    .dark-mode & {
      color: #f7fafc;
    }
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
    max-width: 400px;

    .dark-mode & {
      color: #94a3b8;
    }
  }
}
</style>
