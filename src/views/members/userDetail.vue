<template>
  <div class="user-detail-page">
    <!-- 英雄区域 - 用户头部信息 -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="neural-network"></div>
        <div class="floating-particles"></div>
      </div>
      <div class="container">
        <div class="user-hero-content">
          <!-- 返回按钮 -->
          <button class="back-btn" @click="goBack">
            <i class="icon-back">
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"
                />
              </svg>
            </i>
          </button>

          <!-- 用户主要信息 -->
          <div v-if="!loading && userDetail" class="user-main-info">
            <div class="user-avatar-section">
              <div class="avatar-container">
                <div class="photo-frame">
                  <img
                    v-if="userDetail.idPic"
                    :src="`/fileApi/previewImage?filename=${userDetail.idPic}`"
                    :alt="userDetail.username"
                    @error="handleImageError"
                  >
                  <div v-else class="placeholder-avatar">
                    <div class="avatar-bg"></div>
                    <span class="avatar-text">{{ userDetail.username.charAt(0) }}</span>
                  </div>
                  <div class="photo-border"></div>
                </div>
                <div class="status-indicator online"></div>
              </div>
            </div>

            <div class="user-basic-info">
              <h1 class="user-name">
                <span class="name-text">{{ userDetail.username }}</span>
                <div class="name-glow"></div>
              </h1>

              <div v-if="userDetail.title" class="user-title">
                {{ getUserTitleName(userDetail.title) }}
              </div>

              <div v-if="userDetail.tags && userDetail.tags.length" class="user-tags">
                <span v-for="tag in userDetail.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>

              <div class="contact-links">
                <a v-if="userDetail.email" :href="`mailto:${userDetail.email}`" class="contact-link">
                  <i class="icon-email">✉️</i>
                  <span>{{ userDetail.email }}</span>
                </a>
                <a v-if="userDetail.phone" :href="`tel:${userDetail.phone}`" class="contact-link">
                  <i class="icon-phone">📱</i>
                  <span>{{ userDetail.phone }}</span>
                </a>
                <a v-if="userDetail.labHomepage" :href="userDetail.labHomepage" target="_blank"
                  class="contact-link"
                >
                  <i class="icon-lab">🧪</i>
                  <span>{{ $t('members.labHomepage', '实验室主页') }}</span>
                </a>
                <a v-if="userDetail.personalHomepage" :href="userDetail.personalHomepage" target="_blank"
                  class="contact-link"
                >
                  <i class="icon-person">👤</i>
                  <span>{{ $t('members.personalHomepage', '个人主页') }}</span>
                </a>
              </div>
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

        <!-- 用户详细信息 -->
        <div v-else-if="userDetail" class="user-detail-content">
          <div class="detail-grid">
            <!-- 个人简介 -->
            <div v-if="userDetail.bio || userDetail.bioEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">📝</span>
                  <span>{{ $t('members.biography', '个人简介') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.bio, userDetail.bioEn)"></div>
              </div>
            </div>

            <!-- 研究方向 -->
            <div v-if="userDetail.researchDirection || userDetail.researchDirectionEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">🔬</span>
                  <span>{{ $t('members.researchDirection', '研究方向') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.researchDirection, userDetail.researchDirectionEn)"></div>
              </div>
            </div>

            <!-- 课题项目 -->
            <div v-if="userDetail.researchProject || userDetail.researchProjectEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">📊</span>
                  <span>{{ $t('members.researchProject', '课题项目') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.researchProject, userDetail.researchProjectEn)"></div>
              </div>
            </div>

            <!-- 学术兼职 -->
            <div v-if="userDetail.academicAppointment || userDetail.academicAppointmentEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">🎓</span>
                  <span>{{ $t('members.academicAppointment', '学术兼职') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.academicAppointment, userDetail.academicAppointmentEn)"></div>
              </div>
            </div>

            <!-- 获奖情况 -->
            <div v-if="userDetail.awards || userDetail.awardsEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">🏆</span>
                  <span>{{ $t('members.awards', '获奖情况') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.awards, userDetail.awardsEn)"></div>
              </div>
            </div>

            <!-- 学术研究 -->
            <div v-if="userDetail.academicResearch || userDetail.academicResearchEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">🧠</span>
                  <span>{{ $t('members.academicResearch', '学术研究') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.academicResearch, userDetail.academicResearchEn)"></div>
              </div>
            </div>

            <!-- 论文发表 -->
            <div v-if="userDetail.publications || userDetail.publicationsEn" class="detail-card">
              <div class="card-header">
                <h3 class="section-title">
                  <span class="title-icon">📚</span>
                  <span>{{ $t('members.publications', '论文发表') }}</span>
                  <div class="title-line"></div>
                </h3>
              </div>
              <div class="card-content">
                <div class="html-content" v-html="getCurrentLanguageContent(userDetail.publications, userDetail.publicationsEn)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else class="error-state">
          <div class="error-animation">
            <div class="floating-molecules">
              <div class="molecule"></div>
              <div class="molecule"></div>
              <div class="molecule"></div>
            </div>
            <div class="error-icon">
              <div class="icon-pulse">❌</div>
            </div>
          </div>
          <h3 class="error-title">{{ $t('members.userNotFound', '用户信息未找到') }}</h3>
          <p class="error-text">{{ $t('members.userNotFoundDesc', '该用户信息不存在或已被删除') }}</p>
          <button class="retry-btn" @click="goBack">
            <span class="btn-text">{{ $t('global.back', '返回') }}</span>
            <div class="btn-ripple"></div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import service from '@/utils/services'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMultiLang } from '@/hooks/useMultiLang'

// 定义用户详情接口
interface UserDetail {
  userId: string // 用户ID
  username: string // 用户名
  password: string // 密码（加密后的）
  phone?: string // 手机号码
  email?: string // 邮箱地址
  labHomepage?: string // 实验室主页URL
  personalHomepage?: string // 个人主页URL
  tags?: string[] // 用户标签数组
  avatar?: string // 用户头像URL
  idPic?: string // 用户证件照URL
  title?: string // 用户职称
  bio?: string // 个人简介(中文)
  bioEn?: string // 个人简介(英文)
  researchDirection?: string // 研究方向(中文)
  researchDirectionEn?: string // 研究方向(英文)
  researchProject?: string // 课题项目(中文)
  researchProjectEn?: string // 课题项目(英文)
  academicAppointment?: string // 学术兼职(中文)
  academicAppointmentEn?: string // 学术兼职(英文)
  awards?: string // 获奖情况(中文)
  awardsEn?: string // 获奖情况(英文)
  academicResearch?: string // 学术研究(中文)
  academicResearchEn?: string // 学术研究(英文)
  publications?: string // 论文发表(中文)
  publicationsEn?: string // 论文发表(英文)
  createdTimes: string // 创建时间
  updatedTimes: string // 更新时间
}

interface UserTitle {
  dictId: string
  dictValue: string
  dictValueEn?: string
}

// 路由和国际化
const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

// 响应式数据
const loading = ref(true)
const userDetail = ref<UserDetail | null>(null)
const userTitles = ref<UserTitle[]>([])

// 多语言处理
const { setData: setUserData } = useMultiLang<UserDetail>()

// 获取用户ID
const userId = computed(() => route.params.userId as string)

// 获取用户详情
const getUserDetail = async() => {
  try {
    const res = await service.get(`/api/getUserDetail/${userId.value}`)
    const data = res as unknown as UserDetail
    userDetail.value = data
    if (data) {
      setUserData(data)
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    userDetail.value = null
  }
}

// 获取用户职称数据
const getUserTitles = async() => {
  try {
    const res = await service.get('/api/dict/user_title')
    userTitles.value = res as unknown as UserTitle[]
  } catch (error) {
    console.error('获取职称数据失败:', error)
  }
}

// 获取职称名称
const getUserTitleName = (titleId: string): string => {
  const title = userTitles.value.find(t => t.dictId === titleId)
  if (!title) return titleId

  return locale.value === 'en' && title.dictValueEn
    ? title.dictValueEn
    : title.dictValue
}

// 获取当前语言内容
const getCurrentLanguageContent = (zhContent?: string, enContent?: string): string => {
  if (locale.value === 'en' && enContent) {
    return enContent
  }
  return zhContent || ''
}

// 获取所有数据
const fetchAllData = async() => {
  loading.value = true
  await Promise.all([
    getUserDetail(),
    getUserTitles()
  ])
  loading.value = false
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  fetchAllData()
})
</script>

<style lang="less" scoped>
// 用户详情页面样式
.user-detail-page {
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
  padding: 80px 0 50px;
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
        radial-gradient(circle at 20% 30%, rgba(var(--primary-color-rgb), 0.08) 1px, transparent 1px),
        radial-gradient(circle at 80% 20%, rgba(var(--accent-color-rgb), 0.06) 1px, transparent 1px),
        radial-gradient(circle at 40% 70%, rgba(var(--primary-color-rgb), 0.04) 1px, transparent 1px);
      background-size: 150px 150px, 200px 200px, 100px 100px;
      animation: networkFloat 20s ease-in-out infinite;
    }

    .floating-particles {
      position: absolute;
      width: 100%;
      height: 100%;

      &::before, &::after {
        content: '';
        position: absolute;
        width: 3px;
        height: 3px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: float 8s ease-in-out infinite;
        box-shadow: 0 0 8px rgba(var(--primary-color-rgb), 0.4);
      }

      &::before {
        top: 30%;
        left: 20%;
        animation-delay: -3s;
      }

      &::after {
        top: 70%;
        right: 25%;
        animation-delay: -6s;
        background: var(--accent-color);
        box-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.4);
      }
    }
  }

  .user-hero-content {
    position: relative;
    z-index: 2;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    margin-bottom: 1.5rem;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(-5px) scale(1.1);
      box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.3);
      border-color: rgba(var(--primary-color-rgb), 0.3);
    }

    .icon-back {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        transition: all 0.3s ease;
      }
    }

    &:hover .icon-back svg {
      transform: translateX(-2px);
    }
  }

  .user-main-info {
    display: flex;
    align-items: center;
    gap: 3rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .user-avatar-section {
    flex-shrink: 0;

    .avatar-container {
      position: relative;
      width: 200px;
      height: 200px;

      .photo-frame {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        background: linear-gradient(135deg,
          rgba(var(--primary-color-rgb), 0.15),
          rgba(var(--accent-color-rgb), 0.15));
        border: 3px solid rgba(var(--primary-color-rgb), 0.3);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-avatar {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .avatar-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg,
              var(--primary-color),
              var(--accent-color));
            border-radius: 50%;

            &::before {
              content: '';
              position: absolute;
              top: 15%;
              left: 15%;
              right: 15%;
              bottom: 15%;
              background: radial-gradient(circle at 35% 35%,
                rgba(255, 255, 255, 0.3),
                transparent 60%);
              border-radius: 50%;
            }
          }

          .avatar-text {
            position: relative;
            z-index: 2;
            font-size: 4rem;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
          }
        }

        .photo-border {
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 2px solid transparent;
          border-radius: 50%;
          background: linear-gradient(135deg,
            var(--primary-color),
            var(--accent-color),
            var(--primary-color)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: exclude;
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: photoBorderSpin 8s linear infinite;
        }
      }

      .status-indicator {
        position: absolute;
        bottom: 15px;
        right: 15px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.9);
        background: var(--primary-color);
        box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.6);

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          animation: statusPulse 2s ease-in-out infinite;
        }
      }
    }
  }

  .user-basic-info {
    flex: 1;

    .user-name {
      font-size: clamp(2.5rem, 4vw, 3.5rem);
      margin-bottom: 1rem;
      font-weight: 700;
      position: relative;
      display: inline-block;

      .name-text {
        color: var(--primary-color);
        position: relative;
        font-weight: 700;

        .dark-mode & {
          color: #4fd1c7;
        }
      }

      .name-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        color: var(--primary-color);
        filter: blur(20px);
        opacity: 0.3;
        z-index: -1;

        .dark-mode & {
          color: #4fd1c7;
        }
      }
    }

    .user-title {
      font-size: 1.3rem;
      color: var(--primary-color);
      font-weight: 600;
      margin-bottom: 1.5rem;
      padding: 0.5rem 1rem;
      background: rgba(var(--primary-color-rgb), 0.1);
      border-radius: 25px;
      display: inline-block;
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
      backdrop-filter: blur(10px);
    }

    .user-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      margin-bottom: 2rem;

      .tag {
        padding: 0.5rem 1rem;
        background: rgba(var(--accent-color-rgb), 0.1);
        color: var(--accent-color);
        border: 1px solid rgba(var(--accent-color-rgb), 0.2);
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(var(--accent-color-rgb), 0.15);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(var(--accent-color-rgb), 0.2);
        }

        &:nth-child(even) {
          background: rgba(var(--primary-color-rgb), 0.1);
          color: var(--primary-color);
          border-color: rgba(var(--primary-color-rgb), 0.2);

          &:hover {
            background: rgba(var(--primary-color-rgb), 0.15);
            box-shadow: 0 5px 15px rgba(var(--primary-color-rgb), 0.2);
          }
        }
      }
    }

    .contact-links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .contact-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.2rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        color: var(--text-color);
        text-decoration: none;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(var(--primary-color-rgb), 0.1);
          border-color: rgba(var(--primary-color-rgb), 0.3);
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(var(--primary-color-rgb), 0.2);
        }

        i {
          font-size: 1.1rem;
          filter: drop-shadow(0 0 5px rgba(var(--primary-color-rgb), 0.3));
        }
      }
    }
  }
}

// 内容区域
.content-section {
  padding: 40px 0 100px;
  position: relative;
}

// 加载状态 (复用成员页面的样式)
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

// 详情网格
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

// 详情卡片
.detail-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(var(--primary-color-rgb), 0.2);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
      position: relative;

      .title-icon {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 8px rgba(var(--primary-color-rgb), 0.4));
      }

      .title-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg,
          var(--primary-color),
          var(--accent-color),
          transparent);
        border-radius: 2px;
        margin-left: 1rem;
      }
    }
  }

  .card-content {
    padding: 1.5rem 2rem 2rem;

    .html-content {
      color: var(--text-color-secondary);
      line-height: 1.8;
      font-size: 1rem;
    }
  }
}

// 错误状态
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  text-align: center;
  position: relative;

  .error-animation {
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
        background: var(--accent-color);
        border-radius: 50%;
        animation: moleculeFloat 4s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(var(--accent-color-rgb), 0.5);

        &:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        &:nth-child(2) {
          top: 60%;
          right: 15%;
          animation-delay: -1.3s;
        }

        &:nth-child(3) {
          bottom: 30%;
          left: 50%;
          animation-delay: -2.6s;
        }
      }
    }

    .error-icon {
      position: relative;
      z-index: 2;

      .icon-pulse {
        font-size: 4rem;
        animation: iconPulse 3s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.3));
      }
    }
  }

  .error-title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--text-color);
    font-weight: 700;
  }

  .error-text {
    color: var(--text-color-secondary);
    margin-bottom: 3rem;
    max-width: 400px;
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

// 动画定义
@keyframes networkFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-15px) rotate(120deg);
  }
  67% {
    transform: translateY(8px) rotate(240deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-15px) scale(1.1);
    opacity: 1;
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px rgba(var(--primary-color-rgb), 0.3));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(var(--primary-color-rgb), 0.6));
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

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes photoBorderSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes moleculeFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  33% {
    transform: translateY(-12px) rotate(120deg);
    opacity: 1;
  }
  67% {
    transform: translateY(6px) rotate(240deg);
    opacity: 0.8;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .user-main-info {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }

  .user-avatar-section {
    .avatar-container {
      width: 160px;
      height: 160px;
    }
  }

  .contact-links {
    justify-content: center;
  }

  .detail-card {
    .card-header,
    .card-content {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0 30px;
  }

  .user-avatar-section {
    .avatar-container {
      width: 140px;
      height: 140px;
    }
  }

  .user-basic-info {
    .user-tags {
      justify-content: center;
    }

    .contact-links {
      flex-direction: column;
      align-items: center;
    }
  }

  .detail-card {
    border-radius: 16px;

    .card-header {
      padding: 1.5rem 1rem 1rem;

      .section-title {
        font-size: 1.2rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;

        .title-line {
          width: 100%;
          margin-left: 0;
        }
      }
    }

    .card-content {
      padding: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 50px 0 25px;
  }

  .back-btn {
    width: 42px;
    height: 42px;
    margin-bottom: 1rem;

    .icon-back svg {
      width: 18px;
      height: 18px;
    }
  }

  .user-avatar-section {
    .avatar-container {
      width: 120px;
      height: 120px;
    }
  }

  .user-basic-info {
    .user-tags {
      .tag {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }
    }

    .contact-links {
      .contact-link {
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
      }
    }
  }
}
</style>
