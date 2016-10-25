+++
title = "平滑迁移 Octopress 到 Hugo"
isCJKLanguage = true
date = "2016-10-25T13:27:20+08:00"
categories = ["blog"]
tags = ['octopress', 'hugo']
+++

## 原由

自从新博客建立以来一直用 [Octopress](http://octopress.org/) 这个博客框架来搭建静态文章页面。漂亮的默认主题、方便的发布到 github page 等功能吸引了我

但就在最近因为家里的用 Macbook，刚好升级到了新版的 Sierria，杯具的是之前安装的 Octopress bundle 都失效了。调试了很久还没把环境搭建好，再加上之前发现 Octopress 的 Markdown 解析器老报错，于是就决定要更换一个配置安装简单点的博客生成器了

<!--more-->

在参考了这个网站上的各种生成器后 [staticgen](https://www.staticgen.com/)，果断选择了 Hugo。没有什么特殊原因，下载安装试用一下就明白了。Hugo 由于是 Go 语言写的，所以你只需要下载好官方给的二进制可执行文件就可以了，再也不用安装各种依赖，然后各种换源什么的乱折腾了。这一点就足以让我转入 Hugo

## 主题

由于自己还是比较喜欢 Octopress 默认的这套主题，所以在读过 Hugo 开发文档后，在严格尊重原主题的原则下修改了部分增强样式，制做了一个适配 Hugo 的 Octopress 主题。虽然 Hugo 官方有一个适配 Octopress 的主题 [hugo-octopress](http://themes.gohugo.io/hugo-octopress/) 但是对原主题改动太多，我并不喜欢

## 迁移

### 文章

Octopress 使用的文章描述头是 yaml 格式的，需要转换成 Hugo 的 toml，自己手动写了个 [NodeJS 脚本](https://gist.github.com/keelii/b6c51290e5ee0253f99a6424a7e2faeb) 来完成这个工作，基本上很轻松就完成了。注意：建议放在 `content/archives` 目录下面，这样的话原来的文件目录和新的就是一致的了

再吐槽下 md 文件名，Octopress 默认是生成时间为前缀的，如：`2016-06-13-name.markdown`。 如果转移到 Hugo 永久链接还要保持原来文件名格式的话就得把这个前缀干掉（`name.md`），这样的话排序就乱了。在各种编辑器、文件夹中不按创建顺序排序，看起来很别扭也不方便

### 文章链接

考虑到之间已经写过很多文章了，搜索引擎都已收录，所以要保持原来的文章链接格式不变。在 Hugo 配置文件里面加上这段，使用文件名做文章永久链接：

```toml
[permalinks]
    archives = "/:year/:month/:day/:filename/"
```

### 存档

Octopress 默认的存档地址是 `archives`，这个我们可以直接在 Hugo 博客目录 content 里面新建一个目录名为 archives 就可以了，以后新建文章都以这个 Section 为准：`hugo new archives/your-post-name.md`

### RSS

Octopress 默认的是 `atom.xml`，然而 Hugo 中默认的是 `index.xml`。不过我们可以在 Hugo 中做个配置，和之间保持一致：

```toml
RSSUri = "atom.xml"
```

然而实际测试的时候在模板里面调用 `{{ .RSSlink }}` 始终都返回 index.xml。手动把模板里面的 RSS 链接改成 `{{ .Site.BaseURL }}atom.xml` 居然能生效？！这估计是 Hugo 的一个 bug。好在被发现了，要不然新老订阅 RSS 地址不一样事情就比较麻烦了

### 分页

Octopress 默认的格式是 `posts/2`，Hugo 中是 `posts/2` 同样需要加个配置：

```toml
paginatePath = "posts"
```

## Hugo 的几个基本概念

这几个概念主要在修改主题的时候能用到

### Front Matter

类似 markdown 文件的配置描述，用来配置文章的标题、时间、链接、分类等元信息，提供给模板调用

```toml
+++
title = "post title"
description = "description."
date = "2012-04-06"
tags = [ ".vimrc", "plugins", "spf13-vim", "vim" ]
categories = [
  "cat1",
  "cat2"
]
+++
```

### Sections

在 content 下面的一级目录，通常有分类的概念，但只是文件夹维度的物理隔离

### Types

如果没有为文章指定 type 配置，文章默认就属于当前属的 Section，type 可以在 Front Matter 中指定，而
Section 不可以

### Archetype

新建文章时候的默认模板，会带有指定的 Front Matter 头

### Taxonomy

分类、标签、系列这种描述文章属性的都属于 Taxonomy Terms

## 总结

Hugo 确实是一个不错的博客框架，配置简单、功能强大，很多东西都以「惯例」默认提供了，比如内置 TableOfContents，用来写博客足亦

不过由于是 Go 语言写的，很多人并不知道有这么好用的一个东西，所以社区并不是很好。这可能就是所谓的编程的帮派论吧