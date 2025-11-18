# 环境配置说明

## 概述

环境配置文件 `environments.ts` 用于统一管理系统中的发布环境配置，避免硬编码，提高可维护性和可扩展性。

## 配置结构

```typescript
interface EnvironmentConfig {
  key: Environment // 环境唯一标识
  label: string // 环境显示名称
  description?: string // 环境描述
  color: BadgeVariant // 环境标签颜色
  order: number // 发布顺序（数字越小优先级越高）
}
```

## 默认环境配置

系统默认包含两个环境：

1. **预发环境（staging）**

   - key: `staging`
   - label: `预发`
   - color: `default` (蓝色)
   - order: `1`
   - 用途：发布前的最终测试环境

2. **生产环境（production）**
   - key: `production`
   - label: `生产`
   - color: `success` (绿色)
   - order: `2`
   - 用途：面向最终用户的正式环境

## 如何添加新环境

### 1. 更新类型定义

在 `src/types/index.ts` 中添加新的环境类型：

```typescript
export type Environment = 'staging' | 'production' | 'testing' | 'uat'
```

### 2. 添加环境配置

在 `src/config/environments.ts` 的 `ENVIRONMENTS` 数组中添加新环境：

```typescript
export const ENVIRONMENTS: EnvironmentConfig[] = [
  {
    key: 'staging',
    label: '预发',
    description: '预发布环境，用于发布前的最终测试',
    color: 'default',
    order: 1,
  },
  {
    key: 'testing',
    label: '测试',
    description: '测试环境',
    color: 'secondary',
    order: 0, // 最先发布的环境
  },
  {
    key: 'uat',
    label: 'UAT',
    description: '用户验收测试环境',
    color: 'warning',
    order: 1.5,
  },
  {
    key: 'production',
    label: '生产',
    description: '生产环境，面向最终用户',
    color: 'success',
    order: 2,
  },
]
```

### 3. 更新数据模型（可选）

如果需要在 Block 中记录各环境的版本，需要在 `src/types/index.ts` 中添加对应字段：

```typescript
export interface Block {
  // ... 其他字段
  stagingVersion?: string
  testingVersion?: string // 新增
  uatVersion?: string // 新增
  productionVersion?: string
}
```

### 4. 更新 Mock 数据（可选）

在 `src/mocks/handlers.ts` 中的 `publishVersion` 和 `unpublishVersion` 方法会自动支持新环境，无需修改。

## 颜色选项

环境标签支持的颜色选项（对应 Badge 组件的 variant）：

- `default` - 蓝色（适用于开发、预发环境）
- `success` - 绿色（适用于生产环境）
- `warning` - 橙色（适用于测试、UAT 环境）
- `destructive` - 红色（适用于已废弃的环境）
- `outline` - 灰色边框（适用于临时环境）
- `secondary` - 灰色（适用于辅助环境）

## 使用示例

### 获取环境标签

```typescript
import { getEnvironmentLabel } from '@/config/environments'

const label = getEnvironmentLabel('staging') // '预发'
```

### 获取环境颜色

```typescript
import { getEnvironmentColor } from '@/config/environments'

const color = getEnvironmentColor('production') // 'success'
```

### 获取排序后的环境列表

```typescript
import { getEnvironmentsSorted } from '@/config/environments'

const envs = getEnvironmentsSorted()
// [{ key: 'staging', ... }, { key: 'production', ... }]
```

### 在组件中使用

```typescript
import { ENVIRONMENTS, getEnvironmentLabel, getEnvironmentColor } from '@/config/environments'

// 渲染环境列表
ENVIRONMENTS.map((env) => (
  <Badge key={env.key} variant={getEnvironmentColor(env.key)}>
    {getEnvironmentLabel(env.key)}
  </Badge>
))
```

## 最佳实践

1. **环境顺序**：order 字段定义了发布的优先级顺序，建议从测试环境到生产环境依次递增
2. **环境命名**：使用简洁明了的标签，便于用户理解
3. **颜色规范**：保持颜色使用的一致性，便于用户快速识别环境类型
4. **环境描述**：为每个环境添加清晰的描述，帮助团队理解其用途

## 注意事项

- 修改环境配置后，已有的版本数据不会自动更新
- 删除环境配置前，请确保没有版本仍在使用该环境
- 环境 key 一旦确定，不建议修改，以免影响历史数据
