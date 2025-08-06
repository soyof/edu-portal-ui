<template>
  <div class="about-page">
    <!-- 动态背景层 -->
    <div class="background-layers">
      <div class="grid-layer"></div>
      <div class="particle-layer">
        <div
          v-for="i in 30"
          :key="i"
          class="floating-particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>
      <div class="wave-layer">
        <svg class="wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill" />
        </svg>
      </div>
    </div>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="title-wrapper">
            <h1 class="main-title">
              <span class="title-text">{{ $t('about.title') }}</span>
              <span class="title-glow"></span>
            </h1>
            <div class="title-underline">
              <div class="line line-1"></div>
              <div class="line line-2"></div>
              <div class="line line-3"></div>
            </div>
          </div>
          <!-- <p class="hero-subtitle">探索我们的使命、愿景与发展历程</p> -->
        </div>

        <!-- 装饰元素 -->
        <div class="hero-decorations">
          <div class="decoration decoration-1"></div>
          <div class="decoration decoration-2"></div>
          <div class="decoration decoration-3"></div>
        </div>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner-circle"></div>
            <div class="spinner-pulse"></div>
          </div>
          <p class="loading-text">{{ $t('global.loading') }}</p>
        </div>

        <!-- 内容展示 -->
        <div v-else-if="profileData?.content" class="content-wrapper">
          <!-- 内容卡片 -->
          <div class="content-card">
            <div class="card-glow"></div>
            <div class="card-border"></div>

            <!-- 卡片头部 -->
            <div class="card-header">
              <div class="header-line"></div>
              <div class="status-indicators">
                <span class="indicator active"></span>
                <span class="indicator"></span>
                <span class="indicator"></span>
              </div>
            </div>

            <!-- 内容主体 -->
            <div class="card-content">
              <div class="html-content" v-html="profileData.content"></div>
            </div>

            <!-- 卡片底部 -->
            <div class="card-footer">
              <div class="footer-info">
                <span v-if="profileData?.updatedTimes" class="update-time">
                  {{ $t('about.lastUpdated') }}: {{ formatDate(profileData.updatedTimes) }}
                </span>
              </div>
              <div class="footer-decoration">
                <div class="deco-line"></div>
              </div>
            </div>
          </div>

          <!-- 侧边装饰 -->
          <div class="side-decorations">
            <div class="side-line"></div>
            <div class="side-dots">
              <div v-for="i in 5" :key="i" class="dot"></div>
            </div>
          </div>
        </div>

        <!-- 无数据状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <div class="icon-circle">
              <span>!</span>
            </div>
          </div>
          <h3 class="empty-title">{{ $t('about.noContent') }}</h3>
          <p class="empty-text">{{ $t('about.contentPreparation') }}</p>
          <button class="retry-btn" @click="fetchProfileData">
            <span>{{ $t('global.reload') }}</span>
            <div class="btn-glow"></div>
          </button>
        </div>
      </div>
    </section>

    <!-- 底部装饰波浪 -->
    <div class="bottom-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import service from '@/utils/services'
import { useMultiLang } from '@/hooks/useMultiLang'

// 定义接口返回的数据类型
interface InstituteProfile {
  id: string
  title: string
  content: string
  contentEn: string
  publishTimes: string
  updatedTimes: string
}

// 响应式数据
const loading = ref(true)
const rawProfileData = ref<InstituteProfile | null>(null)

// 多语言处理
const { multiLangData, setData } = useMultiLang<InstituteProfile>()
const { locale } = useI18n()

// 获取处理后的数据
const profileData = computed(() => multiLangData.value)

// 获取粒子样式
const getParticleStyle = (index: number) => {
  const baseDelay = (index * 0.2) + 's'
  const leftPos = (index * 3.3) + '%'
  const topPos = (index * 2.7 % 80) + '%'
  const animationDuration = (4 + (index % 4)) + 's'

  return {
    left: leftPos,
    top: topPos,
    animationDelay: baseDelay,
    animationDuration: animationDuration
  }
}

// 格式化日期（支持多语言）
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const localeCode = locale.value === 'zh' ? 'zh-CN' : 'en-US'
  return date.toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取简介数据
const fetchProfileData = () => {
  loading.value = true
  service.get<InstituteProfile>('/api/instituteProfile').then((res: any) => {
    rawProfileData.value = res || {}
    // 设置多语言数据处理
    if (res) {
      setData(res)
      console.log('处理后的多语言数据:', multiLangData.value)
    }
  }).finally(() => {
    loading.value = false
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProfileData()
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.about-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;

  // 默认主题背景
  background: var(--light-color);

  // 暗色模式背景
  .dark-mode & {
    background: var(--dark-background);
  }

  // 紫色主题背景
  .purple-theme & {
    background: linear-gradient(135deg,
      rgba(247, 247, 255, 1) 0%,
      rgba(247, 247, 255, 0.95) 50%,
      rgba(70, 38, 125, 0.02) 100%);
  }

  .purple-theme.dark-mode & {
    background: linear-gradient(135deg,
      rgba(18, 18, 37, 1) 0%,
      rgba(26, 26, 46, 0.95) 50%,
      rgba(55, 28, 98, 0.08) 100%);
  }
}

// 动态背景层
.background-layers {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;

  .grid-layer {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba(var(--primary-color-rgb), 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(var(--primary-color-rgb), 0.03) 1px, transparent 1px);
    background-size: 100px 100px;
    animation: gridFloat 20s ease-in-out infinite;
  }

  .particle-layer {
    position: absolute;
    width: 100%;
    height: 100%;

    .floating-particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: radial-gradient(circle, var(--primary-color), transparent);
      border-radius: 50%;
      animation: particleFloat 6s ease-in-out infinite;

      &:nth-child(3n) {
        background: radial-gradient(circle, var(--accent-color), transparent);
      }

      &:nth-child(5n) {
        background: radial-gradient(circle, var(--secondary-color), transparent);
      }
    }
  }

  .wave-layer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 15vh;
    overflow: hidden;

    .wave {
      width: 100%;
      height: 100%;

      .shape-fill {
        fill: rgba(var(--primary-color-rgb), 0.05);
        animation: waveMove 8s ease-in-out infinite;
      }
    }
  }
}

// 英雄区域
.hero-section {
  position: relative;
  z-index: 10;
  padding: 3rem 0;
  text-align: center;

  .hero-content {
    position: relative;

    .title-wrapper {
      margin-bottom: 2rem;

      .main-title {
        position: relative;
        display: inline-block;
        margin: 0;

        .title-text {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          color: var(--primary-color);
          position: relative;
          z-index: 2;

          .dark-mode & {
            color: #4fd1c7;
          }
        }
      }

      .title-underline {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 1rem;

        .line {
          height: 3px;
          border-radius: 2px;
          animation: lineExpand 2s ease-in-out infinite;

          &.line-1 {
            width: 60px;
            background: linear-gradient(90deg, #00b8a9, #00e0c7);
            animation-delay: 0s;
          }

          &.line-2 {
            width: 40px;
            background: linear-gradient(90deg, #7f44f8, #9d4eff);
            animation-delay: 0.3s;
          }

          &.line-3 {
            width: 30px;
            background: linear-gradient(90deg, #00e0c7, #00b8a9);
            animation-delay: 0.6s;
          }
        }
      }
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: rgba(26, 26, 46, 0.7);
      font-weight: 300;
      letter-spacing: 1px;

      .dark-mode & {
        color: rgba(247, 247, 255, 0.7);
      }
    }
  }

  .hero-decorations {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .decoration {
      position: absolute;
      border: 2px solid rgba(0, 184, 169, 0.3);
      border-radius: 50%;
      animation: decorationRotate 15s linear infinite;

      &.decoration-1 {
        width: 100px;
        height: 100px;
        top: 20%;
        left: 10%;
        animation-delay: 0s;
      }

      &.decoration-2 {
        width: 60px;
        height: 60px;
        top: 60%;
        right: 15%;
        animation-delay: -5s;
        animation-direction: reverse;
      }

      &.decoration-3 {
        width: 80px;
        height: 80px;
        bottom: 20%;
        left: 20%;
        animation-delay: -10s;
      }
    }
  }
}

// 内容区域
.content-section {
  position: relative;
  z-index: 10;
  padding: 2rem 0 4rem;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;

  .loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 2rem;

    .spinner-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-pulse {
      position: absolute;
      width: 60px;
      height: 60px;
      top: 10px;
      left: 10px;
      background: radial-gradient(circle, rgba(var(--primary-color-rgb), 0.2), transparent);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }
  }

  .loading-text {
    color: rgba(26, 26, 46, 0.8);
    font-size: 1.1rem;
    font-weight: 300;

    .dark-mode & {
      color: rgba(247, 247, 255, 0.8);
    }
  }
}

// 内容包装器
.content-wrapper {
  position: relative;
  display: flex;
  gap: 2rem;
  // max-width: 1000px;
  margin: 0 auto;

    .content-card {
    flex: 1;
    position: relative;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(var(--primary-color-rgb), 0.08);
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.02);

    .dark-mode & {
      background: rgba(26, 26, 46, 0.3);
      border: 1px solid rgba(var(--primary-color-rgb), 0.12);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }

    .purple-theme & {
      background: rgba(247, 247, 255, 0.4);
      border: 1px solid rgba(70, 38, 125, 0.06);
    }

    .purple-theme.dark-mode & {
      background: rgba(18, 18, 37, 0.4);
      border: 1px solid rgba(105, 56, 181, 0.15);
    }

    .card-glow {
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(45deg,
        var(--primary-color),
        var(--accent-color),
        var(--secondary-color),
        var(--primary-color));
      border-radius: 20px;
      z-index: -1;
      opacity: 0.1;
      animation: borderGlow 6s linear infinite;

      .dark-mode & {
        opacity: 0.2;
      }
    }

    .card-border {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg,
        var(--primary-color),
        var(--accent-color),
        var(--secondary-color));
      opacity: 0.3;
      animation: borderMove 4s ease-in-out infinite;

      .dark-mode & {
        opacity: 0.5;
      }
    }

    .card-header {
      padding: 1.5rem 2rem 1rem;
      border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.06);
      display: flex;
      align-items: center;
      gap: 1rem;

      .dark-mode & {
        border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.1);
      }

      .header-line {
        width: 30px;
        height: 2px;
        background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      }

      .status-indicators {
        display: flex;
        gap: 6px;

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(26, 26, 46, 0.3);
          transition: all 0.3s ease;

          .dark-mode & {
            background: rgba(247, 247, 255, 0.3);
          }

          &.active {
            background: var(--primary-color);
            box-shadow: 0 0 10px rgba(var(--primary-color-rgb), 0.5);
            animation: indicatorPulse 2s ease-in-out infinite;
          }
        }
      }

      .header-text {
        color: rgba(26, 26, 46, 0.8);
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 1px;
        text-transform: uppercase;

        .dark-mode & {
          color: rgba(247, 247, 255, 0.8);
        }
      }
    }

    .card-content {
      padding: 0 2rem;
      color: rgba(26, 26, 46, 0.9);

      .dark-mode & {
        color: rgba(247, 247, 255, 0.9);
      }
    }

    .card-footer {
      padding: 1rem 2rem 1.5rem;
      border-top: 1px solid rgba(var(--primary-color-rgb), 0.06);

      .dark-mode & {
        border-top: 1px solid rgba(var(--primary-color-rgb), 0.1);
      }

      .footer-info {
        margin-bottom: 1rem;

        .update-time {
          color: rgba(26, 26, 46, 0.6);
          font-size: 0.85rem;

          .dark-mode & {
            color: rgba(247, 247, 255, 0.6);
          }
        }
      }

      .footer-decoration {
        .deco-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
        }
      }
    }
  }

  .side-decorations {
    width: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .side-line {
      width: 2px;
      height: 100px;
      background: linear-gradient(180deg, var(--primary-color), transparent);
    }

    .side-dots {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(var(--primary-color-rgb), 0.6);
        animation: dotPulse 2s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
        &:nth-child(4) { animation-delay: 0.6s; }
        &:nth-child(5) { animation-delay: 0.8s; }
      }
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 4rem 0;

  .empty-icon {
    margin-bottom: 2rem;

    .icon-circle {
      width: 80px;
      height: 80px;
      border: 2px solid rgba(26, 26, 46, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      position: relative;

      .dark-mode & {
        border: 2px solid rgba(247, 247, 255, 0.2);
      }

      span {
        font-size: 2rem;
        color: rgba(26, 26, 46, 0.6);
        font-weight: bold;

        .dark-mode & {
          color: rgba(247, 247, 255, 0.6);
        }
      }

      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid var(--primary-color);
        border-radius: 50%;
        opacity: 0;
        animation: iconPulse 3s ease-in-out infinite;
      }
    }
  }

  .empty-title {
    color: rgba(26, 26, 46, 0.9);
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;

    .dark-mode & {
      color: rgba(247, 247, 255, 0.9);
    }
  }

  .empty-text {
    color: rgba(26, 26, 46, 0.6);
    font-size: 1rem;
    margin-bottom: 2rem;

    .dark-mode & {
      color: rgba(247, 247, 255, 0.6);
    }
  }

  .retry-btn {
    position: relative;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border: none;
    border-radius: 25px;
    padding: 12px 30px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    span {
      position: relative;
      z-index: 2;
    }

    .btn-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);

      .btn-glow {
        opacity: 1;
      }
    }
  }
}

// 底部波浪
.bottom-wave {
  position: relative;
  z-index: 10;
  height: 100px;
  overflow: hidden;

  svg {
    width: 100%;
    height: 100%;

    .shape-fill {
      fill: rgba(var(--primary-color-rgb), 0.1);
    }
  }
}

// 动画定义
@keyframes gridFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 1;
  }
}

@keyframes waveMove {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(-20px); }
}

@keyframes lineExpand {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.2); }
}

@keyframes decorationRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// spin 动画已在全局样式中定义

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes borderGlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes borderMove {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

@keyframes indicatorPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

@keyframes iconPulse {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

// 响应式设计
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;

    .hero-content .title-wrapper .main-title .title-text {
      font-size: clamp(2rem, 8vw, 3rem);
    }

    .hero-decorations .decoration {
      display: none;
    }
  }

  .content-wrapper {
    flex-direction: column;
    padding: 0 1rem;

    .side-decorations {
      display: none;
    }

    .content-card {
      .card-header,
      .card-content,
      .card-footer {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }
  }

  .background-layers .particle-layer .floating-particle {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 1.5rem 0;
  }

  .content-wrapper .content-card {
    margin: 0;
    border-radius: 15px;

    .card-header,
    .card-content,
    .card-footer {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
}
</style>

