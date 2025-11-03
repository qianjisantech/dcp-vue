<template>
  <div class="workspace-container">
    <div class="workspace-layout">
      <!-- 列表区域 -->
      <div class="list-content">
        <t-card class="task-card">
          <div class="task-header">
            <div class="header-left">
              <h3 class="task-title">我的事项</h3>
              <span class="task-count">共 {{ filteredTaskList.length }} 条</span>
              <div class="filter-button-wrapper">
                <t-button
                  theme="default"
                  variant="outline"
                  size="medium"
                  @click="showFilterDialog = true"
                  class="filter-button"
                >
                  <template #icon>
                    <t-icon name="filter" />
                  </template>
                  筛选器
                </t-button>
                <t-badge
                  v-if="activeFilterCount > 0"
                  :count="activeFilterCount"
                  :offset="[-8, 8]"
                />
              </div>
            </div>
            <div class="header-right">
              <t-button
                theme="default"
                variant="text"
                size="medium"
                @click="showColumnConfig = true"
                class="header-config-btn"
              >
                <template #icon>
                  <t-icon name="setting" />
                </template>
                列配置
              </t-button>
            </div>
          </div>

          <t-table
        :data="filteredTaskList"
        :columns="visibleColumns"
        :loading="loading"
        row-key="id"
        :selected-row-keys="selectedRowKeys"
        hover
        class="task-table"
        @select-change="handleSelectChange"
      >
        <template #summary="{ row }">
          <div class="task-summary" :class="{ 'is-editing': editingTaskId === row.id }">
            <!-- 编辑状态：显示输入框 -->
            <t-input
              v-if="editingTaskId === row.id"
              v-model="editingSummary"
              class="summary-input"
              autofocus
              @blur="handleCancelEdit"
              @keyup.enter="handleSaveSummary(row)"
              @keyup.esc="handleCancelEdit"
              @click="(e) => e.stopPropagation()"
            />
            <!-- 非编辑状态：显示文字 -->
            <span v-else class="summary-text" @click="(e) => { e.stopPropagation(); handleSummaryClick(row); }">{{ row.summary }}</span>

            <div class="summary-actions" v-if="editingTaskId !== row.id" @click="(e) => e.stopPropagation()">
              <t-icon
                name="edit"
                size="16px"
                class="action-icon"
                @click="handleEditTask(row)"
              />
              <t-icon
                name="link"
                size="16px"
                class="action-icon"
                @click="handleLinkTask(row)"
              />
              <t-icon
                name="file-copy"
                size="16px"
                class="action-icon"
                @click="handleCopyTask(row)"
              />
            </div>
          </div>
        </template>

        <template #task_number="{ row }">
          <div class="task-number-cell">
            <span class="task-number-text">{{ row.task_number }}</span>
            <t-icon
              name="file-copy"
              size="16px"
              class="copy-icon"
              @click="(e) => { e.stopPropagation(); handleCopyTaskNumber(row); }"
            />
          </div>
        </template>

        <template #task_type="{ row }">
          <div class="task-type-cell">
            <t-icon :name="getTaskTypeIcon(row.task_type)" size="14px" />
            <span>{{ row.task_type }}</span>
          </div>
        </template>

        <template #status="{ row }">
          <t-dropdown
            :min-column-width="120"
            trigger="hover"
            @click="(e) => { e.stopPropagation(); handleStatusClick(row); }"
          >
            <t-tag
              :theme="getStatusTheme(row.status)"
              size="small"
              class="status-tag-clickable"
            >
              {{ row.status }}
            </t-tag>
            <t-dropdown-menu>
              <t-dropdown-item
                v-for="status in statusOptions"
                :key="status.value"
                @click="handleQuickChangeStatus(row, status.value)"
              >
                {{ status.label }}
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </template>

        <template #priority="{ row }">
          <t-dropdown
            :min-column-width="120"
            trigger="hover"
            @click="(e) => { e.stopPropagation(); handlePriorityClick(row); }"
          >
            <t-tag
              :theme="getPriorityTheme(row.priority)"
              size="small"
              class="priority-tag-clickable"
            >
              {{ row.priority }}
            </t-tag>
            <t-dropdown-menu>
              <t-dropdown-item
                v-for="priority in priorityOptions"
                :key="priority.value"
                @click="handleQuickChangePriority(row, priority.value)"
              >
                {{ priority.label }}
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </template>

        <template #assignee="{ row }">
          <t-dropdown
            :min-column-width="120"
            trigger="hover"
            @click="(e) => { e.stopPropagation(); handleAssigneeClick(row); }"
          >
            <span class="assignee-text-clickable">{{ row.assignee }}</span>
            <t-dropdown-menu>
              <t-dropdown-item
                v-for="assignee in assigneeOptions"
                :key="assignee.value"
                @click="handleQuickChangeAssignee(row, assignee.value)"
              >
                {{ assignee.label }}
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </template>

        <!-- 操作列表头 -->
        <template #operation-header>
          <div class="operation-header">
            <span>操作</span>
            <t-icon
              name="setting"
              size="16px"
              class="column-config-icon"
              @click="showColumnConfig = true"
            />
          </div>
        </template>

        <!-- 操作列内容 -->
        <template #operation="{ row }">
          <div class="operation-buttons">
            <t-dropdown
              :min-column-width="100"
              trigger="click"
              @click="(e) => e.stopPropagation()"
            >
              <t-icon
                name="ellipsis"
                size="20px"
                class="operation-more-icon"
              />
              <t-dropdown-menu>
                <t-dropdown-item @click="handleEdit(row)">
                  编辑
                </t-dropdown-item>
                <t-dropdown-item @click="handleDelete(row)">
                  删除
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </template>
          </t-table>
        </t-card>
      </div>
    </div>

    <!-- 列配置抽屉 -->
    <t-drawer
      v-model:visible="showColumnConfig"
      header="列配置"
      size="600px"
      :footer="false"
      placement="right"
      :close-btn="true"
      :destroy-on-close="false"
    >
      <div class="column-config-content">
        <div class="config-desc">
          <span>从左侧选择要显示的列，拖拽到右侧</span>
        </div>

        <div class="transfer-wrapper">
          <t-transfer
            v-model="selectedColumnKeys"
            :data="transferData"
            :titles="['可选列', '已选列']"
            :empty="['暂无数据', '暂无数据']"
            search
            :search-placeholder="'搜索列名'"
          />
        </div>

        <div class="config-footer">
          <span class="footer-info">已选择 {{ selectedColumnKeys.length }} 列</span>
          <div class="config-actions">
            <t-button
              theme="default"
              variant="outline"
              size="small"
              @click="handleResetColumns"
            >
              恢复默认
            </t-button>
            <t-button
              theme="primary"
              size="small"
              @click="handleSaveColumns"
            >
              保存
            </t-button>
          </div>
        </div>
      </div>
    </t-drawer>

    <!-- 筛选器弹窗 -->
    <t-dialog
      v-model:visible="showFilterDialog"
      header="筛选器"
      width="600px"
      :footer="false"
    >
      <div class="filter-dialog-content">
        <div class="filter-list">
          <div v-for="(filter, index) in filterConditions" :key="filter.id" class="filter-item">
            <t-select
              v-model="filter.field"
              placeholder="选择字段"
              size="small"
              class="filter-field"
            >
              <t-option label="搜索" value="keyword" />
              <t-option label="任务类型" value="task_type" />
              <t-option label="状态" value="status" />
              <t-option label="优先级" value="priority" />
              <t-option label="经办人" value="assignee" />
            </t-select>

            <!-- 搜索框 -->
            <t-input
              v-if="filter.field === 'keyword'"
              v-model="filter.value"
              placeholder="搜索事项概要或单号..."
              clearable
              size="small"
              class="filter-value"
            >
              <template #prefix-icon>
                <t-icon name="search" />
              </template>
            </t-input>

            <!-- 任务类型选择 -->
            <t-select
              v-else-if="filter.field === 'task_type'"
              v-model="filter.value"
              placeholder="请选择"
              clearable
              size="small"
              class="filter-value"
            >
              <t-option label="任务" value="任务" />
              <t-option label="bug" value="bug" />
              <t-option label="需求" value="需求" />
              <t-option label="线上问题" value="线上问题" />
            </t-select>

            <!-- 状态选择 -->
            <t-select
              v-else-if="filter.field === 'status'"
              v-model="filter.value"
              placeholder="请选择"
              clearable
              size="small"
              class="filter-value"
            >
              <t-option label="待处理" value="待处理" />
              <t-option label="进行中" value="进行中" />
              <t-option label="已完成" value="已完成" />
              <t-option label="已关闭" value="已关闭" />
            </t-select>

            <!-- 优先级选择 -->
            <t-select
              v-else-if="filter.field === 'priority'"
              v-model="filter.value"
              placeholder="请选择"
              clearable
              size="small"
              class="filter-value"
            >
              <t-option label="高" value="高" />
              <t-option label="中" value="中" />
              <t-option label="低" value="低" />
            </t-select>

            <!-- 经办人选择 -->
            <t-select
              v-else-if="filter.field === 'assignee'"
              v-model="filter.value"
              placeholder="请选择"
              clearable
              size="small"
              class="filter-value"
            >
              <t-option label="张三" value="张三" />
              <t-option label="李四" value="李四" />
              <t-option label="王五" value="王五" />
              <t-option label="赵六" value="赵六" />
              <t-option label="孙七" value="孙七" />
            </t-select>

            <!-- 删除按钮 -->
            <t-button
              theme="default"
              variant="text"
              size="small"
              @click="handleRemoveFilter(index)"
              class="filter-remove"
            >
              <template #icon>
                <t-icon name="close" />
              </template>
            </t-button>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="filter-actions">
          <div class="actions-left">
            <t-button
              theme="primary"
              variant="dashed"
              size="small"
              @click="handleAddFilter"
            >
              <template #icon>
                <t-icon name="add" />
              </template>
              添加条件
            </t-button>
            <t-button
              theme="default"
              variant="outline"
              size="small"
              @click="handleResetFilters"
            >
              <template #icon>
                <t-icon name="refresh" />
              </template>
              重置
            </t-button>
          </div>
          <t-button
            theme="primary"
            size="small"
            @click="handleSaveFilter"
          >
            <template #icon>
              <t-icon name="check" />
            </template>
            保存
          </t-button>
        </div>

        <!-- 结果统计 -->
        <div class="filter-result">
          共筛选出 <span class="highlight">{{ filteredTaskList.length }}</span> 个事项
        </div>
      </div>
    </t-dialog>

    <!-- 事项详情抽屉 -->
    <t-drawer
      v-model:visible="showDetailDrawer"
      :header="false"
      :footer="false"
      size="70%"
      :close-btn="true"
      destroy-on-close
    >
      <div class="task-detail" v-if="currentTask">
        <div class="detail-header">
          <div class="header-left">
            <t-breadcrumb>
              <t-breadcrumb-item>事项</t-breadcrumb-item>
              <t-breadcrumb-item>{{ currentTask.task_number }}</t-breadcrumb-item>
            </t-breadcrumb>
          </div>
          <div class="header-actions">
            <t-button theme="default" variant="outline" size="small">
              <template #icon><t-icon name="share" /></template>
              分享
            </t-button>
            <t-button theme="default" variant="outline" size="small">
              <template #icon><t-icon name="star" /></template>
              关注
            </t-button>
          </div>
        </div>

        <div class="detail-content">
          <div class="content-main">
            <!-- 标题区域 -->
            <div class="task-title-section">
              <t-input
                v-model="currentTask.summary"
                class="task-title-input"
                placeholder="输入事项标题"
                :bordered="false"
              />
            </div>

            <!-- 基本信息 -->
            <div class="task-fields">
              <div class="field-row">
                <div class="field-item">
                  <span class="field-label">类型：</span>
                  <t-select v-model="currentTask.task_type" size="small" style="width: 120px;">
                    <t-option label="任务" value="任务" />
                    <t-option label="bug" value="bug" />
                    <t-option label="需求" value="需求" />
                    <t-option label="线上问题" value="线上问题" />
                  </t-select>
                </div>
                <div class="field-item">
                  <span class="field-label">状态：</span>
                  <t-select v-model="currentTask.status" size="small" style="width: 120px;">
                    <t-option label="待处理" value="待处理" />
                    <t-option label="进行中" value="进行中" />
                    <t-option label="已完成" value="已完成" />
                    <t-option label="已关闭" value="已关闭" />
                  </t-select>
                </div>
                <div class="field-item">
                  <span class="field-label">优先级：</span>
                  <t-select v-model="currentTask.priority" size="small" style="width: 100px;">
                    <t-option label="高" value="高" />
                    <t-option label="中" value="中" />
                    <t-option label="低" value="低" />
                  </t-select>
                </div>
              </div>
            </div>

            <!-- Tab 切换 -->
            <t-tabs v-model="activeTab" class="detail-tabs">
              <t-tab-panel value="description" label="描述">
                <div class="tab-content">
                  <t-textarea
                    v-model="taskDescription"
                    placeholder="添加描述..."
                    :autosize="{ minRows: 6, maxRows: 12 }"
                  />
                </div>
              </t-tab-panel>

              <t-tab-panel value="comments" label="评论">
                <div class="tab-content comments-section">
                  <div class="comment-input">
                    <t-textarea
                      v-model="newComment"
                      placeholder="添加评论..."
                      :autosize="{ minRows: 3, maxRows: 6 }"
                    />
                    <div class="comment-actions">
                      <t-button theme="primary" size="small" @click="handleAddComment">
                        添加评论
                      </t-button>
                    </div>
                  </div>
                  <div class="comments-list">
                    <div v-for="comment in comments" :key="comment.id" class="comment-item">
                      <t-avatar size="32px">{{ comment.author.charAt(0) }}</t-avatar>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-author">{{ comment.author }}</span>
                          <span class="comment-time">{{ comment.time }}</span>
                        </div>
                        <div class="comment-text">{{ comment.content }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </t-tab-panel>

              <t-tab-panel value="attachments" label="附件">
                <div class="tab-content attachments-section">
                  <t-upload
                    theme="file-flow"
                    :auto-upload="false"
                    multiple
                  >
                    <t-button theme="default" variant="outline">
                      <template #icon><t-icon name="upload" /></template>
                      上传附件
                    </t-button>
                  </t-upload>
                  <div class="attachments-list">
                    <div v-for="file in attachments" :key="file.id" class="attachment-item">
                      <t-icon name="file" size="20px" />
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ file.size }}</span>
                      <t-button theme="default" variant="text" size="small">下载</t-button>
                    </div>
                  </div>
                </div>
              </t-tab-panel>

              <t-tab-panel value="subtasks" label="子任务">
                <div class="tab-content subtasks-section">
                  <div class="subtask-input">
                    <t-input
                      v-model="newSubtask"
                      placeholder="添加子任务..."
                      @keyup.enter="handleAddSubtask"
                    >
                      <template #suffix-icon>
                        <t-icon name="add" @click="handleAddSubtask" style="cursor: pointer;" />
                      </template>
                    </t-input>
                  </div>
                  <div class="subtasks-list">
                    <div v-for="subtask in subtasks" :key="subtask.id" class="subtask-item">
                      <t-checkbox v-model="subtask.completed" />
                      <span :class="['subtask-text', { completed: subtask.completed }]">
                        {{ subtask.title }}
                      </span>
                      <t-button theme="default" variant="text" size="small">
                        <t-icon name="delete" />
                      </t-button>
                    </div>
                  </div>
                </div>
              </t-tab-panel>

              <t-tab-panel value="activity" label="活动">
                <div class="tab-content activity-section">
                  <div class="activity-list">
                    <div v-for="activity in activities" :key="activity.id" class="activity-item">
                      <t-avatar size="24px">{{ activity.user.charAt(0) }}</t-avatar>
                      <div class="activity-content">
                        <div class="activity-text">
                          <span class="activity-user">{{ activity.user }}</span>
                          <span class="activity-action">{{ activity.action }}</span>
                        </div>
                        <div class="activity-time">{{ activity.time }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </t-tab-panel>
            </t-tabs>
          </div>

          <div class="content-sidebar">
            <div class="sidebar-section">
              <div class="section-title">经办人</div>
              <t-select v-model="currentTask.assignee" size="small" style="width: 100%;">
                <t-option label="张三" value="张三" />
                <t-option label="李四" value="李四" />
                <t-option label="王五" value="王五" />
              </t-select>
            </div>

            <div class="sidebar-section">
              <div class="section-title">报告人</div>
              <div class="section-value">Admin</div>
            </div>

            <div class="sidebar-section">
              <div class="section-title">截止日期</div>
              <t-date-picker
                v-model="dueDate"
                size="small"
                style="width: 100%;"
                placeholder="设置截止日期"
              />
            </div>

            <div class="sidebar-section">
              <div class="section-title">标签</div>
              <t-tag-input
                v-model="tags"
                placeholder="添加标签"
                size="small"
              />
            </div>

            <div class="sidebar-section">
              <div class="section-title">创建时间</div>
              <div class="section-value">{{ currentTask.create_time }}</div>
            </div>

            <div class="sidebar-section">
              <div class="section-title">更新时间</div>
              <div class="section-value">{{ currentTask.create_time }}</div>
            </div>
          </div>
        </div>
      </div>
    </t-drawer>

    <!-- 状态编辑弹窗 -->
    <t-dialog
      v-model:visible="showStatusDialog"
      header="修改状态"
      width="480px"
      :footer="false"
      :close-on-overlay-click="false"
    >
      <div class="status-edit-form">
        <t-form label-align="left" label-width="80px">
          <t-form-item label="当前状态" name="currentStatus">
            <div class="current-status-display">
              <t-tag
                :theme="getStatusTheme(currentEditTask?.status)"
                size="medium"
              >
                {{ currentEditTask?.status }}
              </t-tag>
            </div>
          </t-form-item>

          <t-form-item label="新状态" name="newStatus">
            <t-select
              v-model="selectedStatus"
              placeholder="请选择状态"
              clearable
            >
              <t-option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
                :label="status.label"
              />
            </t-select>
          </t-form-item>
        </t-form>

        <div class="dialog-footer">
          <t-button theme="default" variant="outline" @click="handleCancelStatusChange">
            取消
          </t-button>
          <t-button theme="primary" @click="handleConfirmStatusChange">
            确定
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 优先级编辑弹窗 -->
    <t-dialog
      v-model:visible="showPriorityDialog"
      header="修改优先级"
      width="480px"
      :footer="false"
      :close-on-overlay-click="false"
    >
      <div class="priority-edit-form">
        <t-form label-align="left" label-width="80px">
          <t-form-item label="当前优先级" name="currentPriority">
            <div class="current-priority-display">
              <t-tag
                :theme="getPriorityTheme(currentEditTask?.priority)"
                size="medium"
              >
                {{ currentEditTask?.priority }}
              </t-tag>
            </div>
          </t-form-item>

          <t-form-item label="新优先级" name="newPriority">
            <t-select
              v-model="selectedPriority"
              placeholder="请选择优先级"
              clearable
            >
              <t-option
                v-for="priority in priorityOptions"
                :key="priority.value"
                :value="priority.value"
                :label="priority.label"
              />
            </t-select>
          </t-form-item>
        </t-form>

        <div class="dialog-footer">
          <t-button theme="default" variant="outline" @click="handleCancelPriorityChange">
            取消
          </t-button>
          <t-button theme="primary" @click="handleConfirmPriorityChange">
            确定
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 经办人编辑弹窗 -->
    <t-dialog
      v-model:visible="showAssigneeDialog"
      header="修改经办人"
      width="480px"
      :footer="false"
      :close-on-overlay-click="false"
    >
      <div class="assignee-edit-form">
        <t-form label-align="left" label-width="80px">
          <t-form-item label="当前经办人" name="currentAssignee">
            <div class="current-assignee-display">
              <span>{{ currentEditTask?.assignee }}</span>
            </div>
          </t-form-item>

          <t-form-item label="新经办人" name="newAssignee">
            <t-select
              v-model="selectedAssignee"
              placeholder="请选择经办人"
              clearable
            >
              <t-option
                v-for="assignee in assigneeOptions"
                :key="assignee.value"
                :value="assignee.value"
                :label="assignee.label"
              />
            </t-select>
          </t-form-item>
        </t-form>

        <div class="dialog-footer">
          <t-button theme="default" variant="outline" @click="handleCancelAssigneeChange">
            取消
          </t-button>
          <t-button theme="primary" @click="handleConfirmAssigneeChange">
            确定
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useWorkspaceStore } from '@/store/workspace'
import { getTaskList } from '@/api/workspace'

const workspaceStore = useWorkspaceStore()
const loading = ref(false)
const showDetailDrawer = ref(false)
const showFilterDialog = ref(false)
const showColumnConfig = ref(false)
const currentTask = ref(null)
const selectedRowKeys = ref([])
const activeTab = ref('description')
const taskDescription = ref('')
const newComment = ref('')
const newSubtask = ref('')
const dueDate = ref('')
const tags = ref([])

// 行内编辑状态
const editingTaskId = ref(null)
const editingSummary = ref('')

// 状态编辑弹窗
const showStatusDialog = ref(false)
const currentEditTask = ref(null)
const selectedStatus = ref('')

// 状态选项
const statusOptions = ref([
  { value: '待处理', label: '待处理' },
  { value: '进行中', label: '进行中' },
  { value: '已完成', label: '已完成' },
  { value: '已关闭', label: '已关闭' }
])

// 优先级编辑弹窗
const showPriorityDialog = ref(false)
const selectedPriority = ref('')

// 优先级选项
const priorityOptions = ref([
  { value: '高', label: '高' },
  { value: '中', label: '中' },
  { value: '低', label: '低' }
])

// 经办人编辑弹窗
const showAssigneeDialog = ref(false)
const selectedAssignee = ref('')

// 经办人选项
const assigneeOptions = ref([
  { value: '张三', label: '张三' },
  { value: '李四', label: '李四' },
  { value: '王五', label: '王五' },
  { value: '赵六', label: '赵六' },
  { value: '孙七', label: '孙七' },
  { value: '周八', label: '周八' },
  { value: '吴九', label: '吴九' },
  { value: '郑十', label: '郑十' }
])

// 筛选器 - 动态筛选条件数组
let filterIdCounter = 0
const filterConditions = ref([
  { id: filterIdCounter++, field: 'keyword', value: '' }
])

// 模拟数据
const comments = ref([
  { id: 1, author: '张三', content: '这个需求需要补充更多细节', time: '2小时前' },
  { id: 2, author: '李四', content: '我会在明天完成开发', time: '1小时前' }
])

const attachments = ref([
  { id: 1, name: '需求文档.pdf', size: '2.5MB' },
  { id: 2, name: '设计稿.png', size: '1.2MB' }
])

const subtasks = ref([
  { id: 1, title: '完成数据库设计', completed: true },
  { id: 2, title: '实现API接口', completed: false },
  { id: 3, title: '编写单元测试', completed: false }
])

const activities = ref([
  { id: 1, user: '张三', action: '修改了状态为 进行中', time: '3小时前' },
  { id: 2, user: '李四', action: '添加了评论', time: '2小时前' },
  { id: 3, user: '王五', action: '上传了附件', time: '1小时前' }
])

// 表格列配置
const columns = ref([
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
    visible: true,
    fixed: 'left'
  },
  {
    colKey: 'summary',
    title: '概要',
    width: 300,
    align: 'left',
    visible: true
  },
  {
    colKey: 'task_type',
    title: '任务类型',
    width: 120,
    align: 'center',
    visible: true
  },
  {
    colKey: 'task_number',
    title: '任务单号',
    width: 200,
    align: 'center',
    visible: true
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center',
    visible: true
  },
  {
    colKey: 'priority',
    title: '优先级',
    width: 100,
    align: 'center',
    visible: true
  },
  {
    colKey: 'assignee',
    title: '经办人',
    width: 120,
    align: 'center',
    visible: true
  },
  {
    colKey: 'create_time',
    title: '创建时间',
    width: 180,
    align: 'center',
    visible: true
  }
])

// 穿梭框选中的列keys（排除复选框列）
const selectedColumnKeys = ref(
  columns.value.filter(col => col.visible && col.colKey !== 'row-select').map(col => col.colKey)
)

// 穿梭框数据源（排除复选框列）
const transferData = computed(() => {
  return columns.value
    .filter(col => col.colKey !== 'row-select')
    .map(col => ({
      value: col.colKey,
      label: col.title,
      disabled: false
    }))
})

// 操作列配置（固定在右侧，不可隐藏）
const operationColumn = {
  colKey: 'operation',
  title: '操作',
  width: 100,
  align: 'center',
  fixed: 'right'
}

// 可见的列
const visibleColumns = computed(() => {
  const cols = columns.value.filter(col => {
    // 复选框列始终显示
    if (col.colKey === 'row-select') return true
    // 其他列根据 selectedColumnKeys 判断
    return selectedColumnKeys.value.includes(col.colKey)
  })
  // 总是在最后添加操作列
  return [...cols, operationColumn]
})

// 我的事项列表
const taskList = ref([])

// 获取任务列表
const fetchTaskList = async () => {
  try {
    loading.value = true
    const res = await getTaskList()
    if (res.code === 200) {
      taskList.value = res.data.list
    } else {
      MessagePlugin.error(res.message || '获取任务列表失败')
    }
  } catch (error) {
    MessagePlugin.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTaskList()
})

// 计算有效的筛选条件数量
const activeFilterCount = computed(() => {
  return filterConditions.value.filter(condition => condition.value).length
})

// 筛选后的任务列表
const filteredTaskList = computed(() => {
  return taskList.value.filter(task => {
    // 首先检查全局搜索（来自Header的搜索框）
    if (workspaceStore.searchTaskNumber) {
      const searchValue = workspaceStore.searchTaskNumber.toLowerCase()
      const matchNumber = task.task_number.toLowerCase().includes(searchValue)
      const matchSummary = task.summary.toLowerCase().includes(searchValue)
      if (!matchNumber && !matchSummary) return false
    }

    // 遍历所有筛选条件，只要有一个条件不满足就过滤掉
    for (const condition of filterConditions.value) {
      if (!condition.value) continue // 跳过空值

      const field = condition.field
      const value = condition.value

      if (field === 'keyword') {
        // 关键词筛选（搜索概要和任务单号）
        const keyword = value.toLowerCase()
        const matchSummary = task.summary.toLowerCase().includes(keyword)
        const matchNumber = task.task_number.toLowerCase().includes(keyword)
        if (!matchSummary && !matchNumber) return false
      } else if (field === 'task_type') {
        // 任务类型筛选
        if (task.task_type !== value) return false
      } else if (field === 'status') {
        // 状态筛选
        if (task.status !== value) return false
      } else if (field === 'priority') {
        // 优先级筛选
        if (task.priority !== value) return false
      } else if (field === 'assignee') {
        // 经办人筛选
        if (task.assignee !== value) return false
      }
    }

    return true
  })
})

// 监听筛选后的任务列表变化，更新 store 中的数量
watch(filteredTaskList, (newList) => {
  workspaceStore.setTaskCount(newList.length)
}, { immediate: true })

// 获取任务类型图标
const getTaskTypeIcon = (taskType) => {
  const iconMap = {
    '任务': 'task',
    'bug': 'bug',
    '需求': 'lightbulb',
    '线上问题': 'error-circle'
  }
  return iconMap[taskType] || 'file-icon'
}

// 获取状态主题色
const getStatusTheme = (status) => {
  const themeMap = {
    '待处理': 'default',
    '进行中': 'primary',
    '已完成': 'success',
    '已关闭': 'danger'
  }
  return themeMap[status] || 'default'
}

// 获取优先级主题色
const getPriorityTheme = (priority) => {
  const themeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return themeMap[priority] || 'default'
}

// 处理新建事项
const handleCreate = () => {
  MessagePlugin.info('新建事项功能开发中')
}

// 点击概要文字 - 打开详情弹窗
const handleSummaryClick = (row) => {
  currentTask.value = { ...row }
  taskDescription.value = '这是事项的详细描述...'
  showDetailDrawer.value = true
}

// 处理编辑任务（概要列的编辑图标）- 进入行内编辑模式
const handleEditTask = (row) => {
  editingTaskId.value = row.id
  editingSummary.value = row.summary
}

// 保存概要修改（按Enter键）
const handleSaveSummary = (row) => {
  if (!editingSummary.value.trim()) {
    MessagePlugin.warning('概要不能为空')
    editingSummary.value = row.summary
    editingTaskId.value = null
    return
  }

  // 更新任务列表中的概要
  const task = taskList.value.find(t => t.id === row.id)
  if (task) {
    task.summary = editingSummary.value
    MessagePlugin.success('概要已更新')
    // TODO: 调用API保存到后端
  }

  // 退出编辑模式
  editingTaskId.value = null
  editingSummary.value = ''
}

// 取消编辑（失去焦点或按Esc键）
const handleCancelEdit = () => {
  editingTaskId.value = null
  editingSummary.value = ''
}

// 处理链接任务（概要列的链接图标）
const handleLinkTask = (row) => {
  // 复制链接到剪贴板
  const link = `${window.location.origin}/workspace/todo/${row.id}`
  navigator.clipboard.writeText(link).then(() => {
    MessagePlugin.success('链接已复制到剪贴板')
  }).catch(() => {
    MessagePlugin.error('复制链接失败')
  })
}

// 处理复制任务（概要列的复制图标）
const handleCopyTask = (row) => {
  MessagePlugin.success(`已复制事项：${row.summary}`)
  // TODO: 实现复制事项功能
}

// 处理复制任务单号
const handleCopyTaskNumber = (row) => {
  navigator.clipboard.writeText(row.task_number).then(() => {
    MessagePlugin.success(`已复制任务单号：${row.task_number}`)
  }).catch(() => {
    MessagePlugin.error('复制失败')
  })
}

// 处理状态点击 - 打开编辑弹窗
const handleStatusClick = (row) => {
  currentEditTask.value = row
  selectedStatus.value = row.status
  showStatusDialog.value = true
}

// 快速修改状态（从下拉菜单选择）
const handleQuickChangeStatus = (row, newStatus) => {
  const task = taskList.value.find(t => t.id === row.id)
  if (task) {
    task.status = newStatus
    MessagePlugin.success(`状态已更新为：${newStatus}`)
    // TODO: 调用API保存到后端
  }
}

// 确认修改状态（从弹窗）
const handleConfirmStatusChange = () => {
  if (currentEditTask.value) {
    const task = taskList.value.find(t => t.id === currentEditTask.value.id)
    if (task) {
      task.status = selectedStatus.value
      MessagePlugin.success(`状态已更新为：${selectedStatus.value}`)
      // TODO: 调用API保存到后端
    }
  }
  showStatusDialog.value = false
}

// 取消修改状态
const handleCancelStatusChange = () => {
  showStatusDialog.value = false
  currentEditTask.value = null
  selectedStatus.value = ''
}

// 处理优先级点击 - 打开编辑弹窗
const handlePriorityClick = (row) => {
  currentEditTask.value = row
  selectedPriority.value = row.priority
  showPriorityDialog.value = true
}

// 快速修改优先级（从下拉菜单选择）
const handleQuickChangePriority = (row, newPriority) => {
  const task = taskList.value.find(t => t.id === row.id)
  if (task) {
    task.priority = newPriority
    MessagePlugin.success(`优先级已更新为：${newPriority}`)
    // TODO: 调用API保存到后端
  }
}

// 确认修改优先级（从弹窗）
const handleConfirmPriorityChange = () => {
  if (currentEditTask.value) {
    const task = taskList.value.find(t => t.id === currentEditTask.value.id)
    if (task) {
      task.priority = selectedPriority.value
      MessagePlugin.success(`优先级已更新为：${selectedPriority.value}`)
      // TODO: 调用API保存到后端
    }
  }
  showPriorityDialog.value = false
}

// 取消修改优先级
const handleCancelPriorityChange = () => {
  showPriorityDialog.value = false
  currentEditTask.value = null
  selectedPriority.value = ''
}

// 处理经办人点击 - 打开编辑弹窗
const handleAssigneeClick = (row) => {
  currentEditTask.value = row
  selectedAssignee.value = row.assignee
  showAssigneeDialog.value = true
}

// 快速修改经办人（从下拉菜单选择）
const handleQuickChangeAssignee = (row, newAssignee) => {
  const task = taskList.value.find(t => t.id === row.id)
  if (task) {
    task.assignee = newAssignee
    MessagePlugin.success(`经办人已更新为：${newAssignee}`)
    // TODO: 调用API保存到后端
  }
}

// 确认修改经办人（从弹窗）
const handleConfirmAssigneeChange = () => {
  if (currentEditTask.value) {
    const task = taskList.value.find(t => t.id === currentEditTask.value.id)
    if (task) {
      task.assignee = selectedAssignee.value
      MessagePlugin.success(`经办人已更新为：${selectedAssignee.value}`)
      // TODO: 调用API保存到后端
    }
  }
  showAssigneeDialog.value = false
}

// 取消修改经办人
const handleCancelAssigneeChange = () => {
  showAssigneeDialog.value = false
  currentEditTask.value = null
  selectedAssignee.value = ''
}

// 处理编辑
const handleEdit = (row) => {
  currentTask.value = { ...row }
  taskDescription.value = '这是事项的详细描述...'
  showDetailDrawer.value = true
}

// 处理删除
const handleDelete = (row) => {
  MessagePlugin.warning(`确认删除事项：${row.summary}？`)
}

// 添加筛选条件
const handleAddFilter = () => {
  filterConditions.value.push({
    id: filterIdCounter++,
    field: 'keyword',
    value: ''
  })
}

// 删除筛选条件
const handleRemoveFilter = (index) => {
  if (filterConditions.value.length === 1) {
    MessagePlugin.warning('至少保留一个筛选条件')
    return
  }
  filterConditions.value.splice(index, 1)
  MessagePlugin.success('已删除筛选条件')
}

// 重置筛选器
const handleResetFilters = () => {
  filterConditions.value = [
    { id: filterIdCounter++, field: 'keyword', value: '' }
  ]
  MessagePlugin.success('已重置筛选条件')
}

// 保存筛选器
const handleSaveFilter = () => {
  showFilterDialog.value = false
  MessagePlugin.success('筛选条件已应用')
}

// 恢复默认列配置
const handleResetColumns = () => {
  // 恢复所有列为选中状态（排除复选框列）
  selectedColumnKeys.value = columns.value
    .filter(col => col.colKey !== 'row-select')
    .map(col => col.colKey)
  MessagePlugin.success('已恢复默认列配置')
}

// 保存列配置
const handleSaveColumns = () => {
  if (selectedColumnKeys.value.length === 0) {
    MessagePlugin.warning('至少需要显示一列')
    return
  }
  // 同步更新columns的visible属性
  columns.value.forEach(col => {
    col.visible = selectedColumnKeys.value.includes(col.colKey)
  })
  showColumnConfig.value = false
  MessagePlugin.success('列配置已保存')
}

// 处理复选框选择
const handleSelectChange = (value) => {
  selectedRowKeys.value = value
}

// 处理行点击
const handleRowClick = ({ row }) => {
  // 如果正在编辑，不打开详情抽屉
  if (editingTaskId.value === row.id) {
    return
  }
  currentTask.value = { ...row }
  taskDescription.value = '这是事项的详细描述...'
  showDetailDrawer.value = true
}

// 添加评论
const handleAddComment = () => {
  if (!newComment.value.trim()) {
    MessagePlugin.warning('请输入评论内容')
    return
  }
  comments.value.unshift({
    id: Date.now(),
    author: 'Admin',
    content: newComment.value,
    time: '刚刚'
  })
  newComment.value = ''
  MessagePlugin.success('评论已添加')
}

// 添加子任务
const handleAddSubtask = () => {
  if (!newSubtask.value.trim()) return
  subtasks.value.push({
    id: Date.now(),
    title: newSubtask.value,
    completed: false
  })
  newSubtask.value = ''
  MessagePlugin.success('子任务已添加')
}
</script>

<style scoped lang="scss">
.workspace-container {
  height: 100%;

  .workspace-layout {
    height: 100%;
  }

  .list-content {
    height: 100%;
  }

  .task-card {
    height: 100%;

    :deep(.t-card__body) {
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .task-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .task-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2329;
          margin: 0;
        }

        .task-count {
          font-size: 14px;
          color: #646a73;
          margin-left: 12px;
        }

        .filter-button-wrapper {
          position: relative;

          .filter-button {
            background: rgba(0, 82, 217, 0.08) !important;
            border-color: rgba(0, 82, 217, 0.3);
            color: #0052d9;
            transition: all 0.3s;

            &:hover {
              background: rgba(0, 82, 217, 0.15) !important;
              border-color: #0052d9;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 82, 217, 0.2);
            }

            :deep(.t-icon) {
              color: #0052d9;
            }
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .header-config-btn {
          color: #646a73;
          transition: all 0.3s;

          &:hover {
            color: #0052d9;
            background: rgba(0, 82, 217, 0.1);
          }

          :deep(.t-icon) {
            color: inherit;
          }
        }
      }
    }

    .task-table {
      .task-number-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;

        .task-number-text {
          font-size: 14px;
          color: #1f2329;
        }

        .copy-icon {
          color: #646a73;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
          flex-shrink: 0;

          &:hover {
            color: #0052d9;
            transform: scale(1.1);
          }
        }

        &:hover {
          .copy-icon {
            opacity: 1;
          }
        }
      }

      .task-type-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #1f2329;
        font-size: 14px;

        .t-icon {
          color: #0052d9;
          flex-shrink: 0;
        }
      }

      .task-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        position: relative;

        .summary-text {
          font-size: 14px;
          color: #1f2329;
          flex: 1;
          cursor: pointer;
          transition: color 0.2s;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .summary-input {
          flex: 1;

          :deep(.t-input__inner) {
            font-size: 14px;
            border-color: #0052d9;
            box-shadow: 0 0 0 2px rgba(0, 82, 217, 0.1);
          }
        }

        .summary-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;

          .action-icon {
            color: #646a73;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              color: #0052d9;
              transform: scale(1.1);
            }
          }
        }

        // 悬停时显示操作按钮并让文字变蓝
        &:hover:not(.is-editing) {
          .summary-text {
            color: #0052d9;
          }

          .summary-actions {
            opacity: 1;
          }
        }

        // 编辑状态
        &.is-editing {
          background: #f5f7fa;
          padding: 4px 8px;
          margin: -4px -8px;
          border-radius: 4px;
        }
      }

      .operation-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        .operation-more-icon {
          color: #646a73;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;

          &:hover {
            color: #0052d9;
            background: rgba(0, 82, 217, 0.1);
          }
        }

        :deep(.t-button) {
          font-size: 14px;
          padding: 4px 8px;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-1px);
          }
        }
      }

      .operation-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .column-config-icon {
          color: #646a73;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            color: #0052d9;
            transform: scale(1.15);
          }
        }
      }

      :deep(.t-table) {
        border: 1px solid #e7e7e7;
        border-radius: 6px;
      }

      :deep(.t-table__header) {
        background: #f5f5f5 !important;

        th {
          background: #f5f5f5 !important;
          font-weight: 600;
          color: #1f2329;
          border-bottom: 1px solid #e7e7e7;
        }
      }

      :deep(.t-table__body) {
        tr {
          background: #ffffff;
          transition: all 0.3s;

          &:hover {
            background: #ffffff;
          }

          td {
            color: #646a73;
            border-bottom: 1px solid #e7e7e7;
          }
        }
      }
    }
  }

  .task-detail {
    height: 100%;
    display: flex;
    flex-direction: column;

    .detail-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e7e7e7;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        :deep(.t-breadcrumb) {
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .detail-content {
      flex: 1;
      display: flex;
      overflow: hidden;

      .content-main {
        flex: 1;
        padding: 24px;
        overflow-y: auto;

        .task-title-section {
          margin-bottom: 24px;

          .task-title-input {
            :deep(.t-input__inner) {
              font-size: 20px;
              font-weight: 600;
              color: #1f2329;
            }
          }
        }

        .task-fields {
          margin-bottom: 24px;

          .field-row {
            display: flex;
            gap: 24px;
            align-items: center;

            .field-item {
              display: flex;
              align-items: center;
              gap: 8px;

              .field-label {
                font-size: 14px;
                color: #646a73;
                white-space: nowrap;
              }
            }
          }
        }

        .detail-tabs {
          :deep(.t-tabs__nav) {
            border-bottom: 1px solid #e7e7e7;
          }

          .tab-content {
            padding: 20px 0;
          }

          .comments-section {
            .comment-input {
              margin-bottom: 24px;

              .comment-actions {
                margin-top: 12px;
                display: flex;
                justify-content: flex-end;
              }
            }

            .comments-list {
              .comment-item {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;

                &:last-child {
                  border-bottom: none;
                }

                .comment-content {
                  flex: 1;

                  .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;

                    .comment-author {
                      font-size: 14px;
                      font-weight: 500;
                      color: #1f2329;
                    }

                    .comment-time {
                      font-size: 12px;
                      color: #8f959e;
                    }
                  }

                  .comment-text {
                    font-size: 14px;
                    color: #646a73;
                    line-height: 1.6;
                  }
                }
              }
            }
          }

          .attachments-section {
            .attachments-list {
              margin-top: 16px;

              .attachment-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid #e7e7e7;
                border-radius: 4px;
                margin-bottom: 8px;

                &:hover {
                  background: #f5f7fa;
                }

                .file-name {
                  flex: 1;
                  font-size: 14px;
                  color: #1f2329;
                }

                .file-size {
                  font-size: 12px;
                  color: #8f959e;
                }
              }
            }
          }

          .subtasks-section {
            .subtask-input {
              margin-bottom: 16px;
            }

            .subtasks-list {
              .subtask-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 4px;
                margin-bottom: 8px;

                &:hover {
                  background: #f5f7fa;
                }

                .subtask-text {
                  flex: 1;
                  font-size: 14px;
                  color: #1f2329;

                  &.completed {
                    text-decoration: line-through;
                    color: #8f959e;
                  }
                }
              }
            }
          }

          .activity-section {
            .activity-list {
              .activity-item {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;

                .activity-content {
                  flex: 1;

                  .activity-text {
                    font-size: 14px;
                    margin-bottom: 4px;

                    .activity-user {
                      font-weight: 500;
                      color: #1f2329;
                      margin-right: 4px;
                    }

                    .activity-action {
                      color: #646a73;
                    }
                  }

                  .activity-time {
                    font-size: 12px;
                    color: #8f959e;
                  }
                }
              }
            }
          }
        }
      }

      .content-sidebar {
        width: 280px;
        min-width: 280px;
        padding: 24px;
        border-left: 1px solid #e7e7e7;
        background: #fafafa;
        overflow-y: auto;

        .sidebar-section {
          margin-bottom: 24px;

          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #646a73;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .section-value {
            font-size: 14px;
            color: #1f2329;
          }
        }
      }
    }
  }

  // 列配置抽屉样式
  .column-config-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;

    .config-desc {
      font-size: 14px;
      color: #646a73;
      margin-bottom: 20px;
    }

    .transfer-wrapper {
      flex: 1;
      overflow: hidden;
      margin-bottom: 20px;

      :deep(.t-transfer) {
        height: 100%;

        .t-transfer__list {
          height: 450px;
        }
      }
    }

    .config-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid #e7e7e7;

      .footer-info {
        font-size: 13px;
        color: #646a73;
      }

      .config-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  // 筛选器弹窗样式
  .filter-dialog-content {
    padding: 12px 0;

    .filter-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      max-height: 400px;
      overflow-y: auto;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: #fafbfc;
        border-radius: 6px;
        border: 1px solid transparent;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
          border-color: #d9e1e8;
          box-shadow: 0 2px 6px rgba(0, 82, 217, 0.08);
        }

        .filter-field {
          width: 140px;
          flex-shrink: 0;
        }

        .filter-value {
          width: 280px;
          flex-shrink: 0;
        }

        .filter-remove {
          flex-shrink: 0;
          color: #646a73;
          transition: all 0.3s;

          &:hover {
            color: #ff4d4f;
            background: rgba(255, 77, 79, 0.1);
          }
        }
      }
    }

    .filter-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid #e7e7e7;
      border-bottom: 1px solid #e7e7e7;
      margin-bottom: 16px;

      .actions-left {
        display: flex;
        gap: 12px;
      }

      :deep(.t-button) {
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 82, 217, 0.15);
        }
      }
    }

    .filter-result {
      text-align: center;
      font-size: 14px;
      color: #646a73;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;

      .highlight {
        color: #0052d9;
        font-weight: 600;
        font-size: 20px;
        margin: 0 6px;
      }
    }
  }

  // 状态编辑弹窗样式
  .status-edit-form {
    padding: 20px 0;

    .current-status-display {
      display: flex;
      align-items: center;
      height: 32px;
    }

    :deep(.t-form) {
      .t-form-item {
        margin-bottom: 20px;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e7e7e7;
    }
  }

  // 状态标签可点击样式
  .status-tag-clickable {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  // 优先级编辑弹窗样式
  .priority-edit-form {
    padding: 20px 0;

    .current-priority-display {
      display: flex;
      align-items: center;
      height: 32px;
    }

    :deep(.t-form) {
      .t-form-item {
        margin-bottom: 20px;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e7e7e7;
    }
  }

  // 优先级标签可点击样式
  .priority-tag-clickable {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  // 经办人编辑弹窗样式
  .assignee-edit-form {
    padding: 20px 0;

    .current-assignee-display {
      display: flex;
      align-items: center;
      height: 32px;
      font-size: 14px;
      color: #1f2329;
    }

    :deep(.t-form) {
      .t-form-item {
        margin-bottom: 20px;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e7e7e7;
    }
  }

  // 经办人文字可点击样式
  .assignee-text-clickable {
    cursor: pointer;
    font-size: 14px;
    color: #1f2329;
    transition: all 0.2s;

    &:hover {
      color: #0052d9;
      font-weight: 500;
    }
  }
}
</style>
