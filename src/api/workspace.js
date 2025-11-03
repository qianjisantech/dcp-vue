import request from '@/utils/request'

export function getTaskList(params) {
  return request({
    url: '/workspace/tasks',
    method: 'get',
    params
  })
}

export function getSpaceList(params) {
  return request({
    url: '/workspace/spaces',
    method: 'get',
    params
  })
}
