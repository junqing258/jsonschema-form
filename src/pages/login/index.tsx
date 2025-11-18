import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = () => {
    authService.login()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <img
              src="https://file.reshg.com/hopegoo/appcenter-web/stage/logo.svg"
              alt="AppCenter"
              className="h-16 w-16 mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">AppCenter</CardTitle>
          <CardDescription>应用和区块管理平台</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogin} className="w-full" size="lg">
            使用同程管家登录
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            点击登录即表示您同意我们的服务条款和隐私政策
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
