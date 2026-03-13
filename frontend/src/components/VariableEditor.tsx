import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TemplateVariableRequest, VariableGeneratorDescriptor } from "@/types"

interface Props {
  variables: TemplateVariableRequest[]
  generators: VariableGeneratorDescriptor[]
  onChange: (variables: TemplateVariableRequest[]) => void
}

export function VariableEditor({ variables, generators, onChange }: Props) {
  const update = (index: number, patch: Partial<TemplateVariableRequest>) => {
    const next = variables.map((v, i) => (i === index ? { ...v, ...patch } : v))
    onChange(next)
  }

  const remove = (index: number) => {
    onChange(variables.filter((_, i) => i !== index))
  }

  const getDescriptor = (type: string) =>
    generators.find((g) => g.type === type)

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">生成器类型</Label>
                <Select
                  value={variable.generatorType}
                  onValueChange={(val) =>
                    update(index, { generatorType: val, generatorParams: {} })
                  }
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

            {descriptor && descriptor.params.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {descriptor.params.map((param) => (
                  <div key={param.name} className="space-y-1">
                    <Label className="text-xs">
                      {param.label}
                      {param.required && (
                        <span className="text-destructive ml-0.5">*</span>
                      )}
                    </Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder={param.defaultValue || param.description}
                      value={variable.generatorParams?.[param.name] ?? ""}
                      onChange={(e) =>
                        update(index, {
                          generatorParams: {
                            ...variable.generatorParams,
                            [param.name]: e.target.value,
                          },
                        })
                      }
                    />
                    {param.description && (
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
