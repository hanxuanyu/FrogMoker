import { useState, useEffect } from "react"
import { Plus, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MapEditorProps {
  value: string // JSON 字符串
  onChange: (value: string) => void
  keyLabel?: string
  valueLabel?: string
  placeholder?: string
  templates?: Array<{ id: number; name: string; content: string }> // 可选的模板列表
  onTemplateSelect?: (templateId: number) => void // 模板选择回调
}

export function MapEditor({
  value,
  onChange,
  keyLabel = "键",
  valueLabel = "值",
  placeholder,
  templates,
  onTemplateSelect
}: MapEditorProps) {
  // 解析 JSON 字符串为键值对数组
  const parseValue = (jsonStr: string): Array<{ key: string; value: string }> => {
    try {
      const obj = JSON.parse(jsonStr || "{}")
      return Object.entries(obj).map(([key, val]) => ({ key, value: String(val) }))
    } catch {
      return []
    }
  }

  const [pairs, setPairs] = useState<Array<{ key: string; value: string }>>(parseValue(value))
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")

  // 当外部 value 变化时更新 pairs
  useEffect(() => {
    setPairs(parseValue(value))
  }, [value])

  // 更新父组件
  const updateParent = (newPairs: Array<{ key: string; value: string }>) => {
    const obj: Record<string, string> = {}
    newPairs.forEach(pair => {
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (templateId && onTemplateSelect) {
      onTemplateSelect(Number(templateId))
    }
  }

  return (
    <div className="space-y-2">
      {templates && templates.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="从模板填充..." />
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setSelectedTemplateId("")
              }}
            >
              清除选择
            </Button>
          )}
        </div>
      )}
      {pairs.length === 0 && (
        <p className="text-xs text-muted-foreground">{placeholder || "暂无数据，点击下方按钮添加"}</p>
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
      <Button
        variant="outline"
        size="sm"
        className="w-full h-8"
        onClick={addPair}
      >
        <Plus className="size-3.5 mr-1" />
        添加{keyLabel}
      </Button>
    </div>
  )
}
