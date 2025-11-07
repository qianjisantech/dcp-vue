<template>
  <div class="my-view-container">
    <div v-if="loading" class="loading-state">
      <t-loading text="加载中..." size="large" />
    </div>

    <div v-else-if="error" class="error-state">
      <t-icon name="error-circle" size="48px" />
      <p>{{ error }}</p>
      <t-button theme="primary" @click="loadViewData">重试</t-button>
    </div>

    <component
      v-else-if="currentViewComponent"
      :is="currentViewComponent"
      :view-data="viewData"
      :view-id="viewId"
    />

    <div v-else class="empty-state">
      <t-icon name="inbox" size="48px" />
      <p>未找到对应的视图</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getViewDetail } from '@/api/workspace'

// 导入不同类型的视图组件
import GanttView from './views/GanttView.vue'
import KanbanView from './views/KanbanView.vue'
import TableView from './views/TableView.vue'
import CalendarView from './views/CalendarView.vue'
import ResourceGanttView from './views/ResourceGanttView.vue'

const route = useRoute()

const loading = ref(false)
const error = ref('')
const viewData = ref(null)
const currentViewComponent = shallowRef(null)

// 从 URL 获取视图 ID
const viewId = computed(() => route.query.id)

// 视图类型与组件的映射
const viewComponentMap = {
  'gantt': GanttView,
  'kanban': KanbanView,
  'board': KanbanView, // board 也映射到看板视图
  'table': TableView,
  'calendar': CalendarView,
  'resource-gantt': ResourceGanttView
}

// 加载视图数据
const loadViewData = async () => {
  if (!viewId.value) {
    error.value = '缺少视图 ID'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 调用 API 获取视图数据
    const res = await getViewDetail(viewId.value)

    if (res.success && res.data) {
      const viewDetail = res.data

      viewData.value = {
        id: viewDetail.id,
        name: viewDetail.name,
        type: viewDetail.type,
        config: viewDetail.config || {},
        data: viewDetail.data || {}
      }

      // 根据视图类型加载对应的组件
      const viewType = viewDetail.type
      if (viewComponentMap[viewType]) {
        currentViewComponent.value = viewComponentMap[viewType]
      } else {
        error.value = `不支持的视图类型: ${viewType}`
      }
    } else {
      error.value = res.message || '视图不存在'
    }

    loading.value = false
  } catch (err) {
    loading.value = false
    error.value = err.message || '加载视图失败'
    MessagePlugin.error('加载视图失败')
  }
}

// 监听视图 ID 变化
watch(viewId, (newId) => {
  if (newId) {
    loadViewData()
  }
}, { immediate: true })

onMounted(() => {
  if (viewId.value) {
    loadViewData()
  }
})
</script>

<style scoped lang="scss">
.my-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .loading-state,
  .error-state,
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #646a73;

    .t-icon {
      color: #bbb;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .error-state {
    .t-icon {
      color: #e34d59;
    }
  }
}
</style>
