import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { xml } from "@codemirror/lang-xml"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { TemplateParameterPreview } from "@/components/TemplateParameterPreview"
import type {
  MessageTemplateDetail,
  ProtocolClientDescriptor,
  ProtocolClientParamDescriptor,
} from "@/types"

interface HttpRequestPreviewProps {
  params: Record<string, string>
  isDark: boolean
  protocol?: ProtocolClientDescriptor
  isParamVisible?: (param: ProtocolClientParamDescriptor) => boolean
  parameterTemplates?: Record<string, number>
  templateDetails?: Record<number, MessageTemplateDetail>
}

export function HttpRequestPreview({
  params,
  isDark,
  protocol,
  isParamVisible,
  parameterTemplates,
  templateDetails,
}: HttpRequestPreviewProps) {
  const method = params.method || "GET"
  const url = params.url || ""
  const contentType = params.contentType || ""
  const body = params.body || ""
  const headers = params.headers || "{}"
  const queryParams = params.queryParams || "{}"
  const formData = params.formData || "{}"

  // 检查参数是否可见
  const isVisible = (paramName: string): boolean => {
    if (!protocol || !isParamVisible) return true
    const param = protocol.params.find((p) => p.name === paramName)
    return param ? isParamVisible(param) : true
  }

  const parseMap = (jsonStr: string): Record<string, string> => {
    try {
      return JSON.parse(jsonStr || "{}")
    } catch {
      return {}
    }
  }

  const resolveTemplate = (paramName: string) => {
    const templateId = parameterTemplates?.[paramName]
    return templateId ? templateDetails?.[templateId] : undefined
  }

  const headersMap = parseMap(headers)
  const queryParamsMap = parseMap(queryParams)
  const formDataMap = parseMap(formData)

  // 构建完整 URL（包含查询参数）
  const buildFullUrl = () => {
    if (!url) return ""
    const queryString = Object.entries(queryParamsMap)
      .filter(([key]) => key.trim())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&")
    return queryString ? `${url}?${queryString}` : url
  }

  const fullUrl = buildFullUrl()

  // 判断是否有 body（只有当 body 或 formData 参数可见时才显示）
  const hasBody = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) &&
    (isVisible("body") || isVisible("formData"))

  // 检测 body 格式
  const detectBodyFormat = () => {
    if (!body) return "text"
    const trimmed = body.trim()
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json"
    if (trimmed.startsWith("<")) return "xml"
    return "text"
  }

  const bodyFormat = detectBodyFormat()
  const headersTemplate = resolveTemplate("headers")
  const queryParamsTemplate = resolveTemplate("queryParams")
  const formDataTemplate = resolveTemplate("formData")
  const bodyTemplate = resolveTemplate("body")

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 请求行 */}
      <div className="px-6 py-4 border-b shrink-0 bg-muted/30">
        <div className="flex items-center gap-3">
          <Badge variant={method === "GET" ? "secondary" : "default"} className="font-mono">
            {method}
          </Badge>
          <code className="text-sm flex-1 truncate">{fullUrl || "未设置 URL"}</code>
        </div>
      </div>

      {/* 请求详情 */}
      <div className="flex-1 overflow-y-auto">
        {/* 请求头 */}
        {isVisible("headers") && headersTemplate && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              请求头模板
            </h3>
            <TemplateParameterPreview template={headersTemplate} isDark={isDark} />
          </div>
        )}
        {isVisible("headers") && !headersTemplate && Object.keys(headersMap).length > 0 && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              请求头
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Header</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(headersMap)
                    .filter(([key]) => key.trim())
                    .map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs">{key}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 查询参数 */}
        {isVisible("queryParams") && queryParamsTemplate && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              查询参数模板
            </h3>
            <TemplateParameterPreview template={queryParamsTemplate} isDark={isDark} />
          </div>
        )}
        {isVisible("queryParams") && !queryParamsTemplate && Object.keys(queryParamsMap).length > 0 && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              查询参数
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">参数名</TableHead>
                    <TableHead>参数值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(queryParamsMap)
                    .filter(([key]) => key.trim())
                    .map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs">{key}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 请求体 */}
        {hasBody && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                请求体
              </h3>
              {contentType && (
                <Badge variant="outline" className="text-xs">
                  {contentType}
                </Badge>
              )}
            </div>
            {contentType === "application/x-www-form-urlencoded" && isVisible("formData") && formDataTemplate ? (
              <TemplateParameterPreview template={formDataTemplate} isDark={isDark} />
            ) : contentType === "application/x-www-form-urlencoded" && isVisible("formData") && Object.keys(formDataMap).length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">字段名</TableHead>
                      <TableHead>字段值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(formDataMap)
                      .filter(([key]) => key.trim())
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-xs">{key}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {value}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : isVisible("body") && bodyTemplate ? (
              <TemplateParameterPreview template={bodyTemplate} isDark={isDark} />
            ) : isVisible("body") && body ? (
              bodyFormat === "text" ? (
                <pre className="text-xs font-mono bg-muted rounded-lg p-4 whitespace-pre-wrap break-all border">
                  {body}
                </pre>
              ) : (
                <div className="rounded-lg overflow-hidden border text-xs">
                  <CodeMirror
                    value={body}
                    height="300px"
                    extensions={[
                      bodyFormat === "json" ? json() : xml(),
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
                  />
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground bg-muted/50 rounded-lg border-2 border-dashed">
                无请求体内容
              </div>
            )}
          </div>
        )}

        {/* 无内容提示 */}
        {!hasBody &&
          !(isVisible("headers") && headersTemplate) &&
          !(isVisible("queryParams") && queryParamsTemplate) &&
          !(isVisible("headers") && Object.keys(headersMap).length > 0) &&
          !(isVisible("queryParams") && Object.keys(queryParamsMap).length > 0) && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            配置请求参数后将在此显示预览
          </div>
        )}
      </div>
    </div>
  )
}
