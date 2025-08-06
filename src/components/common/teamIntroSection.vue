<template>
  <section class="team-intro-section">
    <div class="container">
      <h2 class="section-title tech-line">{{ $t('home.teamIntro') }}</h2>
      <div class="team-intro-content glass-effect">
        <div class="team-intro-text">
          <!-- 动态内容显示 -->
          <div v-if="loading" class="loading-container">
            <el-skeleton animated>
              <template #template>
                <div class="team-skeleton-content">
                  <!-- 模拟段落标题 -->
                  <el-skeleton-item variant="h3" style="width: 40%; margin-bottom: 20px;" />
                  <!-- 模拟段落内容 -->
                  <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 95%; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 88%; margin-bottom: 20px;" />
                  <!-- 模拟第二段 -->
                  <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 92%; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 85%; margin-bottom: 30px;" />
                  <!-- 模拟按钮 -->
                  <el-skeleton-item variant="button" style="width: 140px; height: 44px;" />
                </div>
              </template>
            </el-skeleton>
          </div>
          <div v-else-if="profileContent" class="content-section">
            <div class="html-content" v-html="profileContent"></div>
          </div>
          <div v-else class="empty-content">
            <el-empty :description="$t('common.noData')" />
          </div>

          <div class="team-actions">
            <ViewMoreButton @click="router.push('/members')">
              {{ $t('home.viewTeamMembers') }}
            </ViewMoreButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ViewMoreButton from './viewMoreButton.vue'
import service from '@/utils/services'
import { useLanguageText } from '@/hooks/useResearchSearch'

// 团队简介响应数据接口
interface TeamProfileResponse {
  id: number
  profileType: string
  title: string
  content?: string
  contentEn?: string
  publishTimes?: string
  updatedTimes?: string
}

const router = useRouter()
const { getCurrentLanguageText } = useLanguageText()

// 响应式数据
const loading = ref(false)
const profile = ref<TeamProfileResponse | null>(null)

// 计算属性 - 获取当前语言的内容
const profileContent = computed(() => {
  if (!profile.value) return ''
  return getCurrentLanguageText(profile.value, 'content')
})

// API方法
const fetchTeamProfile = () => {
  loading.value = true

  service.post('/api/profile', {
    profileType: '5003'
  })
    .then((result: any) => {
      profile.value = result || {}
    })
    .finally(() => {
      loading.value = false
    })
}

// 暴露方法给父组件
defineExpose({
  fetchTeamProfile
})

// 生命周期钩子
onMounted(() => {
  fetchTeamProfile()
})
</script>

<style lang="less" scoped>
// 团队简介区域样式
.team-intro-section {
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
    left: 10%;
  }

  &::after {
    bottom: 80px;
    right: 10%;
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

.team-intro-content {
  margin: 0 auto;
  padding: 20px;
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;

  .dark-mode & {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .purple-theme & {
    background: rgba(70, 38, 125, 0.08);
    border: 1px solid rgba(70, 38, 125, 0.2);
  }

  .purple-theme.dark-mode & {
    background: rgba(105, 56, 181, 0.06);
    border: 1px solid rgba(105, 56, 181, 0.15);
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }

  .team-intro-text {
    .loading-container {
      margin-bottom: 30px;

      .team-skeleton-content {
        padding: 20px 0;
      }
    }

    .content-section {}

    .empty-content {
      margin-bottom: 30px;
      padding: 40px 20px;
      text-align: center;
      background: rgba(255, 255, 255, 0.3);
      border-radius: var(--border-radius-md);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);

      .dark-mode & {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
    }

    .team-actions {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);

      .dark-mode & {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .purple-theme & {
        border-top: 1px solid rgba(70, 38, 125, 0.2);
      }

      .purple-theme.dark-mode & {
        border-top: 1px solid rgba(105, 56, 181, 0.15);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .team-intro-section {
    padding: 60px 0;

    &::before, &::after {
      display: none;
    }
  }
}
</style>

