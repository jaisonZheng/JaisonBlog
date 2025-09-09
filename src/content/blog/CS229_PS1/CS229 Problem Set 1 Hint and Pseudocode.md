---
title: Problem Set 1 Hint and Pseudocode
description: CS229问题集1提示
publishDate: 2025-09-09
language: 中文
---
> 打开这个作业我才第一次感受到课程的难度。
> 尽管Python我会一些，线性代数我会一些，但是用Python + 矩阵运算来解决机器学习中的问题我还是第一次尝试。
> 我决定把我的pseudocode分享给大家，没有提供pseudocode就提供了一些hints如果完全没有头绪可以先按照这个做
> 注意，这并不是答案，如果需要答案，可以访问以下链接。
[PS229答案](https://github.com/maxim5/cs229-2018-autumn/tree/main/problem-sets/PS1 "点击跳转Github")
## Problem 1 Logistic Regression and GDA
### 1(b)Pseudocode and Explanation
#### Pseudocode:
```python
import numpy as np
import util

from linear_model import LinearModel

# 我在第一次打开这个python文件之后是完全懵逼的，我好像学懂了，又没学懂，完全不知道自己要干嘛。
# 我们来捋一捋
# 首先牛顿法是批量处理数据的，所以不需要循环读取每一个数据点
# 然后Logistic Regression其实就是在线性回归的基础上加了一个logistic函数
# 让其似然估计取最大值即可（即取log后再取最大值）

# 我们看到这个文件有一个main函数和一个类（里面包含两个函数）
# 显然用main函数控制数据的输入输出，用类中的fit来训练模型，predict来使用模型。
# 同时本文件import了util和LinearModel，在遇见这两个类时我们要去这两个文件看看里面有啥。

def main(train_path, eval_path, pred_path):
    """Problem 1(b): Logistic regression with Newton's Method.

    Args:
        train_path: Path to CSV file containing dataset for training.
        eval_path: Path to CSV file containing dataset for evaluation.
        pred_path: Path to save predictions.
    """
    x_train, y_train = util.load_dataset(train_path, add_intercept=True)    
    
    # *** START CODE HERE ***
    # 读取数据（看看util.py）

    # 训练模型（注意是批量输入，利用矩阵运算，不要用循环！）

    # 使用模型（训练和使用的形式可以看LogisticRegression类的介绍）

    # 写入结果

    # *** END CODE HERE ***

class LogisticRegression(LinearModel):
    """Logistic regression with Newton's Method as the solver.

    Example usage:
        > clf = LogisticRegression()
        > clf.fit(x_train, y_train)
        > clf.predict(x_eval)
    """

    def fit(self, x, y):
        """Run Newton's Method to minimize J(theta) for logistic regression.

        Args:
            x: Training example inputs. Shape (m, n).
            y: Training example labels. Shape (m,).
            这里要对着笔记实现一遍牛顿法，注意看看基类里面有啥。
        """        
        # *** START CODE HERE ***
        # 1.初始化参数，增加截距项


        # 2.进行牛顿法拟合过程

            # 2-1. 计算经过线性方程和sigmoid两层处理后的Y值


            # 2-2. 计算梯度: ∇J(θ) = (1/m) * X^T * (h_θ(X) - y)


            # 2-3. 计算Hessian矩阵: H = (1/m) * X^T * D * X 
            # (Hessian矩阵和梯度都是在牛顿法中需要用到的)


            # 可选：此处可添加正则化，并检查Hessian矩阵是否可逆
            

            # 2-4. 牛顿法更新: θ^(t+1) = θ^(t) - H^(-1) * ∇J(θ^(t))


            # 2-5. 检查收敛条件，如果已经收敛就直接break
            # （此处也可以选择检查梯度范数）


        # 别忘了返回结果

        # *** END CODE HERE ***

    def predict(self, x):
        """Make a prediction given new inputs x.

        Args:
            x: Inputs of shape (m, n).

        Returns:
            Outputs of shape (m,).
        """
        # *** START CODE HERE ***
        # 计算出基于theta线性方程的original_Y，
        # 计算sigmoid_Y
        # 根据0.5的阈值判断。
        

        # 1.确保x有截距项


        # 2.批量计算线性组合和sigmoid函数处理


        # 3. 批量应用阈值，返回预测结果


        # *** END CODE HERE ***

```

#### Q.收敛标准选择梯度范数还是$\Delta_\theta$？
[^1拟合过程以及gradient和theta变化量作为收敛标准的对比]![[IMG-20250909090232993.gif]]

为什么选gradient作为收敛标准比 $\Delta \theta$ 更好？

牛顿法迭代公式为：
$$\theta_{t+1} = \theta_t - H^{-1} \nabla J(\theta_t)$$

如果$H^{-1}$很小（Hessian 很陡，说明跟某个变量高度相关，步长在各个方向上不均匀）那么 $\Delta \theta$ 也会很小，但是此时 gradient 可能还很大。

但是原题提供的数据集的 Hessian 矩阵其实是比较平滑的，所以选择 $\Delta \theta$ 和选择 gradient 差不多。

对于后面的3(d)，如果选择了梯度范数作为收敛标准，无论怎么调整超参数都很难收敛，所以收敛标准还是要视情况而定。
#### Q.增加截距项的方式以及为什么？
为什么需要手动增加截距项呢，因为在线性拟合中，数据有多少个维度，参数theta就有多少个维度（毕竟是要做点积的）。如果不增加截距项，线性方程就和所有自变量成正比例（即过原点）

增加截距项往往是在数据中插入一列1，这样就会出现一个对应的可供学习的参数$\theta_0$，算法会通过找到最佳的$\theta_0$来确定截距。


### 1(c)Hint
这道题的意思是化成下面这个形式：
$$ p(y=1 | x; \phi, \mu_0, \mu_1, \Sigma) = \frac{1}{1 + \exp(-(\theta^T x + \theta_0))} $$
即$\theta$和$\theta_0$可能是一些代数结构。

这意味着GDA训练出的决策边界可以仅用$\theta$和$\theta_0$存储。

### 1(d)Hint
关键是：
$$ \frac{\partial \ell}{\partial \mu_0} = \sum_{i=1}^n \left( \frac{\partial \ell}{\partial \mu_{y^{(i)}}} \frac{\partial \mu_{y^{(i)}}}{\partial \mu_0} \right) $$
### 1(e)画图
经过矫正之后的决策边界相对难画。
由于我们相当于是降低了阈值（$0.5$  -> $0.5 * \alpha$)，
所以可以计算画图时使用的$\beta'$。其实$\beta$并没有改变，我们仍然原先的$\beta$来算出原始概率值，然后再经过$\alpha$矫正之后应用阈值判断），但是通过计算一个效果相当的$\beta'$，我们可以用同一套画图程序将三个图画出。
$$
\begin{align*}
% 决策边界定义：修正后的概率为 0.5
P_{corrected}(y=1|x) = \frac{h(x)}{\alpha} &= 0.5 \\
\\
% 代入 h(x) 的 Sigmoid 形式
\frac{1}{\alpha(1 + e^{-\beta^T x})} &= 0.5 \\
\\
% 利用 -ln(a/b) = ln(b/a) 进行简化，得到最终方程
\beta^T x &= \ln\left(\frac{\alpha}{2 - \alpha}\right)
\end{align*}
$$
这就得到了我们最终要的新的决策边界的$\beta$。
$$
\beta_1 x_1 + \beta_2 x_2 + \dots + \left( \beta_0 - \ln\left(\frac{\alpha}{2 - \alpha}\right) \right) = 0
$$
注意到其实就仅仅改变了$\beta_0$，我们相当于是把决策边界下移了（$\beta_0$减去一个负数，即截距减小），有更多的样本被预测为正样本，符合我们一开始矫正的方向。
## Problem 2 PULearning
	Postive and Unlabeled Learning，顾名思义，就是只有正样本和未标签样本（包含正样本和负样本）的数据训练。
	由于未标记数据中混有正样本，如果我们将未标记数据全部当成负样本，模型预测正样本时会偏小，我们用一个纯净的正样本集去抵消这部分偏小。先将未标记数据全部当成负样本来训练模型，然后预测正样本集为正的概率（理想情况它们都是1，但在这里都会小于1），他们的平均值就是矫正因子。
### 题目理解
这个题中的例子不便理解。可以看看下面这个例子：

假设你正在为一个视频网站构建一个电影推荐系统。你想训练一个模型，来预测某个用户是否会喜欢一部特定的电影。

#### 1. 传统的监督学习 (Supervised Learning)

在最理想的情况下，你有非常清晰的数据：

- **正样本 (Positive Samples)**: 用户明确点击了“喜欢”👍 的电影列表。
    
- **负样本 (Negative Samples)**: 用户明确点击了“不喜欢”👎 的电影列表。
    

你的模型通过学习这两类电影的特征（比如导演、演员、类型等），来画出一条“喜欢”与“不喜欢”之间的界限。这很简单直接。

#### 2. “仅有正样本/未标注样本” 的现实情况 (PU Learning)

然而，在现实中，大多数网站只有“点赞”或“收藏”按钮，很少有“踩”或“不喜欢”的按钮。所以，你手头的数据是这样的：

- **正样本 (Positive, P)**: 用户明确点击了“喜欢”的电影列表。这部分数据很可靠，我们确信用户喜欢它们。
    
- **未标注样本 (Unlabeled, U)**: 用户**所有没有点击过“喜欢”的电影**。
    

现在问题来了：对于这些“未标注”的电影，我们能说用户一定“不喜欢”它们吗？

**并不能。**

这个“未标注”的集合 (U) 其实是一个**大杂烩**，它包含了两种情况：
1. **真正的负样本 (True Negatives)**: 用户看了介绍或者海报后，确实不感兴趣，所以没点喜欢。如果他看了，他会点“不喜欢”。
    
2. **隐藏的正样本 (Hidden Positives)**: 用户**只是还没看到**这部电影，或者没来得及看。如果他看到了，他其实会喜欢的。

这就是“**仅有正样本/未标注样本**”的核心困境：**你的负样本集被污染了**。你没有一个纯粹的“不喜欢”集合，只有一个混杂了“真不喜欢”和“未来可能会喜欢”的“未标注”集合。

### 倾向得分法的核心逻辑
> 这个方法我愿称之为$\alpha$矫正法，或者倾向得分法。但其实它真正的名字叫做“Elkan-Noto的倾向得分法”。

我们要解决的是未标记样本中混有正样本的问题，这会导致一个样本被认为是正样本的概率偏小（因为假负样本变多了）。

对于一个纯净的正样本集，我们希望它每个的概率都为100%（即1），但是直接通过 y 和 x 学习出的模型预测值往往小于1（设其为$\alpha$)，通过一系列数学证明，我们认为使用这个值作为校正因子是合理的。
$$
\alpha \approx \frac{1}{|V_{+}|} \sum_{x^{(i)} \in V_{+}} g(x^{(i)})
$$
（即取纯净正样本在这个模型中预测概率的平均值）
对于一个新的目标值，用模型原本预测出的概率，再除以这个校正因子（即放大），即可获得矫正后的概率值，再对这个概率值使用0.5的阈值判断即可。

### 优缺点
- 优点: 理论上很优雅，实现相对简单，是目前最经典和常用的方法之一。
    
- 缺点: **强依赖于一个纯净的正样本验证集**，并且依赖“**一个正样本被标记的概率与其特征无关**”这个核心假设。
### 其他矫正方法：Spy（间谍）方法

#### 核心思想

这是一个非常聪明的技巧。我们主动地从已知的正样本(P)中抽出一小部分，把它们混入未标注样本(U)中，假装它们是未标注的。这些被我们派出去的样本就是“**间谍**”(Spies)。然后我们看分类器如何对待这些“间谍”，从而推断出U中到底隐藏了多少“自己人”。
#### 估计步骤

1.  **派遣间谍**: 从P集中随机抽取一小部分（比如5%），将它们放入U集中。你心里要清楚地记下哪些是间谍。
2.  **训练模型**: 在新的P集（剩下的95%）和新的U集（原U集+间谍）上训练分类器。
3.  **审查间谍**: 用训练好的分类器，去预测所有新U集里样本的分数。
4.  **设定阈值**: 观察一下所有“间谍”样本得到的预测分数。它们的分布情况（比如平均分）可以告诉你，一个真正的正样本混在U里面大概会得到什么样的分数。你可以用这个分数作为阈值。
5.  **统计人数**: 统计一下，在原生的U集样本（非间谍）中，有多少样本的得分超过了你设定的这个阈值。这个数量就是对U中隐藏的正样本数量的一个估计。
6.  **计算比例**: 根据估计出的隐藏正样本数量，加上你原有的P集数量，就可以算出总的正样本比例 π。

#### 优缺点

* **优点**: 不需要额外的验证集，非常有创意。
* **缺点**: “间谍”的数量需要小心选择，太少则估计不准，太多则影响模型训练。（间谍数量是一个非常棘手的超参数）
### 2(a)Hint
$$p(t = 1| y = 1,x) = 1$$

### 2(c)Hint
注意，我们一般最小化成本函数（下降），最大化似然函数（上升）。
## Problem3 Poisson Regression
	这是GLM的一个练习。注意，如果原数据是正态分布的，其对应的直接就是LR线性回归。

#### 3(d)Pseudocode
```Python
import numpy as np
import util
from linear_model import LinearModel


def main(lr, train_path, eval_path, pred_path):
    """Problem 3(d): Poisson regression with gradient ascent.

    Args:
        lr: Learning rate for gradient ascent.
        train_path: Path to CSV file containing dataset for training.
        eval_path: Path to CSV file containing dataset for evaluation.
        pred_path: Path to save predictions.
    """
    # Load training set
    x_train, y_train = util.load_dataset(train_path, add_intercept=True)
    # The line below is the original one from Stanford. It does not include the intercept, but this should be added.
    # x_train, y_train = util.load_dataset(train_path, add_intercept=False)    
    # *** START CODE HERE ***
    # Fit a Poisson Regression model
    
    # Run on the validation set, and use np.savetxt to save outputs to pred_path

    # *** END CODE HERE ***

class PoissonRegression(LinearModel):
    """Poisson Regression.

    Example usage:
        > clf = PoissonRegression(step_size=lr)
        > clf.fit(x_train, y_train)
        > clf.predict(x_eval)
    """

    def fit(self, x, y, eps=1e-5, alpha=1e-8, max_iter=1000000):
        """Run gradient ascent to maximize likelihood for Poisson regression.

        Args:
            x: Training example inputs. Shape (m, n).
            y: Training example labels. Shape (m,).
            这里的shape的意思是形状数组，而不是传入一个元组。
        """
        # *** START CODE HERE ***
        # 初始化theta和gradient（获取theta的维度数，然后全部设置为0）


        iter = 0
        while np.linalg.norm(gradient) > eps and iter <= max_iter:
            for i in range(...):
                # 保存旧的theta（一定要注意python复制数组时的特性）

                # 先计算偏导数

                # 根据梯度下降的公式来更新theta

                iter += 1
                # 这里norm里面如果用gradient非常难收敛
                if np.linalg.norm(...) < eps or iter > max_iter: 
                    break
        # *** END CODE HERE ***
    def predict(self, x):
        """Make a prediction given inputs x.

        Args:
            x: Inputs of shape (m, n).

        Returns:
            Floating-point prediction for each input, shape (m,).
        """
        # *** START CODE HERE ***
        # 算出\theta^Tx

        # 用规范链接函数将线性预测的值映射回原定义域。
        prediction = ...
        return prediction
        # *** END CODE HERE ***
```

## Problem4 Convexity of Generalized Linear Models
	从这题当中，可以推出所有的GLM都是凸的，这是多么美的一个结论啊！
### Q. 为什么Hessian矩阵半正定可以推出这个函数是凸的？(Hessian -> Convex)

Hessian 描述的是函数在各方向上的“二阶导数”（曲率）。若任意方向上的二阶导数（即任意向量 v 的二次型 $v^\top H v$都是非负的，说明函数在任意方向都不会“向下弯”（不会有凹向下的弯曲），因此全局上是凸的。
## Problem5 Locally Weighted Regression
	这题似乎颇为简单，调整tau还挺有意思的。
	当tau过大，就会欠拟合，tau过小，就会过拟合。