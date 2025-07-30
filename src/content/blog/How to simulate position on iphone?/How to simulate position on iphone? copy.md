---
title: How to simulate position on iphone?
description: 怎么在ios系统中伪装定位？
publishDate: 2025-07-30
language: 中文
tags: 
    - CS
---

主要参考了
[使用Xcode修改iOS设备定位](https://www.15tar.com/2023/10/03/simulate-location/)

大家可以先根着这篇文章中的步骤做，然后出问题了再来这里找答案。

## FAQ
### xcode中无法选中生成的gpx文件
根据[stackoverflow中的回答](https://stackoverflow.com/a/79702405/20958098)操作，在terminal中输入
```
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister  -kill -r -domain local -domain system -domain user
```
即可。
### 如何生成准确的gpx文件？
原文章推荐使用以下网站生成gpx文件
[gpxgenerator.com](https://www.gpxgenerator.com)
但我在尝试使用后发现，生成的地点与我在地图上点击的地点有较大偏差。

经过一番搜索和研究，我发现是由于国内的地图使用了“火星坐标系”，即在普通的经纬度坐标系上进行加密。但是这个网站使用的是google地图。

我又尝试使用[GCJ-02](https://zh.wikipedia.org/zh-cn/%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD%E5%9C%B0%E7%90%86%E6%95%B0%E6%8D%AE%E9%99%90%E5%88%B6#GCJ-02)与[WGS-84](https://zh.wikipedia.org/wiki/WGS-84)坐标转换工具，尝试将WGS-84坐标转换成GCJ-02坐标，效果仍不理想（仍然偏东南）。转为使用google地图直接获取经纬度信息后仍然如此。我猜测是因为[全球版的谷歌地图（Google.com）使用GCJ-02的街道图，但出于不明原因保留了普通的WGS-84卫星图。](## 中国大陆地图偏移问题)

**最终解决方案**
最后我发现了一个快速解决方案，即使用[openstreetmap](https://www.openstreetmap.org)。
直接在里面获取经纬度信息，再粘贴进[gpxgenerator.com](https://www.gpxgenerator.com)生成的gpx文件的lat（latitude）和lon（longitude）标签里即可。


实验检验后发现精确度极高，误差在10-20cm。

但奇怪的是，openstreetmap宣称使用的是WGS-84编码，为什么直接使用反而是正确的呢？

## 该方案的缺点与优点
### 缺点
1、需要配合电脑使用。但是可以通过wifi连接手机。
2、无法变成手机上的一个软件（依赖于xcode的debug和手机的开发者模式）
### 优点
1、由苹果官方给出，实现了系统层级上对所有软件的“欺骗”。
2、如果通过连接的网络进行定位，仍然无法隐瞒真实位置。
3、精确度极高
4、免费
