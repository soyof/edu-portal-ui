<template>
  <div class="home-page">
    <!-- 粒子背景 -->
    <div ref="particleContainer" class="particle-background"></div>

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title animate__animated animate__pulse animate__infinite animate__slow">{{ $t('home.welcome') }}</h1>
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
          <div ref="dnaModel" class="dna-model"></div>
        </div>
      </div>
    </section>

    <!-- 团队简介区域 -->
    <TeamIntroSection />

    <!-- 公告通知区域 -->
    <NoticesSection />

    <!-- 最新动态区域 -->
    <NewsSection />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import NoticesSection from '../../components/common/noticesSection.vue'
import NewsSection from '../../components/common/newsSection.vue'
import TeamIntroSection from '../../components/common/teamIntroSection.vue'
import { useThemeStore } from '../../store'

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

// 获取主题状态
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)
const isDarkMode = computed(() => themeStore.isDarkMode)

// 根据主题计算粒子颜色
const particleColor = computed(() => {
  // 默认主题颜色 (青绿色)
  const defaultColor = isDarkMode.value ? 0x00E0C7 : 0x00B8A9
  // 紫色主题颜色
  const purpleColor = isDarkMode.value ? 0x6938B5 : 0x46267d

  return currentTheme.value === 'purple' ? purpleColor : defaultColor
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
      start: 'top 80%'
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.3
  })
}

// 生命周期钩子
onMounted(() => {
  // 初始化粒子背景
  initParticleBackground()

  // 初始化动画
  initAnimations()
})
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

// 添加新样式
.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  position: relative;
  z-index: 1;
}

// 动画效果
// 使用 animate.css 提供的动画，无需自定义 keyframes
</style>
