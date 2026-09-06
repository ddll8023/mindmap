#!/bin/zsh

set -u

project_root="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "${project_root}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "未找到 pnpm，请先安装 pnpm。"
  echo "请先安装 pnpm 后再重试。"
  read -r
  exit 1
fi

echo "正在启动 Electron 桌面应用..."
pnpm desktop:dev "$@"
status=$?

echo
echo "Electron 桌面应用已退出（状态码：${status}）。按回车键关闭窗口。"
read -r
exit "${status}"
