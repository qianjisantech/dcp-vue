import request from '@/utils/request'

export function getIssueList(data) {
  return request({
    url: '/workspace/issue/page',
    method: 'post',
    data
  })
}

export function getSpaceList(data) {
  return request({
    url: '/space/page',
    method: 'post',
    data
  })
}

/**
 * 创建事项
 * @param {object} data - 事项数据
 * @returns {Promise}
 */
export function createIssue(data) {
  return request({
    url: '/workspace/issue',
    method: 'post',
    data
  })
}

/**
 * 更新事项
 * @param {string} id - 事项ID
 * @param {object} data - 事项数据
 * @returns {Promise}
 */
export function updateIssue(id, data) {
  return request({
    url: `/workspace/issue/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除事项
 * @param {string} id - 事项ID
 * @returns {Promise}
 */
export function deleteIssue(id) {
  return request({
    url: `/workspace/issue/${id}`,
    method: 'delete'
  })
}

/**
 * 获取事项详情
 * @param {string} id - 事项ID
 * @returns {Promise}
 */
export function getIssueDetail(id) {
  return request({
    url: `/workspace/issue/${id}`,
    method: 'get'
  })
}

/**
 * 获取我的视图列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export function getMyViews(params) {
  return request({
    url: '/workspace/view/list',
    method: 'get',
    params
  })
}

/**
 * 创建视图
 * @param {object} data - 视图数据
 * @returns {Promise}
 */
export function createView(data) {
  return request({
    url: '/workspace/view',
    method: 'post',
    data
  })
}

/**
 * 更新视图
 * @param {string} id - 视图ID
 * @param {object} data - 视图数据
 * @returns {Promise}
 */
export function updateView(id, data) {
  return request({
    url: `/workspace/view/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除视图
 * @param {string} id - 视图ID
 * @returns {Promise}
 */
export function deleteView(id) {
  return request({
    url: `/workspace/view/${id}`,
    method: 'delete'
  })
}

/**
 * 获取视图详情
 * @param {string} id - 视图ID
 * @returns {Promise}
 */
export function getViewDetail(id) {
  return request({
    url: `/workspace/view/${id}`,
    method: 'get'
  })
}
