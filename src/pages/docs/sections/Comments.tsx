import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function Comments() {
  return (
    <>
          <SectionHeading id="comments">注释</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code className="text-xs">%%</code> 添加仅在文本编辑器中可见、不会渲染到思维导图中的注释：
          </p>

          <CodeBlock lang="mindmap">{`%% 这是注释，不会出现在思维导图中
机器学习
%% 核心学习范式
- 监督学习
  - 分类
  - 回归
- 无监督学习
  %% 其他范式在思维导图中保持隐藏
  - 聚类`}</CodeBlock>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 mb-4">
            只有当 <code className="text-xs">%%</code> 出现在行首（前面可以有空格）时，该行才会被视为注释。
            像 <code className="text-xs">测试%%示例</code> 这样的行内内容不会被视为注释。
          </p>
    </>
  );
}
