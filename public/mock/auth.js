export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body

      if (username === 'admin' && password === 'admin123') {
        return {
          code: 200,
          message: 'success',
          data: {
            token: 'mock-token-' + Date.now(),
            user_info: {
              id: 1,
              username: 'admin',
              name: 'Administrator',
              avatar: 'https://tdesign.gtimg.com/site/avatar.jpg'
            }
          }
        }
      }

      return {
        code: 1001,
        message: 'Invalid username or password',
        data: null
      }
    }
  },
  {
    url: '/api/auth/userinfo',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          id: 1,
          username: 'admin',
          name: 'Administrator',
          avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
          email: 'admin@example.com',
          roles: ['admin']
        }
      }
    }
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => {
      return {
        code: 200,
        message: 'Logout successful',
        data: null
      }
    }
  },
  {
    url: '/api/auth/permissions',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          // 菜单权限
          menu_permissions: [
            'workspace',
            'workspace:my-tasks',
            'workspace:create',
            'workspace:edit',
            'workspace:delete',
            'space',
            'space:create',
            'space:edit',
            'space:settings',
            'settings',
            'view',
            'view:calendar',
            'view:gantt'
          ],
          // 数据权限
          data_permissions: {
            can_view_all: true,          // 是否可以查看所有数据
            can_edit_all: false,         // 是否可以编辑所有数据
            can_delete_all: false,       // 是否可以删除所有数据
            owned_spaces: ['mobile', 'web', 'backend'],  // 拥有的空间ID列表
            managed_spaces: ['mobile'],  // 管理的空间ID列表
            allowed_task_types: ['需求', '开发', '设计', '测试', '文档']  // 允许的任务类型
          },
          // 用户所拥有的空间
          spaces: [
            {
              id: 'mobile',
              name: '移动端项目空间',
              role: 'owner',  // owner: 负责人, manager: 管理员, member: 成员
              permissions: ['view', 'create', 'edit', 'delete', 'manage']
            },
            {
              id: 'web',
              name: 'Web平台空间',
              role: 'manager',
              permissions: ['view', 'create', 'edit', 'delete']
            },
            {
              id: 'backend',
              name: '后台管理系统',
              role: 'member',
              permissions: ['view', 'create', 'edit']
            }
          ]
        }
      }
    }
  }
]
