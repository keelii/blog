+++
title = "《JavaScript 权威指南》读书笔记 9 - 类和模块"
isCJKLanguage = true
date = "2016-07-02 13:58:30 +0800"
categories = ["javascript","JavaScript_The_Definitive_Guide"]
tags = []
+++

每个 JavaScript 对象都是一个属性集合，相互之间没有任何联系。在 JavaScript 中也可以定义对象的类，让每个对象都共享某些属性，这种「共享」的特性是非常有用的。类的成员或实例都包含一些属性，用以存放或者定义它们的状态，其中有些属性定义了它们的行为（通常称为方法）。这些行为通常是由类定义的，而且为所有实例所共享。例如，假设有一个 Complex 的类用来表示复数， 同时还定义了一些复数运算，一个 Complex 实例应当包含实数的实部和虚部（状态），同样 Complex 类还会定义复数的加法和乘法操作（行为）

<!--more-->

JavaScript 中类的一个重要特性是「**动态可继承**」（dynamically extendable），我们可以将类看做是类型，本章会介绍一种编程哲学 —— 「[**鸭子类型**](https://zh.wikipedia.org/wiki/%E9%B8%AD%E5%AD%90%E7%B1%BB%E5%9E%8B)」（duck-typing），它弱化了对象的类型，强化了对象的功能

## 类和原型

在 JavaScript 中，类的所有实例对象都从同一个原型对象上继承属性。因此，原型对象是类的核心。在之前的 [章节](/2016/06/23/javascript-definitive-guide-note-5/#TOC-4) 里定义了 inherit() 函数，这个函数返回一个新创建的对象，后者继承自某个原型对象。如果定义一个原型对象，然后通过 inherit() 函数创建一个继承自它的对象，这样就定义了一个 JavaScript 类。通常，类的实例还需要进一步的初始化，通常是通过定义一个函数来创建并初始化这个新对象

```javascript
// 一个简单的实现表示值的范围的类
function range(from, to) {
    var r = inherit(range.methods);

    r.from = from;
    r.to = to;
    return r;
}
range.methods = {
    includes: function(x) {
        return this.from <= x && x <= this.to;
    },
    foreach: function (f) {
        for (var x = Math.ceil(this.from); x <= this.to; x++) f(x);
    }
    toString: function() {
        return "(" + this.from + "..." + this.to + ")";
    }
}
var r = range(1, 3);
r.includes(2)           // => true
r.foreach(console.log)
// => 1
// => 2
// => 3
console.log(r);         // => (1...3)
```

这段代码定义了一个工厂方法 range()，用来创建新的范围对象。range.methods 属性用来快捷地存放定义类的原型对象。range() 函数给每个范围对象都定义了 from 和 to 属性，用以定义范围的起始和结束位置，这两个属性是 **非共享** 的，当然也是不可继承的。

## 类和构造函数

上节中展示了定义类的一种方法，但是这种方法并不常用，它没定义构造函数。构造函数是用来初始化新创建的对象的。调用构造函数的一个重要特征是，构造函数的 prototype 属性被用做新对象的原型。这意味着 **通过同一个构造函数创建的所有对象都继承自一个相同的对象**，因此它们都是同一个类的成员

_例9-2_

```javascript
function Range(from, to) {
    this.from = from;
    this.to = to;
}
Range.prototype = {
    includes: function(x) {
        return this.from <= x && x <= this.to;
    },
    foreach: function (f) {
        for (var x = Math.ceil(this.from); x <= this.to; x++) f(x);
    }
    toString: function() {
        return "(" + this.from + "..." + this.to + ")";
    }
};
var r = new Range(1, 3)
r.includes(2)       // => true
r.foreach(console.log)
// => 1
// => 2
// => 3
console.log(r);    // => "(1...3)"
```

从某种意义上讲，定义构造函数既是定义类，并且 **类名首字母要大写**，而普通普通的函数和方法都是首字母小写，Range() 构造函数是通过 new 关键字调用的，而在上一节的工厂函数则不必使用 new。通过 new 调用不必再用  inherit 来创建对象，构造函数会自动创建对象，然后将构造函数作为这个对象的方法来调用一次，最后返回这个对象

### 构造函数的类的标识

上文提到，原型对象是类的唯一标识：当且仅当两个对象继承自同一个原型对象时，它们才是属于同一个类的实例。而初始化对象的状态的构造函数则不能作为类的标识，两个构造函数的 prototype 属性可能指责同一个原型对象。那么这两个构造函数创建的实例是属于同一个类的

构造函数的名字通常用做类名，比如我们说 Range() 构造函数创建 Range 对象。然而，更根本地讲，当使用 instancdof 运算符来检测对象是否属于某个类时会用到构造函数。假设有一个对象 r，我们想知道它是否是 Range 对象，可以这样判断

```javascript
r instanceof Range  // 如果 r 继承自 Range.prototype，则返回 true
```

实际上 instanceof 运算符并不会检查 r 是否是由 Range() 构造函数初始化而来，而是 **检查 r 是否继承自 Range.prototype**

### constructor 属性

> 每个 JavaScript 函数（bind除外）都自动拥有一个 prototype 属性。这个属性的值是一个对象，这个对象包含唯一一个不可枚举属性 constructor。constructor 属性的值是一个函数对象

```javascript
var F = function() {};
var p = F.prototype;
var c = p.constructor;
c === F                 // => true
```

图 9-1 展示了构造函数和原型对象之间的关系，包括原型到构造函数的反向引用以及构造函数创建的实例

_图9-1_

```javascript
   构 造 函 数                      原 型                        实 例
+------------------+       +------------------+          +---------------+
|                  |       |                  | inherits |               |
|  Range()         <---------- contructor     <----------+ new Range(2)  |
|                  |       |                  |          |               |
|                  |       |                  |          +---------------+
|                  |       |   includes       |
|   prototype  ------------>                  |
|                  |       |   foreach        |          +---------------+
|                  |       |                  | inherits |               |
|                  |       |   toString       <----------+ new Range(3,4)|
|                  |       |                  |          |               |
|                  |       |                  |          +---------------+
+------------------+       +------------------+
```

例9-2中定义的 Range 类使用它自身的一个新对象重写预定义的 Range.prototype 对象。这个新定义的原型对象不含有 constructor 属性。因此 Range 类的实例也不含有 constructor 属性。我匀可以通过补救措施来修正这个问题，显式给原型添加一个构造函数：

```javascript
Range.prototype = {
    constructor: Range,
    incluces: function() {/*code*/}
};
// 当然也可以使用给 prototype 指定方法赋值的方式，避免重写整个 prototype
Range.prototype.includes = function() {/*code*/}
```

## JavaScript 中 Java 式的类继承

在 Java 或者其它类似强类型面向对象语言中，类成员可能是这样的：

**实例字段** 它们是基于实例的属性或变量，用以保存独立对象的状态

**实例方法** 它们是类的所有实例共享方法，由每个独立的实例调用

**类字段** 这些属性或变量是属于类的，而不属于类的某个实例

**类方法** 这些方法是属于类的，而不属于类的某个实例

JavaScript 和 Java 的一个不同之处在于，JavaScript 中的函数都是以值的形式出现的，方法和字段之间并没有太大的区别。如果属性是函数，那么这个属性就定义一个方法，否则，它只是一个普通的属性或「字段」

## 类和类型

### instanceof 运算符

之前我们已经了解过 instanceof 运算符。左操作数是待检测其类的对象，右操作数是定义类的构造函数。如果 o 继承自 c.prototype，则表达式 o instanceof c 值返回 true。这里的继承可以不是直接继承，如果 o 所继承的对象继承自另一个对象，后一个对象继承自 c.prototype，这个表达式的运算结果也是 true

构造函数是类的公共标识，但原型是唯一的标识。尽管 instanceof 运算符的右操作数是构造函数，但计算过程实际上是检测了对象的继承关系，而不是检测创建对象的构造函数

### constructor 属性

另一种识别对象是否属于某个类的方法是使用 constructor 属性，因为构造函数是类的公共标识，所以最直接的方法就是使用 constructor 属性，比如：

```javascript
function typeAndValue(x) {
    if (x == null) return "";
    switch(x.constructor) {
        case: Number:
            return "Number: " + x;
        case: String:
            return "String: " + x;
        case: Date:
            return "Date: " + x;
        case: RegExp:
            return "RegExp: " + x;
        case: Complex:
            return "Complex: " + x;
    }
}
```

使用 constructor 属性检测对象属于某个类的技术不足之处和 instanceof 一样。在 **多个执行上下文** 场景中它是无法正常工作的（比如在浏览器窗口的多个框架子页面中）。在这种情况下每个框架页面各自拥有独立的构造函数集合。比如一个框架页面中的 Array 构造函数和另一个构架页面的 Array 构造函数不是同一个

### 鸭子类型

上面描述的检测对象的类的各种技术多少都会有些问题，至少在客户端 JavaScript 中是如此。解决办法就是规避掉这些问题：**不要关注「对象是什么」，而是关注「对象能做什么」**。这种思考问题的方式在 Python 和 Ruby 中右学普遍，称为「鸭子类型」

> 像鸭子一样走路、游泳并且嘎嘎叫的鸟就是鸭子

这又让我想起了《蝙蝠侠》里面的那句话：

> It’s not who you are underneath, it’s what you do that defines you

## JavaScript 中的面向对象技术

### 一个例子：集合类

集合（set）是一种数据结构，用来表示非重复值的无序集合。集合有添加值、检测值是否存在等方法，下面的例子实现了一个更加通用的 Set 类

```javascript
function Set() {
    this.values = {};
    this.n = 0;
    this.add.apply(this, arguments)
}
Set.prototype.add = function () {
    for (var i = 0; i < arguments.length; i++) {
        var val = arguments[i];
        var str = Set._v2s(val);
        if (!this.values.hasOwnProperty(str)) {
            this.values[str] = val;
            this.n++;
        }
    }

    return this;
}
Set.prototype.remove = function () {
    for (var i = 0; i < arguments.length; i++) {
        var str = Set._v2s(arguments[i]);
        if (this.values.hasOwnProperty(str)) {
            delete this.values[str];
            this.n--;
        }
    }
}
Set.prototype.contains = function (value) {
    return this.values.hasOwnProperty(Set._v2s(value))
}
Set.prototype.size = function () {
    return this.n;
}
Set.prototype.foreach = function(f, context) {
    for (var s in this.values) {
        if (this.values.hasOwnProperty(s)) {
            f.call(context, this.values[s]);
        }
    }
}
Set._v2s = function (val) {
    switch (val) {
        case undefined:     return 'u';
        case null:          return 'n';
        case true:          return 't';
        case false:         return 'f';
        default:
            switch (typeof val) {
                case 'number': return '#' + val;
                case 'string': return '"' + val;
                default: return '@' + objectId(val)
            }
    }
    function objectId(o) {
        var prop = "|**objectid**|";
        if (!o.hasOwnProperty(prop)) {
            o[prop] = Set._v2s.nex++;
        }
        return o[prop];
    }
}
Set._v2s.next = 100;

var s = new Set(1,2,3);
s.values;       // => Object {#1: 1, #2: 2, #3: 3}
var s1 = new Set(1,2,3,3,2,1, null, undefined)
s1.values;      // => Object {#1: 1, #2: 2, #3: 3, n: null, u: undefined}
s1.remove(null, undefined);
s1.values;      // => Object {#1: 1, #2: 2, #3: 3}
```

### 构造函数的重载和工厂方法

有时候，我们希望对象的初始化有多种方式，比如 Set 对象，我们想专入一个数组或者类数组，而不是多个参数来初始化它，我们可以加一些判断来实现重载（overload）

```javascript
// 重载
function Set() {
    this.values = {};
    this.n = 0;

    if (arguments.length == 1 && isArrayLike(arguments[0])) {
        this.add.apply(this, arguments[0])
    } else {
        this.add.apply(this, arguments)
    }
}

// 工厂方法: 可以从数组创建一个集合对象
Set.fromArray = function(a) {
    var s = new Set();
    s.add.apply(s, a)
    return s;
}
// Set 类的一个辅助构造函数
function SetFromArray(a) {
    Set.apply(this, a);
}
SetFromArray.prototype = Set.prototype;
var s = new SetFromArray([1,2,3]);
s instanceof Set        // => true
```

## 子类

在面向对象编程中，类 B 可以继承自另外一个类 A。我们将 A 称为父类（superclass），将 B 称为子类（subclass）。B 的实例从 A继承了所有的实例方法。类 B 可以定义自己的实例类方法，有些方法可以重载类 A 中的同名方法，如果 B 的方法重载了 A 中的方法，B 中的重载方法可能会调用 A 中的重载类 A 方法，这种做法称为「方法链」（method chaining）。同样子类的构造函数 B() 有时需要调用父类的构造函数 A()，这种做法称为「构造函数链」（constructor chaining）。子类还可以有子类，当涉及类的层次结构时，往往需要定义抽象类（abstract class）。抽象类中定义的方法没有实现。抽象类中的抽象方法是在抽象类的具体子类中实现的

### 定义子类

JavaScript 的对象可以从类的原型对象中继承属性。如果 O 是类 B 的实例，B 是 A 的子类，那么 O 也一定从 A 中继承了属性。为此，首先要确保 B 的原型对象继承自 A 的原型对象，通过 inherit() 函数可以实现

```javascript
B.prototype = inherit(A.prototype);
B.prototype.constructor = B;
```

### 构造函数和方法链

我们定义一个 Set 的子类 NonNullSet，它不允许 null 和 undefined 作为集合成员，这就需要在子类的 add() 方法中对 null 和 undefined 值做检测。它需要完全重新实现一个 add() 方法

```javascript
function NonNullSet() {
    Set.apply(this, arguments);
}
NonNullSet.prototype = inherit(Set.prototype);
NonNullSet.prototype.constructor = NonNullSet;
NonNullSet.prototype.add = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] == null) {
            throw new Error("Cant't add null or undefined to a NonNullSet");
        }
    }
    return Set.prototype.add.apply(this, arguments);
};
```

### 组合 vs 子类

上节中定义的集合可以根据特定的标准对集合成员做限制，而且使用了子类的技术来实现这种功能

然后还有一种更好的方法来完成这种需求，既面向对象编程中一条广为人知的设计原则：「组合优于继承」。这样，可以利用组合的原理定义一个新的集合实现，它「包装」了另外一个集合对象，在将受限制的成员过滤掉之后会用到这个集合对象
