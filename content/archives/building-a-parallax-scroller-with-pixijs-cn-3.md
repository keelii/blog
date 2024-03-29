+++
title = "使用 Pixi.js 构建一个视差滚动器（第三篇）"
isCJKLanguage = true
categories = ["fe"]
tags = ["game", "pixi.js", "canvas"]
date = "2019-03-19T19:20:04-07:00"
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

欢迎再次来到这个系列教程的第三部分，这一节将会涉及到如何使用 pixi.js 制作视差滚动游戏的地图。整个教程到目前为止已经涵盖了很多内容。在第一个教程中，我们学习了一些 pixi.js 基础知识，并将视差滚动应用于几个层上。在第二部分，通过代码重构将一些面向对象的概念应用到实践中。这一节我们将把重点放在第三个更复杂的视差层上，它将代表玩家角色在游戏时将会穿越的地图。

### 你将学到什么…

* 如何处理纹理（textures）和精灵表（sprites sheet）
* 对象池 的基础

### 预备知识…

* pixi.js 基础
* 了解 JavaScript 或者 ActionScript 的基础知识
* 对面向对象有基本的概念

我们将继续从上一个教程结束的地方开始。你可以使用前两个教程编写的代码，也可以从 [GitHub](https://github.com/ccaleb/pixi-parallax-scroller/tree/master/tutorial-2) 下载第二个教程的源代码。也可以在 GitHub上 找到第三节完整教程的 [源代码](https://github.com/ccaleb/pixi-parallax-scroller/tree/master/tutorial-3)，即使你遇到了问题，我也鼓励你完成本教程，有疑问可以请仅参考源代码。

这个系列的教程非常受到 [Canabalt](http://www.adamatomic.com/canabalt/) 和 [Monster Dash](https://chrome.google.com/webstore/detail/monster-dash/cknghehebaconkajgiobncfleofebcog?hl=en) 游戏的启发，当玩家的英雄在平台之间奔跑和跳跃时，这些游戏都能很好地利用视差滚动来提供花哨的视觉效果。

在接下来的两节教程中，我们将构建一个非常类似于 Monster Dash 中的滚动游戏地图。 Monster Dash 的游戏地图是由一系列不同宽度和高度的砖块儿构建而成。游戏的目的是通过在砖块儿之间跳跃来尽可能长地生存。游戏地图的滚动速度随着时间的推移而增加。

[![ps-tut1-screenshot1](https://img10.360buyimg.com/devfe/jfs/t1/25206/13/10616/142679/5c887df7E7c1fa38a/eab39f5f7ab1cc6d.png)](http://www.yeahbutisitflash.com/pixi-parallax-scroller/final/index.html)

上面就是你这一节将要完成的示例。单击图片即可查看包含砖块儿和间隙的滚动地图。

## 起步

如果你还没有看过第一节和第一节教程，我建议你应该先看完这两节。

在本节教程中，我们将使用一些新的图片素材。可以直接从 [这里](www.yeahbutisitflash.com/pixi-parallax-scroller/tutorial-3/resources.zip) 下载，并将其内容解压缩到项目的 resource 文件夹中。

下面就是你的 `resource` 文件夹的样子（Windows）：

![ps-tut3-screenshot1](https://img11.360buyimg.com/devfe/jfs/t1/31697/16/6353/53328/5c8e01e2E14bc1c7b/d5701c262078bc35.png)

macOS 下则是这样：

![ps-tut3-screenshot2](https://img20.360buyimg.com/devfe/jfs/t1/25309/3/11322/64214/5c8e01f7Ed95812be/fa19f72e6cc3b5e7.png)

此外，如果你还没有建立一个本地的 web 服务器，请参考第一节的内容。

值得注意的是，本教程比前两篇长。你可能需要大约两个小时才能完成所有工作。

## 游戏地图

正如上面的演示中展示的那样，我们的游戏地图有很多种展示形式。如砖块儿的宽度和高度各不相同。每个跨度还包括一系列窗户和墙壁装饰元素。墙壁装饰本身由管道和通风口组成。

那么墙跨度是如何构建的？每个跨度都是由一系列拼接在一起的垂直切片构成的。每个切片的大小为 64 x 256 像素。下图显示了示例砖块儿。

![diagram-1](https://img20.360buyimg.com/devfe/jfs/t1/11199/10/12039/18165/5c8e031aE2a8746ce/c51ef91aeebd739b.png)

通过垂直移动每个切片的位置来处理砖块儿的高度。下面的示意图中我们可以看到，第二个面墙的切片部分位于视口的可见区域下方（译者：超出视口），使其看起来低于第一面墙。

![diagram-2](https://img14.360buyimg.com/devfe/jfs/t1/28702/23/11291/23279/5c8e047aE0dc68c77/08ba190fd4f5f08b.png)

大多数情况，一而墙内的每个切片将会是水平对齐的。但有一个例外。 Monster Dash 有一个阶梯式的跨度，让玩家可以直接跌落到下一个水平线上。以下是它的构造方式：

![diagram-3](https://img13.360buyimg.com/devfe/jfs/t1/14544/9/11325/22909/5c8e0484E33aa7b33/c2b3b720df1d69a1.png)

如果你仔细观察上面的示意图，你应该注意到这里真正的是墙面有两个（第一个跨度高于第二个），它们通过中间的一个切片（台阶）连接起来。

你可能会惊讶地发现我们的整个游戏地图只由八种不同类型的垂直切片构成：

![diagram-4](https://img11.360buyimg.com/devfe/jfs/t1/18163/12/11214/22059/5c8e053aE742a81ce/3fe250596cbb7bab.png)

这些切片的顺序很重要。我们再来谈谈这个问题。

## 分解砖块墙

一面砖块墙包括三个主要部分：

1. 前边缘
2. 中间部分
3. 后边缘

前/后边缘都只由一个垂直切片表示。然而，中间部分可以由一个或多个切片制成。切片越多，墙跨度就越长。我们将制作一面有 30 个切片的砖块墙。下图可以解释砖块墙的三大部分。

![diagram-5](https://img20.360buyimg.com/devfe/jfs/t1/26701/4/11364/142241/5c8e0660E36cd06e7/61bb2ce4e0f7b003.png)

墙的中间部分只有下面两种切片：

* 窗口（window）
* 装饰（decoration）

因此整个墙的中间部分长度为 6，结构如下：

```
window, decoration, window, decoration, window, decoration
```

然而，通常情况下，砖块墙的中间部分是非偶数个切片才能保证出现的容器即有亮灯的也有灭的。所以我们使用 7 个切片来制作中间部分

```
window, decoration, window, decoration, window, decoration, window
```

为了保证砖块墙尽可能看起来有趣，窗户可以点亮或不点亮，我们可以随机选择三种装饰切片。因此，墙的中间部分将由五种不同类型的切片构成。

为了增加更多的切片种类，我们从砖块墙的边缘素材中（两个）选择两个切片做为前后边缘（译者：边缘素材有两个，可以随机选一个做前边缘，然后翻转它做成后边缘，但是不能一个做前一个做后，示意图中的 front & back 和图片没有对应关系），后边缘也可以使用同样的前边缘，因为我们只需要把它（前边缘）水平翻转然后正确地拼接到后边缘即可。台阶切片很少会出现，所以我们只需要用一个切片。

![diagram-6-1024x531](https://img13.360buyimg.com/devfe/jfs/t1/26044/20/11490/360476/5c8f0047Ec7d99a6b/b226b682c6da3a9f.png)

打开上面的素材，单独放在一个浏览器 tab 里面，可以方便制作时查看它。

> 不要将切片 **类型** 与用于构建指定砖块墙的切片数混淆。例如，一面砖块墙可以有 30 个垂直切片，但实际上只由 8 类切片构建。

现在你已经了解了砖块墙是如何构建的，我们可以开始实现它了。

## 精灵表（Sprite sheet）

如上所述，我们的砖块墙由八种不同类型的砖块构成。表示这些切片的最简单方法是为每个切片提供单独的 PNG文件。虽然这是一种办法，但我们实际上会将所有切片添加到一个称为 **精灵表** 的大型 PNG 文件中。

> 精灵表通常也称为 **纹理图集（texture atlas**） 。我们将在本教程中使用 **精灵表** 这个术语。

我在本教程的 resources.zip 文件中提供了精灵表。这是一个名为 `wall.png` 的文件，如下所示。所有八个切片都已打包到一个位图上。

![sprite-sheet](https://img14.360buyimg.com/devfe/jfs/t1/16841/31/11340/23788/5c8f02ecEcdd940cb/a38fb14d2958229f.png)

资源文件夹中还有一个与精灵表对应的 `wall.json` 文件。可以直接用文本编辑器打开。此文件使用 JSON 数据格式来定义精灵表中单独位图切片的名称和位置。使用精灵表时，表中的每个单独的位图称为 **帧**。

> 我们的整个精灵表将作为纹理加载到代码中（中间层和远景图层也这么加载过）。因此，有时会将框架视为子纹理。

并不需要完全理解 JSON 文件，因为 Pixi 将处理它。但是，我们可以探索一下正在使用的这个文件。下面这段是来自 JSON 数据中的一段，表示第一个墙边切片的框架。我已经为高亮了一些代码行：

```
"edge_01": // 高亮
{
  "frame": {"x":128,"y":0,"w":64,"h":256},// 高亮
  "rotated": false,
  "trimmed": false,
  "spriteSourceSize": {"x":0,"y":0,"w":64,"h":256},
  "sourceSize": {"w":64,"h":256}
},
```

第一行包含与框架关联的 **唯一名称**（`edge_01`）：

```
"edge_01":
```

每当我们想要从精灵表中直接获取这个墙切片的图像时，我们将使用此名称。

> 如果你不熟悉 JSON 数据格式，则可以在此 [Wikipedia 条目](https://zh.wikipedia.org/zh-cn/JSON) 中找到更多信息。

下一个高亮行代码定义了框架的矩形区域：

```
"frame": {"x":128,"y":0,"w":64,"h":256},
```

本质上，它用于在精灵表中定位帧的位图。

JSON 文件中还有其他七种类型的切片。每个切片将由唯一的帧名称表示。使用精灵表时，你只需要知道 **唯一名称** 即可。下面我还提供了一张标有每个切片类型的图片。也可以单独打开这个图片，方便回顾。

wall.json 的后面，有一些元数据：

```
"meta": {
  "app": "http://www.codeandweb.com/texturepacker ",
  "version": "1.0",
  "image": "wall.png",
  "format": "RGBA8888",
  "size": {"w":256,"h":512},
  "scale": "1",
  "smartupdate": "$TexturePacker:SmartUpdate:fc102f6475bdd4d372c..."
}
```

在该数据表示精灵表的实际文件的相对路径。 Pixi 将使用该数据加载正确的 PNG 文件。

## 纹理打包器（TexturePacker）

我使用了一个工具来生成本教程的精灵表和 JSON 文件。它的名字叫 [TexturePacker](http://www.codeandweb.com/texturepacker)，可用于Windows，Mac OS X 和 Linux。它可以导出许多精灵表格式，包括 pixi.js 使用的JSON（哈希）格式。我不会在本教程中介绍如何使用 TexturePacker，但它非常容易掌握。付费版本也物超所值，还有一个免费版本，适合那些想先学习基础知识的人。

## 加载精灵表

既然我们对精灵表有一点了解了，就让我们继续把它加载进程序。我们首先将一些代码添加到项目的 Main 类中。用文本编辑器中打开 Main.js。

在文件的末尾，添加以下方法来加载精灵表：

```
Main.prototype.loadSpriteSheet = function() {
  var loader = PIXI.loader;
  loader.add("wall", "resources/wall.json");
  loader.once("complete", this.spriteSheetLoaded.bind(this));
  loader.load();
};
```

我们使用了 `PIXI.loaders.Loader` 类，它可用于加载图像，精灵表和位图字体文件。我们直接从 `PIXI.loader` 属性获取加载器的预定义的实例来使用加载器，所有资源都可以人这里加载。所以，只需把 `wall.json` 文件也添加进去。我们传递一个与文件关联的唯一 ID 作为第一个参数，并将资源的实际相对路径作为第二个参数传递。

加载精灵表后，PIXI.loaders.Loader 类会触发一个 `complete` 事件。为了响应该事件，我们只需要绑定 complete 方法到自定义函数 `spriteSheetLoaded()` 中，这个函数我们稍后实现。

最后，调用我们的 PIXI.loaders.Loader 实例的 `load()` 方法来真正加载我们的精灵表。加载完后，Pixi 将提取所有帧并将其存储在内部的纹理缓存中以便后续使用。

> 目前，远景层和中间层图像在其构造函数中加载。但是，我们实际上可以预先加载这些图像，并避免在实例化远景层和中间类时出现短暂的延迟。将它们添加到我们的 Loader 实例中：

```
loader.add("wall", "resources/wall.json");
loader.add("bg-mid", "resources/bg-mid.png"); // 添加
loader.add("bg-far", "resources/bg-far.png"); // 添加
```

> 无需对 Far 或 Mid 类进行任何更改，因为在尝试从文件系统加载纹理之前，对  `PIXI.Texture.fromImage()` 的调用将优先查询内部纹理缓存。

现在让我们编写 `spriteSheetLoaded()` 方法。在文件末尾添加以下内容：

```
Main.prototype.spriteSheetLoaded = function() {
};
```

我们需要编写这个空方法。之前我们创建了一个 Scroller 类的实例，并在 Main 类的构造函数中启动了我们的主循环。但是，我们现在要等到精灵表加载完成后再进行所有操作。让我们将该代码移动到我们的 `spriteSheetLoaded()` 方法中。

向上滚动到构造函数并删除以下两行：

```
function Main() {
  this.stage = new PIXI.Container();
  this.renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  this.scroller = new Scroller(this.stage); // 删除

  requestAnimationFrame(this.update.bind(this)); // 删除
}
```

再回到你的 `spriteSheetLoaded()` 方法并在那里添加删除的两行：

```
Main.prototype.spriteSheetLoaded = function() {
  this.scroller = new Scroller(this.stage);
  requestAnimationFrame(this.update.bind(this));
};
```

最后，返回构造函数并调用 `loadSpriteSheet()` 方法：

```
function Main() {
  this.stage = new PIXI.Container();
  this.renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  this.loadSpriteSheet(); // 添加
}
```

现在保存代码并刷新浏览器。在 Chrome 的 JavaScript 控制台中查看没有错误。

## 测试精灵表

虽然我们已经成功加载了精灵表，但我们并不知道帧（我们的八个垂直壁切片类型）是否已真正地存储在 Pixi 的纹理缓存中。所以让我们继续创建一些使用其中一些精灵来使用这使用帧。

我们将在 `spriteSheetLoaded()` 方法中执行我们的测试。将以下代码添加到其中：

```
Main.prototype.spriteSheetLoaded = function() {
  this.scroller = new Scroller(this.stage);
  requestAnimationFrame(this.update.bind(this));

  var slice1 = PIXI.Sprite.fromFrame("edge_01"); // 高亮
  slice1.position.x = 32; // 高亮
  slice1.position.y = 64; // 高亮
  this.stage.addChild(slice1); // 高亮
};
```

在上面的代码中，我们利用了 PIXI.Sprite 类的 `fromFrame()` 静态方法。它使用纹理缓存中与指定帧 ID 匹配的纹理创建一个新的精灵。我们指定 `edge_01` 帧用来表示砖块墙前边缘的切片。

保存代码并刷新浏览器以查看切片。不用担心它展示的位置，位置现在还不重要。

让我们添加第二个垂直切片。这次我们将使用砖块墙中间的切片类型。为了更精确，我们将使用精灵表中名为`decoration_03` 的帧：

```
Main.prototype.spriteSheetLoaded = function() {
  this.scroller = new Scroller(this.stage);
  requestAnimationFrame(this.update.bind(this));

  var slice1 = PIXI.Sprite.fromFrame("edge_01");
  slice1.position.x = 32;
  slice1.position.y = 64;
  this.stage.addChild(slice1);

  var slice2 = PIXI.Sprite.fromFrame("decoration_03"); // 添加
  slice2.position.x = 128; // 添加
  slice2.position.y = 64; // 添加
  this.stage.addChild(slice2); // 添加
};
```

再次保存并测试。现在应该看到两个垂直墙切片位于舞台上，类似于下面的这个屏幕截图。

![tut3-testing-sprite-sheet](https://img10.360buyimg.com/devfe/jfs/t1/14918/30/11267/98749/5c8f0dd7Ee4736269/d06820174522e100.png)

希望你现在对精灵表的框架已成功加载并缓存产生了一些成就感。从 `spriteSheetLoaded()` 方法中删除测试代码。方法应再次如下所示：

```
Main.prototype.spriteSheetLoaded = function() {
  this.scroller = new Scroller(this.stage);
  requestAnimationFrame(this.update.bind(this));
};
```

保存你的修改

## 一些 GPU 理论

我还没有解释为什么我们选择将切片打包成一个精灵表而不是单独加载八个 PNG 到内存中。原因和性能相关。 Pixi 的 WebGL 渲染器利用计算机的图形处理单元（GPU）来加速图形性能。但是为了保证最佳性能，我们必须至少了解一点 GPU 的工作原理。

GPU 更擅长一次处理大数据量的场景。 Pixi 会迎合 GPU 的这个特点，把数据对象批量发送给 GPU。但是，它只能批量处理具有相似状态的展示对象。当遇到具有不同状态的显示对象时，表示已经发生状态改变并且 GPU 会停止以绘制当前批次。程序中发生的状态更改越少，GPU 需要执行的绘制操作就越少，以便呈现展示列表。 GPU 执行的绘制操作越少，渲染性能就越快。

> 刚刚提到的 **绘制**（draw） 操作和我们平常绘画意思差不多。

不幸的是，每当遇到具有不同纹理的展示对象时，状态就会发生改变。精灵表可以帮助避免状态更改，因为所有图像都存储在单个纹理中。 GPU 可以非常愉快地从精灵表中绘制每个帧（或子纹理），而无需单独的调用绘制。

但是，可以存储在 GPU 上的纹理存在大小限制。大多数现代 GPU 可以存储大小为 2048×2048 像素的纹理。因此，如果你要使用精灵表，请确保其尺寸不超过 GPU 纹理的限制。值得庆幸的是，我们的精灵表很小。

因此，与将每个墙切片的图像存储在单独的纹理上相比，我们的精灵表可以帮助显着提高滚动器的性能。

## 展示游戏地图

所以我们已经成功加载了精灵表并且还设法显示了一些帧，但是我们如何真正地构建一个包含砖块墙的大地图？

我想最简单的方法是创建一个精灵数组，其中每个精灵代表我们地图中的垂直墙切片。然而，考虑到每个切片的宽度比较短，我们的整个地图将很容易由数千个精灵组成。这是很多精灵都将存储在内存中。另外，如果我们只是将所有这些精灵转储到我们的展示列表上，那么它会给渲染器带来很大的压力，可能会影响游戏的帧速率。

另一种方法是实例化并仅显示将在视口中可见的精灵。当地图滚动时，最左边的精灵最终将离开屏幕。当发生这种情况时，我们可以从显示列表中删除该精灵，并在视口最右边的外部添加一个新的精灵。通过这种方法，我们可以向用户提供滚动整个地图的错觉，而实际上只需要处理视口中当前可见的地图部分。

虽然第二种方法肯定比第一种方法更好，但它需要为我们的精灵进行不断的内存分配和释放：为进入的每个新精灵分配内存，为离开的精灵释放内存。为什么这么做比较糟糕呢？因为分配内存需要宝贵的 CPU 周期，这可能会影响游戏的性能。如果你必须不断地分配内存，那将避免不了这个问题。

释放之前对象使用的内存也是潜在的 CPU 性能损耗。 JavaScript 运行时利用垃圾收集器释放以前被不再需要的对象使用的内存。但是，你无法直接控制何时进行垃圾收集，假如需要释放大量内存，该过程可能需要几毫秒。因此，不断实例化精灵再从展示列表中删除精灵将导致频繁的垃圾收集，这会影响游戏的性能。

第三种方法可以避免前两种问题。它被称为 **对象池**，它能在不触发 JavaScript 的垃圾收集器的情况下更加智能地使用内存。

## 对象池（Object Pooling）

想理解对象池，请考虑一个简单的游戏场景。在射击游戏中，玩家的船可能会在游戏过程中发射数十万枚射弹，但由于船的射速，任何时候都只能有 20 枚射弹进入屏幕。因此，仅在游戏代码中创建 20 个射弹实例并在游戏过程中重新使用这些射弹是更好的。

20 个射弹可以存放在一个阵列中。每次玩家开火时，我们从阵列中移除一个射弹并将其添加到屏幕上。当射弹离开屏幕（或击中敌人）时，我们将其添加回阵列以便稍后再次使用。重要的是我们永远不需要创建新的射弹实例。相反，我们只使用预先创建的 20 个实例池。在我们的示例中，数组将是我们的对象池。这样合理吗？

> 如果你想了解有关对象池的更多信息，请查看此 [Wikipedia条目](https://zh.wikipedia.org/zh-cn/%E5%AF%B9%E8%B1%A1%E6%B1%A0%E6%A8%A1%E5%BC%8F)。

我们可以将对象池应用到游戏地图中，并具有以下内容：一个窗口（window）切片池；一幢墙面装饰（decoration）切片；一层前边缘；一层后边缘；还有一个台阶。

因此，虽然我们的游戏地图最终可能包含数百个窗口，但实际上我们只需要创建足够的窗口精灵来覆盖视口的宽度。当一个窗口即将在我们的视口中显示时，我们只需从 windows 对象池中检索一个窗口精灵。当该窗口滚出视图时，我们将其从显示列表中删除并将其返回到对象池。我们将这个原则应用于边缘，装饰和台阶。

知道这就足够了。让我们开始构建一个对象池类来保存我们的切片精灵。

## 创建一个对象池类

由于我们的游戏地图代表了一系列砖块墙，我们将创建一个名为 `WallSpritesPool` 的类，作为我们各种墙壁部件的池子。

> 更通用的类名可能是 `MapSpritesPool`，也可以是 `ObjectPool`。但是，就本教程而言，`WallSpritesPool` 是比较合适的。

在文本编辑器中创建一个新文件并添加以下构造函数：

```
function WallSpritesPool() {
  this.windows = [];
}
```

保存文件并将其命名为 `WallSpritesPool.js`。

在构造函数中，我们定义了一个名为 windows 的空数组。此数组将充当我们地图中所有的窗口精灵的对象池。

## 给 windows 池子添加元素

我们的数组需要预先填充一些窗口精灵。请记住，我们的砖块墙可以支持两种类型的窗户 — 一个开灯的窗户和一个没有开灯的窗户 - 所以我们需要确保我们添加两种类型足够多。通过将以下代码添加到构造函数来填充数组：

```
function WallSpritesPool() {
  this.windows = [];

  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
}
```

上面的代码为对象池添加了 12 个窗口精灵。前 6 个精灵代表我们亮灯的窗口（`window_01`），而余他 6 个精灵代表未亮灯的窗口（`window_02`）。

从对象池中检索精灵时，它们将从数组的前面获取。根据我们在填充时将精灵添加到数组中的顺序，对窗口精灵的前 6 个请求将始终返回一个亮灯的窗口，而接下来的 6 个请求将始终返回一个未亮灯的窗口。我们从池中获得的窗口切片类型需要 **随机** 出现。这可以通过在填充数组后数组元素进行打乱来实现。

以下方法将把传递给它的数组打乱。添加方法：

```
WallSpritesPool.prototype.shuffle = function(array) {
  var len = array.length;
  var shuffles = len * 3;
  for (var i = 0; i < shuffles; i++)
  {
    var wallSlice = array.pop();
    var pos = Math.floor(Math.random() * (len-1));
    array.splice(pos, 0, wallSlice);
  }
};
```

现在从构造函数调用 `shuffle()` 方法：

```
function WallSpritesPool() {
  this.windows = [];

  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_01"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  this.windows.push(PIXI.Sprite.fromFrame("window_02"));
  
  this.shuffle(this.windows); // 调用
}
```

现在让我们做一些重构，因为有一个更简洁的方法来填充我们的数组。由于我们实际上是在数组中添加两组精灵（亮灯和不亮灯的窗口），我们可以替换以下代码行：

```
function WallSpritesPool() {
  this.windows = [];

  this.windows.push(PIXI.Sprite.fromFrame("window_01")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_01")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_01")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_01")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_01")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_01")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_02")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_02")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_02")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_02")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_02")); // 删除
  this.windows.push(PIXI.Sprite.fromFrame("window_02")); // 删除
  
  this.shuffle(this.windows);
}
```

用下面的代替：

```
function WallSpritesPool() {
  this.windows = [];

  this.addWindowSprites(6, "window_01"); // 添加
  this.addWindowSprites(6, "window_02"); // 添加
  
  this.shuffle(this.windows);
}

 // 添加
WallSpritesPool.prototype.addWindowSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = PIXI.Sprite.fromFrame(frameId);
    this.windows.push(sprite);
  }
};

WallSpritesPool.prototype.shuffle = function(array) {
  var len = array.length;
  var shuffles = len * 3;
  for (var i = 0; i < shuffles; i++)
  {
    var wallSlice = array.pop();
    var pos = Math.floor(Math.random() * (len-1));
    array.splice(pos, 0, wallSlice);
  }
};
```

保存更改。

`addWindowSprites()` 方法允许我们向 windows 数组中添加一些在精灵表中指定的精灵帧。因此，它可以很容易地为我们的池子添加一组 6 个亮灯精灵和一组 6 个未亮灯精灵。

在继续之前，我们应该再做一次重构。将构造函数中的代码移动到单独的方法中。删除以下行：

```
function WallSpritesPool() {
  this.windows = []; // 删除

  this.addWindowSprites(6, "window_01"); // 删除
  this.addWindowSprites(6, "window_02"); // 删除
  
  this.shuffle(this.windows); // 删除
}
```

使用一个新方法替换：

```
WallSpritesPool.prototype.createWindows = function() {
  this.windows = [];

  this.addWindowSprites(6, "window_01");
  this.addWindowSprites(6, "window_02");

  this.shuffle(this.windows);
};
```

最后，从构造函数中调用 `createWindows()` 方法：

```
function WallSpritesPool() {
  this.createWindows();
}
```

好的，我们目前用代码创建了窗口精灵，将它们添加到一个数组，并打乱该数组。继续之前保存文件。

## 为什么使用十二个窗口精灵

从技术上讲，我们可以在池中使用少于 12 个窗口精灵。毕竟，我们只需要足够的精灵来覆盖视口的宽度。我选择十二个的原因是为了让砖块墙的亮灯和不亮灯窗户具有一些随机性。然而值得注意的是，我可以在合理范围内使用任意数量的精灵，只要它为我提供足够的窗口精灵以在视口内生成砖块墙。

## 借用（borrow）和归还（return）精灵

我们的对象池有一组窗口精灵，但是我们还没有提供从池中获取精灵或返回池的公共方法。

> 所有方法和属性都可以在 JavaScript 中公开访问。这可能使你难以识别属于你的类 API 的方法和属性以及处理实现细节的方法和属性。当我把某些东西称为“公开”时，我的意思是说我打算在类的外部使用它。

我们将提供以下两种方法：

* `borrowWindow()`
* `returnWindow()`

`borrowWindow()` 方法将从 windows 池中删除一个窗口精灵，并返回对它的引用供你使用。完成后，可以通过调用 `returnWindow()` 将精灵作为参数传递回游戏池。

好的，我们在类的构造函数之后添加 `borrowWindow()` 方法：

```
function WallSpritesPool() {
  this.createWindows();
}
// 添加
WallSpritesPool.prototype.borrowWindow = function() {
  return this.windows.shift();
};
```

正如你所看到的，这是一个相当简单的方法，它只是从 windows 数组的前面删除第一个精灵并返回它。

> `borrowWindow()` 方法不会检查池中是否还有精灵。我们在这一系列教程中都不会太在意这种异常情况，但在尝试从中返回内容之前，检查一下精灵池是否为空是一个好习惯。有多种策略可用于处理空池子。一个常见的方法是在干燥（没有元素）时动态增加池的大小。

现在直接在其下面添加 `returnWindow()` 方法：

```
WallSpritesPool.prototype.borrowWindow = function() {
  return this.windows.shift();
};
// 添加	
WallSpritesPool.prototype.returnWindow = function(sprite) {
  this.windows.push(sprite);
};
```

就像 `borrowWindow()` 一样，`returnWindow()` 方法很简单。它将精灵作为参数并将该精灵压入到 windows 数组的末尾。

我们现在有一种从对象池中借用窗口精灵的方法，一旦我们完成它就将精灵返回给（归还）对象池的方法。

保存更改。

## 快速回顾

查看一下 `WallSpritesPool` 类。并没有很多代码，但重要的是你要了解在添加之前发生了什么。以下是类的当前版本：

```
function WallSpritesPool() {
  this.createWindows();
}

WallSpritesPool.prototype.borrowWindow = function() {
  return this.windows.shift();
};
	
WallSpritesPool.prototype.returnWindow = function(sprite) {
  this.windows.push(sprite);
};

WallSpritesPool.prototype.createWindows = function() {
  this.windows = [];

  this.addWindowSprites(6, "window_01");
  this.addWindowSprites(6, "window_02");

  this.shuffle(this.windows);
};

WallSpritesPool.prototype.addWindowSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = PIXI.Sprite.fromFrame(frameId);
    this.windows.push(sprite);
  }
};

WallSpritesPool.prototype.shuffle = function(array) {
  var len = array.length;
  var shuffles = len * 3;
  for (var i = 0; i < shuffles; i++)
  {
    var wallSlice = array.pop();
    var pos = Math.floor(Math.random() * (len-1));
    array.splice(pos, 0, wallSlice);
  }
};
```

该类只创建一个包含 6 个亮灯窗口精灵和 6个未亮灯窗口精灵数组。该数组充当窗口的精灵池，并且被打乱以确保随机混合两种状态。提供了两个公共方法 — `borrowWindow()` 和 `returnWindow()` - 它们允许从精灵池中借用一个窗口精灵，然后归还到池中。

这就是它要做的所有事情了。当然，我们仍然需要考虑其他切片类型（前边缘，后边缘，墙面装饰和墙壁台阶），但我们很快就会将它们添加到我们的 WallSpritesPool 类中。首先让我们把将精灵池的代码引用到页面，保证正常运行。

## 测试你的对象池

转到你的 index.html 文件并引用 `WallSpritesPool` 类的源文件：

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.0.0/pixi.min.js"></script>
<script src="Far.js"></script>
<script src="Mid.js"></script>
<script src="Scroller.js"></script>
<script src="WallSpritesPool.js"></script> <!-- 添加 -->
<script src="Main.js"></script>
```

保存代码。

现在打开 Main.js。我们将对 Main 类进行一些临时更改，以便测试对象池。

我们首先在 `spriteSheetLoaded()` 方法中创建我们的对象池的实例，创建将用于保存从池中获取的切片精灵数组：

```
Main.prototype.spriteSheetLoaded = function() {
  this.scroller = new Scroller(this.stage);
  requestAnimationFrame(this.update.bind(this));

  this.pool = new WallSpritesPool(); // 添加
  this.wallSlices = []; // 添加
};
```

在上面的代码中，我们将对象池实例存储在名为 pool 的成员变量中，而我们的数组的成员变量名为 `wallSlices`。

现在让我们编写一些代码来从池中获取指定数量的窗口并将它们连续地添加到舞台上。添加以下测试方法：

```
Main.prototype.borrowWallSprites = function(num) {
  for (var i = 0; i < num; i++)
  {
    var sprite = this.pool.borrowWindow();
    sprite.position.x = -32 + (i * 64);
    sprite.position.y = 128;

    this.wallSlices.push(sprite);

    this.stage.addChild(sprite);
  }
};
```

除了将窗口精灵添加到舞台，上面的 `borrowWallSprites()` 方法还将每个精灵添加到我们的 `wallSlices` 成员变量中。这样做的原因是我们需要能够从第二个测试方法中访问（删除、移除、归还）这些窗口精灵，我们现在将编写它们。添加以下内容：

```
Main.prototype.returnWallSprites = function() {
  for (var i = 0; i < this.wallSlices.length; i++)
  {
    var sprite = this.wallSlices[i];
    this.stage.removeChild(sprite);
    this.pool.returnWindow(sprite);
  }

  this.wallSlices = [];
};
```

这个 `returnWallSprites()` 方法删除添加到舞台的所有窗口切片，并将这些精灵归还到对象池。

通过这两种方法，我们可以验证我们是否可以从对象池中借用窗口精灵，并将这些精灵归还给池子。我们将使用Chrome 的 JavaScript 控制台窗口：

刷新浏览器并打开JavaScript控制台。手动执行如下代码：

```
main.borrowWallSprites(9);
```

> 请记住，我们的 Main 类可以通过主全局变量 main 访问，我们可以使用它来调用 `borrowWallSprites()` 方法。

就像下面的截图一样，你应该看到舞台上有九个窗口精灵。都是从你的对象池中 **借** 来的，然后被添加到舞台上。还要注意，亮灯和亮灯的窗口序列可能是随机出现的。这是因为池中的窗口数组在创建后被打乱了。

![tut3-testing-object-pool](https://img12.360buyimg.com/devfe/jfs/t1/31720/25/6450/27075/5c8f20c3E419f8f9b/1c176082df00c88d.png)

现在让我们验证是否可以将这些精灵归还给对象池。在控制台中输入以下内容：

```
main.returnWallSprites();
```

精灵墙应该从舞台上消失，并将返回到对象池。

这还不能满足我们的实际需示。最简单的方法是从池中请求更多窗口并检查它们是否也出现在屏幕上。让我们从游泳池中再借用九个窗口：

```
main.borrowWallSprites(9);
```

然后再归还：

```
main.returnWallSprites();
```

我们现在从对象池中获得了总共18个精灵。请记住，池中只包含 12 个窗口精灵（6个开灯的，6 个不开灯的）。因此，精灵正在从池中借用并在我们完成后成功返回。如果没有被返还，那么当对象池的内部数组变空时，会报运行时错误。

JavaScript 中的所有内容都可以公开访问，我们可以在任何时候轻松检查对象池的内部数组。尝试从控制台检查数组的大小：

```
main.pool.windows.length
```

这么做应该返回长度 12。现在使用以下方法从池中借用四个窗口精灵：

```
main.borrowWallSprites(4);
```

再次查看池子中的精灵个数：

```
main.pool.windows.length
```

它现在应该只包含 8 个精灵。最后通过调用 `returnWallSprites()` 将精灵集返回池中。再次检查对象池的大小，并确认其长度为 12。

我对咱们的对象池能正常运行感到满意。让我们继续，但保留你添加到 Main 类的测试代码，因为我们很快就会再次使用它。

## 向对象池中添加墙面装饰

目前我们的对象池仅提供窗口精灵，但我们还需要添加对前边缘，后边缘，墙面装饰切片和台阶的支支持。让我们从三个墙面装饰切片开始。

如果你还记得，我们的一些墙上装饰着管道和通风口。这些切片安插在在每个窗口之间。让我们更新我们的 `WallSpritesPool` 类以包含墙面装饰切片。代码与口的对象池非常相似，所以它们看起来都应该很熟悉。

打开 `WallSpritesPool.js` 并在构造函数中进行以下调用：

```
function WallSpritesPool() {
  this.createWindows();
  this.createDecorations(); // 添加
}
```

现在真正来实现 `createDecorations()` 方法：

```
WallSpritesPool.prototype.createWindows = function() {
  this.windows = [];

  this.addWindowSprites(6, "window_01");
  this.addWindowSprites(6, "window_02");

  this.shuffle(this.windows);
};
// 实现
WallSpritesPool.prototype.createDecorations = function() {
  this.decorations = [];

  this.addDecorationSprites(6, "decoration_01");
  this.addDecorationSprites(6, "decoration_02");
  this.addDecorationSprites(6, "decoration_03");

  this.shuffle(this.decorations);
};
```

上面的代码通过调用 `addDecorationSprites()` 方法将 18 个装饰精灵添加到对象池中（稍后我们将实现这个方法）。前六个精灵使用我们的精灵表中的 `decoration_01` 帧。接下来的六个使用 `decoration_02`，最后六个使用 `decoration_03`。然后调用 `shuffle()` 确保精灵随机放置在我们的装饰数组中，我们已将其声明为此类的成员变量，并用于存储墙面装饰精灵。

现在让我们来编写 `addDecorationSprites()` 方法。在 `addWindowSprites()` 方法之后直接添加以下内容：

```
WallSpritesPool.prototype.addWindowSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    this.windows.push(sprite);
  }
};
// 实现
WallSpritesPool.prototype.addDecorationSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    this.decorations.push(sprite);
  }
};
```

现在剩下要做的就是添加两个新方法，允许从对象池借用装饰精灵并返还。方法名称将遵循用于窗口精灵的命名约定。添加 `borrowDecoration()` 和 `returnDecoration()` 方法：

```
WallSpritesPool.prototype.borrowWindow = function() {
  return this.windows.shift();
};
	
WallSpritesPool.prototype.returnWindow = function(sprite) {
  this.windows.push(sprite);
};
// 实现
WallSpritesPool.prototype.borrowDecoration = function() {
  return this.decorations.shift();
};
	
WallSpritesPool.prototype.returnDecoration = function(sprite) {
  this.decorations.push(sprite);
};
```

保存代码。

我们的对象池现在支持窗口和装饰两种切片类型。让我们回到之前添加到 Main类中的测试方法，并测试一切是否正常。

## 对象池的测试

前面我们建造了一面粗糙墙，完全由我们的对象池中的窗口组成。让我们稍微改变我们的测试代码，在每个窗口之间放置装饰切片。这将可以测试到是否真的可以从对象池中借用到窗口切片和装饰切片。

打开 Main.js 并从 `borrowWallSprites()` 方法中删除以下行：

```
Main.prototype.borrowWallSprites = function(num) {
  for (var i = 0; i < num; i++)
  {
    var sprite = this.pool.borrowWindow(); // 删除
    sprite.position.x = -32 + (i * 64);
    sprite.position.y = 128;

    this.wallSlices.push(sprite);

    this.stage.addChild(sprite);
  }
};
```

用下面几行代替：

```
Main.prototype.borrowWallSprites = function(num) {
  for (var i = 0; i < num; i++)
  {
    if (i % 2 == 0) { // 添加
      var sprite = this.pool.borrowWindow(); // 添加
    } else { // 添加
      var sprite = this.pool.borrowDecoration(); // 添加
    } // 添加
    sprite.position.x = -32 + (i * 64);
    sprite.position.y = 192;

    this.wallSlices.push(sprite);

    this.stage.addChild(sprite);
  }
};
```

上面的代码使用模运算符（％）来确保我们在循环的奇数次迭代借用一个窗口精灵，偶数次迭代时借用一个装饰精灵。这个简单的更改允许我们现在生成具有以下模式的测试砖块墙：

```
window, decoration, window, decoration, window, decoration, window
```

现在转到 `returnWallSprites()` 方法并删除以下行：

```
Main.prototype.returnWallSprites = function() {
  for (var i = 0; i < this.wallSlices.length; i++)
  {
    var sprite = this.wallSlices[i]; // 删除
    this.stage.removeChild(sprite);
    this.pool.returnWindow(sprite);
  }

  this.wallSlices = [];
};
```

用下面几行代替：

```
Main.prototype.returnWallSprites = function() {
  for (var i = 0; i < this.wallSlices.length; i++)
  {
    var sprite = this.wallSlices[i];
    this.stage.removeChild(sprite);

    if (i % 2 == 0) { // 添加
      this.pool.returnWindow(sprite); // 添加
    } else { // 添加
      this.pool.returnDecoration(sprite); // 添加
    } // 添加
  }

  this.wallSlices = [];
};
```

我们再次使用了模运算符，这次确保我们将正确的精灵（窗口或装饰）返回给对象池。

保存代码。

刷新浏览器，然后使用 Chrome 的 JavaScript 控制台测试我们的对象池。通过在控制台窗口中输入以下内容来生成测试墙：

```
main.borrowWallSprites(9);
```

如果不出意外，那么你应该看到一个由窗户构成的测试墙，其间插有各种墙壁装饰，如管道和通风口。实际上，你的砖块墙应该类似于下面的图片，它是从我的开发机上截取的。

![tut3-more-object-pool-testing](https://img30.360buyimg.com/devfe/jfs/t1/14835/23/11449/35081/5c8f948eE577f4c48/924d41b53e1f6ded.png)

虽然我们目前只编写了一些简单的测试，但我们所做的并不是为了生成整个游戏地图。

使用以下调用将精灵返还到对象池：

```
main.returnWallSprites();
```

通过对 `borrowWallSprites()` 和 `returnWallSprites()` 进行一些手动调用来验证对象池是否完全正常工作（译者：建议多调用几次验证程序是否正常）。此外，使用控制台检查对象池的窗口和装饰数组的长度是否正常。

## 给你的对象池添加边缘

我们正一步步走向成功。精灵池目前使得我们可以创建一个原始的砖块墙，但它还没有墙的前后边缘。让我们继续添加这些切片类型。

在文本编辑器中打开 `WallSpritesPool.js` 并将以下两行添加到其构造函数中：

```
function WallSpritesPool() {
  this.createWindows();
  this.createDecorations();
  this.createFrontEdges(); // 添加
  this.createBackEdges(); // 添加
}
```

现在添加一个 `createFrontEdges()` 和一个 `createBackEdges()` 方法：

```
WallSpritesPool.prototype.createDecorations = function() {
  this.decorations = [];

  this.addDecorations(6, "decoration_01");
  this.addDecorations(6, "decoration_02");
  this.addDecorations(6, "decoration_03");

  this.shuffle(this.decorations);
};
// 添加
WallSpritesPool.prototype.createFrontEdges = function() {
  this.frontEdges = [];

  this.addFrontEdgeSprites(2, "edge_01");
  this.addFrontEdgeSprites(2, "edge_02");

  this.shuffle(this.frontEdges);
};
// 添加
WallSpritesPool.prototype.createBackEdges = function() {
  this.backEdges = [];

  this.addBackEdgeSprites(2, "edge_01");
  this.addBackEdgeSprites(2, "edge_02");

  this.shuffle(this.backEdges);
};
```

你应该能够轻松地看出来两种方法在干什么。第一个方法创建四个前边缘切片，其中两个使用精灵表的 `edge_01` 帧，另外两个使用 `edge_02`。第二个方法创建四个后边缘切片，并使用精灵表中与前边缘完全相同的帧。

四个前壁边缘可能看起来相当少，但它会绰绰有余，因为即使砖块墙长度很短也至少会占视口一半宽度。换句话说，我们在任何时候都不会使用超过四个前壁边缘。后墙边缘也是如此。

现在继续添加 `addFrontEdgeSprites()` 和 `addBackEdgeSprites()` 方法：

```
WallSpritesPool.prototype.addDecorationSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    this.decorations.push(sprite);
  }
};
// 添加
WallSpritesPool.prototype.addFrontEdgeSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    this.frontEdges.push(sprite);
  }
};
// 添加
WallSpritesPool.prototype.addBackEdgeSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    sprite.anchor.x = 1;
    sprite.scale.x = -1;
    this.backEdges.push(sprite);
  }
};
```

上面的代码没什么特殊的地方，但 `addBackEdgeSprites()` 方法中有几行值得注意：

```
var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
sprite.anchor.x = 1; // 高亮行
sprite.scale.x = -1;// 高亮行
this.backEdges.push(sprite);
```

由于我们使用的是前边缘所使用的相同的精灵帧，我们需要水平翻转后边缘精灵，以便它们适当地贴合在砖块墙的的末端。下图能说明我的意思。它在翻转之前显示后边缘。它与墙跨没有正确连接，看起来不对。

![flipping-wall-edges-1](https://img11.360buyimg.com/devfe/jfs/t1/11227/6/11995/56141/5c8f9805E1ad7c9c8/fd79415b5830ed29.png)

然而，在翻转后的后边缘精灵，会紧贴着砖块墙的末端。如下图。

![flipping-wall-edges-2](https://img11.360buyimg.com/devfe/jfs/t1/20989/3/11470/60426/5c8f984bEf542d99e/fa35da3c1aed568a.png)

翻转精灵很容易。我们只需使用 `PIXI.Sprite` 类的 `scale` 属性即可。 `scale` 属性具有 x 和 y 值，可以调整该值以更改 sprite 的大小。但是，将 `scale.x` 值设置为 -1，我们可以强制精灵水平翻转而不是缩放。

Pixi 的 `PIXI.Sprite` 类还提供了一个 `anchor` 属性，用于定义 `sprite` 的锚点（轴心点）。默认情况下，精灵的锚点在左上角。你可以设置锚点的 x 和 y 位置以调整精灵的锚。`anchor.set()` 方法设置用于 x 和 y 位置的 **比率值**，`0,0` 表示精灵的左上角，`1,1` 表示其右下角。

在我们的教程中只使用默认值，这意味着所有定位都在精灵的左上角。然而，通过水平翻转边缘精灵，我们也翻转了它们的锚点的位置。换句话说，在水平翻转精灵之后，它的原点会改变到它的右上角，这不是我们想要的。为了解决这个问题，我们在将它们水平翻转之前将精灵的原点设置为右上角。这样，翻转后，它将被正确设置到左上角。

好的，现在让我们来编写可以借用边缘并返还给对象池的方法。

```
WallSpritesPool.prototype.returnDecoration = function(sprite) {
  this.decorations.push(sprite);
};
// 添加
WallSpritesPool.prototype.borrowFrontEdge = function() {
  return this.frontEdges.shift();
};

WallSpritesPool.prototype.returnFrontEdge = function(sprite) {
  this.frontEdges.push(sprite);
};

WallSpritesPool.prototype.borrowBackEdge = function() {
  return this.backEdges.shift();
};

WallSpritesPool.prototype.returnBackEdge = function(sprite) {
  this.backEdges.push(sprite);
};
```

保存你的代码。

## 构建第一个完整的砖块墙

我们的精灵池现在支持足够多的垂切片类型，可以用来构建完整的砖块墙了。记住，一块完整的砖块墙包括 **前边缘**，**中间部分** 和 **后边缘**。中间部分至少应包括 **窗户** 和墙壁 **装饰**。一些砖块墙也可能包括一个 **台阶**。

让我们回到 Main 类，并编写一些测试代码，在我们的视口中绘制一个完整的砖块墙。

首先，删除以前的测试方法。打开 Main.js 并删除 `borrowWallSprites()` 和 `returnWallSprites()`。

我们将实现一个名为 `generateTestWallSpan()` 的新方法，用它来生成七个切片宽度的砖块墙。我们将把所有切片存放在一张表里面。首先添加以下内容：

```
Main.prototype.generateTestWallSpan = function() {
  var lookupTable = [
    this.pool.borrowFrontEdge,  // 第一个切片
    this.pool.borrowWindow,     // 第二个切片
    this.pool.borrowDecoration, // 第三个切片
    this.pool.borrowWindow,     // 第四个切片
    this.pool.borrowDecoration, // 第五个切片
    this.pool.borrowWindow,     // 第六个切片
    this.pool.borrowBackEdge    // 第七个切片
  ];
}
```

这张表是一个存放函数引用的数组。数组中的每个索引代表七个切片中的一个。第一个索引表示墙的前边缘，最后一个表示后边缘。中间的指数代表代表墙壁中段的五个切片。

每个索引都包含对构建砖块墙所需的对象池中对应的引用。例如，第一个索引包含对池的 `borrowFrontEdge()` 方法的引用。第二个索引包含对 `borrowWindow()` 的引用，第三个索引包含对 `borrowDecoration()` 的引用。

```
Main.prototype.generateTestWallSpan = function() {
  var lookupTable = [
    this.pool.borrowFrontEdge,  // 1st slice
    this.pool.borrowWindow,     // 2nd slice
    this.pool.borrowDecoration, // 3rd slice
    this.pool.borrowWindow,     // 4th slice
    this.pool.borrowDecoration, // 5th slice
    this.pool.borrowWindow,     // 6th slice
    this.pool.borrowBackEdge    // 7th slice
  ];
  // 添加
  for (var i = 0; i < lookupTable.length; i++)
  {
    var func = lookupTable[i];

    var sprite = func.call(this.pool);
    sprite.position.x = 32 + (i * 64);
    sprite.position.y = 128;

    this.wallSlices.push(sprite);

    this.stage.addChild(sprite);
  }
};
```

在循环内部，我们的代码获取对应切片的借用方法的引用，并将其存储在名为 `func` 的局部变量中：

```
var func = lookupTable[i];
```

一旦我们有了这个正确的引用，就使用以下方法调用它：

```
var sprite = func.call(this.pool);
```

`call()` 是一种原生的 JavaScript 方法，可用来从函数引用调用函数。例如，在循环的第一次迭代中，`func` 变量将指向精灵池的 `borrowFrontEdge()` 方法。因此，调用 `func` 的 `call()` 方法与下面的代码等价：

```
this.pool.borrowFrontEdge()
```

有了生成测试墙的方法，我们也需要编写另一个名为 `clearTestWallSpan()` 的清除墙的方法。此方法将从舞台移除砖块墙并将切片返还到对象池中。

在你的文件中加入下面的代码：

```
Main.prototype.clearTestWallSpan = function() {
  var lookupTable = [
    this.pool.returnFrontEdge,  // 1st slice
    this.pool.returnWindow,     // 2nd slice
    this.pool.returnDecoration, // 3rd slice
    this.pool.returnWindow,     // 4th slice
    this.pool.returnDecoration, // 5th slice
    this.pool.returnWindow,     // 6th slice
    this.pool.returnBackEdge    // 7th slice
  ];

  for (var i = 0; i < lookupTable.length; i++)
  {
    var func = lookupTable[i];
    var sprite = this.wallSlices[i];

    this.stage.removeChild(sprite);
    func.call(this.pool, sprite);
  }

  this.wallSlices = [];
};
```

我们再一次使用了一张表。但是这次我们存储的是对应的切片返还方法的引用。例如，我们知道砖块墙的第一个切片是墙的前边缘。因此，存储在表中的第一个方法是 `returnFrontEdge()`。

另外，请注意，这次使用原生 JavaScript `call()` 方法时，我们将第二个参数传递给它。第二个参数是我们想要返还给池子的精灵。

保存更改并刷新浏览器。让我们看看完整的砖块墙是什么样的。

打开 Chrome 的 JavaScript 控制台并执行生成砖块墙的代码：

```
main.generateTestWallSpan();
```

你应该会看到七个切片宽的砖块墙。还有前后边缘。你的浏览器窗口应类似于下面的屏幕截图。

![wall-span-screenshot-1](https://img10.360buyimg.com/devfe/jfs/t1/31494/17/6527/54099/5c904c26E4099c026/3b44cd4397cdfbee.png)

七个切片都是从我们的对象池中借来的。让我们通过在控制台中输入以下内容来返还它们：

```
main.clearTestWallSpan();
```

切片精灵应该会被从舞台上移除并返回到你的对象池中。

再次生成砖块墙：

```
main.generateTestWallSpan();
```

你会再次看到砖块墙，但这次你看到墙壁上的装饰与上次不同，窗口类型也可能会有所不同，甚至前后边缘的外观也会发生变化。

![wall-span-screenshot-2](https://img11.360buyimg.com/devfe/jfs/t1/20076/19/11507/48534/5c904d00E4af6178d/7fc329522b49ae99.png)

这些差异是由于我们这次借用了不同的墙片造成的。我们之前的切片返回到了每个对象池的数组 **最后面**，而借用的精灵总是来自我们数组的 **前面**。这样效果会比较好，因为玩家很难准确预测从池中获取每个切片类型的样子。它会让我们游戏地图的墙块随机出现，这正是我们想要的。

## 给砖块墙添加台阶

希望你能从上面的实现代码中得到成就感。我们能够使用对象池构建完整的砖块墙。现在剩下要做的就是为对象池添加台阶的支持。让我们继续吧。

返回文本编辑器并确保 `WallSpritesPool.js` 已打开。

添加下面一行到构造函数中。

```
function WallSpritesPool() {
  this.createWindows();
  this.createDecorations();
  this.createFrontEdges();
  this.createBackEdges();
  this.createSteps(); // 添加
}
```

现在来实现 `createSteps()` 方法：

```
WallSpritesPool.prototype.createSteps = function() {
  this.steps = [];
  this.addStepSprites(2, "step_01");
};
```

并且添加一个 `addStepSprites()` 方法：

```
WallSpritesPool.prototype.addStepSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    sprite.anchor.y = 0.25;
    this.steps.push(sprite);
  }
};
```

台阶很少会出现，虽然我们将在精灵池中只使用两个。但说实话，但已经足够了。

此外，就像后边缘切片类型一样，我们使用了 anchor 属性来改变精灵的锚点。这次我们通过向下移动 64 像素来改变锚点的垂直位置。请记住，使用锚属性的值是比率。每个切片的高度为 256 像素，将锚点的 y 位置向下移动 64 个像素对应的比率为 0.25。

那么为什么要改变锚属性呢？好吧，当我们最终实际生成游戏地图时，一定范围的所有切片将使用相同的 y 位置以确保正确对齐。但是，台阶切片位图的设计使其成为特例 — 它将无法与砖块墙的其他切片正确对齐。你可以在下图中发现这种情况，其中所有切片（包括台阶）具有相同的 y 位置并且其锚点设置在左上角。

![wall-step-anchor-1](https://img13.360buyimg.com/devfe/jfs/t1/10525/31/15123/56353/5c905364E8be71317/cf32228b28880ba4.png)

如你所见，台阶的垂直位置显然是不正确的。但是，通过将其锚点向下移动 64 像素，我们可以强制它在砖块墙内正确展示。下图中就是设置过的，其中每个切片（包括台阶）仍然 **共享** 相同的 y 位置，但由于其锚点已被移动，步骤切片现在正确地位于砖块墙内。

![wall-step-anchor-2](https://img30.360buyimg.com/devfe/jfs/t1/24325/19/11530/56607/5c905406Ea283c26c/180e08debc8d1226.png)

现在我们需要做的就是提供允许我们从对象池借用并返回一个步骤的方法。添加以下 `borrowStep()` 和 `returnStep()` 方法：

```
WallSpritesPool.prototype.borrowStep = function() {
  return this.steps.shift();
};

WallSpritesPool.prototype.returnStep = function(sprite) {
  this.steps.push(sprite);
};
```

将更改保存到文件。对象池类现已完成了。

## 测试砖块墙的台阶

这一节的教程即将完成。让我们通过生成包含台阶的测试砖块墙来结束它。

打开 Main.js 并删除 `generateTestWallSpan()` 方法中的代码。将其替换为以下内容：

```
Main.prototype.generateTestWallSpan = function() {
  var lookupTable = [
    this.pool.borrowFrontEdge,  // 1st slice
    this.pool.borrowWindow,     // 2nd slice
    this.pool.borrowDecoration, // 3rd slice
    this.pool.borrowStep,       // 4th slice
    this.pool.borrowWindow,     // 5th slice
    this.pool.borrowBackEdge    // 6th slice
  ];

  var yPos = [
    128, // 1st slice
    128, // 2nd slice
    128, // 3rd slice
    192, // 4th slice
    192, // 5th slice
    192  // 6th slice
  ];

  for (var i = 0; i < lookupTable.length; i++)
  {
    var func = lookupTable[i];

    var sprite = func.call(this.pool);
    sprite.position.x = 64 + (i * 64);
    sprite.position.y = yPos[i];

    this.wallSlices.push(sprite);

    this.stage.addChild(sprite);
  }
};
```

`generateTestWallSpan()` 几乎与前一版相同。这次墙只有六个切片宽，我们还添加了第二个名为 `yPos` 的数组。

如果查看这张表，你将发现第 4 个索引表示台阶切片。请记住，该步骤可让玩家直接跌落到正下方的墙面上。如果你回想一下教程的开头，你应该记住，当我们处理一个步骤时，我们实际处理的是两个连接在一起的独立砖块墙。第一个砖块墙将高于第二个，台阶切片本身将属于第二个砖块墙。

两个砖块墙之间的高度差异由我们的 yPos 数组处理。它对于我们的每个切片都有一个 y 位置。前三个切片 y 都是 128 个像素，而剩余的切片是 192个像素。

让我们转到我们的 `clearTestWallSpan()` 方法。从现有版本的方法中删除代码，并将其替换为以下内容：

```
Main.prototype.clearTestWallSpan = function() {
  var lookupTable = [
    this.pool.returnFrontEdge,  // 1st slice
    this.pool.returnWindow,     // 2nd slice
    this.pool.returnDecoration, // 3rd slice
    this.pool.returnStep,       // 4th slice
    this.pool.returnWindow,     // 5th slice
    this.pool.returnBackEdge    // 6th slice
  ];

  for (var i = 0; i < lookupTable.length; i++)
  {
    var func = lookupTable[i];
    var sprite = this.wallSlices[i];

    this.stage.removeChild(sprite);
    func.call(this.pool, sprite);
  }

  this.wallSlices = [];
};
```

如你所见，表中包含对将每个切片返还到对象池所需的所有方法的引用，包括台阶。

保存更改并刷新浏览器。

在 JavaScript 控制台中输入以下内容：

```
main.generateTestWallSpan();
```

你应该会在屏幕上看到一个带有台阶的墙。它应该看起来像这样：

![wall-step-screenshot](https://img14.360buyimg.com/devfe/jfs/t1/24246/9/11462/69686/5c905719E86dbd531/38dfad19122dfe1f.png)

再返还整个砖块墙给对象池：

```
main.clearTestWallSpan();
```

多试几次生成砖块墙然后返还到对象池，确保一切都正常。

## 整理代码

我们不断地测试对象池，现在它已经成型。为了准备本系列的最后一个教程，我们现在从 Main 类中删除测试代码：

```
Main.prototype.spriteSheetLoaded = function() {
  this.scroller = new Scroller(this.stage);
  requestAnimationFrame(this.update.bind(this));

  this.pool = new WallSpritesPool();
  this.wallSlices = [];
};
```

还要完全删除 `generateTestWallSpan()` 和 `clearTestWallSpan()` 方法。

现在保存你的更改。

## 结语

感谢你能坚持到这里。本教程已经涉及到了大量的内容。我们已经讨论了滚动游戏地图的各种技术点，并了解了为什么选择使用对象池。

虽然本教程很长，但对象池的概念实际上相当简单。不过有人可能会很容易陷入到一些实现细节中，但记住最重要的一点对象池只一个非常简单的 API：有一组从池中借用精灵，另一组返还这些精灵。

我们还学到了更多关于 pixi.js 的知识，包括精灵表和 PIXI.Sprite 类的其它功能。此外，我们也介绍了 GPU 加速的好处，以及为什么使用精灵表可以带来巨大的性能提升。

虽然我们还没有真正地开始构建滚动游戏地图，但我们已经编写了一些代码来生成一些测试砖块墙。这应该有助于你了解如何使用对象池，也可以帮助你熟悉砖块墙的结构和游戏地图。

## 下期预告

下一节中我们将真正的添加流动游戏中的第三层。和前两层不一样，第三层将组成整个游戏地图所需要的砖块墙。这些切片都将从我们的对象池中借取。

与往常一样，GitHub上提供了本系列和之前教程的 [源代码](https://github.com/ccaleb/pixi-parallax-scroller)。

很快你将开始教程的的 第四部分，也是最后一部分。