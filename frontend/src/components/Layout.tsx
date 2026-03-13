import { useState } from "react"
import { FileText, Send, Menu } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/templates", label: "报文管理", icon: FileText },
  { to: "/sender", label: "报文发送", icon: Send },
]

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)

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
        <header className="h-[57px] border-b bg-background flex items-center px-4 shrink-0 fixed top-0 right-0 z-10 gap-2"
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
          <div className="flex-1" />
          <ThemeSwitcher />
        </header>

        {/* 可滚动内容区域 */}
        <main className="flex-1 overflow-hidden mt-[57px]">
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  )
}
