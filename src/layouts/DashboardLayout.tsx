import {
  AppWindow,
  Bell,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Settings,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user.store'

const navigation = [
  { name: '概览', href: '/', icon: LayoutDashboard },
  { name: '应用管理', href: '/apps', icon: AppWindow },
  { name: '区块管理', href: '/blocks', icon: Package },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout: logoutStore } = useUserStore()
  const isMobile = useIsMobile()

  // 响应式处理：屏幕宽度小于768px时自动收起侧边栏
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logoutStore()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">AppCenter</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(!sidebarOpen && 'mx-auto')}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !sidebarOpen && 'justify-center'
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* 底部用户信息 */}
        {sidebarOpen && user && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <div className={cn('transition-all duration-300', sidebarOpen ? 'pl-64' : 'pl-20')}>
        {/* 顶部栏 */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex-1 max-w-2xl">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索应用、区块..." className="pl-9" />
            </div> */}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  {/* <span className="hidden md:inline">{user?.username}</span> */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
