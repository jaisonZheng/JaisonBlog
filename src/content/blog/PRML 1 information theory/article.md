---
title: PRML - 机器学习视角下的信息论核心
description: PRML笔记分享（1） 信息论
publishDate: 2025-12-08
language: 中文
tags:
  - PRML
  - Math
  - CS
  - ML
---
## 几个数学工具
### Stirling 公式，阶乘的近似
$$ ln(n!) \simeq nlnn - n$$
n越大越接近。

### 连续变量的Jensen不等式
$$f(\int xp(x)dx) \leq \int f(x)p(x)dx$$
### 拉格朗日乘子法，解决多约束条件f下多变量函数的驻点问题
等式约束$g(x) = 0$中，直接：
$$L(x, \lambda) \equiv f(x) + \lambda g(x)$$
令$\frac{\partial f}{\partial x} = 0$满足驻点，令$\frac{\partial f}{\partial \lambda} = 0$满足等式约束。

不等式约束$g(x) >= 0$中，还是
$$L(x, \lambda) \equiv f(x) + \lambda g(x)$$
然后满足KKT条件（以下三条）：
$$g(x) >= 0$$
$$\lambda >= 0$$
$$\lambda g(x)=0$$
最后一条是所谓的“互补松弛性”，非常好理解，要么$\lambda=0$（不在边界上，约束无效），要么$g(x) = 0$（在边界上，满足边界）。
具体的解释在SVM中有，此处不加赘述。

---
## 熵
### 信息熵公式为啥长这样？
$h(x)$为信息量，$H(x)$为平均信息量，也就是所谓的随机变量$x$的“熵”。
$$h(x) = -log_{2}p(x)$$
$$H[x] = - \sum_{x}p(x)log_2p(x)$$
对信息含量的判断**取决于**概率分布$p(x)$。
（如果一个事件一定会发生，我们从观测到这件事发生不能获得任何信息量，但是如果一个事件发生概率很小，我们观测到它发生了，就能获得很多信息。）

如果两个互不相关的事件$x$和$y$，那么观测到这两个事的信息量应等于两件事分别发生的信息量之和：
$$h(x, y) = h(x) + h(y)$$
由于两个不相关事件是独立的，所以
$$p(x, y) = p(x)p(y)$$
这时我们用$p$定义$h$，显然应当用**对数**。
所以就可以得到一开始的公式：
$$h(x) = -log_{2}p(x)$$
然后我们求整个传输过程的平均信息量，就要乘上事件发生的概率（权重），就得到：
$$H[x] = - \sum_{x}p(x)log_2p(x)$$
### 非均匀分布的熵比均匀分布的熵小
从对事件进行信息编码的角度考虑。
我们可以利用非均匀分布的优势，对**可能性较高的事件使用较短的编码**，这样平均编码长度就会较短。

无噪声编码定理指出：熵是传播随机变量状态所需比特数的**下界**。

### 从将物品分进箱子推导熵公式
将$N$个相同的物品分进一组箱子，第$i$个箱子放$n_i$个物品。
不区分箱子内部物品的排列，可得方法总数为
$$W = \frac{N!}{\prod_i n_i!}$$
这就是无谓的**乘数**。
熵可以定义为用一个适当的常熟缩放后的乘数的对数：
$$H = \frac{1}{N}lnW = \frac{1}{N}lnN! - \frac{1}{N}\sum_ilnn_i!$$
应用斯特林近似公式$ln(N!) \simeq NlnN - N$
$$\begin{aligned} H &= \ln N - \sum_i \frac{n_i}{N} \ln n_i \\ &= - \lim_{N \to \infty}\sum_i \left(\frac{n_i}{N}\right) \ln \left(\frac{n_i}{N}\right) \\ &= -\sum_i p_i \ln p_i \end{aligned}$$
### 微分熵及其不凡性质
离散熵用来衡量离散变量，微分熵用来衡量**连续变量**。

微分熵是一个**相对量**，是熵取极限后舍弃掉无穷大的$-ln\Delta$部分得到。
$$H[x] = - \int p(x) \ln p(x) dx$$
- 微分熵可以是负数（比如正态分布的某个点有个很高的峰值）
- 微分熵对坐标尺度敏感，比如将x变为2x微分熵会变，所以一般只比较两个相同坐标系下的分布的熵。（**相对量而非绝对量**）
### 条件熵、相对熵（KL散度）与互信息

#### 条件熵
$$H[x, y] = H[x] + H[y|x]$$

#### 相对熵（KL散度）
用近似分布$q(x)$去描述真实分布$p(x)$的信息，显然我们需要额外信息量，而这个额外的信息量就是KL散度。
$$\begin{aligned} KL(p||q) &= -\sum p(x) \ln \frac{q(x)}{p(x)} \\ &= \sum p(x) \ln p(x) - \sum p(x) \ln q(x) \\ &= \underbrace{-\sum p(x) \ln q(x)}_{\text{交叉熵 } H(p,q)} - \underbrace{(-\sum p(x) \ln p(x))}_{\text{真实熵 } H(p)} \end{aligned}$$
交叉熵$H(p, q)$大于真实熵$H(p)$，相减之后是所需的额外熵（即KL散度）
#### 证明KL散度>=0
其中利用到gensen不等式$f(\int xp(x)dx) \leq \int f(x)p(x)dx$，以及$\int q(x)dx = 0$这一事实。
$$KL(p||q) = -\int p(x) \ln \frac{q(x)}{p(x)} dx \geq - ln \int q(x)dx = 0$$
#### 最小化KL散度等同于最大化似然函数
$$\underset{\theta}{\arg\min} \ KL(p_{\text{data}} \| q_{\theta}) = \underset{\theta}{\arg\min} \left( \underbrace{- \mathbb{E}_{x \sim p_{\text{data}}} [\ln q_{\theta}(x)]}_{\text{负对数似然 (NLL)}} + \underbrace{\mathbb{E}_{x \sim p_{\text{data}}} [\ln p_{\text{data}}(x)]}_{\text{常数 (与}\theta\text{无关)}} \right) \iff \underset{\theta}{\arg\max} \sum_{i} \ln q_{\theta}(x_i)$$
#### 互信息
比如说现在有x分布和y分布，我们想考量知道x对我们预测y有多大帮助（或者反过来）。
我们可以通过x和y的联合分布$p(x, y)$和边缘分布乘积$p(x)p(y)$的KL散度（其实就是相似度）来判断两者的独立程度。
$$\begin{aligned} I[x, y] &= KL(p(x, y) \| p(x)p(y)) \\ &= \iint p(x, y) \ln \left( \frac{p(x, y)}{p(x)p(y)} \right) dx dy \end{aligned}$$
互信息如果用条件熵来表示，就是：
$$I[x, y] = H[y] - H[y|x]= H[x] - H[x|y]$$
%%互信息 = y 的原始不确定性 - 知道了 x 之后 y 剩下的不确定性 = x 的原始不确定性 - 知道了 y 之后 x 剩下的不确定性%%

我们可以把互信息看作：
由于获知y的值，我们减少了多少x的不确定性（反之亦然）

但主要还是用来描述两个分布的“互信息”。