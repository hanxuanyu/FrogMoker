import axios from "axios"
import type {
  MessageTemplateDetail,
  MessageTemplateSummary,
  SaveMessageTemplateRequest,
  VariableGeneratorDescriptor,
  ProtocolClientDescriptor,
  SendMessageRequest,
  SendMessageResponse,
  ProtocolServerDescriptor,
  ServerInstance,
  CreateServerInstanceRequest,
  UpdateServerInstanceRequest,
  ServerStatusInfo,
  MatchRule,
  CreateMatchRuleRequest,
  UpdateMatchRuleRequest,
  RequestLog,
  PageResult,
} from "@/types"

const http = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:8080/api/v1" : "/api/v1",
  timeout: 10000,
})

http.interceptors.response.use(
  (res) => {
    const result = res.data
    if (result.code !== 200) {
      return Promise.reject(new Error(result.message || "请求失败"))
    }
    return result.data
  },
  (err) => Promise.reject(err),
)

export const templateApi = {
  list: (): Promise<MessageTemplateSummary[]> => http.get("/message-templates"),

  detail: (id: number): Promise<MessageTemplateDetail> =>
    http.get(`/message-templates/${id}`),

  create: (data: SaveMessageTemplateRequest): Promise<number> =>
    http.post("/message-templates", data),

  update: (id: number, data: SaveMessageTemplateRequest): Promise<void> =>
    http.put(`/message-templates/${id}`, data),

  delete: (id: number): Promise<void> =>
    http.delete(`/message-templates/${id}`),

  format: (messageType: string, content: string): Promise<string> =>
    http.post("/message-templates/format", { messageType, content }),

  parseVariables: (
    messageType: string,
    content: string,
  ): Promise<string[]> =>
    http.post("/message-templates/parse-variables", { messageType, content }),

  render: (templateId: number): Promise<string> =>
    http.post("/message-templates/render", { templateId }),

  listGenerators: (): Promise<VariableGeneratorDescriptor[]> =>
    http.get("/message-templates/generators"),
}

export const senderApi = {
  listProtocols: (): Promise<ProtocolClientDescriptor[]> =>
    http.get("/sender/protocols"),

  send: (data: SendMessageRequest): Promise<SendMessageResponse> =>
    http.post("/sender/send", data),
}

export const serverApi = {
  listProtocols: (): Promise<ProtocolServerDescriptor[]> =>
    http.get("/server/protocols"),

  listInstances: (): Promise<ServerInstance[]> =>
    http.get("/server/instances"),

  getInstance: (id: number): Promise<ServerInstance> =>
    http.get(`/server/instances/${id}`),

  createInstance: (data: CreateServerInstanceRequest): Promise<ServerInstance> =>
    http.post("/server/instances", data),

  updateInstance: (id: number, data: UpdateServerInstanceRequest): Promise<ServerInstance> =>
    http.put(`/server/instances/${id}`, data),

  deleteInstance: (id: number): Promise<void> =>
    http.delete(`/server/instances/${id}`),

  startInstance: (id: number): Promise<void> =>
    http.post(`/server/instances/${id}/start`),

  stopInstance: (id: number): Promise<void> =>
    http.post(`/server/instances/${id}/stop`),

  restartInstance: (id: number): Promise<void> =>
    http.post(`/server/instances/${id}/restart`),

  getStatus: (id: number): Promise<ServerStatusInfo> =>
    http.get(`/server/instances/${id}/status`),

  listRules: (instanceId: number): Promise<MatchRule[]> =>
    http.get(`/server/instances/${instanceId}/rules`),

  getRule: (ruleId: number): Promise<MatchRule> =>
    http.get(`/server/rules/${ruleId}`),

  createRule: (instanceId: number, data: CreateMatchRuleRequest): Promise<MatchRule> =>
    http.post(`/server/instances/${instanceId}/rules`, data),

  updateRule: (ruleId: number, data: UpdateMatchRuleRequest): Promise<MatchRule> =>
    http.put(`/server/rules/${ruleId}`, data),

  deleteRule: (ruleId: number): Promise<void> =>
    http.delete(`/server/rules/${ruleId}`),

  toggleRule: (ruleId: number, enabled: boolean): Promise<void> =>
    http.put(`/server/rules/${ruleId}/toggle`, null, { params: { enabled } }),

  updatePriority: (ruleId: number, priority: number): Promise<void> =>
    http.put(`/server/rules/${ruleId}/priority`, { priority }),

  listLogs: (instanceId: number, page: number, size: number): Promise<PageResult<RequestLog>> =>
    http.get(`/server/instances/${instanceId}/logs`, { params: { page, size } }),

  clearLogs: (instanceId: number): Promise<void> =>
    http.delete(`/server/instances/${instanceId}/logs`),

  getLog: (logId: number): Promise<RequestLog> =>
    http.get(`/server/logs/${logId}`),
}
