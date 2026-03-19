export interface Result<T> {
  code: number
  message: string
  data: T
}

export type MessageType = "JSON" | "XML" | "MAP"

export interface MessageTemplateSummary {
  id: number
  name: string
  description: string
  messageType: MessageType
  contentPreview: string
  createdAt: string
  updatedAt: string
}

export interface TemplateVariableResponse {
  id: number
  variableName: string
  generatorType: string
  generatorParams: Record<string, string>
}

export interface MessageTemplateDetail {
  id: number
  name: string
  description: string
  messageType: MessageType
  content: string
  variables: TemplateVariableResponse[]
  createdAt: string
  updatedAt: string
}

export interface TemplateVariableRequest {
  variableName: string
  generatorType: string
  generatorParams: Record<string, string>
}

export interface SaveMessageTemplateRequest {
  name: string
  description?: string
  messageType: MessageType
  content: string
  variables: TemplateVariableRequest[]
}

export type ParamType = "TEXT" | "TEXTAREA" | "BOOLEAN" | "SELECT" | "MAP" | "ARRAY" | "NUMBER"

export interface SelectOption {
  value: string
  label: string
}

export interface ParamDependency {
  dependsOn?: string
  expectedValues?: string[]
  condition?: "EQUALS" | "NOT_EQUALS" | "NOT_EMPTY" | "IS_EMPTY"
  dependencies?: ParamDependency[]
  combineLogic?: "AND" | "OR"
}

export interface VariableGeneratorParamDescriptor {
  name: string
  label: string
  description: string
  paramType: ParamType
  required: boolean
  defaultValue: string
  options?: SelectOption[]
  dependency?: ParamDependency
  placeholder?: string
}

export interface VariableGeneratorDescriptor {
  type: string
  name: string
  description: string
  params: VariableGeneratorParamDescriptor[]
}

export interface ProtocolClientParamDescriptor {
  name: string
  label: string
  description: string
  paramType: ParamType
  required: boolean
  defaultValue: string
  options?: SelectOption[]
  dependency?: ParamDependency
  placeholder?: string
  keyLabel?: string
  valueLabel?: string
  itemLabel?: string
}

export interface ProtocolClientDescriptor {
  protocol: string
  name: string
  description: string
  params: ProtocolClientParamDescriptor[]
}

export interface SendMessageRequest {
  templateId?: number
  customContent?: string
  protocol: string
  clientParams: Record<string, string>
  parameterTemplates?: Record<string, number>
}

export interface SendMessageResponse {
  success: boolean
  statusCode?: number
  sentMessage: string
  sentClientParams?: Record<string, string>
  responseContent?: string
  errorMessage?: string
  duration: number
}

// ========== Server Management Types ==========

export interface ProtocolServerDescriptor {
  type: string
  name: string
  description: string
  params: ParamDescriptor[]
  supportsMatcher: boolean
  supportsCustomUI: boolean
  customUIComponent?: string
}

export interface ParamDescriptor {
  name: string
  label: string
  description: string
  paramType: ParamType
  required: boolean
  defaultValue: string
  options?: SelectOption[]
  dependency?: ParamDependency
  placeholder?: string
  keyLabel?: string
  valueLabel?: string
  itemLabel?: string
}

export type ServerStatus = "STOPPED" | "RUNNING" | "FAILED"

export interface ServerInstance {
  id: number
  name: string
  description: string
  protocol: string
  params: string
  status: ServerStatus
  startTime?: string
  stopTime?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface ServerStatusInfo {
  running: boolean
  startTime?: number
  listenAddress?: string
  errorMessage?: string
  totalRequests: number
  lastRequestTime?: number
}

export interface CreateServerInstanceRequest {
  name: string
  description?: string
  protocol: string
  params: Record<string, string>
}

export interface UpdateServerInstanceRequest {
  name: string
  description?: string
  params: Record<string, string>
}

export type ConditionType = "SIMPLE" | "AND" | "OR"
export type MatchOperator = "EQUALS" | "CONTAINS" | "REGEX" | "EXISTS" | "NOT_EQUALS" | "NOT_CONTAINS"

export interface MatchCondition {
  type: ConditionType
  field?: string
  operator?: MatchOperator
  value?: string
  children?: MatchCondition[]
}

export interface ResponseConfig {
  statusCode: number
  headers?: Record<string, string>
  body?: string
  delay?: number
}

export interface MatchRule {
  id: number
  instanceId: number
  name: string
  description: string
  priority: number
  condition: string
  response: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateMatchRuleRequest {
  name: string
  description?: string
  priority?: number
  condition: MatchCondition
  response: ResponseConfig
}

export interface UpdateMatchRuleRequest {
  name: string
  description?: string
  priority?: number
  condition: MatchCondition
  response: ResponseConfig
}

export interface RequestLog {
  id: number
  instanceId: number
  method: string
  path: string
  headers: string
  queryParams: string
  body: string
  statusCode: number
  duration: number
  matchedRuleId?: number
  createdAt: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}
