import { useCallback, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { IChangeEvent } from '@rjsf/core'
import { RJSFSchema, UiSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/hooks/use-theme'
import { Activity, Copy, Download, Eye, ListPlus, RefreshCcw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { withTheme } from '@rjsf/core'
import { Theme as shadcnTheme } from '@/components/rjsf-shadcn/src/index'

const Form = withTheme(shadcnTheme)

type FieldPreset = {
  key: string
  label: string
  description: string
  schema: RJSFSchema
  uiSchema?: UiSchema
  required?: boolean
}

const DEFAULT_SCHEMA: RJSFSchema = {
  title: '应用信息收集',
  description: '一个用于演示 @rjsf/shadcn 的快速入门表单',
  type: 'object',
  required: ['name', 'email', 'plan'],
  properties: {
    name: {
      type: 'string',
      title: '应用名称',
      default: 'Home Portal',
      minLength: 2,
    },
    email: {
      type: 'string',
      title: '负责人邮箱',
      format: 'email',
      default: 'team@hopegoo.com',
    },
    plan: {
      type: 'string',
      title: '套餐',
      enum: ['starter', 'pro', 'enterprise'],
      default: 'pro',
    },
    members: {
      type: 'integer',
      title: '成员数量',
      minimum: 1,
      default: 8,
    },
    description: {
      type: 'string',
      title: '描述',
    },
    notify: {
      type: 'boolean',
      title: '开启提醒',
      default: true,
    },
  },
}

const DEFAULT_UI_SCHEMA: UiSchema = {
  name: {
    'ui:placeholder': '请输入应用名称',
    'ui:autofocus': true,
  },
  email: {
    'ui:help': '用于投放回调通知，请确保可访问',
  },
  plan: {
    'ui:widget': 'select',
  },
  members: {
    'ui:widget': 'updown',
  },
  description: {
    'ui:widget': 'textarea',
    'ui:options': {
      rows: 4,
    },
  },
}

const DEFAULT_FORM_DATA = {
  name: 'Home Portal',
  email: 'team@hopegoo.com',
  plan: 'pro',
  members: 8,
  description: '管理渠道、配置与分发脚手架的统一入口。',
  notify: true,
}

const FIELD_PRESETS: FieldPreset[] = [
  {
    key: 'text',
    label: '单行文本',
    description: '适合昵称、标题等短文本',
    schema: {
      type: 'string',
      title: '单行文本',
      default: '',
    },
  },
  {
    key: 'textarea',
    label: '多行文本',
    description: '用于备注、富描述内容',
    schema: {
      type: 'string',
      title: '多行文本',
    },
    uiSchema: {
      'ui:widget': 'textarea',
      'ui:options': { rows: 4 },
    },
  },
  {
    key: 'number',
    label: '数字',
    description: '数量、排序或金额等数值字段',
    schema: {
      type: 'number',
      title: '数字字段',
      minimum: 0,
    },
    uiSchema: {
      'ui:widget': 'updown',
    },
  },
  {
    key: 'select',
    label: '下拉选择',
    description: '从固定选项中选取一个值',
    schema: {
      type: 'string',
      title: '选择项',
      enum: ['starter', 'pro', 'enterprise'],
      default: 'starter',
    },
    uiSchema: {
      'ui:widget': 'select',
    },
  },
  {
    key: 'checkbox',
    label: '布尔/开关',
    description: '适用于开关或确认项',
    schema: {
      type: 'boolean',
      title: '是否启用',
      default: true,
    },
  },
  {
    key: 'date',
    label: '日期',
    description: '选择一个日期值',
    schema: {
      type: 'string',
      title: '日期',
      format: 'date',
    },
  },
]

const QUICK_TIPS = [
  {
    title: 'Schema (结构)',
    body: '定义字段、校验与必填项，可添加 required 数组约束关键字段。',
  },
  {
    title: 'uiSchema (呈现)',
    body: '用 widget、options 定制输入体验，例如 textarea、select 或自定义占位符。',
  },
  {
    title: 'formData (数据)',
    body: '设置默认值并实时查看输出对象，便于和区块或 API 对接。',
  },
]

const formatJSON = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2) ?? ''
  } catch {
    return ''
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

const copyText = async (value: string) => {
  if (typeof window === 'undefined') return
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export default function FormBuilderPage() {
  const { theme } = useTheme()
  const [schemaText, setSchemaText] = useState(() => formatJSON(DEFAULT_SCHEMA))
  const [schemaObject, setSchemaObject] = useState<RJSFSchema>(DEFAULT_SCHEMA)
  const [schemaError, setSchemaError] = useState<string | null>(null)

  const [uiSchemaText, setUiSchemaText] = useState(() => formatJSON(DEFAULT_UI_SCHEMA))
  const [uiSchemaObject, setUiSchemaObject] = useState<UiSchema>(DEFAULT_UI_SCHEMA)
  const [uiSchemaError, setUiSchemaError] = useState<string | null>(null)

  const [formDataText, setFormDataText] = useState(() => formatJSON(DEFAULT_FORM_DATA))
  const [formData, setFormData] = useState<Record<string, unknown>>(DEFAULT_FORM_DATA)
  const [formDataError, setFormDataError] = useState<string | null>(null)

  const [liveValidate, setLiveValidate] = useState(true)

  const editorTheme = useMemo(() => (theme === 'dark' ? 'vs-dark' : 'vs-light'), [theme])

  const handleSchemaChange = (value?: string) => {
    const nextValue = value ?? ''
    setSchemaText(nextValue)

    try {
      const parsed = nextValue.trim() ? (JSON.parse(nextValue) as RJSFSchema) : { type: 'object' }
      setSchemaObject(parsed as any)
      setSchemaError(null)
    } catch (error) {
      setSchemaError((error as Error).message)
    }
  }

  const handleUiSchemaChange = (value?: string) => {
    const nextValue = value ?? ''
    setUiSchemaText(nextValue)

    try {
      const parsed = nextValue.trim() ? (JSON.parse(nextValue) as UiSchema) : {}
      setUiSchemaObject(parsed)
      setUiSchemaError(null)
    } catch (error) {
      setUiSchemaError((error as Error).message)
    }
  }

  const handleFormDataChange = (value?: string) => {
    const nextValue = value ?? ''
    setFormDataText(nextValue)

    try {
      const parsed = nextValue.trim() ? (JSON.parse(nextValue) as Record<string, unknown>) : {}
      setFormData(parsed)
      setFormDataError(null)
    } catch (error) {
      setFormDataError((error as Error).message)
    }
  }

  const handleFormChange = useCallback((event: IChangeEvent) => {
    const data = (event.formData || {}) as Record<string, unknown>
    setFormData(data)
    setFormDataText(formatJSON(data))
  }, [])

  const handleSubmit = (event: IChangeEvent) => {
    toast.success('提交成功', {
      description: `即将提交 ${Object.keys(event.formData || {}).length} 个字段`,
    })
  }

  const handleError = (errors: unknown[]) => {
    toast.error('Schema 校验失败', {
      description: `共有 ${errors.length} 条错误，请检查输入`,
    })
  }

  const handleReset = () => {
    setSchemaObject(DEFAULT_SCHEMA)
    setSchemaText(formatJSON(DEFAULT_SCHEMA))
    setSchemaError(null)

    setUiSchemaObject(DEFAULT_UI_SCHEMA)
    setUiSchemaText(formatJSON(DEFAULT_UI_SCHEMA))
    setUiSchemaError(null)

    setFormData(DEFAULT_FORM_DATA)
    setFormDataText(formatJSON(DEFAULT_FORM_DATA))
    setFormDataError(null)
    toast.success('已重置示例配置')
  }

  const handleCopyBlock = async (label: string, value: string) => {
    try {
      await copyText(value)
      toast.success(`${label} 已复制`)
    } catch {
      toast.error(`复制 ${label} 失败`)
    }
  }

  const handleExportConfig = async () => {
    const payload = {
      schema: schemaObject,
      uiSchema: uiSchemaObject,
      formData,
    }

    await handleCopyBlock('完整配置', formatJSON(payload))
  }

  const handleAddField = (preset: FieldPreset) => {
    if (schemaObject.type && schemaObject.type !== 'object') {
      toast.error('仅支持在 object schema 中添加字段')
      return
    }

    const existingProperties = (schemaObject.properties || {}) as Record<string, RJSFSchema>
    const nextKey = createFieldKey(preset.key, existingProperties)

    const nextSchema: RJSFSchema = {
      ...schemaObject,
      type: 'object',
      properties: {
        ...existingProperties,
        [nextKey]: preset.schema,
      },
      required: schemaObject.required ? [...schemaObject.required] : [],
    }

    if (preset.required) {
      nextSchema.required = Array.from(new Set([...(nextSchema.required || []), nextKey]))
    }

    const nextUiSchema: UiSchema = {
      ...(uiSchemaObject || {}),
    }

    if (preset.uiSchema) {
      nextUiSchema[nextKey] = preset.uiSchema
    }

    setSchemaObject(nextSchema)
    setSchemaText(formatJSON(nextSchema))
    setUiSchemaObject(nextUiSchema)
    setUiSchemaText(formatJSON(nextUiSchema))
    toast.success(`已添加字段：${preset.label}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 pb-16">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pt-8 sm:px-6 lg:px-10">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/5 to-transparent">
          <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit border-primary text-primary">
                Builder Beta
              </Badge>
              <div>
                <CardTitle className="text-2xl">JSON Schema 表单搭建器</CardTitle>
                <CardDescription>
                  使用 @rjsf/shadcn 实时编排 schema、uiSchema 与
                  formData，并在右侧即时预览渲染结果。
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleReset} className="gap-1">
                <RefreshCcw className="h-4 w-4" />
                重置示例
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCopyBlock('JSON Schema', schemaText)}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                复制 Schema
              </Button>
              <Button variant="outline" onClick={handleExportConfig} className="gap-1">
                <Download className="h-4 w-4" />
                导出配置
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-1.5">
                <CardTitle>配置面板</CardTitle>
                <CardDescription>通过 JSON 编辑器调整 schema / uiSchema / formData</CardDescription>
              </CardHeader>
              <CardContent className="">
                <Tabs defaultValue="schema">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                    <TabsTrigger value="uiSchema">uiSchema</TabsTrigger>
                    <TabsTrigger value="formData">formData</TabsTrigger>
                  </TabsList>
                  <TabsContent value="schema" className="mt-4 space-y-2">
                    <Editor
                      language="json"
                      className=""
                      height="100%"
                      theme={editorTheme}
                      value={schemaText}
                      onChange={handleSchemaChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                      }}
                    />
                    {schemaError && (
                      <p className="text-sm text-destructive">语法错误：{schemaError}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="uiSchema" className="mt-4 space-y-2">
                    <Editor
                      language="json"
                      height="320px"
                      theme={editorTheme}
                      value={uiSchemaText}
                      onChange={handleUiSchemaChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                      }}
                    />
                    {uiSchemaError && (
                      <p className="text-sm text-destructive">语法错误：{uiSchemaError}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="formData" className="mt-4 space-y-2">
                    <Editor
                      language="json"
                      height="320px"
                      theme={editorTheme}
                      value={formDataText}
                      onChange={handleFormDataChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                      }}
                    />
                    {formDataError && (
                      <p className="text-sm text-destructive">语法错误：{formDataError}</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>字段库</CardTitle>
                  <CardDescription>选择常用字段快速生成 schema 片段</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <ListPlus className="h-3.5 w-3.5" />
                  支持 6 种基础输入
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {FIELD_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.key}
                      onClick={() => handleAddField(preset)}
                      className="rounded-lg border bg-background p-4 text-left transition hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{preset.label}</p>
                        <Badge variant="outline">{preset.schema.type ?? 'field'}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col">
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle>实时预览</CardTitle>
                  <CardDescription>所有修改均会通过 @rjsf/shadcn 即刻渲染</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={liveValidate} onCheckedChange={setLiveValidate} id="live" />
                    <div className="text-sm leading-tight">
                      <p className="font-medium">实时校验</p>
                      <p className="text-muted-foreground">字段变更时立即校验 schema</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleCopyBlock('formData', formDataText)}
                  >
                    <Copy className="h-4 w-4" />
                    复制 formData
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <Tabs defaultValue="form" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="form" className="gap-1">
                      <Eye className="h-4 w-4" />
                      表单
                    </TabsTrigger>
                    <TabsTrigger value="data" className="gap-1">
                      <Activity className="h-4 w-4" />
                      数据
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="form">
                    <div className="rounded-lg border bg-background p-4">
                      <Form
                        schema={schemaObject}
                        uiSchema={uiSchemaObject}
                        formData={formData}
                        validator={validator}
                        onChange={handleFormChange}
                        onSubmit={handleSubmit}
                        onError={handleError}
                        liveValidate={liveValidate}
                        showErrorList={false}
                        className="space-y-6"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="data">
                    <div className="rounded-lg border bg-muted/60 p-4">
                      <pre className="max-h-[420px] overflow-auto text-sm leading-relaxed">
                        {formDataText || '{}'}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader className="space-y-1.5">
                <CardTitle>进阶技巧</CardTitle>
                <CardDescription>巩固 schema / uiSchema 的职责，快速定位问题</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {QUICK_TIPS.map((tip) => (
                  <div key={tip.title}>
                    <p className="text-sm font-medium">{tip.title}</p>
                    <p className="text-sm text-muted-foreground">{tip.body}</p>
                    <Separator className="my-3" />
                  </div>
                ))}
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="gap-1">
                    <a
                      href="https://rjsf-team.github.io/react-jsonschema-form/docs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Sparkles className="h-4 w-4" />
                      查看 rjsf 文档
                    </a>
                  </Button>
                  <Button asChild variant="ghost" className="gap-1">
                    <a
                      href="https://github.com/rjsf-team/react-jsonschema-form/tree/main/packages/shadcn"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Sparkles className="h-4 w-4" />
                      shadcn 主题示例
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  )
}
