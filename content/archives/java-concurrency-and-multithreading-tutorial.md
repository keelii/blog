+++
title = "Java 并发与多线程教程"
isCJKLanguage = true
categories = ["java"]
date = "2019-11-24T18:33:24.464Z"
+++

> 注：此文翻译自 [Java Concurrency and Multithreading Tutorial](http://tutorials.jenkov.com/java-concurrency/index.html)，本文只是首篇翻译

Java 中的**并发**是一个术语，涉及 Java 平台中的多线程、并发、并行等概念。包括 Java 并发工具，问题和解决方案。这个教程涵盖了多线程的核心概念、并发组成结构、并发的问题、成本与收益以及与 Java 多线程相关的问题。

## 什么是多线程？

多线程的意思是在同一个应用中有多个**执行线程**。线程就好比是你应用中的一个独立的 CPU。因此多线程的应用就好比一个拥有多个 CPU 的应用程序，这些 CPU 可以在同一时间执行不同的代码。

![introduction-1](https://i.loli.net/2019/11/25/pCfkMihbEd6zFla.png)

尽管一个线程并不等同于一个 CPU，但是通常一个 CPU 将会共享执行时间给多个线程，CPU 会在不同的线程之间来回切换，每个线程上执行一点。当然让应用中的线程执行在不同的 CPU 上也是可以的。

![introduction-2](https://i.loli.net/2019/11/25/zJOFEXSY2GTux7H.png)

## 为什么要使用多线程

大家需使用多线程的原因有很多，最重要的有以下几点：

* 更好的利用单个 CPU

* 更好的利用多个（核）CPU

* 更好的用户响应体验

* 更好的用户公允体验

下面的章节中我将一一解释这几个原因的细节。

### 更好的利用单个 CPU

最常见的原因之一是能够更好地利用计算机中的资源，比如说，一个线程正在等待一个网络请求响应的同时，另一个线程可以利用 CPU 做别的事情。另外，如果计算机有多个 CPU 或者 CPU 有多个执行内核，那么多线程同样可以帮你更好的利用这些 CPU 内核。

### 更好的利用多个（核）CPU

如果计算机有多个 CPU 或者 CPU 有多个执行内核，那么你需要在应用中使用多线程来更好的利用到所有的 CPU 和多核 CPU。单个线程最多只能利用一个 CPU，就像我上面提到的，有时甚至不能完全地利用好一个 CPU。

### 更好的用户响应体验

另外一个使用多线程的原因是提供良好的用户体验。比如说，当你点击了一个 GUI 界面上的按钮，这个动作会触发一个网络请求，接着哪个线程来处理这个请求就非常关键了。如果你同时又使用这个处理请求的线程来更新 GUI 界面，然后当 GUI 线程等待请求响应时用户就会体验到 GUI **挂起**的状态。作为替代方案，这个处理请求的线程可以单独创建成后台线程，这样的话 GUI 线程就可以用来同时响应其它请求。

### 更好的用户公允体验

第四个原因是在用户之间更公平的共享资源，想象一个例子，服务器接收客户端的请求，但是只有一个线程来处理这些请求。如果有一个客户端发送了一个请求并且处理了很久，然后其它客户端请求不得不等待那个请求结束。让每个请求都有一个属于自己的处理线程去执行，这样的话就不会有任何一个任务可以完全地霸占 CPU。

## 多线程与多任务

以前的计算机只有一个 CPU，并且在同一时间只能执行一个程序。许多的小型计算机并没有强大到能在同一时间执行多个程序，也没有尝试过这么设计。坦白地说，许多主机系统可以在同一时间执行多任务这比个人电脑已经提前好多年了。

### 多任务处理

后来多任务出现了，这意味着计算机可以同时执行多个程序（或者说任务、进程），这才真正意义上叫做同时执行。CPU 在多个程序之间被共享。操作系统在运行的程序中来回切换，每次执行一小会儿。

随着多任务处理给软件开发人员带来了新的挑战，程序不再假设 CPU 一直可用，其它如内存这样的计算机资源也一样。好的程序员会在不使用资源的时候释放它们，这样别的程序才可以使用到这些资源。

### 多线程处理

后来又出现了多线程。这意味着在程序内部你可以有多个执行线程。执行线程可以想象成 CPU 执行程序。当你有多个线程执行同一个程序时，就好比多个 CPU 在同一个程序中执行。

## 多线程并非易事

对于某些程序而言，多线程是一个非常好的提升性能的办法。然而多线程的使用相对于多任务来说具有更高的挑战。多个线程在同一个程序中执行，因此可以同时读取和写入相同的内存。这可能会导致一些单线程应用中不存在的问题。这些问题在单 CPU 的机器上可能不会被发现，因为**两个线程永远不可能真正地同时执行**。尽管如此，现代计算机可以拥有多核CPU，或者多个 CPU。这意味着不同的线程可以在不同核心的 CPU 上被同时执行。

![java-concurrency-tutorial-introduction-1](https://i.loli.net/2019/11/25/mOCWPpeyrZNEfTX.png)

如果没有合适的预防措施，这些问题就很可能会出现。程序行为甚至不能被预测。结果可能频繁地改变。因此对于程序员来说做好预防措施就变得非常重要—意味着需要去学习线程是如何访问到共享资源（内存、文件、数据库）的，这也是一个本教程要讲到的主题。

## Java 中的多线程与并发

Java 是首个把多线程处理特性提供给开发者的编程语言之一。Java 在最开始的时候就提供了多线程处理的能力。因此 Java 程序员经常面临上面我们提到的问题。这也是我写这篇文章的初衷，做为我自己的学习记录的同时也希望其它 Java 程序员能从中受益。

本教程将主要关注 Java 中的多线程处理。但是有的多线程问题与分布式系统中多任务处理面临的问题很相似。所以教程中也会出现多任务与分布式系统的相关引用，因此教程使用「并发」而不是「多线程」这个关键字。

## 并发模型

第一种**并发模型**假定多个线程在同一个程序中执行并可以同享对象。这种并发模型被称做「共享状态的并发模型」，有很多并发语言的组件构成都支持这种并发模型。

然而，自从第一本 Java 并发书被写出以来并发构架设计已经发生了很多变化，甚至是从 Java 5并发工具包发布以来，并发构架设计也经历了很多的变化。

共享状态的并发模型会引发很多难以解决的并发问题，因此，另外一种被叫做「无共享/状态分离」的并发模型流行了起来。在状态分离的并发模型中线程之间不共享任何对象或数据。这样就可以避免很多在共享并发模型中的并发访问类题。

最新的如 Netty, Vert.x 和 Play,Akka, Qbit 等异步「状态分离」平台套件慢慢崭露头角。新的非阻塞并发算法也已经发布，新的非阻塞工具像 LMax Disrupter 也被加进了套件中。Java 7 中的 Fork 和 Join 框架也引入了新的函数式编程并行特性。

随着技术的不断发展，也是时候更新下这篇教程了。因此这篇教程再一次进入了**重写**状态。新的教程会在合适的时间发布。

## Java 并发学习指引

如果你对 Java 并发还不是很了解，我建议你按下面的学习计划。你可以在左侧的菜单中找到所有主题的链接。

通用的并发与多线程理论：

* [多线程的好处](http://tutorials.jenkov.com/java-concurrency/benefits.html)

* [多线程的代价](http://tutorials.jenkov.com/java-concurrency/costs.html)

* [多线程模型](http://tutorials.jenkov.com/java-concurrency/concurrency-models.html)

* [Same-threading](http://tutorials.jenkov.com/java-concurrency/same-threading.html)

* [并发与并行](http://tutorials.jenkov.com/java-concurrency/concurrency-vs-parallelism.html)

Java 并发基础：

* [Creating and Starting Java Threads](http://tutorials.jenkov.com/java-concurrency/creating-and-starting-threads.html)

* [Race Conditions and Critical Sections](http://tutorials.jenkov.com/java-concurrency/race-conditions-and-critical-sections.html)

* [Thread Safety and Shared Resources](http://tutorials.jenkov.com/java-concurrency/thread-safety.html)

* [Thread Safety and Immutability](http://tutorials.jenkov.com/java-concurrency/thread-safety-and-immutability.html)

* [Java Memory Model](http://tutorials.jenkov.com/java-concurrency/java-memory-model.html)

* [Java Synchronized Blocks](http://tutorials.jenkov.com/java-concurrency/synchronized.html)

* [Java Volatile Keyword](http://tutorials.jenkov.com/java-concurrency/volatile.html)

* [Java ThreadLocal](http://tutorials.jenkov.com/java-concurrency/threadlocal.html)

* [Java Thread Signaling](http://tutorials.jenkov.com/java-concurrency/thread-signaling.html)

Java 并发中的经典问题：

* [Deadlock](http://tutorials.jenkov.com/java-concurrency/deadlock.html)

* [Deadlock Prevention](http://tutorials.jenkov.com/java-concurrency/deadlock-prevention.html)

* [Starvation and Fairness](http://tutorials.jenkov.com/java-concurrency/starvation-and-fairness.html)

* [Nested Monitor Lockout](http://tutorials.jenkov.com/java-concurrency/nested-monitor-lockout.html)

* [Slipped Conditions](http://tutorials.jenkov.com/java-concurrency/slipped-conditions.html)

Java 中用来解决上面问题并发体系：

* [Locks in Java](http://tutorials.jenkov.com/java-concurrency/locks.html)

* [Read / Write Locks in Java](http://tutorials.jenkov.com/java-concurrency/read-write-locks.html)

* [Reentrance Lockout](http://tutorials.jenkov.com/java-concurrency/reentrance-lockout.html)

* [Semaphores](http://tutorials.jenkov.com/java-concurrency/semaphores.html)

* [Blocking Queues](http://tutorials.jenkov.com/java-concurrency/blocking-queues.html)

* [Thread Pools](http://tutorials.jenkov.com/java-concurrency/thread-pools.html)

* [Compare and Swap](http://tutorials.jenkov.com/java-concurrency/compare-and-swap.html)

更多主题：

* [Anatomy of a Synchronizer](http://tutorials.jenkov.com/java-concurrency/anatomy-of-a-synchronizer.html)

* [Non-blocking Algorithms](http://tutorials.jenkov.com/java-concurrency/non-blocking-algorithms.html)

* [Amdahl’s Law](http://tutorials.jenkov.com/java-concurrency/amdahls-law.html)

* [References](http://tutorials.jenkov.com/java-concurrency/references.html)