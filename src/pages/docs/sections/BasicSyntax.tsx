import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function BasicSyntax() {
  return (
    <>
          <SectionHeading id="basic-syntax">基础语法</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            不以 <code className="text-xs">-</code> 列表标记开头的文本行会被视为
            <strong>根节点</strong>。一张思维导图可以包含多个根节点，
            <code className="text-xs">-</code> 列表标记的缩进层级决定节点树的层级关系。
          </p>

          <CodeBlock lang="mindmap">{`机器学习
- 监督学习
  - 分类
  - 回归
  - 决策树
- 无监督学习
  - 聚类
  - 降维

应用领域
- 自然语言处理
- 计算机视觉`}</CodeBlock>
    </>
  );
}
