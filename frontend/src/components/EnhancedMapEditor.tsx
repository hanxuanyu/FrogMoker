import { useState, useEffect } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { MessageTemplateDetail } from "@/types"

interface EnhancedMapEditorProps {
  value: string // JSON 字符串
  onChange: (value: string) => void
  keyLabel?: string
  valueLabel?: string
  placeholder?: string
  templates?: Array<{ id: number; name: string; messageType: string }>
  selectedTemplateId?: number
  selectedTemplate?: MessageTemplateDetail
  templateLoading?: boolean
  onTemplateSelect?: (templateId?: number) => Promise<void> | void
  label?: string
}

export function EnhancedMapEditor({
  value,
  onChange,
  keyLabel = "键",
  valueLabel = "值",
  placeholder,
  templates,
  selectedTemplateId,
  selectedTemplate,
  templateLoading = false,
  onTemplateSelect,
  label = "配置",
}: EnhancedMapEditorProps) {
  const [mode, setMode] = useState<"manual" | "template">("manual")

  const parseValue = (jsonStr: string): Array<{ key: string; value: string }> => {
    try {
      const obj = JSON.parse(jsonStr || "{}")
      return Object.entries(obj).map(([key, val]) => ({ key, value: String(val) }))
    } catch {
      return []
    }
  }

  const [pairs, setPairs] = useState<Array<{ key: string; value: string }>>(parseValue(value))

  useEffect(() => {
    setPairs(parseValue(value))
  }, [value])

  useEffect(() => {
    setMode(selectedTemplateId ? "template" : "manual")
  }, [selectedTemplateId])

  const handleModeChange = (newMode: string) => {
    const nextMode = newMode as "manual" | "template"
    setMode(nextMode)
    if (nextMode === "manual" && selectedTemplateId && onTemplateSelect) {
      void onTemplateSelect(undefined)
    }
  }

  const updateParent = (newPairs: Array<{ key: string; value: string }>) => {
    const obj: Record<string, string> = {}
    newPairs.forEach((pair) => {
      if (pair.key.trim()) {
        obj[pair.key.trim()] = pair.value
      }
    })
    onChange(JSON.stringify(obj))
  }

  const addPair = () => {
    const newPairs = [...pairs, { key: "", value: "" }]
    setPairs(newPairs)
  }

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index)
    setPairs(newPairs)
    updateParent(newPairs)
  }

  const updatePair = (index: number, field: "key" | "value", newValue: string) => {
    const newPairs = [...pairs]
    newPairs[index][field] = newValue
    setPairs(newPairs)
    updateParent(newPairs)
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

  const hasTemplates = templates && templates.length > 0

  return (
    <div className="space-y-3">
      {hasTemplates ? (
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="manual" className="text-xs">
              手动输入
            </TabsTrigger>
            <TabsTrigger value="template" className="text-xs">
              从模板选择
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-2 mt-3">
            {pairs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {placeholder || "暂无数据，点击下方按钮添加"}
              </p>
            )}
            {pairs.map((pair, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder={keyLabel}
                    value={pair.key}
                    onChange={(e) => updatePair(index, "key", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={valueLabel}
                    value={pair.value}
                    onChange={(e) => updatePair(index, "value", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => removePair(index)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full h-8" onClick={addPair}>
              <Plus className="size-3.5 mr-1" />
              添加{keyLabel}
            </Button>
          </TabsContent>

          <TabsContent value="template" className="space-y-2 mt-3">
            <Select
              value={selectedTemplateId?.toString() || ""}
              onValueChange={handleTemplateSelect}
              disabled={templateLoading}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="选择模板..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    <div className="flex items-center gap-2">
                      <FileText className="size-3" />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplateId && (
              <div className="text-xs text-muted-foreground">
                已选择模板，发送时会渲染并填充到{label}中
              </div>
            )}
            {selectedTemplate && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                当前预览展示模板原文和变量信息，实际发送内容会在发送完成后回显。
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-2">
          {pairs.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {placeholder || "暂无数据，点击下方按钮添加"}
            </p>
          )}
          {pairs.map((pair, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder={keyLabel}
                  value={pair.key}
                  onChange={(e) => updatePair(index, "key", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder={valueLabel}
                  value={pair.value}
                  onChange={(e) => updatePair(index, "value", e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => removePair(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full h-8" onClick={addPair}>
            <Plus className="size-3.5 mr-1" />
            添加{keyLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
