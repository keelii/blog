+++
title = "《JavaScript 权威指南》读书笔记 14 - Window 对象"
date = "2016-07-26 11:35:42 +0800"
isCJKLanguage = true
categories = ["javascript","JavaScript_The_Definitive_Guide"]
tags = []
+++

本章介绍 Window 对象的属性和方法

## 计时器

setTimeout() 和 setInterval() 可以用来注册指定时间之后调用的函数，不同的是 setInterval 会在指定毫秒数的间隔里重复调用。它们都返回一个值，这个值可以传递给 clearInterval/clearTimeout，用于取消后续函数的调用
<!--more-->
由于历史原因（通常不建议这么做），setTimeout 和 setInterval 的第一个参数可以作为字符串传入。如果是字符串，当到达指定时间时相当于执行 eval 字符串内容

```javascript
// 4 秒后显示 log
var t1 = setTimeout(function () {
    console.log('show after 4s');
}, 4000);

function fn() { console.log('show every 1s'); }
setTimeout('fn()', 1000);
```

## 浏览器定位和导航

Window 对象的 location 属性引用的是 Location 对象，它表示窗口中当前显示的文档 URL。并且定义了方法来使窗口载入新的文档

Document 对象上的 location 属性也引用到 Location 对象：

```javascript
window.location = document.location
```

Document 对象也有一个 URL 属性，是文档首次载入后保存的该文档的 URL 静态字符串。如果定位到文档中的片段标识符（如#table-of-content，其实就是锚点），Location 对象会做相应的更新，**而 document.URL 属性不会**

## 解析 URL

Location 对象的 href 属性是一个字符串，后者包含 URL 的完整文本。Location 对象的 toString() 方法返回 href 属性的值，因此会隐式调用 toString() 的情况下，可以使用 location 代替 location.href

这个对象的其它属性——protocol, host, hostname, port, pathname 和 search 分别表示 URL 的各个部分。它们称为「URL 分解」属性，同时被 link 对象（通过 HTML 文档中的 a 和 area 元素创建）支持

![url](https://cloud.githubusercontent.com/assets/458894/17127989/2285a748-533c-11e6-946d-a1d129e845c7.gif)

### 载入新的文档

Location 对象的 assign() 方法可以使用窗口载入并显示你指定的 URL 中的文档。replace() 方法也类似，但它在 **载入新文档之前会从浏览器历史中把当前文档删除**，assign 会产生一个新的历史记录，也就是说可以使用浏览器的返回按钮到上一页，replace 则不行

## 浏览历史

Window 对象的 history 属性用来把窗口的浏览历史用文档和文档状态列表的形式表示。history 对象的 length 属性表示浏览历史列表中的元素数量，但是脚本并不能访问已保存的 URL

history 对象的 bace() 和 forward() 方法与浏览器的「后退」和「前端」按钮一样。go() 方法接收一个整数参数，可以在历史列表中向前（正数）或向后（负数）跳过任意多个页

```javascript
history.go(-2);     // 后退两个历史记录
```

如果窗口包含多个子窗口（比如 iframe 元素），子窗口的浏览历史也会被记录，这音中着在主窗口调用 history.back() 可能会使子窗口跳转而主窗口不变

## 浏览器和屏幕信息

### navigator 对象

Window 对象的 navigator 属性引用的是包含浏览器厂商和版本信息的 navigator 对象。navigator 有四个属性用于提供关于运行中的浏览器版本信息，并且可以用来做浏览器嗅探

**appName**

Web 浏览器的全称。在 IE 中，就是「Microsoft Internet Explorer」，在 Firefox 中就是「Netscape」

**appVersion**

此属性通常以数字开始，并跟着包含浏览器厂商和版本信息的详细字符串。字符串前面的数字通常是 4.5 或 5.0，表示它是第 4 或 5 代兼容的浏览器

**userAgent**

浏览器在它的 USER-AGENT HTTP 头部中发送的字符串。这个属性通常包含 appVersion 中的所有信息，以及其它细节

**platform**

在其上运行浏览器的操作系统字符串

### screen 对象

screen 对象提供有关窗口显示的大小和可用的颜色数量信息，属性 width 和 height 指定的是以像素为单位的窗口大小。属性 avilWidth 和 avilHeight 指定的是实际可用的显示大小，它们排除了像浏览器任务栏这样的特性所占用的屏幕空间

## 对话框

Window 对象提供了 3 个方法来向用户显示简单的对话框。

**alert()** 向用户显示一条消息并等待用户关闭
**confirm()** 也显示一条消息并要求用户单击「确定」或「取消」，并返回一个布尔值
**prompt()** 也显示一条消息并等待用户输入字符串，并返回那个字符串

```javascript
do {
    var name = prompt('What is your name?');
    var correct = confirm('You entered: ' + name + '\n\
                            Click OK to processed or Cancel to re-enter')
} while(!correct)
```

这三个方法都会产生阻塞，也就是说，在用户关掉它们所显示的对话框之前，它们不会返回，这就意味着在弹出一个对话框前，代码就会停止运行。如果当前正在载入文档，也会停止载入。直到用户用要求的输入进行响应为止

## 错误处理

Window 对象的 onerror 属性是一个事件处理程序，当未捕获的异常传播到调用栈上的时候就会触发它，并把错误消息输出到浏览器的 JavaScript 控制台上，onerror 事件处理函数调用通过三个字符串参数，而不是事件对象。分别是`错误信息`、`产生错误的页面地址`、`错误源代码的行号`，onerror 的返回值也很重要，如果 onerror 处理程序返回 false，表示它通知浏览器事件处理程序已经处理错误了，不需要其它操作。Firefox 则刚好相反

## 作为 Window 对象属性的文档元素

**如果 HTML 文档中用 id 属性来为元素命名，并且如果 Window 对象没有此名字的属性（并且这个id是个合法的标识符），Window 对象会赋予一个属性，它的名字就是 id 属性的值**，而它的值指向表示文档元素的 HTMLElement 对象

元素 ID 作为全局变量的隐式应用是 Web 浏览器进化过程中遗留的问题，主要是出于兼容性的考虑。**但并不推荐使用这种做法**

## 多窗口和窗体

Web 浏览器的窗口中每一个标签页都是独立的「浏览上下文」（browsing context），每一个上下文都有独立的 Window 对象，而且相互之间不干扰，也不知道其他标签页的存在

但是窗口并不总是和其它窗口完全没关系，因为可以通过脚本打开新的窗口或标签页。如果这么做就可以通过脚本跨窗口进行操作（参照之前的 [同源策略](/2016/07/14/javascript-definitive-guide-note-11/#TOC-16)）

### 打开和关闭窗口

使用 Window 对象的 open() 方法可以打开一个新的浏览器窗口

> var windowObjectReference = window.open(url, name, [features]);

第一个参数 `url` 是要在新窗口中显示文档的 URL，如果参数省略，默认会使用空页面的 URL about:blank

第二个参数 `name` 表示打开窗口的名字，如果指定的是一个已经存在的窗口名字（并且脚本允许跳转到那个窗口），会直接用已存在的窗口。否则，会打开新的窗口，并将这个指定的名字赋值给它。如果省略此参数，会使用指定的名字「_blank」打开一个新的未命名窗口

第三个参数 `features`（非标准）是一个以逗号分隔的列表，包含表示打开窗口的大小和各种属性

open() 也可以有第四个参数，且只在第二个参数命名的是一个存在的窗口时才有用。它是一个布尔值，𡔬了由第一个参数指定的 URL 是应用替换掉窗口浏览器历史的当前条目（true），还是应该在窗口浏览历史中创建一个新的条目（false），后者是默认设置

open() 的返回值是代表命名或新创建的窗口的 Window 对象。可以在自己的 JavaScript 代码中使用这个 windows 对象来引用新创建的窗口，就像用隐式的 Window 对象 window 来引用运行代码的窗口一样：

```javascript
var w = window.open();
w.alert('About to visit http://jd.com');
w.location = 'http://jd.com';
```

由 window.open() 方法创建的窗口中，opener 属性引用的是打开它的脚本的 Window 对象，在其它窗口中，opener 为 null

```javascript
w.opener !== null;      // => true
w.open().opener === w   // => true
```

**关闭窗口**

像 open() 方法一样，close() 用来关闭一个（脚本打开的）窗口，注意，**大多数浏览器只允许自己关闭自己的 JavaScript 代码创建的窗口**，要关闭其它窗口，可以用一个对话框提示用户，要求他关闭窗口的请求进行确认。在表示窗体而不是顶级窗口或者标签页上的 Window 对象上执行 close() 方法不会有任何效果，它不能关闭一个窗体

即使一个窗口关闭了，代表它的 Window 对象 **仍然存在**。已关闭的窗口会有一个值为 true 的 closed 属性，它的 document 会是 null， 它的方法通常也不会再工作

### 窗体之间的关系

任何窗口中的 JavaScript 代码都可以将自己的窗口引用为 window 或 self。窗体可以用 parent 属性引用包含它的窗口的 Window 对象。如果一个窗口是顶级窗口或标签，那么其 parent 属性引用的就是这个窗口本身：

```javascript
parent.history.back();
parent == self;            // 只有顶级窗口才会返回 true
```

如果一个窗体包含在另一个窗体中，而后者又包含在顶级窗口中，那么该窗体就可以使用 parent.parent 来引用顶级窗口。top 属性是一个通用的快捷方式，无论一个窗体被嵌套几层，它的 top 属性引用的都是指向包含它的顶级窗口。如果一个 Window 对象代表的是一个顶级窗口，那么它的 top 属性就是窗口本身。对于那些顶级窗口的直接子窗体，top 属性就等价于 parent 属性

parent 和 top 属性允许脚本引用它的窗体的祖先。有不止一种方法可以引用窗口的子孙窗体。窗口是通过 iframe 元素创建的，可以获取其他元素的方法来获取一个表示 iframe 的元素对象，iframe 元素有 contentWindow 属性，引用该窗体的 Window 对象。也可以反向操作，使用 Window 对象的 frameElement 属性来引用被包含的 iframe 元素，对于顶级窗口来说 Window 对象的 frameElement 属性为 null

```javascript
// 假设页面有一个 id="f1" 的 iframe 元素
var iframeElement = document.getElementById('f1');
var iframeWindowObject = iframeElement.contentWindow;
// 对于 iframe 来说永远是 true
iframeWindowObject.frameElement === iframeElement
// 对于顶级窗口来说 frameElement 永远是 null
window.frameElement === null;
```

每个 window 上都会有一个 frames 属性，表示当前窗口里面引用的窗口。frames 是个类数组对象，并可以通过数字或者窗体名称（如 iframe name 属性）进行索引。注意 frames 元素引用的是窗口的 Window 对象，而不是 iframe 元素

### 交互窗口中的 JavaScript

每个窗口都是它自身的 JavaScript 执行上下文，以 window 做为全局对象

设想一个 Web 页面里面有两个 iframe 元素，分别叫「A」和「B」，并假设这些窗体所包含的文档来自于相同的一个服务器，并且包含交互脚本。我们在窗体 A 里的脚本定义了一个变量 i：

```javascript
var i = 3;
```

这个变量只是全局对象的一个属性，也是 Window 对象的一个属性。窗体 A 中的代码可以用标识符 i 来引用变量，或者用 Window 对象显示地引用这个变量：

```javascript
i           // => 3
window.i    // => 3
```

由于窗体 B 中的脚本可以引用窗体 A 的 Window 对象，因此它也可以引用那个 Window 对象的属性：

```javascript
parent.A.i = 4;             // 修改窗体 A 中的变量
parent.A.fun();             // 调用 A 窗体中的全局函数
var s = new parent.Set();   // 甚至可以构造父窗口中的对象
```

和用户定义的类不同，内置类（比如 String, Date 和 RegExp）都会在所有的窗口中自动预定义。但是要注意，**每个窗口都有构造函数的一个独立副本和构造函数对应的原型对象的一个独立副本**。例如，每个窗口都有自己的 String() 构造函数和 String.prototype 对象副本。因此，如果编写一个操作 JavaScript 字符串的新方法，并且通过把它赋值给当前窗口中的 String.prototype 对象而使它成为 String 类的一个方法，那么该窗口中的所有字符串就可以使用这个新方法。但是，**别的窗口中定义的字符串不能使用这个新方法**