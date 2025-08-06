/**
 * 埋点功能的 Vue Composable Hook - 全局自动埋点模式
 *
 * 注意：大部分埋点功能已通过全局插件自动处理，包括：
 * - 页面访问追踪
 * - 点击事件追踪
 * - 表单交互追踪
 * - 链接点击追踪
 * - 元素可见性追踪
 * - 错误监控
 * - 性能监控
 *
 * 此Hook仅用于特殊的手动埋点需求
 */

import analytics from '@/utils/analytics'

/**
 * 基础埋点 Hook - 提供手动埋点方法
 */
export function useAnalytics() {
  // 设置用户ID
  const setUserId = (userId: string) => {
    analytics.setUserId(userId)
  }

  // 启用/禁用埋点
  const setEnabled = (enabled: boolean) => {
    analytics.setEnabled(enabled)
  }

  // 清理每日访问记录（调试用）
  const clearDailyVisitedRoutes = () => {
    analytics.clearDailyVisitedRoutes()
  }

  // 手动标记路由为已访问（调试用）
  const markRouteAsVisited = (route: string) => {
    analytics.markRouteAsVisited(route)
  }

  // 检查路由是否已访问（调试用）
  const isRouteVisited = (route: string) => {
    return analytics.isRouteVisited(route)
  }

  // 获取埋点状态
  const getAnalyticsStatus = () => {
    return analytics.getAnalyticsStatus()
  }

  // 手动发送自定义事件
  const trackCustomEvent = (eventName: string, eventData?: Record<string, any>) => {
    analytics.trackCustomEvent(eventName, eventData)
  }

  // 手动发送点击事件（仅在需要特殊数据时使用）
  const trackClick = (element: string, customData?: Record<string, any>) => {
    analytics.trackClick(element, customData)
  }

  // 手动发送页面访问（仅在SPA特殊路由场景使用）
  const trackPageView = (customData?: Record<string, any>) => {
    analytics.trackPageView(customData)
  }

  return {
    setUserId,
    setEnabled,
    clearDailyVisitedRoutes,
    markRouteAsVisited,
    isRouteVisited,
    getAnalyticsStatus,
    trackCustomEvent,
    trackClick,
    trackPageView,
    analytics
  }
}

/**
 * 业务埋点 Hook - 针对特定业务场景的手动埋点
 */
export function useBusinessTracking() {
  // 搜索行为埋点
  const trackSearch = (searchTerm: string, searchType: string, resultCount?: number) => {
    analytics.trackCustomEvent('business_search', {
      searchTerm,
      searchType,
      resultCount,
      timestamp: Date.now()
    })
  }

  // 下载行为埋点
  const trackDownload = (fileName: string, fileType: string, fileSize?: number) => {
    analytics.trackCustomEvent('business_download', {
      fileName,
      fileType,
      fileSize,
      timestamp: Date.now()
    })
  }

  // 分享行为埋点
  const trackShare = (platform: string, contentType: string, contentId?: string) => {
    analytics.trackCustomEvent('business_share', {
      platform,
      contentType,
      contentId,
      timestamp: Date.now()
    })
  }

  // 视频播放埋点
  const trackVideoPlay = (videoId: string, videoTitle: string, duration?: number) => {
    analytics.trackCustomEvent('business_video_play', {
      videoId,
      videoTitle,
      duration,
      timestamp: Date.now()
    })
  }

  // 轮播图交互埋点（手动补充数据）
  const trackCarouselInteraction = (action: 'next' | 'prev' | 'dot_click', slideIndex: number, slideTitle?: string) => {
    analytics.trackCustomEvent('business_carousel_interaction', {
      action,
      slideIndex,
      slideTitle,
      timestamp: Date.now()
    })
  }

  // 用户登录埋点
  const trackUserLogin = (loginMethod: string, success: boolean) => {
    analytics.trackCustomEvent('business_user_login', {
      loginMethod,
      success,
      timestamp: Date.now()
    })
  }

  // 用户注册埋点
  const trackUserRegister = (registerMethod: string, success: boolean) => {
    analytics.trackCustomEvent('business_user_register', {
      registerMethod,
      success,
      timestamp: Date.now()
    })
  }

  // 购买/支付埋点
  const trackPurchase = (productId: string, amount: number, currency: string = 'CNY') => {
    analytics.trackCustomEvent('business_purchase', {
      productId,
      amount,
      currency,
      timestamp: Date.now()
    })
  }

  return {
    trackSearch,
    trackDownload,
    trackShare,
    trackVideoPlay,
    trackCarouselInteraction,
    trackUserLogin,
    trackUserRegister,
    trackPurchase
  }
}

/**
 * 数据分析 Hook - 提供埋点数据相关的辅助功能
 */
export function useAnalyticsUtils() {
  // 生成会话ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 获取当前页面信息
  const getCurrentPageInfo = () => {
    return {
      pagePath: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    }
  }

  // 获取浏览器信息
  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    }
  }

  // 批量发送埋点数据
  const batchTrackEvents = (events: Array<{ eventName: string; eventData?: Record<string, any> }>) => {
    events.forEach(({ eventName, eventData }) => {
      analytics.trackCustomEvent(eventName, eventData)
    })
  }

  return {
    generateSessionId,
    getCurrentPageInfo,
    getBrowserInfo,
    batchTrackEvents
  }
}

/**
 * 调试埋点 Hook - 开发环境下的埋点调试功能
 */
export function useAnalyticsDebug() {
  const isDebugMode = import.meta.env.DEV

  // 打印埋点信息
  const debugTrack = (eventName: string, eventData?: Record<string, any>) => {
    analytics.trackCustomEvent(eventName, eventData)
  }

  // 模拟埋点数据
  const mockTrackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (isDebugMode) {
      return
    }

    analytics.trackCustomEvent(eventName, eventData)
  }

  return {
    debugTrack,
    mockTrackEvent,
    isDebugMode
  }
}

// 导出默认的综合Hook
export default useAnalytics
