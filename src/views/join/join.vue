<template>
  <div class="join-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="neural-network"></div>
        <div class="floating-particles"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">
            <span class="title-icon">🚀</span>
            <span class="title-text">{{ $t('join.title') }}</span>
          </h1>
          <p class="hero-subtitle">{{ $t('join.subtitle', '携手顶尖科研团队，共创生物科技未来') }}</p>

          <div v-if="!loading && recruitmentData.length" class="stats-overview">
            <div class="stat-item">
              <span class="stat-number">{{ getTotalPositions() }}+</span>
              <span class="stat-label">{{ $t('join.openPositions', '开放职位') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ recruitmentData.length }}+</span>
              <span class="stat-label">{{ $t('join.categories', '招聘类别') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="content-section">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-container">
            <div class="dna-spinner">
              <div class="dna-helix"></div>
              <div class="dna-helix"></div>
              <div class="dna-helix"></div>
            </div>
            <div class="loading-text-wrapper">
              <p class="loading-text">{{ $t('global.loading') }}</p>
              <div class="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 招聘信息展示 -->
        <div v-else-if="recruitmentData.length" class="recruitment-content">
          <div
            v-for="category in recruitmentData"
            :key="category.recruitmentType"
            class="category-section"
          >
            <!-- 分类标题 -->
            <div class="category-header">
              <h2 class="category-title">
                <span class="title-marker"></span>
                <span class="title-text">{{ getCurrentLanguageText(category.typeName, category.typeNameEn) }}</span>
                <div class="title-beam"></div>
              </h2>
            </div>

            <!-- 招聘职位网格 -->
            <div class="positions-grid">
              <div
                v-for="position in category.items"
                :key="position.id"
                class="position-card"
                :class="{ 'featured': isRecentPosition(position.publishTimes) }"
              >
                <div class="card-glow"></div>

                <!-- 职位标签 -->
                <div v-if="isRecentPosition(position.publishTimes)" class="position-tag">
                  <span class="tag-icon">⭐</span>
                  <span>{{ $t('join.newPosition', '最新职位') }}</span>
                </div>

                <!-- 职位内容 -->
                <div class="position-content">
                  <div class="position-body">
                    <div class="html-content" v-html="getCurrentLanguageText(position.content, position.contentEn)"></div>
                  </div>

                  <div v-if="position.publishTimes" class="position-meta">
                    <div class="meta-item">
                      <i class="meta-icon">📅</i>
                      <span>{{ $t('join.publishTime', '发布时间') }}: {{ formatDate(position.publishTimes) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-animation">
            <div class="floating-molecules">
              <div class="molecule"></div>
              <div class="molecule"></div>
              <div class="molecule"></div>
            </div>
            <div class="empty-icon">
              <div class="icon-pulse">💼</div>
            </div>
          </div>
          <h3 class="empty-title">{{ $t('join.noPositions', '暂无招聘信息') }}</h3>
          <p class="empty-text">{{ $t('join.noPositionsDesc', '目前没有发布招聘信息，请稍后再试或联系我们了解更多机会') }}</p>
          <button class="retry-btn" @click="fetchRecruitmentData">
            <span class="btn-text">{{ $t('global.reload', '重新加载') }}</span>
            <div class="btn-ripple"></div>
          </button>
        </div>
      </div>
    </section>

    <!-- 联系我们区域 -->
    <section v-if="contactInfo" class="contact-section">
      <div class="container">
        <div class="contact-content">
          <div class="contact-info">
            <h2 class="contact-title">
              <span class="title-icon">📞</span>
              <span>{{ $t('join.contactUs', '联系我们') }}</span>
            </h2>

            <div class="contact-links">
              <div v-for="item in contactInfo.items" :key="item.id" class="contact-item">
                <div class="html-content" v-html="getCurrentLanguageText(item.content, item.contentEn)"></div>
              </div>
            </div>
          </div>

          <div class="contact-visual">
            <div class="visual-container">
              <div class="orbit-animation">
                <div class="orbit"></div>
                <div class="orbit"></div>
                <div class="orbit"></div>
                <div class="center-icon">🧬</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import service from '@/utils/services'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMultiLang } from '@/hooks/useMultiLang'

// 定义接口类型
export interface RecruitResponse {
  id: number // 招聘信息ID
  recruitmentType: string // 招聘类型(对应字典表dict_id)
  content: string // 中文内容
  contentEn?: string // 英文内容
  status: string // 状态: 1(生效中), 2(已存档), 0(未发布)
  publishUserId?: string // 发布人(用户编号)
  publishTimes?: string // 发布时间
  createUserId: string // 创建人(用户编号)
  createdTimes: string // 创建时间
  updateUserId: string // 更新人(用户编号)
  updatedTimes: string // 更新时间
}

// 招聘信息分类响应数据
export interface RecruitmentByTypeResponse {
  recruitmentType: string // 招聘类型(字典ID)
  typeName: string // 招聘类型名称(中文)
  typeNameEn?: string // 招聘类型名称(英文)
  items: RecruitResponse[] // 该类型下的招聘信息列表
}

// 国际化和多语言
const { locale } = useI18n()

// 响应式数据
const loading = ref(true)
const recruitmentData = ref<RecruitmentByTypeResponse[]>([])
const contactInfo = ref<RecruitmentByTypeResponse | null>(null)

// 多语言处理
const { setData: setRecruitmentData } = useMultiLang<RecruitmentByTypeResponse[]>()

// 获取招聘数据和联系信息
const fetchRecruitmentData = async() => {
  try {
    loading.value = true
    const res = await service.get('/api/recruitment')
    const data = res as unknown as RecruitmentByTypeResponse[]

    if (data && Array.isArray(data)) {
      // 分离联系我们信息和招聘信息
      const contactData = data.find(item => item.recruitmentType === '4003')
      const recruitmentDataFiltered = data.filter(item => item.recruitmentType !== '4003')

      // 设置招聘数据
      recruitmentData.value = recruitmentDataFiltered || []
      if (recruitmentDataFiltered.length > 0) {
        setRecruitmentData(recruitmentDataFiltered)
      }

      // 设置联系信息
      contactInfo.value = contactData || null
    } else {
      recruitmentData.value = []
      contactInfo.value = null
    }
  } catch (error) {
    console.error('获取招聘信息失败:', error)
    recruitmentData.value = []
    contactInfo.value = null
  } finally {
    loading.value = false
  }
}

// 获取总职位数
const getTotalPositions = (): number => {
  return recruitmentData.value.reduce((total, category) => {
    return total + category.items.filter(item => item.status === '1').length
  }, 0)
}

// 获取当前语言文本
const getCurrentLanguageText = (zhText: string, enText?: string): string => {
  if (locale.value === 'en' && enText) {
    return enText
  }
  return zhText
}

// 判断是否为最近发布的职位（7天内）
const isRecentPosition = (publishTime?: string): boolean => {
  if (!publishTime) return false
  const publishDate = new Date(publishTime)
  const now = new Date()
  const daysDiff = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)
  return daysDiff <= 7
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 页面挂载时获取数据
onMounted(() => {
  fetchRecruitmentData()
})
</script>

<style lang="less" scoped>
// 现代科技感设计
.join-page {
  min-height: 100vh;
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb), 0.03) 0%,
    rgba(var(--accent-color-rgb), 0.02) 50%,
    rgba(var(--primary-color-rgb), 0.01) 100%);
  position: relative;
  overflow-x: hidden;
}

// 英雄区域
.hero-section {
  position: relative;
  padding: 120px 0 80px;
  text-align: center;
  overflow: hidden;
  background: radial-gradient(ellipse at center top,
    rgba(var(--primary-color-rgb), 0.1) 0%,
    transparent 70%);

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .neural-network {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(circle at 25% 25%, rgba(var(--primary-color-rgb), 0.1) 1px, transparent 1px),
        radial-gradient(circle at 75% 25%, rgba(var(--accent-color-rgb), 0.08) 1px, transparent 1px),
        radial-gradient(circle at 25% 75%, rgba(var(--primary-color-rgb), 0.06) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(var(--accent-color-rgb), 0.1) 1px, transparent 1px);
      background-size: 120px 120px, 180px 180px, 90px 90px, 250px 250px;
      animation: networkFloat 25s ease-in-out infinite;
    }

    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;

      &::before, &::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: float 8s ease-in-out infinite;
        box-shadow: 0 0 12px rgba(var(--primary-color-rgb), 0.6);
      }

      &::before {
        top: 25%;
        left: 20%;
        animation-delay: -3s;
      }

      &::after {
        top: 65%;
        right: 25%;
        animation-delay: -6s;
        background: var(--accent-color);
        box-shadow: 0 0 12px rgba(var(--accent-color-rgb), 0.6);
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
  }

  .page-title {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    margin-bottom: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    position: relative;
    display: inline-block;

    .title-icon {
      display: inline-block;
      margin-right: 0.5rem;
      filter: drop-shadow(0 0 15px rgba(var(--primary-color-rgb), 0.4));
      animation: iconPulse 3s ease-in-out infinite;
    }

    .title-text {
      position: relative;
    }
  }

  .hero-subtitle {
    font-size: 1.3rem;
    color: var(--text-color-secondary);
    margin-bottom: 3rem;
    font-weight: 300;
    letter-spacing: 0.5px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .stats-overview {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-top: 2rem;

    .stat-item {
      text-align: center;
      padding: 1.5rem 2rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(15px);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 15px 40px rgba(var(--primary-color-rgb), 0.15);
      }

      .stat-number {
        display: block;
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
      }

      .stat-label {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
  }
}

// 内容区域
.content-section {
  padding: 60px 0 100px;
  position: relative;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  position: relative;

  .loading-container {
    text-align: center;
    position: relative;
  }

  .dna-spinner {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 3rem;

    .dna-helix {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid transparent;
      border-radius: 50%;
      animation: dnaRotate 2s linear infinite;

      &:nth-child(1) {
        border-top: 2px solid var(--primary-color);
        animation-delay: 0s;
        transform: scale(1);
      }

      &:nth-child(2) {
        border-right: 2px solid var(--accent-color);
        animation-delay: -0.6s;
        transform: scale(0.8);
      }

      &:nth-child(3) {
        border-bottom: 2px solid var(--primary-color);
        animation-delay: -1.2s;
        transform: scale(0.6);
      }
    }

    &::after {
      content: '🧬';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      animation: iconPulse 2s ease-in-out infinite;
    }
  }

  .loading-text-wrapper {
    .loading-text {
      color: var(--text-color);
      font-size: 1.2rem;
      font-weight: 300;
      margin-bottom: 1rem;
      letter-spacing: 1px;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;

      span {
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: loadingDots 1.4s ease-in-out infinite both;

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { animation-delay: 0s; }
      }
    }
  }
}

// 分类区域
.category-section {
  margin-bottom: 5rem;

  .category-header {
    margin-bottom: 3rem;

    .category-title {
      font-size: 2.2rem;
      font-weight: 600;
      color: var(--text-color);
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;

      .title-marker {
        width: 6px;
        height: 40px;
        background: linear-gradient(180deg, var(--primary-color), var(--accent-color));
        border-radius: 3px;
        position: relative;
        box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.5);

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, var(--primary-color), var(--accent-color));
          border-radius: 3px;
          filter: blur(8px);
          opacity: 0.6;
          z-index: -1;
        }
      }

      .title-text {
        color: var(--primary-color);
        position: relative;
      }

      .position-count {
        font-size: 0.9rem;
        color: var(--primary-color);
        font-weight: 600;
        background: linear-gradient(135deg,
          rgba(var(--primary-color-rgb), 0.15),
          rgba(var(--accent-color-rgb), 0.1));
        padding: 0.4rem 1rem;
        border-radius: 25px;
        border: 1px solid rgba(var(--primary-color-rgb), 0.25);
        backdrop-filter: blur(15px);
        box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.2);
          background: linear-gradient(135deg,
            rgba(var(--primary-color-rgb), 0.2),
            rgba(var(--accent-color-rgb), 0.15));
        }
      }

      .title-beam {
        position: absolute;
        bottom: -15px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg,
          var(--primary-color) 0%,
          var(--accent-color) 30%,
          transparent 70%);
        border-radius: 2px;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.6),
            transparent);
          border-radius: 2px;
          animation: titleBeam 3s ease-in-out infinite;
        }
      }
    }
  }
}

// 职位网格
.positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2.5rem;
  padding: 1rem 0;
  max-width: 100%;
}

// 职位卡片
.position-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;

  &.featured {
    border-color: rgba(var(--primary-color-rgb), 0.3);
    box-shadow: 0 0 30px rgba(var(--primary-color-rgb), 0.1);
  }

  .card-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg,
      var(--primary-color),
      var(--accent-color),
      var(--primary-color));
    border-radius: 22px;
    opacity: 0;
    z-index: -1;
    filter: blur(20px);
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-10px) scale(1.02);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(var(--primary-color-rgb), 0.2);
    box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.15),
      0 0 50px rgba(var(--primary-color-rgb), 0.1);

    .card-glow {
      opacity: 0.08;
    }
  }

  .position-tag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.3);

    .tag-icon {
      animation: sparkle 2s ease-in-out infinite;
    }
  }

  .position-content {
    padding: 2rem;

    .position-body {
      margin-bottom: 1.5rem;

      .html-content {
        color: var(--text-color-secondary);
        line-height: 1.8;
        font-size: 1rem;
      }
    }

    .position-meta {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1rem;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-color-secondary);

        .meta-icon {
          font-size: 1rem;
          filter: drop-shadow(0 0 5px rgba(var(--primary-color-rgb), 0.3));
        }
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  text-align: center;
  position: relative;

  .empty-animation {
    position: relative;
    margin-bottom: 3rem;

    .floating-molecules {
      position: absolute;
      top: -40px;
      left: -40px;
      right: -40px;
      bottom: -40px;

      .molecule {
        position: absolute;
        width: 6px;
        height: 6px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: moleculeFloat 4s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(var(--primary-color-rgb), 0.5);

        &:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        &:nth-child(2) {
          top: 60%;
          right: 15%;
          animation-delay: -1.3s;
          background: var(--accent-color);
          box-shadow: 0 0 10px rgba(var(--accent-color-rgb), 0.5);
        }

        &:nth-child(3) {
          bottom: 30%;
          left: 50%;
          animation-delay: -2.6s;
        }
      }
    }

    .empty-icon {
      position: relative;
      z-index: 2;

      .icon-pulse {
        font-size: 4rem;
        animation: iconPulse 3s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(var(--primary-color-rgb), 0.3));
      }
    }
  }

  .empty-title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-weight: 700;
  }

  .empty-text {
    color: var(--text-color-secondary);
    margin-bottom: 3rem;
    max-width: 500px;
    line-height: 1.6;
    font-size: 1.1rem;
  }

  .retry-btn {
    position: relative;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border: none;
    border-radius: 30px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    letter-spacing: 0.5px;
    text-transform: uppercase;

    &:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow:
        0 15px 40px rgba(var(--primary-color-rgb), 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .btn-text {
      position: relative;
      z-index: 2;
    }

    .btn-ripple {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent);
      transition: left 0.8s ease;
    }

    &:hover .btn-ripple {
      left: 100%;
    }
  }
}

// 联系我们区域
.contact-section {
  padding: 80px 0;
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb), 0.05) 0%,
    rgba(var(--accent-color-rgb), 0.03) 100%);
  position: relative;

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .contact-info {
    .contact-title {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 1rem;

      .title-icon {
        font-size: 2rem;
        filter: drop-shadow(0 0 10px rgba(var(--primary-color-rgb), 0.4));
      }
    }

    .contact-links {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .contact-item {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(var(--primary-color-rgb), 0.1);
          border-color: rgba(var(--primary-color-rgb), 0.3);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.2);
        }

        .html-content {
          color: var(--text-color);
          line-height: 1.6;
          font-size: 1rem;

          // 针对联系信息的特殊样式
          p {
            margin-bottom: 0.8rem;

            &:last-child {
              margin-bottom: 0;
            }
          }

          a {
            color: var(--primary-color);
            text-decoration: none;
            transition: all 0.3s ease;

            &:hover {
              color: var(--accent-color);
              text-decoration: underline;
            }
          }

          strong {
            color: var(--text-color);
            font-weight: 600;
          }

          // 图标样式
          &::before {
            font-size: 1.2rem;
            margin-right: 0.5rem;
            filter: drop-shadow(0 0 8px rgba(var(--primary-color-rgb), 0.4));
          }
        }
      }
    }
  }

  .contact-visual {
    display: flex;
    justify-content: center;
    align-items: center;

    .visual-container {
      position: relative;
      width: 300px;
      height: 300px;

      .orbit-animation {
        position: relative;
        width: 100%;
        height: 100%;

        .orbit {
          position: absolute;
          border: 1px solid rgba(var(--primary-color-rgb), 0.3);
          border-radius: 50%;

          &:nth-child(1) {
            width: 100px;
            height: 100px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: orbitRotate 10s linear infinite;
          }

          &:nth-child(2) {
            width: 180px;
            height: 180px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: orbitRotate 15s linear infinite reverse;
            border-color: rgba(var(--accent-color-rgb), 0.3);
          }

          &:nth-child(3) {
            width: 260px;
            height: 260px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: orbitRotate 20s linear infinite;
          }
        }

        .center-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          animation: iconPulse 3s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(var(--primary-color-rgb), 0.5));
        }
      }
    }
  }
}

// 动画定义
@keyframes networkFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  67% {
    transform: translateY(10px) rotate(240deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 1;
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 15px rgba(var(--primary-color-rgb), 0.4));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 30px rgba(var(--primary-color-rgb), 0.8));
  }
}

@keyframes titleBeam {
  0% {
    left: -30%;
  }
  100% {
    left: 100%;
  }
}

@keyframes dnaRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// loadingDots 动画已在全局样式中定义

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
}

@keyframes moleculeFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  33% {
    transform: translateY(-15px) rotate(120deg);
    opacity: 1;
  }
  67% {
    transform: translateY(8px) rotate(240deg);
    opacity: 0.8;
  }
}

@keyframes orbitRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .positions-grid {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }

  .hero-section .stats-overview {
    gap: 2rem;

    .stat-item {
      padding: 1rem 1.5rem;
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 0 60px;

    .page-title {
      font-size: clamp(2rem, 8vw, 3rem);
      margin-bottom: 1rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .stats-overview {
      flex-direction: column;
      gap: 1rem;

      .stat-item {
        padding: 1rem;

        .stat-number {
          font-size: 2rem;
        }
      }
    }
  }

  .content-section {
    padding: 40px 0 80px;
  }

  .positions-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .position-card {
    .position-content {
      padding: 1.5rem;
    }
  }

  .category-section {
    margin-bottom: 3rem;

    .category-header .category-title {
      font-size: 1.8rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;

      .title-marker {
        width: 4px;
        height: 30px;
      }
    }
  }

  .contact-section {
    padding: 60px 0;

    .contact-content {
      grid-template-columns: 1fr;
      gap: 2rem;
      text-align: center;
    }

    .contact-info {
      .contact-title {
        font-size: 2rem;
        justify-content: center;
      }

      .contact-links {
        .contact-item {
          text-align: left;

          &:hover {
            transform: translateY(-3px);
          }
        }
      }
    }

    .contact-visual .visual-container {
      width: 250px;
      height: 250px;
    }
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 0 40px;
  }

  .position-card {
    border-radius: 16px;

    .position-content {
      padding: 1.2rem;
    }

    .position-tag {
      top: 0.8rem;
      right: 0.8rem;
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
    }
  }

  .contact-section {
    .contact-visual .visual-container {
      width: 200px;
      height: 200px;

      .center-icon {
        font-size: 2rem;
      }
    }
  }
}
</style>
