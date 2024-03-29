+++
title = "如何使用前端技术开发一个桌面跨端应用"
isCJKLanguage = true
categories = ["fe"]
tags = ["electron", "parcel"]
date = "2019-03-14T19:20:04-07:00"
+++

本文将会讲述一个完整的跨端桌面应用 [**代码画板**](https://code-sketch.com/ "代码画板") 的构建，会涉及到整个软件开发流程，从开始的设计、编码、到最后产品成型、包装等。

本文不仅仅是一篇技术方面的专业文章，更会有很多产品方面的设计思想和将技术转换成生产力的思考，我将结合我自己的使用场景完全的讲解整个开发流程，当然涉及到设计方面的不一定具有普遍实用性，多数情况下都是我自己的一些喜好，我只关心自己的需求。

同时本文只从整体上讲思路，也会有个别的技术细节和常规套路，有兴趣的也可以直接去 github 上看 [源码](https://github.com/keelii/code-sketch "code-sketch-source")，文章会比较长，如果你只想知道一些拿来即用的「干货」，或许这篇文章并不是一个好的选择

---

## 一、定位需求

事情的起因是这样的，因为我们内部会有一些培训会议。会经常现场演示一些代码片段。比如说我们讲到 React 的时候会现场写一些组件，让大家能直观的感受到 React 的一些功能。

但是通常由于条件所所限，会议总会遇到一些意外。比如断网、投影分辨率低看不清文字等

起初我们用的是在线版的 [codepen](https://codepen.io/ "codepen")，但是感觉并不是那么好用。比如不能方便的修改字体大小，必须要在连网的情况下才能使用。另外它的 UI 设计不是很紧凑，通常我们展示代码的时候都投影是寸土寸金的，应该有一个简洁又不失功能的 UI 界面，能全屏展示…

于是我解决自己实现一个这样的轮子，那么大概的需求目标是有了：

1. 离线可用
2. 可以改变界面字体大小
3. 更加简洁的 UI
4. …

## 二、整体设计

### 应用风格

代码画板解决的是 **临时性** 的一些 *演示代码* 的需求，所以它的本质属性是一个拿来即用的工具，它不应该有更复杂的功能，比如用户登录、代码片段的管理等。这些需求不是它要解决的。代码画板会提供一个简单的导出成 HTML 文件的功能，可以方便用户存储整个 HTML 文件。

既然是用来演示代码的，那么它的界面上应该只有两个东西，一个是 **代码**，一个就是 **预览**。像代码/控制台切换的功能都做成 tab 的形式，正常情况不需要让他们展示出来。像 codepen 那样把所有的代码编辑器功能都展示出来我认为是不对的。

![codepen-demo](https://img10.360buyimg.com/devfe/jfs/t1/16250/31/9820/200587/5c81e5f1Ecd4c788e/73e2e8b44c45fd2b.png)

codepen 的界面给人感觉非常复杂，有很多功能点。当然我并不是在批评它，codepen 做为一个需要商业化运营的软件，势必会做的非常复杂，这样才能满足更多用户的需求。然而程序员写软件则可以完全按照自己的想法来，哪怕这个应用只给自己一个人用呢。

![hello-code-sketch](https://img30.360buyimg.com/devfe/jfs/t1/21966/22/9894/223877/5c81e745E5fc64825/1612674f92321245.png)

### 桌面应用的设计

桌面应用的设计和 web 界面的设计还是有些细微区别的，同样的基于 electron 的应用，有的应用会让人感觉很「原生」，有的则一眼就能看出来是用 CSS 画的。我在设计代码画板的时候也尽量向原生靠近，避免产生落差感。比如禁用鼠标手型图标、在按钮或者非可选元素上禁止用户选择：

```css
cursor: default;
user-select: none
```

因为实际上用户在使用一款应用的时候感性的因素影响占很大一部分，比如说有人不喜欢 electron 可能就是因为看到过 electron 里面嵌一个完整的  web 页面的操作，这就让人很反感。但是这不是 electron 的问题，而是应用设计者的问题。

### 应用标识的设计

说实话应用 logo 设计我也是业余水平，但是聊胜于无。既然水平不行，那就尽量设计的不难看就行了。可以参考一些好的设计。我用 sketch 画出 logo 的外形，sketch 有很多 macOS 的模块可以从网上下载下来，直接基于模板修改就可以了。

代码画板主要的界面是分割开的两个面板，左边是代码，右边是预览。所以我就大概画了一个形状

![code-sketch-icon](https://img14.360buyimg.com/devfe/jfs/t1/25508/31/10134/47955/5c84b771Efe6319f7/e58c1fb10f4692bb.png)

这个 logo 有个问题就是线条过多，小尺寸的时候看不清楚。这个问题我暂时先忽略了，毕竟我还不是专业的，后续有好的创意可以再改

### 默认设置

代码画板也 **不会有** 设置界面，因为常用的设置都预定义好了，你不需要配置。顶多改变下代码字体的大小。使用编辑器的通用快捷键 `command`+`+/-` 就解决了，或者插入三方库，直接使用编辑器的通用命令快捷键 `command`+`p` 调出。我们的思路就是把复杂的东西帮用户隐藏在后台，观众只需要关注演员台上的一分钟，而不必了解其它细节。

### 快捷键/可用性

由于代码画板的界面非常简单，在一些细小的必要功能就得添加一些快捷键。比如：切换 HTML/CSS/JS/Console 代码编辑器，我在每个 tab 上加了数字标号，暗示它是有顺序有快捷键的，而且这个切换方式和 Chrome tab 切换的逻辑一致，使用 `command`+`数字` 就可以实现，万一还是有人不会用的话，可以去看帮助文档。里面有所有的快捷键。

![cs-tab](https://img20.360buyimg.com/devfe/jfs/t1/29290/34/10809/7022/5c8a01e4E1b50ceff/6c235ce5bfd1c228.png)

界面中间的分割条可以自定义拖动，双击重置平分界面

![cs-spliter](https://img10.360buyimg.com/devfe/jfs/t1/19010/29/10797/101406/5c8a0247Edd9de215/adedbbec61fde586.gif)

刚开始的时候我把每个 tab 页签都分割成单独的面板，因为我觉得这个能拖动自定义面板大小的交互实在是太爽了，忍不住想去拖动它。但是后来想想，其实并没有必要，我们写代码时应该更专注于代码本身，如果只有两个面板，那么这个界面无论是认知还是使用起来就没有任何困难。

因为我们并不需要把一堆的功能的界面摔给用户，让他们自己去选择。

## 三、技术调研

### 实现控制台

通过使用流行的几款在线代码运行工具，我发现他们有一个共同的问题：**控制台很难用**。无法像 Chrome Console 那样展示任意类型的 JS 值。比如我想 log 一段嵌套的 JS 对象：

```js
console.log({ a: { b: 1, c: { d: [1, 2, 3] } }})
```

大多数都展示成这样的：

```
[object Object] {
  a: [object Object] {
    b: 1
  }
}
```

Chrome 是这样的：

![chrome-console](https://img12.360buyimg.com/devfe/jfs/t1/20790/15/9802/66920/5c80fc26E0a7def72/a638657b209ea000.gif)

显然 Chrome 控制台中更直观。所以我们需要在前面的基础上加一个需求，即：**实现一个基于 DOM 的日志展示界面（无限级联选择）**

日志界面应该有下面这些功能：

1. 展示任意 JS 类型的数据
2. Primitive 类型的数据显示不同的颜色（number - 蓝色，string - 绿色）
3. Object 类型默认折叠起来，点击按钮展示子级，属性过多需要展示缩略信息
4. 数组前应该有长度标记
5. 能展示 JS 运行时的报错 Error 信息

### 集成现代化的前端框工作流

现代化的前端写页面肯定不是 HTML/CSS/JS 一把梭了，至少应该有 Sass/Babel 的支持吧。

Sass 嵌套能让你少写很多选择器，当然 Less 也可以，但是在我们的这个应用里面区别不大，一般来说临时性的写一些代码很少会用到它们的细节功能。有 **变量** 和 **选择器** 嵌套就够了

Babel 主要是解决了写 React 的问题，不用再安装一大堆的构建工具了，直接使用 `UMD` 的 `React/ReactDOM` 就可以了，而且 electron 内嵌的 chromium 也支持了 es6 的 class 写法，实际上 Babel 主要的目的还是用来转译 JSX

注意这里是有一个我认为是 **刚性** 的需求，比如临时忽然有个想法，或者想验证一段代码的话，正常情况是使用你的编辑器，新建 demo.html/demo.css/demo.js 等这些操作。但是这些动作太浪费时间了。有了代码画板以后，直接打应用就可以开始 coding 了，真正能做到开箱即用。

### 提高程序的扩展性

我们在写 demo 页面时通常是要引用很多第三方类库的，比如：Bootstrp/jQuery 等。我希望有一种方法可以方便的引用到这些库，直接把库文件的 link/script 标签插入到代码画板的 HTML 中，但是前端框架真的是太多了，又不能一个个去扣来写死到页面，就算是写死了随着框架版本的升级，可能就无法满足我们的需求。

以前写页面时经常会用到 [bootcdn](https://www.bootcdn.cn/ "bootcdn")，无意中发现它提供了相关 [API](https://www.bootcdn.cn/api/ "boot cdn API")，可以直接拿来使用。接下来就得想办法让用户通过界面选择即可。

这个 API 有三层数据结构：`库 - 版本 - 资源链接`。这个功能要用界面来实现肯定会非常臃肿，界面上可能会放很多按钮。这就违背了「更简洁」的需求目标。

这时就得参考下我们经常使用的一些软件是如何解决 **简洁性** 和 **功能性** 需求之间的矛盾问题的，我比较喜欢 Sublime Text 的一些界面设计，Command Palette 是我经常使用的，所以我决定再模拟一个 Command Palette 来实现插入第三方库的需求。而且重要的是这个 Command Palette 并不一定只用来实现这一个功能，或者后期会有一些别的功能需要添加，那这个 Command Palette 也是个很好的入口。

![Command Palette](https://img11.360buyimg.com/devfe/jfs/t1/28459/10/9844/97920/5c81d765Efd5a0345/50a35821db9f4c52.png)

### 使用 electron 实现桌面应用

实现离线可用很多方法，比如使用 PWA 技术。但是 PWA 并不能给我带来一种原生应用的那种可靠感，相反 [electron](https://electronjs.org/ "el ec tr on") 刚好可以解决我的顾虑。同时它可以把你的应用打包成各个平台（macOS/Window/Linux）的原生应用。唯一的缺点就是安装包确实很大，一般来讲一个 electron 应用 **安装完** 至少要 100 多兆，不过我觉得还能接受，毕竟硬盘存储现在已经很廉价了。

有人可能对 electron 有抗拒，觉得 electron 应用太庞大、占系统资源什么的，不过我们做的这个应用并不需要常驻系统，临时性的使用一下，用完就关闭，正常写生产环境的代码肯定还是要换回 编辑器/IDE 的。同时因为 electron 降低了写桌面应用的门槛，确实有很多人把一个完整的在线的网页直接嵌进去，这也是有问题的。

electron 还有一个好处，因为它完全基于 HTML/CSS/JS 来实现 UI(可以使用 Chrome only 的一些新功能)，那我们理论上可以在做桌面应用时顺手把 web 应用也做了。这就可以同时支持各个系统下的原生应用，并且有 web 在线版本。如果你不愿意使用原生应用，直接登录 web.code-sketch.com 使用在线版也没是一种选择。这样就使得我们的应用具有真正的 **跨端** 能力。

由于我们团队都使用了 macbook，所以我优先支持 macOS 的开发，另外 macOS Mojave 的系统级别的暗色主题我也比较喜欢，刚好实现支持 mojave 暗色主题这个需求也做上。

## 三、框架的选择

大方向确定了，像框架选择这个就简单了，基于 electron 的应用，需要你区分开 render/main process 来选择。

### Render process

**渲染进程** 就是 electron 中界面的实现部分 ，一般来说就是一个 webview，选自己喜欢的框架即可。我使用 React 来实现界面。样式方面就不再使用框架了，因为我们的界面原则上没有复杂的元素，直接手写 CSS，300 行内基本上就可以解决问题。可能有人会觉得这不可能，实际情况是当你写样式只跑在 Chrome 里面的时候那感觉完全爽到飞起，CSS variable/flex/grid/calc/vh/rem 什么的都可以拿来用，实现一个功能的成本就降低了很多。

我使用 [Codemirror](https://codemirror.net/ "codemirror") 来做为主界面的代码编辑器，[Monaco](https://microsoft.github.io/monaco-editor/index.html "monaco") 也是一个好选择，但是它有点过于庞大了，而且如果想要自定义功能得自己写很多实现

主界面上的分割组件，使用了 [React-split](https://split.js.org/ "react split")。

### Main process

**主进程** 就是 electron 应用程序的进程，主要的区别在于主进程中可以调用一些与原生操作系统交互的 API，比如对话框、系统风格主题等。并且有 node 的运行时，可以引用 NPM 包。当然渲染进程也可以有 node 支持，但是我建议渲染进程中就只放一些纯前端的逻辑，这样的话方便后期把应用分离成 web 版

因为我们要集成 Sass 编译功能，如果你也经历过 node-sass 的各种问题，那就应该果断选择 [dart-sass](https://github.com/sass/dart-sass "dart-sass") — 使用 dart 实现，编译成了原生的 JS，没有依赖问题。dart-sass 我放在了 main process 中，因为我试过放在 render process 中会有各种报错。如果 web 端要实现这个功能就需要其它的解决办法了，比如做成一个 http 服务，让 web 调 http 服务。

Babel 的话我是放在了 **渲染进程** 中以 script 标签的方式调用，这样即使在 web 端 Babel 编译也是可用的。

总之如果你使用 electron 构建应用并且引入的第三方 NPM 包可以 **支持** 运行在客户端（浏览器）上，那就尽量把包放在渲染进程里面。

### 构建工具

我使用 [Parcel](https://parceljs.org/ "parcel js") 来构建 React 而不是 Create React App。后者用来写个小应用还可以，稍微大一点的，需要定制化一些东西你就得 eject 出来一大堆 webpack 配置文件，即便是我已经用 webpack 开发过几个项目了，但是说实话我还是没用会 webpack。写 webpack 配置的时间足够我自己写 npm script 来满足自己的需求了。

### 原生应用打

使用 [electron-builder](https://www.electron.build/ "electron builder") 来打包到平台原生应用，并且如果你有 Apple 开发者账号的话应用还可以提交到 AppStore 上去。

我目前的打包参数是这么配置的：

```
{
    "build": {
        "productName": "Code Sketch",
        "extends": null,
        "directories": { "output": "release" },
        "files": [
            "icon.icns",
            "main.js",
            "src/*.js",
            "所有需要的文件",
            "package.json",
            "node_modules/@babel",
            "node_modules/sass"
        ],
        "mac": {
            "icon": "icon.icns",
            "category": "public.app-category.productivity",
            "target": [ "dmg" ]
        }
    }
}
```

在你的 package.json 中添加 build 字段，productName, directories 这些按自己需要更改即可

## 四、分离开发环境

### 区分开开发环境

代码画板项目开过过程中涉及两个关键环境

1. **Parcel 构建环境（渲染进程）**：Parcel 可以为你提供一些现在 JS 的转译工作，因此你可以放心使用例如 ES6 的 JS 新特性
2. **Node.JS 运行环境（主进程+渲染进程）**：这个取决于你的 electron 版本中集成的是 node 版本，比如：Node 10 中就没有 ES Module，这意味着你如果要在 electron **主进程** 是无法识别 `import` 这样的语句的，但是渲染进程由于你使用了 Parcel 编译，则无需考虑

*这里温馨提示下*：想要做到 electron 中的 渲染进程与主进程之间共享 JS 代码是非常困难的。就算是有办法也会特别的别扭，我的建议是尽量分离这两个进程中的代码，**主进程主要做一些系统级别的 API 调用、事件分发等，业务逻辑尽量放在渲染进程中去做**

如果非要共享，那建议单独做成一个 NPM 包分别做为主进程运行时依赖，和渲染进程的 Parcel 编译依赖，唯一的缺点就是实际上共享的代码会有两份。

渲染进程中调用 node API 可能会和 Parcel 打包工具冲突，一般在调用比如文件模块时，可以加上 `window.require(‘fs’)` 这样就可以兼容两个环境：

```
get ipc() {
    if (window.require) {
        return window.require('electron').ipcRenderer
    } else {
        return { on() {}, send() {}, sendToHost() {} }
    }
}
this.ipc.send('event', data)
```

这样的话你在浏览器端调试也不会产生报错。一般情况下，建议当你用渲染进程中的 JS 引用（`require`）包的时候都加上 `window.` 前缀就可以了。因为渲染进程中 window 是全局变量，调用 `require` 和调用 `window.require` 是等价的

### 开发流程

通常在测试的时候应用会调用一些 electron 内置的系统级别 API，这部分调用通常需要启动 electron，但是有时候只有渲染进程中 UI 界面上的改动，就不用再启动 electron 了，直接在浏览器里面测试即可。使用 Parcel 运行一个本地的服务，这样就可以在浏览器里面调试页面。整个开发过程需要两个命令（NPM Script）：

*启动 Parcel 编译服务器*

```
"scripts": {
    "start": "./node_modules/.bin/parcel index.html -p 2044"
}
```

*调试 electron 原生功能*，注意设置 `ELECTRON_START_URL`

```
"scripts": {
    "dev": "ELECTRON_START_URL=http://localhost:2044 yarn electron",
}
```

### 技术难点

整个应用只有两个功能是需要我们自己写代码实现的：日志控制台，Sublime 命令行。我们分别来分析下这两个模块的难点。

**日志控制台** 的难点在于，我们需要打印任意类型的 JS 值。如果你对 JS 了解比较多的话自然会想到在 JS 中所有的东西都是 **对象**，即 Object，那么实际上当你想打印一个变量的时候，其实你只要把整个 Object 递归的遍历出来，然后做成一个无限级的下拉菜单就可以了。看起来大概想下面这样：

![logger](https://img20.360buyimg.com/devfe/jfs/t1/18901/35/10834/23415/5c890f3bE71a4d189/3e2bf8c0a6f5eb0a.png)

**Sublime 命令行** 实际上开发起来还是比较简单的，使用 React 很简单就实现了功能，比较麻烦的是调用 bootcdn 的接口，过程中我发现接口返回数据量还是挺大的，有必要做上一层 localStorage 缓存，加快二次打开速度。

然而在使用的过程中你会发现当我想插入一个前端库需要很多操作，因为有 **三级选择**：库-版本-CDN 链接。虽然这个流程解决了 **所有用户** 的使用问题，但是却损害了 **大部分** 用户的体验。这个时候插入一个常用库的成本就很高了，所以我们就要加上一些快捷入口，来实现一键插入流行框架。

![sublime-commend-p](https://img20.360buyimg.com/devfe/jfs/t1/15567/2/10960/38060/5c89b038Ebf681113/6c169122ab1eb903.png)

> 我们写代码的思路是满足所有用户的使用需求，但是一个好产品的思路是先满足大多数用户（80%）的常规需求，再让其余的用户（20%）可以有选择

还有一个问题比较典型就是 React 这类框架在渲染大列表并且进行过滤（关键字查询）时性能的问题。注意这个性能问题 **并不是** 引入框架产生的，真正的原因是当你渲染的 HTML 节点数以千计的时候，批量操作 DOM 会使得 DOM Render 特别慢。

所以说当我们遇到性能问题的时候应该去查找问题的根源，而不是停留在框架使用上，实际上在 DOM 操作这个层面来讲 jQuery 提供了更多的性能优化，比如自身的缓存系统，以致于当你在使用的时候很难发现有性能问题。但是在类 React 框架中它们框架本身的重点并不在于解决你应用的性能问题。

类似我们上面讲到的，实际上 jQuery 帮助你屏蔽了很多舞台背后的东西，以致于你可以不用操心技术细节，你甚至可以把 jQuery 当做一个 **产品** 来使用，而类 React 框架你却要亲力亲为的用他来设计你的代码。

话题再转回性能问题。这时候需要我们去实现一个类似于 [react-window](https://addyosmani.com/blog/react-window/)  的功能，让列表元素根据滚动按需加载。这可能是一种通用的解决大列表加载的方案，但是我的解决方法更粗暴，因为我们的下拉过滤功能使用时用户只关注 **最佳的匹配项** 即可，后面匹配程度不高的项可以直接限制数量裁剪就行了嘛。很少有用户会一直滚动到下面去查找某个选项，如果有，那就说明我们这个匹配做的有问题。

```
slice() {
    const idx = (this.props.itemsPerPage || 50) * (this.state.activeFrame + 1)
    return this.props.items.slice(0, idx)
}
```

整个匹配筛选的状态大概是这样的：

```
this.state = {
    // 当前第N步选择
    step: 0,
    // 当前步骤数据
    items: [],
    // 是否显示
    active: false,
    // 当前选中项
    current: {},
    // 过滤关键字
    keyword: ''
}
```

这个 `items` 是当前步骤的所有数据，实际上我们这个组件是支持无限级的扩展的，那么我们通过组件的 props 传入所有层级的数据，然后持久存储在内存中。这个 **所有层级的数据** 是数据结构层面的，实际上它可能是通过异步接口获取的。

再来看看我们组件提供的所有 `props`：

```
static defaultProps = {
    step: 0,
    active: false,
    data: [[]],    // 无限层级数据 [[], [], [], ...]
    // 数据的主键，用于钩子函数返回用户选择的结果集
    pk: 'id',

    autoFocus: true,
    activeCls: 'active',
    delay: 300,
    defaultSelected: 0,
    placeholder: '',
    async: false,
    alias: [],
    done: () => {}
}
```

这些数据都可以通过组件的 props 传入，这就意味着我们的这个组件才是真正的组件，别人也可以使用这样的功能，而他们并不用在意里面的细节，使用者只需要做好类似调用自己接口的这种业务逻辑。

组件的调用大概是这样的：

```
<CommandPalette step={0}
    key="CommandPalette"
    async={injectData}
    done={this.done.bind(this)}
    alias={alias}
    aliasClick={this.aliasClick.bind(this)}
    data={[ [], [], [] ]}
```

`async` 这个 props 实际上是一个异步调用的钩子方法，它会回传给你组件上当前操作的相关数据状态，通过这些数据使用者就可以按自己的需求在不同的步骤上调用不同的方法

```
export const injectData = (step, item, results, cb) => {
    const API = 'https://api.bootcdn.cn/libraries'

    if (step === 0) {
        fetchData(`${API}.min.json`)
            .then(processLibraryData)
            .then(cb)
    } else if (step === 1) {
        // ...
    } else if (step === 2) {
        // ...
    }
}
```

另外关于 React 这里安利下自己翻译过的一个教程：[React 模式](https://github.com/keelii/reactpatterns.cn)，里面讲到 18 种短小精悍的 React 模式案例，非常简单易懂。

还有一个小窍门，我们在适配暗色主题时，传统的方法是直接写两套主题 CSS 代码，实际上我们要使用 CSS Variable 的话完全没必要生成两套了，背景色，字体都做成 CSS 变量，切换的时候只需要动态往页面插入更新过的 CSS 变量值即可

系统的一些参数想直接传给渲染进程也是比较麻烦的，我的做法是直接从主进程中的 loadUrl 方法上以 queryString 的方式传到渲染页面的 URL 上

```
const query = {
    theme: osTheme,
    app_path: app.getAppPath(),
    home_dir: app.getPath('home')
}

mainWindow.loadURL(process.env.ELECTRON_START_URL ? url.format({
    slashes: true,
    protocol: 'http:',
    hostname: 'localhost',
    port: 2044,
    query
}) : url.format({
    slashes: true,
    protocol: 'file:',
    pathname: path.resolve(app.getAppPath(), './dist/index.html'),
    query
}))
```

像程序运行时的一些参数（比如程序的根目录）也可以这么动态传过去，而且还有一个好处就是你甚至可以在渲染进程中测试与这些参数相关的功能。

## 五、宣传

### demo 视频录制

我会把最终所有功能的使用方法录制成一个视频，万一有人不不想下载你的软件，只是要了解一下，这就是个很好的方法。我同时上传到了 Youtube 和 bilibili 这两个平台，其它的都有广告就没必要了

使用 Quicktime Player 即可，录制完使用 iMovie 转码成两倍速率的 mp4。如果你有兴趣还可以加上一段音乐什么的，让视频看起来更灵动

### 域名申请

域名是一个能让用户记住你产品的方法，如果你做的是一个成型的产品，那就一定要申请个域名。

我总是有这样的体验，有的时候看到一个非常不错的产品但由于当时没需求就忽略了，想起来或者突然有需求的时候缺记不起来名字叫什么了。

事实上代码画板最开始我给他起的名字是 code playground，这个更直观，但是名字太长，而且想用到的一些域名呀、Github 名、NPM 包都被注册了。

想来想去就换成了 code sketch，这和符合我们的设计初衷，即：一边是代码，一边是效果/草图

域名申请我一般会上 Godaddy，不用备案，.com 域名一年 ¥65.00，然后 DNS 服务器转到了 cloudflare，后续域名也会直接转到 cloudflare。因为据说以后在 cloudflare 上续费域名最便宜

### 网站搭建

宣传网站直接放在 github pages 上，做个自定义域即可，实在是太方便了。而且还有 SSL 支持，Github 真的是业界良心

web 版的代码画板，由于我们把渲染进程中的代码分离开发，所以直接把 parcel 打包出来的静态文件也做成 github pages 就可以了，爽歪歪，网站就等于一分钱不花了。后续做一些 web 版的增强功能时，可以做成前后端分离的 http 服务，这就是后话了

### 加入 Google analytics 代码

GA 可以让你了解网站的用户分布情况，清楚的知道网站访问的波动。比如说你把自己的链接放到某个网站上分享了，GA 里面就能看出来所有的推荐来源和波动，对于运营来说是非常有必要的

### 广告语

这个我还真想了好长时间，基于我对于代码画板的定义，我觉得它应该是一个我们有一个想法的时候需要快速去实现一个 demo 的地方，想来想去就定了一段看起来文邹邹的话，虽然听名字根本不知道它是干啥用的，但是没关系，程序员写东西就是要有个性，因为我的受众只有自己。

> First place where the code was written...
> 一个你最初写代码的地方...

## 六、汇总使用到的库与工具

麻雀虽小，五脏俱全。我们来看下代码画板总共用到了多少东西：

* 框架/库
  * electronjs
  * react
  * babeljs
* NPM 模块
  * codemirror 及其插件
  * react-split
  * sublime-command-palette
* 打包/工具
  * parceljs
  * electron-builder
  * bootcdn
* 设计与素材
  * sketch
  * [Free AppIcon Generator](http://www.tweaknow.com/appicongenerator.php)
  * Inconsolata 字体
  * [Gallary CSS](http://benschwarz.github.io/gallery-css/ "pure css gallery") 纯 CSS 实现的焦点图，用于宣传页展示

## 七、结语总结

实事上我自己的开发这个应用的时候并没有严格按照这篇文章的顺序执行，而是想到一些实现一些，可能一个功能实现了后来觉得不好又干掉了，是不断的取舍、提炼的结果。

开发中我也不断的问自己这个功能是否有必要，如果可有可无那是不是可以去掉，这样才能使得用户更加关注于代码本身。

整个开发过程中自己实现的功能模块并不多，只有控制台、命令行窗口是自己实现的，其它的功能基本上都是靠社区现有的工具库来完成的，从这一点来说前端技术的生态还是挺好的。这使得当我从整体上构思一个产品时我不必在意那些细节，虽然过程中还是能感觉到前端工具/库的割裂感，但是整体而言还是向好的，毕竟工具对于开发者只是一种选择的。

八、引用

1. [https://github.com/keelii/code-sketch](https://github.com/keelii/code-sketch "code-sketch-source")
2. [http://www.tweaknow.com/appicongenerator.php](http://www.tweaknow.com/appicongenerator.php)
3. [http://benschwarz.github.io/gallery-css/](http://benschwarz.github.io/gallery-css/)
4. [https://addyosmani.com/blog/react-window/](https://addyosmani.com/blog/react-window/)
5. [https://github.com/keelii/reactpatterns.cn](https://github.com/keelii/reactpatterns.cn)