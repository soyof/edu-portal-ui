# 科技感样式组件使用指南

## 📖 概述

本项目提供了一套完整的科技感样式组件库，包含现代化的 UI 元素、动画效果和交互体验。所有样式已经全局引入，可以在任何组件中直接使用。

## 🗂️ 文件结构

```
src/styles/
├── tech-components.less  # 科技感组件样式
├── tech-mixins.less     # 可复用的样式mixins
└── index.less          # 全局样式入口（已包含科技感样式）
```

## 🎨 主要组件类

### 1. 布局容器

#### 英雄区域

```vue
<template>
  <section class="tech-hero-layout tech-grid-background">
    <div class="floating-particles-container">
      <div
        v-for="i in 20"
        :key="i"
        class="floating-particle"></div>
    </div>
    <div class="hero-content">
      <h1 class="tech-gradient-title with-glow">标题</h1>
    </div>
  </section>
</template>
```

#### 内容区域

```vue
<template>
  <section class="tech-content-layout">
    <div class="content-container">
      <!-- 内容 -->
    </div>
  </section>
</template>
```

### 2. 科技感容器

#### 玻璃拟态容器

```vue
<template>
  <div class="tech-glass-container with-top-border">
    <div class="card-header">
      <div class="tech-dots-loader">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
    <!-- 内容 -->
    <div class="card-footer">
      <div class="footer-line"></div>
    </div>
  </div>
</template>
```

#### 科技感卡片

```vue
<template>
  <div class="tech-card">
    <!-- 卡片内容 -->
  </div>
</template>
```

### 3. 文字效果

#### 渐变标题

```vue
<template>
  <h1 class="tech-gradient-title">科技感标题</h1>
  <h1 class="tech-gradient-title with-glow">带发光效果的标题</h1>
</template>
```

#### 科技线条装饰

```vue
<template>
  <div class="tech-line-decoration">带下划线装饰的文字</div>
</template>
```

#### 扫描边框

```vue
<template>
  <div class="tech-scan-border"></div>
</template>
```

### 4. 加载状态

#### 多层旋转加载器

```vue
<template>
  <div class="tech-loading-layout">
    <div class="tech-loading-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <div class="loading-text">加载中...</div>
  </div>
</template>
```

#### 点状加载器

```vue
<template>
  <div class="tech-dots-loader">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</template>
```

### 5. 状态指示器

#### 空数据状态

```vue
<template>
  <div class="tech-empty-state">
    <div class="empty-icon"></div>
    <div class="empty-text">暂无数据</div>
  </div>
</template>
```

### 6. HTML 内容容器

#### 通用 HTML 内容样式

```vue
<template>
  <!-- 基础HTML内容样式（浏览器默认样式增强） -->
  <div
    class="html-content"
    v-html="htmlContent"></div>
</template>
```

#### 科技感 HTML 内容样式（可选）

```vue
<template>
  <!-- 带科技感效果的HTML内容样式 -->
  <div
    class="tech-html-content"
    v-html="htmlContent"></div>
</template>
```

**说明**：

- `html-content` - 通用 HTML 内容样式，还原并优化浏览器默认样式，适用于所有富文本内容
- `tech-html-content` - 在通用样式基础上添加科技感效果，标题带装饰线、主题色彩等

## 🎭 粒子效果

### 基础粒子

```vue
<template>
  <div class="floating-particles-container">
    <div class="floating-particle"></div>
    <div class="floating-particle accent"></div>
    <div class="floating-particle secondary"></div>
  </div>
</template>
```

### 批量粒子

```vue
<template>
  <div class="floating-particles-container">
    <div
      v-for="i in 20"
      :key="i"
      class="floating-particle"
      :class="{
        accent: i % 2 === 1,
        secondary: i % 3 === 0
      }"></div>
  </div>
</template>
```

## 🔧 Mixins 使用

在组件中使用 mixins：

```less
<style lang="less" scoped>
@import '@/styles/tech-mixins.less';

.my-component {
  .tech-gradient-bg(); // 渐变背景
  .tech-card-style(); // 卡片样式
  .tech-center-layout(); // 居中布局
}

.my-title {
  .tech-gradient-text(); // 渐变文字
  .tech-title-decoration(); // 标题装饰
}

.my-container {
  .tech-glass(); // 玻璃效果
  .tech-top-border(); // 顶部边框动画
}
</style>
```

## 🎨 可用的 Mixin 函数

### 背景效果

- `.tech-gradient-bg(@opacity)` - 渐变背景
- `.tech-grid-bg(@color, @size)` - 网格背景
- `.tech-glass(@opacity, @blur)` - 玻璃拟态效果

### 文字效果

- `.tech-gradient-text()` - 渐变文字
- `.tech-glow-text(@color)` - 发光文字
- `.tech-title-decoration(@width, @height)` - 标题装饰

### 动画效果

- `.tech-float-animation(@duration)` - 浮动动画
- `.tech-pulse-animation(@duration)` - 脉动动画
- `.tech-spin-animation(@duration)` - 旋转动画
- `.tech-scan-animation(@duration)` - 扫描动画

### 容器效果

- `.tech-card-style(@padding)` - 卡片样式
- `.tech-top-border(@height)` - 顶部边框动画
- `.tech-side-decoration(@width)` - 侧边装饰条

### 布局工具

- `.tech-center-layout()` - 居中对齐
- `.tech-vertical-layout(@gap)` - 垂直布局
- `.tech-horizontal-layout(@gap)` - 水平布局
- `.tech-fullscreen-container()` - 全屏容器
- `.tech-hero-section(@min-height)` - 英雄区域
- `.tech-content-section(@padding)` - 内容区域

## 📱 响应式特性

所有组件都包含响应式设计：

- **桌面端** (>1280px): 完整效果
- **平板端** (768px-1280px): 适中效果
- **移动端** (<768px): 优化性能，隐藏复杂动画

## 🌙 主题支持

支持明暗主题自动切换：

- **明亮模式**: 白色透明容器
- **暗黑模式**: 深色透明容器
- **紫色主题**: 紫色调配色方案

## 💡 使用示例

### 完整页面示例

```vue
<template>
  <div class="my-page">
    <!-- 英雄区域 -->
    <section class="tech-hero-layout tech-grid-background">
      <div class="floating-particles-container">
        <div
          v-for="i in 20"
          :key="i"
          class="floating-particle"></div>
      </div>
      <div class="hero-content">
        <h1 class="tech-gradient-title with-glow">页面标题</h1>
        <div class="tech-scan-border"></div>
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="tech-content-layout">
      <div class="content-container">
        <div class="tech-glass-container with-top-border">
          <div class="card-header">
            <div class="tech-dots-loader">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
          <div class="tech-html-content">
            <!-- 内容 -->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="less" scoped>
@import '@/styles/tech-mixins.less';

.my-page {
  .tech-gradient-bg();
  min-height: 100vh;
}
</style>
```

## ⚠️ 注意事项

1. **性能优化**: 在移动设备上，复杂动画会自动禁用
2. **浏览器兼容**: 部分效果需要现代浏览器支持
3. **样式覆盖**: 使用 scoped 样式时注意样式优先级
4. **主题适配**: 确保在不同主题下测试效果

## 🔧 自定义配置

可以通过修改 `variables.less` 中的变量来自定义主题色彩：

```less
@primary-color: #00b8a9;
@secondary-color: #00e0c7;
@accent-color: #7f44f8;
```

## 📈 扩展开发

如需添加新的科技感组件：

1. 在 `tech-components.less` 中添加组件样式
2. 在 `tech-mixins.less` 中添加可复用的 mixin
3. 更新本使用指南

---

通过使用这套科技感样式组件，您可以快速创建现代化、具有科技感的用户界面。所有组件都经过精心设计，确保在不同设备和主题下都能提供优秀的用户体验。
