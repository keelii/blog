+++
title = "我理解的 iOS 与 Android 的区别"
isCJKLanguage = true
categories = ["OS"]
tags = ["iOS", "android", "apple", "google"]
date = "2018-10-15T19:10:24.464Z"
+++

事实上在讲清楚这个问题之前，必须知道一个所有人都无法拒绝的常识，即：对大多数人来说 iOS 绝对比 Android 好用。本文试着从使用者的角度出发谈谈自己对两个手机端操作系统的理解与认识

## iOS 为何好用

决定一个操作系统好用与否的原因有很多，系统的功能健全、用户体验、稳定性、应用程序及其周边生态等。iOS 操作系统从本质上讲是一个闭源、高度统一且集中式的操作系统，这个集中可以理解为中心化的。回顾 iOS 发展历你会感觉这种高度集中的程度甚至达到了「集权」的程度，苹果对自己的操作系统有着几乎所有的控制权，这就使得 iOS 系统无论是 UI 交互、设计风格还是应用生态都天然的具备了近乎完美的一致性。当你手里拿着最新款的 iPhone 的时候你会觉得她简直就是一件艺术品。深层次上这就使得苹果的产品在审美上可以 **主动的** 影响用户，而不是被动的接受用户的反馈

大家都知道 iOS 的生态好，但是到底好在哪里？我认为好在两方面

其一 *应用生态*，一个应用从前期的设计、中期的开发、后期的运营苹果都提供了很多解决方案。设计时有 [HIG](https://developer.apple.com/design/human-interface-guidelines/ "human-interface-guidelines")，开发时有 Xcode 集成开发环境，运营商业化的时候有应用内购买、Apple Pay、Searchads 等一系列的解决方案，所以我们看到很多独立开发者做的应用都非常优秀甚至超过了某些商业公司。细心的话你会发现上面提到的这些似乎在 Android 平台也有一些影子。但实际上差别还是很大的，这就好比程序员写的代码示例和生产环境跑的应用程序对比起来完全不是一个量级的概念

其二 *系统生态*，这一点可能很多人并没在意，但是却非常重要。操作系统做为所有上层应用的基础其重要性不言而喻，据说 iOS 12 安装率已达到了 50%，iOS 11 使用了一个月的时间才达到的水平 iOS 用了 20 天内就完成了。由此可见其高效的更新迭代周期。在软件开发的过程中有重要的一个概念就是软件的生命周期。其实软件和人是一样的，人有生老病死，软件有增删查改。好的软件应该保持这种平衡。老旧的部分该删除的就应该删除，欠缺的部分该添加添加应该升级升级。可是大多时候人们都只喜欢添加加功能。程序员应该非常清楚这一点，维护或者兼容老系统是非常痛苦的，但是在苹果却能把 iOS 系统维护的相当完备。当然这不仅仅在于 iOS 的集中性，也在于苹果对自己产品的营销手段及用户心理的预期控制

## Android 为何零乱

Android 令人印象深刻的当属国内的 *应用市场*，国外的应用市场并没有国内这么泛滥，国外的应用市场要么是第三方的那种综合类下载站要么就是有能力做手机的厂商。手机厂商都想建立属于自己的闭环系统，但是实际上只有 Google 才能从根本上做到闭环，手机厂商本质上只是一层 ROM 或者 UI，就是上面提到的应用生态。事实上很多公司连自己的应用生态都做不好。

Android 系统本质上讲是一个开源、自由的操作系统。这是它的基因，但是开源与自由有的时候会被人滥用，甚至利用。自由的基因决定了 Android 会提供给用户几乎所有的选择和路径。你喜欢的不喜欢的、想要的不想要的它统统都有，你不得不自己做出选择。但是当手机做为一种工具的时候，很多用户并不需要一个瑞士军刀，它们只想要一个简单好用的螺丝刀就够了。对于那些挑剔的特殊用户 Android 再适合不过了，你可以把 Android 看成一个微型计算机，你可以像玩树莓派一样去定制它，Web 服务器、智能家居、私有云等等，但这些都要建立在你有能力的基础上

Android 零乱的原因还有一点就是用户的需求总是多样的，而 Andoird 本身的使命就是满足他们。比如就会有人看到 iPhone 的刘海觉得很别致，自己可能换不了 iPhone，然后就会理所当然的认为 Android 也应该有，因为这是 潮流

既然提到了 iPhone，那也应该聊下 Google 的 Pixel。Pixel 最近刚出 3 系列，刘海居然是默认的设置，大家已经有很多吐槽了。自然不必多讲。事实上 Pixel 系列手机让我看到了很多的闪光点，Google 现在似乎也慢慢明白了自己做手机的方向，在 Pixel 3 的发布会上多次提到了 End-to-End 的摄像头的概念，它可以从一张照片里面分析出里面的建筑、人物，进而知道和人物相关的东西，比如它的年龄、性别、穿着。有了这些信息后他就可以做一些真正有用的推荐。如果你是 Google 的重度用户的话你会发现近两年 Google 的一些新的技术/软件正在成体系的发展，这是在苹果系统上看不到的。举个例子，iOS 的 Siri 和 Google 的 Assistant。一方面 Google Assistant 的智能程度好过 Siri 几条街，一方面你会觉得 Google Assistant 真的可以做到一些有用的事情而不只是一个玩具。比如 接到来电识别出来是骚扰电话，assistant 就可以帮你「礼貌」回绝了

 Google 做 Android 手机可以很好的解决 Android 的一些问题，但是由于 Google 本身是一家技术基因的公司，它所有的软件都会以功能为主。设计和用户体验不会是它的强项，这就使得 Google 做的手机用起来总是有一种不爽的感觉。比如就滚动这个操作，iOS 的交互处理的非常好，不仅仅界面操作流畅，而且响应快，该停的时候立即停下来。反观 Android，虽然流畅度上可能很多用户已经体会不出来与 iOS 之间的差异了，但是使用 Android 总让你感觉该顺滑的时候顺滑，不该顺滑的时候也很「顺滑」。还有 Pixel 3 上展示的和 iPhone 对比夜间成像的问题，Pixel 可以做到把夜晚照得和白天一样，大多数情况下是有好处的，但是假如用户就想拍张夜晚的照片那就比较尴尬了吧

## 结语

事实上很多时候大家讨论 iOS 与 Android 好坏只是在说其中某一点，因为这些点能打动用户。但是很诡异的是人们总是喜欢以贬低对方的不足来突出自己的优势，因为没有人甘于承认自己花钱买来的东西不如别人的
