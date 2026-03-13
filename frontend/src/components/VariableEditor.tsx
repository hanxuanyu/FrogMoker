import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  TemplateVariableRequest,
  VariableGeneratorDescriptor,
  VariableGeneratorParamDescriptor,
} from "@/types"

interface Props {
  variables: TemplateVariableRequest[]
  generators: VariableGeneratorDescriptor[]
  onChange: (variables: TemplateVariableRequest[]) => void
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: VariableGeneratorParamDescriptor
  value: string
  onChange: (val: string) => void
}) {
  if (param.paramType === "BOOLEAN") {
    const checked = value === "true" || (value === "" && param.defaultValue === "true")
    return (
      <div className="space-y-1">
        <Label className="text-xs">
          {param.label}
          {param.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <div className="flex items-center gap-2 h-8">
          <Switch
            checked={checked}
            onCheckedChange={(v) => onChange(String(v))}
          />
          <span className="text-xs text-muted-foreground">{checked ? "是" : "否"}</span>
        </div>
        {param.description && (
          <p className="text-xs text-muted-foreground">{param.description}</p>
        )}
      </div>
    )
  }

  if (param.paramType === "SELECT" && param.options && param.options.length > 0) {
    const currentValue = value || param.defaultValue || ""
    return (
      <div className="space-y-1">
        <Label className="text-xs">
          {param.label}
          {param.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <Select value={currentValue} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={`请选择${param.label}`} />
          </SelectTrigger>
          <SelectContent>
            {param.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {param.description && (
          <p className="text-xs text-muted-foreground">{param.description}</p>
        )}
      </div>
    )
  }

  // TEXT（默认）
  return (
    <div className="space-y-1">
      <Label className="text-xs">
        {param.label}
        {param.required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        className="h-8 text-xs"
        placeholder={param.defaultValue ? `默认：${param.defaultValue}` : param.description}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {param.description && (
        <p className="text-xs text-muted-foreground">{param.description}</p>
      )}
    </div>
  )
}

export function VariableEditor({ variables, generators, onChange }: Props) {
  const update = (index: number, patch: Partial<TemplateVariableRequest>) => {
    const next = variables.map((v, i) => (i === index ? { ...v, ...patch } : v))
    onChange(next)
  }

  const remove = (index: number) => {
    onChange(variables.filter((_, i) => i !== index))
  }

  const getDescriptor = (type: string) => generators.find((g) => g.type === type)

  if (variables.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        暂无变量，请先解析报文内容中的变量占位符
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {variables.map((variable, index) => {
        const descriptor = getDescriptor(variable.generatorType)
        return (
          <div key={variable.variableName} className="border rounded-lg p-3 space-y-3">
            {/* 变量名 + 删除 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium font-mono text-primary">
                {variable.variableName}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            {/* 生成器类型选择 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">生成器类型</Label>
                <Select
                  value={variable.generatorType}
                  onValueChange={(val) => {
                    const desc = generators.find((g) => g.type === val)
                    const defaultParams: Record<string, string> = {}
                    desc?.params.forEach((p) => {
                      if (p.defaultValue) defaultParams[p.name] = p.defaultValue
                    })
                    update(index, { generatorType: val, generatorParams: defaultParams })
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="选择生成器" />
                  </SelectTrigger>
                  <SelectContent>
                    {generators.map((g) => (
                      <SelectItem key={g.type} value={g.type} className="text-xs">
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 参数列表：根据 paramType 渲染不同控件 */}
            {descriptor && descriptor.params.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {descriptor.params.map((param) => (
                  <ParamField
                    key={param.name}
                    param={param}
                    value={variable.generatorParams?.[param.name] ?? ""}
                    onChange={(val) =>
                      update(index, {
                        generatorParams: {
                          ...variable.generatorParams,
                          [param.name]: val,
                        },
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
