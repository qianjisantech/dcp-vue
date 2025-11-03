import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'

const routes = [
  {
    path: '/',
    redirect: '/workspace/todo'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      // 我的视图相关路由
      {
        path: 'view/calendar',
        name: 'ViewCalendar',
        component: () => import('@/views/Gantt.vue'),
        meta: { title: '日历看板', requiresAuth: true }
      },
      {
        path: 'view/gantt',
        name: 'ViewGantt',
        component: () => import('@/views/Gantt.vue'),
        meta: { title: '甘特图看板', requiresAuth: true }
      },
      // 工作台路由
      {
        path: 'workspace/todo',
        name: 'WorkspaceTodo',
        component: () => import('@/views/Workspace.vue'),
        meta: { title: '我的事项', requiresAuth: true }
      },
      {
        path: 'space',
        name: 'Space',
        component: () => import('@/views/Space.vue'),
        meta: { title: '空间', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '设置', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = Cookies.get('dcp_token')

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 需求管理平台` : '需求管理平台'

  // 如果需要认证且没有 token，跳转到登录页
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && token) {
    // 如果已登录访问登录页，跳转到我的事项
    next('/workspace/todo')
  } else {
    next()
  }
})

export default router
