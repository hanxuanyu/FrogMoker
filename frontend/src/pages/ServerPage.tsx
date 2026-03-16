import { useCallback, useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, RefreshCw, Play, Square, RotateCw, Eye } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export function ServerPage() {
  const navigate = useNavigate()
  const { setPageActions } = useOutletContext<{ setPageActions: (actions: React.ReactNode) => void }>()
  const [list, setList] = useState<ServerInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ServerInstance | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServerInstance | null>(null)
  const [actioningId, setActioningId] = useState<number | null>(null)

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
  }, [loading, setPageActions])

  const handleNew = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

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

  const getListenAddress = (instance: ServerInstance) => {
    try {
      const params = JSON.parse(instance.params)
      const host = params.host || "0.0.0.0"
      const port = params.port || "8081"
      const basePath = params.basePath || ""
      return `http://${host}:${port}${basePath}`
    } catch {
      return "-"
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>协议</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>监听地址</TableHead>
              <TableHead>启动时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  加载中...
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  暂无数据，点击右上角"新建服务端"开始创建
                </TableCell>
              </TableRow>
            ) : (
              list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.protocol}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="font-mono text-sm">{getListenAddress(item)}</TableCell>
                  <TableCell>
                    {item.startTime ? new Date(item.startTime).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === "RUNNING" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStop(item.id)}
                            disabled={actioningId === item.id}
                          >
                            <Square className="size-4 mr-1" />
                            停止
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestart(item.id)}
                            disabled={actioningId === item.id}
                          >
                            <RotateCw className="size-4 mr-1" />
                            重启
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStart(item.id)}
                          disabled={actioningId === item.id}
                        >
                          <Play className="size-4 mr-1" />
                          启动
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/server/${item.id}`)}
                      >
                        <Eye className="size-4 mr-1" />
                        详情
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        disabled={item.status === "RUNNING"}
                        title={item.status === "RUNNING" ? "请先停止服务端后再编辑" : "编辑"}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                        disabled={actioningId === item.id}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
