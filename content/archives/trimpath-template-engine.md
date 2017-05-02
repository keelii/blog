+++
title = "TrimPath 模板引擎使用指南"
isCJKLanguage = true
date = "2016-11-21 12:39:49 +0800"
lastmod = "2017-05-02 15:16:49 +0800"
categories = ['javascript', 'template_engine']
tags = ['modifier', 'macro', 'template']
+++

[TrimPath](http://www.summitdowntown.org/site_media/media/javascript/private/trimpath-template-docs/JavaScriptTemplates.html) 是一款轻量级的前端 JavaScript 模板引擎，语法类似 [FreeMarker](http://freemarker.org/), [Velocity](https://velocity.apache.org/)，主要用于方便地渲染 json 数据
<!--more-->
## 语法 Syntax

### 表达式 Expressions

表达式和修饰符（其它模板语言中叫做过滤器 filter）中间用 `|` 分割且 **不能有空格**

```
${expr}
${expr|modifier}
${expr|modifier1:arg1,arg2|modifier2:arg1,arg2|...|modifierN:arg1,arg2}
```

### 语句 Statements
#### 控制流 Control Flow

```
{if testExpr}
    {elseif testExpr}
    {else}
{/if}
```

#### 循环 Loops

```
{for varName in listExpr}
{/for}

{for varName in listExpr}
    ...循环主体...
{forelse}
    ...当 listExpr 是 null 或者 length 为 0 ...
{/for}
```

#### 变量声明 Variable Declarations

变量声明语句用花括号 `{}` 括起来，不需要关闭。类似 JavaScript 中的赋值语句

```
{var varName}
{var varName = varInitExpr}
```

#### 宏声明 Macro Declarations

```
{macro macroName(arg1, arg2, ...argN)}
    ...macro 主体...
{/macro}
```

#### CDATA 部分 CDATA Text Sections

CDATA 部分用来告诉模板引擎不用做任何解析渲染，直接输出。比如展示一个模板字符串本身

```
{cdata}
    ${customer.firstName} ${customer.lastName}
{/cdata}
```

### In-line JavaScript

**eval blocks** 用来执行 JavaScript 代码片段

```
{eval}
    ...模板渲染的时候执行的 JavaScript 代码...
{/eval
```

**minify blocks** 用来压缩内容中的换行符，比如压缩 HTML 属性

```
<div id="commentPanel" style="{minify}
      display:none;
      margin: 1em;
      border: 1px solid #333;
      background: #eee;
      padding: 1em;
    {/minify}">
  ...
</div>
```

## 修饰符 Modifier

修饰符用来处理上一个表达式的结果，并输出内容。类似于 Linux shell 中的管道操作符，使用「|」分割不同修饰符，可以串联使用

```
${name|capitalize}
${name|default:"noname"|capitalize}
```

### 内置修饰符

* __capitalize__ 返回大写内容
* __default:valueWhenNull__ 如果内容为 null，返回 valueWhenNull
* __eat__ 返回空内容，一般用于表达式求值后又不想展示输出的内容
* __escape__ 转换 HTML 字符实体，比如： & 转换成 \&amp;
* __h__ 和 escape 效果一样

### 自定义修饰符

自定义修饰符可以挂载到 contextObject 上的 `_MODIFIERS` 属性上

```
var Modifiers = {
  toFixed: function(value, num) {
    return value.toFixed(num)
  }
}
var out = '${num|toFixed:2}'.process({
  _MODIFIERS: Modifiers,
  num: 1024
})
// => "1024.00"
```

## 宏 Macro

macro 一般用来封装可复用 HTML 模板，类似函数的功能。对于每个模板来说 macro 是私用的。如果想公用 macro，可以保存 macro 引用到 contextObject 上（下次调用 process() 方法的时候再手动挂载上!? ）。需要在调用 process() 方法之前给 contextObject 设置一个空的 exported 属性：`contextObject['exported'] = {}`

这个公用的 macro 设计的有点奇葩，可以参考这个 [示例](http://codepen.io/keelii/pen/dOvgOJ)

```
{macro link(href, name)}
    <a href="${href}">${name}</a>
{/macro}

${link('http://google.com', 'google')}      => <a href="http://google.com">google</a>
${link('http://facebook.com', 'facebook')}  => <a href="http://facebook.com">facebook</a>
```

## 示例

```javascript
var data = {
    name: 'iPhone 6 Plus',
    weight: 480,
    ram: '16gb',
    networks: [
        '移动（TD-LTE)',
        '联通(TD-LTE)',
        '电信(FDD-LTE)'
    ]
}

data._MODIFIERS = {
    toFixed: function(n, num) {
        return n.toFixed(num)
    }
}

var template = '\
名称: ${name}<br>\
重量：${weight|toFixed:2}<br>\
内存：${ram|capitalize}<br>\
网络：\
{for item in networks}\
  {if item_index!=0}|{/if}\
  ${item}\
{/for}';

template.process(data)
```

上面的代码输出：

```html
名称: iPhone 6 Plus<br>
重量：480.00<br>
内存：16GB<br>
网络：
  移动（TD-LTE)
 | 联通(TD-LTE)
 | 电信(FDD-LTE)
```

