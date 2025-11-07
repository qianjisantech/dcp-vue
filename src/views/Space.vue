<template>
  <div class="space-container">
    <t-card class="space-card">
      <div class="space-header">
        <h3 class="space-title">空间列表</h3>
        <t-button theme="primary" size="medium" @click="handleCreate">
          <template #icon>
            <t-icon name="add" />
          </template>
          创建空间
        </t-button>
      </div>

      <t-table
        :data="spaceList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        stripe
        hover
        class="space-table"
      >
        <template #name="{ row }">
          <div class="space-info">
            <t-icon :name="row.icon || 'layers'" size="20px" style="color: #0052d9;" />
            <span class="space-name">{{ row.name }}</span>
          </div>
        </template>

        <template #owner="{ row }">
          <span>{{ row.owner || row.ownerName || '-' }}</span>
        </template>

        <template #keywords="{ row }">
          <span>{{ row.code || '-' }}</span>
        </template>

        <template #operation="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" size="small" @click="handleView(row)">
              查看
            </t-button>
            <t-button theme="primary" variant="text" size="small" @click="handleSettings(row)">
              设置
            </t-button>
          </t-space>
        </template>
      </t-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <t-pagination
          v-model="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-size-options="[10, 20, 50, 100]"
          show-page-size
          show-page-number
          show-jumper
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getSpaceList } from '@/api/workspace'

const loading = ref(false)

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    colKey: 'name',
    title: '空间名称',
    width: 280,
    align: 'left'
  },
  {
    colKey: 'keywords',
    title: '关键词',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'owner',
    title: '负责人',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    align: 'center',
    fixed: 'right'
  }
]

// 空间列表
const spaceList = ref([])

// 获取空间列表
const fetchSpaceList = async () => {
  try {
    loading.value = true
    const res = await getSpaceList({
      current: pagination.value.current,
      size: pagination.value.pageSize
    })
    if (res.success) {
      // 过滤掉已归档的空间（status=0）
      const records = res.data.records || res.data.list || []
      spaceList.value = records.filter(space => space.status === 1)
      // 更新总数
      pagination.value.total = res.data.total || records.length
    } else {
      MessagePlugin.error(res.message || '获取空间列表失败')
    }
  } catch (error) {
    console.error('获取空间列表失败:', error)
    MessagePlugin.error('获取空间列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  fetchSpaceList()
}

// 处理每页条数变化
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1  // 重置到第一页
  fetchSpaceList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSpaceList()
})

// 处理创建空间
const handleCreate = () => {
  MessagePlugin.info('创建空间功能开发中')
}

// 处理查看空间
const handleView = (row) => {
  MessagePlugin.info(`查看空间：${row.name}`)
}

// 处理空间设置
const handleSettings = (row) => {
  MessagePlugin.info(`空间设置：${row.name}`)
}
</script>

<style scoped lang="scss">
.space-container {
  .space-card {
    :deep(.t-card__body) {
      padding: 24px;
    }

    .space-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      .space-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2329;
        margin: 0;
      }
    }

    .space-table {
      .space-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .space-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2329;
          margin-left: 8px;
        }
      }

      :deep(.t-table) {
        border: 1px solid #e7e7e7;
        border-radius: 6px;
      }

      :deep(.t-table__header) {
        background: #f5f7fa;

        th {
          font-weight: 600;
          color: #1f2329;
          border-bottom: 1px solid #e7e7e7;
        }
      }

      :deep(.t-table__body) {
        tr {
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
          }

          td {
            color: #646a73;
            border-bottom: 1px solid #e7e7e7;
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e7e7e7;
    }
  }
}
</style>
