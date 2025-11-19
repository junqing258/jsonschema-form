import { useEffect, useMemo, useState } from 'react'
import Form from '@/components/rjsf-shadcn/src/index'
import { RJSFSchema, UiSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, generateRandomID } from '@/lib/utils'
import {
  Activity,
  ChevronDown,
  Copy,
  ListPlus,
  Plus,
  RefreshCcw,
  SquarePen,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'

type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'switch'
  | 'date'
  | 'time'

type FieldConfig = {
  id: string
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]
  defaultValue?: string | number | boolean | string[]
  description?: string
}

const PRESET_FIELDS: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    label: '应用名称',
    type: 'text',
    required: true,
    placeholder: '如：App Center',
    defaultValue: 'App Center',
    description: '最少 2 个字符，便于标识',
  },
  {
    id: 'email',
    key: 'email',
    label: '负责人邮箱',
    type: 'text',
    required: true,
    placeholder: 'owner@domain.com',
    defaultValue: 'team@hopegoo.com',
  },
  {
    id: 'plan',
    key: 'plan',
    label: '套餐',
    type: 'select',
    required: true,
    options: ['starter', 'pro', 'enterprise'],
    defaultValue: 'pro',
  },
  {
    id: 'members',
    key: 'members',
    label: '成员数量',
    type: 'number',
    defaultValue: 8,
    description: '为 0 时隐藏协作入口',
  },
  {
    id: 'notify',
    key: 'notify',
    label: '开启提醒',
    type: 'switch',
    defaultValue: true,
    description: '用于审批、发布通知',
  },
]

const TYPE_LABELS: Record<FieldType, string> = {
  text: '单行文本',
  textarea: '多行文本',
  number: '数字',
  select: '下拉选择',
  'multi-select': '多选',
  switch: '开关',
  date: '日期',
  time: '时间',
}

const copyToClipboard = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} 已复制`)
  } catch (error) {
    console.error(error)
    toast.error(`复制 ${label} 失败`)
  }
}

const createFieldKey = (base: string, existing: Record<string, unknown> = {}) => {
  const normalized = base.replace(/[^a-zA-Z0-9]/g, '_') || 'field'
  let candidate = normalized
  let index = 1

  while (Object.prototype.hasOwnProperty.call(existing, candidate)) {
    candidate = `${normalized}_${index++}`
  }

  return candidate
}

const deriveDefaults = (field: FieldConfig) => {
  if (field.defaultValue !== undefined) return field.defaultValue
  switch (field.type) {
    case 'number':
      return 0
    case 'switch':
      return false
    case 'select':
      return field.options?.[0] ?? ''
    case 'multi-select':
      return []
    default:
      return ''
  }
}

const buildArtifacts = (
  fields: FieldConfig[],
  existingData: Record<string, unknown>
): { schema: RJSFSchema; uiSchema: UiSchema; formData: Record<string, unknown> } => {
  const schema: RJSFSchema = {
    // title: '可视化表单',
    // description: '下方调整字段即可即时预览',
    type: 'object',
    properties: {},
    required: [],
  }
  const uiSchema: UiSchema = {}
  const formData: Record<string, unknown> = {}

  const existingKeys = new Set(Object.keys(schema.properties ?? {}))

  fields.forEach((field) => {
    const key = field.key
    if (existingKeys.has(key)) return

    const description =
      field.description || (field.type === 'text' ? '请输入文本' : '填写当前字段值')

    if (field.type === 'text' || field.type === 'textarea') {
      schema.properties![key] = {
        type: 'string',
        title: field.label,
        description,
        default: deriveDefaults(field),
        minLength: field.required ? 1 : undefined,
      }
      uiSchema[key] = {
        'ui:placeholder': field.placeholder,
        ...(field.type === 'textarea'
          ? { 'ui:widget': 'textarea', 'ui:options': { rows: 4 } }
          : {}),
      }
    } else if (field.type === 'number') {
      schema.properties![key] = {
        type: 'number',
        title: field.label,
        description,
        default: deriveDefaults(field),
      }
      uiSchema[key] = { 'ui:widget': 'updown', 'ui:placeholder': field.placeholder }
    } else if (field.type === 'select') {
      const options = field.options?.length ? field.options : ['A', 'B', 'C']
      schema.properties![key] = {
        type: 'string',
        title: field.label,
        description,
        enum: options,
        default: field.defaultValue ?? options[0],
      }
      uiSchema[key] = { 'ui:widget': 'select', 'ui:placeholder': field.placeholder }
    } else if (field.type === 'multi-select') {
      const options = field.options?.length ? field.options : ['A', 'B', 'C']
      const defaultValues = Array.isArray(field.defaultValue)
        ? field.defaultValue
        : field.defaultValue
        ? [String(field.defaultValue)]
        : []
      schema.properties![key] = {
        type: 'array',
        title: field.label,
        description,
        items: {
          type: 'string',
          enum: options,
        },
        uniqueItems: true,
        default: defaultValues,
      }
      uiSchema[key] = {
        'ui:widget': 'select',
        'ui:placeholder': field.placeholder,
        'ui:options': { multiple: true },
      }
    } else if (field.type === 'switch') {
      schema.properties![key] = {
        type: 'boolean',
        title: field.label,
        description,
        default: Boolean(field.defaultValue),
      }
    } else if (field.type === 'date' || field.type === 'time') {
      schema.properties![key] = {
        type: 'string',
        format: field.type === 'date' ? 'date' : 'time',
        title: field.label,
        description,
        default: field.defaultValue ?? '',
      }
    } /* else if (field.type === 'time') {
      schema.properties![key] = {
        type: 'string',
        format: 'time',
        title: field.label,
        description,
        default: field.defaultValue ?? '',
      }
      uiSchema[key] = { 'ui:widget': 'time' }
    } */

    if (field.required) {
      schema.required?.push(key)
    }

    const value = existingData[key] ?? deriveDefaults(field)
    if (field.type === 'number' && typeof value === 'string') {
      formData[key] = Number(value)
    } else if (field.type === 'multi-select') {
      formData[key] = Array.isArray(value) ? value : value ? [String(value)] : []
    } else {
      formData[key] = value
    }
  })

  return { schema, uiSchema, formData }
}

export default function FormBuilderV2Page() {
  const [fields, setFields] = useState<FieldConfig[]>(PRESET_FIELDS)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  // const [liveValidate, setLiveValidate] = useState(true)
  const [newFieldType, setNewFieldType] = useState<FieldType>('text')
  const [newLabel, setNewLabel] = useState('新字段')
  const [newFieldKey, setNewFieldKey] = useState('')

  const [draggingType, setDraggingType] = useState<FieldType | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [openFields, setOpenFields] = useState<Record<string, boolean>>(
    PRESET_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: false }), {})
  )

  useEffect(() => {
    setFormData((prev) => buildArtifacts(fields, prev).formData)
  }, [fields])

  useEffect(() => {
    setOpenFields((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        if (!(field.id in next)) {
          next[field.id] = false
        }
      })
      return next
    })
  }, [fields])

  const { schema, uiSchema } = useMemo(() => buildArtifacts(fields, formData), [fields, formData])

  const handleAddField = (type: FieldType) => {
    const key = createFieldKey(
      type,
      fields.reduce((acc, item) => ({ ...acc, [item.key]: true }), {})
    )
    const field: FieldConfig = {
      id: generateRandomID(),
      key,
      label: `${TYPE_LABELS[type]} ${fields.length + 1}`,
      type,
      required: type !== 'switch',
      defaultValue:
        type === 'number' ? 0 : type === 'switch' ? false : type === 'multi-select' ? [] : '',
      options: type === 'select' || type === 'multi-select' ? ['选项一', '选项二'] : undefined,
    }
    setFields((prev) => [...prev, field])
    setOpenFields((prev) => ({ ...prev, [field.id]: false }))
    toast.success(`已添加 ${TYPE_LABELS[type]}`)
  }

  const handleCustomAdd = () => {
    const base = newFieldKey || newLabel || newFieldType
    const key = createFieldKey(
      base,
      fields.reduce((acc, item) => ({ ...acc, [item.key]: true }), {})
    )
    const field: FieldConfig = {
      id: generateRandomID(),
      key,
      label: newLabel || TYPE_LABELS[newFieldType],
      type: newFieldType,
      required: true,
      description: '',
      defaultValue:
        newFieldType === 'number'
          ? 0
          : newFieldType === 'switch'
          ? false
          : newFieldType === 'multi-select'
          ? []
          : '',
      options:
        newFieldType === 'select' || newFieldType === 'multi-select'
          ? ['选项一', '选项二']
          : undefined,
    }
    setFields((prev) => [...prev, field])
    setOpenFields((prev) => ({ ...prev, [field.id]: false }))
    setNewFieldKey('')
    toast.success(`新增字段：${field.label}`)
  }

  const updateField = (id: string, patch: Partial<FieldConfig>) => {
    setFields((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((item) => item.id !== id))
    toast.success('字段已移除')
  }

  const handleCopy = async (label: string, data: unknown) => {
    await copyToClipboard(JSON.stringify(data, null, 2), label)
  }

  const handleReset = () => {
    setFields(PRESET_FIELDS)
    setFormData(buildArtifacts(PRESET_FIELDS, {}).formData)
    setNewFieldKey('')
    toast.success('已恢复默认模板')
  }

  const moveField = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    setFields((prev) => {
      const next = [...prev]
      const fromIndex = next.findIndex((item) => item.id === sourceId)
      const toIndex = next.findIndex((item) => item.id === targetId)
      if (fromIndex === -1 || toIndex === -1) return prev
      const [removed] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, removed)
      return next
    })
  }

  const handleDropFromPalette = () => {
    if (!draggingType) return
    handleAddField(draggingType)
    setDraggingType(null)
  }

  const handleReorderDrop = (targetId: string) => {
    if (!draggingId) return
    moveField(draggingId, targetId)
    setDraggingId(null)
  }

  const handleArrowMove = (id: string, direction: 'up' | 'down') => {
    setFields((prev) => {
      const index = prev.findIndex((item) => item.id === id)
      if (index === -1) return prev
      const nextIndex =
        direction === 'up' ? Math.max(0, index - 1) : Math.min(prev.length - 1, index + 1)
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      next.splice(nextIndex, 0, removed)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-14">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pt-8 sm:px-6 lg:px-10">
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary text-primary">
                Form Builder 2.0
              </Badge>
              <div>
                <CardTitle className="text-2xl">低代码可视化表单搭建器</CardTitle>
                <CardDescription>
                  不需要手写 JSON，用开关和表单控件拼出 schema，右侧实时验证与预览。
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-1" onClick={handleReset}>
                <RefreshCcw className="h-4 w-4" />
                重置模板
              </Button>
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => handleCopy('Schema', schema)}
              >
                <Copy className="h-4 w-4" />
                复制 Schema
              </Button>
              <Button
                className="gap-1"
                onClick={() => handleCopy('完整配置', { schema, uiSchema, formData })}
              >
                <DownloadIcon className="h-4 w-4" />
                导出配置
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>字段画布</CardTitle>
                <CardDescription>
                  调整标签、占位、必填与选项，自动生成 schema 与 uiSchema
                </CardDescription>
              </CardHeader>
              <CardContent
                className="space-y-6"
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = draggingType ? 'copy' : 'move'
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  if (draggingType) {
                    handleDropFromPalette()
                  }
                }}
              >
                <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-dashed border-primary/30 bg-muted/30 p-4 shadow-sm h-full">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium">快速添加</p>
                          <p className="text-xs text-muted-foreground">
                            拖拽或点击控件，快速补充常用字段
                          </p>
                        </div>
                        <Badge variant="secondary" className="gap-1 self-start md:self-auto">
                          <ListPlus className="h-3.5 w-3.5" />
                          {Object.keys(TYPE_LABELS).length} 种常用控件
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {(
                          [
                            'text',
                            'textarea',
                            'number',
                            'select',
                            'multi-select',
                            'switch',
                            'date',
                            'time',
                          ] as FieldType[]
                        ).map((type) => (
                          <button
                            key={type}
                            type="button"
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = 'copy'
                              setDraggingType(type)
                            }}
                            onDragEnd={() => setDraggingType(null)}
                            onClick={() => handleAddField(type)}
                            className="flex w-full flex-col gap-1.5 rounded-lg border border-muted bg-muted/60 px-3 py-2 text-left transition hover:border-primary hover:bg-primary/5"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{TYPE_LABELS[type]}</p>
                              <Plus className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-[13px] text-muted-foreground leading-tight">
                              {type === 'text' && '单行输入，支持占位与必填'}
                              {type === 'textarea' && '多行内容，适合描述'}
                              {type === 'number' && '数量、排序或金额'}
                              {type === 'select' && '下拉选项，可配置枚举'}
                              {type === 'multi-select' && '多项选择，支持回显多个值'}
                              {type === 'switch' && '布尔/状态切换'}
                              {type === 'date' && '日期选择器'}
                              {type === 'time' && '时间选择器，支持时分输入'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-dashed border-primary/30 bg-muted/20 p-4">
                      <p className="text-sm font-medium">字段配置</p>
                      <p className="text-xs text-muted-foreground">
                        设置字段 Key、描述与类型，创建后可在下方继续调整。
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Input
                          placeholder="字段标签，如：审批备注"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                        />
                        <Input
                          placeholder="字段 key，例如 owner_email"
                          value={newFieldKey}
                          onChange={(e) => setNewFieldKey(e.target.value.replace(/\s+/g, '_'))}
                        />
                        <Select
                          onValueChange={(value) => setNewFieldType(value as FieldType)}
                          value={newFieldType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="字段类型" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TYPE_LABELS) as FieldType[]).map((type) => (
                              <SelectItem key={type} value={type}>
                                {TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" className="gap-1" onClick={handleCustomAdd}>
                          <Wand2 className="h-4 w-4" />
                          插入字段
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => {
                        const isOpen = openFields[field.id] ?? false
                        return (
                          <Collapsible
                            key={field.id}
                            open={isOpen}
                            onOpenChange={(value) =>
                              setOpenFields((prev) => ({ ...prev, [field.id]: value }))
                            }
                          >
                            <div
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = 'move'
                                setDraggingId(field.id)
                              }}
                              onDragOver={(event) => {
                                event.preventDefault()
                                event.dataTransfer.dropEffect = draggingId ? 'move' : 'none'
                              }}
                              onDrop={(event) => {
                                event.preventDefault()
                                handleReorderDrop(field.id)
                              }}
                              onDragEnd={() => setDraggingId(null)}
                              className="rounded-lg border bg-card/60 p-4 shadow-sm transition hover:border-primary/50"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <SquarePen className="h-4 w-4 text-primary" />
                                  {field.label}
                                  <Badge variant="outline" className="text-xs">
                                    {TYPE_LABELS[field.type]}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Switch
                                      size="sm"
                                      checked={field.required}
                                      onCheckedChange={(value) =>
                                        updateField(field.id, { required: value })
                                      }
                                    />
                                    <span className="text-muted-foreground">必填</span>
                                  </div>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="折叠字段">
                                      <ChevronDown
                                        className={cn(
                                          'h-4 w-4 transition',
                                          isOpen ? 'rotate-0' : '-rotate-90'
                                        )}
                                      />
                                    </Button>
                                  </CollapsibleTrigger>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="删除字段"
                                    onClick={() => removeField(field.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <CollapsibleContent>
                                <Separator className="my-3" />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      字段标题
                                    </Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) =>
                                        updateField(field.id, { label: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                      字段 Key
                                    </Label>
                                    <Input
                                      value={field.key}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          key:
                                            e.target.value.replace(/[^a-zA-Z0-9_]/g, '_') ||
                                            'field',
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">
                                      占位提示
                                    </Label>
                                    <Input
                                      placeholder="请输入占位符"
                                      value={field.placeholder ?? ''}
                                      onChange={(e) =>
                                        updateField(field.id, { placeholder: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">
                                      字段描述
                                    </Label>
                                    <Textarea
                                      value={field.description ?? ''}
                                      onChange={(e) =>
                                        updateField(field.id, { description: e.target.value })
                                      }
                                    />
                                  </div>
                                  {(field.type === 'select' || field.type === 'multi-select') && (
                                    <div className="space-y-2 sm:col-span-2">
                                      <Label className="text-xs text-muted-foreground">
                                        选项（每行一个）
                                      </Label>
                                      <Textarea
                                        className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={(field.options || []).join('\n')}
                                        onChange={(e) =>
                                          updateField(field.id, {
                                            options: e.target.value
                                              .split('\n')
                                              .map((item) => item.trim())
                                              .filter(Boolean),
                                          })
                                        }
                                      />
                                    </div>
                                  )}
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">默认值</Label>
                                    {field.type === 'switch' ? (
                                      <div className="flex h-10 items-center gap-3 rounded-md border border-input px-3">
                                        <Switch
                                          checked={Boolean(field.defaultValue)}
                                          onCheckedChange={(value) =>
                                            updateField(field.id, { defaultValue: value })
                                          }
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          {field.defaultValue ? '已开启' : '已关闭'}
                                        </span>
                                      </div>
                                    ) : field.type === 'multi-select' ? (
                                      <Textarea
                                        placeholder="填写默认选中的值（每行一个），需与选项一致"
                                        value={
                                          Array.isArray(field.defaultValue)
                                            ? field.defaultValue.join('\n')
                                            : ''
                                        }
                                        onChange={(e) =>
                                          updateField(field.id, {
                                            defaultValue: e.target.value
                                              .split('\n')
                                              .map((item) => item.trim())
                                              .filter(Boolean),
                                          })
                                        }
                                      />
                                    ) : (
                                      <Input
                                        value={String(field.defaultValue ?? '')}
                                        onChange={(e) =>
                                          updateField(field.id, {
                                            defaultValue:
                                              field.type === 'number'
                                                ? Number(e.target.value)
                                                : e.target.value,
                                          })
                                        }
                                      />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-4 self-start">
            <Card className="flex flex-col">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>实时预览</CardTitle>
                    <CardDescription>使用 @rjsf/shadcn 渲染，可直接复制到业务代码</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <Tabs defaultValue="form" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="form" className="gap-1">
                      <Sparkles className="h-4 w-4" />
                      预览
                    </TabsTrigger>
                    <TabsTrigger value="data" className="gap-1">
                      <Activity className="h-4 w-4" />
                      数据
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="form">
                    <div className="rounded-lg bg-background p-0">
                      <Form
                        schema={schema}
                        uiSchema={uiSchema}
                        formData={formData}
                        validator={validator}
                        id="form-builder"
                        className="space-y-10"
                        showErrorList={false}
                        onChange={(event) => setFormData(event.formData as Record<string, unknown>)}
                        onSubmit={(event) => {
                          console.log(formData, event.formData)
                          toast.success('提交成功', {
                            description: `提交 ${Object.keys(event.formData || {}).length} 项数据`,
                          })
                        }}
                        onError={(errors) =>
                          toast.error('表单校验失败', {
                            description: `共有 ${errors.length} 条错误，请检查输入`,
                          })
                        }
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="data">
                    <div className="rounded-lg border bg-muted/60 p-4">
                      <pre className="max-h-[420px] overflow-auto text-sm leading-relaxed">
                        {JSON.stringify(formData, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>使用技巧</CardTitle>
                <CardDescription>这些约定能让 schema 更易维护与复用</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-background p-3">
                  <p className="text-sm font-medium">字段命名</p>
                  <p className="text-sm text-muted-foreground">
                    采用小写 + 下划线，例如 <code>owner_email</code>，避免空格与中文。
                  </p>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-sm font-medium">默认值与占位符</p>
                  <p className="text-sm text-muted-foreground">
                    默认值用于回显与演示，占位符强调输入格式；不要混用两者。
                  </p>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <p className="text-sm font-medium">校验策略</p>
                  <p className="text-sm text-muted-foreground">
                    必填尽量通过 schema.required 管控，特殊规则可追加 minLength / format。
                  </p>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  )
}

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
)
