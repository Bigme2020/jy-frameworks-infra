---
sidebar_position: 1
sidebar_label: 简介
title: 简介
---

## 关于此组件库
组件库希望涵盖个人常用的react、vue组件及hooks，目前只包含了react组件

## 关于此文档
该文档只负责react相关，基于[docusaurus](https://github.com/facebook/docusaurus)制作

## 如何调试组件
随便新建一个react app，更改好组件后将组件进行打包，利用npm link调试组件

以调试react-components为例：
1. 进入根目录，执行`pnpm build:react`
2. 进入react app，执行`npm link [react-components的相对路径]`
3. 启动react app，调试组件