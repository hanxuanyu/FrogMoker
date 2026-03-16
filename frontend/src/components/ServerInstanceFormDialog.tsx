import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EnhancedMapEditor } from "@/components/EnhancedMapEditor"
import { serverApi } from "@/api"
import type {
  ServerInstance,
  ProtocolServerDescriptor,
  ParamDescriptor,
  ParamDependency,
} from "@/types"

interface ServerInstanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: ServerInstance | null
  onSuccess: () => void
}

export function ServerInstanceFormDialog({
  open,
  onOpenChange,
  editTarget,
  onSuccess,
}: ServerInstanceFormDialogProps) {
  const [protocols, setProtocols] = useState<ProtocolServerDescriptor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [protocol, setProtocol] = useState("")
  const [params, setParams] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      fetchProtocols()
      if (editTarget) {
        setName(editTarget.name)
        setDescription(editTarget.description || "")
        setProtocol(editTarget.protocol)
        try {
          setParams(JSON.parse(editTarget.params))
        } catch {
          setParams({})
        }
      } else {
        setName("")
        setDescription("")
        setProtocol("")
        setParams({})
      }
    }
  }, [open, editTarget])

  const fetchProtocols = async () => {
    setLoading(true)
    try {
      const data = await serverApi.listProtocols()
      setProtocols(data)
      if (!editTarget && data.length > 0) {
        setProtocol(data[0].type)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载协议列表失败")
    } finally {
      setLoading(false)
    }
  }

  // 切换协议时重置参数
  useEffect(() => {
    if (protocol && !editTarget) {
      const protocolDesc = protocols.find((p) => p.type === protocol)
      if (protocolDesc) {
        const defaultParams: Record<string, string> = {}
        protocolDesc.params.forEach((param) => {
          if (param.defaultValue) {
            defaultParams[param.name] = param.defaultValue
          }
        })
        setParams(defaultParams)
      }
    }
  }, [protocol, protocols, editTarget])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("请输入实例名称")
      return
    }
    if (!protocol) {
      toast.error("请选择协议类型")
      return
    }

    // 验证必填参数
    const protocolDesc = protocols.find((p) => p.type === protocol)
    if (protocolDesc) {
      for (const param of protocolDesc.params) {
        if (param.required && !params[param.name]) {
          toast.error(`请填写必填参数：${param.label}`)
          return
        }
      }
    }

    setSubmitting(true)
    try {
      if (editTarget) {
        await serverApi.updateInstance(editTarget.id, {
          name: name.trim(),
          description: description.trim(),
          params,
        })
        toast.success("更新成功")
      } else {
        await serverApi.createInstance({
          name: name.trim(),
          description: description.trim(),
          protocol,
          params,
        })
        toast.success("创建成功")
      }
      onSuccess()
      onOpenChange(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "操作失败")
    } finally {
      setSubmitting(false)
    }
  }

  const currentProtocol = protocols.find((p) => p.type === protocol)

  // 判断参数是否应该显示（基于依赖条件）
  const isParamVisible = (param: ParamDescriptor): boolean => {
    if (!param.dependency) return true

    const dep = param.dependency

    // 多依赖模式
    if (dep.dependencies && dep.dependencies.length > 0) {
      const results = dep.dependencies.map((subDep) => checkSingleDependency(subDep))
      if (dep.combineLogic === "AND") {
        return results.every((r) => r)
      } else {
        return results.some((r) => r)
      }
    }

    return checkSingleDependency(dep)
  }

  const checkSingleDependency = (dep: ParamDependency): boolean => {
    if (!dep.dependsOn) return true

    const value = params[dep.dependsOn]

    switch (dep.condition) {
      case "EQUALS":
        return dep.expectedValues?.includes(value) || false
      case "NOT_EQUALS":
        return !dep.expectedValues?.includes(value)
      case "NOT_EMPTY":
        return !!value && value.trim() !== ""
      case "IS_EMPTY":
        return !value || value.trim() === ""
      default:
        return true
    }
  }

  const renderParamInput = (param: ParamDescriptor) => {
    const value = params[param.name] || ""

    switch (param.paramType) {
      case "TEXT":
        return (
          <Input
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={param.placeholder}
          />
        )

      case "TEXTAREA":
        return (
          <Textarea
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={param.placeholder}
            rows={4}
          />
        )

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={param.placeholder}
          />
        )

      case "BOOLEAN":
        return (
          <Switch
            checked={value === "true"}
            onCheckedChange={(checked) =>
              setParams({ ...params, [param.name]: String(checked) })
            }
          />
        )

      case "SELECT":
        return (
          <Select
            value={value}
            onValueChange={(val) => setParams({ ...params, [param.name]: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder={param.placeholder || "请选择"} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "MAP":
        return (
          <EnhancedMapEditor
            value={value || "{}"}
            onChange={(val) => setParams({ ...params, [param.name]: val })}
            keyLabel={param.keyLabel || "键"}
            valueLabel={param.valueLabel || "值"}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={param.placeholder}
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTarget ? "编辑服务端实例" : "新建服务端实例"}</DialogTitle>
          <DialogDescription>
            {editTarget ? "修改服务端实例配置" : "创建一个新的服务端实例"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                实例名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入实例名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">实例描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入实例描述（可选）"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">
                协议类型 <span className="text-destructive">*</span>
              </Label>
              <Select value={protocol} onValueChange={setProtocol} disabled={!!editTarget}>
                <SelectTrigger id="protocol">
                  <SelectValue placeholder="选择协议类型" />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((p) => (
                    <SelectItem key={p.type} value={p.type}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentProtocol && (
                <p className="text-xs text-muted-foreground">{currentProtocol.description}</p>
              )}
            </div>

            {currentProtocol && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">协议参数</h3>
                {currentProtocol.params.filter(isParamVisible).map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>
                      {param.label}
                      {param.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderParamInput(param)}
                    {param.description && (
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            {editTarget ? "保存" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
