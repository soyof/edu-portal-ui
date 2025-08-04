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
  padding: 2rem 0;
  margin-top: 2rem;

  &.animate__animated {
    animation-duration: 0.6s;
    animation-delay: 0.2s;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pagination-wrapper {
    padding: 1.5rem 0;
    margin-top: 1.5rem;

    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__jump {
        display: none;
      }

      .el-pager {
        li {
          min-width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
          margin: 0 2px;
        }
      }

      .btn-prev,
      .btn-next {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .pagination-wrapper {
    padding: 1rem 0;
    margin-top: 1rem;

    :deep(.el-pagination) {
      .el-pager {
        li {
          min-width: 24px;
          height: 24px;
          line-height: 24px;
          font-size: 11px;
          margin: 0 1px;
        }
      }

      .btn-prev,
      .btn-next {
        min-width: 24px;
        height: 24px;
        line-height: 24px;
        font-size: 11px;
      }
    }
  }
}
</style>
