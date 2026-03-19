import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  Play,
  Copy,
  Check,
  Hash,
  FolderTree,
  Layers3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { TemplateFormDialog } from "@/components/TemplateFormDialog"
import { templateApi } from "@/api"
import type { MessageTemplateDetail, MessageTemplateSummary } from "@/types"

function formatTime(value: string) {
  return new Date(value).toLocaleString("zh-CN")
}

function parseMapPreview(content: string) {
  try {
    const parsed = JSON.parse(content)
    return Object.entries(parsed)
      .slice(0, 4)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(" | ")
  } catch {
    return content
  }
}

export function TemplatesPage() {
  const { setPageActions } = useOutletContext<{
    setPageActions: (actions: React.ReactNode) => void
  }>()

  const [list, setList] = useState<MessageTemplateSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MessageTemplateDetail | null>(null)
  const [previewItem, setPreviewItem] = useState<MessageTemplateDetail | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplateSummary | null>(null)
  const [renderedContent, setRenderedContent] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [activeTag, setActiveTag] = useState<string>("")

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await templateApi.list()
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

  const handleNew = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  useEffect(() => {
    setPageActions(
      <>
        <Button variant="outline" size="sm" onClick={fetchList} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={handleNew}>
          <Plus className="size-4 mr-1" />
          新建模板
        </Button>
      </>
    )
    return () => setPageActions(null)
  }, [fetchList, loading, setPageActions])

  const handleEdit = async (id: number) => {
    try {
      const detail = await templateApi.detail(id)
      setEditTarget(detail)
      setFormOpen(true)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载详情失败")
    }
  }

  const handlePreview = async (id: number) => {
    setPreviewLoading(true)
    try {
      const detail = await templateApi.detail(id)
      setPreviewItem(detail)
      setRenderedContent(null)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载详情失败")
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    setDeleteTarget(null)
    try {
      await templateApi.delete(deleteTarget.id)
      toast.success("删除成功")
      fetchList()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    } finally {
      setDeletingId(null)
    }
  }

  const handleRender = async (id: number) => {
    setRendering(true)
    try {
      const result = await templateApi.render(id)
      setRenderedContent(result)
      toast.success("渲染完成")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "渲染失败")
    } finally {
      setRendering(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  const visibleList = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return list.filter((item) => {
      const matchedTag = !activeTag || item.tags.includes(activeTag)
      if (!matchedTag) {
        return false
      }
      if (!normalizedKeyword) {
        return true
      }
      return [
        item.name,
        item.description,
        item.groupName,
        item.messageType,
        item.contentPreview,
        item.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword)
    })
  }, [activeTag, keyword, list])

  const groupEntries = useMemo(() => {
    const groupMap = new Map<string, MessageTemplateSummary[]>()
    visibleList.forEach((item) => {
      const key = item.groupName || "未分组"
      const current = groupMap.get(key) || []
      current.push(item)
      groupMap.set(key, current)
    })

    return Array.from(groupMap.entries())
      .sort(([left], [right]) => left.localeCompare(right, "zh-CN"))
      .map(([groupName, items]) => ({
        groupName,
        items: items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
      }))
  }, [visibleList])

  const allTags = useMemo(
    () => Array.from(new Set(list.flatMap((item) => item.tags))).sort((left, right) => left.localeCompare(right, "zh-CN")),
    [list],
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="size-4" />
              模板目录
            </CardTitle>
            <CardDescription>
              以列表形式展示更多模板信息，并按分组组织；标签可用于快速筛选同类模板。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  搜索模板
                </label>
                <Input
                  placeholder="按名称、描述、分组、标签或内容摘要搜索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  概览
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <div className="text-lg font-semibold">{list.length}</div>
                    <div className="text-xs text-muted-foreground">模板</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <div className="text-lg font-semibold">{groupEntries.length}</div>
                    <div className="text-xs text-muted-foreground">分组</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <div className="text-lg font-semibold">{allTags.length}</div>
                    <div className="text-xs text-muted-foreground">标签</div>
                  </div>
                </div>
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  标签筛选
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeTag ? "outline" : "default"}
                    size="sm"
                    className="h-7"
                    onClick={() => setActiveTag("")}
                  >
                    全部
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={activeTag === tag ? "default" : "outline"}
                      size="sm"
                      className="h-7"
                      onClick={() => setActiveTag((current) => (current === tag ? "" : tag))}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading && list.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            加载中...
          </div>
        ) : groupEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-2 rounded-xl border-2 border-dashed bg-muted/20">
            <p>{list.length === 0 ? "暂无报文模板" : "没有匹配当前筛选条件的模板"}</p>
            <div className="flex gap-2">
              {list.length === 0 ? (
                <Button variant="outline" size="sm" onClick={handleNew}>
                  <Plus className="size-4 mr-1" />
                  新建第一个模板
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { setKeyword(""); setActiveTag("") }}>
                  清空筛选
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {groupEntries.map((group) => (
              <section key={group.groupName} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderTree className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold truncate">{group.groupName}</h2>
                    <Badge variant="secondary">{group.items.length}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.items.map((item) => (
                    <Card key={item.id} size="sm" className="overflow-hidden">
                      <CardHeader className="border-b gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle className="text-sm">{item.name}</CardTitle>
                              <Badge variant="secondary">{item.messageType}</Badge>
                              <Badge variant="outline">{item.variableCount} 个变量</Badge>
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="gap-1">
                                  <Hash className="size-3" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {item.description ? (
                              <CardDescription>{item.description}</CardDescription>
                            ) : (
                              <CardDescription>暂无描述</CardDescription>
                            )}
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => handlePreview(item.id)}>
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(item.id)}>
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              disabled={deletingId === item.id}
                              onClick={() => setDeleteTarget(item)}
                            >
                              {deletingId === item.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-4">
                        <div className="rounded-lg border bg-muted/20 px-3 py-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            内容摘要
                          </div>
                          <pre className="text-xs whitespace-pre-wrap break-all font-mono text-muted-foreground">
                            {item.messageType === "MAP" ? parseMapPreview(item.contentPreview) : item.contentPreview}
                          </pre>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                          <span>创建时间：{formatTime(item.createdAt)}</span>
                          <span>更新时间：{formatTime(item.updatedAt)}</span>
                          <span>分组：{item.groupName}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <TemplateFormDialog
        open={formOpen}
        editTarget={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={fetchList}
      />

      <Dialog
        open={!!previewItem || previewLoading}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewItem(null)
            setRenderedContent(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {previewItem?.name || "模板详情"}
              {previewItem && <Badge variant="secondary">{previewItem.messageType}</Badge>}
              {previewItem && <Badge variant="outline">{previewItem.groupName}</Badge>}
            </DialogTitle>
            <DialogDescription>
              {previewItem?.description || "查看模板完整内容、标签和渲染结果"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {previewLoading || !previewItem ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="size-5 animate-spin mr-2" />
                加载中...
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {previewItem.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {previewItem.tags.length === 0 && <Badge variant="outline">无标签</Badge>}
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">模板内容</p>
                  <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all">
                    {previewItem.content}
                  </pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">变量清单</p>
                  {previewItem.variables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {previewItem.variables.map((variable) => (
                        <Badge key={variable.id} variant="secondary">
                          {variable.variableName} · {variable.generatorType}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground rounded-lg border border-dashed bg-muted/20 px-3 py-4">
                      该模板未配置变量
                    </div>
                  )}
                </div>

                <div className="min-h-[120px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">渲染结果</p>
                    {renderedContent !== null && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => handleCopy(renderedContent)}>
                        {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                        {copied ? "已复制" : "复制"}
                      </Button>
                    )}
                  </div>

                  {renderedContent !== null ? (
                    <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all text-green-600 dark:text-green-400">
                      {renderedContent}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-xs text-muted-foreground bg-muted/50 rounded-lg border-2 border-dashed">
                      点击下方按钮查看渲染结果
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0 bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              disabled={rendering || !previewItem}
              onClick={() => previewItem && handleRender(previewItem.id)}
            >
              {rendering ? <Loader2 className="size-4 animate-spin mr-1" /> : <Play className="size-4 mr-1" />}
              渲染报文
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模板「{deleteTarget?.name}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
