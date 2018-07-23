+++
title = "jQuery ajax 方法 data 参数默认 encode 失败的 bug"
isCJKLanguage = true
date = "2018-05-25T19:20:04-07:00"
categories = ["javascript"]
tags = ["jQuery"]
+++

使用 jQuery ajax 方法调用异步接口时 data 参数默认会被添加转码 `encodeURIComponent`，如下：

```javascript
$.ajax({
    url: 'http://your.domain.com/action',
    dataType: 'jsonp',
    data: {
        spaces: 'a b',
        other: '&'
    }
})
```

上面的代码会向 `http://your.domain.com/action?spaces=a+b&other=%26` 发送 get 请求，奇怪的是参数中的 `&` 被正确转码成 `%26`，但是 ` ` 被转成了 `+` 而不是 `%20`

看看正确的转码结果长啥样

```javascript
encodeURIComponent('&') // => "%26"
encodeURIComponent(' ') // => "%20"
```

既然 data 参数里面的 key,value 都要被 encodeURIComponent，那么出现这种情况只能去查 jQuery 源代码了。jQuery 会调用 $.param 方法来编码 data 参数，大概在 **jQuery-1.7.2** 的 _(7736)_ 行：

```javascript
param: function( a, traditional ) {
    // ...
    } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for ( var prefix in a ) {
            buildParams( prefix, a[ prefix ], traditional, add );
        }
    }

    // Return the resulting serialization
    return s.join( "&" ).replace( r20, "+" );
}
```

param 方法内部会再调用 `buildParams` 来把 data 对象键值对添加编码，一切都很正常

然饿最后一行 `replace( r20, "+" )` 是什么鬼！`r20` 变量是内部的一个空白转义符的正则 `/%20/g`

这就有点意思了，为啥把正确的空格编码再转回 `+` 呢？

外事不决问 Google，搜索 `why jquery ajax convert %20 to +` 结果发现有一条 jQuery 官方的 github issue: [Only change %20 to + for application/x-www-form-urlencoded](https://github.com/jquery/jquery/issues/2658)

![google-why-jquery-convert-space-to-plus](//img11.360buyimg.com/devfe/jfs/t20344/242/259059096/183424/9e8e0f30/5b078bbdN06c75a01.png)

根据 issue 的描述大意是说 `convert %20 to +` 这个逻辑只应该在 POST 请求的时候做转换，而不是所有请求。我们的示例中的 jsonp 刚好是 get 请求

继续往下看找到了一个 [commit(60453ce)](https://github.com/dmethvin/jquery/commit/60453ce299a0c84550e70010ceea12d538226bf5) 修复了这个问题

![jquery-param-encode-bug](//img14.360buyimg.com/devfe/jfs/t20692/166/263146843/79735/7f45adb2/5b078b49N8f97629d.png)

注意一点，我们并不能简单的在 data 对象传入的时候手动添加 `encodeURIComponent`：

```javascript
$.ajax({
    url: 'http://your.domain.com/action',
    dataType: 'jsonp',
    data: {
        // 错误的做法
        spaces: encodeURIComponent('a b'),
        other: '&'
    }
})
```

如果 spaces 参数有别的应该被正常编码的字符串，这样会导致正常的被编码的字符被 **两次** encodeURIComponent。所以要正确解决这个问题需要修改 jQuery 源代码，这个可以参考上面的那个 fix commit

