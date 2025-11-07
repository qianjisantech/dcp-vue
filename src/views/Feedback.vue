<template>
  <div class="feedback-page">
    <!-- 顶部操作栏 -->
    <div class="feedback-header">
      <div class="header-left">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索反馈标题或内容..."
          clearable
          style="width: 320px"
          @enter="handleSearch"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
        <t-button theme="primary" @click="handleSearch" style="margin-left: 8px">
          查询
        </t-button>
      </div>
      <div class="header-right">
        <t-button theme="primary" @click="showNewFeedbackDialog = true">
          <template #icon><t-icon name="add" /></template>
          新建反馈
        </t-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="feedback-filters">
      <div class="filter-tabs">
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 'all' }"
          @click="handleFilterStatusChange('all')"
        >
          <t-icon name="queue" size="16px" />
          全部
          <span class="count">{{ feedbackList.length }}</span>
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 'open' }"
          @click="handleFilterStatusChange('open')"
        >
          <t-icon name="error-circle" size="16px" />
          未解决
          <span class="count">{{ openCount }}</span>
        </div>
        <div
          class="filter-tab"
          :class="{ active: filterStatus === 'closed' }"
          @click="handleFilterStatusChange('closed')"
        >
          <t-icon name="check-circle" size="16px" />
          已解决
          <span class="count">{{ closedCount }}</span>
        </div>
      </div>
      <div class="filter-actions">
        <t-select v-model="filterType" placeholder="类型" style="width: 120px">
          <t-option value="all" label="所有类型" />
          <t-option value="bug" label="问题反馈" />
          <t-option value="feature" label="功能建议" />
          <t-option value="improvement" label="改进建议" />
          <t-option value="other" label="其他" />
        </t-select>
        <t-select v-model="sortBy" style="width: 140px">
          <t-option value="newest" label="最新创建" />
          <t-option value="oldest" label="最早创建" />
          <t-option value="mostCommented" label="评论最多" />
        </t-select>
      </div>
    </div>

    <!-- 反馈列表 -->
    <div class="feedback-list">
      <div
        v-for="feedback in filteredFeedbackList"
        :key="feedback.id"
        class="feedback-item"
        :class="{ selected: selectedFeedback?.id === feedback.id }"
        @click="selectFeedback(feedback)"
      >
        <div class="feedback-item-header">
          <div class="feedback-status">
            <t-icon
              :name="feedback.status === 'open' ? 'error-circle' : 'check-circle'"
              :class="feedback.status"
              size="18px"
            />
          </div>
          <div class="feedback-main">
            <div class="feedback-title">{{ feedback.title }}</div>
            <div class="feedback-meta">
              <span class="type-badge" :class="feedback.type">
                {{ getTypeLabel(feedback.type) }}
              </span>
              <span class="meta-text">
                #{{ feedback.id }} 由 {{ feedback.createdBy || '-' }} 创建于 {{ feedback.createTime || '-' }}
              </span>
              <span v-if="feedback.comments > 0" class="comment-count">
                <t-icon name="chat" size="14px" />
                {{ feedback.comments }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredFeedbackList.length === 0" class="empty-state">
        <t-icon name="inbox" size="48px" />
        <p>暂无反馈</p>
      </div>
    </div>

    <!-- 新建反馈弹窗 -->
    <t-dialog
      v-model:visible="showNewFeedbackDialog"
      header="新建反馈"
      width="700px"
      :footer="false"
    >
      <div class="new-feedback-form">
        <div class="form-group">
          <label class="form-label">标题 <span class="required">*</span></label>
          <t-input
            v-model="newFeedback.title"
            placeholder="简要描述您的反馈"
            size="large"
          />
        </div>

        <div class="form-group">
          <label class="form-label">类型 <span class="required">*</span></label>
          <t-radio-group v-model="newFeedback.type" class="type-radio-group">
            <t-radio value="bug">
              <t-icon name="bug" size="16px" />
              问题反馈
            </t-radio>
            <t-radio value="feature">
              <t-icon name="lightbulb" size="16px" />
              功能建议
            </t-radio>
            <t-radio value="improvement">
              <t-icon name="arrow-up" size="16px" />
              改进建议
            </t-radio>
            <t-radio value="other">
              <t-icon name="ellipsis" size="16px" />
              其他
            </t-radio>
          </t-radio-group>
        </div>

        <div class="form-group">
          <label class="form-label">详细描述 <span class="required">*</span></label>
          <t-textarea
            v-model="newFeedback.content"
            placeholder="请详细描述您遇到的问题或建议..."
            :autosize="{ minRows: 8, maxRows: 16 }"
          />
          <div class="form-tip">支持 Markdown 格式</div>
        </div>

        <div class="form-group">
          <label class="form-label">联系方式（可选）</label>
          <t-input
            v-model="newFeedback.contactInfo"
            placeholder="邮箱或电话，方便我们与您联系"
          />
        </div>

        <div class="form-actions">
          <t-button theme="default" variant="outline" @click="handleCancelNew">
            取消
          </t-button>
          <t-button theme="primary" @click="handleSubmitNew" :loading="submitting">
            提交反馈
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 反馈详情抽屉 -->
    <t-drawer
      v-model:visible="showDetailDrawer"
      :header="`#${selectedFeedback?.id} ${selectedFeedback?.title}`"
      size="600px"
      :footer="false"
    >
      <div v-if="selectedFeedback" class="feedback-detail">
        <div class="detail-header">
          <div class="status-badge" :class="selectedFeedback.status">
            <t-icon
              :name="selectedFeedback.status === 'open' ? 'error-circle' : 'check-circle'"
              size="16px"
            />
            {{ selectedFeedback.status === 'open' ? '未解决' : '已解决' }}
          </div>
          <span class="type-badge" :class="selectedFeedback.type">
            {{ getTypeLabel(selectedFeedback.type) }}
          </span>
        </div>

        <div class="detail-meta">
          <span>{{ selectedFeedback.createdBy || '-' }}</span> 创建于 {{ selectedFeedback.createTime || '-' }}
        </div>

        <div class="detail-content">
          <h3>详细描述</h3>
          <div class="content-text">{{ selectedFeedback.content }}</div>
        </div>

        <div v-if="selectedFeedback.contactInfo" class="detail-section">
          <h3>联系方式</h3>
          <div class="content-text">{{ selectedFeedback.contactInfo }}</div>
        </div>

        <div class="detail-section">
          <h3>评论 ({{ selectedFeedback.comments }})</h3>
          <div class="comment-placeholder">
            <t-icon name="chat" size="32px" />
            <p>暂无评论</p>
          </div>
        </div>

        <div class="detail-actions">
          <t-button
            v-if="selectedFeedback.status === 'open'"
            theme="success"
            @click="handleCloseFeedback"
          >
            <t-icon name="check-circle" />
            标记为已解决
          </t-button>
          <t-button
            v-else
            theme="default"
            @click="handleReopenFeedback"
          >
            <t-icon name="error-circle" />
            重新打开
          </t-button>
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getFeedbackList, createFeedback, updateFeedback } from '@/api/feedback'

const searchKeyword = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const sortBy = ref('newest')
const showNewFeedbackDialog = ref(false)
const showDetailDrawer = ref(false)
const selectedFeedback = ref(null)
const submitting = ref(false)
const loading = ref(false)

const newFeedback = ref({
  title: '',
  type: 'bug',
  content: '',
  contactInfo: ''
})

// 反馈数据列表
const feedbackList = ref([])
// 筛选后的列表
const filteredFeedbackList = ref([])

// 加载反馈列表
const loadFeedbackList = async () => {
  try {
    loading.value = true
    const res = await getFeedbackList()
    if (res.success) {
      feedbackList.value = res.data || []
      // 加载完成后执行一次查询
      applyFilters()
    } else {
      MessagePlugin.error(res.message || '获取反馈列表失败')
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    MessagePlugin.error('获取反馈列表失败')
  } finally {
    loading.value = false
  }
}

const openCount = computed(() => {
  return feedbackList.value.filter(f => f.status === 'open').length
})

const closedCount = computed(() => {
  return feedbackList.value.filter(f => f.status === 'closed').length
})

// 应用筛选条件
const applyFilters = () => {
  let list = feedbackList.value

  // 状态筛选
  if (filterStatus.value !== 'all') {
    list = list.filter(f => f.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value !== 'all') {
    list = list.filter(f => f.type === filterType.value)
  }

  // 搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(f =>
      f.title.toLowerCase().includes(keyword) ||
      f.content.toLowerCase().includes(keyword)
    )
  }

  // 排序
  if (sortBy.value === 'newest') {
    list = [...list].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  } else if (sortBy.value === 'oldest') {
    list = [...list].sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
  } else if (sortBy.value === 'mostCommented') {
    list = [...list].sort((a, b) => (b.comments || 0) - (a.comments || 0))
  }

  filteredFeedbackList.value = list
}

// 处理查询按钮点击
const handleSearch = () => {
  applyFilters()
}

// 处理状态筛选切换
const handleFilterStatusChange = (status) => {
  filterStatus.value = status
  applyFilters()
}

const getTypeLabel = (type) => {
  const labels = {
    bug: '问题反馈',
    feature: '功能建议',
    improvement: '改进建议',
    other: '其他'
  }
  return labels[type] || type
}

const selectFeedback = (feedback) => {
  selectedFeedback.value = feedback
  showDetailDrawer.value = true
}

const handleSubmitNew = async () => {
  if (!newFeedback.value.title) {
    MessagePlugin.warning('请填写标题')
    return
  }
  if (!newFeedback.value.content) {
    MessagePlugin.warning('请填写详细描述')
    return
  }

  submitting.value = true

  try {
    const res = await createFeedback(newFeedback.value)
    if (res.success) {
      MessagePlugin.success('反馈提交成功！')
      showNewFeedbackDialog.value = false
      handleCancelNew()
      loadFeedbackList() // 重新加载列表
    } else {
      MessagePlugin.error(res.message || '提交失败')
    }
  } catch (error) {
    console.error('提交反馈失败:', error)
    MessagePlugin.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const handleCancelNew = () => {
  newFeedback.value = {
    title: '',
    type: 'bug',
    content: '',
    contactInfo: ''
  }
}

const handleCloseFeedback = async () => {
  if (!selectedFeedback.value) return

  try {
    const res = await updateFeedback(selectedFeedback.value.id, {
      ...selectedFeedback.value,
      status: 'closed'
    })
    if (res.success) {
      selectedFeedback.value.status = 'closed'
      MessagePlugin.success('已标记为已解决')
      loadFeedbackList() // 重新加载列表
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    MessagePlugin.error('操作失败')
  }
}

const handleReopenFeedback = async () => {
  if (!selectedFeedback.value) return

  try {
    const res = await updateFeedback(selectedFeedback.value.id, {
      ...selectedFeedback.value,
      status: 'open'
    })
    if (res.success) {
      selectedFeedback.value.status = 'open'
      MessagePlugin.success('已重新打开')
      loadFeedbackList() // 重新加载列表
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    MessagePlugin.error('操作失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadFeedbackList()
})
</script>

<style scoped lang="scss">
.feedback-page {
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 1400px;
  margin: 0 auto;

  .feedback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e7e7e7;

    .header-left {
      flex: 1;
    }

    .header-right {
      margin-left: 16px;
    }
  }

  .feedback-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    border-bottom: 1px solid #e7e7e7;
    background: #fafafa;

    .filter-tabs {
      display: flex;
      gap: 4px;

      .filter-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        color: #646a73;
        transition: all 0.2s;

        .t-icon {
          color: #646a73;
        }

        .count {
          padding: 2px 6px;
          background: #e7e7e7;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        &:hover {
          background: #f5f5f5;
        }

        &.active {
          background: #fff;
          color: #1f2329;
          font-weight: 600;

          .t-icon {
            color: #1f2329;
          }

          .count {
            background: #0052d9;
            color: #fff;
          }
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 8px;
    }
  }

  .feedback-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 24px;
    border-left: 1px solid #e7e7e7;

    .feedback-item {
      border-bottom: 1px solid #e7e7e7;
      padding: 16px 0;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f5f7fa;
      }

      &.selected {
        background: #e8f4ff;
      }

      .feedback-item-header {
        display: flex;
        gap: 12px;

        .feedback-status {
          flex-shrink: 0;

          .t-icon {
            &.open {
              color: #00a870;
            }

            &.closed {
              color: #8a63d2;
            }
          }
        }

        .feedback-main {
          flex: 1;
          min-width: 0;

          .feedback-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2329;
            margin-bottom: 8px;
            line-height: 1.4;

            &:hover {
              color: #0052d9;
            }
          }

          .feedback-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            font-size: 13px;
            color: #646a73;

            .type-badge {
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;

              &.bug {
                background: #ffe8e8;
                color: #d54941;
              }

              &.feature {
                background: #e8f4ff;
                color: #0052d9;
              }

              &.improvement {
                background: #fff4e8;
                color: #e37318;
              }

              &.other {
                background: #f0f0f0;
                color: #646a73;
              }
            }

            .meta-text {
              color: #8a8e99;
            }

            .comment-count {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #646a73;
            }
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #bbb;

      .t-icon {
        color: #ddd;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
        margin: 0;
      }
    }
  }
}

.new-feedback-form {
  padding: 20px 0;

  .form-group {
    margin-bottom: 24px;

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1f2329;
      margin-bottom: 8px;

      .required {
        color: #e34d59;
      }
    }

    .form-tip {
      font-size: 12px;
      color: #8a8e99;
      margin-top: 6px;
    }

    .type-radio-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;

      :deep(.t-radio) {
        padding: 12px;
        border: 1px solid #e7e7e7;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          border-color: #0052d9;
        }

        .t-radio__label {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e7e7e7;
  }
}

.feedback-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;

      &.open {
        background: #e8fff5;
        color: #00a870;
      }

      &.closed {
        background: #f3e8ff;
        color: #8a63d2;
      }
    }

    .type-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.bug {
        background: #ffe8e8;
        color: #d54941;
      }

      &.feature {
        background: #e8f4ff;
        color: #0052d9;
      }

      &.improvement {
        background: #fff4e8;
        color: #e37318;
      }

      &.other {
        background: #f0f0f0;
        color: #646a73;
      }
    }
  }

  .detail-meta {
    font-size: 13px;
    color: #8a8e99;
    margin-bottom: 24px;
  }

  .detail-content,
  .detail-section {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
      margin: 0 0 12px 0;
    }

    .content-text {
      font-size: 14px;
      line-height: 1.6;
      color: #1f2329;
      white-space: pre-wrap;
    }

    .comment-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #bbb;
      border: 1px dashed #e7e7e7;
      border-radius: 6px;

      .t-icon {
        color: #ddd;
        margin-bottom: 12px;
      }

      p {
        font-size: 13px;
        margin: 0;
      }
    }
  }

  .detail-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e7e7e7;
  }
}
</style>
