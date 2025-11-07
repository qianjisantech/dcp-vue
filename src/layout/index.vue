<template>
  <div class="layout-container">
    <!-- 顶部Header区域 -->
    <Header />

    <!-- 下方内容区域 -->
    <div class="layout-body">
      <Sidebar @secondary-change="handleSecondaryChange" />
      <div class="layout-main" :style="{ marginLeft: sidebarWidth }">
        <div class="layout-content">
          <router-view />
        </div>
      </div>
    </div>

    <!-- 系统更新提醒 -->
    <UpdateNotification ref="updateNotificationRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import UpdateNotification from '@/components/UpdateNotification.vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const route = useRoute()
const updateNotificationRef = ref(null)

// 二级菜单展开状态
const hasSecondary = ref(false)

// 处理二级菜单状态变化
const handleSecondaryChange = (isShow) => {
  hasSecondary.value = isShow
}

// 根据二级菜单状态动态计算内容区域的左边距
const sidebarWidth = computed(() => {
  return hasSecondary.value ? '320px' : '80px'
})

// 组件挂载时获取用户权限
onMounted(async () => {
  try {
    await userStore.getPermissions()
    console.log('用户权限加载成功')
  } catch (error) {
    console.error('获取用户权限失败:', error)
  }
})
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: #fff;
  position: relative;

  // 下方内容区域（Sidebar + Main）
  .layout-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 64px; // 为顶部Header预留空间
  }

  .layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0; // 防止flex子项溢出
    transition: margin-left 0.3s ease; // 平滑过渡

    .layout-content {
      flex: 1;
      padding: 0; // 移除内边距，让内容紧贴菜单栏
      overflow-y: auto;
      background: #fff;
    }
  }
}
</style>
