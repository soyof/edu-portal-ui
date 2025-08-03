// import { downloadFile } from '@/utils/fileUtils'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosInstance } from 'axios'
import { ElMessage as Message } from 'element-plus'
import { getNewUrl } from '@/utils/utils'

/**
 * 为URL添加时间戳参数，避免缓存
 * @param url 原始URL
 * @returns 添加了时间戳的URL
 */
const addTimestampToUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}timestamp=${new Date().getTime()}`
}

/**
 * Axios配置选项接口
 */
interface AxiosOption {
    baseURL: string
    timeout: number
    retry: number
    retryDelay: number
    headers?: Record<string, string>
}

/**
 * 统一响应数据结构
 */
export interface ResponseData<T = any> {
    status: number
    message?: string
    data: T
    code: string
}

/**
 * 错误提示函数
 */
const errorFn = (error: string) => {
  Message.error(error || '服务器异常！')
}

/**
 * 默认配置
 */
const config: AxiosOption = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 15000,
  retry: 0, // 请求重试次数
  retryDelay: 1000, // 请求重试间隔1秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
}

/**
 * 请求取消控制器映射
 */
const pendingMap = new Map<string, AbortController>()

/**
 * 生成请求Key
 */
const generateRequestKey = (config: AxiosRequestConfig): string => {
  const { url, method, params, data } = config
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}

/**
 * 添加请求到pendingMap
 */
const addPending = (config: AxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config)
  if (!pendingMap.has(requestKey)) {
    const controller = new AbortController()
    config.signal = controller.signal
    pendingMap.set(requestKey, controller)
  }
}

/**
 * 移除请求从pendingMap
 */
const removePending = (config: AxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config)
  if (pendingMap.has(requestKey)) {
    pendingMap.delete(requestKey)
  }
}

/**
 * 取消重复请求
 */
const cancelPending = (config: AxiosRequestConfig): void => {
  const requestKey = generateRequestKey(config)
  if (pendingMap.has(requestKey)) {
    const controller = pendingMap.get(requestKey)
    controller?.abort()
    pendingMap.delete(requestKey)
  }
}

class Services {
  service: AxiosInstance
  private retryCount: Map<string, number> = new Map()

  constructor(config: AxiosOption) {
    this.service = axios.create(config)

    // 请求拦截
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 取消重复请求
        cancelPending(config)
        // 添加请求到pendingMap
        addPending(config)

        return config
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        // 移除请求
        removePending(response.config)
        // 重置重试计数
        const requestKey = generateRequestKey(response.config)
        this.retryCount.delete(requestKey)

        const data = response.data

        if (response.request.responseType === 'blob') {
          return response
        }

        // 根据业务状态码处理
        if (response.status === 200) {
          // 可以根据后端接口规范判断业务状态码
          if (data.status === 200 && data.errorCode === 0) {
            return data.data
          }

          // 处理需要退出登录的业务状态码
          // 注意: 以下errorCode需要根据实际业务接口规范调整
          // 常见的登录失效相关错误码: token过期、token无效、用户被禁用、账号在其他设备登录等
          if (data.errorCode === 401) {
            return Promise.reject(data)
          }

          errorFn(data.message || '请求失败')
          return Promise.reject(data)
        }
        errorFn('请求失败，请重试')
        return Promise.reject(data)
      },
      async(error: any) => {
        // 如果请求被取消，不进行重试
        if (axios.isCancel(error)) {
          return Promise.reject(error)
        }

        // 移除请求
        const config = error.config
        if (config) {
          removePending(config)

          // 请求重试
          const requestKey = generateRequestKey(config)
          const currentRetryCount = this.retryCount.get(requestKey) || 0

          if (currentRetryCount < (config as any).retry) {
            this.retryCount.set(requestKey, currentRetryCount + 1)
            await new Promise(resolve => setTimeout(resolve, (config as any).retryDelay))
            return this.service(config)
          }

          // 重置重试计数
          this.retryCount.delete(requestKey)
        }

        // 处理HTTP错误状态码
        if (error.response) {
          const status = error.response.status
          switch (status) {
            case 401:
              break
            case 403:
              errorFn('没有权限访问该资源')
              break
            case 404:
              errorFn('请求的资源不存在')
              break
            case 500:
              errorFn('服务器内部错误')
              break
            default:
              errorFn(`请求失败，状态码：${status}`)
          }
        } else if (error.request) {
          errorFn('网络异常，请检查您的网络连接')
        } else {
          errorFn(`请求配置错误: ${error.message || '未知错误'}`)
        }

        return Promise.reject(error)
      }
    )
  }

  /**
  * 并发请求
  */
  all<T>(urls: Array<Promise<T>>): Promise<T[]> {
    return Promise.all(urls)
  }

  get<T>(url: string, params?: Record<string, any>, config: AxiosRequestConfig = {}): Promise<ResponseData<T>> {
    // 添加参数到URL，但不添加时间戳（时间戳会单独添加）
    const urlWithParams = params ? getNewUrl(url, params) : url
    // 添加时间戳到URL
    const urlWithTimestamp = addTimestampToUrl(urlWithParams)
    return this.service.get(urlWithTimestamp, config)
  }

  post<T>(url: string, data?: Record<string, any>, config: AxiosRequestConfig = {}): Promise<ResponseData<T>> {
    // 添加时间戳到URL，而不是添加到请求体
    const urlWithTimestamp = addTimestampToUrl(url)
    return this.service.post(urlWithTimestamp, data, config)
  }

  put<T>(url: string, data?: Record<string, any>, config: AxiosRequestConfig = {}): Promise<ResponseData<T>> {
    // 添加时间戳到URL，而不是添加到请求体
    const urlWithTimestamp = addTimestampToUrl(url)
    return this.service.put(urlWithTimestamp, data, config)
  }

  delete<T>(url: string, params?: Record<string, any>, config: AxiosRequestConfig = {}): Promise<ResponseData<T>> {
    // 添加参数到URL，但不添加时间戳（时间戳会单独添加）
    const urlWithParams = params ? getNewUrl(url, params) : url
    // 添加时间戳到URL
    const urlWithTimestamp = addTimestampToUrl(urlWithParams)
    return this.service.delete(urlWithTimestamp, config)
  }

  getDownload(url: string, params?: Record<string, any>, fileName = ''): Promise<void> {
    // 添加参数到URL，但不添加时间戳（时间戳会单独添加）
    const urlWithParams = params ? getNewUrl(url, params) : url
    // 添加时间戳到URL
    const urlWithTimestamp = addTimestampToUrl(urlWithParams)
    return this.service.get(urlWithTimestamp, {
      responseType: 'blob'
    }).then((response) => {
      // 获取文件名
      let downloadFileName = fileName
      if (!downloadFileName) {
        const contentDisposition = response.headers['content-disposition']
        if (contentDisposition) {
          const match = contentDisposition.match(/filename=["']?([^"']+)["']?/)
          if (match && match[1]) {
            downloadFileName = decodeURIComponent(match[1])
          }
        }
        downloadFileName = downloadFileName || 'download'
      }

      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = downloadFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
    })
  }

  upload<T>(url: string, file: File | FormData, onProgress?: (percent: number) => void, config: AxiosRequestConfig = {}): Promise<ResponseData<T>> {
    let formData: FormData

    if (file instanceof FormData) {
      formData = file
    } else {
      formData = new FormData()
      formData.append('file', file)
    }

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    }

    return this.service.post(url, formData, uploadConfig)
  }

  cancelAllRequests(): void {
    pendingMap.forEach((controller) => {
      controller.abort()
    })
    pendingMap.clear()
  }

  cancelRequest(config: AxiosRequestConfig): void {
    cancelPending(config)
  }
}

// 创建服务实例
const service = new Services(config)

export default service
