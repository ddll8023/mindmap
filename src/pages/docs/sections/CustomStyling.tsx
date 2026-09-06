import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading, SubHeading } from "../components/SectionHeading";

export default function CustomStyling() {
  return (
    <>
          <SectionHeading id="custom-styling">自定义样式</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            开放思维导图为每个 SVG 元素提供<strong>30 多个 CSS 自定义属性</strong>和语义化 CSS 类名。
            只需使用 CSS 即可自定义颜色、字体、连接线和分支样式，无需编写 JavaScript。
          </p>

          <SubHeading>CSS 自定义属性</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            在 <code>.mindmap-container</code> 上覆盖 CSS 变量，即可全局修改主题值：
          </p>
          <CodeBlock lang="css">{`.mindmap-container {
  --mindmap-canvas-bg: #f0f4f8;
  --mindmap-root-bg: #1a73e8;
  --mindmap-root-text: #ffffff;
  --mindmap-node-text: #1a1a2e;
  --mindmap-edge-width: 3;
}`}</CodeBlock>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-6 mb-4">
            可用的变量分组：
          </p>
          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>分组</th>
                  <th>变量</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>画布</td>
                  <td>
                    <code>--mindmap-canvas-bg</code>
                  </td>
                </tr>
                <tr>
                  <td>根节点</td>
                  <td>
                    <code>--mindmap-root-bg</code>,{" "}
                    <code>--mindmap-root-text</code>,{" "}
                    <code>--mindmap-root-font-size</code>,{" "}
                    <code>--mindmap-root-font-weight</code>,{" "}
                    <code>--mindmap-root-font-family</code>
                  </td>
                </tr>
                <tr>
                  <td>子节点</td>
                  <td>
                    <code>--mindmap-node-text</code>,{" "}
                    <code>--mindmap-node-font-size</code>,{" "}
                    <code>--mindmap-node-font-weight</code>,{" "}
                    <code>--mindmap-node-font-family</code>
                  </td>
                </tr>
                <tr>
                  <td>第 1 层</td>
                  <td>
                    <code>--mindmap-level1-font-size</code>,{" "}
                    <code>--mindmap-level1-font-weight</code>
                  </td>
                </tr>
                <tr>
                  <td>连接线</td>
                  <td>
                    <code>--mindmap-edge-width</code>
                  </td>
                </tr>
                <tr>
                  <td>选中状态</td>
                  <td>
                    <code>--mindmap-selection-stroke</code>,{" "}
                    <code>--mindmap-selection-fill</code>
                  </td>
                </tr>
                <tr>
                  <td>高亮</td>
                  <td>
                    <code>--mindmap-highlight-text</code>,{" "}
                    <code>--mindmap-highlight-bg</code>
                  </td>
                </tr>
                <tr>
                  <td>添加按钮</td>
                  <td>
                    <code>--mindmap-addbtn-fill</code>,{" "}
                    <code>--mindmap-addbtn-hover</code>,{" "}
                    <code>--mindmap-addbtn-icon</code>
                  </td>
                </tr>
                <tr>
                  <td>控制栏</td>
                  <td>
                    <code>--mindmap-controls-bg</code>,{" "}
                    <code>--mindmap-controls-text</code>,{" "}
                    <code>--mindmap-controls-hover</code>
                  </td>
                </tr>
                <tr>
                  <td>右键菜单</td>
                  <td>
                    <code>--mindmap-ctx-bg</code>,{" "}
                    <code>--mindmap-ctx-text</code>,{" "}
                    <code>--mindmap-ctx-hover</code>,{" "}
                    <code>--mindmap-ctx-border</code>,{" "}
                    <code>--mindmap-ctx-shadow</code>
                  </td>
                </tr>
                <tr>
                  <td>分支颜色</td>
                  <td>
                    <code>--mindmap-branch-0</code> 至{" "}
                    <code>--mindmap-branch-9</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubHeading>CSS 类选择器</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            所有 SVG 元素都有语义化 CSS 类名，可以直接选中。由于 SVG 表现属性的优先级低于 CSS 规则，
            自定义样式会优先生效：
          </p>
          <CodeBlock lang="css">{`/* 修改根节点背景 */
.mindmap-node-root .mindmap-node-bg {
  fill: #6c5ce7;
}

/* 加粗连接线 */
.mindmap-edge {
  stroke-width: 3;
}

/* 设置节点下划线样式 */
.mindmap-node-underline {
  stroke-width: 3;
  stroke-linecap: square;
}`}</CodeBlock>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-6 mb-4">
            主要类名：
          </p>
          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>类名</th>
                  <th>作用对象</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>.mindmap-node-root</code>
                  </td>
                  <td>根节点组</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-node-child</code>
                  </td>
                  <td>子节点组</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-node-bg</code>
                  </td>
                  <td>节点背景矩形</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-node-text</code>
                  </td>
                  <td>节点文本元素</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-node-underline</code>
                  </td>
                  <td>子节点下划线</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-edge</code>
                  </td>
                  <td>连接线</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-edge-label</code>
                  </td>
                  <td>连接线标签文本</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-add-btn</code>
                  </td>
                  <td>添加子节点按钮</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-fold-btn</code>
                  </td>
                  <td>折叠/展开切换</td>
                </tr>
                <tr>
                  <td>
                    <code>.mindmap-tag</code>
                  </td>
                  <td>标签徽章</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubHeading>分支颜色</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            每个节点和连接线都有 <code>data-branch-index</code> 属性（0–9），表示它所属的根节点分支。
            可以据此分别设置各分支的样式：
          </p>
          <CodeBlock lang="css">{`/* 自定义前 3 个分支的颜色 */
.mindmap-edge[data-branch-index="0"] { stroke: #e74c3c; }
.mindmap-edge[data-branch-index="1"] { stroke: #2ecc71; }
.mindmap-edge[data-branch-index="2"] { stroke: #3498db; }

/* 对节点同样生效 */
.mindmap-node-g[data-branch-index="0"] .mindmap-node-underline {
  stroke: #e74c3c;
}`}</CodeBlock>

          <SubHeading>SVG 导出</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            导出的 SVG 会嵌入包含最终值的 <code>&lt;style&gt;</code> 样式块，并保留相同的语义化类名和
            <code>data-branch-index</code> 属性。这意味着：
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mb-4 space-y-1">
            <li>独立的 SVG 文件无需外部 CSS 即可正常渲染</li>
            <li>
              嵌入 HTML 后，可以使用相同的 CSS 选择器覆盖导出样式
            </li>
          </ul>
    </>
  );
}
