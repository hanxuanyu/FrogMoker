import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

type ThemeMode = "light" | "system" | "dark"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // 循环切换主题
  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'system', 'dark']
    const currentIndex = modes.indexOf(theme as ThemeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex])
  }

  const themeTitle = useMemo(() => {
    switch (theme) {
      case 'light':
        return '当前：明亮模式，点击切换'
      case 'dark':
        return '当前：暗黑模式，点击切换'
      case 'system':
        return '当前：跟随系统，点击切换'
      default:
        return '切换主题'
    }
  }, [theme])

  return (
    <Button variant="ghost" onClick={cycleTheme} size="sm" className="w-9 h-9 p-0" title={themeTitle}>
      {/* Light Mode Icon */}
      {theme === 'light' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      {/* Dark Mode Icon */}
      {theme === 'dark' && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
      {/* System Mode Icon - 半太阳半月亮融合图标 */}
      {theme === 'system' && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {/* 左半边：太阳光线 */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1M12 20v1M5.5 5.5l.7.7M17.8 17.8l.7.7" />
          {/* 中间圆形 - 左半边太阳（填充） */}
          <path d="M12 8 A4 4 0 0 1 12 16 Z" fill="currentColor" stroke="none" />
          {/* 中间圆形 - 右半边月亮（描边） */}
          <path d="M12 8 A4 4 0 0 0 12 16" strokeWidth="2" strokeLinecap="round" />
          {/* 右半边：月亮装饰线 */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.5 5.5l-.7.7M6.2 17.8l-.7.7" />
        </svg>
      )}
    </Button>
  )
}
