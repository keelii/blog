+++
title = "使用 Pixi.js 构建一个视差滚动器（第一篇）"
isCJKLanguage = true
categories = ["fe"]
tags = ["game", "pixi.js", "canvas"]
date = "2019-03-16T19:20:04-07:00"
+++

## 翻译对照

原文：
[PART 1](http://www.yeahbutisitflash.com/?p=5226)・
[PART 2](http://www.yeahbutisitflash.com/?p=5666)・
[PART 3](http://www.yeahbutisitflash.com/?p=6496)・
[PART 4](http://www.yeahbutisitflash.com/?p=7046)

译文： 
[第一篇](/2019/03/16/building-a-parallax-scroller-with-pixijs-cn-1/)・ 
[第二篇](/2019/03/17/building-a-parallax-scroller-with-pixijs-cn-2/)・ 
[第三篇](/2019/03/19/building-a-parallax-scroller-with-pixijs-cn-3/)・ 
第四篇

---

关注 [@chriscaleb](https://twitter.com/intent/follow?screen_name=chriscaleb)

这个系列的教程已经更新到了 [PixiJS v4](http://www.pixijs.com/) 版本。

曾经玩过 [Canabalt](http://www.adamatomic.com/canabalt/) 和 [Monster Dash](https://chrome.google.com/webstore/detail/monster-dash/cknghehebaconkajgiobncfleofebcog?hl=en)，好奇他们是如何构建一个滚动游戏地图的？在这个教程中我们将向「构建一个视差滚动器」迈出第一步，我们将使用 JavaScript 和 [pixi.js](http://www.pixijs.com/) 这个 2D 渲染引擎。

### 你将学到什么…

* Pixi.js 的基础知识
* 如何处理纹理（textures）和精灵（sprites）
* 如何实现简单的视差滚动

### 预备知识…

* 了解 JavaScript 或者 ActionScript 的基础知识

JavaScript 无处不在，由于浏览器的不断改善和大量的 JavaScript 库，我们真的开始看到 HTML5 游戏领域开发蓬勃发展。但是当有很多库可用的时候，选择合适的并非易事。

这个系列的教程将向你介绍 JavaScript 游戏开发的基础，我们会聚焦到 pixijs。它是一个支持 WebGL 和 HTML5 Canvas 的渲染框架。教程最后你将完成如下的一个视差滚动地图程序：

[![ps-tut1-screenshot1](https://img10.360buyimg.com/devfe/jfs/t1/25206/13/10616/142679/5c887df7E7c1fa38a/eab39f5f7ab1cc6d.png)](http://www.yeahbutisitflash.com/pixi-parallax-scroller/final/index.html)

点击上面的链接启动最终版的程序，这就是你将要完成的。注意它包含了三个视差层：一个远景（far）层，一个中间（mid）层，一个前景（foreground）层。在第一篇教程中我们将集中精力构建远景层和中间层。当然为了做到这一点教程必须涉及 pixi.js 的基础，当然如果你还是个 JavaScript 新手，这会是个很好的开始学习 HTML5 游戏编程的地方。

[![ps-tut1-screenshot1](https://img10.360buyimg.com/devfe/jfs/t1/25206/13/10616/142679/5c887df7E7c1fa38a/eab39f5f7ab1cc6d.png)](http://www.yeahbutisitflash.com/pixi-parallax-scroller/tutorial-1/index.html)

开始之前，点击上面的链接预览下这篇教程中将做成的效果。你也可以从 github 上下载这个程序的 [源代码](https://github.com/ccaleb/pixi-parallax-scroller)。

## 起步

为了完成编码，你需要一个代码编辑器，我将使用一个体验版的 sublime text，可以在 [这里](www.sublimetext.com/2) 下载到。

还需要一个浏览器来测试你的程序。任何现代浏览器都可以，我将用 Google Chrome，开发过程中将会涉及到一些开始者工具的使用。如果你还没有安装 Chrome，可以去 [这里](www.google.com/chrome) 下载。

为了测试你的程序，你还需要在你的开发机上安装一个 web 服务器。如果你用的是 Window，可以 [安装 IIS](http://www.yeahbutisitflash.com/www.howtogeek.com/howto/windows-vista/how-to-install-iis-on-windows-vista)，macOS 用户可以配置下系统默认的 [Apache](http://macdevcenter.com/pub/a/mac/2001/12/07/apache.html)，如果你的系统是 OS X Mountain Lion 配置 web 服务器可以会比较麻烦，可以参考这个 [教程](http://reviews.cnet.com/8301-13727_7-57481978-263/how-to-enable-web-sharing-in-os-x-mountain-lion/)。

> 如果你有自己托管的 web 服务器，就可以直接上传所以文件来测试，或者如果你有一个 [Dropbox](https://www.dropbox.com/) 账号，你可以通过 [DropPages](http://droppages.com/) 服务来托管你的文件。

web 服务器建好后，创建一个目录 `parallax-scroller` 如果你使用 Windows。你的 web 服务器根目录应该类似 `C:\inetpub\parallax-scroller` 。如果你使用 OS X 则应该是 `/Users/your_user_name/Sites`，`your_user_name` 就是你电脑的用户名。

最后，在教程中我们将使用几个图片素材，不用你自己去找，我已经为你打包好了一个 [zip 文件](http://www.yeahbutisitflash.com/pixi-parallax-scroller/tutorial-1/resources.zip)，下载并解压好你的 `parallax-scroller` 目录。

下面就是你的 `parallax-scroller` 文件夹的样子（Windows）：

![screenshot3](https://img13.360buyimg.com/devfe/jfs/t1/10162/32/14136/48598/5c8884a8Ee6927d64/153a8f1b6f1b4e97.png)

如果你用的是 Mac OS X 则应该如下图：

![screenshot4](https://img30.360buyimg.com/devfe/jfs/t1/31876/28/5811/61642/5c8884ccE7e17d248/5c69f80f99e2cb1d.png)

现在我们已经准备好开始写代码了，启动 Sublime Text 2 或者你最喜欢的编辑器。

## 创建画布

所有的 pixijs 项目都以一个 HTML 文件开始。在这里我们将创建一个 canvas 元素以及引入 pixi.js 库。canvas 元素表示HTML页面上将呈现滚动条的区域。

在你的项目根目录 `parallax-scroller` 下使用编辑器新建一个文件，命名为 `index.html`，并写入下面的代码：

```html
<html>
  <head>
    <meta charset="UTF-8">
    <title>Parallax Scrolling Demo</title>
  </head>
  <body>
  </body>
</html>
```

现在看起来还非常奇怪，我们的 HTML 页面只有一个 `<head>` 和 `<body>` 元素。

现在让我们在页面上添加 HTML5 Canvas 元素，在 body 元素中添加如下的代码：

```html
<body>
  <div align="center">
    <canvas id="game-canvas" width="512" height="384"></canvas>
  </div>
</body>
```

我们指定了 canvas 宽度 512 像素，高度 384 像素。这就是 pixi.js 为库渲染游戏的地方。注意我们给 canvas 了一个 id 属性，值为 `game-canvas` 这将使我们易于控制它，当 pixi.js 启动时也需要它

现在启动你的 web 服务器，在 浏览器中打开类似 http://localhost/parallax-scroller/index.html 或者 http://localhost/\~**your_user_name**/parallax-scroller/index.html 的链接

你会发现并没有什么东西，我们来给 canvas 加点样式（style 标签）：

```html
<html>
  <head>
    <meta charset="UTF-8">
    <title>Endless Runner Game Demo</title>
    <style>
      body { background-color: #000000; }
      canvas { background-color: #222222; }
    </style>
  </head>
  <body>
  </body>
</html>
```

保存并刷新，你将会看见一个水平居中的灰色区域出现在页面上。

## 引入 pixi.js 类库

在 </body> 标签前面加入引用：

```
...
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.0.0/pixi.min.js"></script>
</body>
```

Pixi.js 库文件托管在 CDN 上，URL 上的 `4.0.0` 表示库的版本号，你可以替换成其它的发行版。

## 添加程序的入口

给 body 元素添加 `onload="init();` 表示页面加载完成时调用 init 方法。我们在 script 标签中添加一个 init 方法

```
<body onload="init();">
  <div align="center">
    <canvas id="game-canvas" width="512" height="384"></canvas>
  </div>
  <script src="pixi.js-master/bin/pixi.dev.js"></script>
  <script>
    function init() {
      console.log("init() successfully called.");
    }
  </script>
</body>
```

打开 Chrome Console，Windows 下按 `F12`，macOS 下按 `Cmd + Opt + i`。正常的话控制台就会有下面的输出：

```
> init() successfully called.
```

现在这个 init 方法做的事情还很少，最终它将做为入口负责你程序的调用。

## 初始化 pixi.js

我们在 init 方法中需要做下面两件事情：

* 创建你的舞台（stage）
* 选择并实例化一个渲染器（renderer）

我们先来创建一个舞台对象，如果你是个 Flash 开发者，你可能会对舞台的概念比较熟悉了。基本上舞台就是你游戏的图形内容呈现的地方。另一方面，渲染器控制舞台并且把游戏绘制到你的 HTML 页面中的 canvas 元素上，这样你的做的东西才最终呈现给了用户。

我们来创建一个舞台对象并将它关联到一个名字叫做 `stage` 的全局变量上。并且删除之前的 log 语句：

```
function init() {
  console.log("init() successfully called.");
  stage = new PIXI.Container();
}
```

pixi.js 的 API 包含了一些类和函数，并且被保存在 `PIXI` 模块命名空间下面。PIXI.Container 类用来表示一些 **展示对象**（display object） 的集合，同样也可以表示舞台这个根展示对象。

现在我们已经创建好了一个舞台，我们还需要一个渲染器。Pixi.js 支持两种渲染器：WebGL 和 HTML5 Canvas。你可以通过 `PIXI.WebGLRenderer` 或者 `PIXI.CanvasRenderer` 来分别创建它们各自的实例。然而，更好的做法是让 Pixi 为你判断浏览器自动检测并使用正确的渲染器。Pixi 默认会尝试使用 WebGL，如果不支持则回滚到  canvas。我们调用用 Pixi 的 `PIXI.autoDetectRenderer()` 函数来自动帮我们选择合适的渲染器。

```
function init() {		
  stage = new PIXI.Container();
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );
}
```

`autoDetectRenderer()` 函数需要传入渲染舞台上 cavnas 的宽度和高度，以及 cavnas 元素的引用，它返回 `PIXI.WebGLRenderer` 或 `PIXI.CanvasRenderer` 的实例，我们将其保存在名为 `renderer` 的全局变量中。

在上面的代码中，我们通过一个包含 `view` 属性的 JavaScript 对象来传递给 `autoDetectRenderer` 方法，表示 canvas 元素的引用。我们传递这个对象做为函数的第三个参数而不是直接传 canvas 对象的引用。

我们使用了硬编码的方式指定了宽，高，实际上可以直接通过 canvas 元素取得这两个值：

```
var width = document.getElementById("game-canvas").width;
```

## 渲染

为了能看到舞台上的内容，你得指导你的渲染器把舞台上的内容真正的绘制到 canvas 上。可以通过调用 renderer 的 render 方法，并传入舞台对象的引用来做到：

```
function init() {		
  stage = new PIXI.Container();
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );
  renderer.render(stage);
}
```

这将成功的把舞台渲染到浏览器中。当然我们还没有给舞台上添加任何东西，所以你还看不出来

## 为你的展示列表（display list）添加内容

现在你的舞台已经建成，让我们继续往上面添加一些实际的东西。毕竟我们不想一直只到一个黑色的窗口。

舞台上的东西被添加到一个 **树型结构** 的展示列表中。你的舞台扮演着这些展示列表的根元素的角色，同时展示列表也会有栈顺序的问题，这意味着有的对象展示在别的对象上面，这由他们被设计的索引深度决定。

有很多种类的 **展示对象（display object）** 可以被添加到 **展示列表** 中，最常见的是 `PIXI.Sprite`，它可以添加图片素材。

由于这个教程是关于创建视差滚动背景的，让我们来添加一个表示远景层的图片。 我们将以添加一行代码来加载 `bg-far.png` 文件，这个文件在 resources 目录中：

```
function init() {		
  stage = new PIXI.Container();
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");

  renderer.render(stage);
}
```

图片素材被加载并保存为纹理（textures），这个纹理可以随后被符加到一个或者多个精灵上面。在上面的代码中我们调用了静态 `PIXI.Texture.fromImage()` 方法来创建一个`PIXI.Texture` 实例并将 `bg-far.png` 文件加载到其中。为了方便使用，我们将纹理引用赋值给名为 `farTexture` 的局部变量。

现在让我们创建一个精灵并将纹理附加到它上面。并将精灵定位在舞台的左上角：

```
function init() {		
  stage = new PIXI.Container();
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
  far = new PIXI.Sprite(farTexture);
  far.position.x = 0;
  far.position.y = 0;

  renderer.render(stage);
}
```

`PIXI.Sprite` 类用于创建精灵。它的构造函数将接收一个纹理的引用参数。我们使用了一个名为 far 的全局变量，并将新创建的 sprite 实例存储在其中。

聪明的你可能已经发现我们是如何使用 position 属性将精灵的 x 和 y 坐标设置到舞台的左上角的。舞台的坐标从左到右，从上到下，这意味着舞台的左上角位置为（0,0），右下角为（512,384）。

精灵有一个轴心点（pivot），它们可以来回旋转。轴心点也可以用来定位精灵。精灵的默认轴心点设置为左上角（0,0）。这就是为什么当我们的精灵定位在舞台的左上角时，我们将其位置设置为（0,0）。（译者：如果你将轴心点设置到正中央，那位置是（0,0）的精灵就会展示不全）

最后一步是将精灵添加到舞台上。这是使用 `PIXI.Stage` 类的（实例方法） `addChild()` 方法完成的。来看看怎么做吧：

```
  var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
  far = new PIXI.Sprite(farTexture);
  far.position.x = 0;
  far.position.y = 0;
  stage.addChild(far);

  renderer.render(stage);
}
```

好的，保存你的代码并刷新浏览器。你可能已经满坏期望能看到背景图，但实际上可能看不到。为什么呢？在素材纹理被加载完成之前就渲染它可能并不能有任何效果。因为纹理加载是需要一小段时间的。

我们可以通过简单地等一段时间，然后再次调用 render 方法来解决这个问题。通过 Chrome 的控制台执行下面的代码即可：

```
renderer.render(stage);
```

> 由于我们之前声明的 `renderer` 是全局变量，所以你能在 console 中直接使用它。console 中可以使用任何 JavaScript 中声明的全局变量。

恭喜你！现在应该看到紧贴在屏幕顶部的背景图层了。

现在让我们继续添舞台上的中间层：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
far = new PIXI.Sprite(farTexture);
far.position.x = 0;
far.position.y = 0;
stage.addChild(far);

var midTexture = PIXI.Texture.fromImage("resources/bg-mid.png");
mid = new PIXI.Sprite(midTexture);
mid.position.x = 0;
mid.position.y = 128;
stage.addChild(mid);

renderer.render(stage);
```

保存代码并刷新浏览器。你需要再次手动在 Chrome 控制台中调用渲染方法才能看到两个层：

```
renderer.render(stage);
```

因为中间层是在远景层 **之后** 加入的，所以它离我们更进，或者说有更高的层深度。也就是说每次调用 addChild() 方法添加的展示对象都会在上一次添加的对象之上。

> 我们在这一节的教程中将只会聚焦到远景层和中间层的展示，后面的几节中，我们会实现更复杂的前景层

## 主循环

现在我们有两个背景图层，我想我们可以尝试实现一些视差滚动，并且还可以找到一种渲染内容的方法，而不用从 JavaScript 控制台中手动执行。

为了避免疑惑，让我们快速解释下究竟是什么视差滚动。这是一种用于视频游戏的滚动技术，其中背景层在屏幕上移动的速度比前景层慢。这样做会在2D游戏中产生一种幻觉，并让玩家更有沉浸感（更真实）。

根据上面这些信息，我们可以将它应用于我们的两个精灵层，来生成一个水平视差滚动器，我们将背景层移动到屏幕上的速度比中间层慢一点。为了能让每个层都滚动，我们将创建一个主循环，我们可以不断改变每个层的位置。为了实现这一点，我们将使用 `requestAnimationFrame()` 的帮助，这是一个 JavaScript 函数，它能决定浏览器的最佳帧速率，然后在下一次重绘 canvas/stage 时调用指定的函数。我们还将使用这个主循环来 **不断地** 呈现我们的内容。

```
var midTexture = PIXI.Texture.fromImage("resources/bg-mid.png");
mid = new PIXI.Sprite(midTexture);
mid.position.x = 0;
mid.position.y = 128;
stage.addChild(mid);

renderer.render(stage);

requestAnimationFrame(update);
```

上面的代码，我们指定了一个 update 函数，如果你想连续调用 `requestAnimationFrame()` ，这将使得你的 update 方法每秒调用 60 次。或者通常称为每秒 60 帧（FPS）。

我们还没有 update 函数，但是在实现它之前，先删除渲染方法的调用，因为主循环中会处理这个逻辑。

```
var midTexture = PIXI.Texture.fromImage("resources/bg-mid.png");
mid = new PIXI.Sprite(midTexture);
mid.position.x = 0;
mid.position.y = 128;
stage.addChild(mid);

renderer.render(stage); // 删除它

requestAnimationFrame(update);
```

好吧，让我们来编写主循环并让它稍微改变两个层的位置，然后渲染舞台的内容，这样我们就可以看到每个帧重绘的差异。在 `init()` 函数之后直接添加 `update()` 函数：

```
function update() {
  far.position.x -= 0.128;
  mid.position.x -= 0.64;

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

前两行代码更新了远景层和中间层精灵的水平位置。请注意，我们将远层向左移动0.128 像素，而我们将中间层向左移动 0.64 像素。要向左移动某些东西，我们得使用负值，而正值则会将其移动到右侧。另外请注意，我们将精灵移动了 **小数** 像素。 Pixi 的渲染器可以存储它们并使用子像素来处理它们位置。当你想要非常缓慢地在屏幕上轻推东西时，这是理想的选择。

在循环结束时，我们再次调用 `requestAnimationFrame()` 函数，以确保在下次再次绘制画布时自动再次调用 `update()`。正是它确保了我们的主循环被连续调用，从而能确保我们的视差层在屏幕上稳定移动。

![ps-tut1-screenshot5](https://img14.360buyimg.com/devfe/jfs/t1/25862/18/10942/84129/5c8b2631E9323cbf6/487b26b72c59b787.png)

保存代码并刷新浏览器看看它长什么样子。你应该看到两个图层自动呈现在屏幕上。此外，当两个图层都在移动时，中间层实际上比远景层更快地移动，从而为场景提供深度感。但是你也应该发现有一个明显问题：当每个精灵移出屏幕的左侧时，它会向右边留下一个间隙。换句话说，两个图层的图形都没有循环，以给出连续滚动的错觉。还好，有一个解决方案。

## 使用瓦片（平铺）精灵

到目前为止，我们已经学会使用 `PIXI.Sprite` 类来表示展示列表中的对象。然而，pixi.js 还提供了几个其他 **展示对象** 以满足不同的需求。

如果你细心的观察一下 bg-far.png 和 bg-mid.png 的话，你应该注意到这两个图像都设计成可以水平平铺的（译：平铺就好比瓦片）。检查每个图像的左右边缘。你可以发现，最右边的边缘完美地匹配连接到最左边的边缘。换句话说，两个图像都被设计成无缝循环的。

因此，如果有一种方法可以简单地移动每个精灵的纹理以给出他们正在移动的错觉，而不是物理地移动我们的远景层和中间层精灵的位置，这不是很好吗？值得庆幸的是 pixi.js 提供了 PIXI.extras.TilingSprite 类，它就是用来做这个的。

所以，让我们对代码进行一些调整，来使用瓦片精灵。我们首先关注远景层。继续从建立函数中删除以下行：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
far = new PIXI.Sprite(farTexture); // 删除它
far.position.x = 0;
far.position.y = 0;
stage.addChild(far);
```

替换成这样：

```
far = new PIXI.extras.TilingSprite(farTexture, 512, 256);
```

然后设置他们的位置：

```
far.tilePosition.x = 0;
far.tilePosition.y = 0;
```

在继续之前，让我们讨论 TilingSprite 类的构造函数及它的 tilePosition 属性。

和 Sprite 类的单个参数比较，您会注意到 TilingSprite 类的构造函数需要 3 个参数：

```
far = new PIXI.extras.TilingSprite(farTexture, 512, 256);
```

它的第一个参数与之前相同：纹理的引用。第二个和第三个参数分别表示瓦片精灵的宽度和高度。通常，将这两个参数设置为 **纹理** 的宽度和高度，比如 `bg-far.png` 为 512 x 256 像素。

我们又一次的硬编码的传入了两个宽高参数，可以通过下面的方法改善：

```
far = new PIXI.extras.TilingSprite(
  farTexture,
  farTexture.baseTexture.width,
  farTexture.baseTexture.height
);
```

我们还利用了平铺精灵的 tilePosition 属性，该属性用于偏移精灵纹理的位置。换句话说，通过调整偏移量，就可以水平或垂直地移动纹理，并使纹理环绕。本质上，你可以模拟滚动而无需实际更改精灵的位置。

我们将精灵的 tilePosition 属性默认设置为（0,0），这意味着远景层的外观在初始化的状态下没有变化：

```
far.tilePosition.x = 0;
far.tilePosition.y = 0;
```

剩下要做的就是通过不断更新精灵的 tilePosition 属性的水平偏移来模拟滚动。为此，我们将对 `update()` 函数进行更改。首先删除以下行：

```
function update() {
  far.position.x -= 0.128; // 删除它
  mid.position.x -= 0.64;

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

替换成下面这样：

```
function update() {
  far.tilePosition.x -= 0.128;
  mid.position.x -= 0.64;

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

现在保存 index.html 并再次刷新浏览器。你将看到远景层无缝滚动并一直重复着，这和我们的预期结果的一样。

好的，让我们继续为中间层做出相同的修改。以下是进行更改后 `init()` 函数：

```
function init() {
  stage = new PIXI.Container();
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");	
  far = new PIXI.extras.TilingSprite(farTexture, 512, 256);
  far.position.x = 0;
  far.position.y = 0;
  far.tilePosition.x = 0;
  far.tilePosition.y = 0;
  stage.addChild(far);

  var midTexture = PIXI.Texture.fromImage("resources/bg-mid.png");
  mid = new PIXI.extras.TilingSprite(midTexture, 512, 256);
  mid.position.x = 0;
  mid.position.y = 128;
  mid.tilePosition.x = 0;
  mid.tilePosition.y = 0;
  stage.addChild(mid);

  requestAnimationFrame(update);
}
```

现在继续对 `update()` 函数进行以下重构：

```
function update() {
  far.tilePosition.x -= 0.128;
  mid.tilePosition.x -= 0.64;

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

保存并测试你的代码。这次你应该看到两个图层完全地滚动，同时环绕屏幕的左右边界。

## 结语

我们已经介绍了pixi.js 的一些基础知识，并了解了 `PIXI.extras.TilingSprite` 如何用于创建无限滚动图层的。我们还看到了如何使用 `addChild()` 将瓦片精灵堆叠在一起以产生真实的视差滚动。

我建议你继续尝试使用 Pixi 并查看它的文档和代码示例。两者都可以在 PixiJS [官方网站](http://www.pixijs.com/) 上找到。

## 下集预告…

虽然我们有一个水平视差滚动器并且能运行起来，但它仍然有点简单。下次我们将介绍 **视口** 和 **世界** 位置的概念，如果你想最终将你的卷轴添加到游戏中，这两个都很重要。它还将使我们处于添加前景层的良好位置，这将代表一个简单的平台游戏地图。

我们将花很多时间来重构现有的代码库。我们将采用更加面向对象的架构，摆脱目前对全局变量的依赖。在下一个教程结束时，所有滚动功能都将整齐地包含在一个类中。

我希望这个教程能帮助到你，也希望下次能在 **第二部分** 中见到你。