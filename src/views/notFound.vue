<template>
  <div class="not-found-container">
    <div class="glass-effect not-found-content">
      <h1 class="textGlow">404</h1>
      <div class="molecule-container moleculeRotate">
        <div class="molecule"></div>
      </div>
      <h2>{{ $t('global.notFoundTitle') }}</h2>
      <p>{{ $t('global.notFoundText') }}</p>
      <router-link to="/" class="btn-primary">
        {{ $t('global.backToHome') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用i18n进行国际化
</script>

<style lang="less" scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: radial-gradient(circle, var(--dark-color) 0%, darken(#1A1A2E, 10%) 100%);
  
  .dark-mode & {
    background: radial-gradient(circle, var(--dark-background) 0%, darken(#121225, 10%) 100%);
  }
}

.not-found-content {
  text-align: center;
  padding: 3rem;
  max-width: 600px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg, 
      rgba(0, 184, 169, 0.05) 0%,
      rgba(127, 68, 248, 0.05) 100%
    );
    z-index: -1;
  }
}

h1 {
  font-size: 8rem;
  margin: 0;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  margin: 1rem 0;
  color: var(--light-color);
}

p {
  margin-bottom: 2rem;
  color: var(--light-color);
  opacity: 0.8;
}

.molecule-container {
  width: 80px;
  height: 80px;
  margin: 1rem auto;
  position: relative;
}

.molecule {
  width: 100%;
  height: 100%;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }
  
  &::before {
    width: 60px;
    height: 60px;
    top: 10px;
    left: 10px;
    background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  }
  
  &::after {
    width: 10px;
    height: 10px;
    background: var(--accent-color);
    box-shadow: 0 0 15px var(--accent-color);
    top: 35px;
    left: 35px;
    animation: particleDrift 3s ease-in-out infinite alternate;
  }
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: var(--primary-color);
  color: var(--light-color);
  border: none;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: all 0.6s;
  }
  
  &:hover {
    background-color: darken(#00B8A9, 5%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    
    &::before {
      left: 100%;
    }
  }
}
</style> 
 