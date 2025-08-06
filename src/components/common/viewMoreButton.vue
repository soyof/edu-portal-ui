<template>
  <el-button
    :type="type"
    :class="[
      'view-more-button',
      {
        'has-arrow': showArrow,
        'gradient-bg': useGradient,
        'inverse': inverse
      }
    ]"
    @click="handleClick"
  >
    <slot>{{ displayText }}</slot>
    <el-icon v-if="showArrow" class="arrow-icon"><ArrowRight /></el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  to: {
    type: [String, Object],
    default: ''
  },
  type: {
    type: String,
    default: 'primary'
  },
  showArrow: {
    type: Boolean,
    default: true
  },
  useGradient: {
    type: Boolean,
    default: false
  },
  inverse: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

// 计算显示文本，如果没有传入text则使用默认国际化文本
const displayText = computed(() => {
  return props.text || t('common.viewMore')
})

const handleClick = () => {
  emit('click')
}
</script>

<style lang="less" scoped>
.view-more-button {
  position: relative;
  overflow: hidden;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.3s ease;

  &.has-arrow {
    padding-right: 32px;

    .arrow-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.3s ease;
    }

    &:hover .arrow-icon {
      transform: translate(3px, -50%);
    }
  }

  &.gradient-bg {
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)) !important;
    border: none !important;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: all 0.6s;
      z-index: 1;
    }

    &:hover {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);

      &::before {
        left: 100%;
      }
    }
  }

  // 紫色主题特殊处理
  .purple-theme & {
    &.el-button--primary {
      &:not(.inverse) {
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
      }

      &.inverse {
        background: @purple-theme !important;
        color: white !important;

        &:hover {
          background: @purple-theme-light !important;
        }
      }

      &.gradient-bg {
        background: linear-gradient(90deg, @purple-theme, @purple-theme-light) !important;
        color: white !important;

        &:hover {
          background: @purple-theme !important;
        }
      }
    }
  }

  // 紫色背景上的特殊处理
  .purple-bg &, .research-section.purple-bg &, .partners-section.purple-bg & {
    &.el-button--primary {
      background: white !important;
      color: @purple-theme-dark !important;
      border: none !important;

      &:hover {
        background: rgba(255, 255, 255, 0.9) !important;
      }

      &.inverse {
        background: transparent !important;
        color: white !important;
        border: 1px solid white !important;

        &:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }
  }
}
</style>
