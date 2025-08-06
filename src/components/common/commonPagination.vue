<template>
  <div
    v-if="showPagination"
    class="pagination-wrapper animate__animated animate__fadeInUp"
    :class="wrapperClass"
  >
    <ElPagination
      background
      :layout="layout"
      :total="total"
      :pageSize="pageSize"
      :currentPage="currentPage"
      :pageSizes="pageSizes"
      :small="small"
      :disabled="disabled"
      @currentChange="handleCurrentChange"
      @sizeChange="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElPagination } from 'element-plus'

interface Props {
  // 基础分页参数
  total: number
  pageSize?: number
  currentPage?: number

  // 分页器配置
  layout?: string
  pageSizes?: number[]
  small?: boolean
  disabled?: boolean

  // 显示控制
  hideOnSinglePage?: boolean
  threshold?: number

  // 样式自定义
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 15,
  currentPage: 1,
  layout: 'prev, pager, next',
  pageSizes: () => [10, 15, 20, 50],
  small: false,
  disabled: false,
  hideOnSinglePage: true,
  threshold: 1,
  wrapperClass: ''
})

interface Emits {
  (e: 'update:currentPage', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'currentChange', value: number): void
  (e: 'sizeChange', value: number): void
}

const emit = defineEmits<Emits>()

// 计算是否显示分页器
const showPagination = computed(() => {
  if (props.hideOnSinglePage) {
    const totalPages = Math.ceil(props.total / props.pageSize)
    return totalPages > props.threshold
  }
  return props.total > 0
})

// 处理页码变化
const handleCurrentChange = (page: number) => {
  emit('update:currentPage', page)
  emit('currentChange', page)
}

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  emit('update:pageSize', size)
  emit('sizeChange', size)
}
</script>

<style lang="less" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem 1.5rem;
  margin-top: 1rem;
  position: relative;

  // 科技感背景
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 600px;
    height: 60px;
    background: linear-gradient(135deg,
      rgba(var(--primary-color-rgb), 0.05) 0%,
      rgba(var(--accent-color-rgb), 0.03) 50%,
      rgba(var(--primary-color-rgb), 0.05) 100%);
    border-radius: 50px;
    border: 1px solid rgba(var(--primary-color-rgb), 0.1);
    backdrop-filter: blur(10px);
    z-index: -1;
  }

  &.animate__animated {
    animation-duration: 0.6s;
    animation-delay: 0.2s;
  }

  // Element Plus 分页器样式覆盖
  :deep(.el-pagination) {
    // 整体样式
    --el-pagination-font-size: 14px;
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: var(--text-color);

    // 按钮样式
    .btn-prev,
    .btn-next {
      min-width: 40px;
      height: 40px;
      line-height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(var(--primary-color-rgb), 0.2);
      color: var(--primary-color);
      font-weight: 500;
      margin: 0 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.1);

      &:hover {
        background: linear-gradient(135deg,
          rgba(var(--primary-color-rgb), 0.15),
          rgba(var(--accent-color-rgb), 0.15));
        border-color: rgba(var(--primary-color-rgb), 0.4);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.2);
        color: var(--primary-color);
      }

      &:disabled {
        background: rgba(255, 255, 255, 0.02);
        border-color: rgba(var(--primary-color-rgb), 0.1);
        color: rgba(var(--text-color-rgb, 0, 0, 0), 0.3);
        transform: none;
        box-shadow: none;
      }

      .dark-mode & {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(var(--primary-color-rgb), 0.3);

        &:hover {
          background: linear-gradient(135deg,
            rgba(var(--primary-color-rgb), 0.2),
            rgba(var(--accent-color-rgb), 0.2));
        }
      }
    }

    // 页码按钮样式
    .el-pager {
      li {
        min-width: 40px;
        height: 40px;
        line-height: 40px;
        border-radius: 12px;
        margin: 0 4px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(var(--primary-color-rgb), 0.15);
        color: var(--text-color);
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        &:hover {
          background: linear-gradient(135deg,
            rgba(var(--primary-color-rgb), 0.12),
            rgba(var(--accent-color-rgb), 0.12));
          border-color: rgba(var(--primary-color-rgb), 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.15);
          color: var(--primary-color);
        }

        &.is-active {
          background: linear-gradient(135deg,
            var(--primary-color),
            var(--accent-color));
          border-color: var(--primary-color);
          color: white;
          font-weight: 600;
          transform: translateY(-2px);
          box-shadow:
            0 4px 16px rgba(var(--primary-color-rgb), 0.3),
            0 0 20px rgba(var(--primary-color-rgb), 0.2);

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg,
              rgba(255, 255, 255, 0.2),
              transparent 50%,
              rgba(255, 255, 255, 0.1));
            border-radius: 12px;
            pointer-events: none;
          }
        }

        .dark-mode & {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(var(--primary-color-rgb), 0.2);

          &:hover {
            background: linear-gradient(135deg,
              rgba(var(--primary-color-rgb), 0.15),
              rgba(var(--accent-color-rgb), 0.15));
          }
        }
      }
    }

    // 页面大小选择器
    .el-pagination__sizes {
      .el-select {
        .el-select__wrapper {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(var(--primary-color-rgb), 0.2);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(var(--primary-color-rgb), 0.1);
            border-color: rgba(var(--primary-color-rgb), 0.3);
          }

          .dark-mode & {
            background: rgba(255, 255, 255, 0.03);
          }
        }
      }
    }

    // 总计和跳转输入框
    .el-pagination__total,
    .el-pagination__jump {
      color: var(--text-color-secondary);
      font-weight: 500;

      .el-input {
        .el-input__wrapper {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(var(--primary-color-rgb), 0.2);
          border-radius: 8px;
          backdrop-filter: blur(10px);

          &:hover {
            border-color: rgba(var(--primary-color-rgb), 0.3);
          }

          &.is-focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 8px rgba(var(--primary-color-rgb), 0.2);
          }

          .dark-mode & {
            background: rgba(255, 255, 255, 0.03);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pagination-wrapper {
    padding: 2rem 0;
    margin-top: 1.5rem;

    &::before {
      height: 50px;
      max-width: 90%;
    }

    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__jump {
        display: none;
      }

      .btn-prev,
      .btn-next {
        min-width: 36px;
        height: 36px;
        line-height: 36px;
        margin: 0 6px;
      }

      .el-pager {
        li {
          min-width: 36px;
          height: 36px;
          line-height: 36px;
          margin: 0 3px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .pagination-wrapper {
    padding: 1.5rem 0;
    margin-top: 1rem;

    &::before {
      height: 45px;
      max-width: 95%;
    }

    :deep(.el-pagination) {
      .btn-prev,
      .btn-next {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        margin: 0 4px;
        border-radius: 10px;
      }

      .el-pager {
        li {
          min-width: 32px;
          height: 32px;
          line-height: 32px;
          margin: 0 2px;
          border-radius: 10px;
        }
      }

      .el-pagination__sizes {
        display: none;
      }
    }
  }
}

// 暗色模式优化
.dark-mode .pagination-wrapper {
  &::before {
    background: linear-gradient(135deg,
      rgba(var(--primary-color-rgb), 0.08) 0%,
      rgba(var(--accent-color-rgb), 0.05) 50%,
      rgba(var(--primary-color-rgb), 0.08) 100%);
    border-color: rgba(var(--primary-color-rgb), 0.15);
  }
}
</style>
