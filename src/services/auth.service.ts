import type { UserInfo } from '@/types'
import { api } from '@/lib/request'
import { generateRandomID } from '@/lib/utils'

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: UserInfo
}

export const authService = {
  /**
   * 获取当前用户信息
   */
  getUserInfo: () => api.get<UserInfo>('/oauth/get_user_info'),

  /**
   * 跳转到 tccommon 登录页面， 复用 falcon
   */
  login: () => {
    const auth_domain = location.host.includes('.t') ? 'tccommon.t.17usoft.com' : 'tccommon.17usoft.com'
    const client_id = location.host.includes('.t') ? 'hopegoo.falcon.web.t' : 'hopegoo.falcon.web'
    const redirect_uri = encodeURIComponent(location.origin + '/falcon/oauth/authorization_code_callback')
    const return_url = encodeURIComponent(location.href)
    const state = generateRandomID(32)
    window.location.href = `https://${auth_domain}/oauth/authorize?response_type=code&scope=read&grant_type=authorization_code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}&return_uri=${return_url}`
  },

  /**
   * 处理 OAuth 回调
   */
  handleOAuthCallback: (code: string, state?: string, return_uri?: string) =>
    api.get<LoginResponse>('/oauth/authorization_code_callback', {
      params: { code, state, return_uri },
    }),

  /**
   * 退出登录
   */
  logout: () => api.get('/oauth/logout'),
}
