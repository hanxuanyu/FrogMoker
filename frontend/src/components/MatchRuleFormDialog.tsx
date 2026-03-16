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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { serverApi } from "@/api"
import type { MatchRule, MatchCondition, ResponseConfig, ConditionType, MatchOperator } from "@/types"

interface MatchRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instanceId: number
  editTarget: MatchRule | null
  onSuccess: () => void
}

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

  // 匹配条件
  const [conditionType, setConditionType] = useState<ConditionType>("SIMPLE")
  const [field, setField] = useState("")
  const [operator, setOperator] = useState<MatchOperator>("EQUALS")
  const [value, setValue] = useState("")

  // 响应配置
  const [statusCode, setStatusCode] = useState("200")
  const [headers, setHeaders] = useState("{}")
  const [body, setBody] = useState("")
  const [delay, setDelay] = useState("")

  useEffect(() => {
    if (open) {
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
          // 使用默认值
        }

        try {
          const response: ResponseConfig = JSON.parse(editTarget.response)
          setStatusCode(String(response.statusCode))
          setHeaders(JSON.stringify(response.headers || {}))
          setBody(response.body || "")
          setDelay(response.delay ? String(response.delay) : "")
        } catch {
          // 使用默认值
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
        setHeaders("{}")
        setBody('{"message": "OK"}')
        setDelay("")
      }
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

    // 构建匹配条件
    const condition: MatchCondition = {
      type: conditionType,
      field: conditionType === "SIMPLE" ? field : undefined,
      operator: conditionType === "SIMPLE" ? operator : undefined,
      value: conditionType === "SIMPLE" ? value : undefined,
    }

    // 构建响应配置
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTarget ? "编辑匹配规则" : "新建匹配规则"}</DialogTitle>
          <DialogDescription>
            配置请求匹配条件和对应的响应内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              规则名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入规则名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">规则描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入规则描述（可选）"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">优先级</Label>
            <Input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="数字越大优先级越高"
            />
            <p className="text-xs text-muted-foreground">
              数字越大优先级越高，优先匹配高优先级规则
            </p>
          </div>

          {/* 匹配条件 */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">匹配条件</h3>

            <div className="space-y-2">
              <Label htmlFor="conditionType">条件类型</Label>
              <Select
                value={conditionType}
                onValueChange={(val) => setConditionType(val as ConditionType)}
              >
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="field">匹配字段</Label>
                  <Select value={field} onValueChange={setField}>
                    <SelectTrigger id="field">
                      <SelectValue placeholder="选择匹配字段" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="method">请求方法 (method)</SelectItem>
                      <SelectItem value="path">请求路径 (path)</SelectItem>
                      <SelectItem value="body">请求体 (body)</SelectItem>
                      <SelectItem value="header.Content-Type">请求头 Content-Type</SelectItem>
                      <SelectItem value="header.Authorization">请求头 Authorization</SelectItem>
                      <SelectItem value="query.id">查询参数 id</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    支持 method、path、body、header.xxx、query.xxx 格式
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator">匹配操作符</Label>
                  <Select
                    value={operator}
                    onValueChange={(val) => setOperator(val as MatchOperator)}
                  >
                    <SelectTrigger id="operator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUALS">等于</SelectItem>
                      <SelectItem value="CONTAINS">包含</SelectItem>
                      <SelectItem value="REGEX">正则匹配</SelectItem>
                      <SelectItem value="EXISTS">字段存在</SelectItem>
                      <SelectItem value="NOT_EQUALS">不等于</SelectItem>
                      <SelectItem value="NOT_CONTAINS">不包含</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">匹配值</Label>
                  <Input
                    id="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="输入匹配值"
                  />
                </div>
              </>
            )}
          </div>

          {/* 响应配置 */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">响应配置</h3>

            <div className="space-y-2">
              <Label htmlFor="statusCode">HTTP 状态码</Label>
              <Input
                id="statusCode"
                type="number"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                placeholder="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headers">响应头（JSON 格式）</Label>
              <Textarea
                id="headers"
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">响应体</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"message": "OK"}'
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">延迟时间（毫秒）</Label>
              <Input
                id="delay"
                type="number"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                模拟网络延迟，单位毫秒（可选）
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            {editTarget ? "保存" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
