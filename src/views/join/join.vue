<template>
  <div class="join-page">
    <section class="hero-section">
      <div class="container">
        <h1 class="page-title">{{ $t('join.title') }}</h1>
        <p class="hero-description">加入我们的团队，与顶尖科学家一起探索合成生物学的无限可能。</p>
      </div>
    </section>
    
    <section class="content-section">
      <div class="container">
        <h2>{{ $t('join.openPositions') }}</h2>
        
        <div class="positions-grid">
          <div 
            class="position-card glass-effect" 
            v-for="(position, index) in openPositions" 
            :key="index"
            :class="{ 'fluidAnimation': position.featured }"
          >
            <div class="position-tag" v-if="position.featured">推荐职位</div>
            <h3>{{ position.title }}</h3>
            <div class="position-meta">
              <span>{{ position.type }}</span>
              <span>{{ position.location }}</span>
            </div>
            <p>{{ position.description }}</p>
            <div class="position-requirements">
              <h4>要求：</h4>
              <ul>
                <li v-for="(req, i) in position.requirements" :key="i">{{ req }}</li>
              </ul>
            </div>
            <el-button type="primary">{{ $t('join.applyNow') }}</el-button>
          </div>
        </div>
        
        <h2>{{ $t('join.studentOpportunities') }}</h2>
        
        <div class="opportunities">
          <div class="opportunity-item glass-effect">
            <h3>博士研究生招生</h3>
            <p>我们诚邀有志于合成生物学研究的硕士毕业生加入我们的博士项目，参与前沿科研工作。</p>
            <div class="opportunity-details">
              <p><strong>起止时间：</strong> 全年招生</p>
              <p><strong>资助信息：</strong> 提供全额学费减免和研究津贴</p>
            </div>
          </div>
          
          <div class="opportunity-item glass-effect">
            <h3>本科生科研实习</h3>
            <p>为有意向了解合成生物学研究的本科生提供实验室实习机会，参与实际项目并获得指导。</p>
            <div class="opportunity-details">
              <p><strong>起止时间：</strong> 暑期6-8月，学期中每周10小时</p>
              <p><strong>资助信息：</strong> 提供实习津贴</p>
            </div>
          </div>
          
          <div class="opportunity-item glass-effect">
            <h3>访问学者项目</h3>
            <p>邀请国内外高校教师和研究人员来所开展短期或长期合作研究。</p>
            <div class="opportunity-details">
              <p><strong>起止时间：</strong> 3个月-1年</p>
              <p><strong>资助信息：</strong> 提供研究经费和住宿补贴</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="application-section">
      <div class="container">
        <div class="application-content">
          <div class="application-info">
            <h2>联系我们</h2>
            <p>如果您对我们的研究所感兴趣，但没有找到合适的职位，也欢迎随时与我们联系。</p>
            <div class="contact-info">
              <div class="contact-item">
                <el-icon><message /></el-icon>
                <span>hr@synbio-institute.org</span>
              </div>
              <div class="contact-item">
                <el-icon><phone /></el-icon>
                <span>+86 10 8888 7777</span>
              </div>
            </div>
          </div>
          
          <div class="application-form glass-effect">
            <h3>{{ $t('join.submit') }}</h3>
            <p>请填写以下表单，我们将尽快与您联系。</p>
            
            <el-form label-position="top">
              <el-form-item :label="$t('join.fullName')" required>
                <el-input></el-input>
              </el-form-item>
              <el-form-item :label="$t('join.email')" required>
                <el-input type="email"></el-input>
              </el-form-item>
              <el-form-item :label="$t('join.position')">
                <el-select placeholder="选择职位">
                  <el-option
                    v-for="(position, index) in openPositions"
                    :key="index"
                    :label="position.title"
                    :value="position.title"
                  />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('join.message')">
                <el-input type="textarea" rows="5"></el-input>
              </el-form-item>
              <el-form-item :label="$t('join.attachResume')">
                <el-upload
                  action="#"
                  :auto-upload="false"
                >
                  <el-button>点击上传</el-button>
                  <span class="upload-tip">支持 .pdf, .doc, .docx 格式，不超过5MB</span>
                </el-upload>
              </el-form-item>
              
              <el-button type="primary" class="submit-btn">{{ $t('join.submit') }}</el-button>
            </el-form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Message, Phone } from '@element-plus/icons-vue'

// 模拟数据 - 开放职位
const openPositions = [
  {
    title: '高级研究员 - 合成生物学',
    type: '全职',
    location: '北京',
    description: '负责领导合成生物学相关研究项目，设计和优化生物系统，推进前沿技术应用。',
    requirements: [
      '生物学、生物工程或相关领域博士学位',
      '至少5年合成生物学研究经验',
      '具有良好的团队合作能力和项目管理经验',
      '有SCI论文发表和科研项目申请经验'
    ],
    featured: true
  },
  {
    title: '研究助理 - 生物信息学',
    type: '全职',
    location: '北京',
    description: '负责生物数据分析和处理，开发生物信息学工具和算法，支持研究团队的数据需求。',
    requirements: [
      '生物信息学、计算生物学或相关领域硕士以上学位',
      '熟练掌握Python、R等编程语言',
      '具有NGS数据分析经验',
      '熟悉常用生物信息学工具和数据库'
    ],
    featured: false
  },
  {
    title: '实验技术员 - 分子生物学',
    type: '全职',
    location: '北京',
    description: '负责实验室日常操作，包括基因克隆、蛋白表达纯化、细胞培养等，协助科研人员进行实验。',
    requirements: [
      '生物技术、生物工程或相关专业本科以上学历',
      '熟练掌握分子克隆、PCR、电泳等基础实验技能',
      '有实验室工作经验优先',
      '工作认真细致，有良好的团队合作精神'
    ],
    featured: false
  }
]
</script>

<style lang="less" scoped>
.join-page {
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

.hero-description {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.8;
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

.positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  
  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
  }
}

.position-card {
  padding: 30px;
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-medium);
  }
  
  &.fluidAnimation {
    border: 2px solid var(--primary-color);
  }
  
  .position-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--primary-color);
    color: white;
    padding: 5px 10px;
    border-radius: var(--border-radius-sm);
    font-size: 0.8rem;
  }
  
  h3 {
    font-size: 1.6rem;
    margin-bottom: 10px;
  }
  
  .position-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    font-size: 0.9rem;
    opacity: 0.7;
  }
  
  p {
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  .position-requirements {
    margin-bottom: 20px;
    
    h4 {
      margin-bottom: 10px;
    }
    
    ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 5px;
      }
    }
  }
  
  .el-button {
    width: 100%;
  }
}

.opportunities {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  
  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
  }
}

.opportunity-item {
  padding: 25px;
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-medium);
  }
  
  h3 {
    font-size: 1.4rem;
    margin-bottom: 15px;
    color: var(--primary-color);
  }
  
  p {
    margin-bottom: 15px;
    line-height: 1.6;
  }
  
  .opportunity-details {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    
    .dark-mode & {
      border-top-color: rgba(255, 255, 255, 0.1);
    }
    
    p {
      margin-bottom: 8px;
    }
  }
}

.application-section {
  padding: 60px 0;
  background-color: rgba(247, 247, 255, 0.3);
  
  .dark-mode & {
    background-color: rgba(26, 26, 46, 0.3);
  }
}

.application-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  
  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
  }
}

.application-info {
  h2 {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 30px;
    line-height: 1.6;
  }
}

.contact-info {
  margin-top: 30px;
  
  .contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    .el-icon {
      font-size: 20px;
      color: var(--primary-color);
      margin-right: 10px;
    }
  }
}

.application-form {
  padding: 30px;
  border-radius: var(--border-radius-lg);
  
  h3 {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }
  
  p {
    margin-bottom: 30px;
    opacity: 0.8;
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .upload-tip {
    margin-left: 10px;
    font-size: 0.9rem;
    opacity: 0.7;
  }
  
  .submit-btn {
    width: 100%;
    margin-top: 10px;
  }
}
</style> 
