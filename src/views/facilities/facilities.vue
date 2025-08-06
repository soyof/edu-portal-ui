<template>
  <div class="facilities-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="floating-elements">
          <div
            v-for="i in 12"
            :key="i"
            class="float-element"
            :style="{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 6 + 's',
              animationDuration: (6 + Math.random() * 4) + 's'
            }"
          ></div>
        </div>
      </div>

      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">{{ $t('facilities.title') }}</h1>
          <p class="page-subtitle">{{ $t('facilities.subtitle') }}</p>
          <div v-if="activeTab === 'instruments'" class="stats-info">
            <span class="total-count">{{ $t('facilities.totalInstruments') }}: {{ totalInstruments }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <section class="nav-tabs-section">
      <div class="container">
        <ElTabs v-model="activeTab" class="facilities-tabs" @tabChange="handleTabChange">
          <ElTabPane :label="$t('facilities.labProfile')" name="profile">
            <LabProfile ref="labProfileRef" />
          </ElTabPane>

          <ElTabPane :label="$t('facilities.instruments')" name="instruments">
            <InstrumentsList ref="instrumentsListRef" :autoLoad="false" />
          </ElTabPane>
        </ElTabs>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'

import LabProfile from '@/components/facilities/labProfile.vue'
import InstrumentsList from '@/components/facilities/instrumentsList.vue'

// 响应式数据
const activeTab = ref('profile')

// 组件引用
const labProfileRef = ref()
const instrumentsListRef = ref()

// 懒加载状态记录 - 使用 Set 记录已加载的 tab
const loadedTabs = ref(new Set(['profile'])) // 默认加载 profile tab

// 计算属性
const totalInstruments = computed(() => {
  return instrumentsListRef.value?.totalInstruments || 0
})

// 方法
const handleTabChange = (tabName: string | number) => {
  const tabKey = tabName as string

  // 懒加载：只在首次切换到某个tab时才加载数据
  if (!loadedTabs.value.has(tabKey)) {
    if (tabKey === 'instruments' && instrumentsListRef.value) {
      instrumentsListRef.value.fetchInstruments()
      loadedTabs.value.add('instruments')
    } else if (tabKey === 'profile' && labProfileRef.value) {
      labProfileRef.value.fetchLabProfile()
      loadedTabs.value.add('profile')
    }
  }
}

// 手动刷新当前tab数据的方法
const refreshCurrentTab = () => {
  if (activeTab.value === 'instruments' && instrumentsListRef.value) {
    instrumentsListRef.value.fetchInstruments()
  } else if (activeTab.value === 'profile' && labProfileRef.value) {
    labProfileRef.value.fetchLabProfile()
  }
}

// 强制刷新指定tab数据（忽略懒加载状态）
const forceRefreshTab = (tabName: string) => {
  if (tabName === 'instruments' && instrumentsListRef.value) {
    instrumentsListRef.value.fetchInstruments()
    loadedTabs.value.add('instruments')
  } else if (tabName === 'profile' && labProfileRef.value) {
    labProfileRef.value.fetchLabProfile()
    loadedTabs.value.add('profile')
  }
}

// 暴露方法给父组件使用
defineExpose({
  refreshCurrentTab,
  forceRefreshTab,
  loadedTabs: loadedTabs.value
})

// 生命周期钩子
onMounted(() => {
  // 使用nextTick确保组件引用已经设置
  nextTick(() => {
    // 默认加载profile tab的数据
    if (labProfileRef.value) {
      labProfileRef.value.fetchLabProfile()
    }
  })
})
</script>

<style lang="less" scoped>
.facilities-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);

  .dark-mode & {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
}

// Hero Section
.hero-section {
  position: relative;
  padding: 80px 0 60px;
  background: linear-gradient(135deg,
    rgba(14, 165, 233, 0.08),
    rgba(59, 130, 246, 0.06),
    rgba(139, 92, 246, 0.04),
    rgba(236, 72, 153, 0.02));
  overflow: hidden;

  .dark-mode & {
    background: linear-gradient(135deg,
      rgba(15, 23, 42, 0.9),
      rgba(30, 41, 59, 0.8),
      rgba(51, 65, 85, 0.7));
  }

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .floating-elements {
      position: absolute;
      width: 100%;
      height: 100%;

      .float-element {
        position: absolute;
        width: 6px;
        height: 6px;
        background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
        border-radius: 50%;
        opacity: 0.4;
        animation: detailFloat 8s ease-in-out infinite;
        box-shadow: 0 0 6px rgba(14, 165, 233, 0.3);

        &:nth-child(even) {
          background: linear-gradient(45deg, var(--secondary-color), var(--tech-pink));
          animation-direction: reverse;
          animation-duration: 10s;
        }

        &:nth-child(3n) {
          width: 4px;
          height: 4px;
          opacity: 0.6;
          animation-duration: 9s;
        }
      }
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 2;
  }

  .hero-content {
    text-align: center;

    .page-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--primary-color);

      .dark-mode & {
        color: #4fd1c7;
      }

      @media (max-width: 768px) {
        font-size: 2.8rem;
      }
    }

    .page-subtitle {
      font-size: 1.3rem;
      color: #64748b;
      margin-bottom: 3rem;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.7;
      font-weight: 500;

      .dark-mode & {
        color: #cbd5e0;
      }

      @media (max-width: 768px) {
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }
    }

    .stats-info {
      display: flex;
      justify-content: center;
      gap: 2rem;

      .total-count {
        color: var(--primary-color);
        font-weight: 700;
        font-size: 1.2rem;
        padding: 12px 32px;
        background: rgba(var(--primary-color-rgb), 0.12);
        border: 2px solid rgba(var(--primary-color-rgb), 0.25);
        border-radius: 30px;
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.15);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 48px rgba(var(--primary-color-rgb), 0.25);
        }

        .dark-mode & {
          background: rgba(var(--secondary-color-rgb), 0.15);
          border-color: rgba(var(--secondary-color-rgb), 0.3);
          color: var(--secondary-color);
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    }
  }
}

// Tabs Section
.nav-tabs-section {
  padding: 40px 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .facilities-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 40px;
      border-bottom: 2px solid rgba(var(--primary-color-rgb), 0.1);
    }

    :deep(.el-tabs__nav-wrap) {
      display: flex;
      justify-content: center;
    }

    :deep(.el-tabs__item) {
      font-size: 1.1rem;
      font-weight: 600;
      padding: 16px 32px;
      color: #64748b;
      transition: all 0.3s ease;

      &.is-active {
        color: var(--primary-color);
        font-weight: 700;
      }

      &:hover {
        color: var(--primary-color);
      }

      .dark-mode & {
        color: #94a3b8;

        &.is-active {
          color: var(--secondary-color);
        }

        &:hover {
          color: var(--secondary-color);
        }
      }
    }

    :deep(.el-tabs__active-bar) {
      background: var(--primary-color);
      height: 3px;

      .dark-mode & {
        background: var(--secondary-color);
      }
    }
  }
}

@keyframes detailFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  33% {
    transform: translateY(-15px) rotate(120deg);
    opacity: 0.7;
  }
  66% {
    transform: translateY(-8px) rotate(240deg);
    opacity: 0.6;
  }
}
</style>
