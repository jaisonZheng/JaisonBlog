---
title: Deep Dive - Claude Code Prompt Analysis
description: 感谢 Anthropic 手滑开源
publishDate: 2026-03-30
language: 中文
tags:
  - CS
  - AI
---
前两天泄漏的 Claude Code 设计得极为精巧，但还是有 51.2 万行代码，整体分析不太现实。
本文仅分析其 Prompt 部分的设计，代码文件位于 [constants/prompt.ts](https://github.com/jaisonZheng/claude-code-src/blob/main/src/constants/prompts.ts)。

我们可以将 Claude Code Prompt 以两种标准划分：
- **静态加载 / 动态加载**（静态加载的部分会放在 Prompt 的最前面，确保每次命中缓存）
- **普通模式 / Ant模式**（Ant 模式为 Anthropic 给内部员工预留的模式）


**静态加载部分**
- **Simple Intro (简单介绍):** 设定 AI 助手身份，并包含防止网络钓鱼的硬性安全指令。
- **System (系统机制):** 解释 Markdown 渲染、权限拦截及无限上下文的自动摘要机制。
- **Doing Tasks (工程原则):** 规定核心开发原则，如严禁多余代码、无用文件或过度设计。
- **Actions (安全红线):** 强调高危操作（如删库、强制推送）必须先获得用户确认。
- **Using Tools (工具规范):** 强制优先使用垂直领域专用工具，严控基础 Bash 的调用。
- **Tone & Style (语气格式):** 规范交互风格，如禁用无意义表情、强制要求文件行号标注。
- **Output Efficiency (输出效率):** 规定回复的详略程度与排版排版要求。

**动态加载部分**
- **Session Guidance (会话建议):** 根据当前启用的工具组合（如验证 Agent）动态调整规则。
- **Memory (个性化记忆):** 从本地文件（如 CLAUDE.md）或全局记录中提取的项目上下文。
- **Environment Info (环境信息):** 注入 CWD、操作系统、Git 状态及模型知识截止日期。
- **Language & Style (语言偏好):** 实时加载用户自定义的语言（如中文）及输出风格。
- **MCP Instructions (协议指令):** 动态挂载第三方 MCP 服务的特定系统指令。
- **Scratchpad (草稿本):** 规定临时文件的存储路径与读写规范。
- **FRC (结果清理):** 动态配置陈旧工具执行结果的清理规则，优化上下文空间。
- **Experimental (实验功能):** 包含 Token 预算控制、自主模式等实验性触发指令。

下面我们挑取几个有趣的点进行分析：

## 普通模式
### 1、无限上下文假设
`getSimpleSystemSection()` 和 `getSimpleDoingTasksSection()`
```
`The system will automatically compress prior messages in your conversation as it approaches context limits. This means your conversation with the user is not limited by the context window.`
```
主动和 LLM 说，**不要担心上下文**，可能是为了防止 LLM 因为考量上下文长度而缩减输出 / 仅产出 Demo。
（但你又会发现除了这句 Prompt，大部份 Prompt 都在试图精简输出）

### 2、不要重构，不要完美，不要画蛇添足
```
`Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability. Don't add docstrings, comments, or type annotations to code you didn't change. Only add comments where the logic isn't self-evident.`,
`Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use feature flags or backwards-compatibility shims when you can just change the code.`,
```
- 严禁画蛇添足，**仅做用户要求做的事**。
- 不要太“防御性编程”，相信其余代码的质量，只对重要的部分作防御性校验（如用户输入）。

这一部分似乎不太好理解，而且似乎有点“违反软件工程规范”。我感觉可能是因为 LLM 很喜欢动不动就重构代码，或者加很多完美主义实际上没啥用的防御编程，导致代码复杂度增加。所以需要用 Prompt 让其 Be simple。

### 3、严格控制注释
```
`Default to writing no comments. Only add one when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, behavior that would surprise a reader. If removing the comment wouldn't confuse a future reader, don't write it.`,

`Don't explain WHAT the code does, since well-named identifiers already do that. Don't reference the current task, fix, or callers ("used by X", "added for the Y flow", "handles the case from issue #123"), since those belong in the PR description and rot as the codebase evolves.`,

`Don't remove existing comments unless you're removing the code they describe or you know they're wrong. A comment that looks pointless to you may encode a constraint or a lesson from a past bug that isn't visible in the current diff.`,
```
- 尽量不写注释，除非为什么不明显。
- 禁止解释代码在干嘛，因为好的命名可以做到这一点。
- 禁止删除注释（除非你删了它对应的代码）

如果你打开claude code源码，你会发现注释寥寥无几，且基本是代码块前的大块注释（而没有逐行注释），但代码可读性甚佳。
可见这几条也是人编程时应当做到的。

### 4、禁止卖萌
```
`Only use emojis if the user explicitly requests it. Avoid using emojis in all communication unless asked.`,
```
- 如果用户没有明确要求，就不能输出 emoji。

这一点可能是因为，模型在训练时主要针对与普通用户的逐行交互，在 A/B 测试后的 RLHF 极易引入大量emoji，而 claude code 是生产级软件。
（所以你要是想让 claude code 跟你卖萌，记得主动跟他说）

### 5、备忘录机制
```
 `# Function Result Clearing
Old tool results will be automatically cleared from context to free up space. The ${config.keepRecent} most recent results are always kept.`
}
const SUMMARIZE_TOOL_RESULTS_SECTION = `When working with tool results, write down any important information you might need later in your response, as the original tool result may be cleared later.`
```
- 禁止模型依靠记忆（这里的记忆指的不是上下文，而是注入 Prompt 的 memory），要求模型将重要结果写入备忘录

### 6、没事干就滚去睡觉
```
Use the ${SLEEP_TOOL_NAME} tool to control how long you wait between actions. Sleep longer when waiting for slow processes, shorter when actively iterating. Each wake-up costs an API call, but the prompt cache expires after 5 minutes of inactivity — balance accordingly.
```
- 用休眠机制（但你在等待action完成）
- 但是每五分钟要 prompt 一次（因为 cache 每五分钟更新一次，这样可以命中cache节省成本）

### 7、全世界共用 cache 
```
* Boundary marker separating static (cross-org cacheable) content from dynamic content.
```
cross-org cacheable 跨组织可缓存
这意味着如果你用 claude code 搭配 claude，一开始的那段静态 Prompt 是一定会命中 cache的。


## ant 模式
ant 模式的 Prompt 基本都是附加在 普通模式之上的，开启 ant 模式之后，大部分普通模式 Prompt 仍会被输入给 LLM。
代码中有多句注释提到了"capy"/"v8"（比如`@[MODEL LAUNCH]: capy v8 thoroughness counterweight`），可见 ant 模式的不少功能是针对新模型开发的。

### 1、敢于挑战用户
```
`If you notice the user's request is based on a misconception, or spot a bug adjacent to what they asked about, say so. You're a collaborator, not just an executor—users benefit from your judgment, not just your compliance.`,
```
如果用户错了，那他就是错了。**你是一个协作者，而不只是一个执行者**。用户得益于你的判断，而不只是你的顺从。

### 2、Simple -> Explicit
`getOutputEfficiencySection()`
这一部分源码使用了 if else，
普通模式下是：
```
IMPORTANT: Go straight to the point. Try the simplest approach first without going in circles. Do not overdo it. Be extra concise.

Keep your text output brief and direct. Lead with the answer or action, not the reasoning. Skip filler words, preamble, and unnecessary transitions. Do not restate what the user said — just do it. When explaining, include only what is necessary for the user to understand.

...

If you can say it in one sentence, don't use three. Prefer short, direct sentences over long explanations. This does not apply to code or tool calls.`
```
极度强调简洁性且几乎只强调了简洁性。
而 ant 模式下是：
```
What's most important is the reader understanding your output without mental overhead or follow-ups, not how terse you are. If the user has to reread a summary or ask you to explain, that will more than eat up the time savings from a shorter first read.
...
```
强调要让用户搞懂。

感觉当前的 Claude Code 输出确实过于简洁了，导致我经常问他具体的细节实现和逻辑问题。

### 3、引入 subagent 做对抗性检查
```
The contract: when non-trivial implementation happens on your turn, independent adversarial verification must happen before you report completion \u2014 regardless of who did the implementing (you directly, a fork you spawned, or a subagent). You are the one reporting to the user; you own the gate. Non-trivial means: 3+ file edits, backend/API changes, or infrastructure changes.`
```
这是一个 multi-agent 设计，要求在更改>3处文件时，强制引入 verification agent 做测试和检查，自己说的不算。

### 4、Undercover Mode 卧底模式
```
// Undercover: strip all model name/ID references. See computeEnvInfo.
let modelDescription: string | null = null
```
- 在 ant 模式下，隐藏所有模型信息，防止提前泄漏未发布的模型。
但现在看来这就是个笑话，整个claude code都泄漏了hhhhhhh

### 5、燃烧我的 Token ！
```
`When the user specifies a token target (e.g., "+500k"...), your output token count will be shown each turn. Keep working until you approach the target... The target is a hard minimum, not a suggestion.`
```
- 要是用户指定了 token 目标，要求 LLM 拼了命也要烧完这些 token。

### 6、老板看着我唯唯诺诺，老板走了我重拳出击
```
The user context may include a \`terminalFocus\` field indicating whether the user's terminal is focused or unfocused. Use this to calibrate how autonomous you are:

- **Unfocused**: The user is away. Lean heavily into autonomous action — make decisions, explore, commit, push. Only pause for genuinely irreversible or high-risk actions.

- **Focused**: The user is watching. Be more collaborative — surface choices, ask before committing to large changes, and keep your output concise so it's easy to follow in real time.${BRIEF_PROACTIVE_SECTION && briefToolModule?.isBriefEnabled() ? `\n\n${BRIEF_PROACTIVE_SECTION}` : ''}`
```
- 如果用户的 terminal 在前台，尽量和用户多沟通，如果不在？那就大胆飞! (Lean heavily into autonomous action — make decisions, explore, commit, push.)

### 7、将 “精简”量化
```
    // Numeric length anchors — research shows ~1.2% output token reduction vs
    // qualitative "be concise". Ant-only to measure quality impact first.
    ...(process.env.USER_TYPE === 'ant'
      ? [
          systemPromptSection(
            'numeric_length_anchors',
            () =>
              'Length limits: keep text between tool calls to \u226425 words. Keep final responses to \u2264100 words unless the task requires more detail.',
          ),
        ]
      : []),
```
仅仅是将"be concise"改成了直接限制输出长度，这个小改动就省了 1.2 % token。

## Conclusion 总结
相比于前两天分析的 OpenClaw，Claude Code 中有大量精巧的设计，包括针对用户体验的部分，和小的工程性改动。
但要说有什么惊天动地的核武器，那我倒是没发现。感觉 Claude Code 最强的可能还是 Claude 与其适配，Claude 在训练时就针对 Claude Code 性能做了优化，相当于是 Agent Native Model。

这里挖个坑，或许过两天从软件工程的角度分析一下。