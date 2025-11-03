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
        <template #space="{ row }">
          <div class="space-info">
            <t-icon name="layers" size="20px" style="color: #0052d9;" />
            <span class="space-name">{{ row.space }}</span>
          </div>
        </template>

        <template #keywords="{ row }">
          <div class="keywords-tags">
            <t-tag
              v-for="keyword in row.keywords"
              :key="keyword"
              size="small"
              variant="light"
              style="margin-right: 4px;"
            >
              {{ keyword }}
            </t-tag>
          </div>
        </template>

        <template #space_type="{ row }">
          <t-tag
            :theme="row.space_type === '公开' ? 'success' : 'warning'"
            size="small"
          >
            {{ row.space_type }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-button theme="primary" variant="text" @click="handleSettings(row)">
            <template #icon>
              <t-icon name="setting" />
            </template>
            空间设置
          </t-button>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getSpaceList } from '@/api/workspace'

const loading = ref(false)

// 表格列配置
const columns = [
  {
    colKey: 'space',
    title: '空间',
    width: 250,
    align: 'left'
  },
  {
    colKey: 'keywords',
    title: '关键词',
    width: 200,
    align: 'left'
  },
  {
    colKey: 'space_type',
    title: '空间类型',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'space_owner',
    title: '空间负责人',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'version_manager',
    title: '版本管理员',
    width: 150,
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
    const res = await getSpaceList()
    if (res.code === 200) {
      spaceList.value = res.data.list
    } else {
      MessagePlugin.error(res.message || '获取空间列表失败')
    }
  } catch (error) {
    MessagePlugin.error('获取空间列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSpaceList()
})

// 处理创建空间
const handleCreate = () => {
  MessagePlugin.info('创建空间功能开发中')
}

// 处理空间设置
const handleSettings = (row) => {
  MessagePlugin.info(`打开空间设置：${row.space}`)
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
        }
      }

      .keywords-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
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
  }
}
</style>
