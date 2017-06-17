+++
title = "jQuery data 方法的一个小特技"
isCJKLanguage = true
date = "2017-05-03T17:59:45+08:00"
categories = ["javascript"]
tags = ["jQuery"]
+++

通常我们在用 JavaScript 操作 DOM 元素的时候会往 DOM 上临时添加一些参数，用来记住一些状态，或者从后端取参数值等

一般通过在 HTML 标签上添加自定义属性来实现，但是这样会不可避免的访问 DOM，性能上并不好。如果你使用 jQuery 的话建议使用 `$el.data()` 方法来取元素上 `data-*` 的值，比如：

```html
<div id="demo" data-key="value"></div>
<script>
    $('#demo').attr('data-key')
    $('#demo').data('key')  // 第一次访问 DOM，以后从缓存取
</script>
```

这两个方法的区别在于 attr 每次都会直接访问 DOM 元素，而 data 方法会缓存第一次的查找，后续调用不需要访问 DOM

很明显建议使用后者，但是在 **低版本的 jQuery** 中默认会对 data 方法取到的值进行粗暴的强制数据类型转换「parseFloat」。看下面代码

```html
<div id="demo0" data-key="abc">字符串</div>
<div id="demo1" data-key="123">数字</div>
<div id="demo2" data-key="123e456">科学计数法</div>
<div id="demo3" data-key="0000123">八进制数字</div>
<script src="jquery-1.6.4"></script>
<script>
    $('#demo0').data('key')  // "abc"
    $('#demo1').data('key')  // 123
    $('#demo2').data('key')  // Infinity
    $('#demo3').data('key')  // 83
</script>
```

后面两种显然出错了，就是因为 jQuery 对属性值进行了强制 parseFloat 操作。这种转换是方便了使用者，如果是数字的话我们取到这个值进行计算什么的就不用再转数据类型了，但是一不小心就会出 bug

发现这个 bug 的时候第一感觉是 jQuery 不应该没考虑到这一点呀。后来果断去查了下最新版的 jQuery 源代码，发现已经修复了。核心代码在 [data.js 35 行](https://github.com/jquery/jquery/blob/master/src/data.js#L36)，如下

```javascript
function getData( data ) {
    if ( data === "true" ) {
        return true;
    }

    if ( data === "false" ) {
        return false;
    }

    if ( data === "null" ) {
        return null;
    }

    // Only convert to a number if it doesn't change the string
    // 重点就在这里 →_→
    if ( data === +data + "" ) {
        return +data;
    }

    if ( rbrace.test( data ) ) {
        return JSON.parse( data );
    }

    return data;
}
```

getData 方法就返回了节点属性的值，只不过加了一些特殊处理使得我们取到了没有 bug 的值，关键地方就在这里： `data === +data + ""` 。这行代码做了些什么神奇的事情

**将节点的属性值强制转换成数字「+data」后再转成字符串「+ ""」，如果转换后的值与原来相等就取转换后的值**

可以简单的这么理解：jQuery 会尝试转换数据类型，如果转换后和转换前的 **长得一样** 那么 jQuery 就认为它是需要被转换成数字的。这样就可以完美规避上面例子中的两种问题，我们来测试一下

```javascript
var data = 'abc'
console.log(data === +data + "")        // false 不转换，直接返回字符串原值

var data = '123'
console.log(data === +data + "")        // true 转换，使用转换后的数字类型值

var data = '123e456'
console.log(data === +data + "")        // false 不转换，直接返回字符串原值

var data = '0000123'
console.log(data === +data + "")        // false 不转换，直接返回字符串原值
```



