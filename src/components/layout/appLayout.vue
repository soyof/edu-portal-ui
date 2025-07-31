<template>
  <div class="app-layout">
    <AppHeader />

    <main class="main-content">
      <!-- 页面过渡效果 -->
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />

    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="global-loader">
      <div class="loader-inner">
        <span class="dna-loader"></span>
        <p>{{ $t('global.loading') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../../store'
import AppHeader from './appHeader.vue'
import AppFooter from './appFooter.vue'

const route = useRoute()
const appStore = useAppStore()

// 计算属性
const isLoading = computed(() => appStore.isLoading)

// 监听路由变化
watch(
  () => route.path,
  () => {
    // 关闭移动端菜单
    appStore.closeMobileMenu()
    // 滚动到页面顶部
    window.scrollTo(0, 0)
  }
)

// 生命周期钩子
onMounted(() => {
  // 初始化加载状态
  appStore.setLoading(false)
})
</script>

<style lang="less" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; // 为固定的导航栏留出空间
}

.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);

  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.9);
  }
}

.loader-inner {
  text-align: center;

  p {
    margin-top: 20px;
    font-size: 1.2rem;
    color: var(--dark-color);

    .dark-mode & {
      color: var(--light-color);
    }
  }
}

.dna-loader {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;

  &::before, &::after {
    content: '';
    display: block;
    position: absolute;
    border-radius: 50%;
  }

  &::before {
    width: 80%;
    height: 80%;
    border-top: 4px solid var(--primary-color);
    border-bottom: 4px solid var(--accent-color);
    top: 10%;
    left: 10%;
    animation: dnaRotate 2s linear infinite;
  }

  &::after {
    width: 60%;
    height: 60%;
    border-left: 4px solid var(--primary-color);
    border-right: 4px solid var(--accent-color);
    top: 20%;
    left: 20%;
    animation: dnaRotate 2s linear infinite reverse;
  }
}
</style>
