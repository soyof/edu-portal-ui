<template>
  <div class="research-page">
    <section class="hero-section">
      <div class="container">
        <h1 class="page-title">{{ $t('research.title') }}</h1>
      </div>
    </section>
    
    <section class="research-areas">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('research.areasTitle') }}</h2>
        <div class="areas-grid">
          <div v-for="(area, index) in researchAreas" :key="index" class="area-card glass-effect">
            <h3>{{ area.title }}</h3>
            <p>{{ area.description }}</p>
            <el-button type="primary" class="view-details-btn" @click="$router.push(`/research/${area.id}`)">
              {{ $t('research.viewDetails') }} <el-icon class="right-icon"><arrow-right /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </section>
    
    <section class="publications">
      <div class="container">
        <h2 class="section-title tech-line">{{ $t('research.publicationsTitle') }}</h2>
        <div class="publications-list">
          <div v-for="(pub, index) in publications" :key="index" class="publication-card">
            <span class="pub-date">{{ pub.date }}</span>
            <h3 class="pub-title">{{ pub.title }}</h3>
            <p class="pub-authors">{{ pub.authors }}</p>
            <p class="pub-journal">{{ pub.journal }}</p>
            <div class="pub-actions">
              <el-button type="primary" class="view-details-btn">
                {{ $t('research.readPaper') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

// 研究领域数据
const researchAreas = ref([
  {
    id: 'synthetic-biology',
    title: '合成生物学',
    description: '开发新型生物系统及其组件的设计和构建，为医疗、工业和环境应用创造解决方案。'
  },
  {
    id: 'metabolic-engineering',
    title: '代谢工程',
    description: '利用基因组编辑和代谢流分析，优化微生物的化合物生产能力，实现可持续生物制造。'
  },
  {
    id: 'biomaterials',
    title: '生物材料',
    description: '研发可降解、高性能的生物基材料，以替代传统石化材料，减少环境影响。'
  }
])

// 出版物数据
const publications = ref([
  {
    id: '1',
    date: '2023',
    title: 'Engineered Synthetic Pathways for Carbon Capture in Cyanobacteria',
    authors: 'Zhang L, Li H, Wang X, et al.',
    journal: 'Nature Biotechnology, 41(5): 627-638'
  },
  {
    id: '2',
    date: '2023',
    title: 'CRISPR-Mediated Optimization of Biofuel Production in Engineered Microorganisms',
    authors: 'Liu J, Chen K, Smith P, et al.',
    journal: 'Metabolic Engineering, 75: 112-125'
  },
  {
    id: '3',
    date: '2022',
    title: 'Novel Biodegradable Polymers from Genetically Modified Yeast',
    authors: 'Wang R, Zhao Y, Johnson M, et al.',
    journal: 'ACS Sustainable Chemistry & Engineering, 10(12): 3892-3901'
  }
])
</script>

<style lang="less" scoped>
.research-page {
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

.section-title {
  font-size: 2rem;
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.research-areas, .publications {
  padding: 80px 0;
  position: relative;
  
  .purple-theme & {
    background: rgba(70, 38, 125, 0.03);
  }
  
  .dark-mode.purple-theme & {
    background: rgba(55, 28, 98, 0.1);
  }
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  
  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
  }
}

.area-card {
  padding: 30px;
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: var(--dark-color);
    
    .dark-mode & {
      color: var(--light-color);
    }
  }
  
  p {
    margin-bottom: 25px;
    flex: 1;
  }
  
  .view-details-btn {
    align-self: flex-start;
    margin-top: auto;
    
    .purple-theme & {
      // 确保在紫色主题下也有良好显示效果
      background: white !important;
      color: @purple-theme-dark !important;
      border: none !important;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      
      .dark-mode & {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
      }
      
      &:hover {
        background: white !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
      
      .right-icon {
        margin-left: 5px;
        transition: transform 0.3s ease;
      }
      
      &:hover .right-icon {
        transform: translateX(3px);
      }
    }
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-medium);
  }
}

.publications {
  background-color: rgba(247, 247, 255, 0.5);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.2);
  }
}

.publications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.publication-card {
  background: white;
  border-radius: var(--border-radius-md);
  padding: 25px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-small);
  
  .dark-mode & {
    background: rgba(26, 26, 46, 0.7);
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-medium);
  }
  
  .pub-date {
    position: absolute;
    top: 25px;
    right: 25px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-color);
    
    .purple-theme & {
      color: @purple-theme;
    }
  }
  
  .pub-title {
    font-size: 1.3rem;
    margin-bottom: 10px;
    padding-right: 60px;
  }
  
  .pub-authors {
    color: #666;
    margin-bottom: 5px;
    font-style: italic;
    
    .dark-mode & {
      color: #aaa;
    }
  }
  
  .pub-journal {
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .pub-actions {
    display: flex;
    justify-content: flex-start;
    
    .view-details-btn {
      .purple-theme & {
        background: linear-gradient(90deg, @purple-theme, @purple-theme-light) !important;
        color: white !important;
        
        &:hover {
          background: @purple-theme !important;
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style> 
