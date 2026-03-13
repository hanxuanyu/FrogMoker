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
}

export interface SendMessageResponse {
  success: boolean
  statusCode?: number
  sentMessage: string
  responseContent?: string
  errorMessage?: string
  duration: number
}
