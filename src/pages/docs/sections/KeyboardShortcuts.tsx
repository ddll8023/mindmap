import { SectionHeading } from "../components/SectionHeading";

export default function KeyboardShortcuts() {
  return (
    <>
          <SectionHeading id="keyboard-shortcuts">
            键盘快捷键
          </SectionHeading>

          <div className="docs-table-wrap my-6">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>快捷键</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>↑</code> <code>↓</code> <code>←</code> <code>→</code>
                  </td>
                  <td>在节点之间移动选中状态</td>
                </tr>
                <tr>
                  <td>
                    <code>Tab</code>
                  </td>
                  <td>在选中节点下创建子节点</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + Enter</code>
                  </td>
                  <td>在选中节点后创建同级节点</td>
                </tr>
                <tr>
                  <td>
                    <code>Enter</code> / <code>F2</code>
                  </td>
                  <td>编辑选中节点文本</td>
                </tr>
                <tr>
                  <td>
                    <code>Cmd/Ctrl + B</code>
                  </td>
                  <td>切换选中节点文本加粗</td>
                </tr>
                <tr>
                  <td>
                    <code>Delete</code> / <code>Backspace</code>
                  </td>
                  <td>删除选中节点</td>
                </tr>
                <tr>
                  <td>
                    <code>双击</code>
                  </td>
                  <td>编辑节点文本</td>
                </tr>
                <tr>
                  <td>
                    <code>Cmd/Ctrl + C</code>
                  </td>
                  <td>复制子树</td>
                </tr>
                <tr>
                  <td>
                    <code>Cmd/Ctrl + X</code>
                  </td>
                  <td>剪切子树</td>
                </tr>
                <tr>
                  <td>
                    <code>Cmd/Ctrl + V</code>
                  </td>
                  <td>将子树粘贴为子节点</td>
                </tr>
                <tr>
                  <td>
                    <code>Cmd/Ctrl + Z</code>
                  </td>
                  <td>撤销可视化编辑</td>
                </tr>
                <tr>
                  <td>
                    <code>Cmd/Ctrl + Shift + Z</code>
                  </td>
                  <td>重做可视化编辑</td>
                </tr>
                <tr>
                  <td>
                    <code>Escape</code>
                  </td>
                  <td>关闭右键菜单/对话框</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + +</code>
                  </td>
                  <td>放大</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + -</code>
                  </td>
                  <td>缩小</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + 0</code>
                  </td>
                  <td>重置视图（适配所有节点）</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + L</code>
                  </td>
                  <td>向左布局</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + R</code>
                  </td>
                  <td>向右布局</td>
                </tr>
                <tr>
                  <td>
                    <code>Shift + M</code>
                  </td>
                  <td>左右平衡布局</td>
                </tr>
                <tr>
                  <td>滚轮</td>
                  <td>放大/缩小</td>
                </tr>
                <tr>
                  <td>在画布上点击拖动</td>
                  <td>平移</td>
                </tr>
                <tr>
                  <td>点击拖动节点</td>
                  <td>调整同级节点顺序</td>
                </tr>
                <tr>
                  <td>右键点击</td>
                  <td>打开右键菜单</td>
                </tr>
              </tbody>
            </table>
          </div>
    </>
  );
}
