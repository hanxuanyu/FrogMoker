import { FileText } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const navItems = [{ to: "/templates", label: "报文管理", icon: FileText }]

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-52 shrink-0 border-r bg-card flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          <span className="text-lg font-bold tracking-tight">FrogMoker</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      <Toaster richColors position="top-right" />
    </div>
  )
}
