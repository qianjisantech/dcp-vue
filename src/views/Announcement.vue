<template>
  <div class="announcement-container">
    <t-card class="announcement-card">
      <div class="announcement-header">
        <h3 class="announcement-title">系统公告</h3>
        <div class="header-actions">
          <t-button theme="default" variant="outline" size="medium" @click="testUpdateNotification">
            <template #icon>
              <t-icon name="notification" />
            </template>
            测试更新提示
          </t-button>
          <t-button theme="primary" size="medium" @click="handleCreate">
            <template #icon>
              <t-icon name="add" />
            </template>
            发布公告
          </t-button>
        </div>
      </div>

      <t-table
        :data="announcementList"
        :columns="columns"
        :loading="loading"
        row-key="id"
        stripe
        hover
        class="announcement-table"
        @row-click="handleRowClick"
      >
        <template #title="{ row }">
          <div class="announcement-title-cell">
            <t-icon name="notification" size="20px" style="color: #0052d9;" />
            <span class="title-text">{{ row.title }}</span>
            <t-tag v-if="row.isTop" theme="danger" size="small">置顶</t-tag>
            <t-tag v-if="row.isNew" theme="warning" size="small">新</t-tag>
          </div>
        </template>

        <template #type="{ row }">
          <t-tag
            :theme="getTypeTheme(row.type)"
            size="small"
          >
            {{ row.type }}
          </t-tag>
        </template>

        <template #status="{ row }">
          <t-tag
            :theme="getStatusTheme(row.status)"
            size="small"
          >
            {{ row.status }}
          </t-tag>
        </template>

        <template #operation="{ row }">
          <t-button theme="primary" variant="text" @click.stop="handleEdit(row)">
            编辑
          </t-button>
          <t-button theme="danger" variant="text" @click.stop="handleDelete(row)">
            删除
          </t-button>
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

    <!-- 公告详情抽屉 -->
    <t-drawer
      v-model:visible="showDetailDrawer"
      header="公告详情"
      size="60%"
      :close-btn="true"
      destroy-on-close
    >
      <div class="announcement-detail" v-if="currentAnnouncement">
        <div class="detail-header">
          <h2>{{ currentAnnouncement.title }}</h2>
          <div class="detail-meta">
            <span>发布人：{{ currentAnnouncement.publisher }}</span>
            <span>发布时间：{{ currentAnnouncement.publishTime }}</span>
            <t-tag :theme="getTypeTheme(currentAnnouncement.type)" size="small">
              {{ currentAnnouncement.type }}
            </t-tag>
          </div>
        </div>
        <div class="detail-content">
          {{ currentAnnouncement.content }}
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAnnouncementList, deleteAnnouncement } from '@/api/announcement'

const loading = ref(false)
const showDetailDrawer = ref(false)
const currentAnnouncement = ref(null)

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    colKey: 'title',
    title: '公告标题',
    width: 400,
    align: 'left'
  },
  {
    colKey: 'type',
    title: '类型',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'publisher',
    title: '发布人',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'publishTime',
    title: '发布时间',
    width: 180,
    align: 'center'
  },
  {
    colKey: 'status',
    title: '状态',
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

// 公告列表数据
const announcementList = ref([])

// 获取公告列表
const fetchAnnouncementList = async () => {
  try {
    loading.value = true
    const res = await getAnnouncementList({
      current: pagination.value.current,
      size: pagination.value.pageSize
    })

    if (res.success) {
      announcementList.value = res.data.records || res.data.list || []
      pagination.value.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取公告列表失败')
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    MessagePlugin.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  fetchAnnouncementList()
}

// 处理每页条数变化
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1  // 重置到第一页
  fetchAnnouncementList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAnnouncementList()
})

// 获取类型主题色
const getTypeTheme = (type) => {
  const themeMap = {
    '系统维护': 'danger',
    '功能更新': 'primary',
    '安全通知': 'warning',
    '数据报告': 'success'
  }
  return themeMap[type] || 'default'
}

// 获取状态主题色
const getStatusTheme = (status) => {
  const themeMap = {
    '已发布': 'success',
    '草稿': 'default',
    '已撤回': 'danger'
  }
  return themeMap[status] || 'default'
}

// 处理行点击
const handleRowClick = ({ row }) => {
  currentAnnouncement.value = row
  showDetailDrawer.value = true
}

// 处理新建公告
const handleCreate = () => {
  MessagePlugin.info('发布公告功能开发中')
}

// 处理编辑
const handleEdit = (row) => {
  MessagePlugin.info(`编辑公告：${row.title}`)
}

// 处理删除
const handleDelete = async (row) => {
  try {
    const res = await deleteAnnouncement(row.id)
    if (res.success) {
      MessagePlugin.success('公告删除成功')
      // 刷新列表
      fetchAnnouncementList()
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除公告失败:', error)
    MessagePlugin.error('删除公告失败')
  }
}

// 测试更新提示功能
const testUpdateNotification = () => {
  // 清除已忽略的版本记录，确保可以再次显示
  localStorage.removeItem('dismissedUpdateVersion')

  // 触发全局事件
  window.dispatchEvent(new CustomEvent('show-update-notification', {
    detail: {
      title: '发现新版本（测试）',
      version: 'v2.1.0',
      description: '这是一个测试更新提示，系统包含以下更新：',
      features: [
        '新增公告功能，支持系统通知发布',
        '优化甘特图视图性能，加载速度提升50%',
        '修复已知问题，提升系统稳定性',
        '优化用户界面，提升使用体验'
      ]
    }
  }))
  MessagePlugin.success('已触发更新提示，请查看右下角')
}
</script>

<style scoped lang="scss">
.announcement-container {
  .announcement-card {
    :deep(.t-card__body) {
      padding: 24px;
    }

    .announcement-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      .announcement-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2329;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .announcement-table {
      .announcement-title-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .title-text {
          font-size: 14px;
          font-weight: 500;
          color: #1f2329;
          flex: 1;
        }
      }

      :deep(.t-table) {
        border: 1px solid #e7e7e7;
        border-radius: 6px;

        tr {
          cursor: pointer;
        }
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

  .announcement-detail {
    .detail-header {
      padding-bottom: 20px;
      border-bottom: 1px solid #e7e7e7;
      margin-bottom: 20px;

      h2 {
        font-size: 20px;
        font-weight: 600;
        color: #1f2329;
        margin: 0 0 12px 0;
      }

      .detail-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 13px;
        color: #646a73;
      }
    }

    .detail-content {
      font-size: 14px;
      line-height: 1.8;
      color: #1f2329;
      white-space: pre-wrap;
    }
  }
}
</style>
