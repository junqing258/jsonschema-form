import { mockHandlers } from './handlers'

// 是否启用 Mock
const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK !== 'false'

// 拦截 axios 请求
export function setupMock() {
  if (!ENABLE_MOCK) {
    console.log('[Mock] Mock 数据已禁用')
    return
  }

  console.log('[Mock] Mock 数据已启用')

  // 使用动态导入以避免在生产环境中加载
  import('axios-mock-adapter').then(({ default: MockAdapter }) => {
    import('@/lib/request').then(({ default: request }) => {
      const mock = new MockAdapter(request, { delayResponse: 300 })

      // 应用相关 API
      mock.onGet(/\/apps$/).reply(config => {
        const params = config.params || {}
        return mockHandlers.getApps(params).then(data => [200, { code: 0, data }])
      })

      mock.onGet(/\/apps\/([^/]+)$/).reply(config => {
        const id = config.url?.match(/\/apps\/([^/]+)$/)?.[1]
        if (!id) return [400, { code: 400, message: '参数错误' }]

        return mockHandlers.getAppById(id).then(data => {
          if (!data) return [404, { code: 404, message: '应用不存在' }]
          return [200, { code: 0, data }]
        })
      })

      mock.onPost('/apps').reply(config => {
        const data = JSON.parse(config.data)
        return mockHandlers.createApp(data).then(result => [200, { code: 0, data: result }])
      })

      mock.onGet(/\/apps\/([^/]+)\/members\/me$/).reply(config => {
        const appId = config.url?.match(/\/apps\/([^/]+)\/members\/me$/)?.[1]
        if (!appId) return [400, { code: 400, message: '参数错误' }]

        return mockHandlers.getMyMembership(appId).then(member => {
          if (!member) {
            return [404, { code: 404, message: '成员不存在' }]
          }
          return [200, { code: 0, data: member }]
        })
      })

      mock.onGet(/\/apps\/([^/]+)\/members/).reply(config => {
        const appId = config.url?.match(/\/apps\/([^/]+)\/members/)?.[1]
        if (!appId) return [400, { code: 400, message: '参数错误' }]

        const params = config.params || {}
        return mockHandlers.getAppMembers(appId, params).then(data => [200, { code: 0, data }])
      })

      mock.onPost(/\/apps\/([^/]+)\/members/).reply(config => {
        const appId = config.url?.match(/\/apps\/([^/]+)\/members/)?.[1]
        if (!appId) return [400, { code: 400, message: '参数错误' }]

        const data = JSON.parse(config.data)
        return mockHandlers.addAppMember(appId, data).then(result => [200, { code: 0, data: result }])
      })

      mock.onPut(/\/apps\/([^/]+)\/members\/([^/]+)/).reply(config => {
        const match = config.url?.match(/\/apps\/([^/]+)\/members\/([^/]+)/)
        if (!match) return [400, { code: 400, message: '参数错误' }]
        const [, appId, memberId] = match
        const data = JSON.parse(config.data || '{}')
        return mockHandlers.updateAppMember(appId, memberId, data).then(result => [200, { code: 0, data: result }])
      })

      // 区块相关 API
      mock.onGet(/\/blocks$/).reply(config => {
        const params = config.params || {}
        return mockHandlers.getBlocks(params).then(data => [200, { code: 0, data }])
      })

      mock.onGet(/\/blocks\/([^/]+)$/).reply(config => {
        const id = config.url?.match(/\/blocks\/([^/]+)$/)?.[1]
        if (!id) return [400, { code: 400, message: '参数错误' }]

        return mockHandlers.getBlockById(id).then(data => {
          if (!data) return [404, { code: 404, message: '区块不存在' }]
          return [200, { code: 0, data }]
        })
      })

      mock.onPost('/blocks').reply(config => {
        const data = JSON.parse(config.data)
        return mockHandlers.createBlock(data).then(result => [200, { code: 0, data: result }])
      })

      // 区块版本相关 API
      mock.onGet(/\/blocks\/([^/]+)\/versions/).reply(config => {
        const blockId = config.url?.match(/\/blocks\/([^/]+)\/versions/)?.[1]
        if (!blockId) return [400, { code: 400, message: '参数错误' }]

        return mockHandlers.getBlockVersions(blockId).then(data => [200, { code: 0, data }])
      })

      mock.onPost('/blocks/versions').reply(config => {
        // 处理 FormData
        const formData = config.data
        const data = {
          blockId: formData.get('blockId'),
          version: formData.get('version'),
          changelog: formData.get('changelog'),
          packageFile: formData.get('package'),
        }
        return mockHandlers.createBlockVersion(data).then(result => [200, { code: 0, data: result }])
      })

      mock.onPost(/\/blocks\/versions\/([^/]+)\/publish/).reply(config => {
        const versionId = config.url?.match(/\/blocks\/versions\/([^/]+)\/publish/)?.[1]
        if (!versionId) return [400, { code: 400, message: '参数错误' }]

        const { environment = 'staging' } = JSON.parse(config.data || '{}')
        return mockHandlers.publishVersion(versionId, environment).then(result => [200, { code: 0, data: result }])
      })

      mock.onPost(/\/blocks\/versions\/([^/]+)\/unpublish/).reply(config => {
        const versionId = config.url?.match(/\/blocks\/versions\/([^/]+)\/unpublish/)?.[1]
        if (!versionId) return [400, { code: 400, message: '参数错误' }]

        const { environment = 'staging' } = JSON.parse(config.data || '{}')
        return mockHandlers.unpublishVersion(versionId, environment).then(result => [200, { code: 0, data: result }])
      })

      mock.onPost('/approvals').reply(config => {
        const { versionId } = JSON.parse(config.data || '{}')
        return mockHandlers.submitApproval(versionId).then(result => [200, { code: 0, data: result }])
      })

      // 审批相关 API
      mock.onGet('/approvals').reply(config => {
        const params = config.params || {}
        return mockHandlers.getApprovalRequests(params).then(data => [200, { code: 0, data }])
      })

      mock.onPost(/\/approvals\/([^/]+)\/approve/).reply(config => {
        const id = config.url?.match(/\/approvals\/([^/]+)\/approve/)?.[1]
        if (!id) return [400, { code: 400, message: '参数错误' }]

        const { comment } = JSON.parse(config.data || '{}')
        return mockHandlers.approveRequest(id, comment).then(result => [200, { code: 0, data: result }])
      })

      mock.onPost(/\/approvals\/([^/]+)\/reject/).reply(config => {
        const id = config.url?.match(/\/approvals\/([^/]+)\/reject/)?.[1]
        if (!id) return [400, { code: 400, message: '参数错误' }]

        const { comment } = JSON.parse(config.data || '{}')
        return mockHandlers.rejectRequest(id, comment).then(result => [200, { code: 0, data: result }])
      })

      console.log('[Mock] Mock API 已配置完成')
    })
  }).catch(err => {
    console.error('[Mock] 加载 axios-mock-adapter 失败，请安装: npm install axios-mock-adapter -D', err)
  })
}
