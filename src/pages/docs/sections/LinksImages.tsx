import { CodeBlock } from "../components/CodeBlock";
import { SectionHeading } from "../components/SectionHeading";

export default function LinksImages() {
  return (
    <>
          <SectionHeading id="links-images">链接与图片</SectionHeading>

          <CodeBlock lang="mindmap">{`机器学习
- [维基百科](https://en.wikipedia.org/wiki/ML)
- 架构概览 ![](./arch.png)
- 资源
  - [论文](https://arxiv.org/xxx)
  - ![示意图](./flow.png)`}</CodeBlock>

          <ul className="list-disc list-inside text-slate-600 space-y-2 mt-4 mb-6">
            <li>
              <code className="text-xs">[文本](url)</code> — 节点文本会变成可点击的超链接。
            </li>
            <li>
              <code className="text-xs">![替代文本](path)</code> — 使用 SVG 图片元素将图片嵌入节点。
            </li>
          </ul>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            PNG 导出遵循浏览器 Canvas 安全规则。跨域图片可能需要 CORS 响应头或数据 URL。
          </p>
    </>
  );
}
