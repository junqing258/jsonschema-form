// 地区配置

export interface Region {
  key: string
  label: string
  flag: string // emoji 旗帜
  description: string
}

export const ALL_REGIONS_VALUE = '*'

export const ALL_REGION_OPTION: Region = {
  key: ALL_REGIONS_VALUE,
  label: '全部地区',
  flag: '🌍',
  description: '可管理所有地区的版本',
}

export const REGIONS: Region[] = [
  {
    key: 'default',
    label: '默认',
    flag: '🌐',
    description: '全球通用版本',
  },
  {
    key: 'cn',
    label: '中国大陆',
    flag: '🇨🇳',
    description: '中国大陆地区',
  },
  {
    key: 'hk',
    label: '中国香港',
    flag: '🇭🇰',
    description: '中国香港特别行政区',
  },
  {
    key: 'us',
    label: '美国',
    flag: '🇺🇸',
    description: '美国地区',
  },
  {
    key: 'eu',
    label: '欧洲',
    flag: '🇪🇺',
    description: '欧洲地区',
  },
  {
    key: 'sea',
    label: '东南亚',
    flag: '🌏',
    description: '东南亚地区',
  },
  {
    key: 'sg',
    label: '新加坡',
    flag: '🇸🇬',
    description: '新加坡',
  },
  {
    key: 'jp',
    label: '日本',
    flag: '🇯🇵',
    description: '日本地区',
  },
  {
    key: 'kr',
    label: '韩国',
    flag: '🇰🇷',
    description: '韩国地区',
  },
]

export const MEMBER_REGION_OPTIONS: Region[] = [ALL_REGION_OPTION, ...REGIONS]

// 根据 key 获取地区信息
export function getRegionByKey(key: string): Region | undefined {
  if (key === ALL_REGIONS_VALUE) {
    return ALL_REGION_OPTION
  }
  return REGIONS.find((r) => r.key === key)
}

// 获取地区标签
export function getRegionLabel(key: string): string {
  const region = getRegionByKey(key)
  return region ? region.label : key
}

// 获取地区旗帜
export function getRegionFlag(key: string): string {
  const region = getRegionByKey(key)
  return region ? region.flag : '🌐'
}

// 获取地区描述
export function getRegionDescription(key: string): string {
  const region = getRegionByKey(key)
  return region ? region.description : ''
}
