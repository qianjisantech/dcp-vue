import request from '@/utils/request'

/**
 * 获取公告列表（分页）
 * @param {Object} data - 分页参数
 * @param {number} data.pageNum - 页码
 * @param {number} data.pageSize - 每页条数
 * @param {string} data.type - 公告类型（可选）
 * @param {string} data.status - 公告状态（可选）
 * @returns {Promise}
 */
export function getAnnouncementList(data) {
  return request({
    url: '/announcement/page',
    method: 'post',
    data
  })
}

/**
 * 获取公告详情
 * @param {number} id - 公告ID
 * @returns {Promise}
 */
export function getAnnouncementDetail(id) {
  return request({
    url: `/announcement/${id}`,
    method: 'get'
  })
}

/**
 * 创建公告
 * @param {Object} data - 公告数据
 * @returns {Promise}
 */
export function createAnnouncement(data) {
  return request({
    url: '/announcement',
    method: 'post',
    data
  })
}

/**
 * 更新公告
 * @param {number} id - 公告ID
 * @param {Object} data - 公告数据
 * @returns {Promise}
 */
export function updateAnnouncement(id, data) {
  return request({
    url: `/announcement/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除公告
 * @param {number} id - 公告ID
 * @returns {Promise}
 */
export function deleteAnnouncement(id) {
  return request({
    url: `/announcement/${id}`,
    method: 'delete'
  })
}

/**
 * 置顶公告
 * @param {number} id - 公告ID
 * @param {boolean} isTop - 是否置顶
 * @returns {Promise}
 */
export function toggleAnnouncementTop(id, isTop) {
  return request({
    url: `/announcement/${id}/top`,
    method: 'put',
    data: { isTop }
  })
}
