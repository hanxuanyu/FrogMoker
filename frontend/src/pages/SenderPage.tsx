import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Send, Loader2, RefreshCw, CheckCircle2, XCircle, Clock, FileText, Edit3, AlignLeft, ClipboardPaste, Copy, Check } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { xml } from "@codemirror/lang-xml"
import { oneDark } from "@codemirror/theme-one-dark"
import { templateApi, senderApi } from "@/api"
import type {
  MessageTemplateSummary,
  ProtocolClientDescriptor,
  SendMessageResponse,
  MessageType,
} from "@/types"

export function SenderPage() {
  const [templates, setTemplates] = useState<MessageTemplateSummary[]>([])
  const [protocols, setProtocols] = useState<ProtocolClientDescriptor[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<string>("")
  const [clientParams, setClientParams] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>("")
  const [customContent, setCustomContent] = useState<string>("")
  const [customContentType, setCustomContentType] = useState<MessageType>("JSON")
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [formatting, setFormatting] = useState(false)
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

  useEffect(() => {
    if (selectedTemplateId) {
      setIsCustomMode(false)
      handlePreview()
    } else {
      setPreviewContent("")
    }
  }, [selectedTemplateId])

  const handleTemplateChange = (value: string) => {
    if (value === "custom") {
      setSelectedTemplateId(null)
      setIsCustomMode(true)
      setPreviewContent("")
      setCustomContent("")
    } else {
      setSelectedTemplateId(Number(value))
      setIsCustomMode(false)
    }
  }

  const handleFormat = async () => {
    if (!customContent.trim()) return
    setFormatting(true)
    try {
      const formatted = await templateApi.format(customContentType, customContent)
      setCustomContent(formatted)
      toast.success("格式化成功")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "格式化失败")
    } finally {
      setFormatting(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setCustomContent(text)
        toast.success("已粘贴剪贴板内容")
      } else {
        toast.error("剪贴板为空")
      }
    } catch {
      toast.error("读取剪贴板失败")
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

  const handlePreview = async () => {
    if (!selectedTemplateId) return
    setRendering(true)
    try {
      const result = await templateApi.render(selectedTemplateId)
      setPreviewContent(result)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "预览失败")
      setPreviewContent("")
    } finally {
      setRendering(false)
    }
  }

  const handleSend = async () => {
    if (!selectedTemplateId && !isCustomMode) {
      toast.error("请选择报文模板或使用自定义模式")
      return
    }
    if (isCustomMode && !customContent.trim()) {
      toast.error("请输入自定义报文内容")
      return
    }
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
        templateId: selectedTemplateId || undefined,
        customContent: isCustomMode ? customContent : undefined,
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

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  const detectResponseFormat = (content: string): MessageType => {
    if (!content) return "JSON"
    const trimmed = content.trim()
    if (trimmed.startsWith("<")) return "XML"
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "JSON"
    return "JSON"
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div>
          <h1 className="text-lg font-semibold">报文发送</h1>
          <p className="text-sm text-muted-foreground">选择模板和协议，配置参数后发送报文</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchTemplates(); fetchProtocols() }} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* 左侧：配置区域 */}
        <div className="w-[480px] border-r flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 模板选择 */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">报文来源</h2>
              <div className="space-y-2">
                <Label htmlFor="template">选择模板或自定义</Label>
                <Select
                  value={isCustomMode ? "custom" : (selectedTemplateId?.toString() || "")}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="选择报文模板或自定义输入" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Edit3 className="size-3" />
                        <span>自定义输入</span>
                      </div>
                    </SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        <div className="flex items-center gap-2">
                          <FileText className="size-3" />
                          <span>{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && !isCustomMode && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.description || "无描述"}
                  </p>
                )}
                {isCustomMode && (
                  <p className="text-xs text-muted-foreground">
                    在右侧预览区域直接输入报文内容
                  </p>
                )}
              </div>
            </section>

            {/* 协议选择 */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">协议配置</h2>
              <Tabs value={selectedProtocol} onValueChange={setSelectedProtocol}>
                <TabsList className="w-full">
                  {protocols.map((p) => (
                    <TabsTrigger key={p.protocol} value={p.protocol} className="flex-1">
                      {p.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {protocols.map((protocol) => (
                  <TabsContent key={protocol.protocol} value={protocol.protocol} className="space-y-3 mt-4">
                    <p className="text-xs text-muted-foreground">{protocol.description}</p>
                    {protocol.params.map((param) => (
                      <div key={param.name} className="space-y-2">
                        <Label htmlFor={param.name}>
                          {param.label}
                          {param.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {param.paramType === "SELECT" ? (
                          <Select
                            value={clientParams[param.name] || ""}
                            onValueChange={(v) => setClientParams({ ...clientParams, [param.name]: v })}
                          >
                            <SelectTrigger id={param.name}>
                              <SelectValue placeholder={`选择${param.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={param.name}
                            placeholder={param.description}
                            value={clientParams[param.name] || ""}
                            onChange={(e) => setClientParams({ ...clientParams, [param.name]: e.target.value })}
                          />
                        )}
                        <p className="text-xs text-muted-foreground">{param.description}</p>
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
              disabled={sending || (!selectedTemplateId && !isCustomMode) || !selectedProtocol || (isCustomMode && !customContent.trim())}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Send className="size-4 mr-2" />
              )}
              发送报文
            </Button>
          </div>
        </div>

        {/* 右侧：预览和响应区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 请求预览 */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {isCustomMode ? "自定义报文" : "请求预览"}
                </h2>
                <div className="flex gap-2">
                  {isCustomMode && (
                    <>
                      <Select
                        value={customContentType}
                        onValueChange={(v) => setCustomContentType(v as MessageType)}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JSON">JSON</SelectItem>
                          <SelectItem value="XML">XML</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={handlePaste}
                      >
                        <ClipboardPaste className="size-3" />
                        粘贴
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        disabled={formatting || !customContent.trim()}
                        onClick={handleFormat}
                      >
                        {formatting ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <AlignLeft className="size-3" />
                        )}
                        格式化
                      </Button>
                    </>
                  )}
                  {selectedTemplateId && !isCustomMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handlePreview}
                      disabled={rendering}
                    >
                      {rendering ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="size-3 mr-1" />
                      )}
                      刷新
                    </Button>
                  )}
                </div>
              </div>
              {isCustomMode ? (
                <div className="rounded-md overflow-hidden border text-xs">
                  <CodeMirror
                    value={customContent}
                    height="400px"
                    extensions={customContentType === "JSON" ? [json()] : [xml()]}
                    theme={oneDark}
                    placeholder={customContentType === "JSON"
                      ? '{\n  "key": "value"\n}'
                      : '<root>\n  <element>value</element>\n</root>'}
                    onChange={(val) => setCustomContent(val)}
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      autocompletion: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      indentOnInput: true,
                    }}
                  />
                </div>
              ) : selectedTemplateId ? (
                rendering ? (
                  <div className="flex items-center justify-center h-48 text-xs text-muted-foreground bg-muted/50 rounded-lg border">
                    <Loader2 className="size-4 animate-spin mr-2" />
                    渲染中...
                  </div>
                ) : previewContent ? (
                  <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all max-h-96 overflow-y-auto border">
                    {previewContent}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-48 text-xs text-muted-foreground bg-muted/50 rounded-lg border-2 border-dashed">
                    渲染失败或内容为空
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-48 text-xs text-muted-foreground bg-muted/50 rounded-lg border-2 border-dashed">
                  请选择报文模板或使用自定义模式
                </div>
              )}
            </section>

            {/* 响应结果 */}
            {response && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">响应结果</h2>
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
                </div>

                {response.success && response.responseContent && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">响应内容</p>
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
                    <div className="rounded-md overflow-hidden border text-xs">
                      <CodeMirror
                        value={response.responseContent}
                        height="400px"
                        extensions={detectResponseFormat(response.responseContent) === "JSON" ? [json()] : [xml()]}
                        theme={oneDark}
                        editable={false}
                        basicSetup={{
                          lineNumbers: true,
                          foldGutter: true,
                          highlightActiveLine: false,
                          highlightActiveLineGutter: false,
                        }}
                      />
                    </div>
                  </div>
                )}

                {!response.success && response.errorMessage && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">错误信息</p>
                    <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all text-red-600 dark:text-red-400 border">
                      {response.errorMessage}
                    </pre>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
