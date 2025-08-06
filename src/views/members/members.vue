<template>
  <div class="members-page">
    <section class="hero-section">
      <div class="hero-bg">
        <div class="neural-network"></div>
        <div class="floating-particles"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <h1 class="page-title">
            <span class="title-icon">🧬</span>
            <span class="title-text">{{ $t('members.title') }}</span>
            <div class="title-glow"></div>
          </h1>
          <p class="hero-subtitle">{{ $t('members.subtitle', '汇聚优秀科研人才，共创科技未来') }}</p>
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-number">{{ Object.values(groupedUsers).reduce((sum, group) => sum + group.users.length, 0) }}+</span>
              <span class="stat-label">{{ $t('members.researchDirections') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ Object.keys(groupedUsers).length }}+</span>
              <span class="stat-label">{{ $t('members.academicRoles') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

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

        <!-- 内容展示 -->
        <div v-else-if="Object.keys(groupedUsers).length > 0" class="members-content">
          <!-- 按职称分组显示成员 -->
          <div
            v-for="(group, titleId) in groupedUsers"
            :key="titleId"
            class="title-group"
          >
            <div class="group-header">
              <h2 class="group-title">
                <span class="title-marker"></span>
                <span class="title-text">{{ group.title.dictValue }}</span>
                <span class="member-count">{{ group.users.length }}</span>
                <div class="title-beam"></div>
              </h2>
            </div>

            <div class="members-grid">
              <div
                v-for="user in group.users"
                :key="user.userId"
                class="member-card"
                @click="goToUserDetail(user.userId)"
              >
                <div class="card-glow"></div>
                <div class="member-photo">
                  <div class="photo-frame">
                    <img
                      v-if="user.idPic"
                      :src="`/fileApi/previewImage?filename=${user.idPic}`"
                      :alt="user.username"
                      @error="handleImageError"
                    >
                    <div v-else class="placeholder-avatar">
                      <div class="avatar-bg"></div>
                      <span class="avatar-text">{{ user.username.charAt(0) }}</span>
                    </div>
                    <div class="photo-border"></div>
                  </div>
                  <div class="member-status online"></div>
                </div>

                <div class="member-info">
                  <h3 class="member-name">{{ user.username }}</h3>
                  <p v-if="user.tags && user.tags.length" class="member-tags">
                    <span v-for="tag in user.tags" :key="tag" class="tag">{{ tag }}</span>
                  </p>

                  <div v-if="user.email || user.phone || user.labHomepage || user.personalHomepage" class="member-contact">
                    <span v-if="user.email" class="contact-item">
                      <i class="icon-email"></i>
                      {{ user.email }}
                    </span>
                    <span v-if="user.phone" class="contact-item">
                      <i class="icon-phone"></i>
                      {{ user.phone }}
                    </span>
                    <a
                      v-if="user.labHomepage"
                      :href="user.labHomepage"
                      target="_blank"
                      class="contact-item link"
                      @click.stop
                    >
                      <i class="icon-lab"></i>
                      实验室主页
                    </a>
                    <a
                      v-if="user.personalHomepage"
                      :href="user.personalHomepage"
                      target="_blank"
                      class="contact-item link"
                      @click.stop
                    >
                      <i class="icon-person"></i>
                      个人主页
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无数据状态 -->
        <div v-else class="empty-state">
          <div class="empty-animation">
            <div class="floating-molecules">
              <div class="molecule"></div>
              <div class="molecule"></div>
              <div class="molecule"></div>
            </div>
            <div class="empty-icon">
              <div class="icon-pulse">🔬</div>
            </div>
          </div>
          <h3 class="empty-title">{{ $t('members.noMembers') }}</h3>
          <p class="empty-text">{{ $t('members.noMembersDesc') }}</p>
          <button class="retry-btn" @click="fetchAllData">
            <span class="btn-text">{{ $t('global.reload') }}</span>
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
import { useRouter } from 'vue-router'
import { useMultiLang } from '@/hooks/useMultiLang'

// 定义数据类型接口
interface UserTitle {
  dictId: string // 字典ID
  dictType: string // 字典类型编码
  dictTypeName: string // 字典类型名称
  dictValue: string // 字典值(中文)
  dictValueEn?: string // 字典值(英文)
  sortOrder: number // 排序字段
  remark?: string // 备注
  createdTimes: string // 创建时间
  updatedTimes: string // 更新时间
}

interface User {
  userId: string // 用户ID
  username: string // 用户名
  email?: string // 邮箱地址
  phone?: string // 手机号码
  title?: string // 职称
  tags?: string[] // 用户标签数组
  avatar?: string // 用户头像URL
  idPic?: string // 用户证件照URL
  labHomepage?: string // 实验室主页URL
  personalHomepage?: string // 个人主页URL
  createdTimes: string // 创建时间
  updatedTimes: string // 更新时间
}

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(true)
const userTitlesRaw = ref<UserTitle[]>([])
const usersRaw = ref<User[]>([])

// 多语言处理
const { multiLangData: processedUserTitles, setData: setUserTitlesData } = useMultiLang<UserTitle[]>()
const { multiLangData: processedUsers, setData: setUsersData } = useMultiLang<User[]>()

// 处理后的数据
const userTitles = computed(() => processedUserTitles.value || [])
const users = computed(() => processedUsers.value || [])

// 按职称分组的用户
const groupedUsers = computed(() => {
  if (!users.value || !userTitles.value) return {}
  const groups: Record<string, { title: UserTitle; users: User[] }> = {}

  // 初始化分组 - 使用dictId作为key
  userTitles.value.forEach((titleData: UserTitle) => {
    const key = titleData.dictId // 使用dictId作为key
    groups[key] = {
      title: titleData,
      users: []
    }
  })

  // 将用户分配到对应分组 - 用户的title字段对应字典的dictId
  users.value.forEach((user: User) => {
    if (user.title && groups[user.title]) {
      groups[user.title].users.push(user)
    }
  })

  // 按sortOrder排序
  const result = Object.fromEntries(
    Object.entries(groups)
      .sort(([, a], [, b]) => a.title.sortOrder - b.title.sortOrder)
      .filter(([, group]) => group.users.length > 0) // 只显示有用户的分组
  )
  return result
})

// 获取用户职称数据
const getUserTitles = async() => {
  const res = await service.get('/api/dict/user_title')
  const data = res as unknown as UserTitle[]
  userTitlesRaw.value = data || []
  if (data) {
    setUserTitlesData(data)
  }
}

// 获取用户列表
const getUserList = async() => {
  const res = await service.get('/api/getUserList')
  const data = res as unknown as User[]
  usersRaw.value = data || []
  if (data) {
    setUsersData(data)
  }
}

// 获取所有数据
const fetchAllData = async() => {
  loading.value = true
  await Promise.all([
    getUserTitles(),
    getUserList()
  ])
  loading.value = false
}

// 跳转到用户详情页
const goToUserDetail = (userId: string) => {
  router.push(`/members/${userId}`)
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
// 现代科技风格重设计
.members-page {
  padding-top: 0;
  min-height: 100vh;
  background: linear-gradient(135deg,
    rgba(var(--primary-color-rgb), 0.03) 0%,
    rgba(var(--accent-color-rgb), 0.02) 50%,
    rgba(var(--primary-color-rgb), 0.01) 100%);
  position: relative;
  overflow-x: hidden;
}

// 英雄区域 - 科技感十足
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

    // 神经网络背景动画
    .neural-network {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(var(--primary-color-rgb), 0.1) 1px, transparent 1px),
        radial-gradient(circle at 80% 20%, rgba(var(--accent-color-rgb), 0.08) 1px, transparent 1px),
        radial-gradient(circle at 40% 70%, rgba(var(--primary-color-rgb), 0.06) 1px, transparent 1px),
        radial-gradient(circle at 90% 80%, rgba(var(--accent-color-rgb), 0.1) 1px, transparent 1px);
      background-size: 150px 150px, 200px 200px, 100px 100px, 300px 300px;
      animation: networkFloat 20s ease-in-out infinite;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          linear-gradient(45deg, transparent 49%, rgba(var(--primary-color-rgb), 0.02) 50%, transparent 51%),
          linear-gradient(-45deg, transparent 49%, rgba(var(--accent-color-rgb), 0.02) 50%, transparent 51%);
        background-size: 80px 80px, 60px 60px;
        animation: networkLines 15s linear infinite;
      }
    }

    // 浮动粒子
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
        animation: float 6s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(var(--primary-color-rgb), 0.5);
      }

      &::before {
        top: 20%;
        left: 15%;
        animation-delay: -2s;
      }

      &::after {
        top: 60%;
        right: 20%;
        animation-delay: -4s;
        background: var(--accent-color);
        box-shadow: 0 0 10px rgba(var(--accent-color-rgb), 0.5);
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

    .dark-mode & {
      color: #4fd1c7;
    }

    .title-icon {
      display: inline-block;
      margin-right: 0.5rem;
      filter: drop-shadow(0 0 10px rgba(var(--primary-color-rgb), 0.3));
      animation: iconPulse 3s ease-in-out infinite;
    }

    .title-text {
      position: relative;
    }

    .title-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: blur(20px);
      opacity: 0.3;
      z-index: -1;
    }
  }

  .hero-subtitle {
    font-size: 1.3rem;
    color: var(--text-color-secondary);
    margin-bottom: 2.5rem;
    font-weight: 300;
    letter-spacing: 0.5px;
  }

  .stats-bar {
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
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px rgba(var(--primary-color-rgb), 0.1);
      }

      .stat-number {
        display: block;
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;

        .dark-mode & {
          color: #4fd1c7;
        }
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

// 科技感加载状态
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

// 科技感分组设计
.title-group {
  margin-bottom: 5rem;
  position: relative;

  .group-header {
    margin-bottom: 3rem;
    position: relative;

    .group-title {
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
        font-weight: 700;

        .dark-mode & {
          color: #4fd1c7;
        }
      }

      .member-count {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.5rem;
        height: 2.5rem;
        font-size: 1rem;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg,
          var(--primary-color) 0%,
          var(--accent-color) 100%);
        border: 2px solid transparent;
        border-radius: 50%;
        box-shadow:
          0 4px 15px rgba(var(--primary-color-rgb), 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.1);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg,
            var(--primary-color),
            var(--accent-color),
            var(--primary-color));
          border-radius: 50%;
          z-index: -1;
          opacity: 0;
          animation: borderRotate 3s linear infinite;
          transition: opacity 0.4s ease;
        }

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.2),
            transparent 50%,
            rgba(0, 0, 0, 0.1));
          border-radius: 50%;
          pointer-events: none;
        }

        &:hover {
          transform: translateY(-3px) scale(1.1);
          box-shadow:
            0 8px 25px rgba(var(--primary-color-rgb), 0.4),
            0 0 0 2px rgba(255, 255, 255, 0.2),
            0 0 30px rgba(var(--accent-color-rgb), 0.3);

          &::before {
            opacity: 1;
          }
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

// 现代化成员网格
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

// 科技感成员卡片
.member-card {
  position: relative;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  cursor: pointer;

  // 卡片发光效果
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
    transform: translateY(-15px) scale(1.02);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(var(--primary-color-rgb), 0.3);
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.2),
      0 0 50px rgba(var(--primary-color-rgb), 0.1);

    .card-glow {
      opacity: 0.1;
    }

    .member-photo {
      .photo-frame {
        transform: scale(1.05);

        .photo-border {
          opacity: 1;
          animation: photoBorderSpin 3s linear infinite;
        }
      }
    }

    .member-info {
      .member-name {
        color: var(--primary-color);
        font-weight: 600;

        .dark-mode & {
          color: #4fd1c7;
        }
      }
    }
  }

  // 高科技照片框架
  .member-photo {
    position: relative;
    width: 130px;
    height: 130px;
    margin: 0 auto 1.5rem;

    .photo-frame {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      transition: all 0.4s ease;
      background: linear-gradient(135deg,
        rgba(var(--primary-color-rgb), 0.1),
        rgba(var(--accent-color-rgb), 0.1));

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.4s ease;
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
            top: 10%;
            left: 10%;
            right: 10%;
            bottom: 10%;
            background: radial-gradient(circle at 30% 30%,
              rgba(255, 255, 255, 0.3),
              transparent 50%);
            border-radius: 50%;
          }
        }

        .avatar-text {
          position: relative;
          z-index: 2;
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
      }

      // 科技感边框
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
        opacity: 0;
        transition: opacity 0.4s ease;
      }
    }

    // 在线状态指示器
    .member-status {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.9);
      background: var(--primary-color);
      box-shadow: 0 0 10px rgba(var(--primary-color-rgb), 0.5);

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        animation: statusPulse 2s ease-in-out infinite;
      }
    }
  }

  // 现代化成员信息
  .member-info {
    text-align: center;
    position: relative;

    .member-name {
      font-size: 1.5rem;
      margin-bottom: 0.8rem;
      color: var(--text-color);
      font-weight: 700;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;
    }

    .member-title {
      color: var(--primary-color);
      font-weight: 600;
      margin-bottom: 0.8rem;
      font-size: 1rem;
      padding: 0.3rem 0.8rem;
      background: rgba(var(--primary-color-rgb), 0.1);
      border-radius: 20px;
      display: inline-block;
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
      backdrop-filter: blur(10px);
    }

    .member-department {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .member-research {
      color: var(--text-color-secondary);
      font-size: 0.85rem;
      line-height: 1.5;
      margin-bottom: 1.2rem;
      opacity: 0.7;
      max-height: 3.6rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    // 科技感联系方式
    .member-contact {
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
      }

      .contact-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: var(--text-color-secondary);
        margin-bottom: 0.6rem;
        padding: 0.4rem 0.8rem;
        border-radius: 12px;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.02);

        .icon-email::before {
          content: '✉️';
          margin-right: 8px;
          filter: drop-shadow(0 0 5px rgba(var(--primary-color-rgb), 0.3));
        }

        .icon-phone::before {
          content: '📱';
          margin-right: 8px;
          filter: drop-shadow(0 0 5px rgba(var(--accent-color-rgb), 0.3));
        }

        .icon-lab::before {
          content: '🧪';
          margin-right: 8px;
          filter: drop-shadow(0 0 5px rgba(var(--primary-color-rgb), 0.3));
        }

        .icon-person::before {
          content: '👤';
          margin-right: 8px;
          filter: drop-shadow(0 0 5px rgba(var(--accent-color-rgb), 0.3));
        }

        &.link {
          color: var(--primary-color);
          text-decoration: none;
          cursor: pointer;
          background: rgba(var(--primary-color-rgb), 0.05);
          border: 1px solid rgba(var(--primary-color-rgb), 0.1);

          &:hover {
            background: rgba(var(--primary-color-rgb), 0.1);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(var(--primary-color-rgb), 0.2);
            border-color: rgba(var(--primary-color-rgb), 0.3);
          }
        }
      }
    }

    // 现代化标签系统
    .member-tags {
      margin-bottom: 1.2rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;

      .tag {
        position: relative;
        display: inline-flex;
        align-items: center;
        background: rgba(var(--primary-color-rgb), 0.08);
        color: var(--primary-color);
        border: 1px solid rgba(var(--primary-color-rgb), 0.15);
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        backdrop-filter: blur(15px);
        cursor: pointer;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent);
          transition: left 0.6s ease;
        }

        &:hover {
          background: rgba(var(--primary-color-rgb), 0.15);
          border-color: rgba(var(--primary-color-rgb), 0.3);
          transform: translateY(-3px) scale(1.05);
          box-shadow:
            0 8px 25px rgba(var(--primary-color-rgb), 0.25),
            0 0 0 1px rgba(var(--primary-color-rgb), 0.1);

          &::before {
            left: 100%;
          }
        }

        // 科技感多彩标签
        &:nth-child(2n) {
          background: rgba(var(--accent-color-rgb), 0.08);
          color: var(--accent-color);
          border-color: rgba(var(--accent-color-rgb), 0.15);

          &:hover {
            background: rgba(var(--accent-color-rgb), 0.15);
            border-color: rgba(var(--accent-color-rgb), 0.3);
            box-shadow:
              0 8px 25px rgba(var(--accent-color-rgb), 0.25),
              0 0 0 1px rgba(var(--accent-color-rgb), 0.1);
          }
        }

        &:nth-child(3n) {
          background: rgba(16, 185, 129, 0.08);
          color: #059669;
          border-color: rgba(16, 185, 129, 0.15);

          &:hover {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.3);
            box-shadow:
              0 8px 25px rgba(16, 185, 129, 0.25),
              0 0 0 1px rgba(16, 185, 129, 0.1);
          }
        }

        &:nth-child(4n) {
          background: rgba(245, 158, 11, 0.08);
          color: #d97706;
          border-color: rgba(245, 158, 11, 0.15);

          &:hover {
            background: rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.3);
            box-shadow:
              0 8px 25px rgba(245, 158, 11, 0.25),
              0 0 0 1px rgba(245, 158, 11, 0.1);
          }
        }

        &:nth-child(5n) {
          background: rgba(139, 92, 246, 0.08);
          color: #7c3aed;
          border-color: rgba(139, 92, 246, 0.15);

          &:hover {
            background: rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.3);
            box-shadow:
              0 8px 25px rgba(139, 92, 246, 0.25),
              0 0 0 1px rgba(139, 92, 246, 0.1);
          }
        }

        // 暗色模式适配
        .dark-mode & {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }
        }
      }
    }
  }
}

// 科技感空状态
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

    .dark-mode & {
      color: #4fd1c7;
    }
  }

  .empty-text {
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

// 科技感动画集合
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

@keyframes networkLines {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 80px 80px, 60px 60px;
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
    filter: drop-shadow(0 0 10px rgba(var(--primary-color-rgb), 0.3));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(var(--primary-color-rgb), 0.6));
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

@keyframes borderRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

// 现代化响应式设计
@media (max-width: 1200px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .hero-section .stats-bar {
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

    .stats-bar {
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

  .members-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .member-card {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .title-group {
    margin-bottom: 3rem;

    .group-header .group-title {
      font-size: 1.8rem;
      flex-direction: row;
      align-items: center;
      gap: 0.8rem;
      flex-wrap: wrap;

      .title-marker {
        width: 4px;
        height: 30px;
        flex-shrink: 0;
      }

      .title-text {
        flex: 1;
        min-width: 0;
      }

      .member-count {
        min-width: 2rem;
        height: 2rem;
        font-size: 0.9rem;
        flex-shrink: 0;
      }
    }
  }

  .member-photo {
    width: 110px;
    height: 110px;
  }

  .loading-state {
    padding: 4rem 0;

    .dna-spinner {
      width: 100px;
      height: 100px;
      margin-bottom: 2rem;

      &::after {
        font-size: 1.5rem;
      }
    }
  }

  .empty-state {
    padding: 4rem 0;

    .empty-title {
      font-size: 1.5rem;
    }

    .retry-btn {
      padding: 0.8rem 2rem;
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 0 40px;
  }

  .member-card {
    padding: 1.2rem;
  }

  .member-photo {
    width: 100px;
    height: 100px;
  }

  .member-info {
    .member-name {
      font-size: 1.3rem;
    }

    .member-tags {
      .tag {
        font-size: 0.7rem;
        padding: 0.3rem 0.6rem;
      }
    }
  }

  .title-group {
    .group-header .group-title {
      font-size: 1.6rem;
      gap: 0.6rem;

      .title-marker {
        width: 3px;
        height: 25px;
      }

      .member-count {
        min-width: 1.8rem;
        height: 1.8rem;
        font-size: 0.8rem;
      }
    }
  }
}
</style>
