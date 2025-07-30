<template>
  <button
    :class="[
      'view-details-button',
      { 'with-icon': showIcon }
    ]"
    @click="$emit('click')"
  >
    <span class="btn-text"><slot>{{ text }}</slot></span>
    <span v-if="showIcon" class="btn-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
        height="24"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" :fill="iconColor" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '查看项目详情'
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const iconColor = computed(() => props.color || 'currentColor')
</script>

<style lang="less" scoped>
.view-details-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 28px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 1));
  border: none;
  border-radius: 4px;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    transition: all 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }

    .btn-icon {
      transform: translateX(3px);
    }
  }

  &.with-icon {
    padding-right: 20px;
  }

  .btn-text {
    position: relative;
    z-index: 1;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    transition: transform 0.3s ease;
    position: relative;
    z-index: 1;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  // 紫色主题下的按钮样式
  .purple-theme & {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), white);
    color: @purple-theme-dark;

    .dark-mode & {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }

  // 特殊背景处理
  .dark-mode &, .purple-bg &, .research-section &, .partners-section & {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), white);
    color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
  }

  .dark-mode.purple-theme & {
    color: @purple-theme-dark;
  }

  .purple-theme .purple-bg &, .purple-theme .research-section & {
    color: @purple-theme-dark;
  }
}
</style>
