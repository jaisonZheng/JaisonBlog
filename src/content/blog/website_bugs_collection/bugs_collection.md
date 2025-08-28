---
title: 本网站的常见崩溃原因
description: 本网站遇到的各种运维Bug
publishDate: 2025-08-28
language: 中文
---
## 常见问题
### 1、Markdown文件中的标题标签直接从###开始而不是从##开始
会导致TOC报错，网站崩溃。

### 2、Markdown文件中的图片链接用了Wiki链接而不是Markdown语法的链接
这是因为我平时用Obsidian编辑Markdown文件，而Obsidian自动生成的就是Wiki链接。会导致图片无法显示。

### 3、忘记把Markdown文件中链接的图片传上服务器
会在npm run build阶段就失败。

### 4、忘记insert template

