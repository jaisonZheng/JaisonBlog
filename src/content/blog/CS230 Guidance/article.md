---
title: CS230导学
description: CS230导学文档
publishDate: 2025-12-25
language: 中文
tags:
  - CS
  - CS230
---
> 这不仅仅是一份内容合集，更是一个“带有偏见”的学习建议，因为没有偏见就没有取向，也就没有价值。

## 课程资源
### 课程syllabus
https://cs230.stanford.edu/syllabus/
### b站上的deeplearning视频
https://www.bilibili.com/video/BV1FT4y1E74V/
### Youtube上的2025版Lecture视频
https://www.youtube.com/playlist?list=PLoROMvodv4rNRRGdS0rBbXOUGA0wjdh1X
### Assignments 编程作业
由于Github上不带答案的作业版本大多都是带有1.x版本的Tensorflow，而Coursera上的新版则是2.3版本的Tensorflow，而现在Coursera的Financial Aid “仅能”减免75%，对于一个中国大学生来说还是很贵。

所以我clone了一个Github上一个带答案的新版作业，然后请Windsurf帮我写了个python脚本，清除掉所有`# YOUR CODE STARTS HERE`和`# YOUR CODE ENDS HERE`之间的部分。
（抱歉Andrew NG，现在specialization又变贵了，申请学生之后也不能免费，而且要一个阶段一个阶段的申请，以后有钱了一定补票！）

[新版作业Github](https://github.com/amanchadha/coursera-deep-learning-specialization)

### Quiz 问答作业
网上到处都是，而且有中文翻译。

---

## 学习建议
### 1、学CS230而不是只学Coursera上的DeepLearning课程。
强烈建议你不只是学习Coursera上面的DeepLearning课程，而是跟随CS230“翻转课堂”的步伐，综合学习这两者。
（Coursera课程是CS230的真子集，CS230会要求你按照一定顺序完成Coursera课程，并且辅以Lecture）
	原因：在CS230比Coursera多出来的短短的几节Lecture中，你会高强度地思考并尝试回答老师上课提出来的讨论问题，并因此获得仅上Coursera 2倍的收获，但是你只多花了一点点时间。
	另外，Coursera课程推出的时间较晚，而Lecture有2018和2025的版本，2025的版本会帮助你跟上时代，重点学习当下的前沿技术。

### 2、看2025版本的Lecture（而不是2018版本的）
如果你还没开始看Lecture，直接开始看2025版本的即可。

如果你已经把2018版本的Lecture看过一遍了，那可以看一下2025版的以下几节课：
- [Lecture 7: Agents, Prompts, and RAG](https://www.youtube.com/watch?v=k1njvbBmfsw)
	这是2025年最显著的区别。
	Andrew Ng 和 Kian Katanforoosh 会专门讲授 Agentic Workflows（智能体工作流）。 内容包括：何设计 ReAct 模式，如何让 LLM 调用工具（Tool use），以及如何搭建 RAG 系统来处理私有数据。
	2018年完全没有这部分。（有一节新课上其实很幸福hhhh）
- [Lecture 3: Full Cycle of a DL project](https://youtu.be/MGqQuQEUXhk?si=OWWvqNSPul06UmC1)（我实际看了之后觉得没必要）
	AI会告诉你Lecture3也可以看看，但我觉得完全没必要，因为2025版的Lecture3本质上只提出了一个新东西：Data-Centric AI。
- Guest Lecture？
- 如果是看了2025版本的，是不是也可以看看2018版的Sequence部分？