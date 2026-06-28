#!/bin/bash
echo "正在启动 伴生书童-BrainLight_Companion..."
if which xdg-open >/dev/null 2>&1; then
  xdg-open dist/index.html
elif which open >/dev/null 2>&1; then
  open dist/index.html
else
  echo "请手动在浏览器中打开 dist/index.html"
fi
