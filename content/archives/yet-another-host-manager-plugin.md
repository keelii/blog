+++
title = "又双叒叕写了一个 host 管理插件"
isCJKLanguage = true
categories = ["chrome", "webdev"]
tags = ["plugin","host"]
date = "2017-11-07T12:51:27.464Z"
+++

切 host 对于平常开发来说再正常不过了，可是「切 host 难」的问题一直没解决，因为手动修改 host 文件会有很多（系统dns、浏览器）缓存问题。经常听到xx说「我这是好的呀，你 host 有问题吧...」

在 windows 下我一直使用 fiddler 来切换 host，很多人可能不知道这个功能。他的实现本质就是实用代理映射来实现 host 切换。这样的欢最大的优点就是 **无延迟，秒切 host** 这个体验就非常赞，而且是系统级别的，也就是说别的浏览器里面也适用（前提是浏览器代理设置为系统）

然后由于最近切换到 mac 开发环境，发现 mac 下面的解决方案都不是很完美，或者说不适合我的要求。无外乎以下几种：

## 物理修改 host 文件

像 iHosts, Switchhosts 这类，但据我所知这种方法都有延迟

## 抓包工具代理切 host

比如 mac 下的 Wireshark、Charles，这些工具据说很强大，可是我自己用不惯，而且我是需求也很小，杀鸡焉用牛刀。fiddler for mac 虽然也能跑起来，但是体验太差了，界面卡的要死

## 浏览器插件代理切 host

像 Chrome 下的 Chrome-host-switch、 Switch host plus 等，试用了下效果很理想。美中不足的是体验不好，只有标签没有分组，把标签当分组切的人很蛋疼

简单看了下 switch host plus 的实现方式，再加上自己之前也写过 chrome 插件就决定自己造个轮子。Chrome 插件基于html、css、javascript 自然很适合前端来做

由于最近在看 react 相关的东西，刚好拿来练练手。技术选型基本上都是现成的框架拿来用就行了

- react & redux 构建整体应用
- bulma.css 简洁小巧的 CSS 框架
- localStorage 数据直接写本地存储
- create react app 构建打包应用

## 应用截图

![ahm-640x440](https://img20.360buyimg.com/devfe/jfs/t11611/80/1444685331/28555/590b5dfa/5a013f0aN19565830.png)

[![ahm-1280x800](https://img20.360buyimg.com/devfe/jfs/t11845/332/1453803626/635686/c8e4f98/5a013fe8N41db44e3.png)](https://img20.360buyimg.com/devfe/jfs/t11845/332/1453803626/635686/c8e4f98/5a013fe8N41db44e3.png)

## 功能

* 秒切 host 无延迟 😎
* 基于 chrome 代理 ❤️
* 兼容 socket 代理 🤔
* 简洁好用，无多余功能 👏

## 安装

- [Chrome 应用商店](https://chrome.google.com/webstore/detail/awesome-host-manager/pikaoeecieigblebdddckmlegonlogha?hl=zh-CN)（建议）
- [下载 .crx 文件](https://raw.githubusercontent.com/keelii/awesome-host-manager/master/awesome-host-manager.crx) chrome 中打开 chrome://extensions/ 将.crx 文件托进安装即可

## 使用

#### Host proxy

和 host 文件规则一致
```
192.168.100.1 your.domain.com your-anther.domain.com
```

#### Socket proxy

新建分组加入以下规则（按自己实际情况修改）
```
SOCKS5 127.0.0.1:1080
SOCKS 127.0.0.1:1080
```

## 源代码

[Github](https://github.com/keelii/awesome-host-manager)(MIT)

