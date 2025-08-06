/**
 * 全局自动埋点插件 - 无需手动集成
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'
import analytics from '@/utils/analytics'

// 埋点插件配置
export interface AnalyticsOptions {
  enablePageTracking?: boolean
  enableErrorTracking?: boolean
  enablePerformanceTracking?: boolean
  enableScrollTracking?: boolean
  enableAutoClicks?: boolean
  enableAutoFormTracking?: boolean
  enableAutoLinkTracking?: boolean
  excludeRoutes?: string[]
  excludeSelectors?: string[]
  debugMode?: boolean
  userId?: string
}

// 默认配置
const defaultOptions: AnalyticsOptions = {
  enablePageTracking: true,
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  enableScrollTracking: true,
  enableAutoClicks: true,
  enableAutoFormTracking: true,
  enableAutoLinkTracking: true,
  excludeRoutes: ['/admin'],
  excludeSelectors: ['.no-track', '[data-no-track]'],
  debugMode: false
}

class AnalyticsPlugin {
  private options: AnalyticsOptions
  private router?: Router
  private scrollThresholds = [25, 50, 75, 90, 100]
  private scrollDepths = new Set<number>()
  private isInitialized = false // 防重复初始化

  constructor(options: AnalyticsOptions = {}) {
    this.options = { ...defaultOptions, ...options }
  }

  /**
   * 安装插件
   */
  install(app: App, router?: Router) {
    this.router = router

    // 设置用户ID
    if (this.options.userId) {
      analytics.setUserId(this.options.userId)
    }

    // 注册全局属性
    app.config.globalProperties.$analytics = analytics

    // 提供全局注入
    app.provide('analytics', analytics)

    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeTracking()
      })
    } else {
      // DOM已经加载完成，直接初始化
      setTimeout(() => {
        this.initializeTracking()
      }, 100)
    }
  }

  /**
   * 初始化所有追踪功能
   */
  private initializeTracking() {
    if (this.isInitialized) {
      return
    }

    try {
      // 初始化页面路由追踪 - 仅保留此功能
      this.initPageTracking()

      // 暂时注释掉其他监听功能，后续如需要可以取消注释
      // this.initErrorTracking()
      // this.initPerformanceTracking()
      // this.initScrollTracking()
      // this.initGlobalClickTracking()
      // this.initGlobalFormTracking()
      // this.initVisibilityTracking()

      this.isInitialized = true
    } catch {
      // 追踪功能初始化失败，静默处理
    }
  }

  /**
   * 初始化页面访问追踪
   */
  private initPageTracking() {
    if (!this.options.enablePageTracking || !this.router) {
      return
    }

    this.router.afterEach((to, from) => {
      // 检查是否在排除列表中
      if (this.options.excludeRoutes?.includes(to.path)) {
        return
      }

      // 延迟发送，确保页面已渲染
      setTimeout(() => {
        analytics.trackPageView({
          routeName: to.name as string,
          routePath: to.path,
          routeParams: to.params,
          routeQuery: to.query,
          fromRoute: from.path,
          fromRouteName: from.name as string
        })
      }, 100)
    })
  }

  /**
   * 初始化错误追踪
   */
  private initErrorTracking() {
    if (!this.options.enableErrorTracking) {
      return
    }

    // JavaScript 错误
    window.addEventListener('error', (event) => {
      analytics.trackCustomEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now()
      })
    })

    // Promise 未捕获错误
    window.addEventListener('unhandledrejection', (event) => {
      analytics.trackCustomEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now()
      })
    })

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as any
        analytics.trackCustomEvent('resource_error', {
          tagName: target.tagName,
          source: target.src || target.href,
          outerHTML: target.outerHTML,
          url: window.location.href,
          timestamp: Date.now()
        })
      }
    }, true)
  }

  /**
   * 初始化性能追踪
   */
  private initPerformanceTracking() {
    if (!this.options.enablePerformanceTracking) {
      return
    }

    // 页面加载完成后收集性能数据
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectPerformanceData()
      }, 1000)
    })

    // Web Vitals 性能指标
    this.collectWebVitals()
  }

  /**
   * 收集性能数据
   */
  private collectPerformanceData() {
    try {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resources = performance.getEntriesByType('resource')

      // 页面性能数据
      analytics.trackCustomEvent('page_performance', {
        // 页面加载时间
        pageLoadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstContentfulPaint: this.getFirstContentfulPaint(),
        firstByte: perfData.responseStart - perfData.requestStart,
        domReady: perfData.domInteractive - perfData.fetchStart,

        // 资源统计
        totalResources: resources.length,
        imageResources: resources.filter(r => (r as any).initiatorType === 'img').length,
        scriptResources: resources.filter(r => (r as any).initiatorType === 'script').length,
        cssResources: resources.filter(r => (r as any).initiatorType === 'link').length,

        // 网络信息
        connectionType: (navigator as any).connection?.effectiveType,
        downlink: (navigator as any).connection?.downlink,

        timestamp: Date.now()
      })
    } catch {
      console.warn('性能数据收集失败')
    }
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFirstContentfulPaint(): number | undefined {
    try {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      return fcpEntry?.startTime
    } catch {
      return undefined
    }
  }

  /**
   * 收集 Web Vitals 性能指标
   */
  private collectWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]

          analytics.trackCustomEvent('web_vitals_lcp', {
            value: lastEntry.startTime,
            rating: this.getLCPRating(lastEntry.startTime),
            timestamp: Date.now()
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })

          analytics.trackCustomEvent('web_vitals_cls', {
            value: clsValue,
            rating: this.getCLSRating(clsValue),
            timestamp: Date.now()
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            analytics.trackCustomEvent('web_vitals_fid', {
              value: entry.processingStart - entry.startTime,
              rating: this.getFIDRating(entry.processingStart - entry.startTime),
              timestamp: Date.now()
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch {
        console.warn('Web Vitals 监控初始化失败')
      }
    }
  }

  /**
   * LCP 评级
   */
  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good'
    if (value <= 4000) return 'needs-improvement'
    return 'poor'
  }

  /**
   * CLS 评级
   */
  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good'
    if (value <= 0.25) return 'needs-improvement'
    return 'poor'
  }

  /**
   * FID 评级
   */
  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good'
    if (value <= 300) return 'needs-improvement'
    return 'poor'
  }

  /**
   * 初始化滚动深度追踪
   */
  private initScrollTracking() {
    if (!this.options.enableScrollTracking) {
      return
    }

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.trackScrollDepth()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  /**
   * 追踪滚动深度
   */
  private trackScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)

    this.scrollThresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !this.scrollDepths.has(threshold)) {
        this.scrollDepths.add(threshold)
        analytics.trackScroll(threshold, {
          scrollTop,
          documentHeight,
          scrollPercentage,
          url: window.location.href,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * 初始化全局点击事件追踪（合并点击和链接追踪）
   */
  private initGlobalClickTracking() {
    if (!this.options.enableAutoClicks && !this.options.enableAutoLinkTracking) {
      return
    }

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement

      if (!target) {
        return
      }

      if (this.shouldExcludeElement(target)) {
        return
      }

      // 检查是否是链接点击
      const link = target.closest('a') as HTMLAnchorElement
      if (link && this.options.enableAutoLinkTracking) {
        // 发送链接点击埋点
        const isExternal = link.hostname !== window.location.hostname
        const isDownload = link.hasAttribute('download')

        analytics.trackCustomEvent('link_click', {
          linkText: link.textContent?.trim(),
          linkHref: link.href,
          linkTitle: link.title,
          isExternal,
          isDownload,
          target: link.target,
          clickX: event.clientX,
          clickY: event.clientY,
          timestamp: Date.now()
        })
      } else if (this.options.enableAutoClicks) {
        // 发送普通点击埋点
        const elementInfo = this.getElementInfo(target)
        const elementType = this.getElementType(target)

        analytics.trackClick(elementType, {
          ...elementInfo,
          clickX: event.clientX,
          clickY: event.clientY,
          timestamp: Date.now()
        })
      }
    }, { passive: true })
  }

  /**
   * 初始化全局表单追踪
   */
  private initGlobalFormTracking() {
    if (!this.options.enableAutoFormTracking) return

    // 表单提交追踪
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      if (!form || this.shouldExcludeElement(form)) return

      const formData = new FormData(form)
      const formFields = Array.from(formData.keys())

      analytics.trackCustomEvent('form_submit', {
        formId: form.id,
        formClass: form.className,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: formFields.length,
        fields: formFields, // 不包含具体值，只记录字段名
        timestamp: Date.now()
      })
    })

    // 表单字段焦点追踪
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement
      if (!this.isFormField(target) || this.shouldExcludeElement(target)) return

      analytics.trackCustomEvent('form_field_focus', {
        fieldType: target.tagName.toLowerCase(),
        fieldName: (target as HTMLInputElement).name,
        fieldId: target.id,
        inputType: (target as HTMLInputElement).type,
        timestamp: Date.now()
      })
    }, { passive: true })
  }

  /**
   * 初始化元素可见性追踪
   */
  private initVisibilityTracking() {
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const elementInfo = this.getElementInfo(element)

          // 只追踪重要元素
          if (this.isImportantElement(element)) {
            analytics.trackCustomEvent('element_visible', {
              ...elementInfo,
              visibilityRatio: entry.intersectionRatio,
              timestamp: Date.now()
            })
            observer.unobserve(element)
          }
        }
      })
    }, { threshold: 0.5 })

    // 观察页面上的重要元素
    setTimeout(() => {
      const importantSelectors = [
        '[data-track-visible]',
        '.carousel-slide',
        '.research-card',
        '.hero-section',
        '.feature-section'
      ]

      importantSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          observer.observe(el)
        })
      })
    }, 1000)
  }

  /**
   * 检查元素是否应该被排除
   */
  private shouldExcludeElement(element: HTMLElement): boolean {
    // 检查排除选择器
    for (const selector of this.options.excludeSelectors || []) {
      if (element.matches(selector)) return true
    }

    // 检查父元素是否有排除标识
    let parent = element.parentElement
    while (parent) {
      for (const selector of this.options.excludeSelectors || []) {
        if (parent.matches(selector)) return true
      }
      parent = parent.parentElement
    }

    return false
  }

  /**
   * 获取元素信息
   */
  private getElementInfo(element: HTMLElement) {
    return {
      tagName: element.tagName.toLowerCase(),
      elementId: element.id,
      elementClass: element.className,
      elementText: element.textContent?.trim()?.substring(0, 100), // 限制长度
      elementHtml: element.outerHTML?.substring(0, 200), // 限制长度
      elementPath: this.getElementPath(element)
    }
  }

  /**
   * 获取元素类型
   */
  private getElementType(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()

    if (tagName === 'button' || (tagName === 'input' && (element as HTMLInputElement).type === 'button')) {
      return 'button'
    }

    if (tagName === 'a') {
      return 'link'
    }

    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return 'form_field'
    }

    if (element.closest('.carousel-container')) {
      return 'carousel_element'
    }

    if (element.closest('.nav') || element.closest('nav')) {
      return 'navigation'
    }

    return tagName
  }

  /**
   * 检查是否为表单字段
   */
  private isFormField(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    return ['input', 'textarea', 'select'].includes(tagName)
  }

  /**
   * 检查是否为重要元素
   */
  private isImportantElement(element: HTMLElement): boolean {
    const importantSelectors = [
      '[data-track-visible]',
      '.carousel-slide',
      '.research-card',
      '.hero-section',
      '.feature-section',
      'h1', 'h2', 'h3'
    ]

    return importantSelectors.some(selector => element.matches(selector))
  }

  /**
   * 获取元素路径
   */
  private getElementPath(element: HTMLElement): string {
    const path = []
    let current = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()

      if (current.id) {
        selector += `#${current.id}`
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c).slice(0, 2)
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`
        }
      }

      path.unshift(selector)
      current = current.parentElement as HTMLElement
    }

    return path.join(' > ')
  }

  /**
   * 添加自定义指令支持
   */
  static createDirectives() {
    return {
      // v-track-click 指令
      'track-click': {
        mounted(el: HTMLElement, binding: any) {
          const { value, arg, modifiers } = binding

          el.addEventListener('click', () => {
            const eventData = {
              element: arg || el.tagName.toLowerCase(),
              text: el.textContent?.trim(),
              ...value
            }

            if (modifiers.button) {
              analytics.trackClick('button', eventData)
            } else if (modifiers.link) {
              analytics.trackClick('link', { ...eventData, href: (el as HTMLAnchorElement).href })
            } else {
              analytics.trackClick(eventData.element, eventData)
            }
          })
        }
      },

      // v-track-view 指令 - 元素进入视口时触发
      'track-view': {
        mounted(el: HTMLElement, binding: any) {
          const { value } = binding

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                analytics.trackCustomEvent('element_view', {
                  element: el.tagName.toLowerCase(),
                  elementId: el.id,
                  elementClass: el.className,
                  ...value
                })
                observer.unobserve(el)
              }
            })
          }, { threshold: 0.5 })

          observer.observe(el)
        }
      }
    }
  }
}

export default AnalyticsPlugin
