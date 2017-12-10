+++
title = "macOS Sierra 开发环境配置指南"
isCJKLanguage = true
date = "2017-10-07T17:19:27.464Z"
categories = ["mac", "WebDev"]
tags = ["mac", "dev"]
+++

> 本文来自于我自己配置两台 macOS 开发环境的过程，主要记录一些常用的配置技巧

## 系统设置

### 更改计算机名称

macOS 默认的计算机名称「xx的xx」，我一般会把这个名字改成英文，在命令行中看起来会漂亮一点。修改 `系统设置-共享-电脑名称` 即可

[![computer-name](https://img20.360buyimg.com/devfe/jfs/t9919/194/838196844/87087/80259170/59d8e3f4N4277172a.png)](https://img20.360buyimg.com/devfe/jfs/t9919/194/838196844/87087/80259170/59d8e3f4N4277172a.png)

### 触控板

* 设置轻点触控板为鼠标点击
* 设置三指拖动

[![tap-click](https://img13.360buyimg.com/devfe/jfs/t10129/124/847447368/253995/96574062/59d8e534Nc3e40d9f.png)](https://img13.360buyimg.com/devfe/jfs/t10129/124/847447368/253995/96574062/59d8e534Nc3e40d9f.png)
[![drag-drop](https://img10.360buyimg.com/devfe/jfs/t10396/219/830021333/98488/bcc6e984/59d8e43cN04d84771.png)](https://img10.360buyimg.com/devfe/jfs/t10396/219/830021333/98488/bcc6e984/59d8e43cN04d84771.png)

### Finder

* 开启新 Fidder 窗口时打开 `桌面`
* 执行搜索时 `搜索当前文件夹`
* 显示所有文件扩展名

[![finder](https://img11.360buyimg.com/devfe/jfs/t9571/278/833569016/71935/221e5956/59d8e45dN67661921.png)](https://img11.360buyimg.com/devfe/jfs/t9571/278/833569016/71935/221e5956/59d8e45dN67661921.png)

### 其它

* `系统偏好设置-键盘-输入法-自动切换到文稿输入法` 应用切换的时候会保持原来的输入法不变
* `桌面空白处右键-排序方式-贴紧网格` 右键整理图标的时候就会按网格排列

## 开发环境设置

### 安装 Command line tools

方便后续编译安装其它应用

[![xcode-select](https://img13.360buyimg.com/devfe/jfs/t9601/44/840280004/58067/a2e0aa5e/59d8e496N2cdf9cca.png)](https://img13.360buyimg.com/devfe/jfs/t9601/44/840280004/58067/a2e0aa5e/59d8e496N2cdf9cca.png)

```bash
xcode-select --install
```

### 安装 brew

一般命令行的工具，或者开发环境包都用 [brew](https://brew.sh/) 来安装。GUI 的应用直接去网站下载安装包即可，App Store 我一般用来购买安装一些收费软件

打开命令行执行下面的命令来安装 brew

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

使用下面的命令替换 brew 源为[中科大镜像](https://lug.ustc.edu.cn/wiki/mirrors/help/brew.git)

```bash
# 替换brew.git:
cd "$(brew --repo)"
git remote set-url origin https://mirrors.ustc.edu.cn/brew.git

# 替换homebrew-core.git:
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git
```
由于 brew 安装下载源码包有时是用 curl 的，所以可以配置下 curl 来走 _番习习墙_ 代理，我一般在配置文件中设置 `vim ~/.curlrc`

```bash
socks5 = "127.0.0.1:1080"
```
### 安装 Zsh & oh-my-zsh

Zsh 是一种 [shell](https://zh.wikipedia.org/wiki/Unix_shell)，功能和 bash, csh 一样，用来和操作系统交互

```bash
# 安装 zsh
brew install zsh
# 安装 oh-my-zsh 插件
# 更换默认 shell 为 zsh
chsh -s /bin/zsh
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```
安装成功的话会有下面的提示

[![ohmyzsh](https://img13.360buyimg.com/devfe/jfs/t10303/164/828630186/232717/e8624f08/59d8e4d7N2c9b44f6.png)](https://img13.360buyimg.com/devfe/jfs/t10303/164/828630186/232717/e8624f08/59d8e4d7N2c9b44f6.png)

安装自动补全提示插件 [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)

```bash
git clone git://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
```

[![zsh-autosuggestions](https://img30.360buyimg.com/devfe/jfs/t10564/347/828202786/16788/8bd58613/59d8e50cN2ef8aa62.gif)](https://img30.360buyimg.com/devfe/jfs/t10564/347/828202786/16788/8bd58613/59d8e50cN2ef8aa62.gif)

### 安装/配置 iTerm2

[下载](https://www.iterm2.com/) 并安装，打开 Preferences 偏好设置

* `General` 关闭 `Native full screen windows` 我不使用系统的全屏（因为有过渡动画），是为了使用全局快捷键 **立即** 调出命令行
* `Profiles-Window-Transparency` 设置透明度 10%~20% 即可，太高会和桌面背景冲突。如果需要临时禁用透明度可以使用快捷键 `⌘+u`
* `Keys-Hotkey` 设置全局显示隐藏快捷键 系统级别的快捷键设置为 `⌘+\`

> 最佳实践，启动 iTerm2 后按 `⌘+enter` 全屏，然后 `⌘+\` 隐藏它，这时候就可以做别的事情去了。任何时间想再用 iTerm2 只需要按 `⌘+\` 即可

### brew 常用工具

下面这些都是用 brew 安装的，即 `brew install xxx`

#### htop

用来查看当前运行的程序，top 命令的升级版

[![htop](https://img11.360buyimg.com/devfe/jfs/t10783/119/847515894/438295/9e4709ce/59d8e566N62c288f9.png)](https://img11.360buyimg.com/devfe/jfs/t10783/119/847515894/438295/9e4709ce/59d8e566N62c288f9.png)

#### tree

显示文件为树形菜单

```bash
➜  keelii.github.io tree . -L 2
.
├── config.toml
├── content
│   ├── about
│   └── archives
├── deploy.sh
├── public
│   ├── 2016
...
│   └── tags
└── themes
    └── octo-enhance

17 directories, 8 files
```

#### httpie

使用比 curl 简单多了，而且还有一些代码高亮的效果

[![httpie](https://img13.360buyimg.com/devfe/jfs/t9175/233/2384082355/52554/472f733/59d8e58fN956a159a.png)](https://img13.360buyimg.com/devfe/jfs/t9175/233/2384082355/52554/472f733/59d8e58fN956a159a.png)

#### vim

安装 vim 添加一些默认的模块和编程语言支持 cscope, lua, python 并且覆盖系统默认的 vim

```bash
brew install vim --HEAD --with-cscope --with-lua --with-override-system-vim --with-luajit --with-python
```

安装 vim-plug

```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

#### autojump

方便在命令行中快速跳转目录，安装后程序会读取你 cd 过的目录并存起来，方便后面用快捷方式调用，支持模糊匹配。**注意: autojump 只会记录安装后使用 cd 命令进入过的目录**

[![autojump](//img10.360buyimg.com/devfe/jfs/t10066/212/961703883/22512/ed0565/59dae741N3fcc655c.gif)](//img10.360buyimg.com/devfe/jfs/t10066/212/961703883/22512/ed0565/59dae741N3fcc655c.gif)

#### yarn

npm 的替代品，Production Ready。如果系统中安装过 node，就使用 `yarn --without-node` 命令只安装 yarn 工具

### 安装 python pip

下载 [get-pip.py](https://bootstrap.pypa.io/get-pip.py) 在命令行中使用 python 运行这个文件

```bash
sudo python get-pip.py
```

### 更改各种程序语言包源

#### ruby - .gemrc

```bash
gem sources --add https://mirrors.tuna.tsinghua.edu.cn/rubygems/ --remove https://rubygems.org/
gem sources -l
```

```bash
cat ~/.gemrc
---
:backtrace: false
:bulk_threshold: 1000
:sources:
- https://mirrors.tuna.tsinghua.edu.cn/rubygems/
:update_sources: true
:verbose: true
```

#### node - .yarnrc/.npmrc

```bash
cat ~/.yarnrc
registry "https://registry.npm.taobao.org"
disturl "https://npm.taobao.org/dist"
electron_mirror "http://cdn.npm.taobao.org/dist/electron/"
node_inspector_cdnurl "https://npm.taobao.org/mirrors/node-inspector"
sass_binary_site "http://cdn.npm.taobao.org/dist/node-sass"
```

### dotfiles 配置文件

可以参照我的 [dotfiles](https://github.com/keelii/dotfiles) 配置文件

### 其它 GUI 应用

* [Alfred](https://www.alfredapp.com/) 程序启动器
* [The Unarchiver](https://theunarchiver.com/) ⇒ 解压工具
* [Magent](https://itunes.apple.com/cn/app/magnet/id441258766?mt=12) ⇒ 排列窗口（付费）
* [Itsycal](https://www.mowglii.com/itsycal/) ⇒ 简洁版日历
* <del>[Snip](http://snip.qq.com/) ⇒ 屏幕截图</del>
* <del>[Snappy](http://snappy-app.com/) ⇒ 屏幕截图、修改分享</del>
* [Snipaste](https://www.snipaste.com/) ⇒ 更好用的屏幕截图
* [Paste](http://pasteapp.me/) 剪贴板管理工具（付费）
* [Typora](https://typora.io/) 正确的使用 markdown 写文档笔记等
* [Karabiner-Elements](https://pqrs.org/osx/karabiner/) ⇒ 改键器, 改键方案参照[上篇](/2017/10/03/how-to-map-single-command-key-on-mac/)
* [AppCleaner 2](https://freemacsoft.net/appcleaner/) ⇒ 卸载应用
* [licecap for mac](https://www.cockos.com/licecap/) ⇒ 录制 gif 图片
* [Go2shell](http://zipzapmac.com/go2shell) ⇒ Finder 当前目录打开命令行


