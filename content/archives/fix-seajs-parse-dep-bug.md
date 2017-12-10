+++
title = "解决 seajs parseDependencies 方法引起的依赖解析错误问题"
isCJKLanguage = true
categories = ["javascript"]
tags = ["seajs","parseDependencies"]
date = "2017-11-03T15:51:27.464Z"
+++

使用 seajs 的过程中偶尔会发现 require 进来的模块甚至都没有加载。查看源代码之后发现 seajs 是通过正则表达式匹配出了模块 factory 中的 require 路径

正常情况下，下面这个模块里面 require 的外部模块会解析出依赖 `GLOBAL_ROOT/base/cookie` 和 `GLOBAL_ROOT/base/utils`

```javascript
define('moduleName', function() {
    var a = require('GLOBAL_ROOT/base/cookie')
    var b = require('GLOBAL_ROOT/base/utils')
    // 正常情况 a 应该是个对象，
    console.log(a)
})
```

但是如果 cookie 模块加载失败，a 就会返回 null 这时候再调 a 上面的方法就会报错。当 seajs 内部解析依赖时发生了错误时就会出现这种情况，由于我们使用的是比较老的 seajs 版本（2.2.0），去查看源代码发现 parseDependencies 方法使用了一个正则表达式

```
var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = []

  code.replace(SLASH_RE, "")
      .replace(REQUIRE_RE, function(m, m1, m2) {
        if (m2) {
          ret.push(m2)
        }
      })

  return ret
}
```

我们在控制台里面跑一下看看结果，上面的模块解析正确：

![seajs-works-well](//img30.360buyimg.com/devfe/jfs/t11401/113/1005903134/64122/b08677b9/59fc23d6N998f2848.png)

但是我自己的场景并没有这么简单，我贴上自己的代码时就异常了，由于源码比较多我就放到 jsbin 上了

* [压缩成一行](http://jsbin.com/bowazakosu/edit?html,js,console,output)
* [格式化压缩代码后](http://jsbin.com/likonikoye/edit?html,js,console,output)

有意思的地方就在于 压缩成一行 的代码中是异常的，但是当我把代码格式化后就正常了？！

**解决方法**

seajs 3.x 版本以后 [util-deps.js](https://github.com/seajs/seajs/blob/3.0.0/src/util-deps.js) 引入了一个依赖解析器方法，直接用这个替代原来的即可。至于为什么那个正则对于压缩后的代码没起作用我暂还没详细研究，不过感觉像获取模块依赖关系这种静态分析任务还是用解析器靠谱点，正则有太多的不确定性，虽然它能节省很多代码







