import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
import Cookies from 'js-cookie'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 获取客户端IP地址
let clientIP = 'auto-detect'

/**
 * 获取客户端真实IP地址
 * 尝试多种方式获取用户浏览器的真实公网IP
 */
const fetchClientIP = async () => {
  if (clientIP && clientIP !== 'auto-detect') {
    return clientIP
  }

  // 尝试多个IP查询服务，提高成功率
  const ipServices = [
    { url: 'https://api.ipify.org?format=json', key: 'ip' },
    { url: 'https://api64.ipify.org?format=json', key: 'ip' },
    { url: 'https://ipapi.co/json/', key: 'ip' },
    { url: 'https://api.myip.com', key: 'ip' }
  ]

  for (const service of ipServices) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时

      const response = await fetch(service.url, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const ip = data[service.key]

        if (ip && ip !== 'undefined') {
          clientIP = ip
          console.log('✅ 获取客户端IP成功:', clientIP, '(来源:', service.url, ')')
          return clientIP
        }
      }
    } catch (error) {
      console.warn('⚠️ IP服务失败:', service.url, error.message)
      continue
    }
  }

  // 所有服务都失败，让后端自动识别
  console.warn('⚠️ 前端无法获取IP，将由后端自动识别')
  clientIP = 'auto-detect'
  return clientIP
}

// 初始化时尝试获取IP
fetchClientIP()

request.interceptors.request.use(
  async (config) => {
    // 添加Token
    const token = Cookies.get('dcp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加客户端IP到请求头
    // 如果IP还未获取或为默认值，尝试重新获取
    if (!clientIP || clientIP === 'auto-detect') {
      await fetchClientIP()
    }

    // 设置IP请求头（即使是auto-detect，后端也会自动识别）
    config.headers['X-Client-IP'] = clientIP

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
