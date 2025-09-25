---
title: CS229 Problem Set 2 Hint and Code
description: 做不出来就来这看看Hints吧！
publishDate: 2025-09-25
language: 中文
tags:
  - CS
  - CS229
---
## 1.Logistic Regression: Training Stability
这个问题探索起来非常有意思，可以自己改改Learning Rate，画一下散点分布图，输出一下theta和grad。
Hint: 见题目下方Hint。

### （请做完这题再看本条）
#### 为什么只要有一个数据点不是线性可分的（即分类错误），就无法通过无限放大theta来扩大Functional Margin？
直觉上，似乎只要正确分类的点比较多，错误分类的点比较少，Functional Margin就可以一直增大。但其实并非如此。
让我们观察一下下面这个损失函数。
$$
J(c\theta) = \sum_{i=1}^m \log\left(1 + \exp\left(-c \cdot y^{(i)}\theta^T x^{(i)}\right)\right)
$$
我们会发现，如果theta放大，而$y^{(i)}\theta^T x^{(i)}$为正数，损失会接近0；但如果$y^{(i)}\theta^T x^{(i)}$为负数，损失就会趋近于正无穷。（错误分类和正确分类随$\theta$变化带来的成本减少和增加是不成比例的）
所以
$$
J(c\theta) = \underbrace{\sum_{\text{正确}} \text{Loss}(\dots)}_{\text{这部分总和在减小，但有下限 (0)}} + \underbrace{\sum_{\text{错误}} \text{Loss}(\dots)}_{\text{这部分总和在增大，且没有上限}}
$$
所以，只要有一个点无法完美地被线性划分（即这个点分类错误），就不能通过任意放大$\theta$来缩小成本函数，也就会收敛。


## 3.Bayesian Interpretation of Regularization
> 这一题先带我们复习了将求后验分布转化求后验分布的最高点时的$\theta$，然后让我们证明：假如我们给$\theta$的先验分布是高斯分布，我们就相当于在做L2正则化，如果是Laplace分布，就相当于在做L1正则化。其中L2正则化可以求出$\theta_{MAP}$关于数据的闭式解（解析解），而L1正则化只能通过Optimization的方法（比如梯度下降）来求$\theta_{MAP}$。
### Marginally Independent and Conditionally Independent 边际独立和条件独立
> **边际独立**：两个变量**在整体上、无视任何其他因素**的情况下，是相互独立的。知道其中一个变量的信息，并不会帮助你更好地猜测另一个变量。
> **条件独立**：两个变量**在给定某个额外信息或条件**的情况下，是相互独立的。一旦我们知道了这个“条件”变量，那么原来的两个变量之间就再也没有直接关联了。

边际独立：
$$P(A,B)=P(A)⋅P(B)$$
条件独立：
$$P(A,B∣C)=P(A∣C)⋅P(B∣C)$$

举一个比较有趣的例子：
考虑三个变量：
- 学生的**智商**
- 学生的**鞋码**
- 学生的**年龄**
如果不看年龄，则智商和鞋码是具有正相关性的。（年龄越大，智商越高，鞋码越大）
但是如果我们加上年龄这个**条件**，比如把年龄限定在10岁，那么智商和鞋码就不相关了。
（智商和鞋码是边际相关但是条件独立的）

### (b)Hint
argmin是对于整体的
argmax里面的东西取负即可得argmin
### 矩阵求导小结

1、标量对向量求导 (线性)  
$$ 
\nabla_{\boldsymbol{x}} (\boldsymbol{a}^T \boldsymbol{x}) = \boldsymbol{a} 
$$ 
2、标量对向量求导 (二次型)
 $$ \nabla_{\boldsymbol{x}} (\boldsymbol{x}^T \boldsymbol{A} \boldsymbol{x}) = (\boldsymbol{A} + \boldsymbol{A}^T)\boldsymbol{x} 
 $$
 *（注意：假如这里A是对称矩阵，那么可以化简为$2\boldsymbol{Ax}$）*
 其次，这里的公式为什么是这样，其实是挺显然的，画一个二次型的相乘矩阵就会发现，$x_ix_j$求导后的系数就是$a_{ij} + a_{ji}$。
 3、标量对向量求导 (二次型，A为对称矩阵) 
  $$ \nabla_{\boldsymbol{x}} (\boldsymbol{x}^T \boldsymbol{A} \boldsymbol{x}) = 2\boldsymbol{A}\boldsymbol{x} 
  $$ 
  4、向量对向量求导 (雅可比矩阵)
  $$ 
  \nabla_{\boldsymbol{x}} (\boldsymbol{A}\boldsymbol{x}) = \boldsymbol{A}^T $$ *(注意：这是分母布局下的结果。在分子布局下，结果为 $\boldsymbol{A}$) 
  
  5、L2范数的平方对向量求导 
  $$ \nabla_{\boldsymbol{x}} ||\boldsymbol{x}||_2^2 = \nabla_{\boldsymbol{x}} (\boldsymbol{x}^T\boldsymbol{x}) = 2\boldsymbol{x} $$
#### 关于雅可比矩阵的详细解释
```python
pass
```


## 4. Constructing Kernels
### (e)Hint
K1是kernel，等价于其可以表达为**映射到高维空间中的向量的内积**。（这里是反向应用，通常Kernel都是用在：
“将高维向量的内积简化为Kernel”）
$$
\begin{align*}
K_1(x^{(i)}, x^{(j)}) &= \langle \phi_1(x^{(i)}), \phi_1(x^{(j)}) \rangle = \phi_1(x^{(i)})^T \phi_1(x^{(j)})
\end{align*}
$$

### (e)(f)Hint
$$
\begin{align*}
& \sum_i \sum_j z_i f(x^{(i)}) f(x^{(j)}) z_j \\
&= \left( \sum_i z_i f(x^{(i)}) \right) \left( \sum_j z_j f(x^{(j)}) \right) \\
&= \left( \sum_i z_i f(x^{(i)}) \right)^2
\end{align*}
$$
第一个式子推第二个式子是关键，相当于在应用分配律。
第二个式子推第三个式子是因为本质上都是n项求和，值是一样的。
%%第三个式子注意括号应在求和号外面，这里网上的答案是错的%%
%%其实这个技巧notes中出现过%%

## 5. Kernelizing the Perceptron
> 本题并不关注Kernel本身是什么，旨在完成一个通用型的Perceptron实现。
> 隐式地表达，隐式地计算。好美！
> 只有自己做了一遍，才真的会相信可以用低维的参数mapping到高维（甚至无限维）的空间中。
### (a)i. Hint
%%这题我看到时一脸懵逼%%
关键是**更新法则**，可以从更新法则中推出$\theta$。
（我一开始都不知道$\theta$该从哪里推）

### (b)Hint
一开始不需要过于纠结到底要用什么样的数据结构，可以先往后写。
我用的是元素为(beta_j, x_j)元组的数组。

### (c)FileNotFoundError
```
FileNotFoundError: [Errno 2] No such file or directory: './output/p05_dot_output.pdf'
```
出现以上报错，需要在src文件夹里mkdir新建一个output文件夹。
```
FileNotFoundError: [Errno 2] No such file or directory: '../data/ds5_train.csv'
```
进入src文件夹当中，再执行python文件。

## 6. Spam classification
	这道题手把手带我们实现垃圾邮件预测。
	其中(a)是预处理，(b)是训练多项式事件模型（朴素贝叶斯），(c)则很好地体现了朴素贝叶斯模型的可解释性，(d)体现模型的训练应用与检验。
	我刚做这道题颇有点“拔剑四顾心茫然”的感觉，是因为我以为我读懂了notes，但其实差不多忘干净了，更别说应用了。
### (a)Hints
#### get_words()
使用`.split()`和`.lower()`

#### create_dictionary()
可以考虑使用`set`来去重，然后用`enumerate(<list>)`生成`(index, word)`元组的迭代器。

#### transform_text()
numpy array可以用`numpy.zeros((row, col))`来创建。

### (a)Code
```Python
def get_words(message : str):
    # *** START CODE HERE ***
    words = message.split(' ')
    # for word in words:
    #     word = word.lower()
    # 这样写是不对的，python中用这种方式for也不是引用。
    for i in range(len(words)):
        words[i] = words[i].lower()
    return words
    # *** END CODE HERE ***


def create_dictionary(messages):
    # *** START CODE HERE ***
    countDict = dict()
    for message in messages:
        words = get_words(message)
        words_set = set(words) # 通过将数组变成集合来去重
        for word in words_set:
            if word in countDict.keys():
                countDict[word] += 1
            else:
                countDict[word] = 1

    filterWords = [word for word in countDict.keys() if countDict[word] >= 5]
    resultDict = {word : index for index, word in enumerate(filterWords)}
    return resultDict
    # *** END CODE HERE ***


def transform_text(messages, word_dictionary : dict):
    # *** START CODE HERE ***
    numpyArray = np.zeros((len(messages), len(word_dictionary.keys())))
    for i in range(len(messages)):
        message = messages[i]
        words = get_words(message)
        for word in words:
            if word in word_dictionary.keys(): # 仅处理word_dictionary中有的。
                numpyArray[i][word_dictionary[word]] += 1
    return numpyArray
    # *** END CODE HERE ***
```
### (b)Hints
	这道题脚手架基本没给，需要反复地去认真读原notes。（但是原notes其实写得很清晰。

我们要从notes中弄清楚这几个问题：
- 我们要求哪几个参数？参数的公式是什么？
- 我们要用的是伯努利事件模型还是多项式事件模型？
- 如何对该模型进行Laplace Smoothing？
- 进行预测时公式是什么？
- 怎么用log避免Underflow？

```
下面是以上几个问题的答案
```

- 我们要求这3个参数：
	$$
	\begin{aligned}
	\phi_{k|y=1}&=  \frac{\sum^m_{i=1}\sum^{n_i}_{j=1}1\{x_j^{(i)}=k\wedge y^{(i)}=1\}}{\sum^m_{i=1}1\{y^{(i)}=1\}n_i} \\
	\phi_{k|y=0}&=  \frac{\sum^m_{i=1}\sum^{n_i}_{j=1}1\{x_j^{(i)}=k\wedge y^{(i)}=0\}}{\sum^m_{i=1}1\{y^{(i)}=0\}n_i} \\
	\phi_y&=   \frac{\sum^m_{i=1}1\{y^{(i)}=1\}}{m}\\
	\end{aligned}
	$$
	($p(x_i=1|y)=\phi_{i|y}$)
	
- 用多项式事件模型（题目要求）

- Laplace后会变成这样：
	$$
	\begin{aligned}
	\phi_{k|y=1}&=  \frac{\sum^m_{i=1}\sum^{n_i}_{j=1}1\{x_j^{(i)}=k\wedge y^{(i)}=1\}+1}{\sum^m_{i=1}1\{y^{(i)}=1\}n_i+|V|} \\
	\phi_{k|y=0}&=  \frac{\sum^m_{i=1}\sum^{n_i}_{j=1}1\{x_j^{(i)}=k\wedge y^{(i)}=0\}+1}{\sum^m_{i=1}1\{y^{(i)}=0\}n_i+|V|} \\
	\end{aligned}
	$$
- 预测时的公式是：
	$$
	\begin{aligned}
	p(y=1|x) &= \frac{ \prod^n_{i=1} np(x_i|y=1)n_ip(y=1) }   {\prod^n_{i=1} p(x_i|y=1)n_ip(y=1) +\prod^n_{i=1} p(x_i|y=0)n_ip(y=0)    }
	\end{aligned}
	$$
	但是由于$y=1$和$y=0$时公式的分母一样，所以只用计算分子，此外，要取log防止underflow。（不是连乘完之后取log，而是取log之后连加
### (b)Code
```Python
def fit_naive_bayes_model(matrix : list, labels : np.ndarray):
    """
        labels: The binary (0 or 1) labels for that training data
        注意 这里的labels传入的是一个numpy中的ndarray而不是python中的list
        
    Returns:
        两个数组和一个int打包成的元组
        (phi_y(p(y)), [phik_y1], [phik_y0])

    matrix:
        每一行都是一份数据。
        每一列都是一个单词所对应的序号。
    """
    # *** START CODE HERE ***
    phi_y = np.sum(labels == 1) / len(labels) # 注意ndarray并没有.count()
    V = len(matrix[0])
    # V是词汇表中单词的数量

    # 这一部分用于统计两个词袋当中，各个词的数量和各个袋子中词的总数量
    word_k_y1 = np.zeros(V)
    word_k_y0 = np.zeros(V)
    # 上面这两个是每个袋子中各个词的数量
    # 下面这两个是每个袋子中词的总数量
    count_words_y1 = 0
    count_words_y0 = 0
    for i in range(len(matrix)):
        row_data : list
        row_data = matrix[i]
        if (labels[i]):
            for k in range(V):
                word_k_y1[k] += row_data[k]
                count_words_y1 += row_data[k]
        else:
            for k in range(V):
                word_k_y0[k] += row_data[k]
                count_words_y0 += row_data[k]
    
    # 这一部分都是在进行laplace平滑处理并返回最后的答案
    phik_y1 = list()
    phik_y0 = list()
    # laplace平滑提前处理分母
    count_words_y1 += V
    count_words_y0 += V 

    for k in range(V):
        numerator_y1 = word_k_y1[k] + 1
        numerator_y0 = word_k_y0[k] + 1
        phik_y1.append(numerator_y1 / count_words_y1)
        phik_y0.append(numerator_y0 / count_words_y0)

    return (phi_y, phik_y1, phik_y0)
    # 一遍过！ 厉害！
    # *** END CODE HERE ***


def predict_from_naive_bayes_model(model, matrix):
    """
    由于我们是要比较这个邮件为1/为0的概率哪个大，根据log的单调性，取log后做大小比较等效。
    所以用先取log的方式，比较两个概率。
    """
    # *** START CODE HERE ***
    # 先将model中有的参数取出来
    phik_y1 : list
    phik_y0 : list
    phi_y, phik_y1, phik_y0 = model

    # 分别计算p_y1_x和p_y0_x
    # 我发现由于分母一样，所以根本不用运算。
    #（但是下面的式子是错的，我忘记要用数据来着，
    # 不是对参数直接求和，而是对数据中有的部分参数求和
    # numerator_1 = sum(np.log(phik_y1)) + np.log(phi_y)
    # numerator_0 = sum(np.log(phik_y0)) + np.log(1 - phi_y)

    # if numerator_1 > numerator_0:
    #     return 1
    # else:
    #     return 0

    # 由于matrix是一个二维数组，所以这里使用矩阵运算来加快计算。
    numerators1 = np.dot(matrix, np.log(phik_y1)) + np.log(phi_y)
    numerators0 = np.dot(matrix, np.log(phik_y0)) + np.log(1 - phi_y)
    
    # 下面这一行代码实现的是两个结果向量之间的逐个比较。
    predictions = (numerators1 > numerators0).astype(int)
    return predictions
    # *** END CODE HERE ***
```

### (c)Code

```Python
def get_top_five_naive_bayes_words(model, dictionary):
    """Compute the top five words that are most indicative of the spam (i.e positive) class.

    Ues the metric given in 6c as a measure of how indicative a word is.
    Return the words in sorted form, with the most indicative word first.

    Args:
        model: The Naive Bayes model returned from fit_naive_bayes_model
        dictionary: A mapping of word to integer ids

    Returns: The top five most indicative words in sorted order with the most indicative first
    """
    # *** START CODE HERE ***
    # 先将model中有的参数取出来
    phik_y1 : list
    phik_y0 : list
    _ , phik_y1, phik_y0 = model
    logProbogation = []
    for i in range(len(phik_y0)):
        logProbogation.append(np.log(phik_y1[i]) - np.log(phik_y0[i]))
    
    # 获取前五大
    arr = np.array(logProbogation)
    top5_indices = np.argsort(arr)[-5:][::-1] # argsort是取排序后的索引
    # 由于dictionary是从单词到序号的字典，需要反转后使用
    inv_dictionary = {v: k for k, v in dictionary.items()} 
    # top5_values = inv_dictionary[top5_indices]
    # 字典不支持数组键
    top5_words = [inv_dictionary[idx] for idx in top5_indices]
    return top5_words
    # *** END CODE HERE ***
```

### (d)Code
```Python
def compute_best_svm_radius(train_matrix, train_labels, val_matrix, val_labels, radius_to_consider):
    """Compute the optimal SVM radius using the provided training and evaluation datasets.

    You should only consider radius values within the radius_to_consider list.
    You should use accuracy as a metric for comparing the different radius values.

    Args:
        train_matrix: The word counts for the training data
        train_labels: The spma or not spam labels for the training data
        val_matrix: The word counts for the validation data
        val_labels: The spam or not spam labels for the validation data
        radius_to_consider: The radius values to consider
    
    Returns:
        The best radius which maximizes SVM accuracy.
    可用函数：
        train_and_predict_svm
        svm_train
        svm_predict
    """
    # *** START CODE HERE ***
    radius_point = dict()
    for radius in radius_to_consider:
        state = svm.svm_train(train_matrix, train_labels, radius)
        predict = svm.svm_predict(state, val_matrix, radius)
        point = -np.linalg.norm(predict - val_labels)
        # 我这里用了norm来计算预测错误的程度（这也许不是最快的）
        radius_point[point] = radius
    return radius_point[max(radius_point.keys())]
    # *** END CODE HERE ***```