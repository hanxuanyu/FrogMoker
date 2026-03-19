import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Filter, Reply, GitBranch, Clock3, FileCode2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { serverApi } from "@/api"
import type {
  MatchRule,
  MatchCondition,
  ResponseConfig,
  ConditionType,
  MatchOperator,
} from "@/types"

interface MatchRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instanceId: number
  editTarget: MatchRule | null
  onSuccess: () => void
}

const FIELD_OPTIONS = [
  { value: "method", label: "请求方法 (method)" },
  { value: "path", label: "请求路径 (path)" },
  { value: "body", label: "请求体 (body)" },
  { value: "header.Content-Type", label: "请求头 Content-Type" },
  { value: "header.Authorization", label: "请求头 Authorization" },
  { value: "query.id", label: "查询参数 id" },
]

const OPERATOR_OPTIONS = [
  { value: "EQUALS", label: "等于" },
  { value: "CONTAINS", label: "包含" },
  { value: "REGEX", label: "正则匹配" },
  { value: "EXISTS", label: "字段存在" },
  { value: "NOT_EQUALS", label: "不等于" },
  { value: "NOT_CONTAINS", label: "不包含" },
]

export function MatchRuleFormDialog({
  open,
  onOpenChange,
  instanceId,
  editTarget,
  onSuccess,
}: MatchRuleFormDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("0")

  const [conditionType, setConditionType] = useState<ConditionType>("SIMPLE")
  const [field, setField] = useState("")
  const [operator, setOperator] = useState<MatchOperator>("EQUALS")
  const [value, setValue] = useState("")

  const [statusCode, setStatusCode] = useState("200")
  const [headers, setHeaders] = useState("{}")
  const [body, setBody] = useState("")
  const [delay, setDelay] = useState("")

  useEffect(() => {
    if (!open) {
      return
    }

    if (editTarget) {
      setName(editTarget.name)
      setDescription(editTarget.description || "")
      setPriority(String(editTarget.priority))

      try {
        const condition: MatchCondition = JSON.parse(editTarget.condition)
        setConditionType(condition.type)
        setField(condition.field || "")
        setOperator(condition.operator || "EQUALS")
        setValue(condition.value || "")
      } catch {
        setConditionType("SIMPLE")
        setField("path")
        setOperator("EQUALS")
        setValue("")
      }

      try {
        const response: ResponseConfig = JSON.parse(editTarget.response)
        setStatusCode(String(response.statusCode))
        setHeaders(JSON.stringify(response.headers || {}, null, 2))
        setBody(response.body || "")
        setDelay(response.delay ? String(response.delay) : "")
      } catch {
        setStatusCode("200")
        setHeaders("{}")
        setBody("")
        setDelay("")
      }
    } else {
      setName("")
      setDescription("")
      setPriority("0")
      setConditionType("SIMPLE")
      setField("path")
      setOperator("EQUALS")
      setValue("")
      setStatusCode("200")
      setHeaders("{\n  \"Content-Type\": \"application/json\"\n}")
      setBody('{\n  "message": "OK"\n}')
      setDelay("")
    }
  }, [open, editTarget])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("请输入规则名称")
      return
    }
    if (conditionType === "SIMPLE" && !field) {
      toast.error("请选择匹配字段")
      return
    }

    const condition: MatchCondition = {
      type: conditionType,
      field: conditionType === "SIMPLE" ? field : undefined,
      operator: conditionType === "SIMPLE" ? operator : undefined,
      value: conditionType === "SIMPLE" ? value : undefined,
    }

    let parsedHeaders = {}
    try {
      parsedHeaders = JSON.parse(headers)
    } catch {
      toast.error("响应头格式错误，请输入有效的 JSON")
      return
    }

    const response: ResponseConfig = {
      statusCode: Number(statusCode),
      headers: parsedHeaders,
      body,
      delay: delay ? Number(delay) : undefined,
    }

    setSubmitting(true)
    try {
      if (editTarget) {
        await serverApi.updateRule(editTarget.id, {
          name: name.trim(),
          description: description.trim(),
          priority: Number(priority),
          condition,
          response,
        })
        toast.success("更新成功")
      } else {
        await serverApi.createRule(instanceId, {
          name: name.trim(),
          description: description.trim(),
          priority: Number(priority),
          condition,
          response,
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
            {editTarget ? "编辑匹配规则" : "新建匹配规则"}
          </DialogTitle>
          <DialogDescription>
            规则弹窗采用固定头尾结构，长内容仅滚动中间区域，便于编辑匹配条件和响应配置。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-5">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              基本信息
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="rule-name">
                  规则名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rule-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：登录接口成功响应"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rule-priority">
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="size-3.5" />
                    优先级
                  </span>
                </Label>
                <Input
                  id="rule-priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="数字越大优先级越高"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rule-description">规则描述</Label>
              <Textarea
                id="rule-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="说明规则用途、命中的业务场景或特殊注意事项"
                rows={3}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                匹配条件
              </h3>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="conditionType">条件类型</Label>
                <Select value={conditionType} onValueChange={(val) => setConditionType(val as ConditionType)}>
                  <SelectTrigger id="conditionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">简单条件</SelectItem>
                    <SelectItem value="AND" disabled>AND 组合（暂不支持）</SelectItem>
                    <SelectItem value="OR" disabled>OR 组合（暂不支持）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {conditionType === "SIMPLE" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="field">匹配字段</Label>
                    <Select value={field} onValueChange={setField}>
                      <SelectTrigger id="field">
                        <SelectValue placeholder="选择匹配字段" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      支持 `method`、`path`、`body`、`header.xxx`、`query.xxx`
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="operator">匹配操作符</Label>
                    <Select value={operator} onValueChange={(val) => setOperator(val as MatchOperator)}>
                      <SelectTrigger id="operator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="value">匹配值</Label>
                    <Input
                      id="value"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="输入期望匹配的值，正则模式下这里填写表达式"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Reply className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                响应配置
              </h3>
            </div>

            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="statusCode">HTTP 状态码</Label>
                  <Input
                    id="statusCode"
                    type="number"
                    value={statusCode}
                    onChange={(e) => setStatusCode(e.target.value)}
                    placeholder="200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="delay">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      延迟时间（毫秒）
                    </span>
                  </Label>
                  <Input
                    id="delay"
                    type="number"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>预览标签</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">{statusCode || 200}</Badge>
                    <Badge variant="outline">{operator}</Badge>
                    <Badge variant="outline">优先级 {priority || 0}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headers">
                  <span className="inline-flex items-center gap-1">
                    <FileCode2 className="size-3.5" />
                    响应头（JSON）
                  </span>
                </Label>
                <Textarea
                  id="headers"
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Content-Type": "application/json"}'
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="body">响应体</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"message": "OK"}'
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 px-8 py-4 border-t shrink-0 bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
            {editTarget ? "保存修改" : "创建规则"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
