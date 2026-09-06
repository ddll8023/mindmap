import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading, SubHeading } from "../components/SectionHeading";

export default function ExtendedSyntax() {
  return (
    <>
          <SectionHeading id="extended-syntax">扩展语法</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            扩展语法功能通过插件提供，默认启用全部 7 个内置插件。
          </p>

          {/* 虚线 */}
          <SubHeading>虚线</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code className="text-xs">-.</code> 代替 <code className="text-xs">-</code>，
            即可为弱关联关系的节点绘制虚线连接：
          </p>
          <CodeBlock lang="mindmap">{`机器学习
- 监督学习
  - 分类
  -. 特征工程`}</CodeBlock>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>语法</th>
                  <th>线条样式</th>
                  <th>含义</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>-</code>
                  </td>
                  <td>实线</td>
                  <td>标准的父子关系</td>
                </tr>
                <tr>
                  <td>
                    <code>-.</code>
                  </td>
                  <td>虚线</td>
                  <td>弱关联 / 可选关系 / 待定</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 多行内容 */}
          <SubHeading>多行节点内容</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            以 <code className="text-xs">|</code> 开头的行会追加到前一个节点的内容中，
            并在该节点内以多行文本显示：
          </p>
          <CodeBlock lang="mindmap">{`机器学习
- 监督学习
  - 分类
    | **定义**：将输入映射到离散类别。
    | **输入**：特征向量 X
    | **输出**：类别标签 Y
  - 回归
    | 连续的输出值。
    | 常用于预测场景。`}</CodeBlock>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>语法</th>
                  <th>显示方式</th>
                  <th>用途</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>&gt; 内容</code>
                  </td>
                  <td>提示框 / 悬停</td>
                  <td>补充说明，节省空间</td>
                </tr>
                <tr>
                  <td>
                    <code>| 内容</code>
                  </td>
                  <td>节点内显示</td>
                  <td>节点需要展示多行内容时</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 标签 */}
          <SubHeading>标签</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code className="text-xs">#标签</code> 为节点添加标签，方便筛选和分类：
          </p>
          <CodeBlock lang="mindmap">{`技术栈
- React #前端 #JavaScript
  - Next.js #框架 #SSR
  - Redux #状态管理
- Python #后端 #机器学习
  - FastAPI #框架
  - PyTorch #机器学习 #深度学习
- PostgreSQL #数据库 #后端`}</CodeBlock>

          {/* 交叉链接 */}
          <SubHeading>节点间交叉连接</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code className="text-xs">{"{#id}"}</code> 定义节点锚点，使用
            <code className="text-xs">{"-> {#id}"}</code> 创建跨分支连接：
          </p>
          <CodeBlock lang="mindmap">{`系统架构
- 前端 {#frontend}
  - React
  - API 调用 -> {#api-gateway}
- 后端
  - API 网关 {#api-gateway}
    - REST
    - GraphQL
  - 数据处理
    - ETL 流程 -> {#data-warehouse}
- 数据层
  - 数据仓库 {#data-warehouse}
  - 缓存 -> {#frontend}`}</CodeBlock>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 mb-2">
            可选的带标签连接：
          </p>
          <CodeBlock>{`- API 调用 -> {#api-gateway} "HTTP/REST"`}</CodeBlock>

          <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 mt-3 mb-6">
            <li>
              <code className="text-xs">{"{#id}"}</code> — 在节点上定义锚点
            </li>
            <li>
              <code className="text-xs">{"-> {#id}"}</code> — 指向锚点的实线交叉链接
            </li>
            <li>
              <code className="text-xs">{'-> {#id} "标签"'}</code> — 带标签的交叉链接
            </li>
            <li>
              <code className="text-xs">{"-.> {#id}"}</code> — 虚线交叉链接
            </li>
          </ul>

          {/* 折叠 */}
          <SubHeading>折叠标记</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code className="text-xs">+</code> 代替 <code className="text-xs">-</code>，
            表示节点默认折叠：
          </p>
          <CodeBlock lang="mindmap">{`项目结构
- src/
  - components/
    - Button.tsx
    - Modal.tsx
  + utils/
    - format.ts
    - validate.ts
  + hooks/
    - useAuth.ts
    - useFetch.ts
- README.md`}</CodeBlock>

          <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 mt-3 mb-6">
            <li>
              <code className="text-xs">-</code> = 展开（默认）
            </li>
            <li>
              <code className="text-xs">+</code> = 折叠（点击展开）
            </li>
          </ul>

          {/* LaTeX */}
          <SubHeading>公式支持（LaTeX）</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            通过{" "}
            <a
              href="https://katex.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              KaTeX
            </a>
            :
          </p>
          <CodeBlock lang="mindmap">{`损失函数
- MSE
  | $L = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2$
- 交叉熵
  | $L = -\\sum_{i} y_i \\log(\\hat{y}_i)$
- KL 散度
  | $D_{KL}(P \\| Q) = \\sum P(x) \\log\\frac{P(x)}{Q(x)}$`}</CodeBlock>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 mb-6">
            支持使用 <code className="text-xs">$...$</code> 编写行内公式，使用
            <code className="text-xs">$$...$$</code> 编写块级公式。
          </p>

          {/* 前置元数据 */}
          <SubHeading>全局配置（前置元数据）</SubHeading>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 YAML 前置元数据控制整体行为和样式：
          </p>
          <CodeBlock lang="mindmap">{`---
direction: right
theme: auto
---

机器学习
- 监督学习
- 无监督学习`}</CodeBlock>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>字段</th>
                  <th>取值</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>direction</code>
                  </td>
                  <td>
                    <code>right</code> | <code>left</code> | <code>both</code>
                  </td>
                  <td>布局方向</td>
                </tr>
                <tr>
                  <td>
                    <code>theme</code>
                  </td>
                  <td>
                    <code>auto</code> | <code>light</code> | <code>dark</code>
                  </td>
                  <td>颜色主题</td>
                </tr>
              </tbody>
            </table>
          </div>
    </>
  );
}
