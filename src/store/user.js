import { defineStore } from 'pinia'
import { ref } from 'vue'
import Cookies from 'js-cookie'
import { login as loginApi, getPermissions as getPermissionsApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(Cookies.get('dcp_token') || '')
  const menuPermissions = ref([])
  const dataPermissions = ref(null)
  const userSpaces = ref([])

  const login = async (credentials) => {
    try {
      const res = await loginApi(credentials)
      if (res.code === 200) {
        token.value = res.data.token
        userInfo.value = res.data.user_info

        // 保存 cookie
        const expires = credentials.remember ? 7 : 1
        Cookies.set('dcp_token', res.data.token, { expires })

        return res
      } else {
        throw new Error(res.message || '登录失败')
      }
    } catch (error) {
      throw error
    }
  }

  const getPermissions = async () => {
    try {
      const res = await getPermissionsApi()
      if (res.code === 200) {
        menuPermissions.value = res.data.menu_permissions
        dataPermissions.value = res.data.data_permissions
        userSpaces.value = res.data.spaces
        return res
      } else {
        throw new Error(res.message || '获取权限失败')
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    menuPermissions.value = []
    dataPermissions.value = null
    userSpaces.value = []
    Cookies.remove('dcp_token')
  }

  // 检查是否有某个菜单权限
  const hasMenuPermission = (permission) => {
    return menuPermissions.value.includes(permission)
  }

  // 检查是否有某个空间的权限
  const hasSpacePermission = (spaceId, permission) => {
    const space = userSpaces.value.find(s => s.id === spaceId)
    return space ? space.permissions.includes(permission) : false
  }

  return {
    userInfo,
    token,
    menuPermissions,
    dataPermissions,
    userSpaces,
    login,
    getPermissions,
    logout,
    hasMenuPermission,
    hasSpacePermission
  }
})
