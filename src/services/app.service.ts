import type {
  App,
  AppMember,
  CreateAppDto,
  ListParams,
  PaginatedResponse
} from '@/types'

import { api } from '@/lib/request'

export const appService = {
  // 获取应用列表
  getApps: (params?: ListParams) =>
    api.get<PaginatedResponse<App>>('/apps', { params }),

  // 获取应用统计
  getStats: () =>
    api.get<{ total: number }>('/apps/stats'),

  // 获取应用详情
  getAppById: (id: string) =>
    api.get<App>(`/apps/${id}`),

  // 创建应用
  createApp: (data: CreateAppDto) =>
    api.post<App>('/apps/create', data),

  // 更新应用
  updateApp: (id: string, data: Partial<CreateAppDto>) =>
    api.put<App>(`/apps/${id}`, data),

  // 删除应用
  deleteApp: (id: string) =>
    api.delete(`/apps/${id}`),

  // 获取应用成员列表
  getAppMembers: (appId: string, params?: ListParams) =>
    api.get<PaginatedResponse<AppMember>>(`/apps/${appId}/members`, { params }),

  // 添加应用成员
  addAppMember: (appId: string, data: { userEmail: string; role: string; regions: string[] }) =>
    api.post<AppMember>(`/apps/${appId}/members`, data),

  // 更新成员角色
  updateMemberRole: (appId: string, memberId: string, data: { role?: string; regions?: string[] }) =>
    api.put<AppMember>(`/apps/${appId}/members/${memberId}`, data),

  // 获取当前用户的成员信息
  getMyMembership: (appId: string) =>
    api.get<AppMember>(`/apps/${appId}/members/me`),

  // 移除应用成员
  removeAppMember: (appId: string, memberId: string) =>
    api.delete(`/apps/${appId}/members/${memberId}`),
}
