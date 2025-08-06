import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import AnalyticsPlugin from './plugins/analytics'
import 'animate.css'

// 导入样式
import './styles/index.less'

// 创建应用
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// 安装全局自动埋点插件 - 当前仅启用路由追踪
app.use(new AnalyticsPlugin({
  enablePageTracking: true, // 启用页面访问追踪（路由切换时记录）
  enableErrorTracking: false, // 暂时关闭错误监控
  enablePerformanceTracking: false, // 暂时关闭性能监控
  enableScrollTracking: false, // 暂时关闭滚动深度追踪
  enableAutoClicks: false, // 暂时关闭自动点击追踪
  enableAutoFormTracking: false, // 暂时关闭自动表单追踪
  enableAutoLinkTracking: false, // 暂时关闭自动链接追踪
  excludeRoutes: ['/admin'], // 排除的路由
  excludeSelectors: ['.no-track', '[data-no-track]'], // 排除的元素
  debugMode: false // 关闭调试模式
}), router)

// 挂载应用
app.mount('#app')
