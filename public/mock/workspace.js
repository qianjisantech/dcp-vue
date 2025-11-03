export default [
  {
    url: '/api/workspace/tasks',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          list: [
            {
              id: 1,
              summary: '完成需求文档撰写并提交评审',
              task_type: '需求',
              task_number: 'MOBILE-2025001',
              status: '进行中',
              priority: '高',
              assignee: '张三',
              space_id: 1,
              space_name: '移动端项目空间',
              create_time: '2025-11-01 10:30'
            },
            {
              id: 2,
              summary: '移动端登录功能开发',
              task_type: '任务',
              task_number: 'MOBILE-2025002',
              status: '待处理',
              priority: '中',
              assignee: '李四',
              space_id: 1,
              space_name: '移动端项目空间',
              create_time: '2025-11-02 09:15'
            },
            {
              id: 3,
              summary: '修复用户列表分页显示异常',
              task_type: 'bug',
              task_number: 'WEB-2025003',
              status: '已完成',
              priority: '高',
              assignee: '王五',
              space_id: 2,
              space_name: 'Web平台空间',
              create_time: '2025-10-30 14:20'
            },
            {
              id: 4,
              summary: '生产环境数据库连接超时问题排查',
              task_type: '线上问题',
              task_number: 'DATA-2025004',
              status: '进行中',
              priority: '高',
              assignee: '赵六',
              space_id: 4,
              space_name: '数据中台',
              create_time: '2025-11-01 16:45'
            },
            {
              id: 5,
              summary: '配置项目自动化部署流程',
              task_type: '任务',
              task_number: 'MICROSERVICE-2025005',
              status: '待处理',
              priority: '中',
              assignee: '孙七',
              space_id: 5,
              space_name: '微服务架构',
              create_time: '2025-11-02 11:00'
            },
            {
              id: 6,
              summary: '用户权限管理功能需求分析',
              task_type: '需求',
              task_number: 'ADMIN-2025006',
              status: '待处理',
              priority: '中',
              assignee: '张三',
              space_id: 3,
              space_name: '后台管理系统',
              create_time: '2025-11-03 09:30'
            },
            {
              id: 7,
              summary: '订单支付接口返回null异常',
              task_type: 'bug',
              task_number: 'WEB-2025007',
              status: '进行中',
              priority: '高',
              assignee: '李四',
              space_id: 2,
              space_name: 'Web平台空间',
              create_time: '2025-11-03 10:15'
            },
            {
              id: 8,
              summary: '线上服务器CPU占用过高导致响应缓慢',
              task_type: '线上问题',
              task_number: 'DATA-2025008',
              status: '待处理',
              priority: '高',
              assignee: '王五',
              space_id: 4,
              space_name: '数据中台',
              create_time: '2025-11-03 11:20'
            }
          ],
          total: 8
        }
      }
    }
  },
  {
    url: '/api/workspace/spaces',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          list: [
            {
              id: 1,
              space: '移动端项目空间',
              keywords: ['MOBILE'],
              space_type: '公开',
              space_owner: '张三',
              version_manager: '李四'
            },
            {
              id: 2,
              space: 'Web平台空间',
              keywords: ['WEB'],
              space_type: '私有',
              space_owner: '王五',
              version_manager: '赵六'
            },
            {
              id: 3,
              space: '后台管理系统',
              keywords: ['ADMIN'],
              space_type: '公开',
              space_owner: '孙七',
              version_manager: '周八'
            },
            {
              id: 4,
              space: '数据中台',
              keywords: ['DATA'],
              space_type: '私有',
              space_owner: '吴九',
              version_manager: '郑十'
            },
            {
              id: 5,
              space: '微服务架构',
              keywords: ['MICROSERVICE'],
              space_type: '公开',
              space_owner: '陈一',
              version_manager: '林二'
            }
          ],
          total: 5
        }
      }
    }
  }
]
