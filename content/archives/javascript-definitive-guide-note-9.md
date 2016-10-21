+++
title = "《JavaScript 权威指南》读书笔记 10 - 正则表达式的模式匹配"
isCJKLanguage = true
date = "2016-07-06 12:43:30 +0800"
categories = ["javascript","JavaScript_The_Definitive_Guide"]
tags = []
+++

正则表达式（regular expression）是一个描述字符模式的对象。在 JavaScript 中 String 和 RegExp 都定义了相关方法对文本进行模式匹配、检索和替换

<!--more-->

## 正则表达式的定义

JavaScript 中的正则表达式用 RegExp 对象表示，可以使用 RegExp() 构造函数来创建 RegExp 对象，不过也可以通过两个双斜杠「/reg/」以正则直接量的形式创建

```javascript
var pattern = /s$/;             // 通过直接量创建
var pattern = new RegExp('s$'); // 通过构造函数创建
```

### 直接量字符

JavaScript 正则表达式语法也支持非字母的字符匹配，这些字符需要通过反斜线（\）作为前缀进行转义

_表10-1_

| 字符       | 匹配                                  |
| -----      | -----                                 |
| 字母和数字 | 自身                                  |
| \0         | NUL 字符（\u0000）                    |
| \t         | 制表符（\u0009）                      |
| \n         | 换行符（\u000A）                      |
| \v         | 垂直制表符（\u000B）                  |
| \f         | 换页符（\u000C）                      |
| \r         | 回车符（\u000D）                      |
| \xnn       | 由十六进制数 nn 指定的拉丁字符        |
| \uxxxx     | 由十六进制数 xxxx 指定的 unicode 字符 |
| \cX        | 控制字符 ^x                           |


正则表达式中，许多标点符号也具有特殊含义，它们是：

> ^ $ . * + ? = ! : | \ / ( ) { }

### 字符类

将直接量字符单独放进方括号内组成了字符类（charactor class）

_表10-2_

| 字符   | 匹配                                               |
| -----  | -----                                              |
| [...]  | 方括号内的任意字符                                 |
| [^...] | 不在方括号内的任意字符                             |
| .      | 除换行符和其它 Unicode 行终止符之外的任意字符      |
| \w     | 任何 ASCII 字符组成的单词，等价于 [a-zA-Z0-9]      |
| \W     | 任何不是 ASCII 字符组成的单词，等价于 [^a-zA-Z0-9] |
| \s     | 任何 Unicode 空白符                                |
| \S     | 任何非 Unicode 空白符                              |
| \d     | 任何 ASCII 数字，等价于 [0-9]                      |
| \D     | 任何非 ASCII 数字，等价于 [^0-9]                   |
| [\b]   | 退格直接量                                         |

### 重复

_表10-3_

| 字符   | 含义                                                           |
| -----  | -----                                                          |
| {n, m} | 匹配前一项至少 n 次，但不能超过 m 次                           |
| {n,}   | 匹配前一项 n 次或者更多次                                      |
| {n}    | 匹配前一项 n 次                                                |
| ?      | 匹配前一项 0 次或者 1 次，也就是说前一项是可选的，等价于 {0,1} |
| +      | 匹配前一项 1 次或者多次，等价于 {1,}                           |
| *      | 匹配前一项 0 次或者多次，等价于{0,}                            |

举例说明：

```javascript
/\d{2,4}/           // 匹配 2 ~ 4 个数字
/\w{3}\d?/          // 匹配三个单词和一个可选的数字
/\s+java\s+/        // 匹配前后带有一个或者多个空白字符串 "java"
/[^(]*/             // 匹配一个或多个非左括号字符
```
#### 非贪婪的重复

表10-3 中列出一匹配重复字符是尽可能多地匹配，而且允许后续的正则表达式继续匹配。因此，我们称之为「**贪婪的**」匹配。我们同样可以使用正则表达式进行非贪婪匹配。只需在特匹配的字符后跟随一个问题即可：「??」、「+?」、「*?」或「{1,5}?」

### 选择、分级和引用

_表10-4_

| 字符   | 含义  |
| -----  | ----- |
| \|     | 选择，匹配的是该符号左边的子表达式或者右边的子表达式               |
| (...)  | 组合，将几个项组合为一个单元，这个单元可通过「*」、「+」、「?」和「\|」等符号<br>加以修饰，而且可以记住和这个组合相匹配的字符串<br>以供此后的引用使用 |
| (?:...)| 只组合，把项组合到一个单元，但不记忆与该组想匹配的字符 |
| \n     | 和第 n 个分级第一次匹配的字符相匹配，组是圆括号中的子表达式<br>（也有可能是嵌套的），组索引是从左到右的左括号数，<br>「(?:」形式的分组不编码 |

### 指定匹配位置

_表10-5_

| 字符  | 含义                                                                       |
| ----- | -----                                                                      |
| ^     | 匹配字符串的开头                                                           |
| $     | 匹配字符串的结尾                                                           |
| \b    | 匹配一个单词的边界                                                         |
| \B    | 匹配非单词边界的位置                                                       |
| (?=p) | 零宽正向先行断言，要求接下来的字符都与 p 匹配，但不能包括匹配 p 的那些字符 |
| (?!p) | 零宽负向先行断言，要求接下来的字符都不与 p 匹配                            |

### 标识

> /reg/flag

标识是放在斜扛右边的，通常有 i, g, m 三种

* i 执行不区分大小写的匹配
* g 执行一个全局匹配，即 找到所有的匹配，而不是找到第一个就停止
* m 多行匹配模式

## 用于模式匹配的 string 方法

String 支持 4 种使用正则表达式的方法

### String.prototype.search()

[search()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/search) 方法返回第一个与之匹配的子串起始位置，如果找不到匹配的子串，它将返回 -1

```javascript
"JavaScript".search(/script/i);         // => 4
```
如果 search() 参数不是正则表达式，则首先会 **通过 RegExp 构造函数将它转换成正则表达式**，search() 方法不支持全局检索，因为它 **忽略** 正则表达式参数中的标识 g

### String.prototype.replace()

> str.replace(regexp|substr, newSubStr|function)

[replace()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace) 方法用以执行检索与替换操作，正则表达式如果带标识 g，则会替换所有匹配子串

```javascript
// 将所有不区分大小写的 javascript 都替换成 JavaScript
text.replace(/javascript/gi);

// 用中文引号替换英文应该引号，同时要保持引号之间的内容（存储在 $1 中）没有被修改
var quote = /"([^"]*)"/g;
text.replace(quote, '“$1”')
```

### String.prototype.match()

[match()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/match) 方法返回一个由匹配结果组成的数组，如果没有标识全局搜索，match() 只检索第一个匹配

```javascript
"1 plus 2 equals 3".match(/\d+/g);  // => ["1", "2", "3"]
```

## RegExp 对象

> RegExp(pattern [, flags])

RegExp 构造函数一般用在动态创建正则表达式的时候，这种情况往往没办法通过写死在代码中的正则直接量来实现，比如检索字符串是用户输出的

### RegExp 的属性

每个 RegExp 对象都包含 5 个属性：

* source 只读字符串，包含正则表达式的文本
* global 只读布尔值，说明正则表达式是否带全局标识 g
* ignoreCase 也是一个只读布尔值，说明正则表达式是否带标识 i
* multiline 也是一个只读布尔值，说明正则表达式是否带标识 m
* lastIndex 它是一个可读/写的整数。如果匹配模式带有 g 标识，这个属性存储在整个字符串中下一次检索的开始位置

### RegExp 的方法

#### exec()

exec() 对一个指定的字符串执行一个正则表达式，如果没有找到任何匹配，它就返回 null，但如果它找到一个匹配，将返回一个数组

```javascript
var pattern = /Java/g;
var text = "JavaScript is more fun than Java!";
var result;
while((result = pattern.exec(text)) != null) {
    console.log("Matched '%s' at position '%s'; next search begins at %s",
        result[0],
        result.index,
        pattern.lastIndex);
}
// Matched 'Java' at position '0'; next search begins at 4
// Matched 'Java' at position '28'; next search begins at 32
```

#### test()

test() 对方法转入字符串进行检测，匹配到结果返回 true，否则返回 false

```javascript
var pattern = /java/i;
pattern.test('JavaScript');     // => true
```