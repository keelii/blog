+++
date = "2017-02-19T15:10:38+08:00"
title = "关系代数的基本运算"
isCJKLanguage = true
categories = ["math", "database"]
tags = ["set","operation","RA"]
math = true
+++

## 关系代数运算符

**集合运算符**

| 运算符 | 含义 | 英文 |
| ------------ | ------------ | ------------ |
| $∪$ | 并 | Union |
| $−$ | 差 | Difference |
| $∩$ | 交 | Intersection |
| $×$ | 笛卡尔积 | Cartesian Product |

**比较运算符**

| 运算符 | 含义 |
| ------------ | ------------ |
| $>$ | 大于 |
| $≥$ | 大于等于 |
| $<$ | 小于 |
| $≤$ | 小于等于 |
| $=$ | 等于 |
| $≠$ | 不等于 |

**专门的关系运算符**

| 运算符 | 含义 | 英文 |
| ------------ | ------------ | ------------ |
| $σ$ | 选择 | Selection |
| $π$ | 投影 | Projection |
| $⋈$ | 链接 | Join |
| $÷$ | 除 | Division |

**逻辑运算符**

| 运算符 | 含义 |
| ------------ | ------------ |
| $∧$ | 与 |
| $∨$ | 或 |
| $¬$ | 非 |

## 5 种基本的关系代数运算

### 并（Union）

关系 R 与 S 具有相同的关系模式，即 R 与 S 的元数相同（结构相同），R 与 S 的并是属于 R 或者属于 S 的元组构成的集合，记作 R ∪ S，定义如下：

<div>
$$R∪S=\{t|t∈R∨t∈S\}$$
</div>

### 差（Difference）

关系 R 与 S 具有相同的关系模式，关系 R 与 S 的差是属于 R 但不属于 S 的元组构成的集合，记作 R − S，定义如下：

<div>
$$R−S=\{t|t∈R∨t∉S\}$$
</div>

### 广义笛卡尔积（Extended Cartesian Product）

两个无数分别为 n 目和 m 目的关系 R 和 S 的 笛卡尔积是一个 (n+m) 列的元组的集合。组的前 n 列是关系 R 的一个元组，后 m 列是关系 S 的一个元组，记作 R × S，定义如下：

<div>
$$R×S=\{t|t=<(t^n,t^m)∧t^n∈R∧t^m∈S\}$$
</div>

$\(t^n,t^m\)$ 表示元素 $t^n$ 和 $t^m$ 拼接成的一个元组

### 投影（Projection）

投影运算是从关系的垂直方向进行运算，在关系 R 中选出若干属性列 A 组成新的关系，记作 $π_A\(R\)$，其形式如下：

<div>
$$π_A(R)=\{t[A]|t∈R\}$$
</div>

### 选择（Selection）

选择运算是从关系的水平方向进行运算，是从关系 R 中选择满足给定条件的元组，记作 $σ_F\(R\)$，其形式如下：

<div>
$$σ_F(R)=\{t|t∈R∧F(t)=True\}$$
</div>

## 实例

设有关系 R、S 如图所示，求 $R∪S$、 $R−S$、 $R×S$、 $π\_{A,C}\(R\)$、 $σ\_{A>B}\(R\)$ 和 $σ\_{3<4}\(R×S\)$

![关系表RS](https://img10.360buyimg.com/devfe/jfs/t3967/269/2409299226/5377/e997b909/58a95fceNddd39fd7.png)

进行并、差运算后结果如下：

![并差](https://img14.360buyimg.com/devfe/jfs/t3949/95/2458170516/5487/1c7f1f38/58a967b1N42db123f.png)

进行笛卡尔、 投影、 选择运算后结果如下：

![笛卡尔_投影_选择](https://img30.360buyimg.com/devfe/jfs/t3943/109/2403665652/38834/c636281b/58a9685dN20af0b9b.png)

## 扩展的关系代数运算

### 交（Intersection）

关系 R 和 S 具有相同的关系模式，交是由属于 R 同时双属于 S 的元组构成的集合，记作 R∩S，形式如下：

<div>
$$R∩S=\{t|t∈R∧t∈S\}$$
</div>

### 链接（Join）

注：下面的 θ 链接应该记作：![theta链接](https://img10.360buyimg.com/devfe/jfs/t3967/158/2461240249/2389/530d7d07/58aa580aNe9908740.png)

#### θ 链接

从 R 与 S的笛卡尔积中选取属性间满足一定条件的元组，可由基本的关系运算笛卡尔积和选取运算导出，表示为：

<div>
$$R \Join_{XθY} S = σ_{XθY}(R×S)$$
</div>

XθY 为链接的条件，θ 是比较运算符，X 和 Y 分别为 R 和 S 上度数相等且可比的属性组

例如：求 $R \Join\_{R.A<S.B} S$，如果为：

![theta链接小于过程](https://img14.360buyimg.com/devfe/jfs/t3133/127/6662942086/21071/88c200da/58aa5b1fN3e2316d5.png)

#### 等值链接

当 θ 为「=」时，称之为等值链接，记为： $R\Join_{X=Y}S$

#### 自然链接

自然链接是一种特殊的等值链接，它要求两个关系中进行比较的分量必须是 **相同的属性组**，并且在结果集中将 **重复的属性列** 去掉

例如：设有关系 R、S 如图所示，求 $R \Join S$

![关系RS](https://img11.360buyimg.com/devfe/jfs/t3982/212/2472511181/5973/54467e2a/58aa5ffaN970f7e5a.png)

先求出笛卡尔积 $R×S$，找出比较分量（有相同属性组），即: R.A/S.A 与 R.C/S.C

![求出笛卡尔积](https://img10.360buyimg.com/devfe/jfs/t3841/5/4275908218/12385/79e83d01/58aa6066Nd003e697.png)

取等值链接 $R.A = S.A$ 且 $R.C = S.C$

![找出相同属性的比较分量](https://img10.360buyimg.com/devfe/jfs/t3256/75/6205568741/12327/2b1dc867/58aa60e8N38a84108.png)

结果集中去掉重复属性列，注意无论去掉 R.A 或者 S.A 效果都一样，因为他们的值相等，结果集中只会有属性 A、B、C、D

![结果集中找出重复属性列](https://img12.360buyimg.com/devfe/jfs/t3217/183/6576493853/4744/ccb96965/58aa612eN043f7425.png)

最终得出结果

![RS自然链接结果](https://img12.360buyimg.com/devfe/jfs/t3247/65/6676502314/2874/657ddb0c/58aa617eN2457f536.png)

### 除（Division）

设有以下如图关系，求 $R÷S$

![关系RS1](https://img10.360buyimg.com/devfe/jfs/t3151/348/6716540896/7287/dc01ad2e/58aaaf3bN1cae8b1a.png)

取关系 R 中有的但 S 中没有的属性组，即：A、B

![关系RS1取属性AB](https://img11.360buyimg.com/devfe/jfs/t3202/137/6722879648/7244/3b47a185/58aaaf81N0b2491b5.png)

取唯一 A、B 属性组值的象集

![关系RS1取属性AB对应的象集](https://img11.360buyimg.com/devfe/jfs/t3871/170/2430481542/5179/be5899c5/58aaafe6N8297b49f.png)

可知关系S存在于 a,b/c,k 象集 中。即 $R÷S$ 得

![关系RS1除结果](https://img10.360buyimg.com/devfe/jfs/t3130/361/6704334588/3366/6b7e0b56/58aab058N3a3c374d.png)