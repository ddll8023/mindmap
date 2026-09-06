import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function TextFormatting() {
  return (
    <>
          <SectionHeading id="text-formatting">文本格式</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            节点文本原生支持 Markdown 行内格式：
          </p>

          <CodeBlock lang="mindmap">{`机器学习
- **监督学习**
- *无监督学习*
- ~~已弃用的方法~~
- \`K-Means 算法\`
- ==重点主题==`}</CodeBlock>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>语法</th>
                  <th>效果</th>
                  <th>使用场景</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>**内容**</code>
                  </td>
                  <td>
                    <strong>粗体</strong>
                  </td>
                  <td>强调重要节点</td>
                </tr>
                <tr>
                  <td>
                    <code>*内容*</code>
                  </td>
                  <td>
                    <em>斜体</em>
                  </td>
                  <td>补充说明或描述</td>
                </tr>
                <tr>
                  <td>
                    <code>~~内容~~</code>
                  </td>
                  <td>
                    <s>删除线</s>
                  </td>
                  <td>已弃用或已完成的项目</td>
                </tr>
                <tr>
                  <td>
                    <code>`内容`</code>
                  </td>
                  <td>
                    <code>代码</code>
                  </td>
                  <td>技术术语或标识符</td>
                </tr>
                <tr>
                  <td>
                    <code>==内容==</code>
                  </td>
                  <td>高亮</td>
                  <td>突出关键概念</td>
                </tr>
              </tbody>
            </table>
          </div>
    </>
  );
}
