+++
title = "《JavaScript 权威指南》读书笔记 11 - 服务器端的 JavaScript"
isCJKLanguage = true
date = "2016-07-10 19:47:18 +0800"
categories = ["javascript","JavaScript_The_Definitive_Guide"]
tags = []
+++

## 用 Node 实现异步 I/O

Node 是基于 C++ 的调整 JavaScript 解释器，绑定了用于进程、文件和网络套接字等底层 Unix API，还绑定了 HTTP 客户端和服务器 API。除了一些专门命名的同步方法外，Node 的绑定是异步的，且 Node 程序默认绝不阻塞，这意味着它们通过具备强大的可伸缩能力并能有效地处理高负荷。由于 API 是异步的，因此 Node 依赖事件处理程序，其通常使用嵌套函数和闭包来实现

<!--more-->
Node 在其全局对象中实现了所有标准的 ECMAScript 5 构造函数、属性和函数。除此之外，它也支持客户端講器函数集 setTimeout(), setInterval()

Node 在 process 名字空间中定义了其它重要的 **全局** 属性：

```javascript
process.version         // Node 的版本字符串信息
process.argv            // 'node' 命令行数组参数，argv[0] 是 "node"
process.pid             // 进程 id
process.getuid()        // 返回用户 id
process.cwd()           // 返回当前的工作目录
process.chdir()         // 改变当目录
process.exit()          // 退出
```

在有的情况下，可以使用 Node 的事件机制。Node 对象产生事件（称为事件触发器(event emitter)），定义 on() 方法来注册处理程序。当传入参数时，将事件类型（一个字符串）作为第一参数，处理程序函数作为第二参数。不同的事件类型传递给处理程序函数的参数不同：

```javascript
emitter.on(name, f)
emitter.addListener(name, f)
emitter.once(name, f)
emitter.removeListener(name, f)
emitter.removeListeners(name)
```

上面的 process 全局对象也是一个事件触发器，它继承了 EventEmitter 类

```javascript
process.on('exit', function () { console.log('Goodbye'); });
process.on('uncaughException', function (e) { console.log(Exception, e); });
```

Node 的文件和文件系统 API 位于「fs」模块中，这个模块提供了大部分方法的「同步版本」。任何名字以「Sync」结尾的方法都是一个 **阻塞方法**，它返回一个值或抛出一个异常，不以「Sync」结尾的文件系统方法都是非阻塞的，它们会把结果或者错误传给指定的回调函数

```javascript
// 同步读取文件，指定编码获取文本而不是字节
var text = fs.readFileSync('config.json', 'utf8');
// 异步读取二进制文件，通过传递函数获得数据
fs.readFile('image.png', function (err, buffer) {
    if (err) throw err;
    process(buffer);
})
```

类似地，存在用来写文件的 writeFile() 和 writeFileSync() 函数：

```javascript
fs.writeFile('config.json', JSON.stringify(json))
```

「net」模块是用于基于 TCP 网络的 API，下面是 Node 中一个非常简单的 TCP 服务器

```javascript
var net = require('net');
var server = net.createServer();
server.listen(2000, function() { console.log('Listening on port 2000'); });
server.on('connection', function (stream) {
    console.log('Accepting connection from', stream.remoteAddress);
    stream.on('data', function (data) {
        stream.write(data)
    });
    stream.on('end', function(data) {
        console.log('Connection closed');
    });
});
```

### Node 示例：HTTP 服务器

```javascript
var http = require('http');

var hostname = '127.0.0.1';
var port = 3000;

var server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

server.listen(port, hostname, function() {
    console.log('Server running at http://$s:%s/', hostname, port);
});
```
