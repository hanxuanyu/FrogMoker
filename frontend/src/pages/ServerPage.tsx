import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Play,
  Square,
  RotateCw,
  Eye,
  RadioTower,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ServerInstanceFormDialog } from "@/components/ServerInstanceFormDialog"
import { serverApi } from "@/api"
import type { ServerInstance } from "@/types"

function parseParams(instance: ServerInstance): Record<string, string> {
  try {
    return JSON.parse(instance.params)
  } catch {
    return {}
  }
}

function buildListenAddress(instance: ServerInstance) {
  const params = parseParams(instance)
  const host = params.host || "0.0.0.0"
  const port = params.port || "8081"
  const basePath = params.basePath || ""
  return `http://${host}:${port}${basePath}`
}

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString("zh-CN") : "-"
}

export function ServerPage() {
  const navigate = useNavigate()
  const { setPageActions } = useOutletContext<{ setPageActions: (actions: React.ReactNode) => void }>()
  const [list, setList] = useState<ServerInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ServerInstance | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServerInstance | null>(null)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "RUNNING" | "STOPPED" | "FAILED">("")

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await serverApi.listInstances()
      setList(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const handleNew = useCallback(() => {
    setEditTarget(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    setPageActions(
      <>
        <Button variant="outline" size="sm" onClick={fetchList} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={handleNew}>
          <Plus className="size-4 mr-1" />
          新建服务端
        </Button>
      </>
    )
    return () => setPageActions(null)
  }, [fetchList, handleNew, loading, setPageActions])

  const handleEdit = (instance: ServerInstance) => {
    setEditTarget(instance)
    setFormOpen(true)
  }

  const handleStart = async (id: number) => {
    setActioningId(id)
    try {
      await serverApi.startInstance(id)
      toast.success("启动成功")
      fetchList()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "启动失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleStop = async (id: number) => {
    setActioningId(id)
    try {
      await serverApi.stopInstance(id)
      toast.success("停止成功")
      fetchList()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "停止失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleRestart = async (id: number) => {
    setActioningId(id)
    try {
      await serverApi.restartInstance(id)
      toast.success("重启成功")
      fetchList()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "重启失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setActioningId(deleteTarget.id)
    setDeleteTarget(null)
    try {
      await serverApi.deleteInstance(deleteTarget.id)
      toast.success("删除成功")
      fetchList()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    } finally {
      setActioningId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RUNNING":
        return <Badge className="bg-green-500">运行中</Badge>
      case "STOPPED":
        return <Badge variant="secondary">已停止</Badge>
      case "FAILED":
        return <Badge variant="destructive">失败</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const visibleList = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return list.filter((item) => {
      if (statusFilter && item.status !== statusFilter) {
        return false
      }
      if (!normalizedKeyword) {
        return true
      }
      return [
        item.name,
        item.description || "",
        item.protocol,
        buildListenAddress(item),
        item.params,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    })
  }, [keyword, list, statusFilter])

  const runningCount = list.filter((item) => item.status === "RUNNING").length
  const stoppedCount = list.filter((item) => item.status === "STOPPED").length
  const failedCount = list.filter((item) => item.status === "FAILED").length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <RadioTower className="size-4" />
              服务端实例总览
            </CardTitle>
            <CardDescription>
              统一查看实例状态、监听地址和运行情况，并从这里完成启动、停止、重启和进入详情页。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  搜索实例
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="按名称、描述、协议、监听地址搜索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  运行概况
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
                    <div className="text-lg font-semibold">{list.length}</div>
                    <div className="text-xs text-muted-foreground">总数</div>
                  </div>
                  <div className="rounded-lg border bg-green-500/10 px-3 py-2 text-center">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">{runningCount}</div>
                    <div className="text-xs text-muted-foreground">运行中</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2 text-center">
                    <div className="text-lg font-semibold">{stoppedCount}</div>
                    <div className="text-xs text-muted-foreground">已停止</div>
                  </div>
                  <div className="rounded-lg border bg-destructive/10 px-3 py-2 text-center">
                    <div className="text-lg font-semibold text-destructive">{failedCount}</div>
                    <div className="text-xs text-muted-foreground">失败</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "" ? "default" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => setStatusFilter("")}
              >
                全部
              </Button>
              <Button
                variant={statusFilter === "RUNNING" ? "default" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => setStatusFilter("RUNNING")}
              >
                运行中
              </Button>
              <Button
                variant={statusFilter === "STOPPED" ? "default" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => setStatusFilter("STOPPED")}
              >
                已停止
              </Button>
              <Button
                variant={statusFilter === "FAILED" ? "default" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => setStatusFilter("FAILED")}
              >
                失败
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && list.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            加载中...
          </div>
        ) : visibleList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-2 rounded-xl border-2 border-dashed bg-muted/20">
            <p>{list.length === 0 ? "暂无服务端实例" : "没有匹配当前筛选条件的实例"}</p>
            <div className="flex gap-2">
              {list.length === 0 ? (
                <Button variant="outline" size="sm" onClick={handleNew}>
                  <Plus className="size-4 mr-1" />
                  新建第一个服务端
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { setKeyword(""); setStatusFilter("") }}>
                  清空筛选
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleList.map((item) => {
              const listenAddress = buildListenAddress(item)
              const params = parseParams(item)
              const summaryParams = Object.entries(params).slice(0, 4)

              return (
                <Card key={item.id} size="sm" className="overflow-hidden">
                  <CardHeader className="border-b gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          {getStatusBadge(item.status)}
                          <Badge variant="outline">{item.protocol}</Badge>
                        </div>
                        <CardDescription>{item.description || "暂无描述"}</CardDescription>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        {item.status === "RUNNING" ? (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => handleStop(item.id)}
                              disabled={actioningId === item.id}
                              title="停止"
                            >
                              <Square className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => handleRestart(item.id)}
                              disabled={actioningId === item.id}
                              title="重启"
                            >
                              <RotateCw className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => handleStart(item.id)}
                            disabled={actioningId === item.id}
                            title="启动"
                          >
                            <Play className="size-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="size-8" onClick={() => navigate(`/server/${item.id}`)} title="详情">
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => handleEdit(item)}
                          disabled={item.status === "RUNNING"}
                          title={item.status === "RUNNING" ? "请先停止服务端后再编辑" : "编辑"}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                          disabled={actioningId === item.id}
                          title="删除"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border bg-muted/20 px-3 py-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          监听地址
                        </div>
                        <div className="font-mono text-sm break-all">{listenAddress}</div>
                      </div>

                      <div className="rounded-lg border bg-muted/20 px-3 py-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          参数摘要
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {summaryParams.length > 0 ? (
                            summaryParams.map(([key, value]) => (
                              <Badge key={key} variant="outline">
                                {key}={String(value)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">暂无参数</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                      <span>创建时间：{formatTime(item.createdAt)}</span>
                      <span>启动时间：{formatTime(item.startTime)}</span>
                      {item.errorMessage && <span className="text-destructive">错误：{item.errorMessage}</span>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ServerInstanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editTarget={editTarget}
        onSuccess={fetchList}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除服务端实例 "{deleteTarget?.name}" 吗？此操作无法撤销。
              {deleteTarget?.status === "RUNNING" && (
                <span className="block mt-2 text-destructive">
                  注意：该实例正在运行中，删除前会自动停止。
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
