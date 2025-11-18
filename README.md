# AppCenter 管理系统

基于 React + Vite + shadcn/ui 构建的现代化后台管理系统

## ✨ 特性

- 🚀 **现代技术栈** - React 18 + TypeScript + Vite 5
- 🎨 **精美 UI** - shadcn/ui + Tailwind CSS
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔐 **类型安全** - 完整的 TypeScript 类型定义
- 📦 **组件化** - 高度可复用的组件设计
- 🎯 **自动导入** - React hooks 和常用库自动导入
- 🌈 **主题支持** - 内置明暗主题切换
- 🔥 **快速开发** - HMR 热更新，开发体验极佳

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可看到系统运行。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📦 技术栈

### 核心框架

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite 5** - 极速构建工具

### UI & 样式

- **shadcn/ui** - 高质量 UI 组件库
- **Tailwind CSS** - 原子化 CSS 框架
- **SCSS** - CSS 预处理器
- **Lucide Icons** - 优雅的图标库
- **Tabler Icons** - 品牌图标

### 状态管理

- **Zustand** - 轻量级状态管理
- **TanStack Query** - 强大的服务端状态管理
- **React Hook Form** - 高性能表单管理
- **Zod** - TypeScript 优先的 Schema 验证

### 工具链

- **React Router v6** - 路由管理
- **Axios** - HTTP 客户端
- **unplugin-auto-import** - 自动导入
- **ESLint** - 代码规范

## 📁 功能模块

### 1. 应用管理 (`/apps`)

- ✅ 应用列表展示（卡片视图）
- ✅ 创建和编辑应用
- ✅ 应用详情查看
- ✅ 成员管理（添加、移除、角色管理）
- ✅ 搜索和筛选

### 2. 区块管理 (`/blocks`)

- ✅ 区块列表展示（表格视图）
- ✅ 创建和编辑区块
- ✅ 版本管理
- ✅ 包上传（支持拖拽）
- ✅ 版本发布/下线
- ✅ 多维度筛选（类型、状态）

### 3. 审批管理 (`/approvals`)

- ✅ 审批列表查看
- ✅ 审批通过/拒绝
- ✅ 审批意见记录
- ✅ 审批状态统计

## 📚 文档

- **开发指南**: 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解详细的开发文档
- **项目总结**: 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解项目架构和实现

## 🎯 项目结构

```
appcenter-web/
├── src/
│   ├── components/        # 组件
│   │   ├── ui/           # shadcn/ui 基础组件
│   │   ├── apps/         # App 管理组件
│   │   ├── blocks/       # 区块管理组件
│   │   └── approvals/    # 审批组件
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务层
│   ├── stores/           # 状态管理
│   ├── mocks/            # Mock 数据（开发环境）
│   │   ├── data.ts       # Mock 数据定义
│   │   ├── handlers.ts   # 请求处理器
│   │   └── index.ts      # Mock 初始化
│   ├── lib/              # 工具函数
│   ├── types/            # 类型定义
│   └── styles/           # 样式文件
├── public/               # 静态资源
└── ... 配置文件
```

## 🔧 开发说明

### Mock 数据

✨ **项目已内置完整的 Mock 数据，开箱即用！**

包含以下初始化数据：

- **6 个应用**：HopeGoo 商城、管理后台、配送端、直播、小程序、营销中心
- **10 个区块**：商品卡片、购物车、订单管理、直播间、优惠券等
- **5 条审批记录**：包含待审批、已审批、已拒绝的示例数据

#### 启用/禁用 Mock

项目默认启用 Mock 数据，无需配置即可运行。

**禁用 Mock（连接真实后端）：**

1. 创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://your-api-server.com
VITE_ENABLE_MOCK=false
```

2. 运行 `npm install` 安装 `axios-mock-adapter`
3. 启动开发服务器 `npm run dev`

📖 **详细文档**：查看 [MOCK_SETUP.md](./MOCK_SETUP.md) 了解如何自定义 Mock 数据

### 自动导入

项目配置了自动导入，以下内容无需手动导入：

```tsx
// ✅ 自动导入，无需 import
const [state, setState] = useState()
const navigate = useNavigate()
const { data } = useQuery(...)
```

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在侧边栏菜单配置（`src/layouts/DashboardLayout.tsx`）

### 添加新组件

shadcn/ui 组件已包含在项目中，如需添加更多：

```bash
# 安装 shadcn/ui CLI（如果还没有）
npx shadcn-ui@latest add [component-name]
```

## 🌟 最佳实践

- 使用 TypeScript 严格模式
- 组件使用 React Hooks
- API 调用通过 service 层
- 表单使用 React Hook Form + Zod
- 状态管理优先使用 TanStack Query
- 样式优先使用 Tailwind 工具类

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

---

**提示**: 这是一个演示项目，使用 Mock 数据。实际使用需要连接后端 API。
