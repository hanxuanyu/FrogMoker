import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Eye, Loader2, RefreshCw, Play, ChevronDown, ChevronRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export function TemplatesPage() {
  const [list, setList] = useState<MessageTemplateSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MessageTemplateDetail | null>(null)
  const [previewItem, setPreviewItem] = useState<MessageTemplateSummary | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplateSummary | null>(null)
  const [renderedContent, setRenderedContent] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

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

  const handleEdit = async (id: number) => {
    try {
      const detail = await templateApi.detail(id)
      setEditTarget(detail)
      setFormOpen(true)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载详情失败")
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

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleNew = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 页头 */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-background">
        <div>
          <h1 className="text-lg font-semibold">报文管理</h1>
          <p className="text-sm text-muted-foreground">管理请求报文模板，支持 JSON / XML 格式及变量占位</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchList} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={handleNew}>
            <Plus className="size-4 mr-1" />
            新建模板
          </Button>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && list.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" />
            加载中...
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <p>暂无报文模板</p>
            <Button variant="outline" size="sm" onClick={handleNew}>
              <Plus className="size-4 mr-1" />
              新建第一个模板
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {list.map((item) => {
              const expanded = expandedIds.has(item.id)
              return (
                <div
                  key={item.id}
                  className="border rounded-lg bg-card hover:shadow-sm transition-shadow"
                >
                  {/* 卡片头部：始终显示 */}
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <button
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expanded ? (
                        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium truncate">{item.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {item.messageType}
                      </Badge>
                      {item.description && (
                        <span className="text-sm text-muted-foreground truncate hidden sm:block">
                          {item.description}
                        </span>
                      )}
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="预览"
                        onClick={() => setPreviewItem(item)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="编辑"
                        onClick={() => handleEdit(item.id)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title="删除"
                        disabled={deletingId === item.id}
                        onClick={() => setDeleteTarget(item)}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 展开区域：预览内容 */}
                  {expanded && (
                    <div className="px-4 pb-4 border-t pt-3">
                      <pre className="text-xs font-mono bg-muted rounded p-3 max-h-48 overflow-y-auto text-muted-foreground whitespace-pre-wrap break-all">
                        {item.contentPreview}
                      </pre>
                      <p className="text-xs text-muted-foreground mt-2">
                        更新于 {new Date(item.updatedAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 新建/编辑模态框 */}
      <TemplateFormDialog
        open={formOpen}
        editTarget={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={fetchList}
      />

      {/* 预览模态框 */}
      <Dialog open={!!previewItem} onOpenChange={(v) => { if (!v) { setPreviewItem(null); setRenderedContent(null) } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {previewItem?.name}
              <Badge variant="secondary" className="text-xs">
                {previewItem?.messageType}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {previewItem?.description || "报文模板预览"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">模板内容</p>
              <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all">
                {previewItem?.contentPreview}
              </pre>
            </div>
            <div className="min-h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">渲染结果</p>
                {renderedContent !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs gap-1"
                    onClick={() => handleCopy(renderedContent)}
                  >
                    {copied ? (
                      <Check className="size-3 text-green-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copied ? "已复制" : "复制"}
                  </Button>
                )}
              </div>
              {renderedContent !== null ? (
                <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all text-green-600 dark:text-green-400 transition-opacity duration-200">
                  {renderedContent}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground bg-muted/50 rounded-lg border-2 border-dashed">
                  点击下方「渲染报文」按钮查看渲染结果
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0 bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              disabled={rendering}
              onClick={() => previewItem && handleRender(previewItem.id)}
            >
              {rendering ? (
                <Loader2 className="size-4 animate-spin mr-1" />
              ) : (
                <Play className="size-4 mr-1" />
              )}
              渲染报文
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
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
