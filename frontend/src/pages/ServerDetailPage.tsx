import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Play,
  Square,
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
  RadioTower,
  Clock3,
  Route,
  FileText,
  ListTree,
  Activity,
  ShieldAlert,
  Eraser,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

function parseParams(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function buildListenAddress(instance: ServerInstance) {
  const params = parseParams(instance.params)
  const host = params.host || "0.0.0.0"
  const port = params.port || "8081"
  const basePath = params.basePath || ""
  return `http://${host}:${port}${basePath}`
}

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString("zh-CN") : "-"
}

function summarizeCondition(condition: string) {
  try {
    const parsed = JSON.parse(condition)
    if (parsed.type === "SIMPLE") {
      return [parsed.field, parsed.operator, parsed.value].filter(Boolean).join(" ")
    }
    return parsed.type || "复杂条件"
  } catch {
    return "条件解析失败"
  }
}

function summarizeResponse(response: string) {
  try {
    const parsed = JSON.parse(response)
    return `HTTP ${parsed.statusCode || 200}${parsed.delay ? ` · ${parsed.delay}ms` : ""}`
  } catch {
    return "响应解析失败"
  }
}

export function ServerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setPageActions } = useOutletContext<{
    setPageActions: (actions: React.ReactNode) => void
  }>()

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

  const fetchLogs = useCallback(
    async (page: number = 1) => {
      if (!id) return
      try {
        const data = await serverApi.listLogs(Number(id), page, 20)
        setLogs(data)
        setCurrentPage(page)
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "加载日志失败")
      }
    },
    [id],
  )

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
  }, [fetchInstance, fetchLogs, fetchRules, loading, navigate, setPageActions])

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

  const enabledRuleCount = useMemo(() => rules.filter((rule) => rule.enabled).length, [rules])

  if (!instance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const listenAddress = buildListenAddress(instance)
  const params = parseParams(instance.params)
  const paramEntries = Object.entries(params)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{instance.name}</CardTitle>
                  {getStatusBadge(instance.status)}
                  <Badge variant="outline">{instance.protocol}</Badge>
                </div>
                <CardDescription>
                  {instance.description || "暂无描述"}
                </CardDescription>
              </div>

              <div className="flex gap-2 shrink-0">
                {instance.status === "RUNNING" ? (
                  <Button variant="outline" onClick={handleStop} disabled={actioningId === instance.id}>
                    <Square className="size-4 mr-2" />
                    停止实例
                  </Button>
                ) : (
                  <Button onClick={handleStart} disabled={actioningId === instance.id}>
                    <Play className="size-4 mr-2" />
                    启动实例
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <RadioTower className="size-3.5" />
                  协议
                </div>
                <div className="mt-2 text-sm font-medium">{instance.protocol}</div>
              </div>

              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Route className="size-3.5" />
                  监听地址
                </div>
                <div className="mt-2 text-sm font-mono break-all">{listenAddress}</div>
              </div>

              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <ListTree className="size-3.5" />
                  匹配规则
                </div>
                <div className="mt-2 text-sm font-medium">
                  {rules.length} 条 / {enabledRuleCount} 条启用
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Activity className="size-3.5" />
                  请求日志
                </div>
                <div className="mt-2 text-sm font-medium">{logs?.total || 0} 条</div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <FileText className="size-3.5" />
                  参数摘要
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {paramEntries.length > 0 ? (
                    paramEntries.map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {key}={String(value)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">暂无参数</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Clock3 className="size-3.5" />
                  时间信息
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>创建时间：{formatTime(instance.createdAt)}</div>
                  <div>启动时间：{formatTime(instance.startTime)}</div>
                  <div>停止时间：{formatTime(instance.stopTime)}</div>
                </div>
                {instance.errorMessage && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldAlert className="size-4" />
                      错误信息
                    </div>
                    <div className="mt-1 break-all">{instance.errorMessage}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line">
            <TabsTrigger value="rules">匹配规则</TabsTrigger>
            <TabsTrigger value="logs">请求日志</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">规则列表</CardTitle>
                    <CardDescription>
                      高优先级规则会优先命中。启用状态可直接在列表中切换。
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={handleNewRule}>
                    <Plus className="size-4 mr-1" />
                    新建规则
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {rules.length === 0 ? (
                  <div className="flex items-center justify-center h-36 rounded-xl border-2 border-dashed bg-muted/20 text-sm text-muted-foreground">
                    暂无规则，点击右上角按钮开始创建
                  </div>
                ) : (
                  rules
                    .slice()
                    .sort((left, right) => right.priority - left.priority)
                    .map((rule) => (
                      <div key={rule.id} className="rounded-xl border bg-card p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium">{rule.name}</div>
                              <Badge variant={rule.enabled ? "secondary" : "outline"}>
                                {rule.enabled ? "启用" : "禁用"}
                              </Badge>
                              <Badge variant="outline">优先级 {rule.priority}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rule.description || "暂无描述"}
                            </div>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                              disabled={actioningId === rule.id}
                              title={rule.enabled ? "禁用" : "启用"}
                            >
                              {rule.enabled ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8"
                              onClick={() => handleEditRule(rule)}
                              title="编辑"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteRule(rule)}
                              disabled={actioningId === rule.id}
                              title="删除"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-lg border bg-muted/20 px-3 py-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              匹配条件
                            </div>
                            <div className="text-sm font-mono break-all">{summarizeCondition(rule.condition)}</div>
                          </div>
                          <div className="rounded-lg border bg-muted/20 px-3 py-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              响应摘要
                            </div>
                            <div className="text-sm font-medium">{summarizeResponse(rule.response)}</div>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          创建时间：{formatTime(rule.createdAt)}
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">请求日志</CardTitle>
                    <CardDescription>
                      展示最近请求的命中情况、响应状态码和处理耗时。
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLogs}
                    disabled={!logs || logs.total === 0}
                  >
                    <Eraser className="size-4 mr-1" />
                    清空日志
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {!logs || logs.records.length === 0 ? (
                  <div className="flex items-center justify-center h-36 rounded-xl border-2 border-dashed bg-muted/20 text-sm text-muted-foreground">
                    暂无日志
                  </div>
                ) : (
                  logs.records.map((log) => (
                    <div key={log.id} className="rounded-xl border bg-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{log.method}</Badge>
                            <div className="font-mono text-sm break-all">{log.path}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(log.createdAt)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Badge variant={log.statusCode >= 400 ? "destructive" : "secondary"}>
                            {log.statusCode}
                          </Badge>
                          <Badge variant="outline">{log.duration}ms</Badge>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border bg-muted/20 px-3 py-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            匹配结果
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.matchedRuleId ? `命中规则 #${log.matchedRuleId}` : "无匹配规则"}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-muted/20 px-3 py-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            请求体摘要
                          </div>
                          <div className="text-sm text-muted-foreground break-all">
                            {log.body ? log.body.slice(0, 120) : "无请求体"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {logs && logs.pages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
