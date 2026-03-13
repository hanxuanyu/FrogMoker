import { useCallback, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { toast } from "sonner"
import {
  Send,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlignLeft,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedMapEditor } from "@/components/EnhancedMapEditor"
import { TemplateTextEditor } from "@/components/TemplateTextEditor"
import { HttpRequestPreview } from "@/components/HttpRequestPreview"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { xml } from "@codemirror/lang-xml"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { useTheme } from "@/components/theme-provider"
import { templateApi, senderApi } from "@/api"
import type {
  MessageTemplateSummary,
  ProtocolClientDescriptor,
  ProtocolClientParamDescriptor,
  SendMessageResponse,
  MessageType,
  ParamDependency,
} from "@/types"

export function SenderPage() {
  const { setPageActions } = useOutletContext<{
    setPageActions: (actions: React.ReactNode) => void
  }>()
  const { theme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const [templates, setTemplates] = useState<MessageTemplateSummary[]>([])
  const [protocols, setProtocols] = useState<ProtocolClientDescriptor[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<string>("")
  const [clientParams, setClientParams] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [formattingResponse, setFormattingResponse] = useState(false)
  const [responseFormatted, setResponseFormatted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [response, setResponse] = useState<SendMessageResponse | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await templateApi.list()
      setTemplates(data)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载模板列表失败")
    }
  }, [])

  const fetchProtocols = useCallback(async () => {
    try {
      const data = await senderApi.listProtocols()
      setProtocols(data)
      if (data.length > 0) {
        setSelectedProtocol(data[0].protocol)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载协议列表失败")
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTemplates(), fetchProtocols()]).finally(() => setLoading(false))
  }, [fetchTemplates, fetchProtocols])

  // 设置页面操作按钮
  useEffect(() => {
    setPageActions(
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          fetchTemplates()
          fetchProtocols()
        }}
        disabled={loading}
      >
        <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    )
    return () => setPageActions(null)
  }, [loading, setPageActions, fetchTemplates, fetchProtocols])

  // 切换协议时重置参数
  useEffect(() => {
    if (selectedProtocol) {
      const protocol = protocols.find((p) => p.protocol === selectedProtocol)
      if (protocol) {
        const defaultParams: Record<string, string> = {}
        protocol.params.forEach((param) => {
          if (param.defaultValue) {
            defaultParams[param.name] = param.defaultValue
          }
        })
        setClientParams(defaultParams)
      }
    }
  }, [selectedProtocol, protocols])

  // 判断参数是否应该显示（基于依赖条件）
  const isParamVisible = (param: ProtocolClientParamDescriptor): boolean => {
    if (!param.dependency) return true

    const dep = param.dependency

    // 多依赖模式
    if (dep.dependencies && dep.dependencies.length > 0) {
      const results = dep.dependencies.map((subDep) => checkSingleDependency(subDep))
      if (dep.combineLogic === "AND") {
        return results.every((r) => r)
      } else {
        // OR
        return results.some((r) => r)
      }
    }

    // 单依赖模式
    return checkSingleDependency(dep)
  }

  // 检查单个依赖条件
  const checkSingleDependency = (dep: ParamDependency): boolean => {
    if (!dep.dependsOn) return true

    const dependValue = clientParams[dep.dependsOn] || ""

    switch (dep.condition) {
      case "EQUALS":
        return dep.expectedValues?.includes(dependValue) || false
      case "NOT_EQUALS":
        return !dep.expectedValues?.includes(dependValue)
      case "NOT_EMPTY":
        return !!dependValue && dependValue.trim() !== ""
      case "IS_EMPTY":
        return !dependValue || dependValue.trim() === ""
      default:
        return true
    }
  }

  // 渲染模板
  const handleTemplateRender = async (templateId: number): Promise<string> => {
    return await templateApi.render(templateId)
  }

  // 格式化内容
  const handleFormat = async (format: string, content: string): Promise<string> => {
    return await templateApi.format(format, content)
  }

  // 渲染不同类型的参数输入组件
  const renderParamInput = (param: ProtocolClientParamDescriptor) => {
    const value = clientParams[param.name] || param.defaultValue || ""

    switch (param.paramType) {
      case "SELECT":
        return (
          <Select
            value={value}
            onValueChange={(v) => setClientParams({ ...clientParams, [param.name]: v })}
          >
            <SelectTrigger id={param.name}>
              <SelectValue placeholder={param.placeholder || `选择${param.label}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "TEXTAREA":
        return (
          <TemplateTextEditor
            value={value}
            onChange={(v) => setClientParams({ ...clientParams, [param.name]: v })}
            format="JSON"
            isDark={isDark}
            templates={templates}
            onTemplateRender={handleTemplateRender}
            onFormat={handleFormat}
            label={param.label}
          />
        )

      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={param.name}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                setClientParams({ ...clientParams, [param.name]: String(checked) })
              }
            />
            <Label htmlFor={param.name} className="text-sm font-normal cursor-pointer">
              {value === "true" ? "是" : "否"}
            </Label>
          </div>
        )

      case "MAP":
        return (
          <EnhancedMapEditor
            value={value}
            onChange={(v) => setClientParams({ ...clientParams, [param.name]: v })}
            keyLabel={param.keyLabel}
            valueLabel={param.valueLabel}
            placeholder={param.placeholder}
            templates={templates.filter((t) => t.messageType === "MAP").map((t) => ({
              id: t.id,
              name: t.name,
              content: t.contentPreview,
            }))}
            onTemplateRender={handleTemplateRender}
            label={param.label}
          />
        )

      case "NUMBER":
        return (
          <Input
            id={param.name}
            type="number"
            placeholder={param.placeholder || param.description}
            value={value}
            onChange={(e) => setClientParams({ ...clientParams, [param.name]: e.target.value })}
          />
        )

      case "TEXT":
      default:
        return (
          <Input
            id={param.name}
            placeholder={param.placeholder || param.description}
            value={value}
            onChange={(e) => setClientParams({ ...clientParams, [param.name]: e.target.value })}
          />
        )
    }
  }

  const handleSend = async () => {
    if (!selectedProtocol) {
      toast.error("请选择协议类型")
      return
    }

    const protocol = protocols.find((p) => p.protocol === selectedProtocol)
    if (protocol) {
      for (const param of protocol.params) {
        if (param.required && !clientParams[param.name]?.trim()) {
          toast.error(`参数 [${param.label}] 为必填项`)
          return
        }
      }
    }

    setSending(true)
    setResponseFormatted(false)
    try {
      const result = await senderApi.send({
        protocol: selectedProtocol,
        clientParams,
      })
      setResponse(result)
      if (result.success) {
        toast.success("发送成功")
      } else {
        toast.error("发送失败")
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "发送失败")
    } finally {
      setSending(false)
    }
  }

  const handleFormatResponse = async () => {
    if (!response?.responseContent) return
    setFormattingResponse(true)
    try {
      const detectedType = detectResponseFormat(response.responseContent)
      const formatted = await templateApi.format(detectedType, response.responseContent)
      setResponse({ ...response, responseContent: formatted })
      setResponseFormatted(true)
      toast.success("格式化成功")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "格式化失败")
    } finally {
      setFormattingResponse(false)
    }
  }

  const handleCopyResponse = async () => {
    if (!response?.responseContent) return
    try {
      await navigator.clipboard.writeText(response.responseContent)
      setCopied(true)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("复制失败")
    }
  }

  const detectResponseFormat = (content: string): MessageType => {
    if (!content) return "JSON"
    const trimmed = content.trim()
    if (trimmed.startsWith("<")) return "XML"
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "JSON"
    return "JSON"
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-hidden flex">
        {/* 左侧：客户端配置区域 */}
        <div className="w-[480px] border-r flex flex-col shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 协议选择 */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                协议配置
              </h2>
              <Tabs value={selectedProtocol} onValueChange={setSelectedProtocol}>
                <TabsList className="w-full">
                  {protocols.map((p) => (
                    <TabsTrigger key={p.protocol} value={p.protocol} className="flex-1">
                      {p.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {protocols.map((protocol) => (
                  <TabsContent
                    key={protocol.protocol}
                    value={protocol.protocol}
                    className="space-y-3 mt-4"
                  >
                    <p className="text-xs text-muted-foreground">{protocol.description}</p>
                    {protocol.params.filter(isParamVisible).map((param) => (
                      <div key={param.name} className="space-y-2">
                        <Label htmlFor={param.name}>
                          {param.label}
                          {param.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {renderParamInput(param)}
                        {param.description && (
                          <p className="text-xs text-muted-foreground">{param.description}</p>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </div>

          {/* 发送按钮 */}
          <div className="p-6 border-t shrink-0 bg-muted/30">
            <Button
              className="w-full"
              onClick={handleSend}
              disabled={sending || !selectedProtocol}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              发送请求
            </Button>
          </div>
        </div>

        {/* 右侧：请求预览和响应区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 请求预览区域 - 占上半部分 */}
          <div className="flex-1 flex flex-col border-b overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-muted/30">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                请求预览
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedProtocol === "HTTP" ? (
                <HttpRequestPreview
                  params={clientParams}
                  isDark={isDark}
                  protocol={protocols.find((p) => p.protocol === selectedProtocol)}
                  isParamVisible={isParamVisible}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  暂不支持该协议的预览
                </div>
              )}
            </div>
          </div>

          {/* 响应结果区域 - 占下半部分 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-muted/30">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                响应结果
              </h2>
              {response && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {response.success ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : (
                      <XCircle className="size-4 text-red-500" />
                    )}
                    <span className={response.success ? "text-green-600" : "text-red-600"}>
                      {response.success ? "成功" : "失败"}
                    </span>
                  </div>
                  {response.statusCode && (
                    <span className="text-muted-foreground">状态码: {response.statusCode}</span>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{response.duration}ms</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0">
              {response ? (
                <>
                  {response.success && response.responseContent && (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          响应内容
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={handleCopyResponse}
                          >
                            {copied ? (
                              <Check className="size-3 text-green-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            {copied ? "已复制" : "复制"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            disabled={formattingResponse || responseFormatted}
                            onClick={handleFormatResponse}
                          >
                            {formattingResponse ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <AlignLeft className="size-3" />
                            )}
                            {responseFormatted ? "已格式化" : "格式化"}
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs flex-1 min-h-0 relative">
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ backgroundColor: isDark ? "#282c34" : "#ffffff" }}
                        >
                          <CodeMirror
                            value={response.responseContent}
                            height="100%"
                            extensions={[
                              detectResponseFormat(response.responseContent) === "JSON"
                                ? json()
                                : xml(),
                              EditorView.lineWrapping,
                            ]}
                            theme={isDark ? oneDark : "light"}
                            editable={false}
                            basicSetup={{
                              lineNumbers: true,
                              foldGutter: true,
                              highlightActiveLine: false,
                              highlightActiveLineGutter: false,
                            }}
                            style={{ height: "100%", overflow: "auto" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {!response.success && response.errorMessage && (
                    <div className="p-6">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        错误信息
                      </p>
                      <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all text-red-600 dark:text-red-400 border">
                        {response.errorMessage}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground bg-muted/50 border-2 border-dashed">
                  发送请求后将在此显示响应结果
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
