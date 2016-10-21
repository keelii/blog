+++
title = "《JavaScript 权威指南》读书笔记 13 - Web 浏览器中的 JavaScript"
isCJKLanguage = true
date = "2016-07-14 14:11:08 +0800"
categories = ["javascript","JavaScript_The_Definitive_Guide"]
tags = []
+++

## 客户端的 JavaScript

Window 对象是所有客户端 JavaScript 特性和 API 的主要接入点。它表示 Web 浏览器的一个窗口或者窗体，并且可以用标识符 window 来引用它。Window 对象定义了一些属性，比如:
<!--more-->
```javascript
// 页面跳转
window.location = 'http://www.oreilly.com/';
// 页面圣诞框
alert('Hello World')
setTimeout(function () { alert('Hello later World') }, 1000)
```

window 对象也是全局对象。可以省略「window.」来调用上面的方法。这意味着 windows 对象牌作用域链的顶部，它的属性和方法实际上是全局变量和全局函数。window 对象有一个引用自己的属性，叫做 window。如果需要引用窗口对象本身可以用这个属性，但是如果只想要引用全局窗口对象的属性，通常并不需要用 window

windows 对象还定义了很多其他重要的属性、方法和构造函数。其中最重要的一个属性是 document，它引用 Document 对象，后者表示显示在窗口中的文档。document 对象有一些重要方法，比如 getElementById() 获取一个 DOM 元素，它返回一个 Element 对象也有其他重要属性和方法，比如，给元素绑定点击事件 onclick

## 在 HTML 里嵌入 JavaScript

在 HTML 里嵌入 客户端 JavaScript 有 4 种方法：

* 内联，放置在 &lt;script&gt; 和 &lt;/script&gt; 标签之间
* 外链，放置在由 script 标签的 src 属性指定的外部文件中
* 放置在 HTML 事件处理程序中，该事件处理程序由 onclick 或 on[eventType] 这样的 HTML 属性指定
* 放在一个 URL 里，这个 URL 使用特殊的「javascript:」协议

```html
<!--html 中的事件处理程序-->
<input type="checkbox" onchange="any_javascript_statement" />
<!--url 中的javascript-->
<a href="javascript: new Date().toLocaleTimeString();">What time is it?</a>
```

使用外链 src 文件方式有一些优点：

* 可以把 JavaScript 代码从 HTML 文件中删除，这有助于保持内容和行为的分离，从而简化 HTML 文件
* 如果多个 Web 页面共用相同的 JavaScript 代码，用 src 属性可以让你只管理一份代码，而不用在代码变更时每个页面都更新
* 如果一个 JavaScript 文件由多个页面共享，就只需要下载一次，以后的页面只要引用过就可以使用缓存检索它
* src 属性值可以是任意的 URL，因此来自一个 Web 服务器的 JavaScript 程序或 Web 页面可以使用由 **另外一个** Web 服务器输出的代码，很多广告依赖与些
* 从其它网站载入脚本的能力，可以让我们更好地利用缓存，使用 CDN

### 脚本的类型

script 标签默认的类型「type」是「text/javascript」，如果要使用不标准的脚本语言，如 Microsoft 的 VBScript（只有 IE 支持），就必须用 type 属性指定脚本的 MIME 类型：

```html
<script type="text/vbscript">
// 这里是 VBScript 代码
</script>
```

另外很多老的浏览器还支持 language 属性，作用和 type 一样，不过已经废弃了，不应该再使用了

当 Web 浏览器遇到 &lt;script&gt; 元素，并且这个元素包含其值不之前能点浏览器识别的 type 属性时，它会解析这个元素但不会尝试显示或执行它的内容。这意味着可以使用 &lt;script&gt; 来嵌入任意的文件数据到文档里，比如 [handlebars](http://handlebarsjs.com/) 模板引擎，通常把模板放在自定义 type 的 script 标签中：

```html
<script id="entry-template" type="text/x-handlebars-template">
    <div class="entry">
        <h1>{{title}}</h1>
        <div class="body">
            {{body}}
        </div>
    </div>
</script>
```

### 同步、异步和延迟的脚本

JavaScript 第一次添加到 Web 浏览器时，还没有 API 可以用来遍历和操作文档的结构和内容。当文档还在载入时，JavaScript 影响文档内容的唯一方法是使用 document.write() 方法

```html
<h1>Table of Factorials</h1>
<script>
function factorial(n) {
    if ( n <= 1 ) return n;
    else return n * factorial(n - 1);
}
document.write('<table>');
document.write('<tr><th>n</th><th>n!</th></tr>');
for (var i = 1; i <= 10; i++) {
    document.write('<tr><td>'+ i +'</td><td>'+ factorial(i) +'</td></tr>')
}
document.write('</table>');
document.write('Generated ad ' + new Date());
</script>
```

当脚本把文本传递给 document.write() 时，这个文本被添加到文档输入流中，HTML 解析器会在当前位置创建一个文本节点，将文本插入这个文本节点后面。我们并不推荐使用 document.write()，但在某些场景下它有很重要的用途。当 HTML 解析器遇到 script 元素时，它默认 **必须先执行脚本**，然后恢复文档的解析和渲染。这对于内联脚本没什么问题，但如果脚本源代码是一个由 src 属性指定的外部文件，这意味着脚本后面的文档部分在下载和执行脚本之间，都不会出现在浏览器中

脚本的执行只在默认情况下是同步和阻塞的。script 标签可以有 defer 和 async 属性，这可以改变脚本的执行方式。HTML 5 说这些属性只在和 src 属性联合使用时才有效，但有些浏览器还支持延迟的内联脚本

```html
<script src="a.js" defer></script>
<script src="b.js" async></script>
```

defer 和 async 属性都在告诉浏览器链接进来的脚本不会使用 document.write()，也不会生成文档内容，因此不蜂鸣器可以在下载脚本时继续解析和渲染文档，defer 属性使得浏览器延迟脚本的执行，直到文档的载入和解析完成，并可以操作。async 属性使得浏览器可以尽快地挂靠脚本，而不用在下载脚本时阻塞文档解析。如果 script 标签同时有两个属性，同时支持两者的浏览器会 **遵从 async 属性并忽略 defer 属性**

注意，延迟的脚本会按它们在文档里的 **出现顺序执行**。而异步脚本在它们载入后执行，这意味着它们可能会 **无序执行**

### 事件驱动的 JavaScript

上面的打印斐波那契数列程序在页面载入时开始挂靠，生成一些输出，这种程序今天已经不沉凶了。通常我们使用注册事件处理程序函数来写程序。之后在注册的事件发生时 **异步** 调用这些函数。

事件都有名字，比如 click, change, load, mouseover, keypress, readystatechange 等，如果想要程序响应一个事件，就需要注册一个事件处理函数

事件处理程序的属性名字一般都以「on」开始，后面跟着事件的名字。大部分浏览器中的事件会把一个对象传递给事件处理程序作为参数，那个对象的属性提供了事件的详细信息。比如，传递给点击事件的对象，会有一个属性说明鼠标的哪个按钮被点击了。（在 IE 里，这些事件信息被存储在全局 event 对象里，而不是传给处理程序的函数）

有些事件的目标是文档元素，它们会经常往上传递事件给文档树。这个过程叫做「**冒泡**」

关于事件传播顺序可以参考 ppk 的 [这篇文章](http://www.quirksmode.org/js/events_order.html)

### 客户端 JavaScript 线程模型

JavaScript 语言核心并不包含任何线程机制，并且客户端 JavaScript 传统上也没有定义任何线程机制。HTML 5 定义了一种作为后台线程的「WebWorker」，但是客户端 JavaScript 还像严格的单线程一样工作。甚至当可能并发执行的时候，客户端 JavaScript 也不会知道是否真的的有并行逻辑执行

单线程执行是𧫂让编程更加简单。编写代码时可以确保两个事件处理程序不会同一时刻运行，操作文档的内容时也不必操心会有其它线程试图同时修改应该没配，并且永远不需要在写 JavaScript 代码的时候操心锁、死锁和竟态条件（race condition）

单线程执行意味着浏览器 **必须在脚本和事件处理程序运行的时候停止响应用户输入**。这为 JavaScript 程序员带来了负担，它意味着 JavaScript 脚本和事件处理程序不能运行太长时间。如果一个脚本执行 **计算密集** 的任务，它将会使文档载入带来延迟，用户无法在脚本执行完成前看到内容。浏览器可能变得无法响应甚至崩溃

### 客户端 JavaScript 时间线

JavaScript 程序执行的时间线

1. Web 浏览器创建 Document 对象，并且开始解析 Web 页面，解析 HTML 元素和它们的文本内容后添加 Element 对象和 Text 节点到文档中。在这个阶段 document.readystate 属性的值是「loading」
2. 当 HTML 解析器遇到没有 async 和 defer 属性的 script 元素时，它把这些元素添加到文档中，然后执行内或外部脚本。这些脚本会同步执行，并且在脚本下载和执行时解析器会暂停。这样脚本就可以用 document.write() 来把文本插入到输入流中。解析器恢复时这些文本会成为文档的一部分。同步脚本经常简单定义函数和注册后面使用的注册事件处理程序，但它们可以遍历和操作文档树，因为在它们执行时已经存在了。这样，同步脚本可以看到它自己的 script 元素和它们之前的文档内容
3. 当解析器遇到设置了 async 属性的 script 元素时，它开始下载脚本文本，并继续解析文档。脚本会在它下载完成后尽快执行，但是解析器没有停下来等它下载。异步脚本禁止使用 document.write() 方法。它们可以看到自己的 script 元素和它之前的所有文档元素，并且可能或干脆不可能访问其它的文档内容
4. 当文档完成解析，document.readyState 属性变成「interactive」
5. 所有有 defer 属性的脚本，会按它们在文档里出现的顺序执行。异步脚本可能也会在这个时间执行。延迟脚本能访问完整的文档树，禁止使用 document.write() 方法
6. 浏览器在 Document 对象上触发 DOMContentLoaded 事件。这标志着程序执行 **从同步脚本执行阶段转换到了异步事件驱动阶段**。但要注意，这时可能还胡异步脚本没有执行完成
7. 这时，文档已经完全解析完成，但是浏览器可能还在等待其它内容载入，如图片。当所有这些内容完成时，并且所有异步脚本完成载入和执行，document.readyState 属性改变为「complete」，Web 浏览器触发 window 对象上的 load 事件
8. 从此刻起，会调用异步事件，以异步响应用户输入事件、网络事件、计时器过期等

这是一条理想的时间线，但是所有浏览器都没支持它的全部细节，所有浏览器普遍都支持 load 事件，都会触发它，它是决定文档完全载入并可以操作最通用的技术，除了 IE 之外，document.readyState 属性已被大部分浏览器实现，但是属性的值在浏览器之间有细微的差别

## 兼容性和互用性

客户端 JavaScript 兼容性和互用性的问题可以归纳为以下三类：

**演化**

Web 平台一直在演变和发展当中。一个标准规范会倡导一个新的特性或 API。如果特性看起来有用，浏览器开发商实现它。如果足够多的开发商实现，开发者开始试用这个特性。有时新浏览器支持一些特性老的却不支持

**未实现**

比如，IE 8 不支持 convas 元素，虽然其它浏览器已经实现了它。IE 也没有对 DOM Level 2 Event 规范实现，即使这个规范在十年前就是标准化了

**bug**

每个浏览器都有 bug，并且没有按照规范准确地实现所有客户端 JavaScript API。有时候编写能兼容各个浏览器的 JavaScript 程序是个很麻烦的工作，必须要研究各种浏览器的兼容性问题

### 处理兼容性问题的类库

比如有的浏览器客户端不支持 canvas 元素，可以使用开源的「explorer canvas」项目，引用 excanvas.js 即可模拟 canvas 元素的功能

### 分级浏览器支持

分级浏览器支持（graded browser support）是由 Yahoo! 率先提出的一种测试技术。从某种维度对浏览器厂商/版本/操作系统进行分级。根据分级来确定哪些特性在哪些浏览器需要支持的程度

### 功能测试

功能测试（capability testing）是解决不兼容性问题的一种技术。比如添加事件 API，在标准浏览器里面是 addEventListener 而低版浏览器里面是 attachEvent，我们就可以通过特性检测来给一个添加事件的公共方法


```html
<script>
if (element.addEventListener) {
    element.addEventListener("keydown", handler, false);
} else if (element.attachEvent) {
    element.attachEvent("keydown", handler);
} else {
    element.onkeydown = handler
}
</script>
```

### 怪异模式和标准模式

doctype 可以触发浏览器的渲染模式，IE 浏览器有怪异模式，可以通过 document.compatMode 属性判断是否是标准模式。如果返回值为「CSS1Compat」则说明浏览器工作在标准模式；如果值是「BackCompat」或者 「undefined」则说明工作在怪异模式

### 浏览器测试

通常我们用功能测试来处理兼容性问题，但有时候可能需要在某种浏览器中解决个别的 bug，同时又没有可用的特性 API，这里只能通过判断浏览器来做兼容性处理，通常可以使用浏览器 UA（user agent）来解析浏览器版本、类型等

### IE 里的条件注释

IE 浏览器中可以通过在 HTML 中添加特殊的注释来告诉浏览器代码在哪个浏览器中作用

```html
<!--[if IE 6]>
这里面的内容只会显示在 IE 6 浏览器中
<![endif]-->
```

IE 的 JavaScript 解释器也支持条件注释，以文本 `/*@cc_on` 开头，以文本 `@*/`结束。下面的条件注释包含了只在 IE 中执行的代码

```javascript
<script><!--忽略 script 标签系统解析有问题-->
/*@cc_on
 @if (@_jscript)
    alert("in IE")
 @end
 @*/
</script>
```

## 安全性

### JavaScript 不能做什么

Web 浏览器针对恶意代码的第一条防线就是它们不支持某些功能。例如，客户端的 JavaScript 没有权限来写入或删除计算机上的文件/目录，这意味着 JavaScript 不能删除数据或者植入病毒

类似地，客户端 JavaScript 没有任何通用的网络能力。HTML 5 有一个附属标准叫 WebSockets 定义了一个类套接字的 API，用于和指定的服务器通信。但是这些 API 都不允许对于范围更广的网络进行直接访问

浏览器针对恶意代码的第二条防线是在自己支持的某些功能上施加限制。比如：

* JavaScript 程序可以打开一个新的浏览器窗口，但是为了防止广告商滥用弹出窗口，很多浏览器限制了这一功能，使得只有为了响应鼠标单击这样的用户触发事件的时候，才能用它
* JavaScript 程序可以关闭 **自己打开的** 浏览器窗口，但是不允许不经过用户确认就关闭其它窗口
* HTML FileUpload 元素的 value 属性是只读的。如果可以设置这个属性，脚本就能设置它为任意期望的文件名，从而导致表单上传指定的文件（比如密码文件）内容到服务器
* 脚本不能读取从不同服务器载入的文档内容，除非这个就是包含该脚本的文档。类似地，一个脚本不能在来自不同服务器的文档上注册事件监听器。这就防止脚本窃取其他页面的用户输入

### 同源策略

同源策略是对 JavaScript 代码能够操作哪些 Web 内容的一条完整的安全限制。当 Web 页面使用多个 iframe 元素或者打开其它浏览器窗口的时候，这一策略通常就会发挥作用。在这情况下，同源策略负责管理窗口或窗体中的 JavaScript 代码以及和其它窗口或帧的交互

文档的来源包含协议、主机、以及载入文档的 URL 商品。从不同 Web 服务器载入的文档具有不同的来源。通过同一主机不同商品载入的文档具有不同来源。使用 `http:` 协议载入的文档和使用 `https:` 协议载入的文档具有不同的来源，**即使它们来自同一个服务器**

**脚本本身的来源和同源策略并不相关**，相关的是脚本所嵌入文档的来源。例如，来自主机 A 的脚本被包含到宿主 B 的一个 Web 页面中。这个脚本的 **来源（origin）** 是主机 B，并且可以完整地访问包含它的文档的内容。如果脚本打开一个新的窗口并载入来自主机 B 的另一个文档，脚本对这个文档的内容也具有完全的访问权限。但是如果脚本打开第三个窗口并载入一个来自主机 C 的文档（或者来自主机 A），同源策略就会发挥作用，阻止脚本访问这个文档

> A 页面包含一个 B 脚本，B 脚本对 A 页面有完全的访问权限，如果 B 脚本控制打开一个 A 服务器上另外一个页面 C，那么脚本也可以访问这个 C 页面，如果 B 脚本控制打开了一个 D 页面，这时就会触发同源策略，即 B 脚本不可以访问 D 页面，**因为 A 和 C 同源，A 和 D 不同源**

**不严格的同源策略**

在某些情况下，同源策略就显得太过严格了，常常表现在多个子域名站点的场景中。比如：来自 A.yourdomain.com 的文档里脚本无法直接读取 B.yourdomain.com 页面的文档，不过可以通过设置 document.domain 为同一个主域来获取访问权限，即给两个域名下的页面都设置 `document.domain="yourdomain.com"`，这样以来两个文档就有了同源性可以相互访问

还有一项已经标准化的技术：**跨域资源共享**（Cross-Origin Resource Sharing）这个标准草案用新的「Origin:」请求头和新的 Access-Control-Allow-Origin 响应头来扩展 HTTP，它允许服务器用头信息显式地列出源，或使用能本符来匹配所有的源并允许由任何地址请求文件，这样就可以实现跨域的 HTTP 请求， XMLHttpRequest 也不会被同源策略所限制了

还有一种新技术，叫做跨文档消息（cross-document messaging），允许来自一个文档的脚本可以传递文本消息到另一个文档的脚本，而不管脚本的来源是否不同。调用 window 对象上的 postMessage() 方法，可以异步传递消息事件

### 跨站脚本

跨站脚本（Cross-site scripting），或者叫 XXS，这个术语表示一类安全问题。攻击者向目标 Web 站点注入 HTML 标签或者脚本

如果 Web 页面动态地产生文档内容，并且这些文档内容是用户提交的，如果没有过滤用户提交内容的话，这个页面很容易遭到跨站脚本攻击，比如：

```html
<script>
var name = decodeURIComponent(window.location.search.substring(1) || "");
document.write("hello " + name)
</script>
```

当页面的 url 被手动拼成恶意参数提交时就会产生 XXS 攻击，比如：

> http://example.com/greet.html?%3Cscript%3Ealert(%22XXS%20attack%22)%3C%2Fscript%3E

打开这个 url 就会弹出「XXS attack」，解决办法通过是对接收参数进行标签屏蔽

```html
<script>
name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
</script>
```

## 客户端框架

从某种意义上讲类库也是框架，它们对 Web 浏览器提供的标准和专用 API 进行封闭，向上提供更高级别的 API，用以更高效地进行客户端编程开发。一但使用就要用框架定义的 API 来写代码，后面有专门的章节讲 jQuery，除了这个常用的类库还有一些其它广泛使用的：

* [Prototype](http://prototypejs.org/)
* [Dojo](https://dojotoolkit.org/)
* [YUI](http://yuilibrary.com/)
* [Closure](https://developers.google.com/closure/)
* [GWT](http://www.gwtproject.org/)