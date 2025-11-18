import { ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  /**
   * 返回文本，如果不提供则只显示图标
   */
  text?: string
  /**
   * 默认返回路径，当历史记录为空时使用
   */
  fallbackPath?: string
  /**
   * 自定义返回行为
   */
  onClick?: () => void
  /**
   * 按钮大小
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /**
   * 按钮样式
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  /**
   * 自定义类名
   */
  className?: string
}

export function BackButton({
  text = '返回',
  fallbackPath,
  onClick,
  size = 'sm',
  variant = 'ghost',
  className,
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    // 检查是否有历史记录可以回退
    if (window.history.length > 1) {
      navigate(-1)
    } else if (fallbackPath) {
      // 如果没有历史记录，使用默认路径
      navigate(fallbackPath)
    } else {
      // 默认回到首页
      navigate('/')
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleClick} className={className}>
      <ArrowLeft className={text ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />
      {text}
    </Button>
  )
}
