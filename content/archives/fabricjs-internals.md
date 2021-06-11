+++
title = "Fabric.js 原理与源码解析"
isCJKLanguage = true
categories = ["fe"]
tags = ["fabric.js", "canvas"]
date = "2021-05-08T19:20:04-07:00"
+++

## Fabric.js 简介

我们先来看看官方的定义：

> Fabric.js is a framework that makes it easy to work with HTML5 canvas element.
> It is an interactive object model on top of canvas element. It is also an
> SVG-to-canvas parser.
>
> [Fabric.js](http://fabricjs.com/) 是一个可以让 HTML5 Canvas 开发变得简单的框架
> 。 它是一种基于 Canvas 元素的 **可交互** 对象模型，也是一个 SVG 到 Canvas 的解
> 析器（让SVG 渲染到 Canvas 上）。

Fabric.js 的代码不算多，源代码（不包括内置的三方依赖）大概 1.7 万行。最初是
在 2010 年开发的， 从源代码就可以看出来，都是很老的代码写法。没有构建工具，没有
依赖，甚至没使用 ES 6，代码中模块都是 用 IIFE 的方式包装的。

但是这个并不影响我们学习它，相反正因为它没引入太多的概念，使用起来相当方便。不需
要构建工具，直接在 一个 HTML 文件中引入库文件就可以开发了。甚至官方都提供了一个
HTML 模板代码：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://rawgit.com/fabricjs/fabric.js/master/dist/fabric.js"></script>
  </head>
  <body>
    <canvas id="c" width="300" height="300" style="border:1px solid #ccc"></canvas>
    <script>
      (function() {
        var canvas = new fabric.Canvas('c');
      })();
    </script>
  </body>
</html>
```

这就够了不是吗？

## 使用场景

从它的官方定义可以看出来，它是一个用 Canvas 实现的对象模型。如果你需要用 HTML
Canvas 来绘制一些东西，并且这些东西可以响应用户的交互，比如：拖动、变形、旋转等
操作。 那用 fabric.js 是非常合适的，因为它内部不仅实现了 Canvas 对象模型，还将一
些常用的交互操作封装好了，可以说是开箱即用。

内部集成的主要功能如下：

* 几何图形绘制，如：形状（圆形、方形、三角形）、路径
* 位图加载、滤镜
* 自由画笔工具，笔刷
* 文本、富文本渲染
* 模式图像
* 对象动画
* Canvas 对象之间的序列化与反序列化

## Canvas 开发原理

如果你之前没有过 Canvas 的相关开发经验（只有 JavaScript 网页开发经验），刚开始
入 门会觉得不好懂，不理解 Canvas 开发的逻辑。这个很正常，因为这表示你正在从传统
的 JavaScript 开发转到图形图像 GUI 图形图像、动画开发。 虽然语言都是 JavaScript
但是开发理念和用到的编程范式完全不同。

* 传统的客户端 JavaScript 开发一般可以认为是 **事件驱动的编程模型**
  (Event-driven programming)，这个时候你需要关注事件的触发者和监听者
* Canvas 开发通常是 **面向对象的编程模型**，需要把绘制的物体抽象为对象，通过对
  象的方法维护自身的属性，通常会使用一个全局的事件总线来处理对象之间的交互

这两种开发方式各有各的优势，比如：

* 有的功能在 HTML 里一行代码就能实现的功能放到 Canvas 中需要成千行的代码去实现。
  比如：textarea, contenteditable
* 相反，有的功能在 Canvas 里面只需要一行代码实现的，使用 HTML 却几乎无法实现。比
  如：截图、录制

Canvas 开发的本质其实很简单，想像下面这种少儿画板：

![少儿画板](https://img13.360buyimg.com/imagetools/jfs/t1/186464/5/6555/128945/60bf3d25Eb3e8db9e/a186c17daa11cf56.png)

Canvas 的渲染过程就是不断的在画板（Canvas）上面擦了画，画了擦。

动画就更简单了，只要渲染 [帧率](https://zh.wikipedia.org/wiki/%E5%B8%A7%E7%8E%87)
超过人眼能识别的帧率（60<abbr title="frame per second">fps</abbr>）即可：

```html
<canvas id="canvas" width="500" height="500" style="border:1px solid black"></canvas>
<script>
    var canvas = document.getElementById("canvas")
    var ctx = canvas.getContext('2d');
    var left = 0

    setInterval(function() {
        ctx.clearRect(0, 0, 500, 500);
        ctx.fillRect(left++, 100, 100, 100);
    }, 1000 / 60)
</script>
```

当然你也可以用 `requestAnimationFrame`，不过这不是我想说明的重点。

## Fabric.js 源码解析

### 模块结构图

fabric.js 的模块我大概画了个图，方便理解。

![Fabric.js 的模块结构](https://img11.360buyimg.com/imagetools/jfs/t1/177758/16/8169/144192/60bf4293Ecff688d5/db18fd2512d5ec83.png)

### 基本原理

fabric.js 在初始化的时候会将你指定的 Canvas 元素（叫做 lowerCanvas）外面包裹上一
层 div 元素， 然后内部会插入另外一个上层的 Canvas 元素（叫做 upperCanvas），这两
个 Canvas 有如下区别

| 内部叫法        | 文件路径                       | 作用                  |
|-------------|----------------------------|---------------------|
| upperCanvas | src/canvas.class.js        | 上层画布，只处理 **分组选择**，**事件绑定**   |
| lowerCanvas | src/static_canvas.class.js | 真正 **绘制** 元素对象（Object）的画布 |

### 核心模块详解

上图中，灰色的模块对于理解 fabric.js 核心工作原理没多大作用，可以不看。其它核心
模块我按自己的理解来解释一下。

所有模块都被挂载到一个 fabric 的命名空间上面，都可以用 `fabric.XXX` 的形式访问。

#### `fabric.util` 工具包

工具包中一个最重要的方法是 `createClass` ，它可以用来创建一个类。 我们来看看这
个方法：

```js
  function createClass() {
    var parent = null,
        properties = slice.call(arguments, 0);

    if (typeof properties[0] === 'function') {
      parent = properties.shift();
    }
    function klass() {
      this.initialize.apply(this, arguments);
    }

    // 关联父子类之间的关系
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      Subclass.prototype = parent.prototype;
      klass.prototype = new Subclass();
      parent.subclasses.push(klass);
    }
    // ...
  }
```

为什么不用 ES 6 的类写法呢？主要是因为这个库写的时候 ES 6 还没出来。作者沿用了
老 式的基 于 JavaScript prototype 实现的类继承的写法， 这个方法封装了类的继承、
构造方法、 父子类之前的 关系等功能。注意 `klass.superclass` 和
`klass.subclasses` 这两行， 后面会讲到。

添加这两个引用关系后，我们就可以在 JS 运行时动态获取类之间的关系，方便后续序列化
及反序列化操 作，这种做法类似于其它编程语言中的反射机制，可以让你在代码运行的时
候动态的构建、操作对象

`initialize()` 方法（构造函数）会在类被 new 出来的时候自动调用：

```js
function klass() {
  this.initialize.apply(this, arguments);
}
```

#### fabric 通用类

##### `fabric.Canvas` 类

上层画布类，如上面表格所述，它并不渲染对象。它只来处理与用户交互的逻辑。 比如：
全局事件绑定、快捷键、鼠标样式、处理多（分组）选择逻辑。

我们来看看这个类初始化时具体干了些什么。

```js
fabric.Canvas = fabric.util.createClass(fabric.StaticCanvas, {
    initialize: function (el, options) {
        options || (options = {});
        this.renderAndResetBound = this.renderAndReset.bind(this);
        this.requestRenderAllBound = this.requestRenderAll.bind(this);
        this._initStatic(el, options);
        this._initInteractive();
        this._createCacheCanvas();
    },
    // ...
})
```

注意：由于 `createClass` 中第一个参数是 `StaticCanvas`，所以我们可以知道 Canvas
的父类 是 `StaticCanvas`。

从构造方法 `initialize` 中我们可以看出：

只有 `_initInteractive` 和 `_createCacheCanvas` 是 Canvas 类自己的方法，
`renderAndResetBound`，`requestRenderAllBound`，`_initStatic` 都继承自父类
`StaticCanvas`

这个类的使用也很简单，做为 fabric.js 程序的入口，我们只需要 new 出来即可：

```js
// c 就是 HTML 中的 canvas 元素 id
const canvas = new fabric.Canvas("c", { /* 属性 */ })
```

##### `fabric.StaticCanvas` 类

fabric 的核心类，控制着 Canvas 的渲染操作，所有的画布对象都必须在它上面绘制出来
。我们从构造函数中开始看

```js
fabric.StaticCanvas = fabric.util.createClass(fabric.CommonMethods, {
    initialize: function (el, options) {
        options || (options = {});
        this.renderAndResetBound = this.renderAndReset.bind(this);
        this.requestRenderAllBound = this.requestRenderAll.bind(this);
        this._initStatic(el, options);
    },
})
```

注意：StaticCanvas 不仅继承了 `fabric.CommonMethods` 中的所有方法，还继承了
`fabric.Observable` 和 `fabric.Collection`，而且它的实现方式很 JavaScript，在
StaticCanvas.js 最下面一段：

```js
extend(fabric.StaticCanvas.prototype, fabric.Observable);
extend(fabric.StaticCanvas.prototype, fabric.Collection);
```

##### fabric.js 的画布渲染原理

###### `requestRenderAll()` 方法

从下面的代码可以看出来，这个方法的主要任务就是不断调用 `renderAndResetBound` 方
法 `renderAndReset` 方法会最终调用 `renderCanvas` 来实现绘制。

```js
requestRenderAll: function () {
  if (!this.isRendering) {
    this.isRendering = fabric.util.requestAnimFrame(this.renderAndResetBound);
  }
  return this;
}
```

###### `renderCanvas()` 方法

renderCanvas 方法中代码比较多：

```js
renderCanvas: function(ctx, objects) {
    var v = this.viewportTransform, path = this.clipPath;
    this.cancelRequestedRender();
    this.calcViewportBoundaries();
    this.clearContext(ctx);
    fabric.util.setImageSmoothing(ctx, this.imageSmoothingEnabled);
    this.fire('before:render', {ctx: ctx,});
    this._renderBackground(ctx);

    ctx.save();
    //apply viewport transform once for all rendering process
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    this._renderObjects(ctx, objects);
    ctx.restore();
    if (!this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
    }
    if (path) {
        path.canvas = this;
        // needed to setup a couple of variables
        path.shouldCache();
        path._transformDone = true;
        path.renderCache({forClipping: true});
        this.drawClipPathOnCanvas(ctx);
    }
    this._renderOverlay(ctx);
    if (this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
    }
    this.fire('after:render', {ctx: ctx,});
}
```

我们删掉一些不重要的，精简一下，其实最主要的代码就两行：

```js
renderCanvas: function(ctx, objects) {
    this.clearContext(ctx);
    this._renderObjects(ctx, objects);
}
```

clearContext 里面会调用 canvas 上下文的 `clearRect` 方法来清空画布：

```js
ctx.clearRect(0, 0, this.width, this.height)
```

`_renderObjects` 就是遍历所有的 `objects` 调用它们的 `render()` 方法，把自己绘制
到画布上去：

```js
for (i = 0, len = objects.length; i < len; ++i) {
    objects[i] && objects[i].render(ctx);
}
```

现在你是不是明白了文章最开始那段 `setInterval` 实现的 Canvas 动画原理了？

#### fabric 形状类

##### `fabric.Object` 对象根类型

虽然我们已经明白了 canvas 的绘制原理，但是一个对象（2d元素）到底是怎么绘制到
canvas 上去的，它们的移动怎么实现的？具体细节我们还不是很清楚。 这就要从
`fabric.Object` 根类型看起了。

由于 fabric 中的 2d 元素都是以面向对象的形式实现的，所以我画了一张内部类之间的继
承关系，可以清楚的看出它们之间的层次结构

![fabric-objects-hierarchy](https://img11.360buyimg.com/imagetools/jfs/t1/185032/27/8200/188922/60c176ffE9e9abc1d/859a2c7bf2e2253e.png)

不像传统的 UML 类图那样，这个图看起来还稍有点乱，因为 fabric.js 内部实现的是多重
继承，或者说类似于 mixin 的一种混入模式实现的继承。

从图中我们可以得出以下几点：

* 底层 **StaticCanvas** 继承了 `Collection` 对象和 `Observable` 对象，这就意味着
  StaticCanvas 有两种能力：
    * 给 Canvas 添加（Collection.add()）对象，遍历所（Collection.forEachObject()）有对象
    * 自定义事件发布/订阅的能力
* 所有的 2d 形状（如：矩形、圆、线条、文本）都继承了 `Object` 类。Object 有的属
  性、方法，所有的 2d 形状都会有

* 所有的 2d 形状都具有自定义事件发布/订阅的能力

##### Object 类常用属性

下面的注释中，**边角控制器** 是 fabric.js 内部集成的用户与对象交互的一个手柄，当
某个对象处于激活状态的时候，手柄会展示出来。如下图所示：

![fabric.js-conner](https://img14.360buyimg.com/imagetools/jfs/t1/194077/34/7282/23269/60c08617E66ba693f/b6f82179ca7b81b8.png)

常用属性解释：

```js
// 对象的类型（矩形，圆，路径等），此属性被设计为只读，不能被修改。修改后 fabric 的一些部分将不能正常使用。
type:                     'object',
// 对象变形的水平中心点的位置（左，右，中间）
// 查看 http://jsfiddle.net/1ow02gea/244/ originX/originY 在分组中的使用案例
originX:                  'left',
// 对象变形的垂直中心点的位置（上，下，中间）
// 查看 http://jsfiddle.net/1ow02gea/244/ originX/originY 在分组中的使用案例
originY:                  'top',
// 对象的顶部位置，默认**相对于**对象的上边沿，你可以通过设置 originY={top/center/bottom} 改变它的参数参考位置
top:                      0,
// 对象的左侧位置，默认**相对于**对象的左边沿，你可以通过设置 originX={top/center/bottom} 改变它的参数参考位置
left:                     0,
// 对象的宽度
width:                    0,
// 对象的高度
height:                   0,
// 对象水平缩放比例（倍数：1.5）
scaleX:                   1,
// 对象水平缩放比例（倍数：1.5）
scaleY:                   1,
// 是否水平翻转渲染
flipX:                    false,
// 是否垂直翻转渲染
flipY:                    false,
// 透明度
opacity:                  1,
// 对象旋转角度（度数）
angle:                    0,
// 对象水平倾斜角度（度数）
skewX:                    0,
// 对象垂直倾斜角度（度数）
skewY:                    0,
// 对象的边角控制器大小（像素）
cornerSize:               13,
// 当检测到 touch 交互时对象的边角控制器大小
touchCornerSize:               24,
// 对象边角控制器是否透明（不填充颜色），默认只保留边框、线条
transparentCorners:       true,
// 鼠标 hover 到对象上时鼠标形状
hoverCursor:              null,
// 鼠标拖动对象时鼠标形状
moveCursor:               null,
// 对象本身与边角控制器之间的间距（像素）
padding:                  0,
// 对象处于活动状态下边角控制器**包裹对象的边框**颜色
borderColor:              'rgb(178,204,255)',
// 指定边角控制器**包裹对象的边框**虚线边框的模式元组（hasBorder 必须为 true）
// 第一个元素为实线，第二个为空白
borderDashArray:          null,
// 对象处于活动状态下边角控制器颜色
cornerColor:              'rgb(178,204,255)',
// 对象处于活动状态且 transparentCorners 为 false 时边角控制器本身的边框颜色
cornerStrokeColor:        null,
// 边角控制器的样式，正方形或圆形
cornerStyle:          'rect',
// 指定边角控制器本身的虚线边框的模式元组（hasBorder 必须为 true）
// 第一个元素为实线，第二个为空白
cornerDashArray:          null,
// 如果为真，通过边角控制器来对对象进行缩放会以对象本身的中心点为准
centeredScaling:          false,
// 如果为真，通过边角控制器来对对象进行旋转会以对象本身的中心点为准
centeredRotation:         true,
// 对象的填充颜色
fill:                     'rgb(0,0,0)',
// 填充颜色的规则：nonzero 或者 evenodd
// @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/fill-rule
fillRule:                 'nonzero',
// 对象的背景颜色
backgroundColor:          '',
// 可选择区域被选择时（对象边角控制器区域），层级低于对象背景颜色
selectionBackgroundColor:          '',
// 设置后，对象将以笔触的方式绘制，此属性值即为笔触的颜色
stroke:                   null,
// 笔触的大小
strokeWidth:              1,
// 指定笔触虚线的模式元组（hasBorder 必须为 true）
// 第一个元素为实线，第二个为空白
strokeDashArray:          null,
```

##### Object 类常用方法

###### `drawObject()` 对象的绘制方法

`drawObject()` 方法内部会调用 `_render()` 方法，但是在 `fabric.Object` 基类中它
是 个空方法。 这意味着对象具体的绘制方法需要子类去 **实现**。即子类需要 **重写**
父 类的空 `_render()` 方法。

###### `_onObjectAdded()` 对象被添加到 Canvas 事件

这个方法非常重要，只要当一个对象被添加到 Canvas 中的时候，对象才可以具有 Canvas
的引用上下文， 对象的一些常用方法才能起作用。比如：`Object.center()` 方法，调用
它可以让一个对象居中到画布中央。 下面这段代码可以实现这个功能：

```js
const canvas = new fabric.Canvas("canvas", {
  width: 500, height: 500,
})
const box = new fabric.Rect({
  left: 10, top: 10,
  width: 100, height: 100,
})
console.log(box.top, box.left)  // => 10, 10
box.center()
console.log(box.top, box.left)  // => 10, 10
canvas.add(box)
```

但是你会发现 box 并没有被居中，这就是因为：当一个对象（box）还没被添加到 Canvas
中的时候，对象上面 还不具有 Canvas 的上下文，所以调用的对象并不知道应该在哪个
Canvas 上绘制。我们可以看下 `center()` 方法的源代码：

```js
center: function () {
  this.canvas && this.canvas.centerObject(this);
  return this;
},
```

正如上面所说，没有 canvas 的时候是不会调用到 `canvas.centerObject()` 方法，也就
实现不了居中。

所以解决方法也很简单，调换下 center() 和 add() 方法的先后顺序就好了：

```js
const canvas = new fabric.Canvas("canvas", {
  width: 500, height: 500,
})
const box = new fabric.Rect({
  left: 10, top: 10,
  width: 100, height: 100,
})
canvas.add(box)
console.log(box.top, box.left)  // => 10, 10
box.center()
console.log(box.top, box.left)  // => 199.5, 199.5
```

「为什么不是 200，而是 199.5」—— 好问题，但是我不准备讲这个。有兴趣可以自己研究
下。

###### `toObject()` 对象的序列化

正向的把对象序列化是很简单的，只需要把你关注的对象上的属性拼成一个 JSON 返回即可
：

```js
toObject: function(propertiesToInclude) {
  var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,
      object = {
        type:                     this.type,
        version:                  fabric.version,
        originX:                  this.originX,
        originY:                  this.originY,
        left:                     toFixed(this.left, NUM_FRACTION_DIGITS),
        top:                      toFixed(this.top, NUM_FRACTION_DIGITS),
        width:                    toFixed(this.width, NUM_FRACTION_DIGITS),
        height:                   toFixed(this.height, NUM_FRACTION_DIGITS),
        // 省略其它属性
      };
  return object;
},
```

当调用对象的 `toJSON()` 方法时会使用 `JSON.stringify(toObject())` 来将对象的属性
转换成 JSON 字符串

###### `fromObject()` 对象的反序列化

`fromObject()` 是 Object 的子类需要实现的反序列化方法，通常会调用 Object 类的默
认方法 `_fromObject()`

```js
fabric.Object._fromObject = function(className, object, callback, extraParam) {
  var klass = fabric[className];
  object = clone(object, true);
  fabric.util.enlivenPatterns([object.fill, object.stroke], function(patterns) {
    if (typeof patterns[0] !== 'undefined') {
      object.fill = patterns[0];
    }
    if (typeof patterns[1] !== 'undefined') {
      object.stroke = patterns[1];
    }
    fabric.util.enlivenObjects([object.clipPath], function(enlivedProps) {
      object.clipPath = enlivedProps[0];
      var instance = extraParam ? new klass(object[extraParam], object) : new klass(object);
      callback && callback(instance);
    });
  });
};
```

这段代码做了下面一些事情：

1. 通过类名（className 在 `Object` 的子类 `fromObject` 中指定）找到挂载在
   `fabric` 命名空间上的对象的所属类 
2. 深拷贝当前对象，避免操作过程对修改源对象 
3. 处理、修正对象的一些特殊属性，比如：fill, stroke, clipPath 等
4. 用所属类按新的对象属性构建一个新的对象实例（instance），返回给回调函数

噫，好像不对劲？反序列化入参不得是个 JSON 字符串吗。是的，不过 fabric.js 中并没
有在 Object 类中提供这个方法， 这个自己实现也很简单，将目标 JSON 字符串 parse 成
普通的 JSON 对象传入即可。

Canvas 类上面到是有一个画布整体反序列化的方法：`loadFromJSON()`，它做的事情就是
把一段静态的 JSON 字符串转成普通对象 后传给每个具体的对象，调用对象上面的
`fromObject()` 方法，让对象具有真正的渲染方法，再回绘到 Canvas 上面。

> 序列化主要用于 `持久存储`，反序列化则主要用于将持久存储的静态内容转换为 Canvas
> 中可操作的 2d 元素，从而可以实现将某 个时刻画布上的状态还原的目的
>
> 如果你的存储够用的话，甚至可以将整个在 Canvas 上的绘制过程进行录制/回放

一些绘制过程中常见的功能也是通过序列化/反序列化来实现的，比如：撤销/重做

#### fabric 混入类

混入类（mixin）通常用来给对象添加额外的方法，通常这些方法和画布关系不大，比如：
一些无参方法，事件绑定等。 通常混入类会通过调用 `fabric.util.object.extend()` 方
法来给对象的 prototype 上添加额外的方法。

##### fabric.js 的事件绑定

混入类里面有一个很重要的文件：`canvas_event.mixin.js`，它的作用有以下几种：

1. 为上层 Canvas 绑定原生浏览器事件
2. 在合适的时机触发自定义事件
3. 使用第三方库（event.js）绑定、模拟移动端手势操作事件

##### fabric.js 的鼠标移动（__onMouseMove()）事件

`__onMouseMove()` 可以说是一个核心事件，对象的变换基本上都要靠它来计算距离才能实
现，我们来看看它是如何实现的

```js
__onMouseMove: function (e) {
  this._handleEvent(e, 'move:before');
  this._cacheTransformEventData(e);
  var target, pointer;

  if (this.isDrawingMode) {
    this._onMouseMoveInDrawingMode(e);
    return;
  }

  if (!this._isMainEvent(e)) {
    return;
  }

  var groupSelector = this._groupSelector;

  // We initially clicked in an empty area, so we draw a box for multiple selection
  if (groupSelector) {
    pointer = this._pointer;

    groupSelector.left = pointer.x - groupSelector.ex;
    groupSelector.top = pointer.y - groupSelector.ey;

    this.renderTop();
  }
  else if (!this._currentTransform) {
    target = this.findTarget(e) || null;
    this._setCursorFromEvent(e, target);
    this._fireOverOutEvents(target, e);
  }
  else {
    this._transformObject(e);
  }
  this._handleEvent(e, 'move');
  this._resetTransformEventData();
},
```

注意看源码的时候要把握到重点，一点不重要的就先忽略，比如：缓存处理、状态标识。我
们只看最核心 的部分，上面这段代码里面显然 `_transformObject()` 才是一个核心方法
。我们深入学习下。

```js
/**
 * 对对象进行转换（变形、旋转、拖动）动作，e 为当前鼠标的 mousemove 事件，
 * **transform** 表示要进行转换的对象（mousedown 时确定的）在 `_setupCurrentTransform()` 中封装过，
 * 可以理解为对象 **之前** 的状态，再调用 transform 对象中对应的 actionHandler
 * 来操作画布中的对象，`_performTransformAction()` 可以对 action 进行检测，如果对象真正发生了变化
 * 才会触发最终的渲染方法 requestRenderAll()
 * @private
 * @param {Event} e 鼠标的 mousemove 事件
 */
_transformObject: function(e) {
  var pointer = this.getPointer(e),
      transform = this._currentTransform;

  transform.reset = false;
  transform.shiftKey = e.shiftKey;
  transform.altKey = e[this.centeredKey];

  this._performTransformAction(e, transform, pointer);
  transform.actionPerformed && this.requestRenderAll();
},
```

我已经把注释添加上了，主要的代码实现其实是在 `_performTransformAction()` 中实现
的。

```js
_performTransformAction: function(e, transform, pointer) {
  var x = pointer.x,
      y = pointer.y,
      action = transform.action,
      actionPerformed = false,
      actionHandler = transform.actionHandler;
      // actionHandle 是被封装在 controls.action.js 中的处理器

  if (actionHandler) {
    actionPerformed = actionHandler(e, transform, x, y);
  }
  if (action === 'drag' && actionPerformed) {
    transform.target.isMoving = true;
    this.setCursor(transform.target.moveCursor || this.moveCursor);
  }
  transform.actionPerformed = transform.actionPerformed || actionPerformed;
},
```

这里的 **transform** 对象是设计得比较精妙的地方，它封装了对象操作的几种不同的类
型，每种类型 对应的有不同的动作处理器（actionHandler），transform 对象就充当了一
种对于2d元素进行操作 的 **上下文**，这样设计可以得得事件绑定和处理逻辑分离，代码
具有更高的内聚性。

我们再看看上面注释中提到的 `_setupCurrentTransform()` 方法，一次 transform 开始
与结束 正好对应着鼠标的按下（onMouseDown）与松开（onMouseUp）两个事件。

我们可以从 `onMouseDown()` 事件中顺藤摸瓜，找到构造 transform 对象的地方：

```js
_setupCurrentTransform: function (e, target, alreadySelected) {
  var pointer = this.getPointer(e), corner = target.__corner,
      control = target.controls[corner],
      actionHandler = (alreadySelected && corner) 
              ? control.getActionHandler(e, target, control) 
              : fabric.controlsUtils.dragHandler,
      transform = {
        target: target,
        action: action,
        actionHandler: actionHandler,
        corner: corner,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        skewX: target.skewX,
        skewY: target.skewY,
      };

  // transform 上下文对象被构造的地方
  this._currentTransform = transform;
  this._beforeTransform(e);
},
```

`control.getActionHandler` 是动态从 `default_controls.js` 中按边角的类型获取的：

| 边角类型 | 控制位置 | 动作处理器（actionHandler） | 作用 |
|-------|------|----------------------|----|
| ml    | 左中   | scalingXOrSkewingY  |  横向缩放或者纵向扭曲  |
| mr    | 右中   | scalingXOrSkewingY  |  横向缩放或者纵向扭曲  |
| mb    | 下中   | scalingYOrSkewingX  |  纵向缩放或者横向扭曲  |
| mt    | 上中   | scalingYOrSkewingX  |  纵向缩放或者横向扭曲  |
| tl    | 左上   | scalingEqually  |  等比缩放  |
| tr    | 右上   | scalingEqually  |  等比缩放  |
| bl    | 左下   | scalingEqually  |  等比缩放  |
| br    | 右下   | scalingEqually  |  等比缩放  |
| mtr   | 中上变形 | controlsUtils.rotationWithSnapping  |  旋转  |

对照上面的边角控制器图片更好理解。

这里我想多说一点，一般来讲，像这种上层的交互功能，做为一个 Canvas 库通常是不会封
装好的。 但是 fabric.js 却帮我们做好了，这也验证了它自己定义里面的一个关键词：**
可交互的**，正 是因 为它通过边角控制器封装了见的对象操作，才使得 Canvas 对象可以
与用户进行交互。我们普通开发者不需要关心细节，配置一些通用参数就能实现功能。

##### fabric.js 的自定义事件

fabric.js 中内置了很多自定义事件，这些事件都是我们常用的，非原子事件。对于日常开
发来说非常方便。

###### 对象上的 24 种事件

* object:added
* object:removed
* object:selected
* object:deselected
* object:modified
* object:modified
* object:moved
* object:scaled
* object:rotated
* object:skewed
* object:rotating
* object:scaling
* object:moving
* object:skewing
* object:mousedown
* object:mouseup
* object:mouseover
* object:mouseout
* object:mousewheel
* object:mousedblclick
* object:dragover
* object:dragenter
* object:dragleave
* object:drop

###### 画布上的 5 种事件

* before:render
* after:render
* canvas:cleared
* object:added
* object:removed

明白了上面这几个核心模块的工作原理，再使用 fabric.js 来进行 Canvas 开发就能很快
入门， 实际上 Canvas 开发并不难，难的是编程思想和方式的转变。

## 几个需要注意的地方

1. fabric.js 源码没有使用 ES 6，没使用 TypeScript，所以在看代码的时候还是很不方便的，推荐使用
   jetbrains 家的 IDE：IntelliJ IDEA 或 Webstorm 都是支持对 ES 6 以下的 JavaScript 代码进行
   静态分析的，可以使用跳转到定义、调用层级等功能，看源代码会很方便
2. fabric.js 源码中很多地方用到 Canvas 的 save() 和 restore() 方法，可以查看这个链接了解更多
   [查看](http://html5.litten.com/understanding-save-and-restore-for-the-canvas-context/)
3. 如果你之前从来没有接触过 Canvas 开发，那我建议去看看 bilibili 上萧井陌录的一节的关于入门游戏开发的
   [视频教程](https://space.bilibili.com/39066904/channel/detail?cid=21254)，不要一
   开始就去学习 Canvas 的 API，先了解概念原理性的东西，最后再追求细节


