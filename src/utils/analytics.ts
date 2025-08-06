/**
 * 埋点工具类 - 收集用户访问数据和行为分析
 */

import service from './services'

// 埋点数据接口定义
export interface AnalyticsData {
  userId?: string | null
  sessionId: string
  pagePath: string
  pageTitle: string
  userAgent: string
  deviceInfo: DeviceInfo
  browserInfo: BrowserInfo
  osInfo: OSInfo
  screenInfo: ScreenInfo
  timestamp: number
  referrer: string
  duration?: number
  eventType: 'page_view' | 'page_leave' | 'click' | 'scroll' | 'custom'
  eventData?: Record<string, any>
}

export interface DeviceInfo {
  deviceType: 'desktop' | 'tablet' | 'mobile' | 'unknown'
  deviceModel?: string
  vendor?: string
  isTouchDevice: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
}

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  language: string
  languages: string[]
  cookieEnabled: boolean
  doNotTrack: boolean
  onlineStatus: boolean
}

export interface OSInfo {
  name: string
  version: string
  platform: string
}

export interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelRatio: number
  orientation?: string
}

class Analytics {
  private sessionId: string
  private userId: string | null = null
  private pageStartTime: number = Date.now()
  private isEnabled: boolean = true

  private pendingRequests: Set<string> = new Set() // 正在发送中的请求
  private dailyVisitedRoutes: Map<string, string> = new Map() // 每日访问的路由记录 key: route, value: date

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initUserId()
    this.initDailyVisitedRoutes()

    // 监听页面关闭事件
    this.bindPageEvents()
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 初始化每日访问路由记录
   */
  private initDailyVisitedRoutes(): void {
    try {
      const today = this.getTodayString()
      const stored = localStorage.getItem('analytics_daily_routes')

      if (stored) {
        const data = JSON.parse(stored)

        // 检查存储的数据是否是今天的
        if (data.date === today) {
          // 恢复今天的访问记录
          this.dailyVisitedRoutes = new Map(data.routes)
        } else {
          // 如果不是今天的数据，清空重新开始
          this.dailyVisitedRoutes.clear()
          this.saveDailyVisitedRoutes()
        }
      }
    } catch {
      // localStorage 访问失败，使用内存存储
      this.dailyVisitedRoutes.clear()
    }
  }

  /**
   * 获取今天的日期字符串
   */
  private getTodayString(): string {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }

  /**
   * 保存每日访问记录到localStorage
   */
  private saveDailyVisitedRoutes(): void {
    try {
      const data = {
        date: this.getTodayString(),
        routes: Array.from(this.dailyVisitedRoutes.entries())
      }
      localStorage.setItem('analytics_daily_routes', JSON.stringify(data))
    } catch {
      // localStorage 保存失败，静默处理
    }
  }

  /**
   * 检查路由今天是否已访问
   */
  private isRouteVisitedToday(route: string): boolean {
    const today = this.getTodayString()
    const visitDate = this.dailyVisitedRoutes.get(route)
    return visitDate === today
  }

  /**
   * 标记路由为今天已访问
   */
  private markRouteVisitedToday(route: string): void {
    const today = this.getTodayString()
    this.dailyVisitedRoutes.set(route, today)
    this.saveDailyVisitedRoutes()
  }

  /**
   * 初始化用户ID
   */
  private initUserId(): void {
    // 尝试从localStorage获取用户ID
    try {
      const storedUserId = localStorage.getItem('analytics_user_id')
      if (storedUserId) {
        this.userId = storedUserId
      } else {
        // 生成匿名用户ID
        const anonymousId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('analytics_user_id', anonymousId)
        this.userId = anonymousId
      }
    } catch {
      // 无法访问localStorage，使用临时用户ID
      this.userId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  /**
   * 获取设备信息
   */
  private getDeviceInfo(): DeviceInfo {
    const nav = navigator as any
    const deviceInfo: DeviceInfo = {
      deviceType: this.getDeviceType(),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: nav.hardwareConcurrency
    }

    return deviceInfo
  }

  /**
   * 判断设备类型
   */
  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase()

    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile'
    }

    if (/tablet|ipad|android(?!.*mobile)/i.test(userAgent)) {
      return 'tablet'
    }

    if (/desktop|windows|macintosh|linux/i.test(userAgent)) {
      return 'desktop'
    }

    return 'unknown'
  }

  /**
   * 获取浏览器信息
   */
  private getBrowserInfo(): BrowserInfo {
    const userAgent = navigator.userAgent
    const nav = navigator as any

    let browserName = 'Unknown'
    let browserVersion = 'Unknown'
    let browserEngine = 'Unknown'

    // 检测浏览器
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      browserEngine = 'Blink'
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      browserEngine = 'Gecko'
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari'
      const match = userAgent.match(/Safari\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      browserEngine = 'WebKit'
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge'
      const match = userAgent.match(/Edge\/(\d+\.\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
      browserEngine = 'EdgeHTML'
    }

    return {
      name: browserName,
      version: browserVersion,
      engine: browserEngine,
      language: navigator.language,
      languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: nav.doNotTrack === '1',
      onlineStatus: navigator.onLine
    }
  }

  /**
   * 获取操作系统信息
   */
  private getOSInfo(): OSInfo {
    const userAgent = navigator.userAgent
    let osName = 'Unknown'
    let osVersion = 'Unknown'
    const platform = navigator.platform

    if (userAgent.includes('Windows NT')) {
      osName = 'Windows'
      const match = userAgent.match(/Windows NT (\d+\.\d+)/)
      osVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('Mac OS X')) {
      osName = 'macOS'
      const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/)
      osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown'
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux'
    } else if (userAgent.includes('Android')) {
      osName = 'Android'
      const match = userAgent.match(/Android (\d+\.\d+)/)
      osVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.includes('iPhone OS') || userAgent.includes('iOS')) {
      osName = 'iOS'
      const match = userAgent.match(/OS (\d+[._]\d+[._]\d+)/)
      osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown'
    }

    return {
      name: osName,
      version: osVersion,
      platform
    }
  }

  /**
   * 获取屏幕信息
   */
  private getScreenInfo(): ScreenInfo {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: screen.orientation?.type || 'unknown'
    }
  }

  /**
   * 构建基础埋点数据
   */
  private buildBaseData(eventType: AnalyticsData['eventType'], eventData?: Record<string, any>): AnalyticsData {
    // 优先使用传入的routePath，否则使用当前页面路径
    const pagePath = eventData?.routePath || window.location.pathname

    return {
      userId: this.userId,
      sessionId: this.sessionId,
      pagePath,
      pageTitle: document.title,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      browserInfo: this.getBrowserInfo(),
      osInfo: this.getOSInfo(),
      screenInfo: this.getScreenInfo(),
      timestamp: Date.now(),
      referrer: document.referrer,
      eventType,
      eventData
    }
  }

  /**
   * 生成请求唯一标识
   */
  private generateRequestId(data: AnalyticsData): string {
    // 简单的请求ID，主要用于防止同时发送重复请求
    return `${data.eventType}_${data.pagePath}_${data.timestamp}`
  }

  /**
   * 发送埋点数据 - 静默发送，Promise形式
   */
  private sendData(data: AnalyticsData): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.isEnabled) {
        resolve()
        return
      }

      // 对于页面访问事件，检查今天是否已经访问过该路由
      if (data.eventType === 'page_view') {
        const isVisited = this.isRouteVisitedToday(data.pagePath)

        if (isVisited) {
          // 今天已访问过该路由，跳过发送
          resolve()
          return
        }
      }

      const requestId = this.generateRequestId(data)

      // 检查是否正在发送中
      if (this.pendingRequests.has(requestId)) {
        resolve()
        return
      }

      // 标记为发送中
      this.pendingRequests.add(requestId)

      // 创建特殊配置，禁用错误提示
      const config = {
        skipErrorMessage: true,
        timeout: 5000
      }

      service.post('/api/log', data, config)
        .then(() => {
          // 成功发送 - 对于页面访问事件，标记今天已访问
          if (data.eventType === 'page_view') {
            this.markRouteVisitedToday(data.pagePath)
          }
          resolve()
        })
        .catch(() => {
          // 失败 - 静默处理
          resolve()
        })
        .finally(() => {
          // 清理发送中标记
          this.pendingRequests.delete(requestId)
        })
    })
  }

  /**
   * 绑定页面事件
   */
  private bindPageEvents(): void {
    // 页面离开时发送页面停留时长
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave()
    })

    // 页面隐藏时发送数据
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageLeave()
      } else {
        this.pageStartTime = Date.now()
      }
    })
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId
    try {
      localStorage.setItem('analytics_user_id', userId)
    } catch {
      // 无法保存用户ID到localStorage
    }
  }

  /**
   * 启用/禁用埋点
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * 清理每日访问记录（调试用）
   */
  public clearDailyVisitedRoutes(): void {
    this.dailyVisitedRoutes.clear()
    this.saveDailyVisitedRoutes()
  }

  /**
   * 获取当前埋点状态
   */
  public getAnalyticsStatus() {
    return {
      isEnabled: this.isEnabled,
      pendingRequests: this.pendingRequests.size,
      dailyVisitedRoutes: this.dailyVisitedRoutes.size,
      today: this.getTodayString()
    }
  }

  /**
   * 手动标记路由为今天已访问（调试用）
   */
  public markRouteAsVisited(route: string): void {
    this.markRouteVisitedToday(route)
  }

  /**
   * 检查路由是否今天已访问（调试用）
   */
  public isRouteVisited(route: string): boolean {
    return this.isRouteVisitedToday(route)
  }

  /**
   * 页面访问埋点
   */
  public trackPageView(customData?: Record<string, any>): Promise<void> {
    this.pageStartTime = Date.now()
    const data = this.buildBaseData('page_view', customData)
    return this.sendData(data)
  }

  /**
   * 页面离开埋点
   */
  public async trackPageLeave(customData?: Record<string, any>): Promise<void> {
    const duration = Date.now() - this.pageStartTime
    const data = this.buildBaseData('page_leave', { ...customData, duration })

    // 使用 sendBeacon 确保数据在页面关闭前发送
    if (navigator.sendBeacon && this.isEnabled) {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
        navigator.sendBeacon('/api/log', blob)
      } catch {
        // sendBeacon 发送失败，静默处理
      }
    } else {
      this.sendData(data)
    }
  }

  /**
   * 点击事件埋点
   */
  public trackClick(element: string, customData?: Record<string, any>): Promise<void> {
    const data = this.buildBaseData('click', { element, ...customData })
    return this.sendData(data)
  }

  /**
   * 滚动事件埋点
   */
  public trackScroll(scrollDepth: number, customData?: Record<string, any>): Promise<void> {
    const data = this.buildBaseData('scroll', { scrollDepth, ...customData })
    return this.sendData(data)
  }

  /**
   * 自定义事件埋点
   */
  public trackCustomEvent(eventName: string, customData?: Record<string, any>): Promise<void> {
    const data = this.buildBaseData('custom', { eventName, ...customData })
    return this.sendData(data)
  }
}

// 创建全局埋点实例
export const analytics = new Analytics()

// 导出埋点实例
export default analytics

