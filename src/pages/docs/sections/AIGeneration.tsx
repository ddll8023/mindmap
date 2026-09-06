import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading, SubHeading } from "../components/SectionHeading";

export default function AIGeneration() {
  return (
    <>
          <SectionHeading id="ai-generation">AI 生成</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            内置的 AI 生成功能可以连接任意兼容 OpenAI 的 API，通过自然语言生成思维导图。
            传入 <code className="text-xs">ai</code> 属性后，思维导图底部会显示文本输入栏，
            用户输入提示词后，AI 会实时流式返回结构化思维导图。
          </p>

          <SubHeading>基本用法</SubHeading>
          <CodeBlock lang="tsx">{`import { MindMap } from "@xiangfa/mindmap";
import "@xiangfa/mindmap/style.css";

function App() {
  return (
    <MindMap
      ai={{
        apiUrl: "https://api.openai.com/v1/chat/completions",
        apiKey: "sk-...",
        model: "gpt-5",
      }}
    />
  );
}`}</CodeBlock>

          <SubHeading>MindMapAIConfig 配置</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            编写自定义 <code>request</code> 请求适配器时，可以从主包导入
            <code>MindMapAIRequestPayload</code> 类型。
          </p>
          <CodeBlock lang="typescript">{`type AIAttachmentType = "text" | "image" | "pdf";

interface MindMapAIConfig {
  apiUrl: string;              // 兼容 OpenAI 的 API 端点
  apiKey: string;              // API 密钥（Bearer 令牌）
  model: string;               // 模型名称（例如："gpt-5"）
  systemPrompt?: string;       // 自定义系统提示词（有内置默认值）
  attachments?: AIAttachmentType[];  // 允许的附件类型（默认：[]）
  maxAttachmentSize?: number;  // 单文件字节限制（默认：5MB）
  headers?: Record<string, string>;  // 额外请求头
  request?: (payload: MindMapAIRequestPayload) => Promise<Response>; // 代理请求适配器
}`}</CodeBlock>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            在生产环境中，建议使用 <code>request</code> 适配器调用服务端代理，避免 API 密钥暴露在客户端。
          </p>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>字段</th>
                  <th>类型</th>
                  <th>必填</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>apiUrl</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>是</td>
                  <td>兼容 OpenAI 的聊天补全端点</td>
                </tr>
                <tr>
                  <td>
                    <code>apiKey</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>是</td>
                  <td>
                    以 <code>Bearer</code> 令牌形式发送 API 密钥
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>model</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>是</td>
                  <td>
                    模型标识符（例如：<code>gpt-5</code>、{" "}
                    <code>deepseek-chat</code>)
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>systemPrompt</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>否</td>
                  <td>覆盖内置的思维导图生成提示词</td>
                </tr>
                <tr>
                  <td>
                    <code>attachments</code>
                  </td>
                  <td>
                    <code>{"AIAttachmentType[]"}</code>
                  </td>
                  <td>否</td>
                  <td>启用文件上传（见下表）</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubHeading>文件附件</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            在 <code className="text-xs">attachments</code> 数组中指定允许的类型即可启用文件附件。
            启用后，输入栏中会显示回形针按钮。
          </p>

          <CodeBlock lang="tsx">{`<MindMap
  ai={{
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "sk-...",
    model: "gpt-5",
    attachments: ["text", "image", "pdf"],
  }}
/>`}</CodeBlock>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>支持的文件</th>
                  <th>API 格式</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>"text"</code>
                  </td>
                  <td>
                    所有 <code>text/*</code> MIME 类型
                  </td>
                  <td>内容以文本形式发送到消息中</td>
                </tr>
                <tr>
                  <td>
                    <code>"image"</code>
                  </td>
                  <td>
                    所有 <code>image/*</code> MIME 类型
                  </td>
                  <td>
                    以 <code>image_url</code> 形式发送（Base64 数据 URL）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>"pdf"</code>
                  </td>
                  <td>
                    <code>application/pdf</code>
                  </td>
                  <td>使用自定义请求适配器处理服务商特有的 PDF 格式</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubHeading>自定义系统提示词</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            AI 生成功能内置了用于生成思维导图 Markdown 的系统提示词，也可以替换为自定义提示词：
          </p>

          <CodeBlock lang="tsx">{`<MindMap
  ai={{
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "sk-...",
    model: "gpt-5",
    systemPrompt: "请围绕给定主题生成思维导图，使用以 - 开头的 Markdown 列表表示节点...",
  }}
/>`}</CodeBlock>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 mb-6">
            <strong>安全提示：</strong>API 密钥会从浏览器端发送。生产环境请使用代理端点，将密钥保留在服务端。
          </p>
    </>
  );
}
