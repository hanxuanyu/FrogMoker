import { useState } from "react"
import { FileText, Send, Server, Menu, HelpCircle } from "lucide-react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { cn } from "@/lib/utils"

const navItems = [
  {
    to: "/templates",
    label: "报文管理",
    icon: FileText,
    description: "管理请求报文模板，支持 JSON / XML 格式及变量占位"
  },
  {
    to: "/sender",
    label: "报文发送",
    icon: Send,
    description: "选择模板和协议，配置参数后发送报文"
  },
  {
    to: "/server",
    label: "服务端管理",
    icon: Server,
    description: "管理模拟服务端实例，支持请求匹配和响应配置"
  },
]

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [pageActions, setPageActions] = useState<React.ReactNode>(null)
  const location = useLocation()

  // 获取当前页面信息
  const currentPage = navItems.find(item => location.pathname.startsWith(item.to))

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 固定侧边栏 */}
      <aside
        className={cn(
          "shrink-0 border-r bg-card flex flex-col transition-all duration-300 fixed left-0 top-0 bottom-0 z-20",
          collapsed ? "w-16" : "w-52"
        )}
      >
        <div className={cn(
          "flex items-center gap-2 px-5 py-4 border-b h-[57px]",
          collapsed && "px-3 justify-center"
        )}>
          {!collapsed && <span className="text-lg font-bold tracking-tight">FrogMoker</span>}
          {collapsed && <span className="text-lg font-bold">F</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center"
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 主内容区域 */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        collapsed ? "ml-16" : "ml-52"
      )}>
        {/* 固定顶部导航栏 */}
        <header className="h-[57px] border-b bg-background flex items-center px-4 shrink-0 fixed top-0 right-0 z-10 gap-3"
          style={{ left: collapsed ? "4rem" : "13rem" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="size-4" />
          </Button>

          {/* 页面标题和描述 */}
          {currentPage && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <currentPage.icon className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-semibold leading-none">{currentPage.label}</h1>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentPage.description}</p>
              </div>
            </div>
          )}

          {/* 页面操作按钮区域 */}
          <div className="flex items-center gap-2 shrink-0">
            {pageActions}
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-px h-6 bg-border mx-1" />
            <div className="scale-90 origin-right">
              <ThemeSwitcher />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title="帮助"
                >
                  <HelpCircle className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="https://github.com/hanxuanyu/FrogMoker" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <span>📖 项目文档</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://github.com/hanxuanyu/FrogMoker/issues" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <span>🐛 反馈问题</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://github.com/hanxuanyu/FrogMoker" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <span>⭐ GitHub 仓库</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 可滚动内容区域 */}
        <main className="flex-1 overflow-hidden mt-[57px]">
          <Outlet context={{ setPageActions }} />
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  )
}
