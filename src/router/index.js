import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'

const routes = [
  {
    path: '/',
    redirect: '/workspace/issue'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
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
        path: 'workspace/issue',
        name: 'WorkspaceIssue',
        component: () => import('@/views/workspace/Issue.vue'),
        meta: { title: '我的事项', requiresAuth: true }
      },
      {
        path: 'workspace/view/my',
        name: 'MyView',
        component: () => import('@/views/workspace/MyView.vue'),
        meta: { title: '我的视图', requiresAuth: true }
      },
      {
        path: 'space',
        name: 'Space',
        component: () => import('@/views/Space.vue'),
        meta: { title: '空间', requiresAuth: true }
      },
      {
        path: 'announcement',
        name: 'Announcement',
        component: () => import('@/views/Announcement.vue'),
        meta: { title: '公告', requiresAuth: true }
      },
      {
        path: 'settings',
        redirect: '/settings/account'
      },
      {
        path: 'settings/:type',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '设置', requiresAuth: true }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/Feedback.vue'),
        meta: { title: '反馈', requiresAuth: true }
      },
      {
        path: 'changelog',
        name: 'Changelog',
        component: () => import('@/views/Changelog.vue'),
        meta: { title: '发布日志', requiresAuth: true }
      },
      {
        path: 'changelog/detail',
        name: 'ChangelogDetail',
        component: () => import('@/views/changelog/Detail.vue'),
        meta: { title: '发布日志详情', requiresAuth: true }
      },
      {
        path: 'operation-log',
        name: 'OperationLog',
        component: () => import('@/views/OperationLog.vue'),
        meta: { title: '操作日志', requiresAuth: true }
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
    next('/workspace/issue')
  } else {
    next()
  }
})

export default router
