<template>
  <div class="workspace-container">
    <div class="workspace-layout">
      <!-- 列表区域 -->
      <div class="list-content">
        <t-card class="task-card">
          <div class="task-header">
            <div class="header-left">
              <h3 class="task-title">我的事项</h3>
              <span class="task-count">共 {{ pagination.total }} 条</span>
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
              </t-button>
            </div>
          </div>

          <t-table
        :data="filteredIssueList"
        :columns="visibleColumns"
        :loading="loading"
        row-key="id"
        :selected-row-keys="selectedRowKeys"
        hover
        class="task-table"
        @select-change="handleSelectChange"
      >
        <template #summary="{ row }">
          <div class="task-summary" :class="{ 'is-editing': editingIssueId === row.id }">
            <!-- 编辑状态：显示输入框 -->
            <t-input
              v-if="editingIssueId === row.id"
              v-model="editingSummary"
              class="summary-input"
              autofocus
              @blur="handleCancelEdit"
              @keyup.enter="handleSaveSummary(row)"
              @keyup.esc="handleCancelEdit"
              @click.stop
            />
            <!-- 非编辑状态：显示文字 -->
            <template v-else>
              <div class="summary-content">
                <span class="summary-text" @click.stop="handleSummaryClick(row)">{{ row.summary }}</span>
                <span class="edit-icon-wrapper" @click.stop="handleEditIssue(row)">
                  <t-icon
                    name="edit"
                    size="16px"
                    class="edit-icon-hover"
                  />
                </span>
              </div>
            </template>
          </div>
        </template>

        <template #issue_number="{ row }">
          <div class="task-number-cell">
            <span class="task-number-text">{{ row.issue_number || row.issueNumber || '-' }}</span>
            <span class="copy-icon-wrapper" @click.stop="handleCopyTaskNumber(row)">
              <t-icon
                name="file-copy"
                size="16px"
                class="copy-icon"
              />
            </span>
          </div>
        </template>

        <template #issue_type="{ row }">
          <div class="task-type-cell">
            <t-icon :name="getIssueTypeIcon(row.issue_type || row.issueType)" size="14px" />
            <span>{{ row.issue_type || row.issueType || '未设置' }}</span>
          </div>
        </template>

        <template #priority="{ row }">
          <t-dropdown
            :min-column-width="120"
            trigger="hover"
            @click.stop="handlePriorityClick(row)"
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
            @click.stop="handleAssigneeClick(row)"
          >
            <span class="assignee-text-clickable">{{ getAssigneeName(row) }}</span>
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
              @click.stop
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
              <t-option label="事项类型" value="issue_type" />
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
              v-else-if="filter.field === 'issue_type'"
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
          共筛选出 <span class="highlight">{{ filteredIssueList.length }}</span> 个事项
        </div>
      </div>
    </t-dialog>

    <!-- 事项详情抽屉 -->
    <IssueDetail
      v-model:visible="showDetailDrawer"
      :issue="currentIssue"
      v-model:activeTab="activeTab"
      v-model:description="issueDescription"
      v-model:newComment="newComment"
      v-model:newSubtask="newSubtask"
      :comments="comments"
      :attachments="attachments"
      :subtasks="subtasks"
      :activities="activities"
      v-model:dueDate="dueDate"
      v-model:tags="tags"
      v-model:schedule="schedule"
      @update-summary="handleUpdateIssueSummary"
      @update-assignee="handleUpdateIssueAssignee"
      @edit-issue="handleEditIssueDialog"
      @split-task="handleSplitTask"
      @add-comment="handleAddComment"
      @add-subtask="handleAddSubtask"
    />

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
                :theme="getStatusTheme(currentEditIssue?.status)"
                size="medium"
              >
                {{ currentEditIssue?.status }}
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
                :theme="getPriorityTheme(currentEditIssue?.priority)"
                size="medium"
              >
                {{ currentEditIssue?.priority }}
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
              <span>{{ currentEditIssue?.assignee }}</span>
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

    <!-- 拆分任务弹窗 -->
    <t-dialog
      v-model:visible="showSplitTaskDialog"
      header="拆分任务"
      width="900px"
      :footer="false"
      :close-on-overlay-click="false"
      placement="center"
    >
      <div class="split-task-dialog">
        <!-- 需求信息 -->
        <div class="requirement-info">
          <h4 class="section-title">需求信息</h4>
          <div class="info-item">
            <span class="label">需求标题：</span>
            <span class="value">{{ splitTaskData.requirementSummary }}</span>
          </div>
          <div class="info-item">
            <span class="label">需求描述：</span>
            <div class="value description" v-html="splitTaskData.requirementDescription"></div>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="tasks-section">
          <h4 class="section-title">拆分后的任务（共 {{ splitTaskData.tasks.length }} 个）</h4>
          <div class="tasks-list">
            <div
              v-for="(task, index) in splitTaskData.tasks"
              :key="index"
              class="task-card"
            >
              <div class="task-header">
                <span class="task-role">{{ task.roleName }}</span>
              </div>
              <div class="task-form">
                <div class="form-row">
                  <div class="form-item full-width">
                    <label>任务标题</label>
                    <t-input
                      v-model="task.summary"
                      placeholder="请输入任务标题"
                    />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-item">
                    <label>负责人</label>
                    <t-select
                      v-model="task.assignee"
                      placeholder="请选择负责人"
                      clearable
                    >
                      <t-option
                        v-for="assignee in assigneeOptions"
                        :key="assignee.value"
                        :value="assignee.value"
                        :label="assignee.label"
                      />
                    </t-select>
                  </div>
                  <div class="form-item">
                    <label>优先级</label>
                    <t-select
                      v-model="task.priority"
                      placeholder="请选择优先级"
                    >
                      <t-option
                        v-for="priority in priorityOptions"
                        :key="priority.value"
                        :value="priority.value"
                        :label="priority.label"
                      />
                    </t-select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-item">
                    <label>排期时间</label>
                    <t-date-range-picker
                      v-model="task.dateRange"
                      placeholder="选择开始和结束日期"
                      clearable
                    />
                  </div>
                  <div class="form-item">
                    <label>预估工时（小时）</label>
                    <t-input-number
                      v-model="task.estimatedHours"
                      placeholder="请输入预估工时"
                      :min="0"
                      :step="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="dialog-footer">
          <t-button theme="default" variant="outline" @click="handleCancelSplitTask">
            取消
          </t-button>
          <t-button theme="primary" @click="handleConfirmSplitTask">
            确认拆分
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 编辑事项弹窗 -->
    <t-dialog
      v-model:visible="showEditIssueDialog"
      header="编辑事项"
      width="800px"
      @confirm="handleSaveEditedIssue"
    >
      <div v-if="editingIssue" class="edit-issue-dialog">
        <!-- 顶部：空间和事项类型 -->
        <div class="issue-top-info">
          <t-form-item label="空间">
            <t-input v-model="editingIssue.space" readonly class="readonly-field" />
          </t-form-item>
          <t-form-item label="事项类型">
            <t-input v-model="editingIssue.issue_type" readonly class="readonly-field" />
          </t-form-item>
        </div>

        <!-- Tab 页面 -->
        <t-tabs v-model="editActiveTab" class="issue-edit-tabs">
          <!-- 基本信息 -->
          <t-tab-panel value="basic" label="基本信息">
            <div class="tab-content">
              <t-form-item label="事项标题">
                <t-input v-model="editingIssue.summary" placeholder="请输入事项标题" />
              </t-form-item>
              <t-form-item label="优先级">
                <t-select v-model="editingIssue.priority" placeholder="请选择优先级">
                  <t-option value="高" label="高" />
                  <t-option value="中" label="中" />
                  <t-option value="低" label="低" />
                </t-select>
              </t-form-item>
              <t-form-item label="状态">
                <t-select v-model="editingIssue.status" placeholder="请选择状态">
                  <t-option value="待处理" label="待处理" />
                  <t-option value="进行中" label="进行中" />
                  <t-option value="已完成" label="已完成" />
                  <t-option value="已关闭" label="已关闭" />
                </t-select>
              </t-form-item>
              <t-form-item label="描述">
                <t-textarea v-model="editingIssue.description" placeholder="请输入描述" :autosize="{ minRows: 3, maxRows: 6 }" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 人员 -->
          <t-tab-panel value="people" label="人员">
            <div class="tab-content">
              <t-form-item label="负责人">
                <t-select v-model="editingIssue.assignee" placeholder="请选择负责人">
                  <t-option v-for="assignee in assigneeOptions" :key="assignee.value" :value="assignee.value" :label="assignee.label" />
                </t-select>
              </t-form-item>
              <t-form-item label="参与人员">
                <t-select v-model="editingIssue.participants" placeholder="请选择参与人员" multiple>
                  <t-option v-for="assignee in assigneeOptions" :key="assignee.value" :value="assignee.value" :label="assignee.label" />
                </t-select>
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 日期 -->
          <t-tab-panel value="date" label="日期">
            <div class="tab-content">
              <t-form-item label="开始日期">
                <t-date-picker v-model="editingIssue.startDate" placeholder="请选择开始日期" />
              </t-form-item>
              <t-form-item label="结束日期">
                <t-date-picker v-model="editingIssue.endDate" placeholder="请选择结束日期" />
              </t-form-item>
              <t-form-item label="截止日期">
                <t-date-picker v-model="editingIssue.dueDate" placeholder="请选择截止日期" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 进展 -->
          <t-tab-panel value="progress" label="进展">
            <div class="tab-content">
              <t-form-item label="完成进度">
                <t-slider v-model="editingIssue.progress" :min="0" :max="100" :step="5" />
                <span class="progress-value">{{ editingIssue.progress }}%</span>
              </t-form-item>
              <t-form-item label="工作日志">
                <t-textarea v-model="editingIssue.worklog" placeholder="记录工作进展" :autosize="{ minRows: 4, maxRows: 8 }" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- 排期 -->
          <t-tab-panel value="schedule" label="排期">
            <div class="tab-content">
              <t-form-item label="预计工时（小时）">
                <t-input-number v-model="editingIssue.estimatedHours" :min="0" :step="0.5" placeholder="请输入预计工时" />
              </t-form-item>
              <t-form-item label="实际工时（小时）">
                <t-input-number v-model="editingIssue.actualHours" :min="0" :step="0.5" placeholder="请输入实际工时" />
              </t-form-item>
              <t-form-item label="里程碑">
                <t-select v-model="editingIssue.milestone" placeholder="请选择里程碑">
                  <t-option value="V1.0" label="V1.0" />
                  <t-option value="V1.1" label="V1.1" />
                  <t-option value="V2.0" label="V2.0" />
                </t-select>
              </t-form-item>
              <t-form-item label="迭代">
                <t-select v-model="editingIssue.sprint" placeholder="请选择迭代">
                  <t-option value="Sprint 1" label="Sprint 1" />
                  <t-option value="Sprint 2" label="Sprint 2" />
                  <t-option value="Sprint 3" label="Sprint 3" />
                </t-select>
              </t-form-item>
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { useWorkspaceStore } from '@/store/workspace.js'
import { getIssueList, getIssueDetail, updateIssue, deleteIssue } from '@/api/workspace.js'
import IssueDetail from './components/IssueDetail.vue'

const workspaceStore = useWorkspaceStore()
const loading = ref(false)
const showDetailDrawer = ref(false)

// 分页参数
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})
const showFilterDialog = ref(false)
const showColumnConfig = ref(false)
const currentIssue = ref(null)
const selectedRowKeys = ref([])
const activeTab = ref('comments')
const issueDescription = ref('')
const newComment = ref('')
const newSubtask = ref('')
const dueDate = ref('')
const tags = ref([])
const schedule = ref([
  { role: 'product', roleName: '产品', assignee: '', dateRange: [], estimatedHours: null },
  { role: 'backend', roleName: '后端', assignee: '', dateRange: [], estimatedHours: null },
  { role: 'frontend', roleName: '前端', assignee: '', dateRange: [], estimatedHours: null },
  { role: 'test', roleName: '测试', assignee: '', dateRange: [], estimatedHours: null }
])

// 行内编辑状态
const editingIssueId = ref(null)
const editingSummary = ref('')

// 状态编辑弹窗
const showStatusDialog = ref(false)
const currentEditIssue = ref(null)
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

// 拆分任务弹窗
const showSplitTaskDialog = ref(false)
const splitTaskData = ref({
  requirementSummary: '',
  requirementDescription: '',
  tasks: []
})

// 编辑事项弹窗
const showEditIssueDialog = ref(false)
const editingIssue = ref(null)
const editActiveTab = ref('basic')

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
  { id: 1, user: '张三', action: '修改了状态', from: '待办', to: '进行中', time: '3小时前' },
  { id: 2, user: '李四', action: '添加了评论', time: '2小时前' },
  { id: 3, user: '王五', action: '修改了优先级', from: '中', to: '高', time: '1小时前' },
  { id: 4, user: '张三', action: '修改了经办人', from: '李四', to: '王五', time: '30分钟前' }
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
    colKey: 'issue_type',
    title: '事项类型',
    width: 120,
    align: 'center',
    visible: true
  },
  {
    colKey: 'issue_number',
    title: '事项单号',
    width: 200,
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
const issueList = ref([])

// 获取任务列表
const fetchIssueList = async () => {
  try {
    loading.value = true
    const res = await getIssueList({
      current: pagination.value.current,
      size: pagination.value.pageSize
    })
    if (res.success) {
      issueList.value = res.data.records || res.data.list || []
      // 更新总数
      pagination.value.total = res.data.total || 0
      // 更新store中的事项数量
      workspaceStore.setIssueCount(pagination.value.total)
    } else {
      MessagePlugin.error(res.message || '获取事项列表失败')
    }
  } catch (error) {
    console.error('获取事项列表失败:', error)
    MessagePlugin.error('获取事项列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  fetchIssueList()
}

// 处理每页条数变化
const handlePageSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.current = 1  // 重置到第一页
  fetchIssueList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIssueList()
})

// 监听 refreshTrigger 变化,自动刷新列表
watch(() => workspaceStore.refreshTrigger, () => {
  fetchIssueList()
})

// 计算有效的筛选条件数量
const activeFilterCount = computed(() => {
  return filterConditions.value.filter(condition => condition.value).length
})

// 筛选后的任务列表
const filteredIssueList = computed(() => {
  return issueList.value.filter(task => {
    // 首先检查全局搜索（来自Header的搜索框）
    if (workspaceStore.searchIssueNumber) {
      const searchValue = workspaceStore.searchIssueNumber.toLowerCase()
      const matchNumber = task.issue_number.toLowerCase().includes(searchValue)
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
        const matchNumber = task.issue_number.toLowerCase().includes(keyword)
        if (!matchSummary && !matchNumber) return false
      } else if (field === 'issue_type') {
        // 事项类型筛选
        if (task.issue_type !== value) return false
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
watch(filteredIssueList, (newList) => {
  workspaceStore.setIssueCount(newList.length)
}, { immediate: true })

// 获取事项类型图标
const getIssueTypeIcon = (issueType) => {
  const iconMap = {
    '任务': 'task',
    'bug': 'bug',
    '需求': 'lightbulb',
    '线上问题': 'error-circle'
  }
  return iconMap[issueType] || 'file-icon'
}

// 获取事项类型颜色
const getIssueTypeColor = (issueType) => {
  const colorMap = {
    '任务': '#0052d9',
    'bug': '#e34d59',
    '需求': '#29cc85',
    '线上问题': '#ff9800'
  }
  return colorMap[issueType] || '#646a73'
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

// 获取优先级图标
const getPriorityIcon = (priority) => {
  const iconMap = {
    '高': 'arrow-up',
    '中': 'minus',
    '低': 'arrow-down'
  }
  return iconMap[priority] || 'minus'
}

// 获取优先级颜色
const getPriorityColor = (priority) => {
  const colorMap = {
    '高': '#e34d59',
    '中': '#ed7b2f',
    '低': '#2ba471'
  }
  return colorMap[priority] || '#646a73'
}

// 获取经办人名称
const getAssigneeName = (row) => {
  // 优先使用 assignee 字段（如果后端已经关联查询了用户名）
  if (row.assignee) {
    return row.assignee
  }
  // 如果只有 assigneeId，尝试从经办人列表中查找
  if (row.assigneeId) {
    const assignee = assigneeOptions.value.find(a => a.value === row.assigneeId)
    return assignee ? assignee.label : `用户${row.assigneeId}`
  }
  return '未分配'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'

  // 如果是时间戳
  if (typeof time === 'number') {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 如果是字符串格式的日期时间
  if (typeof time === 'string') {
    // 处理 ISO 格式或其他标准格式
    const date = new Date(time)
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    // 如果已经是格式化的字符串，直接返回
    return time
  }

  return '-'
}

// 处理新建事项
const handleCreate = () => {
  MessagePlugin.info('新建事项功能开发中')
}

// 点击概要文字 - 打开详情弹窗
const handleSummaryClick = async (row) => {
  // 如果正在编辑，不打开详情抽屉
  if (editingIssueId.value === row.id) {
    return
  }

  try {
    // 调用API获取事项详情
    loading.value = true
    const res = await getIssueDetail(row.id)

    if (res.success) {
      // 使用API返回的详情数据
      currentIssue.value = res.data
      issueDescription.value = res.data.description || '暂无描述'

      // 更新其他详情数据
      if (res.data.comments) {
        comments.value = res.data.comments
      }
      if (res.data.attachments) {
        attachments.value = res.data.attachments
      }
      if (res.data.subtasks) {
        subtasks.value = res.data.subtasks
      }
      if (res.data.activities) {
        activities.value = res.data.activities
      }
      if (res.data.schedule) {
        schedule.value = res.data.schedule
      }

      showDetailDrawer.value = true
    } else {
      MessagePlugin.error(res.message || '获取事项详情失败')
    }
  } catch (error) {
    console.error('获取事项详情失败:', error)
    MessagePlugin.error('获取事项详情失败')
  } finally {
    loading.value = false
  }
}

// 处理编辑事项（概要列的编辑图标）- 进入行内编辑模式
const handleEditIssue = (row) => {
  editingIssueId.value = row.id
  editingSummary.value = row.summary
}

// 保存概要修改（按Enter键）
const handleSaveSummary = async (row) => {
  if (!editingSummary.value.trim()) {
    MessagePlugin.warning('概要不能为空')
    editingSummary.value = row.summary
    editingIssueId.value = null
    return
  }

  try {
    // 只更新概要字段
    const res = await updateIssue(row.id, {
      summary: editingSummary.value
    })

    if (res.success || res.code === 200) {
      MessagePlugin.success('概要已更新')
      // 刷新列表
      fetchIssueList()
    } else {
      MessagePlugin.error(res.message || '更新失败')
      editingSummary.value = row.summary
    }
  } catch (error) {
    console.error('更新概要失败:', error)
    MessagePlugin.error('更新失败，请重试')
    editingSummary.value = row.summary
  }

  // 退出编辑模式
  editingIssueId.value = null
  editingSummary.value = ''
}

// 取消编辑（失去焦点或按Esc键）
const handleCancelEdit = () => {
  editingIssueId.value = null
  editingSummary.value = ''
}

// 处理复制事项单号
const handleCopyTaskNumber = (row) => {
  navigator.clipboard.writeText(row.issue_number).then(() => {
    MessagePlugin.success(`已复制事项单号：${row.issue_number}`)
  }).catch(() => {
    MessagePlugin.error('复制失败')
  })
}

// 处理状态点击 - 打开编辑弹窗
const handleStatusClick = (row) => {
  currentEditIssue.value = row
  selectedStatus.value = row.status
  showStatusDialog.value = true
}

// 快速修改状态（从下拉菜单选择）
const handleQuickChangeStatus = async (row, newStatus) => {
  try {
    const res = await updateIssue(row.id, { status: newStatus })
    if (res.success || res.code === 200) {
      MessagePlugin.success(`状态已更新为：${newStatus}`)
      // 刷新列表
      fetchIssueList()
    } else {
      MessagePlugin.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    MessagePlugin.error('更新失败，请重试')
  }
}

// 确认修改状态（从弹窗）
const handleConfirmStatusChange = async () => {
  if (currentEditIssue.value) {
    try {
      const res = await updateIssue(currentEditIssue.value.id, { status: selectedStatus.value })
      if (res.success || res.code === 200) {
        MessagePlugin.success(`状态已更新为：${selectedStatus.value}`)
        // 刷新列表
        fetchIssueList()
      } else {
        MessagePlugin.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      MessagePlugin.error('更新失败，请重试')
    }
  }
  showStatusDialog.value = false
}

// 取消修改状态
const handleCancelStatusChange = () => {
  showStatusDialog.value = false
  currentEditIssue.value = null
  selectedStatus.value = ''
}

// 处理优先级点击 - 打开编辑弹窗
const handlePriorityClick = (row) => {
  currentEditIssue.value = row
  selectedPriority.value = row.priority
  showPriorityDialog.value = true
}

// 快速修改优先级（从下拉菜单选择）
const handleQuickChangePriority = async (row, newPriority) => {
  try {
    const res = await updateIssue(row.id, { priority: newPriority })
    if (res.success || res.code === 200) {
      MessagePlugin.success(`优先级已更新为：${newPriority}`)
      // 刷新列表
      fetchIssueList()
    } else {
      MessagePlugin.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新优先级失败:', error)
    MessagePlugin.error('更新失败，请重试')
  }
}

// 确认修改优先级（从弹窗）
const handleConfirmPriorityChange = async () => {
  if (currentEditIssue.value) {
    try {
      const res = await updateIssue(currentEditIssue.value.id, { priority: selectedPriority.value })
      if (res.success || res.code === 200) {
        MessagePlugin.success(`优先级已更新为：${selectedPriority.value}`)
        // 刷新列表
        fetchIssueList()
      } else {
        MessagePlugin.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新优先级失败:', error)
      MessagePlugin.error('更新失败，请重试')
    }
  }
  showPriorityDialog.value = false
}

// 取消修改优先级
const handleCancelPriorityChange = () => {
  showPriorityDialog.value = false
  currentEditIssue.value = null
  selectedPriority.value = ''
}

// 处理经办人点击 - 打开编辑弹窗
const handleAssigneeClick = (row) => {
  currentEditIssue.value = row
  selectedAssignee.value = row.assignee
  showAssigneeDialog.value = true
}

// 快速修改经办人（从下拉菜单选择）
const handleQuickChangeAssignee = async (row, newAssignee) => {
  try {
    const res = await updateIssue(row.id, { assigneeId: newAssignee })
    if (res.success || res.code === 200) {
      MessagePlugin.success(`经办人已更新`)
      // 刷新列表
      fetchIssueList()
    } else {
      MessagePlugin.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新经办人失败:', error)
    MessagePlugin.error('更新失败，请重试')
  }
}

// 确认修改经办人（从弹窗）
const handleConfirmAssigneeChange = async () => {
  if (currentEditIssue.value) {
    try {
      const res = await updateIssue(currentEditIssue.value.id, { assigneeId: selectedAssignee.value })
      if (res.success || res.code === 200) {
        MessagePlugin.success(`经办人已更新`)
        // 刷新列表
        fetchIssueList()
      } else {
        MessagePlugin.error(res.message || '更新失败')
      }
    } catch (error) {
      console.error('更新经办人失败:', error)
      MessagePlugin.error('更新失败，请重试')
    }
  }
  showAssigneeDialog.value = false
}

// 取消修改经办人
const handleCancelAssigneeChange = () => {
  showAssigneeDialog.value = false
  currentEditIssue.value = null
  selectedAssignee.value = ''
}

// 处理编辑
const handleEdit = (row) => {
  currentIssue.value = { ...row }
  issueDescription.value = '这是事项的详细描述...'
  showDetailDrawer.value = true
}

// 处理删除
const handleDelete = (row) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确认删除事项：${row.summary}？删除后无法恢复。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      try {
        const res = await deleteIssue(row.id)
        if (res.success || res.code === 200) {
          MessagePlugin.success('删除成功')
          // 刷新列表
          fetchIssueList()
          confirmDialog.destroy()
        } else {
          MessagePlugin.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除事项失败:', error)
        MessagePlugin.error('删除失败，请重试')
      }
    }
  })
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

// 更新事项标题
const handleUpdateIssueSummary = (newSummary) => {
  if (currentIssue.value) {
    currentIssue.value.summary = newSummary
    MessagePlugin.success('标题已更新')
  }
}

// 更新事项经办人
const handleUpdateIssueAssignee = (newAssignee) => {
  if (currentIssue.value) {
    currentIssue.value.assignee = newAssignee
    MessagePlugin.success('经办人已更新')
  }
}

// 拆分任务
const handleSplitTask = () => {
  if (currentIssue.value && currentIssue.value.type === '需求') {
    // 复制当前需求的描述
    splitTaskData.value.requirementSummary = currentIssue.value.summary
    splitTaskData.value.requirementDescription = issueDescription.value

    // 根据排期创建任务列表
    splitTaskData.value.tasks = schedule.value
      .filter(item => item.assignee || item.dateRange.length > 0 || item.estimatedHours)
      .map(item => ({
        role: item.role,
        roleName: item.roleName,
        summary: `【${item.roleName}】${currentIssue.value.summary}`,
        description: issueDescription.value,
        assignee: item.assignee || '',
        dateRange: item.dateRange || [],
        estimatedHours: item.estimatedHours || null,
        priority: currentIssue.value.priority || '中',
        status: '待处理'
      }))

    // 如果没有排期信息，则创建默认的4个岗位任务
    if (splitTaskData.value.tasks.length === 0) {
      splitTaskData.value.tasks = schedule.value.map(item => ({
        role: item.role,
        roleName: item.roleName,
        summary: `【${item.roleName}】${currentIssue.value.summary}`,
        description: issueDescription.value,
        assignee: '',
        dateRange: [],
        estimatedHours: null,
        priority: currentIssue.value.priority || '中',
        status: '待处理'
      }))
    }

    showSplitTaskDialog.value = true
  }
}

// 确认拆分任务
const handleConfirmSplitTask = () => {
  const validTasks = splitTaskData.value.tasks.filter(task =>
    task.summary && task.summary.trim() !== ''
  )

  if (validTasks.length === 0) {
    MessagePlugin.warning('请至少填写一个任务标题')
    return
  }

  // TODO: 调用API创建任务
  validTasks.forEach((task, index) => {
    console.log(`创建任务 ${index + 1}:`, task)
    // 这里应该调用API创建任务
  })

  MessagePlugin.success(`成功拆分为 ${validTasks.length} 个任务`)
  showSplitTaskDialog.value = false

  // 刷新列表
  loadIssues()
}

// 取消拆分任务
const handleCancelSplitTask = () => {
  showSplitTaskDialog.value = false
}

// 处理编辑事项对话框
const handleEditIssueDialog = () => {
  if (currentIssue.value) {
    // 复制当前事项数据到编辑对象
    editingIssue.value = {
      ...currentIssue.value,
      space: currentIssue.value.space || '项目A',
      issue_type: currentIssue.value.issue_type || '',
      description: issueDescription.value || '',
      progress: currentIssue.value.progress || 0,
      worklog: currentIssue.value.worklog || '',
      estimatedHours: currentIssue.value.estimatedHours || 0,
      actualHours: currentIssue.value.actualHours || 0,
      milestone: currentIssue.value.milestone || '',
      sprint: currentIssue.value.sprint || '',
      startDate: currentIssue.value.startDate || '',
      endDate: currentIssue.value.endDate || '',
      participants: currentIssue.value.participants || []
    }
    // 打开编辑弹窗（保持详情抽屉打开状态）
    showEditIssueDialog.value = true
    editActiveTab.value = 'basic'
  }
}

// 保存编辑后的事项
const handleSaveEditedIssue = async () => {
  if (editingIssue.value) {
    try {
      // 将tags数组转换为逗号分隔的字符串
      const submitData = {
        ...editingIssue.value,
        tags: Array.isArray(editingIssue.value.tags)
          ? editingIssue.value.tags.join(',')
          : editingIssue.value.tags
      }

      const res = await updateIssue(editingIssue.value.id, submitData)
      if (res.success || res.code === 200) {
        MessagePlugin.success('事项已保存')
        showEditIssueDialog.value = false

        // 更新列表中的数据
        const task = issueList.value.find(t => t.id === editingIssue.value.id)
        if (task) {
          Object.assign(task, editingIssue.value)
        }

        // 刷新列表
        fetchIssueList()
      } else {
        MessagePlugin.error(res.message || '保存失败')
      }
    } catch (error) {
      console.error('保存事项失败:', error)
      MessagePlugin.error('保存失败，请重试')
    }
  }
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06);
    }

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
            background: rgba(102, 126, 234, 0.08) !important;
            border-color: rgba(102, 126, 234, 0.3);
            color: #667eea;
            transition: all 0.3s;

            &:hover {
              background: rgba(102, 126, 234, 0.15) !important;
              border-color: #667eea;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
            }

            :deep(.t-icon) {
              color: #667eea;
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
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
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

        .copy-icon-wrapper {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
          flex-shrink: 0;

          .copy-icon {
            color: #646a73;
            transition: all 0.2s;
          }

          &:hover .copy-icon {
            color: #667eea;
            transform: scale(1.1);
          }
        }

        &:hover {
          .copy-icon-wrapper {
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
          color: #667eea;
          flex-shrink: 0;
        }
      }

      .task-summary {
        display: flex;
        align-items: center;
        position: relative;

        .summary-content {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          position: relative;

          .edit-icon-wrapper {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            opacity: 0;
            transition: all 0.2s;
            flex-shrink: 0;

            .edit-icon-hover {
              color: #646a73;
              transition: all 0.2s;
            }

            &:hover .edit-icon-hover {
              color: #667eea;
              transform: scale(1.1);
            }
          }

          .summary-text {
            font-size: 14px;
            color: #1f2329;
            cursor: pointer;
            transition: color 0.2s;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
              color: #667eea;
            }
          }
        }

        .summary-input {
          flex: 1;

          :deep(.t-input__inner) {
            font-size: 14px;
            border-color: #667eea;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
          }
        }

        // 悬停时显示编辑图标
        &:hover:not(.is-editing) {
          .edit-icon-wrapper {
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
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
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
            color: #667eea;
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

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e7e7e7;
    }
  }

  .task-detail {
    height: 100%;
    display: flex;
    flex-direction: column;

    .detail-header {
      padding: 12px 24px;
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
        padding: 16px 24px 24px 24px;
        overflow-y: auto;

        .task-title-section {
          margin-bottom: 24px;

          .task-title-input {
            :deep(.t-input__inner) {
              font-size: 20px;
              font-weight: 600;
              color: #1f2329;
            }

            :deep(.t-input__limit) {
              font-size: 12px;
              color: #8f959e;
              margin-top: 4px;
            }
          }

          .task-title-display {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;

            .title-edit-icon {
              color: #646a73;
              cursor: pointer;
              opacity: 0;
              transition: all 0.2s;
              flex-shrink: 0;

              &:hover {
                color: #667eea;
                transform: scale(1.1);
              }
            }

            .task-title-text {
              font-size: 20px;
              font-weight: 600;
              color: #1f2329;
              margin: 0;
            }

            &:hover {
              .title-edit-icon {
                opacity: 1;
              }
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

              .field-value {
                font-size: 14px;
                color: #1f2329;
                font-weight: 500;
              }

              .field-value-with-icon {
                display: flex;
                align-items: center;
                gap: 6px;

                .field-value {
                  font-size: 14px;
                  color: #1f2329;
                  font-weight: 500;
                }
              }

              .status-tag {
                font-weight: 500;
              }
            }
          }
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e7e7e7;

          :deep(.t-button) {
            transition: all 0.2s;

            &:hover {
              transform: translateY(-1px);
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
      color: #667eea;
      font-weight: 500;
    }
  }

  // 拆分任务弹窗样式
  .split-task-dialog {
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #0052d9;
    }

    .requirement-info {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 6px;

      .info-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-size: 14px;
          font-weight: 500;
          color: #646a73;
          margin-right: 8px;
        }

        .value {
          font-size: 14px;
          color: #1f2329;

          &.description {
            margin-top: 8px;
            padding: 12px;
            background-color: #fff;
            border-radius: 4px;
            line-height: 1.6;
            max-height: 120px;
            overflow-y: auto;
          }
        }
      }
    }

    .tasks-section {
      margin-bottom: 24px;

      .tasks-list {
        max-height: 500px;
        overflow-y: auto;
        padding-right: 8px;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: #dcdcdc;
          border-radius: 3px;

          &:hover {
            background-color: #bbb;
          }
        }
      }

      .task-card {
        margin-bottom: 16px;
        padding: 16px;
        background-color: #fff;
        border: 1px solid #e7e7e7;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

        &:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .task-header {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e7e7e7;

          .task-role {
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
          }
        }

        .task-form {
          .form-row {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .form-item {
              flex: 1;
              display: flex;
              flex-direction: column;

              &.full-width {
                flex: 1 1 100%;
              }

              label {
                font-size: 13px;
                font-weight: 500;
                color: #646a73;
                margin-bottom: 6px;
              }

              :deep(.t-input),
              :deep(.t-select),
              :deep(.t-date-range-picker),
              :deep(.t-input-number) {
                width: 100%;
              }
            }
          }
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e7e7e7;
    }
  }

  // 编辑事项弹窗样式
  .edit-issue-dialog {
    .issue-top-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e7e7e7;
    }

    .issue-edit-tabs {
      .tab-content {
        padding: 16px 0;

        .t-form-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .progress-value {
          margin-left: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #0052d9;
        }
      }
    }

    .readonly-field {
      :deep(.t-input) {
        background-color: #f5f5f5;
        color: #bbb;
        cursor: not-allowed;
      }
    }
  }
}
</style>
