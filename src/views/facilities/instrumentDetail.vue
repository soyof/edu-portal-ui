<template>
  <div class="instrument-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="modern-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-dot"></div>
      </div>
      <p class="loading-text">{{ $t('facilities.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="empty-state">
      <div class="empty-icon">🔧</div>
      <h3 class="empty-title">{{ $t('facilities.instrumentNotFound') }}</h3>
      <p class="empty-text">{{ $t('facilities.loadError') }}</p>
      <ElButton type="primary" @click="fetchInstrumentDetail">
        {{ $t('global.retry') }}
      </ElButton>
    </div>

    <!-- Instrument Detail Content -->
    <div v-else-if="instrument" class="instrument-detail-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-background">
          <div class="floating-elements">
            <div
              v-for="i in 8"
              :key="i"
              class="float-element"
              :style="{
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: (3 + Math.random() * 2) + 's'
              }"
            ></div>
          </div>
        </div>

        <div class="container">
          <div class="hero-content">
            <!-- Breadcrumb Navigation -->
            <nav class="breadcrumb-nav">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <router-link to="/facilities" class="breadcrumb-link">
                    {{ $t('facilities.title') }}
                  </router-link>
                </li>
                <li class="breadcrumb-item active">
                  {{ $t('facilities.instrumentDetail') }}
                </li>
              </ol>
            </nav>

            <!-- Instrument Title -->
            <h1 class="page-title">
              <span class="title-gradient">{{ getCurrentLanguageText(instrument, 'instName') }}</span>
            </h1>

            <!-- Instrument Meta -->
            <div class="instrument-meta-section">
              <div class="meta-info">
                <span v-if="getCurrentLanguageText(instrument, 'manufacturer')" class="manufacturer-badge">
                  <span class="meta-label">{{ $t('facilities.manufacturer') }}:</span>
                  {{ getCurrentLanguageText(instrument, 'manufacturer') }}
                </span>
                <span v-if="instrument.model" class="model-badge">
                  <span class="meta-label">{{ $t('facilities.model') }}:</span>
                  {{ instrument.model }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Section -->
      <section class="content-section">
        <div class="container">
          <div class="instrument-content">
            <!-- Images Module -->
            <div v-if="instrument.imageFiles && instrument.imageFiles.length > 0" class="instrument-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('facilities.images') }}</span>
                </h2>
              </div>
              <div class="content-card images-content">
                <div class="images-grid">
                  <ElImage
                    v-for="(image, index) in instrument.imageFiles"
                    :key="index"
                    :src="getImageUrl(image)"
                    :alt="`${getCurrentLanguageText(instrument, 'instName')} ${index + 1}`"
                    class="instrument-image"
                    fit="contain"
                    :previewSrcList="imagePreviewList"
                    :initialIndex="index"
                    :previewTeleported="true"
                  />
                </div>
              </div>
            </div>

            <!-- Working Principle Module -->
            <div v-if="getCurrentLanguageText(instrument, 'workingPrinciple')" class="instrument-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('facilities.workingPrinciple') }}</span>
                </h2>
              </div>
              <div class="content-card">
                <div class="html-content" v-html="getCurrentLanguageText(instrument, 'workingPrinciple')"></div>
              </div>
            </div>

            <!-- Application Scope Module -->
            <div v-if="getCurrentLanguageText(instrument, 'applicationScope')" class="instrument-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('facilities.applicationScope') }}</span>
                </h2>
              </div>
              <div class="content-card">
                <div class="html-content" v-html="getCurrentLanguageText(instrument, 'applicationScope')"></div>
              </div>
            </div>

            <!-- Performance Features Module -->
            <div v-if="getCurrentLanguageText(instrument, 'performanceFeatures')" class="instrument-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('facilities.performanceFeatures') }}</span>
                </h2>
              </div>
              <div class="content-card">
                <div class="html-content" v-html="getCurrentLanguageText(instrument, 'performanceFeatures')"></div>
              </div>
            </div>

            <!-- Other Information Module -->
            <div v-if="getCurrentLanguageText(instrument, 'otherInfo')" class="instrument-module">
              <div class="module-header">
                <h2 class="module-title">
                  <div class="title-decorator"></div>
                  <span class="title-text">{{ $t('facilities.otherInfo') }}</span>
                </h2>
              </div>
              <div class="content-card">
                <div class="html-content" v-html="getCurrentLanguageText(instrument, 'otherInfo')"></div>
              </div>
            </div>

            <!-- No Detail Info State -->
            <div v-if="!hasDetailInfo && !instrument.imageFiles?.length" class="empty-content-state">
              <div class="empty-icon">📝</div>
              <h3 class="empty-title">{{ $t('facilities.noDetailInfo') }}</h3>
              <p class="empty-text">{{ $t('facilities.noDetailInfoDesc') }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ElButton,
  ElMessage,
  ElImage
} from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useLanguageText } from '@/hooks/useResearchSearch'
import service from '@/utils/services'

// 接口定义
interface InstrumentListResponse {
  id: number
  instName: string
  instNameEn?: string
  manufacturer: string
  manufacturerEn?: string
  model: string
  imageFiles?: string[]
  publishTimes?: string
}

interface InstrumentDetailResponse extends InstrumentListResponse {
  workingPrinciple?: string
  workingPrincipleEn?: string
  applicationScope?: string
  applicationScopeEn?: string
  performanceFeatures?: string
  performanceFeaturesEn?: string
  otherInfo?: string
  otherInfoEn?: string
}

// 路由和国际化
const route = useRoute()
const { t } = useI18n()
const { getCurrentLanguageText } = useLanguageText()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const instrument = ref<InstrumentDetailResponse | null>(null)

// 计算属性
const instrumentId = computed(() => route.params.id as string)

// 图片预览列表
const imagePreviewList = computed(() => {
  if (!instrument.value?.imageFiles) return []
  return instrument.value.imageFiles.map(image => {
    // 如果图片地址已经包含http或https，直接使用
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    // 否则通过接口获取图片
    return `/fileApi/previewImage?filename=${image}`
  })
})

// 检查是否有详细信息
const hasDetailInfo = computed(() => {
  if (!instrument.value) return false
  return !!(
    getCurrentLanguageText(instrument.value, 'workingPrinciple') ||
    getCurrentLanguageText(instrument.value, 'applicationScope') ||
    getCurrentLanguageText(instrument.value, 'performanceFeatures') ||
    getCurrentLanguageText(instrument.value, 'otherInfo')
  )
})

// 工具方法
const getImageUrl = (filename: string) => {
  // 如果图片地址已经包含http或https，直接使用
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  // 否则通过接口获取图片
  return `/fileApi/previewImage?filename=${filename}`
}

// 获取仪器详情
const fetchInstrumentDetail = () => {
  loading.value = true
  error.value = false

  return service.get(`/api/instruments/${instrumentId.value}`)
    .then(response => {
      instrument.value = response as unknown as InstrumentDetailResponse
    })
    .finally(() => {
      loading.value = false
    })
}

// 生命周期
onMounted(() => {
  fetchInstrumentDetail()
})
</script>

<style scoped lang="less">
.instrument-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);

  // Loading State
  .loading-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: rgba(255, 255, 255, 0.95);

    .modern-spinner {
      position: relative;
      width: 60px;
      height: 60px;
      margin-bottom: 2rem;

      .spinner-ring {
        width: 60px;
        height: 60px;
        border: 3px solid transparent;
        border-top: 3px solid var(--primary-color);
        border-right: 3px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1.2s linear infinite;
      }

      .spinner-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        background: var(--primary-color);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 1.2s ease-in-out infinite;
      }
    }

    .loading-text {
      font-size: 1.1rem;
      color: #64748b;
      font-weight: 500;
    }
  }

  // Error State
  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: rgba(255, 255, 255, 0.95);
    text-align: center;
    padding: 2rem;

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      opacity: 0.6;
    }

    .empty-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }

    .empty-text {
      font-size: 1rem;
      color: #64748b;
      margin-bottom: 2rem;
      line-height: 1.6;
      max-width: 400px;
    }
  }

  // Main Content
  .instrument-detail-content {
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.9) 0%, rgba(var(--accent-color-rgb), 0.9) 100%);
      padding: 4rem 0;
      color: white;
      overflow: hidden;

      .hero-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;

          .float-element {
            position: absolute;
            width: 6px;
            height: 6px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: particleDrift ease-in-out infinite;
          }
        }
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        position: relative;
        z-index: 1;
      }

      .hero-content {
        text-align: center;

        .breadcrumb-nav {
          margin-bottom: 2rem;

          .breadcrumb {
            display: flex;
            justify-content: center;
            align-items: center;
            list-style: none;
            padding: 0;
            margin: 0;
            gap: 0.5rem;

            .breadcrumb-item {
              font-size: 0.9rem;
              opacity: 0.8;

              &:not(:last-child)::after {
                content: '/';
                margin-left: 0.5rem;
                opacity: 0.6;
              }

              &.active {
                opacity: 1;
                font-weight: 600;
              }

              .breadcrumb-link {
                color: white;
                text-decoration: none;
                transition: opacity 0.3s ease;

                &:hover {
                  opacity: 1;
                  text-decoration: underline;
                }
              }
            }
          }
        }

        .page-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 2rem;
          line-height: 1.2;

          .title-gradient {
            background: linear-gradient(45deg, #ffffff, #e0e7ff);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
          }

          @media (max-width: 768px) {
            font-size: 2.2rem;
          }
        }

        .instrument-meta-section {
          .meta-info {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;

            .manufacturer-badge,
            .model-badge {
              background: rgba(255, 255, 255, 0.15);
              padding: 0.75rem 1.5rem;
              border-radius: 25px;
              font-size: 0.95rem;
              font-weight: 500;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              transition: all 0.3s ease;

              .meta-label {
                opacity: 0.8;
                font-weight: 600;
                margin-right: 0.25rem;
              }

              &:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-2px);
              }
            }

            @media (max-width: 768px) {
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
            }
          }
        }
      }
    }

    .content-section {
      padding: 4rem 0;
      background: #f8fafc;

      .dark-mode & {
        background: #0f172a;
      }

      .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 2rem;
      }

      .instrument-content {
        .instrument-module {
          margin-bottom: 3rem;

          &:last-child {
            margin-bottom: 0;
          }

          .dark-mode & {
            padding-left: 1rem;
            border-radius: 0 8px 8px 0;
            background: rgba(var(--primary-color-rgb), 0.03);
          }

          .module-header {
            margin-bottom: 1.5rem;

            .module-title {
              display: flex;
              align-items: center;
              gap: 1rem;
              font-size: 1.6rem;
              font-weight: 700;
              color: #1f2937;

              .dark-mode & {
                color: #f1f5f9;
              }

              .title-decorator {
                width: 4px;
                height: 2rem;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                border-radius: 2px;
                .dark-mode & {
                  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                  box-shadow: 0 0 8px rgba(var(--primary-color-rgb), 0.5);
                }
              }

              .title-text {
                flex: 1;
              }
            }
          }

          .content-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;

            .dark-mode & {
              background: #1e293b;
              border-color: #475569;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            }

            &:hover {
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
              transform: translateY(-2px);

              .dark-mode & {
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
              }
            }

            // Images Content
            &.images-content {
              .images-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;

                .instrument-image {
                  width: 100%;
                  height: 200px;
                  border-radius: 12px;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

                  &:hover {
                    transform: scale(1.03);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                  }
                }

                @media (max-width: 768px) {
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 1rem;

                  .instrument-image {
                    height: 180px;
                  }
                }
              }
            }

            // Content with html content
            .html-content {
              line-height: 1.8;
              color: #374151;
              font-size: 1rem;

              .dark-mode & {
                color: #e2e8f0;
              }
            }
          }
        }

        .empty-content-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;

          .empty-icon {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            opacity: 0.6;
          }

          .empty-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #64748b;

            .dark-mode & {
              color: #94a3b8;
            }
          }

          .empty-text {
            font-size: 1rem;
            line-height: 1.6;
            max-width: 400px;
            margin: 0 auto;
          }
        }
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .instrument-detail-page {
    .instrument-detail-content {
      .hero-section {
        padding: 3rem 0;

        .container {
          padding: 0 1rem;
        }

        .hero-content {
          .page-title {
            font-size: 2.2rem;
            margin-bottom: 1.5rem;
          }
        }
      }

      .content-section {
        padding: 3rem 0;

        .container {
          padding: 0 1rem;
        }

        .instrument-content {
          .instrument-module {
            margin-bottom: 2rem;

            .content-card {
              padding: 1.5rem;
            }
          }
        }
      }
    }
  }
}
</style>
