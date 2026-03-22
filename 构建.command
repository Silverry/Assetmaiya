#!/bin/bash
# 资产管理中心 - 构建脚本
# 双击此文件：将 js/*.js + css/styles.css 内联到 index.html
# 生成的 index.html 可直接双击用 Chrome 打开

cd "$(dirname "$0")"

CSS=$(cat css/styles.css)

# 按加载顺序拼合所有 JS
JS=""
for f in js/data.js js/theme.js js/components.js js/pages.js js/upload.js js/settings.js js/app.js; do
  JS="$JS
$(cat "$f")"
done

cat > index.html << 'HEADER'
<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>资产管理中心</title>
  <style>
HEADER

echo "$CSS" >> index.html

cat >> index.html << 'MID1'
  </style>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>

<body>
  <div id="root"></div>
  <script type="text/babel">
MID1

echo "$JS" >> index.html

cat >> index.html << 'FOOTER'
  </script>
</body>

</html>
FOOTER

echo "✅ 构建完成: index.html（$(wc -c < index.html | tr -d ' ') 字节）"
echo "   可直接双击用 Chrome 打开"
