import request from '@/utils/request'

/**
 * 获取反馈列表（不分页）
 */
export function getFeedbackList() {
  return request({
    url: '/feedback/list',
    method: 'get'
  })
}

/**
 * 分页查询反馈
 * @param {Object} params - 查询参数
 * @param {number} params.current - 当前页码
 * @param {number} params.size - 每页大小
 * @param {string} params.type - 反馈类型
 * @param {string} params.status - 处理状态
 * @param {string} params.keyword - 关键词搜索
 */
export function getFeedbackPage(params) {
  return request({
    url: '/feedback/page',
    method: 'post',
    data: params
  })
}

/**
 * 根据ID获取反馈详情
 * @param {number} id - 反馈ID
 */
export function getFeedbackById(id) {
  return request({
    url: `/feedback/${id}`,
    method: 'get'
  })
}

/**
 * 创建反馈
 * @param {Object} data - 反馈数据
 * @param {string} data.type - 反馈类型
 * @param {string} data.title - 反馈标题
 * @param {string} data.content - 反馈内容
 * @param {string} data.contactInfo - 联系方式
 */
export function createFeedback(data) {
  return request({
    url: '/feedback',
    method: 'post',
    data
  })
}

/**
 * 更新反馈
 * @param {number} id - 反馈ID
 * @param {Object} data - 反馈数据
 */
export function updateFeedback(id, data) {
  return request({
    url: `/feedback/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除反馈
 * @param {number} id - 反馈ID
 */
export function deleteFeedback(id) {
  return request({
    url: `/feedback/${id}`,
    method: 'delete'
  })
}
