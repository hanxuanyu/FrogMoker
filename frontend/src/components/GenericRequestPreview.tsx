import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateParameterPreview } from "@/components/TemplateParameterPreview"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { EditorView } from "@codemirror/view"
import type {
  MessageTemplateDetail,
  ProtocolClientDescriptor,
  ProtocolClientParamDescriptor,
} from "@/types"

interface GenericRequestPreviewProps {
  params: Record<string, string>
  isDark: boolean
  protocol?: ProtocolClientDescriptor
  isParamVisible?: (param: ProtocolClientParamDescriptor) => boolean
  parameterTemplates?: Record<string, number>
  templateDetails?: Record<number, MessageTemplateDetail>
}

export function GenericRequestPreview({
  params,
  isDark,
  protocol,
  isParamVisible,
  parameterTemplates,
  templateDetails,
}: GenericRequestPreviewProps) {
  if (!protocol) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        未选择协议
      </div>
    )
  }

  // 获取可见的参数列表
  const visibleParams = protocol.params.filter((param) => {
    if (!isParamVisible) return true
    return isParamVisible(param)
  })

  // 检测内容格式
  const detectFormat = (content: string): "json" | "text" => {
    if (!content) return "text"
    const trimmed = content.trim()
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        JSON.parse(trimmed)
        return "json"
      } catch {
        return "text"
      }
    }
    return "text"
  }

  const resolveTemplate = (paramName: string) => {
    const templateId = parameterTemplates?.[paramName]
    return templateId ? templateDetails?.[templateId] : undefined
  }

  // 渲染简单参数值（紧凑模式）
  const renderCompactParamValue = (param: ProtocolClientParamDescriptor, value: string) => {
    if (!value || value.trim() === "") {
      return null
    }

    switch (param.paramType) {
      case "BOOLEAN":
        return value === "true" ? "是" : "否"

      case "SELECT":
      case "TEXT":
      case "NUMBER":
      default:
        return value
    }
  }

  // 渲染参数值
  const renderParamValue = (param: ProtocolClientParamDescriptor, value: string) => {
    if (!value || value.trim() === "") {
      return <span className="text-muted-foreground italic">未设置</span>
    }

    switch (param.paramType) {
      case "BOOLEAN":
        return (
          <Badge variant={value === "true" ? "default" : "secondary"}>
            {value === "true" ? "是" : "否"}
          </Badge>
        )

      case "MAP":
      case "ARRAY":
        try {
          const parsed = JSON.parse(value)
          const entries = param.paramType === "MAP" ? Object.entries(parsed) : parsed

          if (
            (param.paramType === "MAP" && Object.keys(parsed).length === 0) ||
            (param.paramType === "ARRAY" && parsed.length === 0)
          ) {
            return <span className="text-muted-foreground italic">空</span>
          }

          return (
            <div className="rounded-md border overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    {param.paramType === "MAP" ? (
                      <>
                        <TableHead className="w-1/2 text-xs">
                          {param.keyLabel || "键"}
                        </TableHead>
                        <TableHead className="text-xs">{param.valueLabel || "值"}</TableHead>
                      </>
                    ) : (
                      <TableHead className="text-xs">{param.itemLabel || "项"}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {param.paramType === "MAP"
                    ? entries.map(([key, val]: [string, string]) => (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-xs">{key}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {val}
                          </TableCell>
                        </TableRow>
                      ))
                    : entries.map((item: string, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{item}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          )
        } catch {
          return (
            <pre className="text-xs font-mono bg-muted rounded p-2 whitespace-pre-wrap break-all">
              {value}
            </pre>
          )
        }

      case "TEXTAREA":
        const format = detectFormat(value)
        if (format === "json") {
          return (
            <div className="rounded-md overflow-hidden border text-xs mt-2">
              <CodeMirror
                value={value}
                height="200px"
                extensions={[json(), EditorView.lineWrapping]}
                theme={isDark ? "dark" : "light"}
                editable={false}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: false,
                  highlightActiveLineGutter: false,
                }}
              />
            </div>
          )
        }
        return (
          <pre className="text-xs font-mono bg-muted rounded p-3 whitespace-pre-wrap break-all mt-2 border">
            {value}
          </pre>
        )

      case "SELECT":
        return <Badge variant="outline">{value}</Badge>

      case "NUMBER":
        return <code className="text-xs font-mono">{value}</code>

      case "TEXT":
      default:
        return (
          <span className="text-xs font-mono break-all">{value}</span>
        )
    }
  }

  // 按参数类型分组
  const groupedParams = visibleParams.reduce(
    (acc, param) => {
      const value = params[param.name] || param.defaultValue || ""
      const hasTemplate = !!resolveTemplate(param.name)
      const hasValue = value && value.trim() !== "" && value !== "{}" && value !== "[]"

      if (param.paramType === "TEXTAREA" || param.paramType === "MAP" || param.paramType === "ARRAY") {
        if (hasValue || hasTemplate) {
          acc.complex.push(param)
        }
      } else {
        acc.simple.push(param)
      }
      return acc
    },
    { simple: [] as ProtocolClientParamDescriptor[], complex: [] as ProtocolClientParamDescriptor[] }
  )

  const hasAnyValue = visibleParams.some((param) => {
    if (resolveTemplate(param.name)) {
      return true
    }
    const value = params[param.name] || param.defaultValue || ""
    return value && value.trim() !== "" && value !== "{}" && value !== "[]"
  })

  if (!hasAnyValue) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground bg-muted/50 border-2 border-dashed">
        配置请求参数后将在此显示预览
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-4">
        {/* 协议信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge>{protocol.protocol}</Badge>
              <span className="font-normal text-muted-foreground">{protocol.name}</span>
            </CardTitle>
          </CardHeader>
          {protocol.description && (
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{protocol.description}</p>
            </CardContent>
          )}
        </Card>

        {/* 简单参数 - 紧凑展示 */}
        {groupedParams.simple.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">请求参数</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {groupedParams.simple.map((param) => {
                  const value = params[param.name] || param.defaultValue || ""
                  const displayValue = renderCompactParamValue(param, value)
                  if (!displayValue) return null

                  return (
                    <div
                      key={param.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-muted/50 text-xs"
                    >
                      <span className="font-medium text-muted-foreground">
                        {param.label}
                        {param.required && <span className="text-destructive ml-0.5">*</span>}
                      </span>
                      <span className="text-muted-foreground/50">:</span>
                      <span className="font-mono">{displayValue}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 复杂参数 */}
        {groupedParams.complex.map((param) => {
          const value = params[param.name] || param.defaultValue || ""
          const template = resolveTemplate(param.name)
          if (!template && (!value || value.trim() === "" || value === "{}" || value === "[]")) return null

          return (
            <Card key={param.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {param.label}
                  {param.required && <span className="text-destructive">*</span>}
                  <Badge variant="outline" className="text-xs font-normal">
                    {param.paramType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {template ? (
                  <TemplateParameterPreview template={template} isDark={isDark} />
                ) : (
                  renderParamValue(param, value)
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
