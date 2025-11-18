import type {
  ApprovalRequest,
  Block,
  BlockVersion,
  CreateBlockDto,
  CreateBlockVersionDto,
  ListParams,
  PaginatedResponse,
} from '@/types'

import { api } from '@/lib/request'
import { useUserStore } from '@/stores/user.store'

export const blockService = {
  // 获取区块列表
  getBlocks: (params?: ListParams & { appId?: string; status?: string; type?: string; category?: string }) =>
    api.get<PaginatedResponse<Block>>('/blocks', { params }),

  // 获取区块统计
  getStats: () =>
    api.get<{ total: number }>('/blocks/stats'),

  // 获取所有区块分类
  getCategories: () =>
    api.get<string[]>('/blocks/categories/list'),

  // 获取区块详情
  getBlockById: (id: string) =>
    api.get<Block>(`/blocks/${id}`),

  // 创建区块
  createBlock: (data: CreateBlockDto) =>
    api.post<Block>('/blocks', data),

  // 更新区块
  updateBlock: (id: string, data: Partial<CreateBlockDto>) =>
    api.put<Block>(`/blocks/${id}`, data),

  // 删除区块
  deleteBlock: (id: string) =>
    api.delete(`/blocks/${id}`),

  // 获取区块版本列表
  getBlockVersions: (blockId: string, region?: string) =>
    api.get<BlockVersion[]>(`/blocks/${blockId}/versions`, { params: { region } }),

  // 获取单个版本详情
  getBlockVersion: (versionId: string) =>
    api.get<BlockVersion>(`/blocks/versions/${versionId}`),

  // 获取区块已使用的地区列表
  getBlockRegions: (blockId: string) =>
    api.get<string[]>(`/blocks/${blockId}/regions`),

  // 创建区块版本（上传包）
  createBlockVersion: async (data: CreateBlockVersionDto) => {
    const formData = new FormData()
    formData.append('blockId', data.blockId)
    formData.append('version', data.version)
    if (data.region) {
      formData.append('region', data.region)
    }
    formData.append('changelog', data.changelog)
    formData.append('config', data.config || '{}')

    // 仅在提供了 packageFile 时才添加
    if (data.packageFile) {
      formData.append('package', data.packageFile)
    }

    // 自动从用户存储获取当前用户ID
    const currentUser = useUserStore.getState().user
    const createdBy = data.createdBy || currentUser?.userId || 'unknown'
    formData.append('createdBy', createdBy)

    return api.post<BlockVersion>('/blocks/versions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 发布版本
  publishVersion: (versionId: string, environment: 'staging' | 'production' = 'staging', region?: string) =>
    api.post(`/blocks/versions/${versionId}/publish`, { environment, region }),

  // 下线版本
  unpublishVersion: (versionId: string, environment: 'staging' | 'production') =>
    api.post(`/blocks/versions/${versionId}/unpublish`, { environment }),

  // 更新版本
  updateBlockVersion: async (data: CreateBlockVersionDto & { versionId: string }) => {
    const formData = new FormData()
    formData.append('versionId', data.versionId)

    if (data.type) {
      formData.append('type', data.type)
    }
    if (data.version) {
      formData.append('version', data.version)
    }
    if (data.region) {
      formData.append('region', data.region)
    }
    if (data.changelog) {
      formData.append('changelog', data.changelog)
    }
    if (data.config) {
      formData.append('config', data.config)
    }

    // 仅在提供了 packageFile 时才添加
    if (data.packageFile) {
      formData.append('package', data.packageFile)
    }

    return api.put<BlockVersion>(`/blocks/versions/${data.versionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 删除版本
  deleteVersion: (versionId: string) =>
    api.delete(`/blocks/versions/${versionId}`),

  // 获取审批列表
  getApprovalRequests: (params?: ListParams & { status?: string; blockId?: string }) =>
    api.get<PaginatedResponse<ApprovalRequest>>('/approvals/list', { params }),

  // 提交审批
  submitApproval: (versionId: string, environment: 'staging' | 'production') => {
    // 自动从用户存储获取当前用户ID
    const currentUser = useUserStore.getState().user
    const requestedBy = currentUser?.email || 'unknown'

    return api.post<ApprovalRequest>('/approvals/submit', {
      versionId,
      environment,
      requestedBy
    })
  },

  // 审批通过
  approveRequest: (id: string, comment?: string) =>
    api.post(`/approvals/${id}/approve`, { comment }),

  // 审批拒绝
  rejectRequest: (id: string, comment: string) =>
    api.post(`/approvals/${id}/reject`, { comment }),

  // 根据版本ID获取审批记录
  getApprovalByVersionId: (versionId: string) =>
    api.get<ApprovalRequest>(`/approvals/version/${versionId}`),
}
