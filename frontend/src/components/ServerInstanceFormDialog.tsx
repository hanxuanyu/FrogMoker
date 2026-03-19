import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Loader2, RadioTower, Settings2, FileText, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge"
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

function resolvePlaceholder(param: ParamDescriptor) {
  return param.placeholder || param.description || `请输入${param.label}`
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
    if (!open) {
      return
    }

    void fetchProtocols()
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

  useEffect(() => {
    if (protocol && !editTarget) {
      const protocolDesc = protocols.find((item) => item.type === protocol)
      if (!protocolDesc) {
        return
      }
      const defaultParams: Record<string, string> = {}
      protocolDesc.params.forEach((param) => {
        if (param.defaultValue) {
          defaultParams[param.name] = param.defaultValue
        }
      })
      setParams(defaultParams)
    }
  }, [protocol, protocols, editTarget])

  const currentProtocol = useMemo(
    () => protocols.find((item) => item.type === protocol),
    [protocols, protocol],
  )

  const isParamVisible = (param: ParamDescriptor): boolean => {
    if (!param.dependency) return true

    const dep = param.dependency
    if (dep.dependencies && dep.dependencies.length > 0) {
      const results = dep.dependencies.map((subDep) => checkSingleDependency(subDep))
      return dep.combineLogic === "AND" ? results.every(Boolean) : results.some(Boolean)
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
            placeholder={resolvePlaceholder(param)}
          />
        )

      case "TEXTAREA":
        return (
          <Textarea
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={resolvePlaceholder(param)}
            rows={4}
          />
        )

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={resolvePlaceholder(param)}
          />
        )

      case "BOOLEAN":
        return (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <Switch
              checked={value === "true"}
              onCheckedChange={(checked) =>
                setParams({ ...params, [param.name]: String(checked) })
              }
            />
            <span className="text-sm text-muted-foreground">
              {value === "true" ? "已启用" : "未启用"}
            </span>
          </div>
        )

      case "SELECT":
        return (
          <Select
            value={value}
            onValueChange={(nextValue) => setParams({ ...params, [param.name]: nextValue })}
          >
            <SelectTrigger>
              <SelectValue placeholder={resolvePlaceholder(param)} />
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
            onChange={(nextValue) => setParams({ ...params, [param.name]: nextValue })}
            keyLabel={param.keyLabel || "键"}
            valueLabel={param.valueLabel || "值"}
            placeholder={resolvePlaceholder(param)}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
            placeholder={resolvePlaceholder(param)}
          />
        )
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("请输入实例名称")
      return
    }
    if (!protocol) {
      toast.error("请选择协议类型")
      return
    }

    if (currentProtocol) {
      for (const param of currentProtocol.params) {
        if (!isParamVisible(param)) {
          continue
        }
        const value = params[param.name]
        if (param.required && (!value || !value.trim())) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-base">
            {editTarget ? "编辑服务端实例" : "新建服务端实例"}
          </DialogTitle>
          <DialogDescription>
            配置服务端实例基础信息和协议参数。头部和底部固定，长表单仅滚动中间内容。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-56 text-muted-foreground">
              <Loader2 className="size-5 animate-spin mr-2" />
              加载协议配置中...
            </div>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  基本信息
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="server-name">
                      实例名称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="server-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例如：订单回调 Mock 服务"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="server-protocol">
                      <span className="inline-flex items-center gap-1">
                        <RadioTower className="size-3.5" />
                        协议类型
                      </span>
                    </Label>
                    <Select value={protocol} onValueChange={setProtocol} disabled={!!editTarget}>
                      <SelectTrigger id="server-protocol">
                        <SelectValue placeholder="选择协议类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((item) => (
                          <SelectItem key={item.type} value={item.type}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="server-description">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3.5" />
                      实例描述
                    </span>
                  </Label>
                  <Textarea
                    id="server-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="说明这个服务端实例的用途、环境或测试场景"
                    rows={3}
                  />
                </div>

                {currentProtocol && (
                  <div className="rounded-xl border bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{currentProtocol.name}</Badge>
                      {editTarget && <Badge variant="outline">编辑模式下协议不可修改</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{currentProtocol.description}</p>
                  </div>
                )}
              </section>

              {currentProtocol && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      协议参数
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {currentProtocol.params.filter(isParamVisible).map((param) => (
                      <div key={param.name} className="rounded-xl border bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <Label htmlFor={param.name} className="text-sm font-medium">
                              {param.label}
                              {param.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            {param.description && (
                              <p className="text-xs text-muted-foreground">{param.description}</p>
                            )}
                          </div>
                          <Badge variant="outline">{param.paramType}</Badge>
                        </div>

                        <div>{renderParamInput(param)}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!currentProtocol && (
                <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-sm text-center text-muted-foreground">
                  请选择协议类型后继续配置参数
                </div>
              )}

              <section className="rounded-xl border bg-muted/20 px-4 py-4">
                <div className="flex items-start gap-2">
                  <Info className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>创建完成后可在列表页直接启动、停止、重启并查看详情。</p>
                    <p>如果实例正在运行，列表页将禁止直接编辑，需先停止后修改。</p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-8 py-4 border-t shrink-0 bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
            {editTarget ? "保存修改" : "创建实例"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
