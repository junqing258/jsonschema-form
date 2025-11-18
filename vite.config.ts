import AutoImport from 'unplugin-auto-import/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/

export default defineConfig((args) => {
  const { command, mode } = args
  const uploadUrl = {
    stage: 'https://file.reshg.com/hopegoo/appcenter-web/stage',
    prod: 'https://file.reshg.com/hopegoo/appcenter-web/product',
  }[mode] || ''

  return {
    base: command === 'build' ? uploadUrl : '/view',
    plugins: [
      codeInspectorPlugin({ bundler: 'vite' }),
      react(),
      AutoImport({
        imports: [
          'react',
          'react-router-dom',
          {
            'zustand': [['default', 'create']],
            'react-hook-form': ['useForm', 'Controller'],
            '@tanstack/react-query': ['useQuery', 'useMutation', 'useQueryClient'],
          },
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/hooks', 'src/stores'],
        eslintrc: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // 开发服务器配置
    server: {
      port: 5173,
      proxy: {
        // 代理 API 请求到后端服务器
        '/hgappcenrer/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // 如果后端已经有 /api 前缀，则不需要 rewrite
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@import "@/styles/variables.scss";`,
          silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api'],
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/\/react(?:-dom)?/.test(id)) {
              return 'react-vendor'
            }
          },
        }
      },
    },
  }
})

