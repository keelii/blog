+++
title = "《JavaScript 权威指南》读书笔记 15 - 脚本化文档"
isCJKLanguage = true
date = "2016-08-12 15:36:59 +0800"
categories = ["javascript","JavaScript_The_Definitive_Guide"]
tags = []
+++

每个 Window 对象有一个 document 属性引用了 Document 对象。Document 对象表示窗口的内容，它是一个巨大的 API 中的核心对象，叫做文档对象模型（Document Obejct Model, DOM），用来展示和操作文档内容

<!--more-->

## DOM 概览

HTML 或 XML 文档的嵌套元素在 DOM 中以「树」的形式展示。HTML 文档的树装结构包含表示 HTML 标签或元素（如 body, p）和表示文本字符串的节点，也可能包含表示 HTML 注释的节点

```html
<html>
  <head>
    <title>Simple Document</title>
  </head>
  <body>
    <h1>Heading</h1>
    <p>This is a <i>paragraph</i></p>
  </body>
</html>
```

置换成 DOM 树表示


```html

                    +------------+
                    |  Document  |
                    +-----+------+
                          |
                    +-----+------+
                    |   <html>   |
                    +-----+------+
                          |
     +--------------------+--------------------+
     |                                         |
+----+------+                             +----+-----+
|  <head>   |                             |  <body>  |
+----+------+                             +----+-----+
     |                                         |
+----+------+                     +------------+------------+
|  <title>  |                     |                         |
+-----------+                 +----+---+               +---------+
                              |  <h1>  |               |   <p>   |
+------------------+          +--------+               +---------+
| "Simple Document"|                                        |
+------------------+                            +-----------+-----------+
                                                |                       |
                                         +------+--------+         +----+-----+
                                         | "This is a"   |         |   <i>    |
                                         +---------------+         +----+-----+
                                                                        |
                                                                   +----+------+
                                                                   |"paragraph"|
                                                                   +-----------+
```

上图中每个方框是文档的一个节点（node），它表示一个 Node 对象。注意树形的根部是 Document 节点，它代表整个文档。代表 HTML 元素的节点是 Element 节点。代表文本的节点是 Text 节点。Document、Element 和 Text 是 Node 的子类

## 选取文档元素

### 通过 ID 选择元素

HTML 元素可以有一个 id 属性，在文档中该值必须 **唯一**，可以使用 getElementById() 方法选取一个基于唯一 ID 的元素

```javascript
var section1 = document.getElementById('selection1');
```

在低于 IE 8 版本的浏览器中，**getElementById() 对匹配元素的 ID 不区分大小写，而且也返回匹配 name 属性的元素**

### 通过名字选取元素

```javascript
var radiobuttons = document.getElementsByName('favorite_color');
```

getElementsByName() 定义在 HTMLDocument 类中，而不在 Document 类中，所以它 **只针对 HTML 文档可用**，XML 中不可用。它返回一个 NodeList 对象，后者的行为类似一个包含若干 Element 对象的只读数组。在 IE 中，也会返回 id 属性匹配指定的元素

### 通过标签名选取元素

```javascript
// 返回所有的 span 标签元素
var spans = document.getElementsByTagName('span');
// 返回所有元素
var allTags = document.getElementsByTagName('*');
// 选取第一个 span 里面的所有 a 标签
// Element 类也定义 getElementsByTagName() 方法，
// 它只取调用该方法的元素（spans）的后代元素
var links = spans[0].getElementsByTagName('a');
```

HTMLDocument 对象还定义了两个属性，它们指代特殊的单个元素而不是集合：`document.body` 是一个 HTML 文档的 <body> 元素；`document.head` 是 <head> 元素。这些属性总是会定义的。**即使文档中没有 head 或 body 元素，浏览器也将隐式地创建他们**

> getElementsByName() 和 getElementsByTagName() 都返回 NodeList 对象，而类似 document.images 和 document.forms 的属性为 HTMLCollection 对象。
> 这些对象都是只读类数组对象。有 length 属性，也可以被索引到，也可以进行循环迭代

### 通过 CSS 类选取元素

HTML 元素的 class 属性值是一个以空格隔开的列表，可以为空或者包含多个标识符

```javascript
// 查找 class 属性追念 warning 的所有元素
var warnings = document.getElementsByClassName('warning')
```

注意除了 IE8 及以下低版本浏览器，getElementsByClassName() 在所有的浏览器中都实现了

### 通过 CSS 选择器选取元素

CSS 样式表有一种非常强大的语法，那就是选择器，用来描述文档中的若干元素

```html
#nav          // id="nav" 的元素
div           // 所有 <div> 元素
.warning      // 所有 class 属性值包含 "warning" 的元素
p[lang="fr"]  // 所有属性 lang 为 fr 的 <p> 元素
*[lang="fr"]  // 所有属性 lang 为 fr 的元素
```

## 文档结构和遍历

### 作为节点树的文档

Document 对象、它的 Element 对象和文档中表示文本的 Text 对象都是 Node 对象。Node 对象有以下属性：

* __parentNode__ 该节点的父节点，Document 对象没有父节点，它的 parentNode 返回 null
* __childNodes__ 只读的类数组对象（NodeList 对象），表示该节点的所有子节点
* __firstChild、lastChild__ 该节点的子节点中的第一个或最后一个
* __nextSibling、previoursSibling__ 该节点的兄弟节点中的前一个或下一个
* __nodeType__ 该节点的类型
  * __11__ - DocumentFragment 节点
  * __9__ - Document 节点
  * __8__ - Comment 节点
  * __3__ - Text 节点
  * __1__ - Element 节点
* __nodeVlaue__ Text 节点或 Comment 节点的文本内容
* __nodeName__ 元素标签名，以大写形式表示

```javascript
// 注意删除了空格和换行
// <html><head><title>Test</title></head><body>Hello World!</body></html>
document.childNodes[0].childNodes[1]      // => body 节点
document.firstChild.firstChild.nextSibling // => null title 节点的下个兄弟节点为 null
```

## 属性

HTML 元素由一个标签和一组称为属性（attribute）的名/值对组成

### HTML 属性作为 Element 的属性

```javascript
var image = document.getElementById('myimage');
var imgurl = image.src;

var f = document.forms[0];
f.action = 'http://www.example.com/submit.php';
f.method = 'POST';
```

HTML 属性名不区分大小写，但是 JavaScript 则区分。用 JavaScript 取元素属性名的时候一般用小写，如果属性名是多个单词用驼峰式的规则，例如：defaultChecked、tabIndex。如果属性是 JavaScript 中的保留字，一般用 html 前缀，比如 for 属性，使用 htmlFor 来访问。class 则不同，使用 className 来访问

### 获取和设置非标准 HTML 属性

```javascript
var image = document.images[0];
// getAttribute 始终返回字符串
var width = parseInt(image.getAttribute('width'))
image.setAttribute('class', 'thumbnail)
```

### 数据集属性

有时候在 HTML 元素上绑定一些额外的信息会很有帮助（通常给 JavaScript 来读取），一般可以把信息存储在 HTML 属性上

HTML 5 提供了一个解决文案。在 HTML 5 文档中，任意以「data-」为前缀的小写的属性名称都是合法的。这些「数据集属性」将不会对元素表示产生影响

HTML 5 还在 Element 对象上定义了 dataset 属性。该属性指代一个对象，它的各个属性对应于去掉前缀的 data- 属性。因此 dataset.x 应该保存 data-x 属性的值。带连字符的属性对应于驼峰命名法属性名：data-jquery-test 属性就变成 dataset.jqueryTest 属性

### 作为 HTML 的元素内容

读取 Element 的 innerHTML 属性作为字符串标记返回那个元素的内容。设置元素的 innerHTML 属性则调用 Web 浏览器的解析器，用新的字符串内容解析替换当前内容

通常来说设置 innerHTML 效率很高，但是对 innerHTML 属性使用「+=」操作符时效率比较低下，因为它既要序列化又要解析

HTML 5 还标准化了 outerHTML 属性，表示返回包含标签本身的 HTML 内容

另外 IE 引入了一个 insertAdjacentHTML() 方法，它将任意的 HTML 标记字符串插入到指定的元素「相邻」的位置。标记是该方法的第二个参数。并且「相邻」的精确含义依赖于第一个参数的值。第一个参数为具有以下值之一的字符串：「beforebegin」、「afterbegin」、「beforeend」、「afterend」

```html
    |<div id="target">|This is the element content|</div>|
    |                 |                           |      |
 beforebegin     afterbegin                  beforeend afterend
```

### 作为纯文本的元素内容

查询线文本形式的元素内容，
标准的方法是 Node 的 textContent 属性

```javascript
var para = document.getElementsByTagName('p')[0]
var text = para.textContent;
para.textContent = 'Hello World!';
```

textContent 属性除 IE 其它浏览器都支持，不支持的可以用 innerText 属性来代替。textContent 属性就是将指定元素所有的后代 Text 节点简单地串联在一起。但是和 textContent 不同。innerText 不返回 script 元素的内容，它会忽略多余空白，并试图保留表格格式。同时 innerText 针对某些表格元素（如 table、tbody、tr）是只读的属性

```javascript
function textContente(e) {
    var child, type, s = '';
    for (child = e.firstChild; child != null; child = child.nextSibling ) {
        type = child.nodeType;
        if ( type === 3 || type === 4 )
            s += child.nodeValue;
        else if ( type === 1 )
            s += textContent(child);
    }
    return s;
}
```

## 创建、插入和删除节点

一个简单的动态插入脚本的方法

```javascript
function loadasyn(url) {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.src = url;
    head.appendChild(s);
}
```

### 创建节点

```javascript
document.createElement('script')
document.createTextNode('text node content')
```

还有一种创建新文档节点的方法是复制已存在的节点。第个节点有一个 cloneNode() 方法来返回该节点的一个全新副本。给方法传递参数 true 也能够递归地复制所有后代节点，或传递参数 false 只执行一个浅复制

### 插入节点

下面代码展示了 insertBefore() 和 appendChild() 方法使用场景

```javascript
function insertAt(parent, child, n) {
    if ( n < 0 || n > parent.childNodes.length ) throw new Error('invalid index');
    else if ( n == parent.childNodes.length ) parent.appendChild(child);
    else parent.insertBefore(child, parent.childNodes[n]);
}
```

### 删除和替换节点

removeChild() 方法删除一个子节点并用一个新的节点取而代之

```javascript
n.parentNode.removeChild(n);
n.parentNode.replaceChild(document.createTextNode('[ REDACTED ]'), n)
```

### 使用 DocumentFragment

DocumentFragment 是一种特殊的 Node，它作为其他节点的一个临时窗口。像这样创建一个 DocumentFragment：

```javascript
var frag = document.createDocumentFragment();
```

像 Document 节点一样，DocumentFragment 是独立的，而不是任何其他文档的一部分。它的 parentNode 总是 null。但类似 Element，它可以有任意多的子节点，可以用 appendChild()、insertBefore() 等方法来操作它们

## 文档和元素的几何开头和滚动

### 文档坐标和视口坐标

元素的位置是以像素来表示的，向右代表 X 坐标增加，向下代表 Y 坐标增加。但是，有两个不同的点作为坐标系原点：元素的 X 和 Y 坐标可以相对于文档的左上角或者相对于在其中显示文档的视口左上角。在顶级窗口和标签页中，「视口」只是实际显示文档内容的浏览器的一部分：它 **不包括** 浏览器「外壳」（如菜单、工具条和标签页）。针对框架页中显示的文档，视口是定义了框架页的 iframe 元素。无论在何种情况下，当讨论元素的位置时，必须弄清楚所使用的坐标是文档坐标还是视口（窗口）坐标

如果文档比视口要小，或者说它还未出现滚动，则文档的左上角就是视口的左上角，文档和视口坐标系统是同一个。但是，一般来说，要在两种坐标系之间互相转换，必须加上或者减去滚动的偏移量（scroll offset）

为了在坐标系之间互相转换，我们需要判定浏览器窗口的流动条的位置。Window 对象的 pageXOffset 和 pageYOffset 属性在所有浏览器中提供这些值。除了 IE 8 以及更早的版本以外。也可以使用 scrollLeft 和 scrollTop 属性来获得滚动条的位置。令人迷惑的是，正常情况下通过查询文档的根节点（document.documentElement）来获取这些属性值，但在怪异模式下，必须在文档的 body 元素上查询它们，下面这个是一种兼容方法

```javascript
function getScrollOffsets(w) {
    w = w || window;
    if ( w.pageXOffset != null ) return { x: w.pageXOffset, y: pageYOffset };

    var d = w.document;
    if ( document.compatMode == 'CSS1Compat' )
        return { x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop };

    return { x: d.body.scrollLeft, y: d.body.scrollTop };
}
```

### 查询元素的尺寸

判定一个元素的尺寸和位置最简单的方法是调用它的 getBoundingClientRect() 方法。该方法是在 IE 5 中引入的，而珔当前的所有浏览器都实现了（然而并非如此）。它不需要参数，返回一个有 left, right, top 和 bottom 属性的对象

### 滚动

window 对象的 scrollTop() 方法接受一个点的 X 和 Y 坐标，并作为滚动条的偏移量设置它们。也就是窗口滚动到指定的点出现在视口的左上角

### 关于元素尺寸、位置和溢出更多的信息

getBoundingClientRect() 方法在所有当前的浏览器上都有定义，但如果需要支持老式浏览器就不行了。元素的尺寸比较简单：任何 HTML 元素的只读属性 offsetWidth 和 offsetHeight 以 CSS 像素返回它的屏幕尺寸。返回尺寸 **包含** 元素的边框和内边距，除去了外边距

所有 HTML 元素拥有 offsetLeft 和 offsetTop 属性来返回元素的 X 和 Y 坐标。对于很多元素，这些值是文档坐标，并直接指定元素的位置。**但对于已定位的元素的后代元素和一些其他元素（如表格），这些属性返回的坐标是相对于祖先元素的而非文档。** offsetParent 属性指定这些属性所相对的父元素。如果 offsetParent 为 null，这些属性都是文档坐标，因此，一般来说用 offsetLeft 和 offsetTop 来计算元素 e 的位置需要一个循环：

```javascript
function getElementPosition(e) {
    var x = 0, y = 0;
    while (e != null) {
        x += e.offsetLeft;
        y += e.offsetTop;
        e = e.offsetParent;
    }
    return { x: x, y: y };
}
```

除了这些名字以 offset 开头的属性外，所有的文档元素定义了其它的两组属性，基名称一组以 client 开头，另一组以 scroll 开头。即，每个 HTML 元素都有以下这些属性：

```html
offsetWidth         clientWidth          scrollWidth
offsetHeight        clientHeight         scrollHeight
offsetLeft          clientLeft           scrollLeft
offsetTop           clientTop            scrollTop
offsetParent
```

clientWidth 和 clientHeight 类似 offsetWidth 和 offsetHeight，不同的是它们 **不包含边框大小**，只包含内容和它的内边距。同时，如果浏览器在内边距和边框之间添加了滚动条，clientWidth 和 clientHeight 在其返回值中也不包含滚动条。内联元素，clientWidth 和 clientHeight 总是返回 0

## HTML 表单

_表 15-1 HTML 表单元素_

| HTML 元素                                                       | 类型属性          | 事件处理程序 | 描述和事件                                                           |
| ---                                                             | ---               | ---          | ---                                                                  |
| &lt;input type="button"&gt; or<br> &lt;button type="button"&gt; | “button”          | onclick      | 按钮                                                                 |
| &lt;input type="checkbox"&gt;                                   | “checkbox”        | onchange     | 复选按钮                                                             |
| &lt;input type="file"&gt;                                       | “file”            | onchange     | 文件域，value 属性只读                                               |
| &lt;input type="hidden"&gt;                                     | “hidden”          | none         | 数据由表单提交，但对用户不可见                                       |
| &lt;option&gt;                                                  | none              | none         | Select 对象的单个选项，事件对象 <br> 在 Select 对象上，而不是 option |
| &lt;input type="password"&gt;                                   | “password”        | onchange     | 密码输出框，输入的字符不可见                                         |
| &lt;input type="radio"&gt;                                      | “radio”           | onchange     | 单选按钮                                                             |
| &lt;input type="reset"&gt; or<br> &lt;button type="reset"&gt;   | “reset”           | onclick      | 重置表单按钮                                                         |
| &lt;select&gt;                                                  | “select-one”      | onchange     | 单选下拉框                                                           |
| &lt;select multiple&gt;                                         | “select-multiple” | onchange     | 多选列表                                                             |
| &lt;input type="submit"&gt; or<br> &lt;button type="submit"&gt; | “submit”          | onclick      | 表单提交按钮                                                         |
| &lt;input type="text"&gt;                                       | “text”            | onchange     | 单行文本输出域；type 默认 text                                       |
| &lt;textarea&gt;                                                | “textarea”        | onchange     | 多行文本输入域                                                       |

### 选择框和选项元素

Select 元素表示用户可以做出选择的一组选项（用 Option 元素表示）。浏览器通常将其渲染为下拉菜单的形式，但当指定其 size 属性值大于 1 时，它将显示为列表中的选项（可能有滚动条）。Select 元素的 multiple 属性决定了 Select 是不是可以多选

当用户选取或取消一个选项时， Select 元素触发 onchange 事件。针对「select-one」属性的 Select 元素，它的可读/写属性 selectedIndex 指定了哪个选项当前被选中。针对「select-multiple」元素，单个 selectedIndex 属性不足以表示被选中的一组选项。这种情况下需要遍历 options[] 数组的元素，检测每个 Option 对象的 selected 属性。注意 Option 并没有相关事件处理程序，一般只能给 Select 元素绑定事件

## 其他文档特性

### Document 的属性

* __cookie__ 允许 JavaScript 读、写 HTTP cookie 的属性
* __domain__ 允许当 Web 页面交互时，相同域名下互相信任的 Web 服务器之间协作放宽同源策略安全限制
* __lastModified__ 包含文档修改时间的字符串
* __location__ 与 Window 对象的 location 属性引用同一个 Location 对象
* __referrer__ 如果有，它表示浏览器来到当前页面的上一个页面。与 HTTP 的 Referer 头信息内容相同
* __title__ 文档中 title 标签的内容
* __URL__ 文档的 URL，只读字符串而不是 Location 对象。该属性值与 location.href 的 __初始值__相同，不会发生变化

### document.write() 方法

document.write() 会将其字符串参数连接起来，然后将结果字符串插入到文档中调用它的脚本元素的位置。当脚本执行结束，浏览器解析生成输出并显示它。例如，下面代码把信息输出到一个静态的 HTML 文档中：

```html
<script>
    document.write('Document title: ' + document.title);
    document.write('URL: ' + document.URL);
    document.write('Referred by: ' + document.referrer);
</script>
```

__只有在解析文档时才能使用 write() 方法输出 HTML 到当前文档中__。也就是说能够在 script 元素的顶层代码中调用 document.write()，就是因为这些脚本的执行是文档解析流程的一部分。如果将 docuemnt.write() 放在一个函数的定义中，而该函数的调用是从一个事件处理程序中发起的，产生的结果未必是你想要的——事实上，它会擦除当前文档和它包含的脚本。同理，在设置了 defer 或 async 属性的脚本中不要使用 document.write()
