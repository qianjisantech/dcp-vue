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
                  'is-active': !item.actions && activeMenu === item.value,
                  'has-actions': item.actions,
                  'no-click': item.actions
                }"
                @click="!item.actions && handleSecondaryMenuClick(item)"
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

          <t-form-item label="选择视图" name="selectView">
            <t-select
              v-model="viewForm.selectView"
              placeholder="请选择视图"
              clearable
            >
              <t-option value="all" label="全部视图" />
              <t-option value="my" label="我的视图" />
            </t-select>
          </t-form-item>

          <t-form-item label="视图类型" name="viewType">
            <t-select
              v-model="viewForm.viewType"
              placeholder="请选择视图类型"
              clearable
            >
              <t-option
                v-for="type in viewTypeOptions"
                :key="type.value"
                :value="type.value"
                :label="type.label"
              />
            </t-select>
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkspaceStore } from '@/store/workspace'

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

// 新建视图表单数据
const viewForm = ref({
  viewName: '',
  selectView: '',
  viewType: ''
})

// 视图类型选项
const viewTypeOptions = [
  { value: 'list', label: '列表' },
  { value: 'gantt', label: '甘特图' },
  { value: 'resource', label: '资源' },
  { value: 'board', label: '看板' },
  { value: 'calendar', label: '日历' }
]

// 菜单配置
const menuList = computed(() => [
  {
    value: 'workspace',
    label: '工作台',
    icon: 'dashboard',
    children: [
      {
        value: '/workspace/todo',
        label: `我的事项(${workspaceStore.taskCount})`,
        icon: 'task'
      },
      {
        type: 'divider'
      },
      {
        value: '/workspace/myview',
        label: '我的视图',
        actions: true // 标记有右侧操作按钮
      }
    ]
  },
  {
    value: '/space',
    label: '空间',
    icon: 'layers',
    children: null
  },
  {
    value: '/settings',
    label: '设置',
    icon: 'setting',
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
  } else if (path === '/settings') {
    activeFirstMenu.value = '/settings'
    showSecondary.value = false
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
      router.push('/workspace/todo')
      activeMenu.value = '/workspace/todo'
    }
  } else {
    // 没有子菜单，直接跳转并隐藏二级菜单
    showSecondary.value = false
    router.push(menu.value)
  }
}

// 处理二级菜单点击
const handleSecondaryMenuClick = (item) => {
  if (item.type === 'divider') return
  activeMenu.value = item.value
  router.push(item.value)
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

// 处理新建视图分组
const handleCreateViewGroup = () => {
  showAddDropdown.value = false
  console.log('新建视图分组')
  // TODO: 实现新建视图分组功能
}

// 重置视图表单
const resetViewForm = () => {
  viewForm.value = {
    viewName: '',
    selectView: '',
    viewType: ''
  }
}

// 取消新建视图
const handleCancelCreateView = () => {
  showCreateViewDialog.value = false
  resetViewForm()
}

// 提交新建视图
const handleSubmitCreateView = () => {
  if (!viewForm.value.viewName) {
    console.log('请输入视图名称')
    // TODO: 使用MessagePlugin.warning('请输入视图名称')
    return
  }
  if (!viewForm.value.viewType) {
    console.log('请选择视图类型')
    // TODO: 使用MessagePlugin.warning('请选择视图类型')
    return
  }

  console.log('创建视图:', viewForm.value)
  // TODO: 调用创建视图接口

  showCreateViewDialog.value = false
  resetViewForm()
}
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
    width: 260px;
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
    width: 260px;
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
        background: rgba(0, 82, 217, 0.1);
        color: #0052d9;

        .t-icon {
          color: #0052d9;
        }
      }
    }
  }
}

// 二级菜单栏
.secondary-menu {
  width: 180px;
  min-width: 180px;
  background: #fff;
  display: flex;
  flex-direction: column;

  .secondary-menu-list {
    flex: 1;
    padding: 12px 8px 8px 8px;
    overflow-y: auto;

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
            background: rgba(0, 82, 217, 0.1);
            color: #0052d9;
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
        background: rgba(0, 82, 217, 0.1);
        color: #0052d9;

        .t-icon {
          color: #0052d9;
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
      background: #f5f7fa;
      color: #0052d9;
    }
  }
}
</style>
