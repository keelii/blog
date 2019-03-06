+++
title = "开源一个自己写的代码画板"
isCJKLanguage = true
categories = ["fe"]
tags = ["html", "css", "javascript"]
date = "2019-03-06T19:19:24.464Z"
+++

* [Code sketch]( https://code-sketch.com/)
* [Github]( https://github.com/keelii/code-sketch)
* [下载 macOS 应用(.dmg)]( https://github.com/keelii/code-sketch/releases/download/v0.0.2/Code.Sketch-0.0.2.dmg)，基于 electron，不喜欢的也可以使用 [Web 版]( https://web.code-sketch.com/) 但非全功能支持版


## 代码画板 Code Sketch

> 最初写代码的地方...

### 功能

* 内置 Sass/Babel 支持
* HTML/CSS emmet 插件支持
* 方便的导入三方库 ([bootcdn]( https://www.bootcdn.cn/) API 支持).
* 深色主题支持
* 可以打印任意数据格式的控制台
* 同时支持 [macOS App]( http://code-sketch.com) 与 [Web 端应用]( http://web.code-sketch.com)

### 快捷键

* 切换展示顶部页签: `Command`+`e`
* 代码字体大小: `Command`+`+/-`
* 保存刷新: `Command`+`s`
* 导出到单个 HTML 文件: `Command`+`shift`+`s`
* 导入文件（仅支持展出文件）: `Command`+`o`
* 命令提示容器: `Command`+`p`

### 截图

*浅色主题*

![code-sketch-light]( https://code-sketch.com/image/code-sketch-light-theme.png)

*深色主题*

![code-sketch-dark]( https://code-sketch.com/image/code-sketch-dark-theme.png)

*错误日志*

![log]( https://code-sketch.com/image/code-sketch-error-log.png)

*控制台日志*

![error]( https://code-sketch.com/image/code-sketch-console-log.png)


### 开发

yarn or npm

```bash
yarn install
yarn start
yarn dev
# build release for mac
yarn release
```

### 支持

...