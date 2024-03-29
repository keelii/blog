+++
title = "JavaScript 浏览器事件"
isCJKLanguage = true
date = "2016-09-29 17:22:29 +0800"
categories = ["javascript", "Event"]
+++

## JavaScript、浏览器、事件之间的关系

JavaScript 程序采用了异步事件驱动编程（Event-driven programming）模型，维基百科对它的解释是：

> 事件驱动程序设计（英语：Event-driven programming）是一种电脑程序设计模型。这种模型的程序运行流程是由用户的动作（如鼠标的按键，键盘的按键动作）或者是由其他程序的消息来决定的。相对于批处理程序设计（batch programming）而言，程序运行的流程是由程序员来决定。批量的程序设计在初级程序设计教学课程上是一种方式。然而，事件驱动程序设计这种设计模型是在交互程序（Interactive program）的情况下孕育而生的

<!--more-->
简页言之，在 web 前端编程里面 JavaScript 通过浏览器提供的事件模型 API 和用户交互，接收用户的输入

由于用户的行为是不确定的，也就是说不知道用户什么时候发生点击、滚动这些动作。这种场景是传统的同步编程模型没法解决的，因为你不可能等用户操作完了才执行后面的代码

比如我们在 Python 里面调用接收用户输入的方法 `raw_input()` 后终端就会一直等待用户的输入，直到输入完成才会执行后面的代码逻辑。但是在下面这段 NodeJS 代码中，接收用户输入的方法 `process.stdin.read` 是在一个事件中调用的。后面的代码不会被阻塞（blocked）

```javascript
'use strict';

process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        process.stdout.write(`Async output data: ${chunk}`);
    }
});

process.stdin.on('end', () => {
    process.stdout.write('end');
});

console.log('Will not be blocked');
```

事件驱动程序模型基本的实现原理基本上都是使用 [事件循环（Event Loop）](https://www.youtube.com/watch?v=8aGhZQkoFbQ)，这部分内容涉及浏览器事件模型、回调原理，有兴趣的去看链接里面的视频学习下

需要说明的是在客户端 JavaScript 中像 setTimeout, XMLHTTPRequest 这类 API **并不是** JavaScript 语言本身就有的。而是 JavaScript 的宿主环境（在客户端 JavaScript 中就是浏览器），同样像 DOM、BOM、Event API 都是浏览器提供的

## 事件绑定的方法

### DOM 元素行内绑定

直接在 DOM 元素上通过设置 `on + eventType` 来绑定事件处理程序

```html
<a href="#none" onclick="alert('clicked.')">点击我</a>
```

这种绑定方法是最原始的，有两个缺点：

**1 事件处理程序和 HTML 结构混杂在一起**

早期在结构、样式、表现分离的时代很忌讳这一点。现在看来在很多 MVX 框架中将事件绑定和 DOM 结构放在一起处理，这样似乎更方便维护（不用来回切换 HTML,JavaScript 文件），而且也符合可预见（predictable）性的规则

**2 命名空间冲突**

因为 `onclick` 中的 JavaScript 代码片段执行环境是全局作用域。然而在 JavaScript 语言中并没有相关的命名空间特性。所以就很容易造成命名空间的冲突，非要用这种方法绑定事件的话只能用对象来做一些封装


### 古老的绑定方法

使用 DOM Element 上面的 `on + eventType` 属性 API

```html
<a href="#none" id="button">click me</a>
<script>
    var el = getElementById('button');
    el.onclick = function() { alert('button clicked.') };
    el.onclick = function() { alert('button clicked (Rewrite event handler before).') };
</script>
```

这种方法也有一个缺点，因为属性赋值会覆盖原值的。所以无法绑定 **多个** 事件处理函数，如果我们要注册多个 onload 事件处理程序的话就得自己封装一个方法来防止这种事情发生，下面这个例子可以解决这个问题

```javascript
function addLoadEvent(fn) {
    var oldonLoad = window.onload;
    if (typeof oldonLoad !== 'function') {
        window.onload = fn;
    } else {
        window.onload = function() {
            oldonLoad();
            fn();
        }
    }
}

addLoadEvent(function() { alert('onload 1') });
addLoadEvent(function() { alert('onload 2') });
```

注意这只是个示例，生产环境很少会用到。一般用 DOM Ready 就可以了，因为 JavaScript 的执行通常不用等到页面资源全部加载完，DOM 加载完就可以了

### 现代/标准的绑定方法

标准的绑定方法有两种，`addEventListener` 和 `attachEvent` 前者是标准浏览器支持的 API，后者是 IE 8 以下浏览器支持的 API。通常需要我们做个兼容封装

```javascript
function addEvent(target, type, handler) {
    if (target.addEventListener) {
        target.addEventListener(type, handler, false);
    } else {
        target.attachEvent('on' + type, handler)
    }
}

addEvent(document, 'click', function() { alert(this === document) });
addEvent(document, 'click', function() { alert(this === document) });
```

上面的例子在 IE 8 以下和标准浏览器的效果是不一样的，问题就在于 `addEventListener` 中的事件回调函数中的 this 指向元素（target）本身，而 `attachEvent` 则指向 `window` 为了修复这个问题上面的 attachEvent 可以做一点小调整让其保持和 `addEventListener` 的效果一样，不过这样的话注册的 handler 就是个匿名函数，**无法移除**！

```javascript
function addEvent(target, type, handler) {
    if (target.addEventListener) {
        target.addEventListener(type, handler, false);
    } else {
        target.attachEvent('on' + type, function() {
            return handler.call(target)
        });
    }
}

addEvent(document, 'click', function() { alert(this === document) });
```

当上面这几种情况同时出现的时候就比较有意思了，可以试试下面这段代码的你输出

```html
<a href="javascript:alert(1)" onclick="alert(2)" id="link">click me</a>
<script>
    var link = document.getElementById('link');
    link.onclick = function() { alert(3); }

    $('#link').bind('click', function() { alert(4); });
    $('#link').bind('click', function() { alert(5); });
</script>
```

正确的结果应该是 `3,4,5,1`，根据结果我们可以得出以下结论：

* 链接上的 href 伪 javascript 协议相当于在浏览器地址栏执行了一段 JavaScript 代码，链接如果是这种格式，点击的时候相当于执行了这段 JavaScript 脚本
* 行内的事件绑定和元素调用 onclick 绑定事件会覆盖
* 使用 jQuery（内部使用标准事件注册 API）可以绑定多个事件处理程序

## 事件冒泡

大部分事件会沿着事件触发的目标元素往上传播。比如：`body>div>p>span` 如果他们都注册了点击事件，那么在 span 元素上触发点击事件后 p,div,body 各自的点击事件也会按顺序触发

事件冒泡是可以被停止的，下面这个函数封闭了停止事件冒泡的方法：

```javascript
function stopPropagation(event) {
    event = event || window.event;
    if (event.stopPropagation) {
        event.stopPropagation()
    } else {// IE
        event.cancelBubble = true
    }
}

addEvent('ele', 'click', function(e) {
    // click handler
    stopPropagation(e);
});
```

## 事件对象

标准浏览器中在事件处理程序被调用时 **事件对象** 会通过参数传递给处理程序，IE 8 及以下浏览器中事件对象可以通过全局的 `window.event` 来访问。比如我们要获取当前点击的 DOM Element

```javascript
addEvent(document, 'click', function(event) {
    // IE 8 以下 => undefined
    console.log(event);
});
addEvent(document, 'click', function(event) {
    event = event || window.event;
    // 标准浏览器 => [object HTMLHtmlElement]
    // IE 8 以下 => undefined
    console.log(event.target);
    var target = event.target || event.srcElement;

    console.log(target.tagName);
});
```

## 事件代理

有时候我们需要给 **不存在的**（可能将来会有）的一段 DOM 元素绑定事件，比如给一段 Ajax 请求完成后渲染的 DOM 节点绑定事件。一般绑定的逻辑会在渲染前执行，绑定的时候找不到元素所以并不能成功，当然你也可以把绑定事件的代码放在 Ajax 请求之后。这样做在一些事件逻辑简单的应用里面没问题，但是会加重数据渲染逻辑和事件处理的逻辑耦合。一但事件处理程序特别多的时候，我们通常建议把事件的逻辑和其它代码逻辑分离，这样方便维护。

为了解决这个问题，我们通常使用事件代理/委托（Event Delegation ）。而且通常来说使用 **事件代理的性能会比单独绑定事件高** 很多，我们来看个例子

```html
<ul id="list">
    <li id="item-1">item1</li>
    <li id="item-2">item2</li>
    <li id="item-3">item3</li>
    <li id="item-4">item4</li>
    <li id="item-5">item5</li>
</ul>
```

假如 `ul` 中的 HTML 是 Ajax 异步插入的，通常我们的做法是 插入完成后遍历每个 li 绑定事件处理程序

```html
<ul id="list"></ul>
<script>
    function bindEvent(el, n) {
        addEvent(lis[i], 'click', function() { console.log(i); });
    }
    // 用 setTimeout 模拟 Ajax 伪代码
    setTimeout(function() {
        var ajaxData = '<li id="item-1">item1</li> <li id="item-2">item2</li> <li id="item-3">item3</li> <li id="item-4">item4</li> <li id="item-5">item5</li>';
        var ul = document.getElementById('list')
        ul.innerHTML(ajaxData);
        var lis = ul.getElementsByTagName('li');

        for (var i = 0; i < lis.length; i++) {
            bindEvent(lis[i], i);
        }
    }, 1000);
</script>
```

我们再使用事件代理把事件绑定到 `ul` 元素上，我们知道很多事件可以冒并沿着 DOM 树传播到所有的父元素上，我们只需要判断目标元素是不是我们想绑定的真正元素即可

```html
<ul id="list"></ul>
<script>
function delegateEvent(el, eventType, fn) {
    addEvent(el, eventType, function(event) {
        event = event || window.event;
        var target = event.target || event.srcElement;
        fn(target);
    });
}

var el = document.getElementById('list');
// 用 setTimeout 模拟 Ajax 伪代码
setTimeout(function() {
    var ajaxData = '<li id="item-1">item1</li> <li id="item-2">item2</li> <li id="item-3">item3</li> <li id="item-4">item4</li> <li id="item-5">item5</li>';
    el.innerHTML(ajaxData)
}, 1000);

delegateEvent(el, 'click', function(target) {
    console.log(target.id);
});
</script>
```

显然使用了事件代理之后，代码变少了。逻辑也很清晰，关键是以前需要 N 次的绑定操作现在只需要一次

## jQuery 中的事件绑定

以 jQuery1.6.4 为例，jQuery 提供了很多事件绑定的 API。例如： `delegate()`, `bind()`, `click()`, `hover()`, `one()`, `live()`，这些方法其实都是一些别名，核心是调用了 jQuery 底层事件的 `jQuery.event.add` 方法。其实现也是上文提到的 `addEventListener` 和 `attachEvent` 两个 API

这些 API 主要是为了方便绑定事件的各种场景，并且内部处理好了兼容性问题。还有一个比较好用的地方就是 `事件命名空间`。比如：两个弹出层都向 document 绑定了点击关闭事件，但是如果只想解绑其中一个。这时候使用命名空间再合适不过了。可以试试这个小例子 [Event Binding](http://jsbin.com/sacinereju/edit?html,output)

```javascript
$(document).bind('click.handler1', function() { console.log(1);})
$(document).bind('click.handler2', function() { console.log(2);})

$(document).unbind('click.handler2');   // 解除指定的
$(document).unbind('click');            // 解除所有点击事件
$(document).unbind()                    // 解除所有事件
```

## 自定义事件与发布/订阅者设计模式

自定义事件是设计模式中的 [发布/订阅者](https://zh.wikipedia.org/wiki/%E5%8F%91%E5%B8%83/%E8%AE%A2%E9%98%85) 的一种实现。发布者与订阅者松散地耦合，而且不需要关心对方的存在。[这里](https://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/)有 NC 大师的一种实现。实际使用过程中，主要被运用在异步操作比较多的场景和不同系统之间消息通信，之前的[文章](/2016/07/31/something-have-to-say-with-JD-item/#TOC-25)中有过一些实例

## 引用

* [事件驱动程序设计](https://zh.wikipedia.org/wiki/%E4%BA%8B%E4%BB%B6%E9%A9%85%E5%8B%95%E7%A8%8B%E5%BC%8F%E8%A8%AD%E8%A8%88)
* [Introduction to Events](http://www.quirksmode.org/js/introevents.html)
* [Custom events in JavaScript](https://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/)
