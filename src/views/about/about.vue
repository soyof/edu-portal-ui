<template>
  <div class="about-page">
    <section class="hero-section">
      <div class="container">
        <h1 class="page-title">{{ $t('about.title') }}</h1>
      </div>
    </section>
    
    <section class="content-section">
      <div class="container">
        <h2>{{ $t('about.mission') }}</h2>
        <p>{{ $t('about.missionText') }}</p>
        
        <h2>{{ $t('about.vision') }}</h2>
        <p>{{ $t('about.visionText') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑待实现
</script>

<style lang="less" scoped>
.about-page {
  padding-top: 30px;
}

.hero-section {
  padding: 80px 0 40px;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  margin-bottom: 20px;
}

.content-section {
  padding: 40px 0;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 20px;
    position: relative;
    display: inline-block;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color), transparent);
    }
  }
  
  p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 40px;
  }
}
</style> 
