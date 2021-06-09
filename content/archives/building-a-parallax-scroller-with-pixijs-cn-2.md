+++
title = "使用 Pixi.js 构建一个视差滚动器（第二篇）"
isCJKLanguage = true
categories = ["fe"]
tags = ["game", "pixi.js", "canvas"]
date = "2019-03-17T19:20:04-07:00"
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

在这个系列教程中我们将探索如何构建一个类似 [Canabalt](http://www.adamatomic.com/canabalt/) 和 [Monster Dash](https://chrome.google.com/webstore/detail/monster-dash/cknghehebaconkajgiobncfleofebcog?hl=en) 的视差滚动地图游戏界面。第一篇介绍了 pixi.js 的渲染引擎并且涉及到了视差滚动的基础知识。现在我们将在上一篇的基础之上添加 **视口** 的概念。

### 你将学到什么…

* 如何扩展 pixi.js 的 **展示对象**
* JavaScript 中的面向对象基础（译者使用 ES 6 Class 重构了这个游戏 [源代码](https://github.com/keelii/parallax-scroller-cn)，看起来更直观）
* 如何在你的滚动器中添加 **视口**

### 预备知识…

* 对面向对象有基本的概念
* pixi.js 基础

你将以第一篇教程中的代码为基础，或者直接下载上篇教程中的 [源代码](http://www.yeahbutisitflash.com/?p=5226)，另外整个教程的完全源代码也在 [github](https://github.com/ccaleb/pixi-parallax-scroller/tree/master/tutorial-2) 上可以找到。

[![ps-tut1-screenshot1](https://img10.360buyimg.com/devfe/jfs/t1/25206/13/10616/142679/5c887df7E7c1fa38a/eab39f5f7ab1cc6d.png)](http://www.yeahbutisitflash.com/pixi-parallax-scroller/tutorial-1/index.html)

作为提示，点击上面的图片，将会加载当前版本的视差滚动，目前来说只有两个层，我们将添加每三个更复杂的层。与此同时，我们将通过添加视口的概念来添加第三层。我们还会执行一些重要代码重构，以便将滚动器封装在类中。

虽然本教程非常针对那些对面向对象有基础概念的初学者级别，如这些概念让你感到不舒服，也不用担心，因为我仍然会为那些不熟悉这些枞的的人提供足够的指导。

## 起步

如果你还没有看过第一篇教程，我建议你应该从那篇开始。

还有一点值得提醒的是，为了能够测试你的代码，你需要开启一个本地的 web 服务器。如果你还没有做这一步，那么可能参考上一篇教程中的章节建立好自己的 web 服务器。

## 扩展 pixi.js 的 **展示对象**

正如我们之前发现的，pixi.js 提供了几种可使用的 **展示对象** 类型。如果你还记得的话，我们在使用 `PIXI.extras.TilingSprite` 来满足我们的需求之前，先简单地使用了 `PIXI.Sprite`。

这两个类共享许多公用的功能。例如，它们都为你提供位置（position），宽度（width），高度（height）和 alpha 属性。此外，两者都可以通过 `addChild()` 方法添加到容器中。事实上，`PIXI.Container` 类本身就是一个 **展示对象**，它还提供了许多 Sprite 和 TilingSprite 类都能使用的属性。

所有这些公用的功能都来自于 **继承（inheritance）** 的魔力。它使得类可以继承和扩展功能到其它类上。为了让你能理解它，可以参考下面的示意图，它将为你展示 pixi.js 中提供的大多数展示对象

![ps-tut2-screenshot1](https://img14.360buyimg.com/devfe/jfs/t1/32241/35/6163/21482/5c8c93a6E0674998d/e778a3262a7f0f86.png)

从上面的示意图中，我们可以看出最基础的类型是 PIXI.DisplayObject 类，所有其它类都从它继承而来。这个类是将对象呈现到屏幕所必须需的元素。

> 当我说 **展示对象** 时，并非指 `PIXI.DisplayObject` 这个类。而当使用 `PIXI.DisplayObject` 这个说法时，却表示所有继承自它的对象。本质上讲，当我使用 **展示对象** 这一术语时，我指的是可以通过 pixi.js 呈现给屏幕的 **任何对象**。

下一层是 `PIXI.Container`，它允许对象充当其他展示对象的 **容器**。我们在第一个教程中使用的 `addChild()` 方法是 `PIXI.Container` 这个类提供的实例方法，也可以通过 `PIXI.Sprite` 和 `PIXI.TilingSpite` 继承获得。

本质上讲，继承树中的每个类都是它继承的（父）类的 **更特殊** 版本（译者：面向对象的 **具体化** 与 **泛化** 概念）。好的一点是我们可以使用继承来创建我们自己的自定义的展示对象。换而言之，我们可以为每个视差滚动器中的元素编写专用的类，并让 pixi.js 处理它们就像是处理其它展示对象一样。这给使我们封装代码更简单，代码也更多漂亮、整洁。

### 制作远景层展示对象

让我们开始制作远景层吧。

打开index.html文件，在 `init()` 函数中查找创建和设置图层的代码。这是你要找的东西：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");	
far = new PIXI.extras.TilingSprite(farTexture, 512, 256);
far.position.x = 0;
far.position.y = 0;
far.tilePosition.x = 0;
far.tilePosition.y = 0;
stage.addChild(far);
```

理想的情况是，我们可以创建一个代表远景层的类，并把大部分实现细节隐藏在类中。因此，我们希望找到以下代码，而不是上面的代码：

```
far = new Far();
stage.addChild(far);
```

代码量大幅减少了吧？另外，我认为它比我们原来的尝试更具可读性。

我们通过创建一个代表我们的滚动条远景层的名为 Far 的类来实现这一目标。在项目的根文件夹中创建一个新文件，并将其命名为 `Far.js`。

现在定义一个名为 Far 的函数，它将表示我们类的构造函数：

（译者：原作者使用了 ES 5 和 prototype 来实现 JavaScript 中的继承，看起来可能没那么直观，可以参考我自己实现的 [ES 6 版](https://github.com/keelii/parallax-scroller-cn)的代码）

```
function Far(texture, width, height) {
  PIXI.extras.TilingSprite.call(this, texture, width, height);
}
```

在构造函数下面添加以下行，然后保存文件：

```
Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
```

上面的代码继承了 `PIXI.extras.TilingSprite` 类的功能。

> 构造函数是一种特殊类型的函数，用于创建类实例。在 JavaScript 中，构造函数的名称也用于指定类的名称（译者：ES 6 中的类有专门的 construct 方法）。

那么为什么 Far 类继承自 `PIXI.TilingSprite` 呢？好吧，如果你还记得第一个教程，我们使用 `TilingSprite` 实例来表示每个视差层。因此，在更具体化的类中使用这些功能是有必要的。本质上讲，我们所说的是：Far 类是 `PIXI.extras.TilingSprite` 的一个更特殊的版本。

因为 Far 类继承自 `PIXI.extras.TilingSprite`，所以我们要记得去初始化`TilingSprite` 类的功能。这是通过从构造函数中调用 `TilingSprite` 的构造函数来完成的。我高亮显示了以下代码行：

```
function Far(texture, width, height) {
  PIXI.extras.TilingSprite.call(this, texture, width, height); // 这一行
}

Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
```

这样做是因为我们希望 Far 类继承 `TilingSprite` 的所有功能。由于 `TilingSprite` 需要将三个参数传递给它的构造函数，我们需要确保我们自己的类也接受这些参数并使用它们初始化瓦片精灵。以下是高亮显示参数的类：

```
// 注意 texture, width, height 三个参数
function Far(texture, width, height) {
  PIXI.extras.TilingSprite.call(this, texture, width, height);
}

Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
```

我们还有一些额外的功能可以添加 Far 类中，但实际上已经可以开始将它集成到 `index.html` 页面中了。

### 实例化你的远景（Far）层类

返回你的 `index.html` 页面。

要使用 Far 类，你需要引用它的源文件。在页面正文顶部附近添加以下行：

```
<body onload="init();">
  <div align="center">
    <canvas id="game-canvas" width="512" height="384"></canvas>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.0.0/pixi.min.js"></script>
  <script src="Far.js"></script><!--这里-->
```

现在向下滚动并删除以下行：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
far = new PIXI.extras.TilingSprite(farTexture, 512, 256);  // 删除此行
far.position.x = 0;
far.position.y = 0;
far.tilePosition.x = 0;
far.tilePosition.y = 0;
stage.addChild(far);
```

替换成这样：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
far = new Far(farTexture, 512, 256);  // 新行
far.position.x = 0;
far.position.y = 0;
far.tilePosition.x = 0;
far.tilePosition.y = 0;
stage.addChild(far);
```

好吧，我承认。目前这似乎并没有太大的改进，但我们现在可以开始在 Far 类中直接隐藏更多代码，让我们继续吧。

### 封装位置相关代码

在 `index.html` 中，我们当前设置了 far 层的 `position` 和 `tilePosition` 属性。让我们删除它，并将其封装在我们的 Far 类中。

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
far = new Far(farTexture, 512, 256);
far.position.x = 0;  // 删除
far.position.y = 0;  // 删除
far.tilePosition.x = 0;  // 删除
far.tilePosition.y = 0;  // 删除
stage.addChild(far);
```

保存更改并打开 Far.js 文件。现在直接在类的构造函数中设置图层的位置和tilePosition 属性：

```
function Far(texture, width, height) {
  PIXI.extras.TilingSprite.call(this, texture, width, height);
	
  this.position.x = 0;
  this.position.y = 0;
  this.tilePosition.x = 0;
  this.tilePosition.y = 0;
}
```

如果你不熟悉面向对象的 JavaScript 或面向对象编程，那么你可能会好奇 `this` 关键字在上面的代码中的用途是什么。基本上可以这么理解，它可以让你引用类的已创建实例。通过 `this`，我们可以引用该实例的所有 **属性** 和 **方法**。

因为 Far 类继承自 `PIXI.extras.TilingSprite`，它还具有 `TilingSprite` 的所有 **属性** 和 **方法**，包括 `position` 和 `tilePosition`。要访问这些属性，我们只需使用`this` 关键字。这是再次设置图层 x 位置的代码：

```
this.position.x = 0;
```

还应注意，`this` 关键字还用于引用新添加到类中的属性或方法。

现在保存更改并在浏览器中测试代码。一切都应按预期运行。另外，请查看 Chrome 的 JavaScript 控制台，确保没有错误。

### 封装层的纹理

好的，我们应该从哪里开始呢。如果你回顾一下 index.html 页面，你应该看到代码好像开始变得更加简洁了：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");	
far = new Far(farTexture, 512, 256);
stage.addChild(far);
```

但仍有改进的余地。毕竟，如果我们可以直接在 Far 类中隐藏我们的定位代码，那么为什么我们不能把纹理的逻辑也放在 Far 类中呢？

切换到 `Far.js` 文件并在构造函数的开头添加一行以创建图层的纹理：

```
function Far(texture, width, height) {
  var texture = PIXI.Texture.fromImage("resources/bg-far.png"); // 添加
  PIXI.extras.TilingSprite.call(this, texture, width, height);
```

现在显式地将纹理的宽度和高度传递给 `TilingSprite` 的构造函数：

```
function Far(texture, width, height) {
  var texture = PIXI.Texture.fromImage("resources/bg-far.png");
  PIXI.extras.TilingSprite.call(this, texture, 512, 256); // 512, 256
```

由于我们现在直接在类中处理纹理，因此实际上不需要将纹理，宽度和高度参数传递给构造函数。删除所有三个参数并保存你的代码：

```
function Far(texture, width, height) { // 删除 texture, width, height
```

你的构造函数现在应该是这样：

```
function Far() {
  var texture = PIXI.Texture.fromImage("resources/bg-far.png");
  PIXI.extras.TilingSprite.call(this, texture, 512, 256);

  this.position.x = 0;
  this.position.y = 0;
  this.tilePosition.x = 0;
  this.tilePosition.y = 0;
}
```

剩下要做的就是返回到你的 index.html 文件并删除我们之前创建的纹理并传递给 far的构造函数：

```
var farTexture = PIXI.Texture.fromImage("resources/bg-far.png");
far = new Far(farTexture, 512, 256);
stage.addChild(far);
```

改成这样：

```
far = new Far();
stage.addChild(far);
```

比以前简洁了，对吧？我们所有层的丑陋实现细节现在都安全地隐藏在 Far 类中。

保存 index.html 和 Far.js ，然后在 Chrome 中测试最新版本的代码。

### 同样的方法重构中间层

我花了一些时间引导你完成创建 Far类所需的步骤。该类继承自`PIXI.extras.TilingSprite`，其行为与任何其他 pixi.js 展示对象相同。虽然我们尚未完成，但我们将暂时停止一下并应用我们学到的知识来创建一个代表视差滚动器中的中间层（Mid）的类。

创建一个名为 `Mid.js` 的新文件，并开始向其添加以下代码：

```
function Mid() {
}

Mid.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
```

同样在构造函数中，创建中间层的纹理并设置其定位属性：

```
function Mid() {
  var texture = PIXI.Texture.fromImage("resources/bg-mid.png");
  PIXI.extras.TilingSprite.call(this, texture, 512, 256);

  this.position.x = 0;
  this.position.y = 128;
  this.tilePosition.x = 0;
  this.tilePosition.y = 0;
}

Mid.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
```

保存 Mid.js 文件，然后转到 index.html 并引用 Mid 类的源文件：

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.0.0/pixi.min.js"></script>
<script src="Far.js"></script>
<script src="Mid.js"></script> <!--添加-->
```

完成后，向下滚动到 `init()` 函数并删除以下行：

```
far = new Far();
stage.addChild(far);

var midTexture = PIXI.Texture.fromImage("resources/bg-mid.png"); // 删除
mid = new PIXI.extras.TilingSprite(midTexture, 512, 256);// 删除
mid.position.x = 0;// 删除
mid.position.y = 128;// 删除
mid.tilePosition.x = 0;// 删除
mid.tilePosition.y = 0;// 删除
stage.addChild(mid);
```

用这一行代码替换它们：

```
far = new Far();
stage.addChild(far);

mid = new Mid(); // 此行
stage.addChild(mid);
```

保存 Mid.js 文件并在浏览器中测试最新版本。像往常一样，在运行时检查是否有 JavaScript 错误，并确保滚动器仍然按预期执行。

### 实现一个 update() 方法

我们已经对代码库进行了大量的重构，但仍然有一些事情可以做。返回 index.html 文件，查看动画主更新逻辑。它应该如下所示：

```
function update() {
  far.tilePosition.x -= 0.128;
  mid.tilePosition.x -= 0.64;

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

update 方法中的前两行通过更新其 tilePosition 属性来滚动我们的图层。但是，我们的代码目前存在一些问题：通过直接更改 `tilePosition` 属性，我们将暴露 Mid 和 Far 类的内部 **实现**（译者：类的外部不应该知道类的具体实现细节，只需要控制类的行为）。这违背了面向对象的封装原则。

理想情况下，我们希望在类中隐藏具体细节。如果两个类只有一个实际为我们执行滚动的 `update()` 方法，那么我们的代码会更易读。换句话说，对于我们的主循环来说，这样似乎更合适：

```
function update() {
  far.update();
  mid.update();

  renderer.render(stage);

  requestAnimFrame(update);
}
```

值得庆幸的是，这样的改变是微不足道的。我们将向 Far 类和 Mid 类添加一个 `update()` 方法，每个类都会一点点的滚动。

从 Far 类开始，打开 Far.js 并向其添加以下方法：

```
Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

Far.prototype.update = function() {
  this.tilePosition.x -= 0.128;
};
```

该方法（update）的主体应该看起来很熟悉。它只是将纹理的平铺位置移动 0.128 像素，这正是我们在 index.html 的主循环中所做的。

好的，保存更改并向Mid.js添加类似的方法：

```
Mid.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

Mid.prototype.update = function() {
  this.tilePosition.x -= 0.64;
};
```

两个方法的唯一区别是 Mid 类中的 `update()` 方法的滚动量更多。

保存更改并返回 index.html。现在我们需要做的就是从主循环中调用每个层的 `update()` 方法。删除以下两行代码：

```
function update() {
  far.tilePosition.x -= 0.128; // 删除
  mid.tilePosition.x -= 0.64; // 删除

  renderer.render(stage);

  requestAnimFrame(update);
}
```

替换成：

```
function update() {
  far.update();
  mid.update();

  renderer.render(stage);

  requestAnimFrame(update);
}
```

保存更改并测试，保证 Chrome 中按预期正常运行。

### 停下来思考一下

虽然视差滚动器和以前一样表现正常，但我们实际上已对代码的整体架构进行了一些重大的更改。我们采用了更加面向对象的设计，利用继承创建了两个代表视差层的特殊展示对象。

能够编写特殊的展示对象是一个强大的概念，在许多情况下都能派上用场。我们的 Far 类和 Mid 类都像 pixi.js 支持的任何其他展示对象一样。下图说明了我们的两个特殊类位于 Pixi 展示对象类的继承结构中的位置。

![ps-tut2-screenshot2](https://img13.360buyimg.com/devfe/jfs/t1/27384/39/11126/25797/5c8ca6b2E6fabfee4/0d138469e63570ba.png)

在继续之前，看看你的代码文件并确保我们迄今为止所做的一切都有意义。实际上并没有很多代码，但如果你是面向对象编程的新手，那么完全消化代码所表示的知识可能需要一些时间。

## 建立滚动器（Scroller）类

本教程开头概述的目标之一是将我们的视差滚动器包装到一个类中。现在我们已经编写了 Far 类和 Mid 类，现在我们写一个滚动器类。

这样的话我们就能够从 index.html 中删除 Mid 和 Far **实例**，将它们封装在一个单独的对象中，以满足我们所有的滚动类需要实现的需求。

让我们写一个能够实现我们想法的类。创建一个名为 Scroller.js 的新 JavaScript 文件，并通过向其添加以下代码来定义名为 Scroller 的类：

```
function Scroller(stage) {
}
```

关于这个类，有两点值得注意。首先，它的构造函数需要引用我们的舞台（Pixi.Container）。其次，它不会继承任何东西。

与 Far 和 Mid 类不同，我们的 Scroller 类不是特殊的展示对象。相反，它将使用构造函数的 stage 参数添加我们的 远景层和中间层实例。（译者：Scroller 类只起到封装和控制作用，并不用继承任何 Pixi 中的类）

让我们先在类中添加远景层的实例：

```
function Scroller(stage) {
  this.far = new Far();
  stage.addChild(this.far);
}
```

第一行代码创建了 Far 类的实例。请注意，我们将实例存储在名为 `far` 的 `成员变量` 中。

> **成员变量** 是通过 this 关键字直接向类添加 **属性** 来创建的。成员变量具有在类实例的整个生命周期中持久化可见的优点，这意味着类的任何其他方法也可以访问它。

第二行将远景层实例添加到舞台。

现在让我们为中间层做同样的事情。将以下两行添加到构造函数中：

```
function Scroller(stage) {
  this.far = new Far();
  stage.addChild(this.far);

  this.mid = new Mid();
  stage.addChild(this.mid);
}
```

现在 Scroller 类中有两个成员变量：`far` 和 `mid`。这是很有用，因为它允许我们从类中的任何其他方法中访问我们的视差层。这也很方便，因为我们确实需要添加一个额外的方法。它将用于更新两个层的位置。我们现在继续添加此方法（update）：

```
function Scroller(stage) {
  this.far = new Far();
  stage.addChild(this.far);

  this.mid = new Mid();
  stage.addChild(this.mid);
}

Scroller.prototype.update = function() {
  this.far.update();
  this.mid.update();
};
```

还记得我们为 Mid 和 Far 类编写了 `update()` 方法吗？在我们的 Scroller 类自己的 `update()` 方法需要做的就是调用这些更新方法。

### 插入 Scroller 类

现在 Scroller 类可以表示我们的视差滚动器了，我们可以回到 index.html 页面并将其插入。

打开 index.html 并引用 Scroller.js：

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.0.0/pixi.min.js"></script>
<script src="Far.js"></script>
<script src="Mid.js"></script>
<script src="Scroller.js"></script>
```

现在向下移动到 `init()` 函数并删除以下代码行：

```
function init() {
  stage = new PIXI.Stage(0x66FF99);
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  far = new Far(); // 删除
  stage.addChild(far); // 删除

  mid = new Mid(); // 删除
  stage.addChild(mid); // 删除

  requestAnimationFrame(update);
}
```

请记住，远景层和中间层现在都由 Scroller 类处理。因此，我们需要创建一个Scroller 实例来替换我们刚删除的行：

```
function init() {
  stage = new PIXI.Stage(0x66FF99);
  renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  scroller = new Scroller(stage); // 实例化 Scroller

  requestAnimationFrame(update);
}
```

另请注意，我们将 stage 引用传递给 Scroller 类的构造函数。这样做非常重要，因为 Scroller 类需要这个引用才能将 远景层和中间层添加到 **展示列表** 中。

现在需要做的就是在主循环中调用 scroller 的 `update()` 方法。首先，从主循环中删除以下两行：

```
function update() {
  far.update(); // 删除
  mid.update(); // 删除

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

现在添加以下行来更新滚动器：

```
function update() {
  scroller.update(); // 添加

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

保存更改并使用 Chrome 测试所有内容。一如既往地在 JavaScript 控制台中查找是否有错误，如果有，请仔细检查你的代码。

我们已经成功地重新构建了视差滚动，以便所有内容都包含在一个类中。如果你查看 index.html，你会发现我们已经隐藏了我们上次在第一篇教程中写的所有实现代码。

## 添加视口（viewport）

我们已经取得了巨大的进步，但还有一件事我们做。为了使我们的滚动条完整，需要添加 **视口** 的概念。将视口视为一个查看游戏地图的窗口。

你可能会问「我们不是已经有一个视口了吗？」是的，毕竟，当你在浏览器中运行代码时，我们只能看到在舞台边界内可以看到的内容。这是似乎就是一个视口了，但是我们还没有办法知道我们在游戏世界中 **滚动了多远**（译者：需要实现视口是因为后续会涉及到地图的概念，地图中游戏场景是有长度、距离的概念的，这就方便我们实现一些特殊场景，比如落箱子，障碍物等。因为不引用视口的概念游戏将是无限循环滚动的。这会导致计算距离变得很复杂，而且无法将地图设计成一种具体的抽象）。另外，如果我们可以简单地跳到某个位置并确切地看到我们的图层应该如何看起来，那不是很好吗？一旦我们添加了视口的概念并提供了设置其当前位置的方法，那么一切都将成为可能。

### 给 Scroller 类添加 setViewportX 方法

目前我们有一个 `update()` 方法，我们用它来连续滚动我们的视差层。可以使用一个名为 `setViewportX()` 的新方法替换它，我们可以用它来设置视口的水平位置。调用此方法将让我们随意定位我们的游戏地图。

让我们从 Scroller 类开始。

打开 Scroller.js 并删除现有的 `update()` 方法：

```
function Scroller(stage) {
  this.far = new Far();
  stage.addChild(this.far);

  this.mid = new Mid();
  stage.addChild(this.mid);
}

Scroller.prototype.update = function() { // 删除
  this.far.update();// 删除
  this.mid.update();// 删除
};// 删除
```

我们的 `setViewportX()` 方法非常简单。它期望将一个数字作为方法的 viewportX 参数传递，然后将该值传递给我们的每个层。显然，我们的图层都需要实现自己的 `setViewportX()` 方法。让我们继续吧，现在就去做吧。

### 给 Far 类添加 setViewportX 方法

我们首先删除类中的现有 `update()` 方法。打开 Far.js 并删除以下行：

```
function Far() {
  var texture = PIXI.Texture.fromImage("resources/bg-far.png");
  PIXI.extras.TilingSprite.call(this, texture, 512, 256);

  this.position.x = 0;
  this.position.y = 0;
  this.tilePosition.x = 0;
  this.tilePosition.y = 0;
}

Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

Far.prototype.update = function() { // 删除
  this.tilePosition.x -= 0.128; // 删除
}; // 删除
```

我们需要能够跟踪视口的水平位置。为此，我们在类的构造函数中定义新的成员变量：

```
function Far() {
  var texture = PIXI.Texture.fromImage("resources/bg-far.png");
  PIXI.extras.TilingSprite.call(this, texture, 512, 256);

  this.position.x = 0;
  this.position.y = 0;
  this.tilePosition.x = 0;
  this.tilePosition.y = 0;

  this.viewportX = 0; // 新的成员变量
}
```

再添加一个类的 **静态常量**（`DELTA_X`）：

```
Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

Far.DELTA_X = 0.128;
```

DELTA_X 常量的值看起来应该很熟悉。它是我们之前在每次调用 `update()` 时移动图层的 tilePosition 的像素数。显然，使用常量会使我们的代码更具可读性和可维护性，这就是我们选择使用常量的原因。基本上，每当我们的视口移动一个单元时，我们将使用常量将远景层移动 0.128 像素。所以现在让我们编写一个 `setViewportX()` 方法，添加以下内容：

```
Far.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

Far.DELTA_X = 0.128;

Far.prototype.setViewportX = function(newViewportX) {
  var distanceTravelled = newViewportX - this.viewportX;
  this.viewportX = newViewportX;
  this.tilePosition.x -= (distanceTravelled * Far.DELTA_X);
};
```

上面的代码并不难理解。首先，我们计算自从上次调用 `setViewportX()` 以来的滚动的距离。然后视口的新水平位置存储在我们的 `viewportX` 成员变量中。最后，我们乘以 DELTA_X 常数，以确定将图层的瓦片移动了多远。

> 应该注意，我们的 x 位置代表视口窗口的左侧。在其他实现中，x 位置代表视口的中心也很常见。

保存最新版本的 `Far.js`。

现在我们需要对 `Mid` 类进行相同的更改。

### 给 Mid 类添加 setViewportX 方法

Mid 类的代码几乎与 Far 类相同，所以我们能快速写出来。

打开 Mid.js 并删除其 `update()` 方法、并添加 `setViewportX` 方法：

```
function Mid() {
  var texture = PIXI.Texture.fromImage("resources/bg-mid.png");
  PIXI.extras.TilingSprite.call(this, texture, 512, 256);

  this.position.x = 0;
  this.position.y = 128;
  this.tilePosition.x = 0;
  this.tilePosition.y = 0;

  this.viewportX = 0;
}

Mid.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

Mid.DELTA_X = 0.64;

Mid.prototype.setViewportX = function(newViewportX) {
  var distanceTravelled = newViewportX - this.viewportX;
  this.viewportX = newViewportX;
  this.tilePosition.x -= (distanceTravelled * Mid.DELTA_X);
};
```

这两个类之间的唯一区别是 Mid 类的 DELTA_X 常量值为 `0.64`，这是为了确保图层的滚动速度比 far 层快。保存更改。

### 测试视口

我们应该测试视口并确保设置其位置反映在我们的视差层中。首先，我们需要打开 index.html 并删除 scrolller  的 `update()` 方法：

```
function update() {
  scroller.update(); // 删除

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

保存 index.html 文件并在浏览器中测试更改。你应该注意到你只能看见视差层，但都没有滚动。那是因为我们没有添加任何代码来真正更改视口的水平位置。目前它固定在默认的 x 位置 0。

在我们添加代码之前，我们可以在 Chrome 的 JavaScript 控制台中测试一下我们的滚动条的 `setViewportX()` 实际上是有效的。

```
scroller.setViewportX(50); /// 控制台中调用
```

> JavaScript 控制台可以访问程序中的任何全局变量。因此，我们可以通过全局 `scroller` 变量访问滚动条并调用其 `setViewportX()` 方法。

你应该看到视差图层向左移动，这表示我们已成功重新定位了视口。

尝试将视口移动到 x = 7000 的位置 ：

```
scroller.setViewportX(7000);
```

### 滚动视口

很明显，我们可以通过不断更新滚动器的视口位置来模拟游戏世界中的移动。我们可以在主循环中执行此操作，但是我们得够获取视口的当前水平位置。让我们继续为 `Scroller` 类添加一个新方法。

### 获取视口的位置

目前来讲我们的 Scroller 类并没存储当前视口位置，我们需要一个成员变量来实现它。

打开 Scroller.js 并在构造函数中定义以下成员变量：

```
function Scroller(stage) {
  this.far = new Far();
  stage.addChild(this.far);

  this.mid = new Mid();
  stage.addChild(this.mid);

  this.viewportX = 0; // 水平滚动量
}
```

并在 `setViewportX()` 方法中更新 `viewportX` 成员变量的值：

```
Scroller.prototype.setViewportX = function(viewportX) {
  this.viewportX = viewportX; // 更新
  this.far.setViewportX(viewportX);
  this.mid.setViewportX(viewportX);
};
```

完成后，我们可以编写一个 `getViewportX()` 方法，该方法将返回视口的当前位置：

```
Scroller.prototype.setViewportX = function(viewportX) {
  this.viewportX = viewportX;
  this.far.setViewportX(viewportX);
  this.mid.setViewportX(viewportX);
};
// 新方法
Scroller.prototype.getViewportX = function() {
  return this.viewportX;
};
```

保存你的代码。

### 更新主循环

现在要做的就是不断更新滚动器的视口位置。我们将在主循环中执行此操作。

打开 index.html，只需添加以下两行代码：

```
function update() {
  var newViewportX = scroller.getViewportX() + 5; // 添加
  scroller.setViewportX(newViewportX); // 添加
            
  renderer.render(stage);

  requestAnimationFrame(update);
}
```

第一行获取视口的 x 位置并将其增加 5 个单位。第二行采用新值并更新视口的当前 x 位置。从本质上讲，它会强制视口在每次调用主循环时滚动 5 个单位。

保存代码并在 Chrome 中运行它。你应该会再一次看到视差层向外滚动。试试不同的滚动速度看。例如，将视口增加 15 个单位而不是 5 个单位。

### 移动视口

让我们在 Scroller 类中再添加一个方法 `moveViewportXBy`，可以将视口从其当前位置移动指定的距离。这将让主循环看起来更加简洁。

在保存更改之前，打开 Scroller.js 并添加以下方法：

```
Scroller.prototype.getViewportX = function() {
  return this.viewportX;
};
// 添加新方法
Scroller.prototype.moveViewportXBy = function(units) {
  var newViewportX = this.viewportX + units;
  this.setViewportX(newViewportX);
};
```

就像我们之前做过的一样，这个新方法不难理解。它只是计算出视口的新位置然后调用类的 `setViewportX()` 方法来实际设置视口位置。

移回 index.html 并删除以下行：

```
function update() {
  var newViewportX = scroller.getViewportX() + 5; // 删除
  scroller.setViewportX(newViewportX); // 删除

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

用 `moveViewportXBy()` 方法的单行替换它们：

```
function update() {
  scroller.moveViewportXBy(5); // 调用新的方法

  renderer.render(stage);

  requestAnimationFrame(update);
}
```

保存更改并在 Web 浏览器中测试更改。

## 回顾程序的主入口

本系列教程的第二部分即将结束。在我们完成之前，让我们回顾下 index.html 并做最后一个重构。

虽然我们已经完成了减少对全局变量的依赖的这样一项令人敬重的工作，但我们的 index.html 文件仍然有一些零散的全局变量。实际上，在大型应用程序中，将尽可能多的 JavaScript 与 HTML 页面分开也是一种很好的做法。虽然我们的 HTML 页面中没有多少 JavaScript，但我们可以做得更好。让我们把代码单独封装在一个与自己类名相同的文件中。这样，我们当前所依赖的全局变量将封装到类的成员变量中。

创建一个新文件并将其命名为 `Main.js`。

为类创建构造函数，并将HTML页面的 `init()` 函数中的代码放入其中：

```
function Main() {
  this.stage = new PIXI.Container();
  this.renderer = PIXI.autoDetectRenderer(
    512,
    384,
    {view:document.getElementById("game-canvas")}
  );

  this.scroller = new Scroller(this.stage);

  requestAnimationFrame(this.update.bind(this));
}
```

注意上面使用 `this` 关键字。我们使用它来定义 `stage`，`renderer` 和 `scroller` 作为成员变量。

`this` 关键字也用于调用 JavaScript 函数 `requestAnimationFrame()`。代码大概是这样：

```
requestAnimationFrame(this.update.bind(this));
```

这里使用它来指定我们的类名为 `update()` 的方法（我们仍然要写这个方法）将在下一次重绘时调用。另外，还调用另一个你可能不熟悉的名为 `bind()` 的JavaScript 函数。它用来保证在调用 `update()` 时它正确地访问到 Main 类的实例。如果不用 `bind()`，`update()` 方法将无法访问和使用任何 Main 类的成员变量。

好吧，让我们实际编写我们的类的 `update()` 方法。它将只包含我们原来 HTML 页面的 `update()` 函数中的代码：

```
Main.prototype.update = function() {
  this.scroller.moveViewportXBy(Main.SCROLL_SPEED);
  this.renderer.render(this.stage);
  requestAnimationFrame(this.update.bind(this));
};
```

我们再次使用了 `this` 关键字，而且利用了JavaScript 的 `bind()` 函数来确保我们的更新循环始终在正确的作用域下。

另外，请注意上面的代码在调用 scrolller 的 `moveViewportXBy()` 方法时使用了一个名为 `SCROLL_SPEED` 的常量。以前我们刚刚传递了一个硬编码值。我们实际可以将该常量添加到 Main 类中做为静态常量。在构造函数后面直接添加以下行：

```
  requestAnimationFrame(this.update.bind(this));
}

Main.SCROLL_SPEED = 5; // 添加

Main.prototype.update = function() {
```

好的，保存你的代码。

现在让我们打开 index.html 并删除以前的老代码。

删除以下行：

```
<!-- 全部删除 -->
<script>
  function init() {
    stage = new PIXI.Container();
    renderer = PIXI.autoDetectRenderer(
      512,
      384,
      {view:document.getElementById("game-canvas")}
    );

    scroller = new Scroller(stage);

    requestAnimationFrame(update);
  }

  function update() {
    scroller.moveViewportXBy(5);

    renderer.render(stage);

    requestAnimationFrame(update);
  }
</script>
```

用一个简单的实例化 Main 类的新 `init()` 函数代替：

```
<script>
  function init() {
    main = new Main();
  }
</script>
```

最后，通过添加以下行来引用到类 ：

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.0.0/pixi.min.js"></script>
<script src="Far.js"></script>
<script src="Mid.js"></script>
<script src="Scroller.js"></script>
<script src="Main.js"></script> <!-- 添加 -->
```

保存你的工作并测试仍在 Google Chrome 中运行的所有内容。

我们已经成功地将所有内容都移到了一个主应用程序类中，而 index.html中只剩下几行 JavaScript 来解决所有问题。

## 结语

哇哦！我们这一节涉及到了很多内容。虽然最终结果是相同的（我们仍然只有两个滚动视差层），但我希望你能看到重构代码的好处。现在一切都比干净了很多，我们有一个用于管理视差层的 Scroller 类。虽然这次我们的重点不是 pixi.js，但你至少应该体会到扩展 Pixi 展示对象类的好处。

## 下集预告…

所有这些变化都处于理想的位置，可以在此基础上开发第三个更复杂的视差层了。这个图层将作为游戏世界的 地图，并将由一系列 **精灵** 构建，而不是简单的重复纹理。我们将把目标放在 pixi.js 上，将涉及各种各样的好东西，包括精灵表（Spritesheet），纹理帧（texture frames）和对象池（object pooling）。

记得 [GitHub](https://github.com/ccaleb/pixi-parallax-scroller) 上提供了本系列和本系列教程的源代码哦。

[第三部分](http://keelii.com) 见。