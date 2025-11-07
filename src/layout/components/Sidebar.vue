<template>
  <div class="sidebar-container" :class="{ 'has-secondary': showSecondary }">
    <!-- 菜单区域 -->
    <div class="sidebar-menus" :class="{ 'has-secondary': showSecondary }">
      <!-- 一级菜单栏 -->
      <div class="primary-menu">
        <div class="primary-menu-list">
          <div
            v-for="menu in menuList"
            :key="menu.value"
            class="primary-menu-item"
            :class="{
              'is-active': activeFirstMenu === menu.value,
              'has-submenu': menu.children && menu.children.length > 0
            }"
            @click="handlePrimaryMenuClick(menu)"
          >
            <t-icon :name="menu.icon" size="22px" />
            <span class="menu-label">{{ menu.label }}</span>
            <div v-if="menu.badge" class="menu-badge">{{ menu.badge }}</div>
          </div>
        </div>
      </div>

      <!-- 二级菜单栏 -->
      <transition name="slide">
        <div v-if="showSecondary" class="secondary-menu">
          <div class="secondary-menu-list">
            <template v-for="(item, index) in currentSecondaryMenu" :key="index">
              <!-- 分隔线 -->
              <div v-if="item.type === 'divider'" class="menu-divider"></div>

              <!-- 菜单项 -->
              <div
                v-else
                class="secondary-menu-item"
                :class="{
                  'is-active': !item.actions && !item.type && isMenuItemActive(item),
                  'has-actions': item.actions,
                  'no-click': item.actions,
                  'is-indent': item.indent,
                  'is-double-indent': item.doubleIndent,
                  'is-folder': item.type === 'folder'
                }"
                @click="handleItemClick(item)"
              >
                <t-icon v-if="item.icon" :name="item.icon" size="16px" />
                <span class="item-label">{{ item.label }}</span>

                <!-- 我的视图-右侧操作按钮 -->
                <div v-if="item.actions" class="item-actions" @click.stop>
                  <t-icon
                    name="search"
                    size="16px"
                    class="action-icon"
                    @click="handleSearch"
                  />
                  <t-dropdown
                    v-model:visible="showAddDropdown"
                    :min-column-width="120"
                    trigger="click"
                  >
                    <t-icon
                      name="add"
                      size="16px"
                      class="action-icon"
                    />
                    <t-dropdown-menu>
                      <t-dropdown-item @click="handleCreateView">
                        新建视图
                      </t-dropdown-item>
                      <t-dropdown-item @click="handleCreateViewGroup">
                        新建视图分组
                      </t-dropdown-item>
                    </t-dropdown-menu>
                  </t-dropdown>
                </div>
              </div>
            </template>

          </div>
        </div>
      </transition>
    </div>

    <!-- 新建视图弹窗 -->
    <t-dialog
      v-model:visible="showCreateViewDialog"
      header="新建视图"
      width="520px"
      :footer="false"
      :close-on-overlay-click="false"
    >
      <div class="create-view-form">
        <t-form :data="viewForm" label-align="left" label-width="80px">
          <t-form-item label="视图名称" name="viewName">
            <t-input
              v-model="viewForm.viewName"
              placeholder="请输入视图名称"
              clearable
            />
          </t-form-item>

          <t-form-item label="视图类型" name="viewType">
            <div class="view-type-grid">
              <div
                v-for="type in viewTypeOptions"
                :key="type.value"
                class="view-type-card"
                :class="{ 'is-selected': viewForm.viewType === type.value }"
                @click="viewForm.viewType = type.value"
              >
                <div class="view-type-icon">
                  <t-icon :name="type.icon" size="32px" />
                </div>
                <div class="view-type-label">{{ type.label }}</div>
                <div class="view-type-desc">{{ type.description }}</div>
              </div>
            </div>
          </t-form-item>
        </t-form>

        <div class="dialog-footer">
          <t-button theme="default" variant="outline" @click="handleCancelCreateView">
            取消
          </t-button>
          <t-button theme="primary" @click="handleSubmitCreateView">
            创建
          </t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 新建文件夹弹窗 -->
    <t-dialog
      v-model:visible="showCreateFolderDialog"
      header="新建文件夹"
      width="420px"
      :footer="false"
      :close-on-overlay-click="false"
    >
      <div class="create-folder-form">
        <t-form :data="folderForm" label-align="left" label-width="80px">
          <t-form-item label="文件夹名称" name="folderName">
            <t-input
              v-model="folderForm.folderName"
              placeholder="请输入文件夹名称"
              clearable
              autofocus
            />
          </t-form-item>
        </t-form>

        <div class="dialog-footer">
          <t-button theme="default" variant="outline" @click="handleCancelCreateFolder">
            取消
          </t-button>
          <t-button theme="primary" @click="handleSubmitCreateFolder">
            创建
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/store/workspace'
import { getMyViews, createView } from '@/api/workspace'
import { getChangelogList } from '@/api/changelog'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()
const route = useRoute()
const workspaceStore = useWorkspaceStore()

// 定义emit事件
const emit = defineEmits(['secondary-change'])

const activeMenu = ref(route.path)
const activeFirstMenu = ref('')
const showSecondary = ref(false)
const showAddDropdown = ref(false)
const showCreateViewDialog = ref(false)
const showCreateFolderDialog = ref(false)

// 视图数据和文件夹
const myViews = ref([])
const viewFolders = ref([])
const expandedFolders = ref(new Set()) // 展开的文件夹ID集合
const viewsLoading = ref(false)

// 新建视图表单数据
const viewForm = ref({
  viewName: '',
  viewType: ''
})

// 新建文件夹表单数据
const folderForm = ref({
  folderName: ''
})

// 发布日志数据
const changelogList = ref([])

// 加载发布日志列表
const loadChangelogList = async () => {
  try {
    const res = await getChangelogList()
    if (res.success) {
      changelogList.value = res.data || []
    } else {
      console.error('获取发布日志列表失败:', res.message)
    }
  } catch (error) {
    console.error('获取发布日志列表失败:', error)
  }
}

// 视图类型选项
const viewTypeOptions = [
  {
    value: 'list',
    label: '列表',
    icon: 'view-list',
    description: '以表格形式查看事项'
  },
  {
    value: 'gantt',
    label: '甘特图',
    icon: 'chart-bar',
    description: '时间线视图展示任务进度'
  },
  {
    value: 'resource',
    label: '资源',
    icon: 'user-circle',
    description: '按资源维度查看分配情况'
  },
  {
    value: 'board',
    label: '看板',
    icon: 'view-module',
    description: '卡片式看板拖拽管理'
  },
  {
    value: 'calendar',
    label: '日历',
    icon: 'calendar',
    description: '日历视图规划事项'
  }
]

// 生成视图菜单项（支持文件夹层级）
const generateViewMenuItems = () => {
  const items = []

  // 获取根级别的视图（没有folderId的）
  const rootViews = myViews.value.filter(view => !view.folderId)

  // 遍历文件夹
  viewFolders.value.forEach(folder => {
    // 添加文件夹项
    items.push({
      type: 'folder',
      id: folder.id,
      label: folder.name,
      icon: expandedFolders.value.has(folder.id) ? 'folder-open' : 'folder',
      indent: true,
      isExpanded: expandedFolders.value.has(folder.id)
    })

    // 如果文件夹展开，添加该文件夹下的视图
    if (expandedFolders.value.has(folder.id)) {
      const folderViews = myViews.value.filter(view => view.folderId === folder.id)
      folderViews.forEach(view => {
        items.push({
          value: '/workspace/view/my',
          query: { id: view.id },
          label: view.name,
          icon: getViewIcon(view.type),
          indent: true,
          doubleIndent: true, // 文件夹下的视图需要双重缩进
          viewId: view.id
        })
      })
    }
  })

  // 添加根级别的视图
  rootViews.forEach(view => {
    items.push({
      value: '/workspace/view/my',
      query: { id: view.id },
      label: view.name,
      icon: getViewIcon(view.type),
      indent: true,
      viewId: view.id
    })
  })

  return items
}

// 菜单配置
const menuList = computed(() => [
  {
    value: 'workspace',
    label: '工作台',
    icon: 'dashboard',
    children: [
      {
        value: '/workspace/issue',
        label: `我的事项(${workspaceStore.issueCount})`,
        icon: 'task'
      },
      {
        type: 'divider'
      },
      {
        value: '/workspace/myview',
        label: '我的视图',
        actions: true // 标记有右侧操作按钮
      },
      // 动态插入视图和文件夹
      ...generateViewMenuItems()
    ]
  },
  {
    value: '/space',
    label: '空间',
    icon: 'layers',
    children: null
  },
  {
    value: '/announcement',
    label: '公告',
    icon: 'notification',
    children: null
  },
  {
    value: '/settings',
    label: '设置',
    icon: 'setting',
    children: null
  },
  {
    value: '/feedback',
    label: '问题反馈',
    icon: 'chat',
    children: null
  },
  {
    value: '/changelog',
    label: '发布日志',
    icon: 'file-paste',
    children: changelogList.value.length > 0 ? [
      {
        value: '/changelog',
        label: '全部日志',
        icon: 'view-list'
      },
      {
        type: 'divider'
      },
      ...changelogList.value.slice(0, 5).map(log => ({
        value: '/changelog/detail',
        query: { id: log.id },
        label: `${log.version} - ${log.title}`,
        icon: 'file',
        logId: log.id
      }))
    ] : null
  },
  {
    value: '/operation-log',
    label: '操作日志',
    icon: 'history',
    children: null
  }
])

// 当前二级菜单列表
const currentSecondaryMenu = computed(() => {
  const menu = menuList.value.find(m => m.value === activeFirstMenu.value)
  return menu?.children || []
})

// 根据当前路由初始化激活状态
const initActiveMenu = (path) => {
  if (path.startsWith('/workspace')) {
    activeFirstMenu.value = 'workspace'
    showSecondary.value = true
  } else if (path === '/space') {
    activeFirstMenu.value = '/space'
    showSecondary.value = false
  } else if (path === '/announcement') {
    activeFirstMenu.value = '/announcement'
    showSecondary.value = false
  } else if (path.startsWith('/settings')) {
    activeFirstMenu.value = '/settings'
    showSecondary.value = false
  } else if (path === '/feedback') {
    activeFirstMenu.value = '/feedback'
    showSecondary.value = false
  } else if (path.startsWith('/changelog')) {
    activeFirstMenu.value = '/changelog'
    showSecondary.value = changelogList.value.length > 0
  }
}

// 初始化
initActiveMenu(route.path)

// 监听路由变化
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
  initActiveMenu(newPath)
})

// 监听二级菜单状态变化，通知父组件
watch(showSecondary, (newValue) => {
  emit('secondary-change', newValue)
}, { immediate: true })

// 处理一级菜单点击
const handlePrimaryMenuClick = (menu) => {
  activeFirstMenu.value = menu.value

  if (menu.children && menu.children.length > 0) {
    // 有子菜单，展开二级菜单
    showSecondary.value = true

    // 如果是工作台，自动跳转到我的事项
    if (menu.value === 'workspace') {
      router.push('/workspace/issue')
      activeMenu.value = '/workspace/issue'
    }
    // 如果是发布日志，自动跳转到第一个日志详情
    else if (menu.value === 'changelog' && menu.children.length > 0) {
      const firstLog = menu.children[0]
      router.push({
        path: firstLog.value,
        query: firstLog.query
      })
      activeMenu.value = firstLog.value
    }
  } else {
    // 没有子菜单，直接跳转并隐藏二级菜单
    showSecondary.value = false
    router.push(menu.value)
  }
}

// 判断菜单项是否激活
const isMenuItemActive = (item) => {
  // 如果菜单项有 viewId，说明是视图菜单项，需要匹配路径和 query 参数
  if (item.viewId) {
    return route.path === item.value && route.query.id === item.viewId
  }
  // 如果菜单项有 logId，说明是发布日志菜单项，需要匹配路径和 query 参数
  if (item.logId) {
    return route.path === item.value && route.query.id === item.logId
  }
  // 普通菜单项，只匹配路径
  return activeMenu.value === item.value
}

// 统一处理菜单项点击
const handleItemClick = (item) => {
  // 如果是文件夹，切换展开/收起状态
  if (item.type === 'folder') {
    toggleFolder(item.id)
    return
  }

  // 如果有 actions，不做任何操作
  if (item.actions) {
    return
  }

  // 普通菜单项，执行跳转
  handleSecondaryMenuClick(item)
}

// 切换文件夹展开/收起
const toggleFolder = (folderId) => {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId)
  } else {
    expandedFolders.value.add(folderId)
  }
  // 触发响应式更新
  expandedFolders.value = new Set(expandedFolders.value)
}

// 处理二级菜单点击
const handleSecondaryMenuClick = (item) => {
  if (item.type === 'divider') return

  // 如果有 query 参数，使用对象形式跳转
  if (item.query) {
    router.push({
      path: item.value,
      query: item.query
    })
  } else {
    router.push(item.value)
  }

  activeMenu.value = item.value
}

// 获取视图图标
const getViewIcon = (viewType) => {
  const iconMap = {
    list: 'view-list',
    gantt: 'chart-bar',
    resource: 'user-circle',
    board: 'view-module',
    calendar: 'calendar'
  }
  return iconMap[viewType] || 'view-list'
}

// 加载我的视图
const loadMyViews = async () => {
  try {
    viewsLoading.value = true
    const res = await getMyViews()
    if (res.success) {
      const data = res.data || []

      // 解析树形结构数据
      const folders = []
      const views = []

      data.forEach(item => {
        if (item.type === 'folder') {
          // 添加文件夹
          folders.push({
            id: item.id,
            name: item.name
          })

          // 添加文件夹下的视图
          if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
              views.push({
                id: child.id,
                name: child.name,
                type: child.type,
                folderId: item.id // 关联到父文件夹
              })
            })
          }
        } else {
          // 根级别的视图（没有文件夹）
          views.push({
            id: item.id,
            name: item.name,
            type: item.type,
            folderId: null
          })
        }
      })

      viewFolders.value = folders
      myViews.value = views

      // 默认展开所有文件夹
      folders.forEach(folder => {
        expandedFolders.value.add(folder.id)
      })
    } else {
      MessagePlugin.error(res.message || '获取视图列表失败')
    }
  } catch (error) {
    console.error('获取视图列表失败:', error)
    MessagePlugin.error('获取视图列表失败')
  } finally {
    viewsLoading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索视图')
  // TODO: 实现搜索功能
}

// 处理新建视图
const handleCreateView = () => {
  showAddDropdown.value = false
  showCreateViewDialog.value = true
}

// 处理新建视图分组（文件夹）
const handleCreateViewGroup = () => {
  showAddDropdown.value = false
  showCreateFolderDialog.value = true
}

// 重置视图表单
const resetViewForm = () => {
  viewForm.value = {
    viewName: '',
    viewType: ''
  }
}

// 重置文件夹表单
const resetFolderForm = () => {
  folderForm.value = {
    folderName: ''
  }
}

// 取消新建视图
const handleCancelCreateView = () => {
  showCreateViewDialog.value = false
  resetViewForm()
}

// 取消新建文件夹
const handleCancelCreateFolder = () => {
  showCreateFolderDialog.value = false
  resetFolderForm()
}

// 提交新建文件夹
const handleSubmitCreateFolder = async () => {
  if (!folderForm.value.folderName) {
    MessagePlugin.warning('请输入文件夹名称')
    return
  }

  try {
    // TODO: 调用创建文件夹API
    // const res = await createViewFolder({
    //   name: folderForm.value.folderName
    // })

    // 模拟创建成功
    const newFolder = {
      id: 'folder_' + Date.now(),
      name: folderForm.value.folderName,
      createdAt: new Date().toISOString()
    }

    viewFolders.value.push(newFolder)
    MessagePlugin.success('创建文件夹成功')
    showCreateFolderDialog.value = false
    resetFolderForm()
  } catch (error) {
    console.error('创建文件夹失败:', error)
    MessagePlugin.error('创建文件夹失败')
  }
}

// 提交新建视图
const handleSubmitCreateView = async () => {
  if (!viewForm.value.viewName) {
    MessagePlugin.warning('请输入视图名称')
    return
  }
  if (!viewForm.value.viewType) {
    MessagePlugin.warning('请选择视图类型')
    return
  }

  try {
    const res = await createView({
      name: viewForm.value.viewName,
      type: viewForm.value.viewType,
      config: {}
    })

    if (res.success) {
      MessagePlugin.success('视图创建成功')
      showCreateViewDialog.value = false
      resetViewForm()
      // 刷新视图列表
      loadMyViews()
    } else {
      MessagePlugin.error(res.message || '创建视图失败')
    }
  } catch (error) {
    console.error('创建视图失败:', error)
    MessagePlugin.error('创建视图失败')
  }
}

// 组件挂载时加载视图列表
onMounted(() => {
  loadMyViews()
  loadChangelogList()
})
</script>

<style scoped lang="scss">
// 侧边栏容器
.sidebar-container {
  position: fixed;
  left: 0;
  top: 64px; // 从Header下方开始
  bottom: 0;
  z-index: 99;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e7e7e7;
  width: 80px;
  transition: width 0.3s ease;

  &.has-secondary {
    width: 320px;
  }
}

// 菜单区域
.sidebar-menus {
  flex: 1;
  display: flex;
  overflow: hidden;
  transition: width 0.3s ease;
  max-height: calc(100vh - 64px); // 限制最大高度，减去Header高度
  box-sizing: border-box;

  &:not(.has-secondary) {
    width: 80px;
  }

  &.has-secondary {
    width: 320px;
  }
}

// 一级菜单栏
.primary-menu {
  width: 80px;
  min-width: 80px;
  background: #fff;
  display: flex;
  flex-direction: column;

  // 有二级菜单时添加右边框
  .sidebar-menus.has-secondary & {
    border-right: 1px solid #e7e7e7;
  }

  .primary-menu-list {
    flex: 1;
    padding: 8px 6px;
    overflow-y: auto;

    .primary-menu-item {
      position: relative;
      min-height: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 8px;
      padding: 8px 4px;
      border-radius: 6px;
      cursor: pointer;
      color: #646a73;
      transition: all 0.3s;

      .t-icon {
        color: #646a73;
        flex-shrink: 0;
      }

      .menu-label {
        font-size: 12px;
        text-align: center;
        line-height: 1.2;
        word-break: break-all;
      }

      .menu-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #e34d59;
        color: #fff;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 8px;
        min-width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      &:hover {
        background: #f5f7fa;
        color: #1f2329;

        .t-icon {
          color: #1f2329;
        }
      }

      &.is-active {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;

        .t-icon {
          color: #667eea;
        }
      }
    }
  }
}

// 二级菜单栏
.secondary-menu {
  width: 240px;
  min-width: 240px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e7e7e7;

  .secondary-menu-list {
    flex: 1;
    padding: 12px 8px 8px 8px;
    overflow-y: auto;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 3px;

      &:hover {
        background: #bbb;
      }
    }

    .menu-divider {
      height: 1px;
      background: #e7e7e7;
      margin: 8px 0;
    }

    .secondary-menu-item {
      height: 36px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      margin-bottom: 4px;
      border-radius: 4px;
      cursor: pointer;
      color: #646a73;
      transition: all 0.3s;
      position: relative;

      .t-icon {
        color: #646a73;
        flex-shrink: 0;
      }

      .item-label {
        font-size: 13px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      // 缩进的菜单项（视图列表和文件夹）
      &.is-indent {
        padding-left: 32px;
        font-size: 13px;

        .t-icon {
          font-size: 14px;
        }
      }

      // 双重缩进（文件夹内的视图）
      &.is-double-indent {
        padding-left: 52px;
        font-size: 13px;

        .t-icon {
          font-size: 14px;
        }
      }

      // 文件夹样式
      &.is-folder {
        font-weight: 500;

        .t-icon {
          color: #667eea;
        }
      }

      // 不可点击的菜单项
      &.no-click {
        cursor: default;

        &:hover {
          background: transparent;
        }
      }

      // 右侧操作按钮
      .item-actions {
        display: flex;
        align-items: center;
        gap: 4px;

        .action-icon {
          color: #646a73;
          cursor: pointer;
          padding: 2px;
          border-radius: 2px;
          transition: all 0.2s;

          &:hover {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }
        }
      }

      &:hover {
        background: #f5f7fa;
        color: #1f2329;

        .t-icon {
          color: #1f2329;
        }
      }

      &.is-active {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;

        .t-icon {
          color: #667eea;
        }
      }

      // 有操作按钮的菜单项，左侧留出更多空间
      &.has-actions {
        .item-label {
          padding-left: 8px;
        }
      }
    }
  }
}

// 滑动动画
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

// 新建视图弹窗样式
.create-view-form {
  padding: 20px 0;

  :deep(.t-form) {
    .t-form-item {
      margin-bottom: 24px;
    }
  }

  .view-type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .view-type-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 12px;
      border: 2px solid #e7e7e7;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fff;

      &:hover {
        border-color: #667eea;
        background-color: #f5f2ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      &.is-selected {
        border-color: #667eea;
        background-color: #ede9fe;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);

        .view-type-icon {
          color: #667eea;
        }

        .view-type-label {
          color: #667eea;
          font-weight: 600;
        }
      }

      .view-type-icon {
        margin-bottom: 12px;
        color: #646a73;
        transition: color 0.3s ease;
      }

      .view-type-label {
        font-size: 15px;
        font-weight: 500;
        color: #1f2329;
        margin-bottom: 6px;
        transition: all 0.3s ease;
      }

      .view-type-desc {
        font-size: 12px;
        color: #8a8e99;
        text-align: center;
        line-height: 1.4;
      }
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
</style>

<style lang="scss">
// 下拉菜单全局样式
.t-dropdown__menu {
  .t-dropdown__item {
    padding: 8px 16px;
    font-size: 13px;
    color: #646a73;
    cursor: pointer;

    &:hover {
      background: #f5f2ff;
      color: #667eea;
    }
  }
}
</style>
