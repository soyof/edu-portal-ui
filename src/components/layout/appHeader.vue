<template>
  <header :class="['app-header', { 'header-scrolled': isScrolled }]">
    <div class="container header-container">
      <div class="logo-container">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <span class="dna-helix dna-strand-1"></span>
            <span class="dna-helix dna-strand-2"></span>
          </div>
          <h1 v-if="currentLanguage === 'zh' || !isScrolled">
            {{ isMobileView ? $t('global.titleShort') : (currentLanguage === 'zh' ? $t('global.title') : $t('global.titleShort')) }}
          </h1>
        </router-link>
      </div>

      <!-- 桌面端导航 -->
      <nav class="desktop-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.route">
            <router-link :to="item.route" :class="{ 'active': route.path === item.route }">
              {{ $t(`nav.${item.key}`) }}
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 功能按钮区 -->
      <div class="header-actions">
        <!-- 语言切换 -->
        <el-dropdown class="lang-dropdown" @command="handleLanguageChange">
          <span class="el-dropdown-link">
            <span class="lang-text">{{ currentLanguage === 'zh' ? '中文' : 'EN' }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 主题颜色切换 -->
        <el-dropdown class="theme-color-dropdown" @command="handleThemeColorChange">
          <span class="el-dropdown-link color-switch">
            <span class="color-dot" :class="currentColorTheme"></span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="default">
                <span class="color-option">
                  <span class="color-dot default-theme"></span>
                  <span>默认主题</span>
                </span>
              </el-dropdown-item>
              <el-dropdown-item command="purple">
                <span class="color-option">
                  <span class="color-dot purple-theme"></span>
                  <span>紫色主题</span>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 暗黑/明亮模式切换 -->
        <div class="theme-switch" @click="toggleTheme">
          <el-icon v-if="isDarkMode"><Moon /></el-icon>
          <el-icon v-else><Sunny /></el-icon>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="mobile-toggle" @click="toggleMobileMenu">
          <span :class="['hamburger', { 'open': isMobileMenuOpen }]"></span>
        </div>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <transition name="slide-down">
      <div v-show="isMobileMenuOpen" class="mobile-menu glass-effect">
        <nav>
          <ul class="mobile-nav-list">
            <li v-for="item in navItems" :key="item.route">
              <router-link :to="item.route" @click="closeMobileMenu">
                {{ $t(`nav.${item.key}`) }}
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../../store'
import { useAppStore } from '../../store'
import { useLanguageStore } from '../../store'
import { setLocale } from '../../i18n'
import { ArrowDown, Moon, Sunny } from '@element-plus/icons-vue'

const route = useRoute()
const themeStore = useThemeStore()
const appStore = useAppStore()
const languageStore = useLanguageStore()

// 计算属性
const isDarkMode = computed(() => themeStore.isDarkMode)
const isMobileMenuOpen = computed(() => appStore.isMobileMenuOpen)
const isScrolled = computed(() => appStore.isScrolled)
const currentLanguage = computed(() => languageStore.currentLanguage)
const isMobileView = ref(false)
const currentColorTheme = computed(() => themeStore.currentTheme === 'purple' ? 'purple-theme' : 'default-theme')

// 导航项
const navItems = [
  { key: 'home', route: '/home' },
  { key: 'about', route: '/about' },
  { key: 'members', route: '/members' },
  { key: 'research', route: '/research' },
  { key: 'news', route: '/news' },
  { key: 'facilities', route: '/facilities' },
  { key: 'join', route: '/join' }
]

// 方法
const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleMobileMenu = () => {
  appStore.toggleMobileMenu()
}

const closeMobileMenu = () => {
  appStore.closeMobileMenu()
}

const handleLanguageChange = (command: string) => {
  if (command === 'zh' || command === 'en') {
    languageStore.setLanguage(command)
    setLocale(command as 'zh' | 'en')
  }
}

const handleThemeColorChange = (command: string) => {
  if (command === 'default' || command === 'purple') {
    themeStore.setColorTheme(command)
  }
}

// 检测滚动位置以改变导航栏样式
const checkScroll = () => {
  const scrollPosition = window.scrollY
  appStore.updateScrollStatus(scrollPosition > 50)
}

// 检查是否为移动端视图
const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 768 // 使用平板断点
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  window.addEventListener('resize', checkMobileView)
  checkScroll() // 初始检查
  checkMobileView() // 初始检查移动视图

  // 初始化主题
  themeStore.initTheme()

  // 初始化语言
  const lang = languageStore.currentLanguage
  if (lang) {
    setLocale(lang as 'zh' | 'en')
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
  window.removeEventListener('resize', checkMobileView)
})
</script>

<style lang="less" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 20px 0;

  .dark-mode & {
    background: rgba(18, 18, 37, 0.7);
  }

  &.header-scrolled {
    backdrop-filter: --glass-blur;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px 0;

    .logo h1 {
      font-size: 1.4rem;

      @media (max-width: @tablet-breakpoint) {
        font-size: 1.2rem;
      }
    }

    .logo-icon {
      transform: scale(0.8);

      @media (max-width: @tablet-breakpoint) {
        transform: scale(0.7);
      }
    }

    .dark-mode & {
      background: rgba(26, 26, 46, 0.8);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(127, 68, 248, 0.2);
    }
  }
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap; // 防止换行
  min-height: 60px;

  @media (max-width: @tablet-breakpoint) {
    min-height: 50px;
  }
}

.logo-container {
  z-index: 1001;
  flex-shrink: 0; // 防止logo缩小
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;

  h1 {
    font-size: 1.8rem;
    margin: 0;
    margin-left: 10px;
    font-weight: 700;
    color: var(--dark-color);
    transition: all 0.3s ease;
    white-space: nowrap;
    mix-blend-mode: difference;

    @media (max-width: @tablet-breakpoint) {
      font-size: 1.4rem;
      margin-left: 5px;
    }

    @media (max-width: @mobile-breakpoint) {
      font-size: 1.2rem;
    }

    .dark-mode & {
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}

.logo-icon {
  width: 40px;
  height: 40px;
  position: relative;
  transition: all 0.3s ease;

  @media (max-width: @tablet-breakpoint) {
    width: 35px;
    height: 35px;
  }

  @media (max-width: @mobile-breakpoint) {
    width: 30px;
    height: 30px;
  }

  .dna-helix {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;

    &.dna-strand-1 {
      border-left: 3px solid var(--primary-color);
      border-right: 3px solid var(--accent-color);
      animation: dnaRotate 5s linear infinite;

      .purple-theme & {
        border-left: 3px solid var(--primary-color);
        border-right: 3px solid var(--accent-color);
      }
    }

    &.dna-strand-2 {
      border-top: 3px solid var(--primary-color);
      border-bottom: 3px solid var(--accent-color);
      animation: dnaRotate 5s linear infinite reverse;

      .purple-theme & {
        border-top: 3px solid var(--primary-color);
        border-bottom: 3px solid var(--accent-color);
      }
    }
  }
}

.desktop-nav {
  @media (max-width: @tablet-breakpoint) {
    display: none;
  }

  margin: 0 10px; // 增加两侧外边距
  flex-grow: 1; // 允许导航区域伸缩
  display: flex;
  justify-content: center; // 居中导航项

  .nav-list {
    display: flex;
    flex-wrap: nowrap; // 防止换行
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      margin: 0 8px; // 减少间距以适应更多项
      position: relative;

      @media (max-width: 1100px) {
        margin: 0 5px; // 在较小屏幕上进一步减少间距
      }

      a {
        text-decoration: none;
        color: var(--dark-color);
        font-weight: 500;
        font-size: 1.05rem; // 稍微减小字号
        position: relative;
        transition: all 0.3s ease;
        white-space: nowrap;
        padding: 0 5px; // 增加水平内边距

        @media (max-width: 1100px) {
          font-size: 0.95rem; // 在较小屏幕上进一步减小字号
        }

        .dark-mode & {
          color: rgba(255, 255, 255, 0.9);
        }

        &:hover, &.active {
          color: var(--primary-color);

          &::after {
            width: 100%;
          }
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      }

      &:hover::before,
      &:hover::after {
        opacity: 1;
        transform: translateY(0);
      }

      &::before,
      &::after {
        content: '';
        position: absolute;
        height: 4px;
        width: 4px;
        border-radius: 50%;
        background: var(--primary-color);
        opacity: 0;
        transition: all 0.3s ease;
      }

      &::before {
        top: -5px;
        left: 50%;
        transform: translateY(10px);
      }

      &::after {
        bottom: -5px;
        right: 50%;
        transform: translateY(-10px);
      }
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  z-index: 1001;
  flex-shrink: 0; // 防止按钮区域缩小

  // 语言切换
  .lang-dropdown {
    .el-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      white-space: nowrap;
      padding: 5px;
      border-radius: 4px;

      .lang-text {
        font-size: 0.9rem;
        min-width: 30px;
        text-align: center;
      }

      .dark-mode & {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  // 颜色主题切换
  .theme-color-dropdown {
    margin-left: 10px;

    @media (max-width: @tablet-breakpoint) {
      margin-left: 8px;
    }

    .color-switch {
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .color-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: block;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

      @media (max-width: @tablet-breakpoint) {
        width: 18px;
        height: 18px;
      }

      &.default-theme {
        background: linear-gradient(135deg, @primary-color, @secondary-color);
      }

      &.purple-theme {
        background: linear-gradient(135deg, @purple-theme, @purple-theme-light);
      }
    }

    :deep(.el-dropdown-menu) {
      .el-dropdown-menu__item {
        padding: 8px 16px;

        &:hover, &:focus {
          background-color: rgba(0, 0, 0, 0.04) !important;
        }

        .dark-mode & {
          &:hover, &:focus {
            background-color: rgba(255, 255, 255, 0.08) !important;
          }
        }
      }
    }
  }

  // 下拉菜单样式
  .color-option {
    display: flex;
    align-items: center;

    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 8px;
      border: 1px solid #ddd;

      &.default-theme {
        background: linear-gradient(135deg, @primary-color, @secondary-color);
      }

      &.purple-theme {
        background: linear-gradient(135deg, @purple-theme, @purple-theme-light);
      }
    }
  }

  .theme-switch {
    margin-left: 10px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s ease;

    @media (max-width: @tablet-breakpoint) {
      margin-left: 8px;
      width: 32px;
      height: 32px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);

      .dark-mode & {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .el-icon {
      font-size: 22px;
      color: var(--dark-color);

      @media (max-width: @tablet-breakpoint) {
        font-size: 18px;
      }

      .dark-mode & {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

.mobile-toggle {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  cursor: pointer;

  @media (max-width: @tablet-breakpoint) {
    display: flex;
    width: 32px;
    height: 32px;
    margin-left: 8px;
  }

  .hamburger {
    position: relative;
    width: 20px;
    height: 2px;
    background: var(--dark-color);
    transition: all 0.3s ease;

    @media (max-width: @tablet-breakpoint) {
      width: 18px;
    }

    .dark-mode & {
      background: rgba(255, 255, 255, 0.9);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 2px;
      background: var(--dark-color);
      transition: all 0.3s ease;

      @media (max-width: @tablet-breakpoint) {
        width: 18px;
      }

      .dark-mode & {
        background: rgba(255, 255, 255, 0.9);
      }
    }

    &::before {
      top: -6px;

      @media (max-width: @tablet-breakpoint) {
        top: -5px;
      }
    }

    &::after {
      bottom: -6px;

      @media (max-width: @tablet-breakpoint) {
        bottom: -5px;
      }
    }

    &.open {
      background: transparent;

      &::before {
        top: 0;
        transform: rotate(45deg);
      }

      &::after {
        bottom: 0;
        transform: rotate(-45deg);
      }
    }
  }
}

.mobile-menu {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  @media (max-width: @tablet-breakpoint) {
    top: 65px; // 减小顶部距离
  }

  .dark-mode & {
    background: rgba(26, 26, 46, 0.95);
  }

  .mobile-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin: 15px 0;
      text-align: center;

      a {
        font-size: 1.2rem;
        text-decoration: none;
        color: var(--dark-color);
        font-weight: 500;
        display: block;
        padding: 10px;
        transition: all 0.3s ease;

        .dark-mode & {
          color: rgba(255, 255, 255, 0.9);
        }

        &:hover, &.active {
          color: var(--primary-color);
        }
      }
    }
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  transform-origin: top center;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 适应不同缩放比例的额外媒体查询 */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 5px; // 减少容器内边距
  }

  .desktop-nav .nav-list li a {
    padding: 0 3px;
    font-size: 0.9rem;
  }
}

@media (max-width: 950px) {
  .logo h1 {
    font-size: 1.5rem;
  }
}
</style>
