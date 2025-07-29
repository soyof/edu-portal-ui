<template>
  <div class="members-page">
    <section class="hero-section">
      <div class="container">
        <h1 class="page-title">{{ $t('members.title') }}</h1>
      </div>
    </section>
    
    <section class="content-section">
      <div class="container">
        <h2>{{ $t('members.directors') }}</h2>
        <div class="members-grid">
          <!-- 示例成员卡片 -->
          <div class="member-card glass-effect">
            <div class="member-photo"></div>
            <h3>张教授</h3>
            <p>研究所所长</p>
            <p>分子生物学</p>
          </div>
          <div class="member-card glass-effect">
            <div class="member-photo"></div>
            <h3>李教授</h3>
            <p>副所长</p>
            <p>合成生物学</p>
          </div>
        </div>
        
        <h2>{{ $t('members.researchers') }}</h2>
        <div class="members-grid">
          <!-- 示例成员卡片 -->
          <div class="member-card glass-effect">
            <div class="member-photo"></div>
            <h3>王研究员</h3>
            <p>高级研究员</p>
            <p>生物信息学</p>
          </div>
          <div class="member-card glass-effect">
            <div class="member-photo"></div>
            <h3>刘研究员</h3>
            <p>研究员</p>
            <p>代谢工程学</p>
          </div>
          <div class="member-card glass-effect">
            <div class="member-photo"></div>
            <h3>赵研究员</h3>
            <p>研究员</p>
            <p>系统生物学</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑待实现
</script>

<style lang="less" scoped>
.members-page {
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
    margin-bottom: 30px;
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
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.member-card {
  padding: 20px;
  border-radius: var(--border-radius-lg);
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-medium);
    
    .member-photo {
      transform: scale(1.05);
    }
  }
  
  .member-photo {
    width: 150px;
    height: 150px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background-color: #e0e0e0;
    background-image: url('https://via.placeholder.com/150');
    background-size: cover;
    transition: all 0.3s ease;
  }
  
  h3 {
    font-size: 1.4rem;
    margin-bottom: 5px;
  }
  
  p {
    margin: 5px 0;
    opacity: 0.8;
  }
}
</style> 
