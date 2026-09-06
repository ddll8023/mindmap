import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function TaskStatus() {
  return (
    <>
          <SectionHeading id="task-status">任务状态</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            复用 Markdown 任务列表语法，适合项目计划或学习计划：
          </p>

          <CodeBlock lang="mindmap">{`第一季度学习计划
- 基础理论
  - [x] 线性代数
  - [x] 概率论
  - [-] 优化理论
  - [ ] 信息论
- 实践项目
  - [x] 手写数字识别
  - [-] 文本分类
  - [ ] 图像分割`}</CodeBlock>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>语法</th>
                  <th>含义</th>
                  <th>显示</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>- [ ] text</code>
                  </td>
                  <td>待办</td>
                  <td>&#9744;</td>
                </tr>
                <tr>
                  <td>
                    <code>- [-] text</code>
                  </td>
                  <td>进行中</td>
                  <td>&#9684;</td>
                </tr>
                <tr>
                  <td>
                    <code>- [x] text</code>
                  </td>
                  <td>已完成</td>
                  <td>&#9745;</td>
                </tr>
              </tbody>
            </table>
          </div>
    </>
  );
}
