import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function Remarks() {
  return (
    <>
          <SectionHeading id="remarks">备注</SectionHeading>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            使用 <code className="text-xs">&gt;</code> 为节点添加详细说明，鼠标悬停时会以提示框显示：
          </p>

          <CodeBlock lang="mindmap">{`机器学习
- 监督学习
  > 学习从标注数据中建立映射函数
  > 目标是对新数据进行预测
  - 分类
    > 输出由离散类别标签组成
  - 回归
    > 输出为连续数值`}</CodeBlock>

          <p className="text-sm text-slate-500 dark:text-slate-500 mt-3 mb-6">
            备注不会显示为子节点，而是作为节点的补充信息（提示框或侧边栏）使用。
          </p>
    </>
  );
}
