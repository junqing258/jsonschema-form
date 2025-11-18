import type { UserInfo } from './index'

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: UserInfo
}

export interface OAuthCallbackParams {
  code: string
  state?: string
  return_uri?: string
}

