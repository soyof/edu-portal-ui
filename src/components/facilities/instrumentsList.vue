<template>
  <div class="instruments-section">
    <!-- Search Filters -->
    <div class="search-filters">
      <div class="filter-row">
        <div class="filter-item">
          <ElInput
            v-model="searchFilters.instName"
            :placeholder="$t('facilities.instNamePlaceholder')"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            @input="debouncedSearch"
          >
            <template #prefix>
              <ElIcon class="search-icon">
                <Search />
              </ElIcon>
            </template>
          </ElInput>
        </div>

        <div class="filter-item">
          <ElInput
            v-model="searchFilters.manufacturer"
            :placeholder="$t('facilities.manufacturerPlaceholder')"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            @input="debouncedSearch"
          >
            <template #prefix>
              <ElIcon class="search-icon">
                <Search />
              </ElIcon>
            </template>
          </ElInput>
        </div>

        <div class="filter-item">
          <ElInput
            v-model="searchFilters.model"
            :placeholder="$t('facilities.modelPlaceholder')"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            @input="debouncedSearch"
          >
            <template #prefix>
              <ElIcon class="search-icon">
                <Search />
              </ElIcon>
            </template>
          </ElInput>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state animate__animated animate__fadeIn">
      <div class="loading-spinner animate__animated animate__zoomIn">
        <div class="spinner-ring animate__animated animate__rotate animate__infinite animate__linear"></div>
      </div>
      <p class="animate__animated animate__fadeInUp animate__delay-1s">{{ $t('global.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state animate__animated animate__bounceIn">
      <div class="error-icon animate__animated animate__swing animate__delay-1s">🔬</div>
      <h3 class="animate__animated animate__fadeInUp animate__delay-2s">{{ $t('facilities.instrumentsNotFound') }}</h3>
      <p class="animate__animated animate__fadeInUp animate__delay-3s">{{ $t('facilities.instrumentsErrorDesc') }}</p>
    </div>

    <!-- Instruments List -->
    <div v-else-if="instruments.length > 0" class="instruments-grid">
      <div
        v-for="(instrument, index) in instruments"
        :key="instrument.id"
        class="instrument-card animate__animated animate__fadeInUp"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="goToInstrumentDetail(instrument.id)"
      >
        <div class="instrument-image">
          <img
            v-if="instrument.imageFiles && instrument.imageFiles.length > 0"
            :src="getImageUrl(instrument.imageFiles[0])"
            :alt="getCurrentInstName(instrument)"
            class="animate__animated animate__zoomIn"
            :style="{ animationDelay: `${index * 0.1 + 0.2}s` }"
            @error="handleImageError"
          >
          <div v-else class="image-placeholder animate__animated animate__fadeIn">
            <ElIcon class="placeholder-icon animate__animated animate__pulse animate__infinite"><Camera /></ElIcon>
          </div>
        </div>

        <div class="instrument-content">
          <h3 class="instrument-name animate__animated animate__slideInLeft" :style="{ animationDelay: `${index * 0.1 + 0.3}s` }">
            {{ getCurrentInstName(instrument) }}
          </h3>
          <div class="instrument-info">
            <div class="info-item animate__animated animate__slideInRight" :style="{ animationDelay: `${index * 0.1 + 0.4}s` }">
              <span class="info-label">{{ $t('facilities.manufacturer') }}:</span>
              <span class="info-value">{{ getCurrentManufacturer(instrument) }}</span>
            </div>
            <div class="info-item animate__animated animate__slideInRight" :style="{ animationDelay: `${index * 0.1 + 0.5}s` }">
              <span class="info-label">{{ $t('facilities.model') }}:</span>
              <span class="info-value">{{ instrument.model }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state animate__animated animate__fadeInUp">
      <div class="empty-icon animate__animated animate__bounce animate__delay-1s">🔬</div>
      <h3 class="animate__animated animate__fadeInUp animate__delay-2s">{{ $t('facilities.noInstruments') }}</h3>
      <p class="animate__animated animate__fadeInUp animate__delay-3s">{{ $t('facilities.noInstrumentsDesc') }}</p>
    </div>

    <!-- Pagination -->
    <CommonPagination
      :total="total"
      :pageSize="pageSize"
      :currentPage="currentPage"
      wrapperClass="animate__delay-1s"
      @currentChange="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElIcon, ElMessage } from 'element-plus'
import { Search, Camera } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import service from '@/utils/services'
import CommonPagination from '@/components/common/commonPagination.vue'

// 仪器设备响应接口
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

// 仪器查询参数
interface InstrumentQueryParams {
  pageNo?: number
  pageSize?: number
  instName?: string
  manufacturer?: string
  model?: string
}

const { t, locale } = useI18n()
const router = useRouter()

// Props
interface Props {
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

// 响应式数据
const loading = ref(false)
const error = ref(false)
const instruments = ref<InstrumentListResponse[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const searchFilters = ref<InstrumentQueryParams>({
  instName: '',
  manufacturer: '',
  model: ''
})

// 计算属性
const totalInstruments = computed(() => total.value)

// 防抖搜索
let searchTimeout: number | undefined
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

// API方法
const getInstrumentsList = (params: InstrumentQueryParams) => {
  return service.post('/api/instruments/list', { ...params })
}

// 方法
const fetchInstruments = () => {
  loading.value = true
  error.value = false

  const params: InstrumentQueryParams = {
    pageNo: currentPage.value,
    pageSize: pageSize.value,
    ...searchFilters.value
  }

  return getInstrumentsList(params)
    .then(result => {
      instruments.value = (result as any).list
      total.value = (result as any).total
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchInstruments()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchInstruments()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 工具方法
const getCurrentInstName = (instrument: InstrumentListResponse) => {
  return locale.value === 'en' && instrument.instNameEn
    ? instrument.instNameEn
    : instrument.instName
}

const getCurrentManufacturer = (instrument: InstrumentListResponse) => {
  return locale.value === 'en' && instrument.manufacturerEn
    ? instrument.manufacturerEn
    : instrument.manufacturer
}

const getImageUrl = (filename: string) => {
  // 如果图片地址已经包含http或https，直接使用
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  // 否则通过接口获取图片
  return `/fileApi/previewImage?filename=${filename}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const placeholder = img.parentElement?.querySelector('.image-placeholder') as HTMLElement
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}

// 跳转到仪器详情页面
const goToInstrumentDetail = (instrumentId: number) => {
  router.push(`/facilities/instruments/${instrumentId}`)
}

// 暴露数据和方法给父组件
defineExpose({
  totalInstruments,
  fetchInstruments
})

// 生命周期钩子
onMounted(() => {
  if (props.autoLoad) {
    fetchInstruments()
  }
})
</script>

<style lang="less" scoped>
// Search Filters
.search-filters {
  margin-bottom: 3rem;

  .filter-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .filter-item {
      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px) !important;
        border: 2px solid rgba(var(--primary-color-rgb), 0.15) !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.08) !important;
        transition: all 0.3s ease !important;
        height: 48px !important;

        .dark-mode & {
          background: rgba(30, 41, 59, 0.95) !important;
          border-color: rgba(var(--secondary-color-rgb), 0.2) !important;
        }

        &:hover {
          border-color: rgba(var(--primary-color-rgb), 0.3) !important;
          transform: translateY(-1px) !important;
        }

        &.is-focus {
          border-color: rgba(var(--primary-color-rgb), 0.5) !important;
          box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.15) !important;
        }
      }

      :deep(.el-input__inner) {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
        background: transparent !important;
        color: var(--text-color);
        font-weight: 500;

        &:focus {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
      }

      :deep(.el-input__prefix) {
        color: var(--primary-color);

        .dark-mode & {
          color: var(--secondary-color);
        }
      }
    }
  }
}

// Instruments Grid
.instruments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.instrument-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--primary-color-rgb), 0.12);
  border-radius: 24px;
  padding: 0;
  box-shadow:
    0 4px 20px rgba(var(--primary-color-rgb), 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  cursor: pointer;

  .dark-mode & {
    background: rgba(30, 41, 59, 0.98);
    border-color: rgba(var(--secondary-color-rgb), 0.25);
    box-shadow:
      0 4px 20px rgba(var(--secondary-color-rgb), 0.12),
      0 1px 3px rgba(0, 0, 0, 0.3);
  }

  // 卡片顶部装饰条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    opacity: 0;
    transition: opacity 0.3s ease;

    .dark-mode & {
      background: linear-gradient(90deg, var(--secondary-color), var(--tech-accent));
    }
  }

  &:hover {
    transform: translateY(-12px);
    box-shadow:
      0 25px 70px rgba(var(--primary-color-rgb), 0.15),
      0 8px 16px rgba(var(--primary-color-rgb), 0.1);
    border-color: rgba(var(--primary-color-rgb), 0.4);

    .dark-mode & {
      box-shadow:
        0 25px 70px rgba(var(--secondary-color-rgb), 0.2),
        0 8px 16px rgba(var(--secondary-color-rgb), 0.15);
      border-color: rgba(var(--secondary-color-rgb), 0.5);
    }

    &::before {
      opacity: 1;
    }

    .instrument-image {
      &::after {
        opacity: 1;
      }
    }
  }

  .instrument-image {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(var(--primary-color-rgb), 0.08);

    .dark-mode & {
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
      border-bottom-color: rgba(var(--secondary-color-rgb), 0.15);
    }

    // 图片区域装饰效果
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 70% 30%, rgba(var(--primary-color-rgb), 0.05) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.3s ease;

      .dark-mode & {
        background: radial-gradient(circle at 70% 30%, rgba(var(--secondary-color-rgb), 0.08) 0%, transparent 50%);
      }
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
      padding: 16px;
      z-index: 1;
      position: relative;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));

      .dark-mode & {
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
      }
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: center;

      .dark-mode & {
        background: linear-gradient(135deg, #374151, #4b5563);
      }

      .placeholder-icon {
        font-size: 3rem;
        color: #9ca3af;

        .dark-mode & {
          color: #6b7280;
        }
      }
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .instrument-content {
    padding: 28px 24px;
    background: rgba(255, 255, 255, 0.7);
    position: relative;

    .dark-mode & {
      background: rgba(30, 41, 59, 0.7);
    }

    // 内容区域装饰
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 24px;
      right: 24px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(var(--primary-color-rgb), 0.2), transparent);

      .dark-mode & {
        background: linear-gradient(90deg, transparent, rgba(var(--secondary-color-rgb), 0.3), transparent);
      }
    }

    .instrument-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 20px;
      line-height: 1.4;
      position: relative;
      padding-bottom: 8px;

      .dark-mode & {
        color: var(--secondary-color);
      }

      // 标题下划线装饰
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        border-radius: 1px;

        .dark-mode & {
          background: linear-gradient(90deg, var(--secondary-color), var(--tech-accent));
        }
      }
    }

    .instrument-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 12px 16px;
        background: rgba(var(--primary-color-rgb), 0.02);
        border: 1px solid rgba(var(--primary-color-rgb), 0.06);
        border-radius: 12px;
        transition: all 0.2s ease;

        .dark-mode & {
          background: rgba(var(--secondary-color-rgb), 0.05);
          border-color: rgba(var(--secondary-color-rgb), 0.1);
        }

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          background: rgba(var(--primary-color-rgb), 0.05);
          border-color: rgba(var(--primary-color-rgb), 0.12);

          .dark-mode & {
            background: rgba(var(--secondary-color-rgb), 0.08);
            border-color: rgba(var(--secondary-color-rgb), 0.15);
          }
        }

        .info-label {
          font-weight: 600;
          color: #64748b;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;

          .dark-mode & {
            color: #94a3b8;
          }

          // 添加小图标装饰
          &::before {
            content: '▪';
            color: var(--primary-color);
            font-size: 0.8rem;

            .dark-mode & {
              color: var(--secondary-color);
            }
          }
        }

        .info-value {
          font-weight: 600;
          color: var(--text-color);
          text-align: right;
          flex: 1;
          margin-left: 16px;
          font-size: 0.95rem;

          .dark-mode & {
            color: #e2e8f0;
          }
        }
      }
    }
  }
}

// Loading and Error States
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .loading-spinner {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: 24px;

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1.2s linear infinite;

      .dark-mode & {
        border-top-color: var(--secondary-color);
      }
    }
  }

  .error-icon, .empty-icon {
    font-size: 4rem;
    margin-bottom: 24px;
    opacity: 0.6;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-color);

    .dark-mode & {
      color: #f7fafc;
    }
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
    max-width: 400px;

    .dark-mode & {
      color: #94a3b8;
    }
  }
}

// Pagination
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  padding: 2rem 0;
}
</style>
