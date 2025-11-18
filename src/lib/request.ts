/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

import { toast } from 'sonner'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/hgappcenrer/api',
  timeout: 30000,
  withCredentials: true, // 启用 cookie 传输
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 不再需要手动设置 Authorization header，因为使用 cookie 认证
    // 如果需要同时支持 header 和 cookie，可以保留此逻辑
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response
    // 如果后端返回的是标准格式 { code, message, data }
    if (data.code !== undefined) {
      if (data.code === 0 || data.code === 200) {
        return data.data
      } else {
        // toast.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    // 否则直接返回 data
    return data
  },
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message || error.message || '请求失败'

    // 根据状态码处理不同的错误
    if (error.response?.status === 401) {
      console.error('401 未授权，请重新登录')
      localStorage.removeItem('token')
      // window.location.href = '/login'
    } else if (error.response?.status === 403) {
      console.error('403 没有权限访问')
    } else if (error.response?.status === 404) {
      console.error('404 请求的接口不存在')
    } else if (error.response?.status === 500) {
      console.error('500 服务器错误')
    } else {
      console.error(message)
    }

    return Promise.reject(error)
  }
)

export default request

// 类型安全的请求方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request.get<any, T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request.post<any, T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request.put<any, T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request.delete<any, T>(url, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request.patch<any, T>(url, data, config),
}

