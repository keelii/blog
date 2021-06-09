+++
title = "使用 Pixi.js 构建一个视差滚动器（第四篇）"
isCJKLanguage = true
categories = ["fe"]
draft=true
tags = ["game", "pixi.js", "canvas"]
date = "2019-03-17T19:20:04-07:00"
+++

## 翻译对照

原文： [PART 1](http://www.yeahbutisitflash.com/?p=5226)・ [PART 2](http://www.yeahbutisitflash.com/?p=5666)・ [PART 3](http://www.yeahbutisitflash.com/?p=6496)・ [PART 4](http://www.yeahbutisitflash.com/?p=7046)

译文： [第一篇](/2019/03/16/building-a-parallax-scroller-with-pixijs-cn-1/)・ [第二篇](/2019/03/17/building-a-parallax-scroller-with-pixijs-cn-2/)・ 第三篇・ 第四篇

---

关注 [@chriscaleb](https://twitter.com/intent/follow?screen_name=chriscaleb)

这个系列的教程已经更新到了 [PixiJS v4](http://www.pixijs.com/) 版本。

欢迎阅读本系列教程的第四篇也是最后一篇教程，本节教程将详细介绍如何使用 JavaScript 和 pixi.js 构建视差滚动地图。上一个教程中，我们实现一个 **对象池** 并学习如何使用精灵表来编写滚动器的前景层。今天我们将构建前景层并编写实码以现代在视口中滚动游戏地图。

### 你将学到什么…

* 如何在内存中展示一个游戏地图
* 如何展示或者滚动控制一个大地图
* 如何扩展 pixi.js 的 **展示对象**
* 构建游戏地图所需的实现的代码

### 预备知识…

* 如何建立和使用对象池子
* 了解 JavaScript 或者 ActionScript 的基础知识
* 对面向对象有基本的概念

我们将以上几节内空为基础。继续使用你在前三个教程中编写的代码。不过，你仍然可以从 GitHub 下载第三个教程的 [源代码](https://github.com/ccaleb/pixi-parallax-scroller) 并从那里开始工作。

最后，我们构建一个滚动的游戏地图，效果与 Half Brick 的优秀 Monster Dash 游戏中的游戏地图相同。我们的地图将由一系列不同高度和宽度的砖块墙构建而成，我们将利用对象池来检索构成每个砖块墙的单个切片。我们还会通过逐渐增加地图的滚动速度来增加一些变化，就像 Monster Dash 一样。

[![ps-tut1-screenshot4](https://img10.360buyimg.com/devfe/jfs/t1/14760/32/11646/142679/5c90c651E0879ffeb/545e53522ea99c6f.png)](http://www.yeahbutisitflash.com/pixi-parallax-scroller/tutorial-4/index.html)

我们的滚动器的最终版本可以在上面的链接中找到。只需单击图像即可查看其中的内容。

## 起步

如果您还没有完成前三个教程（[part 1](http://www.yeahbutisitflash.com/?p=5226), [part 2](http://www.yeahbutisitflash.com/?p=5666), [part 3](http://www.yeahbutisitflash.com/?p=6496)），那么我建议您在继续之前完成前三节。

上之前一样，为了能够测试你的代码，你需要开启一个本地的 web 服务器。如果你还没有做这一步，那么可能参考上一篇教程中的章节建立好自己的 web 服务器。

就像上一个教程一样，你需要留出大约两个小时来完成这一节内容。

## 砖块墙切片类型

我们已经介绍了构成前景层地图的各种切片类型。我们再次复习一下：

* 前边缘
* 后边缘
* 台阶
* 装饰
* 窗口

下图中表示每种切片类型：

让我们编写一个名为 `SliceType` 的简单类，它存储表示每个切片类型的常量。另外，我们将添加一个切片类型：墙间隙。墙间隙其实就是个透明的切片，用于在不同的砖块墙之间添加空间。

打开文本编辑器并创建一个新文件。添加以下内容：

```
function SliceType() {}

SliceType.FRONT      = 0;
SliceType.BACK       = 1;
SliceType.STEP       = 2;
SliceType.DECORATION = 3;
SliceType.WINDOW     = 4;
SliceType.GAP        = 5;
```

保存并命名为 SliceType.js。

每个常量都有一个分配给它的整数，从零开始。这很重要，因为它可以让我们在代码中使用这些常量来创建和访问查找表（lookupTable）。

> 我们的查找表将由数组表示，这些数组当然是基于零索引的。

不要忘记在项目中引用类源文件。转到 index.html 文件并添加以下行：

```
<script src="WallSpritesPool.js"></script>
<script src="SliceType.js"></script><!-- 添加 -->
<script src="Main.js"></script>
```

保存更新。

## 开始前景层的制作

现在让我们来创建滚动器的前景层类。

就像远景层一样，我们的前景层将继承 Pixi  **展示对象** 功能。前两层是 `PIXI.extras.TilingSprite` 的特殊版本，而前景层将继承自 `PIXI.Container`。它不需要 Pixi 的瓦片（平铺）精灵的功能，所以我们选择了 PIXI.Container。

`PIXI.Container` 类为我们提供了足够的功能，允许我们将前景类添加到 Pixi 的展示列表中，就像任何其他显示对象一样。

我们的前景层实际上就代表游戏地图。由于我们的游戏地图由一系列砖块墙组成，我们将其命名为 `Walls`

当然，还有各种其他名称，包括：`Front` 和 `Map`。但是，考虑到本教程前景层所代表的内容，`Walls` 感觉更合适。

好的，让我们首先创建一个新文件并添加以下内容：

```
function Walls() {
  PIXI.Container.call(this);
}

Walls.prototype = Object.create(PIXI.Container.prototype);
```

保存文件命名为 `Walls.js`

除了从 `PIXI.Container` 继承之外，目前我们的类并没有做别的事情。在我们开始之前，首先将它引用到项目中，并将它连接到我们的远景层和中间层所在的 Scroller 类。

打开 index.html 文件，添加如下行：

```
<script src="SliceType.js"></script>
<script src="Walls.js"></script> <!-- 添加 -->
<script src="Main.js"></script>
```

保存变更。

现在打开 `Scroller.js` 并在其构造函数中实例化 `Walls` 类。然后，将实例添加到展示列表：

```
function Scroller(stage) {
  this.far = new Far();
  stage.addChild(this.far);

  this.mid = new Mid();
  stage.addChild(this.mid);

  this.front = new Walls(); // 添加
  stage.addChild(this.front); // 添加

  this.viewportX = 0;
}
```

再次，保存变更。

## 集成到对象池中

Walls类将大量使用您的对象池。请记住，您的对象池允许您借用壁切片精灵并在完成后将它们返回池中。例如，如果您构建的是包含窗口的墙，则可以通过调用其 `borrowWindow()` 方法从对象池中获取窗口精灵。当你不再使用窗口精灵，就可以通过调用 `returnWindow()` 将它返还到池子中。其他切片类型在对象池中也具有对应的方法。

在 `Walls` 类中创建一个对象池的实例。打开 Walls.js 并添加以下行：

```
function Walls() {
  PIXI.Container.call(this);

  this.pool = new WallSpritesPool();
}
```

保存更改

## 查找表

在上一个教程中，我们使用了两个查找表来辅助构建砖块墙。第一个查找表包含对构建指定砖块墙所需的「借用」方法的引用。另一个表保存了对每个切片精灵「返还」给池子所需方法的引用。

我们将写一些类似的东西，但它将以通用的方式编写，而不是只针对某个特定砖块墙。第一个查找表将包含对对象池的五个「借用」方法的引用（一个切片类型对应一个）。第二个表将保存对池的五个「返回」方法的引用。这种方法来管理墙切片借用和返回更方便。

让我们编写一个简单的方法来设置两个查找表。将以下内容添加到 Walls.js：

```
Walls.prototype = Object.create(PIXI.Container.prototype);
// 添加
Walls.prototype.createLookupTables = function() {
  this.borrowWallSpriteLookup = [];
  this.borrowWallSpriteLookup[SliceType.FRONT] = this.pool.borrowFrontEdge;
  this.borrowWallSpriteLookup[SliceType.BACK] = this.pool.borrowBackEdge;
  this.borrowWallSpriteLookup[SliceType.STEP] = this.pool.borrowStep;
  this.borrowWallSpriteLookup[SliceType.DECORATION] = this.pool.borrowDecoration;
  this.borrowWallSpriteLookup[SliceType.WINDOW] = this.pool.borrowWindow;

  this.returnWallSpriteLookup = [];
  this.returnWallSpriteLookup[SliceType.FRONT] = this.pool.returnFrontEdge;
  this.returnWallSpriteLookup[SliceType.BACK] = this.pool.returnBackEdge;
  this.returnWallSpriteLookup[SliceType.STEP] = this.pool.returnStep;
  this.returnWallSpriteLookup[SliceType.DECORATION] = this.pool.returnDecoration;
  this.returnWallSpriteLookup[SliceType.WINDOW] = this.pool.returnWindow;
};
```

在上面的方法中，我们创建了两个成员变量。第一个，`borrowWallSpriteLookup` 是一个数组，它保存对每个对象池的「借用」方法。第二个，`returnWallSpriteLookup` 也是一个数组，它保存对每个对象池的「返还」方法的引用。

请注意我们使用 `SliceType` 类的常量来索引每个对象池的方法。例如，我们使用 `SliceType.FRONT` 在查找表的数组中的索引位置 `0` 对对象池的 `borrowFrontEdge()` 方法进行引用：

```
this.borrowWallSpriteLookup[SliceType.FRONT] = this.pool.borrowFrontEdge;
```

我们将在本教程后面使用 `SliceType` 类的常量来访问并在渲染前景层的内容时调用正确的「借用」和「返回」方法。事实上，我们会用少量时间编写两种方法来帮助我们做到这一点。但首先，让我们确保通过从类的构造函数中调用 `createLookupTables()` 来创建查找表。

```
function Walls() {
  PIXI.Container.call(this);

  this.pool = new WallSpritesPool();
  this.createLookupTables(); // 添加
}
```

## 借用/返还切片的辅助方法

现在我们有两个查找表，可以编写两个非常简单的辅助方法：一个允许我们从对象池中借用一个特定的切片精灵，另一个允许我们将一个切片精灵返还到池中。

在 Walls.js 类的末尾添加以下两个方法：

```
Walls.prototype.borrowWallSprite = function(sliceType) {
  return this.borrowWallSpriteLookup[sliceType].call(this.pool);
};

Walls.prototype.returnWallSprite = function(sliceType, sliceSprite) {
  return this.returnWallSpriteLookup[sliceType].call(this.pool, sliceSprite);
};
```

第一个方法，`borrowWallSprite()`，将一个切片类型作为参数，并从对象池返回该类型的精灵。第二个是 `returnWallSprite()`，它需要两个参数：一个切片类型，一个先前借用的精灵类型。它接受精灵并将其返回给对象池。如果查看两种方法的实现，两个方法都需要传入切片类型用于查找或者调用对象池中的方法。

## 测试借用和返还墙壁的方法