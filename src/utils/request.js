import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
import Cookies from 'js-cookie'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = Cookies.get('dcp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    MessagePlugin.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request
