+++
title = "Fabric.js 原理与源码解析"
isCJKLanguage = true
categories = ["fe"]
tags = ["fabric.js", "canvas"]
date = "2021-05-08T19:20:04-07:00"
+++

## Fabric.js 简介

我们先来看看官方的定义：

> Fabric.js is a framework that makes it easy to work with HTML5 canvas element. It is an interactive object model on top of canvas element. It is also an SVG-to-canvas parser.
> 
> [Fabric.js](http://fabricjs.com/) 是一个可以让 HTML5 Canvas 开发变得简单的框架。
> 它是一种基于 Canvas 元素的 **可交互** 对象模型，也是一个 SVG 到 Canvas 的解析器（让SVG 渲染到 Canvas 上）。

## 使用场景

从它的官方定义可以看出来，它是一个用 Canvas 实现的对象模型。如果你需要用 HTML Canvas 来绘制一些东西，并且这些东西可以响应用户的交互，比如：拖动、变形、旋转等操作。
那用 fabric.js 是非常合适的，因为它内部不仅实现了 Canvas 对象模型，还将一些常用的交互操作封装好了，可以说是开箱即用。

内部集成的主要功能如下：

* 几何图形绘制，如：形状（圆形、方形、三角形）、路径
* 位图加载、滤镜
* 自由画笔工具，笔刷
* 文本、富文本渲染
* 模式图像
* 对象动画
* Canvas 与对象之间的序列化与反序列化

## Canvas 开发请注意 

如果你之前没有过 Canvas 的相关开发经验（只有 JavaScript 网页开发经验），刚开始入门会觉得不好懂，不理解 Canvas 开发的逻辑。这个很正常，因为这表示你正从传统的 JavaScript 开发转到图形图像 GUI 开发。
虽然语言都是 JavaScript 但是开发理念和用到的编程范式完全不同。

* 传统的客户端 JavaScript 开发一般可以认为是 **事件驱动的编程模型** (Event-driven programming)，这个时候你需要关注事件的触发者和监听者
* Canvas 开发通常是 **面向对象的编程模型**，需要把绘制的物体抽象为对象，通过对象的方法维护自身的属性，通常会使用一个全局的事件总线来处理对象之间的交互

这两种开发方式各有各的优势，比如：

* 有的功能在 HTML 里一行代码就能实现的功能放到 Canvas 中需要成千行的代码去实现。比如：contenteditable
* 相反，有的功能在 Canvas 里面只需要一行代码实现的，使用 HTML 却几乎无法实现。比如：截图

Canvas 开发的本质其实很简单，想像下面这种少儿画板：

![少儿画板](https://img13.360buyimg.com/imagetools/jfs/t1/186464/5/6555/128945/60bf3d25Eb3e8db9e/a186c17daa11cf56.png)

Canvas 的渲染过程就是不断的在画板（Canvas）上面擦了画，画了擦。

动画就更简单了，只要渲染 [帧率](https://zh.wikipedia.org/wiki/%E5%B8%A7%E7%8E%87) 超过人眼能识别的帧率（60<abbr title="frame per second">fps</abbr>）即可：

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

## Fabric.js 的模块结构

Fabric.js 的代码不算多，源代码（不包括内置的三方依赖）大概 1.7 万 行代码。最初是在 2010 年开发的，从源代码就可以看出来，都是很老的代码写法。没有构建工具，没有依赖，甚至没使用 ES 6，代码中模块都是用 IIFE 的方式包装的。

但是这个并不影响我们学习它，相反正因为它没引入太多的概念，使用起来相当方便。不需要构建工具，直接在一个 HTML 文件中引入库文件就可以开发了。甚至官方都提供了一个 HTML 模板代码：

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

### 模块结构图

fabric.js 的模块我大概画了个图，方便理解。

![Fabric.js 的模块结构](https://img11.360buyimg.com/imagetools/jfs/t1/177758/16/8169/144192/60bf4293Ecff688d5/db18fd2512d5ec83.png)

### 基本原理

fabric.js 在初始化的时候会将你指定的 Canvas 元素（叫做 lowerCanvas）外面包裹上一层 div 元素，然后内部会插入另外一个上层的 Canvas 元素（叫做 upperCanvas），这两个 Canvas 的作用分别是：


| 内部叫法        | 文件路径                       | 作用                  |
|-------------|----------------------------|---------------------|
| upperCanvas | src/canvas.class.js        | 上层画布，只处理分组选择，事件绑定   |
| lowerCanvas | src/static_canvas.class.js | 真正绘制图像对象（Object）的画布 |

### 核心模块详解

上图中，灰色的模块对于理解 fabric.js 核心工作原理没多大作用，可以不看。其它核心模块我按自己的理解来解释一下。

#### 画布 Canvas 类

