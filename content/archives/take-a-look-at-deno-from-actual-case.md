+++
title = "从实际案例讲 Deno 的应用场景"
isCJKLanguage = true
categories = ["fe"]
tags = ["typescript", "deno", "javascript"]
date = "2020-08-14T19:18:33-07:00"
+++


> 此篇文章实际上就是《[前端开发的瓶颈与未来](/2020/05/10/frontend-dev-bottleneck-and-future/)》的番外篇。主要想从实用的角度给大家介绍下 Deno 在我们项目中的应用案例，现阶段我们只关注应用层面的问题，不涉及过于底层的知识。

## 简介

![deno](https://vip1.loli.net/2020/08/14/TWlcqvGpLCuRAXb.png)

我们从它的官方介绍里面可以看出来加粗的几个单词：secure, JavaScript, TypeScript。简单译过来就是：

> 一个 JavaScript 和 TypeScript 的安全运行时

那么问题来了，啥叫运行时（runtime）？可以简单的理解成可以执行代码的一个东西。那么 Deno 就是一个可以执行 JavaScript 和 TypeScript 的东西，浏览器就是一个只能执行 JavaScript 的运行时。

## 特性

* 默认是 **安全的**，这意味着初始的情况下你是 **不可以** 访问网络、文件系统、环境变量的。
* 开箱即用的 TypeScript 支持，就是说你可以直接使用 Deno 运行 TypeScript 而 **不需要** 使用 tsc 编译
* Deno 的构建版只有一个可执行文件，那么你可以直接下载这个可执行文件到本地执行，而 **不需要** 编译、安装的操作
* 内置了一些工具集，比如：依赖检查器、代码格式化。我们用到的测试框架居然没有被重点提起
* 一系列的经过代码 review 的内置模块，这表示当你使用 Deno 的时候，一些常用的工具方法都内置了，不需要再添加三方依赖
* 部分浏览器特性兼容，这个并不是官方宣传的特性，但是我认为是很重要的一点。这个我意味着如果设计合理，你的代码即可以跑在 Deno 里面，也可以在浏览器里面。

## 安装

Mac/Linux 下命令行执行：

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

也可以去 Deno 的官方代码仓库下载对应平台的源（可执行）文件，然后将它放到你的环境变量里面直接执行。如果安装成功，在命令行里面输入：`deno --help` 会有如下输出：

```bash
➜  ~ deno --help
deno 1.3.0
A secure JavaScript and TypeScript runtime

Docs: https://deno.land/manual
Modules: https://deno.land/std/ https://deno.land/x/
Bugs: https://github.com/denoland/deno/issues
...
```

以后如果想升级可以使用内置命令 `deno upgrade` 来自动升级 Deno 版本，相当方便了。

## Deno 内置命令

Deno 内置了丰富的命令，用来满足我们日常的需求。我们简单介绍几个：

### deno run

直接执行 JS/TS 代码。代码可以是本地的，也可以是网络上任意的可访问地址（返回JS或者TS）。我们使用官方的示例来看看效果如何：

```bash
deno run https://deno.land/std/examples/welcome.ts
```

如果执行成功就会返回下面的信息：

```bash
➜  ~ deno run https://deno.land/std/examples/welcome.ts
Download https://deno.land/std/examples/welcome.ts
Warning Implicitly using latest version (0.65.0) for https://deno.land/std/examples/welcome.ts
Download https://deno.land/std@0.65.0/examples/welcome.ts
Check https://deno.land/std@0.65.0/examples/welcome.ts
Welcome to Deno 🦕
```

可以看到这段命令做了两个事情：1. 下载远程文件 2. 执行里面的代码。我们可以通过命令查看这个远程文件里面内容到底是啥：

```bash
➜  ~ curl https://deno.land/std@0.65.0/examples/welcome.ts
console.log("Welcome to Deno 🦕");
```

不过需要注意的是上面的远程文件里面没有 **显示的** 指定版本号，实际下载 std 中的依赖的时候会默认使用最新版，即：`std@0.65.0` ，我们可以使用 curl 命令查看到源文件是 `302` 重定向到带版本号的地址的：

```bash
➜  ~ curl -i https://deno.land/std/examples/welcome.ts
HTTP/2 302 
date: Fri, 14 Aug 2020 01:53:06 GMT
content-length: 0
set-cookie: __cfduid=d3e9dfbd32731defde31eba271f19933b1597369985; expires=Sun, 13-Sep-20 01:53:05 GMT; path=/; domain=.deno.land; HttpOnly; SameSite=Lax; Secure
location: /std@0.65.0/examples/welcome.ts
x-deno-warning: Implicitly using latest version (0.65.0) for https://deno.land/std/examples/welcome.ts
cf-request-id: 048c44c2dc000019dd710cc200000001
expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
server: cloudflare
cf-ray: 5c270a4afd5719dd-SIN
```

header 头中的 location 就是实际文件的下载地址：

```bash
location: /std@0.65.0/examples/welcome.ts
```

这就涉及到一个问题：实际使用的时候到底应不应该手动添加版本号？一般来说如果是生产环境的项目引用一定要是带版本号的，像这种示例代码里面就不需要了。

上面说到 Deno 也可以执行本地的，那我们也试一试，写个本地文件，然后 运行它：

```bash
➜  ~ echo 'console.log("Welcome to Deno <from local>");' > welecome_local.ts
➜  ~ ls welecome_local.ts 
welecome_local.ts
➜  ~ deno run welecome_local.ts 
Check file:///Users/zhouqili/welecome_local.ts
Welcome to Deno <from local>
```

可以看到输出了我们想要的结果。

这个例子太简单了，再来个复杂点的吧，用 Deno 实现一个 Http 服务器。我们使用官方示例中的代码：

```ts
import { serve } from "https://deno.land/std@0.65.0/http/server.ts";
const s = serve({ port: 8000 });
console.log("http://localhost:8000/");
for await (const req of s) {
  req.respond({ body: "Hello World\n" });
}
```

保存为 test_serve.ts，然后使用 `deno run` 运行它，你会发现有报错信息：

```bash
➜  ~ deno run test_serve.ts 
Download https://deno.land/std@0.65.0/http/server.ts
Download https://deno.land/std@0.65.0/encoding/utf8.ts
Download https://deno.land/std@0.65.0/io/bufio.ts
Download https://deno.land/std@0.65.0/_util/assert.ts
Download https://deno.land/std@0.65.0/async/mod.ts
Download https://deno.land/std@0.65.0/http/_io.ts
Download https://deno.land/std@0.65.0/async/deferred.ts
Download https://deno.land/std@0.65.0/async/delay.ts
Download https://deno.land/std@0.65.0/async/mux_async_iterator.ts
Download https://deno.land/std@0.65.0/async/pool.ts
Download https://deno.land/std@0.65.0/textproto/mod.ts
Download https://deno.land/std@0.65.0/http/http_status.ts
Download https://deno.land/std@0.65.0/bytes/mod.ts
Check file:///Users/zhouqili/test_serve.ts
error: Uncaught PermissionDenied: network access to "0.0.0.0:8000", run again with the --allow-net flag
    at unwrapResponse (rt/10_dispatch_json.js:24:13)
    at sendSync (rt/10_dispatch_json.js:51:12)
    at opListen (rt/30_net.js:33:12)
    at Object.listen (rt/30_net.js:204:17)
    at serve (server.ts:287:25)
    at test_serve.ts:2:11
```

`PermissionDenied` 意思是你没有网络访问的权限，可以使用 `--allow-net` 的标识来允许网络访问。这就是文章开头特性里面提到的默认安全。

默认安全就是说被 Deno 执行的代码会默认被放进一个沙箱中执行，代码使用到的 API 接口都受制于 Deno 的宿主环境，Deno 当然是有网络访问、文件系统等能力的。但是这些系统级别的访问需要 deno 命令的 **执行者** 授权。

这个权限控制很多人觉得没必要，因为当我们运行代码时提示了受限，我们肯定手动添加上允许然后再执行嘛。但是区别是 Deno 把这个授权交给了执行者，好处就是如果执行的代码是第三方的，那么执行者就可以主动拒绝一些危险性很高的操作。

比如我们安装一些命令行工具，而一般命令行工具都是不需要网络的，我们就可以不给它网络访问的权限。从而避免了程序偷偷地上传/下载文件。

### deno eval

执行一段 JS/TS 字符串代码。这个和 JavaScript 中的 eval 函数有点类似。

```bash
➜  ~ deno eval "console.log('hello from eval')"
hello from eval
```

### deno install

安装一个 deno 脚本，通常用来安装一个命令行工具。举个例子，在之前的 Deno 版本中有一个命令特别好用：`deno xeval` 可以按行执行 eval 命令，类似于 Linux 中的 `xargs` 命令。后来这个内置命令被移除了，但是 deno 的开发人员编写了一个 deno 脚本，我们可以通过 install 命令安装它。

```bash
➜  ~ deno install -n xeval https://deno.land/std@0.65.0/examples/xeval.ts
Download https://deno.land/std@0.65.0/examples/xeval.ts
Download https://deno.land/std@0.65.0/flags/mod.ts
Download https://deno.land/std@0.65.0/io/bufio.ts
Download https://deno.land/std@0.65.0/bytes/mod.ts
Download https://deno.land/std@0.65.0/_util/assert.ts
Check https://deno.land/std@0.65.0/examples/xeval.ts
✅ Successfully installed xeval
/Users/zhouqili/.deno/bin/xeval
➜  ~ xeval
xeval

Run a script for each new-line or otherwise delimited chunk of standard input.

Print all the usernames in /etc/passwd:
  cat /etc/passwd | deno run -A https://deno.land/std/examples/xeval.ts "a = $.split(':'); if (a) console.log(a[0])"

A complicated way to print the current git branch:
  git branch | deno run -A https://deno.land/std/examples/xeval.ts -I 'line' "if (line.startsWith('*')) console.log(line.slice(2))"

Demonstrates breaking the input up by space delimiter instead of by lines:
  cat LICENSE | deno run -A https://deno.land/std/examples/xeval.ts -d " " "if ($ === 'MIT') console.log('MIT licensed')",

USAGE:
  deno run -A https://deno.land/std/examples/xeval.ts [OPTIONS] <code>
OPTIONS:
  -d, --delim <delim>       Set delimiter, defaults to newline
  -I, --replvar <replvar>   Set variable name to be used in eval, defaults to $
ARGS:
  <code>
[]
```

`-n xeval` 表示全局安装的命令行名称，安装完以后你就可以使用  `xeval` 了。

举个例子，我们使用 xeval 过滤日志文件，仅仅展示 WARN 类型的行：

```bash
➜  ~ cat catalina.out | xeval "if ($.includes('WARN')) console.log($.substring(0, 40)+'...')"
2020-08-12 13:37:39.020  WARN 202 --- [I...
2020-08-12 13:37:39.020  WARN 202 --- [I...
2020-08-12 13:37:39.019  WARN 202 --- [I...
2020-08-12 13:34:42.822  WARN 202 --- [o...
2020-08-12 13:34:42.822  WARN 202 --- [o...
2020-08-12 13:34:42.814  WARN 202 --- [o...
2020-08-12 13:34:42.805  WARN 202 --- [o...
```

`$` 美元符表示当前行，程序会自动按行读取让执行 xeval 命令后面的 JS 代码。

`catalina.out` 是我本地的一个文本日志文件。你可能会觉得这样挺麻烦的，直接 `| grep WARN` 不香嘛？但是 `xeval` 的可编程性就高很多了。

### deno test

deno 内置了一个简易的测试框架，可以满足我们日常的单元测试需求。我们写一个简单的测试用例试试，新建一个文件 `test_case.ts`，保存下面的内容：

```ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("1 + 1 在任何情况下都不等于 3", () => {
    assertEquals(1 + 1 == 3, false)
    assertEquals("1" + "1" == "3", false)
})
```

使用 test 命令跑这个测试用例：

```bash
➜ deno test test_case.ts
Check file:///Users/zhouqili/.deno.test.ts
running 1 tests
test 1 + 1 在任何情况下都不等于 3 ... ok (3ms)

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (3ms)
```

可以看到测试通过了。

还有其它很多好用的命令，但是在我并没用太多的实际使用经验，就不多介绍了。

## 实战

上面说了这么多基础知识，终于可以讲点实际应用场景了。我们在自己的一个 SDK 项目中使用了 Deno 来做自动化单元测试的任务。整个流程走下来还是挺流畅的。代码就不放出来了，我只简单的说明下这个 SDK 需要做哪些事情，理想的开发流程是什么样的。

1. SDK 以 NPM 包的形式发布，给调用者使用
2. SDK 主要提供一些封装方法，比如：网络请求、事件发布订阅系统等
3. SDK 的代码通常不依赖 DOM 接口，并且调用的宿主环境方法与 Deno 兼容
4. 测试用例不需要在浏览器里面跑，使用 Deno 在命令行中自动化完成
5. 如果可以最好能做到浏览器使用可以独立打包成 UMD 模块，NPM 安装则可以直接引用 ES 版模块

如果你的场景和上面的吻合，那么就可以使用 Deno 来开发。本质上讲我们开发的时候写的还是 TypeScript，只是需要我们在发布 NPM 包的时候稍微的进行一下处理即可。

我们以实现一个 fetch 请求的封装方法为例来走通整个流程。

### 初始化一个 NPM 包

```bash
➜  ~ mkdir mysdk
➜  ~ cd mysdk 
➜  mysdk npm init -y
```

建立好文件夹目录，及主要文件：

```bash
➜  mysdk mkdir src tests
➜  mysdk touch src/index.ts
➜  mysdk touch src/request.ts 
➜  mysdk touch tests/request.test.ts
```

如果你使用的是 vscode 编辑器，可以安装好 deno 插件（denoland.vscode-deno），并且设置 `deno.enable` 为 `true`。你的目录结构应该是这样的：

```bash
├── package.json
├── src
│   ├── index.ts
│   └── request.ts
└── tests
    └── request.test.ts
```

`index.ts` 为对外提供的导出 API。

### 初始化 tsconfig

使用 tsp --init 来初始化项目的 typescript 配置：

```bash
tsc --init
```

更新 tsconfig.json 为下面的配置：

```json
{
  "compilerOptions": {
    "target": "ES5",
    "lib": ["es6", "dom", "es2017"],
    "declaration": true,
    "outDir": "./build",
    "strict": true,
    "allowUmdGlobalAccess": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

注意指定 `outDir` 为 `build` 方便我们将编译完的 JS 统一管理。

### 编写 request 方法

为了演示，这里就简单写下。`request.ts` 代码实现如下：

```ts
export async function request(url: string, options?: Partial<RequestInit>) {
    const response = await fetch(url, options)
    return await response.json()
}
```

调用端封闭好 GET/POST 请求的快捷方法，并且从 `index.ts` 文件导出：

```bash
import {request} from "./request.ts";

export async function get(url: string, options?: Partial<RequestInit>) {
    return await request(url, {
        ...options,
        method: "GET"
    })
}

export async function post(url: string, data?: object) {
    return await request(url, {
        body: JSON.stringify(data),
        method: "POST"
    })
}
```

在 `tests/request.test.ts` 目录写上单元测试用例：

```bash
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import {get, post} from "../src/index.ts";

Deno.test("request 正常返回 GET 请求", async () => {
    const data = await get("http://httpbin.org/get?foo=bar");
    assertEquals(data.args.foo, "bar")
})

Deno.test("request 正常返回 POST 请求", async () => {
    const data = await post("http://httpbin.org/post", {foo: "bar"});
    assertEquals(data.json.foo, "bar")
})
```

最后在命令行使用 `deno test` 命令跑测试用例。注意添加 `--allow-net` 参数来允许代码访问网络：

```bash
➜  mysdk deno test --allow-net tests/request.test.ts
Check file:///Users/zhouqili/mysdk/.deno.test.ts
running 2 tests
test request 正常返回 GET 请求 ... ok (632ms)
test request 正常返回 POST 请求 ... ok (342ms)

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (974ms)
```

我们可以看到测试都通过了，下面就可以安心的发布 NPM 包了。

需要注意一点 Deno 写 TypeScript 的时候严格要求导入的 **文件路径** 必须添加 `.ts` 后缀。但是 TS 语言并不需要显式的添加这个后缀，TS 认为引入（import）的是一个 **模块** 而不是文件。这一点 TS 做的比较极端，tsc 要求你必须删除掉 `.ts` 后缀才能编译通过，这个我个人认为是非常不合理的。但是 Deno 有它的考虑，因为没有严格的文件名后缀引起程序 BUG 我自己也遇到过。

### 发布 NPM 包

上面的几步都相对流畅，唯独到发布 NPM 包这一步就比较麻烦。因为本质上讲 Deno 只是 TypeScript/JavaScript 的运行时，并不兼容 NPM 这种包管理工具。而且 NPM 是为 Node.JS 设计的，它也没有办法直接发布 TypeScript 的包，我们只能把 TypeScript 编译成 JavaScript 再进行发布。

发布这里我们的需求有两点：

1. 可以将最终的代码包合成到一个文件中编译成 UMD，浏览器引入这个脚本可以通过全局变量 `window.MySDK` 访问到
2. 通过 NPM 安装的最好默认使用 ESModule

第二个简单，我们直接使用 `tsc` 的命令就可以完成：

```bash
tsc -m esnext -t ES5 --outDir build/esm
```

这时你会发现我上面提到的问题，tsc 报错了：

```bash
➜  mysdk tsc -m esnext -t ES5 --outDir build/esm
src/index.ts:1:23 - error TS2691: An import path cannot end with a '.ts' extension. Consider importing './request' instead.

1 import {request} from "./request.ts";
                        ~~~~~~~~~~~~~~
```

说我不能使用 `.ts`！

这就尴尬了，deno 要求我必须添加，TS 又要求我不能添加。你到底想让人家怎么样嘛？

而且还有一个问题，我们现在实现的功能还很简单，引入的文件很少，可以手动修改下。但是以后功能多了怎么办？文件很多手动修改肯定不是办法啊。实在不行还是算了，不用 Deno 了？

其实嘛，解决方法还是有的，上面我们不是介绍过 Deno 安装脚本功能了吗。我们自己写个脚本放在 NPM Script 里面，每次编译发布前这个脚本自动把 `.ts` 去掉，发布完再自动改回来不就好了。

于是乎我自己写了一个 Deno 脚本，专门用来给项目的文件批量添加或者删除引用路径上面的 `.ts` 后缀：

源代码我就不全部贴出来了，简单讲就是用正则匹配出每个 ts 文件中的头部的 import 语句，按命令传入的参数去处理后缀就可以了。代码我放到了 gist 上，有兴趣的可以研究下：

> https://gist.github.com/keelii/d95492873f35f96d95f3a169bee934c6

你可以使用下面的命令来安装并使用它：

```bash
deno install --allow-read --allow-write -f -n deno_ext https://gist.githubusercontent.com/keelii/d95492873f35f96d95f3a169bee934c6/raw/9736099cb47ef706e6c184e83c78fdfc822810dd/deno_ext.ts
```

使用 deno_ext 命令即可：

```bash
 ~ deno_ext
✘ error with command.

Remove or restore [.ts] suffix from your import stmt in deno project.

Usage:
  deno_ext remove <files>...
  deno_ext restore <files>...
Examples:
  deno_ext remove **/*.ts
  deno_ext restore src/*.ts
```

工具告诉你如何使用它，remove/restore 两个子命令+目标文件即可。

我们配合 `tsc` 可以实现发布时自动更新后缀，发布完还原回去，参考下面的 NPM script：

```json
{
  "scripts": {
    "proc:rm_ext": "deno_ext remove src/*.ts",
    "proc:rs_ext": "deno_ext restore src/*.ts",
    "tsc": "tsc -m esnext -t ES5 --outDir build/esm",
    "build": "npm run proc:rm_ext && npm run tsc && npm run proc:rs_ext"
  }
}
```

我们使用 `npm run build` 命令就可以完成打包 ESModule 的功能：

```bash
➜  mysdk npm run build

> mysdk@1.0.0 build /Users/zhouqili/mysdk
> npm run proc:rm_ext && npm run tsc && npm run proc:rs_ext


> mysdk@1.0.0 proc:rm_ext /Users/zhouqili/mysdk
> deno_ext remove src/*.ts

Processing remove [/Users/zhouqili/mysdk/src/index.ts]
Processing remove [/Users/zhouqili/mysdk/src/request.ts]

> mysdk@1.0.0 tsc /Users/zhouqili/mysdk
> tsc -m esnext -t ES5 --outDir build/esm


> mysdk@1.0.0 proc:rs_ext /Users/zhouqili/mysdk
> deno_ext restore src/*.ts

Processing restore [/Users/zhouqili/mysdk/src/index.ts]
Processing restore [/Users/zhouqili/mysdk/src/request.ts]
```

最终打包出来的文件都在 build 目录里面：

```bash
build
└── esm
    ├── index.d.ts
    ├── index.js
    ├── request.d.ts
    └── request.js
```

接下来我们还需要将源代码打包成单独的一个 UMD 模块，并展出到全局变量 `window.MySDK` 上面。虽然 TypeScript 是支持编译到 UMD 格式模块的，但是它并不支持将源代码 bundle 到一个文件里面，也不能添加全局变量引用。因为本质上讲 TypeScript 是一个编译器，只负责把模块编译到支持的模块规范，本身没有 bundle 的能力。

但是实际上当你选择 --module=amd 时，TypeScript 其实是可以把文件打包 concat 到一个文件里面的。但是这个 concat 只是简单地把每个 AMD 模块拼装起来，并没有 rollup 这类的专门用来 bundle 模块的高级功能，比如 tree-shaking 什么的。

所以想达到我们目标还得引入模块 bundler 的工具，这里我们使用 rollup 来实现。什么？你问我为啥不用 webpack？别问，问就是「人生苦短，学不动了」。

rollup 我们也就不搞什么配置文件了，越简单越好，直接安装 devDependencies 依赖：

```bash
npm i rollup -D
```

然后在 package.json 中使用 rollup 把 tsc 编译出来的 esm 模块再次 bundle 成 UMD 模块：

```bash
"scripts": {
    "rollup:umd": "./node_modules/.bin/rollup build/esm/index.js --file build/umd/index.bundle.js --format umd --name 'MySDK'"
}
```

然后可以通过执行 `npm run rollup:umd` 来实现打包成 UMD 并将 API 绑定到全局变量  `MySDK` 上面。我们可以直接将 `build/umd/index.bundle.js` 的代码复制进浏览器控制台执行，然后 看看 window 上有没有这个 `MySDK` 变量，不出意外的话，就会看到了。

![mysdk-window-global-ns](https://vip1.loli.net/2020/08/14/NTwQ7oiAmzc6Hyg.png)

我们在 `index.ts` 文件中 export 了两个 function：get/post 都有了。来试试看能不能运行起来

**注意**：有的浏览器可能还不支持 async/await，所以我们使用了 Promise 来发送请求

![mysdk-get-request](https://vip1.loli.net/2020/08/14/ua4eb2CUyMvm6ki.png)

到此，我们所有的需求都满足了，至少对于开发一个 SDK 级别的应用应该是没问题了。相关代码可以参考这里：https://github.com/keelii/mysdk

需要注意的几个问题：

1. 我们代码中能使用 fetch 的原因是 Deno 和浏览器都支持这个 API，对于浏览器支持 Deno 不支持的就没办法写测试用例了，比如：LocalStorage 目前 Deno 还不支持
2. 用 Deno 脚本移除 `.ts` 的后缀这个操作是比较有风险的，如果你的项目比较大，就不建议直接这么处理了，这个脚本目前也只在我们一个项目里面实际用到过。正则匹配换后缀这种做法总不是 100% 安全的


