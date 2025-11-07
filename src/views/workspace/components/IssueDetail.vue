<template>
  <t-drawer
    v-model:visible="localVisible"
    header=""
    :footer="false"
    size="70%"
    :close-btn="true"
    destroy-on-close
  >
    <div class="task-detail" v-if="issue">
      <!-- 详情头部 -->
      <IssueDetailHeader :issue="issue" />

      <div class="detail-content">
        <div class="content-main">
          <!-- 标题编辑区 -->
          <IssueDetailTitle
            :summary="issue.summary"
            @update:summary="handleUpdateSummary"
          />

          <!-- 基本信息 -->
          <IssueBasicInfo :issue="issue" />

          <!-- 操作按钮 -->
          <IssueActions
            :issue-type="issue.type"
            @edit="emit('edit-issue')"
            @split-task="emit('split-task')"
            @assign="emit('assign-issue')"
            @pause="emit('pause-issue')"
            @more-action="emit('more-action', $event)"
          />

          <!-- 描述 -->
          <div class="description-section" @keydown="handleDescriptionKeydown">
            <div class="section-title">
              描述
              <t-button
                v-if="isEditingDescription"
                theme="primary"
                size="small"
                class="complete-btn"
                @click="handleDescriptionComplete"
              >
                完成
              </t-button>
            </div>

            <!-- 编辑模式 -->
            <RichTextEditor
              v-if="isEditingDescription"
              v-model="localDescription"
              placeholder="添加描述..."
            />

            <!-- 查看模式 -->
            <t-tooltip
              v-else
              :content="getPlainText(localDescription)"
              placement="top"
              :overlay-style="{ maxWidth: '400px' }"
            >
              <div
                class="description-display"
                @dblclick="handleDescriptionDblClick"
                v-html="localDescription || '<span class=&quot;description-empty&quot;>双击添加描述...</span>'"
              />
            </t-tooltip>
          </div>

          <!-- 排期 -->
          <div class="schedule-section">
            <div class="section-title">排期</div>
            <t-table
              :data="localSchedule"
              :columns="scheduleColumns"
              row-key="role"
              size="small"
              bordered
              :hover="true"
              class="schedule-table"
            >
              <template #dateRange="{ row }">
                <span v-if="row.dateRange && row.dateRange.length === 2">
                  {{ row.dateRange[0] }} ~ {{ row.dateRange[1] }}
                </span>
                <span v-else class="empty-value">-</span>
              </template>
            </t-table>
          </div>

          <!-- 其他信息 -->
          <div class="other-info-section">
            <!-- 经办人 -->
            <div class="info-item editable-item" v-click-outside="() => isEditingAssignee = false">
              <div class="info-label">经办人</div>
              <div class="info-content">
                <!-- 编辑模式 -->
                <t-select
                  v-if="isEditingAssignee"
                  :model-value="issue.assignee"
                  @update:model-value="handleUpdateAssignee"
                  size="medium"
                  class="auto-width-select"
                  :popup-props="{ overlayClassName: 'assignee-select-popup' }"
                  autofocus
                >
                  <t-option label="张三" value="张三" />
                  <t-option label="李四" value="李四" />
                  <t-option label="王五" value="王五" />
                </t-select>
                <!-- 只读模式 -->
                <div v-else class="info-display" @click="isEditingAssignee = true">
                  <span class="info-text">{{ issue.assignee || '-' }}</span>
                  <t-icon name="edit" class="edit-icon" />
                </div>
              </div>
            </div>

            <!-- 报告人 -->
            <div class="info-item">
              <div class="info-label">报告人</div>
              <div class="info-value">Admin</div>
            </div>

            <!-- 截止日期 -->
            <div class="info-item editable-item" v-click-outside="() => isEditingDueDate = false">
              <div class="info-label">截止日期</div>
              <div class="info-content">
                <!-- 编辑模式 -->
                <t-date-picker
                  v-if="isEditingDueDate"
                  :model-value="dueDate"
                  @update:model-value="handleUpdateDueDate"
                  size="medium"
                  class="auto-width-input"
                  placeholder="设置截止日期"
                />
                <!-- 只读模式 -->
                <div v-else class="info-display" @click="isEditingDueDate = true">
                  <span class="info-text">{{ dueDate || '-' }}</span>
                  <t-icon name="edit" class="edit-icon" />
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div class="info-item editable-item" v-click-outside="handleTagsClickOutside">
              <div class="info-label">标签</div>
              <div class="info-content">
                <!-- 编辑模式 -->
                <t-tag-input
                  v-if="isEditingTags"
                  :model-value="tags"
                  @update:model-value="handleUpdateTags"
                  placeholder="添加标签"
                  size="medium"
                  class="auto-width-input"
                />
                <!-- 只读模式 -->
                <div v-else class="info-display" @click="isEditingTags = true">
                  <span class="info-text" v-if="tags && tags.length > 0">
                    <t-tag v-for="tag in tags" :key="tag" size="medium" style="margin-right: 4px;">{{ tag }}</t-tag>
                  </span>
                  <span class="info-text" v-else>-</span>
                  <t-icon name="edit" class="edit-icon" />
                </div>
              </div>
            </div>

            <!-- 创建时间 -->
            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ issue.create_time }}</div>
            </div>

            <!-- 更新时间 -->
            <div class="info-item">
              <div class="info-label">更新时间</div>
              <div class="info-value">{{ issue.update_time }}</div>
            </div>
          </div>

          <!-- Tab 切换 -->
          <IssueTabs
            v-model:activeTab="localActiveTab"
            v-model:newComment="localNewComment"
            v-model:newSubtask="localNewSubtask"
            :comments="comments"
            :attachments="attachments"
            :subtasks="subtasks"
            :activities="activities"
            @add-comment="emit('add-comment')"
            @add-subtask="emit('add-subtask')"
          />
        </div>
      </div>
    </div>
  </t-drawer>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import IssueDetailHeader from './IssueDetailHeader.vue'
import IssueDetailTitle from './IssueDetailTitle.vue'
import IssueBasicInfo from './IssueBasicInfo.vue'
import IssueActions from './IssueActions.vue'
import IssueTabs from './IssueTabs.vue'
import RichTextEditor from './RichTextEditor.vue'

// v-click-outside 指令
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      // 检查点击是否在元素外部，且不在下拉菜单中
      if (!(el === event.target || el.contains(event.target))) {
        // 检查是否点击在弹出层中（如下拉菜单、日期选择器等）
        const isInPopup = event.target.closest('.t-popup') ||
                         event.target.closest('.t-select-dropdown') ||
                         event.target.closest('.t-date-picker__panel') ||
                         event.target.closest('.assignee-select-popup')

        if (!isInPopup) {
          binding.value(event)
        }
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// 描述编辑状态
const isEditingDescription = ref(false)

// 其他信息编辑状态
const isEditingAssignee = ref(false)
const isEditingDueDate = ref(false)
const isEditingTags = ref(false)

// 排期表格列配置
const scheduleColumns = [
  {
    colKey: 'roleName',
    title: '岗位',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'assignee',
    title: '负责人',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'dateRange',
    title: '排期时间',
    width: 280,
    align: 'center',
    cell: 'dateRange'
  },
  {
    colKey: 'estimatedHours',
    title: '预估工时',
    width: 150,
    align: 'center'
  }
]

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  issue: {
    type: Object,
    default: null
  },
  activeTab: {
    type: String,
    default: 'description'
  },
  description: {
    type: String,
    default: ''
  },
  newComment: {
    type: String,
    default: ''
  },
  newSubtask: {
    type: String,
    default: ''
  },
  comments: {
    type: Array,
    default: () => []
  },
  attachments: {
    type: Array,
    default: () => []
  },
  subtasks: {
    type: Array,
    default: () => []
  },
  activities: {
    type: Array,
    default: () => []
  },
  dueDate: {
    type: String,
    default: ''
  },
  tags: {
    type: Array,
    default: () => []
  },
  schedule: {
    type: Array,
    default: () => [
      { role: 'product', roleName: '产品', assignee: '', dateRange: [], estimatedHours: null },
      { role: 'backend', roleName: '后端', assignee: '', dateRange: [], estimatedHours: null },
      { role: 'frontend', roleName: '前端', assignee: '', dateRange: [], estimatedHours: null },
      { role: 'test', roleName: '测试', assignee: '', dateRange: [], estimatedHours: null }
    ]
  }
})

const emit = defineEmits([
  'update:visible',
  'update:activeTab',
  'update:description',
  'update:newComment',
  'update:newSubtask',
  'update:dueDate',
  'update:tags',
  'update:schedule',
  'update-summary',
  'update-assignee',
  'edit-issue',
  'split-task',
  'assign-issue',
  'pause-issue',
  'more-action',
  'add-comment',
  'add-subtask'
])

const localVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const localActiveTab = computed({
  get: () => props.activeTab,
  set: (val) => emit('update:activeTab', val)
})

const localDescription = computed({
  get: () => props.description,
  set: (val) => emit('update:description', val)
})

const localNewComment = computed({
  get: () => props.newComment,
  set: (val) => emit('update:newComment', val)
})

const localNewSubtask = computed({
  get: () => props.newSubtask,
  set: (val) => emit('update:newSubtask', val)
})

const localSchedule = computed({
  get: () => props.schedule,
  set: (val) => emit('update:schedule', val)
})

const handleUpdateSummary = (newSummary) => {
  emit('update-summary', newSummary)
}

const handleUpdateAssignee = (newAssignee) => {
  emit('update-assignee', newAssignee)
  isEditingAssignee.value = false
}

const handleUpdateDueDate = (newDate) => {
  emit('update:dueDate', newDate)
  isEditingDueDate.value = false
}

const handleUpdateTags = (newTags) => {
  emit('update:tags', newTags)
}

// 标签输入框点击外部时的处理
const handleTagsClickOutside = () => {
  // 延迟关闭，确保标签输入完成
  nextTick(() => {
    isEditingTags.value = false
  })
}

// 双击进入编辑模式
const handleDescriptionDblClick = () => {
  isEditingDescription.value = true
}

// 完成编辑
const handleDescriptionComplete = () => {
  isEditingDescription.value = false
}

// 按ESC键退出编辑
const handleDescriptionKeydown = (e) => {
  if (e.key === 'Escape') {
    isEditingDescription.value = false
  }
}

// 获取纯文本内容（去除HTML标签）
const getPlainText = (html) => {
  if (!html) return '暂无描述'
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || '暂无描述'
}
</script>

<style scoped lang="scss">
.task-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-content {
    flex: 1;
    overflow-y: auto;

    .content-main {
      width: 100%;
      padding: 16px 24px 24px 24px;

      .description-section {
        margin-bottom: 24px;

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 500;
          color: #1f2329;
          margin-bottom: 12px;

          .complete-btn {
            margin-left: auto;
          }
        }

        .description-display {
          min-height: 40px;
          padding: 12px 12px 12px 16px;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2329;
          background-color: #f3f3f3;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          word-wrap: break-word;

          &:hover {
            background-color: #e8e8e8;
          }

          :deep(.description-empty) {
            color: #bbb;
            font-style: italic;
          }
        }
      }

      .schedule-section {
        margin-bottom: 24px;

        .section-title {
          font-size: 14px;
          font-weight: 500;
          color: #1f2329;
          margin-bottom: 12px;
        }

        .schedule-table {
          :deep(.t-table) {
            font-size: 14px;
          }

          :deep(.t-table__cell) {
            padding: 12px 8px;
          }

          :deep(.t-table th) {
            background-color: #f5f7fa;
            font-weight: 500;
          }

          .empty-value {
            color: #bbb;
          }
        }
      }

      .other-info-section {
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .info-label {
            font-size: 14px;
            font-weight: 500;
            color: #646a73;
            min-width: 90px;
            flex-shrink: 0;
          }

          .info-value {
            flex: 1;
            font-size: 15px;
            color: #1f2329;
            padding: 8px 0;
          }

          &.editable-item {
            .info-content {
              position: relative;
              flex: 1;

              // 自适应宽度的选择框
              :deep(.auto-width-select) {
                width: auto;
                min-width: 120px;
                max-width: 300px;

                .t-input {
                  font-size: 15px;
                  height: 38px;
                }

                .t-input__inner {
                  font-size: 15px;
                  height: 38px;
                  line-height: 38px;
                }
              }

              // 自适应宽度的输入框
              :deep(.auto-width-input) {
                width: auto;
                min-width: 180px;
                max-width: 350px;

                .t-input {
                  font-size: 15px;
                  height: 38px;
                }

                .t-input__inner {
                  font-size: 15px;
                  height: 38px;
                  line-height: 38px;
                }
              }

              .info-display {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 38px;

                &:hover {
                  background-color: #f3f3f3;
                }

                .info-text {
                  font-size: 15px;
                  color: #1f2329;
                }

                .edit-icon {
                  opacity: 0;
                  transition: opacity 0.2s ease;
                  color: #0052d9;
                  font-size: 16px;
                  flex-shrink: 0;
                }

                &:hover .edit-icon {
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
