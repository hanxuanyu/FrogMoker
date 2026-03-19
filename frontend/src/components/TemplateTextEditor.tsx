import { useEffect, useState } from "react"
import { FileText, Edit3, AlignLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { xml } from "@codemirror/lang-xml"
import { EditorView } from "@codemirror/view"
import { toast } from "sonner"
import type { MessageTemplateDetail } from "@/types"

interface TemplateTextEditorProps {
  value: string
  onChange: (value: string) => void
  format: "JSON" | "XML"
  isDark: boolean
  templates?: Array<{ id: number; name: string; messageType: string }>
  templateTypes?: Array<"JSON" | "XML">
  selectedTemplateId?: number
  selectedTemplate?: MessageTemplateDetail
  templateLoading?: boolean
  onTemplateSelect?: (templateId?: number) => Promise<void> | void
  onFormat?: (format: string, content: string) => Promise<string>
  label?: string
}

export function TemplateTextEditor({
  value,
  onChange,
  format,
  isDark,
  templates,
  templateTypes,
  selectedTemplateId,
  selectedTemplate,
  templateLoading = false,
  onTemplateSelect,
  onFormat,
}: TemplateTextEditorProps) {
  const [mode, setMode] = useState<"manual" | "template">("manual")
  const [formatting, setFormatting] = useState(false)

  useEffect(() => {
    setMode(selectedTemplateId ? "template" : "manual")
  }, [selectedTemplateId])

  const allowedTemplateTypes = templateTypes && templateTypes.length > 0 ? templateTypes : [format]
  const filteredTemplates =
    templates?.filter((t) =>
      allowedTemplateTypes.includes(t.messageType as "JSON" | "XML"),
    ) || []
  const hasTemplates = filteredTemplates.length > 0

  const handleModeChange = (newMode: string) => {
    const nextMode = newMode as "manual" | "template"
    setMode(nextMode)
    if (nextMode === "manual" && selectedTemplateId && onTemplateSelect) {
      void onTemplateSelect(undefined)
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    if (!onTemplateSelect) {
      return
    }
    try {
      await onTemplateSelect(templateId ? Number(templateId) : undefined)
      if (templateId) {
        toast.success("已选择模板")
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "选择模板失败")
    }
  }

  const handleFormat = async () => {
    if (!value || !value.trim() || !onFormat) return
    setFormatting(true)
    try {
      const formatted = await onFormat(format, value)
      onChange(formatted)
      toast.success("格式化成功")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "格式化失败")
    } finally {
      setFormatting(false)
    }
  }

  const placeholder =
    format === "JSON"
      ? '{\n  "key": "value"\n}'
      : '<root>\n  <element>value</element>\n</root>'
  const selectedTemplateFormat = selectedTemplate?.messageType === "XML" ? "XML" : "JSON"

  return (
    <div className="h-full flex flex-col">
      {hasTemplates ? (
        <Tabs
          value={mode}
          onValueChange={handleModeChange}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 h-8 shrink-0">
            <TabsTrigger value="manual" className="text-xs">
              <Edit3 className="size-3 mr-1" />
              手动输入
            </TabsTrigger>
            <TabsTrigger value="template" className="text-xs">
              <FileText className="size-3 mr-1" />
              从模板选择
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="flex-1 mt-3 min-h-0 flex flex-col">
            {onFormat && (
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleFormat}
                  disabled={formatting || !value || !value.trim()}
                >
                  <AlignLeft className="size-3" />
                  {formatting ? "格式化中..." : "格式化"}
                </Button>
              </div>
            )}
            <div className="flex-1 rounded-lg overflow-hidden border text-xs">
              <CodeMirror
                value={value}
                height="100%"
                extensions={[format === "JSON" ? json() : xml(), EditorView.lineWrapping]}
                theme={isDark ? "dark" : "light"}
                placeholder={placeholder}
                onChange={onChange}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  autocompletion: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  indentOnInput: true,
                }}
                style={{ height: "100%" }}
              />
            </div>
          </TabsContent>

          <TabsContent value="template" className="flex-1 mt-3 space-y-3">
            <Select
              value={selectedTemplateId?.toString() || ""}
              onValueChange={handleTemplateSelect}
              disabled={templateLoading}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="选择模板..." />
              </SelectTrigger>
              <SelectContent>
                {filteredTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    <div className="flex items-center gap-2">
                      <FileText className="size-3" />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplateId && selectedTemplate && (
              <div className="flex-1 rounded-lg overflow-hidden border text-xs">
                <CodeMirror
                  value={selectedTemplate.content}
                  height="100%"
                  extensions={[selectedTemplateFormat === "JSON" ? json() : xml(), EditorView.lineWrapping]}
                  theme={isDark ? "dark" : "light"}
                  editable={false}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                  }}
                  style={{ height: "100%" }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="h-full flex flex-col">
          {onFormat && (
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleFormat}
                disabled={formatting || !value || !value.trim()}
              >
                <AlignLeft className="size-3" />
                {formatting ? "格式化中..." : "格式化"}
              </Button>
            </div>
          )}
          <div className="flex-1 rounded-lg overflow-hidden border text-xs">
            <CodeMirror
              value={value}
              height="100%"
              extensions={[format === "JSON" ? json() : xml(), EditorView.lineWrapping]}
              theme={isDark ? "dark" : "light"}
              placeholder={placeholder}
              onChange={onChange}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                indentOnInput: true,
              }}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
