import axios from "axios"
import type {
  MessageTemplateDetail,
  MessageTemplateSummary,
  SaveMessageTemplateRequest,
  VariableGeneratorDescriptor,
  ProtocolClientDescriptor,
  SendMessageRequest,
  SendMessageResponse,
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
