<template>
  <div class="kanban-view">
    <div class="view-header">
      <h3>{{ viewData?.name || '看板视图' }}</h3>
      <div class="view-actions">
        <t-button class="filter-btn" theme="default" size="medium" @click="handleFilter">
          <template #icon><t-icon name="filter" /></template>
          筛选
        </t-button>
        <t-button theme="default" size="medium" @click="handleRefresh">
          <template #icon><t-icon name="refresh" /></template>
          刷新
        </t-button>
      </div>
    </div>

    <div class="kanban-content">
      <div class="kanban-columns">
        <!-- 看板列 -->
        <div
          v-for="column in kanbanColumns"
          :key="column.id"
          class="kanban-column"
        >
          <div class="column-header">
            <div class="column-title">
              <span class="title-text">{{ column.name }}</span>
              <span class="count-badge">{{ column.items.length }}</span>
            </div>
            <t-dropdown :min-column-width="120">
              <t-icon name="more" class="more-icon" />
              <t-dropdown-menu>
                <t-dropdown-item @click="handleEditColumn(column)">
                  编辑列
                </t-dropdown-item>
                <t-dropdown-item @click="handleAddCard(column)">
                  添加卡片
                </t-dropdown-item>
                <t-dropdown-item divider />
                <t-dropdown-item @click="handleDeleteColumn(column)">
                  删除列
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>

          <!-- 卡片列表 -->
          <div class="column-cards">
            <div
              v-for="item in column.items"
              :key="item.id"
              class="kanban-card"
              @click="handleCardClick(item)"
            >
              <div class="card-header">
                <span class="card-id">#{{ item.id }}</span>
                <t-tag
                  v-if="item.priority"
                  size="small"
                  :theme="getPriorityTheme(item.priority)"
                >
                  {{ item.priority }}
                </t-tag>
              </div>
              <div class="card-title">{{ item.title }}</div>
              <div class="card-meta">
                <div class="card-tags">
                  <t-tag
                    v-for="tag in item.tags"
                    :key="tag"
                    size="small"
                    variant="outline"
                  >
                    {{ tag }}
                  </t-tag>
                </div>
                <div class="card-footer">
                  <t-avatar v-if="item.assignee" size="20px">
                    {{ item.assignee.charAt(0) }}
                  </t-avatar>
                  <span class="card-date">{{ item.dueDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选弹窗 -->
    <t-dialog
      v-model:visible="filterVisible"
      header="筛选条件"
      width="500px"
      :footer="true"
      @confirm="handleFilterConfirm"
      @cancel="filterVisible = false"
    >
      <div class="filter-content">
        <div class="filter-item">
          <label class="filter-label">优先级</label>
          <t-checkbox-group v-model="filterOptions.priority">
            <t-checkbox value="高">高</t-checkbox>
            <t-checkbox value="中">中</t-checkbox>
            <t-checkbox value="低">低</t-checkbox>
          </t-checkbox-group>
        </div>

        <div class="filter-item">
          <label class="filter-label">负责人</label>
          <t-select
            v-model="filterOptions.assignee"
            placeholder="请选择负责人"
            clearable
            multiple
          >
            <t-option value="Admin" label="Admin" />
            <t-option value="Tester1" label="Tester1" />
            <t-option value="Tester2" label="Tester2" />
          </t-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">标签</label>
          <t-select
            v-model="filterOptions.tags"
            placeholder="请选择标签"
            clearable
            multiple
          >
            <t-option value="前端" label="前端" />
            <t-option value="后端" label="后端" />
            <t-option value="UI" label="UI" />
            <t-option value="优化" label="优化" />
            <t-option value="设计" label="设计" />
            <t-option value="架构" label="架构" />
            <t-option value="文档" label="文档" />
            <t-option value="代码审查" label="代码审查" />
            <t-option value="Bug修复" label="Bug修复" />
            <t-option value="维护" label="维护" />
          </t-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">截止日期</label>
          <t-date-range-picker
            v-model="filterOptions.dateRange"
            placeholder="请选择日期范围"
            clearable
          />
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

const props = defineProps({
  viewData: {
    type: Object,
    default: null
  },
  viewId: {
    type: String,
    required: true
  }
})

// 筛选弹窗状态
const filterVisible = ref(false)

// 筛选选项
const filterOptions = ref({
  priority: [],
  assignee: [],
  tags: [],
  dateRange: []
})

// 看板列数据
const kanbanColumns = ref([
  {
    id: 'todo',
    name: '待处理',
    items: [
      {
        id: '1001',
        title: '完成用户登录功能',
        priority: '高',
        tags: ['前端', 'UI'],
        assignee: 'Admin',
        dueDate: '12-20'
      },
      {
        id: '1002',
        title: '优化数据库查询性能',
        priority: '中',
        tags: ['后端', '优化'],
        assignee: 'Tester1',
        dueDate: '12-22'
      }
    ]
  },
  {
    id: 'in-progress',
    name: '进行中',
    items: [
      {
        id: '1003',
        title: '设计系统架构图',
        priority: '高',
        tags: ['设计', '架构'],
        assignee: 'Admin',
        dueDate: '12-18'
      },
      {
        id: '1004',
        title: '编写API文档',
        priority: '中',
        tags: ['文档'],
        assignee: 'Tester2',
        dueDate: '12-19'
      }
    ]
  },
  {
    id: 'review',
    name: '待审核',
    items: [
      {
        id: '1005',
        title: '代码审查-支付模块',
        priority: '高',
        tags: ['代码审查'],
        assignee: 'Admin',
        dueDate: '12-17'
      }
    ]
  },
  {
    id: 'done',
    name: '已完成',
    items: [
      {
        id: '1006',
        title: '修复登录bug',
        priority: '低',
        tags: ['Bug修复'],
        assignee: 'Tester1',
        dueDate: '12-15'
      },
      {
        id: '1007',
        title: '更新依赖包版本',
        priority: '低',
        tags: ['维护'],
        assignee: 'Admin',
        dueDate: '12-14'
      }
    ]
  }
])

const getPriorityTheme = (priority) => {
  const themeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'default'
  }
  return themeMap[priority] || 'default'
}

const handleFilter = () => {
  filterVisible.value = true
}

const handleFilterConfirm = () => {
  console.log('筛选条件:', filterOptions.value)
  MessagePlugin.success('筛选条件已应用')
  filterVisible.value = false
}

const handleRefresh = () => {
  MessagePlugin.success('刷新成功')
}

const handleAddColumn = () => {
  MessagePlugin.info('添加列功能')
}

const handleEditColumn = (column) => {
  MessagePlugin.info(`编辑列: ${column.name}`)
}

const handleDeleteColumn = (column) => {
  MessagePlugin.warning(`删除列: ${column.name}`)
}

const handleAddCard = (column) => {
  MessagePlugin.info(`在 ${column.name} 中添加卡片`)
}

const handleCardClick = (item) => {
  MessagePlugin.info(`查看卡片: ${item.title}`)
}
</script>

<style scoped lang="scss">
.kanban-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e7e7e7;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }

    .view-actions {
      display: flex;
      gap: 8px;

      .filter-btn {
        background: linear-gradient(135deg, #f5f2ff 0%, #ede9fe 100%);
        color: #667eea;
        border-color: transparent;

        &:hover {
          background: linear-gradient(135deg, #ede9fe 0%, #e5dffe 100%);
          color: #764ba2;
        }
      }
    }
  }

  .kanban-content {
    flex: 1;
    padding: 20px;
    overflow-x: auto;
    overflow-y: hidden;

    .kanban-columns {
      display: flex;
      gap: 16px;
      min-height: 100%;
      padding-bottom: 20px;

      .kanban-column {
        flex-shrink: 0;
        width: 300px;
        background: #f0f0f0;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 200px);

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fff;
          border-radius: 8px 8px 0 0;

          .column-title {
            display: flex;
            align-items: center;
            gap: 8px;

            .title-text {
              font-size: 14px;
              font-weight: 600;
              color: #1f2329;
            }

            .count-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 20px;
              height: 20px;
              padding: 0 6px;
              background: #fff;
              border-radius: 10px;
              font-size: 12px;
              color: #646a73;
            }
          }

          .more-icon {
            cursor: pointer;
            color: #646a73;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;

            &:hover {
              background: rgba(0, 0, 0, 0.06);
              color: #0052d9;
            }
          }
        }

        .column-cards {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;

          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-thumb {
            background: #dcdcdc;
            border-radius: 3px;
          }

          .kanban-card {
            background: #fff;
            border-radius: 8px;
            padding: 14px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);

            &:hover {
              box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
              transform: translateY(-3px);
              border: 1px solid rgba(102, 126, 234, 0.1);
            }

            .card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;

              .card-id {
                font-size: 12px;
                color: #646a73;
                font-weight: 500;
              }
            }

            .card-title {
              font-size: 14px;
              color: #1f2329;
              line-height: 1.5;
              margin-bottom: 12px;
              word-break: break-word;
            }

            .card-meta {
              .card-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 8px;
              }

              .card-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .card-date {
                  font-size: 12px;
                  color: #646a73;
                }
              }
            }
          }

        }
      }
    }
  }

  // 筛选弹窗样式
  .filter-content {
    padding: 16px 0;

    .filter-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #1f2329;
      }
    }
  }
}
</style>
