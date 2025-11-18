---
title: 如何写出优雅的代码？
description: 关于代码品味的总结，主要是微观层面上的
publishDate: 2025-11-19
language: 中文
tags:
  - CS
  - Taste
---

> Taste matters.
## 0 Simple and Explicit - 简 明
> 核心哲学：
> **“优雅的代码应最小化别人的理解时间”** 
> %%这里的“别人”，不仅包括他人、LLM（作为训练数据），还包括3个月以后的自己。%%

### 零、好好写代码，好好写注释，好好写Commit Comment，好好写文档。
> 如果你不是在打信息学竞赛（或者是Codeforce/Leetcode周赛），就请你**忘掉**那些为了极致节约几秒而养成的**肮脏习惯**。
#### 什么时候绝对不要写注释？
如果你的注释是为了解释“这行代码太复杂了/太乱了，我解释一下”，**请停下，去重构代码。**

试图粉饰烂代码：
```c++
    // 这里的逻辑是：先算出偏移量，如果是VIP用户，
    // 且注册时间超过3年，就跳过前两个校验位...
    if ((u.f & 4) && (t > 1095) && !(f & 0x01)) { ... }
```
优雅的做法： 不要写注释，把这一大坨逻辑提取成一个函数。

> 最好的注释是自解释的代码。（self-documentation）
#### 注释：不只解释“是什么”，还解释“为什么”
- Bad: 
	`// 增加 i 的值` (废话，我看代码也知道)
- Good:
	`// 这里必须增加偏移量，因为旧版 API 返回的数据是从 0 开始索引的` (解释了上下文和坑)

#### 文档：没有文档 = 功能不存在

### 一、把信息装进命名里
#### 名字的长度应**与作用域成正比**
别给变量起名`tmp`，更别给变量起名`abcdefg`（除非变量生命周期极其短暂）
#### 拒绝**多义词**
少用 `get`、`process`、`data` 这种空洞的词。
- _Bad:_ `GetPage(url)` (是从缓存取？还是从网上下载？)
- _Good:_ `FetchPage(url)` 或 `DownloadPage(url)`

其他经典的同义替换：
- **`Find`** 往往暗示简单的查找。
	- 如果是经过复杂计算得出的：`Compute` 或 `Calculate`
	- 如果是从数据库查的：`Query`
	
- **`Size`**  容易歧义。
	- 树的高度？`Height`
	- 节点的数量？`Count` / `NumNodes`
	- 内存占用？`MemoryBytes`

> Taboo Your Word.
### 二、扁平 > 嵌套
> 这是为了避免读者的”大脑缓存“过载。
#### 使用“**卫语句**” (Guard Clauses) 尽早返回：这能消除深层嵌套，让代码变“平”。
Bad (嵌套地狱):
```c++
if (user != nullptr) {
	if (user->is_active) {
		// 核心逻辑...
	}
}
```
 Good (卫语句):
```c++
if (user == nullptr) return;
if (!user->is_active) return;
// 核心逻辑... (现在这里缩进层级很浅)
```

#### 使变量作用域尽量小
在需要的地方定义变量，这样读者才不用记住这么多前置信息。

> 程序也是有读者的，所以写优雅的程序就像写优雅的文章一样，要“面向对象”。
### 三、短 > 长
#### 别写过长的函数，过大的类。
没人想读你的代码。
是的，你自己也不想。

## 1 Defensive Coding - 防御式代码
> 所有人都是sb。
> 用户、开发者伙伴、你自己。

%% 如果你仔细阅读，会发现这里就有一个"bug"%%
### 一、假设所有输入都是垃圾
防不了SQLinjection那种这里就不提了。
我们来看一段天真无邪的代码：❌
```c++
// 默认传入的一定是合法的指针，且 value 一定有效
void UpdateScore(User* user, int value) {
    user->score += value; // 如果 user 是 nullptr，程序直接崩溃 (Segfault)
}
```
再来看一段被迫害妄想症的代码：✅
```c++
void UpdateScore(User* user, int value) {
    // 1. 哪怕文档写了“不能传空”，也不要信
    if (user == nullptr) {
        // 可以在这里抛异常，或者打个 Error Log 然后直接返回
        // 这里的原则是：Garbage In, Nothing Out (而不是 Garbage Out)
        LogError("UpdateScore called with null user"); 
        return; 
    }

    // 2. 业务逻辑检查：分数为负可能是不合法的
    if (value < 0) {
        LogError("Negative score not allowed"); 
        return;
    }
    
    user->score += value;
}
```

### 二、Fail Fast - 宁愿死得明明白白，也不要放过一只双马尾（蟑螂）
❌留下隐患的代码：
```c++
enum Color { RED, BLUE };

// 现在的代码没问题，但如果以后加了 GREEN 怎么办？
string GetName(Color c) {
    if (c == RED) return "Red";
    else return "Blue"; // 默认全部归为 Blue，这是一个巨大的坑
    // 少用else！
}
```
✅“死得明明白白”的代码：
```c++
string GetName(Color c) {
    switch (c) {
        case RED: return "Red";
        case BLUE: return "Blue";
        default:
            // 这里的逻辑是：
            // "如果我们走到了这里，说明有人改了 Color 枚举但没改这个函数。"
            // "这绝不能忍，立刻崩溃给我看，别让错误数据流进数据库。"
            assert(false && "Unknown color type detected!");
            throw std::runtime_error("Unknown color");
    }
}
```

当家里有一只双马尾时，如果你不捉住它，很快就会有很多只。代码库同理。

### 三、只给最小的必要权限。
**谁是 sb？** 你。（其实是我）
你就想想你多少次把 $==$ 打成 $=$ 吧。

❌ 给了过多权限的代码
```c++
void PrintUser(User& user) { // 传的是引用，很危险
    if (user.age = 18) {     // 致命手误！把 == 写成了 =
         // user.age 真的被改成 18 了，且条件永远为真
         cout << "Young";
         // 可惜不是想Young就能永远18的！
    }
}
```

✅ 给自己带上镣铐的代码 (`const` 才是真爱)：
```c++
// 既然只是“打印”，就加上 const，禁止任何修改
void PrintUser(const User& user) { 
    // if (user.age = 18) -> 编译器直接报错：无法给 const 变量赋值
    // 这种防御是在编译期完成的，最优雅
    if (user.age == 18) {
         cout << "Young";
    }
}
```

## 2 Trade-off Art 权衡的艺术
当你需要极致的短时间时，你要么用Python，要么放弃大部分标准，放弃安全，放弃good taste。

但是，很多时候，你不需要极致的省时间。无论是你的时间，还是机器的时间。
这时候你就需要权衡。

如果你把眼光投到代码细节之外，你会发现计算机（乃至工科）中这样的例子比比皆是。
- 机器学习中的Bias-Variance权衡
- 计组中存储的“不可能三角”（速度-容量-成本）及其妥协（多级缓存-主存）
- 应用框架选择中，新架构微信选择了Qt以提供良好的性能，而大多数现代应用会选择Electron等Web混合架构以提高开发迭代速度。

而在写优雅的代码这一微观层面，
我们同样需要“糟糕的更好” (Worse is Better)。
（但这不意味着我可以生产💩或者让AI生产💩来污染互联网/训练数据）

具体来说，你写的项目越大，越复杂，你就越应该遵守上述的优雅规范。

但是这还是不够，因为我们往往从一个小项目开始，不知不觉地就将其扩展成了一个大项目。
这时候，就需要 “**重构**”。(Refactoring)

### 重构
> 核心哲学：优雅是改出来的。

#### “一次性完美”的问题
- 在实际项目中，需求总是在变化的，我们不可能在项目开始前就设计出完美的架构。
- 试图在第一遍就写出“最优雅”代码的行为，往往会导致**过度设计 (Over-design)** 和项目延期。
- **重构 (Refactoring)** 的意义就在于，允许你在代码还能工作的前提下，随时进行结构上的调整，以适应新的需求和对代码更深入的理解。
#### 流程：小步快跑的循环
不要试图同时做好每一件事（在快速实现的前提下写出优雅的代码）。
不断更换头顶上的帽子（角色），高速迭代才是大多数开发场景下（除了系统）适用的哲学。
1. **简单实现**：用“实惠”的架构完成应用的简单实现，然后设置测试。
2. **添加新功能：** 此时只关注功能实现，代码可能会变“丑”。
3. **重构清理：** 功能完成后，戴上你的“重构帽”，大步地更改架构，或者小步地清理、优化代码。
4. **循环：** 回到第一步。

## 后言

- 本文主要专注于微观层面的“优雅”，但其实还有很多宏观层面的，这需要我不断地思考、选择，需要我提高品味。
- 本文不可能涵盖所有的代码开发原则，所以只是试图整理并按重要性排序一些优雅代码的特点，并给出一些行之有效的方法。
- 有很多细节上的东西，需要你慢慢积累。

我知道很多同学沉溺于Vibe Coding（让AI写代码），但至少到目前为止，当你在构建足够复杂的应用时，你还是需要自己提出/选择良好的架构和算法，并不断对AI写的代码进行Code Review。
但如果我自己都不知道什么是优雅的代码，又怎么去Code Review呢？

## 参考资料及延伸阅读
- Python之禅
```
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```
%%我这里故意没有提供翻译，是因为读英语会让你慢下来，得以细细品味。另外，只需要在`python -i`中使用`import this`便可以获得此禅%%

- [Linus Torvalds: The mind behind Linux (TED Interview)](https://www.youtube.com/watch?v=o8NPllzkFhE)
	可以接快进到 **14:20** 左右，观看关于 **"Good Taste" (好品味)** 的片段。
	这个视频会向你证明“好品味”的标准是无上限的，或者说没有最好的代码，只有更好的代码。而且，往往越顶尖的工程师，他们的代码品味越好。
	（我真的觉得他给的案例中第一个版本的代码已经写得很好了）

- "K&R"的《C程序设计语言》
	c语言缔造者写的c语言教程，处处彰显了什么叫做“好代码”。
	也是这篇文章的主要灵感来源（今天刚好读完了这本书，大受震撼）。

- Google Engineering Practices Documentation (Google 工程实践文档)
	主要是关于Code Review的，可以从中看到什么是“权衡的艺术”。
	[中文翻译版Gitbook](https://zijinshi.gitbook.io/google/)

- 《编写可读代码的艺术》
- 《重构：改善既有代码的设计》
	这两本书我没怎么仔细读，但是查资料时发现里面的总结很棒，便有所借用。