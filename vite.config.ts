import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    proxy: {
      // 代理所有 /api 前缀的请求到目标服务器
      '/api': {
        target: 'http://127.0.0.1:3200', // 后端服务地址
        changeOrigin: true, // 支持跨域
        rewrite: (path) => path.replace(/^\/api/, '/eduPortal'), // 重写路径，将/api/login转换为/eduPortal/login
        secure: false, // 如果是https接口，需要配置这个参数
        ws: true // 是否代理 websockets
      }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "@/styles/variables.less";'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
