<template>
  <div class="facilities-page">
    <section class="hero-section">
      <div class="container">
        <h1 class="page-title">{{ $t('facilities.title') }}</h1>
      </div>
    </section>
    
    <section class="content-section">
      <div class="container">
        <h2>{{ $t('facilities.laboratories') }}</h2>
        
        <div class="facilities-grid">
          <div class="facility-card glass-effect" v-for="(lab, index) in laboratories" :key="index">
            <div class="facility-image" :style="{ backgroundImage: `url(${lab.image})` }">
              <div class="facility-overlay">
                <el-button type="primary" round>
                  {{ $t('facilities.virtualTour') }}
                </el-button>
              </div>
            </div>
            <div class="facility-content">
              <h3>{{ lab.name }}</h3>
              <p>{{ lab.description }}</p>
              <div class="facility-features">
                <div class="feature" v-for="(feature, i) in lab.features" :key="i">
                  <el-icon><check /></el-icon>
                  <span>{{ feature }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h2>{{ $t('facilities.equipment') }}</h2>
        
        <el-collapse>
          <el-collapse-item v-for="(category, index) in equipmentCategories" :key="index" :title="category.name">
            <div class="equipment-list">
              <div class="equipment-item" v-for="(equipment, i) in category.items" :key="i">
                <div class="equipment-image">
                  <div class="image-placeholder"></div>
                </div>
                <div class="equipment-details">
                  <h4>{{ equipment.name }}</h4>
                  <p>{{ equipment.description }}</p>
                  <p class="equipment-specs">{{ equipment.specs }}</p>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </section>
    
    <section class="booking-section">
      <div class="container">
        <h2>{{ $t('facilities.scheduling') }}</h2>
        <p>要预约使用我们的研究设施，请填写以下表单或直接联系我们的设施管理团队。</p>
        
        <el-form class="booking-form glass-effect" label-position="top">
          <el-form-item label="姓名">
            <el-input></el-input>
          </el-form-item>
          <el-form-item label="机构/部门">
            <el-input></el-input>
          </el-form-item>
          <el-form-item label="设施">
            <el-select placeholder="选择设施">
              <el-option v-for="(lab, index) in laboratories" :key="index" :label="lab.name" :value="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="预约日期">
            <el-date-picker type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="预约时间">
            <el-time-select placeholder="选择时间"></el-time-select>
          </el-form-item>
          <el-form-item label="用途描述">
            <el-input type="textarea" rows="3"></el-input>
          </el-form-item>
          
          <el-button type="primary">提交预约</el-button>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'

// 模拟数据 - 实验室
const laboratories = [
  {
    name: '合成生物学实验室',
    description: '配备最先进的基因编辑和合成生物学研究设备，支持微生物工程和代谢工程研究。',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    features: [
      '基因编辑工作站',
      '高通量测序平台',
      '微生物培养系统',
      '代谢物分析设备'
    ]
  },
  {
    name: '生物材料实验室',
    description: '专注于生物基材料的研发与测试，配备材料表征和性能测试的全套设备。',
    image: 'https://images.unsplash.com/photo-1614308458649-cd97d6db0b5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    features: [
      '材料3D打印系统',
      '力学性能测试设备',
      '材料表征仪器',
      '生物降解性测试平台'
    ]
  },
  {
    name: '生物信息学计算中心',
    description: '高性能计算集群和专业数据分析平台，支持大规模基因组数据分析和生物系统模拟。',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    features: [
      '高性能计算集群',
      '生物数据可视化系统',
      '人工智能模型训练平台',
      '生物系统模拟软件'
    ]
  }
]

// 模拟数据 - 设备分类
const equipmentCategories = [
  {
    name: '基因编辑与合成设备',
    items: [
      {
        name: 'CRISPR-Cas9基因编辑系统',
        description: '用于高效、精准的基因组编辑，支持多种细胞类型。',
        specs: '编辑精度：99.7%，适用细胞类型：20+'
      },
      {
        name: '高通量DNA合成仪',
        description: '自动化DNA合成平台，可并行合成多条DNA片段。',
        specs: '最大长度：10kb，并行能力：96条/批次'
      }
    ]
  },
  {
    name: '分析与检测设备',
    items: [
      {
        name: '高分辨质谱仪',
        description: '用于代谢物和蛋白质的精确检测与定量分析。',
        specs: '分辨率：120,000，质量精度：<1ppm'
      },
      {
        name: '共聚焦显微镜',
        description: '高分辨率细胞成像系统，支持活细胞实时观察。',
        specs: '分辨率：200nm，Z轴扫描范围：100μm'
      }
    ]
  },
  {
    name: '培养与发酵设备',
    items: [
      {
        name: '生物反应器系统',
        description: '用于微生物培养和代谢工程的可控生物反应器。',
        specs: '容量：2L-50L，温控范围：15-60℃'
      },
      {
        name: '细胞培养工作站',
        description: '全自动化细胞培养系统，提供稳定的培养环境。',
        specs: '培养皿位置：96，CO₂控制：0-20%'
      }
    ]
  }
]
</script>

<style lang="less" scoped>
.facilities-page {
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

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  
  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
  }
}

.facility-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-medium);
    
    .facility-overlay {
      opacity: 1;
    }
  }
}

.facility-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  
  .facility-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

.facility-content {
  padding: 20px;
  
  h3 {
    font-size: 1.6rem;
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 20px;
    line-height: 1.6;
    opacity: 0.8;
  }
}

.facility-features {
  .feature {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .el-icon {
      color: var(--primary-color);
      margin-right: 8px;
    }
  }
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.equipment-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border-radius: var(--border-radius-md);
  background-color: rgba(247, 247, 255, 0.3);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.3);
  }
  
  @media (max-width: @mobile-breakpoint) {
    flex-direction: column;
  }
}

.equipment-image {
  flex: 0 0 100px;
  
  .image-placeholder {
    width: 100px;
    height: 100px;
    background-color: var(--primary-color);
    opacity: 0.2;
    border-radius: var(--border-radius-sm);
  }
}

.equipment-details {
  flex: 1;
  
  h4 {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  p {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .equipment-specs {
    font-size: 0.9rem;
    opacity: 0.7;
  }
}

.booking-section {
  padding: 60px 0;
  background-color: rgba(247, 247, 255, 0.3);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.3);
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 30px;
    max-width: 600px;
  }
}

.booking-form {
  max-width: 600px;
  padding: 30px;
  border-radius: var(--border-radius-lg);
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-button {
    width: 100%;
    margin-top: 10px;
  }
}
</style> 
