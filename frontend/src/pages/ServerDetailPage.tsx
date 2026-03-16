import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Plus, RefreshCw, Play, Square, Trash2, Pencil, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { MatchRuleFormDialog } from "@/components/MatchRuleFormDialog"
import { serverApi } from "@/api"
import type { ServerInstance, MatchRule, RequestLog, PageResult } from "@/types"

export function ServerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setPageActions } = useOutletContext<{ setPageActions: (actions: React.ReactNode) => void }>()

  const [instance, setInstance] = useState<ServerInstance | null>(null)
  const [rules, setRules] = useState<MatchRule[]>([])
  const [logs, setLogs] = useState<PageResult<RequestLog> | null>(null)
  const [loading, setLoading] = useState(false)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const [ruleFormOpen, setRuleFormOpen] = useState(false)
  const [editRule, setEditRule] = useState<MatchRule | null>(null)
  const [deleteRule, setDeleteRule] = useState<MatchRule | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("rules")

  const fetchInstance = useCallback(async () => {
    if (!id) return
    try {
      const data = await serverApi.getInstance(Number(id))
      setInstance(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载实例失败")
      navigate("/server")
    }
  }, [id, navigate])

  const fetchRules = useCallback(async () => {
    if (!id) return
    try {
      const data = await serverApi.listRules(Number(id))
      setRules(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载规则失败")
    }
  }, [id])

  const fetchLogs = useCallback(async (page: number = 1) => {
    if (!id) return
    try {
      const data = await serverApi.listLogs(Number(id), page, 20)
      setLogs(data)
      setCurrentPage(page)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载日志失败")
    }
  }, [id])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchInstance(), fetchRules(), fetchLogs()]).finally(() => setLoading(false))
  }, [fetchInstance, fetchRules, fetchLogs])

  useEffect(() => {
    setPageActions(
      <>
        <Button variant="outline" size="sm" onClick={() => navigate("/server")}>
          <ArrowLeft className="size-4 mr-1" />
          返回列表
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchInstance()
            fetchRules()
            fetchLogs()
          }}
          disabled={loading}
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </>
    )
    return () => setPageActions(null)
  }, [loading, setPageActions, navigate, fetchInstance, fetchRules, fetchLogs])

  const handleStart = async () => {
    if (!instance) return
    setActioningId(instance.id)
    try {
      await serverApi.startInstance(instance.id)
      toast.success("启动成功")
      fetchInstance()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "启动失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleStop = async () => {
    if (!instance) return
    setActioningId(instance.id)
    try {
      await serverApi.stopInstance(instance.id)
      toast.success("停止成功")
      fetchInstance()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "停止失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleNewRule = () => {
    setEditRule(null)
    setRuleFormOpen(true)
  }

  const handleEditRule = (rule: MatchRule) => {
    setEditRule(rule)
    setRuleFormOpen(true)
  }

  const handleToggleRule = async (ruleId: number, enabled: boolean) => {
    setActioningId(ruleId)
    try {
      await serverApi.toggleRule(ruleId, enabled)
      toast.success(enabled ? "已启用" : "已禁用")
      fetchRules()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "操作失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleDeleteRuleConfirm = async () => {
    if (!deleteRule) return
    setActioningId(deleteRule.id)
    setDeleteRule(null)
    try {
      await serverApi.deleteRule(deleteRule.id)
      toast.success("删除成功")
      fetchRules()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    } finally {
      setActioningId(null)
    }
  }

  const handleClearLogs = async () => {
    if (!id) return
    try {
      await serverApi.clearLogs(Number(id))
      toast.success("日志已清空")
      fetchLogs()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "清空失败")
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

  const getListenAddress = () => {
    if (!instance) return "-"
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

  if (!instance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 实例信息卡片 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{instance.name}</h2>
              {getStatusBadge(instance.status)}
            </div>
            {instance.description && (
              <p className="text-muted-foreground">{instance.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">协议类型：</span>
                <span className="font-medium">{instance.protocol}</span>
              </div>
              <div>
                <span className="text-muted-foreground">监听地址：</span>
                <span className="font-mono font-medium">{getListenAddress()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <span>{new Date(instance.createdAt).toLocaleString()}</span>
              </div>
              {instance.startTime && (
                <div>
                  <span className="text-muted-foreground">启动时间：</span>
                  <span>{new Date(instance.startTime).toLocaleString()}</span>
                </div>
              )}
            </div>
            {instance.errorMessage && (
              <div className="text-sm text-destructive">
                错误信息：{instance.errorMessage}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {instance.status === "RUNNING" ? (
              <Button
                variant="outline"
                onClick={handleStop}
                disabled={actioningId === instance.id}
              >
                <Square className="size-4 mr-2" />
                停止
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={actioningId === instance.id}
              >
                <Play className="size-4 mr-2" />
                启动
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">匹配规则 ({rules.length})</TabsTrigger>
          <TabsTrigger value="logs">请求日志 ({logs?.total || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleNewRule}>
              <Plus className="size-4 mr-1" />
              新建规则
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>规则名称</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      暂无规则，点击"新建规则"开始创建
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          {rule.description && (
                            <div className="text-xs text-muted-foreground">{rule.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        {rule.enabled ? (
                          <Badge className="bg-green-500">启用</Badge>
                        ) : (
                          <Badge variant="secondary">禁用</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(rule.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                            disabled={actioningId === rule.id}
                          >
                            {rule.enabled ? (
                              <ToggleRight className="size-4" />
                            ) : (
                              <ToggleLeft className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRule(rule)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteRule(rule)}
                            disabled={actioningId === rule.id}
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
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={!logs || logs.total === 0}
            >
              清空日志
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>方法</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>状态码</TableHead>
                  <TableHead>耗时</TableHead>
                  <TableHead>匹配规则</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!logs || logs.records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      暂无日志
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.records.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.method}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.path}</TableCell>
                      <TableCell>
                        <Badge
                          variant={log.statusCode >= 400 ? "destructive" : "secondary"}
                        >
                          {log.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.duration}ms</TableCell>
                      <TableCell>
                        {log.matchedRuleId ? (
                          <span className="text-xs text-muted-foreground">
                            规则 #{log.matchedRuleId}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">无匹配</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {logs && logs.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <div className="flex items-center px-4 text-sm text-muted-foreground">
                第 {currentPage} / {logs.pages} 页
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(currentPage + 1)}
                disabled={currentPage === logs.pages}
              >
                下一页
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MatchRuleFormDialog
        open={ruleFormOpen}
        onOpenChange={setRuleFormOpen}
        instanceId={instance.id}
        editTarget={editRule}
        onSuccess={fetchRules}
      />

      <AlertDialog open={!!deleteRule} onOpenChange={() => setDeleteRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除规则 "{deleteRule?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRuleConfirm}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
