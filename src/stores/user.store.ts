import Cookies from 'js-cookie'
import { authService } from '@/services/auth.service'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserInfo = {
  username: string
  department: string
  userId: string
  workId: string
  newWorkId: string
  departmentId: string
  gender: string
  email: string
  deptLevelId: string
  deptLevelName: string
  phoneNumber: string
  mobile: string
  memberId: string
  isVirtual: number
  deviceId: string
  avatar?: string
}

interface UserState {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean | undefined
  setUser: (user: UserInfo) => void
  logout: () => void
  initAuth: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, _get) => ({
      user: null,
      token: null,
      isAuthenticated: undefined,

      setUser: (user) => set({ user, isAuthenticated: true }),


      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      initAuth: () => {
        console.log('Initializing auth state...', import.meta.env)

        if (import.meta.env.DEV && !Cookies.get('hg_access_token')) {
          const hgAccessToken = prompt('请输入 hg_access_token，用于本地开发认证：')?.trim()
          if (hgAccessToken) {
            Cookies.set('hg_access_token', hgAccessToken, { expires: 30 })
          }
        }

        authService.getUserInfo().then((res) => {
          set({ user: res, isAuthenticated: true })
        }).catch(err => {
          console.error('Failed to get user info:', err)
          set({ isAuthenticated: false, user: null })
        })
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
)
