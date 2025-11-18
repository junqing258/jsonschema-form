import type { App, AppMember, ApprovalRequest, Block, BlockVersion, PaginatedResponse } from '@/types'
import { mockAppMembers, mockApprovalRequests, mockApps, mockBlockVersions, mockBlocks } from './data'

import { getEnvironmentLabel } from '@/config/environments'

// 模拟延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成分页响应
function paginate<T>(items: T[], page: number = 1, pageSize: number = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = items.slice(start, end)

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  }
}

// 过滤和搜索
function filterItems<T extends { name: string }>(
  items: T[],
  keyword?: string
): T[] {
  if (!keyword) return items

  const lowerKeyword = keyword.toLowerCase()
  return items.filter(item =>
    item.name.toLowerCase().includes(lowerKeyword)
  )
}

const normalizeRegions = (regions?: string[]) => {
  if (!regions || regions.length === 0) {
    return ['default']
  }
  if (regions.includes('*')) {
    return ['*']
  }
  return Array.from(new Set(regions))
}

type CreateAppPayload = {
  name: string
  description: string
  platform: string
  icon?: string
}

type CreateBlockPayload = {
  name: string
  description: string
  appId: string
  type: Block['type']
}

type CreateBlockVersionPayload = {
  blockId: string
  version: string
  changelog?: string
}

// Mock API 处理器
export const mockHandlers = {
  // 应用相关
  async getApps(params?: { keyword?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<App>> {
    await delay()

    let filteredApps = mockApps

    if (params?.keyword) {
      filteredApps = filterItems(mockApps, params.keyword)
    }

    return paginate(filteredApps, params?.page || 1, params?.pageSize || 20)
  },

  async getAppById(id: string): Promise<App | undefined> {
    await delay()
    return mockApps.find(app => app.id === id)
  },

  async createApp(data: CreateAppPayload): Promise<App> {
    await delay(500)

    const newApp: App = {
      id: `app-${Date.now()}`,
      name: data.name,
      description: data.description,
      platform: data.platform,
      icon: data.icon || `https://api.dicebear.com/7.x/shapes/svg?seed=${data.name}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1,
    }

    mockApps.unshift(newApp)
    return newApp
  },

  async getAppMembers(appId: string, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<AppMember>> {
    await delay()

    const members = mockAppMembers.filter(member => member.appId === appId)
    return paginate(members, params?.page || 1, params?.pageSize || 20)
  },

  async addAppMember(appId: string, data: { userEmail: string; role: string; regions?: string[] }): Promise<AppMember> {
    await delay(500)
    const regions = normalizeRegions(data.regions)

    const newMember: AppMember = {
      id: `member-${Date.now()}`,
      appId,
      userId: `user-${Date.now()}`,
      userName: data.userEmail.split('@')[0],
      userEmail: data.userEmail,
      role: data.role as 'owner' | 'admin' | 'member',
      avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${data.userEmail}`,
      joinedAt: new Date().toISOString(),
      regions,
    }

    mockAppMembers.push(newMember)

    // 更新应用成员数
    const app = mockApps.find(a => a.id === appId)
    if (app) {
      app.memberCount++
    }

    return newMember
  },

  async updateAppMember(appId: string, memberId: string, data: { role?: string; regions?: string[] }): Promise<AppMember> {
    await delay(300)
    const member = mockAppMembers.find(item => item.appId === appId && item.id === memberId)
    if (!member) {
      throw new Error('Member not found')
    }
    if (data.role) {
      member.role = data.role as 'owner' | 'admin' | 'member'
    }
    if (data.regions) {
      member.regions = normalizeRegions(data.regions)
    }
    return member
  },

  async getMyMembership(appId: string): Promise<AppMember | undefined> {
    await delay()
    return mockAppMembers.find(member => member.appId === appId)
  },

  // 区块相关
  async getBlocks(params?: {
    keyword?: string
    appId?: string
    status?: string
    type?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<Block>> {
    await delay()

    let filteredBlocks = [...mockBlocks]

    if (params?.keyword) {
      filteredBlocks = filterItems(filteredBlocks, params.keyword)
    }

    if (params?.appId) {
      filteredBlocks = filteredBlocks.filter(block => block.appId === params.appId)
    }

    if (params?.status) {
      filteredBlocks = filteredBlocks.filter(block => block.status === params.status)
    }

    if (params?.type) {
      filteredBlocks = filteredBlocks.filter(block => block.type === params.type)
    }

    return paginate(filteredBlocks, params?.page || 1, params?.pageSize || 20)
  },

  async getBlockById(id: string): Promise<Block | undefined> {
    await delay()
    return mockBlocks.find(block => block.id === id)
  },

  async createBlock(data: CreateBlockPayload): Promise<Block> {
    await delay(500)

    const app = mockApps.find(a => a.id === data.appId)

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      name: data.name,
      description: data.description,
      appId: data.appId,
      appName: app?.name || '未知应用',
      type: data.type,
      status: 'draft',
      downloadCount: 0,
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockBlocks.unshift(newBlock)
    return newBlock
  },

  // 审批相关
  async getApprovalRequests(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<ApprovalRequest>> {
    await delay()

    let filteredRequests = [...mockApprovalRequests]

    if (params?.status) {
      filteredRequests = filteredRequests.filter(req => req.status === params.status)
    }

    // 按请求时间倒序排序
    filteredRequests.sort((a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    )

    return paginate(filteredRequests, params?.page || 1, params?.pageSize || 20)
  },

  async approveRequest(id: string, comment?: string): Promise<ApprovalRequest> {
    await delay(500)

    const request = mockApprovalRequests.find(req => req.id === id)
    if (!request) {
      throw new Error('审批请求不存在')
    }

    request.status = 'approved'
    request.reviewedBy = '当前用户'
    request.reviewedAt = new Date().toISOString()
    request.comment = comment

    // 更新对应区块的状态
    const block = mockBlocks.find(b => b.id === request.blockId)
    if (block) {
      block.status = 'approved'
    }

    return request
  },

  async rejectRequest(id: string, comment: string): Promise<ApprovalRequest> {
    await delay(500)

    const request = mockApprovalRequests.find(req => req.id === id)
    if (!request) {
      throw new Error('审批请求不存在')
    }

    request.status = 'rejected'
    request.reviewedBy = '当前用户'
    request.reviewedAt = new Date().toISOString()
    request.comment = comment

    return request
  },

  // 区块版本相关
  async getBlockVersions(blockId: string): Promise<BlockVersion[]> {
    await delay()

    const versions = mockBlockVersions.filter(v => v.blockId === blockId)
    // 按创建时间倒序排序
    return versions.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async createBlockVersion(data: CreateBlockVersionPayload): Promise<BlockVersion> {
    await delay(500)

    const newVersion: BlockVersion = {
      id: `version-${Date.now()}`,
      blockId: data.blockId,
      version: data.version,
      changelog: data.changelog,
      packageUrl: `https://cdn.example.com/blocks/temp/${data.version}.zip`,
      packageSize: Math.floor(Math.random() * 1000000) + 200000,
      status: 'draft',
      createdBy: '当前用户',
      createdAt: new Date().toISOString(),
    }

    mockBlockVersions.unshift(newVersion)
    return newVersion
  },

  async publishVersion(versionId: string, environment: 'staging' | 'production' = 'staging'): Promise<BlockVersion> {
    await delay(500)

    const version = mockBlockVersions.find(v => v.id === versionId)
    if (!version) {
      throw new Error('版本不存在')
    }

    if (version.status !== 'approved' && version.status !== 'published') {
      throw new Error('只有已审批的版本才能发布')
    }

    // 初始化 environments 数组
    if (!version.environments) {
      version.environments = []
    }

    // 检查是否已发布到该环境
    if (version.environments.includes(environment)) {
      const envLabel = getEnvironmentLabel(environment)
      throw new Error(`该版本已发布到${envLabel}环境`)
    }

    // 添加到环境列表
    version.environments.push(environment)
    version.status = 'published'

    // 更新环境发布时间
    const now = new Date().toISOString()
    if (environment === 'staging') {
      version.stagingPublishedAt = now
    } else {
      version.productionPublishedAt = now
    }

    if (!version.publishedAt) {
      version.publishedAt = now
    }

    // 更新区块的环境版本
    const block = mockBlocks.find(b => b.id === version.blockId)
    if (block) {
      if (environment === 'staging') {
        block.stagingVersion = version.version
      } else {
        block.productionVersion = version.version
      }
      block.status = 'published'
      block.updatedAt = now
    }

    return version
  },

  async unpublishVersion(versionId: string, environment: 'staging' | 'production'): Promise<BlockVersion> {
    await delay(500)

    const version = mockBlockVersions.find(v => v.id === versionId)
    if (!version) {
      throw new Error('版本不存在')
    }

    if (!version.environments || !version.environments.includes(environment)) {
      const envLabel = getEnvironmentLabel(environment)
      throw new Error(`该版本未发布到${envLabel}环境`)
    }

    // 从环境列表中移除
    version.environments = version.environments.filter(env => env !== environment)

    // 清除环境发布时间
    if (environment === 'staging') {
      version.stagingPublishedAt = undefined
    } else {
      version.productionPublishedAt = undefined
    }

    // 如果所有环境都已下线，更新状态
    if (version.environments.length === 0) {
      version.status = 'approved'
    }

    // 更新区块的环境版本
    const block = mockBlocks.find(b => b.id === version.blockId)
    if (block) {
      if (environment === 'staging') {
        block.stagingVersion = undefined
      } else {
        block.productionVersion = undefined
      }
      block.updatedAt = new Date().toISOString()
    }

    return version
  },

  async submitApproval(versionId: string): Promise<ApprovalRequest> {
    await delay(500)

    const version = mockBlockVersions.find(v => v.id === versionId)
    if (!version) {
      throw new Error('版本不存在')
    }

    const block = mockBlocks.find(b => b.id === version.blockId)
    if (!block) {
      throw new Error('区块不存在')
    }

    // 更新版本状态
    version.status = 'pending'

    // 创建审批请求
    const newRequest: ApprovalRequest = {
      id: `approval-${Date.now()}`,
      blockId: version.blockId,
      blockName: block.name,
      versionId: version.id,
      version: version.version,
      requestedBy: '当前用户',
      requestedAt: new Date().toISOString(),
      status: 'pending',
    }

    mockApprovalRequests.unshift(newRequest)

    // 更新区块状态
    block.status = 'pending'

    return newRequest
  },
}
