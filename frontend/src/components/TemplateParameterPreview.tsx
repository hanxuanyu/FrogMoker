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
import type { MessageTemplateDetail, TemplateVariableResponse } from "@/types"

interface TemplateParameterPreviewProps {
  template: MessageTemplateDetail
  isDark: boolean
}

const formatGenerator = (variable: TemplateVariableResponse) => {
  const entries = Object.entries(variable.generatorParams || {}).filter(([, value]) => value !== "")
  if (entries.length === 0) {
    return variable.generatorType
  }
  return `${variable.generatorType}(${entries.map(([key, value]) => `${key}=${value}`).join(", ")})`
}

export function TemplateParameterPreview({ template, isDark }: TemplateParameterPreviewProps) {
  const extensions = [template.messageType === "XML" ? xml() : json(), EditorView.lineWrapping]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{template.messageType}</Badge>
        <span className="text-sm font-medium">{template.name}</span>
      </div>

      <div className="rounded-lg overflow-hidden border text-xs">
        <CodeMirror
          value={template.content}
          height="220px"
          extensions={extensions}
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

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          模板变量
        </h4>
        {template.variables.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">变量名</TableHead>
                  <TableHead>生成格式</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.variables.map((variable) => (
                  <TableRow key={variable.id}>
                    <TableCell className="font-mono text-xs">{variable.variableName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground break-all">
                      {formatGenerator(variable)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
            该模板不包含变量
          </div>
        )}
      </div>
    </div>
  )
}
