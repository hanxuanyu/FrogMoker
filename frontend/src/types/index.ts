export interface Result<T> {
  code: number
  message: string
  data: T
}

export type MessageType = "JSON" | "XML"

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

export interface VariableGeneratorParamDescriptor {
  name: string
  label: string
  description: string
  required: boolean
  defaultValue: string
}

export interface VariableGeneratorDescriptor {
  type: string
  name: string
  description: string
  params: VariableGeneratorParamDescriptor[]
}
