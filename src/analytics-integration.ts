/**
 * 全局自动埋点系统集成示例 - 在main.ts中使用
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import AnalyticsPlugin from './plugins/analytics'

// 创建Vue应用
const app = createApp(App)

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 你的路由配置
  ]
})

// 安装全局自动埋点插件 - 一次配置，全局生效
app.use(new AnalyticsPlugin({
  // 自动追踪功能（默认全部启用）
  enablePageTracking: true, // 自动页面访问追踪
  enableErrorTracking: true, // 自动错误监控
  enablePerformanceTracking: true, // 自动性能监控
  enableScrollTracking: true, // 自动滚动深度追踪
  enableAutoClicks: true, // 自动点击事件追踪
  enableAutoFormTracking: true, // 自动表单交互追踪
  enableAutoLinkTracking: true, // 自动链接点击追踪

  // 排除配置
  excludeRoutes: ['/admin', '/debug'], // 不追踪的路由
  excludeSelectors: ['.no-track', '[data-no-track]'], // 不追踪的元素

  // 环境配置
  debugMode: import.meta.env.DEV, // 开发环境启用调试日志
  userId: undefined // 可选：设置用户ID
}), router)

// 可选：注册埋点指令（用于特殊场景的手动控制）
const analyticsDirectives = AnalyticsPlugin.createDirectives()
Object.keys(analyticsDirectives).forEach(name => {
  app.directive(name, analyticsDirectives[name])
})

app.use(router)
app.mount('#app')

/**
 * 🎉 全局自动埋点已启用！
 *
 * ✅ 自动收集的数据：
 * - 页面访问（路由切换时自动发送）
 * - 所有按钮点击
 * - 所有链接点击
 * - 表单提交和字段焦点
 * - 重要元素可见性
 * - JavaScript错误和资源错误
 * - 页面性能指标
 * - 滚动深度
 * - 用户设备、浏览器、操作系统信息
 *
 * 🔧 手动埋点（仅在特殊场景使用）：
 *
 * import { useAnalytics, useBusinessTracking } from '@/hooks/useAnalytics'
 *
 * const { trackCustomEvent } = useAnalytics()
 * const { trackSearch, trackCarouselInteraction } = useBusinessTracking()
 *
 * // 业务特定埋点
 * trackSearch('人工智能', 'papers', 42)
 * trackCarouselInteraction('next', 2, '专利成果')
 *
 * 🚫 排除元素：
 * <button class="no-track">不追踪的按钮</button>
 * <div data-no-track>不追踪的区域</div>
 *
 * 👁️ 特殊追踪：
 * <div data-track-visible>重要内容区域</div>
 * <button v-track-click:custom-action="{ source: 'special' }">特殊按钮</button>
 */
