# JY-FRAMEWORS-INFRA
一个咸鱼🐟库，看心情维护

它诞生有两个原因:

1. 兴趣使然

2. 符合自身现阶段使用习惯

3. 学习

## 目录结构
jy-frameworks-infra
|-- .husky // git提交前检查
|-- packages // monorepo仓库
|   |-- jy-react-infra
|   └── jy-vue-infra
|-- scripts // 脚本


## 命令指引 
这个仓库是 lerna + pnpm + rollup 的 monorepo 仓库，一些 lerna 原本的命令 bootstrap、link、add 等命令被 pnpm 命令替代（详情见官网：https://lerna.js.org/docs/recipes/using-pnpm-with-lerna）

**依赖**

1. 安装（重装）所有 package 依赖: pnpm install
2. 为指定 package 安装依赖: pnpm install (-D) `moduleName` -F `packageName`
3. 安装全局依赖（安装至 workspace 根目录）: pnpm install (-D) `moduleName` -w

**新建**

4. 新建 package: npx lerna create `packageName`