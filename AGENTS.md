# 仓库指南

## 项目结构与模块组织

核心代码放在 `src/`。`components/ui` 对标 shadcn 基础组件，而 `components/apps|blocks|approvals` 承载由 `App.tsx` 注册并在 `pages/` 路由中消费的领域组件。异步契约位于 `services/`，客户端状态存放在 `stores/`，axios mock 固件位于 `mocks/`。样式集中在 `styles/` 以及 Tailwind 变量，静态资源放在 `public/`，Vite 构建产物输出到 `dist/`。

## 构建、测试与开发命令

- `pnpm install` 会遵循已提交的锁定文件。
- `pnpm dev` 使用模拟数据启动 Vite。
- `pnpm build` 产出打包文件；`pnpm build:stage|build:product` 会使用对应模式并通过 `uploads3` 上传 `dist/`。
- `pnpm preview` 在本地预览构建产物。
- `pnpm lint` 运行扁平化 ESLint 配置，提交 PR 前必须通过。

## 代码风格与命名约定

优先使用函数式 React + TypeScript，并以 TanStack Query 处理异步数据。组件使用 PascalCase（如 `UserGrid.tsx`），hooks/工具使用 camelCase（如 `useSubmitBlock.ts`），资产使用 kebab-case。Tailwind 工具类直接写在标记中，仅在需要多层令牌时才退回 SCSS modules，并将特性样式与对应组件同址。格式化默认使用两个空格缩进、单引号、不写分号；依赖 ESLint 自动修复而非手动调整。

## 测试指南

目前尚未接入正式的测试运行器，因此每个 PR 必须记录基于 `pnpm dev` 执行的手动场景。一旦引入自动化测试，将 `*.spec.tsx` 与被测组件放在一起，通过 `src/mocks/handlers.ts` 模拟 HTTP，并使用 Vitest + React Testing Library。每个表单至少覆盖一个成功路径和一个防护路径，添加脚本后运行 `pnpm vitest run`，关键流程的语句覆盖率目标为 ≥80%。

## 提交与 PR 指南

使用 Conventional Commits，方便下游发布工具识别语义，例如 `feat(blocks): add publish toggle validation`。作用域需与涉及的模块一致（`apps`、`blocks`、`approvals`、`ui`、`mocks`）。每个 PR 都要关联 issue、概述动机、提供 UI 变更截图、列出手动测试步骤、标注环境变量，并在合并前等待 `pnpm lint`（及未来的测试）通过。

## 安全与配置提示

切勿提交敏感信息；只分享 `.env.sample`。本地保持 `VITE_ENABLE_MOCK=true`，当指向真实服务或运行上传脚本时，补充 `VITE_API_BASE_URL` 及 AWS 凭证。将 `uploads3` 密钥保存在终端配置中，通过 `aws sts get-caller-identity` 校验身份，并在共享构建产物前清理日志中的敏感数据。
