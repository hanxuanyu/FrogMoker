import { useState } from "react"
import { FileText, Edit3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface TemplateTextEditorProps {
  value: string
  onChange: (value: string) => void
  format: "JSON" | "XML"
  isDark: boolean
  templates?: Array<{ id: number; name: string; messageType: string }>
  onTemplateRender?: (templateId: number) => Promise<string>
  label?: string
}

export function TemplateTextEditor({
  value,
  onChange,
  format,
  isDark,
  templates,
  onTemplateRender,
}: TemplateTextEditorProps) {
  const [mode, setMode] = useState<"manual" | "template">("manual")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // 过滤匹配格式的模板
  const filteredTemplates = templates?.filter((t) => t.messageType === format) || []
  const hasTemplates = filteredTemplates.length > 0

  // 切换模式时重置模板选择
  const handleModeChange = (newMode: string) => {
    const mode = newMode as "manual" | "template"
    setMode(mode)
    if (mode === "template") {
      // 切换到模板模式时，如果当前内容为空，清除选择状态
      if (!value || value.trim() === "") {
        setSelectedTemplateId("")
      }
    }
  }

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (templateId && onTemplateRender) {
      setLoading(true)
      try {
        const rendered = await onTemplateRender(Number(templateId))
        onChange(rendered)
        toast.success("已从模板填充")
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "填充失败")
      } finally {
        setLoading(false)
      }
    }
  }

  const placeholder =
    format === "JSON"
      ? '{\n  "key": "value"\n}'
      : '<root>\n  <element>value</element>\n</root>'

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

          <TabsContent value="manual" className="flex-1 mt-3 min-h-0">
            <div className="h-full rounded-lg overflow-hidden border text-xs">
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
              value={selectedTemplateId}
              onValueChange={handleTemplateSelect}
              disabled={loading}
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
            {selectedTemplateId && value && (
              <div className="flex-1 rounded-lg overflow-hidden border text-xs">
                <CodeMirror
                  value={value}
                  height="100%"
                  extensions={[format === "JSON" ? json() : xml(), EditorView.lineWrapping]}
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
        <div className="h-full rounded-lg overflow-hidden border text-xs">
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
      )}
    </div>
  )
}
