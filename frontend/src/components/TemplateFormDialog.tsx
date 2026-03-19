import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Loader2, Wand2, AlignLeft, Hash, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VariableEditor } from "@/components/VariableEditor"
import { MapEditor } from "@/components/MapEditor"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { xml } from "@codemirror/lang-xml"
import { oneDark } from "@codemirror/theme-one-dark"
import { templateApi } from "@/api"
import type {
  MessageTemplateDetail,
  MessageType,
  SaveMessageTemplateRequest,
  TemplateVariableRequest,
  VariableGeneratorDescriptor,
} from "@/types"

interface Props {
  open: boolean
  editTarget?: MessageTemplateDetail | null
  onClose: () => void
  onSaved: () => void
}

const DEFAULT_GENERATOR = "FIXED"

function parseTagsInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[,\n，]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

export function TemplateFormDialog({ open, editTarget, onClose, onSaved }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [groupName, setGroupName] = useState("未分组")
  const [tagsInput, setTagsInput] = useState("")
  const [messageType, setMessageType] = useState<MessageType>("JSON")
  const [content, setContent] = useState("")
  const [variables, setVariables] = useState<TemplateVariableRequest[]>([])
  const [generators, setGenerators] = useState<VariableGeneratorDescriptor[]>([])
  const [saving, setSaving] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (open) {
      templateApi.listGenerators().then(setGenerators).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (editTarget) {
      setName(editTarget.name)
      setDescription(editTarget.description ?? "")
      setGroupName(editTarget.groupName ?? "未分组")
      setTagsInput((editTarget.tags ?? []).join(", "))
      setMessageType(editTarget.messageType)
      setContent(editTarget.content)
      setVariables(
        editTarget.variables.map((v) => ({
          variableName: v.variableName,
          generatorType: v.generatorType,
          generatorParams: v.generatorParams ?? {},
        })),
      )
    } else {
      setName("")
      setDescription("")
      setGroupName("未分组")
      setTagsInput("")
      setMessageType("JSON")
      setContent("")
      setVariables([])
    }
    initialized.current = true
  }, [open, editTarget])

  const handleFormat = async () => {
    if (!content.trim()) return
    setFormatting(true)
    try {
      const formatted = await templateApi.format(messageType, content)
      setContent(formatted)
      toast.success("格式化成功")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "格式化失败")
    } finally {
      setFormatting(false)
    }
  }

  const handleParseVariables = async () => {
    if (!content.trim()) return
    setParsing(true)
    try {
      const names = await templateApi.parseVariables(messageType, content)
      const existing = new Map(variables.map((v) => [v.variableName, v]))
      const defaultDesc = generators.find((g) => g.type === DEFAULT_GENERATOR)
      const defaultParams: Record<string, string> = {}
      defaultDesc?.params.forEach((p) => {
        if (p.defaultValue) defaultParams[p.name] = p.defaultValue
      })
      const merged = names.map((n) =>
        existing.get(n) ?? {
          variableName: n,
          generatorType: DEFAULT_GENERATOR,
          generatorParams: { ...defaultParams },
        },
      )
      setVariables(merged)
      toast.success(`解析到 ${names.length} 个变量`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "解析失败")
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("请输入模板名称")
      return
    }
    if (!content.trim()) {
      toast.error("请输入报文内容")
      return
    }

    for (const variable of variables) {
      const descriptor = generators.find((g) => g.type === variable.generatorType)
      if (!descriptor) {
        continue
      }
      for (const param of descriptor.params) {
        if (param.required && param.paramType !== "BOOLEAN") {
          const value = variable.generatorParams?.[param.name]
          if (!value || !value.trim()) {
            toast.error(`变量 [${variable.variableName}] 的参数 [${param.label}] 为必填项`)
            return
          }
        }
      }
    }

    setSaving(true)
    const payload: SaveMessageTemplateRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      groupName: groupName.trim() || "未分组",
      tags: parseTagsInput(tagsInput),
      messageType,
      content,
      variables,
    }
    try {
      if (editTarget) {
        await templateApi.update(editTarget.id, payload)
        toast.success("更新成功")
      } else {
        await templateApi.create(payload)
        toast.success("创建成功")
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "保存失败")
    } finally {
      setSaving(false)
    }
  }

  const jsonPlaceholder = `{
  "userId": "{{userId}}",
  "orderNo": "{{orderNo}}",
  "amount": 100
}`

  const xmlPlaceholder = `<request>
  <userId>\${userId}</userId>
  <orderNo>\${orderNo}</orderNo>
</request>`

  const parsedTags = parseTagsInput(tagsInput)

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-5xl w-full max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-base">
            {editTarget ? "编辑报文模板" : "新建报文模板"}
          </DialogTitle>
          <DialogDescription>
            维护模板基础信息、分组、标签和变量生成规则，列表页会按这些信息进行组织展示。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-5">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              基本信息
            </h3>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="tpl-name">
                  模板名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tpl-name"
                  placeholder="例如：用户登录请求、下单接口报文"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tpl-group">
                  <span className="inline-flex items-center gap-1">
                    <FolderTree className="size-3.5" />
                    分组
                  </span>
                </Label>
                <Input
                  id="tpl-group"
                  placeholder="例如：用户中心 / 订单接口"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tpl-type">报文类型</Label>
                <Select value={messageType} onValueChange={(value) => setMessageType(value as MessageType)}>
                  <SelectTrigger id="tpl-type">
                    <SelectValue placeholder="选择报文格式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="XML">XML</SelectItem>
                    <SelectItem value="MAP">MAP (键值对)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-tags">
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3.5" />
                  标签
                </span>
              </Label>
              <Input
                id="tpl-tags"
                placeholder="多个标签使用逗号分隔，例如：核心, 对账, 高频"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              {parsedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {parsedTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-desc">描述</Label>
              <Input
                id="tpl-desc"
                placeholder="简要说明模板用途、所属接口或业务场景"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  报文内容 <span className="text-destructive normal-case font-normal">*</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {messageType === "XML"
                    ? "XML 使用 ${variableName} 占位"
                    : "JSON 和 MAP 使用 {{variableName}} 占位"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  disabled={formatting || !content.trim()}
                  onClick={handleFormat}
                >
                  {formatting ? <Loader2 className="size-3 animate-spin" /> : <AlignLeft className="size-3" />}
                  格式化
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  disabled={parsing || !content.trim()}
                  onClick={handleParseVariables}
                >
                  {parsing ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
                  解析变量
                </Button>
              </div>
            </div>

            {messageType === "MAP" ? (
              <MapEditor
                value={content}
                onChange={setContent}
                keyLabel="参数名"
                valueLabel="参数值"
              />
            ) : (
              <div className="rounded-md overflow-hidden border text-xs">
                <CodeMirror
                  value={content}
                  height="240px"
                  extensions={messageType === "JSON" ? [json()] : [xml()]}
                  theme={oneDark}
                  placeholder={messageType === "JSON" ? jsonPlaceholder : xmlPlaceholder}
                  onChange={(value) => setContent(value)}
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
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                变量配置
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                为每个变量配置生成规则，渲染模板时将自动替换成对应的生成值。
              </p>
            </div>
            <VariableEditor variables={variables} generators={generators} onChange={setVariables} />
          </section>
        </div>

        <div className="flex justify-end gap-2 px-8 py-4 border-t shrink-0 bg-muted/30">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin mr-1" />}
            {editTarget ? "保存修改" : "创建模板"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
