<template>
  <div class="home-page">
    <!-- 粒子背景 -->
    <div class="particle-background" ref="particleContainer"></div>
    
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title textGlow">{{ $t('home.welcome') }}</h1>
          <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="$router.push('/research')">
              {{ $t('home.exploreBtn') }}
            </el-button>
            <el-button plain size="large" @click="$router.push('/join')">
              {{ $t('home.contactBtn') }}
            </el-button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="dna-model" ref="dnaModel"></div>
        </div>
      </div>
    </section>
    
    <!-- 公告通知区域 -->
    <section class="announcements-section">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('home.announcements') }}</h2>
        <div class="announcements-container">
          <div v-if="loadingAnnouncements" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <template v-else-if="announcements.length > 0">
            <announcement-item 
              v-for="announcement in announcements" 
              :key="announcement.id" 
              :announcement="announcement" 
            />
          </template>
          <div v-else class="empty-announcements">
            <el-empty :description="$t('home.noAnnouncements')" />
          </div>
        </div>
        <div class="view-all-container">
          <view-more-button @click="$router.push('/news')">
            {{ $t('home.viewAllAnnouncements') }}
          </view-more-button>
        </div>
      </div>
    </section>
    
    <!-- 团队简介区域 -->
    <section class="team-intro-section">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('home.teamIntro') }}</h2>
        <div class="team-intro-content glass-effect">
          <div class="team-intro-image">
            <div class="placeholder-image">
              <div class="icon-container">
                <el-icon><UserFilled /></el-icon>
              </div>
            </div>
          </div>
          <div class="team-intro-text">
            <template v-if="currentLanguage === 'zh'">
              <p>宋浩教授课题组依托东北大学生命科学与健康学院，致力于合成生物学与光电遗传学的研究。课题组集电能细胞设计构建，及其在固碳、回氧、生物冶金（锌士、贵金属）等"微中和"领域应用化应用，即DACCO<sub>2</sub>、N<sub>2</sub>，H<sub>2</sub>S<sub>2</sub>为原料通过工程微生物细胞受控Power-to-X（化学品、化肥产品）的生产；</p>
              <p>并利用合成生物学现代酶工程方法，设计构建微生物细胞进行高效药物生物合成，降低化学药和药物的生物转化，并发包括各种单生素，甾体酮、多肽等医药品的生物合成产业化进行；</p>
              <p>并拓展了十多类隐藏基因簇的挖掘项目，包括科技部合成生物学重点专项目（南极菌学），科技部重点863课题，国家自然科学基金，自然资源保护项目等，在合成生物学相关顶级杂志发表180多篇，包括Nature Chemical Biology、Joule、Nature Communications、Energy & Environmental Science、Angewandte Chemie、Chemical Society Reviews等期刊，获授权发明专利30余项。</p>
            </template>
            <template v-else>
              <p>Professor Song Hao's research group, based at the School of Life Sciences and Health at Northeastern University, is dedicated to research in synthetic biology and optogenetics. The team focuses on the design and construction of electrogenic cells and their applications in carbon fixation, oxygen recovery, and biohydrometallurgy (zinc and precious metals) in the "micro-neutralization" field, using DACCO<sub>2</sub>, N<sub>2</sub>, and H<sub>2</sub>S<sub>2</sub> as raw materials for controlled Power-to-X production (chemicals, fertilizers) through engineered microbial cells.</p>
              <p>The group also utilizes modern enzyme engineering methods in synthetic biology to design and build microbial cells for efficient biological synthesis of pharmaceuticals, reducing the biological transformation of chemical drugs and developing industrialized biosynthesis of various antibiotics, steroids, peptides, and other pharmaceutical products.</p>
              <p>The research has expanded to over ten hidden gene cluster mining projects, including the Ministry of Science and Technology's key synthetic biology projects (Antarctic bacteriology), 863 key projects, National Natural Science Foundation projects, and natural resource protection projects. The group has published more than 180 papers in top synthetic biology journals, including Nature Chemical Biology, Joule, Nature Communications, Energy & Environmental Science, Angewandte Chemie, and Chemical Society Reviews, and has been granted over 30 invention patents.</p>
            </template>
            <div class="team-actions">
              <view-details-button @click="$router.push('/members')">
                {{ $t('home.viewTeamMembers') }}
              </view-details-button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 科研突破区域 -->
    <section class="research-section">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('home.featuredResearch') }}</h2>
        
        <!-- 轮播组件 -->
        <el-carousel :interval="5000" type="card" height="450px">
          <el-carousel-item v-for="(item, index) in researchItems" :key="index">
            <div class="research-card glass-effect">
              <div class="research-image" :style="{ backgroundImage: `url(${item.image})` }"></div>
              <div class="research-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <view-more-button @click="$router.push('/research')">
                  {{ $t('research.viewProject') }}
                </view-more-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        
        <div class="view-all-container">
          <view-more-button text="查看项目详情" @click="$router.push('/research')" useGradient />
        </div>
      </div>
    </section>
    
    <!-- 最新动态区域 -->
    <section class="news-section">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('home.latestNews') }}</h2>
        <div class="news-grid">
          <div 
            v-for="(news, index) in newsItems" 
            :key="index"
            class="news-item glass-effect"
            :class="{ 'fadeIn': true }"
            :style="{ animationDelay: `${0.2 * index}s` }"
          >
            <div class="news-date">
              <span class="day">{{ news.day }}</span>
              <span class="month">{{ news.month }}</span>
            </div>
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-excerpt">{{ news.excerpt }}</p>
            <view-more-button @click="$router.push('/news')">
              {{ $t('news.readMore') }}
            </view-more-button>
          </div>
        </div>
        
        <div class="view-all-container">
          <view-more-button text="阅读更多动态" @click="$router.push('/news')" inverse />
        </div>
      </div>
    </section>
    
    <!-- 合作伙伴区域 -->
    <section class="partners-section">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('home.partners') }}</h2>
        <div class="partners-grid">
          <div 
            v-for="(partner, index) in partners" 
            :key="index"
            class="partner-item"
          >
            <img :src="partner.logo" :alt="partner.name" class="partner-logo" />
          </div>
        </div>
        
        <div class="view-all-container">
          <view-more-button text="查看全部合作伙伴" @click="$router.push('/about#partners')" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Right } from '@element-plus/icons-vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ViewMoreButton from '../../components/common/viewMoreButton.vue'
import ViewDetailsButton from '../../components/common/viewDetailsButton.vue'
import AnnouncementItem from '../../components/common/announcementItem.vue'
import { UserFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../../store'
import { getAnnouncements } from '../../api'
import type { Announcement } from '../../api'

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

// 获取主题状态
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)
const isDarkMode = computed(() => themeStore.isDarkMode)

// 根据主题计算粒子颜色
const particleColor = computed(() => {
  // 默认主题颜色 (青绿色)
  const defaultColor = isDarkMode.value ? 0x00E0C7 : 0x00B8A9;
  // 紫色主题颜色
  const purpleColor = isDarkMode.value ? 0x6938B5 : 0x46267d;
  
  return currentTheme.value === 'purple' ? purpleColor : defaultColor;
})

// 粒子背景和DNA模型的引用
const particleContainer = ref<HTMLElement | null>(null)
const dnaModel = ref<HTMLElement | null>(null)

// 粒子系统相关变量
let particleSystem: THREE.Scene | null = null
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.PerspectiveCamera | null = null
let particlesMesh: THREE.Points | null = null
let particlesMaterial: THREE.PointsMaterial | null = null
let animationFrameId: number | null = null

// 公告数据
const announcements = ref<Announcement[]>([])
const loadingAnnouncements = ref(true)

// 获取公告数据
const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true
  try {
    announcements.value = await getAnnouncements()
  } catch (error) {
    console.error('获取公告失败:', error)
    announcements.value = []
  } finally {
    loadingAnnouncements.value = false
  }
}

// 模拟数据 - 科研突破
const researchItems = [
  {
    title: '合成光合作用系统',
    description: '我们成功开发了一种新型合成光合作用系统，能够以更高效率将太阳能转化为化学能，为可持续能源提供新解决方案。',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: '生物可降解材料研发',
    description: '团队研发出全新生物可降解材料，具有卓越的物理性能和环境友好特性，可广泛应用于医疗、包装和工业领域。',
    image: 'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    title: '微生物工厂技术平台',
    description: '我们的微生物工厂技术平台实现了高效的生物分子生产，通过基因编辑和代谢工程大幅提高了产率和纯度。',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }
]

// 模拟数据 - 最新动态
const newsItems = [
  {
    day: '28',
    month: '6月',
    title: '研究所举办"合成生物学与可持续发展"国际研讨会',
    excerpt: '来自全球12个国家的专家学者齐聚研讨会，探讨合成生物学在可持续发展中的应用前景。'
  },
  {
    day: '15',
    month: '6月',
    title: '我所研究团队在《Nature Biotechnology》发表重要研究成果',
    excerpt: '该研究成果为人工合成酶提供了新的设计范式，有望彻底改变酶工程领域。'
  },
  {
    day: '02',
    month: '6月',
    title: '研究所与康斯坦斯大学签署合作备忘录',
    excerpt: '双方将在合成生物技术领域展开深入合作，共同推进基础理论和应用研究。'
  }
]

// 模拟数据 - 合作伙伴
const partners = [
  {
    name: '北京大学',
    logo: 'https://via.placeholder.com/180x80?text=合作伙伴1'
  },
  {
    name: '中国科学院',
    logo: 'https://via.placeholder.com/180x80?text=合作伙伴2'
  },
  {
    name: '生物技术公司',
    logo: 'https://via.placeholder.com/180x80?text=合作伙伴3'
  },
  {
    name: '国际研究机构',
    logo: 'https://via.placeholder.com/180x80?text=合作伙伴4'
  },
  {
    name: '医药企业',
    logo: 'https://via.placeholder.com/180x80?text=合作伙伴5'
  }
]

// 粒子背景实现
const initParticleBackground = () => {
  if (!particleContainer.value) return

  // 创建场景、相机和渲染器
  particleSystem = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    particleContainer.value.clientWidth / particleContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 20

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(particleContainer.value.clientWidth, particleContainer.value.clientHeight)
  particleContainer.value.appendChild(renderer.domElement)

  // 创建粒子系统
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 1500

  const posArray = new Float32Array(particlesCount * 3)
  const scaleArray = new Float32Array(particlesCount)

  // 随机生成粒子位置和大小
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 40
    if (i % 3 === 0) {
      scaleArray[i / 3] = Math.random()
    }
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1))

  // 创建粒子材质
  particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    color: particleColor.value, // 使用计算属性获取颜色
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  // 创建粒子系统
  particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
  particleSystem.add(particlesMesh)

  // 动画循环
  const animate = () => {
    if (!particleSystem || !renderer || !camera || !particlesMesh) return

    particlesMesh.rotation.x += 0.0003
    particlesMesh.rotation.y += 0.0005

    renderer.render(particleSystem, camera)
    animationFrameId = requestAnimationFrame(animate)
  }

  animate()

  // 响应式调整
  const handleResize = () => {
    if (!particleContainer.value || !camera || !renderer) return

    camera.aspect = particleContainer.value.clientWidth / particleContainer.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(particleContainer.value.clientWidth, particleContainer.value.clientHeight)
  }

  window.addEventListener('resize', handleResize)

  // 清理函数
  onUnmounted(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener('resize', handleResize)
    if (renderer && particleContainer.value) {
      particleContainer.value.removeChild(renderer.domElement)
    }
  })
}

// 监听主题变化，更新粒子颜色
watch(particleColor, (newColor) => {
  if (particlesMaterial) {
    particlesMaterial.color.set(newColor)
  }
})

// 初始化动画效果
const initAnimations = () => {
  // 英雄区域动画
  gsap.from('.hero-title', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.2
  })

  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.4
  })

  gsap.from('.hero-actions', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.6
  })

  // 滚动触发动画
  gsap.from('.section-title', {
    scrollTrigger: {
      trigger: '.section-title',
      start: 'top 80%',
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.3
  })

  // 公告区域动画
  gsap.from('.announcement-item', {
    scrollTrigger: {
      trigger: '.announcements-section',
      start: 'top 70%',
    },
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.2
  })

  // 研究区域动画
  gsap.from('.research-card', {
    scrollTrigger: {
      trigger: '.research-section',
      start: 'top 70%',
    },
    opacity: 0,
    scale: 0.9,
    duration: 0.8,
  })

  // 合作伙伴动画
  gsap.from('.partner-item', {
    scrollTrigger: {
      trigger: '.partners-section',
      start: 'top 80%',
    },
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1
  })
}

// 生命周期钩子
onMounted(() => {
  // 初始化粒子背景
  initParticleBackground()
  
  // 初始化动画
  initAnimations()

  // 获取公告数据
  fetchAnnouncements()
})

// 获取当前语言
const { locale } = useI18n()
const currentLanguage = computed(() => locale.value)
</script>

<style lang="less" scoped>
.home-page {
  position: relative;
}

// 粒子背景
.particle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  
  // 默认主题渐变背景
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  
  .dark-mode & {
    background: linear-gradient(to bottom, rgba(18, 18, 37, 0), rgba(18, 18, 37, 1));
  }
  
  // 紫色主题渐变背景
  .purple-theme & {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1)), 
                radial-gradient(circle at top right, rgba(70, 38, 125, 0.05), transparent 60%),
                radial-gradient(circle at bottom left, rgba(105, 56, 181, 0.05), transparent 60%);
  }
  
  .purple-theme.dark-mode & {
    background: linear-gradient(to bottom, rgba(18, 18, 37, 0), rgba(18, 18, 37, 1)),
                radial-gradient(circle at top right, rgba(105, 56, 181, 0.1), transparent 70%),
                radial-gradient(circle at bottom left, rgba(138, 101, 199, 0.1), transparent 70%);
  }
  
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}

// 英雄区域
.hero-section {
  min-height: 90vh;
  display: flex;
  align-items: center;
  padding: 100px 0;
  
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    align-items: center;
    
    @media (max-width: @tablet-breakpoint) {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }
}

.hero-content {
  .hero-title {
    font-size: 3rem;
    margin-bottom: 20px;
    line-height: 1.2;
    
    @media (max-width: @tablet-breakpoint) {
      font-size: 2.5rem;
    }
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 30px;
    opacity: 0.8;
    
    @media (max-width: @tablet-breakpoint) {
      font-size: 1.2rem;
    }
  }
}

.hero-actions {
  display: flex;
  gap: 20px;
  
  @media (max-width: @mobile-breakpoint) {
    flex-direction: column;
  }
}

// 使用Element Plus按钮样式
.el-button {
  // 按钮已经有基础样式，只需补充特定的风格
  &.el-button--large {
    font-weight: 600;
    padding: 12px 28px;
    min-height: 46px;
    border-radius: var(--border-radius-md);
    font-size: 1rem;
  }
  
  // 文本按钮
  &.el-button--text {
    padding: 0;
    
    .right-icon {
      margin-left: 5px;
      transition: transform 0.3s ease;
    }
    
    &:hover .right-icon {
      transform: translateX(5px);
    }
  }
}

.hero-visual {
  position: relative;
  height: 400px;
  
  .dna-model {
    width: 100%;
    height: 100%;
    background-image: url('../../assets/homePageImg.jpg');
    background-size: cover;
    background-position: center;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-large);
  }
}

// 通用节样式
section {
  padding: 80px 0;
  
  @media (max-width: @tablet-breakpoint) {
    padding: 60px 0;
  }
}

.section-title {
  font-size: 2.4rem;
  margin-bottom: 40px;
  text-align: center;
  display: inline-block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  
  @media (max-width: @tablet-breakpoint) {
    font-size: 2rem;
    margin-bottom: 30px;
  }
}

// 科研突破区域
.research-section {
  background-color: rgba(247, 247, 255, 0.3);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.3);
  }
  
  .purple-theme & {
    background-color: rgba(70, 38, 125, 0.03);
  }
  
  .purple-theme.dark-mode & {
    background-color: rgba(55, 28, 98, 0.1);
  }
}

.research-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  
  .research-image {
    height: 220px;
    background-size: cover;
    background-position: center;
    transition: all 0.5s ease;
  }
  
  .research-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    
    h3 {
      font-size: 1.4rem;
      margin-bottom: 10px;
    }
    
    p {
      font-size: 1rem;
      margin-bottom: 20px;
      opacity: 0.8;
      flex: 1;
    }
  }
  
  &:hover {
    .research-image {
      transform: scale(1.05);
    }
  }
}

// 最新动态区域
.news-section {
  position: relative;
  padding: 100px 0;
  
  // 添加装饰性图形元素
  &::before, &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    z-index: 0;
  }
  
  &::before {
    top: 80px;
    right: 15%;
  }
  
  &::after {
    bottom: 80px;
    left: 15%;
    width: 60px;
    height: 60px;
  }
  
  .dark-mode & {
    background: linear-gradient(rgba(var(--primary-color-rgb), 0.03), rgba(var(--primary-color-rgb), 0.05));
    border-top: 1px solid rgba(var(--primary-color-rgb), 0.15);
    border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.15);
  }
  
  .purple-theme & {
    background: linear-gradient(rgba(70, 38, 125, 0.02), rgba(70, 38, 125, 0.05));
    border-top: 1px solid rgba(70, 38, 125, 0.1);
    border-bottom: 1px solid rgba(70, 38, 125, 0.1);
    
    &::before, &::after {
      background-color: rgba(70, 38, 125, 0.1);
    }
  }
  
  .purple-theme.dark-mode & {
    background: linear-gradient(rgba(105, 56, 181, 0.02), rgba(105, 56, 181, 0.05));
    border-top: 1px solid rgba(105, 56, 181, 0.15);
    border-bottom: 1px solid rgba(105, 56, 181, 0.15);
    
    &::before, &::after {
      background-color: rgba(105, 56, 181, 0.15);
    }
  }
}

.section-title {
  // 为最新动态标题添加额外强调
  .news-section & {
    font-size: 2.6rem;
    margin-bottom: 50px;
    
    &::before {
      height: 2px;
      opacity: 1;
      background: linear-gradient(90deg, transparent, var(--primary-color), transparent) !important;
    }
    
    @media (max-width: @tablet-breakpoint) {
      font-size: 2.2rem;
      margin-bottom: 40px;
    }
  }
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
}

.news-item {
  padding: 30px;
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-medium);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  
  .dark-mode & {
    background: rgba(26, 26, 46, 0.8);
    border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-large);
  }
  
  .news-date {
    position: absolute;
    top: -20px;
    left: 30px;
    background-color: var(--primary-color);
    border-radius: var(--border-radius-md);
    padding: 8px 18px;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    .day {
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1;
    }
    
    .month {
      font-size: 0.85rem;
      font-weight: 600;
      margin-top: 2px;
    }
  }
  
  .news-title {
    margin-top: 30px;
    margin-bottom: 15px;
    font-size: 1.3rem;
    line-height: 1.3;
    font-weight: 700;
    color: var(--dark-color);
    
    .dark-mode & {
      color: rgba(255, 255, 255, 0.95);
    }
  }
  
  .news-excerpt {
    margin-bottom: 25px;
    line-height: 1.6;
    opacity: 0.8;
    flex: 1;
  }
}

// 合作伙伴区域
.partners-section {
  background-color: rgba(247, 247, 255, 0.3);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.3);
  }
  
  .purple-theme & {
    background-color: rgba(70, 38, 125, 0.03);
  }
  
  .purple-theme.dark-mode & {
    background-color: rgba(55, 28, 98, 0.1);
  }
}

.partners-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
}

.partner-item {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.3s ease;
  
  &:hover {
    filter: grayscale(0%);
    opacity: 1;
  }
  
  .partner-logo {
    max-width: 180px;
    max-height: 80px;
    object-fit: contain;
  }
}

// 添加新样式
.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  position: relative;
  z-index: 1;
}

// 团队简介区域样式
.team-intro-section {
  padding: 80px 0;
  position: relative;
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.2);
  }
  
  .purple-theme & {
    background: rgba(70, 38, 125, 0.03);
  }
  
  .dark-mode.purple-theme & {
    background: rgba(55, 28, 98, 0.1);
  }
}

.team-intro-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  padding: 40px;
  border-radius: var(--border-radius-lg);
  
  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
  }
  
  .team-intro-image {
    .placeholder-image {
      width: 100%;
      height: 300px; /* Adjust height as needed */
      background-color: #f0f0f0; /* Placeholder background */
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      
      .dark-mode & {
        background-color: rgba(30, 30, 50, 0.5); /* Darker background for dark mode */
      }
      
      .purple-theme & {
        background-color: rgba(70, 38, 125, 0.05); /* Slight purple tint for purple theme */
      }
      
      .purple-theme.dark-mode & {
        background-color: rgba(70, 38, 125, 0.2); /* Dark purple for dark mode in purple theme */
      }

      .icon-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--primary-color);
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        
        .el-icon {
          font-size: 36px;
          color: white;
        }
      }
    }
  }
  
  .team-intro-text {
    p {
      margin-bottom: 20px;
      line-height: 1.8;
      text-align: justify;
      
      &:last-of-type {
        margin-bottom: 30px;
      }
      
      sub {
        font-size: 0.75em;
        vertical-align: sub;
      }
    }
    
    .team-actions {
      margin-top: 30px;
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}

// 公告通知区域
.announcements-section {
  padding: 60px 0;
  position: relative;
  background: linear-gradient(to bottom, rgba(247, 247, 255, 0.6), rgba(247, 247, 255, 0.3));
  
  .dark-mode & {
    background: linear-gradient(to bottom, rgba(18, 18, 37, 0.6), rgba(18, 18, 37, 0.3));
  }
  
  .purple-theme & {
    background: linear-gradient(to bottom, rgba(70, 38, 125, 0.05), rgba(70, 38, 125, 0.02));
    
    &::before {
      background-color: rgba(70, 38, 125, 0.03);
    }
  }
  
  .purple-theme.dark-mode & {
    background: linear-gradient(to bottom, rgba(55, 28, 98, 0.1), rgba(55, 28, 98, 0.05));
  }
  
  // 装饰效果
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background-image: linear-gradient(135deg, transparent 66%, rgba(var(--primary-color-rgb), 0.1) 67%);
    background-size: 20px 20px;
  }
  
  .section-title {
    position: relative;
    margin-bottom: 30px;
  }
}

.announcements-container {
  margin-bottom: 30px;
}

.loading-container {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius-md);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.5);
  }
}

.empty-announcements {
  padding: 40px 0;
  text-align: center;
}
</style> 
