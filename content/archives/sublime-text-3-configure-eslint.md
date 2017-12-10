+++
title = "Sublime text 3 配置 ESLint 代码检查"
date = "2017-04-29T17:17:24+08:00"
isCJKLanguage = true
categories = ["editor", "sublime text"]
tags = ["eslint"]
+++

## 安装环境

* Windows 7 SP1 企业版
* Sublime text 3 Build 3162
* Node.js v6.9.5
* Yarn 0.23.2 (可用 npm 代替)

## 安装 ESLint

到你的项目根目录生成一个 package.json 文件，如果没有使用 `yarn init -y` 来自动生成

ESLint 默认的 parser 是 esprima，如果你需要检查 Babel 转义的 JSX 等文件那可以选择安装 [babel-eslint](https://github.com/babel/babel-eslint)

```bash
yarn init -y
yarn global add eslint
```
使用 sublime text 3 配置 eslint 来做代码检查

## 安装 Sublime text 3 插件

### 安装 Sublime​Linter 和 SublimeLinter-contrib-eslint

[Sublime​Linter](https://packagecontrol.io/packages/SublimeLinter) 是一个代码检查框架插件，功能非常强大，支持各种语言的检查。但是它本身并没有代码检查的功能，需要借助 ESLint 这样的特定语言检查支持。我们只需要使用对应的 [Sublime​Linter-contrib-eslint](https://packagecontrol.io/packages/SublimeLinter-contrib-eslint) 插件即可

在 Sublime text 中 `Ctrl + Shift + p > Package Control:Install Package` 里面搜索关键词 `linter`，**注意**别选成了 SummitLinter。然后再搜索 `eslint` 找到 SublimeLinter-contrib-eslint 安装（不得不吐槽下 Sublime package 搜索匹配让人无法理解）

## 配置 ESLint

到项目根目录下面使用 eslint 命令交互式的生成配置文件。这里 ESLint 会让你确认项目的配置项目，包括代码风格、目标文件等。我一般选择 `Answer questions about your style`，即通过选择性的回答命令行中的问题让 ESLint 生成适合我项目的配置文件

生成的配置文件我一般选择 JavaScript 因为这样比较方便写注释。我的配置项大概如下：

```text
How would you like to configure ESLint?
Answer questions about your style
Are you using ECMAScript 6 features? No
Where will your code run? Browser
Do you use CommonJS? No
Do you use JSX? No
What style of indentation do you use? Spaces
What quotes do you use for strings? Single
What line endings do you use? Unix
Do you require semicolons? No
What format do you want your config file to be in? JavaScript
```

生成的配置文件竟然是这样的：

```javascript
module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
}; // Do you require semicolons? No !!!
```

上面的 `extends` 设置成 `eslint:recommended` 表示在 [ESLint 规则页面](http://eslint.org/docs/rules/) 中标记成 「✔」 的项都开启检测

## 使用

打开项目中任意一个 JavaScript 文件，右键 `SublimeLint > Lint this view` 来试试检查当前文件，如果有错误，编辑器会展示对应 Gutter 错误行和信息。可以使用 `SublimeLint > Show all errors` 来查看所有的错误

上个图吧

[![sublimetext-eslint](https://img11.360buyimg.com/devfe/jfs/t4531/175/3699692200/112024/b747eb91/590466dcN6f0ad2ac.png)](https://img11.360buyimg.com/devfe/jfs/t4531/175/3699692200/112024/b747eb91/590466dcN6f0ad2ac.png)






