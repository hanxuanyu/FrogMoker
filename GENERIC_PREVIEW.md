# 通用请求预览组件

## 概述

`GenericRequestPreview` 是一个智能的通用请求预览组件，为所有协议客户端自动生成专业的请求预览界面。无需为每个协议单独开发预览组件，系统会根据参数类型和配置自动选择最佳的展示方式。

## 设计理念

**元数据驱动 + 智能渲染**

组件通过读取协议描述信息（`ProtocolClientDescriptor`）和参数配置，自动生成适合该协议的预览界面。不同类型的参数会使用不同的展示方式，确保信息清晰、易读。

## 功能特性

### 1. 自动协议信息展示

显示协议的基本信息：
- 协议标识（Badge）
- 协议名称
- 协议描述

### 2. 智能参数分组

自动将参数分为两类：
- **简单参数**：TEXT、NUMBER、BOOLEAN、SELECT
  - 紧凑展示在一个卡片中
  - 节省空间，便于快速浏览

- **复杂参数**：TEXTAREA、MAP、ARRAY
  - 每个参数独立展示在单独的卡片中
  - 提供更多空间展示详细内容

### 3. 类型化渲染

根据参数类型自动选择最佳展示方式：

| 参数类型 | 展示方式 | 说明 |
|---------|---------|------|
| TEXT | 内联文本 | 使用等宽字体，支持长文本换行 |
| NUMBER | 内联代码 | 使用等宽字体突出显示 |
| BOOLEAN | Badge | 绿色表示"是"，灰色表示"否" |
| SELECT | Badge | 轮廓样式 Badge |
| MAP | 表格 | 两列表格展示键值对 |
| ARRAY | 表格 | 单列表格展示列表项 |
| TEXTAREA | 代码编辑器或文本块 | 自动检测 JSON 格式，使用语法高亮 |

### 4. 智能内容检测

对于 TEXTAREA 类型：
- 自动检测 JSON 格式
- JSON 内容使用 CodeMirror 编辑器展示，带语法高亮
- 非 JSON 内容使用文本块展示
- 支持深色/浅色主题

### 5. 空值处理

- 自动隐藏未设置的参数
- 空的 MAP（`{}`）和 ARRAY（`[]`）不显示
- 如果所有参数都为空，显示友好提示

### 6. 参数联动支持

- 自动应用参数联动规则
- 隐藏的参数不会出现在预览中
- 与左侧配置表单保持一致

### 7. 响应式设计

- 支持深色/浅色主题
- 自适应容器大小
- 滚动查看长内容

## 使用示例

### WebSocket 协议预览效果

当配置以下参数时：
```
url: ws://localhost:8080/ws/echo
message: Hello, WebSocket!
connectTimeout: 5000
waitForResponse: true
expectedMessages: 1
```

预览界面会显示：

**协议信息卡片：**
```
[WEBSOCKET] WebSocket 客户端
通过 WebSocket 协议建立连接并发送消息，支持实时双向通信
```

**请求参数卡片：**
```
WebSocket 地址 *    ws://localhost:8080/ws/echo
连接超时           5000
等待响应           [是]
期望响应数         1
```

**消息内容卡片：**
```
消息内容 * [TEXTAREA]
要发送的消息内容，支持文本格式

Hello, WebSocket!
```

### HTTP 协议对比

HTTP 协议使用自定义的 `HttpRequestPreview` 组件，提供更专业的 HTTP 请求预览：
- 请求行（方法 + URL）
- 请求头表格
- 查询参数表格
- 请求体（带语法高亮）

而其他协议使用 `GenericRequestPreview`，同样能提供清晰的预览效果。

## 代码实现

### 核心逻辑

```typescript
// 1. 获取可见的参数列表
const visibleParams = protocol.params.filter((param) => {
  if (!isParamVisible) return true
  return isParamVisible(param)
})

// 2. 按类型分组
const groupedParams = visibleParams.reduce((acc, param) => {
  const value = params[param.name] || param.defaultValue || ""
  const hasValue = value && value.trim() !== "" && value !== "{}" && value !== "[]"

  if (param.paramType === "TEXTAREA" || param.paramType === "MAP" || param.paramType === "ARRAY") {
    if (hasValue) {
      acc.complex.push(param)
    }
  } else {
    acc.simple.push(param)
  }
  return acc
}, { simple: [], complex: [] })

// 3. 根据类型渲染
const renderParamValue = (param, value) => {
  switch (param.paramType) {
    case "BOOLEAN":
      return <Badge>{value === "true" ? "是" : "否"}</Badge>
    case "MAP":
      return <Table>...</Table>
    case "TEXTAREA":
      return detectFormat(value) === "json"
        ? <CodeMirror value={value} />
        : <pre>{value}</pre>
    // ... 其他类型
  }
}
```

### 集成方式

在 `SenderPage.tsx` 中：

```typescript
<div className="flex-1 overflow-hidden">
  {selectedProtocol === "HTTP" ? (
    <HttpRequestPreview
      params={clientParams}
      isDark={isDark}
      protocol={protocols.find((p) => p.protocol === selectedProtocol)}
      isParamVisible={isParamVisible}
    />
  ) : (
    <GenericRequestPreview
      params={clientParams}
      isDark={isDark}
      protocol={protocols.find((p) => p.protocol === selectedProtocol)}
      isParamVisible={isParamVisible}
    />
  )}
</div>
```

## 优势

### 1. 零配置

新增协议后，无需任何前端开发即可获得专业的预览界面。

### 2. 一致性

所有协议使用统一的预览风格，用户体验一致。

### 3. 可扩展

如果需要更专业的预览效果，可以为特定协议开发自定义预览组件（如 HTTP）。

### 4. 智能化

自动检测内容格式、自动分组、自动隐藏空值，无需手动配置。

### 5. 主题支持

自动适配深色/浅色主题，与整体界面风格保持一致。

## 最佳实践

### 1. 合理使用参数类型

选择合适的参数类型可以获得更好的预览效果：
- 长文本使用 TEXTAREA
- 键值对使用 MAP
- 列表使用 ARRAY
- 开关选项使用 BOOLEAN

### 2. 提供清晰的描述

参数的 `label` 和 `description` 会显示在预览中，应该：
- `label`：简短、准确
- `description`：详细说明参数用途

### 3. 设置合理的默认值

默认值会在预览中显示，应该：
- 提供有意义的默认值
- 避免使用空字符串作为默认值

### 4. 利用参数联动

通过参数联动隐藏不相关的参数，使预览更简洁。

## 扩展建议

如果通用预览无法满足需求，可以考虑：

1. **开发自定义预览组件**
   - 参考 `HttpRequestPreview` 的实现
   - 提供更专业的协议特定展示

2. **扩展参数类型**
   - 添加新的参数类型（如 FILE、COLOR 等）
   - 在 `GenericRequestPreview` 中添加对应的渲染逻辑

3. **增强交互功能**
   - 添加参数编辑功能
   - 添加复制、导出功能

## 总结

`GenericRequestPreview` 组件体现了系统的**元数据驱动**设计理念：

- 后端定义协议和参数
- 前端自动生成界面
- 无需手动开发

这大大降低了新增协议的开发成本，同时保证了用户体验的一致性和专业性。开发者可以专注于协议的核心逻辑实现，而不必担心前端展示问题。
