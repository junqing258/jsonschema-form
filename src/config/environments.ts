import type { Environment } from '@/types'

/**
 * 环境配置项
 */
export interface EnvironmentConfig {
  key: Environment
  label: string
  description?: string
  color: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'
  order: number // 发布顺序，数字越小优先级越高
}

/**
 * 环境配置列表
 * 可以根据实际需求添加或修改环境
 */
export const ENVIRONMENTS: EnvironmentConfig[] = [
  {
    key: 'staging',
    label: '预发',
    description: '预发布环境，用于发布前的最终测试',
    color: 'default',
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
 * 根据环境key获取配置
 */
export function getEnvironmentConfig(env: Environment): EnvironmentConfig | undefined {
  return ENVIRONMENTS.find(e => e.key === env)
}

/**
 * 获取环境标签
 */
export function getEnvironmentLabel(env: Environment): string {
  return getEnvironmentConfig(env)?.label || env
}

/**
 * 获取环境颜色
 */
export function getEnvironmentColor(env: Environment): EnvironmentConfig['color'] {
  return getEnvironmentConfig(env)?.color || 'default'
}

/**
 * 按顺序获取所有环境
 */
export function getEnvironmentsSorted(): EnvironmentConfig[] {
  return [...ENVIRONMENTS].sort((a, b) => a.order - b.order)
}

/**
 * 环境映射对象（用于快速查找）
 */
export const ENVIRONMENT_MAP = ENVIRONMENTS.reduce((map, env) => {
  map[env.key] = env
  return map
}, {} as Record<Environment, EnvironmentConfig>)

