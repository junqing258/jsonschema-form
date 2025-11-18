// App 相关类型
export interface App {
  id: string
  name: string
  description: string
  icon?: string
  platform: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  memberCount: number
}

export interface AppMember {
  id: string
  appId: string
  userId: string
  userName: string
  userEmail: string
  role: 'owner' | 'admin' | 'member'
  avatar?: string
  joinedAt: string
  regions: string[]
}

export interface CreateAppDto {
  name: string
  description: string
  platform: string // 支持 'all' 或单个平台如 'ios'，或多个平台如 'ios,android,web'
  icon?: string
}

// 区块相关类型
export type Environment = 'staging' | 'production'

export interface Block {
  id: string
  name: string
  description: string
  appId: string
  appName: string
  type: 'component' | 'page' | 'module'
  category: string
  status: 'draft' | 'pending' | 'approved' | 'published' | 'archived'
  latestVersion?: string
  downloadCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
  // 各环境的当前版本
  stagingVersion?: string
  productionVersion?: string
}

export interface BlockVersion {
  id: string
  blockId: string
  version: string
  type: 'package' | 'config' // 版本类型：安装包或配置
  region: string // 地区标识
  changelog: string
  config: string // 配置信息（JSON格式）
  packageUrl?: string // 配置类型时可选
  packageSize?: number // 配置类型时可选
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string

  // 新的环境状态字段
  stagingStatus: 'unpublished' | 'published'
  productionStatus: 'unpublished' | 'pending' | 'approved' | 'published' | 'rejected'
  stagingPublishedAt?: string          // 预发环境发布时间
  productionPublishedAt?: string       // 生产环境发布时间

  // 旧字段（向后兼容，后续可删除）
  status?: 'draft' | 'pending' | 'approved' | 'published'
  stagingPublishedFlag?: boolean
  productionPublishedFlag?: boolean
  publishedAt?: string
}

export interface CreateBlockDto {
  name: string
  description?: string
  appId: string
  type: 'component' | 'page' | 'module'
  category?: string
}

export interface CreateBlockVersionDto {
  blockId: string
  type?: 'package' | 'config' // 版本类型，默认为 'package'
  version: string
  region?: string // 地区标识，默认为 'default'
  changelog: string
  config?: string // 配置信息（JSON格式），默认为 '{}'
  packageFile?: File // 可选，当类型为"配置"时不需要
  createdBy?: string  // 可选，将从用户存储自动获取
}

export interface ApprovalRequest {
  id: string
  blockId: string
  blockName: string
  versionId: string
  version: string
  requestedBy: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  comment?: string
}

// API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}


export type UserInfo = {
  username: string
  department: string
  userId: string
  workId: string
  newWorkId: string
  departmentId: string
  gender: string
  email: string
  deptLevelId: string
  deptLevelName: string
  phoneNumber: string
  mobile: string
  memberId: string
  isVirtual: number
  deviceId: string
}
