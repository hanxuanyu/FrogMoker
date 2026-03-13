import { useState, useEffect, useMemo } from "react"
import { useTheme } from "@/components/theme-provider"

type ThemeMode = "light" | "system" | "dark"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 获取当前主题的图标信息
  const currentIcon = useMemo(() => {
    switch (theme) {
      case 'light':
        return { index: 0, color: 'text-amber-500' }
      case 'system':
        return { index: 1, color: 'text-blue-500 dark:text-blue-400' }
      case 'dark':
        return { index: 2, color: 'text-indigo-500 dark:text-indigo-400' }
      default:
        return { index: 0, color: 'text-amber-500' }
    }
  }, [theme])

  // 计算指示器位置（展开时）
  const indicatorPosition = useMemo(() => {
    if (theme === 'light') return '0.0625rem'
    if (theme === 'system') return '1.75rem'
    return '3.4375rem'
  }, [theme])

  // 计算容器偏移（收起时让当前按钮居中显示）
  const containerOffset = useMemo(() => {
    if (isExpanded) return '0px'
    return `${-currentIcon.index * 28}px` // 28px = w-7 = 1.75rem
  }, [isExpanded, currentIcon.index])

  // 循环切换主题（移动端）
  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'system', 'dark']
    const currentIndex = modes.indexOf(theme as ThemeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex])
  }

  // 处理鼠标进入（仅桌面端）
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true)
    }
  }

  // 处理鼠标离开（仅桌面端）
  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false)
    }
  }

  // 处理点击
  const handleClick = () => {
    if (isMobile) {
      cycleTheme()
    }
  }

  // 处理按钮点击
  const handleButtonClick = (mode: ThemeMode, event: React.MouseEvent) => {
    if (isMobile) {
      return
    }
    event.stopPropagation()
    setTheme(mode)
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer"
      style={{
        width: isExpanded ? '5.5rem' : '2rem',
        padding: '0.125rem'
      }}
    >
      {/* 容器，用于横向滑动显示当前按钮 */}
      <div
        className="relative flex items-center transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${containerOffset})` }}
      >
        {/* 滑动指示器（仅展开时显示） */}
        {isExpanded && (
          <div
            className="absolute top-0 bottom-0 w-7 bg-white dark:bg-gray-600 rounded-full shadow-sm transition-all duration-300 ease-in-out"
            style={{ left: indicatorPosition }}
          />
        )}

        {/* 浅色模式按钮 */}
        <button
          onClick={(e) => handleButtonClick('light', e)}
          className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 flex-shrink-0 ${
            theme === 'light'
              ? 'text-amber-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={isExpanded ? '浅色模式' : ''}
          type="button"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        </button>

        {/* 自动模式按钮 */}
        <button
          onClick={(e) => handleButtonClick('system', e)}
          className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 flex-shrink-0 ${
            theme === 'system'
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={isExpanded ? '跟随系统' : ''}
          type="button"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        </button>

        {/* 深色模式按钮 */}
        <button
          onClick={(e) => handleButtonClick('dark', e)}
          className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 flex-shrink-0 ${
            theme === 'dark'
              ? 'text-indigo-500 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={isExpanded ? '深色模式' : ''}
          type="button"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
