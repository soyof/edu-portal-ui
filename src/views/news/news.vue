<template>
  <div class="news-page">
    <!-- 页面标题区域 -->
    <section class="hero-section">
      <div class="container">
        <h1 class="page-title">{{ $t('news.title') }}</h1>
      </div>
    </section>
    
    <!-- 新闻内容区域 -->
    <section class="news-content-section">
      <div class="container">
        <!-- 过滤器 -->
        <div class="news-filter">
          <el-select v-model="selectedCategory" class="category-select">
            <el-option 
              v-for="category in newsCategories" 
              :key="category" 
              :label="category" 
              :value="category"
            />
          </el-select>
        </div>
        
        <!-- 新闻列表 -->
        <div class="news-list">
          <div v-for="news in filteredNews" :key="news.id" class="news-item glass-effect">
            <div class="news-meta">
              <span class="news-category">{{ news.category }}</span>
              <span class="news-date">{{ news.date }}</span>
            </div>
            <h2 class="news-title">{{ news.title }}</h2>
            <p class="news-excerpt">{{ news.excerpt }}</p>
            <div class="news-actions">
              <ViewDetailsButton @click="$router.push(`/news/${news.id}`)">
                查看详情
              </ViewDetailsButton>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination 
            background 
            layout="prev, pager, next" 
            :total="50"
            :page-size="10"
          />
        </div>
      </div>
    </section>
    
    <!-- 底部行动区域 -->
    <section class="cta-section purple-bg">
      <div class="container">
        <h2 class="cta-title">订阅我们的研究动态</h2>
        <p class="cta-text">及时获取最新研究成果和活动信息</p>
        <div class="cta-form">
          <el-input placeholder="请输入您的邮箱地址" class="subscribe-input" />
          <ViewDetailsButton>
            立即订阅
          </ViewDetailsButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ViewDetailsButton from '../../components/common/viewDetailsButton.vue'

// 模拟新闻数据
const newsCategories = ref(['全部', '研究进展', '学术活动', '媒体报道', '公告通知'])
const selectedCategory = ref('全部')

const newsData = ref([
  {
    id: '1',
    category: '研究进展',
    date: '2023-06-28',
    title: '研究所举办"合成生物学与可持续发展"国际研讨会',
    excerpt: '来自全球12个国家的专家学者齐聚研讨会，探讨合成生物学在可持续发展中的应用前景。'
  },
  {
    id: '2',
    category: '研究进展',
    date: '2023-06-15',
    title: '我所研究团队在《Nature Biotechnology》发表重要研究成果',
    excerpt: '该研究成果为人工合成酶提供了新的设计范式，有望彻底改变酶工程领域。'
  },
  {
    id: '3',
    category: '学术活动',
    date: '2023-06-02',
    title: '研究所与康斯坦斯大学签署合作备忘录',
    excerpt: '双方将在合成生物技术领域展开深入合作，共同推进基础理论和应用研究。'
  },
  {
    id: '4',
    category: '媒体报道',
    date: '2023-05-20',
    title: '本所科研成果获《科学》杂志专题报道',
    excerpt: '我所生物信息团队开发的新算法被《科学》杂志评为"年度突破性技术"之一。'
  },
  {
    id: '5',
    category: '公告通知',
    date: '2023-05-10',
    title: '2023年度博士后招聘启动',
    excerpt: '本所将招收10名优秀博士后研究员，参与多个重点科研项目。'
  }
])

// 过滤新闻
const filteredNews = computed(() => {
  if (selectedCategory.value === '全部') {
    return newsData.value
  } else {
    return newsData.value.filter(item => item.category === selectedCategory.value)
  }
})
</script>

<style lang="less" scoped>
.news-page {
  padding-top: 80px;
}

.hero-section {
  background: linear-gradient(135deg, rgba(0, 184, 169, 0.1), rgba(0, 224, 199, 0.1));
  padding: 80px 0 40px;
  text-align: center;
  
  .dark-mode & {
    background: linear-gradient(135deg, rgba(18, 18, 37, 0.3), rgba(26, 26, 46, 0.3));
  }
  
  .purple-theme & {
    background: linear-gradient(135deg, rgba(70, 38, 125, 0.1), rgba(105, 56, 181, 0.1));
  }
  
  .purple-theme.dark-mode & {
    background: linear-gradient(135deg, rgba(55, 28, 98, 0.3), rgba(70, 38, 125, 0.3));
  }
}

.page-title {
  font-size: 2.8rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  }
  
  @media (max-width: @tablet-breakpoint) {
    font-size: 2.4rem;
  }
}

.news-content-section {
  padding: 60px 0;
}

.news-filter {
  margin-bottom: 40px;
  
  .category-select {
    width: 200px;
  }
}

.news-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.news-item {
  padding: 30px;
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-medium);
  }
  
  .news-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    
    .news-category {
      color: var(--primary-color);
      font-weight: 600;
      
      .purple-theme & {
        color: @purple-theme;
      }
    }
    
    .news-date {
      opacity: 0.7;
    }
  }
  
  .news-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .news-excerpt {
    margin-bottom: 25px;
    line-height: 1.6;
  }
  
  .news-actions {
    display: flex;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  text-align: center;
  color: white;
  
  .purple-theme & {
    background: linear-gradient(135deg, @purple-theme, @purple-theme-light);
  }
  
  .cta-title {
    font-size: 2rem;
    margin-bottom: 15px;
  }
  
  .cta-text {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }
  
  .cta-form {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    gap: 15px;
    
    @media (max-width: @tablet-breakpoint) {
      flex-direction: column;
      align-items: center;
    }
    
    .subscribe-input {
      flex: 1;
      min-width: 300px;
      
      @media (max-width: @tablet-breakpoint) {
        margin-bottom: 15px;
        width: 100%;
      }
      
      :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.9);
        border: none;
        height: 44px;
      }
    }
  }
}
</style> 
