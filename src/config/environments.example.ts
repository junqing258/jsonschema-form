/**
 * 环境配置扩展示例
 *
 * 这个文件展示了如何扩展环境配置以支持更多的发布环境
 *
 * 使用步骤：
 * 1. 在 src/types/index.ts 中更新 Environment 类型
 * 2. 将此文件的配置复制到 environments.ts 中的 ENVIRONMENTS 数组
 * 3. 更新 Block 接口添加对应的版本字段（可选）
 */

import type { Environment } from '@/types'

interface EnvironmentConfig {
  key: Environment
  label: string
  description?: string
  color: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'
  order: number
}

/**
 * 完整的环境配置示例
 * 包含：开发、测试、UAT、预发、生产 5个环境
 */
export const ENVIRONMENTS_EXTENDED: EnvironmentConfig[] = [
  {
    key: 'dev' as Environment,
    label: '开发',
    description: '开发环境，用于日常开发测试',
    color: 'secondary',
    order: 0,
  },
  {
    key: 'test' as Environment,
    label: '测试',
    description: '测试环境，用于QA团队测试',
    color: 'outline',
    order: 1,
  },
  {
    key: 'uat' as Environment,
    label: 'UAT',
    description: '用户验收测试环境',
    color: 'warning',
    order: 2,
  },
  {
    key: 'staging',
    label: '预发',
    description: '预发布环境，用于发布前的最终测试',
    color: 'default',
    order: 3,
  },
  {
    key: 'production',
    label: '生产',
    description: '生产环境，面向最终用户',
    color: 'success',
    order: 4,
  },
]

/**
 * 简化版配置示例
 * 包含：UAT、生产 2个环境
 */
export const ENVIRONMENTS_SIMPLE: EnvironmentConfig[] = [
  {
    key: 'uat' as Environment,
    label: 'UAT',
    description: '用户验收测试环境',
    color: 'warning',
    order: 1,
  },
  {
    key: 'production',
    label: '生产',
    description: '生产环境，面向最终用户',
    color: 'success',
    order: 2,
  },
]

/**
 * 灰度发布配置示例
 * 支持多级灰度发布策略
 */
export const ENVIRONMENTS_CANARY: EnvironmentConfig[] = [
  {
    key: 'staging',
    label: '预发',
    description: '预发布环境',
    color: 'default',
    order: 1,
  },
  {
    key: 'canary' as Environment,
    label: '灰度',
    description: '灰度发布环境，面向5%用户',
    color: 'warning',
    order: 2,
  },
  {
    key: 'production',
    label: '生产',
    description: '生产环境，面向全部用户',
    color: 'success',
    order: 3,
  },
]

/**
 * 多地域配置示例
 * 支持不同地域的生产环境
 */
export const ENVIRONMENTS_REGION: EnvironmentConfig[] = [
  {
    key: 'staging',
    label: '预发',
    description: '预发布环境',
    color: 'default',
    order: 1,
  },
  {
    key: 'prod-cn' as Environment,
    label: '生产-中国',
    description: '中国区生产环境',
    color: 'success',
    order: 2,
  },
  {
    key: 'prod-us' as Environment,
    label: '生产-美国',
    description: '美国区生产环境',
    color: 'success',
    order: 3,
  },
  {
    key: 'prod-eu' as Environment,
    label: '生产-欧洲',
    description: '欧洲区生产环境',
    color: 'success',
    order: 4,
  },
]

