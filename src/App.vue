<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from './components/layout/appLayout.vue'
import { useThemeStore } from './store'
import { onMounted } from 'vue'

const themeStore = useThemeStore()

onMounted(() => {
  // 确保初始化主题设置
  themeStore.initTheme()
})
</script>

<style>
@import './styles/index.less';
</style>
