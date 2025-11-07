<template>
  <div class="header-container">
    <div class="header-left">
      <!-- Logo区域 -->
      <div class="header-logo">
        <t-icon name="folder" size="32px" />
        <span class="logo-text">需求管控平台</span>
      </div>
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>

    <!-- 滚动通知 -->
    <div class="notice-wrapper">
      <t-icon name="notification" size="18px" class="notice-icon" />
      <div class="notice-scroll">
        <div class="notice-content">
          <span v-for="(notice, index) in notices" :key="index" class="notice-item">
            {{ notice.content }}
          </span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <div class="search-wrapper" :class="{ 'search-focused': searchFocused }">
        <t-input
          v-model="searchIssueNumber"
          placeholder="搜索事项单号或者概要"
          clearable
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keyup.enter="handleSearch"
          class="search-input"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
      </div>

      <t-button theme="primary" size="medium" @click="handleCreate">
        <template #icon>
          <t-icon name="add" />
        </template>
        新增
      </t-button>

      <t-dropdown :min-column-width="100">
        <div class="user-info">
          <t-avatar size="32px">{{ userInitial }}</t-avatar>
          <span class="username">{{ username }}</span>
          <t-icon name="chevron-down" size="16px" />
        </div>
        <t-dropdown-menu>
          <t-dropdown-item @click="handleUserCenter">
            个人中心
          </t-dropdown-item>
          <t-dropdown-item divider />
          <t-dropdown-item @click="handleLogout">
            退出登录
          </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div>

    <!-- 新建事项弹窗 -->
    <t-dialog
      v-model:visible="showCreateDialog"
      header="新建"
      width="800px"
      :footer="false"
      :close-on-overlay-click="false"
      class="create-task-dialog"
    >
      <div class="create-task-form">
        <t-form :data="taskForm" label-align="left" label-width="80px">
          <t-form-item label="空间" name="spaceId">
            <t-select
              v-model="taskForm.spaceId"
              placeholder="请选择空间"
              clearable
            >
              <t-option
                v-for="space in spaceOptions"
                :key="space.value"
                :value="space.value"
                :label="space.label"
              />
            </t-select>
          </t-form-item>

          <t-form-item label="事项类型" name="issueType">
            <t-select
              v-model="taskForm.issueType"
              placeholder="请选择事项类型"
              clearable
            >
              <t-option
                v-for="type in taskTypeOptions"
                :key="type.value"
                :value="type.value"
                :label="type.label"
              />
            </t-select>
          </t-form-item>

          <t-form-item label="概要" name="summary">
            <t-input
              v-model="taskForm.summary"
              placeholder="请输入概要"
              clearable
            />
          </t-form-item>

          <t-form-item label="标签" name="tags">
            <t-tag-input
              v-model="taskForm.tags"
              placeholder="请输入标签，按回车确认"
              clearable
            />
          </t-form-item>

          <t-form-item label="描述" name="description">
            <t-textarea
              v-model="taskForm.description"
              placeholder="请输入描述"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </t-form-item>

          <t-form-item label="优先级" name="priority">
            <t-select
              v-model="taskForm.priority"
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
          <t-button theme="default" variant="outline" @click="handleCancel">
            取消
          </t-button>
          <t-button theme="default" @click="handleCreateAndNext">
            提交并创建下一个
          </t-button>
          <t-button theme="primary" @click="handleSubmit">
            创建
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useWorkspaceStore } from '@/store/workspace'
import { MessagePlugin } from 'tdesign-vue-next'
import { getBannerNotifications } from '@/api/notification'
import { createIssue } from '@/api/workspace'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()

const username = ref('Admin')
const searchIssueNumber = ref('')
const searchFocused = ref(false)
const showCreateDialog = ref(false)

// 通知数据
const notices = ref([])

// 表单数据
const taskForm = ref({
  spaceId: '',
  issueType: '',
  summary: '',
  tags: [],
  description: '',
  priority: ''
})

// 空间选项（从用户store中获取）
const spaceOptions = computed(() => {
  if (!userStore.userSpaces || !Array.isArray(userStore.userSpaces)) {
    return []
  }
  return userStore.userSpaces.map(space => ({
    value: space.id,
    label: space.name
  }))
})

// 任务类型选项
const taskTypeOptions = ref([
  { value: '任务', label: '任务' },
  { value: 'bug', label: 'bug' },
  { value: '需求', label: '需求' },
  { value: '线上问题', label: '线上问题' }
])

// 优先级选项
const priorityOptions = ref([
  { value: '高', label: '高' },
  { value: '中', label: '中' },
  { value: '低', label: '低' }
])

// 页面标题映射
const pageTitleMap = {
  // 工作台
  '/workspace/issue': '我的事项',
  '/workspace/myview': '我的视图',
  // 其他一级菜单
  '/space': '空间',
  '/announcement': '公告'
}

// 设置页面标题特殊处理
const getSettingsTitle = (path) => {
  const settingsTitles = {
    '/settings/account': '账号设置',
    '/settings/notification': '通知设置',
    '/settings/privacy': '隐私设置',
    '/settings/system-basic': '基础设置',
    '/settings/system-advanced': '高级设置',
    '/settings/security-password': '密码管理',
    '/settings/security-auth': '双重认证',
    '/settings/security-log': '登录日志'
  }
  return settingsTitles[path] || '设置'
}

const pageTitle = computed(() => {
  // 如果是设置页面，使用特殊处理
  if (route.path.startsWith('/settings')) {
    return getSettingsTitle(route.path)
  }
  return pageTitleMap[route.path] || '工作台'
})

const userInitial = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

// 获取滚动通知
const fetchBannerNotifications = async () => {
  try {
    const res = await getBannerNotifications()
    if (res.success) {
      notices.value = res.data.list
    }
  } catch (error) {
    console.error('获取通知失败:', error)
  }
}

// 组件挂载时获取通知
onMounted(() => {
  fetchBannerNotifications()
})

const handleUserCenter = () => {
  MessagePlugin.info('个人中心功能开发中')
}

const handleLogout = () => {
  userStore.logout()
  MessagePlugin.success('已退出登录')
  router.push('/login')
}

const handleSearch = () => {
  if (!searchIssueNumber.value.trim()) {
    MessagePlugin.warning('请输入搜索内容')
    return
  }
  // 将搜索内容存储到store中，Workspace组件会监听并进行筛选
  workspaceStore.setSearchIssueNumber(searchIssueNumber.value)

  // 如果不在工作台页面，则跳转到工作台
  if (route.path !== '/workspace/issue') {
    router.push('/workspace/issue')
  }

  MessagePlugin.success(`搜索: ${searchIssueNumber.value}`)
}

const handleCreate = () => {
  showCreateDialog.value = true
}

// 重置表单
const resetForm = () => {
  taskForm.value = {
    spaceId: '',
    issueType: '',
    summary: '',
    tags: [],
    description: '',
    priority: ''
  }
}

// 取消
const handleCancel = () => {
  showCreateDialog.value = false
  resetForm()
}

// 提交并创建下一个
const handleCreateAndNext = async () => {
  if (!taskForm.value.summary) {
    MessagePlugin.warning('请输入概要')
    return
  }
  if (!taskForm.value.spaceId) {
    MessagePlugin.warning('请选择空间')
    return
  }

  try {
    // 将tags数组转换为逗号分隔的字符串
    const submitData = {
      ...taskForm.value,
      tags: Array.isArray(taskForm.value.tags) ? taskForm.value.tags.join(',') : taskForm.value.tags
    }

    const res = await createIssue(submitData)
    if (res.success || res.code === 200) {
      MessagePlugin.success('创建成功')
      resetForm()
      // 刷新事项列表
      workspaceStore.refreshIssueList()
      // 保持弹窗打开，继续创建下一个
    } else {
      MessagePlugin.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建事项失败:', error)
    MessagePlugin.error('创建失败，请重试')
  }
}

// 创建
const handleSubmit = async () => {
  if (!taskForm.value.summary) {
    MessagePlugin.warning('请输入概要')
    return
  }
  if (!taskForm.value.spaceId) {
    MessagePlugin.warning('请选择空间')
    return
  }

  try {
    // 将tags数组转换为逗号分隔的字符串
    const submitData = {
      ...taskForm.value,
      tags: Array.isArray(taskForm.value.tags) ? taskForm.value.tags.join(',') : taskForm.value.tags
    }

    const res = await createIssue(submitData)
    if (res.success || res.code === 200) {
      MessagePlugin.success('创建成功')
      showCreateDialog.value = false
      resetForm()
      // 刷新事项列表
      workspaceStore.refreshIssueList()
    } else {
      MessagePlugin.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建事项失败:', error)
    MessagePlugin.error('创建失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  min-height: 64px;
  background: #fff;
  border-bottom: 1px solid #e7e7e7;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;

    .header-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-right: 24px;
      border-right: 1px solid #e7e7e7;

      .t-icon {
        color: #0052d9;
        flex-shrink: 0;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        white-space: nowrap;
        color: #000;
      }
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin: 0;
    }
  }

  .notice-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #e8f4ff 0%, #d6ebff 100%);
    border-radius: 6px;
    padding: 8px 12px;
    width: 380px;
    overflow: hidden;
    margin-left: auto;
    margin-right: 94px;

    .notice-icon {
      color: #0052d9;
      flex-shrink: 0;
    }

    .notice-scroll {
      flex: 1;
      overflow: hidden;
      position: relative;
      height: 20px;

      .notice-content {
        display: flex;
        white-space: nowrap;
        animation: scrollNotice 30s linear infinite;

        .notice-item {
          font-size: 13px;
          color: #0052d9;
          margin-right: 80px;
          display: inline-block;

          &::before {
            content: '●';
            margin-right: 8px;
            font-size: 8px;
            vertical-align: middle;
          }
        }
      }

      &:hover .notice-content {
        animation-play-state: paused;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .search-wrapper {
      width: 200px;
      transition: all 0.3s ease;

      &.search-focused {
        width: 300px;

        .search-input {
          border-color: #0052d9;
        }
      }

      .search-input {
        transition: all 0.3s ease;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: #000;
      }

      .t-icon {
        color: #646a73;
      }
    }
  }
}

:deep(.t-dropdown__menu) {
  padding: 4px 0;

  .t-dropdown__item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    font-size: 14px;
    color: #646a73;
    text-align: center;

    &:hover {
      background: #f5f7fa;
      color: #0052d9;
    }
  }
}

// 新建事项弹窗样式
:deep(.create-task-dialog) {
  .t-dialog__header {
    text-align: center !important;

    .t-dialog__header-content {
      text-align: center !important;
      justify-content: center !important;
    }
  }
}

.create-task-form {
  padding: 20px 0;

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

// 通知滚动动画
@keyframes scrollNotice {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
