import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading, SubHeading } from "../components/SectionHeading";

export default function APIReference() {
  return (
    <>
          <SectionHeading id="api-reference">API 参考</SectionHeading>

          <SubHeading>属性</SubHeading>
          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>属性</th>
                  <th>类型</th>
                  <th>默认值</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>data</code>
                  </td>
                  <td>
                    <code>MindMapData | MindMapData[]</code>
                  </td>
                  <td>
                    <em>必填</em>
                  </td>
                  <td>思维导图数据（单个根节点或根节点数组）</td>
                </tr>
                <tr>
                  <td>
                    <code>markdown</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>-</td>
                  <td>
                    Markdown 列表来源（设置后会覆盖 <code>data</code>）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>defaultDirection</code>
                  </td>
                  <td>
                    <code>'left' | 'right' | 'both'</code>
                  </td>
                  <td>
                    <code>'both'</code>
                  </td>
                  <td>初始布局方向</td>
                </tr>
                <tr>
                  <td>
                    <code>theme</code>
                  </td>
                  <td>
                    <code>'light' | 'dark' | 'auto'</code>
                  </td>
                  <td>
                    <code>'auto'</code>
                  </td>
                  <td>颜色主题</td>
                </tr>
                <tr>
                  <td>
                    <code>locale</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>
                    <em>自动</em>
                  </td>
                  <td>
                    界面语言（自动检测，也可以指定 <code>'zh-CN'</code> 或 <code>'en-US'</code>）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>messages</code>
                  </td>
                  <td>
                    <code>{"Partial<MindMapMessages>"}</code>
                  </td>
                  <td>-</td>
                  <td>覆盖任意界面文案</td>
                </tr>
                <tr>
                  <td>
                    <code>readonly</code>
                  </td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>只读模式（不可编辑或新建）</td>
                </tr>
                <tr>
                  <td>
                    <code>toolbar</code>
                  </td>
                  <td>
                    <code>boolean | ToolbarConfig</code>
                  </td>
                  <td>
                    <code>true</code>
                  </td>
                  <td>显示或隐藏缩放、历史和标签控件</td>
                </tr>
                <tr>
                  <td>
                    <code>ai</code>
                  </td>
                  <td>
                    <code>MindMapAIConfig</code>
                  </td>
                  <td>-</td>
                  <td>
                    AI 生成配置（参见{" "}
                    <a
                      href="#ai-generation"
                      className="text-primary hover:underline"
                    >
                      AI 生成
                    </a>
                    )
                  </td>
                </tr>
                <tr>
                  <td><code>selectedNodeId</code></td>
                  <td><code>string | null</code></td>
                  <td>-</td>
                  <td>受控的选中节点 ID</td>
                </tr>
                <tr>
                  <td><code>activeTags</code></td>
                  <td><code>string[]</code></td>
                  <td>-</td>
                  <td>受控的活动标签筛选条件</td>
                </tr>
                <tr>
                  <td>
                    <code>plugins</code>
                  </td>
                  <td>
                    <code>MindMapPlugin[]</code>
                  </td>
                  <td>
                    <code>allPlugins</code>
                  </td>
                  <td>启用的扩展语法插件</td>
                </tr>
                <tr>
                  <td>
                    <code>textEditor</code>
                  </td>
                  <td>
                    <code>ComponentType</code>
                  </td>
                  <td>
                    <code>-</code>
                  </td>
                  <td>传入 <code>MindMapTextEditor</code> 以启用带语法高亮的文本编辑模式；该功能支持按需打包。</td>
                </tr>
                <tr>
                  <td>
                    <code>onDataChange</code>
                  </td>
                  <td>
                    <code>{"(data: MindMapData[]) => void"}</code>
                  </td>
                  <td>-</td>
                  <td>用户交互修改节点树时触发</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubHeading>ToolbarConfig 工具栏配置</SubHeading>
          <CodeBlock lang="typescript">{`interface ToolbarConfig {
  zoom?: boolean; // 显示缩放控件（默认：true）
  history?: boolean; // 显示撤销/重做控件（默认：true）
  tags?: boolean; // 显示标签筛选项（默认：true）
}`}</CodeBlock>

          <SubHeading>Ref 方法</SubHeading>
          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>方法</th>
                  <th>返回值</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>exportToSVG()</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>将思维导图导出为 SVG 字符串</td>
                </tr>
                <tr>
                  <td>
                    <code>exportToPNG()</code>
                  </td>
                  <td>
                    <code>{"Promise<Blob>"}</code>
                  </td>
                  <td>生成高清 PNG Blob</td>
                </tr>
                <tr>
                  <td>
                    <code>exportToOutline()</code>
                  </td>
                  <td>
                    <code>string</code>
                  </td>
                  <td>将节点树序列化为 Markdown 列表</td>
                </tr>
                <tr>
                  <td><code>getMarkdown()</code></td>
                  <td><code>string</code></td>
                  <td>将节点树序列化为 Markdown</td>
                </tr>
                <tr>
                  <td>
                    <code>getData()</code>
                  </td>
                  <td>
                    <code>MindMapData[]</code>
                  </td>
                  <td>返回当前节点树数据</td>
                </tr>
                <tr>
                  <td>
                    <code>setData(data)</code>
                  </td>
                  <td>
                    <code>void</code>
                  </td>
                  <td>通过编辑历史替换节点树数据，并触发 <code>onDataChange</code></td>
                </tr>
                <tr>
                  <td>
                    <code>setMarkdown(md)</code>
                  </td>
                  <td>
                    <code>void</code>
                  </td>
                  <td>解析 Markdown，应用有效的前置元数据，并触发 <code>onDataChange</code></td>
                </tr>
                <tr>
                  <td><code>importMarkdown(md)</code></td>
                  <td><code>void</code></td>
                  <td>通过编辑历史导入 Markdown</td>
                </tr>
                <tr>
                  <td><code>importData(data)</code></td>
                  <td><code>void</code></td>
                  <td>通过编辑历史导入 JSON 数据</td>
                </tr>
                <tr>
                  <td><code>selectNode(id)</code></td>
                  <td><code>void</code></td>
                  <td>选择节点或清除选择</td>
                </tr>
                <tr>
                  <td><code>focusNode(id)</code></td>
                  <td><code>void</code></td>
                  <td>选择节点并将其平移到视图中</td>
                </tr>
                <tr>
                  <td><code>undo() / redo()</code></td>
                  <td><code>void</code></td>
                  <td>在编辑历史中前进或后退</td>
                </tr>
                <tr>
                  <td>
                    <code>fitView()</code>
                  </td>
                  <td>
                    <code>void</code>
                  </td>
                  <td>重置缩放和平移，使所有节点适配视图</td>
                </tr>
                <tr>
                  <td>
                    <code>setDirection(dir)</code>
                  </td>
                  <td>
                    <code>void</code>
                  </td>
                  <td>修改布局方向</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubHeading>数据结构</SubHeading>
          <CodeBlock lang="typescript">{`interface MindMapData {
  id: string;
  text: string;
  children?: MindMapData[];
  remark?: string;              // 多行备注
  taskStatus?: "todo" | "doing" | "done";
  // 插件扩展字段（由插件填充）
  dottedLine?: boolean;         // 虚线插件
  multiLineContent?: string[];  // 多行插件
  tags?: string[];              // 标签插件
  anchorId?: string;            // 交叉链接插件
  crossLinks?: CrossLink[];     // 交叉链接插件
  collapsed?: boolean;          // 折叠插件
}

interface CrossLink {
  targetAnchorId: string;
  label?: string;
  dotted?: boolean;
}`}</CodeBlock>

          <SubHeading>MindMapViewer</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded text-sm">MindMap</code> 的轻量只读替代组件。
            从 <code className="text-primary bg-primary/5 px-1.5 py-0.5 rounded text-sm">@xiangfa/mindmap/viewer</code> 导入可以获得最小打包体积。
          </p>

          <h4 className="font-bold text-slate-900 dark:text-white mt-6 mb-3">MindMapViewer 属性</h4>
          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>属性</th>
                  <th>类型</th>
                  <th>默认值</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>data</code></td>
                  <td><code>MindMapData | MindMapData[]</code></td>
                  <td>-</td>
                  <td>思维导图数据（单个根节点或根节点数组）</td>
                </tr>
                <tr>
                  <td><code>markdown</code></td>
                  <td><code>string</code></td>
                  <td>-</td>
                  <td>Markdown 列表来源（设置后会覆盖 <code>data</code>）</td>
                </tr>
                <tr>
                  <td><code>defaultDirection</code></td>
                  <td><code>'left' | 'right' | 'both'</code></td>
                  <td><code>'both'</code></td>
                  <td>初始布局方向</td>
                </tr>
                <tr>
                  <td><code>theme</code></td>
                  <td><code>'light' | 'dark' | 'auto'</code></td>
                  <td><code>'auto'</code></td>
                  <td>颜色主题</td>
                </tr>
                <tr>
                  <td><code>locale</code></td>
                  <td><code>string</code></td>
                  <td><em>自动</em></td>
                  <td>界面语言</td>
                </tr>
                <tr>
                  <td><code>messages</code></td>
                  <td><code>{"Partial<MindMapMessages>"}</code></td>
                  <td>-</td>
                  <td>覆盖任意界面文案</td>
                </tr>
                <tr>
                  <td><code>toolbar</code></td>
                  <td><code>boolean | ToolbarConfig</code></td>
                  <td><code>true</code></td>
                  <td>显示或隐藏缩放、历史和标签控件</td>
                </tr>
                <tr>
                  <td><code>plugins</code></td>
                  <td><code>MindMapPlugin[]</code></td>
                  <td>-</td>
                  <td>启用的扩展语法插件</td>
                </tr>
                <tr>
                  <td><code>onEvent</code></td>
                  <td><code>{"(event: MindMapEvent) => void"}</code></td>
                  <td>-</td>
                  <td>缩放、方向变化或节点选择时触发</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="font-bold text-slate-900 dark:text-white mt-6 mb-3">MindMapViewerRef 方法</h4>
          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>方法</th>
                  <th>返回值</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>getData()</code></td>
                  <td><code>MindMapData[]</code></td>
                  <td>返回当前节点树数据</td>
                </tr>
                <tr>
                  <td><code>fitView()</code></td>
                  <td><code>void</code></td>
                  <td>重置缩放和平移，使所有节点适配视图</td>
                </tr>
                <tr>
                  <td><code>setDirection(dir)</code></td>
                  <td><code>void</code></td>
                  <td>修改布局方向</td>
                </tr>
              </tbody>
            </table>
          </div>
    </>
  );
}
